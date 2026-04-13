import type { BlogPost } from '../src/lib/blog';
import { promises as fs } from 'node:fs';
import { describe, expect, test } from 'vitest';
import {
  getAdjacentPosts,
  getAllTags,
  getFeaturedPosts,
  getPostPermalink,
  getTableOfContents,
  getTagPermalink,
  getTagSlug,
  sortPostsByDateDesc
} from '../src/lib/blog';

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
] satisfies BlogPost[];

describe('blog utils', () => {
  test('按日期倒序排序文章', () => {
    const sorted = sortPostsByDateDesc(posts);
    expect(sorted.map((post) => post.id)).toEqual(['b', 'a']);
  });

  test('筛选精选文章', () => {
    const featured = getFeaturedPosts(posts);
    expect(featured.map((post) => post.id)).toEqual(['b']);
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
        id: 'c',
        data: {
          title: 'C',
          description: 'desc',
          pubDate: new Date('2026-04-13'),
          tags: [],
          featured: false
        }
      }
    ] satisfies BlogPost[]);

    expect(tags).toEqual([]);
  });

  test('大小写与首尾空白差异的标签会聚合为同一项', () => {
    const tags = getAllTags([
      {
        id: 'd',
        data: {
          title: 'D',
          description: 'desc',
          pubDate: new Date('2026-04-14'),
          tags: ['Astro', 'astro', ' Astro '],
          featured: false
        }
      }
    ] satisfies BlogPost[]);

    expect(tags).toEqual([{ name: 'Astro', count: 3, slug: 'astro' }]);
  });

  test('特殊字符标签会生成 URL-safe slug 和永久链接', () => {
    expect(getTagSlug('UI/UX')).toBe('ui%2Fux');
    expect(getTagPermalink('UI/UX')).toBe('/tags/ui%2Fux/');
  });

  test('文章永久链接不会暴露 markdown 扩展名', () => {
    expect(getPostPermalink('notes-on-quiet-design.md')).toBe('/posts/notes-on-quiet-design/');
  });

  test('能够返回显式的上一篇和下一篇文章', () => {
    const extendedPosts = [
      ...posts,
      {
        id: 'c',
        data: {
          title: 'C',
          description: 'desc',
          pubDate: new Date('2026-04-08'),
          tags: ['Astro'],
          featured: true
        }
      }
    ] satisfies BlogPost[];

    const { previousPost, nextPost } = getAdjacentPosts(extendedPosts, extendedPosts[2]);

    expect(previousPost?.id).toBe('a');
    expect(nextPost?.id).toBe('b');
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
});

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
