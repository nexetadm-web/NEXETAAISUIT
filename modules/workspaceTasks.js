/**
 * NEXETA AI MARKETING SUITE - Workspace Tasks Module
 * Controls the Kanban columns boards, task creations, priority scales, due dates,
 * task edit/delete triggers, and task-level comments collaboration threads.
 */
(function() {
  const WorkspaceTasks = {
    render(project) {
      if (!project) return;
      
      const tasks = project.tasks || [];
      const columns = ['todo', 'in-progress', 'done'];

      columns.forEach(status => {
        const colWrapper = document.querySelector(`.kanban-column[data-status="${status}"]`);
        if (!colWrapper) return;
        
        const countBadge = colWrapper.querySelector('.kanban-count-badge');
        const wrapper = colWrapper.querySelector('.kanban-cards-wrapper');
        
        const filteredTasks = tasks.filter(t => t.status === status);
        if (countBadge) countBadge.textContent = filteredTasks.length;

        if (filteredTasks.length === 0) {
          wrapper.innerHTML = `
            <div style="font-size: 0.7rem; color: var(--text-muted); text-align: center; padding: 2rem; border: 1px dashed rgba(255,255,255,0.02); border-radius: 8px;">
              Empty list
            </div>
          `;
          return;
        }

        wrapper.innerHTML = filteredTasks.map(t => {
          const priorityColor = t.priority === 'high' ? 'var(--error)' : t.priority === 'medium' ? 'var(--warning)' : 'var(--text-muted)';
          const commentsCount = t.comments ? t.comments.length : 0;
          const commentsBadge = commentsCount > 0 ? `
            <span style="font-size: 0.65rem; color: var(--primary); display: inline-flex; align-items: center; gap: 2px;" title="Task comments">
              <i data-lucide="message-square" style="width: 9px; height: 9px;"></i> ${commentsCount}
            </span>
          ` : '';

          return `
            <div class="kanban-card" draggable="true" data-task-id="${t.id}" style="display: flex; flex-direction: column; gap: 0.5rem; text-align: left; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <span class="kanban-priority ${t.priority}" style="background: rgba(255,255,255,0.02); border: 1px solid ${priorityColor}; color: ${priorityColor}; font-size: 0.62rem; text-transform: uppercase; font-weight: bold; padding: 0.1rem 0.35rem; border-radius: 4px;">
                  ${t.priority}
                </span>
                <div style="display: flex; gap: 6px;">
                  <button class="btn-edit-task" data-id="${t.id}" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 0;" title="Edit Task & Comments"><i data-lucide="edit-3" style="width: 12px; height: 12px;"></i></button>
                  <button class="btn-delete-task" data-id="${t.id}" style="background: transparent; border: none; color: var(--error); cursor: pointer; padding: 0;" title="Delete Task"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></button>
                </div>
              </div>
              
              <h4 style="font-weight: bold; color: #fff; font-size: 0.82rem; margin: 0; text-decoration: ${t.status === 'done' ? 'line-through' : 'none'}; opacity: ${t.status === 'done' ? '0.5' : '1'};">${t.title}</h4>
              ${t.description ? `<p style="font-size: 0.72rem; color: var(--text-secondary); margin: 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.description}</p>` : ''}
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.4rem; margin-top: 0.25rem;">
                <span style="font-size: 0.65rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 2px;">
                  <i data-lucide="calendar" style="width: 9px; height: 9px;"></i> ${t.dueDate || 'No due date'}
                </span>
                <div style="display: flex; gap: 6px; align-items: center;">
                  ${commentsBadge}
                  <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${t.status === 'done' ? 'checked' : ''} style="cursor: pointer; width: 12px; height: 12px;" title="Toggle Completion">
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Card drag start/end event bindings
        wrapper.querySelectorAll('.kanban-card').forEach(card => {
          card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.getAttribute('data-task-id'));
            card.style.opacity = '0.4';
          });
          card.addEventListener('dragend', () => {
            card.style.opacity = '1';
          });
        });

        // Edit triggers (incorporates comments injection)
        wrapper.querySelectorAll('.btn-edit-task').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const task = tasks.find(x => x.id === id);
            if (task) {
              this.openEditTaskModal(project, task);
            }
          });
        });

        // Delete triggers
        wrapper.querySelectorAll('.btn-delete-task').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            this.deleteTask(project, id);
          });
        });

        // Checkbox toggle triggers
        wrapper.querySelectorAll('.task-checkbox').forEach(chk => {
          chk.addEventListener('change', () => {
            const id = chk.getAttribute('data-id');
            this.toggleTaskStatus(project, id, chk.checked);
          });
        });
      });

      if (window.lucide) window.lucide.createIcons();
    },

    openEditTaskModal(project, task) {
      document.getElementById('workspace-task-modal-title').textContent = "Edit Task & Collaboration";
      document.getElementById('workspace-task-id').value = task.id;
      document.getElementById('workspace-task-title-input').value = task.title;
      document.getElementById('workspace-task-priority-input').value = task.priority;
      document.getElementById('workspace-task-due-input').value = task.dueDate !== 'No due date' ? task.dueDate : '';
      document.getElementById('workspace-task-desc-input').value = task.description || '';
      
      // Inject comments section dynamically at the bottom of the modal card
      const modalOverlay = document.getElementById('workspace-task-modal');
      const card = modalOverlay.querySelector('.modal-card');
      
      // Remove any existing comments wrapper
      const oldComments = card.querySelector('#workspace-task-comments-wrapper');
      if (oldComments) oldComments.remove();

      // Create new comments container
      const commentsWrapper = document.createElement('div');
      commentsWrapper.id = 'workspace-task-comments-wrapper';
      commentsWrapper.style.marginTop = '1.25rem';
      commentsWrapper.style.borderTop = '1px solid var(--border-color)';
      commentsWrapper.style.paddingTop = '1rem';
      commentsWrapper.style.textAlign = 'left';

      const comments = task.comments || [];
      const commentsListHTML = comments.length === 0 
        ? `<div style="text-align: center; color: var(--text-muted); font-size: 0.74rem; padding: 0.5rem 0;">No comments on this task yet.</div>`
        : comments.map(c => `
            <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 6px; padding: 0.5rem; font-size: 0.74rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-weight: bold; color: #fff;">${c.author}</span>
                <span style="font-size: 0.62rem; color: var(--text-muted);">${c.timestamp}</span>
              </div>
              <p style="color: var(--text-secondary); line-height: 1.3;">${c.text}</p>
            </div>
          `).join('');

      commentsWrapper.innerHTML = `
        <h4 style="font-size: 0.85rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 4px;">
          <i data-lucide="message-square" style="width: 14px; height: 14px;"></i> Collaboration Comments (${comments.length})
        </h4>
        <div id="workspace-task-comments-list" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 100px; overflow-y: auto; margin-bottom: 0.75rem; padding-right: 0.25rem;">
          ${commentsListHTML}
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="workspace-task-new-comment" placeholder="Write a comment..." style="flex-grow: 1; padding: 0.4rem 0.65rem; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.25); color: #fff; font-size: 0.76rem; outline: none;">
          <button class="btn btn-outline-subtle" id="workspace-task-comment-submit" style="padding: 0.4rem 0.75rem; font-size: 0.72rem;">Post</button>
        </div>
      `;

      // Insert comments block before buttons row
      const buttonsRow = card.querySelector('div[style*="justify-content: flex-end"]');
      if (buttonsRow) {
        card.insertBefore(commentsWrapper, buttonsRow.parentNode);
      } else {
        card.appendChild(commentsWrapper);
      }

      // Bind comment submit
      const postBtn = commentsWrapper.querySelector('#workspace-task-comment-submit');
      const commentInput = commentsWrapper.querySelector('#workspace-task-new-comment');
      postBtn.onclick = () => {
        const text = commentInput.value.trim();
        if (!text) return;

        if (!task.comments) task.comments = [];
        task.comments.push({
          author: 'Sarah Jenkins (You)',
          text: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Save
        const pm = window.Nexeta.ProjectManager;
        const projects = pm.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          const taskIdx = projects[idx].tasks.findIndex(t => t.id === task.id);
          if (taskIdx !== -1) {
            projects[idx].tasks[taskIdx] = task;
            pm.saveProjects(projects);
          }
        }

        commentInput.value = '';
        this.openEditTaskModal(project, task); // Reload comments view
        this.render(project);
      };

      if (window.lucide) window.lucide.createIcons();
      modalOverlay.classList.add('active');
    },

    deleteTask(project, id) {
      const task = project.tasks.find(t => t.id === id);
      if (task && confirm(`Delete task "${task.title}"?`)) {
        project.tasks = project.tasks.filter(t => t.id !== id);
        
        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: `Task deleted: "${task.title}"`,
          timestamp: new Date().toLocaleString()
        });

        this.saveProjectAndRefresh(project);
        if (window.showSuccessNotification) {
          window.showSuccessNotification('Task removed.');
        }
      }
    },

    toggleTaskStatus(project, id, isCompleted) {
      const task = project.tasks.find(t => t.id === id);
      if (task) {
        task.status = isCompleted ? 'done' : 'todo';
        
        project.activities.unshift({
          id: 'act-' + Date.now(),
          action: `Task status updated: "${task.title}" -> ${task.status}`,
          timestamp: new Date().toLocaleString()
        });

        this.saveProjectAndRefresh(project);
        if (window.showSuccessNotification) {
          window.showSuccessNotification(isCompleted ? 'Task completed!' : 'Task re-opened.');
        }
      }
    },

    saveProjectAndRefresh(project) {
      // Recalculate progress
      const total = project.tasks.length;
      const done = project.tasks.filter(t => t.status === 'done').length;
      project.progress = total > 0 ? Math.round((done / total) * 100) : 0;
      project.lastEdited = new Date().toLocaleString();

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
  window.Nexeta.WorkspaceTasks = WorkspaceTasks;
})();
