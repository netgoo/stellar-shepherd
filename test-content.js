import { glob } from 'astro/loaders';

async function run() {
  const loader = glob({
    pattern: "**/*.{md,mdx,mdoc}",
    base: "src/content/posts"
  });
  const entries = await loader.load();
  console.log('匹配到文件数量：', entries.length);
  console.log('文件列表：', entries);
}
run();
