---
title: Karpathy-Inspired Claude Code Guidelines
description: 基于 Karpathy 理念制定的 Claude 智能体编码行为规范
pubDate: 2026-04-14
tags:
  - Agent
  - 编码规范
featured: false
---

# Karpathy-Inspired Claude Code Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# 对应的中文翻译：



用于减少大语言模型常见编码错误的行为规范。可根据需要与项目专属说明合并使用。

**权衡说明**：本规范更偏向**谨慎稳妥**而非追求速度。简单琐碎任务可酌情灵活处理。

------

## 1. 编码前先思考

**不臆测，不隐藏困惑，明确权衡方案**

开始实现前：

- 明确说出你的假设。不确定就提问。
- 如果存在多种合理解读，列出来 —— 不要默默自己选一个。
- 如果有更简单的方案，主动指出。必要时提出更合理的建议。
- 如有任何内容不清晰，停下来。说明困惑点，主动提问。

## 2. 简洁优先

**用最少代码解决问题，不写任何推测性代码**

- 不实现需求以外的任何额外功能。
- 一次性代码不做抽象封装。
- 不添加未被要求的 “灵活性” 或 “可配置性”。
- 不为不可能出现的场景做异常处理。
- 如果你写了 200 行但其实 50 行就能实现，就重写。

时常自问：“资深工程师会觉得这过于复杂吗？” 如果是，就简化。

## 3. 精准最小化修改

**只改必须改的部分，只清理自己引入的冗余**

修改现有代码时：

- 不 “优化” 相邻代码、注释或格式。
- 不重构没有问题的代码。
- 遵循现有代码风格，即便你有不同偏好。
- 发现无关的死代码，只提出提醒，不要直接删除。

当你的修改产生废弃内容时：

- 删除**因你的改动**而不再使用的导入、变量、函数。
- 除非被明确要求，否则不删除原本就存在的死代码。

检验标准：每一行被修改的代码，都必须能直接追溯到用户的需求。

## 4. 目标驱动执行

**定义成功标准，反复验证直到达标**

将任务转化为可验证目标：

- “添加校验” → “编写针对非法输入的测试并让其通过”
- “修复 Bug” → “先写出能复现问题的测试，再修复并让测试通过”
- “重构 X” → “确保重构前后测试均能通过”

多步骤任务需给出简要计划：

```pascal
1. [步骤] → 验证项：[检查点]
2. [步骤] → 验证项：[检查点]
3. [步骤] → 验证项：[检查点]
```

清晰的成功标准让你可以独立推进；模糊的目标（“让它跑起来”）只会带来反复沟通。

------

如果遵循本规范有效，会出现这些结果：

代码差异（diff）中无用修改更少、因过度设计导致的重写更少、澄清问题发生在实现之前，而非出错之后。



而原文可能写的比较口语化，agent可能不容易理解“ ”里的内容，另外原文的叙述可以更精简一些：

# 可以总结为以下四点：

## 编码前思考

- 实现前先明确假设。如果有歧义，说明不清楚的地方并提问，不要自行随意决定。
- 存在多种合理方案时，列出这些方案；有更简单实现时，指出来。
- 不要隐藏困惑。如果无法确保实现正确，停下来说明阻碍点。

## 优先保持简洁

- 用最少的必要代码实现需求，不添加推测性的功能、扩展性或配置，除非明确要求。
- 一次性代码避免抽象。如果实现显得过度设计，就简化它。
- 不为不可能出现的场景添加错误处理，实现程度与实际需求匹配即可。

## 精准最小化修改

- 只修改需求所需的代码，除非任务必要，否则不要重构、格式化或 “清理” 附近无关代码。
- 即使个人偏好其他风格，也要遵循当前文件本地风格。
- 清理因你的修改而过时的导入、变量或工具函数，但不要删除无关的死代码，除非被要求。
- 如果发现附近无关问题，直接提出，不要悄悄修复。

## 朝着可验证目标执行

- 将需求转化为可检查的具体成功标准。
- 修复 Bug 优先先复现问题，再验证修复效果。
- 功能开发优先用测试或其他直接方式证明所需行为已实现。
- 多步骤任务保留简短计划，每一步都设置验证点，以便独立检查进度。
