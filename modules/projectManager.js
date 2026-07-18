/**
 * NEXETA AI MARKETING SUITE - Project Manager Module
 * Handles workspace projects, asset tracking, CRUD operations, and persistent cache.
 * Phase 4: Syncs with Supabase projects & project_assets tables when authenticated.
 */
(function() {
  const PROJECTS_KEY = 'nexeta_projects';
  const ACTIVE_PROJECT_KEY = 'nexeta_active_project_id';

  const defaultProjects = [
    {
      id: 'proj-1',
      name: 'Meta Conversions smartwatch Q3',
      type: 'AI Ad Creator',
      created: 'June 24, 2026',
      status: 'Completed',
      statusColor: 'completed',
      progress: 0,
      description: '',
      tasks: [],
      notes: '',
      chats: [],
      prompts: [],
      activities: [
        { id: 'act-init', action: 'Project initialized.', timestamp: 'June 24, 2026, 10:45 AM' }
      ],
      favorite: false,
      archived: false,
      tags: [],
      assets: [
        {
          id: 'asset-1',
          type: 'Ad Campaign',
          title: 'Smartwatch Q3 Launch Campaign',
          content: {
            primaryText: "Introducing the next generation of smart watches. 14-day battery life, AMOLED screen, and custom AI fitness tracking. Get yours today at 50% OFF!",
            headlines: ["Stop Charging Daily 🔋", "The Smarter Smartwatch", "14-Day Battery Life"],
            cta: "Shop Now",
            hooks: [
              "85% of people watch social videos on mute. But you didn't scroll past this.",
              "If you are charging your smartwatch every single night, you are doing it wrong.",
              "What if your watch could predict your fatigue levels before you even felt tired?"
            ],
            imagePrompt: "Cinematic product photography of a premium minimalist smartwatch with a glowing AMOLED interface, floating on dark volcanic rock, epic studio lighting, 8k, volumetric rays.",
            videoPrompt: "Macro camera panning around a dark steel smartwatch body, showing detailed textures and fitness metrics shifting dynamically, slow motion, cyber aesthetics."
          },
          timestamp: 'June 24, 2026, 10:45 AM'
        }
      ]
    }
  ];

  const ProjectManager = {
    init() {
      if (!localStorage.getItem(PROJECTS_KEY)) {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(defaultProjects));
      }
      if (!localStorage.getItem(ACTIVE_PROJECT_KEY)) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, 'proj-1');
      }
    },

    /**
     * Map a database project row to frontend camelCase format.
     */
    mapProjectFromDb(row) {
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        created: new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        lastEdited: new Date(row.updated_at).toLocaleString(),
        status: row.status,
        statusColor: row.status_color,
        progress: row.progress ?? 0,
        description: row.description ?? '',
        notes: row.notes ?? '',
        favorite: !!row.favorite,
        archived: !!row.archived,
        tags: row.tags ?? [],
        tasks: [], // Sub-features mapped locally for simple UI state
        chats: [],
        prompts: [],
        activities: [
          { id: 'act-db', action: 'Synced with Supabase database.', timestamp: new Date(row.updated_at).toLocaleString() }
        ],
        assets: []
      };
    },

    /**
     * Map a frontend project object to database row format.
     */
    mapProjectToDb(proj, userId) {
      const dbRow = {
        name: proj.name,
        type: proj.type,
        description: proj.description || '',
        status: proj.status || 'Draft',
        status_color: proj.statusColor || 'draft',
        progress: proj.progress || 0,
        notes: proj.notes || '',
        favorite: !!proj.favorite,
        archived: !!proj.archived,
        tags: proj.tags || [],
        user_id: userId
      };
      // Only include id if it's a valid UUID (ignore local 'proj-xxx' placeholders)
      if (proj.id && proj.id.length > 15) {
        dbRow.id = proj.id;
      }
      return dbRow;
    },

    getProjects() {
      this.init();
      const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY)) || [];
      
      // Ensure basic layout parameters exist
      let modified = false;
      projects.forEach(p => {
        if (p.progress === undefined) { p.progress = 0; modified = true; }
        if (p.description === undefined) { p.description = ''; modified = true; }
        if (!p.tasks) { p.tasks = []; modified = true; }
        if (p.notes === undefined) { p.notes = ''; modified = true; }
        if (!p.chats) { p.chats = []; modified = true; }
        if (!p.prompts) { p.prompts = []; modified = true; }
        if (!p.activities) {
          p.activities = [
            { id: 'act-init', action: 'Project initialized.', timestamp: p.created || new Date().toLocaleString() }
          ];
          modified = true;
        }
        if (p.favorite === undefined) { p.favorite = false; modified = true; }
        if (p.archived === undefined) { p.archived = false; modified = true; }
        if (!p.tags) { p.tags = []; modified = true; }
        if (!p.assets) { p.assets = []; modified = true; }
      });
      if (modified) {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      }
      return projects;
    },

    saveProjects(projects) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      
      if (window.Nexeta && window.Nexeta.AnalyticsManager) {
        window.Nexeta.AnalyticsManager.updateDashboardStats();
      }
    },

    /**
     * Downloads and caches remote projects and assets from Supabase.
     */
    async syncWithRemote() {
      const sb = window.Nexeta.supabase;
      const user = window.Nexeta.AuthService?.getCurrentUser();
      if (!sb || !user) return;

      try {
        // 1. Fetch user's projects
        const { data: dbProjects, error: projError } = await sb
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projError) throw projError;

        if (dbProjects) {
          const projects = dbProjects.map(p => this.mapProjectFromDb(p));

          // 2. Fetch assets for all projects
          const projectIds = projects.map(p => p.id);
          if (projectIds.length > 0) {
            const { data: dbAssets, error: assetError } = await sb
              .from('project_assets')
              .select('*')
              .in('project_id', projectIds);

            if (assetError) throw assetError;

            if (dbAssets) {
              dbAssets.forEach(asset => {
                const project = projects.find(p => p.id === asset.project_id);
                if (project) {
                  project.assets.push({
                    id: asset.id,
                    type: asset.type,
                    title: asset.title,
                    content: asset.content,
                    timestamp: new Date(asset.created_at).toLocaleString()
                  });
                }
              });
            }
          }

          // Cache locally
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
          
          // Re-align active project ID if legacy or deleted
          const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY);
          if (projects.length > 0 && (!activeId || !projects.find(p => p.id === activeId))) {
            localStorage.setItem(ACTIVE_PROJECT_KEY, projects[0].id);
          }

          // Refresh UI components
          if (window.Nexeta && window.Nexeta.AnalyticsManager) {
            window.Nexeta.AnalyticsManager.updateDashboardStats();
          }
          if (window.Nexeta && window.Nexeta.WorkspaceOverview && projects.length > 0) {
            const activeProj = projects.find(p => p.id === localStorage.getItem(ACTIVE_PROJECT_KEY)) || projects[0];
            window.Nexeta.WorkspaceOverview.render(activeProj);
          }
        }
      } catch (err) {
        console.warn('[ProjectManager] Sync error:', err.message);
      }
    },

    getActiveProjectId() {
      this.init();
      return localStorage.getItem(ACTIVE_PROJECT_KEY);
    },

    setActiveProjectId(id) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, id);
    },

    getActiveProject() {
      const projects = this.getProjects();
      const activeId = this.getActiveProjectId();
      return projects.find(p => p.id === activeId) || projects[0];
    },

    createProject(name, type = 'General') {
      const projects = this.getProjects();
      const localId = 'proj-' + Date.now();
      
      const newProject = {
        id: localId,
        name,
        type,
        created: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        lastEdited: new Date().toLocaleString(),
        status: 'Active',
        statusColor: 'active',
        progress: 0,
        description: '',
        tasks: [],
        notes: '',
        chats: [],
        prompts: [],
        activities: [
          { id: 'act-init', action: 'Project initialized.', timestamp: new Date().toLocaleString() }
        ],
        assets: [],
        favorite: false,
        archived: false,
        tags: []
      };

      // Unshift to local cache
      projects.unshift(newProject);
      this.saveProjects(projects);
      this.setActiveProjectId(localId);

      // Async save to Supabase
      const sb = window.Nexeta.supabase;
      const user = window.Nexeta.AuthService?.getCurrentUser();
      if (sb && user) {
        const dbRow = this.mapProjectToDb(newProject, user.userId);
        sb.from('projects')
          .insert(dbRow)
          .select()
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('[ProjectManager] Insert failed:', error.message);
            } else if (data) {
              // Update local ID with real database UUID
              const updatedProjects = this.getProjects();
              const p = updatedProjects.find(item => item.id === localId);
              if (p) {
                p.id = data.id;
                this.saveProjects(updatedProjects);
                if (this.getActiveProjectId() === localId) {
                  this.setActiveProjectId(data.id);
                }
              }
            }
          });
      }

      if (window.Nexeta && window.Nexeta.AnalyticsManager) {
        window.Nexeta.AnalyticsManager.logActivity(
          'Project Created', 
          `Project "${name}" (${type}) initialized.`
        );
      }

      return newProject;
    },

    renameProject(id, newName) {
      const projects = this.getProjects();
      const project = projects.find(p => p.id === id);
      if (project) {
        const oldName = project.name;
        project.name = newName;
        project.lastEdited = new Date().toLocaleString();
        this.saveProjects(projects);

        // Async update Supabase
        const sb = window.Nexeta.supabase;
        if (sb && id.length > 15) {
          sb.from('projects')
            .update({ name: newName, updated_at: new Date().toISOString() })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('[ProjectManager] Rename failed:', error.message);
            });
        }

        if (window.Nexeta && window.Nexeta.AnalyticsManager) {
          window.Nexeta.AnalyticsManager.logActivity(
            'Project Renamed', 
            `"${oldName}" renamed to "${newName}".`
          );
        }
      }
    },

    deleteProject(id) {
      let projects = this.getProjects();
      const projectToDelete = projects.find(p => p.id === id);
      projects = projects.filter(p => p.id !== id);
      this.saveProjects(projects);

      if (projects.length === 0) {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      } else if (id === this.getActiveProjectId()) {
        this.setActiveProjectId(projects[0].id);
      }

      // Async delete from Supabase
      const sb = window.Nexeta.supabase;
      if (sb && id.length > 15) {
        sb.from('projects')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('[ProjectManager] Delete failed:', error.message);
          });
      }

      if (window.Nexeta && window.Nexeta.AnalyticsManager) {
        window.Nexeta.AnalyticsManager.logActivity(
          'Project Deleted', 
          `Project "${projectToDelete?.name}" removed.`
        );
      }
    },

    saveAssetToProject(projectId, asset) {
      const projects = this.getProjects();
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const localAssetId = 'asset-' + Date.now();
        const newAsset = {
          id: localAssetId,
          timestamp: new Date().toLocaleString(),
          ...asset
        };
        project.assets.unshift(newAsset);
        project.lastEdited = new Date().toLocaleString();
        this.saveProjects(projects);

        // Async save to Supabase
        const sb = window.Nexeta.supabase;
        if (sb && projectId.length > 15) {
          const dbAssetRow = {
            project_id: projectId,
            type: asset.type,
            title: asset.title,
            content: asset.content
          };
          sb.from('project_assets')
            .insert(dbAssetRow)
            .select()
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('[ProjectManager] Asset insert failed:', error.message);
              } else if (data) {
                // Update local asset ID with database UUID
                const updatedProjects = this.getProjects();
                const pr = updatedProjects.find(item => item.id === projectId);
                if (pr) {
                  const as = pr.assets.find(item => item.id === localAssetId);
                  if (as) {
                    as.id = data.id;
                    this.saveProjects(updatedProjects);
                  }
                }
              }
            });
        }

        // Consume credits
        if (window.Nexeta && window.Nexeta.BillingManager) {
          const cost = asset.type === 'AI Image' ? 500 : 100;
          window.Nexeta.BillingManager.consumeCredits(cost);
        }

        // Log activity
        if (window.Nexeta && window.Nexeta.AnalyticsManager) {
          window.Nexeta.AnalyticsManager.logActivity(
            'Asset Saved', 
            `Saved "${asset.title}" under project "${project.name}".`
          );
        }

        return newAsset;
      }
      return null;
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.ProjectManager = ProjectManager;
})();
