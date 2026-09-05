// src/pages/blueprints.ts
// Master Blueprints hub page. Dynamic generation from articles.ts SSOT.
// 10-section V4.0 layout: Hero, TL;DR, Verdict, Architecture Map,
// Benchmark Dashboard, Comparison Matrix, Pillar Cards, Deep Dives, FAQ, A2A.
import type { APIRoute } from 'astro';
import { articles, pillars, publishedArticles } from '../data/articles';

function getByCluster(cluster: 'A' | 'B' | 'C') {
  return publishedArticles.filter((a) => a.cluster === cluster);
}

function pillarCluster(p: string): 'A' | 'B' | 'C' {
  if (p === '01') return 'A';
  if (p === '02') return 'B';
  return 'C';
}

const faqItems = [
  {
    q: 'What is the Zero-Glue Theorem?',
    a: 'The Zero-Glue Theorem eliminates unstable middleware by connecting system layers through native protocol boundaries instead of custom REST webhooks. This reduces chained agent failure rates from 14-22% to under 2% by removing the glue code that breaks under load.'
  },
  {
    q: 'How does WCEI optimization reduce enrichment costs?',
    a: 'The Waterfall Credit Efficiency Index (WCEI) measures how effectively enrichment provider credits are spent across a 4-tier cascading waterfall. By routing leads through cheaper providers first and only escalating to premium providers when necessary, WCEI improves from 0.62 (single-vendor) to 0.94+, cutting cost per 10k leads from $800 to $320.'
  },
  {
    q: 'When should I choose self-hosted n8n over Make.com?',
    a: 'Choose n8n self-hosted when you exceed 500k monthly executions, need deterministic queue mode with Redis, require PgBouncer connection pooling, or handle sensitive data that cannot pass through third-party SaaS. Make.com wins for visual webhook orchestration and SaaS trigger scenarios under 100k executions. The 2026 production architecture is hybrid: Make for triggers, n8n for bulk processing.'
  },
  {
    q: 'How is the sub-800ms voice latency SLA achieved?',
    a: 'The Real-Time Latency Bridge pairs Voiceflow visual dialogue state machines with Bland AI PSTN telephony execution. End-to-end latency measures 640ms (vs 1800ms traditional) through pre-buffered filler phrases, real-time payload sanitization, and async CRM telemetry sync that does not block the conversation path.'
  },
  {
    q: 'How does the CRM idempotency system prevent duplicates?',
    a: 'The Deterministic State Machine Engine enforces single-source-of-truth updates in ActiveCampaign via SHA-256 idempotency tokens on every write operation. Combined with Redis atomic locks for race condition prevention, monotonic lifecycle state validation, and a Dead Letter Queue for out-of-order events, the system achieves a 0.01% duplicate contact rate and zero state corruption per month.'
  }
];

export const GET: APIRoute = () => {
  const pillarCards = pillars.map((pillar) => {
    const cluster = pillarCluster(pillar.pillar);
    const related = getByCluster(cluster).slice(0, 2);
    const metrics = Object.entries(pillar.metrics).slice(0, 3);
    return `
      <div class="blueprint-card">
        <div>
          <span class="bp-meta">Pillar ${pillar.pillar} — ${pillar.shortTitle}</span>
          <h2>${pillar.name}</h2>
          <p>${pillar.description}</p>
          <div class="bp-tools">Tools: ${pillar.tools.join(' + ')}</div>
          <div class="bp-metrics">
            ${metrics.map(([, v]) => `<span class="bp-metric">${v}</span>`).join('')}
          </div>
          <div class="bp-related">
            <strong>Related Deep Dives:</strong>
            ${related.length > 0
              ? `<ul>${related.map((a) => `<li><a href="/trends/${a.slug}">${a.title}</a></li>`).join('')}</ul>`
              : `<p class="coming-soon-note">Deep dive articles coming Q4 2026</p>`
            }
          </div>
          <p><a href="/benchmarks/${pillar.slug}.json" class="data-hook-link">Download full benchmark dataset (JSON) &darr;</a></p>
        </div>
        <a href="/blueprints/${pillar.slug}" class="bp-btn">Explore Pillar ${pillar.pillar} Blueprint &rarr;</a>
      </div>
    `;
  }).join('');

  const comparisonRows = pillars.map((pillar) => {
    const firstMetric = Object.entries(pillar.metrics)[0];
    return `
      <tr>
        <td><strong>Pillar ${pillar.pillar}</strong><br/>${pillar.shortTitle}</td>
        <td>${pillar.description.split('.')[0]}.</td>
        <td>${pillar.tools.join(', ')}</td>
        <td><strong>${firstMetric[1]}</strong></td>
        <td><a href="/blueprints/${pillar.slug}">Full Blueprint &rarr;</a></td>
      </tr>
    `;
  }).join('');

  const clusterA = getByCluster('A').slice(0, 3);
  const clusterB = getByCluster('B').slice(0, 3);
  const clusterC = getByCluster('C').slice(0, 3);
  const clusterCPillars = pillars.filter((p) => p.pillar === '03' || p.pillar === '04');

  function renderClusterList(items: typeof publishedArticles, label: string, fallbackPillars?: typeof pillars) {
    if (items.length > 0) {
      return `
        <div class="deep-dive-card">
          <h3>${label}</h3>
          <ul>${items.map((a) => `<li><a href="/trends/${a.slug}"><strong>${a.title}</strong><br/><span class="dd-desc">${a.description.substring(0, 100)}...</span></a></li>`).join('')}</ul>
        </div>
      `;
    }
    const pillarLinks = fallbackPillars?.map((p) => {
      const firstMetric = Object.entries(p.metrics)[0];
      return `<li><a href="/blueprints/${p.slug}"><strong>${p.name}</strong><br/><span class="dd-desc">${firstMetric[1]} — ${p.shortTitle}</span></a></li>`;
    }).join('') || '';
    return `
      <div class="deep-dive-card">
        <h3>${label}</h3>
        <ul>${pillarLinks}</ul>
        <p class="coming-soon-note">Deep dive articles coming Q4 2026</p>
      </div>
    `;
  }

  const faqHtml = faqItems.map((item, i) => `
    <div class="faq-item">
      <h3>${item.q}</h3>
      <p>${item.a}</p>
    </div>
  `).join('');

  const faqSchema = faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a }
  }));

  const itemList = pillars.map((pillar, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: pillar.name,
    url: pillar.url
  }));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Master Blueprints | Wenboom</title>
    <meta name="description" content="4 production-grade AI automation blueprints: data waterfall enrichment, zero-glue orchestration, sub-800ms voice AI, and lifecycle CRM. 98.4% deliverability, 83.4% TCO reduction, raw JSON payloads." />
    <link rel="stylesheet" href="/site-common.css">
    <style>
        .hero-section { padding: 4rem 5% 2rem; text-align: center; max-width: 850px; margin: 0 auto; }
        .tldr-section { max-width: 900px; margin: 0 auto 2rem; padding: 0 5%; }
        .verdict-section { max-width: 900px; margin: 0 auto 2rem; padding: 0 5%; }
        .verdict-card { background: linear-gradient(135deg, rgba(243,198,83,0.06) 0%, rgba(243,198,83,0.02) 100%); border: 1px solid rgba(243, 198, 83, 0.2); border-radius: 12px; padding: 1.75rem 2rem; }
        .verdict-label { font-size: 0.7rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem; }
        .verdict-text { font-size: 1rem; color: var(--text-primary); line-height: 1.7; margin: 0; font-weight: 500; }
        .arch-map-section { max-width: 1100px; margin: 0 auto 3rem; padding: 0 5%; }
        .arch-map { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
        .arch-node { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 1rem 1.25rem; text-align: center; min-width: 160px; }
        .arch-node strong { display: block; color: var(--accent-gold); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.25rem; }
        .arch-node span { color: var(--text-primary); font-size: 0.85rem; font-weight: 600; }
        .arch-arrow { color: var(--accent-gold); font-size: 1.5rem; font-weight: 700; }
        .dashboard-section { max-width: 1100px; margin: 0 auto 3rem; padding: 0 5%; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-top: 1.5rem; }
        .dashboard-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 1.25rem; text-align: center; }
        .dashboard-value { font-size: 1.5rem; font-weight: 800; color: var(--accent-gold); line-height: 1.1; }
        .dashboard-label { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .matrix-section { max-width: 1100px; margin: 0 auto 3rem; padding: 0 5%; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem; margin-top: 1.5rem; }
        .blueprint-card { background-color: var(--card-bg); border-radius: 12px; border: 1px solid var(--card-border); padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; transition: 0.3s; }
        .blueprint-card:hover { transform: translateY(-3px); border-color: rgba(243, 198, 83, 0.2); }
        .bp-meta { font-size: 0.75rem; color: var(--accent-gold); font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.5px; }
        .blueprint-card h2 { font-size: 1.25rem; color: #fff; margin-bottom: 0.75rem; line-height: 1.4; }
        .blueprint-card p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; flex-grow: 1; line-height: 1.55; }
        .bp-tools { font-size: 0.8rem; color: var(--accent-gold); font-weight: 600; margin-bottom: 1rem; }
        .bp-metrics { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .bp-metric { font-size: 0.75rem; background: rgba(243, 198, 83, 0.08); color: var(--accent-gold); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600; }
        .bp-related { margin-bottom: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--card-border); }
        .bp-related strong { font-size: 0.75rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.5rem; }
        .bp-related ul { list-style: none; padding: 0; margin: 0; }
        .bp-related li { padding: 0.3rem 0; }
        .bp-related a { color: var(--text-muted); text-decoration: none; font-size: 0.82rem; transition: 0.2s; }
        .bp-related a:hover { color: var(--accent-gold); }
        .coming-soon-note { opacity: 0.5; font-style: italic; font-size: 0.85rem; }
        .bp-btn { display: block; text-align: center; background-color: transparent; border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 0.65rem 1.5rem; border-radius: 6px; font-weight: 600; text-decoration: none; transition: 0.3s; font-size: 0.9rem; }
        .blueprint-card:hover .bp-btn { background-color: var(--accent-gold); color: #000; }
        .deep-dive-section { margin-top: 3rem; }
        .deep-dive-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
        .deep-dive-card { background-color: var(--card-bg); border-radius: 10px; border: 1px solid var(--card-border); padding: 1.5rem; }
        .deep-dive-card h3 { font-size: 1rem; color: #fff; margin-bottom: 0.75rem; }
        .deep-dive-card ul { list-style: none; padding: 0; margin: 0; }
        .deep-dive-card li { padding: 0.6rem 0; border-bottom: 1px solid var(--card-border); }
        .deep-dive-card li:last-child { border-bottom: none; }
        .deep-dive-card a { color: var(--text-muted); text-decoration: none; font-size: 0.88rem; transition: 0.2s; display: block; }
        .deep-dive-card a:hover { color: var(--accent-gold); }
        .dd-desc { font-size: 0.78rem; color: var(--text-muted); opacity: 0.7; display: block; margin-top: 0.2rem; }
        .faq-section { max-width: 900px; margin: 3rem auto; padding: 0 5%; }
        .faq-item { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 1.5rem; margin-bottom: 1rem; }
        .faq-item h3 { font-size: 1rem; color: var(--accent-gold); margin-bottom: 0.75rem; }
        .faq-item p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.65; margin: 0; }
        .a2a-section { max-width: 900px; margin: 3rem auto; padding: 0 5%; }
        .a2a-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
        .a2a-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 1rem; text-align: center; }
        .a2a-card a { color: var(--accent-gold); text-decoration: none; font-size: 0.85rem; font-weight: 600; word-break: break-all; }
        .a2a-card span { display: block; font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; text-transform: uppercase; }
        .author-section { text-align: center; margin-top: 3rem; padding: 2rem; }
        @media (max-width: 900px) {
            .dashboard-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
            .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Master Blueprints | Wenboom" />
    <meta property="og:description" content="4 production-grade AI automation blueprints: data waterfall, zero-glue orchestration, sub-800ms voice AI, lifecycle CRM. 98.4% deliverability, 83.4% TCO reduction." />
    <meta property="og:url" content="https://wenboom.com/blueprints" />
    <meta property="og:image" content="https://wenboom.com/favicon.svg" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Master Blueprints | Wenboom" />
    <meta name="twitter:description" content="4 production-grade AI automation blueprints with raw JSON payloads, failure protocols, and deployment schematics." />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": "https://wenboom.com/#alex",
          "name": "Alex",
          "jobTitle": "Principal AI Infrastructure Architect",
          "worksFor": { "@id": "https://wenboom.com/#organization" },
          "sameAs": "https://wenboom.com/about",
          "url": "https://wenboom.com/about"
        },
        {
          "@type": "Organization",
          "@id": "https://wenboom.com/#organization",
          "name": "Wenboom",
          "url": "https://wenboom.com",
          "logo": "https://wenboom.com/favicon.svg",
          "founder": { "@id": "https://wenboom.com/#alex" }
        },
        {
          "@type": "CollectionPage",
          "@id": "https://wenboom.com/blueprints#page",
          "url": "https://wenboom.com/blueprints",
          "name": "Wenboom Master Blueprints Library",
          "description": "Production-grade AI automation blueprints across 4 pillars with JSON payloads, failure protocols, and deployment schematics.",
          "inLanguage": "en-US",
          "publisher": { "@id": "https://wenboom.com/#organization" },
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": ${JSON.stringify(itemList)}
          }
        },
        {
          "@type": "FAQPage",
          "@id": "https://wenboom.com/blueprints#faq",
          "mainEntity": ${JSON.stringify(faqSchema)}
        }
      ]
    }
    </script>
</head>
<body>
    <header>
        <div class="logo"><a href="/">WEN<span>BOOM</span></a></div>
        <nav>
            <a href="/trends">Future Trends</a>
            <a href="/tools">Top AI Stack</a>
            <a href="/blueprints" style="color: var(--accent-gold);">Master Blueprints</a>
            <a href="/about">About Alex</a>
        </nav>
    </header>
    <main>
        <section class="hero-section">
            <div class="tagline">PRODUCTION-GRADE BLUEPRINT LIBRARY</div>
            <h1>Master <span>Automation Blueprints</span></h1>
            <p class="sub-text">4 production-grade architecture pillars delivering 98.4% deliverability, 83.4% TCO reduction, and 640ms voice latency across Clay, Smartlead, Make, n8n, Voiceflow, Bland, and ActiveCampaign.</p>
        </section>

        <section class="tldr-section">
            <div class="tldr-box">
                <strong>TL;DR:</strong> Wenboom's 4-pillar architecture eliminates 14-22% chained REST agent failure rates through the Zero-Glue Theorem. Production benchmarks show 98.4% email deliverability, 83.4% TCO reduction at 500k monthly executions, and 640ms end-to-end voice latency. Each blueprint includes raw JSON payloads, failure-mode protocols, and deployment schematics stress-tested in live production.
            </div>
        </section>

        <section class="verdict-section">
            <div class="verdict-card">
                <div class="verdict-label">Architecture Verdict</div>
                <p class="verdict-text">Wenboom's 4-pillar architecture delivers 98.4% deliverability, 83.4% TCO reduction, 640ms voice latency, and 0.01% CRM duplicate rate through zero-glue deterministic engineering across Clay, Smartlead, Make, n8n, Voiceflow, Bland, and ActiveCampaign.</p>
            </div>
        </section>

        <section class="arch-map-section">
            <h2 class="section-title">4-Pillar Architecture Framework</h2>
            <p class="section-subtitle">How the four pillars connect end-to-end, from raw data ingestion to revenue lifecycle management.</p>
            <div class="arch-map">
                <div class="arch-node"><strong>Pillar 01</strong><span>Data Waterfall</span></div>
                <div class="arch-arrow">&rarr;</div>
                <div class="arch-node"><strong>Pillar 02</strong><span>Orchestration</span></div>
                <div class="arch-arrow">&rarr;</div>
                <div class="arch-node"><strong>Pillar 03</strong><span>Agentic Voice</span></div>
                <div class="arch-arrow">&rarr;</div>
                <div class="arch-node"><strong>Pillar 04</strong><span>Lifecycle CRM</span></div>
            </div>
        </section>

        <section class="dashboard-section">
            <h2 class="section-title">Core Benchmark Dashboard</h2>
            <p class="section-subtitle">Production-tested metrics across all four pillars, measured in live deployment.</p>
            <div class="dashboard-grid">
                <div class="dashboard-card"><div class="dashboard-value">98.4%</div><div class="dashboard-label">Deliverability</div></div>
                <div class="dashboard-card"><div class="dashboard-value">83.4%</div><div class="dashboard-label">TCO Reduction</div></div>
                <div class="dashboard-card"><div class="dashboard-value">640ms</div><div class="dashboard-label">Voice Latency</div></div>
                <div class="dashboard-card"><div class="dashboard-value">0.01%</div><div class="dashboard-label">CRM Duplicate Rate</div></div>
                <div class="dashboard-card"><div class="dashboard-value">0.94+</div><div class="dashboard-label">WCEI Score</div></div>
                <div class="dashboard-card"><div class="dashboard-value">89.2%</div><div class="dashboard-label">Call Completion</div></div>
            </div>
        </section>

        <section class="matrix-section">
            <h2 class="section-title">4-Pillar Comparison Matrix</h2>
            <p class="section-subtitle">Side-by-side comparison of core problems, tools, and headline metrics across all pillars.</p>
            <div class="table-scroll-wrap" style="max-width: 1100px; margin: 1.5rem auto 0; padding: 0 5%;">
                <table>
                    <tr>
                        <th>Pillar</th>
                        <th>Core Problem Solved</th>
                        <th>Tools</th>
                        <th>Headline Metric</th>
                        <th>Blueprint</th>
                    </tr>
                    ${comparisonRows}
                </table>
            </div>
        </section>

        <section class="matrix-section">
            <div class="grid">
                ${pillarCards}
            </div>
        </section>

        <section class="matrix-section deep-dive-section" style="background: rgba(255,255,255,0.01);">
            <h2 class="section-title">Deep Dive Articles by Cluster</h2>
            <p class="section-subtitle">Engineering blueprints, failure recovery protocols, and cost benchmarks built on each pillar architecture.</p>
            <div class="deep-dive-grid">
                ${renderClusterList(clusterA, 'Cluster A — Data Waterfall & Outbound')}
                ${renderClusterList(clusterB, 'Cluster B — Orchestration & Cost Control')}
                ${renderClusterList(clusterC, 'Cluster C — Agentic Voice & Lifecycle CRM', clusterCPillars)}
            </div>
        </section>

        <section class="faq-section">
            <h2 class="section-title">Frequently Asked Questions</h2>
            <p class="section-subtitle">Common questions about the Wenboom 4-pillar architecture, benchmarks, and deployment approach.</p>
            ${faqHtml}
        </section>

        <section class="a2a-section">
            <h2 class="section-title">Machine-Readable Entry Points</h2>
            <p class="section-subtitle">Structured data endpoints for AI agents, search engines, and RAG systems. All generated dynamically from the same single source of truth.</p>
            <div class="a2a-grid">
                <div class="a2a-card"><a href="/llms.txt">/llms.txt</a><span>AI Search Index</span></div>
                <div class="a2a-card"><a href="/.well-known/llms.txt">/.well-known/llms.txt</a><span>Standard Path</span></div>
                <div class="a2a-card"><a href="/llms-full.json">/llms-full.json</a><span>RAG Metadata</span></div>
                <div class="a2a-card"><a href="/sitemap.xml">/sitemap.xml</a><span>Search Sitemap</span></div>
            </div>
        </section>

        <section class="author-section">
            <h2 class="section-title">Engineered by Alex</h2>
            <p class="section-subtitle">Principal AI Infrastructure Architect with 10+ years of production-grade automation experience. Every blueprint is stress-tested in live deployment before publication.</p>
            <div style="text-align: center; margin-top: 1.5rem;">
                <a href="/about" style="color: var(--accent-gold); text-decoration: none; font-weight: 600;">Read Alex's Full Bio &rarr;</a>
            </div>
        </section>
    </main>
    <subscribe-box></subscribe-box>
    <footer>
        <div class="footer-links-wrap">
            <a href="/about" class="footer-link-item">About Alex</a>
            <a href="/privacy-policy" class="footer-link-item">Privacy Policy</a>
            <a href="/cookie-policy" class="footer-link-item">Cookie Policy</a>
            <a href="/terms-of-service" class="footer-link-item">Terms of Service</a>
        </div>
        <div style="max-width: 800px; margin: 1.5rem auto 0; font-size: 0.75rem; opacity: 0.5; text-align: center; line-height: 1.4;">
            Engineering Transparency: Wenboom benchmarks and deploys enterprise architectures internally. Product links use clean router paths (<code>/links/[tool]</code>). If you deploy through them, we may earn an affiliate commission at $0 added cost to you.
        </div>
        <div class="footer-copyright">
            <p>&copy; 2026-2036 Wenboom.com. All Rights Reserved. Principal Architect: Alex.</p>
        </div>
    </footer>
    <script src="/js/subscribe-component.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-BV4E7FGY3P"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-BV4E7FGY3P');
    </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
