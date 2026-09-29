// ============================================
// ROUTER — Hash-based SPA routing
// ============================================

const routes = {};
let currentRoute = null;
let beforeRouteChange = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function setBeforeRouteChange(fn) {
  beforeRouteChange = fn;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute;
}

async function handleRouteChange() {
  const hash = window.location.hash.slice(1) || '/';
  const path = hash.split('?')[0];

  if (beforeRouteChange) {
    const allowed = await beforeRouteChange(path);
    if (!allowed) return;
  }

  const handler = routes[path];
  if (handler) {
    currentRoute = path;
    await handler();
  } else {
    // Fallback to landing
    navigate('/');
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}
