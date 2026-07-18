/**
 * NEXETA AI MARKETING SUITE - Core Dashboard Interactive Controller
 * Interlocks SPA routing, forms, real API keys connection checks, and AI marketing generators.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Local Storage databases
  window.Nexeta.APIManager.init();
  window.Nexeta.BrandKitManager.init();
  window.Nexeta.ProjectManager.init();
  window.Nexeta.PromptLibraryManager.init();
  window.Nexeta.AutomationManager.init();
  window.Nexeta.BillingManager.init();
  window.Nexeta.AnalyticsManager.init();
  window.Nexeta.HistoryManager.init();

  // Initialize Global Smart Search after storage systems are loaded
  if (window.Nexeta && window.Nexeta.GlobalSearch) {
    window.Nexeta.GlobalSearch.init();
  }

  // 2. Initialize View Router
  initRouting();

  // 3. Initialize Top Header User Identity & Global Metrics
  initHeaderUser();

  // 4. Initialize Dashboard Home Widgets
  initDashboardHomeWidgets();

  // 5. Initialize Sub-views Controllers
  initAPIManagementView();
  initBrandKitView();
  initAdCreatorView();
  initDedicatedChatView();
  initProjectsView();
  initPromptLibraryView();
  initHistoryView();
  initExportModal();
  initRenameProjectModal();
  initAutomationView();
  initBillingView();
  initSettingsView();

  // 6. Initialize UI Extras (Orbs spotlights, dropdown overlays, theme)
  initSpotlightGlows();
  initThemeToggle();
  initDropdownMenus();
  initSidebarToggle();
  initNewProjectModal();
  initRightSidebarWidgets();
  initChatExtensions();
  initPremiumStrategyGenerator();
  initMarketplaceView();
  initProjectWorkspace();
  initResponsivePreviewToggle();

  // 7. Initial update of all stats on load
  window.Nexeta.AnalyticsManager.updateDashboardStats();

  // Render recent projects list on dashboard load
  if (window.renderRecentProjectsTable) {
    window.renderRecentProjectsTable();
  }
});

/* ================= 1. SPA ROUTING ================= */
function initRouting() {
  function handleRouting() {
    const hash = window.location.hash || '#dashboard';
    
    // Hide all view panels
    document.querySelectorAll('.dashboard-view').forEach(view => {
      view.style.display = 'none';
      view.classList.remove('active');
    });

    // Map Hash to View ID
    let targetId = 'view-dashboard';
    if (hash.startsWith('#chat')) targetId = 'view-chat';
    else if (hash.startsWith('#ad-creator')) {
      targetId = 'view-ad-creator';
      const parts = hash.split('?template=');
      if (parts.length > 1) {
        const templateName = parts[1];
        const prodNameInput = document.getElementById('ad-product-name');
        const audienceInput = document.getElementById('ad-audience');
        const descInput = document.getElementById('ad-desc');
        const platformSelect = document.getElementById('ad-platform');
        const toneSelect = document.getElementById('ad-tone');
        
        if (templateName === 'aida') {
          if (platformSelect) platformSelect.value = 'Facebook Feed';
          if (toneSelect) toneSelect.value = 'Bold / Persuasive';
          if (descInput) descInput.value = 'Focus: Attention, Interest, Desire, Action framework for high-converting social media marketing campaign.';
        } else if (templateName === 'pas') {
          if (platformSelect) platformSelect.value = 'LinkedIn Sponsored';
          if (toneSelect) toneSelect.value = 'Professional / Corporate';
          if (descInput) descInput.value = 'Focus: Problem, Agitate, Solution framework targeting B2B professionals and decision makers.';
        }
      }
    }
    else if (hash === '#tools') targetId = 'view-tools';
    else if (hash.startsWith('#projects')) targetId = 'view-projects';
    else if (hash.startsWith('#history')) targetId = 'view-history';
    else if (hash === '#templates') targetId = 'view-templates';
    else if (hash.startsWith('#prompts')) targetId = 'view-prompts';
    else if (hash.startsWith('#brandkit')) targetId = 'view-brandkit';
    else if (hash.startsWith('#automation')) targetId = 'view-automation';
    else if (hash.startsWith('#apikeys')) targetId = 'view-apikeys';
    else if (hash.startsWith('#billing') || hash.startsWith('#pricing')) targetId = 'view-billing';
    else if (hash.startsWith('#settings')) targetId = 'view-settings';
    else if (hash.startsWith('#help')) targetId = 'view-help';
    else if (hash.startsWith('#marketplace')) {
      targetId = 'view-marketplace';
      const parts = hash.split('?tab=');
      if (parts.length > 1) {
        const category = parts[1];
        const tabBtn = document.querySelector(`.btn-market-tab[data-category="${category}"]`);
        if (tabBtn) {
          document.querySelectorAll('.btn-market-tab').forEach(t => t.classList.remove('active'));
          tabBtn.classList.add('active');
        }
      }
    }
    else if (hash.startsWith('#project-workspace')) {
      targetId = 'view-project-workspace';
      const parts = hash.split('?id=');
      if (parts.length > 1) {
        window.Nexeta.ProjectManager.setActiveProjectId(parts[1]);
      }
    }

    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.style.display = 'block';
      targetView.classList.add('active');
    }

    // Update Sidebar Navigation highlights
    document.querySelectorAll('.sidebar-menu .sidebar-item').forEach(item => {
      item.classList.remove('active');
      const link = item.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href === hash || (hash.includes('?') && href === hash.split('?')[0]) || (href.includes('?') && href.split('?')[0] === hash.split('?')[0])) {
          item.classList.add('active');
        }
      }
    });

    // Trigger View Specific Refreshers
    if ((hash === '' || hash === '#dashboard' || hash === '#') && window.Nexeta) {
      if (window.Nexeta.AnalyticsDashboard) {
        window.Nexeta.AnalyticsDashboard.init();
      }
      if (window.Nexeta.WorkspaceOverview) {
        window.Nexeta.WorkspaceOverview.updateDashboardWidgets();
      }
    }
    if (hash.startsWith('#chat') && typeof window.refreshChatExtensions === 'function') window.refreshChatExtensions();
    if (hash.startsWith('#projects') && typeof window.renderProjectsGrid === 'function') window.renderProjectsGrid();
    if (hash.startsWith('#history') && typeof window.renderHistoryGrid === 'function') window.renderHistoryGrid();
    if (hash.startsWith('#prompts') && typeof window.renderPromptsGrid === 'function') window.renderPromptsGrid();
    if (hash.startsWith('#automation') && typeof window.renderAutomationQueue === 'function') window.renderAutomationQueue();
    if (hash.startsWith('#billing') && typeof window.renderBillingData === 'function') window.renderBillingData();
    if (hash.startsWith('#marketplace') && typeof window.renderMarketplaceGrid === 'function') window.renderMarketplaceGrid();
    if (hash.startsWith('#project-workspace') && typeof window.renderProjectWorkspace === 'function') window.renderProjectWorkspace();
    
    // Auto-scroll content area back to top
    const mainPanel = document.getElementById('dashboard-main');
    if (mainPanel) mainPanel.scrollTop = 0;
  }

  window.addEventListener('hashchange', handleRouting);
  window.addEventListener('load', handleRouting);
}

/* ================= 2. USER PROFILE HEADER ================= */
function initHeaderUser() {
  const user = window.Nexeta.Auth.getCurrentUser();
  
  // Update Welcome Banner header title
  const welcomeTitle = document.querySelector('#welcome-section h1');
  if (welcomeTitle) {
    if (user && user.name) {
      welcomeTitle.innerHTML = `Welcome back, <span class="gradient-text">${user.name}!</span>`;
    } else {
      welcomeTitle.innerHTML = `Welcome back!`;
    }
  }

  if (!user) return;

  // Update chatbot greeting name dynamically
  document.querySelectorAll('.chat-welcome-user-name').forEach(el => {
    el.textContent = user.name.split(' ')[0]; // Show first name
  });

  // Update upload template creator name input
  const creatorInput = document.getElementById('market-upload-creator');
  if (creatorInput) {
    creatorInput.value = user.name;
  }

  // Update Profile dropdown details
  const profileDropdown = document.getElementById('profile-dropdown');
  if (profileDropdown) {
    const headerInfo = document.createElement('div');
    headerInfo.style.padding = '0.75rem';
    headerInfo.style.borderBottom = '1px solid var(--border-color)';
    headerInfo.style.marginBottom = '0.4rem';
    headerInfo.innerHTML = `
      <div style="font-weight: 700; color: #ffffff; font-size: 0.82rem;">${user.name}</div>
      <div style="font-size: 0.68rem; color: var(--text-secondary); margin-top: 2px;">${user.email}</div>
    `;
    profileDropdown.insertBefore(headerInfo, profileDropdown.firstChild);
  }

  // Set avatar pictures
  const avatarDiv = document.querySelector('.user-avatar-img');
  if (avatarDiv && user.avatar) {
    avatarDiv.style.backgroundImage = `url('${user.avatar}')`;
  }
}

/* ================= 3. DASHBOARD HOME WIDGETS ================= */
function initDashboardHomeWidgets() {
  // Quick Actions Launchers
  const actionCards = {
    'act-ad': '#ad-creator',
    'act-img': '#chat',
    'act-video': '#chat',
    'act-script': '#chat',
    'act-thumb': '#chat',
    'act-post': '#automation',
    'act-strat': '#chat',
    'act-desc': '#chat'
  };
  for (const id in actionCards) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        window.location.hash = actionCards[id];
      });
    }
  }

  // Home Quick Chat Widget Simulator
  const chatHistory = document.getElementById('chat-history');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const suggestedChips = document.querySelectorAll('#suggested-prompts-container .suggested-prompt-chip');

  let homeChatSessionHistory = [];

  if (chatHistory && chatInput && sendBtn) {
    // Handler for suggested chips
    suggestedChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const promptText = chip.getAttribute('data-prompt') || chip.textContent.trim();
        chatInput.value = promptText;
        chatInput.focus();
      });
    });

    const submitMessage = async () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // Append User message bubble
      appendChatBubble(chatHistory, text, 'user');
      chatInput.value = '';

      // Append Typing indicator
      const typingBubble = appendTypingIndicator(chatHistory);
      chatHistory.scrollTop = chatHistory.scrollHeight;

      // Call AI Engine
      try {
        const reply = await window.Nexeta.AIEngine.chat(text, homeChatSessionHistory, 'marketing');
        typingBubble.remove();
        appendChatBubble(chatHistory, reply, 'assistant');
        homeChatSessionHistory.push({ sender: 'user', text });
        homeChatSessionHistory.push({ sender: 'assistant', text: reply });
      } catch (e) {
        typingBubble.remove();
        appendChatBubble(chatHistory, `Error: ${e.message || "Request failed. Please check your API configuration keys."}`, 'assistant');
      }
      chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    sendBtn.addEventListener('click', submitMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitMessage();
    });
  }
}

/* ================= PREVIEW RESPONSIVE DEVICE TOGGLE ================= */
function initResponsivePreviewToggle() {
  const wrapper = document.getElementById('dashboard-wrapper');
  const buttons = document.querySelectorAll('.btn-preview-mode');

  if (!wrapper || buttons.length === 0) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button active classes
      buttons.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--text-secondary)';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = '#fff';

      const mode = btn.getAttribute('data-mode');

      // Clear existing responsive classes
      wrapper.classList.remove('preview-tablet', 'preview-mobile');

      // Apply styles depending on mode
      if (mode === 'desktop') {
        wrapper.style.width = '100%';
        wrapper.style.height = '100vh';
        wrapper.style.margin = '0';
        wrapper.style.border = 'none';
        wrapper.style.borderRadius = '0';
        wrapper.style.boxShadow = 'none';
        wrapper.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else if (mode === 'tablet') {
        wrapper.classList.add('preview-tablet');
        wrapper.style.width = '768px';
        wrapper.style.height = '90vh';
        wrapper.style.margin = '5vh auto';
        wrapper.style.border = '12px solid #2d3748';
        wrapper.style.borderRadius = '24px';
        wrapper.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.8)';
        wrapper.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
      } else if (mode === 'mobile') {
        wrapper.classList.add('preview-mobile');
        wrapper.style.width = '375px';
        wrapper.style.height = '812px';
        wrapper.style.margin = '5vh auto';
        wrapper.style.border = '12px solid #2d3748';
        wrapper.style.borderRadius = '32px';
        wrapper.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.8)';
        wrapper.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
      }

      // Re-trigger layout checks or charts update
      if (window.Nexeta && window.Nexeta.AnalyticsDashboard) {
        window.Nexeta.AnalyticsDashboard.renderAnalyticsTab();
      }
    });
  });
}

// Helper for Secure Markdown Parsing
function formatMarkdown(text) {
  if (!text) return '';
  
  // Escape HTML to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Headers: ###, ##, #
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^# (.*?)$/gm, '<h5>$1</h5>');
  
  // Inline code: `code`
  html = html.replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>');
  
  // Bullet lists: * item or - item
  html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li style="margin-left: 1.5rem; list-style-type: disc;">$1</li>');
  
  // Numbered lists: 1. item
  html = html.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li style="margin-left: 1.5rem; list-style-type: decimal;">$2</li>');

  // Convert newlines to br
  html = html.replace(/\n/g, '<br>');
  
  // Clean up lists layout
  html = html.replace(/(<\/li>)<br>/g, '$1');
  html = html.replace(/<br>(<li)/g, '$1');
  
  return html;
}

// Helpers for Chat bubbles
function appendChatBubble(container, text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.style.display = 'flex';
  bubble.style.gap = '0.75rem';
  bubble.style.maxWidth = '80%';
  bubble.style.alignSelf = sender === 'user' ? 'flex-end' : 'flex-start';
  bubble.style.flexDirection = sender === 'user' ? 'row-reverse' : 'row';

  const avatar = document.createElement('div');
  avatar.className = `chat-avatar ${sender}`;
  avatar.textContent = sender === 'user' ? 'ME' : 'NX';

  const messageBox = document.createElement('div');
  messageBox.className = 'chat-message-content';
  
  // Format markdown securely
  messageBox.innerHTML = formatMarkdown(text);

  // Apply RTL and Nastaliq styling if the text is Urdu
  const isUrdu = /[\u0600-\u06FF]/.test(text);
  if (isUrdu) {
    messageBox.style.direction = 'rtl';
    messageBox.style.textAlign = 'right';
    messageBox.style.fontFamily = '"Noto Nastaliq Urdu", "Urdu Typesetting", "Jameel Noori Nastaliq", "Times New Roman", system-ui, sans-serif';
    messageBox.style.lineHeight = '2.2';
    messageBox.style.fontSize = '1.25rem'; // Nastaliq is naturally small, make it stand out
  }

  bubble.appendChild(avatar);
  bubble.appendChild(messageBox);
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator(container) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble assistant';
  bubble.style.display = 'flex';
  bubble.style.gap = '0.75rem';
  bubble.style.alignSelf = 'flex-start';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar assistant';
  avatar.textContent = 'NX';

  const messageBox = document.createElement('div');
  messageBox.className = 'chat-message-content';
  messageBox.innerHTML = `
    <div class="typing-dots">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;

  bubble.appendChild(avatar);
  bubble.appendChild(messageBox);
  container.appendChild(bubble);
  return bubble;
}

/* ================= 4. API MANAGEMENT VIEW ================= */
function initAPIManagementView() {
  const form = document.getElementById('save-api-keys-btn')?.closest('div');
  if (!form) return;

  const providers = ['openai', 'gemini', 'groq', 'replicate', 'stability', 'elevenlabs'];

  // Populate Key fields on load
  const loadKeys = () => {
    const keys = window.Nexeta.APIManager.getKeys();
    providers.forEach(p => {
      const input = document.getElementById(`key-${p}`);
      const toggle = document.getElementById(`toggle-${p}`);
      if (input && keys[p]) {
        input.value = keys[p].key;
        toggle.checked = keys[p].enabled;
        updateStatusBadge(p, keys[p].key, keys[p].status, keys[p].enabled);
      }
    });
  };

  const updateStatusBadge = (provider, key, status, enabled) => {
    const badge = document.getElementById(`${provider}-status-badge`);
    if (!badge) return;

    let color = 'var(--text-muted)';
    let label = 'Disconnected';

    if (key) {
      if (enabled) {
        if (status === 'connected') {
          color = 'var(--success)';
          label = 'Connected & Active';
        } else {
          color = 'var(--warning)';
          label = 'Active (Testing needed)';
        }
      } else {
        color = 'var(--text-secondary)';
        label = 'Connected (Disabled)';
      }
    }

    badge.innerHTML = `<span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; display: inline-block;"></span>${label}`;
  };

  // Test Key Handlers
  document.querySelectorAll('.btn-test-api').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const provider = btn.getAttribute('data-provider');
      const input = document.getElementById(`key-${provider}`);
      if (!input) return;

      const val = input.value.trim();
      if (!val) {
        alert('Please enter an API key to test.');
        return;
      }

      btn.textContent = 'Testing...';
      btn.disabled = true;

      const result = await window.Nexeta.APIManager.testConnection(provider, val);
      
      btn.textContent = 'Test Key';
      btn.disabled = false;

      alert(result.message);
      loadKeys(); // reload keys display
    });
  });

  // Save API Configurations
  document.getElementById('save-api-keys-btn')?.addEventListener('click', () => {
    const updated = {};
    providers.forEach(p => {
      const key = document.getElementById(`key-${p}`).value.trim();
      const enabled = document.getElementById(`toggle-${p}`).checked;
      updated[p] = { key, enabled };
    });

    window.Nexeta.APIManager.saveKeys(updated);
    alert('API Configurations saved successfully.');
    loadKeys();
  });

  // Listen to hash changes to trigger load
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#apikeys') loadKeys();
  });
  loadKeys();
}

/* ================= 5. BRAND KIT VIEW ================= */
function initBrandKitView() {
  const form = document.getElementById('brandkit-form');
  if (!form) return;

  const loadBrandKit = () => {
    const kit = window.Nexeta.BrandKitManager.getBrandKit();
    document.getElementById('brand-name').value = kit.name;
    document.getElementById('brand-website').value = kit.website;
    document.getElementById('brand-tone').value = kit.tone;
    document.getElementById('brand-logo').value = kit.logo;
    document.getElementById('brand-primary-color').value = kit.primaryColor;
    document.getElementById('brand-secondary-color').value = kit.secondaryColor;
    document.getElementById('brand-desc').value = kit.voiceDescription;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('brand-name').value.trim(),
      website: document.getElementById('brand-website').value.trim(),
      tone: document.getElementById('brand-tone').value,
      logo: document.getElementById('brand-logo').value.trim(),
      primaryColor: document.getElementById('brand-primary-color').value,
      secondaryColor: document.getElementById('brand-secondary-color').value,
      voiceDescription: document.getElementById('brand-desc').value.trim()
    };

    window.Nexeta.BrandKitManager.saveBrandKit(data);
    alert('Brand Kit guidelines saved successfully.');
    loadBrandKit();
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#brandkit') loadBrandKit();
  });
  loadBrandKit();
}

/* ================= 6. AI AD CREATOR VIEW ================= */
function initAdCreatorView() {
  const form = document.getElementById('ad-creator-form');
  if (!form) return;

  let lastGeneratedAd = null;

  // Handle generation form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productName = document.getElementById('ad-product-name').value.trim();
    const audience = document.getElementById('ad-audience').value.trim();
    const platform = document.getElementById('ad-platform').value;
    const toneOverride = document.getElementById('ad-tone').value;
    const description = document.getElementById('ad-desc').value.trim();

    // Toggle States: show loader
    document.getElementById('ad-empty-state').style.display = 'none';
    document.getElementById('ad-result-state').style.display = 'none';
    document.getElementById('ad-loading-state').style.display = 'block';
    document.getElementById('ad-btn-save-project').style.display = 'none';
    document.getElementById('ad-btn-copy').style.display = 'none';
    document.getElementById('ad-btn-export').style.display = 'none';

    try {
      const result = await window.Nexeta.AIEngine.generateAd(productName, description, audience, platform, toneOverride);
      
      lastGeneratedAd = result;

      // Populate results
      document.getElementById('result-primary-text').textContent = result.primaryText;
      
      const headlinesUl = document.getElementById('result-headlines');
      headlinesUl.innerHTML = result.headlines.map(h => `<li style="padding: 0.4rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.82rem; font-weight: 600; color: #ffffff;">${h}</li>`).join('');
      
      document.getElementById('result-cta').textContent = result.cta;
      
      const hooksOl = document.getElementById('result-hooks');
      hooksOl.innerHTML = result.hooks.map(h => `<li style="margin-bottom: 0.35rem;">${h}</li>`).join('');
      
      const variationsUl = document.getElementById('result-variations');
      variationsUl.innerHTML = result.variations.map(v => `<li style="padding: 0.5rem; background: rgba(0,0,0,0.15); border: 1px dashed var(--border-color); border-radius: 6px; font-size: 0.8rem; margin-bottom: 0.5rem;">${v}</li>`).join('');

      document.getElementById('result-image-prompt').textContent = result.imagePrompt;
      document.getElementById('result-video-prompt').textContent = result.videoPrompt;

      // Show results
      document.getElementById('ad-loading-state').style.display = 'none';
      document.getElementById('ad-result-state').style.display = 'block';
      document.getElementById('ad-btn-save-project').style.display = 'inline-flex';
      document.getElementById('ad-btn-copy').style.display = 'inline-flex';
      document.getElementById('ad-btn-export').style.display = 'inline-flex';

      // Auto-save to general history logs as well on successful generation
      if (window.Nexeta.HistoryManager) {
        const titleText = `Ad - ${productName}`;
        const assetContent = `Platform Ad Campaign details:
PRIMARY TEXT:
${result.primaryText}
HEADLINES:
${result.headlines.join('\n')}`;
        window.Nexeta.HistoryManager.addHistoryItem('Ad Campaign', titleText, assetContent);
      }

      window.Nexeta.AnalyticsManager.updateDashboardStats();
      if (window.renderHistoryGrid) window.renderHistoryGrid();

      // Auto switch to first tab
      switchAdTab('copy');

    } catch (err) {
      document.getElementById('ad-loading-state').style.display = 'none';
      document.getElementById('ad-empty-state').style.display = 'block';
      alert('Error during campaign creation: ' + err.message);
    }
  });

  // Tab switcher
  const switchAdTab = (tabName) => {
    document.querySelectorAll('.ad-tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === tabName) btn.classList.add('active');
    });
    document.querySelectorAll('.ad-tab-content').forEach(content => {
      content.style.display = 'none';
      if (content.id === `ad-tab-${tabName}`) content.style.display = 'block';
    });
  };

  document.querySelectorAll('.ad-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchAdTab(btn.getAttribute('data-tab'));
    });
  });

  // Copy button
  document.getElementById('ad-btn-copy').addEventListener('click', () => {
    if (!lastGeneratedAd) return;
    
    // Format full content
    const textToCopy = `Platform Ad Campaign details:
    
PRIMARY TEXT:
${lastGeneratedAd.primaryText}

HEADLINES:
${lastGeneratedAd.headlines.map((h, i) => `${i+1}. ${h}`).join('\n')}

CTA:
${lastGeneratedAd.cta}

HOOKS:
${lastGeneratedAd.hooks.map((h, i) => `Hook ${i+1}: ${h}`).join('\n')}

VARIATIONS:
${lastGeneratedAd.variations.map((v, i) => `Variation ${i+1}: ${v}`).join('\n')}

MIDJOURNEY IMAGE PROMPT:
${lastGeneratedAd.imagePrompt}

VIDEO SCENE PROMPT:
${lastGeneratedAd.videoPrompt}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (window.showSuccessNotification) {
        window.showSuccessNotification('Ad Campaign details copied to clipboard!');
      } else {
        alert('Ad Campaign details copied to clipboard!');
      }
    });
  });

  // Save to Project button
  document.getElementById('ad-btn-save-project').addEventListener('click', () => {
    if (!lastGeneratedAd) return;
    const activeProjectId = window.Nexeta.ProjectManager.getActiveProjectId();
    const activeProjName = window.Nexeta.ProjectManager.getActiveProject()?.name || 'Active Project';
    
    const asset = {
      type: 'Ad Campaign',
      title: `Ad - ${document.getElementById('ad-product-name').value.trim()}`,
      content: lastGeneratedAd
    };

    window.Nexeta.ProjectManager.saveAssetToProject(activeProjectId, asset);
    
    // Refresh stats & logs
    window.Nexeta.AnalyticsManager.updateDashboardStats();
    if (window.renderHistoryGrid) window.renderHistoryGrid();

    if (window.showSuccessNotification) {
      window.showSuccessNotification(`Ad Campaign saved successfully under project "${activeProjName}".`);
    } else {
      alert('Asset saved successfully to the selected project.');
    }
  });

  // Export button
  document.getElementById('ad-btn-export')?.addEventListener('click', () => {
    if (!lastGeneratedAd) return;
    const textToExport = `Platform Ad Campaign details:
    
PRIMARY TEXT:
${lastGeneratedAd.primaryText}

HEADLINES:
${lastGeneratedAd.headlines.map((h, i) => `${i+1}. ${h}`).join('\n')}

CTA:
${lastGeneratedAd.cta}

HOOKS:
${lastGeneratedAd.hooks.map((h, i) => `Hook ${i+1}: ${h}`).join('\n')}

VARIATIONS:
${lastGeneratedAd.variations.map((v, i) => `Variation ${i+1}: ${v}`).join('\n')}

MIDJOURNEY IMAGE PROMPT:
${lastGeneratedAd.imagePrompt}

VIDEO SCENE PROMPT:
${lastGeneratedAd.videoPrompt}`;

    if (window.Nexeta.openExportModal) {
      window.Nexeta.openExportModal(textToExport, `ad_campaign_${Date.now()}`);
    }
  });
}

/* ================= 7. DEDICATED AI CHAT VIEW ================= */
function initDedicatedChatView() {
  const chatHistory = document.getElementById('view-chat-history');
  const chatInput = document.getElementById('view-chat-input');
  const sendBtn = document.getElementById('view-chat-send');
  const personaButtons = document.querySelectorAll('.btn-persona');
  const suggestedPrompts = document.querySelectorAll('#view-chat-suggested-prompts .suggested-prompt-chip');

  if (!chatHistory || !chatInput || !sendBtn) return;

  let activePersona = 'marketing';
  let chatSessionHistory = [];

  const personaGreetings = {
    marketing: "Hello! I am your Marketing Strategy Advisor. I can analyze audience target details, design campaign scopes, or optimize schedules. What are we planning today?",
    copywriter: "Hey! I am your Copywriting Expert. I can write persuasive emails, SEO blog outlines, high-CTR hooks, or product descriptions. What copy are we drafting?",
    'ad-specialist': "Hello! I am your Ad Campaign Specialist. I specialize in platform-optimized body copy for Meta, LinkedIn, Google, and TikTok. What are we advertising?",
    seo: "Welcome! I am your SEO Strategist. I can suggest high-intent search terms, structure article tags, or plan content indexing schedules. What keywords are we targeting?"
  };

  // Switch Personas
  personaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      personaButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePersona = btn.getAttribute('data-persona');

      // Update badge details
      const badge = document.getElementById('chat-persona-badge');
      if (badge) badge.textContent = `${activePersona.toUpperCase()} ENGINE ACTIVE`;

      // Clear history list and show welcome bubble
      chatHistory.innerHTML = '';
      chatSessionHistory = [];
      appendChatBubble(chatHistory, personaGreetings[activePersona], 'assistant');
    });
  });

  // Suggested Prompts chips
  suggestedPrompts.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
      chatInput.value = text;
      chatInput.focus();
    });
  });

  const handleSend = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    appendChatBubble(chatHistory, text, 'user');
    chatInput.value = '';

    const typing = appendTypingIndicator(chatHistory);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const reply = await window.Nexeta.AIEngine.chat(text, chatSessionHistory, activePersona);
      typing.remove();
      appendChatBubble(chatHistory, reply, 'assistant');
      chatSessionHistory.push({ sender: 'user', text });
      chatSessionHistory.push({ sender: 'assistant', text: reply });
    } catch (e) {
      typing.remove();
      appendChatBubble(chatHistory, `Error: ${e.message || "Request failed. Please check your API configuration keys."}`, 'assistant');
    }
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // Save Chat to Project
  document.getElementById('chat-btn-save-project')?.addEventListener('click', () => {
    if (chatSessionHistory.length === 0) {
      if (window.showSuccessNotification) {
        window.showSuccessNotification('No chat session content to save yet.', 'error');
      } else {
        alert('No content to save!');
      }
      return;
    }

    const activeProjectId = window.Nexeta.ProjectManager.getActiveProjectId();
    const activeProjName = window.Nexeta.ProjectManager.getActiveProject()?.name || 'Active Project';
    
    // Format full transcript
    const textContent = chatSessionHistory.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n\n');
    
    // Determine type from active persona
    let assetType = 'Marketing Plan';
    if (activePersona === 'copywriter') assetType = 'Copywriting Output';
    else if (activePersona === 'seo') assetType = 'SEO Output';
    else if (activePersona === 'ad-specialist') assetType = 'Ad Campaign';

    // Get a default title
    const firstMsg = chatSessionHistory[0]?.text || '';
    const titleSnippet = firstMsg.substring(0, 30).trim() + (firstMsg.length > 30 ? '...' : '');
    
    const asset = {
      type: assetType,
      title: `Chat Session - ${titleSnippet || new Date().toLocaleDateString()}`,
      content: textContent
    };

    window.Nexeta.ProjectManager.saveAssetToProject(activeProjectId, asset);

    // Save to general history logs
    if (window.Nexeta.HistoryManager) {
      window.Nexeta.HistoryManager.addHistoryItem('Chat Session', asset.title, textContent);
    }

    // Refresh metrics & logs
    window.Nexeta.AnalyticsManager.updateDashboardStats();
    if (window.renderHistoryGrid) window.renderHistoryGrid();

    if (window.showSuccessNotification) {
      window.showSuccessNotification(`Chat saved as "${assetType}" under project "${activeProjName}".`);
    } else {
      alert('Chat session saved successfully!');
    }
  });

  // Export Chat
  document.getElementById('chat-btn-export')?.addEventListener('click', () => {
    if (chatSessionHistory.length === 0) {
      if (window.showSuccessNotification) {
        window.showSuccessNotification('No chat session content to export.', 'error');
      } else {
        alert('No content to export!');
      }
      return;
    }
    const textContent = chatSessionHistory.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n\n');
    if (window.Nexeta.openExportModal) {
      window.Nexeta.openExportModal(textContent, `chat_transcript_${Date.now()}`);
    }
  });
}

/* ================= 8. PROJECTS WORKSPACE VIEW ================= */
function initProjectsView() {
  const container = document.getElementById('projects-grid-container');
  if (!container) return;

  const searchInput = document.getElementById('project-search-input');
  const filterType = document.getElementById('project-filter-type');
  const filterSort = document.getElementById('project-filter-sort');
  const btnGrid = document.getElementById('project-btn-layout-grid');
  const btnList = document.getElementById('project-btn-layout-list');
  const importFileInput = document.getElementById('project-import-file');

  let activeLayout = localStorage.getItem('nexeta_projects_layout_mode') || 'grid';
  let activeStatusTab = 'All';

  // Render trigger
  window.renderProjectsGrid = () => {
    const query = searchInput ? searchInput.value.trim() : '';
    const type = filterType ? filterType.value : 'All';
    const sort = filterSort ? filterSort.value : 'newest';

    if (window.Nexeta && window.Nexeta.ProjectDashboard) {
      window.Nexeta.ProjectDashboard.render(container, query, type, activeStatusTab, sort, activeLayout);
    }
  };

  // Bind input and dropdown changes
  searchInput?.addEventListener('input', window.renderProjectsGrid);
  filterType?.addEventListener('change', window.renderProjectsGrid);
  filterSort?.addEventListener('change', window.renderProjectsGrid);

  // Layout selection triggers
  btnGrid?.addEventListener('click', () => {
    activeLayout = 'grid';
    localStorage.setItem('nexeta_projects_layout_mode', 'grid');
    btnGrid.classList.add('active');
    btnList?.classList.remove('active');
    window.renderProjectsGrid();
  });

  btnList?.addEventListener('click', () => {
    activeLayout = 'list';
    localStorage.setItem('nexeta_projects_layout_mode', 'list');
    btnList.classList.add('active');
    btnGrid?.classList.remove('active');
    window.renderProjectsGrid();
  });

  // Highlight active layout btn
  if (activeLayout === 'list') {
    btnList?.classList.add('active');
    btnGrid?.classList.remove('active');
  } else {
    btnGrid?.classList.add('active');
    btnList?.classList.remove('active');
  }

  // Bind Status tabs toggling
  document.querySelectorAll('.btn-project-status-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.btn-project-status-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeStatusTab = tab.getAttribute('data-status');
      window.renderProjectsGrid();
    });
  });

  // Bind Import JSON files
  importFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && window.Nexeta.WorkspaceActions) {
      window.Nexeta.WorkspaceActions.importJSON(file, (newProject) => {
        window.renderProjectsGrid();
        if (window.renderRecentProjectsTable) window.renderRecentProjectsTable();
        // Redirect to new project workspace
        window.location.hash = `#project-workspace?id=${newProject.id}`;
      });
    }
    // Clear input
    importFileInput.value = '';
  });
}

/* ================= 9. PROMPT LIBRARY WORKSPACE ================= */
function initPromptLibraryView() {
  const container = document.getElementById('prompts-grid-container');
  if (!container) return;

  const searchInput = document.getElementById('prompt-search-input');
  const categoryFilter = document.getElementById('prompt-filter-category');
  const btnAdd = document.getElementById('btn-add-prompt-view');

  window.renderPromptsGrid = () => {
    const query = searchInput ? searchInput.value.trim() : '';
    const category = categoryFilter ? categoryFilter.value : 'All';
    const prompts = window.Nexeta.PromptLibraryManager.searchAndFilter(query, category);

    container.innerHTML = prompts.map(p => `
      <div class="glass-card prompt-card" style="padding: 1.25rem; display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-size: 0.68rem; font-weight: bold; padding: 0.2rem 0.5rem; background: rgba(139,92,246,0.1); color: #8B5CF6; border-radius: 4px;">${p.category}</span>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-outline-subtle btn-fav-prompt" data-id="${p.id}" style="padding: 0.25rem; border-radius: 4px; color: ${p.favorite ? 'gold' : 'var(--text-muted)'};" title="Favorite"><i data-lucide="star" style="width: 12px; height: 12px; fill: ${p.favorite ? 'gold' : 'none'}"></i></button>
            ${p.custom ? `<button class="btn btn-outline-subtle btn-delete-prompt" data-id="${p.id}" style="padding: 0.25rem; border-radius: 4px; color: var(--error);" title="Delete"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></button>` : ''}
          </div>
        </div>

        <div style="margin-top: 0.25rem; flex-grow: 1; display: flex; flex-direction: column;">
          <h4 style="font-weight: 700; color: #ffffff; font-size: 0.9rem; margin-bottom: 0.35rem;">${p.title}</h4>
          <p class="prompt-card-content" style="font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary); margin-bottom: 1rem; flex-grow: 1;">${p.content}</p>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
          <button class="btn btn-outline-subtle btn-copy-prompt" data-content="${p.content.replace(/"/g, '&quot;')}" style="flex: 1; padding: 0.45rem; font-size: 0.72rem; justify-content: center;">
            <i data-lucide="copy" style="width: 12px; height: 12px; margin-right: 4px;"></i> Copy
          </button>
          <button class="btn btn-outline-subtle btn-save-prompt-project" data-title="${p.title.replace(/"/g, '&quot;')}" data-content="${p.content.replace(/"/g, '&quot;')}" style="flex: 1; padding: 0.45rem; font-size: 0.72rem; justify-content: center;">
            <i data-lucide="folder-plus" style="width: 12px; height: 12px; margin-right: 4px;"></i> Save to Proj
          </button>
        </div>
      </div>
    `).join('');

    lucide.createIcons();

    // Bind Favorite trigger
    container.querySelectorAll('.btn-fav-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.Nexeta.PromptLibraryManager.toggleFavorite(id);
        window.renderPromptsGrid();
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Prompt favorites list updated!');
        }
      });
    });

    // Bind Delete trigger
    container.querySelectorAll('.btn-delete-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this custom prompt?')) {
          window.Nexeta.PromptLibraryManager.deletePrompt(id);
          window.renderPromptsGrid();
          if (window.showSuccessNotification) {
            window.showSuccessNotification('Custom prompt removed successfully.');
          }
        }
      });
    });

    // Bind Copy trigger
    container.querySelectorAll('.btn-copy-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const content = btn.getAttribute('data-content');
        navigator.clipboard.writeText(content).then(() => {
          if (window.showSuccessNotification) {
            window.showSuccessNotification('Prompt copied to clipboard!');
          } else {
            alert('Prompt copied!');
          }
        });
      });
    });

    // Bind Save to Project trigger
    container.querySelectorAll('.btn-save-prompt-project').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        const content = btn.getAttribute('data-content');
        const activeProjectId = window.Nexeta.ProjectManager.getActiveProjectId();
        const activeProjName = window.Nexeta.ProjectManager.getActiveProject()?.name || 'Active Project';

        const asset = {
          type: 'Prompt Entry',
          title: `Prompt - ${title}`,
          content: content
        };

        window.Nexeta.ProjectManager.saveAssetToProject(activeProjectId, asset);
        
        // Log to history
        if (window.Nexeta.HistoryManager) {
          window.Nexeta.HistoryManager.addHistoryItem('Prompt Execution', `Saved: ${title}`, content);
        }

        if (window.showSuccessNotification) {
          window.showSuccessNotification(`Saved "${title}" under project "${activeProjName}".`);
        } else {
          alert('Saved successfully!');
        }
      });
    });
  };

  // Search & Filter listeners
  searchInput?.addEventListener('input', window.renderPromptsGrid);
  categoryFilter?.addEventListener('change', window.renderPromptsGrid);

  // Add Prompt Modal triggers
  const modal = document.getElementById('add-prompt-modal');
  const modalClose = document.getElementById('add-prompt-close');
  const formAdd = document.getElementById('add-prompt-form');

  btnAdd?.addEventListener('click', () => {
    modal.classList.add('active');
  });

  modalClose?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  formAdd?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('new-prompt-title').value.trim();
    const category = document.getElementById('new-prompt-category').value;
    const content = document.getElementById('new-prompt-content').value.trim();

    window.Nexeta.PromptLibraryManager.addPrompt(title, content, category);
    formAdd.reset();
    modal.classList.remove('active');
    window.renderPromptsGrid();
    if (window.showSuccessNotification) {
      window.showSuccessNotification('New custom prompt created.');
    }
  });
}

/* ================= 10. AUTOMATION WORKSPACE ================= */
function initAutomationView() {
  const form = document.getElementById('schedule-post-form');
  if (!form) return;

  // Set min date to today
  const dateInput = document.getElementById('post-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  window.renderAutomationQueue = () => {
    const data = window.Nexeta.AutomationManager.getAutomationData();
    const tableBody = document.querySelector('#scheduler-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = data.schedulerQueue.map(post => {
      const isSent = post.status === 'sent';
      return `
        <tr>
          <td><span style="text-transform: capitalize; font-weight: bold; color: ${post.channel === 'facebook' ? 'var(--primary)' : 'var(--accent-cyan)'};">${post.channel}</span></td>
          <td style="font-family: monospace;">${post.date} &nbsp;${post.time}</td>
          <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${post.content}</td>
          <td><span class="status-badge ${isSent ? 'completed' : 'processing'}">${isSent ? 'Published' : 'Pending'}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-outline-subtle btn-delete-post" data-id="${post.id}" style="padding: 0.35rem; color: var(--error);"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();

    // Bind deletes
    tableBody.querySelectorAll('.btn-delete-post').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.Nexeta.AutomationManager.deleteScheduledPost(id);
        window.renderAutomationQueue();
      });
    });

    // Populate toggles
    document.getElementById('rule-auto-social').checked = data.campaignRules.autoSocialPosting;
    document.getElementById('rule-lead-follow').checked = data.campaignRules.leadFollowUp;
  };

  // Schedule Post Form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const channel = document.getElementById('post-channel').value;
    const date = document.getElementById('post-date').value;
    const time = document.getElementById('post-time').value;
    const content = document.getElementById('post-content').value.trim();

    window.Nexeta.AutomationManager.schedulePost(channel, content, date, time);
    document.getElementById('post-content').value = '';
    window.renderAutomationQueue();
  });

  // Toggles active state rules
  document.getElementById('rule-auto-social')?.addEventListener('change', (e) => {
    window.Nexeta.AutomationManager.updateRules({ autoSocialPosting: e.target.checked });
  });

  document.getElementById('rule-lead-follow')?.addEventListener('change', (e) => {
    window.Nexeta.AutomationManager.updateRules({ leadFollowUp: e.target.checked });
  });
}

/* ================= 11. BILLING WORKSPACE ================= */
function initBillingView() {
  window.renderBillingData = () => {
    const data = window.Nexeta.BillingManager.getBillingData();
    const remaining = window.Nexeta.BillingManager.getRemainingCredits();

    // Update Progress Meters
    document.getElementById('billing-credits-used-text').textContent = `${remaining.toLocaleString()} / ${data.creditsTotal.toLocaleString()} Credits`;
    document.getElementById('billing-credits-progress').style.width = `${Math.min(100, (remaining / data.creditsTotal) * 100)}%`;

    document.getElementById('billing-api-calls-text').textContent = `${data.apiCalls.toLocaleString()} / ${data.apiLimit.toLocaleString()} calls`;
    document.getElementById('billing-api-calls-progress').style.width = `${Math.min(100, (data.apiCalls / data.apiLimit) * 100)}%`;

    document.getElementById('billing-images-text').textContent = `${data.imagesGenerated.toLocaleString()} / ${data.imagesLimit.toLocaleString()} images`;
    document.getElementById('billing-images-progress').style.width = `${Math.min(100, (data.imagesGenerated / data.imagesLimit) * 100)}%`;

    // Render invoices
    const tbody = document.querySelector('#invoices-table tbody');
    if (tbody) {
      tbody.innerHTML = data.invoiceHistory.map(inv => `
        <tr>
          <td style="font-weight: 700; color: #ffffff;">${inv.id}</td>
          <td>${inv.date}</td>
          <td>${inv.amount}</td>
          <td><span class="status-badge completed">${inv.status}</span></td>
        </tr>
      `).join('');
    }
  };
}

/* ================= 12. ACCOUNT SETTINGS VIEW ================= */
function initSettingsView() {
  const form = document.getElementById('settings-profile-form');
  if (!form) return;

  const loadSettings = () => {
    const user = window.Nexeta.Auth.getCurrentUser();
    document.getElementById('settings-user-name').value = user.name;
    document.getElementById('settings-user-email').value = user.email;
    document.getElementById('settings-user-avatar').value = user.avatar || '';
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('settings-user-name').value.trim();
    const email = document.getElementById('settings-user-email').value.trim();
    const avatar = document.getElementById('settings-user-avatar').value.trim();

    window.Nexeta.Auth.updateUser({ name, email, avatar });
    alert('User identity profile settings updated.');
    location.reload(); // Force full reload to update header avatars
  });

  // Danger Zone - Purge database
  document.getElementById('btn-purge-data')?.addEventListener('click', () => {
    if (confirm('CRITICAL WARNING: This will completely wipe out all local data cache including projects, settings, brand parameters, and keys. Proceed?')) {
      localStorage.clear();
      alert('Local database storage cleared. Reloading platform...');
      location.reload();
    }
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#settings') loadSettings();
  });
  loadSettings();
}

/* ================= UI EXTRAS & INTERACTIONS ================= */
function initSpotlightGlows() {
  const cards = document.querySelectorAll('.glass-card, .stat-card, .action-card, .generation-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const sunIcon = themeBtn.querySelector('.sun-icon');
    const moonIcon = themeBtn.querySelector('.moon-icon');
    if (newTheme === 'light') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      themeBtn.setAttribute('aria-label', 'Switch to dark theme');
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      themeBtn.setAttribute('aria-label', 'Switch to light theme');
    }
  });
}

function initDropdownMenus() {
  setupDropdown('notification-btn', 'notification-dropdown');
  setupDropdown('user-avatar-btn', 'profile-dropdown');

  function setupDropdown(triggerId, dropdownId) {
    const trigger = document.getElementById(triggerId);
    const dropdown = document.getElementById(dropdownId);
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-menu-list').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
      });
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });
  }
}

function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('dashboard-sidebar');
  const mainPanel = document.getElementById('dashboard-main');
  if (!toggleBtn || !sidebar || !mainPanel) return;

  toggleBtn.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('sidebar-collapsed');
    mainPanel.classList.toggle('main-collapsed');
    
    if (isCollapsed) {
      toggleBtn.setAttribute('aria-label', 'Expand sidebar');
      toggleBtn.innerHTML = '<i data-lucide="chevron-right"></i><span class="sidebar-collapse-text" style="margin-left: 0.75rem;">Expand Sidebar</span>';
    } else {
      toggleBtn.setAttribute('aria-label', 'Collapse sidebar');
      toggleBtn.innerHTML = '<i data-lucide="chevron-left"></i><span class="sidebar-collapse-text" style="margin-left: 0.75rem;">Collapse Sidebar</span>';
    }
    lucide.createIcons();
  });
}
function initNewProjectModal() {
  const modal = document.getElementById('new-project-modal');
  const openBtn = document.getElementById('new-project-btn');
  const closeBtn = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('wizard-cancel');
  const prevBtn = document.getElementById('wizard-prev');
  const nextBtn = document.getElementById('wizard-next');
  const submitBtn = document.getElementById('new-project-submit');

  const nameInput = document.getElementById('new-project-name');
  const descInput = document.getElementById('new-project-desc');
  const templateSelect = document.getElementById('new-project-template');
  const teamInput = document.getElementById('new-project-team');
  const tagsInput = document.getElementById('new-project-tags');

  const nameError = document.getElementById('new-project-name-error');
  const typeError = document.getElementById('new-project-type-error');
  const optionBtns = document.querySelectorAll('.modal-option-btn');
  const viewCreateBtn = document.getElementById('btn-create-project-view');

  if (!modal || !openBtn || !closeBtn) return;

  let currentStep = 1;
  let selectedType = null;

  const showStep = (step) => {
    currentStep = step;
    
    // Toggle panels
    document.querySelectorAll('.wizard-step').forEach(el => {
      el.style.display = Number(el.getAttribute('data-step')) === step ? 'flex' : 'none';
    });

    // Toggle indicators
    document.querySelectorAll('.wizard-indicator').forEach(el => {
      const elStep = Number(el.getAttribute('data-step'));
      if (elStep === step) {
        el.className = 'wizard-indicator active';
        el.style.background = 'var(--primary)';
      } else if (elStep < step) {
        el.className = 'wizard-indicator completed';
        el.style.background = 'var(--success)';
      } else {
        el.className = 'wizard-indicator';
        el.style.background = 'rgba(255,255,255,0.08)';
      }
    });

    // Toggle buttons
    if (step === 1) {
      if (cancelBtn) cancelBtn.style.display = 'inline-flex';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      if (submitBtn) submitBtn.style.display = 'none';
    } else if (step === 2) {
      if (cancelBtn) cancelBtn.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'inline-flex';
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      if (submitBtn) submitBtn.style.display = 'none';
    } else if (step === 3) {
      if (cancelBtn) cancelBtn.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'inline-flex';
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-flex';
    }
  };

  const resetModal = () => {
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (templateSelect) templateSelect.value = 'none';
    if (teamInput) teamInput.value = '';
    if (tagsInput) tagsInput.value = '';

    if (nameError) nameError.style.display = 'none';
    if (typeError) typeError.style.display = 'none';
    selectedType = null;
    optionBtns.forEach(b => b.classList.remove('selected'));
    showStep(1);
  };

  const openModal = () => {
    resetModal();
    modal.classList.add('active');
    if (nameInput) nameInput.focus();
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  openBtn.addEventListener('click', openModal);
  if (viewCreateBtn) {
    viewCreateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal();
    });
  }

  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      optionBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedType = btn.getAttribute('data-type');
      if (typeError) typeError.style.display = 'none';
    });
  });

  // Next Click handler
  nextBtn?.addEventListener('click', () => {
    if (currentStep === 1) {
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        if (nameError) nameError.style.display = 'block';
        return;
      }
      if (nameError) nameError.style.display = 'none';
      showStep(2);
    } else if (currentStep === 2) {
      if (!selectedType) {
        if (typeError) typeError.style.display = 'block';
        return;
      }
      if (typeError) typeError.style.display = 'none';
      showStep(3);
    }
  });

  // Previous Click handler
  prevBtn?.addEventListener('click', () => {
    if (currentStep === 2) {
      showStep(1);
    } else if (currentStep === 3) {
      showStep(2);
    }
  });

  // Submit Click handler
  submitBtn?.addEventListener('click', () => {
    const name = nameInput ? nameInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const tmpl = templateSelect ? templateSelect.value : 'none';
    const teamVal = teamInput ? teamInput.value.trim() : '';
    const tagsVal = tagsInput ? tagsInput.value.trim() : '';

    if (!name || !selectedType) return;

    // Parse members
    const members = [{ name: 'Sarah Jenkins', email: 'sarah@nexeta.ai', role: 'Owner' }];
    if (teamVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let hasInvalid = false;
      teamVal.split(',').forEach(emailStr => {
        const email = emailStr.trim();
        if (email) {
          if (!emailRegex.test(email)) {
            hasInvalid = true;
            return;
          }
          const uParts = email.split('@');
          const dispName = uParts[0].charAt(0).toUpperCase() + uParts[0].slice(1);
          members.push({ name: dispName, email, role: 'Editor' });
        }
      });
      if (hasInvalid) {
        alert("Warning: Some team member emails were invalid and were skipped.");
      }
    }

    // Parse tags
    const tags = [];
    if (tagsVal) {
      tagsVal.split(',').forEach(t => {
        const cleanT = t.trim();
        if (cleanT) tags.push(cleanT);
      });
    }

    // Prepopulate tasks/assets if template selected
    let initialTasks = [];
    let initialAssets = [];

    if (tmpl === 'AIDA Blueprint') {
      initialTasks = [
        { id: 't-' + Date.now() + '-1', title: 'Draft Attention Hook', description: 'Create bold copy lines targeting the primary campaign target audience.', priority: 'high', dueDate: new Date(Date.now() + 86400000*3).toISOString().split('T')[0], status: 'todo', comments: [] },
        { id: 't-' + Date.now() + '-2', title: 'Outline Interest Builders', description: 'Elaborate campaign core specs and value propositions.', priority: 'medium', dueDate: new Date(Date.now() + 86400000*4).toISOString().split('T')[0], status: 'todo', comments: [] },
        { id: 't-' + Date.now() + '-3', title: 'Generate Desire Callouts', description: 'Write conversion copy creating FOMO.', priority: 'medium', dueDate: new Date(Date.now() + 86400000*5).toISOString().split('T')[0], status: 'todo', comments: [] },
        { id: 't-' + Date.now() + '-4', title: 'Write Action CTA Buttons', description: 'Direct checkout pathways copywriting.', priority: 'low', dueDate: new Date(Date.now() + 86400000*6).toISOString().split('T')[0], status: 'todo', comments: [] }
      ];
      initialAssets = [
        { id: 'ast-' + Date.now() + '-1', title: 'AIDA Framework Blueprint Strategy', type: 'Marketing Strategy', content: `AIDA Blueprint initialized for campaign "${name}". Objectives: outline Attention-grabbing hooks, build product Interest, generate conversion Desire, and trigger Call-To-Action pathways.`, timestamp: new Date().toLocaleString() }
      ];
    } else if (tmpl === 'PAS Framework') {
      initialTasks = [
        { id: 't-' + Date.now() + '-1', title: 'Identify Core Problem', description: 'Define user friction point and primary marketing angles.', priority: 'high', dueDate: new Date(Date.now() + 86400000*3).toISOString().split('T')[0], status: 'todo', comments: [] },
        { id: 't-' + Date.now() + '-2', title: 'Write Problem Agitation Copy', description: 'Highlight negative implications of the problem.', priority: 'medium', dueDate: new Date(Date.now() + 86400000*5).toISOString().split('T')[0], status: 'todo', comments: [] },
        { id: 't-' + Date.now() + '-3', title: 'Formulate Solution Benefits', description: 'Position product features as absolute solutions.', priority: 'high', dueDate: new Date(Date.now() + 86400000*6).toISOString().split('T')[0], status: 'todo', comments: [] }
      ];
    } else if (tmpl === 'Landing Page Funnel') {
      initialTasks = [
        { id: 't-' + Date.now() + '-1', title: 'Draft Headline & Subheadline', description: 'Write punchy above-the-fold value statements.', priority: 'high', dueDate: new Date(Date.now() + 86400000*2).toISOString().split('T')[0], status: 'todo', comments: [] },
        { id: 't-' + Date.now() + '-2', title: 'Outline Landing Page Benefits Grid', description: 'Write three structured benefit grids explaining specs.', priority: 'medium', dueDate: new Date(Date.now() + 86400000*4).toISOString().split('T')[0], status: 'todo', comments: [] }
      ];
    }

    const newProject = {
      id: 'proj-' + Date.now(),
      name,
      type: selectedType,
      description: desc,
      created: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      lastEdited: new Date().toLocaleString(),
      status: 'Draft',
      progress: 0,
      favorite: false,
      archived: false,
      tags,
      members,
      tasks: initialTasks,
      assets: initialAssets,
      notes: desc ? `Objectives Outline:\n${desc}` : '',
      chats: [],
      versions: [],
      activities: [
        { id: 'act-init', action: 'Campaign workspace initialized.', timestamp: new Date().toLocaleString() }
      ]
    };

    const pm = window.Nexeta.ProjectManager;
    const projects = pm.getProjects();
    projects.unshift(newProject);
    pm.saveProjects(projects);
    pm.setActiveProjectId(newProject.id);

    closeModal();
    
    // Refresh
    if (window.renderProjectsGrid) window.renderProjectsGrid();
    if (window.renderRecentProjectsTable) window.renderRecentProjectsTable();

    // Redirect to active workspace view instantly
    window.location.hash = `#project-workspace?id=${newProject.id}`;
  });
}

function renderRecentProjectsTable() {
  const tbody = document.querySelector('.project-table tbody');
  if (!tbody) return;

  const projects = window.Nexeta.ProjectManager.getProjects();
  const recentProjects = projects.slice(0, 4);

  if (recentProjects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.85rem;">
          No projects found. Click "+ New Project" to initialize your workspace.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = recentProjects.map(proj => {
    let badgeClass = 'draft';
    if (proj.status === 'Completed') badgeClass = 'completed';
    if (proj.status === 'Processing') badgeClass = 'processing';
    if (proj.status === 'Failed') badgeClass = 'failed';

    return `
      <tr>
        <td style="font-weight: 600; color: #ffffff; font-size: 0.85rem;">${proj.name}</td>
        <td style="font-size: 0.82rem;">${proj.type}</td>
        <td style="font-size: 0.82rem; color: var(--text-secondary);">${proj.created}</td>
        <td><span class="status-badge ${badgeClass}" style="font-size: 0.7rem;">${proj.status}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-outline-subtle btn-open-recent-proj" data-id="${proj.id}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">Open</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-open-recent-proj').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      window.Nexeta.ProjectManager.setActiveProjectId(id);
      window.location.hash = '#projects';
      if (window.renderProjectsGrid) window.renderProjectsGrid();
    });
  });
}
window.renderRecentProjectsTable = renderRecentProjectsTable;

/* ================= 13. TOAST NOTIFICATIONS ================= */
function showSuccessNotification(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  
  let iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-octagon';
  if (type === 'info') iconName = 'info';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 16px; height: 16px; flex-shrink: 0; color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary)'}"></i>
    <span style="flex-grow: 1;">${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Trigger animation frame
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);

  // Auto remove toast after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 3500);
}
window.showSuccessNotification = showSuccessNotification;

/* ================= 14. CUSTOM RENAME PROJECT MODAL ================= */
function initRenameProjectModal() {
  const modal = document.getElementById('rename-project-modal');
  const closeBtn = document.getElementById('rename-project-close');
  const cancelBtn = document.getElementById('rename-project-cancel');
  const submitBtn = document.getElementById('rename-project-submit');
  const nameInput = document.getElementById('rename-project-name');
  const nameError = document.getElementById('rename-project-name-error');

  if (!modal) return;

  let activeRenameId = null;

  window.Nexeta.openRenameModal = (projectId) => {
    const projects = window.Nexeta.ProjectManager.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    activeRenameId = projectId;
    if (nameInput) nameInput.value = project.name;
    if (nameError) nameError.style.display = 'none';

    modal.classList.add('active');
    if (nameInput) nameInput.focus();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    activeRenameId = null;
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const handleSubmit = () => {
    const newName = nameInput ? nameInput.value.trim() : '';
    if (!newName) {
      if (nameError) nameError.style.display = 'block';
      return;
    }

    if (activeRenameId) {
      window.Nexeta.ProjectManager.renameProject(activeRenameId, newName);
      closeModal();
      
      // Update UI components
      if (window.renderProjectsGrid) window.renderProjectsGrid();
      if (window.renderRecentProjectsTable) window.renderRecentProjectsTable();
      window.Nexeta.AnalyticsManager.updateDashboardStats();

      if (window.showSuccessNotification) {
        window.showSuccessNotification('Campaign renamed successfully.');
      }
    }
  };

  submitBtn?.addEventListener('click', handleSubmit);
  nameInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
}

/* ================= 15. EXPORT SYSTEM MODAL ================= */
function initExportModal() {
  const modal = document.getElementById('export-modal');
  const closeBtn = document.getElementById('export-modal-close');
  
  if (!modal) return;

  let exportText = '';
  let exportPrefix = 'naxeta_export';

  window.Nexeta.openExportModal = (text, filenamePrefix = 'export') => {
    exportText = text;
    exportPrefix = filenamePrefix;
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle click on format action buttons
  document.querySelectorAll('.btn-export-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      closeModal();

      if (format === 'copy') {
        navigator.clipboard.writeText(exportText).then(() => {
          showSuccessNotification('Content copied to clipboard successfully!');
        });
      } else if (format === 'txt') {
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportPrefix}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccessNotification('Plain text file download started.');
      } else if (format === 'pdf') {
        // Create an elegant print-friendly popup window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>${exportPrefix}</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  line-height: 1.6;
                  color: #111827;
                  padding: 2.5rem;
                  max-width: 800px;
                  margin: 0 auto;
                }
                pre {
                  white-space: pre-wrap;
                  word-wrap: break-word;
                  font-family: inherit;
                  font-size: 1.05rem;
                }
                h1 {
                  border-bottom: 2px solid #3b82f6;
                  padding-bottom: 0.5rem;
                  color: #1e3a8a;
                  font-size: 1.75rem;
                }
                .footer {
                  margin-top: 3rem;
                  border-top: 1px solid #e5e7eb;
                  padding-top: 1rem;
                  font-size: 0.75rem;
                  color: #6b7280;
                  display: flex;
                  justify-content: space-between;
                }
              </style>
            </head>
            <body>
              <h1>Naxeta AI Suite Generated Content</h1>
              <pre>${exportText}</pre>
              <div class="footer">
                <span>Generated via Naxeta Marketing Assistant</span>
                <span>Date: ${new Date().toLocaleDateString()}</span>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        showSuccessNotification('PDF print preview rendered.');
      } else if (format === 'docx') {
        // Create Word Document HTML wrapper
        const docHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
              <title>${exportPrefix}</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.5; }
                h1 { color: #1e3a8a; font-size: 18pt; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                pre { font-family: Arial, sans-serif; font-size: 11pt; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>Naxeta AI Suite Marketing Output</h1>
              <pre>${exportText.replace(/\n/g, '<br>')}</pre>
            </body>
          </html>
        `;
        const blob = new Blob([docHtml], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportPrefix}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccessNotification('Word Document file download started.');
      }
    });
  });
}

/* ================= 16. GENERATION HISTORY VIEW ================= */
function initHistoryView() {
  const searchInput = document.getElementById('history-search-input');
  const filterType = document.getElementById('history-filter-type');
  const clearBtn = document.getElementById('btn-clear-all-history');

  // History Details Drawer bindings
  const detailModal = document.getElementById('history-detail-modal');
  const detailClose = document.getElementById('history-detail-close');
  const detailCloseBtn = document.getElementById('history-detail-btn-close');
  const detailExportBtn = document.getElementById('history-detail-btn-export');

  let activeHistoryContent = '';
  let activeHistoryTitle = '';

  const closeDetail = () => {
    detailModal?.classList.remove('active');
  };

  detailClose?.addEventListener('click', closeDetail);
  detailCloseBtn?.addEventListener('click', closeDetail);
  detailModal?.addEventListener('click', (e) => {
    if (e.target === detailModal) closeDetail();
  });

  detailExportBtn?.addEventListener('click', () => {
    if (window.Nexeta.openExportModal && activeHistoryContent) {
      closeDetail();
      window.Nexeta.openExportModal(activeHistoryContent, activeHistoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    }
  });

  window.renderHistoryGrid = () => {
    const container = document.getElementById('history-grid-container');
    if (!container) return;

    const query = searchInput ? searchInput.value.trim() : '';
    const type = filterType ? filterType.value : 'All';

    if (!window.Nexeta.HistoryManager) return;
    const historyItems = window.Nexeta.HistoryManager.searchAndFilter(query, type);

    if (historyItems.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem; width: 100%;">
          <i data-lucide="inbox" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.4;"></i>
          <h3>No history entries found</h3>
          <p>Generate some copy in the Chat or Ad Creator, or adjust search keywords.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = historyItems.map(item => {
      let icon = 'message-square';
      let iconColor = '#3b82f6';
      if (item.type === 'Ad Campaign') {
        icon = 'megaphone';
        iconColor = '#10b981';
      } else if (item.type === 'Prompt Execution') {
        icon = 'bookmark';
        iconColor = '#8b5cf6';
      }

      // Short preview
      const contentSnippet = item.content.substring(0, 140) + (item.content.length > 140 ? '...' : '');

      return `
        <div class="glass-card history-card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: all 0.2s;" data-id="${item.id}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="font-size: 0.65rem; font-weight: bold; padding: 0.15rem 0.45rem; background: rgba(255,255,255,0.04); color: ${iconColor}; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="${icon}" style="width: 10px; height: 10px;"></i> ${item.type}
              </span>
              <button class="btn btn-outline-subtle btn-delete-history-item" data-id="${item.id}" style="padding: 0.2rem; border-radius: 4px; color: var(--error);" title="Delete Record">
                <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
              </button>
            </div>
            
            <h4 style="font-weight: 700; color: #ffffff; font-size: 0.9rem; margin-bottom: 0.25rem;">${item.title}</h4>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">${item.timestamp}</span>
            <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal;">${contentSnippet}</p>
          </div>
          
          <div style="display: flex; justify-content: flex-end; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem;">
            <span style="font-size: 0.72rem; color: var(--primary); font-weight: 600; display: inline-flex; align-items: center; gap: 2px;">
              View Details <i data-lucide="chevron-right" style="width: 12px; height: 12px;"></i>
            </span>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Bind card click opens details modal
    container.querySelectorAll('.history-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent trigger if clicking delete button
        if (e.target.closest('.btn-delete-history-item')) return;
        const id = card.getAttribute('data-id');
        const item = historyItems.find(h => h.id === id);
        if (!item) return;

        activeHistoryContent = item.content;
        activeHistoryTitle = item.title;

        const titleEl = document.getElementById('history-detail-title');
        const metaEl = document.getElementById('history-detail-meta');
        const contentEl = document.getElementById('history-detail-content');

        if (titleEl) titleEl.textContent = item.title;
        if (metaEl) metaEl.textContent = `${item.type} | Generated on ${item.timestamp}`;
        if (contentEl) {
          // Format linebreaks nicely
          contentEl.textContent = item.content;
        }

        detailModal?.classList.add('active');
      });
    });

    // Bind individual delete trigger
    container.querySelectorAll('.btn-delete-history-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this history record?')) {
          window.Nexeta.HistoryManager.deleteHistoryItem(id);
          window.renderHistoryGrid();
          window.Nexeta.AnalyticsManager.updateDashboardStats();
          if (window.showSuccessNotification) {
            window.showSuccessNotification('History item removed.');
          }
        }
      });
    });
  };

  // Search & Filter listeners
  searchInput?.addEventListener('input', window.renderHistoryGrid);
  filterType?.addEventListener('change', window.renderHistoryGrid);

  // Clear all history trigger
  clearBtn?.addEventListener('click', () => {
    if (confirm('CRITICAL WARNING: This will permanently delete all AI generations from your persistent history log. Proceed?')) {
      window.Nexeta.HistoryManager.clearAllHistory();
      window.renderHistoryGrid();
      window.Nexeta.AnalyticsManager.updateDashboardStats();
      if (window.showSuccessNotification) {
        window.showSuccessNotification('All history records cleared.', 'info');
      }
    }
  });
}

/* ================= 16. RIGHT SIDEBAR WIDGETS ================= */
function initRightSidebarWidgets() {
  // --- Notifications Card UI ---
  const listEl = document.querySelector('.notifications-list');
  const badgeEl = document.getElementById('notification-unread-count');
  const markAllBtn = document.getElementById('btn-mark-all-read');

  const updateBadge = () => {
    if (!badgeEl || !listEl) return;
    const unreadCount = listEl.querySelectorAll('.notification-item.unread').length;
    badgeEl.textContent = unreadCount;
    if (unreadCount === 0) {
      badgeEl.style.display = 'none';
    } else {
      badgeEl.style.display = 'inline-block';
    }
  };

  // Bind mark individual notification as read
  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-notification-read');
      if (btn) {
        const item = btn.closest('.notification-item');
        if (item) {
          item.classList.remove('unread');
          item.style.opacity = '0.5';
          btn.style.display = 'none';
          updateBadge();
          if (window.showSuccessNotification) {
            window.showSuccessNotification('Notification marked as read.');
          }
        }
      }
    });
  }

  // Bind mark all read
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      if (!listEl) return;
      listEl.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
        item.style.opacity = '0.5';
        const btn = item.querySelector('.btn-notification-read');
        if (btn) btn.style.display = 'none';
      });
      updateBadge();
      if (window.showSuccessNotification) {
        window.showSuccessNotification('All notifications marked as read.');
      }
    });
  }

  // Initial badge update
  updateBadge();

  // --- AI Tips Panel UI ---
  const tips = [
    { tag: "Marketing Tip", text: "Create high-converting landing page headlines by using the PAS framework (Problem-Agitate-Solve) with your target customer's biggest pain point." },
    { tag: "SEO Tip", text: "Target long-tail informational search queries. Optimize blog posts to answer direct 'how-to' questions in the first 100 words to capture Google Featured Snippets." },
    { tag: "Prompt Tip", text: "Specify the persona, context, constraints, and output format in your prompt. For example: 'Act as a Senior Copywriter. Write 3 headline variants under 60 characters for...'" },
    { tag: "Workflow Tip", text: "Use automated social syndication. Once the AI Blog writer publishes an article, trigger the webhook to automatically create LinkedIn summaries." },
    { tag: "Growth Tip", text: "Use conversational hooks in your ad creative. Asking a polarizing question in the first 3 seconds of a video hook boosts view-through rate by 34%." },
    { tag: "Strategy Tip", text: "Before building your content calendar, outline your audience's buyer journey: Awareness (Informational blogs), Consideration (Case studies), Decision (Product comparisons)." }
  ];

  const tagEl = document.getElementById('ai-tip-tag');
  const textEl = document.getElementById('ai-tip-text');
  const nextBtn = document.getElementById('btn-next-tip');

  let currentTipIndex = 0;

  const showTip = (index) => {
    if (!tagEl || !textEl) return;
    const tip = tips[index];
    tagEl.textContent = tip.tag;
    textEl.textContent = tip.text;
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentTipIndex = (currentTipIndex + 1) % tips.length;
      showTip(currentTipIndex);
    });
  }

  // Show a random tip initially
  currentTipIndex = Math.floor(Math.random() * tips.length);
  showTip(currentTipIndex);
}

/* ================= 17. AI CHAT UPGRADES & FOLDERS ================= */
function initChatExtensions() {
  const FOLDER_KEY = 'nexeta_chat_folders';
  const SESSIONS_KEY = 'nexeta_chat_sessions';

  // Load or initialize folders
  let folders = JSON.parse(localStorage.getItem(FOLDER_KEY)) || [
    { id: 'folder-1', name: 'Social Campaigns' },
    { id: 'folder-2', name: 'SEO Content' }
  ];

  // Load or initialize chat sessions
  let sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [
    {
      id: 'session-default',
      title: 'Marketing Kickoff Chat',
      persona: 'marketing',
      messages: [
        { sender: 'assistant', text: 'Hello! I am your Marketing Strategy Advisor. What are we planning today?' }
      ],
      folderId: 'folder-1',
      pinned: false,
      favorite: false
    }
  ];

  let activeSessionId = localStorage.getItem('nexeta_active_chat_session_id') || 'session-default';
  let activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  if (activeSession) activeSessionId = activeSession.id;

  // Selected files list for upload simulation
  let selectedFiles = [];

  // Dom queries
  const chatHistory = document.getElementById('view-chat-history');
  const chatInput = document.getElementById('view-chat-input');
  const sendBtn = document.getElementById('view-chat-send');
  const folderContainer = document.getElementById('chat-folder-container');
  const searchInput = document.getElementById('chat-search-input');
  const addFolderBtn = document.getElementById('btn-add-chat-folder');
  const copyChatBtn = document.getElementById('chat-btn-copy-all');
  const saveProjectBtn = document.getElementById('chat-btn-save-project');
  const exportChatBtn = document.getElementById('chat-btn-export');
  const attachBtn = document.getElementById('view-chat-attach');
  const voiceBtn = document.getElementById('view-chat-voice');
  const dragOverlay = document.getElementById('chat-drag-drop-overlay');
  const uploadPreviewBar = document.getElementById('chat-upload-preview-bar');
  const chatWrapper = document.querySelector('.chat-wrapper');
  const activeTitleEl = document.getElementById('active-chat-title');
  const personaBadgeEl = document.getElementById('chat-persona-badge');

  // Persistence helpers
  const saveState = () => {
    localStorage.setItem(FOLDER_KEY, JSON.stringify(folders));
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    localStorage.setItem('nexeta_active_chat_session_id', activeSessionId);

    // Sync back to active project
    const activeProjId = window.Nexeta.ProjectManager.getActiveProjectId();
    if (activeProjId) {
      const projects = window.Nexeta.ProjectManager.getProjects();
      const project = projects.find(p => p.id === activeProjId);
      if (project && project.chats) {
        let projectModified = false;
        
        // Update existing chats or remove deleted ones
        const originalLength = project.chats.length;
        project.chats = project.chats.filter(projChat => {
          const globalSess = sessions.find(s => s.id === projChat.id);
          if (!globalSess) {
            projectModified = true;
            return false; // Deleted globally, remove from project
          }
          
          if (JSON.stringify(projChat.messages) !== JSON.stringify(globalSess.messages) ||
              projChat.title !== globalSess.title ||
              projChat.persona !== globalSess.persona) {
            projChat.messages = JSON.parse(JSON.stringify(globalSess.messages));
            projChat.title = globalSess.title;
            projChat.persona = globalSess.persona;
            projectModified = true;
          }
          return true;
        });

        if (projectModified) {
          project.lastEdited = new Date().toLocaleString();
          window.Nexeta.ProjectManager.saveProjects(projects);
        }
      }
    }
  };

  // Re-bind chat persona buttons so they don't break session management
  const personaButtons = document.querySelectorAll('.btn-persona');
  personaButtons.forEach(btn => {
    // Clone to remove previous basic listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', () => {
      document.querySelectorAll('.btn-persona').forEach(b => b.classList.remove('active'));
      newBtn.classList.add('active');
      const persona = newBtn.getAttribute('data-persona');
      
      // If we change persona, we switch the active session's persona
      if (activeSession) {
        activeSession.persona = persona;
        saveState();
        
        // Update badge details
        if (personaBadgeEl) personaBadgeEl.textContent = `${persona.toUpperCase()} ENGINE ACTIVE`;
        
        // Add greeting message if session is empty (or has only greetings)
        if (activeSession.messages.length <= 1) {
          const greetings = {
            marketing: "Hello! I am your Marketing Strategy Advisor. What are we planning today?",
            copywriter: "Hey! I am your Copywriting Expert. What copy are we drafting?",
            'ad-specialist': "Hello! I am your Ad Campaign Specialist. What are we advertising?",
            seo: "Welcome! I am your SEO Strategist. What keywords are we targeting?"
          };
          activeSession.messages = [{ sender: 'assistant', text: greetings[persona] || 'Creative Engine Active' }];
          saveState();
          renderActiveMessages();
        }
      }
    });
  });

  // Render a single chat session item
  const renderSessionItem = (s) => {
    const isActive = s.id === activeSessionId;
    return `
      <div class="sidebar-chat-session ${isActive ? 'active' : ''}" data-session-id="${s.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.35rem 0.5rem; border-radius: 6px; cursor: pointer; margin-bottom: 2px;">
        <span style="font-size: 0.72rem; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 110px;">${s.title}</span>
        <div class="chat-session-controls" style="display: flex; gap: 2px;">
          <button class="btn-pin-session" data-session-id="${s.id}" style="background: transparent; border: none; color: ${s.pinned ? 'var(--warning)' : 'var(--text-muted)'}; cursor: pointer; padding: 0;" title="Pin"><i data-lucide="pin" style="width: 10px; height: 10px;"></i></button>
          <button class="btn-fav-session" data-session-id="${s.id}" style="background: transparent; border: none; color: ${s.favorite ? '#f59e0b' : 'var(--text-muted)'}; cursor: pointer; padding: 0;" title="Favorite"><i data-lucide="star" style="width: 10px; height: 10px;"></i></button>
          <button class="btn-rename-session" data-session-id="${s.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0;" title="Rename"><i data-lucide="edit-2" style="width: 10px; height: 10px;"></i></button>
          <button class="btn-delete-session" data-session-id="${s.id}" style="background: transparent; border: none; color: var(--error); cursor: pointer; padding: 0;" title="Delete"><i data-lucide="trash-2" style="width: 10px; height: 10px;"></i></button>
        </div>
      </div>
    `;
  };

  // Render conversation tree (folders & sessions)
  const renderConversationTree = () => {
    if (!folderContainer) return;
    
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Filter sessions based on query
    const filteredSessions = sessions.filter(s => {
      const matchesTitle = s.title.toLowerCase().includes(query);
      const matchesMessage = s.messages.some(m => m.text.toLowerCase().includes(query));
      return matchesTitle || matchesMessage;
    });

    let html = '';

    // Render Pinned chats first at the very top
    const pinnedSessions = filteredSessions.filter(s => s.pinned);
    if (pinnedSessions.length > 0) {
      html += `
        <div style="margin-bottom: 0.5rem;">
          <div style="font-size: 0.65rem; font-weight: 700; color: var(--warning); display: flex; align-items: center; gap: 4px; padding: 2px 4px; text-transform: uppercase;">
            <i data-lucide="pin" style="width: 10px; height: 10px;"></i> Pinned
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px; padding-left: 0.25rem;">
            ${pinnedSessions.map(s => renderSessionItem(s)).join('')}
          </div>
        </div>
      `;
    }

    // Render Favorites section
    const favSessions = filteredSessions.filter(s => s.favorite && !s.pinned);
    if (favSessions.length > 0) {
      html += `
        <div style="margin-bottom: 0.5rem;">
          <div style="font-size: 0.65rem; font-weight: 700; color: #f59e0b; display: flex; align-items: center; gap: 4px; padding: 2px 4px; text-transform: uppercase;">
            <i data-lucide="star" style="width: 10px; height: 10px;"></i> Favorites
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px; padding-left: 0.25rem;">
            ${favSessions.map(s => renderSessionItem(s)).join('')}
          </div>
        </div>
      `;
    }

    // Render Folders
    folders.forEach(folder => {
      const folderSessions = filteredSessions.filter(s => s.folderId === folder.id && !s.pinned && !s.favorite);
      const isExpanded = localStorage.getItem(`chat_folder_expanded_${folder.id}`) !== 'false';

      html += `
        <div class="chat-folder-item" data-folder-id="${folder.id}" style="margin-bottom: 0.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.5rem; background: rgba(255,255,255,0.01); border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); cursor: pointer;" class="folder-header">
            <div style="display: flex; align-items: center; gap: 6px; flex-grow: 1; font-weight: 700; font-size: 0.76rem; color: #fff;">
              <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" class="folder-toggle-icon" style="width: 12px; height: 12px; color: var(--text-muted);"></i>
              <i data-lucide="folder" style="width: 12px; height: 12px; color: var(--accent-cyan);"></i>
              <span class="folder-name-label">${folder.name}</span>
            </div>
            <div style="display: flex; gap: 4px;" class="folder-actions">
              <button class="btn-add-chat-to-folder" data-folder-id="${folder.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="New Chat in Folder"><i data-lucide="plus" style="width: 10px; height: 10px;"></i></button>
              <button class="btn-rename-folder" data-folder-id="${folder.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="Rename Folder"><i data-lucide="edit-2" style="width: 10px; height: 10px;"></i></button>
              <button class="btn-delete-folder" data-folder-id="${folder.id}" style="background: transparent; border: none; color: var(--error); cursor: pointer; padding: 2px;" title="Delete Folder"><i data-lucide="trash-2" style="width: 10px; height: 10px;"></i></button>
            </div>
          </div>
          <div class="folder-contents" style="display: ${isExpanded ? 'flex' : 'none'}; flex-direction: column; gap: 2px; padding-left: 0.75rem; margin-top: 2px; border-left: 1px dashed rgba(255,255,255,0.05);">
            ${folderSessions.length > 0 ? folderSessions.map(s => renderSessionItem(s)).join('') : '<div style="font-size: 0.65rem; color: var(--text-muted); padding: 4px 6px;">Empty folder</div>'}
          </div>
        </div>
      `;
    });

    // Render Uncategorized Chats
    const uncategorizedSessions = filteredSessions.filter(s => !s.folderId && !s.pinned && !s.favorite);
    if (uncategorizedSessions.length > 0) {
      html += `
        <div style="margin-top: 0.5rem;">
          <div style="font-size: 0.65rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 4px; padding: 2px 4px; text-transform: uppercase;">
            General Chats
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px; padding-left: 0.25rem;">
            ${uncategorizedSessions.map(s => renderSessionItem(s)).join('')}
          </div>
        </div>
      `;
    }

    // New conversation trigger
    html += `
      <button class="btn btn-outline-subtle" id="btn-new-chat-sidebar" style="width: 100%; font-size: 0.72rem; padding: 0.45rem; justify-content: center; margin-top: 0.5rem;">
        <i data-lucide="plus" style="width: 12px; height: 12px; margin-right: 4px;"></i> New Conversation
      </button>
    `;

    folderContainer.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // Attach listeners to folders
    folderContainer.querySelectorAll('.folder-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.folder-actions') || e.target.closest('button')) return;
        const folderItem = header.closest('.chat-folder-item');
        const folderId = folderItem.getAttribute('data-folder-id');
        const isExpanded = localStorage.getItem(`chat_folder_expanded_${folderId}`) !== 'false';
        localStorage.setItem(`chat_folder_expanded_${folderId}`, !isExpanded);
        renderConversationTree();
      });
    });

    // Folder Actions
    folderContainer.querySelectorAll('.btn-add-chat-to-folder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        createNewSession(folderId);
      });
    });

    folderContainer.querySelectorAll('.btn-rename-folder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
          const newName = prompt('Enter new folder name:', folder.name);
          if (newName && newName.trim()) {
            folder.name = newName.trim();
            saveState();
            renderConversationTree();
          }
        }
      });
    });

    folderContainer.querySelectorAll('.btn-delete-folder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        if (confirm('Are you sure you want to delete this folder? Conversations will be kept.')) {
          folders = folders.filter(f => f.id !== folderId);
          sessions.forEach(s => {
            if (s.folderId === folderId) s.folderId = null;
          });
          saveState();
          renderConversationTree();
        }
      });
    });

    // Session switching & action clicks
    folderContainer.querySelectorAll('.sidebar-chat-session').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.chat-session-controls') || e.target.closest('button')) return;
        const sessionId = item.getAttribute('data-session-id');
        switchSession(sessionId);
      });
    });

    // Session controls
    folderContainer.querySelectorAll('.btn-pin-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-session-id');
        const sess = sessions.find(s => s.id === id);
        if (sess) {
          sess.pinned = !sess.pinned;
          saveState();
          renderConversationTree();
        }
      });
    });

    folderContainer.querySelectorAll('.btn-fav-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-session-id');
        const sess = sessions.find(s => s.id === id);
        if (sess) {
          sess.favorite = !sess.favorite;
          saveState();
          renderConversationTree();
        }
      });
    });

    folderContainer.querySelectorAll('.btn-rename-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-session-id');
        const sess = sessions.find(s => s.id === id);
        if (sess) {
          const newTitle = prompt('Enter conversation title:', sess.title);
          if (newTitle && newTitle.trim()) {
            sess.title = newTitle.trim();
            saveState();
            renderConversationTree();
            if (id === activeSessionId) {
              updateWorkspaceHeader();
            }
          }
        }
      });
    });

    folderContainer.querySelectorAll('.btn-delete-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-session-id');
        if (confirm('Delete this conversation permanently?')) {
          sessions = sessions.filter(s => s.id !== id);
          if (sessions.length === 0) {
            sessions = [{
              id: 'session-default',
              title: 'Marketing Kickoff Chat',
              persona: 'marketing',
              messages: [{ sender: 'assistant', text: 'Hello! I am your Marketing Strategy Advisor. What are we planning today?' }],
              folderId: null,
              pinned: false,
              favorite: false
            }];
          }
          if (activeSessionId === id) {
            activeSessionId = sessions[0].id;
            activeSession = sessions[0];
          }
          saveState();
          renderConversationTree();
          switchSession(activeSessionId);
        }
      });
    });

    const btnNewChatSidebar = document.getElementById('btn-new-chat-sidebar');
    if (btnNewChatSidebar) {
      btnNewChatSidebar.addEventListener('click', () => createNewSession(null));
    }
  };

  const createNewSession = (folderId = null) => {
    const id = 'sess-' + Date.now();
    const activePersonaEl = document.querySelector('.btn-persona.active');
    const persona = activePersonaEl ? activePersonaEl.getAttribute('data-persona') : 'marketing';

    const greetings = {
      marketing: "Hello! I am your Marketing Strategy Advisor. What are we planning today?",
      copywriter: "Hey! I am your Copywriting Expert. What copy are we drafting?",
      'ad-specialist': "Hello! I am your Ad Campaign Specialist. What are we advertising?",
      seo: "Welcome! I am your SEO Strategist. What keywords are we targeting?"
    };

    const newSess = {
      id,
      title: `Chat Session ${sessions.length + 1}`,
      persona,
      messages: [{ sender: 'assistant', text: greetings[persona] || 'Hi! Let\'s collaborate.' }],
      folderId,
      pinned: false,
      favorite: false
    };

    sessions.unshift(newSess);
    activeSessionId = id;
    activeSession = newSess;
    
    saveState();
    renderConversationTree();
    switchSession(id);
    if (window.showSuccessNotification) {
      window.showSuccessNotification('New conversation created.');
    }
  };

  const switchSession = (id) => {
    const found = sessions.find(s => s.id === id);
    if (!found) return;

    activeSessionId = id;
    activeSession = found;

    document.querySelectorAll('.btn-persona').forEach(b => {
      b.classList.remove('active');
      if (b.getAttribute('data-persona') === activeSession.persona) {
        b.classList.add('active');
      }
    });

    saveState();
    updateWorkspaceHeader();
    renderActiveMessages();
    renderConversationTree();
  };

  const updateWorkspaceHeader = () => {
    if (activeTitleEl) {
      activeTitleEl.innerHTML = `<i data-lucide="message-square" style="color: var(--accent-cyan);"></i> ${activeSession.title}`;
    }
    if (personaBadgeEl) {
      personaBadgeEl.textContent = `${activeSession.persona.toUpperCase()} ENGINE ACTIVE`;
    }
    if (window.lucide) window.lucide.createIcons();
  };

  const renderActiveMessages = () => {
    if (!chatHistory) return;
    chatHistory.innerHTML = '';
    
    if (activeSession.messages.length === 0) {
      chatHistory.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 3rem;">
          No messages in this chat session yet.
        </div>
      `;
      return;
    }

    activeSession.messages.forEach(m => {
      appendChatBubble(chatHistory, m.text, m.sender);
    });

    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  if (addFolderBtn) {
    addFolderBtn.addEventListener('click', () => {
      const name = prompt('Enter folder name:');
      if (name && name.trim()) {
        folders.push({ id: 'folder-' + Date.now(), name: name.trim() });
        saveState();
        renderConversationTree();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderConversationTree);
  }

  if (chatInput && sendBtn) {
    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

    const newChatInput = chatInput.cloneNode(true);
    chatInput.parentNode.replaceChild(newChatInput, chatInput);

    const suggestedChips = document.querySelectorAll('#view-chat-suggested-prompts .suggested-prompt-chip');
    suggestedChips.forEach(chip => {
      const newChip = chip.cloneNode(true);
      chip.parentNode.replaceChild(newChip, chip);
      newChip.addEventListener('click', () => {
        const text = newChip.getAttribute('data-prompt') || newChip.textContent.trim();
        newChatInput.value = text;
        newChatInput.focus();
      });
    });

    const handleSendOverride = async () => {
      const text = newChatInput.value.trim();
      if (!text && selectedFiles.length === 0) return;

      let msgText = text;
      if (selectedFiles.length > 0) {
        const fileNames = selectedFiles.map(f => `[File Attachment: ${f.name}]`).join(', ');
        msgText = `${fileNames}\n\n${text}`;
      }

      activeSession.messages.push({ sender: 'user', text: msgText });
      appendChatBubble(chatHistory, msgText, 'user');
      newChatInput.value = '';
      
      selectedFiles = [];
      if (uploadPreviewBar) {
        uploadPreviewBar.style.display = 'none';
        uploadPreviewBar.innerHTML = '';
      }

      saveState();

      const typing = appendTypingIndicator(chatHistory);
      chatHistory.scrollTop = chatHistory.scrollHeight;

      try {
        const historyForAPI = activeSession.messages.slice(0, -1).map(m => ({
          sender: m.sender,
          text: m.text
        }));

        const reply = await window.Nexeta.AIEngine.chat(msgText, historyForAPI, activeSession.persona);
        typing.remove();
        
        activeSession.messages.push({ sender: 'assistant', text: reply });
        appendChatBubble(chatHistory, reply, 'assistant');
        saveState();
      } catch (err) {
        typing.remove();
        const errMsg = `Error: ${err.message || "Connection failed. Please check your API key settings."}`;
        activeSession.messages.push({ sender: 'assistant', text: errMsg });
        appendChatBubble(chatHistory, errMsg, 'assistant');
        saveState();
      }

      chatHistory.scrollTop = chatHistory.scrollHeight;
      renderConversationTree();
    };

    newSendBtn.addEventListener('click', handleSendOverride);
    newChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSendOverride();
    });
  }

  if (copyChatBtn) {
    copyChatBtn.addEventListener('click', () => {
      if (!activeSession || activeSession.messages.length === 0) {
        alert('No messages to copy!');
        return;
      }
      const rawText = activeSession.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
      navigator.clipboard.writeText(rawText).then(() => {
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Conversation transcript copied to clipboard!');
        } else {
          alert('Copied to clipboard!');
        }
      });
    });
  }

  const saveProjectOverrideBtn = document.getElementById('chat-btn-save-project');
  if (saveProjectOverrideBtn) {
    const newSaveBtn = saveProjectOverrideBtn.cloneNode(true);
    saveProjectOverrideBtn.parentNode.replaceChild(newSaveBtn, saveProjectOverrideBtn);

    newSaveBtn.addEventListener('click', () => {
      if (!activeSession || activeSession.messages.length === 0) {
        if (window.showSuccessNotification) {
          window.showSuccessNotification('No conversation content to save.', 'error');
        } else {
          alert('No content to save!');
        }
        return;
      }

      const activeProjectId = window.Nexeta.ProjectManager.getActiveProjectId();
      const activeProjName = window.Nexeta.ProjectManager.getActiveProject()?.name || 'Active Project';
      
      const textContent = activeSession.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
      
      let assetType = 'Marketing Plan';
      if (activeSession.persona === 'copywriter') assetType = 'Copywriting Output';
      else if (activeSession.persona === 'seo') assetType = 'SEO Output';
      else if (activeSession.persona === 'ad-specialist') assetType = 'Ad Campaign';

      const firstMsg = activeSession.messages.find(m => m.sender === 'user')?.text || '';
      const titleSnippet = firstMsg.substring(0, 30).trim() + (firstMsg.length > 30 ? '...' : '');

      const asset = {
        type: assetType,
        title: `Chat Session - ${titleSnippet || new Date().toLocaleDateString()}`,
        content: textContent
      };

      window.Nexeta.ProjectManager.saveAssetToProject(activeProjectId, asset);

      if (window.Nexeta.HistoryManager) {
        window.Nexeta.HistoryManager.addHistoryItem('Chat Session', asset.title, textContent);
      }

      window.Nexeta.AnalyticsManager.updateDashboardStats();
      if (window.renderHistoryGrid) window.renderHistoryGrid();

      if (window.showSuccessNotification) {
        window.showSuccessNotification(`Chat saved as "${assetType}" under project "${activeProjName}".`);
      } else {
        alert('Chat session saved successfully!');
      }
    });
  }

  const exportChatOverrideBtn = document.getElementById('chat-btn-export');
  if (exportChatOverrideBtn) {
    const newExportBtn = exportChatOverrideBtn.cloneNode(true);
    exportChatOverrideBtn.parentNode.replaceChild(newExportBtn, exportChatOverrideBtn);

    newExportBtn.addEventListener('click', () => {
      if (!activeSession || activeSession.messages.length === 0) {
        if (window.showSuccessNotification) {
          window.showSuccessNotification('No conversation to export.', 'error');
        } else {
          alert('No content to export!');
        }
        return;
      }
      const textContent = activeSession.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
      if (window.Nexeta.openExportModal) {
        window.Nexeta.openExportModal(textContent, `chat_session_${activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`);
      }
    });
  }

  if (chatWrapper && dragOverlay && uploadPreviewBar) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      chatWrapper.addEventListener(eventName, e => e.preventDefault(), false);
      chatWrapper.addEventListener(eventName, e => e.stopPropagation(), false);
    });

    chatWrapper.addEventListener('dragenter', () => {
      dragOverlay.style.display = 'flex';
    });

    chatWrapper.addEventListener('dragover', () => {
      dragOverlay.style.display = 'flex';
    });

    chatWrapper.addEventListener('dragleave', (e) => {
      const rect = chatWrapper.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        dragOverlay.style.display = 'none';
      }
    });

    chatWrapper.addEventListener('drop', (e) => {
      dragOverlay.style.display = 'none';
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFilesAttach(files);
    });
  }

  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.onchange = (e) => {
        handleFilesAttach(e.target.files);
      };
      fileInput.click();
    });
  }

  const handleFilesAttach = (files) => {
    if (!files || files.length === 0) return;
    if (!uploadPreviewBar) return;

    uploadPreviewBar.style.display = 'flex';
    
    Array.from(files).forEach(file => {
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) return;
      selectedFiles.push(file);

      const item = document.createElement('div');
      item.style.cssText = 'font-size: 0.7rem; display: flex; align-items: center; gap: 4px; padding: 0.2rem 0.5rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 6px; color: #fff; max-width: 140px;';
      
      let fileIcon = 'file';
      if (file.type.startsWith('image/')) fileIcon = 'image';
      else if (file.type.startsWith('video/')) fileIcon = 'video';
      else if (file.type.startsWith('audio/')) fileIcon = 'music';
      
      item.innerHTML = `
        <i data-lucide="${fileIcon}" style="width: 10px; height: 10px; flex-shrink: 0; color: var(--primary);"></i>
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1;">${file.name}</span>
        <button style="background: transparent; border: none; color: var(--error); cursor: pointer; padding: 0; display: flex; align-items: center;" class="btn-remove-attachment" title="Remove file"><i data-lucide="x" style="width: 10px; height: 10px;"></i></button>
      `;

      item.querySelector('.btn-remove-attachment').addEventListener('click', () => {
        selectedFiles = selectedFiles.filter(f => f !== file);
        item.remove();
        if (selectedFiles.length === 0) {
          uploadPreviewBar.style.display = 'none';
        }
      });

      uploadPreviewBar.appendChild(item);
    });

    if (window.lucide) window.lucide.createIcons();
    if (window.showSuccessNotification) {
      window.showSuccessNotification(`${files.length} file(s) attached to draft.`);
    }
  };

  if (voiceBtn && chatInput) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      let isRecording = false;

      voiceBtn.addEventListener('click', () => {
        if (!isRecording) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Speech recognition error:', e);
          }
        } else {
          recognition.stop();
        }
      });

      recognition.onstart = () => {
        isRecording = true;
        voiceBtn.style.color = 'var(--error)';
        voiceBtn.classList.add('recording-pulse');
        const inputOverride = document.getElementById('view-chat-input');
        if (inputOverride) {
          inputOverride.placeholder = "Listening... Speak now...";
        }
      };

      recognition.onend = () => {
        isRecording = false;
        voiceBtn.style.color = '';
        voiceBtn.classList.remove('recording-pulse');
        const inputOverride = document.getElementById('view-chat-input');
        if (inputOverride) {
          inputOverride.placeholder = "Ask Nexeta AI anything...";
        }
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputOverride = document.getElementById('view-chat-input');
        if (inputOverride) {
          const currentText = inputOverride.value.trim();
          inputOverride.value = currentText ? `${currentText} ${transcript}` : transcript;
          inputOverride.focus();
        }
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Voice input transcribed.');
        }
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error event:', e.error);
        if (window.showSuccessNotification) {
          window.showSuccessNotification(`Voice error: ${e.error || 'could not recognize speech'}.`, 'error');
        }
      };
    } else {
      voiceBtn.style.opacity = '0.4';
      voiceBtn.title = "Speech Recognition API not supported in this browser.";
      voiceBtn.addEventListener('click', () => {
        alert('Your current web browser does not support the Speech Recognition Web API (Chrome/Edge/Safari are recommended).');
      });
    }
  }

  renderConversationTree();
  updateWorkspaceHeader();
  renderActiveMessages();
}

/* ================= 18. PREMIUM AI STRATEGY ENGINE ================= */
function initPremiumStrategyGenerator() {
  const launchBtn = document.getElementById('act-strategy');
  const modal = document.getElementById('strategy-modal');
  const closeBtn = document.getElementById('strategy-modal-close');
  const cancelBtn = document.getElementById('strategy-modal-cancel');
  const submitBtn = document.getElementById('strategy-modal-submit');
  
  const inputState = document.getElementById('strategy-input-state');
  const loadingState = document.getElementById('strategy-loading-state');
  const resultState = document.getElementById('strategy-result-state');
  
  const productNameInput = document.getElementById('strategy-product-name');
  const descriptionInput = document.getElementById('strategy-description');
  
  const loadingStepEl = document.getElementById('strategy-loading-step');
  const resultContainer = document.getElementById('strategy-result-container');
  const saveAssetBtn = document.getElementById('strategy-btn-save');
  const exportPdfBtn = document.getElementById('strategy-btn-pdf');

  let generatedStrategy = null;
  let rawProductName = '';

  if (!modal) return;

  const showInputState = () => {
    inputState.style.display = 'flex';
    loadingState.style.display = 'none';
    resultState.style.display = 'none';
  };

  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      showInputState();
      modal.classList.add('active');
    });
  }

  const closeModal = () => {
    modal.classList.remove('active');
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const loadingSteps = [
    "Running audience demographics and buyer persona models...",
    "Scanning competitor positioning maps and differentiation matrices...",
    "Synthesizing SEO keyword taxonomy and landing page structure...",
    "Compiling 4-week omnichannel thematic content schedule...",
    "Generating multi-tier marketing funnel conversions flowchart...",
    "Polishing campaign assets and finalizing premium GTM handbook..."
  ];

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const productName = productNameInput ? productNameInput.value.trim() : '';
      const description = descriptionInput ? descriptionInput.value.trim() : '';

      if (!productName || !description) {
        alert('Please fill in both the Product Name and Core Details to generate a strategy.');
        return;
      }

      rawProductName = productName;

      inputState.style.display = 'none';
      loadingState.style.display = 'flex';
      resultState.style.display = 'none';

      let stepIdx = 0;
      if (loadingStepEl) loadingStepEl.textContent = loadingSteps[0];
      
      const stepTimer = setInterval(() => {
        stepIdx = (stepIdx + 1) % loadingSteps.length;
        if (loadingStepEl) loadingStepEl.textContent = loadingSteps[stepIdx];
      }, 1800);

      try {
        const strategy = await window.Nexeta.AIEngine.generateMarketingStrategy(productName, description);
        clearInterval(stepTimer);
        
        generatedStrategy = strategy;

        if (resultContainer) {
          resultContainer.innerHTML = `
            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="compass" style="width: 14px; height: 14px; color: var(--primary);"></i> 1. Complete Marketing Plan
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.marketingPlan}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="users" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i> 2. Target Audience & Personas
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.targetAudience}</p>
            </div>

            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="shield-alert" style="width: 14px; height: 14px; color: #f59e0b;"></i> 3. Competitor Analysis & Differentiators
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.competitorAnalysis}</p>
            </div>

            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="calendar" style="width: 14px; height: 14px; color: var(--success);"></i> 4. 4-Week Content Calendar
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.contentCalendar}</p>
            </div>

            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="megaphone" style="width: 14px; height: 14px; color: #8b5cf6;"></i> 5. Omnichannel Ad Strategy
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.adStrategy}</p>
            </div>

            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="search" style="width: 14px; height: 14px; color: var(--accent-cyan);"></i> 6. Search Engine Optimization (SEO) Plan
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.seoPlan}</p>
            </div>

            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="mail" style="width: 14px; height: 14px; color: var(--primary);"></i> 7. Email Marketing Campaign
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.emailCampaign}</p>
            </div>

            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="layers" style="width: 14px; height: 14px; color: var(--success);"></i> 8. Sales Funnel Pipeline stages
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.salesFunnel}</p>
            </div>

            <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 10px; margin-bottom: 0.5rem;">
              <h4 style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                <i data-lucide="rocket" style="width: 14px; height: 14px; color: var(--warning);"></i> 9. 30-Day Launch Playbook Timeline
              </h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap;">${strategy.launchStrategy}</p>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();
        }

        loadingState.style.display = 'none';
        resultState.style.display = 'flex';

        if (window.showSuccessNotification) {
          window.showSuccessNotification('Advanced Marketing Strategy generated!');
        }

      } catch (err) {
        clearInterval(stepTimer);
        loadingState.style.display = 'none';
        showInputState();
        alert('Failed to generate GTM Strategy: ' + err.message);
      }
    });
  }

  if (saveAssetBtn) {
    saveAssetBtn.addEventListener('click', () => {
      if (!generatedStrategy) return;
      const activeProjectId = window.Nexeta.ProjectManager.getActiveProjectId();
      const activeProjName = window.Nexeta.ProjectManager.getActiveProject()?.name || 'Active Project';

      const docText = `================ GO-TO-MARKET MARKETING PLAN ================
${generatedStrategy.marketingPlan}

================ TARGET AUDIENCE ================
${generatedStrategy.targetAudience}

================ COMPETITOR ANALYSIS ================
${generatedStrategy.competitorAnalysis}

================ CONTENT CALENDAR ================
${generatedStrategy.contentCalendar}

================ AD STRATEGY ================
${generatedStrategy.adStrategy}

================ SEO PLAN ================
${generatedStrategy.seoPlan}

================ EMAIL CAMPAIGN ================
${generatedStrategy.emailCampaign}

================ SALES FUNNEL ================
${generatedStrategy.salesFunnel}

================ LAUNCH STRATEGY ================
${generatedStrategy.launchStrategy}`;

      const asset = {
        type: 'Marketing Strategy',
        title: `AI Strategy Handbook - ${rawProductName}`,
        content: docText
      };

      window.Nexeta.ProjectManager.saveAssetToProject(activeProjectId, asset);

      if (window.Nexeta.HistoryManager) {
        window.Nexeta.HistoryManager.addHistoryItem('Prompt Execution', asset.title, docText);
      }

      window.Nexeta.AnalyticsManager.updateDashboardStats();
      if (window.renderHistoryGrid) window.renderHistoryGrid();

      if (window.showSuccessNotification) {
        window.showSuccessNotification(`GTM Handbook saved under project "${activeProjName}".`);
      } else {
        alert('Strategy saved successfully!');
      }
    });
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      if (!generatedStrategy) return;
      
      const docText = `# GO-TO-MARKET MARKETING PLAN: ${rawProductName.toUpperCase()}
      
## 1. Executive Summary
${generatedStrategy.marketingPlan}

## 2. Target Audience & Buyer Personas
${generatedStrategy.targetAudience}

## 3. Competitor Analysis & Positioning
${generatedStrategy.competitorAnalysis}

## 4. 4-Week Content Calendar
${generatedStrategy.contentCalendar}

## 5. Paid Ad & Channel Strategy
${generatedStrategy.adStrategy}

## 6. Search Engine Optimization Plan
${generatedStrategy.seoPlan}

## 7. Lifecycle Email Marketing Campaign
${generatedStrategy.emailCampaign}

## 8. Sales Funnel Pipeline Mapping
${generatedStrategy.salesFunnel}

## 9. 30-Day Launch Timeline & Milestones
${generatedStrategy.launchStrategy}`;

      if (window.Nexeta.openExportModal) {
        window.Nexeta.openExportModal(docText, `marketing_strategy_${rawProductName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`);
      } else {
        const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(docText);
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `marketing_strategy_${rawProductName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      }
    });
  }
}

/* ================= 19. SIDEBAR MARKETPLACE VIEW ================= */
function initMarketplaceView() {
  const gridContainer = document.getElementById('marketplace-grid');
  const tabs = document.querySelectorAll('.btn-market-tab');
  const searchInput = document.getElementById('market-search');
  const filterSmart = document.getElementById('market-filter-smart');
  const filterSort = document.getElementById('market-filter-sort');
  const historyBtn = document.getElementById('market-btn-history');
  const uploadBtn = document.getElementById('market-btn-upload');

  if (!gridContainer) return;

  // Render routing based on active tab
  window.renderMarketplaceGrid = () => {
    const activeTab = document.querySelector('.btn-market-tab.active');
    const category = activeTab ? activeTab.getAttribute('data-category') : 'plugins';
    const searchQuery = searchInput ? searchInput.value : '';
    const smartFilter = filterSmart ? filterSmart.value : 'all';
    const sortVal = filterSort ? filterSort.value : 'trending';

    // Hide featured section by default, let individual renderers show if plugins/templates
    const featuredSec = document.getElementById('market-featured-section');
    if (featuredSec) featuredSec.style.display = 'none';

    // Router
    const globalDB = window.Nexeta.MarketplaceGlobal;
    if (!globalDB) {
      console.error('Marketplace global DB not loaded');
      return;
    }

    if (category === 'plugins' && window.Nexeta.MarketplacePlugins) {
      window.Nexeta.MarketplacePlugins.render(gridContainer, searchQuery, smartFilter, sortVal);
    } else if (category === 'templates' && window.Nexeta.MarketplaceTemplates) {
      window.Nexeta.MarketplaceTemplates.render(gridContainer, searchQuery, smartFilter, sortVal);
    } else if (category === 'prompts' && window.Nexeta.MarketplacePrompts) {
      window.Nexeta.MarketplacePrompts.render(gridContainer, searchQuery, smartFilter, sortVal);
    } else if (category === 'automations' && window.Nexeta.MarketplaceAutomations) {
      window.Nexeta.MarketplaceAutomations.render(gridContainer, searchQuery, smartFilter, sortVal);
    } else if (category === 'integrations' && window.Nexeta.MarketplaceIntegrations) {
      window.Nexeta.MarketplaceIntegrations.render(gridContainer, searchQuery, smartFilter, sortVal);
    } else if (category === 'community' && window.Nexeta.MarketplaceCommunity) {
      window.Nexeta.MarketplaceCommunity.render(gridContainer, searchQuery, smartFilter, sortVal);
    } else {
      gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Renderer for "${category}" is still loading or unavailable.</div>`;
    }

    if (window.lucide) window.lucide.createIcons();
  };

  // Bind controls
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update browser hash tab variable
      const category = tab.getAttribute('data-category');
      window.location.hash = `#marketplace?tab=${category}`;
      
      // Reset search filter elements for a clean tab change
      if (searchInput) searchInput.value = '';
      
      window.renderMarketplaceGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      window.renderMarketplaceGrid();
    });
  }

  if (filterSmart) {
    filterSmart.addEventListener('change', () => {
      window.renderMarketplaceGrid();
    });
  }

  if (filterSort) {
    filterSort.addEventListener('change', () => {
      window.renderMarketplaceGrid();
    });
  }

  // Bind global history audit logs modal
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      const modal = document.getElementById('market-history-modal');
      const container = document.getElementById('market-history-logs-container');
      const clearBtn = document.getElementById('market-history-clear-btn');
      
      if (!modal || !container) return;
      
      const renderHistory = () => {
        const history = window.Nexeta.MarketplaceGlobal.getHistory();
        const db = window.Nexeta.MarketplaceGlobal.getDatabase();
        
        if (history.length === 0) {
          container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.78rem;">No activity log items.</div>`;
          return;
        }
        
        container.innerHTML = history.map(item => {
          // Find item name
          let itemName = item.itemId;
          const allItems = [...db.plugins, ...db.templates, ...db.prompts, ...db.automations, ...db.integrations, ...db.community];
          const matched = allItems.find(x => x.id === item.itemId);
          if (matched) itemName = matched.name;
          
          let actionLabel = '';
          let badgeColor = 'var(--primary)';
          if (item.type === 'install') { actionLabel = 'Installed'; badgeColor = 'var(--primary)'; }
          else if (item.type === 'uninstall') { actionLabel = 'Uninstalled'; badgeColor = 'var(--error)'; }
          else if (item.type === 'enable') { actionLabel = 'Enabled'; badgeColor = 'var(--success)'; }
          else if (item.type === 'disable') { actionLabel = 'Disabled'; badgeColor = 'var(--warning)'; }
          else if (item.type === 'connect') { actionLabel = 'Connected'; badgeColor = 'var(--success)'; }
          else if (item.type === 'disconnect') { actionLabel = 'Disconnected'; badgeColor = 'var(--error)'; }
          else if (item.type === 'update') { actionLabel = 'Updated'; badgeColor = 'var(--accent-cyan)'; }
          else if (item.type === 'upload') { actionLabel = 'Shared Community Asset'; badgeColor = 'var(--success)'; }
          
          const timeString = new Date(item.timestamp).toLocaleString();
          
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.5rem; font-size: 0.75rem;">
              <div>
                <span style="font-weight: bold; color: #fff;">${itemName}</span>
                <span style="color: var(--text-muted); font-size: 0.7rem; display: block;">${timeString}</span>
              </div>
              <span style="font-size: 0.65rem; font-weight: 700; color: #fff; background: ${badgeColor}; padding: 0.15rem 0.45rem; border-radius: 4px;">
                ${actionLabel}
              </span>
            </div>
          `;
        }).join('');
      };
      
      clearBtn.onclick = () => {
        if (confirm('Are you sure you want to clear the logs?')) {
          localStorage.removeItem('nexeta_market_history');
          renderHistory();
        }
      };
      
      renderHistory();
      modal.classList.add('active');
    });
  }

  // Bind share community asset modal trigger
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const modal = document.getElementById('market-upload-modal');
      if (modal) modal.classList.add('active');
    });
  }

  window.renderMarketplaceGrid();
}

window.refreshChatExtensions = () => {
  folders = JSON.parse(localStorage.getItem(FOLDER_KEY)) || [
    { id: 'folder-1', name: 'Social Campaigns' },
    { id: 'folder-2', name: 'SEO Content' }
  ];
  sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [
    {
      id: 'session-default',
      title: 'Marketing Kickoff Chat',
      persona: 'marketing',
      messages: [
        { sender: 'assistant', text: 'Hello! I am your Marketing Strategy Advisor. What are we planning today?' }
      ],
      folderId: 'folder-1',
      pinned: false,
      favorite: false
    }
  ];
  activeSessionId = localStorage.getItem('nexeta_active_chat_session_id') || 'session-default';
  activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  if (activeSession) activeSessionId = activeSession.id;

  renderConversationTree();
  switchSession(activeSessionId);
};

/* ================= 20. GLOBAL KEYBOARD SHORTCUTS ================= */
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  if (e.altKey) {
    if (e.key.toLowerCase() === 'n') {
      e.preventDefault();
      window.location.hash = '#dashboard';
    } else if (e.key.toLowerCase() === 'c') {
      e.preventDefault();
      window.location.hash = '#chat';
    } else if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      window.location.hash = '#history';
    } else if (e.key.toLowerCase() === 'p') {
      e.preventDefault();
      window.location.hash = '#projects';
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      window.location.hash = '#marketplace';
    }
  }
});

/* ================= ================= ================= */
/* ================= PHASE 2: PROJECTS WORKSPACE CONTROLLER ================= */
/* ================= ================= ================= */

function initProjectWorkspace() {
  const tabs = document.querySelectorAll('.btn-workspace-tab');
  const modal = document.getElementById('workspace-task-modal');
  const closeBtn = document.getElementById('workspace-task-modal-close');
  const cancelBtn = document.getElementById('workspace-task-modal-cancel');
  const submitBtn = document.getElementById('workspace-task-modal-submit');
  
  const addTaskBtn = document.getElementById('workspace-btn-add-task');
  const saveOverviewBtn = document.getElementById('workspace-btn-save-overview');
  const statusSelect = document.getElementById('workspace-status-select');
  
  const notesTextarea = document.getElementById('workspace-notes-textarea');
  const dragArea = document.getElementById('workspace-asset-drag-area');
  const assetFilterButtons = document.querySelectorAll('.btn-asset-filter');

  let activeAssetFilter = 'All';

  // --- Tab switching controller ---
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const activeTabId = tab.getAttribute('data-tab');
      
      // Hide all contents
      document.querySelectorAll('.workspace-tab-content').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
      });

      // Show target tab pane
      const targetPane = document.getElementById(`workspace-tab-${activeTabId}`);
      if (targetPane) {
        targetPane.style.display = 'block';
        targetPane.classList.add('active');
      }

      // Re-trigger layout renders on specific tabs
      if (activeTabId === 'timeline') renderActivityTimeline();
      else if (activeTabId === 'analytics') renderAnalyticsTab();
      else if (activeTabId === 'settings') renderSettingsTab();
      else if (activeTabId === 'prompts') renderPromptsTab();
      else if (activeTabId === 'assistant') renderAssistantTab();
    });
  });

  // --- Overview controls ---
  if (saveOverviewBtn) {
    saveOverviewBtn.addEventListener('click', () => {
      const project = window.Nexeta.ProjectManager.getActiveProject();
      if (!project) return;

      const descInput = document.getElementById('workspace-overview-description');
      if (descInput) {
        project.description = descInput.value.trim();
        project.lastEdited = new Date().toLocaleString();
        
        // Log activity
        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: 'Project description updated.',
          timestamp: new Date().toLocaleString()
        });

        // Save
        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }

        if (window.showSuccessNotification) {
          window.showSuccessNotification('Overview details saved.');
        }
        window.renderProjectWorkspace();
      }
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      const project = window.Nexeta.ProjectManager.getActiveProject();
      if (!project) return;

      project.status = statusSelect.value;
      project.statusColor = statusSelect.value.toLowerCase();
      project.lastEdited = new Date().toLocaleString();

      // Log activity
      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: `Project status set to "${statusSelect.value}".`,
        timestamp: new Date().toLocaleString()
      });

      const projects = window.Nexeta.ProjectManager.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        window.Nexeta.ProjectManager.saveProjects(projects);
      }

      if (window.showSuccessNotification) {
        window.showSuccessNotification(`Status set to ${statusSelect.value}.`);
      }
      window.renderProjectWorkspace();
    });
  }

  // --- New Chat Session Action ---
  const newChatBtn = document.getElementById('workspace-btn-new-chat');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      const project = window.Nexeta.ProjectManager.getActiveProject();
      if (!project) return;

      const title = prompt('Enter a title for this campaign chat:', `Campaign Chat ${project.chats.length + 1}`);
      if (!title || !title.trim()) return;

      const newChat = {
        id: 'sess-' + Date.now(),
        title: title.trim(),
        persona: 'marketing',
        messages: [
          { sender: 'assistant', text: `Welcome to the context-bound AI Chat for campaign "${project.name}". How can I help you today?` }
        ]
      };

      project.chats.unshift(newChat);
      project.lastEdited = new Date().toLocaleString();

      // Log activity
      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: `New campaign chat created: "${title.trim()}"`,
        timestamp: new Date().toLocaleString()
      });

      // Save project
      const projects = window.Nexeta.ProjectManager.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        window.Nexeta.ProjectManager.saveProjects(projects);
      }

      // Add to main chat list and switch to it
      const sessions = JSON.parse(localStorage.getItem('nexeta_chat_sessions')) || [];
      sessions.unshift({
        ...newChat,
        pinned: false,
        favorite: false
      });
      localStorage.setItem('nexeta_chat_sessions', JSON.stringify(sessions));
      localStorage.setItem('nexeta_active_chat_session_id', newChat.id);

      window.location.hash = '#chat';
      if (window.showSuccessNotification) {
        window.showSuccessNotification('New workspace chat session initialized.');
      }
    });
  }

  // --- Tasks Modals Binds ---
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      document.getElementById('workspace-task-modal-title').textContent = "Add Workspace Task";
      document.getElementById('workspace-task-id').value = "";
      document.getElementById('workspace-task-title-input').value = "";
      document.getElementById('workspace-task-priority-input').value = "medium";
      document.getElementById('workspace-task-due-input').value = "";
      document.getElementById('workspace-task-desc-input').value = "";
      
      modal?.classList.add('active');
    });
  }

  const closeTaskModal = () => {
    modal?.classList.remove('active');
  };

  closeBtn?.addEventListener('click', closeTaskModal);
  cancelBtn?.addEventListener('click', closeTaskModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeTaskModal();
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const taskId = document.getElementById('workspace-task-id').value;
      const title = document.getElementById('workspace-task-title-input').value.trim();
      const priority = document.getElementById('workspace-task-priority-input').value;
      const dueDate = document.getElementById('workspace-task-due-input').value;
      const desc = document.getElementById('workspace-task-desc-input').value.trim();

      if (!title) {
        alert('Task title is required!');
        return;
      }

      const project = window.Nexeta.ProjectManager.getActiveProject();
      if (!project) return;

      if (!taskId) {
        // Create new
        const newTask = {
          id: 'task-' + Date.now(),
          title,
          priority,
          dueDate: dueDate || 'No due date',
          description: desc,
          status: 'todo'
        };
        project.tasks.push(newTask);
        
        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: `Task added: "${title}"`,
          timestamp: new Date().toLocaleString()
        });
      } else {
        // Edit existing
        const task = project.tasks.find(t => t.id === taskId);
        if (task) {
          const oldTitle = task.title;
          task.title = title;
          task.priority = priority;
          task.dueDate = dueDate || 'No due date';
          task.description = desc;

          project.activities.unshift({
            id: 'act-' + Date.now(),
            action: `Task updated: "${oldTitle}"`,
            timestamp: new Date().toLocaleString()
          });
        }
      }

      // Recalculate progress percentage
      const total = project.tasks.length;
      const done = project.tasks.filter(t => t.status === 'done').length;
      project.progress = total > 0 ? Math.round((done / total) * 100) : 0;
      project.lastEdited = new Date().toLocaleString();

      // Save back to DB
      const projects = window.Nexeta.ProjectManager.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        window.Nexeta.ProjectManager.saveProjects(projects);
      }

      closeTaskModal();
      window.renderProjectWorkspace();
      if (window.showSuccessNotification) {
        window.showSuccessNotification('Task saved successfully.');
      }
    });
  }

  // --- Kanban drag and drop wrappers ---
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStatus = col.getAttribute('data-status');
      
      const project = window.Nexeta.ProjectManager.getActiveProject();
      if (!project) return;

      const task = project.tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus) {
        const oldStatus = task.status;
        task.status = targetStatus;
        project.lastEdited = new Date().toLocaleString();

        // Log timeline activity
        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: `Task "${task.title}" moved to ${targetStatus.toUpperCase()}`,
          timestamp: new Date().toLocaleString()
        });

        // Recalculate progress
        const total = project.tasks.length;
        const done = project.tasks.filter(t => t.status === 'done').length;
        project.progress = total > 0 ? Math.round((done / total) * 100) : 0;

        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }

        window.renderProjectWorkspace();
        if (window.showSuccessNotification) {
          window.showSuccessNotification(`Task updated to ${targetStatus}`);
        }
      }
    });
  });

  // --- Notes formatting toolbar controller ---
  const notesToolbar = document.querySelectorAll('.btn-notes-fmt');
  notesToolbar.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!notesTextarea) return;
      
      const fmt = btn.getAttribute('data-fmt');
      const start = notesTextarea.selectionStart;
      const end = notesTextarea.selectionEnd;
      const text = notesTextarea.value;
      const selected = text.substring(start, end);
      
      let replacement = '';
      if (fmt === 'bold') replacement = `**${selected || 'bold text'}**`;
      else if (fmt === 'italic') replacement = `*${selected || 'italic text'}*`;
      else if (fmt === 'h1') replacement = `\n# ${selected || 'Heading 1'}\n`;
      else if (fmt === 'h2') replacement = `\n## ${selected || 'Heading 2'}\n`;
      else if (fmt === 'todo') replacement = `\n- [ ] ${selected || 'Todo item'}\n`;
      else if (fmt === 'link') replacement = `[${selected || 'link description'}](https://example.com)`;

      notesTextarea.value = text.substring(0, start) + replacement + text.substring(end);
      notesTextarea.focus();
      notesTextarea.dispatchEvent(new Event('input')); // trigger autosave
    });
  });

  // Notes Autosave debounce
  let autosaveTimer = null;
  if (notesTextarea) {
    notesTextarea.addEventListener('input', () => {
      const statusEl = document.getElementById('notes-autosave-status');
      const iconEl = document.getElementById('notes-autosave-icon');
      
      if (statusEl) statusEl.textContent = 'Autosaving...';
      if (iconEl) iconEl.style.color = '#f59e0b'; // warning orange during save

      clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(() => {
        const project = window.Nexeta.ProjectManager.getActiveProject();
        if (!project) return;

        project.notes = notesTextarea.value;
        project.lastEdited = new Date().toLocaleString();

        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }

        if (statusEl) statusEl.textContent = 'Draft autosaved';
        if (iconEl) iconEl.style.color = 'var(--success)';
      }, 1000);
    });
  }

  // Notes Manual Save Trigger
  const saveNotesBtn = document.getElementById('workspace-btn-save-notes');
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', () => {
      const project = window.Nexeta.ProjectManager.getActiveProject();
      if (!project || !notesTextarea) return;

      project.notes = notesTextarea.value;
      project.lastEdited = new Date().toLocaleString();

      const projects = window.Nexeta.ProjectManager.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        window.Nexeta.ProjectManager.saveProjects(projects);
      }

      const statusEl = document.getElementById('notes-autosave-status');
      const iconEl = document.getElementById('notes-autosave-icon');
      if (statusEl) statusEl.textContent = 'Saved manually';
      if (iconEl) iconEl.style.color = 'var(--success)';

      if (window.showSuccessNotification) {
        window.showSuccessNotification('Workspace notes saved successfully.');
      }
    });
  }

  // --- Assets drag and drop upload ---
  if (dragArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dragArea.addEventListener(eventName, e => e.preventDefault(), false);
      dragArea.addEventListener(eventName, e => e.stopPropagation(), false);
    });

    dragArea.addEventListener('dragenter', () => dragArea.classList.add('drag-over'));
    dragArea.addEventListener('dragover', () => dragArea.classList.add('drag-over'));
    dragArea.addEventListener('dragleave', () => dragArea.classList.remove('drag-over'));
    dragArea.addEventListener('drop', (e) => {
      dragArea.classList.remove('drag-over');
      const dt = e.dataTransfer;
      const files = dt.files;
      handleWorkspaceFilesUpload(files);
    });

    dragArea.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.onchange = (e) => {
        handleWorkspaceFilesUpload(e.target.files);
      };
      fileInput.click();
    });
  }

  const handleWorkspaceFilesUpload = (files) => {
    if (!files || files.length === 0) return;
    const project = window.Nexeta.ProjectManager.getActiveProject();
    if (!project) return;

    Array.from(files).forEach(file => {
      const assetSize = (file.size / 1024).toFixed(1);
      const asset = {
        type: 'Uploaded',
        title: file.name,
        content: `File size: ${assetSize} KB | Type: ${file.type || 'unknown'}`
      };
      window.Nexeta.ProjectManager.saveAssetToProject(project.id, asset);
    });

    // Re-render
    window.renderProjectWorkspace();
  };

  // Asset tab filters clicking
  assetFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      assetFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeAssetFilter = btn.getAttribute('data-type');
      renderAssetsGrid(activeAssetFilter);
    });
  });

  // --- Workspace Prompt Modals Binds ---
  const promptModal = document.getElementById('workspace-prompt-modal');
  const closePromptModalBtn = document.getElementById('workspace-prompt-modal-close');
  const cancelPromptModalBtn = document.getElementById('workspace-prompt-modal-cancel');
  const submitPromptModalBtn = document.getElementById('workspace-prompt-modal-submit');

  const closePromptModal = () => {
    promptModal?.classList.remove('active');
  };

  closePromptModalBtn?.addEventListener('click', closePromptModal);
  cancelPromptModalBtn?.addEventListener('click', closePromptModal);
  promptModal?.addEventListener('click', (e) => {
    if (e.target === promptModal) closePromptModal();
  });

  if (submitPromptModalBtn) {
    submitPromptModalBtn.addEventListener('click', () => {
      const promptId = document.getElementById('workspace-prompt-id').value;
      const title = document.getElementById('workspace-prompt-title-input').value.trim();
      const text = document.getElementById('workspace-prompt-text-input').value.trim();

      if (!title || !text) {
        alert('Both title and prompt content are required!');
        return;
      }

      const project = window.Nexeta.ProjectManager.getActiveProject();
      if (!project) return;

      project.prompts = project.prompts || [];

      if (!promptId) {
        // Create new prompt
        const newPrompt = {
          id: 'pr-' + Date.now(),
          title,
          text,
          isFavorite: false,
          versions: []
        };
        project.prompts.push(newPrompt);

        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: `Custom prompt template created: "${title}"`,
          timestamp: new Date().toLocaleString()
        });
      } else {
        // Edit existing prompt
        const pRecord = project.prompts.find(pr => pr.id === promptId);
        if (pRecord) {
          const oldText = pRecord.text;

          // If text changed, save current text to version history
          if (oldText !== text) {
            pRecord.versions = pRecord.versions || [];
            pRecord.versions.push({
              version: pRecord.versions.length + 1,
              text: oldText,
              timestamp: new Date().toLocaleString()
            });
          }

          pRecord.title = title;
          pRecord.text = text;

          project.activities.unshift({
            id: 'act-' + Date.now(),
            action: `Prompt template updated: "${title}"`,
            timestamp: new Date().toLocaleString()
          });
        }
      }

      project.lastEdited = new Date().toLocaleString();

      // Save to projects
      const projects = window.Nexeta.ProjectManager.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        window.Nexeta.ProjectManager.saveProjects(projects);
      }

      closePromptModal();
      if (typeof renderPromptsTab === 'function') renderPromptsTab();
      if (window.showSuccessNotification) {
        window.showSuccessNotification('Prompt template saved.');
      }
    });
  }
}

// --- Dynamic View Refreshing ---
window.renderProjectWorkspace = () => {
  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (!project) {
    window.location.hash = '#projects';
    return;
  }

  // Security Authorization check: Verify active user has permission to access this project workspace
  const user = window.Nexeta.Auth.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  const isMember = project.members && project.members.some(m => m.email.toLowerCase() === user.email.toLowerCase());
  if (!isMember) {
    alert("Authorization Access Denied: You are not authorized to access project \"" + project.name + "\".");
    window.location.hash = '#projects';
    return;
  }

  // Header summary binding
  const nameEl = document.getElementById('workspace-project-name');
  const typeEl = document.getElementById('workspace-project-type');
  const createdEl = document.getElementById('workspace-project-created');
  const progressText = document.getElementById('workspace-progress-text');
  const progressBar = document.getElementById('workspace-progress-bar');
  const statusSelect = document.getElementById('workspace-status-select');
  const rightProgress = document.getElementById('workspace-right-progress');

  if (nameEl) nameEl.textContent = project.name;
  if (typeEl) typeEl.textContent = project.type;
  if (createdEl) createdEl.textContent = project.created;
  
  const completionPercentage = `${project.progress || 0}%`;
  if (progressText) progressText.textContent = completionPercentage;
  if (progressBar) progressBar.style.width = completionPercentage;
  if (rightProgress) rightProgress.textContent = completionPercentage;
  if (statusSelect) statusSelect.value = project.status;

  // Render Sub-Views
  if (window.Nexeta.WorkspaceOverview) window.Nexeta.WorkspaceOverview.render(project);
  if (window.Nexeta.WorkspaceTasks) window.Nexeta.WorkspaceTasks.render(project);
  if (window.Nexeta.WorkspaceCollaboration) window.Nexeta.WorkspaceCollaboration.render(project);
  
  renderAssetsGrid('All');
  renderAIChatsList();
  renderWorkspacePrompts(project);
  renderWorkspaceAnalytics(project);

  // Populate Notes Textarea with saved content
  const notesTextarea = document.getElementById('workspace-notes-textarea');
  if (notesTextarea) {
    notesTextarea.value = project.notes || '';
  }

  // Bind Actions & Event Listeners once per project change
  bindWorkspaceUIEvents(project);
};

// Sub-render: Tasks Kanban
function renderTasksBoard() {
  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (project && window.Nexeta.WorkspaceTasks) {
    window.Nexeta.WorkspaceTasks.render(project);
  }
}

// Bind all interactive actions in workspace
function bindWorkspaceUIEvents(project) {
  const pm = window.Nexeta.ProjectManager;

  // Invite member submit
  const inviteBtn = document.getElementById('workspace-btn-invite');
  if (inviteBtn) {
    inviteBtn.onclick = () => {
      const nameInput = document.getElementById('workspace-invite-name');
      const emailInput = document.getElementById('workspace-invite-email');
      const roleSelect = document.getElementById('workspace-invite-role');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const role = roleSelect.value;

      if (!name || !email) {
        alert('Please fill out member name and email address.');
        return;
      }

      if (window.Nexeta.WorkspaceCollaboration) {
        window.Nexeta.WorkspaceCollaboration.inviteMember(project, name, email, role);
        nameInput.value = '';
        emailInput.value = '';
      }
    };
  }

  // Backup Version Snapshot creation
  const backupBtn = document.getElementById('workspace-btn-snapshot-create');
  if (backupBtn) {
    backupBtn.onclick = () => {
      const backupName = prompt('Enter a label or title for this backup version point (e.g. Pre-Launch Copy Draft):');
      if (backupName && backupName.trim() && window.Nexeta.WorkspaceCollaboration) {
        window.Nexeta.WorkspaceCollaboration.createVersionSnapshot(project, backupName.trim());
      }
    };
  }

  // Settings: Rename workspace
  const renameInput = document.getElementById('workspace-settings-rename-input');
  if (renameInput) renameInput.value = project.name;

  const renameBtn = document.getElementById('workspace-settings-rename-btn');
  if (renameBtn) {
    renameBtn.onclick = () => {
      const newName = renameInput.value.trim();
      if (newName && window.Nexeta.WorkspaceActions) {
        window.Nexeta.WorkspaceActions.rename(project, newName);
      }
    };
  }

  // Settings: Move Category
  const moveSelect = document.getElementById('workspace-settings-move-select');
  if (moveSelect) moveSelect.value = project.type;

  const moveBtn = document.getElementById('workspace-settings-move-btn');
  if (moveBtn) {
    moveBtn.onclick = () => {
      const targetCat = moveSelect.value;
      if (targetCat && window.Nexeta.WorkspaceActions) {
        window.Nexeta.WorkspaceActions.moveCategory(project, targetCat);
      }
    };
  }

  // Settings: Export Campaign JSON
  const exportBtn = document.getElementById('workspace-settings-export-btn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      if (window.Nexeta.WorkspaceActions) {
        window.Nexeta.WorkspaceActions.exportJSON(project);
      }
    };
  }

  // Settings: Archive Campaign
  const archiveBtn = document.getElementById('workspace-settings-archive-btn');
  if (archiveBtn) {
    archiveBtn.textContent = project.archived ? 'Restore from Archive' : 'Archive Campaign';
    archiveBtn.onclick = () => {
      if (window.Nexeta.WorkspaceActions) {
        window.Nexeta.WorkspaceActions.toggleArchive(project);
      }
    };
  }

  // Settings: Delete Campaign
  const deleteBtn = document.getElementById('workspace-settings-delete-btn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (window.Nexeta.WorkspaceActions) {
        window.Nexeta.WorkspaceActions.delete(project);
      }
    };
  }

  // Co-Pilot Chat triggers
  const chatSendBtn = document.getElementById('workspace-assistant-send');
  const chatInput = document.getElementById('workspace-assistant-input');
  if (chatSendBtn && chatInput) {
    const handleCoPilotMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      const historyContainer = document.getElementById('workspace-assistant-chat-history');
      if (!historyContainer) return;

      // Append user bubble
      historyContainer.innerHTML += `
        <div class="chat-bubble user" style="margin-top: 0.75rem;">
          <div class="chat-avatar user">ME</div>
          <div class="chat-message-content" style="font-size:0.8rem;">${text}</div>
        </div>
      `;
      chatInput.value = '';
      historyContainer.scrollTop = historyContainer.scrollHeight;

      // Simulated assistant context-aware response typing delay
      setTimeout(() => {
        let reply = `I've analyzed your prompt regarding this workspace campaign. For "${project.name}" (initialized as ${project.type}), I suggest refining targeting strategies around product hooks. What specific ad platform copywriting parameters should we structure?`;
        
        if (text.toLowerCase().includes('recommend') || text.toLowerCase().includes('keywords')) {
          reply = `Recommended Target SEO Keywords for campaign folder "${project.name}":<br>1. Smartwatch wearables tracking<br>2. Active fitness biometric sensor<br>3. Waterproof IP68 notifications sync`;
        } else if (text.toLowerCase().includes('task') || text.toLowerCase().includes('todo')) {
          const count = project.tasks ? project.tasks.length : 0;
          const pending = project.tasks ? project.tasks.filter(t => t.status !== 'done').length : 0;
          reply = `You currently have ${pending} pending tasks out of ${count} total campaign deliverables configured. I suggest addressing the High Priority tasks next.`;
        }

        historyContainer.innerHTML += `
          <div class="chat-bubble assistant" style="margin-top: 0.75rem;">
            <div class="chat-avatar assistant">CO</div>
            <div class="chat-message-content" style="font-size:0.8rem;">${reply}</div>
          </div>
        `;
        historyContainer.scrollTop = historyContainer.scrollHeight;
        if (window.lucide) window.lucide.createIcons();
      }, 900);
    };

    chatSendBtn.onclick = handleCoPilotMessage;
    chatInput.onkeydown = (e) => {
      if (e.key === 'Enter') handleCoPilotMessage();
    };
  }

  // Assets Drag & Drop Upload simulator
  const dragArea = document.getElementById('workspace-asset-drag-area');
  if (dragArea) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dragArea.addEventListener(eventName, (e) => e.preventDefault(), false);
    });

    dragArea.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.png,.jpg,.jpeg,.pdf,.txt,.mp4';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleMockUpload(project, file.name, file.size);
      };
      input.click();
    };

    dragArea.ondrop = (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) handleMockUpload(project, file.name, file.size);
    };
  }
}

// Simulated file uploader helper
function handleMockUpload(project, fileName, fileSize) {
  if (!project) return;
  
  const sizeMB = (fileSize / (1024*1024)).toFixed(2);
  const newAsset = {
    id: 'ast-' + Date.now(),
    title: fileName,
    type: 'Uploaded',
    content: `Local resource path: sandbox://assets/${fileName}\nSize: ${sizeMB} MB\nImport status: Complete`,
    timestamp: new Date().toLocaleString()
  };

  if (!project.assets) project.assets = [];
  project.assets.unshift(newAsset);

  project.activities.unshift({
    id: 'act-' + Date.now(),
    action: `Document uploaded: "${fileName}" (${sizeMB} MB)`,
    timestamp: new Date().toLocaleString()
  });

  const pm = window.Nexeta.ProjectManager;
  const projects = pm.getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx !== -1) {
    projects[idx] = project;
    pm.saveProjects(projects);
  }

  window.renderProjectWorkspace();
  if (window.showSuccessNotification) {
    window.showSuccessNotification(`Document "${fileName}" uploaded successfully.`);
  }
}

// Sub-render: Workspace prompt list
function renderWorkspacePrompts(project) {
  const container = document.getElementById('workspace-prompts-grid');
  if (!container) return;

  const defaultPrompts = [
    { title: 'Attention Hook Copier', category: 'Copywriting', content: 'Generate 5 high-CTR scroll-stopping hooks for smartwatch features targeting tech adopters.' },
    { title: 'Email Newsletter Outline', category: 'Retention', content: 'Create a Quest framework welcome marketing email explaining features and adding a purchase incentive.' },
    { title: 'YouTube Script Segment Builder', category: 'Video', content: 'Draft a 30-second retention intro script focusing on biometric waterproof details.' }
  ];

  const prompts = project.prompts && project.prompts.length > 0 ? project.prompts : defaultPrompts;

  container.innerHTML = prompts.map(p => `
    <div class="glass-card" style="padding: 1rem; text-align: left; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 8px;">
      <div>
        <span style="font-size: 0.65rem; color: var(--primary); font-weight: bold; background: rgba(59,130,246,0.05); padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid rgba(59,130,246,0.15);">${p.category}</span>
        <h4 style="font-weight: bold; color: #fff; font-size: 0.85rem; margin: 0.4rem 0 0.25rem 0;">${p.title}</h4>
        <p style="font-size: 0.74rem; color: var(--text-secondary); line-height: 1.35; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin-bottom: 0.75rem;">${p.content}</p>
      </div>
      <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.5rem; margin-top: 0.5rem;">
        <button class="btn btn-outline-subtle btn-copy-workspace-prompt" data-text="${p.content.replace(/"/g, '&quot;')}" style="padding: 0.25rem 0.5rem; font-size: 0.68rem; display:inline-flex; align-items:center; gap:2px;"><i data-lucide="copy" style="width:10px; height:10px;"></i> Copy</button>
        <button class="btn btn-primary btn-run-workspace-prompt" data-text="${p.content.replace(/"/g, '&quot;')}" style="padding: 0.25rem 0.5rem; font-size: 0.68rem; display:inline-flex; align-items:center; gap:2px;"><i data-lucide="play" style="width:10px; height:10px;"></i> Run</button>
      </div>
    </div>
  `).join('');

  // Bind copy
  container.querySelectorAll('.btn-copy-workspace-prompt').forEach(btn => {
    btn.onclick = () => {
      navigator.clipboard.writeText(btn.getAttribute('data-text')).then(() => {
        if (window.showSuccessNotification) window.showSuccessNotification('Prompt outline copied!');
      });
    };
  });

  // Bind run (prepopulates co-pilot chat)
  container.querySelectorAll('.btn-run-workspace-prompt').forEach(btn => {
    btn.onclick = () => {
      const text = btn.getAttribute('data-text');
      // Go to assistant tab
      document.querySelector('.btn-workspace-tab[data-tab="assistant"]')?.click();
      const input = document.getElementById('workspace-assistant-input');
      if (input) {
        input.value = text;
        input.focus();
      }
    };
  });
}

// Sub-render: Analytics
function renderWorkspaceAnalytics(project) {
  const compLabel = document.getElementById('workspace-analytics-completion');
  if (compLabel) compLabel.textContent = `${project.progress || 0}%`;
}

    // Attach card drag listeners


// Sub-render: Assets Grid
function renderAssetsGrid(typeFilter = 'All') {
  const grid = document.getElementById('workspace-assets-grid');
  if (!grid) return;

  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (!project) return;

  let assets = project.assets || [];
  if (typeFilter !== 'All') {
    assets = assets.filter(a => a.type === typeFilter);
  }

  if (assets.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem; width: 100%;">
        <i data-lucide="file" style="width: 32px; height: 32px; margin: 0 auto 0.5rem auto; display: block; opacity: 0.3;"></i>
        <span>No matching assets found in this campaign workspace.</span>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = assets.map(asset => {
    let icon = 'file';
    let iconColor = 'var(--text-muted)';

    if (asset.type === 'Ad Campaign') { icon = 'megaphone'; iconColor = '#10b981'; }
    else if (asset.type === 'AI Image') { icon = 'image'; iconColor = '#3b82f6'; }
    else if (asset.type === 'AI Video') { icon = 'video'; iconColor = '#8b5cf6'; }
    else if (asset.type === 'Marketing Strategy') { icon = 'compass'; iconColor = '#f59e0b'; }
    else if (asset.type === 'Uploaded') { icon = 'upload-cloud'; iconColor = 'var(--accent-cyan)'; }

    const contentSnippet = typeof asset.content === 'object' 
      ? JSON.stringify(asset.content).substring(0, 100) + '...'
      : asset.content.substring(0, 100) + (asset.content.length > 100 ? '...' : '');

    return `
      <div class="glass-card workspace-asset-card" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; text-align: left; cursor: pointer;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 4px;">
            <span style="font-size: 0.65rem; font-weight: bold; padding: 0.15rem 0.4rem; background: rgba(255,255,255,0.03); border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; color: ${iconColor};">
              <i data-lucide="${icon}" style="width: 10px; height: 10px;"></i> ${asset.type}
            </span>
            <button class="btn-delete-asset" data-id="${asset.id}" style="background: transparent; border: none; color: var(--error); cursor: pointer; padding: 0;" title="Delete Asset"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></button>
          </div>
          <h4 style="font-weight: 700; color: #fff; font-size: 0.82rem; margin: 0 0 0.25rem 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${asset.title}</h4>
          <p style="font-size: 0.72rem; color: var(--text-secondary); margin: 0 0 0.5rem 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-family: monospace;">${contentSnippet}</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.4rem; font-size: 0.65rem; color: var(--text-muted); flex-wrap: wrap; gap: 2px;">
          <span>${asset.timestamp}</span>
          <button class="btn btn-outline-subtle btn-copy-asset" data-content="${(typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content)).replace(/"/g, '&quot;')}" style="padding: 0.15rem 0.4rem; font-size: 0.62rem;">
            <i data-lucide="copy" style="width: 9px; height: 9px;"></i> Copy
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Preview click
  grid.querySelectorAll('.workspace-asset-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-asset') || e.target.closest('.btn-copy-asset')) return;

      const assetId = card.querySelector('.btn-delete-asset')?.getAttribute('data-id');
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        const titleEl = document.getElementById('history-detail-title');
        const metaEl = document.getElementById('history-detail-meta');
        const contentEl = document.getElementById('history-detail-content');
        const modal = document.getElementById('history-detail-modal');

        if (titleEl && metaEl && contentEl && modal) {
          titleEl.textContent = asset.title;
          metaEl.textContent = `${asset.type} | Created on ${asset.timestamp}`;

          if (typeof asset.content === 'object') {
            contentEl.textContent = JSON.stringify(asset.content, null, 2);
          } else {
            contentEl.textContent = asset.content;
          }

          modal.classList.add('active');
        }
      }
    });
  });

  // Copy click
  grid.querySelectorAll('.btn-copy-asset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = btn.getAttribute('data-content');
      navigator.clipboard.writeText(content).then(() => {
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Copied asset copy to clipboard.');
        }
      });
    });
  });

  // Delete asset click
  grid.querySelectorAll('.btn-delete-asset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const assetId = btn.getAttribute('data-id');
      if (confirm('Delete this asset from workspace history?')) {
        project.assets = project.assets.filter(a => a.id !== assetId);
        project.lastEdited = new Date().toLocaleString();
        
        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: 'Asset removed from project.',
          timestamp: new Date().toLocaleString()
        });

        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }

        renderAssetsGrid(typeFilter);
        window.renderProjectWorkspace();
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Asset deleted.');
        }
      }
    });
  });
}

// Sub-render: AI Chats List
function renderAIChatsList() {
  const container = document.getElementById('workspace-chats-list');
  if (!container) return;

  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (!project) return;

  const chats = project.chats || [];

  if (chats.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 2rem; border: 1px dashed rgba(255,255,255,0.02); border-radius: 8px;">
        No active AI chats bound to this campaign workspace yet. Chats created in the AI Chat tab can be saved under projects.
      </div>
    `;
    return;
  }

  container.innerHTML = chats.map(c => {
    return `
      <div class="glass-card" style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="message-square" style="width: 14px; height: 14px; color: var(--primary);"></i>
          <span style="font-weight: 700; color: #fff; font-size: 0.8rem;">${c.title}</span>
          <span style="font-size: 0.65rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${c.persona.toUpperCase()}</span>
        </div>
        <button class="btn btn-outline-subtle btn-open-workspace-chat" data-id="${c.id}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;">Open</button>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  container.querySelectorAll('.btn-open-workspace-chat').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const chatSession = chats.find(c => c.id === id);
      if (chatSession) {
        // Load into AI Chat extensions as the active session and redirect
        const sessions = JSON.parse(localStorage.getItem('nexeta_chat_sessions')) || [];
        // Check if session already in main chat list, if not add it
        const exists = sessions.find(s => s.id === chatSession.id);
        if (!exists) {
          sessions.unshift({
            ...chatSession,
            pinned: false,
            favorite: false
          });
          localStorage.setItem('nexeta_chat_sessions', JSON.stringify(sessions));
        }
        localStorage.setItem('nexeta_active_chat_session_id', chatSession.id);
        window.location.hash = '#chat';
      }
    });
  });
}

// Sub-render: Prompts Tab
function renderPromptsTab() {
  const container = document.getElementById('workspace-tab-prompts');
  if (!container) return;

  const project = window.Nexeta.ProjectManager.getActiveProject();
  const prompts = project.prompts || [];

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 2px;">Project Prompt Catalog</h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">Manage and execute specific marketing generation prompts inside this workspace.</p>
      </div>
      <button class="btn btn-primary" id="workspace-btn-add-prompt" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;">+ Save New Prompt</button>
    </div>
  `;

  if (prompts.length === 0) {
    html += `
      <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 3rem; border: 1px dashed rgba(255,255,255,0.02); border-radius: 8px; margin-top: 1rem;">
        No custom prompts saved inside this project yet. Write prompts to customize models behavior.
      </div>
    `;
    container.innerHTML = html;
  } else {
    html += `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.25rem; max-height: 380px; overflow-y: auto;">
        ${prompts.map(p => {
          const versionsCount = p.versions ? p.versions.length : 0;
          return `
            <div class="glass-card" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 10px; display: flex; flex-direction: column; gap: 0.5rem; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <h4 style="font-weight: bold; color: #fff; font-size: 0.85rem; margin: 0;">${p.title || 'Untitled Prompt'}</h4>
                <div style="display: flex; gap: 4px; align-items: center;">
                  <button class="btn-fav-workspace-prompt" data-id="${p.id}" style="background: transparent; border: none; color: ${p.isFavorite ? '#f59e0b' : 'var(--text-muted)'}; cursor: pointer; padding: 2px;" title="Favorite"><i data-lucide="star" style="width: 12px; height: 12px;"></i></button>
                  <button class="btn-edit-workspace-prompt" data-id="${p.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="Edit"><i data-lucide="edit-2" style="width: 12px; height: 12px;"></i></button>
                  <button class="btn-dup-workspace-prompt" data-id="${p.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="Duplicate"><i data-lucide="copy" style="width: 12px; height: 12px;"></i></button>
                  <button class="btn-del-workspace-prompt" data-id="${p.id}" style="background: transparent; border: none; color: var(--error); cursor: pointer; padding: 2px;" title="Delete"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></button>
                </div>
              </div>
              <p style="font-size: 0.78rem; color: #fff; margin: 0; line-height: 1.45; white-space: pre-wrap; font-family: monospace; background: rgba(0,0,0,0.15); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.02);">${p.text}</p>
              
              <!-- Version History -->
              ${versionsCount > 0 ? `
                <div style="margin-top: 0.25rem; border-top: 1px dashed rgba(255,255,255,0.04); padding-top: 0.4rem;">
                  <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" class="toggle-versions-btn" data-id="${p.id}">
                    <i data-lucide="history" style="width: 10px; height: 10px;"></i> Version History (${versionsCount})
                  </span>
                  <div class="versions-list" id="versions-${p.id}" style="display: none; flex-direction: column; gap: 4px; margin-top: 0.35rem; background: rgba(0,0,0,0.1); padding: 0.4rem; border-radius: 4px;">
                    ${p.versions.map((v, idx) => `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 2px; margin-bottom: 2px;">
                        <span>v${v.version} - ${v.timestamp}</span>
                        <button class="btn-restore-prompt-ver" data-id="${p.id}" data-ver-idx="${idx}" style="background: transparent; border: none; color: var(--primary); cursor: pointer; font-size: 0.65rem; padding: 0; font-weight: bold;">Restore</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 0.25rem; border-top: 1px solid rgba(255,255,255,0.02); padding-top: 0.4rem;">
                <button class="btn btn-outline-subtle btn-copy-workspace-prompt" data-text="${p.text.replace(/"/g, '&quot;')}" style="padding: 0.2rem 0.5rem; font-size: 0.65rem;">Copy Prompt</button>
                <button class="btn btn-primary btn-run-workspace-prompt" data-text="${p.text.replace(/"/g, '&quot;')}" style="padding: 0.2rem 0.5rem; font-size: 0.65rem;">Run Prompt</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.innerHTML = html;
  }

  if (window.lucide) window.lucide.createIcons();

  // Prompt actions binds
  const addPromptBtn = document.getElementById('workspace-btn-add-prompt');
  if (addPromptBtn) {
    addPromptBtn.addEventListener('click', () => {
      document.getElementById('workspace-prompt-modal-title').textContent = "Save Workspace Prompt";
      document.getElementById('workspace-prompt-id').value = "";
      document.getElementById('workspace-prompt-title-input').value = "";
      document.getElementById('workspace-prompt-text-input').value = "";
      document.getElementById('workspace-prompt-modal')?.classList.add('active');
    });
  }

  container.querySelectorAll('.btn-edit-workspace-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const pRecord = prompts.find(pr => pr.id === id);
      if (pRecord) {
        document.getElementById('workspace-prompt-modal-title').textContent = "Edit Workspace Prompt";
        document.getElementById('workspace-prompt-id').value = pRecord.id;
        document.getElementById('workspace-prompt-title-input').value = pRecord.title || '';
        document.getElementById('workspace-prompt-text-input').value = pRecord.text || '';
        document.getElementById('workspace-prompt-modal')?.classList.add('active');
      }
    });
  });

  container.querySelectorAll('.toggle-versions-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const listEl = document.getElementById(`versions-${id}`);
      if (listEl) {
        listEl.style.display = listEl.style.display === 'none' ? 'flex' : 'none';
      }
    });
  });

  container.querySelectorAll('.btn-restore-prompt-ver').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const verIdx = parseInt(btn.getAttribute('data-ver-idx'));
      const pRecord = prompts.find(pr => pr.id === id);
      if (pRecord && pRecord.versions && pRecord.versions[verIdx]) {
        const selectedVer = pRecord.versions[verIdx];
        
        // Save current as a version
        const currentVer = {
          version: pRecord.versions.length + 1,
          text: pRecord.text,
          timestamp: new Date().toLocaleString()
        };
        pRecord.versions.push(currentVer);
        
        // Restore
        pRecord.text = selectedVer.text;
        project.lastEdited = new Date().toLocaleString();
        
        // Log activity
        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: `Prompt version restored: "v${selectedVer.version}"`,
          timestamp: new Date().toLocaleString()
        });

        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }
        renderPromptsTab();
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Prompt version restored successfully.');
        }
      }
    });
  });

  container.querySelectorAll('.btn-fav-workspace-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const pRecord = prompts.find(pr => pr.id === id);
      if (pRecord) {
        pRecord.isFavorite = !pRecord.isFavorite;
        project.lastEdited = new Date().toLocaleString();
        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }
        renderPromptsTab();
      }
    });
  });

  container.querySelectorAll('.btn-dup-workspace-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const pRecord = prompts.find(pr => pr.id === id);
      if (pRecord) {
        prompts.push({
          id: 'pr-' + Date.now(),
          title: (pRecord.title || 'Prompt') + ' (Copy)',
          text: pRecord.text,
          isFavorite: false,
          versions: JSON.parse(JSON.stringify(pRecord.versions || []))
        });
        project.lastEdited = new Date().toLocaleString();
        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }
        renderPromptsTab();
      }
    });
  });

  container.querySelectorAll('.btn-del-workspace-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete prompt?')) {
        project.prompts = project.prompts.filter(pr => pr.id !== id);
        project.lastEdited = new Date().toLocaleString();
        const projects = window.Nexeta.ProjectManager.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = project;
          window.Nexeta.ProjectManager.saveProjects(projects);
        }
        renderPromptsTab();
      }
    });
  });

  container.querySelectorAll('.btn-copy-workspace-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const txt = btn.getAttribute('data-text');
      navigator.clipboard.writeText(txt).then(() => {
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Prompt template copied.');
        }
      });
    });
  });

  container.querySelectorAll('.btn-run-workspace-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const txt = btn.getAttribute('data-text');
      const inputOverride = document.getElementById('view-chat-input');
      if (inputOverride) {
        inputOverride.value = txt;
      }
      window.location.hash = '#chat';
    });
  });
}

// Sub-render: Activity Timeline Tab
function renderActivityTimeline() {
  const container = document.getElementById('workspace-tab-timeline');
  if (!container) return;

  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (!project) return;

  const activities = project.activities || [];

  let html = `
    <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 2px;">Workspace Activity History</h3>
    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Log of modifications, asset generations, and actions within this project.</p>
  `;

  if (activities.length === 0) {
    html += `
      <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 2rem;">
        No activity logs found.
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  html += `
    <div class="timeline-wrapper" style="margin-top: 1rem; max-height: 400px; overflow-y: auto;">
      ${activities.map(act => `
        <div class="timeline-item" style="display: flex; gap: 0.75rem; border-left: 2px solid rgba(255,255,255,0.04); padding-left: 1rem; position: relative; padding-bottom: 1rem;">
          <div class="timeline-dot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); position: absolute; left: -5px; top: 4px;"></div>
          <div style="display: flex; flex-direction: column; gap: 2px; text-align: left;">
            <span style="font-size: 0.8rem; color: #fff; font-weight: bold;">${act.action}</span>
            <span style="font-size: 0.65rem; color: var(--text-muted);">${act.timestamp}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

// Sub-render: Project Context AI Assistant Tab
function renderAssistantTab() {
  const container = document.getElementById('workspace-tab-assistant');
  if (!container) return;

  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (!project) return;

  container.innerHTML = `
    <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 2px;"><i data-lucide="sparkles" style="color: #a78bfa; margin-right: 4px;"></i> Workspace AI Copilot</h3>
    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Get audits, summaries, next steps, and risk reviews in the context of this campaign.</p>

    <div style="display: grid; grid-template-columns: 1fr 260px; gap: 1.5rem;">
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 12px; min-height: 250px; max-height: 280px; overflow-y: auto; text-align: left;" id="workspace-copilot-replies">
          <div style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5;">
            Hi, I am your Campaign Copilot. I have context about this campaign ("${project.name}"). Click one of the quick actions on the right to analyze the workspace!
          </div>
        </div>
        
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="text" id="workspace-copilot-input" class="input-field" style="flex-grow: 1; font-size: 0.85rem; padding: 0.55rem 0.75rem;" placeholder="Ask Copilot about this workspace...">
          <button class="btn btn-primary" id="workspace-btn-copilot-send" style="padding: 0.55rem 1rem; font-size: 0.82rem;"><i data-lucide="send" style="width: 14px; height: 14px;"></i></button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        <button class="btn btn-outline-subtle btn-copilot-shortcut" data-action="summary" style="justify-content: flex-start; text-align: left; font-size: 0.78rem; padding: 0.6rem; border-radius: 8px;">
          <i data-lucide="file-text" style="width: 12px; height: 12px; margin-right: 6px;"></i> Summarize Project
        </button>
        <button class="btn btn-outline-subtle btn-copilot-shortcut" data-action="steps" style="justify-content: flex-start; text-align: left; font-size: 0.78rem; padding: 0.6rem; border-radius: 8px;">
          <i data-lucide="list-todo" style="width: 12px; height: 12px; margin-right: 6px;"></i> Suggest Next Steps
        </button>
        <button class="btn btn-outline-subtle btn-copilot-shortcut" data-action="risks" style="justify-content: flex-start; text-align: left; font-size: 0.78rem; padding: 0.6rem; border-radius: 8px;">
          <i data-lucide="alert-triangle" style="width: 12px; height: 12px; margin-right: 6px; color: var(--error);"></i> Risk Detection
        </button>
        <button class="btn btn-outline-subtle btn-copilot-shortcut" data-action="improve" style="justify-content: flex-start; text-align: left; font-size: 0.78rem; padding: 0.6rem; border-radius: 8px;">
          <i data-lucide="trending-up" style="width: 12px; height: 12px; margin-right: 6px; color: var(--success);"></i> Improvements
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const chatPane = document.getElementById('workspace-copilot-replies');
  const inputEl = document.getElementById('workspace-copilot-input');
  const sendBtn = document.getElementById('workspace-btn-copilot-send');

  const appendCopilotMsg = (sender, text) => {
    if (!chatPane) return;
    const bubble = document.createElement('div');
    bubble.style.cssText = `margin-top: 0.75rem; text-align: left; font-size: 0.8rem; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.5rem; color: ${sender === 'user' ? '#fff' : 'var(--text-secondary)'};`;
    bubble.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Copilot'}:</strong><div style="margin-top: 2px;">${text}</div>`;
    chatPane.appendChild(bubble);
    chatPane.scrollTop = chatPane.scrollHeight;
  };

  const handleCopilotSend = async (userPromptText) => {
    if (!userPromptText) return;
    appendCopilotMsg('user', userPromptText);
    if (inputEl) inputEl.value = '';

    // Show indicator
    const typing = document.createElement('div');
    typing.style.cssText = 'color: var(--text-muted); font-size: 0.72rem; margin-top: 0.5rem; font-style: italic;';
    typing.textContent = 'Copilot is auditing campaign data...';
    chatPane?.appendChild(typing);

    try {
      const tasksSummary = project.tasks.map((t, idx) => `${idx + 1}. [${t.status.toUpperCase()}] ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate})`).join('\n') || 'No tasks created yet.';
      const assetsSummary = project.assets.map((a, idx) => `${idx + 1}. [${a.type}] ${a.title} (${a.timestamp})`).join('\n') || 'No assets saved yet.';
      const notesSummary = project.notes ? project.notes.substring(0, 1000) : 'No project notes.';

      const contextPrompt = `You are the Campaign AI Assistant inside the Naxeta AI Project Workspace.
You have direct read-access to the current project's state.

PROJECT DETAILS:
- Name: "${project.name}"
- Category: "${project.type}"
- Status: "${project.status}"
- Description: "${project.description || 'No description.'}"
- Created: "${project.created}"
- Last Updated: "${project.lastEdited || project.created}"

TASKS LIST:
${tasksSummary}

CAMPAIGN ASSETS:
${assetsSummary}

PROJECT NOTES SCRATCHPAD:
"""
${notesSummary}
"""

USER INQUIRY / COMMAND:
${userPromptText}

Instructions: Focus your suggestions, feedback, and strategies directly on this project's context. Reference specific tasks, assets, or note details if relevant. Keep your response helpful, concise, and structured in Markdown.`;

      const reply = await window.Nexeta.AIEngine.chat(contextPrompt, [], 'marketing');
      typing.remove();
      appendCopilotMsg('copilot', reply);

      // Log activity
      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: 'Workspace Copilot consulted.',
        timestamp: new Date().toLocaleString()
      });
      const projects = window.Nexeta.ProjectManager.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        window.Nexeta.ProjectManager.saveProjects(projects);
      }
    } catch (e) {
      typing.remove();
      appendCopilotMsg('copilot', `Error: ${e.message || 'Engine connection error. Check key settings.'}`);
    }
  };

  if (sendBtn && inputEl) {
    sendBtn.addEventListener('click', () => handleCopilotSend(inputEl.value.trim()));
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCopilotSend(inputEl.value.trim());
    });
  }

  // Bind shortcut triggers
  container.querySelectorAll('.btn-copilot-shortcut').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-action');
      let promptText = '';
      if (act === 'summary') promptText = `Summarize this campaign project. List the key objectives and current assets status.`;
      else if (act === 'steps') promptText = `Suggest 3 immediate actionable next steps to advance this campaign workflow.`;
      else if (act === 'risks') promptText = `Run risk checks on this project. Are we missing description scopes or have pending high-priority tasks?`;
      else if (act === 'improve') promptText = `Suggest marketing optimizations and creative improvements for this project type ("${project.type}").`;
      
      handleCopilotSend(promptText);
    });
  });
}

// Sub-render: Analytics Tab
function renderAnalyticsTab() {
  const container = document.getElementById('workspace-tab-analytics');
  if (!container) return;

  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (!project) return;

  const totalAssets = project.assets.length;
  const tasksCount = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === 'done').length;

  // Real data calculations
  let creditsUsed = 0;
  let storageKB = 0;
  project.assets.forEach(asset => {
    if (asset.type === 'AI Image') creditsUsed += 500;
    else if (asset.type === 'AI Video') creditsUsed += 800;
    else creditsUsed += 100;

    if (asset.type === 'Uploaded' && typeof asset.content === 'string') {
      const match = asset.content.match(/File size:\s*([\d.]+)\s*KB/);
      if (match) storageKB += parseFloat(match[1]);
    }
  });

  const storageStr = storageKB > 1024 
    ? (storageKB / 1024).toFixed(2) + ' MB'
    : storageKB.toFixed(1) + ' KB';

  const score = Math.round(60 + project.progress * 0.4);
  const timeSpent = (totalAssets * 1.5 + completedTasks * 2.0 + (tasksCount - completedTasks) * 0.5).toFixed(1);

  container.innerHTML = `
    <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 2px;">Workspace Analytics</h3>
    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Visual summary of campaign deliverables, assets creation, and performance indexes.</p>

    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem;">
      <div class="glass-card stat-card" style="padding: 1.25rem;">
        <span style="font-size: 0.72rem; color: var(--text-secondary);">Total Assets</span>
        <div class="stat-card-number" style="font-size: 1.75rem; margin-top: 0.25rem;">${totalAssets}</div>
        <span style="font-size: 0.65rem; color: var(--accent-cyan);">Generated copies & files</span>
      </div>
      <div class="glass-card stat-card" style="padding: 1.25rem;">
        <span style="font-size: 0.72rem; color: var(--text-secondary);">AI Credits Used</span>
        <div class="stat-card-number" style="font-size: 1.75rem; margin-top: 0.25rem;">${creditsUsed.toLocaleString()}</div>
        <span style="font-size: 0.65rem; color: var(--primary);">Cost based on asset types</span>
      </div>
      <div class="glass-card stat-card" style="padding: 1.25rem;">
        <span style="font-size: 0.72rem; color: var(--text-secondary);">Storage Allocated</span>
        <div class="stat-card-number" style="font-size: 1.75rem; margin-top: 0.25rem;">${storageStr}</div>
        <span style="font-size: 0.65rem; color: var(--text-muted);">Uploaded assets memory</span>
      </div>
      <div class="glass-card stat-card" style="padding: 1.25rem;">
        <span style="font-size: 0.72rem; color: var(--text-secondary);">Effort Invested</span>
        <div class="stat-card-number" style="font-size: 1.75rem; margin-top: 0.25rem;">${timeSpent}h</div>
        <span style="font-size: 0.65rem; color: var(--success); font-weight: bold;">Work hours estimate</span>
      </div>
    </div>

    <!-- Completion breakdown -->
    <div class="glass-card" style="margin-top: 1.5rem; padding: 1.5rem; text-align: left; display: flex; flex-direction: column; gap: 0.75rem;">
      <h4 style="font-weight: 700; color: #fff; font-size: 0.9rem; margin: 0;">Task Completion Audit (Workspace Progress: ${score}%)</h4>
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
        <span>Completed: ${completedTasks} of ${tasksCount} tasks</span>
        <strong style="color: #fff;">${project.progress}%</strong>
      </div>
      <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden;">
        <div style="width: ${project.progress}%; height: 100%; background: linear-gradient(90deg, var(--success) 0%, var(--primary) 100%);"></div>
      </div>
    </div>
  `;
}

// Sub-render: Settings Tab
function renderSettingsTab() {
  const container = document.getElementById('workspace-tab-settings');
  if (!container) return;

  const project = window.Nexeta.ProjectManager.getActiveProject();
  if (!project) return;

  const isArc = project.archived || false;

  container.innerHTML = `
    <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 2px;">Workspace Configuration</h3>
    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Configure project name, duplicate campaign branches, or permanently delete workspace logs.</p>

    <div style="max-width: 500px; display: flex; flex-direction: column; gap: 1.25rem; text-align: left;">
      <!-- Rename Project -->
      <div style="display: flex; flex-direction: column; gap: 0.4rem;">
        <label for="workspace-settings-name" style="font-size: 0.75rem; font-weight: bold; color: var(--text-secondary);">Project Workspace Name</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="workspace-settings-name" class="input-field" style="flex-grow: 1; font-size: 0.85rem; padding: 0.55rem 0.75rem;" value="${project.name}">
          <button class="btn btn-primary" id="workspace-btn-rename" style="padding: 0.55rem 1rem; font-size: 0.8rem; font-weight: bold;">Rename</button>
        </div>
      </div>
      
      <!-- Change Workflow Category -->
      <div style="display: flex; flex-direction: column; gap: 0.4rem;">
        <label for="workspace-settings-category" style="font-size: 0.75rem; font-weight: bold; color: var(--text-secondary);">AI Workflow Engine Category</label>
        <div style="display: flex; gap: 0.5rem;">
          <select id="workspace-settings-category" class="input-field" style="flex-grow: 1; font-size: 0.85rem; padding: 0.55rem; background: rgba(0,0,0,0.3); border-color: var(--border-color); color: #fff; cursor: pointer;">
            <option value="AI Ad Creator">AI Advertisement</option>
            <option value="AI Image Generator">AI Image</option>
            <option value="AI Video Generator">AI Video</option>
            <option value="AI Script Writer">AI Script</option>
            <option value="AI Social Media">Social Media Post</option>
            <option value="AI Thumbnail Generator">Thumbnail Generator</option>
            <option value="AI Blog Writer">Blog Writer</option>
            <option value="Marketing Strategy">Marketing Strategy</option>
          </select>
          <button class="btn btn-outline-subtle" id="workspace-btn-change-category" style="padding: 0.55rem 1rem; font-size: 0.8rem; font-weight: bold;">Change Category</button>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem;">
        <button class="btn btn-outline-subtle" id="workspace-btn-duplicate" style="padding: 0.5rem 1rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
          <i data-lucide="copy" style="width: 12px; height: 12px;"></i> Duplicate Workspace
        </button>
      </div>

      <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 0.75rem 0;">
      
      <h4 style="color: var(--error); font-weight: bold; font-size: 0.82rem; margin: 0;">Danger Zone Actions</h4>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-outline-subtle" id="workspace-btn-archive" style="padding: 0.5rem 1rem; font-size: 0.8rem; color: ${isArc ? 'var(--success)' : 'var(--warning)'}; border-color: rgba(245,158,11,0.15); display: inline-flex; align-items: center; gap: 4px;">
          <i data-lucide="archive" style="width: 12px; height: 12px;"></i> ${isArc ? 'Unarchive Project' : 'Archive Project'}
        </button>
        <button class="btn btn-outline-subtle" id="workspace-btn-export" style="padding: 0.5rem 1rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
          <i data-lucide="download" style="width: 12px; height: 12px;"></i> Export JSON
        </button>
        <button class="btn btn-outline-subtle" id="workspace-btn-delete" style="padding: 0.5rem 1rem; font-size: 0.8rem; color: var(--error); border-color: rgba(239,68,68,0.25); display: inline-flex; align-items: center; gap: 4px;">
          <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i> Delete Workspace
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Pre-populate category select
  const catSelect = document.getElementById('workspace-settings-category');
  if (catSelect) catSelect.value = project.type;

  // Rename action
  const renameBtn = document.getElementById('workspace-btn-rename');
  if (renameBtn) {
    renameBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('workspace-settings-name');
      const newName = nameInput ? nameInput.value.trim() : '';
      if (!newName) {
        alert('Name cannot be empty!');
        return;
      }
      window.Nexeta.ProjectManager.renameProject(project.id, newName);
      if (window.showSuccessNotification) {
        window.showSuccessNotification('Workspace renamed successfully.');
      }
      window.renderProjectWorkspace();
    });
  }

  // Category change action
  const changeCatBtn = document.getElementById('workspace-btn-change-category');
  if (changeCatBtn && catSelect) {
    changeCatBtn.addEventListener('click', () => {
      const targetCat = catSelect.value;
      if (targetCat && window.Nexeta.WorkspaceActions) {
        window.Nexeta.WorkspaceActions.moveCategory(project, targetCat);
      }
    });
  }

  // Duplicate action
  const dupBtn = document.getElementById('workspace-btn-duplicate');
  if (dupBtn) {
    dupBtn.addEventListener('click', () => {
      const projects = window.Nexeta.ProjectManager.getProjects();
      const copy = {
        ...project,
        id: 'proj-' + Date.now(),
        name: project.name + ' (Copy)',
        created: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        lastEdited: new Date().toLocaleString(),
        tasks: JSON.parse(JSON.stringify(project.tasks || [])),
        assets: JSON.parse(JSON.stringify(project.assets || [])),
        chats: JSON.parse(JSON.stringify(project.chats || [])),
        prompts: JSON.parse(JSON.stringify(project.prompts || [])),
        activities: [{ id: 'act-' + Date.now(), action: 'Duplicated workspace branch created.', timestamp: new Date().toLocaleString() }]
      };
      projects.unshift(copy);
      window.Nexeta.ProjectManager.saveProjects(projects);
      if (window.showSuccessNotification) {
        window.showSuccessNotification('Workspace duplicated successfully.');
      }
      window.location.hash = `#project-workspace?id=${copy.id}`;
    });
  }

  // Archive action
  const archiveBtn = document.getElementById('workspace-btn-archive');
  if (archiveBtn) {
    archiveBtn.addEventListener('click', () => {
      const projects = window.Nexeta.ProjectManager.getProjects();
      const pRecord = projects.find(p => p.id === project.id);
      if (pRecord) {
        pRecord.archived = !pRecord.archived;
        
        pRecord.activities.unshift({
          id: 'act-' + Date.now(),
          action: pRecord.archived ? 'Workspace archived.' : 'Workspace unarchived.',
          timestamp: new Date().toLocaleString()
        });

        window.Nexeta.ProjectManager.saveProjects(projects);
        if (window.showSuccessNotification) {
          window.showSuccessNotification(pRecord.archived ? 'Project archived.' : 'Project active.');
        }
        renderSettingsTab();
      }
    });
  }

  // Export action
  const exportBtn = document.getElementById('workspace-btn-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `workspace_${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_export.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    });
  }

  // Delete action
  const deleteBtn = document.getElementById('workspace-btn-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Permanently delete this workspace and all generated assets? This action is irreversible.')) {
        window.Nexeta.ProjectManager.deleteProject(project.id);
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Workspace deleted.');
        }
        window.location.hash = '#projects';
      }
    });
  }
}




