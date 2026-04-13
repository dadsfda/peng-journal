import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../src/components/Hero.astro';
import PostMeta from '../src/components/PostMeta.astro';
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
    expect(html).toContain('标签');
    expect(html).toContain('关于');
    expect(html).toContain('href="/posts"');
    expect(html).toContain('href="/tags"');
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
  test('输出日期与标签列表', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostMeta, {
      props: {
        post: {
          id: 'sample',
          data: {
            title: 'Sample',
            description: 'desc',
            pubDate: new Date('2026-04-12T00:00:00.000Z'),
            tags: ['Astro', '设计'],
            featured: true
          }
        }
      },
      partial: false
    });

    expect(html).toContain('2026年4月12日');
    expect(html).toContain('Astro');
    expect(html).toContain('设计');
    expect(html).toContain('datetime="2026-04-12T00:00:00.000Z"');
    expect(html).toMatch(/<li[^>]*><a[^>]*href="\/tags\/astro\/"[^>]*>Astro<\/a><\/li>/);
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

    expect(latestSection).toContain('/posts/notes-on-quiet-design/');
    expect(latestSection).toContain('/posts/how-i-structure-writing/');
    expect(latestSection).toContain('/posts/building-a-readable-blog/');
    expect(latestSection.indexOf('/posts/notes-on-quiet-design/')).toBeLessThan(
      latestSection.indexOf('/posts/how-i-structure-writing/')
    );
    expect(latestSection.indexOf('/posts/how-i-structure-writing/')).toBeLessThan(
      latestSection.indexOf('/posts/building-a-readable-blog/')
    );
  });
});

describe('about page', () => {
  test('构建产物中包含关于页内容与联系信息', () => {
    const html = readFileSync(resolve(process.cwd(), 'dist/about/index.html'), 'utf-8');

    expect(html).toContain('关于这个站点');
    expect(html).toContain('我在关注什么');
    expect(html).toContain('设计与排版');
    expect(html).toContain(siteConfig.email);
    expect(html).toContain('mailto:hello@example.com');
    expect(html).toContain(`${siteConfig.siteUrl}/about/`);
  });
});

describe('task 6 route files', () => {
  test('页面文件已创建', async () => {
    const { access } = await import('node:fs/promises');
    const files = [
      'src/pages/about.astro',
      'src/pages/posts/index.astro',
      'src/pages/posts/[slug].astro',
      'src/pages/tags/index.astro',
      'src/pages/tags/[tag].astro'
    ];

    const checks = await Promise.all(files.map((file) => access(file).then(() => true).catch(() => false)));
    expect(checks).toEqual([true, true, true, true, true]);
  });
});
