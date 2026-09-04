export const prerender = false;
import type { APIRoute } from 'astro';

// Structured benchmark dataset for AI agents and RAG pipelines
// All metrics derived from internal production testing, updated monthly
const benchmarkData = {
  site: {
    name: "Wenboom",
    url: "https://wenboom.com",
    tagline: "Production-Grade AI Infrastructure Hub",
    description: "Production-tested blueprints, cost benchmarks, and failure protocols for enterprise AI automation.",
    author: {
      name: "Alex",
      title: "Principal AI Infrastructure Architect",
      contact: "alex@wenboom.com"
    },
    lastUpdated: "2026-09-04",
    language: "en-US",
    license: "CC BY-NC-SA 4.0",
    updateFrequency: "monthly"
  },
  coreMetrics: [
    { id: "deliverability", name: "Email Deliverability Rate", value: "98.4%", comparison: "vs 81.2% legacy ESP", category: "outbound" },
    { id: "tco-reduction", name: "TCO Reduction", value: "83.4%", comparison: "at 500k executions/month", category: "cost" },
    { id: "wcei", name: "Waterfall Credit Efficiency Index (WCEI)", value: "0.94+", comparison: "vs 0.62 single-vendor enrichment", category: "data" },
    { id: "voice-latency", name: "Voice Agent Latency", value: "640ms", comparison: "vs 1800ms traditional telephony", category: "voice" },
    { id: "call-completion", name: "Call Completion Rate", value: "89.2%", comparison: "production voice agent benchmark", category: "voice" },
    { id: "voice-cost", name: "Voice Call Cost", value: "$0.09/min", comparison: "per completed minute", category: "cost" },
    { id: "crm-duplicate", name: "CRM Record Duplication Rate", value: "0.01%", comparison: "after waterfall dedup", category: "data" },
    { id: "state-corruption", name: "Workflow State Corruption", value: "0", comparison: "with idempotent execution patterns", category: "reliability" },
    { id: "api-failure", name: "API Failure Rate", value: "0.02%", comparison: "with RLRP circuit breaker", category: "reliability" },
    { id: "cost-per-lead", name: "Cost Per 10k Enriched Leads", value: "$320", comparison: "vs $800 single-provider", category: "cost" },
    { id: "agent-failure", name: "Chained Agent Failure Rate", value: "14-22%", comparison: "REST webhook orchestration", category: "reliability" },
    { id: "cold-start", name: "Cold Start Latency P99", value: "<50ms", comparison: "after RLRP warmup", category: "performance" }
  ],
  architectureBenchmarks: [
    {
      id: "n8n-queue-mode",
      name: "n8n Queue Mode on Hetzner CX22",
      tool: "n8n",
      category: "orchestration",
      metrics: {
        throughput: "1,200 req/sec",
        monthlyCost: "$20",
        vcpu: 2,
        memory: "4GB",
        database: "Postgres + Redis Bull",
        executionMode: "queue"
      },
      configuration: {
        EXECUTIONS_MODE: "queue",
        workers: 4,
        redisVersion: "7.x",
        postgresVersion: "16"
      },
      articleUrl: "https://wenboom.com/trends/n8n-queue-mode-docker-compose-redis",
      status: "published_soon"
    },
    {
      id: "multi-agent-outbound",
      name: "Clay + Smartlead Multi-Agent Outbound Pipeline",
      tools: ["Clay", "Smartlead"],
      category: "outbound",
      metrics: {
        deliverability: "98.4%",
        wcei: "0.94+",
        costPer10kLeads: "$320",
        crmDuplicateRate: "0.01%"
      },
      articleUrl: "https://wenboom.com/trends/beyond-saas-multi-agent-outbound-pipeline",
      status: "published"
    },
    {
      id: "make-vs-zapier-roi",
      name: "Make.com vs Zapier 2026 TCO Comparison",
      tools: ["Make.com", "Zapier", "n8n"],
      category: "cost",
      metrics: {
        makeProMonthly: "$9",
        zapierProfessionalMonthly: "$29.99",
        n8nSelfHostedMonthly: "$20",
        breakEvenOps: "150,000 invocations/month"
      },
      articleUrl: "https://wenboom.com/trends/make-vs-zapier-2026-roi",
      status: "published"
    },
    {
      id: "serverless-vs-vps",
      name: "Serverless vs VPS Cloud Cost Break-Even 2026",
      tools: ["AWS Lambda", "Hetzner", "DigitalOcean"],
      category: "cost",
      metrics: {
        breakEvenInvocations: "150,000/month",
        workloadMemory: "512MB",
        lambdaCostPerMillion: "$0.20 compute + $0.20 requests",
        hetznerVpsMonthly: "$20"
      },
      articleUrl: "https://wenboom.com/trends/serverless-vs-vps-2026-cloud-cost-roi",
      status: "published_soon"
    },
    {
      id: "mcp-transport",
      name: "MCP stdio vs SSE Transport Performance",
      tool: "Model Context Protocol",
      category: "mcp",
      metrics: {
        stdioLatencyLan: "<5ms",
        sseLatencyCrossNetwork: "50-200ms",
        connectionOverhead: "SSE requires persistent HTTP connection"
      },
      articleUrl: "https://wenboom.com/trends/mcp-stdio-vs-sse-transport-latency",
      status: "published_soon"
    },
    {
      id: "visual-vs-code-orchestration",
      name: "Visual vs Code-First Orchestration TCO",
      tools: ["Make.com", "n8n", "Temporal"],
      category: "orchestration",
      metrics: {
        visualBreakEven: "10,000 operations/month",
        codeFirstBreakEven: "100,000 operations/month",
        selfHostedMonthly: "$20"
      },
      articleUrl: "https://wenboom.com/trends/visual-vs-self-hosted-orchestration",
      status: "published_soon"
    }
  ],
  toolStack: [
    { name: "Make.com", category: "Visual Orchestration", affiliateUrl: "https://wenboom.com/links/make.html", freeTier: "1,000 operations/month" },
    { name: "n8n", category: "Self-Hosted Orchestration", affiliateUrl: "https://wenboom.com/links/n8n.html", freeTier: "Unlimited self-hosted" },
    { name: "Clay", category: "Data Enrichment", affiliateUrl: "https://wenboom.com/links/clay.html", freeTier: "Limited credits" },
    { name: "Smartlead", category: "Cold Outreach", affiliateUrl: "https://wenboom.com/links/smartlead.html", freeTier: "Trial" },
    { name: "ActiveCampaign", category: "Lifecycle CRM", affiliateUrl: "https://wenboom.com/links/activecampaign.html", freeTier: "Trial" }
  ],
  endpoints: {
    llmsTxt: "https://wenboom.com/llms.txt",
    llmsFullJson: "https://wenboom.com/llms-full.json",
    sitemap: "https://wenboom.com/sitemap.xml",
    robots: "https://wenboom.com/robots.txt",
    emailAutoReply: "mailto:alex@wenboom.com"
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(benchmarkData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
