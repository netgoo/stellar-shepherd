import { config, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: { type: 'text', label: 'Title', validation: { isRequired: true } },
        description: { type: 'text', label: 'Description', validation: { isRequired: true } },
        pubDate: { type: 'date', label: 'Publish Date', validation: { isRequired: true } },
        updatedDate: { type: 'date', label: 'Updated Date' },
        heroImage: { type: 'image', label: 'Hero Image', directory: 'src/assets/images/blog' },
        content: { type: 'document', label: 'Content', formatting: true },
      },
    }),
  },
});
