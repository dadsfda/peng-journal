import { afterEach, describe, expect, test, vi } from 'vitest';
import { normalizeTrendingProject, getTrendingProjects } from '../src/lib/trending';
import { GET } from '../src/pages/api/trending';

describe('trending service', () => {
  test('把第三方 Trending 项目数据标准化为站内结构', () => {
    const project = normalizeTrendingProject({
      author: 'openai',
      name: 'codex',
      url: 'https://github.com/openai/codex',
      description: 'A coding agent',
      language: 'TypeScript',
      stars: 42000,
      forks: 3000,
      currentPeriodStars: 1200
    });

    expect(project).toEqual({
      owner: 'openai',
      name: 'codex',
      description: 'A coding agent',
      language: 'TypeScript',
      stars: 42000,
      forks: 3000,
      starsToday: 1200,
      url: 'https://github.com/openai/codex'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('按 since 参数请求第三方 Trending API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          author: 'openai',
          name: 'codex',
          url: 'https://github.com/openai/codex',
          description: 'A coding agent',
          language: 'TypeScript',
          stars: 42000,
          forks: 3000,
          currentPeriodStars: 1200
        }
      ]
    } as Response);

    const projects = await getTrendingProjects('weekly');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://ghapi.huchen.dev/repositories?since=weekly'),
      expect.any(Object)
    );
    expect(projects[0].name).toBe('codex');
  });

  test('API 路由返回缓存头和统一 JSON 结构', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => []
    } as Response);

    const response = await GET({
      url: new URL('https://peng-journal.vercel.app/api/trending?since=daily')
    } as never);

    expect(response.headers.get('cache-control')).toContain('s-maxage=1800');
    expect(response.headers.get('cdn-cache-control')).toContain('s-maxage=1800');

    const payload = await response.json();
    expect(payload).toEqual({ ok: true, since: 'daily', projects: [] });
  });

  test('API 路由在非法 since 参数下返回 400', async () => {
    const response = await GET({
      url: new URL('https://peng-journal.vercel.app/api/trending?since=monthly')
    } as never);

    expect(response.status).toBe(400);
  });
});
