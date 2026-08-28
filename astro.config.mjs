import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.wenboom.com',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
});
