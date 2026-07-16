import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  posts: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "./src/content/posts"
    }),
    schema: z.object({
      title: z.string(),
      pubDate: z.string(),
      description: z.string().optional()
    }).passthrough()
  })
};
