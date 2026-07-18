/**
 * NEXETA AI MARKETING SUITE - Global Smart Search Engine
 * Indexes and searches across Projects, Campaigns, Clients, Chats, Templates,
 * Brand Kits, Prompt Library, History logs, and AI Tools with keyboard navigations.
 */
(function() {
  const inputId = 'global-search-input';
  const containerId = 'global-search-container';
  const suggestionsId = 'global-search-suggestions';

  let searchItems = [];
  let selectedIndex = -1;
  let activeSuggestions = [];

  // Build the searchable items database from all local storage data managers
  function rebuildSearchIndex() {
    searchItems = [];

    // 1. Projects & Campaigns
    if (window.Nexeta && window.Nexeta.ProjectManager) {
      const projects = window.Nexeta.ProjectManager.getProjects();
      projects.forEach(p => {
        searchItems.push({
          title: p.name,
          desc: `Campaign: ${p.type} (${p.status})`,
          category: 'Projects & Campaigns',
          hash: `#project-workspace?id=${p.id}`,
          action: () => {
            window.Nexeta.ProjectManager.setActiveProjectId(p.id);
          }
        });

        // Index Chats inside projects
        if (p.chats) {
          p.chats.forEach(chat => {
            searchItems.push({
              title: `Chat Session: ${chat.title || 'AI Copilot Conversation'}`,
              desc: `Inside project: ${p.name}`,
              category: 'AI Chat History',
              hash: `#project-workspace?id=${p.id}&tab=assistant`
            });
          });
        }
      });
    }

    // 2. AI Tools
    const tools = [
      { name: 'AI Ad Creator', desc: 'Generate copy and layouts for Facebook, Google, and LinkedIn', hash: '#ad-creator' },
      { name: 'AI Image Generator', desc: 'Generate marketing and copywriting images', hash: '#chat' },
      { name: 'AI Video Creator', desc: 'Generate short-form video prompts and layouts', hash: '#chat' },
      { name: 'AI Script Writer', desc: 'Draft video hooks and retention outlines', hash: '#chat' },
      { name: 'AI Social Media Auto-Post', desc: 'Automate social queue pushes and campaigns', hash: '#automation' },
      { name: 'AI Thumbnail Generator', desc: 'Create click-worthy graphic thumbnails', hash: '#chat' },
      { name: 'AI Blog Writer', desc: 'Generate long-form SEO articles', hash: '#chat' },
      { name: 'AI Marketing Strategy', desc: 'Generate detailed AIDA or PAS funnel strategies', hash: '#chat' }
    ];
    tools.forEach(t => {
      searchItems.push({
        title: t.name,
        desc: t.desc,
        category: 'AI Suite Tools',
        hash: t.hash
      });
    });

    // 3. Prompt Library
    if (window.Nexeta && window.Nexeta.PromptLibraryManager) {
      const prompts = window.Nexeta.PromptLibraryManager.getPrompts();
      prompts.forEach(pr => {
        searchItems.push({
          title: pr.title,
          desc: `Category: ${pr.category} | ${(pr.content || pr.text || '').substring(0, 50)}...`,
          category: 'Prompt Library Templates',
          hash: '#prompts'
        });
      });
    }

    // 4. Brand Kits
    if (window.Nexeta && window.Nexeta.BrandKitManager) {
      const brands = window.Nexeta.BrandKitManager.getBrandKits ? window.Nexeta.BrandKitManager.getBrandKits() : [];
      brands.forEach(br => {
        searchItems.push({
          title: br.name,
          desc: `Brand Voice: ${br.voice} | Industry: ${br.industry}`,
          category: 'Brand Kits',
          hash: '#brandkit'
        });
      });
    }

    // 5. History Logs
    if (window.Nexeta && window.Nexeta.HistoryManager) {
      const history = window.Nexeta.HistoryManager.getHistory();
      history.forEach(h => {
        searchItems.push({
          title: (h.title || h.prompt || h.content || '').substring(0, 40) + '...',
          desc: `Output generation: ${h.type} | Created on ${h.timestamp}`,
          category: 'History & Generations',
          hash: '#history'
        });
      });
    }

    // 6. Templates
    const templates = [
      { title: 'AIDA Framework Copywriting', desc: 'Attention, Interest, Desire, Action structural layout', hash: '#ad-creator?template=aida' },
      { title: 'PAS Copywriting Formula', desc: 'Problem, Agitate, Solution campaign structural outlines', hash: '#ad-creator?template=pas' },
      { title: 'Landing Page Retentive Funnel', desc: 'Generate hooks for high-converting sales structures', hash: '#chat' },
      { title: 'Product Launch Press Release', desc: 'Draft executive corporate statements and media copy', hash: '#chat' }
    ];
    templates.forEach(tp => {
      searchItems.push({
        title: tp.title,
        desc: tp.desc,
        category: 'Campaign Templates',
        hash: tp.hash
      });
    });

    // 7. Clients (Mock listing for CRM integration)
    const clients = [
      { name: 'Acme Global Corp', desc: 'SaaS Client - Active Meta Campaigns', hash: '#projects' },
      { name: 'Globex Industries Inc', desc: 'Enterprise Client - AI Video Deliverables', hash: '#projects' },
      { name: 'Initech Consulting Ltd', desc: 'Ad Agency Partner - Brand Assets Kit Active', hash: '#brandkit' },
      { name: 'Umbrella Digital Marketing', desc: 'Lead Client - Pipeline Stage: Contacted', hash: '#projects' }
    ];
    clients.forEach(cl => {
      searchItems.push({
        title: cl.name,
        desc: cl.desc,
        category: 'Clients & CRM Contacts',
        hash: cl.hash
      });
    });
  }

  // Initialize Search Elements
  function initSearch() {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    
    if (!input || !suggestions) return;

    rebuildSearchIndex();

    // Rebuild index whenever projects or prompt libraries change in localstorage
    window.addEventListener('storage', (e) => {
      if (e.key === 'nexeta_projects' || e.key === 'nexeta_prompts' || e.key === 'nexeta_brands') {
        rebuildSearchIndex();
      }
    });

    // Input events
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      selectedIndex = -1;
      
      if (!query) {
        suggestions.style.display = 'none';
        suggestions.innerHTML = '';
        activeSuggestions = [];
        return;
      }

      // Filter matches
      const matches = searchItems.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.desc.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );

      // Limit results to 8
      activeSuggestions = matches.slice(0, 8);
      suggestions.style.display = 'block';

      if (activeSuggestions.length === 0) {
        suggestions.innerHTML = `
          <div style="padding: 10px; color: var(--text-muted); font-size: 0.78rem; text-align: center;">
            <i data-lucide="help-circle" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: middle;"></i> No results found for "${input.value}"
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      // Render suggestions grouped by Category
      let html = '';
      let currentCategory = '';
      
      activeSuggestions.forEach((item, index) => {
        if (item.category !== currentCategory) {
          currentCategory = item.category;
          html += `
            <div style="font-size: 0.65rem; font-weight: bold; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.05em; padding: 6px 10px 4px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); margin-top: 4px;">
              ${currentCategory}
            </div>
          `;
        }

        // Highlight matched text
        const highlightedTitle = highlightText(item.title, query);
        const highlightedDesc = highlightText(item.desc, query);

        html += `
          <div class="search-suggestion-item" data-index="${index}" style="padding: 8px 10px; cursor: pointer; border-radius: 6px; display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; transition: background 0.2s;" onmouseover="this.style.background='rgba(139, 92, 246, 0.15)'" onmouseout="this.style.background='transparent'">
            <span class="suggestion-title" style="font-weight: 600; color: #fff; font-size: 0.8rem;">${highlightedTitle}</span>
            <span class="suggestion-desc" style="color: var(--text-secondary); font-size: 0.72rem; line-height: 1.3;">${highlightedDesc}</span>
          </div>
        `;
      });

      suggestions.innerHTML = html;

      // Bind click listeners on suggestions
      suggestions.querySelectorAll('.search-suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-index'));
          selectSuggestion(idx);
        });
      });
    });

    // Keyboard events
    input.addEventListener('keydown', (e) => {
      if (activeSuggestions.length === 0) return;

      const items = suggestions.querySelectorAll('.search-suggestion-item');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % activeSuggestions.length;
        highlightSuggestion(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + activeSuggestions.length) % activeSuggestions.length;
        highlightSuggestion(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < activeSuggestions.length) {
          selectSuggestion(selectedIndex);
        } else if (activeSuggestions.length > 0) {
          selectSuggestion(0);
        }
      } else if (e.key === 'Escape') {
        input.value = '';
        suggestions.style.display = 'none';
        suggestions.innerHTML = '';
        activeSuggestions = [];
        input.blur();
      }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      const container = document.getElementById(containerId);
      if (container && !container.contains(e.target)) {
        suggestions.style.display = 'none';
      }
    });
  }

  // Highlight suggestion in UI
  function highlightSuggestion(items) {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.style.background = 'rgba(139, 92, 246, 0.25)';
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.style.background = 'transparent';
      }
    });
  }

  // Execute redirection action on selection
  function selectSuggestion(idx) {
    const item = activeSuggestions[idx];
    if (!item) return;

    // Trigger pre-redirection managers setup (like setting active projectId)
    if (item.action) {
      item.action();
    }

    // Set route hash
    window.location.hash = item.hash;

    // Clear search bar
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    if (input) input.value = '';
    if (suggestions) {
      suggestions.style.display = 'none';
      suggestions.innerHTML = '';
    }
    activeSuggestions = [];
    selectedIndex = -1;

    if (window.showSuccessNotification) {
      window.showSuccessNotification(`Redirected to: ${item.title}`);
    }
  }

  // Highlight query match inside text string
  function highlightText(text, query) {
    if (!text) return '';
    return text.replace(new RegExp(query, 'gi'), match => 
      `<mark style="background: rgba(139, 92, 246, 0.45); color: #ffffff; padding: 1px 3px; border-radius: 4px; font-weight: bold; border: 1px solid rgba(139, 92, 246, 0.6);">${match}</mark>`
    );
  }

  // Re-expose to refresh search index when other sections are initialized
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.GlobalSearch = {
    rebuild: rebuildSearchIndex,
    init: initSearch
  };
})();
