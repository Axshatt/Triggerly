// ============================================
// TRIGGERS PAGE
// ============================================
import { icons, showToast, showModal, closeModal, timeAgo } from '../ui.js';
import { navigate } from '../router.js';
import { getUser, hasUsageLeft, incrementUsage, getUsageLimit } from '../auth.js';
import { saveTrigger, getTriggers, deleteTrigger, updateTrigger, saveResult, trackEvent } from '../store.js';
import { renderSidebar, bindSidebarNav } from './dashboard.js';
import { suggestTriggers } from '../ai.js';

export async function renderTriggers() {
  trackEvent('triggers_view');
  const app = document.getElementById('app');
  const user = getUser();
  const triggers = await getTriggers();

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar('triggers')}
      <main class="main-content">
        <button class="sidebar-toggle" id="sidebar-toggle">${icons.menu}</button>
        <div class="page-header">
          <h1>Triggers</h1>
          <div class="page-header-actions">
            <button class="btn btn-ghost btn-sm" id="ai-suggest-btn">
              🤖 AI Suggest
            </button>
            <button class="btn btn-lime btn-sm" id="create-trigger-btn">
              <span class="nav-icon">${icons.plus}</span>
              Create Trigger
            </button>
          </div>
        </div>
        <div class="page-body">
          <!-- Usage Info -->
          <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-xl);">
            <div class="stat-card" style="flex: 1;">
              <span class="stat-label">Total Triggers</span>
              <span class="stat-value">${triggers.length}</span>
            </div>
            <div class="stat-card active" style="flex: 1;">
              <span class="stat-label">Active</span>
              <span class="stat-value">${triggers.filter(t => t.active !== false).length}</span>
            </div>
            <div class="stat-card" style="flex: 1;">
              <span class="stat-label">Actions Left</span>
              <span class="stat-value">${Math.max(0, getUsageLimit() - (user.usage || 0))}</span>
            </div>
          </div>

          <!-- Triggers List -->
          ${triggers.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">⚡</div>
              <h3>Create your first trigger</h3>
              <p>Triggers automatically link your SuperProfile products to content, saving you hours of manual work.</p>
              <button class="btn btn-lime" id="empty-create-btn">
                <span class="nav-icon">${icons.plus}</span>
                Create Trigger
              </button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
              ${triggers.map(t => `
                <div class="trigger-item" data-id="${t.id}">
                  <div class="trigger-meta">
                    <div class="trigger-icon" style="${t.active !== false ? 'background: rgba(var(--color-lime-rgb), 0.15);' : ''}">⚡</div>
                    <div class="trigger-info">
                      <h4>${t.name || 'Untitled Trigger'}</h4>
                      <p>${t.productName || 'Any Product'} → ${t.contentType || 'All Content'} · Created ${timeAgo(t.createdAt)}</p>
                    </div>
                  </div>
                  <div class="trigger-actions">
                    <button class="btn btn-sm ${t.active !== false ? 'btn-outline' : 'btn-lime'}" data-toggle="${t.id}">
                      ${t.active !== false ? 'Pause' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-outline" data-run="${t.id}" ${!hasUsageLeft() ? 'disabled title="Usage limit reached"' : ''}>
                      Run
                    </button>
                    <button class="btn btn-icon btn-ghost" data-delete="${t.id}">
                      ${icons.trash}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </main>
    </div>
  `;

  bindTriggersEvents(triggers);
}

function bindTriggersEvents(triggers) {
  // Sidebar
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) toggle.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  bindSidebarNav();

  // Create trigger buttons
  const createBtn = document.getElementById('create-trigger-btn');
  const emptyCreate = document.getElementById('empty-create-btn');
  [createBtn, emptyCreate].forEach(btn => {
    if (btn) btn.addEventListener('click', showCreateTriggerModal);
  });

  // AI suggest
  const aiSuggest = document.getElementById('ai-suggest-btn');
  if (aiSuggest) {
    aiSuggest.addEventListener('click', async () => {
      aiSuggest.disabled = true;
      aiSuggest.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div> Thinking...';
      
      const suggestion = await suggestTriggers(
        [{name: 'Web Dev Course', price: 999}, {name: 'Design Templates', price: 499}],
        [{title: 'Tutorial Blog', type: 'blog'}, {title: 'YouTube Video', type: 'video'}]
      );
      
      showModal('AI Trigger Suggestions', `
        <div style="white-space: pre-wrap; font-size: 0.9375rem; line-height: 1.7; color: var(--color-dark-500);">
          ${suggestion}
        </div>
      `, [
        { id: 'modal-ok', label: 'Got it', class: 'btn btn-primary' }
      ]);
      
      aiSuggest.disabled = false;
      aiSuggest.innerHTML = '🤖 AI Suggest';
    });
  }

  // Toggle triggers
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.toggle;
      const trigger = triggers.find(t => t.id === id);
      if (trigger) {
        await updateTrigger(id, { active: trigger.active === false });
        showToast(trigger.active === false ? 'Trigger activated' : 'Trigger paused', 'success');
        renderTriggers();
      }
    });
  });

  // Run triggers
  document.querySelectorAll('[data-run]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!hasUsageLeft()) {
        showToast('Usage limit reached. Upgrade to Pro.', 'warning');
        return;
      }
      
      const id = btn.dataset.run;
      const trigger = triggers.find(t => t.id === id);
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div>';
      
      trackEvent('core_action_started', { triggerId: id });
      
      // Simulate running the trigger
      await new Promise(r => setTimeout(r, 1500));
      await incrementUsage();
      await saveResult({
        triggerId: id,
        action: `Ran "${trigger?.name || 'Trigger'}"`,
        status: 'success',
        details: 'Product linked to content successfully'
      });
      
      trackEvent('core_action_completed', { triggerId: id });
      showToast('Trigger executed successfully!', 'success');
      renderTriggers();
    });
  });

  // Delete triggers
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.delete;
      if (confirm('Delete this trigger? This cannot be undone.')) {
        await deleteTrigger(id);
        showToast('Trigger deleted', 'success');
        renderTriggers();
      }
    });
  });
}

function showCreateTriggerModal() {
  showModal('Create New Trigger', `
    <div class="form-group">
      <label>Trigger Name</label>
      <input type="text" id="trigger-name" placeholder="e.g. Link course to tutorials" />
    </div>
    <div class="form-group">
      <label>Product</label>
      <select id="trigger-product">
        <option value="">Select a product...</option>
        <option value="course-web-dev">Web Dev Masterclass</option>
        <option value="ebook-design">Design eBook</option>
        <option value="template-pack">Template Pack</option>
        <option value="coaching-session">1:1 Coaching Session</option>
      </select>
    </div>
    <div class="form-group">
      <label>Content Type</label>
      <select id="trigger-content">
        <option value="">All content types</option>
        <option value="blog">Blog Posts</option>
        <option value="video">Videos</option>
        <option value="tutorial">Tutorials</option>
        <option value="social">Social Posts</option>
      </select>
    </div>
    <div class="form-group">
      <label>Rule</label>
      <select id="trigger-rule">
        <option value="auto-link">Auto-link product when new content is published</option>
        <option value="match-tag">Link when content tags match product category</option>
        <option value="ai-match">AI-powered matching (Pro only)</option>
      </select>
      <div class="form-hint">Choose when the trigger should fire.</div>
    </div>
  `, [
    { id: 'modal-cancel', label: 'Cancel', class: 'btn btn-outline', onClick: closeModal },
    { id: 'modal-create', label: 'Create Trigger', class: 'btn btn-lime', closeOnClick: false, onClick: async () => {
      const name = document.getElementById('trigger-name').value.trim();
      const product = document.getElementById('trigger-product');
      const content = document.getElementById('trigger-content');
      const rule = document.getElementById('trigger-rule');

      if (!name) {
        showToast('Please enter a trigger name', 'warning');
        return;
      }

      await saveTrigger({
        name,
        productId: product.value,
        productName: product.options[product.selectedIndex].text,
        contentType: content.options[content.selectedIndex].text,
        rule: rule.value,
        active: true
      });

      closeModal();
      showToast('Trigger created!', 'success');
      trackEvent('trigger_created', { name });
      renderTriggers();
    }}
  ]);
}
