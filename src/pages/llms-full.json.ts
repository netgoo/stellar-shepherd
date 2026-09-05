// src/pages/llms-full.json.ts
// Structured benchmark dataset for AI agents and RAG pipelines.
// Auto-generated from single source of truth (src/data/articles.ts).
// Build-time static output in Astro hybrid mode.

import type { APIRoute } from 'astro';
import { articles, pillars, type Article, type Pillar } from '../data/articles';

const pillarCategoryMap: Record<string, string> = {
  '01': 'data-waterfall',
  '02': 'orchestration',
  '03': 'voice',
  '04': 'crm'
};

function mapPillar(p: Pillar) {
  return {
    id: `pillar-${p.pillar}-${p.slug}`,
    name: p.name,
    pillar: p.pillar,
    tools: p.tools,
    category: pillarCategoryMap[p.pillar] || 'uncategorized',
    metrics: p.metrics,
    articleUrl: p.url,
    status: p.status
  };
}

function mapArticle(a: Article) {
  return {
    id: a.slug,
    name: a.title,
    tools: a.tools || [],
    category: a.category,
    cluster: a.cluster,
    channel: a.channel,
    metrics: a.metrics || {},
    articleUrl: a.url,
    status: a.status,
    publishedDate: a.publishedDate,
    updatedDate: a.updatedDate
  };
}

export const GET: APIRoute = async () => {
  const benchmarkData = {
    site: {
      name: 'Wenboom',
      url: 'https://wenboom.com',
      tagline: 'Production-Grade AI Infrastructure Hub',
      description: 'Production-tested blueprints, cost benchmarks, and failure protocols for enterprise AI automation.',
      author: {
        name: 'Alex',
        title: 'Principal AI Infrastructure Architect',
        contact: 'alex@wenboom.com'
      },
      lastUpdated: '2026-09-04',
      language: 'en-US',
      license: 'CC BY-NC-SA 4.0',
      updateFrequency: 'monthly'
    },
    coreMetrics: [
      { id: 'deliverability', name: 'Email Deliverability Rate', value: '98.4%', comparison: 'vs 81.2% legacy ESP', category: 'outbound' },
      { id: 'tco-reduction', name: 'TCO Reduction', value: '83.4%', comparison: 'at 500k executions/month', category: 'cost' },
      { id: 'wcei', name: 'Waterfall Credit Efficiency Index (WCEI)', value: '0.94+', comparison: 'vs 0.62 single-vendor enrichment', category: 'data' },
      { id: 'voice-latency', name: 'Voice Agent Latency', value: '640ms', comparison: 'vs 1800ms traditional telephony', category: 'voice' },
      { id: 'call-completion', name: 'Call Completion Rate', value: '89.2%', comparison: 'production voice agent benchmark', category: 'voice' },
      { id: 'voice-cost', name: 'Voice Call Cost', value: '$0.09/min', comparison: 'per completed minute', category: 'cost' },
      { id: 'crm-duplicate', name: 'CRM Record Duplication Rate', value: '0.01%', comparison: 'after waterfall dedup', category: 'data' },
      { id: 'state-corruption', name: 'Workflow State Corruption', value: '0', comparison: 'with idempotent execution patterns', category: 'reliability' },
      { id: 'api-failure', name: 'API Failure Rate', value: '0.02%', comparison: 'with RLRP circuit breaker', category: 'reliability' },
      { id: 'cost-per-lead', name: 'Cost Per 10k Enriched Leads', value: '$320', comparison: 'vs $800 single-provider', category: 'cost' },
      { id: 'agent-failure', name: 'Chained Agent Failure Rate', value: '14-22%', comparison: 'REST webhook orchestration', category: 'reliability' },
      { id: 'cold-start', name: 'Cold Start Latency P99', value: '<50ms', comparison: 'after RLRP warmup', category: 'performance' }
    ],
    pillarBlueprints: pillars.filter(p => p.status === 'published').map(mapPillar),
    architectureBenchmarks: articles.map(mapArticle),
    toolStack: [
      { name: 'Make.com', category: 'Visual Orchestration', affiliateUrl: 'https://wenboom.com/links/make.html', freeTier: '1,000 operations/month' },
      { name: 'n8n', category: 'Self-Hosted Orchestration', affiliateUrl: 'https://wenboom.com/links/n8n.html', freeTier: 'Unlimited self-hosted' },
      { name: 'Clay', category: 'Data Enrichment', affiliateUrl: 'https://wenboom.com/links/clay.html', freeTier: 'Limited credits' },
      { name: 'Smartlead', category: 'Cold Outreach', affiliateUrl: 'https://wenboom.com/links/smartlead.html', freeTier: 'Trial' },
      { name: 'Voiceflow', category: 'Agentic Voice Logic', affiliateUrl: 'https://wenboom.com/links/voiceflow.html', freeTier: 'Trial' },
      { name: 'Bland.ai', category: 'Voice Telephony API', affiliateUrl: 'https://wenboom.com/links/bland.html', freeTier: 'Pay-per-minute' },
      { name: 'ActiveCampaign', category: 'Lifecycle CRM', affiliateUrl: 'https://wenboom.com/links/activecampaign.html', freeTier: 'Trial' }
    ],
    endpoints: {
      llmsTxt: 'https://wenboom.com/llms.txt',
      llmsFullJson: 'https://wenboom.com/llms-full.json',
      sitemap: 'https://wenboom.com/sitemap.xml',
      robots: 'https://wenboom.com/robots.txt',
      emailAutoReply: 'mailto:alex@wenboom.com'
    }
  };

  return new Response(JSON.stringify(benchmarkData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
