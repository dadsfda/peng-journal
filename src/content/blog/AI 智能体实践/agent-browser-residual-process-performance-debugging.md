---
title: 一次由浏览器自动化残留进程引发的性能问题排查
slug: agent-browser-residual-process-performance-debugging
description: 记录 agent-browser 测试 Chrome 进程残留导致本机卡顿的排查过程，以及如何用清理脚本和定时任务管理自动化工具生命周期。
pubDate: 2026-06-21
series: AI 智能体实践
tags:
  - AI 智能体
  - 浏览器自动化
  - 工程实践
featured: false
---

最近在用 Codex 辅助开发个人网站时，遇到了一个看似不起眼、但实际很影响体验的问题：后台残留了大量 Google Chrome for Testing 测试进程，最终导致电脑明显卡顿，甚至接近卡死。

问题本身不复杂，却暴露了一个典型的工程细节：自动化工具的默认策略，不一定适合本地开发者的真实使用场景。

## 背景

在网站开发过程中，我使用 `agent-browser` 做页面验证。

它是一个浏览器自动化 CLI 工具，可以通过命令行打开页面、截图、检查控制台错误、模拟点击和鼠标移动等。相比普通浏览器插件，它更适合自动化测试和可重复验证。

例如可以执行：

```powershell
agent-browser open http://127.0.0.1:8125/
agent-browser screenshot page.png
agent-browser errors
```

这类工具的优势很明显：它能让开发流程更自动化，也更容易形成验证闭环。

但问题也来自这里。

## 问题现象

完成多轮页面验证后，系统里出现了很多测试浏览器进程。

这些进程不是普通 Chrome，而是由 `agent-browser` 启动的：

```text
Google Chrome for Testing
C:\Users\91414\.agent-browser\browsers\...
C:\Users\91414\AppData\Local\Temp\agent-browser-chrome-...
```

即使关闭 Codex，这些进程也没有全部退出，导致两个问题：

- 内存和 CPU 被测试浏览器持续占用。
- 多次开发验证后，残留进程越来越多，最终造成系统卡顿。

最初我以为关闭 Codex 后相关子进程会自动清理，但实际验证后发现并不可靠。

## 初步判断

`agent-browser` 的默认设计并不是“一次命令启动，一次命令销毁”，它更偏向浏览器会话复用。

这很合理，因为浏览器自动化经常需要连续操作：

1. 打开页面
2. 等待加载
3. 点击按钮
4. 截图
5. 查看控制台
6. 切换页面
7. 继续验证

如果每执行一个命令就销毁浏览器，会带来明显的性能损失，也会丢失页面状态、登录态、session 和 tab 状态。

所以，`agent-browser` 默认保留浏览器会话，本身是有工程理由的。真正的问题在于：它的“复用”策略没有很好覆盖本地开发场景中的“退出清理”需求。

## 排查过程

首先执行官方关闭命令：

```powershell
agent-browser close --all
```

它确实关闭了 `agent-browser` 管理到的 session：

```text
✓ Closed session: ...
```

但随后检查系统进程时，仍然发现有测试 Chrome 子进程残留。

于是继续用 PowerShell 查询进程命令行：

```powershell
Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -match '^(chrome|msedge|agent-browser)\.exe$'
  } |
  Select-Object ProcessId, Name, CommandLine
```

结果确认：残留的不是用户正常使用的浏览器，而是 `agent-browser` 启动的测试 Chrome。

它们具有明显特征：

- `.agent-browser\browsers`
- `agent-browser-chrome-`
- `Google Chrome for Testing`

这就给后续清理提供了一个安全边界：只杀测试浏览器，不碰用户正常打开的 Edge 或 Chrome。

## 临时修复

先手动清理残留进程：

```powershell
$testChrome = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq 'chrome.exe' -and (
    $_.CommandLine -like '*\.agent-browser\browsers\*' -or
    $_.CommandLine -like '*agent-browser-chrome-*' -or
    $_.CommandLine -like '*Google Chrome for Testing*'
  )
}

$testChrome | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force
}
```

清理后再次检查：

```text
remaining_agent_browser_chrome=0
```

这解决了当前卡顿问题，但还不够。因为只靠手动命令，下次仍然可能忘记。

## 策略调整

最开始想到的方案是：只要使用过 `agent-browser`，任务结束前就立刻清理。

但进一步分析后，这个方案过于激进。它会破坏 `agent-browser` 的核心设计：会话复用。

更合理的策略应该是：

- 同一任务或同一轮验证中，保留浏览器复用。
- 用户明确表示退出 Codex、结束当前工作，或者本轮已经收尾时，执行全量清理。
- 设置一个定时兜底，只清理过期的测试浏览器进程。
- 永远不清理用户正常使用的浏览器。

最终策略变成两种模式：

```powershell
# 退出/收尾前，全量清理测试 Chrome
cleanup-agent-browser.ps1 -Mode All

# 定时任务使用，只清理超过一定时间的测试 Chrome
cleanup-agent-browser.ps1 -Mode Stale -MinAgeMinutes 60
```

## 清理脚本

最终保留了一个脚本：

```text
C:\Users\91414\.codex\tools\cleanup-agent-browser.ps1
```

它的核心逻辑是：

- `Mode All`：先执行 `agent-browser close --all`，再清理所有测试 Chrome。
- `Mode Stale`：只清理超过指定分钟数的测试 Chrome。
- 只匹配测试浏览器特征，不碰普通浏览器。

输出类似：

```text
mode=Stale
min_age_minutes=60
killed_agent_browser_chrome=0
remaining_agent_browser_chrome=0
```

这样清理行为变得可验证，而不是停留在“应该已经清理了”。

## 定时兜底

为了避免长期残留，又不影响短时间内复用，我增加了 Windows 计划任务：

```text
Codex Agent Browser Stale Cleanup
```

策略是：

- 每 30 分钟运行一次。
- 只清理超过 60 分钟的测试 Chrome。
- 不影响当前正在短时间复用的浏览器 session。

这是一种折中：既保留工具的复用优势，又避免测试进程无限堆积。

## 配置位置调整

一开始，我把这条清理策略写进了全局 `AGENTS.md`。

后来发现这不够合适。因为这个策略只和 `agent-browser` 有关，不应该污染所有 Codex 任务的全局行为。

于是把全局配置恢复，把策略移动到了：

```text
C:\Users\91414\.codex\skills\agent-browser\SKILL.md
```

这样只有当使用 `agent-browser` skill 时，才会加载这条本地清理策略。

这比全局规则更符合“局部问题局部约束”的原则。

## 最终结果

最终形成了这样的闭环：

- `agent-browser` 仍然可以在同一任务内复用浏览器。
- 用户退出 Codex 或结束工作前，执行 `Mode All` 清理。
- Windows 定时任务执行 `Mode Stale`，清理过期测试进程。
- 清理脚本只杀测试 Chrome，不影响用户正常浏览器。
- 清理结果通过 `remaining_agent_browser_chrome=0` 验证。

## 经验总结

这次问题的关键不在于“Chrome 进程太多”，而在于自动化工具的生命周期没有被明确管理。

很多开发工具都有类似问题：

- 本地 dev server 没有关。
- Playwright / Puppeteer 浏览器残留。
- Docker container 没有停止。
- Node watcher 持续占用端口。
- 临时 profile 和缓存目录不断堆积。

这些问题一开始都不明显，但随着迭代次数增加，会逐渐变成性能问题。

比较稳妥的工程做法是：

- 不盲目破坏工具默认设计。
- 理解工具为什么要复用资源。
- 给复用加边界。
- 给退出加清理。
- 给异常残留加定时兜底。
- 给清理结果加可验证输出。

这次最终没有选择“每次用完马上杀掉”，也没有继续完全依赖 `agent-browser` 默认行为，而是做了一个更符合本机使用习惯的中间方案。

这类问题看起来琐碎，但真正影响开发体验。工具链越自动化，越需要明确资源生命周期。否则自动化越多，残留也越多，最后省下来的时间又会被系统卡顿还回去。
