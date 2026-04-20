export const prerender = false;

import type { APIRoute } from 'astro';
import { getTrendingProjects } from '../../../lib/trending';

const CACHE_CONTROL = 'public, max-age=0, s-maxage=1800, stale-while-revalidate=3600';

export const GET: APIRoute = async () => {
  try {
    const projects = await getTrendingProjects('daily');
    return new Response(JSON.stringify({ ok: true, since: 'daily', projects }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': CACHE_CONTROL,
        'cdn-cache-control': CACHE_CONTROL
      }
    });
  } catch {
    return new Response(
      JSON.stringify({ ok: false, since: 'daily', projects: [], message: '暂时无法获取热点数据' }),
      {
        status: 502,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': CACHE_CONTROL,
          'cdn-cache-control': CACHE_CONTROL
        }
      }
    );
  }
};
