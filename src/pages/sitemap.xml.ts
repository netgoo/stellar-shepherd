// src/pages/sitemap.xml.ts
// Auto-generated sitemap from single source of truth (src/data/articles.ts).
// Build-time static output in Astro hybrid mode (no prerender=false).
// Replaces public/sitemap.xml.

import type { APIRoute } from 'astro';
import { articles, pillars } from '../data/articles';

interface StaticPageEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const staticPages: StaticPageEntry[] = [
  { url: 'https://wenboom.com/', lastmod: '2026-09-04', changefreq: 'daily', priority: '1.0' },
  { url: 'https://wenboom.com/trends', lastmod: '2026-09-04', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://wenboom.com/tools', lastmod: '2026-09-04', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://wenboom.com/blueprints', lastmod: '2026-09-04', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://wenboom.com/about', lastmod: '2026-09-04', changefreq: 'monthly', priority: '0.6' },
  { url: 'https://wenboom.com/privacy-policy', lastmod: '2026-09-04', changefreq: 'yearly', priority: '0.3' },
  { url: 'https://wenboom.com/cookie-policy', lastmod: '2026-09-04', changefreq: 'yearly', priority: '0.3' },
  { url: 'https://wenboom.com/terms-of-service', lastmod: '2026-09-04', changefreq: 'yearly', priority: '0.3' },
  { url: 'https://wenboom.com/llms.txt', lastmod: '2026-09-04', changefreq: 'monthly', priority: '0.4' },
  { url: 'https://wenboom.com/llms-full.json', lastmod: '2026-09-04', changefreq: 'monthly', priority: '0.4' }
];

function renderUrl(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  const publishedArticles = articles.filter(a => a.status === 'published');
  const publishedPillars = pillars.filter(p => p.status === 'published');

  const staticXml = staticPages
    .map(p => renderUrl(p.url, p.lastmod, p.changefreq, p.priority))
    .join('\n');

  const pillarXml = publishedPillars
    .map(p => renderUrl(p.url, '2026-09-04', 'monthly', '0.8'))
    .join('\n');

  const articleXml = publishedArticles
    .map(a => renderUrl(a.url, a.updatedDate, 'monthly', '0.8'))
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${pillarXml}
${articleXml}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
