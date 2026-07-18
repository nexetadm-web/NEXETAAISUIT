/**
 * NEXETA AI MARKETING SUITE - Community Assets Module
 * Renders user-contributed templates, plugins, prompts. Handles uploads,
 * downloads counts, creator profiles modal, and creator follow status.
 */
(function() {
  const MarketplaceCommunity = {
    render(container, searchQuery = '', smartFilter = 'all', sortVal = 'trending') {
      const global = window.Nexeta.MarketplaceGlobal;
      const community = global.getCommunityAssets();
      let assets = [...community];
      const favs = global.getFavorites();

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        assets = assets.filter(a => 
          a.name.toLowerCase().includes(query) || 
          a.desc.toLowerCase().includes(query) || 
          a.creator.toLowerCase().includes(query) ||
          a.type.toLowerCase().includes(query)
        );
      }

      // Smart Filters
      if (smartFilter === 'favorites') {
        assets = assets.filter(a => favs.includes(a.id));
      } else if (smartFilter === 'verified') {
        assets = assets.filter(a => a.creatorId.startsWith('u-design') || a.creatorId.startsWith('u-marie'));
      }

      // Sort
      if (sortVal === 'installs' || sortVal === 'trending') {
        assets.sort((a, b) => b.downloads - a.downloads);
      } else if (sortVal === 'rating') {
        assets.sort((a, b) => b.rating - a.rating);
      } else if (sortVal === 'newest') {
        assets.sort((a, b) => b.updated.localeCompare(a.updated));
      }

      if (assets.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
            <i data-lucide="users-2" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.4;"></i>
            <h3>No community assets match your filter</h3>
            <p>Publish your own custom scripts by clicking "Share Asset" above.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = assets.map(a => {
        const isFav = favs.includes(a.id);
        const typeLabel = a.type === 'templates' ? 'Template' : a.type === 'prompts' ? 'Prompt' : 'Plugin';
        const typeColor = a.type === 'templates' ? 'var(--accent-cyan)' : a.type === 'prompts' ? '#a78bfa' : 'var(--primary)';

        return `
          <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; min-height: 220px; text-align: left;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <span style="font-size: 0.62rem; font-weight: 700; color: #fff; background: ${typeColor}; padding: 0.15rem 0.45rem; border-radius: 4px; text-transform: uppercase;">
                  ${typeLabel}
                </span>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <span style="font-size: 0.65rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 0.15rem 0.35rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;">
                    ★ ${a.rating}
                  </span>
                  <span style="font-size: 0.65rem; color: var(--text-secondary); background: rgba(255,255,255,0.03); padding: 0.15rem 0.35rem; border-radius: 4px;">
                    ${a.downloads >= 1000 ? (a.downloads/1000).toFixed(1)+'k' : a.downloads} dl
                  </span>
                </div>
              </div>
              <h4 style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem;">${a.name}</h4>
              
              <!-- Creator profile click trigger -->
              <span class="market-creator-link" data-creator-id="${a.creatorId || 'u-default'}" data-creator-name="${a.creator}" style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem; cursor: pointer; transition: 0.2s;">
                By <span style="color: var(--primary); font-weight: bold; text-decoration: underline;">${a.creator}</span>
              </span>

              <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${a.desc}</p>
            </div>
            <div style="margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center;">
              <button class="btn btn-outline-subtle btn-com-favorite" data-id="${a.id}" style="padding: 0.4rem; border-radius: 6px;">
                <i data-lucide="heart" style="width: 14px; height: 14px; fill: ${isFav ? 'var(--error)' : 'none'}; color: ${isFav ? 'var(--error)' : 'var(--text-secondary)'}"></i>
              </button>
              <button class="btn btn-primary btn-com-download" data-id="${a.id}" style="padding: 0.4rem 0.85rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="download" style="width: 12px; height: 12px;"></i> Download
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.bindEvents(container);
    },

    bindEvents(container) {
      const global = window.Nexeta.MarketplaceGlobal;

      // Click downloads
      container.querySelectorAll('.btn-com-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          this.downloadAsset(id);
        });
      });

      // Favorites
      container.querySelectorAll('.btn-com-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const isFav = global.toggleFavorite(id);
          this.showToast(isFav ? 'Added to favorites.' : 'Removed from favorites.', 'success');
          this.render(container, document.getElementById('market-search').value, document.getElementById('market-filter-smart').value, document.getElementById('market-filter-sort').value);
        });
      });

      // Creator Links
      container.querySelectorAll('.market-creator-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.stopPropagation();
          const creatorId = link.getAttribute('data-creator-id');
          const creatorName = link.getAttribute('data-creator-name');
          this.openCreatorModal(creatorId, creatorName);
        });
      });

      // Wire Upload form submit once
      const submitBtn = document.getElementById('market-upload-submit-btn');
      if (submitBtn) {
        submitBtn.onclick = () => {
          const name = document.getElementById('market-upload-name').value.trim();
          const type = document.getElementById('market-upload-type').value;
          const desc = document.getElementById('market-upload-desc').value.trim();
          const creator = document.getElementById('market-upload-creator').value.trim();

          if (!name || !desc || !creator) {
            alert('Please fill out all fields before publishing.');
            return;
          }

          const newAsset = global.uploadCommunityAsset({
            name,
            type,
            desc,
            creator,
            creatorId: 'u-' + creator.toLowerCase().replace(/\s+/g, '')
          });

          // Reset forms
          document.getElementById('market-upload-name').value = '';
          document.getElementById('market-upload-desc').value = '';
          
          document.getElementById('market-upload-modal').classList.remove('active');
          this.showToast('Community asset published successfully!', 'success');
          
          // Re-render
          window.renderMarketplaceGrid();
        };
      }
    },

    downloadAsset(id) {
      const global = window.Nexeta.MarketplaceGlobal;
      const assets = global.getCommunityAssets();
      const a = assets.find(x => x.id === id);
      if (a) {
        a.downloads++;
        global.installItem(a.id);
        this.showToast(`Imported ${a.name} into local sandbox.`, 'success');
        window.renderMarketplaceGrid();
      }
    },

    openCreatorModal(creatorId, creatorName) {
      const global = window.Nexeta.MarketplaceGlobal;
      const modal = document.getElementById('market-creator-modal');
      if (!modal) return;

      document.getElementById('market-creator-name').textContent = creatorName;
      document.getElementById('market-creator-avatar').textContent = creatorName.charAt(0);
      
      const taglines = {
        'u-designgrid': 'Grids, frameworks, and responsive Figma components',
        'u-marienotion': 'Certified Notion workspaces and content pipeline setups',
        'u-sopgrow': 'Shopify optimization, email automations, and catalogs sync',
        'u-wfhacks': 'Webflow CMS scripts, API syncing tools, and localization'
      };
      document.getElementById('market-creator-tagline').textContent = taglines[creatorId] || 'Independent Community Creator';

      // Follow toggle status
      const followBtn = document.getElementById('market-creator-follow-btn');
      const followersLabel = document.getElementById('market-creator-followers');
      
      const updateFollowState = () => {
        const follows = global.getFollowedCreators();
        const isFollowing = follows.includes(creatorId);
        
        followBtn.textContent = isFollowing ? 'Following' : 'Follow Creator';
        followBtn.className = `btn ${isFollowing ? 'btn-outline-subtle' : 'btn-primary'}`;
        
        // Sim base followers + 1 if following
        const baseFollowers = creatorId === 'u-marienotion' ? 1240 : creatorId === 'u-designgrid' ? 840 : 150;
        followersLabel.textContent = isFollowing ? baseFollowers + 1 : baseFollowers;
      };
      updateFollowState();

      followBtn.onclick = () => {
        global.toggleFollowCreator(creatorId);
        updateFollowState();
        this.showToast('Follow state updated.', 'success');
      };

      // Sim downloads count & avg rating
      const baseDls = creatorId === 'u-marienotion' ? '24.5k' : creatorId === 'u-designgrid' ? '14.8k' : '2.1k';
      document.getElementById('market-creator-downloads').textContent = baseDls;
      
      const baseRating = creatorId === 'u-marienotion' ? '★ 4.9' : '★ 4.7';
      document.getElementById('market-creator-rating').textContent = baseRating;

      // Populate list of other assets published
      const assets = global.getCommunityAssets();
      const creatorAssets = assets.filter(a => a.creatorId === creatorId || a.creator === creatorName);
      
      const assetsContainer = document.getElementById('market-creator-assets-list');
      if (creatorAssets.length === 0) {
        assetsContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">No other assets published.</span>`;
      } else {
        assetsContainer.innerHTML = creatorAssets.map(a => `
          <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
            <div>
              <span style="font-weight: bold; color: #fff;">${a.name}</span>
              <span style="font-size:0.65rem; color:var(--text-muted); display:block;">Downloads: ${a.downloads}</span>
            </div>
            <button class="btn btn-outline-subtle btn-creator-asset-dl" data-id="${a.id}" style="padding: 0.25rem 0.5rem; font-size:0.68rem;">Get</button>
          </div>
        `).join('');
        
        assetsContainer.querySelectorAll('.btn-creator-asset-dl').forEach(btn => {
          btn.onclick = () => {
            const id = btn.getAttribute('data-id');
            this.downloadAsset(id);
            modal.classList.remove('active');
          };
        });
      }

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
  window.Nexeta.MarketplaceCommunity = MarketplaceCommunity;
})();
