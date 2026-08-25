import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://wenboom.com',
  base: '/',
  trailingSlash: 'ignore',
  output: 'hybrid', // 允许特定路由（如 API）走 Serverless 函数
  adapter: vercel(),
});
