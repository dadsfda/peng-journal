import type { MarkdownHeading } from 'astro';
import type { CollectionEntry } from 'astro:content';

export type BlogPost = Pick<CollectionEntry<'blog'>, 'id' | 'slug' | 'data'>;

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

export type ArchiveMonthGroup<T extends BlogPost = BlogPost> = {
  month: number;
  label: string;
  posts: T[];
};

export type ArchiveYearGroup<T extends BlogPost = BlogPost> = {
  year: number;
  months: ArchiveMonthGroup<T>[];
};

export type BlogCategoryGroup<T extends BlogPost = BlogPost> = {
  name: string;
  slug: string;
  posts: T[];
};

export const DEFAULT_CATEGORY_NAME = '其他文章';

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');
const stripMarkdownExtension = (value: string) => value.replace(/\.md$/i, '');
const normalizeTagName = (value: string) => value.trim();

export const getPostSlug = (postOrId: BlogPost | string) => {
  if (typeof postOrId === 'string') {
    return stripMarkdownExtension(trimSlashes(postOrId));
  }

  return postOrId.slug;
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

export const getCategorySlug = (value: string) => {
  return encodeURIComponent(value.toLowerCase());
};

export const sortPostsByDateDesc = <T extends BlogPost>(posts: T[]) => {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
};

export const isPublishedPost = <T extends BlogPost>(post: T) => !post.data.draft;

export const getPublishedPosts = <T extends BlogPost>(posts: T[]) => {
  return sortPostsByDateDesc(posts).filter((post) => isPublishedPost(post));
};

export const getFeaturedPosts = <T extends BlogPost>(posts: T[]) => {
  return getPublishedPosts(posts).filter((post) => post.data.featured);
};

export const getAdjacentPosts = <T extends BlogPost>(posts: T[], currentPost: T) => {
  const sortedPosts = getPublishedPosts(posts);
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
  return getPublishedPosts(posts).map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    permalink: getPostPermalink(post),
    pubDate: post.data.pubDate.toISOString()
  }));
};

export const getSeriesPosts = <T extends BlogPost>(posts: T[], series: string) => {
  return getPublishedPosts(posts).filter((post) => post.data.series === series);
};

export const getPostCategoryName = <T extends BlogPost>(post: T) => {
  return post.data.series?.trim() || DEFAULT_CATEGORY_NAME;
};

export const getPostCategorySlug = <T extends BlogPost>(post: T) => {
  return getCategorySlug(getPostCategoryName(post));
};

export const getCategoryGroups = <T extends BlogPost>(posts: T[]): BlogCategoryGroup<T>[] => {
  const groups = new Map<string, BlogCategoryGroup<T>>();

  for (const post of getPublishedPosts(posts)) {
    const name = getPostCategoryName(post);
    const slug = getPostCategorySlug(post);
    const current = groups.get(slug);

    if (current) {
      current.posts.push(post);
    } else {
      groups.set(slug, {
        name,
        slug,
        posts: [post]
      });
    }
  }

  return [...groups.values()];
};

export const getArchiveGroups = <T extends BlogPost>(posts: T[]): ArchiveYearGroup<T>[] => {
  const groups = new Map<number, Map<number, T[]>>();

  for (const post of getPublishedPosts(posts)) {
    const year = post.data.pubDate.getFullYear();
    const month = post.data.pubDate.getMonth() + 1;
    const yearGroup = groups.get(year) ?? new Map<number, T[]>();
    const monthPosts = yearGroup.get(month) ?? [];

    monthPosts.push(post);
    yearGroup.set(month, sortPostsByDateDesc(monthPosts));
    groups.set(year, yearGroup);
  }

  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, monthPosts]) => ({
          month,
          label: `${String(month).padStart(2, '0')} 月`,
          posts: monthPosts
        }))
    }));
};

export const getAllTags = <T extends BlogPost>(posts: T[]) => {
  const tagMap = new Map<string, BlogTag>();

  for (const post of getPublishedPosts(posts)) {
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
