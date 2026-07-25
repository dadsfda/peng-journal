import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../src/components/Hero.astro';
import PostMeta from '../src/components/PostMeta.astro';
import PostTableOfContents from '../src/components/PostTableOfContents.astro';
import BaseLayout from '../src/layouts/BaseLayout.astro';
import { siteConfig } from '../src/data/site';

const getBuildFilePath = (...segments: string[]) => resolve(process.cwd(), 'dist', 'client', ...segments);

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
    expect(html).toContain('热点');
    expect(html).toContain('标签');
    expect(html).toContain('搜索');
    expect(html).toContain('关于');
    expect(html).toContain('href="/posts"');
    expect(html).toContain('href="/archive"');
    expect(html).toContain('href="/trending"');
    expect(html).toContain('href="/tags"');
    expect(html).toContain('href="/search"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('<section>content</section>');
    expect(html).toContain('class="site-footer"');
    expect(html).toMatch(/<main class="page-shell"[^>]*>[\s\S]*<section>content<\/section>[\s\S]*<\/main>/);
    expect(html).toContain('<title>首页</title>');
    expect(html).toContain('<meta name="description" content="desc">');
    expect(html).toContain(`<link rel="canonical" href="${siteConfig.siteUrl}/">`);
    expect(html).toContain('<meta property="og:type" content="website">');
    expect(html).toContain(`<meta property="og:image" content="${siteConfig.siteUrl}/og-cover.svg">`);
  });
});

describe('hero component', () => {
  test('输出站点标题、介绍文案与精选文章候选项', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero, {
      props: {
        featuredPosts: [
          { title: '精选文章 A', description: 'A desc', permalink: '/posts/a/' },
          { title: '精选文章 B', description: 'B desc', permalink: '/posts/b/' }
        ]
      },
      partial: false
    });

    expect(html).toContain(siteConfig.title);
    expect(html).toContain(siteConfig.intro);
    expect(html).toContain('data-featured-item');
    expect(html).toContain('精选文章 A');
    expect(html).toContain('精选文章 B');
    expect(html).toContain('href="/posts/a/"');
    expect(html).toContain('href="/posts/b/"');
    expect(html).toContain('data-ink-canvas');
    expect(html).toContain('<canvas');
  });
});

describe('category groups', () => {
  test('按 series 对文章分组，没有 series 的文章归入其他文章', async () => {
    const { getCategoryGroups } = await import('../src/lib/blog');

    const groups = getCategoryGroups([
      {
        id: 'a',
        slug: 'a',
        data: {
          title: 'A',
          description: 'desc',
          pubDate: new Date('2026-04-21T00:00:00.000Z'),
          tags: ['AI'],
          featured: false,
          draft: false,
          series: 'AI 智能体实践'
        }
      },
      {
        id: 'b',
        slug: 'b',
        data: {
          title: 'B',
          description: 'desc',
          pubDate: new Date('2026-04-20T00:00:00.000Z'),
          tags: ['Astro'],
          featured: false,
          draft: false
        }
      }
    ] as never);

    expect(groups.map((group) => group.name)).toEqual(['AI 智能体实践', '其他文章']);
    expect(groups[0].posts[0].slug).toBe('a');
    expect(groups[1].posts[0].slug).toBe('b');
  });
});

describe('post meta component', () => {
  test('输出日期、最后更新时间与标签列表', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostMeta, {
      props: {
        post: {
          id: 'sample',
          slug: 'sample',
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

describe('article category nav component', () => {
  test('输出分类名和文章链接', async () => {
    const { default: ArticleCategoryNav } = await import('../src/components/ArticleCategoryNav.astro');
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryNav, {
      props: {
        title: '文章分类目录',
        groups: [
          {
            name: 'AI 智能体实践',
            slug: 'ai-category',
            posts: [
              {
                id: 'sample',
                slug: 'ai-agent-building-summary',
                data: {
                  title: 'AI 智能体构建总结',
                  description: 'desc',
                  pubDate: new Date('2026-04-13T00:00:00.000Z'),
                  tags: ['AI'],
                  featured: false,
                  draft: false,
                  series: 'AI 智能体实践'
                }
              }
            ]
          }
        ]
      },
      partial: false
    });

    expect(html).toContain('文章分类目录');
    expect(html).toContain('AI 智能体实践');
    expect(html).toContain('/posts/ai-agent-building-summary/');
    expect(html).toContain('data-category-nav');
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
  test('首页仅展示带导航入口的沉浸式 Hero', () => {
    const html = readFileSync(getBuildFilePath('index.html'), 'utf-8');

    expect(html).toContain(siteConfig.title);
    expect(html).toContain('class="home-hero"');
    expect(html).toContain('/images/home-hero.png');
    expect(html).toContain('href="/posts"');
    expect(html).toContain('href="/about"');
    expect(html).not.toContain('GitHub Trending');
    expect(html).not.toContain('精选文章');
    expect(html).not.toContain('继续阅读');
    expect(html).not.toContain('class="site-footer"');
    expect(existsSync(resolve(process.cwd(), 'public/images/home-hero.png'))).toBe(true);
  });

  test('首页样式限制为单屏并提供背景遮罩与移动端布局', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(css).toMatch(/\.home-page\s*\{[^}]*height:\s*100dvh[^}]*overflow:\s*hidden/);
    expect(css).toContain('.home-page .page-shell');
    expect(css).toContain('.home-hero-image');
    expect(css).toContain('.home-hero-shade');
    expect(css).toMatch(/\.home-hero-shade\s*\{[^}]*linear-gradient/);
    expect(css).toContain('.home-featured');
  });

  test('首页每次加载会随机显示一篇精选文章', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/Hero.astro'), 'utf-8');

    expect(source).toContain('Math.random()');
    expect(source).toContain("querySelectorAll('[data-featured-item]')");
    expect(source).toContain('item.hidden = index !== selectedIndex');
  });

  test('首页 Canvas 使用可恢复的水墨粒子擦除遮罩', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/Hero.astro'), 'utf-8');
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(source).toContain("globalCompositeOperation = 'destination-out'");
    expect(source).toContain('requestAnimationFrame');
    expect(source).toContain("addEventListener('pointermove'");
    expect(source).toContain('window.devicePixelRatio');
    expect(source).toContain('(hover: hover) and (pointer: fine)');
    expect(source).toContain('(prefers-reduced-motion: reduce)');
    expect(source).toContain('life: 1500 + Math.random() * 1000');
    expect(css).toContain('.home-ink-canvas');
    expect(css).toContain('pointer-events: none');
    expect(css).toContain('.home-ink-canvas.is-static');
  });

  test('WebGL 水墨模块包含完整流体模拟管线与参考参数', () => {
    const modulePath = resolve(process.cwd(), 'src/scripts/fluidInk.js');

    expect(existsSync(modulePath)).toBe(true);
    if (!existsSync(modulePath)) return;

    const source = readFileSync(modulePath, 'utf-8');
    expect(source).toContain('export function initFluidInk');
    expect(source).toContain('function getWebGLContext');
    expect(source).toContain('createDoubleFBO');
    expect(source).toContain('advectionShader');
    expect(source).toContain('vorticityShader');
    expect(source).toContain('pressureShader');
    expect(source).toContain('SPLAT_RADIUS = 0.24');
    expect(source).toContain('SPLAT_FORCE = 6000');
    expect(source).toContain('(prefers-reduced-motion: reduce)');
  });

  test('Hero 优先使用透明流体遮罩并在 WebGL 失败时回退', () => {
    const heroSource = readFileSync(resolve(process.cwd(), 'src/components/Hero.astro'), 'utf-8');
    const fluidSource = readFileSync(resolve(process.cwd(), 'src/scripts/fluidInk.js'), 'utf-8');

    expect(heroSource).toContain("import { initFluidInk } from '../scripts/fluidInk.js'");
    expect(heroSource).toContain('const initInkFallback');
    expect(heroSource).toContain('initFluidInk(canvas)');
    expect(heroSource).toContain('initInkFallback(hero, canvas, context)');
    expect(fluidSource).toContain('float maskAlpha = 1.0 - clamp(a * 40.0, 0.0, 1.0)');
    expect(fluidSource).toContain('gl_FragColor = vec4(vec3(0.9608) * maskAlpha, maskAlpha)');
    expect(readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8')).toContain(
      '.home-featured [data-featured-item][hidden]'
    );
  });

});

describe('posts index page', () => {
  test('全部文章页包含标题右侧分类筛选和文章分类标记', () => {
    const html = readFileSync(getBuildFilePath('posts', 'index.html'), 'utf-8');

    expect(html).toContain('全部文章');
    expect(html).toContain('class="post-category-filter"');
    expect(html).toContain('AI 智能体实践');
    expect(html).toContain('data-post-filter');
    expect(html).toContain('data-filter-button="all"');
    expect(html).toContain('data-post-category=');
  });
});

describe('post table of contents', () => {
  test('长文章详情页包含左侧目录、锚点链接与高亮挂载点', () => {
    const html = readFileSync(getBuildFilePath('posts', 'ai-agent-building-summary', 'index.html'), 'utf-8');

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
    const html = readFileSync(getBuildFilePath('posts', 'ai-agent-building-summary', 'index.html'), 'utf-8');

    expect(html).toContain('最后更新于 2026年4月14日');
  });

  test('文章详情页会显示系列文章区块', () => {
    const html = readFileSync(getBuildFilePath('posts', 'ai-agent-building-summary', 'index.html'), 'utf-8');

    expect(html).toContain('本系列文章');
    expect(html).toContain('/posts/how-i-structure-writing/');
    expect(html).toContain('aria-current="true"');
  });

  test('目录区域具备独立滚动能力', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(css).toContain('max-height: calc(100vh - 136px);');
    expect(css).toContain('overflow-y: auto;');
  });

  test('目录根据阅读位置高亮并自动保持当前项可见', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/pages/posts/[slug].astro'), 'utf-8');

    expect(source).not.toMatch(/<script is:inline>\s*\{`/);
    expect(source).toContain('requestAnimationFrame');
    expect(source).toContain('getBoundingClientRect().top');
    expect(source).toContain("addEventListener('scroll'");
    expect(source).toContain('scrollIntoView');
    expect(source).toContain("behavior: 'smooth'");
    expect(source).toContain("block: 'nearest'");
  });

  test('目录当前项具备指示线且二三级标题层级明显', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(css).toMatch(/\.post-toc a\.is-active[\s\S]*?border-left-color:\s*var\(--text\)/);
    expect(css).toMatch(/\.post-toc-list li\.depth-3\s*\{[^}]*padding-left:\s*1\.25rem/);
    expect(css).toMatch(/\.post-toc-list li\.depth-3\s*\{[^}]*font-size:\s*0\.92rem/);
  });
});

describe('archive page', () => {
  test('构建产物中包含按年月分组的归档页', () => {
    const html = readFileSync(getBuildFilePath('archive', 'index.html'), 'utf-8');

    expect(html).toContain('文章归档');
    expect(html).toContain('2026');
    expect(html).toContain('04 月');
    expect(html).toContain('/posts/ai-agent-building-summary/');
  });
});

describe('search and feed', () => {
  test('构建产物中包含搜索页、RSS 和 sitemap', () => {
    const searchHtml = readFileSync(getBuildFilePath('search', 'index.html'), 'utf-8');
    const rssXml = readFileSync(getBuildFilePath('rss.xml'), 'utf-8');
    const sitemapXml = readFileSync(getBuildFilePath('sitemap-index.xml'), 'utf-8');

    expect(searchHtml).toContain('搜索文章');
    expect(searchHtml).toContain('搜索标题、摘要或标签');
    expect(rssXml).toContain('<rss');
    expect(rssXml).toContain(siteConfig.title);
    expect(sitemapXml).toContain('<sitemapindex');
  });
});

describe('about page', () => {
  test('构建产物中包含关于页内容与联系信息', () => {
    const html = readFileSync(getBuildFilePath('about', 'index.html'), 'utf-8');

    expect(html).toContain('关于这个站点');
    expect(html).toContain('我在关注什么');
    expect(html).toContain('AI 学习与实践');
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
      'src/pages/rss.xml.ts',
      'src/pages/trending.astro',
      'src/pages/api/trending/daily.ts',
      'src/pages/api/trending/weekly.ts'
    ];

    const checks = await Promise.all(files.map((file) => access(file).then(() => true).catch(() => false)));
    expect(checks).toEqual([true, true, true, true, true, true, true, true, true, true, true]);
  });
});

describe('published content filtering', () => {
  test('草稿文章不会出现在首页、归档页、搜索页和 RSS 中', () => {
    const homeHtml = readFileSync(getBuildFilePath('index.html'), 'utf-8');
    const archiveHtml = readFileSync(getBuildFilePath('archive', 'index.html'), 'utf-8');
    const searchHtml = readFileSync(getBuildFilePath('search', 'index.html'), 'utf-8');
    const rssXml = readFileSync(getBuildFilePath('rss.xml'), 'utf-8');

    expect(homeHtml).not.toContain('Draft Only Post');
    expect(archiveHtml).not.toContain('Draft Only Post');
    expect(searchHtml).not.toContain('Draft Only Post');
    expect(rssXml).not.toContain('Draft Only Post');
  });

  test('草稿文章不会生成详情页路由', () => {
    expect(existsSync(getBuildFilePath('posts', 'draft-only-post', 'index.html'))).toBe(false);
  });
});

describe('trending page', () => {
  test('构建产物中包含 trending 页面和日周切换入口', () => {
    const html = readFileSync(getBuildFilePath('trending', 'index.html'), 'utf-8');

    expect(html).toContain('GitHub Trending');
    expect(html).toContain('今日热点');
    expect(html).toContain('本周热点');
    expect(html).toContain('/api/trending/daily');
    expect(html).toContain('/api/trending/weekly');
  });

  test('trending 页面包含页面结构类名和空状态钩子', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(source).toContain('.trending-page');
    expect(source).toContain('.trending-preview');
    expect(source).toContain('.trending-list');
  });
});

describe('post category filter styles', () => {
  test('样式文件包含文章分类筛选样式', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(css).toContain('.post-category-filter');
    expect(css).toContain('.section-heading--with-actions');
    expect(css).toContain('[data-post-category]');
    expect(css).toContain('@media (max-width: 960px)');
  });
});
