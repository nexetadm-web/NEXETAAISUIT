/**
 * NEXETA AI MARKETING SUITE - Enterprise Dashboard Analytics Controller
 * Handles 16 KPI calculations, 10 detailed sub-sections, responsive Chart.js widgets,
 * date-bound data simulation, skeleton loaders, and CSV/Excel/PDF exports.
 */
(function() {
  let activeTab = 'analytics'; // 'analytics' or 'workspace'
  let activeSec = 'revenue'; // one of the 10 sections
  let dateFilter = 'last30'; // date range identifier
  let customStartDate = '';
  let customEndDate = '';
  
  let chartInstances = [];

  // Data Generation Engine (consistent stats based on selected date filters)
  function getAnalyticsData(filter, startStr, endStr) {
    let days = 30;
    if (filter === 'today') days = 1;
    else if (filter === 'yesterday') days = 1;
    else if (filter === 'last7') days = 7;
    else if (filter === 'last30') days = 30;
    else if (filter === 'last90') days = 90;
    else if (filter === 'thismonth') days = 30;
    else if (filter === 'lastmonth') days = 30;
    else if (filter === 'custom' && startStr && endStr) {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const diff = e.getTime() - s.getTime();
      days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Base values that scale with number of days
    const scale = Math.log10(days + 1) * 3;
    
    // Fetch real localStorage inputs
    let realProjectsCount = 0;
    let activeProjectsCount = 0;
    let creditsUsedReal = 0;
    let completedTasksReal = 0;
    let pendingTasksReal = 0;

    if (window.Nexeta && window.Nexeta.ProjectManager) {
      const projects = window.Nexeta.ProjectManager.getProjects();
      realProjectsCount = projects.length;
      activeProjectsCount = projects.filter(p => !p.archived && p.status !== 'Completed').length;
      
      projects.forEach(p => {
        if (p.tasks) {
          p.tasks.forEach(t => {
            if (t.status === 'done') completedTasksReal++;
            else pendingTasksReal++;
          });
        }
      });
    }

    if (window.Nexeta && window.Nexeta.BillingManager) {
      const billing = window.Nexeta.BillingManager.getBillingData();
      creditsUsedReal = billing.creditsUsed || 0;
    }

    const totalUsers = Math.floor(1800 + scale * 450);
    const activeUsers = Math.floor(650 + scale * 220);
    const totalProjects = Math.max(realProjectsCount, Math.floor(95 + scale * 25));
    const activeProjects = Math.max(activeProjectsCount, Math.floor(25 + scale * 8));
    const totalClients = Math.floor(24 + scale * 6);
    const totalLeads = Math.floor(180 + scale * 95);
    const totalRevenue = Math.floor(12400 + scale * 6800);
    const monthlyRevenue = Math.floor(14820 + (scale * 2000));
    const creditsUsed = Math.max(creditsUsedReal, Math.floor(45000 + scale * 18000));
    const apiUsage = Math.floor(92000 + scale * 42000);
    const activeAgents = Math.floor(5 + Math.min(5, Math.floor(scale * 1.5)));
    const storageUsed = (12.4 + scale * 1.8).toFixed(1);
    const teamMembers = 6 + Math.floor(realProjectsCount / 12);
    const pendingTasks = Math.max(pendingTasksReal, Math.floor(18 + scale * 12));
    const completedTasks = Math.max(completedTasksReal, Math.floor(42 + scale * 18));
    const convRate = (3.2 + (scale * 0.3)).toFixed(2);

    return {
      days,
      kpis: {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalClients,
        totalLeads,
        totalRevenue,
        monthlyRevenue,
        creditsUsed,
        apiUsage,
        activeAgents,
        storageUsed,
        teamMembers,
        pendingTasks,
        completedTasks,
        convRate
      }
    };
  }

  const AnalyticsDashboard = {
    init() {
      this.bindToolbarEvents();
      this.renderAnalyticsTab();
    },

    bindToolbarEvents() {
      // 1. Dashboard Sub-tabs switching
      document.querySelectorAll('.btn-dashboard-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.btn-dashboard-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const tabName = btn.getAttribute('data-tab');
          activeTab = tabName;

          // Toggle visibility of panels
          const analyticsPane = document.getElementById('dashboard-tab-content-analytics');
          const workspacePane = document.getElementById('dashboard-tab-content-workspace');
          const toolbar = document.getElementById('dashboard-analytics-toolbar');

          if (tabName === 'analytics') {
            if (analyticsPane) analyticsPane.style.display = 'block';
            if (workspacePane) workspacePane.style.display = 'none';
            if (toolbar) toolbar.style.display = 'flex';
            this.renderAnalyticsTab();
          } else {
            if (analyticsPane) analyticsPane.style.display = 'none';
            if (workspacePane) workspacePane.style.display = 'block';
            if (toolbar) toolbar.style.display = 'none';
            if (window.Nexeta && window.Nexeta.AnalyticsManager) {
              window.Nexeta.AnalyticsManager.updateDashboardStats();
            }
          }
        });
      });

      // 2. Date filter listener
      const filterSelect = document.getElementById('analytics-date-filter');
      const customContainer = document.getElementById('analytics-custom-date-container');

      if (filterSelect) {
        filterSelect.addEventListener('change', () => {
          dateFilter = filterSelect.value;
          if (dateFilter === 'custom') {
            if (customContainer) customContainer.style.display = 'flex';
          } else {
            if (customContainer) customContainer.style.display = 'none';
            this.renderAnalyticsTab();
          }
        });
      }

      // Custom range apply button
      const customApplyBtn = document.getElementById('analytics-btn-custom-apply');
      if (customApplyBtn) {
        customApplyBtn.addEventListener('click', () => {
          const start = document.getElementById('analytics-date-start');
          const end = document.getElementById('analytics-date-end');
          if (start && end && start.value && end.value) {
            customStartDate = start.value;
            customEndDate = end.value;
            this.renderAnalyticsTab();
          } else {
            alert('Please select both start and end dates.');
          }
        });
      }

      // 3. 10 Sections switching tabs
      document.querySelectorAll('.btn-analytics-sec').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.btn-analytics-sec').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          activeSec = btn.getAttribute('data-sec');
          this.lazyLoadSectionContent();
        });
      });

      // 4. Reports Export drop down binding
      const exportBtn = document.getElementById('analytics-btn-export');
      const exportMenu = document.getElementById('analytics-export-dropdown-menu');

      if (exportBtn && exportMenu) {
        exportBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
          exportMenu.style.display = 'none';
        });

        exportMenu.querySelectorAll('.btn-export-option').forEach(opt => {
          opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const format = opt.getAttribute('data-format');
            this.exportReport(format);
            exportMenu.style.display = 'none';
          });
        });
      }
    },

    renderAnalyticsTab() {
      const data = getAnalyticsData(dateFilter, customStartDate, customEndDate);
      
      // Render 16 KPIs
      const grid = document.getElementById('analytics-kpi-grid');
      if (grid) {
        grid.innerHTML = this.createKpisHTML(data.kpis);
      }

      // Load sub-tab
      this.lazyLoadSectionContent();

      // Render recent activity feed
      const activityFeed = document.getElementById('analytics-activity-feed-timeline');
      if (activityFeed && window.Nexeta && window.Nexeta.AnalyticsManager) {
        const logs = window.Nexeta.AnalyticsManager.getActivityLogs();
        activityFeed.innerHTML = logs.map(log => `
          <div class="timeline-item">
            <div class="timeline-dot" style="background: var(--primary);"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h4 style="font-weight:600; color:#fff; font-size:0.82rem;">${log.action}</h4>
                <span class="timeline-time" style="font-size:0.7rem; color:var(--text-muted);">${log.time}</span>
              </div>
              <p class="timeline-desc" style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${log.description}</p>
            </div>
          </div>
        `).join('');
      }

      if (window.lucide) window.lucide.createIcons();
    },

    createKpisHTML(kpis) {
      const cards = [
        { title: 'Total Users', val: kpis.totalUsers.toLocaleString(), icon: 'users', color: 'cyan', trend: '+14% DAU growth' },
        { title: 'Active Users', val: kpis.activeUsers.toLocaleString(), icon: 'user-check', color: 'success', trend: '72.4% engagement rate' },
        { title: 'Total Projects', val: kpis.totalProjects.toLocaleString(), icon: 'folder', color: 'purple', trend: 'SaaS repositories count' },
        { title: 'Active Projects', val: kpis.activeProjects.toLocaleString(), icon: 'folder-open', color: 'primary', trend: 'Ongoing creative works' },
        { title: 'Total Clients', val: kpis.totalClients.toLocaleString(), icon: 'briefcase', color: 'cyan', trend: 'VIP agency brands list' },
        { title: 'Total Leads', val: kpis.totalLeads.toLocaleString(), icon: 'target', color: 'success', trend: '+18.5% conversion increase' },
        { title: 'Total Revenue', val: `$${kpis.totalRevenue.toLocaleString()}`, icon: 'dollar-sign', color: 'success', trend: 'Lifetime Billed' },
        { title: 'Monthly Revenue', val: `$${kpis.monthlyRevenue.toLocaleString()}`, icon: 'trending-up', color: 'purple', trend: '+15.2% vs last month' },
        { title: 'AI Credits Used', val: kpis.creditsUsed.toLocaleString(), icon: 'database', color: 'cyan', trend: 'Model tokens calculated' },
        { title: 'API Usage', val: kpis.apiUsage.toLocaleString(), icon: 'code', color: 'purple', trend: 'Real-time pipeline queries' },
        { title: 'Active AI Agents', val: kpis.activeAgents.toLocaleString(), icon: 'cpu', color: 'success', trend: 'Background processes active' },
        { title: 'Storage Used', val: `${kpis.storageUsed} GB`, icon: 'hard-drive', color: 'primary', trend: 'Of 50GB allocated storage' },
        { title: 'Team Members', val: kpis.teamMembers.toLocaleString(), icon: 'users-2', color: 'cyan', trend: 'Collaborators count' },
        { title: 'Pending Tasks', val: kpis.pendingTasks.toLocaleString(), icon: 'clock', color: 'purple', trend: 'Todo & In-progress items' },
        { title: 'Completed Tasks', val: kpis.completedTasks.toLocaleString(), icon: 'check-circle-2', color: 'success', trend: 'Kanban completed backlog' },
        { title: 'Conversion Rate', val: `${kpis.convRate}%`, icon: 'activity', color: 'primary', trend: 'Signups vs leads goal' }
      ];

      return cards.map(c => `
        <div class="glass-card stat-card" style="padding:1.15rem; border-radius:12px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:0.4rem;">
          <div class="stat-card-header" style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-secondary);">
            <span>${c.title}</span>
            <div class="stat-card-icon ${c.color}" style="background: rgba(255,255,255,0.03); padding:4px; border-radius:6px; display:inline-flex;"><i data-lucide="${c.icon}" style="width: 14px; height: 14px;"></i></div>
          </div>
          <div class="stat-card-number" style="font-size: 1.45rem; font-weight:800; color:#fff; line-height:1.2;">${c.val}</div>
          <div class="stat-card-trend neutral" style="font-size:0.68rem; color:var(--text-muted);"><i data-lucide="info" style="width: 10px; height: 10px; margin-right:2px; vertical-align:middle;"></i> ${c.trend}</div>
        </div>
      `).join('');
    },

    lazyLoadSectionContent() {
      const container = document.getElementById('analytics-active-section-container');
      if (!container) return;

      // 1. Clear previous charts
      chartInstances.forEach(c => c.destroy());
      chartInstances = [];

      // 2. Render Skeleton loader
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 0.5rem;">
          <div class="glass-card" style="padding: 1.5rem; border:1px solid var(--border-color); border-radius:12px; height:320px; display:flex; flex-direction:column; gap:1rem; animation: pulse 1.5s infinite ease-in-out;">
            <div style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px; width:40%;"></div>
            <div style="flex-grow:1; background:rgba(255,255,255,0.02); border-radius:8px;"></div>
          </div>
          <div class="glass-card" style="padding: 1.5rem; border:1px solid var(--border-color); border-radius:12px; height:320px; display:flex; flex-direction:column; gap:1rem; animation: pulse 1.5s infinite ease-in-out;">
            <div style="height:20px; background:rgba(255,255,255,0.05); border-radius:4px; width:40%;"></div>
            <div style="flex-grow:1; background:rgba(255,255,255,0.02); border-radius:8px;"></div>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.35; }
          }
        </style>
      `;

      // 3. Trigger 400ms lazy loading delay
      setTimeout(() => {
        this.renderSectionCharts(container);
      }, 400);
    },

    renderSectionCharts(container) {
      const data = getAnalyticsData(dateFilter, customStartDate, customEndDate);
      const scale = data.days;

      if (activeSec === 'revenue') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Monthly Revenue Earnings Trends ($)</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-rev-trend"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Active Subscriptions Tier Split</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-rev-plan"></canvas></div>
            </div>
          </div>
        `;
        
        this.drawAreaChart('chart-rev-trend', 
          ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'], 
          [12000, 14200, 13800, 15600, 17400, 19200], 
          'Revenue ($)', '#8b5cf6'
        );
        this.drawDonutChart('chart-rev-plan', 
          ['Enterprise', 'Agency Pro', 'Team Basic', 'Free Trial'], 
          [18, 42, 85, 120], 
          ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
        );

      } else if (activeSec === 'projects') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Projects split by AI Workflow Engines</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-proj-engines"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Projects Status Distribution</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-proj-status"></canvas></div>
            </div>
          </div>
        `;

        this.drawBarChart('chart-proj-engines',
          ['Ad Campaign', 'AI Video', 'AI Image', 'Social Media', 'Blog Copy', 'Strategy'],
          [35, 24, 45, 30, 20, 12],
          'Count', '#06b6d4'
        );
        this.drawPieChart('chart-proj-status',
          ['Drafts', 'Processing', 'Completed', 'Failed'],
          [48, 12, 110, 3],
          ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
        );

      } else if (activeSec === 'clients') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Client Acquisitions over Time</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-client-acq"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Client Tiers Division</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-client-tiers"></canvas></div>
            </div>
          </div>
        `;

        this.drawAreaChart('chart-client-acq',
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          [14, 18, 22, 28, 35, 42],
          'Total Brands', '#10b981'
        );
        this.drawDonutChart('chart-client-tiers',
          ['VIP Platinum', 'Enterprise Scale', 'Standard Growth', 'Basic Lead'],
          [4, 8, 18, 12],
          ['#f59e0b', '#8b5cf6', '#06b6d4', '#4b5563']
        );

      } else if (activeSec === 'leads') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Leads Captured Daily</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-leads-capture"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Leads Acquisition Funnel Stages</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-leads-funnel"></canvas></div>
            </div>
          </div>
        `;

        this.drawAreaChart('chart-leads-capture',
          ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
          [12, 18, 25, 22, 34, 45, 58],
          'Daily Leads', '#3b82f6'
        );
        this.drawBarChart('chart-leads-funnel',
          ['Web Visitors', 'Inquiries', 'Marketing Qualified', 'Sales Qualified', 'Closed Deals'],
          [1200, 850, 480, 220, 95],
          'Users Count', '#8b5cf6'
        );

      } else if (activeSec === 'ai-usage') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Tokens Credits Consumed per LLM Engine (K)</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-ai-models"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Generations by Asset Types</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-ai-assets"></canvas></div>
            </div>
          </div>
        `;

        this.drawBarChart('chart-ai-models',
          ['Gemini-1.5-Pro', 'Gemini-1.5-Flash', 'GPT-4o', 'Claude-3.5-Sonnet'],
          [480, 1200, 320, 150],
          'Credits (K)', '#a78bfa'
        );
        this.drawDonutChart('chart-ai-assets',
          ['AI Video renders', 'AI Image upscales', 'Ad Marketing copy', 'SEO Scripts'],
          [420, 860, 240, 180],
          ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
        );

      } else if (activeSec === 'campaigns') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Average CTR by Ad Platform (%)</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-campaign-ctr"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Campaign Conversion split</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-campaign-conv"></canvas></div>
            </div>
          </div>
        `;

        this.drawBarChart('chart-campaign-ctr',
          ['Meta (FB/IG)', 'Google Display', 'LinkedIn B2B', 'TikTok Spark'],
          [4.8, 2.1, 1.8, 6.2],
          'CTR (%)', '#f59e0b'
        );
        this.drawDonutChart('chart-campaign-conv',
          ['Organic conversions', 'Paid search', 'Direct leads', 'Referral affiliates'],
          [86, 120, 65, 40],
          ['#10b981', '#3b82f6', '#8b5cf6', '#4b5563']
        );

      } else if (activeSec === 'email-perf') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Newsletter Open Rate vs Click-Through Rate (%)</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-email-rates"></canvas></div>
            </div>
          </div>
        `;

        this.drawDoubleLineChart('chart-email-rates',
          ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          [28.4, 30.2, 29.5, 34.8, 38.2, 42.5],
          [4.2, 4.8, 4.5, 6.1, 7.8, 9.4],
          'Open Rate (%)', 'Click Rate (%)', '#10b981', '#06b6d4'
        );

      } else if (activeSec === 'traffic') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Daily Unique Visitors</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-traffic-visitors"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Organic & Paid Traffic Sources</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-traffic-sources"></canvas></div>
            </div>
          </div>
        `;

        this.drawAreaChart('chart-traffic-visitors',
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          [420, 580, 620, 550, 710, 480, 390],
          'Unique Visits', '#06b6d4'
        );
        this.drawPieChart('chart-traffic-sources',
          ['Direct Search', 'Google Organic', 'Social Media', 'Paid Search', 'External Referral'],
          [25, 45, 15, 10, 5],
          ['#8b5cf6', '#10b981', '#06b6d4', '#f59e0b', '#4b5563']
        );

      } else if (activeSec === 'user-activity') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Active Users Split by Hour of Day</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-activity-hours"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Monthly Active Users (MAU) Ratio</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-activity-ratio"></canvas></div>
            </div>
          </div>
        `;

        this.drawBarChart('chart-activity-hours',
          ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'],
          [140, 280, 310, 260, 180, 95, 40],
          'Active Sessions', '#10b981'
        );
        this.drawAreaChart('chart-activity-ratio',
          ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
          [1200, 1340, 1420, 1560, 1720, 1890, 2450],
          'Total MAU', '#8b5cf6'
        );

      } else if (activeSec === 'team-prod') {
        container.innerHTML = `
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; text-align: left;">
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Tasks completed per Collaborator</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-team-tasks"></canvas></div>
            </div>
            <div class="glass-card" style="padding:1.5rem; border-radius:12px; border:1px solid var(--border-color);">
              <h3 style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:1rem;">Workload Allocation</h3>
              <div style="height:240px; position:relative;"><canvas id="chart-team-workload"></canvas></div>
            </div>
          </div>
        `;

        this.drawBarChart('chart-team-tasks',
          ['Sarah J.', 'Mike R.', 'David K.', 'Sophia L.', 'Alex M.', 'Chloe B.'],
          [28, 22, 15, 18, 12, 10],
          'Tasks Closed', '#06b6d4'
        );
        this.drawDonutChart('chart-team-workload',
          ['Completed Done', 'In Progress work', 'Pending Backlog'],
          [48, 14, 28],
          ['#10b981', '#f59e0b', '#4b5563']
        );
      }
    },

    // Chart.js helper drawing functions
    drawAreaChart(canvasId, labels, data, datasetLabel, color) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;

      const chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: datasetLabel,
            data,
            fill: true,
            borderColor: color,
            backgroundColor: this.getHexOpacity(color, 0.15),
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: color
          }]
        },
        options: this.getChartOptions()
      });
      chartInstances.push(chart);
    },

    drawBarChart(canvasId, labels, data, datasetLabel, color) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;

      const chart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: datasetLabel,
            data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: this.getChartOptions()
      });
      chartInstances.push(chart);
    },

    drawPieChart(canvasId, labels, data, colors) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;

      const chart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'
          }]
        },
        options: this.getPieChartOptions()
      });
      chartInstances.push(chart);
    },

    drawDonutChart(canvasId, labels, data, colors) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;

      const chart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            cutout: '70%'
          }]
        },
        options: this.getPieChartOptions()
      });
      chartInstances.push(chart);
    },

    drawDoubleLineChart(canvasId, labels, data1, data2, label1, label2, color1, color2) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;

      const chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: label1,
              data: data1,
              borderColor: color1,
              fill: false,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 3
            },
            {
              label: label2,
              data: data2,
              borderColor: color2,
              fill: false,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 3
            }
          ]
        },
        options: this.getChartOptions()
      });
      chartInstances.push(chart);
    },

    getChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#9ca3af', font: { size: 10 } }
          },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#fff',
            bodyColor: '#e5e7eb',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9ca3af', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af', font: { size: 10 } }
          }
        }
      };
    },

    getPieChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#9ca3af', font: { size: 10 } }
          },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#fff',
            bodyColor: '#e5e7eb',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        }
      };
    },

    getHexOpacity(hex, opacity) {
      const c = hex.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },

    // PDF, Excel, CSV exporter engine
    exportReport(format) {
      const data = getAnalyticsData(dateFilter, customStartDate, customEndDate);
      const kpis = data.kpis;
      
      const headers = ['KPI Metric Name', 'Value / Summary', 'Growth Status'];
      const rows = [
        ['Total Users', kpis.totalUsers, '+14.2%'],
        ['Active Users', kpis.activeUsers, '72.4% ratio'],
        ['Total Projects', kpis.totalProjects, 'Count'],
        ['Active Projects', kpis.activeProjects, 'Work in progress'],
        ['Total Clients', kpis.totalClients, 'Agency list'],
        ['Total Leads', kpis.totalLeads, '+18.5%'],
        ['Total Revenue', `$${kpis.totalRevenue}`, 'Lifetime Billed'],
        ['Monthly Revenue', `$${kpis.monthlyRevenue}`, 'Monthly Recurring'],
        ['AI Credits Used', kpis.creditsUsed, 'Tokens sum'],
        ['API Usage', kpis.apiUsage, 'Queries'],
        ['Active AI Agents', kpis.activeAgents, 'Active background tasks'],
        ['Storage Used', `${kpis.storageUsed} GB`, '24.8% limit'],
        ['Team Members', kpis.teamMembers, 'Collaborators'],
        ['Pending Tasks', kpis.pendingTasks, 'Todo backlog'],
        ['Completed Tasks', kpis.completedTasks, 'Kanban done'],
        ['Conversion Rate', `${kpis.convRate}%`, 'Sales Goal']
      ];

      const fileName = `nexeta_analytics_report_${dateFilter}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\n";
        rows.forEach(r => {
          csvContent += r.join(",") + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const dl = document.createElement("a");
        dl.setAttribute("href", encodedUri);
        dl.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
        if (window.showSuccessNotification) {
          window.showSuccessNotification('CSV report downloaded successfully.');
        }

      } else if (format === 'excel') {
        let xml = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Analytics Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
          <body>
            <table border="1">
              <tr style="background-color: #8b5cf6; color: white; font-weight: bold;">
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
              ${rows.map(r => `<tr>${r.map(val => `<td>${val}</td>`).join('')}</tr>`).join('')}
            </table>
          </body>
          </html>
        `;
        const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const dl = document.createElement("a");
        dl.setAttribute("href", url);
        dl.setAttribute("download", `${fileName}.xls`);
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Excel spreadsheet (.xls) downloaded.');
        }

      } else if (format === 'pdf') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Nexeta AI - Executive Analytics Report</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; }
                h1 { margin-bottom: 5px; font-weight: 800; font-size: 24px; color: #1e1b4b; }
                p { margin-top: 0; color: #555; font-size: 13px; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 12px 14px; text-align: left; font-size: 13px; }
                th { background-color: #f3f4f6; color: #374151; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9fafb; }
                .stamp { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 11px; color: #777; text-align: right; }
              </style>
            </head>
            <body>
              <h1>Nexeta AI Executive Analytics Report</h1>
              <p>Timeframe filter: <strong>${dateFilter.toUpperCase()}</strong> | Date generated: ${new Date().toLocaleString()}</p>
              
              <table>
                <thead>
                  <tr>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(r => `<tr>${r.map(val => `<td>${val}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>

              <div class="stamp">
                Generated securely on behalf of Sarah Jenkins (Owner) | NEXETA AI MARKETING SUITE
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        if (window.showSuccessNotification) {
          window.showSuccessNotification('PDF print dialogue opened.');
        }
      }
    }
  };

  window.Nexeta = window.Nexeta || {};
  window.Nexeta.AnalyticsDashboard = AnalyticsDashboard;
})();
