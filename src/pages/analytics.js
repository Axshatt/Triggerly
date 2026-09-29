// ============================================
// ANALYTICS PAGE
// ============================================
import { icons, showToast } from '../ui.js';
import { getUser, getUsageLimit } from '../auth.js';
import { getTriggers, getResults, getEvents, trackEvent } from '../store.js';
import { renderSidebar, bindSidebarNav } from './dashboard.js';
import { analyzePerformance } from '../ai.js';

export async function renderAnalytics() {
  trackEvent('analytics_view');
  const app = document.getElementById('app');
  const user = getUser();
  const triggers = await getTriggers();
  const results = await getResults();
  const events = await getEvents();

  const successResults = results.filter(r => r.status === 'success');
  const successRate = results.length > 0 ? Math.round((successResults.length / results.length) * 100) : 0;
  
  // Group results by day for chart
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayResults = results.filter(r => r.createdAt && r.createdAt.startsWith(dateStr));
    last7Days.push({
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      count: dayResults.length
    });
  }
  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar('analytics')}
      <main class="main-content">
        <button class="sidebar-toggle" id="sidebar-toggle">${icons.menu}</button>
        <div class="page-header">
          <h1>Analytics</h1>
          <div class="page-header-actions">
            <button class="btn btn-outline btn-sm" id="ai-analyze-btn">
              🤖 AI Analysis
            </button>
          </div>
        </div>
        <div class="page-body">
          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Total Actions</span>
              <span class="stat-value">${results.length}</span>
            </div>
            <div class="stat-card active">
              <span class="stat-label">Success Rate</span>
              <span class="stat-value">${successRate}%</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Active Triggers</span>
              <span class="stat-value">${triggers.filter(t => t.active !== false).length}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Remaining</span>
              <span class="stat-value">${Math.max(0, getUsageLimit() - (user.usage || 0))}</span>
            </div>
          </div>

          <div class="dashboard-grid">
            <!-- Activity Chart -->
            <div class="card">
              <h4 style="font-family: var(--font-sans); font-weight: 600; font-size: 0.9375rem; margin-bottom: var(--space-lg);">Activity — Last 7 Days</h4>
              <div style="display: flex; align-items: flex-end; gap: 12px; height: 200px; padding: 0 8px;">
                ${last7Days.map(d => `
                  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%;">
                    <div style="flex: 1; width: 100%; display: flex; align-items: flex-end;">
                      <div style="
                        width: 100%;
                        height: ${d.count > 0 ? Math.max(12, (d.count / maxCount) * 100) : 4}%;
                        background: ${d.count > 0 ? 'var(--color-lime)' : 'var(--color-dark-100)'};
                        border-radius: 6px 6px 2px 2px;
                        transition: height 0.5s ease;
                        position: relative;
                      ">
                        ${d.count > 0 ? `<span style="position: absolute; top: -24px; left: 50%; transform: translateX(-50%); font-size: 0.8125rem; font-weight: 600;">${d.count}</span>` : ''}
                      </div>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--color-dark-400);">${d.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Trigger Performance -->
            <div class="card">
              <h4 style="font-family: var(--font-sans); font-weight: 600; font-size: 0.9375rem; margin-bottom: var(--space-lg);">Trigger Performance</h4>
              ${triggers.length === 0 ? `
                <div style="text-align: center; padding: var(--space-xl) 0; color: var(--color-dark-400); font-size: 0.9375rem;">
                  <p>No triggers to analyze yet.</p>
                  <button class="btn btn-lime btn-sm" style="margin-top: var(--space-md);" onclick="location.hash='#/triggers'">Create a trigger</button>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                  ${triggers.map(t => {
                    const triggerResults = results.filter(r => r.triggerId === t.id);
                    const triggerSuccess = triggerResults.filter(r => r.status === 'success').length;
                    const rate = triggerResults.length > 0 ? Math.round((triggerSuccess / triggerResults.length) * 100) : 0;
                    return `
                      <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                          <span style="font-size: 0.875rem; font-weight: 500;">${t.name || 'Untitled'}</span>
                          <span style="font-size: 0.8125rem; color: var(--color-dark-400);">${triggerResults.length} runs</span>
                        </div>
                        <div class="usage-bar">
                          <div class="usage-bar-fill" style="width: ${rate}%; background: ${rate > 70 ? 'var(--color-success)' : rate > 40 ? 'var(--color-warning)' : 'var(--color-error)'}"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <!-- Recent Events -->
            <div class="card dashboard-grid-full">
              <h4 style="font-family: var(--font-sans); font-weight: 600; font-size: 0.9375rem; margin-bottom: var(--space-lg);">Event Log</h4>
              ${events.length === 0 ? `
                <p style="color: var(--color-dark-400); text-align: center; padding: var(--space-lg);">No events recorded yet. Start using Triggerly to see activity here.</p>
              ` : `
                <div style="max-height: 300px; overflow-y: auto;">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Details</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${events.slice(-20).reverse().map(e => `
                        <tr>
                          <td><span class="badge badge-lime">${e.event}</span></td>
                          <td style="color: var(--color-dark-400); font-size: 0.8125rem;">${JSON.stringify(e.data || {}).slice(0, 60)}</td>
                          <td style="font-size: 0.8125rem; color: var(--color-dark-400); white-space: nowrap;">${new Date(e.timestamp).toLocaleString()}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>

          <!-- AI Analysis -->
          <div id="ai-analysis-result" style="margin-top: var(--space-lg); display: none;">
            <div class="card">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-md);">
                <div style="width: 8px; height: 8px; background: var(--color-lime); border-radius: 50%;"></div>
                <h4 style="font-family: var(--font-sans); font-weight: 600; font-size: 0.9375rem;">AI Performance Analysis</h4>
              </div>
              <div id="ai-analysis-content" style="white-space: pre-wrap; font-size: 0.9375rem; line-height: 1.7; color: var(--color-dark-500);"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  bindAnalyticsEvents(triggers, results);
}

function bindAnalyticsEvents(triggers, results) {
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) toggle.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  bindSidebarNav();

  const analyzeBtn = document.getElementById('ai-analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div> Analyzing...';

      const analysis = await analyzePerformance(triggers, results);
      
      const resultDiv = document.getElementById('ai-analysis-result');
      const contentDiv = document.getElementById('ai-analysis-content');
      if (resultDiv && contentDiv) {
        contentDiv.textContent = analysis;
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
      }

      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '🤖 AI Analysis';
    });
  }
}
