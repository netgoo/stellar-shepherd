class SubscribeBox extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="lead-magnet-box subscribe-component">
        <div class="subscribe-content">
          <span class="meta-tag">EXCLUSIVELY FOR SMBS & AI ARCHITECTS</span>
          <h2>Get Production-Ready AI Automation Insights</h2>
          <p>Join 2,000+ business leaders receiving high-ROI automation breakdowns, tool stack reviews, and agentic workflows. Zero spam.</p>
          
          <form id="global-subscribe-form" class="subscribe-form">
            <input 
              type="email" 
              id="subscriber-email" 
              placeholder="Enter your business email..." 
              required 
            />
            <button type="submit" id="sub-submit-btn" class="sub-cta-btn">Get Free Blueprints &rarr;</button>
          </form>
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
          margin: 0.8rem 0 0.5rem 0;
          font-size: 1.6rem;
          color: #ffffff;
          font-weight: 700;
        }
        .subscribe-content p {
          color: #9CA3AF;
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
         
          const res = await fetch('/api/subscribe/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await res.json();

          if (res.ok && data.status === 'success') {
            statusMsg.innerText = "🎉 You're in! Email sent, please check your inbox or spam folder.";
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

if (!customElements.get('subscribe-box')) {
  customElements.define('subscribe-box', SubscribeBox);
}
