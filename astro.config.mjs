import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://guixinji.com',
  integrations: [mdx(), keystatic(), react()],
  adapter: vercel()
});

import keystatic from '@keystatic/astro';

import react from '@astrojs/react';
