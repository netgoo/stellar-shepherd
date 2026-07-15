import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://stellarshepherd.com',
  output: 'server',
  integrations: [mdx(), markdoc(), sitemap(), robotsTxt(), react(), keystatic({ config: "./keystatic.config.ts" })],

  adapter: vercel(),
});
