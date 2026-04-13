# Peng Journal

Peng Journal 是一个以 AI、技术和长期写作为主题的个人博客。

这个项目使用 `Astro` 构建，采用静态站点方式输出，内容通过 `Markdown` 维护，适合持续记录文章、笔记与方法总结。

## 页面内容

- 首页
- 文章列表
- 文章详情
- 标签页
- 关于页

## 本地开发

```bash
npm install
npm run dev
```

## 校验与构建

```bash
npm run check
npm test
npm run build
```

## 项目结构

```text
src/
  components/    页面组件
  content/blog/  博客文章
  data/          站点信息
  layouts/       页面布局
  pages/         路由页面
  styles/        全局样式
public/          静态资源
tests/           测试文件
```

## 内容更新

### 修改站点信息

编辑 `src/data/site.ts`，可以更新：

- 博客标题
- 作者信息
- 首页简介
- 邮箱和地点
- 关于页文案

### 新增文章

在 `src/content/blog` 下新增一个 `.md` 文件，使用下面的格式：

```md
---
title: 文章标题
description: 文章摘要
pubDate: 2026-04-13
tags:
  - 标签一
  - 标签二
featured: false
---

这里开始写正文。
```

## 技术栈

- `Astro`
- `TypeScript`
- `Vitest`
