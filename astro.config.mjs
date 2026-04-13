import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://peng-journal.vercel.app',
  integrations: [sitemap()]
});

