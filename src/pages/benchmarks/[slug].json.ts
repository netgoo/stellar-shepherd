// src/pages/benchmarks/[slug].json.ts
// Dynamic benchmark dataset endpoint.
// Generates /benchmarks/[slug].json from pillar.benchmarkDetail in articles.ts.
// New pillar data added to articles.ts automatically reflects here.
import type { APIRoute } from 'astro';
import { pillars } from '../../data/articles';

export const GET: APIRoute = ({ params }) => {
  const slug = params.slug;
  const pillar = pillars.find((p) => p.slug === slug);

  if (!pillar) {
    return new Response(
      JSON.stringify({ error: 'Benchmark dataset not found', slug }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const dataset = {
    id: pillar.slug,
    name: pillar.name,
    version: '2026-09',
    lastUpdated: '2026-09-05',
    author: 'Alex, Principal AI Infrastructure Architect',
    sourceUrl: pillar.url,
    testEnvironment: pillar.benchmarkDetail.testEnvironment,
    metrics: pillar.metrics,
    architecture: pillar.benchmarkDetail.architecture,
    failureModes: pillar.benchmarkDetail.failureModes,
  };

  return new Response(JSON.stringify(dataset, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
