export type TrendingRange = 'daily' | 'weekly';

export type TrendingProject = {
  owner: string;
  name: string;
  description: string;
  language: string | null;
  stars: number | null;
  starsToday: number | null;
  forks: number | null;
  url: string;
};

type RawTrendingProject = {
  author: string;
  name: string;
  url: string;
  description?: string | null;
  language?: string | null;
  stars?: number | null;
  forks?: number | null;
  currentPeriodStars?: number | null;
};

const GITHUB_TRENDING_BASE = 'https://github.com/trending';

export const normalizeTrendingProject = (project: RawTrendingProject): TrendingProject => ({
  owner: project.author,
  name: project.name,
  description: project.description ?? '',
  language: project.language ?? null,
  stars: project.stars ?? null,
  forks: project.forks ?? null,
  starsToday: project.currentPeriodStars ?? null,
  url: project.url
});

export const isTrendingRange = (value: string): value is TrendingRange => {
  return value === 'daily' || value === 'weekly';
};

const decodeHtml = (value: string): string => {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
};

const stripHtml = (value: string): string => {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
};

const parseCount = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^\d]/g, '');
  return normalized ? Number.parseInt(normalized, 10) : null;
};

export const parseTrendingProjectsFromHtml = (html: string): TrendingProject[] => {
  const articleMatches = html.match(/<article\b[^>]*class="[^"]*Box-row[^"]*"[\s\S]*?<\/article>/g) ?? [];

  return articleMatches
    .map((article) => {
      const repoMatch = article.match(/href="\/([^/"\s]+)\/([^/"\s]+)"/);

      if (!repoMatch) {
        return null;
      }

      const [, owner, name] = repoMatch;
      const descriptionMatch = article.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
      const languageMatch = article.match(/itemprop="programmingLanguage"[^>]*>\s*([^<]+)\s*</);
      const starsMatch = article.match(/href="\/[^/"\s]+\/[^/"\s]+\/stargazers"[^>]*>\s*([\d,]+)\s*</);
      const forksMatch = article.match(/href="\/[^/"\s]+\/[^/"\s]+\/forks"[^>]*>\s*([\d,]+)\s*</);
      const starsTodayMatch = article.match(/([\d,]+)\s+stars\s+(?:today|this\s+week)/i);

      return {
        owner,
        name,
        description: descriptionMatch ? stripHtml(descriptionMatch[1]) : '',
        language: languageMatch ? stripHtml(languageMatch[1]) : null,
        stars: parseCount(starsMatch?.[1]),
        forks: parseCount(forksMatch?.[1]),
        starsToday: parseCount(starsTodayMatch?.[1]),
        url: `https://github.com/${owner}/${name}`
      } satisfies TrendingProject;
    })
    .filter((project): project is TrendingProject => Boolean(project));
};

export const getTrendingProjects = async (since: TrendingRange): Promise<TrendingProject[]> => {
  const response = await fetch(`${GITHUB_TRENDING_BASE}?since=${since}`, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Peng-Journal-Trending-Bot'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending failed with status ${response.status}`);
  }

  const html = await response.text();
  return parseTrendingProjectsFromHtml(html);
};