import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://wenboom.com',
  base: '/',
  trailingSlash: 'ignore',
  output: 'static', // Astro 7 中保持 static 即可，接口文件设置 prerender = false 会自动生效
  adapter: vercel(),
});
