import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

describe('trending preview source', () => {
  test('首页热点预览组件保留正确文案、前三条限制和紧凑容器类名', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/TrendingPreview.astro'), 'utf-8');
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

    expect(source).toContain('今日热点项目');
    expect(source).toContain('查看完整榜单');
    expect(source).toContain('slice(0, 3)');
    expect(source).toContain('trending-preview-shell');
    expect(css).toContain('.trending-preview-shell');
  });
});
