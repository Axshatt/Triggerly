// ============================================
// MAIN — App Entry Point
// ============================================
import './style.css';
import { initRouter, registerRoute, navigate, setBeforeRouteChange } from './router.js';
import { checkAuth, isAuthenticated, onAuthChange } from './auth.js';
import { renderLanding } from './pages/landing.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderTriggers } from './pages/triggers.js';
import { renderAnalytics } from './pages/analytics.js';
import { renderPricing } from './pages/pricing.js';
import { renderSettings } from './pages/settings.js';

// Protected routes
const protectedRoutes = ['/dashboard', '/triggers', '/analytics', '/settings'];

// Route guard
setBeforeRouteChange(async (path) => {
  if (protectedRoutes.includes(path) && !isAuthenticated()) {
    navigate('/');
    return false;
  }
  return true;
});

// Register routes
registerRoute('/', renderLanding);
registerRoute('/dashboard', renderDashboard);
registerRoute('/triggers', renderTriggers);
registerRoute('/analytics', renderAnalytics);
registerRoute('/pricing', renderPricing);
registerRoute('/settings', renderSettings);

// Boot
async function boot() {
  // Show loading
  document.getElementById('app').innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p style="color: var(--color-dark-400); font-size: 0.9375rem;">Loading Triggerly...</p>
    </div>
  `;

  // Check auth state
  await checkAuth();

  // Initialize router
  initRouter();
}

// Start the app
boot();
