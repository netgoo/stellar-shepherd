class SubscribeBox extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="lead-magnet-box subscribe-component">
        <div class="subscribe-content">
          <span class="meta-tag">ENGINEERED BY ALEX — PRINCIPAL AI INFRASTRUCTURE ARCHITECT</span>
          <h2>Get the Blueprints That Kill 429s &amp; Cut SaaS Tax by 83%</h2>
          <p class="subscribe-lede">Tired of rate limits burning your domain, 504 timeouts stalling your pipelines, and per-seat SaaS fees eating your margins? Every week, Alex publishes one production-grade blueprint and one failure protocol—battle-tested in live deployment, with raw JSON payloads and n8n workflow exports you can import today.</p>
          
          <ul class="subscribe-benefits">
            <li>Raw JSON payloads &amp; n8n workflow export files</li>
            <li>429/504 rate-limit backoff &amp; recovery protocols</li>
            <li>7-core stack cost benchmarks (Make vs n8n vs Zapier)</li>
            <li>MCP bridge schemas &amp; Zero-Glue architecture patterns</li>
          </ul>
          
          <form id="global-subscribe-form" class="subscribe-form">
            <input 
              type="email" 
              id="subscriber-email" 
              placeholder="Enter your business email..." 
              required 
            />
            <button type="submit" id="sub-submit-btn" class="sub-cta-btn">Get Weekly Blueprints &rarr;</button>
          </form>
          <p class="subscribe-fineprint">No fluff. No spam. Unsubscribe anytime.</p>
          <p id="sub-status-msg" class="sub-status hidden"></p>
        </div>
      </section>
      <style>
        .subscribe-component {
          margin: 3rem auto;
          padding: 2.5rem 2rem;
          text-align: center;
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          max-width: 820px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .subscribe-content .meta-tag {
          font-size: 0.8rem;
          color: #3B82F6;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .subscribe-content h2 {
          margin: 0.8rem 0 0.75rem 0;
          font-size: 1.55rem;
          color: #ffffff;
          font-weight: 700;
          line-height: 1.35;
        }
        .subscribe-content .subscribe-lede {
          color: #9CA3AF;
          font-size: 0.92rem;
          margin-bottom: 1.25rem;
          line-height: 1.65;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }
        .subscribe-benefits {
          list-style: none;
          padding: 0;
          margin: 0 auto 1.5rem auto;
          text-align: left;
          max-width: 480px;
        }
        .subscribe-benefits li {
          color: #D1D5DB;
          font-size: 0.88rem;
          padding: 0.3rem 0 0.3rem 1.5rem;
          position: relative;
          line-height: 1.4;
        }
        .subscribe-benefits li::before {
          content: "\\2713";
          position: absolute;
          left: 0;
          color: #F3C653;
          font-weight: 700;
        }
        .subscribe-form {
          display: flex;
          gap: 12px;
          justify-content: center;
          max-width: 580px;
          margin: 0 auto;
        }
        .subscribe-form input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: #0B0F19;
          color: #ffffff;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .subscribe-form input:focus {
          border-color: #F3C653;
        }
        .subscribe-form .sub-cta-btn {
          background-color: #F3C653 !important;
          color: #000000 !important;
          font-weight: 700 !important;
          padding: 12px 20px !important;
          border-radius: 6px !important;
          border: none !important;
          cursor: pointer !important;
          font-size: 0.95rem !important;
          white-space: nowrap !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 0 15px rgba(243, 198, 83, 0.2) !important;
        }
        .subscribe-form .sub-cta-btn:hover {
          background-color: #e0b342 !important;
          transform: translateY(-1px);
        }
        .subscribe-form .sub-cta-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .subscribe-fineprint {
          color: #6B7280;
          font-size: 0.8rem;
          margin-top: 0.75rem;
          margin-bottom: 0;
        }
        .sub-status {
          margin-top: 1rem;
          font-size: 0.9rem;
        }
        .sub-status.hidden { display: none; }
        .sub-status.success { color: #4ade80; }
        .sub-status.error { color: #f87171; }
        @media (max-width: 640px) {
          .subscribe-form {
            flex-direction: column;
          }
          .subscribe-content h2 {
            font-size: 1.3rem;
          }
        }
      </style>
    `;
    const form = this.querySelector('#global-subscribe-form');
    const statusMsg = this.querySelector('#sub-status-msg');
    const submitBtn = this.querySelector('#sub-submit-btn');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = this.querySelector('#subscriber-email');
        const email = emailInput.value;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Subscribing...';
        statusMsg.className = 'sub-status hidden';
        try {
          const res = await fetch('/api/subscribe/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
            statusMsg.innerText = "You're in. Check your inbox for the first blueprint.";
            statusMsg.className = 'sub-status success';
            emailInput.value = '';
          } else {
            statusMsg.innerText = 'Subscription failed. Please try again later.';
            statusMsg.className = 'sub-status error';
          }
        } catch (err) {
          statusMsg.innerText = 'Network error. Please check your connection.';
          statusMsg.className = 'sub-status error';
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Get Weekly Blueprints →';
        }
      });
    }
  }
}
if (!customElements.get('subscribe-box')) {
  customElements.define('subscribe-box', SubscribeBox);
}
