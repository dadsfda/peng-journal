import type { APIRoute } from 'astro';
import { getTrendingProjects, isTrendingRange } from '../../lib/trending';

const CACHE_CONTROL = 'public, max-age=0, s-maxage=1800, stale-while-revalidate=3600';

export const GET: APIRoute = async ({ url }) => {
  const since = url.searchParams.get('since') ?? 'daily';

  if (!isTrendingRange(since)) {
    return new Response(
      JSON.stringify({ ok: false, since, projects: [], message: '无效的热点时间范围' }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': CACHE_CONTROL,
          'cdn-cache-control': CACHE_CONTROL
        }
      }
    );
  }

  try {
    const projects = await getTrendingProjects(since);
    return new Response(JSON.stringify({ ok: true, since, projects }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': CACHE_CONTROL,
        'cdn-cache-control': CACHE_CONTROL
      }
    });
  } catch {
    return new Response(
      JSON.stringify({ ok: false, since, projects: [], message: '暂时无法获取热点数据' }),
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
