/**
 * NEXETA AI MARKETING SUITE - Projects Dashboard Module
 * Handles Grid/List view rendering, searching, smart filtering, sorting,
 * favorites toggling, archived lists, and recent projects cards.
 */
(function() {
  const ProjectDashboard = {
    currentPage: 1,
    totalPages: 1,
    lastFilterKey: '',

    render(container, searchQuery = '', typeFilter = 'All', statusFilter = 'All', sortVal = 'newest', layoutMode = 'grid') {
      const pm = window.Nexeta.ProjectManager;
      if (!pm) return;
      
      let projects = pm.getProjects();
      
      // Separate normal projects from archived ones
      const normalProjects = projects.filter(p => !p.archived);
      const archivedProjects = projects.filter(p => p.archived);

      // Render Recent Projects section (top 3 normal projects by edit time)
      this.renderRecentProjects(normalProjects);

      let targetList = normalProjects;
      if (statusFilter === 'Archived') {
        targetList = archivedProjects;
      }

      // Filter by Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        targetList = targetList.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
        );
      }

      // Filter by Category Type
      if (typeFilter !== 'All') {
        targetList = targetList.filter(p => p.type === typeFilter);
      }

      // Filter by Status (unless viewing Archived)
      if (statusFilter !== 'All' && statusFilter !== 'Archived') {
        if (statusFilter === 'Favorites') {
          targetList = targetList.filter(p => p.favorite);
        } else {
          targetList = targetList.filter(p => p.status === statusFilter);
        }
      }

      // Sort
      if (sortVal === 'newest') {
        targetList.sort((a, b) => b.id.localeCompare(a.id));
      } else if (sortVal === 'oldest') {
        targetList.sort((a, b) => a.id.localeCompare(b.id));
      } else if (sortVal === 'name') {
        targetList.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortVal === 'progress') {
        targetList.sort((a, b) => b.progress - a.progress);
      }

      // Reset page if filters change
      const filterKey = `${searchQuery}_${typeFilter}_${statusFilter}_${sortVal}_${layoutMode}`;
      if (this.lastFilterKey !== filterKey) {
        this.currentPage = 1;
        this.lastFilterKey = filterKey;
      }

      const itemsPerPage = 6;
      const totalItems = targetList.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
      this.totalPages = totalPages;

      const startIndex = (this.currentPage - 1) * itemsPerPage;
      const paginatedList = targetList.slice(startIndex, startIndex + itemsPerPage);

      if (targetList.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem 2rem;">
            <i data-lucide="folder-open" style="width: 48px; height: 48px; margin: 0 auto 1rem auto; display: block; opacity: 0.3;"></i>
            <h3>No projects found</h3>
            <p style="font-size: 0.85rem; margin-top: 4px;">Try clearing filters or click "+ New Project" to get started.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      // Layout rendering
      if (layoutMode === 'grid') {
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        container.style.gap = '1.5rem';
        container.innerHTML = paginatedList.map(p => this.createGridCardHTML(p)).join('') + this.createPaginationHTML(this.currentPage, totalPages);
      } else {
        container.style.display = 'block';
        container.innerHTML = this.createListViewHTML(paginatedList) + this.createPaginationHTML(this.currentPage, totalPages);
      }

      this.bindEvents(container, layoutMode);
      if (window.lucide) window.lucide.createIcons();
    },

    createGridCardHTML(p) {
      const statusColors = {
        'Draft': 'var(--text-muted)',
        'Active': 'var(--primary)',
        'Completed': 'var(--success)',
        'Failed': 'var(--error)'
      };
      const color = statusColors[p.status] || '#fff';
      const isFav = p.favorite;

      // Avatars for members
      const avatarsHTML = p.members ? p.members.slice(0, 3).map(m => `
        <div class="project-member-avatar-bubble" style="width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%); border: 1.5px solid var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; color: #fff; margin-left: -6px;" title="${m.name} (${m.role})">
          ${m.name.charAt(0)}
        </div>
      `).join('') : '';

      return `
        <div class="glass-card project-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; min-height: 230px; position: relative;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span style="font-size: 0.65rem; color: var(--accent-cyan); font-weight: bold; text-transform: uppercase; background: rgba(6,182,212,0.05); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(6,182,212,0.15);">${p.type}</span>
              <div style="display: flex; gap: 8px; align-items: center;">
                <button class="project-fav-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; padding: 0; color: ${isFav ? 'var(--error)' : 'var(--text-muted)'}; display: inline-flex; align-items: center;" title="Favorite">
                  <i data-lucide="heart" style="width: 13px; height: 13px; fill: ${isFav ? 'var(--error)' : 'none'};"></i>
                </button>
                <button class="project-edit-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; padding: 0; color: var(--text-muted); display: inline-flex; align-items: center;" title="Rename Project">
                  <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i>
                </button>
                <button class="project-archive-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; padding: 0; color: var(--text-muted); display: inline-flex; align-items: center;" title="${p.archived ? 'Restore Campaign' : 'Archive Campaign'}">
                  <i data-lucide="${p.archived ? 'rotate-ccw' : 'archive'}" style="width: 13px; height: 13px;"></i>
                </button>
                <button class="project-delete-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; padding: 0; color: var(--error); display: inline-flex; align-items: center;" title="Delete Project">
                  <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
                </button>
              </div>
            </div>
            
            <h3 style="font-weight: 800; color: #fff; font-size: 1.05rem; margin-bottom: 0.25rem; line-height: 1.35; cursor: pointer;" onclick="window.location.hash='#project-workspace?id=${p.id}'">${p.name}</h3>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">Created: ${p.created}</span>
            <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;">${p.description || 'No description provided.'}</p>
          </div>

          <div>
            <!-- Progress Bar -->
            <div style="margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-secondary); margin-bottom: 3px; font-weight: bold;">
                <span>Completion</span>
                <span>${p.progress || 0}%</span>
              </div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden;">
                <div style="width: ${p.progress || 0}%; height: 100%; background: linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%);"></div>
              </div>
            </div>

            <!-- Footer Details -->
            <div style="border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.7rem; color: ${color}; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; display: inline-block;"></span> ${p.status}
              </span>
              
              <div style="display: flex; align-items: center;">
                <div style="display: flex; margin-right: 8px; padding-left: 6px;">
                  ${avatarsHTML}
                </div>
                <button class="btn btn-outline-subtle" onclick="window.location.hash='#project-workspace?id=${p.id}'" style="padding: 0.35rem 0.65rem; font-size: 0.7rem; border-radius: 6px;">Open</button>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    createListViewHTML(list) {
      const rowsHTML = list.map(p => {
        const isFav = p.favorite;
        const statusColors = {
          'Draft': 'var(--text-muted)',
          'Active': 'var(--primary)',
          'Completed': 'var(--success)',
          'Failed': 'var(--error)'
        };
        const color = statusColors[p.status] || '#fff';

        const avatarsHTML = p.members ? p.members.slice(0, 3).map(m => `
          <div style="width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%); border: 1.5px solid var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: bold; color: #fff; margin-left: -5px;" title="${m.name} (${m.role})">
            ${m.name.charAt(0)}
          </div>
        `).join('') : '';

        return `
          <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.8rem; vertical-align: middle;">
            <td style="padding: 0.85rem 0.5rem; text-align: left;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <button class="project-fav-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; color: ${isFav ? 'var(--error)' : 'var(--text-muted)'}; display: inline-flex; align-items: center;">
                  <i data-lucide="heart" style="width: 14px; height: 14px; fill: ${isFav ? 'var(--error)' : 'none'};"></i>
                </button>
                <div>
                  <strong style="color: #fff; font-size: 0.88rem; cursor: pointer; display: block;" onclick="window.location.hash='#project-workspace?id=${p.id}'">${p.name}</strong>
                  <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-top: 2px;">Created: ${p.created}</span>
                </div>
              </div>
            </td>
            <td style="padding: 0.85rem 0.5rem; color: var(--accent-cyan); font-weight: 600; text-align: left;">${p.type}</td>
            <td style="padding: 0.85rem 0.5rem; text-align: left;">
              <span style="font-size: 0.72rem; color: ${color}; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; display: inline-block;"></span> ${p.status}
              </span>
            </td>
            <td style="padding: 0.85rem 0.5rem; min-width: 120px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; flex-shrink:0;">
                  <div style="width: ${p.progress || 0}%; height: 100%; background: linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%);"></div>
                </div>
                <span style="font-size: 0.7rem; color: var(--text-secondary); font-weight: bold;">${p.progress || 0}%</span>
              </div>
            </td>
            <td style="padding: 0.85rem 0.5rem; text-align: left;">
              <div style="display: flex; padding-left: 5px;">
                ${avatarsHTML}
              </div>
            </td>
            <td style="padding: 0.85rem 0.5rem; text-align: right;">
              <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                <button class="project-edit-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; color: var(--text-secondary); display: inline-flex; align-items: center;" title="Rename Project"><i data-lucide="edit-3" style="width: 13px; height: 13px;"></i></button>
                <button class="project-archive-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; color: var(--text-secondary); display: inline-flex; align-items: center;" title="${p.archived ? 'Restore' : 'Archive'}"><i data-lucide="${p.archived ? 'rotate-ccw' : 'archive'}" style="width: 13px; height: 13px;"></i></button>
                <button class="project-delete-btn" data-id="${p.id}" style="background: transparent; border: none; cursor: pointer; color: var(--error); display: inline-flex; align-items: center;" title="Delete Project"><i data-lucide="trash-2" style="width: 13px; height: 13px;"></i></button>
                <button class="btn btn-outline-subtle" onclick="window.location.hash='#project-workspace?id=${p.id}'" style="padding: 0.3rem 0.65rem; font-size: 0.7rem; height: 26px; display: inline-flex; align-items: center;">Open</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="glass-card" style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); border-radius: 12px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; border: none; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem; color: var(--text-secondary); font-weight: bold; text-transform: uppercase;">
                <th style="padding: 0.75rem 0.5rem;">Project Name</th>
                <th style="padding: 0.75rem 0.5rem;">Workflow</th>
                <th style="padding: 0.75rem 0.5rem;">Status</th>
                <th style="padding: 0.75rem 0.5rem;">Progress</th>
                <th style="padding: 0.75rem 0.5rem;">Team</th>
                <th style="padding: 0.75rem 0.5rem; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      `;
    },

    createPaginationHTML(currentPage, totalPages) {
      if (totalPages <= 1) return '';

      let pagesHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active btn-primary' : 'btn-outline-subtle';
        const activeStyle = i === currentPage ? 'background: var(--primary); color: #fff; border-color: var(--primary);' : '';
        pagesHTML += `<button class="btn ${activeClass} btn-page-num" data-page="${i}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; min-width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; ${activeStyle}">${i}</button>`;
      }

      return `
        <div class="projects-pagination" style="grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); width: 100%;">
          <button class="btn btn-outline-subtle btn-page-prev" ${currentPage === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.75rem; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
            <i data-lucide="chevron-left" style="width: 14px; height: 14px;"></i> Prev
          </button>
          ${pagesHTML}
          <button class="btn btn-outline-subtle btn-page-next" ${currentPage === totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.75rem; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
            Next <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      `;
    },

    renderRecentProjects(normalProjects) {
      const recentContainer = document.getElementById('market-recent-projects-container');
      const recentSection = document.getElementById('market-recent-projects-section');
      
      if (!recentContainer || !recentSection) return;

      if (normalProjects.length === 0) {
        recentSection.style.display = 'none';
        return;
      }

      recentSection.style.display = 'block';

      // Sort by last updated/edited time (or ID desc fallback)
      const sorted = [...normalProjects].sort((a, b) => {
        const tA = a.lastEdited ? new Date(a.lastEdited) : new Date(a.created);
        const tB = b.lastEdited ? new Date(b.lastEdited) : new Date(b.created);
        return tB - tA;
      }).slice(0, 3);

      recentContainer.innerHTML = sorted.map(p => `
        <div class="glass-card" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 10px; flex: 1; min-width: 220px; text-align: left; transition: transform 0.2s; cursor: pointer;" onclick="window.location.hash='#project-workspace?id=${p.id}'" class="template-box-hover">
          <span style="font-size: 0.58rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">Recent Project</span>
          <h4 style="font-size: 0.85rem; color: #fff; font-weight: 800; margin: 0.15rem 0 0.4rem 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</h4>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem; color: var(--text-secondary);">
            <span>${p.progress}% Complete</span>
            <span style="font-weight: bold; color: ${p.status === 'Completed' ? 'var(--success)' : 'var(--primary)'}">${p.status}</span>
          </div>
        </div>
      `).join('');
    },

    bindEvents(container, layoutMode) {
      const pm = window.Nexeta.ProjectManager;
      if (!pm) return;

      const getFilters = () => {
        const searchQuery = document.getElementById('project-search-input')?.value || '';
        const typeFilter = document.getElementById('project-filter-type')?.value || 'All';
        const statusFilter = document.querySelector('.btn-project-status-tab.active')?.getAttribute('data-status') || 'All';
        const sortVal = document.getElementById('project-filter-sort')?.value || 'newest';
        return { searchQuery, typeFilter, statusFilter, sortVal };
      };

      // Favorite star clicks
      container.querySelectorAll('.project-fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const projects = pm.getProjects();
          const p = projects.find(x => x.id === id);
          if (p) {
            p.favorite = !p.favorite;
            pm.saveProjects(projects);
            
            const f = getFilters();
            this.render(container, f.searchQuery, f.typeFilter, f.statusFilter, f.sortVal, layoutMode);
          }
        });
      });

      // Quick actions: Edit/Rename
      container.querySelectorAll('.project-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const projects = pm.getProjects();
          const p = projects.find(x => x.id === id);
          if (p) {
            const newName = prompt('Enter new project name:', p.name);
            if (newName && newName.trim() && newName.trim() !== p.name) {
              pm.renameProject(id, newName.trim());
              const f = getFilters();
              this.render(container, f.searchQuery, f.typeFilter, f.statusFilter, f.sortVal, layoutMode);
            }
          }
        });
      });

      // Quick actions: Archive / Restore
      container.querySelectorAll('.project-archive-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const projects = pm.getProjects();
          const p = projects.find(x => x.id === id);
          if (p) {
            p.archived = !p.archived;
            p.lastEdited = new Date().toLocaleString();
            p.activities.unshift({
              id: 'act-' + Date.now(),
              action: p.archived ? 'Project archived.' : 'Project unarchived.',
              timestamp: new Date().toLocaleString()
            });
            pm.saveProjects(projects);
            if (window.showSuccessNotification) {
              window.showSuccessNotification(p.archived ? 'Project archived.' : 'Project restored.');
            }
            const f = getFilters();
            this.render(container, f.searchQuery, f.typeFilter, f.statusFilter, f.sortVal, layoutMode);
          }
        });
      });

      // Quick actions: Delete
      container.querySelectorAll('.project-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const projects = pm.getProjects();
          const p = projects.find(x => x.id === id);
          if (p && confirm(`Are you absolutely sure you want to permanently delete project "${p.name}"? This action cannot be undone.`)) {
            pm.deleteProject(id);
            const f = getFilters();
            this.render(container, f.searchQuery, f.typeFilter, f.statusFilter, f.sortVal, layoutMode);
          }
        });
      });

      // Pagination events
      const pagePrev = container.querySelector('.btn-page-prev');
      const pageNext = container.querySelector('.btn-page-next');
      const pageNums = container.querySelectorAll('.btn-page-num');

      if (pagePrev) {
        pagePrev.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.currentPage > 1) {
            this.currentPage--;
            const f = getFilters();
            this.render(container, f.searchQuery, f.typeFilter, f.statusFilter, f.sortVal, layoutMode);
          }
        });
      }

      if (pageNext) {
        pageNext.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.currentPage < this.totalPages) {
            this.currentPage++;
            const f = getFilters();
            this.render(container, f.searchQuery, f.typeFilter, f.statusFilter, f.sortVal, layoutMode);
          }
        });
      }

      pageNums.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pageNum = Number(btn.getAttribute('data-page'));
          if (pageNum && pageNum !== this.currentPage) {
            this.currentPage = pageNum;
            const f = getFilters();
            this.render(container, f.searchQuery, f.typeFilter, f.statusFilter, f.sortVal, layoutMode);
          }
        });
      });
    }
  };

  // Expose
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.ProjectDashboard = ProjectDashboard;
})();
