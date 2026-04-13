import { getViteConfig } from 'astro/config';
import { defineConfig } from 'vitest/config';

export default getViteConfig(
  defineConfig({
    test: {
      include: ['tests/**/*.test.ts'],
      globalSetup: ['tests/global-setup.ts']
    }
  })
);
