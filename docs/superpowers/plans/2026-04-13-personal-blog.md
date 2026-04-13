# Personal Blog Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Astro 构建一个可部署到 Vercel 的现代极简个人博客，包含首页、文章列表、文章详情、关于页、标签总览页和单标签页。

**Architecture:** 站点采用 Astro 静态生成模式，文章内容放在 `src/content/blog` 的 Markdown 文件中，通过内容集合 schema 统一校验元数据。页面层只负责拼装内容与组件，数据筛选逻辑集中在内容读取与工具函数中，样式由全局样式变量和少量可复用组件样式共同组成。

**Tech Stack:** Astro、TypeScript、@astrojs/rss、Vitest、@astrojs/check、Markdown、CSS

---

## 文件结构

### 计划创建文件

- `package.json`：项目依赖与脚本
- `astro.config.mjs`：Astro 配置
- `tsconfig.json`：TypeScript 配置
- `src/env.d.ts`：Astro 类型声明
- `src/content.config.ts`：内容集合 schema
- `src/content/blog/*.md`：示例文章
- `src/data/site.ts`：站点基础文案与作者信息
- `src/lib/blog.ts`：文章排序、精选文章、标签聚合工具
- `src/layouts/BaseLayout.astro`：全局布局
- `src/components/Header.astro`：顶部导航
- `src/components/Footer.astro`：页脚
- `src/components/Hero.astro`：首页首屏
- `src/components/PostList.astro`：文章列表
- `src/components/FeaturedPosts.astro`：精选文章模块
- `src/components/TagCloud.astro`：标签总览模块
- `src/components/PostMeta.astro`：文章元信息
- `src/pages/index.astro`：首页
- `src/pages/posts/index.astro`：文章列表页
- `src/pages/about.astro`：关于页
- `src/pages/tags/index.astro`：标签总览页
- `src/pages/tags/[tag].astro`：单标签页
- `src/pages/posts/[slug].astro`：文章详情页
- `src/styles/global.css`：全局样式系统
- `tests/content.config.test.ts`：内容 schema 与博客工具测试
- `tests/site.routes.test.ts`：关键页面渲染测试
- `README.md`：本地开发与 Vercel 部署说明

### 计划修改文件

- 无，当前仓库为空目录

---

### Task 1: 初始化 Astro 项目骨架与工具链

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `README.md`

- [ ] **Step 1: 创建项目依赖配置（配置类初始化，按 TDD 例外处理）**

```json
{
  "name": "minimal-personal-blog",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.7.0",
    "@astrojs/rss": "^4.0.11"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.1"
  }
}
```

- [ ] **Step 2: 写入 Astro 与 TypeScript 配置**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example-blog.vercel.app'
});
```

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 3: 安装依赖**

Run: `npm install`
Expected: 安装成功，输出包含 `added` 且无 `ERR!`

- [ ] **Step 4: 运行基础校验命令**

Run: `npm run check`
Expected: 成功退出；如果提示缺少页面文件，继续执行后续任务补齐页面

- [ ] **Step 5: 编写最小 README**

```md
# 个人博客

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署

推荐部署到 Vercel，直接导入仓库并使用默认 Astro 静态构建配置。
```

---

### Task 2: 建立内容集合与博客数据工具

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/blog.ts`
- Create: `tests/content.config.test.ts`

- [ ] **Step 1: 写出内容工具的失败测试**

```ts
import { describe, expect, test } from 'vitest';
import { getAllTags, getFeaturedPosts, sortPostsByDateDesc } from '../src/lib/blog';

const posts = [
  {
    id: 'a',
    data: {
      title: 'A',
      description: 'desc',
      pubDate: new Date('2026-04-01'),
      tags: ['Astro', 'Design'],
      featured: false
    }
  },
  {
    id: 'b',
    data: {
      title: 'B',
      description: 'desc',
      pubDate: new Date('2026-04-12'),
      tags: ['Design'],
      featured: true
    }
  }
];

describe('blog utils', () => {
  test('按日期倒序排序文章', () => {
    const sorted = sortPostsByDateDesc(posts as never);
    expect(sorted.map((post) => post.id)).toEqual(['b', 'a']);
  });

  test('筛选精选文章', () => {
    const featured = getFeaturedPosts(posts as never);
    expect(featured.map((post) => post.id)).toEqual(['b']);
  });

  test('聚合标签并按字母排序', () => {
    const tags = getAllTags(posts as never);
    expect(tags).toEqual([
      { name: 'Astro', count: 1, slug: 'astro' },
      { name: 'Design', count: 2, slug: 'design' }
    ]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/content.config.test.ts`
Expected: FAIL，提示 `Cannot find module '../src/lib/blog'` 或导出不存在

- [ ] **Step 3: 实现最小博客工具与内容 schema**

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(180),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
});

export const collections = { blog };
```

```ts
// src/lib/blog.ts
export type BlogPost = {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
    featured: boolean;
  };
};

const toSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

export const sortPostsByDateDesc = <T extends BlogPost>(posts: T[]) => {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
};

export const getFeaturedPosts = <T extends BlogPost>(posts: T[]) => {
  return sortPostsByDateDesc(posts).filter((post) => post.data.featured);
};

export const getAllTags = <T extends BlogPost>(posts: T[]) => {
  const tagMap = new Map<string, { name: string; count: number; slug: string }>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const current = tagMap.get(tag);
      if (current) {
        current.count += 1;
      } else {
        tagMap.set(tag, { name: tag, count: 1, slug: toSlug(tag) });
      }
    }
  }

  return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name));
};
```

- [ ] **Step 4: 重新运行测试确认通过**

Run: `npx vitest run tests/content.config.test.ts`
Expected: PASS，3 个测试全部通过

- [ ] **Step 5: 扩展测试覆盖空标签场景**

```ts
test('空标签文章不会生成无意义标签项', () => {
  const tags = getAllTags([
    {
      id: 'c',
      data: {
        title: 'C',
        description: 'desc',
        pubDate: new Date('2026-04-13'),
        tags: [],
        featured: false
      }
    }
  ] as never);

  expect(tags).toEqual([]);
});
```

Run: `npx vitest run tests/content.config.test.ts`
Expected: PASS，4 个测试全部通过

---

### Task 3: 准备站点文案和示例文章内容

**Files:**
- Create: `src/data/site.ts`
- Create: `src/content/blog/notes-on-quiet-design.md`
- Create: `src/content/blog/how-i-structure-writing.md`
- Create: `src/content/blog/building-a-readable-blog.md`

- [ ] **Step 1: 写示例内容的失败测试**

```ts
import { describe, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';

describe('sample blog posts', () => {
  test('示例文章都包含标题和标签字段', async () => {
    const files = [
      'src/content/blog/notes-on-quiet-design.md',
      'src/content/blog/how-i-structure-writing.md',
      'src/content/blog/building-a-readable-blog.md'
    ];

    const contents = await Promise.all(files.map((file) => fs.readFile(file, 'utf8')));

    for (const content of contents) {
      expect(content).toContain('title:');
      expect(content).toContain('tags:');
    }
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/content.config.test.ts`
Expected: FAIL，提示示例文章文件不存在

- [ ] **Step 3: 写入站点文案与示例文章**

```ts
// src/data/site.ts
export const siteConfig = {
  title: 'Lin Journal',
  description: '写关于设计、技术与日常思考的个人博客。',
  author: 'Lin',
  intro: '记录那些值得慢慢阅读、慢慢思考的内容。',
  about: [
    '我关注设计、前端体验与长期写作。',
    '这个站点用来存放文章、方法和一些不想快速略过的想法。'
  ]
};
```

```md
---
title: 安静设计的力量
description: 讨论为什么克制的界面更适合长期阅读。
pubDate: 2026-04-12
tags:
  - 设计
  - 阅读体验
featured: true
---

好的博客不一定要让人惊叹，但应该让人愿意停留。

> 真正优秀的阅读界面，往往不是被注意到，而是被信任。

## 为什么安静很重要

当视觉语言足够克制，读者才能把注意力留给内容本身。
```

```md
---
title: 我如何组织一篇文章
description: 从提纲、段落到修改，记录我整理长文的方式。
pubDate: 2026-04-10
tags:
  - 写作
  - 方法
featured: false
---

我会先写提纲，再决定每一节是否真的有存在的必要。

## 一个简单方法

1. 先写结论。
2. 再补充支撑段落。
3. 最后删除多余修饰。
```

```md
---
title: 搭建一个真正好读的博客
description: 从宽度、留白和层级出发，搭建更适合阅读的页面。
pubDate: 2026-04-08
tags:
  - Astro
  - 前端
  - 阅读体验
featured: true
---

阅读体验不是装饰，而是信息设计。

```ts
const contentFirst = true;
```

合适的宽度与节奏，决定了一篇文章是否容易被读完。
```

- [ ] **Step 4: 重新运行测试确认通过**

Run: `npx vitest run tests/content.config.test.ts`
Expected: PASS，示例文章存在且包含必要字段

- [ ] **Step 5: 手动检查 frontmatter 日期排序**

Run: `Get-Content src/content/blog/*.md`
Expected: 3 篇文章日期不同，且至少 2 篇 `featured: true`

---

### Task 4: 实现全局布局、导航与样式系统

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/styles/global.css`
- Create: `tests/site.routes.test.ts`

- [ ] **Step 1: 写首页骨架渲染失败测试**

```ts
import { describe, expect, test } from 'vitest';
import { renderToString } from 'astro/server';
import BaseLayout from '../src/layouts/BaseLayout.astro';

describe('base layout', () => {
  test('输出站点标题与导航占位', async () => {
    const html = await renderToString(BaseLayout, {
      props: {
        title: '首页',
        description: 'desc'
      },
      slots: {
        default: '<section>content</section>'
      }
    });

    expect(html).toContain('文章');
    expect(html).toContain('标签');
    expect(html).toContain('关于');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/site.routes.test.ts`
Expected: FAIL，提示布局文件不存在

- [ ] **Step 3: 实现布局、导航和全局样式**

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <Header />
    <main class="page-shell">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

```astro
---
const navItems = [
  { href: '/posts', label: '文章' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' }
];
---

<header class="site-header">
  <a class="site-brand" href="/">Lin Journal</a>
  <nav>
    <ul class="site-nav">
      {navItems.map((item) => (
        <li><a href={item.href}>{item.label}</a></li>
      ))}
    </ul>
  </nav>
</header>
```

```astro
<footer class="site-footer">
  <p>Lin Journal</p>
  <p>Built with Astro and a calm reading rhythm.</p>
</footer>
```

```css
:root {
  --bg: #f5f5f2;
  --surface: rgba(255, 255, 255, 0.72);
  --text: #141414;
  --muted: #666666;
  --line: rgba(20, 20, 20, 0.12);
  --max-width: 1120px;
  --reading-width: 720px;
}

html {
  font-family: "Georgia", "Times New Roman", serif;
  background: linear-gradient(180deg, #f7f7f4 0%, #efefe9 100%);
  color: var(--text);
}

body {
  margin: 0;
}

.page-shell {
  width: min(calc(100% - 32px), var(--max-width));
  margin: 0 auto;
}
```

- [ ] **Step 4: 重新运行测试确认通过**

Run: `npx vitest run tests/site.routes.test.ts`
Expected: PASS，测试能找到导航文字

- [ ] **Step 5: 补充移动端样式断点**

```css
@media (max-width: 720px) {
  .site-header,
  .site-nav {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-shell {
    width: min(calc(100% - 24px), var(--max-width));
  }
}
```

Run: `npm run check`
Expected: 成功退出，无样式相关构建错误

---

### Task 5: 实现首页模块与文章列表组件

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/FeaturedPosts.astro`
- Create: `src/components/PostList.astro`
- Create: `src/components/PostMeta.astro`
- Create: `src/pages/index.astro`

- [ ] **Step 1: 写首页渲染失败测试**

```ts
import { describe, expect, test } from 'vitest';
import { renderToString } from 'astro/server';
import HomePage from '../src/pages/index.astro';

describe('home page', () => {
  test('展示精选文章区和最新文章区标题', async () => {
    const html = await renderToString(HomePage);
    expect(html).toContain('精选文章');
    expect(html).toContain('最新文章');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/site.routes.test.ts`
Expected: FAIL，提示首页文件不存在或渲染失败

- [ ] **Step 3: 实现首页组件与页面**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import FeaturedPosts from '../components/FeaturedPosts.astro';
import PostList from '../components/PostList.astro';
import { getCollection } from 'astro:content';
import { getFeaturedPosts, sortPostsByDateDesc } from '../lib/blog';
import { siteConfig } from '../data/site';

const allPosts = sortPostsByDateDesc(await getCollection('blog'));
const featuredPosts = getFeaturedPosts(allPosts).slice(0, 2);
const latestPosts = allPosts.slice(0, 5);
---

<BaseLayout title={siteConfig.title} description={siteConfig.description}>
  <Hero />
  <FeaturedPosts posts={featuredPosts} />
  <PostList title="最新文章" posts={latestPosts} />
</BaseLayout>
```

```astro
---
import { siteConfig } from '../data/site';
---

<section class="hero">
  <p class="eyebrow">个人博客</p>
  <h1>{siteConfig.title}</h1>
  <p class="hero-copy">{siteConfig.intro}</p>
</section>
```

```astro
---
import PostMeta from './PostMeta.astro';
const { posts } = Astro.props;
---

<section class="featured-posts">
  <div class="section-heading">
    <h2>精选文章</h2>
  </div>
  <div class="featured-grid">
    {posts.map((post) => (
      <article>
        <PostMeta post={post} />
        <h3><a href={`/posts/${post.id}/`}>{post.data.title}</a></h3>
        <p>{post.data.description}</p>
      </article>
    ))}
  </div>
</section>
```

```astro
---
import PostMeta from './PostMeta.astro';
const { title, posts } = Astro.props;
---

<section class="post-list-section">
  <div class="section-heading">
    <h2>{title}</h2>
  </div>
  <div class="post-list">
    {posts.map((post) => (
      <article class="post-row">
        <PostMeta post={post} />
        <h3><a href={`/posts/${post.id}/`}>{post.data.title}</a></h3>
        <p>{post.data.description}</p>
      </article>
    ))}
  </div>
</section>
```

```astro
---
const { post } = Astro.props;
const dateText = post.data.pubDate.toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
---

<div class="post-meta">
  <time datetime={post.data.pubDate.toISOString()}>{dateText}</time>
  <ul>
    {post.data.tags.map((tag: string) => <li>{tag}</li>)}
  </ul>
</div>
```

- [ ] **Step 4: 重新运行测试确认通过**

Run: `npx vitest run tests/site.routes.test.ts`
Expected: PASS，首页测试命中“精选文章”“最新文章”

- [ ] **Step 5: 补充首页样式**

```css
.hero {
  padding: 5rem 0 4rem;
}

.hero h1 {
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 0.95;
  margin: 0;
}

.section-heading {
  border-top: 1px solid var(--line);
  padding-top: 1rem;
  margin-bottom: 1.5rem;
}

.post-row,
.featured-grid article {
  border-bottom: 1px solid var(--line);
  padding: 1.25rem 0;
}
```

Run: `npm run check`
Expected: 成功退出

---

### Task 6: 实现文章列表、文章详情与标签页面

**Files:**
- Create: `src/components/TagCloud.astro`
- Create: `src/pages/posts/index.astro`
- Create: `src/pages/posts/[slug].astro`
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`

- [ ] **Step 1: 写动态页面失败测试**

```ts
test('文章列表页、标签页和关于页文件存在', async () => {
  const files = [
    'src/pages/posts/index.astro',
    'src/pages/posts/[slug].astro',
    'src/pages/tags/index.astro',
    'src/pages/tags/[tag].astro',
    'src/pages/about.astro'
  ];

  const checks = await Promise.all(files.map((file) => fs.access(file).then(() => true).catch(() => false)));
  expect(checks).toEqual([true, true, true, true, true]);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/site.routes.test.ts`
Expected: FAIL，至少缺少 1 个页面文件

- [ ] **Step 3: 实现文章列表页与标签总览页**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';
import { sortPostsByDateDesc } from '../../lib/blog';

const posts = sortPostsByDateDesc(await getCollection('blog'));
---

<BaseLayout title="全部文章" description="按时间浏览全部文章。">
  <PostList title="全部文章" posts={posts} />
</BaseLayout>
```

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TagCloud from '../../components/TagCloud.astro';
import { getCollection } from 'astro:content';
import { getAllTags } from '../../lib/blog';

const tags = getAllTags(await getCollection('blog'));
---

<BaseLayout title="全部标签" description="按主题浏览文章。">
  <TagCloud tags={tags} />
</BaseLayout>
```

```astro
---
const { tags } = Astro.props;
---

<section class="tag-cloud">
  <h1>标签</h1>
  <ul>
    {tags.map((tag) => (
      <li>
        <a href={`/tags/${tag.slug}/`}>{tag.name}</a>
        <span>{tag.count}</span>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 4: 实现文章详情页与单标签页**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostMeta from '../../components/PostMeta.astro';
import { getCollection, getEntry } from 'astro:content';
import { sortPostsByDateDesc } from '../../lib/blog';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await post.render();
const allPosts = sortPostsByDateDesc(await getCollection('blog'));
const currentIndex = allPosts.findIndex((item) => item.id === post.id);
const previousPost = allPosts[currentIndex + 1];
const nextPost = allPosts[currentIndex - 1];
---

<BaseLayout title={post.data.title} description={post.data.description}>
  <article class="post-article">
    <header>
      <h1>{post.data.title}</h1>
      <PostMeta post={post} />
      <p class="post-description">{post.data.description}</p>
    </header>
    <div class="post-body">
      <Content />
    </div>
    <nav class="post-pagination">
      {previousPost && <a href={`/posts/${previousPost.id}/`}>上一篇：{previousPost.data.title}</a>}
      {nextPost && <a href={`/posts/${nextPost.id}/`}>下一篇：{nextPost.data.title}</a>}
    </nav>
  </article>
</BaseLayout>
```

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';
import { getCollection } from 'astro:content';
import { sortPostsByDateDesc } from '../../lib/blog';

const toSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];
  return tags.map((tag) => ({ params: { tag: toSlug(tag) }, props: { tag } }));
}

const { tag } = Astro.props;
const posts = sortPostsByDateDesc(await getCollection('blog')).filter((post) =>
  post.data.tags.some((item) => toSlug(item) === toSlug(tag))
);
---

<BaseLayout title={`${tag} 标签`} description={`浏览 ${tag} 标签下的文章。`}>
  <PostList title={`${tag} 标签`} posts={posts} />
</BaseLayout>
```

- [ ] **Step 5: 重新运行测试确认通过**

Run: `npx vitest run tests/site.routes.test.ts`
Expected: PASS，页面文件检查通过

---

### Task 7: 实现关于页、完善 SEO 和阅读样式

**Files:**
- Create: `src/pages/about.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Modify: `README.md`

- [ ] **Step 1: 写关于页失败测试**

```ts
test('关于页包含作者介绍文案', async () => {
  const html = await fs.readFile('src/pages/about.astro', 'utf8');
  expect(html).toContain('siteConfig.about');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run tests/site.routes.test.ts`
Expected: FAIL，关于页文件不存在或未使用站点文案

- [ ] **Step 3: 实现关于页和基础 SEO 字段**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { siteConfig } from '../data/site';
---

<BaseLayout title="关于" description={siteConfig.description}>
  <section class="about-page">
    <h1>关于</h1>
    {siteConfig.about.map((paragraph) => (
      <p>{paragraph}</p>
    ))}
  </section>
</BaseLayout>
```

```astro
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site).toString()} />
```

- [ ] **Step 4: 完善正文阅读样式**

```css
.post-article {
  width: min(100%, var(--reading-width));
  margin: 0 auto;
  padding: 4rem 0 6rem;
}

.post-body {
  font-size: 1.08rem;
  line-height: 1.95;
}

.post-body blockquote {
  margin: 2rem 0;
  padding-left: 1.25rem;
  border-left: 2px solid var(--text);
  color: var(--muted);
}

.post-body pre {
  overflow-x: auto;
  padding: 1rem;
  background: #111111;
  color: #f3f3f3;
}
```

- [ ] **Step 5: 重新运行检查并补充部署说明**

Run: `npm run check && npm run build`
Expected: 成功构建，输出包含 `dist/`

```md
## Vercel 部署

1. 在 Vercel 中导入仓库。
2. Framework Preset 选择 Astro。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。
```

---

### Task 8: 最终验证与收尾

**Files:**
- Modify: `tests/content.config.test.ts`
- Modify: `tests/site.routes.test.ts`
- Modify: `README.md`

- [ ] **Step 1: 汇总关键测试并全部运行**

```ts
// tests/site.routes.test.ts
import { describe, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';

describe('route files', () => {
  test('关键页面文件都存在', async () => {
    const files = [
      'src/pages/index.astro',
      'src/pages/posts/index.astro',
      'src/pages/posts/[slug].astro',
      'src/pages/tags/index.astro',
      'src/pages/tags/[tag].astro',
      'src/pages/about.astro'
    ];

    const exists = await Promise.all(files.map((file) => fs.access(file).then(() => true).catch(() => false)));
    expect(exists.every(Boolean)).toBe(true);
  });
});
```

- [ ] **Step 2: 运行全部测试**

Run: `npm test`
Expected: PASS，所有 Vitest 测试通过

- [ ] **Step 3: 运行类型与构建验证**

Run: `npm run check`
Expected: PASS，无 Astro 类型错误

Run: `npm run build`
Expected: PASS，生成 `dist/index.html`、`dist/posts/index.html`、`dist/tags/index.html`

- [ ] **Step 4: 本地预览页面**

Run: `npm run preview`
Expected: 可以访问首页、文章列表页、文章详情页、关于页、标签页

- [ ] **Step 5: 准备提交（仅在用户明确允许提交时执行）**

```bash
git add .
git commit -m "feat: 完成个人博客基础站点"
```

Expected: 只有在用户明确允许提交时才执行该步骤

---

## 自检结果

### Spec coverage

- 首页、文章列表、文章详情、关于页、标签页：由 Task 5、Task 6、Task 7 覆盖
- Markdown 内容管理：由 Task 2、Task 3 覆盖
- 现代极简风格与阅读体验：由 Task 4、Task 5、Task 7 覆盖
- Vercel 部署与构建：由 Task 1、Task 7、Task 8 覆盖

### Placeholder scan

- 已检查，计划中未保留 `TODO`、`TBD` 或“稍后实现”类占位描述

### Type consistency

- `siteConfig`、`sortPostsByDateDesc`、`getFeaturedPosts`、`getAllTags` 在后续任务中的命名保持一致
