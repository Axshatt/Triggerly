// ============================================
// LANDING PAGE
// ============================================
import { icons } from '../ui.js';
import { navigate } from '../router.js';
import { isAuthenticated, signIn } from '../auth.js';
import { trackEvent } from '../store.js';

export function renderLanding() {
  trackEvent('landing_view');
  const app = document.getElementById('app');

  app.innerHTML = `
    <!-- Navigation -->
    <nav class="landing-nav" id="landing-nav">
      <a href="#/" class="nav-logo">
        ${icons.logo}
        Triggerly
      </a>
      <ul class="nav-links">
        <li><a href="#/pricing">Pricing</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#how-it-works">How it works</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
      <div class="nav-actions">
        ${isAuthenticated() 
          ? `<button class="btn btn-lime" id="nav-dashboard">Dashboard</button>`
          : `<button class="btn btn-ghost" id="nav-login">Log in</button>
             <button class="btn btn-primary" id="nav-signup">Start free</button>`
        }
        <button class="mobile-nav-toggle" id="mobile-menu">${icons.menu}</button>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <span class="hero-badge">⚡ Built for SuperProfile Creators</span>
      <h1>Automate your <span class="highlight">content workflows</span> with AI</h1>
      <p class="hero-subtitle">
        Stop manually adding products to content. Triggerly automates your SuperProfile 
        workflows and shows you exactly which content drives purchases.
      </p>
      <div class="hero-actions">
        <button class="btn btn-lime btn-lg" id="hero-cta">
          Try it free
          <span style="font-size:1.1em">→</span>
        </button>
        <button class="btn btn-outline btn-lg" id="hero-demo" onclick="document.getElementById('how-it-works').scrollIntoView({behavior:'smooth'})">
          See how it works
        </button>
      </div>
      <div class="hero-visual">
        <div style="background: var(--color-light); padding: 32px; border-radius: 16px;">
          <div style="display: flex; gap: 16px; margin-bottom: 24px;">
            <div style="background: var(--color-white); border: 1px solid var(--color-dark-100); border-radius: 12px; padding: 20px; flex: 1;">
              <div style="font-size: 0.75rem; color: var(--color-dark-400); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Active Triggers</div>
              <div style="font-family: var(--font-serif); font-size: 2.5rem;">12</div>
            </div>
            <div style="background: var(--color-white); border: 1px solid var(--color-dark-100); border-radius: 12px; padding: 20px; flex: 1;">
              <div style="font-size: 0.75rem; color: var(--color-dark-400); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Products Linked</div>
              <div style="font-family: var(--font-serif); font-size: 2.5rem;">34</div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(200,252,126,0.15), rgba(200,252,126,0.05)); border: 1px solid var(--color-lime); border-radius: 12px; padding: 20px; flex: 1;">
              <div style="font-size: 0.75rem; color: var(--color-dark-400); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Conversions</div>
              <div style="font-family: var(--font-serif); font-size: 2.5rem; color: var(--color-dark);">87</div>
            </div>
            <div style="background: var(--color-white); border: 1px solid var(--color-dark-100); border-radius: 12px; padding: 20px; flex: 1;">
              <div style="font-size: 0.75rem; color: var(--color-dark-400); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Revenue</div>
              <div style="font-family: var(--font-serif); font-size: 2.5rem;">₹24K</div>
            </div>
          </div>
          <div style="background: var(--color-white); border: 1px solid var(--color-dark-100); border-radius: 12px; padding: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <div style="width: 8px; height: 8px; background: var(--color-lime); border-radius: 50%;"></div>
              <span style="font-weight: 600; font-size: 0.875rem;">AI Assistant</span>
            </div>
            <div style="background: var(--color-light); border-radius: 8px; padding: 12px 16px; font-size: 0.9375rem; color: var(--color-dark-500); line-height: 1.6;">
              Your "Web Dev Masterclass" product performs 3x better when linked to tutorial content. 
              I recommend creating a trigger to auto-link it to all new tutorial posts.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem -->
    <section class="section section-dark" id="problem">
      <div class="section-header">
        <span class="label" style="color: var(--color-lime);">The Problem</span>
        <h2 style="color: var(--color-white);">You're doing too much manually</h2>
        <p style="color: rgba(255,255,255,0.6);">
          Every time you create content, you repeat the same tedious steps. 
          Every insight about what works requires manual tracking.
        </p>
      </div>
      <div class="problem-grid">
        <div class="problem-card">
          <div class="icon">🔄</div>
          <h4>Repetitive Setup</h4>
          <p>Manually adding products to every piece of content, over and over again. Hours wasted on copy-paste work.</p>
        </div>
        <div class="problem-card">
          <div class="icon">📊</div>
          <h4>No Performance Data</h4>
          <p>Which content actually drives purchases? Without tracking, you're guessing which product-content combos work.</p>
        </div>
        <div class="problem-card">
          <div class="icon">⏰</div>
          <h4>Time Drain</h4>
          <p>Time spent on repetitive admin work is time not spent creating content that actually grows your audience.</p>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="section" id="how-it-works">
      <div class="section-header">
        <span class="label">How it Works</span>
        <h2>Three steps to automation</h2>
        <p>Connect your SuperProfile, set up triggers, and let Triggerly do the rest.</p>
      </div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <h4>Connect</h4>
          <p>Link your SuperProfile account in one click. Triggerly syncs your products and content automatically.</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h4>Automate</h4>
          <p>Create triggers that automatically link products to content. AI suggests the best pairings.</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h4>Track</h4>
          <p>See exactly which content-product combinations drive the most purchases and revenue.</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section section-light" id="features">
      <div class="section-header">
        <span class="label">Features</span>
        <h2>Everything you need to grow</h2>
        <p>Powerful automation tools designed specifically for SuperProfile creators.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">⚡</div>
          <h4>Smart Triggers</h4>
          <p>Set rules that automatically link products to content based on categories, tags, or AI recommendations.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🤖</div>
          <h4>AI Insights</h4>
          <p>Get intelligent suggestions on which product-content pairings will drive the most conversions.</p>
        </div>
        <div class="feature-card">
          <div class="icon">📈</div>
          <h4>Performance Dashboard</h4>
          <p>Track clicks, conversions, and revenue across all your content-product combinations in real time.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🔗</div>
          <h4>SuperProfile Integration</h4>
          <p>Direct integration with SuperProfile via MCP. Your products and content stay perfectly in sync.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🎯</div>
          <h4>Conversion Tracking</h4>
          <p>Know exactly which piece of content drove each purchase. Make data-driven decisions about your strategy.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🚀</div>
          <h4>Bulk Actions</h4>
          <p>Apply triggers to multiple content pieces at once. Save hours of repetitive manual work.</p>
        </div>
      </div>
    </section>

    <!-- Pricing Preview -->
    <section class="section" id="pricing">
      <div class="section-header">
        <span class="label">Pricing</span>
        <h2>Simple, transparent pricing</h2>
        <p>Start free. Upgrade when you need more.</p>
      </div>
      <div class="pricing-grid">
        <div class="pricing-card">
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
          <button class="btn btn-outline" id="pricing-free">Get started</button>
        </div>
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
          <button class="btn btn-lime" id="pricing-pro">Start 14-day trial</button>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section section-light" id="faq">
      <div class="section-header">
        <span class="label">FAQ</span>
        <h2>Questions? Answers.</h2>
      </div>
      <div class="faq-list">
        <div class="faq-item">
          <button class="faq-question">
            What does Triggerly do?
            <span class="faq-chevron">${icons.chevron}</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              Triggerly automates the process of linking digital products to your content on SuperProfile. 
              Instead of manually adding products to each piece of content, you set up triggers that do it 
              automatically. Plus, you get analytics showing which content-product combos drive the most purchases.
            </div>
          </div>
        </div>
        <div class="faq-item">
          <button class="faq-question">
            Who is it for?
            <span class="faq-chevron">${icons.chevron}</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              Triggerly is built for SuperProfile creators — especially educational content creators who have 
              multiple digital products and want to understand which content drives purchases.
            </div>
          </div>
        </div>
        <div class="faq-item">
          <button class="faq-question">
            How does the SuperProfile integration work?
            <span class="faq-chevron">${icons.chevron}</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              Triggerly connects directly to SuperProfile through their official MCP (Model Context Protocol) API. 
              Once connected, we sync your products and content, allowing triggers to work seamlessly.
            </div>
          </div>
        </div>
        <div class="faq-item">
          <button class="faq-question">
            Is there a free plan?
            <span class="faq-chevron">${icons.chevron}</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              Yes! The free plan includes 5 trigger actions per month, basic analytics, and SuperProfile integration. 
              It's a great way to try Triggerly and see the value before upgrading.
            </div>
          </div>
        </div>
        <div class="faq-item">
          <button class="faq-question">
            How does billing work?
            <span class="faq-chevron">${icons.chevron}</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              Pro plans are billed monthly. You can upgrade, downgrade, or cancel anytime. 
              We offer a 14-day free trial on all Pro plans — no credit card required to start.
            </div>
          </div>
        </div>
        <div class="faq-item">
          <button class="faq-question">
            How can I get support?
            <span class="faq-chevron">${icons.chevron}</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              Free plan users get email support. Pro plan users get priority support with faster response times. 
              You can also use the AI assistant inside the dashboard for quick help.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <h2>Ready to automate your workflow?</h2>
      <p>Join creators who are saving hours every week with Triggerly.</p>
      <button class="btn btn-lime btn-lg" id="cta-bottom" style="position:relative">
        Start for free — no credit card needed
      </button>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <p>© ${new Date().getFullYear()} Triggerly. Built for SuperProfile creators.</p>
    </footer>
  `;

  // Event listeners
  bindLandingEvents();
  initScrollEffects();
}

function bindLandingEvents() {
  // Auth buttons
  const loginBtn = document.getElementById('nav-login');
  const signupBtn = document.getElementById('nav-signup');
  const heroCta = document.getElementById('hero-cta');
  const ctaBottom = document.getElementById('cta-bottom');
  const dashBtn = document.getElementById('nav-dashboard');
  const freeBtn = document.getElementById('pricing-free');
  const proBtn = document.getElementById('pricing-pro');

  const handleAuth = async () => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    } else {
      await signIn();
      if (isAuthenticated()) {
        trackEvent('signup');
        navigate('/dashboard');
      }
    }
  };

  [loginBtn, signupBtn, heroCta, ctaBottom, freeBtn, proBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', handleAuth);
  });

  if (dashBtn) dashBtn.addEventListener('click', () => navigate('/dashboard'));

  // FAQ toggles
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Mobile menu
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

function initScrollEffects() {
  const nav = document.getElementById('landing-nav');
  if (!nav) return;

  const observer = new IntersectionObserver((entries) => {
    // Animate elements on scroll
  }, { threshold: 0.1 });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}
