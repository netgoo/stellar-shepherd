import { defineConfig } from 'astro/config';

// ALEX AUTOMATION 核心配置文件
export default defineConfig({
  // 1. 主域名
  site: 'https://wenboom.com',
  base: '/',
  trailingSlash: 'ignore',
  output: 'static', // 
});
