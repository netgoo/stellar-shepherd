// src/pages/tools.ts
// 7-Core Production Stack page. Dynamic generation from articles.ts SSOT.
// Tools with affiliateLink show gold deploy button; others link to their Pillar page.
import type { APIRoute } from 'astro';
import { tools, pillars } from '../data/articles';

const pillarIcons: Record<string, string> = {
  '01': '🌊',
  '02': '⚡',
  '03': '🎙️',
  '04': '🔄'
};

export const GET: APIRoute = () => {
  const synergyCards = pillars.map((pillar) => {
    const icon = pillarIcons[pillar.pillar] || '🔧';
    const firstMetric = Object.entries(pillar.metrics)[0];
    return `
      <div class="card">
        <div class="card-icon">${icon}</div>
        <h3>Pillar ${pillar.pillar} — ${pillar.shortTitle}</h3>
        <p><strong>${pillar.tools.join(' + ')}</strong>. ${pillar.description.split('.')[0]}. Headline: ${firstMetric[1]}.</p>
        <a href="/blueprints/${pillar.slug}" style="color: var(--accent-gold); text-decoration: none; font-weight: 600; display: inline-block; margin-top: 0.5rem;">Explore Pillar ${pillar.pillar} &rarr;</a>
      </div>
    `;
  }).join('');

  const toolCards = tools.map((tool) => {
    const pillar = pillars.find((p) => p.pillar === tool.pillar);
    const ctaUrl = tool.affiliateLink || `/blueprints/${pillar?.slug}`;
    const metricsHtml = tool.metrics.map((m) => `<span class="metric-inline">${m}</span>`).join('');
    return `
      <div class="tool-review-card">
        <div class="tool-header-grid">
          <div class="tool-title">${tool.name}</div>
          <span class="tool-badge">Pillar ${tool.pillar} — ${tool.role}</span>
        </div>
        <p class="desc">${tool.description}</p>
        <div class="tool-metrics">${metricsHtml}</div>
        <div class="tool-fit">
          <div class="fit-block good-for">
            <h4>Best For</h4>
            <p>${tool.bestFor}</p>
          </div>
          <div class="fit-block not-for">
            <h4>Not For</h4>
            <p>${tool.notFor}</p>
          </div>
        </div>
        <a href="${ctaUrl}" class="deploy-btn">${tool.ctaText}</a>
      </div>
    `;
  }).join('');

  const itemList = tools.map((tool, i) => {
    const pillar = pillars.find((p) => p.pillar === tool.pillar);
    const url = tool.affiliateLink ? `https://wenboom.com${tool.affiliateLink}` : pillar?.url;
    return {
      '@type': 'ListItem',
      position: i + 1,
      name: tool.name,
      url: url
    };
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The 7-Core Production Stack | Wenboom</title>
    <meta name="description" content="The strict 7-core production AI infrastructure stack: Make, n8n, Clay, Smartlead, Voiceflow, Bland.ai, and ActiveCampaign. Each tool stress-tested in live deployment with hard data, use cases, and documented limitations." />
    <link rel="stylesheet" href="/site-common.css">
    <style>
        .tools-hero { padding: 4rem 5% 2rem; text-align: center; max-width: 850px; margin: 0 auto; }
        .verdict-section { max-width: 900px; margin: 0 auto 2rem; padding: 0 5%; }
        .verdict-card { background: linear-gradient(135deg, rgba(243,198,83,0.06) 0%, rgba(243,198,83,0.02) 100%); border: 1px solid rgba(243, 198, 83, 0.2); border-radius: 12px; padding: 1.75rem 2rem; }
        .verdict-label { font-size: 0.7rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem; }
        .verdict-text { font-size: 1rem; color: var(--text-primary); line-height: 1.7; margin: 0; font-weight: 500; }
        .stack-list { display: flex; flex-direction: column; gap: 2rem; margin-top: 1.5rem; }
        .tool-review-card { background-color: var(--card-bg); border-radius: 12px; border: 1px solid var(--card-border); padding: 2rem; transition: 0.3s; }
        .tool-review-card:hover { transform: translateY(-2px); border-color: rgba(243, 198, 83, 0.2); }
        .tool-header-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
        .tool-title { font-size: 1.5rem; font-weight: 800; color: #fff; }
        .tool-badge { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 99px; background: rgba(243, 198, 83, 0.1); color: var(--accent-gold); font-weight: 600; }
        .tool-review-card .desc { color: var(--text-main); font-size: 0.95rem; margin-bottom: 1rem; line-height: 1.6; opacity: 0.95; }
        .tool-metrics { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
        .metric-inline { font-size: 0.82rem; color: var(--accent-gold); font-weight: 600; }
        .tool-fit { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
        .fit-block { background-color: rgba(255,255,255,0.02); border-radius: 6px; padding: 0.85rem 1rem; }
        .fit-block h4 { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.35rem; font-weight: 700; }
        .fit-block.good-for h4 { color: #10B981; }
        .fit-block.not-for h4 { color: #EF4444; }
        .fit-block p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0; line-height: 1.4; }
        .deploy-btn { display: inline-block; background-color: var(--accent-gold); color: #000; padding: 0.7rem 1.8rem; border-radius: 6px; font-size: 0.92rem; font-weight: 800; text-decoration: none; transition: 0.3s; }
        .deploy-btn:hover { background-color: #ffe082; transform: translateY(-1px); }
        .synergy-section { margin-top: 3rem; }
        .synergy-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 1.5rem; }
        .author-section { text-align: center; margin-top: 3rem; padding: 2rem; }
        @media (max-width: 1024px) {
            .synergy-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
            .synergy-grid { grid-template-columns: 1fr; }
            .tool-fit { grid-template-columns: 1fr; }
        }
    </style>
    <meta property="og:type" content="website" />
    <meta property="og:title" content="The 7-Core Production Stack | Wenboom" />
    <meta property="og:description" content="The strict 7-core production AI infrastructure stack: Make, n8n, Clay, Smartlead, Voiceflow, Bland.ai, and ActiveCampaign. Each tool stress-tested in live deployment with hard data, use cases, and documented limitations." />
    <meta property="og:url" content="https://wenboom.com/tools" />
    <meta property="og:image" content="https://wenboom.com/favicon.svg" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="The 7-Core Production Stack | Wenboom" />
    <meta name="twitter:description" content="The strict 7-core production AI infrastructure stack, each tool stress-tested in live deployment with hard data, use cases, and documented limitations." />
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
          "@id": "https://wenboom.com/tools#page",
          "url": "https://wenboom.com/tools",
          "name": "Wenboom 7-Core Production Stack",
          "inLanguage": "en-US",
          "description": "The strict 7-core production AI infrastructure stack, each tool stress-tested in live deployment with hard data, use cases, and documented limitations.",
          "publisher": { "@id": "https://wenboom.com/#organization" },
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": ${JSON.stringify(itemList)}
          }
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
            <a href="/tools" style="color: var(--accent-gold);">Top AI Stack</a>
            <a href="/blueprints">Master Blueprints</a>
            <a href="/about">About Alex</a>
        </nav>
    </header>
    <main>
        <section class="tools-hero">
            <div class="tagline">THE 7-CORE PRODUCTION MATRIX</div>
            <h1>Vetted <span>Enterprise Automation Stack</span></h1>
            <p class="sub-text">Wenboom delivers 7 production-grade AI tools across 4 pillars—data waterfall, orchestration, voice AI, and lifecycle CRM—each stress-tested in live deployment with hard data, use cases, and documented limitations.</p>
        </section>
        <section class="verdict-section">
            <div class="verdict-card">
                <div class="verdict-label">Stack Verdict</div>
                <p class="verdict-text">Wenboom's 7-core production stack delivers 98.4% deliverability, 83.4% TCO reduction, 640ms voice latency, and 0.01% CRM duplicate rate through zero-glue deterministic engineering across Clay, Smartlead, Make, n8n, Voiceflow, Bland, and ActiveCampaign—each stress-tested with documented use cases and limitations.</p>
            </div>
        </section>
        <section class="matrix-section synergy-section" style="background: rgba(255,255,255,0.01);">
            <h2 class="section-title">How the 7 Tools Work Together</h2>
            <p class="section-subtitle">Each tool occupies a strict layer in the 4-pillar architecture. No overlaps, no vendor lock-in, zero-glue boundaries.</p>
            <div class="synergy-grid">
                ${synergyCards}
            </div>
        </section>
        <section class="matrix-section">
            <h2 class="section-title">7-Core Tool Deep Dives</h2>
            <p class="section-subtitle">Each tool vetted with hard metrics, ideal use cases, and documented limitations. No hype, just production data.</p>
            <div class="stack-list">
                ${toolCards}
            </div>
        </section>
        <section class="author-section">
            <h2 class="section-title">Vetted by Alex</h2>
            <p class="section-subtitle">Principal AI Infrastructure Architect with 10+ years of production-grade automation experience. Every tool in this stack is benchmarked, stress-tested, and deployed in live production before publication. No affiliate-only recommendations.</p>
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
