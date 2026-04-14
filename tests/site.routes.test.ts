import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../src/components/Hero.astro';
import PostMeta from '../src/components/PostMeta.astro';
import PostTableOfContents from '../src/components/PostTableOfContents.astro';
import BaseLayout from '../src/layouts/BaseLayout.astro';
import { siteConfig } from '../src/data/site';

describe('base layout', () => {
  test('输出站点标题、导航、元信息与主内容', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout, {
      props: {
        title: '首页',
        description: 'desc',
        path: '/'
      },
      slots: {
        default: '<section>content</section>'
      },
      partial: false
    });

    expect(html).toContain('文章');
    expect(html).toContain('归档');
    expect(html).toContain('标签');
    expect(html).toContain('搜索');
    expect(html).toContain('关于');
    expect(html).toContain('href="/posts"');
    expect(html).toContain('href="/archive"');
    expect(html).toContain('href="/tags"');
    expect(html).toContain('href="/search"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('<section>content</section>');
    expect(html).toMatch(/<main class="page-shell"[^>]*>[\s\S]*<section>content<\/section>[\s\S]*<\/main>/);
    expect(html).toContain('<title>首页</title>');
    expect(html).toContain('<meta name="description" content="desc">');
    expect(html).toContain(`<link rel="canonical" href="${siteConfig.siteUrl}/">`);
    expect(html).toContain('<meta property="og:type" content="website">');
    expect(html).toContain(`<meta property="og:image" content="${siteConfig.siteUrl}/og-cover.svg">`);
  });
});

describe('hero component', () => {
  test('输出站点标题与介绍文案', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero, { partial: false });

    expect(html).toContain(siteConfig.title);
    expect(html).toContain(siteConfig.intro);
  });
});

describe('post meta component', () => {
  test('输出日期、最后更新时间与标签列表', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostMeta, {
      props: {
        post: {
          id: 'sample',
          data: {
            title: 'Sample',
            description: 'desc',
            pubDate: new Date('2026-04-12T00:00:00.000Z'),
            updatedDate: new Date('2026-04-15T00:00:00.000Z'),
            tags: ['Astro', '设计'],
            featured: true,
            draft: false
          }
        }
      },
      partial: false
    });

    expect(html).toContain('发布于 2026年4月12日');
    expect(html).toContain('最后更新于 2026年4月15日');
    expect(html).toContain('Astro');
    expect(html).toContain('设计');
    expect(html).toContain('datetime="2026-04-12T00:00:00.000Z"');
    expect(html).toMatch(/<li[^>]*><a[^>]*href="\/tags\/astro\/"[^>]*>Astro<\/a><\/li>/);
  });
});

describe('post table of contents component', () => {
  test('输出目录项标记，供滚动高亮脚本使用', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostTableOfContents, {
      props: {
        items: [
          { depth: 2, slug: 'summary', text: '一句话概括' },
          { depth: 3, slug: 'react-mode', text: 'ReAct 模式' }
        ]
      },
      partial: false
    });

    expect(html).toContain('data-toc');
    expect(html).toContain('data-toc-link="summary"');
    expect(html).toContain('data-toc-link="react-mode"');
    expect(html).toContain('class="depth-3"');
  });
});

describe('home page', () => {
  test('构建产物中包含首页真实内容、标签输出与分区数据差异', () => {
    const html = readFileSync(resolve(process.cwd(), 'dist/index.html'), 'utf-8');
    const featuredSection = html.match(/<section class="featured-posts">([\s\S]*?)<\/section>/)?.[1] ?? '';
    const latestSection = html.match(/<section class="post-list-section">([\s\S]*?)<\/section>/)?.[1] ?? '';

    expect(html).toContain(siteConfig.title);
    expect(html).toContain('精选文章');
    expect(html).toContain('最新文章');
    expect(html).toContain('>Astro<');

    expect(featuredSection).toContain('/posts/notes-on-quiet-design/');
    expect(featuredSection).toContain('/posts/building-a-readable-blog/');
    expect(featuredSection).not.toContain('/posts/how-i-structure-writing/');

    expect(latestSection).toContain('/posts/how-i-structure-writing/');
    expect(latestSection).toContain('/posts/ai-agent-building-summary/');
    expect(latestSection).toContain('/posts/notes-on-quiet-design/');
    expect(latestSection).toContain('/posts/building-a-readable-blog/');
    expect(latestSection.indexOf('/posts/how-i-structure-writing/')).toBeLessThan(
      latestSection.indexOf('/posts/ai-agent-building-summary/')
    );
    expect(latestSection.indexOf('/posts/ai-agent-building-summary/')).toBeLessThan(
      latestSection.indexOf('/posts/notes-on-quiet-design/')
    );
    expect(latestSection.indexOf('/posts/notes-on-quiet-design/')).toBeLessThan(
      latestSection.indexOf('/posts/building-a-readable-blog/')
    );
  });
});

describe('post table of contents', () => {
  test('长文章详情页包含左侧目录、锚点链接与高亮挂载点', () => {
    const html = readFileSync(resolve(process.cwd(), 'dist/posts/ai-agent-building-summary/index.html'), 'utf-8');

    expect(html).toContain('文章目录');
    expect(html).toContain('class="post-layout"');
    expect(html).toContain('class="post-toc"');
    expect(html).toContain('href="#一句话概括"');
    expect(html).toContain('href="#react-模式"');
    expect(html).toContain('data-toc-link="一句话概括"');
    expect(html).toContain('data-toc-link="react-模式"');
    expect(html).toContain('data-toc-script');
  });

  test('文章详情页会显示最后更新时间', () => {
    const html = readFileSync(resolve(process.cwd(), 'dist/posts/ai-agent-building-summary/index.html'), 'utf-8');

    expect(html).toContain('最后更新于 2026年4月14日');
  });

  test('文章详情页会显示系列文章区块', () => {
    const html = readFileSync(resolve(process.cwd(), 'dist/posts/ai-agent-building-summary/index.html'), 'utf-8');

    expect(html).toContain('本系列文章');
    expect(html).toContain('/posts/how-i-structure-writing/');
    expect(html).toContain('aria-current="true"');
  });

  test('目录区域具备独立滚动能力', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(css).toContain('max-height: calc(100vh - 136px);');
    expect(css).toContain('overflow-y: auto;');
  });
});

describe('archive page', () => {
  test('构建产物中包含按年月分组的归档页', () => {
    const html = readFileSync(resolve(process.cwd(), 'dist/archive/index.html'), 'utf-8');

    expect(html).toContain('文章归档');
    expect(html).toContain('2026');
    expect(html).toContain('04 月');
    expect(html).toContain('/posts/ai-agent-building-summary/');
  });
});

describe('search and feed', () => {
  test('构建产物中包含搜索页、RSS 和 sitemap', () => {
    const searchHtml = readFileSync(resolve(process.cwd(), 'dist/search/index.html'), 'utf-8');
    const rssXml = readFileSync(resolve(process.cwd(), 'dist/rss.xml'), 'utf-8');
    const sitemapXml = readFileSync(resolve(process.cwd(), 'dist/sitemap-index.xml'), 'utf-8');

    expect(searchHtml).toContain('搜索文章');
    expect(searchHtml).toContain('搜索标题、摘要或标签');
    expect(rssXml).toContain('<rss');
    expect(rssXml).toContain('Peng Journal');
    expect(sitemapXml).toContain('<sitemapindex');
  });
});

describe('about page', () => {
  test('构建产物中包含关于页内容与联系信息', () => {
    const html = readFileSync(resolve(process.cwd(), 'dist/about/index.html'), 'utf-8');

    expect(html).toContain('关于这个站点');
    expect(html).toContain('我在关注什么');
    expect(html).toContain('设计与排版');
    expect(html).toContain(siteConfig.email);
    expect(html).toContain('mailto:914144406@qq.com');
    expect(html).toContain(`${siteConfig.siteUrl}/about/`);
  });
});

describe('task 6 route files', () => {
  test('页面文件已创建', async () => {
    const { access } = await import('node:fs/promises');
    const files = [
      'src/pages/about.astro',
      'src/pages/archive.astro',
      'src/pages/posts/index.astro',
      'src/pages/posts/[slug].astro',
      'src/pages/tags/index.astro',
      'src/pages/tags/[tag].astro',
      'src/pages/search.astro',
      'src/pages/rss.xml.ts'
    ];

    const checks = await Promise.all(files.map((file) => access(file).then(() => true).catch(() => false)));
    expect(checks).toEqual([true, true, true, true, true, true, true, true]);
  });
});

describe('published content filtering', () => {
  test('草稿文章不会出现在首页、归档页、搜索页和 RSS 中', () => {
    const homeHtml = readFileSync(resolve(process.cwd(), 'dist/index.html'), 'utf-8');
    const archiveHtml = readFileSync(resolve(process.cwd(), 'dist/archive/index.html'), 'utf-8');
    const searchHtml = readFileSync(resolve(process.cwd(), 'dist/search/index.html'), 'utf-8');
    const rssXml = readFileSync(resolve(process.cwd(), 'dist/rss.xml'), 'utf-8');

    expect(homeHtml).not.toContain('Draft Only Post');
    expect(archiveHtml).not.toContain('Draft Only Post');
    expect(searchHtml).not.toContain('Draft Only Post');
    expect(rssXml).not.toContain('Draft Only Post');
  });

  test('草稿文章不会生成详情页路由', () => {
    expect(existsSync(resolve(process.cwd(), 'dist/posts/draft-only-post/index.html'))).toBe(false);
  });
});
