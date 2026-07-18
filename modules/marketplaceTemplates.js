/**
 * NEXETA AI MARKETING SUITE - Templates Pack Module
 * Renders categorized blueprint layouts, favorites toggles, copy actions, and project import.
 */
(function() {
  const MarketplaceTemplates = {
    render(container, searchQuery = '', smartFilter = 'all', sortVal = 'trending') {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      let templates = [...db.templates];
      const favs = global.getFavorites();
      const installed = global.getInstalledItems();

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(query) || 
          t.desc.toLowerCase().includes(query) || 
          t.creator.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }

      // Smart Filters
      if (smartFilter === 'installed') {
        templates = templates.filter(t => installed.includes(t.id));
      } else if (smartFilter === 'favorites') {
        templates = templates.filter(t => favs.includes(t.id));
      } else if (smartFilter === 'verified') {
        templates = templates.filter(t => t.creator.includes('Labs') || t.creator.includes('Team'));
      }

      // Sort
      if (sortVal === 'installs' || sortVal === 'trending') {
        templates.sort((a, b) => b.installs - a.installs);
      } else if (sortVal === 'rating') {
        templates.sort((a, b) => b.rating - a.rating);
      } else if (sortVal === 'newest') {
        // Just sort by title since templates don't have explicit dates
        templates.sort((a, b) => a.name.localeCompare(b.name));
      }

      if (templates.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
            <i data-lucide="layers" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.4;"></i>
            <h3>No templates match your filters</h3>
            <p>Try resetting search text or select another marketplace tab.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = templates.map(t => {
        const isFav = favs.includes(t.id);
        const isInstalled = installed.includes(t.id);
        return `
          <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; min-height: 200px; text-align: left;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--accent-cyan);">
                  <i data-lucide="${t.icon || 'layers'}" style="width: 18px; height: 18px;"></i>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <span style="font-size: 0.65rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 0.15rem 0.35rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;">
                    ★ ${t.rating}
                  </span>
                  <button class="header-btn btn-template-favorite" data-id="${t.id}" style="padding: 0.2rem; border-radius: 4px; border: none; background: transparent; cursor: pointer; color: ${isFav ? 'var(--error)' : 'var(--text-muted)'}; display: inline-flex; align-items: center;">
                    <i data-lucide="heart" style="width: 14px; height: 14px; fill: ${isFav ? 'var(--error)' : 'none'};"></i>
                  </button>
                </div>
              </div>
              <h4 style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem;">${t.name}</h4>
              <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">Category: <span style="color: var(--accent-cyan); font-weight: bold;">${t.category}</span> • By ${t.creator}</span>
              <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${t.desc}</p>
            </div>
            <div style="margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-primary btn-template-preview" data-id="${t.id}" style="padding: 0.45rem 0.85rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="eye" style="width: 12px; height: 12px;"></i> Preview & Import
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.bindEvents(container);
    },

    bindEvents(container) {
      const global = window.Nexeta.MarketplaceGlobal;

      // Favorite toggle
      container.querySelectorAll('.btn-template-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const isFav = global.toggleFavorite(id);
          this.showToast(isFav ? 'Added to favorites.' : 'Removed from favorites.', 'success');
          this.render(container, document.getElementById('market-search').value, document.getElementById('market-filter-smart').value, document.getElementById('market-filter-sort').value);
        });
      });

      // Preview triggers
      container.querySelectorAll('.btn-template-preview').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.openPreviewModal(id);
        });
      });
    },

    openPreviewModal(id) {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      const t = db.templates.find(x => x.id === id);
      if (!t) return;

      const modal = document.getElementById('market-template-modal');
      if (!modal) return;

      // Populate basic info
      document.getElementById('market-template-modal-title').textContent = t.name;
      document.getElementById('market-template-modal-creator').textContent = t.creator;

      // Favorite button inside modal
      const favBtn = document.getElementById('market-template-modal-fav-btn');
      const updateFavBtnState = () => {
        const favs = global.getFavorites();
        const isFav = favs.includes(t.id);
        favBtn.querySelector('i').style.fill = isFav ? 'var(--error)' : 'none';
        favBtn.querySelector('i').style.color = isFav ? 'var(--error)' : 'var(--text-secondary)';
      };
      updateFavBtnState();

      favBtn.onclick = () => {
        global.toggleFavorite(t.id);
        updateFavBtnState();
        this.showToast('Favorites list updated.', 'success');
        window.renderMarketplaceGrid();
      };

      // Populate preview body sections
      const previewBody = document.getElementById('market-template-preview-body');
      previewBody.innerHTML = t.layoutPreview.sections.map(sec => `
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 6px; padding: 0.6rem; border-left: 2px solid var(--accent-cyan);">
          <span style="font-weight: bold; color: var(--accent-cyan); display: block; margin-bottom: 0.25rem; font-size: 0.72rem; text-transform: uppercase;">${sec.label}</span>
          <p style="white-space: pre-wrap; font-size: 0.74rem; color: var(--text-secondary); line-height: 1.4;">${sec.body}</p>
        </div>
      `).join('');

      // Populate targets select project manager
      const projectSelect = document.getElementById('market-template-project-select');
      const projects = window.Nexeta.ProjectManager ? window.Nexeta.ProjectManager.getProjects() : [];
      
      if (projects.length === 0) {
        projectSelect.innerHTML = `<option value="">No Active Workspaces Found</option>`;
      } else {
        projectSelect.innerHTML = projects.map(p => `<option value="${p.id}">${p.name} [${p.type}]</option>`).join('');
      }

      // Copy layout button
      const copyBtn = document.getElementById('market-template-modal-copy-btn');
      copyBtn.onclick = () => {
        const fullText = t.layoutPreview.sections.map(sec => `[${sec.label}]\n${sec.body}`).join('\n\n');
        navigator.clipboard.writeText(fullText).then(() => {
          this.showToast('Template layout copied to clipboard!', 'success');
        }).catch(err => {
          console.error('Copy failure', err);
        });
      };

      // Import button
      const importBtn = document.getElementById('market-template-modal-import-btn');
      importBtn.onclick = () => {
        const projectId = projectSelect.value;
        if (!projectId) {
          alert('Please create or select a project workspace first.');
          return;
        }

        if (window.Nexeta.ProjectManager) {
          const res = window.Nexeta.ProjectManager.saveAssetToProject(projectId, {
            type: 'Template Blueprint',
            title: t.name,
            content: {
              primaryText: t.layoutPreview.sections.map(s => s.body).join('\n\n'),
              headlines: [t.name],
              cta: 'Learn More'
            }
          });
          
          if (res) {
            global.logHistory(t.id, 'install');
            this.showToast('Imported template successfully into project assets!', 'success');
            modal.classList.remove('active');
          } else {
            alert('Failed to import. Workspace project could not be loaded.');
          }
        } else {
          alert('Workspace project manager not found.');
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
  window.Nexeta.MarketplaceTemplates = MarketplaceTemplates;
})();
