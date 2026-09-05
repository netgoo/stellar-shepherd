// src/pages/trends.ts
// Server-rendered HTML list page from single source of truth.
// Route: /trends (no extension).
// 4-channel article cards auto-generated from articles.ts.

import type { APIRoute } from 'astro';
import { articles, type Article } from '../data/articles';

interface ChannelConfig {
  heading: string;
  sub: string;
  color: string;
  cssClass: string;
}

const channelConfig: Record<string, ChannelConfig> = {
  failure: {
    heading: 'Production Failure & Rate-Limit Protocols',
    sub: 'Step-by-step recovery protocols for production errors, data poisoning, and infrastructure failures in Clay, n8n, and serverless deployments.',
    color: '#EF4444',
    cssClass: 'failure'
  },
  data: {
    heading: 'Data Waterfall & Outbound',
    sub: 'Multi-agent outbound architectures, WCEI-optimized enrichment waterfalls, and MCP protocol layers for Clay + Smartlead pipelines.',
    color: '#10B981',
    cssClass: 'data'
  },
  orchestration: {
    heading: 'Orchestration & Cost Control',
    sub: 'Visual DAG vs linear chains, MCP bridge architecture, and hard-data cost benchmarks for Make + n8n production deployments.',
    color: '#3B82F6',
    cssClass: 'orchestration'
  },
  voice: {
    heading: 'Agentic Voice & Lifecycle CRM',
    sub: 'Sub-800ms voice AI qualification pipelines and closed-loop lifecycle CRM automation. Production blueprints in active development.',
    color: 'var(--accent-gold)',
    cssClass: 'voice'
  }
};

const channelOrder = ['failure', 'data', 'orchestration', 'voice'];

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function resolveDisplayChannel(a: Article): string {
  if (a.channel === 'architecture') {
    return a.category === 'roi' ? 'orchestration' : 'data';
  }
  return a.channel;
}

function renderArticleCard(a: Article, channelKey: string): string {
  const config = channelConfig[channelKey];
  return `
                    <a href="/trends/${a.slug}" class="trend-feed-card">
                        <span class="trend-meta" style="color: ${config.color};">${escapeHtml(a.metaTag)}</span>
                        <h2>${escapeHtml(a.title)}</h2>
                        <p>${escapeHtml(a.description)}</p>
                        <div class="trend-footer ${config.cssClass}">Read Full Blueprint &rarr;</div>
                    </a>`;
}

function renderVoiceComingSoon(): string {
  return `
                    <div class="coming-soon-feed">
                        <span class="trend-meta" style="color: var(--accent-gold);">VOICE AI • CLUSTER C</span>
                        <h2>Voiceflow to Bland.ai Real-Time Qualification Pipeline</h2>
                        <p>Sub-800ms low-latency voice AI pipeline with dynamic webhook payload routing, max_duration hard caps, and live transfer protocols. Production blueprint in active development, benchmarked against legacy IVR systems.</p>
                        <div class="trend-footer voice"><a href="/blueprints/production-ai-agentic-architecture" style="color: var(--accent-gold); text-decoration: none;">View Pillar 3 Blueprint &rarr;</a></div>
                    </div>
                    <div class="coming-soon-feed">
                        <span class="trend-meta" style="color: var(--accent-gold);">LIFECYCLE CRM • CLUSTER C</span>
                        <h2>ActiveCampaign Closed-Loop Lifecycle CRM Automation</h2>
                        <p>Smartlead to ActiveCampaign full-funnel sync with custom webhook lead scoring, -40% lead loss prevention, and dynamic lifecycle nurturing pools. Production blueprint in active development.</p>
                        <div class="trend-footer voice"><a href="/blueprints/b2b-lifecycle-revenue-crm" style="color: var(--accent-gold); text-decoration: none;">View Pillar 4 Blueprint &rarr;</a></div>
                    </div>`;
}

export const GET: APIRoute = async () => {
  const publishedArticles = articles.filter(a => a.status === 'published');
  const publishedSorted = [...publishedArticles].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://wenboom.com/#alex',
        name: 'Alex',
        jobTitle: 'Principal AI Infrastructure Architect',
        worksFor: { '@id': 'https://wenboom.com/#organization' },
        sameAs: 'https://wenboom.com/about',
        url: 'https://wenboom.com/about'
      },
      {
        '@type': 'Organization',
        '@id': 'https://wenboom.com/#organization',
        name: 'Wenboom',
        url: 'https://wenboom.com',
        logo: 'https://wenboom.com/favicon.svg',
        founder: { '@id': 'https://wenboom.com/#alex' },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'mailto:alex@wenboom.com',
          contactType: 'customer support',
          availableLanguage: 'English'
        }
      },
      {
        '@type': 'CollectionPage',
        '@id': 'https://wenboom.com/trends#collection',
        url: 'https://wenboom.com/trends',
        name: 'Wenboom Production Blueprints & Failure Protocols',
        inLanguage: 'en-US',
        description: 'Battle-tested engineering blueprints, failure recovery protocols, and enterprise cost benchmarks curated by Alex.',
        publisher: { '@id': 'https://wenboom.com/#organization' },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: publishedSorted.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: a.title,
            url: a.url
          }))
        }
      }
    ]
  };

  const channelBlocksHtml = channelOrder.map(ch => {
    const config = channelConfig[ch];
    const channelArticles = publishedArticles
      .filter(a => resolveDisplayChannel(a) === ch)
      .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

    let inner = '';
    if (ch === 'voice') {
      inner = renderVoiceComingSoon();
    } else {
      inner = channelArticles.map(a => renderArticleCard(a, ch)).join('');
    }

    return `
            <div class="channel-block">
                <h2 class="channel-heading ${config.cssClass}">${escapeHtml(config.heading)}</h2>
                <p class="channel-sub">${escapeHtml(config.sub)}</p>
                <div class="trends-list">${inner}
                </div>
            </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Production Blueprints and Failure Protocols | Wenboom</title>
    <meta name="description" content="Production failure recovery protocols, rate-limit workarounds, multi-agent outbound blueprints, and n8n vs Make cost benchmarks engineered for B2B teams. Curated by Alex, Principal AI Infrastructure Architect." />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Production Blueprints and Failure Protocols | Wenboom" />
    <meta property="og:description" content="Production failure recovery protocols, rate-limit workarounds, multi-agent outbound blueprints, and n8n vs Make cost benchmarks engineered for B2B teams. Curated by Alex, Principal AI Infrastructure Architect." />
    <meta property="og:url" content="https://wenboom.com/trends" />
    <meta property="og:image" content="https://wenboom.com/favicon.svg" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Production Blueprints and Failure Protocols | Wenboom" />
    <meta name="twitter:description" content="Production failure recovery protocols, rate-limit workarounds, multi-agent outbound blueprints, and n8n vs Make cost benchmarks engineered for B2B teams. Curated by Alex, Principal AI Infrastructure Architect." />
    <link rel="stylesheet" href="/site-common.css">
    <style>
        .archive-hero {
            padding: 4rem 5% 2rem;
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
        }
        .channel-block {
            margin-bottom: 3.5rem;
        }
        .channel-block:last-child {
            margin-bottom: 0;
        }
        .channel-heading {
            font-size: 1.4rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 0.5rem;
            padding-left: 0.75rem;
            border-left: 4px solid;
        }
        .channel-heading.failure { border-color: #EF4444; }
        .channel-heading.data { border-color: #10B981; }
        .channel-heading.orchestration { border-color: #3B82F6; }
        .channel-heading.voice { border-color: var(--accent-gold); }
        .channel-sub {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 1.5rem;
            padding-left: 0.75rem;
        }
        .trends-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        .trend-feed-card {
            background-color: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--card-border);
            padding: 1.75rem;
            display: block;
            transition: 0.3s;
            text-decoration: none;
            color: inherit;
        }
        .trend-feed-card:hover {
            transform: translateY(-2px);
            border-color: rgba(243, 198, 83, 0.2);
            background: rgba(255,255,255,0.01);
        }
        .trend-feed-card h2 {
            font-size: 1.3rem;
            color: #fff;
            margin-bottom: 0.6rem;
            line-height: 1.4;
            transition: 0.3s;
        }
        .trend-feed-card:hover h2 {
            color: var(--accent-gold);
        }
        .trend-feed-card p {
            color: var(--text-muted);
            font-size: 0.92rem;
            margin-bottom: 0.9rem;
        }
        .trend-footer {
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .trend-footer.failure { color: #EF4444; }
        .trend-footer.data { color: #10B981; }
        .trend-footer.orchestration { color: #3B82F6; }
        .trend-footer.voice { color: var(--accent-gold); }
        .coming-soon-feed {
            background-color: var(--card-bg);
            border-radius: 12px;
            border: 1px dashed var(--card-border);
            padding: 1.75rem;
            opacity: 0.8;
        }
        .coming-soon-feed h2 {
            font-size: 1.3rem;
            color: var(--accent-gold);
            margin-bottom: 0.6rem;
            line-height: 1.4;
        }
        .coming-soon-feed p {
            color: var(--text-muted);
            font-size: 0.92rem;
            margin-bottom: 0.9rem;
        }
        .subscribe-cta {
            max-width: 700px;
            margin: 2rem auto 1rem;
            padding: 0 1.5rem;
            text-align: center;
        }
        .subscribe-cta h3 {
            font-size: 1.25rem;
            color: #fff;
            margin-bottom: 0.5rem;
        }
        .subscribe-cta p {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0;
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
            <a href="/trends" style="color: var(--accent-gold);">Future Trends</a>
            <a href="/tools">Top AI Stack</a>
            <a href="/blueprints">Master Blueprints</a>
            <a href="/about">About Alex</a>
        </nav>
    </header>
    <main>
        <section class="archive-hero">
            <div class="tagline">ENGINEERING KNOWLEDGE BASE & FAILURE PROTOCOLS</div>
            <h1>Strategic <span>AI Infrastructure Intelligence</span></h1>
            <p class="sub-text">
                Wenboom publishes production-grade blueprints across 4 content channels—failure protocols, data waterfall, orchestration, and agentic voice—with free JSON payloads, WCEI optimization, and 98.4% deliverability protocols.
            </p>
        </section>
        <section class="matrix-section">${channelBlocksHtml}
        </section>
        <section class="matrix-section" style="background: rgba(255,255,255,0.01);">
            <h2 class="section-title">Engineered by Alex</h2>
            <p class="section-subtitle">Principal AI Infrastructure Architect with 10+ years of production-grade automation experience. Every blueprint is stress-tested in live deployment before publication.</p>
            <div style="text-align: center; margin-top: 1.5rem;">
                <a href="/about" style="color: var(--accent-gold); text-decoration: none; font-weight: 600;">Read Alex's Full Bio &rarr;</a>
            </div>
        </section>
    </main>
    <div class="subscribe-cta">
        <h3>Get Weekly Raw Schemas &amp; Failure Protocols</h3>
        <p>Direct JSON payloads, n8n workflow export files, and rate-limit workarounds delivered straight to your inbox. Zero spam, curated by Alex.</p>
    </div>
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
