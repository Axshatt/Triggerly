// ============================================
// PRICING PAGE (Demo)
// ============================================
import { icons, showToast, showModal } from '../ui.js';
import { navigate } from '../router.js';
import { isAuthenticated, getUser, signIn, updateUserPlan } from '../auth.js';
import { trackEvent } from '../store.js';
import { renderSidebar, bindSidebarNav } from './dashboard.js';

export function renderPricing() {
  trackEvent('pricing_view');
  const app = document.getElementById('app');
  const user = getUser();
  const isLoggedIn = isAuthenticated();

  // If logged in, show within dashboard layout
  if (isLoggedIn) {
    app.innerHTML = `
      <div class="app-layout">
        ${renderSidebar('pricing')}
        <main class="main-content">
          <button class="sidebar-toggle" id="sidebar-toggle">${icons.menu}</button>
          <div class="page-header">
            <h1>Pricing</h1>
          </div>
          <div class="page-body">
            ${renderPricingContent(user)}
          </div>
        </main>
      </div>
    `;

    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) toggle.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
    bindSidebarNav();
  } else {
    // Public pricing page
    app.innerHTML = `
      <nav class="landing-nav">
        <a href="#/" class="nav-logo">
          ${icons.logo}
          Triggerly
        </a>
        <ul class="nav-links">
          <li><a href="#/">Home</a></li>
          <li><a href="#/pricing" style="color: var(--color-dark); font-weight: 600;">Pricing</a></li>
        </ul>
        <div class="nav-actions">
          <button class="btn btn-ghost" id="nav-login">Log in</button>
          <button class="btn btn-primary" id="nav-signup">Start free</button>
        </div>
      </nav>

      <div class="pricing-hero">
        <h1>Simple, honest pricing</h1>
        <p>Start free. Upgrade when you're ready. No surprises.</p>
      </div>

      <div class="pricing-body">
        ${renderPricingContent(null)}
      </div>

      <!-- Comparison Table -->
      <section class="section section-light">
        <div style="max-width: 800px; margin: 0 auto;">
          <h3 style="text-align: center; margin-bottom: var(--space-xl); font-size: 1.75rem;">Compare Plans</h3>
          <table class="data-table" style="background: var(--color-white); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-dark-100);">
            <thead>
              <tr>
                <th>Feature</th>
                <th style="text-align: center;">Free</th>
                <th style="text-align: center; color: var(--color-dark);">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Monthly triggers</td><td style="text-align:center">5</td><td style="text-align:center;font-weight:600">100</td></tr>
              <tr><td>SuperProfile integration</td><td style="text-align:center">✓</td><td style="text-align:center">✓</td></tr>
              <tr><td>AI suggestions</td><td style="text-align:center">Limited</td><td style="text-align:center;font-weight:600">Unlimited</td></tr>
              <tr><td>Analytics dashboard</td><td style="text-align:center">Basic</td><td style="text-align:center;font-weight:600">Advanced</td></tr>
              <tr><td>Bulk operations</td><td style="text-align:center;color:var(--color-dark-300)">—</td><td style="text-align:center">✓</td></tr>
              <tr><td>Export reports</td><td style="text-align:center;color:var(--color-dark-300)">—</td><td style="text-align:center">✓</td></tr>
              <tr><td>Priority support</td><td style="text-align:center;color:var(--color-dark-300)">—</td><td style="text-align:center">✓</td></tr>
              <tr><td>AI performance analysis</td><td style="text-align:center;color:var(--color-dark-300)">—</td><td style="text-align:center">✓</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- FAQ mini -->
      <section class="section">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h3 style="margin-bottom: var(--space-lg);">Questions about pricing?</h3>
          <p style="color: var(--color-dark-400); margin-bottom: var(--space-xl); line-height: 1.7;">
            We keep it simple. Start free, upgrade when you need more triggers. Cancel anytime. 
            No hidden fees, no long-term contracts.
          </p>
          <button class="btn btn-primary" id="pricing-cta-bottom">Get Started Free</button>
        </div>
      </section>

      <footer class="landing-footer">
        <p>© ${new Date().getFullYear()} Triggerly. Built for SuperProfile creators.</p>
      </footer>
    `;

    // Auth buttons
    const loginBtn = document.getElementById('nav-login');
    const signupBtn = document.getElementById('nav-signup');
    const ctaBottom = document.getElementById('pricing-cta-bottom');

    [loginBtn, signupBtn, ctaBottom].forEach(btn => {
      if (btn) btn.addEventListener('click', async () => {
        await signIn();
        if (isAuthenticated()) navigate('/dashboard');
      });
    });
  }

  bindPricingEvents();
}

function renderPricingContent(user) {
  const currentPlan = user?.plan || 'free';

  return `
    <div class="pricing-grid" style="margin-top: var(--space-xl);">
      <!-- Free Plan -->
      <div class="pricing-card ${currentPlan === 'free' ? '' : ''}">
        <div class="plan-name">Free</div>
        <div class="plan-desc">Perfect for getting started</div>
        <div class="plan-price">
          <span class="amount">₹0</span>
          <span class="period"> / month</span>
        </div>
        <ul class="plan-features">
          <li>5 triggers per month</li>
          <li>Basic analytics</li>
          <li>SuperProfile integration</li>
          <li>AI suggestions (limited)</li>
          <li>Email support</li>
        </ul>
        ${currentPlan === 'free' 
          ? `<button class="btn btn-outline" disabled>Current Plan</button>`
          : `<button class="btn btn-outline pricing-select" data-plan="free">Switch to Free</button>`
        }
      </div>

      <!-- Pro Plan -->
      <div class="pricing-card popular">
        <div class="plan-name">Pro</div>
        <div class="plan-desc">For serious creators</div>
        <div class="plan-price">
          <span class="amount">₹999</span>
          <span class="period"> / month</span>
        </div>
        <ul class="plan-features">
          <li>100 triggers per month</li>
          <li>Advanced analytics</li>
          <li>SuperProfile integration</li>
          <li>Unlimited AI insights</li>
          <li>Priority support</li>
          <li>Bulk operations</li>
          <li>Export reports</li>
        </ul>
        ${currentPlan === 'pro'
          ? `<button class="btn btn-lime" disabled>Current Plan</button>`
          : `<button class="btn btn-lime pricing-select" data-plan="pro">Start 14-day trial</button>`
        }
      </div>
    </div>

    ${currentPlan === 'pro' ? `
      <div style="text-align: center; margin-top: var(--space-xl);">
        <div class="badge badge-success badge-dot" style="font-size: 0.875rem; padding: 8px 20px;">You're on the Pro plan</div>
      </div>
    ` : ''}
  `;
}

function bindPricingEvents() {
  document.querySelectorAll('.pricing-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      
      if (!isAuthenticated()) {
        signIn().then(() => {
          if (isAuthenticated()) navigate('/pricing');
        });
        return;
      }

      if (plan === 'pro') {
        showDemoCheckout();
      } else {
        handlePlanChange('free');
      }
    });
  });
}

function showDemoCheckout() {
  trackEvent('checkout_started');
  
  showModal('Upgrade to Pro', `
    <div style="text-align: center; margin-bottom: var(--space-lg);">
      <div style="font-family: var(--font-serif); font-size: 2.5rem; margin-bottom: var(--space-sm);">₹999<span style="font-size: 1rem; color: var(--color-dark-400);">/month</span></div>
      <p style="color: var(--color-dark-400); font-size: 0.9375rem;">14-day free trial included</p>
    </div>

    <div style="background: rgba(var(--color-lime-rgb), 0.08); border: 1px solid rgba(var(--color-lime-rgb), 0.2); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg);">
      <p style="font-size: 0.875rem; color: var(--color-dark-500); text-align: center;">
        🎉 <strong>Demo Mode</strong> — Payment integration coming soon. Click below to activate Pro features for testing.
      </p>
    </div>

    <div style="border: 1px solid var(--color-dark-100); border-radius: var(--radius-md); padding: var(--space-md);">
      <div class="form-group" style="margin-bottom: var(--space-md);">
        <label>Card Number</label>
        <input type="text" value="4242 4242 4242 4242" disabled style="background: var(--color-dark-50);" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
        <div class="form-group" style="margin-bottom: 0;">
          <label>Expiry</label>
          <input type="text" value="12/28" disabled style="background: var(--color-dark-50);" />
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label>CVC</label>
          <input type="text" value="123" disabled style="background: var(--color-dark-50);" />
        </div>
      </div>
    </div>
  `, [
    { id: 'modal-cancel', label: 'Cancel', class: 'btn btn-outline' },
    { id: 'modal-pay', label: 'Activate Pro (Demo)', class: 'btn btn-lime', closeOnClick: false, onClick: async () => {
      const payBtn = document.getElementById('modal-pay');
      payBtn.disabled = true;
      payBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Processing...';
      
      // Simulate payment processing
      await new Promise(r => setTimeout(r, 2000));
      
      await handlePlanChange('pro');
      trackEvent('payment_success');
      
      const { closeModal } = await import('../ui.js');
      closeModal();
      
      showToast('🎉 Pro plan activated! Enjoy your upgraded features.', 'success');
      renderPricing();
    }}
  ]);
}

async function handlePlanChange(plan) {
  await updateUserPlan(plan);
  trackEvent('upgrade', { plan });
  showToast(`Switched to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`, 'success');
}
