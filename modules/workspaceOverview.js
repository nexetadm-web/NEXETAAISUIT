/**
 * NEXETA AI MARKETING SUITE - Workspace Overview Module
 * Handles working breadcrumbs, overview canvas data binding,
 * right sidebar metadata layouts, and home dashboard widgets counts updates.
 */
(function() {
  const WorkspaceOverview = {
    render(project) {
      if (!project) return;

      // 1. Render Breadcrumb Navigation
      const breadcrumb = document.getElementById('workspace-breadcrumb');
      if (breadcrumb) {
        breadcrumb.innerHTML = `
          <a href="#projects" style="color: var(--text-muted); transition: color 0.2s;">Projects</a>
          <span style="color: var(--text-muted); font-size: 0.8rem; margin: 0 4px;">/</span>
          <span style="color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i data-lucide="${this.getWorkflowIcon(project.type)}" style="width: 12px; height: 12px; color: var(--accent-cyan);"></i>
            ${project.name}
          </span>
        `;
      }

      // 2. Render Overview Tab Canvas
      const descTextarea = document.getElementById('workspace-overview-description');
      if (descTextarea) descTextarea.value = project.description || '';

      const infoCategory = document.getElementById('workspace-info-category');
      if (infoCategory) infoCategory.textContent = project.type;

      const infoCreated = document.getElementById('workspace-info-created');
      if (infoCreated) infoCreated.textContent = project.created;

      const infoUpdated = document.getElementById('workspace-info-updated');
      if (infoUpdated) infoUpdated.textContent = project.lastEdited || project.created;

      // 3. Render Right Sidebar Properties Panel (Metadata)
      this.renderRightSidebarPanel(project);

      // 4. Update Global Dashboard Widgets
      this.updateDashboardWidgets();

      if (window.lucide) window.lucide.createIcons();
    },

    renderRightSidebarPanel(project) {
      // Tags list rendering
      const tagsContainer = document.getElementById('workspace-right-tags');
      if (tagsContainer) {
        if (!project.tags || project.tags.length === 0) {
          tagsContainer.innerHTML = `<span style="font-size: 0.7rem; color: var(--text-muted);">No tags configured</span>`;
        } else {
          tagsContainer.innerHTML = project.tags.map(t => `
            <span style="font-size: 0.65rem; color: var(--primary); background: rgba(59,130,246,0.06); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid rgba(59,130,246,0.15);">
              ${t}
            </span>
          `).join('');
        }
      }

      // Quick Stats
      const assetsCount = document.getElementById('workspace-right-assets-count');
      if (assetsCount) assetsCount.textContent = project.assets ? project.assets.length : 0;

      const tasksCount = document.getElementById('workspace-right-tasks-count');
      if (tasksCount) {
        const total = project.tasks ? project.tasks.length : 0;
        const done = project.tasks ? project.tasks.filter(t => t.status === 'done').length : 0;
        tasksCount.textContent = `${done}/${total}`;
      }
    },

    updateDashboardWidgets() {
      const pm = window.Nexeta.ProjectManager;
      if (!pm) return;

      const projects = pm.getProjects();
      const activeProjects = projects.filter(p => p.status === 'Active');

      // Home Stats binding
      const totalProjectsEl = document.getElementById('stat-total-projects');
      if (totalProjectsEl) totalProjectsEl.textContent = projects.length;

      // Since the home stats grid has static elements, let's update them
      const statActiveEl = document.getElementById('stat-active-projects');
      if (statActiveEl) statActiveEl.textContent = activeProjects.length;

      if (typeof window.renderRecentProjectsTable === 'function') {
        window.renderRecentProjectsTable();
      }

      // Render recent activity stream on Home view
      const activityContainer = document.getElementById('home-recent-activity-list');
      if (activityContainer) {
        // Collect all activities from all projects
        let allActivities = [];
        projects.forEach(p => {
          if (p.activities) {
            p.activities.forEach(act => {
              allActivities.push({
                projectName: p.name,
                projectId: p.id,
                ...act
              });
            });
          }
        });

        // Sort by time desc
        allActivities.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        const limited = allActivities.slice(0, 5);

        if (limited.length === 0) {
          activityContainer.innerHTML = `<li style="color: var(--text-muted); font-size: 0.78rem; padding: 0.5rem 0;">No recent activities logged.</li>`;
        } else {
          activityContainer.innerHTML = limited.map(act => `
            <li style="border-bottom: 1px solid rgba(255,255,255,0.02); padding: 0.5rem 0; font-size: 0.76rem; text-align: left; list-style: none;">
              <span style="color: var(--primary); font-weight: bold; cursor:pointer;" onclick="window.location.hash='#project-workspace?id=${act.projectId}'">${act.projectName}</span>: 
              <span style="color: var(--text-secondary);">${act.action}</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; display: block; margin-top: 2px;">${act.timestamp}</span>
            </li>
          `).join('');
        }
      }
    },

    getWorkflowIcon(type) {
      const icons = {
        'AI Ad Creator': 'megaphone',
        'AI Image Generator': 'image',
        'AI Video Generator': 'video',
        'AI Script Writer': 'file-text',
        'AI Social Media': 'share-2',
        'AI Thumbnail Generator': 'play',
        'AI Blog Writer': 'pen-tool',
        'Marketing Strategy': 'sparkles'
      };
      return icons[type] || 'folder';
    }
  };

  // Expose
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.WorkspaceOverview = WorkspaceOverview;
})();
