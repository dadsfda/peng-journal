import { afterEach, describe, expect, test, vi } from 'vitest';
import * as dailyRoute from '../src/pages/api/trending/daily';
import * as weeklyRoute from '../src/pages/api/trending/weekly';
import { getTrendingProjects, normalizeTrendingProject, parseTrendingProjectsFromHtml } from '../src/lib/trending';

const { GET: GETDaily } = dailyRoute;
const { GET: GETWeekly } = weeklyRoute;

const sampleHtml = `
<article class="Box-row">
  <h2 class="h3 lh-condensed">
    <a href="/forrestchang/andrej-karpathy-skills" class="Link">
      <span class="text-normal">
        forrestchang /
      </span>
      andrej-karpathy-skills</a>
  </h2>
  <p class="col-9 color-fg-muted my-1 tmp-pr-4">
    A single CLAUDE.md file to improve Claude Code behavior.
  </p>
  <div class="f6 color-fg-muted mt-2">
    <span itemprop="programmingLanguage">TypeScript</span>
    <a href="/forrestchang/andrej-karpathy-skills/stargazers" class="Link Link--muted d-inline-block">30,006</a>
    <a href="/forrestchang/andrej-karpathy-skills/forks" class="Link Link--muted d-inline-block">2,454</a>
    <span class="d-inline-block float-sm-right">9,230 stars today</span>
  </div>
</article>
`;

const sampleWeeklyHtml = `
<article class="Box-row">
  <h2 class="h3 lh-condensed">
    <a href="/openai/codex" class="Link">codex</a>
  </h2>
  <p class="col-9 color-fg-muted my-1 tmp-pr-4">
    A coding agent.
  </p>
  <div class="f6 color-fg-muted mt-2">
    <span itemprop="programmingLanguage">TypeScript</span>
    <a href="/openai/codex/stargazers" class="Link Link--muted d-inline-block">42,000</a>
    <a href="/openai/codex/forks" class="Link Link--muted d-inline-block">3,000</a>
    <span class="d-inline-block float-sm-right">14,317 stars this week</span>
  </div>
</article>
`;

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

  test('能从 GitHub Trending 页面 HTML 中提取项目数据', () => {
    const projects = parseTrendingProjectsFromHtml(sampleHtml);

    expect(projects).toEqual([
      {
        owner: 'forrestchang',
        name: 'andrej-karpathy-skills',
        description: 'A single CLAUDE.md file to improve Claude Code behavior.',
        language: 'TypeScript',
        stars: 30006,
        forks: 2454,
        starsToday: 9230,
        url: 'https://github.com/forrestchang/andrej-karpathy-skills'
      }
    ]);
  });

  test('能解析 GitHub 周榜里的增量数据', () => {
    const projects = parseTrendingProjectsFromHtml(sampleWeeklyHtml);

    expect(projects[0]?.starsToday).toBe(14317);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('按 since 参数请求 GitHub Trending 页面', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => sampleHtml
    } as Response);

    const projects = await getTrendingProjects('weekly');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/trending?since=weekly'),
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: 'text/html' })
      })
    );
    expect(projects[0].name).toBe('andrej-karpathy-skills');
  });

  test('daily API 路由返回 daily 标记和缓存头', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '<html></html>'
    } as Response);

    const response = await GETDaily({
      url: new URL('https://peng-journal.vercel.app/api/trending/daily')
    } as never);

    expect(response.headers.get('cache-control')).toContain('s-maxage=1800');
    const payload = await response.json();
    expect(payload).toEqual({ ok: true, since: 'daily', projects: [] });
  });

  test('weekly API 路由返回 weekly 标记和缓存头', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '<html></html>'
    } as Response);

    const response = await GETWeekly({
      url: new URL('https://peng-journal.vercel.app/api/trending/weekly')
    } as never);

    expect(response.headers.get('cache-control')).toContain('s-maxage=1800');
    const payload = await response.json();
    expect(payload).toEqual({ ok: true, since: 'weekly', projects: [] });
  });

  test('trending API 路由关闭预渲染，确保按请求执行', () => {
    expect(dailyRoute.prerender).toBe(false);
    expect(weeklyRoute.prerender).toBe(false);
  });
});
