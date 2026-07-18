/**
 * NEXETA AI MARKETING SUITE - Workspace Collaboration Module
 * Manages team member listings, permission roles modifications, activity timelines,
 * and handles version control snapshot creations/restorations.
 */
(function() {
  const WorkspaceCollaboration = {
    render(project) {
      if (!project) return;

      // 1. Render Team Members in Overview Tab
      this.renderOverviewTeamList(project);

      // 2. Render Timeline Tab logs
      this.renderTimelineTab(project);

      // 3. Render Version History list in Right Properties Sidebar
      this.renderRightSidebarVersions(project);
    },

    renderOverviewTeamList(project) {
      const container = document.getElementById('workspace-overview-team');
      if (!container) return;

      const members = project.members || [];
      container.innerHTML = members.map(m => `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 0.76rem; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 0.4rem;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: #fff; font-weight: bold;">
              ${m.name.charAt(0)}
            </div>
            <div>
              <strong style="color: #fff; display: block;">${m.name}</strong>
              <span style="color: var(--text-muted); font-size: 0.65rem; display: block;">${m.email}</span>
            </div>
          </div>
          <span style="font-size: 0.65rem; font-weight: 700; color: ${m.role === 'Owner' ? 'var(--warning)' : m.role === 'Editor' ? 'var(--primary)' : 'var(--text-muted)'}; background: rgba(255,255,255,0.03); padding: 0.1rem 0.35rem; border-radius: 4px;">
            ${m.role}
          </span>
        </div>
      `).join('');
    },

    renderTimelineTab(project) {
      const container = document.getElementById('workspace-timeline-list');
      if (!container) return;

      const activities = project.activities || [];
      if (activities.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.8rem;">No activity logs found.</div>`;
        return;
      }

      container.innerHTML = activities.map(act => `
        <div style="display: flex; gap: 0.75rem; border-left: 2px solid var(--border-color); padding-left: 1rem; padding-bottom: 1rem; position: relative;">
          <!-- Node Dot -->
          <div style="position: absolute; left: -5px; top: 2px; width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></div>
          <div>
            <span style="font-size: 0.8rem; color: #fff; font-weight: bold; display: block;">${act.action}</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-top: 2px;">${act.timestamp}</span>
          </div>
        </div>
      `).join('');
    },

    renderRightSidebarVersions(project) {
      const container = document.getElementById('workspace-right-versions');
      if (!container) return;

      const versions = project.versions || [];
      if (versions.length === 0) {
        container.innerHTML = `<span style="font-size: 0.7rem; color: var(--text-muted);">No version snapshots created</span>`;
        return;
      }

      container.innerHTML = versions.map((v, idx) => `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 0.4rem; font-size: 0.75rem;">
          <div>
            <span style="font-weight: bold; color: #fff; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${v.name}</span>
            <span style="color: var(--text-muted); font-size: 0.65rem; display: block;">${v.timestamp}</span>
          </div>
          <button class="btn btn-outline-subtle btn-version-restore" data-idx="${idx}" style="padding: 0.2rem 0.45rem; font-size: 0.65rem; border-radius: 4px;">
            Restore
          </button>
        </div>
      `).join('');

      // Bind restore clicks
      container.querySelectorAll('.btn-version-restore').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.getAttribute('data-idx'));
          this.restoreVersion(project, idx);
        };
      });
    },

    createVersionSnapshot(project, versionName) {
      if (!project || !versionName) return;

      // Clone parameters safely
      const snapshot = JSON.parse(JSON.stringify(project));
      delete snapshot.versions; // Exclude versions recursion

      if (!project.versions) project.versions = [];
      project.versions.unshift({
        id: 'v-' + Date.now(),
        name: versionName,
        timestamp: new Date().toLocaleString(),
        snapshot: snapshot
      });

      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: `Created version backup: "${versionName}"`,
        timestamp: new Date().toLocaleString()
      });

      this.saveAndRefresh(project);
      this.showToast('Version backup snapshot created successfully.', 'success');
    },

    restoreVersion(project, versionIndex) {
      const v = project.versions[versionIndex];
      if (v && confirm(`Are you sure you want to restore the workspace to backup point "${v.name}"? Current unsaved deliverables will be overwritten.`)) {
        
        // Read snapshot
        const restored = JSON.parse(JSON.stringify(v.snapshot));
        
        // Preserve versions array and prepend new restore activity
        restored.versions = project.versions;
        restored.activities = project.activities || [];
        restored.activities.unshift({
          id: 'act-' + Date.now(),
          action: `Restored workspace backup point: "${v.name}"`,
          timestamp: new Date().toLocaleString()
        });

        // Save
        const pm = window.Nexeta.ProjectManager;
        const projects = pm.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          projects[idx] = restored;
          pm.saveProjects(projects);
        }

        this.showToast(`Restored state to "${v.name}"!`, 'success');
        window.renderProjectWorkspace();
      }
    },

    inviteMember(project, name, email, role) {
      if (!project || !name || !email) return;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      if (!project.members) project.members = [];
      
      // Check duplicate email
      if (project.members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
        alert('This email is already added to this campaign workspace.');
        return;
      }

      project.members.push({ name, email, role });
      
      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: `Team member invited: ${name} (${role})`,
        timestamp: new Date().toLocaleString()
      });

      this.saveAndRefresh(project);
      this.showToast(`Invitation sent to ${name} as ${role}!`, 'success');
    },

    saveAndRefresh(project) {
      const pm = window.Nexeta.ProjectManager;
      const projects = pm.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        pm.saveProjects(projects);
      }
      window.renderProjectWorkspace();
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
  window.Nexeta.WorkspaceCollaboration = WorkspaceCollaboration;
})();
