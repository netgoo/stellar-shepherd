// src/pages/api/v1/benchmarks.json.ts
// Machine-readable benchmark data endpoint.
// Sources all pillar benchmarkDetail from SSOT (src/data/articles.ts).
// Used by AI agents, GEO systems, and programmatic benchmark consumers.
// V4.1: New endpoint per SEO V4.0 infrastructure audit (P0 issue #1).

export const prerender = false;

import type { APIRoute } from 'astro';
import { pillars } from '../../../data/articles';

export const GET: APIRoute = async () => {
  const publishedPillars = pillars.filter(p => p.status === 'published');

  const benchmarks = publishedPillars.map(p => ({
    pillar: p.pillar,
    slug: p.slug,
    name: p.name,
    shortTitle: p.shortTitle,
    url: p.url,
    tools: p.tools,
    metrics: p.metrics,
    benchmarkDetail: p.benchmarkDetail
  }));

  const response = {
    endpoint: '/api/v1/benchmarks.json',
    generatedAt: new Date().toISOString(),
    version: '1.0',
    source: 'src/data/articles.ts (SSOT)',
    count: benchmarks.length,
    benchmarks
  };

  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
};
