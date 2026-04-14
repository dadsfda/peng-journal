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

const TRENDING_API_BASE = 'https://ghapi.huchen.dev/repositories';

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

export const getTrendingProjects = async (since: TrendingRange): Promise<TrendingProject[]> => {
  const response = await fetch(`${TRENDING_API_BASE}?since=${since}`, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Trending API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawTrendingProject[];
  return payload.map(normalizeTrendingProject);
};
