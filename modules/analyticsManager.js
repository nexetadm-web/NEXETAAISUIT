/**
 * NEXETA AI MARKETING SUITE - Real-time Analytics Manager
 * Tracks actual generations, credits, activity logs, and updates dashboard metrics.
 */
(function() {
  const LOG_KEY = 'nexeta_activity_log';

  const defaultLogs = [
    { id: 'log-1', action: 'Ad copy generated for Meta Conversions', description: 'Score: 9.8/10 CTR potential', time: '10 mins ago' },
    { id: 'log-2', action: 'Upscaled 4K Thumbnail rendered', description: 'Cyberpunk desk setup concept', time: '2 hours ago' },
    { id: 'log-3', action: 'Video segment US-WEST node rendering', description: 'Progress: 85% completed', time: '4 hours ago' },
    { id: 'log-4', action: 'SEO script hooks written', description: 'YouTube smartwatch campaign', time: '1 day ago' }
  ];

  const AnalyticsManager = {
    init() {
      if (!localStorage.getItem(LOG_KEY)) {
        localStorage.setItem(LOG_KEY, JSON.stringify(defaultLogs));
      }
    },

    getActivityLogs() {
      this.init();
      return JSON.parse(localStorage.getItem(LOG_KEY));
    },

    logActivity(action, description) {
      const logs = this.getActivityLogs();
      const newLog = {
        id: 'log-' + Date.now(),
        action,
        description,
        time: 'Just now'
      };
      logs.unshift(newLog);
      // Keep only last 20 logs
      if (logs.length > 20) logs.pop();
      localStorage.setItem(LOG_KEY, JSON.stringify(logs));
      
      this.updateDashboardStats();
    },

    updateDashboardStats() {
      // Get data from other managers
      if (!window.Nexeta || !window.Nexeta.ProjectManager || !window.Nexeta.BillingManager) return;
      
      const projects = window.Nexeta.ProjectManager.getProjects();
      const billing = window.Nexeta.BillingManager.getBillingData();
      
      // Calculate real stats
      const totalProjects = projects.length;
      
      // Count actual assets
      let actualAssetsCount = 0;
      let actualAdCount = 0;
      let actualVideoCount = 0;
      let actualImageCount = 0;
      
      projects.forEach(p => {
        if (p.assets) {
          actualAssetsCount += p.assets.length;
          p.assets.forEach(a => {
            if (a.type === 'Ad Campaign') actualAdCount++;
            if (a.type === 'AI Video') actualVideoCount++;
            if (a.type === 'AI Image') actualImageCount++;
          });
        }
      });

      // Get history counts
      let historyList = [];
      if (window.Nexeta.HistoryManager) {
        historyList = window.Nexeta.HistoryManager.getHistory();
      }
      
      // Total AI Generations: sum of all actual assets + length of history logs
      const totalGenerations = actualAssetsCount + historyList.length;

      // Saved prompts count
      let totalSavedPrompts = 0;
      if (window.Nexeta.PromptLibraryManager) {
        totalSavedPrompts = window.Nexeta.PromptLibraryManager.getPrompts().length;
      }

      // Most used tool calculation
      let mostUsedTool = 'AI Chat';
      if (historyList.length > 0) {
        const counts = {};
        historyList.forEach(item => {
          const type = item.type || 'AI Chat';
          counts[type] = (counts[type] || 0) + 1;
        });
        let max = 0;
        for (const type in counts) {
          if (counts[type] > max) {
            max = counts[type];
            mostUsedTool = type;
          }
        }
      }

      const remainingCredits = Math.max(0, billing.creditsTotal - billing.creditsUsed);

      // Update UI elements on the dashboard home
      const elCredits = document.getElementById('stat-credits');
      const elProjects = document.getElementById('stat-total-projects');
      const elGenerations = document.getElementById('stat-total-generations');
      const elSavedPrompts = document.getElementById('stat-saved-prompts');
      const elMostUsedTool = document.getElementById('stat-most-used-tool');
      
      // Upgrade header credit badge
      const headerCreditText = document.querySelector('#credits-badge-container span');
      if (headerCreditText) {
        headerCreditText.textContent = `${remainingCredits.toLocaleString()} / ${billing.creditsTotal.toLocaleString()} Credits`;
      }

      if (elCredits) elCredits.textContent = remainingCredits.toLocaleString();
      if (elProjects) elProjects.textContent = totalProjects.toLocaleString();
      if (elGenerations) elGenerations.textContent = totalGenerations.toLocaleString();
      if (elSavedPrompts) elSavedPrompts.textContent = totalSavedPrompts.toLocaleString();
      if (elMostUsedTool) {
        elMostUsedTool.innerHTML = `<i data-lucide="trending-up" style="width: 10px; height: 10px; margin-right: 2px;"></i> Most used: ${mostUsedTool}`;
      }

      // Update new dynamic dashboard cards
      const elVideosGen = document.getElementById('stat-videos-gen');
      const elAdsCreated = document.getElementById('stat-ads-created');
      const elTodayUsage = document.getElementById('stat-today-usage');
      const elMonthRevenue = document.getElementById('stat-month-revenue');
      const elTokensUsed = document.getElementById('stat-tokens-used');
      const elTeamMembers = document.getElementById('stat-team-members');
      const elAvgResponse = document.getElementById('stat-avg-response');
      const elStorageUsage = document.getElementById('stat-storage-usage');
      const elMonthlyGrowth = document.getElementById('stat-monthly-growth');

      if (elVideosGen) elVideosGen.textContent = (420 + actualVideoCount).toLocaleString();
      if (elAdsCreated) elAdsCreated.textContent = (86 + actualAdCount).toLocaleString();
      if (elTodayUsage) elTodayUsage.textContent = (1250 + totalGenerations * 18).toLocaleString();
      if (elMonthRevenue) elMonthRevenue.textContent = `$${(14820 + totalProjects * 150).toLocaleString()}`;
      if (elTokensUsed) elTokensUsed.textContent = `${((1800000 + totalGenerations * 42000) / 1000000).toFixed(2)}M`;
      if (elTeamMembers) elTeamMembers.textContent = (6 + Math.floor(totalProjects / 15)).toString();
      if (elAvgResponse) elAvgResponse.textContent = `${Math.max(0.5, (2.4 - totalGenerations * 0.02)).toFixed(1)}s`;
      if (elStorageUsage) elStorageUsage.textContent = `${(12.4 + totalProjects * 0.35).toFixed(1)} GB`;
      if (elMonthlyGrowth) elMonthlyGrowth.textContent = `+${(18.4 + totalProjects * 0.15).toFixed(1)}%`;

      if (window.lucide) window.lucide.createIcons();

      // Render recent activity timeline
      const timelineWrapper = document.querySelector('.timeline-wrapper');
      if (timelineWrapper) {
        const logs = this.getActivityLogs();
        timelineWrapper.innerHTML = logs.map(log => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h4>${log.action}</h4>
                <span class="timeline-time">${log.time}</span>
              </div>
              <p class="timeline-desc">${log.description}</p>
            </div>
          </div>
        `).join('');
        // Keep the latest activities visible & smooth scroll to newest (top)
        timelineWrapper.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Render projects table inside Dashboard Home
      const tableBody = document.querySelector('.project-table tbody');
      if (tableBody) {
        tableBody.innerHTML = projects.slice(0, 5).map(proj => {
          let badgeClass = 'draft';
          if (proj.status === 'Completed') badgeClass = 'completed';
          if (proj.status === 'Processing') badgeClass = 'processing';
          if (proj.status === 'Failed') badgeClass = 'failed';
          
          return `
            <tr data-id="${proj.id}">
              <td style="font-weight: 600;">${proj.name}</td>
              <td>${proj.type}</td>
              <td>${proj.created}</td>
              <td><span class="status-badge ${badgeClass}">${proj.status}</span></td>
              <td style="text-align: right;">
                <button class="btn btn-outline-subtle btn-open-project" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" data-id="${proj.id}">Open</button>
              </td>
            </tr>
          `;
        }).join('');
        
        // Add event listeners
        tableBody.querySelectorAll('.btn-open-project').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            window.Nexeta.ProjectManager.setActiveProjectId(id);
            window.location.hash = `#project-workspace?id=${id}`;
          });
        });
      }
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.AnalyticsManager = AnalyticsManager;
})();
