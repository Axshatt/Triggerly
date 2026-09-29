// ============================================
// DASHBOARD PAGE
// ============================================
import { icons, showToast, timeAgo } from '../ui.js';
import { navigate } from '../router.js';
import { getUser, signOut, getUsageLimit, hasUsageLeft, incrementUsage, setSPConnected } from '../auth.js';
import { getTriggers, getResults, saveResult, trackEvent } from '../store.js';
import { initMCP, isMCPReady } from '../mcp.js';
import { analyzePerformance, chat } from '../ai.js';

export async function renderDashboard() {
  trackEvent('dashboard_view');
  const app = document.getElementById('app');
  const user = getUser();

  const triggers = await getTriggers();
  const results = await getResults();
  const usagePercent = Math.min((user.usage / getUsageLimit()) * 100, 100);
  const usageClass = usagePercent > 90 ? 'danger' : usagePercent > 70 ? 'warning' : '';

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar('overview')}
      <main class="main-content">
        <button class="sidebar-toggle" id="sidebar-toggle">${icons.menu}</button>
        <div class="page-header">
          <h1>Overview</h1>
          <div class="page-header-actions">
            <button class="btn btn-lime btn-sm" id="new-trigger-btn">
              <span class="nav-icon">${icons.plus}</span>
              New Trigger
            </button>
          </div>
        </div>
        <div class="page-body">
          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Active Triggers</span>
              <span class="stat-value">${triggers.filter(t => t.active !== false).length}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Actions Run</span>
              <span class="stat-value">${user.usage || 0}</span>
            </div>
            <div class="stat-card active">
              <span class="stat-label">Results</span>
              <span class="stat-value">${results.length}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Plan</span>
              <span class="stat-value" style="font-size: 1.75rem; text-transform: capitalize;">${user.plan || 'Free'}</span>
            </div>
          </div>

          <div class="dashboard-grid">
            <!-- Left Column -->
            <div>
              <!-- Usage -->
              <div class="card" style="margin-bottom: var(--space-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                  <h4 style="font-family: var(--font-sans); font-weight: 600; font-size: 0.9375rem;">Usage This Month</h4>
                  ${user.plan === 'free' ? `<button class="btn btn-lime btn-sm" id="upgrade-btn">Upgrade</button>` : ''}
                </div>
                <div class="usage-bar-container">
                  <div class="usage-bar-label">
                    <span>${user.usage || 0} of ${getUsageLimit()} actions</span>
                    <span>${Math.round(usagePercent)}%</span>
                  </div>
                  <div class="usage-bar">
                    <div class="usage-bar-fill ${usageClass}" style="width: ${usagePercent}%"></div>
                  </div>
                </div>
                ${!hasUsageLeft() ? `
                  <div style="background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: var(--radius-md); padding: 12px; margin-top: var(--space-md); font-size: 0.875rem; color: var(--color-error);">
                    You've reached your monthly limit. <a href="#/pricing" style="text-decoration: underline; font-weight: 600;">Upgrade to Pro</a> for 100 actions/month.
                  </div>
                ` : ''}
              </div>

              <!-- SuperProfile Connection -->
              ${!user.spConnected ? `
                <div class="connect-card" id="connect-sp" style="margin-bottom: var(--space-lg);">
                  <div style="font-size: 2rem; margin-bottom: var(--space-md);">🔗</div>
                  <h4 style="font-size: 1.125rem; margin-bottom: var(--space-sm);">Connect SuperProfile</h4>
                  <p style="color: var(--color-dark-400); font-size: 0.9375rem; margin-bottom: var(--space-md);">Link your SuperProfile account to start creating triggers and tracking performance.</p>
                  <button class="btn btn-primary btn-sm">Connect Now</button>
                </div>
              ` : `
                <div class="connect-card connected" style="margin-bottom: var(--space-lg);">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="color: var(--color-success); font-size: 1.25rem;">✓</span>
                    <span style="font-weight: 600;">SuperProfile Connected</span>
                  </div>
                </div>
              `}

              <!-- Recent Triggers -->
              <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                  <h4 style="font-family: var(--font-sans); font-weight: 600; font-size: 0.9375rem;">Recent Triggers</h4>
                  <button class="btn btn-ghost btn-sm" onclick="location.hash='#/triggers'">View all</button>
                </div>
                ${triggers.length === 0 ? `
                  <div class="empty-state" style="padding: var(--space-xl) 0;">
                    <div class="empty-icon">⚡</div>
                    <h3 style="font-size: 1.125rem;">No triggers yet</h3>
                    <p style="font-size: 0.875rem;">Create your first trigger to automate product-content linking.</p>
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                    ${triggers.slice(0, 4).map(t => `
                      <div class="trigger-item">
                        <div class="trigger-meta">
                          <div class="trigger-icon">⚡</div>
                          <div class="trigger-info">
                            <h4>${t.name || 'Untitled Trigger'}</h4>
                            <p>${t.productName || 'Product'} → ${t.contentType || 'Content'}</p>
                          </div>
                        </div>
                        <span class="badge badge-dot ${t.active !== false ? 'badge-success' : 'badge-warning'}">${t.active !== false ? 'Active' : 'Paused'}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>

            <!-- Right Column: AI Assistant -->
            <div>
              <div class="ai-chat" style="position: sticky; top: var(--space-xl);">
                <div class="ai-chat-header">
                  <div class="ai-dot"></div>
                  Triggerly AI
                </div>
                <div class="ai-chat-messages" id="ai-messages">
                  <div class="ai-message assistant">
                    👋 Hi${user.username ? ' ' + user.username : ''}! I'm your AI assistant. Ask me about optimizing your triggers or content-product strategy.
                  </div>
                </div>
                <div class="ai-chat-input">
                  <input type="text" id="ai-input" placeholder="Ask about your content strategy..." />
                  <button class="btn btn-primary btn-icon" id="ai-send">${icons.send}</button>
                </div>
              </div>

              <!-- Recent Results -->
              ${results.length > 0 ? `
                <div class="card" style="margin-top: var(--space-lg);">
                  <h4 style="font-family: var(--font-sans); font-weight: 600; font-size: 0.9375rem; margin-bottom: var(--space-md);">Recent Activity</h4>
                  <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                    ${results.slice(0, 5).map(r => `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-dark-50);">
                        <div>
                          <div style="font-size: 0.875rem; font-weight: 500;">${r.action || 'Action'}</div>
                          <div style="font-size: 0.75rem; color: var(--color-dark-400);">${timeAgo(r.createdAt)}</div>
                        </div>
                        <span class="badge badge-dot ${r.status === 'success' ? 'badge-success' : 'badge-error'}">${r.status || 'done'}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  bindDashboardEvents();
}

function bindDashboardEvents() {
  // Sidebar toggle
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
    });
  }

  // New trigger
  const newTrigger = document.getElementById('new-trigger-btn');
  if (newTrigger) {
    newTrigger.addEventListener('click', () => navigate('/triggers'));
  }

  // Upgrade
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => navigate('/pricing'));
  }

  // Connect SuperProfile
  const connectBtn = document.getElementById('connect-sp');
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      connectBtn.innerHTML = '<div class="spinner" style="margin: 0 auto;"></div><p style="margin-top: 12px; font-size: 0.875rem; color: var(--color-dark-400);">Connecting to SuperProfile...</p>';
      
      // Try MCP connection
      await initMCP();
      
      // Mark as connected
      await setSPConnected(true);
      showToast('SuperProfile connected successfully!', 'success');
      trackEvent('sp_connected');
      renderDashboard();
    });
  }

  // AI Chat
  const aiInput = document.getElementById('ai-input');
  const aiSend = document.getElementById('ai-send');
  const aiMessages = document.getElementById('ai-messages');

  const sendAIMessage = async () => {
    const message = aiInput.value.trim();
    if (!message) return;

    // Add user message
    aiMessages.innerHTML += `<div class="ai-message user">${message}</div>`;
    aiInput.value = '';
    aiMessages.scrollTop = aiMessages.scrollHeight;

    // Show typing
    aiMessages.innerHTML += `<div class="ai-message assistant" id="ai-typing"><div class="spinner spinner-lime" style="width:16px;height:16px;"></div> Thinking...</div>`;
    aiMessages.scrollTop = aiMessages.scrollHeight;

    try {
      const response = await chat(message, `User plan: ${getUser().plan}, Usage: ${getUser().usage}/${getUsageLimit()}`);
      const typing = document.getElementById('ai-typing');
      if (typing) typing.remove();
      aiMessages.innerHTML += `<div class="ai-message assistant">${response}</div>`;
    } catch (e) {
      const typing = document.getElementById('ai-typing');
      if (typing) typing.remove();
      aiMessages.innerHTML += `<div class="ai-message assistant">Sorry, I couldn't process that. Please try again.</div>`;
    }
    aiMessages.scrollTop = aiMessages.scrollHeight;
  };

  if (aiSend) aiSend.addEventListener('click', sendAIMessage);
  if (aiInput) aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAIMessage();
  });

  // Sidebar navigation
  bindSidebarNav();
}

// Shared sidebar renderer
export function renderSidebar(activePage) {
  const user = getUser();
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        ${icons.logo}
        Triggerly
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Main</div>
        <a class="nav-item ${activePage === 'overview' ? 'active' : ''}" data-page="dashboard">
          <span class="nav-icon">${icons.overview}</span>
          Overview
        </a>
        <a class="nav-item ${activePage === 'triggers' ? 'active' : ''}" data-page="triggers">
          <span class="nav-icon">${icons.triggers}</span>
          Triggers
        </a>
        <a class="nav-item ${activePage === 'analytics' ? 'active' : ''}" data-page="analytics">
          <span class="nav-icon">${icons.analytics}</span>
          Analytics
        </a>
        <div class="sidebar-section-label">Account</div>
        <a class="nav-item ${activePage === 'pricing' ? 'active' : ''}" data-page="pricing">
          <span class="nav-icon">${icons.products}</span>
          Pricing
        </a>
        <a class="nav-item ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
          <span class="nav-icon">${icons.settings}</span>
          Settings
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebar-user-menu">
          <div class="user-avatar">${user?.avatar || '?'}</div>
          <div class="user-info">
            <div class="user-name">${user?.username || 'User'}</div>
            <div class="user-plan">${(user?.plan || 'free').charAt(0).toUpperCase() + (user?.plan || 'free').slice(1)} Plan</div>
          </div>
        </div>
        <a class="nav-item" id="logout-btn" style="margin-top: 4px; color: var(--color-dark-400);">
          <span class="nav-icon">${icons.logout}</span>
          Log out
        </a>
      </div>
    </aside>
  `;
}

export function bindSidebarNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigate('/' + page);
    });
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut();
      navigate('/');
      showToast('Logged out successfully', 'success');
    });
  }
}
