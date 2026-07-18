/**
 * NEXETA AI MARKETING SUITE - Workspace Actions Module
 * Manages campaigns CRUD operations: Rename, Duplicate clones, Category transfers,
 * Archiving triggers, JSON exports, and JSON file imports.
 */
(function() {
  const WorkspaceActions = {
    rename(project, newName) {
      if (!project || !newName.trim()) return;
      
      const oldName = project.name;
      project.name = newName.trim();
      project.lastEdited = new Date().toLocaleString();
      
      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: `Campaign renamed from "${oldName}" to "${project.name}"`,
        timestamp: new Date().toLocaleString()
      });

      this.saveProject(project);
      this.showToast('Workspace renamed successfully.', 'success');
      window.renderProjectWorkspace();
    },

    duplicate(project) {
      if (!project) return;
      
      const pm = window.Nexeta.ProjectManager;
      const projects = pm.getProjects();
      
      // Clone project properties
      const clone = JSON.parse(JSON.stringify(project));
      clone.id = 'proj-' + Date.now();
      clone.name = `${project.name} - Copy`;
      clone.created = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      clone.lastEdited = new Date().toLocaleString();
      clone.favorite = false;
      clone.archived = false;
      clone.activities = [
        { id: 'act-init', action: `Workspace duplicated from "${project.name}".`, timestamp: clone.lastEdited }
      ];

      projects.unshift(clone);
      pm.saveProjects(projects);
      pm.setActiveProjectId(clone.id);
      
      this.showToast(`Workspace duplicated as "${clone.name}"`, 'success');
      window.location.hash = `#project-workspace?id=${clone.id}`;
    },

    toggleArchive(project) {
      if (!project) return;
      
      project.archived = !project.archived;
      project.lastEdited = new Date().toLocaleString();
      
      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: project.archived ? 'Workspace archived.' : 'Workspace unarchived.',
        timestamp: new Date().toLocaleString()
      });

      this.saveProject(project);
      this.showToast(project.archived ? 'Workspace moved to Archive.' : 'Workspace restored from Archive.', 'success');
      
      // Redirect back to dashboard list if archiving from active workspace view
      window.location.hash = '#projects';
    },

    delete(project) {
      if (!project) return;
      
      if (confirm(`Are you absolutely sure you want to permanently delete campaign workspace "${project.name}"? All associated creative notes, AI chats, generated copy assets, and tasks will be wiped.`)) {
        const pm = window.Nexeta.ProjectManager;
        pm.deleteProject(project.id);
        
        this.showToast('Campaign project deleted.', 'error');
        window.location.hash = '#projects';
      }
    },

    moveCategory(project, targetCategory) {
      if (!project || !targetCategory) return;
      
      const oldCat = project.type;
      project.type = targetCategory;
      project.lastEdited = new Date().toLocaleString();
      
      project.activities.unshift({
        id: 'act-' + Date.now(),
        action: `Campaign category moved from "${oldCat}" to "${targetCategory}"`,
        timestamp: new Date().toLocaleString()
      });

      this.saveProject(project);
      this.showToast(`Moved workflow category to ${targetCategory}.`, 'success');
      window.renderProjectWorkspace();
    },

    exportJSON(project) {
      if (!project) return;

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      
      const filename = `naxeta-campaign-${project.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      this.showToast('JSON backup package generated!', 'success');
    },

    importJSON(file, callback) {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedProject = JSON.parse(event.target.result);
          
          // Verify basic schema
          if (!importedProject.name || !importedProject.type) {
            alert('Invalid backup file. Missing name or workflow categories.');
            return;
          }

          // Assign unique metadata parameters
          importedProject.id = 'proj-' + Date.now();
          importedProject.created = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          importedProject.lastEdited = new Date().toLocaleString();
          importedProject.archived = false;
          
          if (!importedProject.activities) importedProject.activities = [];
          importedProject.activities.unshift({
            id: 'act-import',
            action: 'Workspace imported from file.',
            timestamp: importedProject.lastEdited
          });

          const pm = window.Nexeta.ProjectManager;
          const projects = pm.getProjects();
          projects.unshift(importedProject);
          pm.saveProjects(projects);

          this.showToast(`Imported project "${importedProject.name}" successfully!`, 'success');
          if (callback) callback(importedProject);
        } catch (e) {
          console.error(e);
          alert('Failed to parse backup JSON. Please check formatting guidelines.');
        }
      };
      reader.readAsText(file);
    },

    saveProject(project) {
      const pm = window.Nexeta.ProjectManager;
      const projects = pm.getProjects();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        projects[idx] = project;
        pm.saveProjects(projects);
      }
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
  window.Nexeta.WorkspaceActions = WorkspaceActions;
})();
