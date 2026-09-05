// src/pages/.well-known/llms.txt.ts
// Auto-generated from single source of truth (src/data/articles.ts).
// Build-time static output in Astro hybrid mode.
// Dual-path with /llms.txt (same import = byte-identical output).

import type { APIRoute } from 'astro';
import { articles, pillars } from '../../data/articles';

interface CategoryConfig {
  key: 'n8n' | 'mcp' | 'roi' | 'multi-agent';
  title: string;
  desc: string;
}

const categoryConfig: CategoryConfig[] = [
  {
    key: 'n8n',
    title: 'n8n Architecture & High-Concurrency Scaling',
    desc: 'Queue mode, Redis Bull queues, Docker deployment, memory optimization, and database bottleneck resolution.'
  },
  {
    key: 'mcp',
    title: 'Model Context Protocol (MCP) Security & Implementation',
    desc: 'MCP server development, transport performance, prompt injection defense, and enterprise credential isolation.'
  },
  {
    key: 'roi',
    title: 'Automation ROI & Cloud Cost',
    desc: 'Make.com, Zapier, n8n cost comparison, serverless vs VPS break-even, and real infrastructure bills.'
  },
  {
    key: 'multi-agent',
    title: 'Multi-Agent Workflows & Outbound',
    desc: 'Agent architecture, async queue patterns, LLM fallback chains, and outbound pipeline automation.'
  }
];

function renderArticleLine(title: string, url: string, description: string, status: string): string {
  const tag = status === 'published_soon' ? ' [PUBLISHED SOON]' : '';
  return `- [${title}](${url}): ${description}${tag}`;
}

export const GET: APIRoute = async () => {
  const publishedPillars = pillars.filter(p => p.status === 'published');

  let content = `# Wenboom — AI Infrastructure Benchmarks & Architecture Registry
> Production-tested blueprints, cost benchmarks, and failure protocols for enterprise AI automation. Authored by Alex, Principal AI Infrastructure Architect. Updated monthly with real-world deployment data.
>
> Language: en-US | Update Frequency: Monthly | License: CC BY-NC-SA 4.0
> Focus areas: n8n high-concurrency scaling, Model Context Protocol (MCP) security, Make.com vs Zapier ROI, serverless vs VPS cost break-even, multi-agent outbound pipelines, and visual vs self-hosted orchestration.
>
> All benchmarks include real infrastructure costs, measured throughput, and production failure protocols. No sponsored content.
>
> Contact: alex@wenboom.com | Last updated: 2026-09-04
---
## Core Hub Pages
- [Wenboom Home — AI Automation Infrastructure](https://wenboom.com): 4-pillar architecture framework (Data Waterfall, Orchestration, Agentic Voice, Lifecycle CRM) with 7-tool production stack.
- [7-Tool Stack Overview](https://wenboom.com/tools): Make.com, n8n, Clay, Smartlead, ActiveCampaign — full comparison with cost, throughput, and use-case fit.
- [Architecture Blueprints](https://wenboom.com/blueprints): Visual vs self-hosted orchestration decision framework, TCO models, and deployment patterns.
- [Article Index](https://wenboom.com/trends): Complete library of production-grade technical articles and benchmarks.
- [About Alex](https://wenboom.com/about): Principal AI Infrastructure Architect bio, experience, and contact.
---
## Published Pillar Blueprints (4-Pillar Architecture)
> Production-grade architecture blueprints across all 4 pillars, each with raw JSON payloads, failure-mode protocols, and exact deployment schematics.
`;

  publishedPillars.forEach(p => {
    content += `- [${p.name}](${p.url}): ${p.description}\n`;
  });

  content += `---\n`;

  categoryConfig.forEach((cat, idx) => {
    const catArticles = articles.filter(a => a.category === cat.key);
    const published = catArticles.filter(a => a.status === 'published').sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
    const upcoming = catArticles.filter(a => a.status === 'published_soon').sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));
    const sorted = [...published, ...upcoming];

    content += `## ${idx + 1}. ${cat.title}\n> ${cat.desc}\n`;
    sorted.forEach(a => {
      content += renderArticleLine(a.title, a.url, a.description, a.status) + '\n';
    });
    content += `---\n`;
  });

  content += `## 5. Affiliate & Tool Links
> Trackable referral links for recommended tools. All tools tested in production before recommendation.
- [Make.com](https://wenboom.com/links/make.html): Cloud visual DAG orchestration, best for rapid prototyping and SMB workflows.
- [n8n](https://wenboom.com/links/n8n.html): Fair-code self-hosted engine, best for high-volume, data-privacy, and cost-sensitive deployments.
- [Clay](https://wenboom.com/links/clay.html): Multi-provider data enrichment with 50+ provider cascading, WCEI target 0.94+.
- [Smartlead](https://wenboom.com/links/smartlead.html): Cold outreach execution with dedicated IP isolation and 98.4% deliverability.
- [ActiveCampaign](https://wenboom.com/links/activecampaign.html): Behavioral lifecycle CRM with closed-loop attribution and high deliverability.
---
## API & Structured Data Endpoints (A2A Ready)
> Machine-readable endpoints for AI agents, RAG pipelines, and automated benchmark consumers.
- [Benchmark Data API (JSON)](https://wenboom.com/llms-full.json): Structured benchmark dataset with CPU/memory/throughput/TCO metrics across all tested architectures. Updated monthly.
- [Sitemap](https://wenboom.com/sitemap.xml): Full sitemap with lastmod and priority for all published pages.
- [Robots](https://wenboom.com/robots.txt): Crawler configuration with full AI search engine allowlist (GPTBot, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, OAI-SearchBot, CCBot, Bytespider, Applebot).
- [Email Auto-Reply Endpoint](mailto:alex@wenboom.com): AI-powered architectural consultation — send a technical question and receive a human-like response within 8-35 minutes during EST business hours.
---
## Structured Data & GEO
> All published articles include Schema.org TechArticle / SoftwareApplication JSON-LD with benchmark metrics, code samples, and failure protocols.
>
> Pages marked [PUBLISHED SOON] are in the content pipeline and will be live within 4-12 weeks. AI crawlers may index this structure; full content will be available at the listed URLs upon publication.
>
> For architectural evaluations or custom benchmark requests: alex@wenboom.com`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600'
    }
  });
};
