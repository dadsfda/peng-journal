import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getPostPermalink, sortPostsByDateDesc } from '../lib/blog';
import { siteConfig } from '../data/site';

export async function GET(context: APIContext) {
  const posts = sortPostsByDateDesc(await getCollection('blog'));

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? siteConfig.siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: getPostPermalink(post)
    }))
  });
}
