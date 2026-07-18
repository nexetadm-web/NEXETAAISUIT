/**
 * NEXETA AI MARKETING SUITE - Prompt Packs Module
 * Renders strategic AI prompts collections, search by tags, copy to clipboard,
 * save to library manager, and provides personalized AI Recommended items.
 */
(function() {
  const MarketplacePrompts = {
    render(container, searchQuery = '', smartFilter = 'all', sortVal = 'trending') {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      let prompts = [...db.prompts];
      const favs = global.getFavorites();
      const installed = global.getInstalledItems();

      // Implement AI Recommendations
      let recommendedId = 'pr-1'; // Default
      if (window.Nexeta.ProjectManager) {
        const projects = window.Nexeta.ProjectManager.getProjects();
        if (projects.length > 0) {
          const latestProjType = projects[0].type;
          if (latestProjType === 'AI Ad Creator' || latestProjType === 'AI Social Media') {
            recommendedId = 'pr-4'; // AIDA Copywriting Enhancer
          } else if (latestProjType === 'AI Video Generator' || latestProjType === 'AI Script Writer') {
            recommendedId = 'pr-2'; // YouTube Hook Generator
          } else {
            recommendedId = 'pr-3'; // SEO Blog Outline
          }
        }
      }

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        prompts = prompts.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.desc.toLowerCase().includes(query) || 
          p.creator.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Smart Filters
      if (smartFilter === 'installed') {
        // Saved prompts
        prompts = prompts.filter(p => installed.includes(p.id));
      } else if (smartFilter === 'favorites') {
        prompts = prompts.filter(p => favs.includes(p.id));
      } else if (smartFilter === 'verified') {
        prompts = prompts.filter(p => p.creator === 'Nexeta Labs' || p.creator === 'ChiefGrowth');
      }

      // Sort
      if (sortVal === 'installs' || sortVal === 'trending') {
        prompts.sort((a, b) => b.installs - a.installs);
      } else if (sortVal === 'rating') {
        prompts.sort((a, b) => b.rating - a.rating);
      } else if (sortVal === 'newest') {
        prompts.sort((a, b) => b.id.localeCompare(a.id));
      }

      if (prompts.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
            <i data-lucide="book-open" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.4;"></i>
            <h3>No prompts found matching search criteria</h3>
            <p>Try clicking tags on existing prompts or clearing filters.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = prompts.map(p => {
        const isRec = p.id === recommendedId;
        const isFav = favs.includes(p.id);
        const tagsHTML = p.tags.map(t => `
          <span class="prompt-tag-btn" data-tag="${t}" style="font-size: 0.62rem; color: var(--accent-cyan); background: rgba(6,182,212,0.05); padding: 0.1rem 0.35rem; border-radius: 4px; border: 1px solid rgba(6,182,212,0.15); cursor: pointer; transition: 0.15s;">
            #${t}
          </span>
        `).join('');

        const recBadge = isRec
          ? `<span style="font-size: 0.65rem; color: #a78bfa; font-weight: bold; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;"><i data-lucide="sparkles" style="width: 10px; height: 10px;"></i> AI Recommended</span>`
          : '';

        return `
          <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; min-height: 220px; text-align: left;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--accent-cyan);">
                  <i data-lucide="book-open" style="width: 18px; height: 18px;"></i>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  ${recBadge}
                  <span style="font-size: 0.65rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 0.15rem 0.35rem; border-radius: 4px;">
                    ★ ${p.rating}
                  </span>
                </div>
              </div>
              <h4 style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem;">${p.name}</h4>
              <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">By ${p.creator} • <span style="color: var(--accent-cyan); font-weight: bold;">${p.category}</span></span>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 0.75rem;">
                ${tagsHTML}
              </div>
              <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${p.desc}</p>
            </div>
            <div style="margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-outline-subtle btn-prompt-copy-quick" data-id="${p.id}" style="padding: 0.45rem 0.75rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="copy" style="width: 12px; height: 12px;"></i> Copy
              </button>
              <button class="btn btn-primary btn-prompt-preview" data-id="${p.id}" style="padding: 0.45rem 0.85rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">
                Open Drawer
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.bindEvents(container);
    },

    bindEvents(container) {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();

      // Quick Copy
      container.querySelectorAll('.btn-prompt-copy-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const p = db.prompts.find(x => x.id === id);
          if (p) {
            navigator.clipboard.writeText(p.promptContent).then(() => {
              this.showToast('Prompt copied to clipboard!', 'success');
              global.logHistory(p.id, 'install');
            });
          }
        });
      });

      // Preview modal
      container.querySelectorAll('.btn-prompt-preview').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.openPromptModal(id);
        });
      });

      // Tags click triggers
      container.querySelectorAll('.prompt-tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tag = btn.getAttribute('data-tag');
          const searchInput = document.getElementById('market-search');
          if (searchInput) {
            searchInput.value = tag;
            window.renderMarketplaceGrid();
          }
        });
      });
    },

    openPromptModal(id) {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      const p = db.prompts.find(x => x.id === id);
      if (!p) return;

      const modal = document.getElementById('market-prompt-modal');
      if (!modal) return;

      // Populate text
      document.getElementById('market-prompt-modal-title').textContent = p.name;
      document.getElementById('market-prompt-modal-creator').textContent = p.creator;
      document.getElementById('market-prompt-modal-text').value = p.promptContent;

      // Tags
      const tagsContainer = document.getElementById('market-prompt-modal-tags');
      tagsContainer.innerHTML = p.tags.map(t => `
        <span style="font-size: 0.65rem; color: var(--accent-cyan); background: rgba(6,182,212,0.08); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(6,182,212,0.25);">
          #${t}
        </span>
      `).join('');

      // Copy action
      const copyBtn = document.getElementById('market-prompt-modal-copy-btn');
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(p.promptContent).then(() => {
          this.showToast('Prompt copied to clipboard!', 'success');
          global.logHistory(p.id, 'install');
        });
      };

      // Save to prompt library
      const saveBtn = document.getElementById('market-prompt-modal-save-btn');
      saveBtn.onclick = () => {
        if (window.Nexeta.PromptLibraryManager) {
          const res = window.Nexeta.PromptLibraryManager.addPrompt(p.name, p.promptContent, p.category);
          if (res) {
            global.installItem(p.id); // Add to installed list in marketplace
            this.showToast('Prompt saved to your personal library!', 'success');
            modal.classList.remove('active');
            window.renderMarketplaceGrid();
          } else {
            alert('Failed to save to library.');
          }
        } else {
          alert('Prompt Library Manager not found.');
        }
      };

      // Import to active chat input
      const importBtn = document.getElementById('market-prompt-modal-import-btn');
      importBtn.onclick = () => {
        // Find chat input in dashboard and insert
        const chatInput = document.querySelector('.chat-input textarea, #chat-input-textarea, textarea[placeholder*="Type a message"]');
        if (chatInput) {
          chatInput.value = p.promptContent;
          // Focus chat input
          chatInput.focus();
          // Navigate user to chat hash
          window.location.hash = '#chat';
          modal.classList.remove('active');
          this.showToast('Prompt injected into chat editor!', 'success');
        } else {
          // If not in chat view directly, we can save to library and redirect to #prompts
          if (window.Nexeta.PromptLibraryManager) {
            window.Nexeta.PromptLibraryManager.addPrompt(p.name, p.promptContent, p.category);
            global.installItem(p.id);
          }
          window.location.hash = '#prompts';
          modal.classList.remove('active');
          this.showToast('Saved and redirected to AI Prompt Library.', 'success');
        }
      };

      if (window.lucide) window.lucide.createIcons();
      modal.classList.add('active');
    },

    showToast(message, type = 'success') {
      if (window.Nexeta.MarketplacePlugins) {
        window.Nexeta.MarketplacePlugins.showToast(message, type);
      } else {
        alert(message);
      }
    }
  };

  // Expose
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.MarketplacePrompts = MarketplacePrompts;
})();
