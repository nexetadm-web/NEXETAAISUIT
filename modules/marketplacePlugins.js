/**
 * NEXETA AI MARKETING SUITE - AI Plugins Module
 * Handles Plugin Store rendering, version selections, ratings, reviews, and toggles.
 */
(function() {
  const MarketplacePlugins = {
    render(container, searchQuery = '', smartFilter = 'all', sortVal = 'trending') {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      let plugins = [...db.plugins];
      const installed = global.getInstalledItems();
      const enabled = global.getEnabledItems();
      const favs = global.getFavorites();

      // Show Featured section if search is empty
      const featuredSec = document.getElementById('market-featured-section');
      const featuredGrid = document.getElementById('market-featured-grid');
      if (featuredSec && featuredGrid && searchQuery === '') {
        featuredSec.style.display = 'block';
        // Featured = plugins with rating >= 4.8
        const featured = plugins.filter(p => p.rating >= 4.8).slice(0, 3);
        featuredGrid.innerHTML = featured.map(p => this.createCardHTML(p, installed, enabled, true)).join('');
      }

      // Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        plugins = plugins.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.desc.toLowerCase().includes(query) || 
          p.creator.toLowerCase().includes(query) || 
          p.category.toLowerCase().includes(query)
        );
      }

      if (smartFilter === 'installed') {
        plugins = plugins.filter(p => installed.includes(p.id));
      } else if (smartFilter === 'enabled') {
        plugins = plugins.filter(p => enabled.includes(p.id));
      } else if (smartFilter === 'favorites') {
        plugins = plugins.filter(p => favs.includes(p.id));
      } else if (smartFilter === 'verified') {
        plugins = plugins.filter(p => p.creatorId.startsWith('c-'));
      }

      // Sort
      if (sortVal === 'installs' || sortVal === 'trending') {
        plugins.sort((a, b) => b.installs - a.installs);
      } else if (sortVal === 'rating') {
        plugins.sort((a, b) => b.rating - a.rating);
      } else if (sortVal === 'newest') {
        plugins.sort((a, b) => new Date(b.updated) - new Date(a.updated));
      }

      if (plugins.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
            <i data-lucide="toy-brick" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.4;"></i>
            <h3>No plugins match your filter</h3>
            <p>Try refining your search term or select another filter category.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = plugins.map(p => this.createCardHTML(p, installed, enabled, false)).join('');
      this.bindEvents(container);
    },

    createCardHTML(p, installed, enabled, isFeatured = false) {
      const isInstalled = installed.includes(p.id);
      const isEnabled = enabled.includes(p.id);
      
      const badgeHTML = isFeatured 
        ? `<span style="font-size: 0.65rem; color: var(--warning); font-weight: bold; background: rgba(245,158,11,0.1); padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;"><i data-lucide="sparkles" style="width: 10px; height: 10px;"></i> Featured</span>`
        : `<span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: bold; background: rgba(255,255,255,0.03); padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;"><i data-lucide="download" style="width: 10px; height: 10px;"></i> ${(p.installs / 1000).toFixed(1)}k</span>`;

      return `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; min-height: 220px; text-align: left;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                <i data-lucide="${p.icon || 'zap'}" style="width: 18px; height: 18px;"></i>
              </div>
              <div style="display: flex; gap: 4px; align-items: center;">
                <span style="font-size: 0.65rem; color: var(--warning); font-weight: bold; background: rgba(245,158,11,0.05); padding: 0.15rem 0.35rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;">
                  ★ ${p.rating}
                </span>
                ${badgeHTML}
              </div>
            </div>
            <h4 style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem;">${p.name}</h4>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">By ${p.creator} • <span style="color: var(--accent-cyan); font-weight: bold;">${p.category}</span></span>
            <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${p.desc}</p>
          </div>
          <div style="margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: space-between; align-items: center;">
            <button class="btn btn-outline-subtle btn-plugin-detail" data-id="${p.id}" style="padding: 0.4rem 0.75rem; font-size: 0.72rem;">
              Configure
            </button>
            <button class="btn ${isInstalled ? 'btn-outline-subtle' : 'btn-primary'} btn-plugin-install" data-id="${p.id}" style="padding: 0.4rem 0.85rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">
              ${isInstalled 
                ? (isEnabled ? '<i data-lucide="check-circle" style="color: var(--success); width: 12px; height: 12px;"></i> Active' : '<i data-lucide="minus-circle" style="color: var(--text-muted); width: 12px; height: 12px;"></i> Off') 
                : '<i data-lucide="plus" style="width: 12px; height: 12px;"></i> Install'}
            </button>
          </div>
        </div>
      `;
    },

    bindEvents(container) {
      // Install triggers
      container.querySelectorAll('.btn-plugin-install').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          this.toggleInstall(id);
        });
      });

      // Detail triggers
      container.querySelectorAll('.btn-plugin-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          this.openDetailModal(id);
        });
      });

      // Bind also to featured section
      const featuredGrid = document.getElementById('market-featured-grid');
      if (featuredGrid) {
        featuredGrid.querySelectorAll('.btn-plugin-install').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            this.toggleInstall(id);
          });
        });

        featuredGrid.querySelectorAll('.btn-plugin-detail').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            this.openDetailModal(id);
          });
        });
      }
    },

    toggleInstall(id) {
      const global = window.Nexeta.MarketplaceGlobal;
      const installed = global.getInstalledItems();
      const isInstalled = installed.includes(id);

      if (isInstalled) {
        if (confirm('Uninstall this plugin and wipe associated local caching profiles?')) {
          global.uninstallItem(id);
          this.showToast('Plugin uninstalled.', 'error');
        }
      } else {
        global.installItem(id);
        global.enableItem(id); // Auto-enable on initial install
        this.showToast('Plugin installed and activated.', 'success');
      }
      window.renderMarketplaceGrid();
    },

    openDetailModal(id) {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      const p = db.plugins.find(x => x.id === id);
      if (!p) return;

      const modal = document.getElementById('market-plugin-modal');
      if (!modal) return;

      // Populate text fields
      document.getElementById('market-plugin-modal-title').textContent = p.name;
      document.getElementById('market-plugin-modal-developer').textContent = p.creator;
      document.getElementById('market-plugin-modal-updated').textContent = p.updated;
      document.getElementById('market-plugin-modal-desc').textContent = p.desc;
      document.getElementById('market-plugin-modal-rating').textContent = p.rating;
      document.getElementById('market-plugin-reviews-count').textContent = p.reviewsCount || p.rating * 5; // Sim fallback
      
      const iconContainer = document.getElementById('market-plugin-modal-icon-container');
      if (iconContainer) {
        iconContainer.innerHTML = `<i data-lucide="${p.icon || 'zap'}" style="width:24px; height:24px;"></i>`;
      }

      // Populate version selector
      const versionSelect = document.getElementById('market-plugin-version-select');
      versionSelect.innerHTML = p.versions.map(v => `<option value="${v}">${v}</option>`).join('');
      versionSelect.onchange = () => {
        global.logHistory(p.id, 'update');
        this.showToast(`Switched active environment to version v${versionSelect.value}`, 'success');
        global.logAnalytics('Version Changed', `Switched plugin ${p.id} to version ${versionSelect.value}.`);
      };

      // Populate toggle switches
      const installed = global.getInstalledItems();
      const enabled = global.getEnabledItems();
      const isInstalled = installed.includes(p.id);
      const isEnabled = enabled.includes(p.id);

      const enableToggle = document.getElementById('market-plugin-enable-toggle');
      const statusText = document.getElementById('market-plugin-status-text');

      // Sync toggles state
      enableToggle.checked = isEnabled && isInstalled;
      statusText.textContent = isInstalled ? (isEnabled ? 'Active' : 'Disabled') : 'Not Installed';
      statusText.style.color = isInstalled ? (isEnabled ? 'var(--success)' : 'var(--text-muted)') : 'var(--error)';

      if (!isInstalled) {
        enableToggle.disabled = true;
      } else {
        enableToggle.disabled = false;
        enableToggle.onclick = () => {
          if (enableToggle.checked) {
            global.enableItem(p.id);
            statusText.textContent = 'Active';
            statusText.style.color = 'var(--success)';
            this.showToast('Plugin enabled.', 'success');
          } else {
            global.disableItem(p.id);
            statusText.textContent = 'Disabled';
            statusText.style.color = 'var(--text-muted)';
            this.showToast('Plugin disabled.', 'warning');
          }
          window.renderMarketplaceGrid();
        };
      }

      // Primary action button
      const actionBtn = document.getElementById('market-plugin-modal-action-btn');
      actionBtn.className = `btn ${isInstalled ? 'btn-outline-subtle' : 'btn-primary'}`;
      actionBtn.innerHTML = isInstalled 
        ? '<i data-lucide="trash-2" style="width:14px; height:14px; color:var(--error);"></i> Uninstall Plugin' 
        : '<i data-lucide="plus" style="width:14px; height:14px;"></i> Install Plugin';
      
      actionBtn.onclick = () => {
        this.toggleInstall(p.id);
        modal.classList.remove('active');
      };

      // Bind submit review form
      let selectedRating = 5;
      const reviewStars = document.querySelectorAll('.market-review-star-btn');
      const starsLabel = document.getElementById('market-review-stars-label');
      
      const updateStarsDisplay = (score) => {
        selectedRating = score;
        starsLabel.textContent = `${score} star${score > 1 ? 's' : ''}`;
        reviewStars.forEach((star, index) => {
          if (index < score) {
            star.style.color = 'var(--warning)';
            star.style.fill = 'var(--warning)';
          } else {
            star.style.color = 'var(--text-muted)';
            star.style.fill = 'none';
          }
        });
      };

      updateStarsDisplay(5); // Default to 5 stars
      reviewStars.forEach(star => {
        star.onclick = () => {
          updateStarsDisplay(Number(star.getAttribute('data-value')));
        };
      });

      const commentInput = document.getElementById('market-review-comment');
      const submitBtn = document.getElementById('market-review-submit-btn');

      commentInput.value = ''; // Reset comment
      submitBtn.onclick = () => {
        const comment = commentInput.value.trim();
        if (!comment) {
          alert('Please enter a review comment.');
          return;
        }

        global.addReview(p.id, {
          reviewer: 'Sarah Jenkins (You)',
          rating: selectedRating,
          comment: comment
        });

        commentInput.value = '';
        updateStarsDisplay(5);
        
        // Reload reviews and rating scores
        document.getElementById('market-plugin-modal-rating').textContent = p.rating;
        document.getElementById('market-plugin-reviews-count').textContent = p.reviewsCount;
        this.renderReviewsList(p.id);
        this.showToast('Thank you! Review added successfully.', 'success');
        window.renderMarketplaceGrid();
      };

      this.renderReviewsList(p.id);
      
      if (window.lucide) window.lucide.createIcons();
      modal.classList.add('active');
    },

    renderReviewsList(itemId) {
      const global = window.Nexeta.MarketplaceGlobal;
      const reviews = global.getReviews(itemId);
      const listContainer = document.getElementById('market-plugin-reviews-list');
      
      if (reviews.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem; font-size: 0.74rem;">No reviews yet. Be the first to review!</div>`;
        return;
      }

      listContainer.innerHTML = reviews.map(r => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          stars += `<i data-lucide="star" style="width:10px; height:10px; fill:${i <= r.rating ? 'var(--warning)' : 'none'}; color:${i <= r.rating ? 'var(--warning)' : 'var(--text-muted)'};"></i>`;
        }
        return `
          <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 6px; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <span style="font-weight: bold; color: #fff;">${r.reviewer}</span>
              <div style="display: flex; gap: 1px;">${stars}</div>
            </div>
            <p style="color: var(--text-secondary); line-height: 1.3;">${r.comment}</p>
            <span style="color: var(--text-muted); font-size: 0.62rem; display: block; margin-top: 4px;">${r.date}</span>
          </div>
        `;
      }).join('');
      
      if (window.lucide) window.lucide.createIcons();
    },

    showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.style.background = 'var(--card-bg-solid)';
      toast.style.borderLeft = `4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--warning)'}`;
      toast.style.color = '#fff';
      toast.style.padding = '0.75rem 1.25rem';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
      toast.style.fontSize = '0.8rem';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.gap = '8px';
      toast.style.minWidth = '220px';
      toast.style.transition = 'all 0.3s ease';
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      toast.style.pointerEvents = 'auto';

      let icon = 'check-circle';
      if (type === 'error') icon = 'x-circle';
      else if (type === 'warning') icon = 'alert-triangle';

      toast.innerHTML = `<i data-lucide="${icon}" style="width: 16px; height: 16px; color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--warning)'}"></i> <span>${message}</span>`;
      container.appendChild(toast);

      if (window.lucide) window.lucide.createIcons();

      // Animate in
      setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      }, 50);

      // Animate out
      setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.MarketplacePlugins = MarketplacePlugins;
})();
