import { defineConfig } from 'astro/config';

// ALEX AUTOMATION 10年总站无漏洞终极静态配置文件
export default defineConfig({
  site: 'https://wenboom.com',
  base: '/',
  trailingSlash: 'ignore',
  output: 'static', // 扣死纯静态输出
  adapter: null,    // 显式彻底卸载一切遗留云函数渲染适配器，断绝 500 报错根源
});

