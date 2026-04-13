import type { MarkdownHeading } from 'astro';
import type { CollectionEntry } from 'astro:content';

export type BlogPost = Pick<CollectionEntry<'blog'>, 'id' | 'data'>;

export type BlogTag = {
  name: string;
  count: number;
  slug: string;
};

export type TableOfContentsItem = {
  depth: 2 | 3;
  slug: string;
  text: string;
};

export type SearchIndexItem = {
  title: string;
  description: string;
  tags: string[];
  permalink: string;
  pubDate: string;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');
const stripMarkdownExtension = (value: string) => value.replace(/\.md$/i, '');
const normalizeTagName = (value: string) => value.trim();

export const getPostSlug = (postOrId: BlogPost | string) => {
  const rawId = typeof postOrId === 'string' ? postOrId : postOrId.id;
  return stripMarkdownExtension(trimSlashes(rawId));
};

export const getPostPermalink = (postOrId: BlogPost | string) => {
  return `/posts/${getPostSlug(postOrId)}/`;
};

export const getTagSlug = (value: string) => {
  return encodeURIComponent(normalizeTagName(value).toLowerCase());
};

export const getTagPermalink = (value: string) => {
  return `/tags/${getTagSlug(value)}/`;
};

export const sortPostsByDateDesc = <T extends BlogPost>(posts: T[]) => {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
};

export const getFeaturedPosts = <T extends BlogPost>(posts: T[]) => {
  return sortPostsByDateDesc(posts).filter((post) => post.data.featured);
};

export const getAdjacentPosts = <T extends BlogPost>(posts: T[], currentPost: T) => {
  const sortedPosts = sortPostsByDateDesc(posts);
  const currentIndex = sortedPosts.findIndex((post) => getPostSlug(post) === getPostSlug(currentPost));

  return {
    previousPost: currentIndex >= 0 ? sortedPosts[currentIndex + 1] : undefined,
    nextPost: currentIndex > 0 ? sortedPosts[currentIndex - 1] : undefined
  };
};

export const getTableOfContents = (headings: MarkdownHeading[]): TableOfContentsItem[] => {
  return headings
    .filter((heading): heading is MarkdownHeading & { depth: 2 | 3 } => heading.depth === 2 || heading.depth === 3)
    .map((heading) => ({
      depth: heading.depth,
      slug: heading.slug,
      text: heading.text
    }));
};

export const getSearchIndex = <T extends BlogPost>(posts: T[]): SearchIndexItem[] => {
  return sortPostsByDateDesc(posts).map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    permalink: getPostPermalink(post),
    pubDate: post.data.pubDate.toISOString()
  }));
};

export const getAllTags = <T extends BlogPost>(posts: T[]) => {
  const tagMap = new Map<string, BlogTag>();

  for (const post of posts) {
    for (const rawTag of post.data.tags) {
      const name = normalizeTagName(rawTag);
      if (!name) {
        continue;
      }

      const slug = getTagSlug(name);
      const current = tagMap.get(slug);
      if (current) {
        current.count += 1;
      } else {
        tagMap.set(slug, { name, count: 1, slug });
      }
    }
  }

  return [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name));
};
