// ============================================
// SETTINGS PAGE
// ============================================
import { icons, showToast } from '../ui.js';
import { getUser, signOut, setSPConnected } from '../auth.js';
import { navigate } from '../router.js';
import { trackEvent } from '../store.js';
import { renderSidebar, bindSidebarNav } from './dashboard.js';
import { initMCP, isMCPReady } from '../mcp.js';

export async function renderSettings() {
  const app = document.getElementById('app');
  const user = getUser();

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar('settings')}
      <main class="main-content">
        <button class="sidebar-toggle" id="sidebar-toggle">${icons.menu}</button>
        <div class="page-header">
          <h1>Settings</h1>
        </div>
        <div class="page-body" style="max-width: 700px;">
          <!-- Account -->
          <div class="settings-section">
            <h3>Account</h3>
            <p>Your account information.</p>
            <div class="form-group">
              <label>Username</label>
              <input type="text" value="${user?.username || ''}" disabled style="background: var(--color-dark-50);" />
              <div class="form-hint">Managed by Puter authentication.</div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="text" value="${user?.email || ''}" disabled style="background: var(--color-dark-50);" />
            </div>
          </div>

          <!-- Plan -->
          <div class="settings-section">
            <h3>Plan & Billing</h3>
            <p>Manage your subscription.</p>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); background: var(--color-light); border-radius: var(--radius-md);">
              <div>
                <div style="font-weight: 600; font-size: 1rem; text-transform: capitalize;">${user?.plan || 'Free'} Plan</div>
                <div style="font-size: 0.8125rem; color: var(--color-dark-400);">
                  ${user?.plan === 'pro' ? '100 triggers/month · Unlimited AI · Priority support' : '5 triggers/month · Basic features'}
                </div>
              </div>
              ${user?.plan !== 'pro' 
                ? `<button class="btn btn-lime btn-sm" onclick="location.hash='#/pricing'">Upgrade</button>`
                : `<span class="badge badge-success badge-dot">Active</span>`
              }
            </div>
          </div>

          <!-- SuperProfile Integration -->
          <div class="settings-section">
            <h3>SuperProfile Integration</h3>
            <p>Connect your SuperProfile account to enable triggers.</p>
            <div style="padding: var(--space-md); border: 1px solid ${user?.spConnected ? 'var(--color-success)' : 'var(--color-dark-200)'}; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: ${user?.spConnected ? 'rgba(52,211,153,0.1)' : 'var(--color-light)'}; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;">
                  ${user?.spConnected ? '✓' : '🔗'}
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 0.9375rem;">${user?.spConnected ? 'Connected' : 'Not Connected'}</div>
                  <div style="font-size: 0.8125rem; color: var(--color-dark-400);">MCP endpoint: mcp.superprofile.bio</div>
                </div>
              </div>
              <button class="btn btn-sm ${user?.spConnected ? 'btn-outline' : 'btn-primary'}" id="sp-connect-btn">
                ${user?.spConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="settings-section" style="border-color: rgba(248,113,113,0.3);">
            <h3 style="color: var(--color-error);">Danger Zone</h3>
            <p>Irreversible actions.</p>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 500; font-size: 0.9375rem;">Sign Out</div>
                <div style="font-size: 0.8125rem; color: var(--color-dark-400);">Sign out of your account on this device.</div>
              </div>
              <button class="btn btn-outline btn-sm" id="settings-logout" style="border-color: var(--color-error); color: var(--color-error);">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  bindSettingsEvents();
}

function bindSettingsEvents() {
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) toggle.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  bindSidebarNav();

  // SP Connect/Disconnect
  const spBtn = document.getElementById('sp-connect-btn');
  if (spBtn) {
    spBtn.addEventListener('click', async () => {
      const user = getUser();
      if (user?.spConnected) {
        await setSPConnected(false);
        showToast('SuperProfile disconnected', 'success');
      } else {
        spBtn.disabled = true;
        spBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div>';
        await initMCP();
        await setSPConnected(true);
        showToast('SuperProfile connected!', 'success');
        trackEvent('sp_connected');
      }
      renderSettings();
    });
  }

  // Logout
  const logoutBtn = document.getElementById('settings-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut();
      navigate('/');
      showToast('Signed out successfully', 'success');
    });
  }
}
