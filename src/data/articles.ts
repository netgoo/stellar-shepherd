// src/data/articles.ts
// Single Source of Truth for all article and pillar blueprint metadata.
// All machine-readable endpoints (llms.txt, llms-full.json, sitemap.xml)
// and static HTML list pages (trends, index, blueprints, tools) import from here.
// TypeScript interface enforces required fields at build time.

export interface Article {
  slug: string;
  url: string;
  title: string;
  description: string;
  category: 'n8n' | 'mcp' | 'roi' | 'multi-agent' | 'architecture';
  cluster: 'A' | 'B' | 'C';
  channel: 'failure' | 'data' | 'orchestration' | 'voice';
  metaTag: string;
  status: 'published' | 'published_soon';
  publishedDate: string;
  updatedDate: string;
  metrics?: Record<string, string>;
  tools?: string[];
}

export interface BenchmarkDetail {
  testEnvironment: Record<string, string>;
  architecture: Record<string, string>;
  failureModes: { mode: string; fix: string }[];
}

export interface Pillar {
  slug: string;
  url: string;
  name: string;
  shortTitle: string;
  pillar: '01' | '02' | '03' | '04';
  tools: string[];
  status: 'published' | 'published_soon';
  metrics: Record<string, string>;
  description: string;
  benchmarkDetail: BenchmarkDetail;
}

export interface Tool {
  name: string;
  slug: string;
  pillar: '01' | '02' | '03' | '04';
  role: string;
  description: string;
  metrics: string[];
  bestFor: string;
  notFor: string;
  affiliateLink: string | null;
  ctaText: string;
}

export const articles: Article[] = [
  // ===== PUBLISHED ARTICLES (6) =====
  {
    slug: 'mcp-data-poisoning-security',
    url: 'https://wenboom.com/trends/mcp-data-poisoning-security',
    title: 'Eradicating Data Poisoning in Multi-Agent Outbound Systems',
    description: 'Deterministic dedup keys, schema validation gates, and WCEI 0.94+ multi-provider waterfall routing to eliminate hallucinated leads, duplicate cross-contamination, and domain reputation burn. Covers 4 production failure modes with deterministic fixes.',
    category: 'mcp',
    cluster: 'A',
    channel: 'failure',
    metaTag: 'FAILURE PROTOCOL • DATA INTEGRITY',
    status: 'published',
    publishedDate: '2026-08-15',
    updatedDate: '2026-09-05',
    metrics: { wcei: '0.94+', duplicateRate: '0.01%', failureModes: '4' },
    tools: ['Clay', 'Smartlead']
  },
  {
    slug: 'serverless-vs-vps-2026-cloud-cost-roi',
    url: 'https://wenboom.com/trends/serverless-vs-vps-2026-cloud-cost-roi',
    title: 'Serverless vs VPS in 2026: The Hard-Data Cost & Latency Blueprint',
    description: 'Hybrid edge architecture with RLRP cold-start resilience (sub-50ms P99), PgBouncer connection pooling, and 4 production failure protocols—cold-start timeout, connection pool exhaustion, execution limit kill, and regional outage cascading.',
    category: 'roi',
    cluster: 'B',
    channel: 'failure',
    metaTag: 'FAILURE PROTOCOL • CLOUD INFRASTRUCTURE',
    status: 'published',
    publishedDate: '2026-08-20',
    updatedDate: '2026-09-05',
    metrics: { p99Latency: '<50ms', breakEven: '150k invocations/month', workloadMemory: '512MB' },
    tools: ['AWS Lambda', 'Hetzner', 'DigitalOcean', 'n8n']
  },
  {
    slug: 'beyond-saas-multi-agent-outbound-pipeline',
    url: 'https://wenboom.com/trends/beyond-saas-multi-agent-outbound-pipeline',
    title: 'Beyond SaaS: Deploying Multi-Agent Systems in Cold Outbound Pipelines',
    description: '3-tier agent mesh architecture with WCEI-optimized Clay enrichment and Smartlead zero-drop delivery. Achieves 98.4% deliverability vs 81.2% for legacy SaaS stacks, with 4 production failure protocols and ICP qualification JSON schema.',
    category: 'multi-agent',
    cluster: 'A',
    channel: 'data',
    metaTag: 'AGENTIC WORKFLOW • CLUSTER A',
    status: 'published',
    publishedDate: '2026-08-10',
    updatedDate: '2026-09-05',
    metrics: { deliverability: '98.4%', wcei: '0.94+', costPer10kLeads: '$320' },
    tools: ['Clay', 'Smartlead']
  },
  {
    slug: 'mcp-protocol-enterprise-impact',
    url: 'https://wenboom.com/trends/mcp-protocol-enterprise-impact',
    title: 'The 10-Year Paradigm Shift: Embracing Model Context Protocol (MCP)',
    description: 'Why custom REST APIs are dying and how the Zero-Glue Theorem eliminates 14-22% agent failure rates via localized LLM communication protocol layers. Covers MCP server architecture, client-server negotiation, and enterprise migration roadmap.',
    category: 'mcp',
    cluster: 'A',
    channel: 'data',
    metaTag: 'AGENT PROTOCOL • CLUSTER A',
    status: 'published',
    publishedDate: '2026-08-25',
    updatedDate: '2026-09-05',
    metrics: { restAgentFailureRate: '14-22%', zeroGlueFailureRate: '<2%' },
    tools: ['Model Context Protocol']
  },
  {
    slug: 'make-vs-zapier-2026-roi',
    url: 'https://wenboom.com/trends/make-vs-zapier-2026-roi',
    title: 'Make vs. Zapier: Hard Financial ROI & Architecture Analysis',
    description: '83.4% overhead reduction at 500k monthly executions ($266/mo vs $2,399/mo). Visual DAG vs linear chains, 4 production failure protocols, and n8n self-hosted alternative for engineering teams needing full determinism.',
    category: 'roi',
    cluster: 'B',
    channel: 'orchestration',
    metaTag: 'COST BENCHMARK • CLUSTER B',
    status: 'published',
    publishedDate: '2026-08-05',
    updatedDate: '2026-09-05',
    metrics: { overheadReduction: '83.4%', makeProMonthly: '$9', zapierProMonthly: '$29.99', n8nMonthly: '$20' },
    tools: ['Make.com', 'Zapier', 'n8n']
  },
  {
    slug: 'make-vs-zapier-2026-roi-v2',
    url: 'https://wenboom.com/trends/make-vs-zapier-2026-roi-v2',
    title: 'Make vs. Zapier: Zero-Code MCP Bridge & Semantic Gateway',
    description: 'Zero-Glue Theorem applied to orchestration. Production MCP bridge JSON schema for HubSpot to Clay to Smartlead, saga compensation transactions, and SMB semantic gateway architecture with n8n self-hosted TCO analysis.',
    category: 'roi',
    cluster: 'B',
    channel: 'orchestration',
    metaTag: 'MCP BRIDGE • CLUSTER B',
    status: 'published',
    publishedDate: '2026-08-28',
    updatedDate: '2026-09-05',
    metrics: { bridgePattern: 'MCP JSON schema', compensation: 'Saga transactions', gateway: 'SMB semantic gateway' },
    tools: ['Make.com', 'n8n', 'Clay', 'Smartlead']
  },
  // ===== PUBLISHED SOON — n8n (4) =====
  {
    slug: 'n8n-queue-mode-docker-compose-redis',
    url: 'https://wenboom.com/trends/n8n-queue-mode-docker-compose-redis',
    title: 'n8n Queue Mode Docker Compose & Redis Setup',
    description: 'Complete docker-compose with Redis Bull queue, worker scaling, EXECUTIONS_MODE=queue configuration, and N8N_ENCRYPTION_KEY migration for multi-worker setups. Achieves 1,200 req/sec on $20/mo Hetzner VPS.',
    category: 'n8n',
    cluster: 'B',
    channel: 'orchestration',
    metaTag: 'N8N SCALING • CLUSTER B',
    status: 'published_soon',
    publishedDate: '2026-10-01',
    updatedDate: '2026-09-04',
    metrics: { throughput: '1,200 req/sec', monthlyCost: '$20', workers: '4' },
    tools: ['n8n', 'Redis', 'Postgres']
  },
  {
    slug: 'n8n-webhook-response-relay-size-fix',
    url: 'https://wenboom.com/trends/n8n-webhook-response-relay-size-fix',
    title: 'n8n Webhook Response Relay Size Fix',
    description: 'Resolving 64MB buffer limits, memory overflow during high concurrency, and webhook payload size optimization.',
    category: 'n8n',
    cluster: 'B',
    channel: 'failure',
    metaTag: 'FAILURE PROTOCOL • N8N',
    status: 'published_soon',
    publishedDate: '2026-10-15',
    updatedDate: '2026-09-04',
    metrics: { bufferLimit: '64MB' },
    tools: ['n8n']
  },
  {
    slug: 'n8n-postgres-vs-sqlite-queue-mode-benchmark',
    url: 'https://wenboom.com/trends/n8n-postgres-vs-sqlite-queue-mode-benchmark',
    title: 'n8n Postgres vs SQLite Queue Mode Benchmark',
    description: 'IOPS limits, index tuning, and throughput comparison at 1M+ executions. Postgres connection pooling with PgBouncer.',
    category: 'n8n',
    cluster: 'B',
    channel: 'orchestration',
    metaTag: 'BENCHMARK • N8N',
    status: 'published_soon',
    publishedDate: '2026-11-01',
    updatedDate: '2026-09-04',
    metrics: { executions: '1M+', pooling: 'PgBouncer' },
    tools: ['n8n', 'Postgres', 'PgBouncer']
  },
  {
    slug: 'n8n-vs-temporal-vs-windmill-orchestration',
    url: 'https://wenboom.com/trends/n8n-vs-temporal-vs-windmill-orchestration',
    title: 'n8n vs Temporal vs Windmill Orchestration 2026',
    description: 'Developer-perspective comparison of three workflow engines — visual DAG vs code-first, cost model, scalability, and ecosystem maturity.',
    category: 'n8n',
    cluster: 'B',
    channel: 'orchestration',
    metaTag: 'COMPARISON • ORCHESTRATION',
    status: 'published_soon',
    publishedDate: '2026-11-15',
    updatedDate: '2026-09-04',
    tools: ['n8n', 'Temporal', 'Windmill']
  },
  // ===== PUBLISHED SOON — MCP (4) =====
  {
    slug: 'mcp-tool-poisoning-prevention-architecture',
    url: 'https://wenboom.com/trends/mcp-tool-poisoning-prevention-architecture',
    title: 'MCP Tool Poisoning Prevention Architecture',
    description: 'Threat models for malicious tool descriptions, validation schema defense code, and prompt injection countermeasures for MCP servers.',
    category: 'mcp',
    cluster: 'A',
    channel: 'failure',
    metaTag: 'SECURITY • MCP',
    status: 'published_soon',
    publishedDate: '2026-10-01',
    updatedDate: '2026-09-04',
    tools: ['Model Context Protocol']
  },
  {
    slug: 'mcp-stdio-vs-sse-transport-latency',
    url: 'https://wenboom.com/trends/mcp-stdio-vs-sse-transport-latency',
    title: 'MCP stdio vs SSE Transport Performance',
    description: 'LAN vs cross-network latency benchmarks, connection overhead, and transport selection criteria for local vs remote MCP servers.',
    category: 'mcp',
    cluster: 'A',
    channel: 'architecture',
    metaTag: 'BENCHMARK • MCP',
    status: 'published_soon',
    publishedDate: '2026-10-15',
    updatedDate: '2026-09-04',
    metrics: { stdioLatencyLan: '<5ms', sseLatencyCrossNetwork: '50-200ms' },
    tools: ['Model Context Protocol']
  },
  {
    slug: 'convert-rest-api-to-mcp-server',
    url: 'https://wenboom.com/trends/convert-rest-api-to-mcp-server',
    title: 'REST API to MCP Server Conversion',
    description: 'TypeScript and Python boilerplate using @modelcontextprotocol/sdk for wrapping legacy REST endpoints into standard MCP servers.',
    category: 'mcp',
    cluster: 'A',
    channel: 'architecture',
    metaTag: 'TUTORIAL • MCP',
    status: 'published_soon',
    publishedDate: '2026-11-01',
    updatedDate: '2026-09-04',
    tools: ['Model Context Protocol', 'TypeScript', 'Python']
  },
  {
    slug: 'mcp-protocol-security-audit-checklist',
    url: 'https://wenboom.com/trends/mcp-protocol-security-audit-checklist',
    title: 'MCP Protocol Security Audit Checklist',
    description: 'SOC2-aligned MCP deployment security review — session isolation, credential scoping, input validation, and audit logging.',
    category: 'mcp',
    cluster: 'A',
    channel: 'failure',
    metaTag: 'SECURITY • MCP',
    status: 'published_soon',
    publishedDate: '2026-11-15',
    updatedDate: '2026-09-04',
    tools: ['Model Context Protocol']
  },
  // ===== PUBLISHED SOON — ROI (2) =====
  {
    slug: 'make-com-enterprise-overage-pricing-calculation',
    url: 'https://wenboom.com/trends/make-com-enterprise-overage-pricing-calculation',
    title: 'Make.com Enterprise Overage Pricing Calculation',
    description: 'Formula-driven overage cost prediction, operation counting methodology, and cost optimization strategies for high-volume scenarios.',
    category: 'roi',
    cluster: 'B',
    channel: 'orchestration',
    metaTag: 'COST • MAKE.COM',
    status: 'published_soon',
    publishedDate: '2026-10-01',
    updatedDate: '2026-09-04',
    tools: ['Make.com']
  },
  {
    slug: 'hetzner-vs-digitalocean-vs-aws-n8n-docker',
    url: 'https://wenboom.com/trends/hetzner-vs-digitalocean-vs-aws-n8n-docker',
    title: 'Hetzner vs DigitalOcean vs AWS for n8n Docker',
    description: 'CPU/IOPS/bandwidth benchmarks and price-performance ranking for n8n self-hosted deployment.',
    category: 'roi',
    cluster: 'B',
    channel: 'architecture',
    metaTag: 'BENCHMARK • CLOUD',
    status: 'published_soon',
    publishedDate: '2026-10-15',
    updatedDate: '2026-09-04',
    metrics: { hetznerMonthly: '$20' },
    tools: ['Hetzner', 'DigitalOcean', 'AWS', 'n8n']
  },
  // ===== PUBLISHED SOON — Multi-Agent (2) =====
  {
    slug: 'async-ai-agent-architecture-queue-storage-redis',
    url: 'https://wenboom.com/trends/async-ai-agent-architecture-queue-storage-redis',
    title: 'Async AI Agent Queue Architecture',
    description: 'State persistence, Redis queue management, and idempotent execution patterns for production asynchronous agent systems.',
    category: 'multi-agent',
    cluster: 'A',
    channel: 'architecture',
    metaTag: 'ARCHITECTURE • AGENTS',
    status: 'published_soon',
    publishedDate: '2026-10-01',
    updatedDate: '2026-09-04',
    tools: ['Redis']
  },
  {
    slug: 'openrouter-fallback-chain-groq-gemini-deepseek',
    url: 'https://wenboom.com/trends/openrouter-fallback-chain-groq-gemini-deepseek',
    title: 'LLM API Fallback Chain',
    description: 'Try-catch multi-provider degradation logic — Groq to Gemini to DeepSeek fallback with latency-based routing and cost optimization.',
    category: 'multi-agent',
    cluster: 'A',
    channel: 'architecture',
    metaTag: 'RELIABILITY • LLM',
    status: 'published_soon',
    publishedDate: '2026-10-15',
    updatedDate: '2026-09-04',
    tools: ['Groq', 'Gemini', 'DeepSeek', 'OpenRouter']
  }
];

export const pillars: Pillar[] = [
  {
    slug: 'data-waterfall-infrastructure',
    url: 'https://wenboom.com/blueprints/data-waterfall-infrastructure',
    name: 'Pillar 01: Data Waterfall & Cold Enrichment Architecture',
    shortTitle: 'Data Waterfall & Enrichment',
    pillar: '01',
    tools: ['Clay', 'Smartlead'],
    status: 'published',
    metrics: { deliverability: '98.4%', wcei: '0.94+', costPer10kLeads: '$320', enrichmentProviders: '50+' },
    description: '4-tier cascading enrichment across 50+ providers with conditional fallback logic. WCEI optimization from 0.62 to 0.94+, strict SMTP handshake verification, and Smartlead zero-drop delivery with dedicated IP warmup.',
    benchmarkDetail: {
      testEnvironment: {
        leadVolume: '50,000 monthly leads',
        enrichmentProviders: '50+',
        testedAt: '2026-08'
      },
      architecture: {
        tiers: '4',
        fallbackLogic: 'conditional cascading',
        dedupMethod: 'SHA-256 deterministic keys',
        ipWarmup: 'dedicated IP rotation',
        smtpVerification: 'strict handshake validation'
      },
      failureModes: [
        { mode: 'Enrichment timeout (504)', fix: 'RLRP exponential backoff, 500ms initial, max 32s, 5 retries' },
        { mode: 'Duplicate cross-contamination', fix: 'Deterministic dedup keys before Smartlead injection' },
        { mode: 'Domain reputation burn', fix: 'SMTP handshake verification + dedicated IP warmup schedule' },
        { mode: 'Credit waste on low-quality leads', fix: 'WCEI-optimized provider routing, threshold 0.94, quarantine queue' }
      ]
    }
  },
  {
    slug: 'visual-vs-self-hosted-orchestration',
    url: 'https://wenboom.com/blueprints/visual-vs-self-hosted-orchestration',
    name: 'Pillar 02: Visual vs Self-Hosted Orchestration',
    shortTitle: 'Orchestration & Cost Control',
    pillar: '02',
    tools: ['Make.com', 'n8n', 'PgBouncer'],
    status: 'published',
    metrics: { tcoReduction: '83.4%', p99Latency: '<50ms', connectionPooling: 'PgBouncer', benchmarkExecutions: '500k/month' },
    description: 'Hybrid Make + self-hosted n8n topology enforcing the Zero-Glue Theorem. Make handles visual webhooks and SaaS triggers; n8n worker cluster behind PgBouncer handles bulk enrichment.',
    benchmarkDetail: {
      testEnvironment: {
        executionVolume: '500,000 monthly executions',
        vps: 'Hetzner CX22',
        vpsSpecs: '4 vCPU / 8GB RAM',
        vpsMonthlyCost: '$20',
        testedAt: '2026-08'
      },
      architecture: {
        pattern: 'hybrid Make + self-hosted n8n',
        makeRole: 'visual webhooks and SaaS triggers',
        n8nRole: 'worker cluster behind PgBouncer for bulk enrichment',
        theorem: 'Zero-Glue Theorem, native protocol boundaries'
      },
      failureModes: [
        { mode: 'Connection pool exhaustion', fix: 'PgBouncer transaction pooling, max 20 client connections' },
        { mode: 'Rate-limit cascade (429)', fix: 'RLRP warmup + circuit breaker + quarantine queue' },
        { mode: 'Cold start timeout', fix: 'RLRP warmup pool, keep-alive connections, <50ms P99' },
        { mode: 'Execution limit kill', fix: 'Worker queue mode, Redis Bull, horizontal scaling to 4 workers' }
      ]
    }
  },
  {
    slug: 'production-ai-agentic-architecture',
    url: 'https://wenboom.com/blueprints/production-ai-agentic-architecture',
    name: 'Pillar 03: AI Voice Agent Infrastructure',
    shortTitle: 'Agentic Voice & Real-Time Flow',
    pillar: '03',
    tools: ['Voiceflow', 'Bland AI'],
    status: 'published',
    metrics: { endToEndLatency: '640ms', callCompletionRate: '89.2%', costPerMinute: '$0.09', latencySla: 'sub-800ms' },
    description: 'Real-Time Latency Bridge pairing Voiceflow visual dialogue state machines with Bland AI PSTN telephony execution. Sub-800ms latency SLA enforcement, real-time payload sanitization, and async CRM telemetry sync.',
    benchmarkDetail: {
      testEnvironment: {
        latencySla: 'sub-800ms',
        testedAt: '2026-08'
      },
      architecture: {
        pattern: 'Real-Time Latency Bridge',
        voiceflowRole: 'visual dialogue state machine orchestration',
        blandRole: 'PSTN telephony execution via dynamic custom webhooks',
        payloadSanitization: 'real-time input validation and sanitization',
        fillerStrategy: 'pre-buffered filler phrases for latency spike resilience'
      },
      failureModes: [
        { mode: 'Latency spike above SLA', fix: 'Pre-buffered filler phrases + async CRM telemetry sync' },
        { mode: 'Payload injection via webhook', fix: 'Real-time payload sanitization and schema validation gates' },
        { mode: 'Call drop mid-conversation', fix: 'max_duration hard caps + live transfer protocol fallback' },
        { mode: 'Context loss between turns', fix: 'Voiceflow conversation state machine persistence' }
      ]
    }
  },
  {
    slug: 'b2b-lifecycle-revenue-crm',
    url: 'https://wenboom.com/blueprints/b2b-lifecycle-revenue-crm',
    name: 'Pillar 04: Enterprise Lead Lifecycle & CRM Sync',
    shortTitle: 'Lifecycle Revenue CRM',
    pillar: '04',
    tools: ['ActiveCampaign', 'n8n', 'Redis'],
    status: 'published',
    metrics: { duplicateContactRate: '0.01%', stateCorruption: '0/month', apiFailureRate: '0.02%', idempotency: 'SHA-256 tokens' },
    description: 'Deterministic State Machine Engine enforcing single-source-of-truth updates in ActiveCampaign via SHA-256 idempotency tokens. Monotonic lifecycle state transition validation, Dead Letter Queue for out-of-order events.',
    benchmarkDetail: {
      testEnvironment: {
        testedAt: '2026-08'
      },
      architecture: {
        pattern: 'Deterministic State Machine Engine',
        crmRole: 'ActiveCampaign single-source-of-truth updates',
        idempotency: 'SHA-256 idempotency tokens on all write operations',
        stateValidation: 'monotonic lifecycle state transition validation',
        deadLetterQueue: 'out-of-order event quarantine and replay',
        raceConditionPrevention: 'Redis atomic locks'
      },
      failureModes: [
        { mode: 'Duplicate contact creation', fix: 'SHA-256 idempotency tokens + deterministic dedup keys' },
        { mode: 'Out-of-order lifecycle events', fix: 'Dead Letter Queue + monotonic state transition validation' },
        { mode: 'Race condition on concurrent updates', fix: 'Redis atomic locks before ActiveCampaign write' },
        { mode: 'API failure during sync', fix: 'RLRP circuit breaker + retry with exponential backoff' }
      ]
    }
  }
];

export const tools: Tool[] = [
  {
    name: 'Clay',
    slug: 'clay',
    pillar: '01',
    role: 'Data Intelligence',
    description: 'Programmatic multi-provider lead enrichment engine. Combines 50+ data providers into a unified waterfall schema, automatically qualifies leads, and scores prospects via semantic modeling. The core data layer for any high-volume outbound pipeline.',
    metrics: ['WCEI 0.94+ across 50+ providers', '$320 cost per 10k leads'],
    bestFor: 'Agencies and outbound teams needing multi-provider enrichment at scale, ICP qualification automation, and dedup pipelines.',
    notFor: 'Teams with under 5k records/month where single-vendor enrichment suffices, or teams needing on-premise data residency.',
    affiliateLink: '/links/clay.html',
    ctaText: 'Deploy Clay Enrichment Stack &rarr;'
  },
  {
    name: 'Smartlead',
    slug: 'smartlead',
    pillar: '01',
    role: 'Outbound Engine',
    description: 'Dedicated IP warmup protocols, multi-account rotation, and zero-drop webhook outreach infrastructure. The delivery layer that ensures enriched leads actually reach the inbox without burning domain reputation.',
    metrics: ['98.4% deliverability rate', 'Zero-drop webhook triggers'],
    bestFor: 'High-volume outbound teams needing multi-account rotation, dedicated IP warmup, and API-driven campaign management.',
    notFor: 'Teams sending under 1k emails/month, or teams requiring built-in CRM with full lifecycle automation (use ActiveCampaign instead).',
    affiliateLink: '/links/smartlead.html',
    ctaText: 'Deploy Smartlead Outbound Engine &rarr;'
  },
  {
    name: 'Make.com',
    slug: 'make',
    pillar: '02',
    role: 'Visual Middleware',
    description: 'Deterministic visual middleware builder for array aggregation, complex conditional branching, and custom API nesting. The visual DAG orchestrator that processes multi-destination routing as single operations, eliminating the per-task tax of linear chains.',
    metrics: ['83.4% cost reduction vs Zapier at 500k executions', 'Visual DAG with native array handling'],
    bestFor: 'Lean teams needing complex multi-app logic, array aggregation, and visual scenario building without engineering overhead.',
    notFor: 'Teams running 100k+ daily executions needing full data residency control, or teams requiring unlimited concurrency at static cost (use n8n self-hosted).',
    affiliateLink: '/links/make.html',
    ctaText: 'Deploy Make.com Visual Orchestration &rarr;'
  },
  {
    name: 'n8n (Self-Hosted)',
    slug: 'n8n',
    pillar: '02',
    role: 'High Concurrency',
    description: 'Dedicated worker-node orchestration engineered for unlimited concurrent workflows at static server cost. Self-hosted determinism with full data retention control, PgBouncer connection pooling, and zero vendor lock-in. The heavy-compute layer for production-grade pipelines.',
    metrics: ['Near-zero marginal cost at 100k+ daily executions', 'PgBouncer connection pooling'],
    bestFor: 'Engineering-led teams needing self-hosted determinism, high concurrency, full auditability, and static cost predictability.',
    notFor: 'Non-technical teams without server management capability, or teams needing fully managed hosting with SLA guarantees (use Make.com).',
    affiliateLink: null,
    ctaText: 'Explore Pillar 02 Orchestration Blueprint &rarr;'
  },
  {
    name: 'Voiceflow',
    slug: 'voiceflow',
    pillar: '03',
    role: 'Agentic Logic',
    description: 'Visual conversation flow orchestrator for complex conversational state machines and multi-turn context retention. The dialogue logic layer that powers AI voice agents with structured branching, variable management, and integration hooks.',
    metrics: ['Multi-turn conversational state management', '640ms latency with Bland.ai bridge'],
    bestFor: 'Teams building AI voice agents, conversational IVRs, or multi-turn qualification flows needing visual dialogue design and context retention.',
    notFor: 'Teams needing a full telephony carrier with SIP trunking (use Bland.ai), or teams needing simple one-way voice broadcasts without dialogue logic.',
    affiliateLink: null,
    ctaText: 'Explore Pillar 03 Voice Blueprint &rarr;'
  },
  {
    name: 'Bland.ai',
    slug: 'bland',
    pillar: '03',
    role: 'Voice Automation',
    description: 'Ultra-low-latency real-time phone dispatch API with dynamic custom webhook responses and live transfers. The telephony execution layer that turns Voiceflow dialogue logic into actual phone calls with sub-800ms response latency.',
    metrics: ['640ms end-to-end voice latency', '89.2% call completion rate'],
    bestFor: 'Teams needing automated inbound/outbound voice agents, real-time call routing, and API-driven telephony at scale.',
    notFor: 'Teams needing visual dialogue design without coding (use Voiceflow), or teams needing traditional call center software with agent desktops.',
    affiliateLink: null,
    ctaText: 'Explore Pillar 03 Voice Blueprint &rarr;'
  },
  {
    name: 'ActiveCampaign',
    slug: 'activecampaign',
    pillar: '04',
    role: 'Lifecycle CRM',
    description: 'High-deliverability lifecycle CRM for automated behavioral retention, lead scoring, and revenue attribution. The closed-loop layer that syncs enriched outbound leads into nurture pools without state loss, converting cold outreach into recurring revenue.',
    metrics: ['0.01% duplicate contact rate', 'Closed-loop lead attribution &amp; scoring'],
    bestFor: 'B2B teams needing lifecycle automation, behavioral lead scoring, and closed-loop attribution from cold outreach to customer retention.',
    notFor: 'Teams needing a pure outbound sending engine (use Smartlead), or teams needing enterprise-grade sales CRM with full pipeline management (use a dedicated CRM).',
    affiliateLink: null,
    ctaText: 'Explore Pillar 04 CRM Blueprint &rarr;'
  }
];

// Derived helpers
export const publishedArticles = articles.filter(a => a.status === 'published');
export const publishedSoonArticles = articles.filter(a => a.status === 'published_soon');
export const publishedPillars = pillars.filter(p => p.status === 'published');

export function getArticlesByChannel(channel: Article['channel']): Article[] {
  return articles.filter(a => a.channel === channel);
}

export function getArticlesByCluster(cluster: Article['cluster']): Article[] {
  return articles.filter(a => a.cluster === cluster);
}
