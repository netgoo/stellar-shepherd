class SubscribeBox extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="lead-magnet-box subscribe-component">
        <div class="subscribe-content">
          <span class="meta-tag">EXCLUSIVELY FOR AI ARCHITECTS & SMBs</span>
          <h2>Get 1-Click AI Automation Blueprints</h2>
          <p>Join 2,000+ engineers receiving weekly production-ready Make/Zapier JSONs, ROI breakdown models, and zero-spam AI Agent workflows.</p>
          
          <form id="global-subscribe-form" class="subscribe-form">
            <input 
              type="email" 
              id="subscriber-email" 
              placeholder="Enter your business email..." 
              required 
            />
            <button type="submit" id="sub-submit-btn" class="cta-btn">Get Free Blueprints &rarr;</button>
          </form>
          <p id="sub-status-msg" class="sub-status hidden"></p>
        </div>
      </section>
      <style>
        .subscribe-component {
          margin: 3rem auto;
          padding: 2.5rem 2rem;
          text-align: center;
          background: var(--bg-card, #121212);
          border: 1px solid var(--border-color, #222);
          border-radius: 12px;
          max-width: 820px;
        }
        .subscribe-content h2 {
          margin: 0.8rem 0 0.5rem 0;
          font-size: 1.6rem;
          color: #fff;
        }
        .subscribe-content p {
          color: #a0a0a0;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
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
          border: 1px solid #333;
          background: #0a0a0a;
          color: #fff;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .subscribe-form input:focus {
          border-color: var(--accent-gold, #f3c653);
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
          const res = await fetch('/api/subscribe.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await res.json();

          if (res.ok && data.status === 'success') {
            statusMsg.innerText = '🎉 Success! Check your inbox for upcoming blueprints.';
            statusMsg.className = 'sub-status success';
            emailInput.value = '';
          } else {
            statusMsg.innerText = '❌ Subscription failed. Please try again later.';
            statusMsg.className = 'sub-status error';
          }
        } catch (err) {
          statusMsg.innerText = '❌ Network error. Please check your connection.';
          statusMsg.className = 'sub-status error';
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Get Free Blueprints →';
        }
      });
    }
  }
}

customElements.define('subscribe-box', SubscribeBox);
