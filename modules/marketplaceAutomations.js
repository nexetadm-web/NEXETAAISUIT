/**
 * NEXETA AI MARKETING SUITE - Automation Packs Module
 * Renders ready-made automation workflows, visual node pipeline, enable/disable states,
 * and launches a full steps editor before importing to active scheduler lists.
 */
(function() {
  const MarketplaceAutomations = {
    render(container, searchQuery = '', smartFilter = 'all', sortVal = 'trending') {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      let automations = [...db.automations];
      const installed = global.getInstalledItems();
      const enabled = global.getEnabledItems();

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        automations = automations.filter(a => 
          a.name.toLowerCase().includes(query) || 
          a.desc.toLowerCase().includes(query) || 
          a.trigger.toLowerCase().includes(query) ||
          a.creator.toLowerCase().includes(query)
        );
      }

      // Smart filters
      if (smartFilter === 'installed') {
        automations = automations.filter(a => installed.includes(a.id));
      } else if (smartFilter === 'enabled') {
        automations = automations.filter(a => enabled.includes(a.id));
      } else if (smartFilter === 'verified') {
        automations = automations.filter(a => a.creator.includes('Nexeta') || a.creator.includes('SalesForce'));
      }

      // Sort
      if (sortVal === 'installs' || sortVal === 'trending') {
        automations.sort((a, b) => b.installs - a.installs);
      } else if (sortVal === 'rating') {
        automations.sort((a, b) => b.rating - a.rating);
      }

      if (automations.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
            <i data-lucide="workflow" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.4;"></i>
            <h3>No automation packs found matching filters</h3>
            <p>Modify search keywords or view other categories.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = automations.map(a => {
        const isInstalled = installed.includes(a.id);
        const isEnabled = enabled.includes(a.id);

        // Render visual node pipeline
        const nodesHTML = a.steps.map((s, index) => `
          <div style="display: flex; align-items: center; gap: 4px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 0.35rem 0.5rem; border-radius: 6px; font-size: 0.68rem; display: flex; align-items: center; gap: 4px; color: #fff;">
              <span style="font-weight:bold; color:var(--primary); font-size:0.65rem;">${index+1}</span> ${s.service}
            </div>
            ${index < a.steps.length - 1 ? '<i data-lucide="arrow-right" style="width: 10px; height: 10px; color: var(--text-muted);"></i>' : ''}
          </div>
        `).join('');

        return `
          <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border-color); border-radius: 12px; min-height: 220px; text-align: left;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--success);">
                  <i data-lucide="workflow" style="width: 18px; height: 18px;"></i>
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                  <span style="font-size: 0.65rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 0.15rem 0.35rem; border-radius: 4px;">
                    ★ ${a.rating}
                  </span>
                  <span style="font-size: 0.65rem; color: var(--success); font-weight: bold; background: rgba(16,185,129,0.05); padding: 0.15rem 0.45rem; border-radius: 4px;">
                    ${(a.installs/1000).toFixed(1)}k runs
                  </span>
                </div>
              </div>
              <h4 style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem;">${a.name}</h4>
              <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">By ${a.creator}</span>
              
              <!-- Pipeline Node Preview -->
              <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 8px; margin-bottom: 0.75rem;">
                ${nodesHTML}
              </div>

              <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.5rem;">${a.desc}</p>
            </div>
            
            <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: space-between; align-items: center;">
              <!-- Switch toggle -->
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <label class="switch-container" style="display: inline-flex; align-items: center; cursor: pointer; position: relative;">
                  <input type="checkbox" class="btn-auto-toggle" data-id="${a.id}" ${isEnabled && isInstalled ? 'checked' : ''} ${!isInstalled ? 'disabled' : ''} style="opacity: 0; width: 0; height: 0;">
                  <span class="slider-button" style="position: relative; display: inline-block; width: 28px; height: 16px; background-color: rgba(255,255,255,0.1); border-radius: 16px; transition: .2s; border: 1px solid var(--border-color);">
                    <span class="slider-circle" style="position: absolute; content: ''; height: 10px; width: 10px; left: 2px; bottom: 2px; background-color: var(--text-secondary); border-radius: 50%; transition: .2s; ${isEnabled && isInstalled ? 'transform: translateX(12px); background-color: var(--success);' : ''}"></span>
                  </span>
                </label>
                <span style="font-size: 0.7rem; color: ${isEnabled && isInstalled ? 'var(--success)' : 'var(--text-muted)'}; font-weight: bold;">
                  ${isEnabled && isInstalled ? 'ON' : 'OFF'}
                </span>
              </div>

              <button class="btn btn-outline-subtle btn-auto-edit" data-id="${a.id}" style="padding: 0.4rem 0.75rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="sliders" style="width: 12px; height: 12px;"></i> Edit Steps
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.bindEvents(container);
    },

    bindEvents(container) {
      const global = window.Nexeta.MarketplaceGlobal;

      // Enable/Disable toggles on card
      container.querySelectorAll('.btn-auto-toggle').forEach(input => {
        input.addEventListener('change', () => {
          const id = input.getAttribute('data-id');
          if (input.checked) {
            global.enableItem(id);
            this.showToast('Workflow syndication enabled.', 'success');
          } else {
            global.disableItem(id);
            this.showToast('Workflow syndication disabled.', 'warning');
          }
          this.render(container, document.getElementById('market-search').value, document.getElementById('market-filter-smart').value, document.getElementById('market-filter-sort').value);
        });
      });

      // Edit triggers
      container.querySelectorAll('.btn-auto-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.openEditorModal(id);
        });
      });
    },

    openEditorModal(id) {
      const global = window.Nexeta.MarketplaceGlobal;
      const db = global.getDatabase();
      const a = db.automations.find(x => x.id === id);
      if (!a) return;

      const modal = document.getElementById('market-automation-modal');
      if (!modal) return;

      // Populate text
      document.getElementById('market-auto-modal-title').textContent = a.name;
      document.getElementById('market-auto-modal-desc').textContent = a.desc;
      document.getElementById('market-auto-modal-trigger').textContent = a.trigger;

      // Render editable steps list
      const stepsContainer = document.getElementById('market-auto-steps-list');
      stepsContainer.innerHTML = a.steps.map((s, index) => `
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.3rem;">
            <span style="font-size: 0.7rem; font-weight: bold; color: var(--primary);">STEP ${index+1} / ACTION</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: bold;">Connector: ${s.service}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <div style="flex: 2; display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: 0.62rem; color: var(--text-muted);">Action Title</span>
              <input type="text" class="market-auto-step-name-input" data-index="${index}" value="${s.name}" style="padding: 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.25); color: #fff; font-size: 0.74rem; outline: none;">
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: 0.62rem; color: var(--text-muted);">Integration Adapter</span>
              <select class="market-auto-step-service-select" data-index="${index}" style="padding: 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.3); color: #fff; font-size: 0.72rem; outline: none; cursor: pointer;">
                <option value="${s.service}" selected>${s.service}</option>
                <option value="OpenAI">OpenAI Adapter</option>
                <option value="Claude 3.5 Sonnet">Claude Adapter</option>
                <option value="Gemini 1.5 Pro">Gemini Adapter</option>
                <option value="Slack Channel">Slack Channel</option>
                <option value="Discord Webhook">Discord Channel</option>
                <option value="Shopify Store">Shopify API</option>
                <option value="Airtable DB">Airtable API</option>
              </select>
            </div>
          </div>
        </div>
        ${index < a.steps.length - 1 ? `
          <div style="display: flex; justify-content: center; margin: -0.25rem 0;">
            <i data-lucide="arrow-down" style="width: 14px; height: 14px; color: var(--primary);"></i>
          </div>
        ` : ''}
      `).join('');

      // Status configs
      const installed = global.getInstalledItems();
      const enabled = global.getEnabledItems();
      const isInstalled = installed.includes(a.id);
      const isEnabled = enabled.includes(a.id);

      const toggleBtn = document.getElementById('market-auto-modal-toggle-btn');
      const importBtn = document.getElementById('market-auto-modal-import-btn');

      if (!isInstalled) {
        toggleBtn.style.display = 'none';
        importBtn.textContent = 'Install Workflow';
        importBtn.className = 'btn btn-primary';
      } else {
        toggleBtn.style.display = 'inline-flex';
        toggleBtn.textContent = isEnabled ? 'Disable Workflow' : 'Enable Workflow';
        toggleBtn.className = isEnabled ? 'btn btn-outline-subtle' : 'btn-primary';
        importBtn.textContent = 'Update Workflow';
      }

      toggleBtn.onclick = () => {
        if (isEnabled) {
          global.disableItem(a.id);
          this.showToast('Workflow deactivated.', 'warning');
        } else {
          global.enableItem(a.id);
          this.showToast('Workflow activated.', 'success');
        }
        modal.classList.remove('active');
        window.renderMarketplaceGrid();
      };

      // Import/Save edits
      importBtn.onclick = () => {
        // Collect edited steps
        const nameInputs = stepsContainer.querySelectorAll('.market-auto-step-name-input');
        const serviceSelects = stepsContainer.querySelectorAll('.market-auto-step-service-select');
        
        const updatedSteps = [];
        nameInputs.forEach((input, i) => {
          const index = Number(input.getAttribute('data-index'));
          updatedSteps[index] = {
            name: input.value.trim() || a.steps[index].name,
            service: serviceSelects[i].value
          };
        });

        // Update steps in local state
        a.steps = updatedSteps;

        if (!isInstalled) {
          global.installItem(a.id);
          global.enableItem(a.id);
          this.showToast('Workflow imported and active!', 'success');
        } else {
          global.logHistory(a.id, 'update');
          this.showToast('Workflow configuration updated successfully.', 'success');
        }

        // Integrate with main window.Nexeta.AutomationManager if available
        if (window.Nexeta.AutomationManager) {
          const data = window.Nexeta.AutomationManager.getAutomationData();
          if (data) {
            data.campaignRules.campaignOptimization = true;
            window.Nexeta.AutomationManager.saveAutomationData(data);
          }
        }

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
  window.Nexeta.MarketplaceAutomations = MarketplaceAutomations;
})();
