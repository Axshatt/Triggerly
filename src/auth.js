// ============================================
// AUTH — Puter Authentication
// ============================================

let currentUser = null;
let authListeners = [];

export function onAuthChange(fn) {
  authListeners.push(fn);
}

function notifyAuthListeners() {
  authListeners.forEach(fn => fn(currentUser));
}

export function getUser() {
  return currentUser;
}

export function isAuthenticated() {
  return currentUser !== null;
}

export async function checkAuth() {
  try {
    if (puter && puter.auth) {
      const isSignedIn = puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        currentUser = {
          id: user.uuid || user.username,
          username: user.username,
          email: user.email || `${user.username}@puter.com`,
          avatar: user.username ? user.username[0].toUpperCase() : '?'
        };
        // Load user data from KV
        await loadUserData();
        notifyAuthListeners();
        return true;
      }
    }
  } catch (e) {
    console.log('Auth check:', e.message);
  }
  currentUser = null;
  notifyAuthListeners();
  return false;
}

export async function signIn() {
  try {
    await puter.auth.signIn();
    await checkAuth();
    return true;
  } catch (e) {
    console.error('Sign in failed:', e);
    return false;
  }
}

export async function signOut() {
  try {
    await puter.auth.signOut();
    currentUser = null;
    notifyAuthListeners();
  } catch (e) {
    console.error('Sign out failed:', e);
  }
}

async function loadUserData() {
  if (!currentUser) return;
  try {
    const plan = await puter.kv.get('triggerly_plan');
    const usageStr = await puter.kv.get('triggerly_usage');
    const connectedStr = await puter.kv.get('triggerly_sp_connected');

    currentUser.plan = plan || 'free';
    currentUser.usage = usageStr ? parseInt(usageStr) : 0;
    currentUser.spConnected = connectedStr === 'true';
  } catch (e) {
    currentUser.plan = 'free';
    currentUser.usage = 0;
    currentUser.spConnected = false;
  }
}

export async function updateUserPlan(plan) {
  if (!currentUser) return;
  currentUser.plan = plan;
  await puter.kv.set('triggerly_plan', plan);
  notifyAuthListeners();
}

export async function incrementUsage() {
  if (!currentUser) return;
  currentUser.usage = (currentUser.usage || 0) + 1;
  await puter.kv.set('triggerly_usage', String(currentUser.usage));
}

export async function setSPConnected(connected) {
  if (!currentUser) return;
  currentUser.spConnected = connected;
  await puter.kv.set('triggerly_sp_connected', String(connected));
}

export function getUsageLimit() {
  if (!currentUser) return 0;
  return currentUser.plan === 'pro' ? 100 : 5;
}

export function hasUsageLeft() {
  if (!currentUser) return false;
  return currentUser.usage < getUsageLimit();
}
