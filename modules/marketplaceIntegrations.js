/**
 * NEXETA AI MARKETING SUITE - Integrations Center Module
 * Manages connections, credentials configurations, permissions checkboxes,
 * sync interval scheduling, and connection tester console log simulators.
 */
(function() {
  const MarketplaceIntegrations = {
    render(container, searchQuery = '', smartFilter = 'all', sortVal = 'trending') {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      let integrations = [...db.integrations];
      const configs = global.getIntegrationConfigs();
      const installed = global.getInstalledItems();

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        integrations = integrations.filter(int => 
          int.name.toLowerCase().includes(query) || 
          int.desc.toLowerCase().includes(query) || 
          int.category.toLowerCase().includes(query)
        );
      }

      // Smart Filters
      if (smartFilter === 'installed') {
        integrations = integrations.filter(int => configs[int.id] && configs[int.id].connected);
      } else if (smartFilter === 'enabled') {
        integrations = integrations.filter(int => configs[int.id] && configs[int.id].connected && installed.includes(int.id));
      }

      // Sort
      if (sortVal === 'newest') {
        integrations.sort((a, b) => b.name.localeCompare(a.name));
      } else {
        // Sort by connection status: connected first
        integrations.sort((a, b) => {
          const aConn = configs[a.id] && configs[a.id].connected ? 1 : 0;
          const bConn = configs[b.id] && configs[b.id].connected ? 1 : 0;
          return bConn - aConn;
        });
      }

      if (integrations.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
            <i data-lucide="cable" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.4;"></i>
            <h3>No integrations match your search criteria</h3>
            <p>Try clearing filters to search the full list of 17 service adapters.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = integrations.map(int => {
        const config = configs[int.id] || { connected: false };
        const isConnected = config.connected;

        const badgeHTML = isConnected
          ? `<span style="font-size: 0.65rem; color: var(--success); font-weight: bold; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--success); display: inline-block; animation: pulse-glow 1.5s infinite;"></span> Connected
             </span>`
          : `<span style="font-size: 0.65rem; color: var(--text-muted); font-weight: bold; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 0.15rem 0.45rem; border-radius: 4px;">
              Disconnected
             </span>`;

        return `
          <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; min-height: 200px; text-align: left;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                  <i data-lucide="${int.icon || 'cable'}" style="width: 18px; height: 18px;"></i>
                </div>
                ${badgeHTML}
              </div>
              <h4 style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem;">${int.name}</h4>
              <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">Category: <span style="color: var(--primary); font-weight: bold;">${int.category}</span></span>
              <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${int.desc}</p>
            </div>
            <div style="margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-primary btn-int-connect" data-id="${int.id}" style="padding: 0.45rem 0.85rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">
                ${isConnected ? '<i data-lucide="settings" style="width: 12px; height: 12px;"></i> Configure' : '<i data-lucide="plus" style="width: 12px; height: 12px;"></i> Connect'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.bindEvents(container);
    },

    bindEvents(container) {
      container.querySelectorAll('.btn-int-connect').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.openSetupModal(id);
        });
      });
    },

    openSetupModal(id) {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      const int = db.integrations.find(x => x.id === id);
      if (!int) return;

      const modal = document.getElementById('market-integration-modal');
      if (!modal) return;

      const configs = global.getIntegrationConfigs();
      const config = configs[id] || { connected: false, apiKey: '', syncSchedule: 'hourly', permissions: ['read'] };

      // Set titles
      document.getElementById('market-int-modal-title').textContent = int.name;
      document.getElementById('market-int-modal-category').textContent = `Category: ${int.category}`;
      
      const iconContainer = document.getElementById('market-int-modal-icon-container');
      if (iconContainer) {
        iconContainer.innerHTML = `<i data-lucide="${int.icon || 'cable'}" style="width:24px; height:24px;"></i>`;
      }

      // Sync status badge in modal
      const updateModalBadge = (connectedState) => {
        const badge = document.getElementById('market-int-modal-status-badge');
        if (connectedState) {
          badge.textContent = 'Connected';
          badge.style.background = 'rgba(16,185,129,0.1)';
          badge.style.color = 'var(--success)';
          badge.style.border = '1px solid rgba(16,185,129,0.2)';
        } else {
          badge.textContent = 'Disconnected';
          badge.style.background = 'rgba(255,255,255,0.03)';
          badge.style.color = 'var(--text-muted)';
          badge.style.border = '1px solid var(--border-color)';
        }
      };
      updateModalBadge(config.connected);

      // Populate input credentials
      const keyInput = document.getElementById('market-int-api-key');
      const disconnectBtn = document.getElementById('market-int-btn-disconnect');
      const testBtn = document.getElementById('market-int-btn-test');
      const saveBtn = document.getElementById('market-int-btn-save');
      const syncSelect = document.getElementById('market-int-sync-schedule');
      
      const scopeRead = document.getElementById('market-int-scope-read');
      const scopeWrite = document.getElementById('market-int-scope-write');

      keyInput.value = config.apiKey;
      syncSelect.value = config.syncSchedule || 'hourly';
      scopeRead.checked = config.permissions.includes('read');
      scopeWrite.checked = config.permissions.includes('write');

      // Console logger reset
      const consoleLog = document.getElementById('market-int-test-console');
      consoleLog.style.display = 'none';
      consoleLog.innerHTML = '';

      if (!config.connected) {
        disconnectBtn.style.display = 'none';
      } else {
        disconnectBtn.style.display = 'inline-flex';
        disconnectBtn.onclick = () => {
          if (confirm(`Disconnect from ${int.name}? All active synchronization hooks will be removed.`)) {
            global.saveIntegrationConfig(id, { connected: false, apiKey: '' });
            global.uninstallItem(id);
            this.showToast('Integration disconnected.', 'error');
            modal.classList.remove('active');
            window.renderMarketplaceGrid();
          }
        };
      }

      // Test Connection simulator
      testBtn.onclick = () => {
        const key = keyInput.value.trim();
        if (!key) {
          alert('Please enter a valid API key or credential token first.');
          return;
        }

        consoleLog.style.display = 'block';
        consoleLog.innerHTML = '<span style="color: var(--text-muted);">[info] Initializing handshake pipeline...</span>';
        
        let step = 0;
        const steps = [
          `[info] Connecting to secure endpoint api.nexeta.ai/v1/adapters/${id}...`,
          `[info] Validating authorization token headers: ${key.slice(0, 4)}•••••••`,
          `[info] Testing credential read/write operations...`,
          `[success] Connection established successfully! Latency: ${Math.floor(Math.random()*45+15)}ms`
        ];

        const logInterval = setInterval(() => {
          if (step < steps.length) {
            consoleLog.innerHTML += `<br>${steps[step]}`;
            consoleLog.scrollTop = consoleLog.scrollHeight; // Auto-scroll
            step++;
          } else {
            clearInterval(logInterval);
            global.logHistory(id, 'connect');
            this.showToast('API Connection verified!', 'success');
          }
        }, 800);
      };

      // Save settings
      saveBtn.onclick = () => {
        const keyVal = keyInput.value.trim();
        if (!keyVal) {
          alert('API key or OAuth token cannot be empty.');
          return;
        }

        const permissions = [];
        if (scopeRead.checked) permissions.push('read');
        if (scopeWrite.checked) permissions.push('write');

        global.saveIntegrationConfig(id, {
          connected: true,
          apiKey: keyVal,
          syncSchedule: syncSelect.value,
          permissions: permissions
        });

        // Also add to installed list to keep sync
        global.installItem(id);
        global.enableItem(id);

        this.showToast('Integration configuration updated.', 'success');
        modal.classList.remove('active');
        window.renderMarketplaceGrid();
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
  window.Nexeta.MarketplaceIntegrations = MarketplaceIntegrations;
})();
