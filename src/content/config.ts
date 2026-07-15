import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: "*.{md,mdx}",
    base: new URL("./src/content/posts", import.meta.url)
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    description: z.string(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { posts };