import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'netgoo/stellar-shepherd',
  },
  cloud: {
    provider: 'github',
    appId: '4285172',
  },
  collections: {
    posts: collection({
      label: '文章',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: '标题' } }),
        date: fields.date({ label: '发布日期' }),
        content: fields.markdoc({ label: '正文' }),
      },
    }),
  },
});
