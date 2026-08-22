import { defineConfig } from 'astro/config';

// ALEX AUTOMATION 10年总站官方纯静态标准配置文件
export default defineConfig({
  site: 'https://wenboom.com',
  base: '/',
  trailingSlash: 'ignore',
  output: 'static', // 只要这一行在，Astro 就会自动生成纯静态文件，无需设置 adapter
});
