export async function GET(context) {
  const site = context.site || 'https://wenboom.com';

  const items = [
    {
      title: 'Beyond SaaS: Deploying Multi-Agent Systems in Cold Outbound Pipelines',
      link: '/trends/beyond-saas-multi-agent-outbound-pipeline',
      pubDate: '2026-08-30',
      description: '3-tier agent mesh architecture with WCEI-optimized Clay enrichment and Smartlead zero-drop delivery. Achieves 98.4% deliverability vs. 81.2% for legacy SaaS stacks, with 4 production failure protocols and ICP qualification JSON schema.',
      category: 'Cluster A — Data Waterfall'
    },
    {
      title: 'Eradicating Data Poisoning in Multi-Agent Outbound Systems',
      link: '/trends/mcp-data-poisoning-security',
      pubDate: '2026-08-30',
      description: 'Deterministic dedup keys, schema validation gates, and WCEI 0.94+ multi-provider waterfall routing to eliminate hallucinated leads, duplicate cross-contamination, and domain reputation burn in production outbound pipelines.',
      category: 'Cluster A — Data Security'
    },
    {
      title: 'The 10-Year Paradigm Shift: Embracing Model Context Protocol (MCP)',
      link: '/trends/mcp-protocol-enterprise-impact',
      pubDate: '2026-08-30',
      description: 'Why custom REST APIs are dying and how the Zero-Glue Theorem eliminates 14-22% agent failure rates via localized LLM communication protocol layers for all future multi-agent cross-app execution pipelines.',
      category: 'Cluster A — Agent Protocol'
    },
    {
      title: 'Make vs. Zapier: Hard Financial ROI & Architecture Analysis',
      link: '/trends/make-vs-zapier-2026-roi',
      pubDate: '2026-08-30',
      description: '83.4% overhead reduction at 500k monthly executions ($266/mo vs $2,399/mo). Visual DAG vs linear chains, 4 production failure protocols, and n8n self-hosted alternative for engineering teams needing full determinism.',
      category: 'Cluster B — Cost Optimization'
    },
    {
      title: 'Make vs. Zapier: Zero-Code MCP Bridge & Semantic Gateway',
      link: '/trends/make-vs-zapier-2026-roi-v2',
      pubDate: '2026-08-30',
      description: 'Zero-Glue Theorem applied to orchestration. Production MCP bridge JSON schema for HubSpot to Clay to Smartlead, saga compensation transactions, and SMB semantic gateway architecture with n8n self-hosted TCO analysis.',
      category: 'Cluster B — MCP Bridge'
    },
    {
      title: 'Serverless vs VPS in 2026: The Hard-Data Cost & Latency Blueprint',
      link: '/trends/serverless-vs-vps-2026-cloud-cost-roi',
      pubDate: '2026-08-30',
      description: 'Hybrid edge architecture with RLRP cold-start resilience (sub-50ms P99), PgBouncer connection pooling, and n8n self-hosted worker queues. CPU threshold decision matrix: below 18% = serverless, above 45% = VPS.',
      category: 'Cluster B — Infrastructure'
    }
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Wenboom — Production-Grade AI Infrastructure Blueprints</title>
    <link>${site}</link>
    <description>Production-grade AI automation blueprints across 4 pillars—data waterfall, orchestration, voice AI, and lifecycle CRM. Free JSON payloads, failure-mode protocols, and deployment schematics curated by Alex, Principal AI Infrastructure Architect.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <generator>Wenboom Static Feed</generator>
${items.map(item => `    <item>
      <title>${item.title}</title>
      <link>${site}${item.link}</link>
      <guid isPermaLink="true">${site}${item.link}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      <category>${item.category}</category>
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
