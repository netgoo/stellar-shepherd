import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.resolve('./src/content/posts');

export function getAllPosts() {
  const filenames = fs.readdirSync(postsDir);
  const posts = filenames
    .filter(name => name.endsWith('.md'))
    .map(filename => {
      const fullPath = path.join(postsDir, filename);
      const fileContent = fs.readFileSync(fullPath, { encoding: 'utf8' });
      const { data, content } = matter(fileContent);
      return {
        slug: filename.replace('.md', ''),
        ...data,
        content
      };
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return posts;
}
