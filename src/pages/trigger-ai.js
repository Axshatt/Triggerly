// ============================================
// TRIGGER AI — Intelligent Automation Studio
// ============================================
import { icons, showToast, showModal, closeModal, timeAgo } from '../ui.js';
import { navigate } from '../router.js';
import { getUser, hasUsageLeft, incrementUsage, getUsageLimit } from '../auth.js';
import { saveTrigger, getTriggers, getResults, trackEvent } from '../store.js';
import { renderSidebar, bindSidebarNav } from './dashboard.js';
import { generateInsight, suggestTriggers, analyzePerformance, chat } from '../ai.js';

let chatHistory = [
  { sender: 'assistant', text: 'Hey there! I am your Triggerly AI assistant. Ask me anything about creating high-converting triggers, optimizing your SuperProfile products, or scaling your creator automations.' }
];

export async function renderTriggerAI() {
  trackEvent('trigger_ai_view');
  const app = document.getElementById('app');
  const user = getUser();
  const triggers = await getTriggers();
  const results = await getResults();

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar('trigger-ai')}
      <main class="main-content">
        <button class="sidebar-toggle" id="sidebar-toggle">${icons.menu}</button>

        <div class="page-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h1>Trigger AI Studio</h1>
              <span class="badge badge-lime" style="font-weight: 700; font-size: 0.75rem;">GPT-4o Powered</span>
            </div>
            <p class="subtitle" style="margin-top: 4px; color: var(--color-dark-400); font-size: 0.9375rem;">
              Transform natural ideas into active SuperProfile automations with Puter AI.
            </p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-outline btn-sm" id="audit-btn">
              ⚡ AI Stack Audit
            </button>
            <button class="btn btn-lime btn-sm" id="view-triggers-btn">
              View All Triggers (${triggers.length})
            </button>
          </div>
        </div>

        <div class="page-body">
          <div class="ai-studio-grid">
            <!-- Left Column: Generator & AI Recommendations -->
            <div style="display: flex; flex-direction: column; gap: var(--space-xl);">

              <!-- AI Trigger Generator Card -->
              <div class="ai-card ai-card-glow">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="background: rgba(var(--color-lime-rgb), 0.2); color: var(--color-dark); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                      ${icons.sparkles}
                    </div>
                    <div>
                      <h3 style="font-size: 1.125rem; font-weight: 600; margin: 0;">AI Automation Generator</h3>
                      <p style="font-size: 0.8125rem; color: var(--color-dark-400); margin: 0;">Describe what you want to automate in plain English</p>
                    </div>
                  </div>
                  <span class="badge badge-dot badge-success">Ready</span>
                </div>

                <div class="form-group" style="margin-bottom: var(--space-sm);">
                  <textarea id="ai-generator-prompt" rows="3" class="form-input" style="width: 100%; border-radius: var(--radius-md); padding: 12px; font-size: 0.9375rem; resize: vertical;" placeholder="e.g. When a viewer reads my Figma blog post, recommend my Design System UI Kit with a 20% discount link..."></textarea>
                </div>

                <!-- Prompt suggestion chips -->
                <div class="prompt-chips">
                  <span class="prompt-chip" data-prompt="Link my Web Dev Masterclass whenever tutorials on React or JavaScript get viewed">
                    ✨ Course from Tutorials
                  </span>
                  <span class="prompt-chip" data-prompt="Automatically offer my Design eBook lead magnet on beginner design posts">
                    📚 Free Lead Magnet
                  </span>
                  <span class="prompt-chip" data-prompt="Trigger a 1:1 Consultation call invitation for users viewing advanced architectural guides">
                    🤝 1:1 Mentorship Upsell
                  </span>
                  <span class="prompt-chip" data-prompt="Send a 15% discount code for Template Pack to readers who spent over 3 minutes on my blog">
                    🏷️ 15% Special Discount
                  </span>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-md);">
                  <button class="btn btn-lime" id="generate-trigger-btn" style="min-width: 170px;">
                    <span class="btn-icon">${icons.sparkles}</span>
                    Generate Trigger
                  </button>
                </div>

                <!-- Generated Trigger Result Area -->
                <div id="generated-result-area" style="display: none; margin-top: var(--space-lg); border-top: 1px solid var(--color-dark-100); padding-top: var(--space-md);">
                  <!-- Injected dynamically -->
                </div>
              </div>

              <!-- Curated Smart Automations -->
              <div class="ai-card">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                  <h3 style="font-size: 1.125rem; font-weight: 600;">SuperProfile Recommended Triggers</h3>
                  <button class="btn btn-ghost btn-sm" id="refresh-recommendations-btn">
                    ↻ Refresh Suggestions
                  </button>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-md);" id="smart-recommendations-list">
                  <div class="ai-suggestion-item">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <strong style="font-size: 0.9375rem;">Tutorial Reader → Web Dev Course</strong>
                        <p style="font-size: 0.8125rem; color: var(--color-dark-400); margin-top: 2px;">
                          Triggers an inline course banner when visitors view code snippets in your tutorials.
                        </p>
                      </div>
                      <span class="badge badge-lime">+34% Conv</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                      <span style="font-size: 0.75rem; color: var(--color-dark-300);">Auto-link on publish · Active 24/7</span>
                      <button class="btn btn-sm btn-outline deploy-preset-btn" data-name="Tutorial to Web Dev Course" data-product="Web Dev Masterclass" data-content="Tutorials" data-rule="auto-link">
                        Deploy Trigger
                      </button>
                    </div>
                  </div>

                  <div class="ai-suggestion-item">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <strong style="font-size: 0.9375rem;">Design Showcase → Template Pack Discount</strong>
                        <p style="font-size: 0.8125rem; color: var(--color-dark-400); margin-top: 2px;">
                          Displays 15% limited time coupon for Figma Templates when reading case studies.
                        </p>
                      </div>
                      <span class="badge badge-lime">+28% Conv</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                      <span style="font-size: 0.75rem; color: var(--color-dark-300);">AI context match · High intent</span>
                      <button class="btn btn-sm btn-outline deploy-preset-btn" data-name="Case Study to Template Pack" data-product="Template Pack" data-content="Blog Posts" data-rule="ai-match">
                        Deploy Trigger
                      </button>
                    </div>
                  </div>

                  <div class="ai-suggestion-item">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <strong style="font-size: 0.9375rem;">Video Audience → 1:1 Coaching Booking</strong>
                        <p style="font-size: 0.8125rem; color: var(--color-dark-400); margin-top: 2px;">
                          Directs YouTube & Video viewers to your SuperProfile calendar booking link.
                        </p>
                      </div>
                      <span class="badge badge-lime">+45% ROI</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                      <span style="font-size: 0.75rem; color: var(--color-dark-300);">Tag match: coaching, mentorship</span>
                      <button class="btn btn-sm btn-outline deploy-preset-btn" data-name="Video to 1:1 Coaching" data-product="1:1 Coaching Session" data-content="Videos" data-rule="match-tag">
                        Deploy Trigger
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column: AI Assistant Chat & Health Audit -->
            <div style="display: flex; flex-direction: column; gap: var(--space-xl);">

              <!-- AI Stack Auditor Summary -->
              <div class="ai-card" style="background: linear-gradient(135deg, #1A201E 0%, #242C29 100%); color: var(--color-white); border-color: #2E3734;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                  <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-lime); font-weight: 600;">Automation Health</span>
                  <span class="badge badge-lime" style="font-size: 0.75rem;">Audit Score: 94/100</span>
                </div>
                <h4 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 6px; color: #fff;">
                  ${triggers.length === 0 ? 'Start with your first trigger' : `${triggers.length} Active Automation${triggers.length === 1 ? '' : 's'}`}
                </h4>
                <p style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.7); line-height: 1.5; margin-bottom: var(--space-md);">
                  ${triggers.length === 0 
                    ? 'No triggers running yet. Deploy a suggested trigger or generate one using the AI prompt tool to start automating sales.'
                    : `Your stack has executed ${results.length} automated events with high conversion coverage across your active products.`}
                </p>
                <div style="display: flex; gap: var(--space-sm);">
                  <button class="btn btn-sm btn-lime" id="run-ai-audit-btn" style="flex: 1;">
                    Run Deep Stack Audit
                  </button>
                </div>
              </div>

              <!-- Live AI Assistant Chat Box -->
              <div class="ai-chat" style="display: flex; flex-direction: column; height: 500px;">
                <div class="ai-chat-header" style="justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="ai-dot"></div>
                    <span>Triggerly Copilot</span>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--color-dark-400);">Puter AI (GPT-4o)</span>
                </div>

                <div class="ai-chat-messages" id="ai-chat-messages" style="flex: 1;">
                  ${chatHistory.map(m => `
                    <div class="ai-message ${m.sender}">
                      ${m.text}
                    </div>
                  `).join('')}
                </div>

                <div class="ai-chat-input">
                  <input type="text" id="ai-chat-input-field" placeholder="Ask about triggers, conversion tricks..." />
                  <button class="btn btn-lime btn-sm" id="ai-chat-send-btn" style="border-radius: var(--radius-full); padding: 8px 16px;">
                    ${icons.send}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  bindTriggerAIEvents(triggers);
}

function bindTriggerAIEvents(triggers) {
  // Mobile sidebar
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) toggle.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  bindSidebarNav();

  // View Triggers button
  const viewTriggersBtn = document.getElementById('view-triggers-btn');
  if (viewTriggersBtn) {
    viewTriggersBtn.addEventListener('click', () => navigate('/triggers'));
  }

  // Suggestion prompt chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const textarea = document.getElementById('ai-generator-prompt');
      if (textarea) {
        textarea.value = chip.dataset.prompt;
        textarea.focus();
      }
    });
  });

  // Generate trigger button
  const generateBtn = document.getElementById('generate-trigger-btn');
  const promptInput = document.getElementById('ai-generator-prompt');
  const resultArea = document.getElementById('generated-result-area');

  if (generateBtn && promptInput && resultArea) {
    generateBtn.addEventListener('click', async () => {
      const text = promptInput.value.trim();
      if (!text) {
        showToast('Please type a prompt or click one of the suggestion chips.', 'warning');
        return;
      }

      generateBtn.disabled = true;
      generateBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div> Generating Trigger...';

      const prompt = `Convert this creator automation request into a structured trigger definition:
      Request: "${text}"
      
      Respond with ONLY a JSON object (no markdown quotes, no other text) with the following format:
      {
        "name": "concise name of trigger",
        "productName": "name of product to promote",
        "contentType": "blog or video or tutorial or all",
        "rule": "auto-link or match-tag or ai-match",
        "rationale": "one sentence explaining why this will convert well"
      }`;

      try {
        const raw = await generateInsight(prompt);
        let parsed = null;
        try {
          // Clean possible markdown code fences
          const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = {
            name: text.slice(0, 30) + '...',
            productName: 'Recommended Product',
            contentType: 'All Content',
            rule: 'ai-match',
            rationale: raw
          };
        }

        resultArea.style.display = 'block';
        resultArea.innerHTML = `
          <div style="background: var(--color-light); border: 1px solid var(--color-dark-100); border-radius: var(--radius-md); padding: var(--space-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="badge badge-lime" style="font-weight: 600;">✨ Generated Trigger</span>
              <span style="font-size: 0.75rem; color: var(--color-dark-400);">${parsed.rule}</span>
            </div>
            <h4 style="margin: 0 0 6px 0; font-size: 1rem;">${parsed.name}</h4>
            <p style="font-size: 0.875rem; color: var(--color-dark-500); margin-bottom: 8px;">
              <strong>Links:</strong> ${parsed.productName} ➔ <strong>Target:</strong> ${parsed.contentType}
            </p>
            <p style="font-size: 0.8125rem; color: var(--color-dark-400); font-style: italic; margin-bottom: var(--space-md); background: #fff; padding: 8px; border-radius: 6px; border: 1px dashed var(--color-dark-200);">
              💡 "${parsed.rationale}"
            </p>
            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm);">
              <button class="btn btn-outline btn-sm" id="discard-gen-btn">Discard</button>
              <button class="btn btn-lime btn-sm" id="save-gen-btn">
                ⚡ Deploy Trigger Now
              </button>
            </div>
          </div>
        `;

        document.getElementById('discard-gen-btn').addEventListener('click', () => {
          resultArea.style.display = 'none';
        });

        document.getElementById('save-gen-btn').addEventListener('click', async () => {
          await saveTrigger({
            name: parsed.name,
            productName: parsed.productName,
            contentType: parsed.contentType,
            rule: parsed.rule,
            active: true
          });
          trackEvent('trigger_created_via_ai', { name: parsed.name });
          showToast(`Trigger "${parsed.name}" activated!`, 'success');
          resultArea.style.display = 'none';
          promptInput.value = '';
          renderTriggerAI();
        });

      } catch (err) {
        showToast('Failed to generate trigger. Please try again.', 'error');
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<span class="btn-icon">${icons.sparkles}</span> Generate Trigger`;
      }
    });
  }

  // Deploy preset buttons
  document.querySelectorAll('.deploy-preset-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const name = btn.dataset.name;
      const productName = btn.dataset.product;
      const contentType = btn.dataset.content;
      const rule = btn.dataset.rule;

      btn.disabled = true;
      btn.textContent = 'Deploying...';

      await saveTrigger({
        name,
        productName,
        contentType,
        rule,
        active: true
      });

      trackEvent('trigger_deployed_from_preset', { name });
      showToast(`Trigger "${name}" deployed successfully!`, 'success');
      btn.textContent = '✓ Deployed';
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-lime');
    });
  });

  // AI Stack Audit modal
  const auditBtn = document.getElementById('audit-btn');
  const runDeepAuditBtn = document.getElementById('run-ai-audit-btn');
  const triggerAudit = async () => {
    const triggersList = await getTriggers();
    showModal('AI Stack Audit & Optimization Report', `
      <div style="font-size: 0.9375rem; line-height: 1.7; color: var(--color-dark-500);">
        <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-md);">
          <div class="stat-card" style="flex:1;">
            <span class="stat-label">Active Triggers</span>
            <span class="stat-value">${triggersList.length}</span>
          </div>
          <div class="stat-card" style="flex:1;">
            <span class="stat-label">Automation Coverage</span>
            <span class="stat-value">${triggersList.length > 2 ? '96%' : triggersList.length > 0 ? '65%' : '0%'}</span>
          </div>
        </div>
        <h4 style="margin: 12px 0 6px 0; font-size: 1rem; color: var(--color-dark);">Key Insights:</h4>
        <ul style="padding-left: 20px; margin: 0 0 16px 0;">
          <li><strong>High Intent Discovery:</strong> Tutorials and guides generate 3.4x more clicks when linked to relevant digital products.</li>
          <li><strong>Cross-Selling:</strong> Creators with at least 3 active triggers experience a 42% lift in average customer value.</li>
          <li><strong>Recommendation:</strong> Ensure all digital products have an active auto-link or AI-match trigger attached.</li>
        </ul>
      </div>
    `, [
      { id: 'modal-ok', label: 'Close Report', class: 'btn btn-primary' }
    ]);
  };

  if (auditBtn) auditBtn.addEventListener('click', triggerAudit);
  if (runDeepAuditBtn) runDeepAuditBtn.addEventListener('click', triggerAudit);

  // Chat with Puter AI
  const chatMessages = document.getElementById('ai-chat-messages');
  const chatInput = document.getElementById('ai-chat-input-field');
  const chatSendBtn = document.getElementById('ai-chat-send-btn');

  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatHistory.push({ sender: 'user', text });

    // Render user message
    const userMsgEl = document.createElement('div');
    userMsgEl.className = 'ai-message user';
    userMsgEl.textContent = text;
    chatMessages.appendChild(userMsgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Render loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'ai-message assistant';
    loadingEl.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div> Thinking...';
    chatMessages.appendChild(loadingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const reply = await chat(text, `Creator has ${triggers.length} triggers currently installed in Triggerly.`);
      loadingEl.remove();
      chatHistory.push({ sender: 'assistant', text: reply });

      const replyEl = document.createElement('div');
      replyEl.className = 'ai-message assistant';
      replyEl.textContent = reply;
      chatMessages.appendChild(replyEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (e) {
      loadingEl.remove();
      const errorEl = document.createElement('div');
      errorEl.className = 'ai-message assistant';
      errorEl.textContent = 'Oops, could not connect to AI service. Please try again.';
      chatMessages.appendChild(errorEl);
    }
  };

  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}
