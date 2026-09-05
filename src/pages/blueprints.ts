// src/pages/blueprints.ts
// Server-rendered blueprint library page from single source of truth.
// Route: /blueprints.
// 4 Pillar cards and Deep Dive articles auto-generated from articles.ts.

import type { APIRoute } from 'astro';
import { articles, pillars, type Article, type Pillar } from '../data/articles';

const metricKeyLabels: Record<string, string> = {
  deliverability: 'deliverability',
  wcei: 'WCEI',
  costPer10kLeads: '/10k leads',
  tcoReduction: 'TCO reduction',
  p99Latency: 'P99 latency',
  connectionPooling: 'pooling',
  endToEndLatency: 'latency',
  callCompletionRate: 'completion',
  costPerMinute: '/min',
  duplicateContactRate: 'duplicate rate',
  stateCorruption: 'state corruption',
  apiFailureRate: 'API failure'
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderBlueprintCard(p: Pillar): string {
  const metricsEntries = Object.entries(p.metrics || {}).slice(0, 3);
  const metricsHtml = metricsEntries.map(([key, value]) => {
    const label = metricKeyLabels[key] || key;
    return `<span class="bp-metric">${escapeHtml(value)} ${escapeHtml(label)}</span>`;
  }).join('');

  return `
                <div class="blueprint-card">
                    <div>
                        <span class="bp-meta">Pillar ${p.pillar} — ${escapeHtml(p.shortTitle)}</span>
                        <h2>${escapeHtml(p.name)}</h2>
                        <p>${escapeHtml(p.description)}</p>
                        <div class="bp-tools">Tools: ${escapeHtml(p.tools.join(' + '))}</div>
                        <div class="bp-metrics">
                            ${metricsHtml}
                        </div>
                    </div>
                    <a href="${p.url}" class="bp-btn">Explore Pillar ${p.pillar} Blueprint &rarr;</a>
                </div>`;
}

function renderDeepDiveArticle(a: Article): string {
  return `<li><a href="/trends/${a.slug}">${escapeHtml(a.title)}</a></li>`;
}

export const GET: APIRoute = async () => {
  const publishedPillars = pillars.filter(p => p.status === 'published').sort((a, b) => a.pillar.localeCompare(b.pillar));
  const publishedArticles = articles.filter(a => a.status === 'published');

  const pillarCardsHtml = publishedPillars.map(renderBlueprintCard).join('');

  const clusterAArticles = publishedArticles.filter(a => a.cluster === 'A').sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)).slice(0, 3);
  const clusterBArticles = publishedArticles.filter(a => a.cluster === 'B').sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://wenboom.com/#alex',
        name: 'Alex',
        jobTitle: 'Principal AI Infrastructure Architect',
        worksFor: { '@id': 'https://wenboom.com/#organization' },
        sameAs: ['https://wenboom.com/about']
      },
      {
        '@type': 'Organization',
        '@id': 'https://wenboom.com/#organization',
        name: 'Wenboom',
        url: 'https://wenboom.com',
        logo: 'https://wenboom.com/favicon.svg',
        founder: { '@id': 'https://wenboom.com/#alex' }
      },
      {
        '@type': 'CollectionPage',
        '@id': 'https://wenboom.com/blueprints#collection',
        url: 'https://wenboom.com/blueprints',
        name: 'Wenboom Master Blueprints Library',
        inLanguage: 'en-US',
        description: 'Production-grade AI automation blueprints across 4 pillars with JSON payloads, failure protocols, and deployment schematics.',
        publisher: { '@id': 'https://wenboom.com/#organization' },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: publishedPillars.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: p.url
          }))
        }
      }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Master Blueprints | Wenboom</title>
    <meta name="description" content="Production-grade AI automation blueprints across 4 pillars: data waterfall enrichment, zero-glue orchestration, sub-800ms voice AI infrastructure, and lifecycle revenue CRM. Each includes JSON payloads, failure protocols, and deployment schematics." />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Master Blueprints | Wenboom" />
    <meta property="og:description" content="Production-grade AI automation blueprints across 4 pillars: data waterfall enrichment, zero-glue orchestration, sub-800ms voice AI infrastructure, and lifecycle revenue CRM. Each includes JSON payloads, failure protocols, and deployment schematics." />
    <meta property="og:url" content="https://wenboom.com/blueprints" />
    <meta property="og:image" content="https://wenboom.com/favicon.svg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Master Blueprints | Wenboom" />
    <meta name="twitter:description" content="Production-grade AI automation blueprints across 4 pillars: data waterfall enrichment, zero-glue orchestration, sub-800ms voice AI infrastructure, and lifecycle revenue CRM. Each includes JSON payloads, failure protocols, and deployment schematics." />
    <link rel="stylesheet" href="/site-common.css">
    <style>
        .hero-section {
            padding: 4rem 5% 2rem;
            text-align: center;
            max-width: 850px;
            margin: 0 auto;
        }
        .verdict-section {
            max-width: 900px;
            margin: 0 auto 2rem;
            padding: 0 5%;
        }
        .verdict-card {
            background: linear-gradient(135deg, rgba(243,198,83,0.06) 0%, rgba(243,198,83,0.02) 100%);
            border: 1px solid rgba(243, 198, 83, 0.2);
            border-radius: 12px;
            padding: 1.75rem 2rem;
        }
        .verdict-label {
            font-size: 0.7rem;
            color: var(--accent-gold);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.75rem;
        }
        .verdict-text {
            font-size: 1rem;
            color: var(--text-primary);
            line-height: 1.7;
            margin: 0;
            font-weight: 500;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.75rem;
            margin-top: 1.5rem;
        }
        .blueprint-card {
            background-color: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--card-border);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: 0.3s;
        }
        .blueprint-card:hover {
            transform: translateY(-3px);
            border-color: rgba(243, 198, 83, 0.2);
        }
        .bp-meta {
            font-size: 0.75rem;
            color: var(--accent-gold);
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.75rem;
            letter-spacing: 0.5px;
        }
        .blueprint-card h2 {
            font-size: 1.25rem;
            color: #fff;
            margin-bottom: 0.75rem;
            line-height: 1.4;
        }
        .blueprint-card p {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-bottom: 1rem;
            flex-grow: 1;
            line-height: 1.55;
        }
        .bp-tools {
            font-size: 0.8rem;
            color: var(--accent-gold);
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .bp-metrics {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.25rem;
        }
        .bp-metric {
            font-size: 0.75rem;
            background: rgba(243, 198, 83, 0.08);
            color: var(--accent-gold);
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            font-weight: 600;
        }
        .bp-btn {
            display: block;
            text-align: center;
            background-color: transparent;
            border: 1px solid var(--accent-gold);
            color: var(--accent-gold);
            padding: 0.65rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            text-decoration: none;
            transition: 0.3s;
            font-size: 0.9rem;
        }
        .blueprint-card:hover .bp-btn {
            background-color: var(--accent-gold);
            color: #000;
        }
        .deep-dive-section {
            margin-top: 3rem;
        }
        .deep-dive-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        .deep-dive-card {
            background-color: var(--card-bg);
            border-radius: 10px;
            border: 1px solid var(--card-border);
            padding: 1.5rem;
        }
        .deep-dive-card h3 {
            font-size: 1rem;
            color: #fff;
            margin-bottom: 0.75rem;
        }
        .deep-dive-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .deep-dive-card li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--card-border);
        }
        .deep-dive-card li:last-child {
            border-bottom: none;
        }
        .deep-dive-card a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.88rem;
            transition: 0.2s;
        }
        .deep-dive-card a:hover {
            color: var(--accent-gold);
        }
        .coming-soon-note {
            opacity: 0.5;
            font-style: italic;
            font-size: 0.85rem;
        }
        .author-section {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
        }
    </style>
    <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
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
            <p class="sub-text">Wenboom delivers 4 production-grade architecture blueprints across 4 pillars—data waterfall enrichment, zero-glue orchestration, sub-800ms voice AI infrastructure, and lifecycle revenue CRM—each with raw JSON payloads, failure-mode protocols, and exact deployment schematics. Stress-tested in live deployment before publication.</p>
        </section>
        <section class="verdict-section">
            <div class="verdict-card">
                <div class="verdict-label">Architecture Verdict</div>
                <p class="verdict-text">Wenboom's 4-pillar architecture delivers 98.4% deliverability, 83.4% TCO reduction, 640ms voice latency, and 0.01% CRM duplicate rate through zero-glue deterministic engineering across Clay, Smartlead, Make, n8n, Voiceflow, Bland, and ActiveCampaign.</p>
            </div>
        </section>
        <section class="matrix-section">
            <div class="grid">${pillarCardsHtml}
            </div>
        </section>
        <section class="matrix-section deep-dive-section" style="background: rgba(255,255,255,0.01);">
            <h2 class="section-title">Deep Dive Articles by Cluster</h2>
            <p class="section-subtitle">Engineering blueprints, failure recovery protocols, and cost benchmarks built on each pillar architecture.</p>
            <div class="deep-dive-grid">
                <div class="deep-dive-card">
                    <h3>Cluster A — Data Waterfall &amp; Outbound</h3>
                    <ul>
                        ${clusterAArticles.map(renderDeepDiveArticle).join('')}
                    </ul>
                </div>
                <div class="deep-dive-card">
                    <h3>Cluster B — Orchestration &amp; Cost Control</h3>
                    <ul>
                        ${clusterBArticles.map(renderDeepDiveArticle).join('')}
                    </ul>
                </div>
                <div class="deep-dive-card">
                    <h3>Cluster C — Agentic Voice &amp; Lifecycle CRM</h3>
                    <ul>
                        <li><a href="/blueprints/production-ai-agentic-architecture">Pillar 03: AI Voice Agent Infrastructure (640ms latency, 89.2% completion)</a></li>
                        <li><a href="/blueprints/b2b-lifecycle-revenue-crm">Pillar 04: Enterprise Lead Lifecycle &amp; CRM Sync (0.01% duplicate rate)</a></li>
                        <li class="coming-soon-note">Voice AI qualification &amp; CRM automation deep dives — Q4 2026</li>
                    </ul>
                </div>
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
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
};
