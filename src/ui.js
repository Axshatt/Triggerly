// ============================================
// UI HELPERS — Toast, Modal, Icons
// ============================================

// --- Toast notifications ---
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Modal ---
export function showModal(title, bodyHTML, actions = []) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="btn-icon btn-ghost" id="modal-close">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${actions.length ? `
        <div class="modal-footer">
          ${actions.map(a => `<button class="btn ${a.class || 'btn-primary'}" id="${a.id}">${a.label}</button>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  actions.forEach(a => {
    const btn = overlay.querySelector(`#${a.id}`);
    if (btn && a.onClick) {
      btn.addEventListener('click', () => {
        a.onClick();
        if (a.closeOnClick !== false) closeModal();
      });
    }
  });

  return overlay;
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  }
}

// --- SVG Icons ---
export const icons = {
  logo: `<svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#2E3734"/><path d="M8 12l8-4 8 4-8 4-8-4z" fill="#C8FC7E"/><path d="M8 16l8 4 8-4" stroke="#C8FC7E" fill="none" stroke-width="2"/><path d="M8 20l8 4 8-4" stroke="#C8FC7E" fill="none" stroke-width="2" opacity="0.6"/></svg>`,
  overview: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="7" height="7" rx="2"/><rect x="11" y="2" width="7" height="7" rx="2"/><rect x="2" y="11" width="7" height="7" rx="2"/><rect x="11" y="11" width="7" height="7" rx="2"/></svg>`,
  triggers: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 2L5 12h5l-1 6 6-10h-5l1-6z"/></svg>`,
  products: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M7 5V3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5V5"/></svg>`,
  analytics: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17V10"/><path d="M7 17V7"/><path d="M11 17V12"/><path d="M15 17V4"/></svg>`,
  settings: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.93 4.93l1.41 1.41m7.32 7.32l1.41 1.41M15.07 4.93l-1.41 1.41M6.34 13.66l-1.41 1.41"/></svg>`,
  logout: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3"/><path d="M14 14l3-4-3-4"/><path d="M17 10H8"/></svg>`,
  plus: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4v12M4 10h12"/></svg>`,
  ai: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>`,
  link: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12l4-4"/><path d="M11.5 6.5l1-1a2.83 2.83 0 114 4l-1 1"/><path d="M8.5 13.5l-1 1a2.83 2.83 0 11-4-4l1-1"/></svg>`,
  check: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l4 4 8-8"/></svg>`,
  arrow: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 10h10M12 6l4 4-4 4"/></svg>`,
  chevron: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8l4 4 4-4"/></svg>`,
  menu: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h14M3 10h14M3 14h14"/></svg>`,
  send: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2L9 11"/><path d="M18 2l-6 16-3-7-7-3z"/></svg>`,
  trash: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 6h10l-1 11H6L5 6z"/><path d="M3 6h14"/><path d="M8 6V4h4v2"/></svg>`,
  edit: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l5 5-9 9H3v-5l9-9z"/></svg>`,
  sparkles: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14l-1.6-4.4L4 8l4.4-1.6L10 2z"/><path d="M15 13l.8 2.2L18 16l-2.2.8L15 19l-.8-2.2L12 16l2.2-.8L15 13z"/></svg>`,
};

// --- Format helpers ---
export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function truncate(str, len = 50) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}
