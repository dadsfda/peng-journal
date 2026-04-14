import type { BlogPost } from '../src/lib/blog';
import { promises as fs } from 'node:fs';
import { describe, expect, test } from 'vitest';
import {
  getAdjacentPosts,
  getAllTags,
  getArchiveGroups,
  getFeaturedPosts,
  getPostPermalink,
  getPostSlug,
  getPublishedPosts,
  getSearchIndex,
  getSeriesPosts,
  getTableOfContents,
  getTagPermalink,
  getTagSlug,
  sortPostsByDateDesc
} from '../src/lib/blog';

const posts = [
  {
    id: 'a.md',
    slug: 'a',
    data: {
      title: 'A',
      description: 'desc',
      pubDate: new Date('2026-04-01'),
      tags: ['Astro', 'Design'],
      featured: false,
      draft: false
    }
  },
  {
    id: 'b.md',
    slug: 'b',
    data: {
      title: 'B',
      description: 'desc',
      pubDate: new Date('2026-04-12'),
      tags: ['Design'],
      featured: true,
      draft: false
    }
  }
] satisfies BlogPost[];

describe('blog utils', () => {
  test('按日期倒序排序文章', () => {
    const sorted = sortPostsByDateDesc(posts);
    expect(sorted.map((post) => post.id)).toEqual(['b.md', 'a.md']);
  });

  test('筛选精选文章', () => {
    const featured = getFeaturedPosts(posts);
    expect(featured.map((post) => post.id)).toEqual(['b.md']);
  });

  test('draft 文章不会进入公开文章集合', () => {
    const published = getPublishedPosts([
      {
        id: 'published.md',
        slug: 'published',
        data: {
          title: 'Published',
          description: 'desc',
          pubDate: new Date('2026-04-12'),
          tags: ['Astro'],
          featured: false,
          draft: false
        }
      },
      {
        id: 'draft.md',
        slug: 'draft',
        data: {
          title: 'Draft',
          description: 'desc',
          pubDate: new Date('2026-04-13'),
          tags: ['Astro'],
          featured: false,
          draft: true
        }
      }
    ] satisfies BlogPost[]);

    expect(published.map((post) => post.id)).toEqual(['published.md']);
  });

  test('按年和月分组归档数据', () => {
    const groups = getArchiveGroups([
      {
        id: 'march-post.md',
        slug: 'march-post',
        data: {
          title: 'March',
          description: 'desc',
          pubDate: new Date('2026-03-20'),
          tags: ['Astro'],
          featured: false,
          draft: false
        }
      },
      {
        id: 'april-post.md',
        slug: 'april-post',
        data: {
          title: 'April',
          description: 'desc',
          pubDate: new Date('2026-04-12'),
          tags: ['Astro'],
          featured: false,
          draft: false
        }
      }
    ] satisfies BlogPost[]);

    expect(groups).toEqual([
      {
        year: 2026,
        months: [
          {
            month: 4,
            label: '04 月',
            posts: [expect.objectContaining({ id: 'april-post.md' })]
          },
          {
            month: 3,
            label: '03 月',
            posts: [expect.objectContaining({ id: 'march-post.md' })]
          }
        ]
      }
    ]);
  });

  test('返回同系列的公开文章并按时间排序', () => {
    const seriesPosts = getSeriesPosts([
      {
        id: 'draft-post.md',
        slug: 'draft-post',
        data: {
          title: 'Draft',
          description: 'desc',
          pubDate: new Date('2026-04-13'),
          tags: ['Astro'],
          featured: false,
          draft: true,
          series: 'Astro 博客搭建'
        }
      },
      {
        id: 'part-1.md',
        slug: 'part-1',
        data: {
          title: 'Part 1',
          description: 'desc',
          pubDate: new Date('2026-04-01'),
          tags: ['Astro'],
          featured: false,
          draft: false,
          series: 'Astro 博客搭建'
        }
      },
      {
        id: 'part-2.md',
        slug: 'part-2',
        data: {
          title: 'Part 2',
          description: 'desc',
          pubDate: new Date('2026-04-10'),
          tags: ['Astro'],
          featured: false,
          draft: false,
          series: 'Astro 博客搭建'
        }
      }
    ] satisfies BlogPost[], 'Astro 博客搭建');

    expect(seriesPosts.map((post) => post.id)).toEqual(['part-2.md', 'part-1.md']);
  });

  test('聚合标签并按字母排序', () => {
    const tags = getAllTags(posts);
    expect(tags).toEqual([
      { name: 'Astro', count: 1, slug: 'astro' },
      { name: 'Design', count: 2, slug: 'design' }
    ]);
  });

  test('空标签文章不会生成无意义标签项', () => {
    const tags = getAllTags([
      {
        id: 'c.md',
        slug: 'c',
        data: {
          title: 'C',
          description: 'desc',
          pubDate: new Date('2026-04-13'),
          tags: [],
          featured: false,
          draft: false
        }
      }
    ] satisfies BlogPost[]);

    expect(tags).toEqual([]);
  });

  test('大小写与首尾空白差异的标签会聚合为同一项', () => {
    const tags = getAllTags([
      {
        id: 'd.md',
        slug: 'd',
        data: {
          title: 'D',
          description: 'desc',
          pubDate: new Date('2026-04-14'),
          tags: ['Astro', 'astro', ' Astro '],
          featured: false,
          draft: false
        }
      }
    ] satisfies BlogPost[]);

    expect(tags).toEqual([{ name: 'Astro', count: 3, slug: 'astro' }]);
  });

  test('特殊字符标签会生成 URL-safe slug 和永久链接', () => {
    expect(getTagSlug('UI/UX')).toBe('ui%2Fux');
    expect(getTagPermalink('UI/UX')).toBe('/tags/ui%2Fux/');
  });

  test('文章永久链接优先使用 frontmatter 中的 slug', () => {
    expect(
      getPostSlug({
        id: 'AI 智能体实践/AI 智能体构建总结.md',
        slug: 'ai-agent-building-summary',
        data: {
          title: 'AI 智能体构建总结',
          description: 'desc',
          pubDate: new Date('2026-04-13'),
          tags: ['AI'],
          featured: false,
          draft: false
        }
      } satisfies BlogPost)
    ).toBe('ai-agent-building-summary');

    expect(
      getPostPermalink({
        id: 'AI 智能体实践/AI 智能体构建总结.md',
        slug: 'ai-agent-building-summary',
        data: {
          title: 'AI 智能体构建总结',
          description: 'desc',
          pubDate: new Date('2026-04-13'),
          tags: ['AI'],
          featured: false,
          draft: false
        }
      } satisfies BlogPost)
    ).toBe('/posts/ai-agent-building-summary/');
  });

  test('子目录文章仍然使用 slug 生成稳定链接', () => {
    const permalink = getPostPermalink({
      id: 'AI 智能体实践/AI 智能体构建总结.md',
      slug: 'ai-agent-building-summary',
      data: {
        title: 'AI 智能体构建总结',
        description: 'desc',
        pubDate: new Date('2026-04-13'),
        tags: ['AI'],
        featured: false,
        draft: false
      }
    } satisfies BlogPost);

    expect(permalink).toBe('/posts/ai-agent-building-summary/');
  });

  test('能够返回显式的上一篇和下一篇文章', () => {
    const extendedPosts = [
      ...posts,
      {
        id: 'c.md',
        slug: 'c',
        data: {
          title: 'C',
          description: 'desc',
          pubDate: new Date('2026-04-08'),
          tags: ['Astro'],
          featured: true,
          draft: false
        }
      }
    ] satisfies BlogPost[];

    const { previousPost, nextPost } = getAdjacentPosts(extendedPosts, extendedPosts[2]);

    expect(previousPost?.id).toBe('a.md');
    expect(nextPost?.id).toBe('b.md');
  });

  test('能够从标题列表里提取二三级标题目录', () => {
    const toc = getTableOfContents([
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 2, slug: 'summary', text: '一句话概括' },
      { depth: 3, slug: 'react', text: 'ReAct 模式' },
      { depth: 4, slug: 'ignore-me', text: 'Ignore Me' }
    ]);

    expect(toc).toEqual([
      { depth: 2, slug: 'summary', text: '一句话概括' },
      { depth: 3, slug: 'react', text: 'ReAct 模式' }
    ]);
  });

  test('能够生成搜索索引数据', () => {
    const searchIndex = getSearchIndex(posts);

    expect(searchIndex).toEqual([
      {
        title: 'B',
        description: 'desc',
        tags: ['Design'],
        permalink: '/posts/b/',
        pubDate: '2026-04-12T00:00:00.000Z'
      },
      {
        title: 'A',
        description: 'desc',
        tags: ['Astro', 'Design'],
        permalink: '/posts/a/',
        pubDate: '2026-04-01T00:00:00.000Z'
      }
    ]);
  });
});

describe('sample blog posts', () => {
  test('系列文章使用子目录管理且文件名使用文章标题', async () => {
    const files = [
      'src/content/blog/AI 智能体实践/AI 智能体构建总结.md',
      'src/content/blog/AI 智能体实践/Karpathy-Inspired Claude Code Guidelines.md'
    ];

    const contents = await Promise.all(files.map((file) => fs.readFile(file, 'utf8')));

    for (const content of contents) {
      expect(content).toContain('title:');
      expect(content).toContain('slug:');
    }
  });

  test('非系列文章仍保留在 blog 根目录', async () => {
    const files = [
      'src/content/blog/notes-on-quiet-design.md',
      'src/content/blog/building-a-readable-blog.md'
    ];

    const contents = await Promise.all(files.map((file) => fs.readFile(file, 'utf8')));

    for (const content of contents) {
      expect(content).toContain('title:');
      expect(content).toContain('tags:');
    }
  });
});

