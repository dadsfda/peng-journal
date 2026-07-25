import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('site header', () => {
  it('sticks to the top above scrolling content', () => {
    const css = readFileSync(resolve('src/styles/global.css'), 'utf8');
    const headerRule = css.match(/\.site-header\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(headerRule).toContain('position: sticky');
    expect(headerRule).toContain('top: 0');
    expect(headerRule).toMatch(/z-index:\s*[1-9]\d*/);
  });
});
