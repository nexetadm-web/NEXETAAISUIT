/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — RBAC (Role-Based Access Control)
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides role and permission checking utilities across the entire application.
 * Also manages server-side role assignments (Phase 3) and UI element visibility
 * based on role.
 *
 * Roles:
 *   admin       — full platform access, can manage users and billing
 *   team_member — content creation, campaigns, history, prompts, automation
 *   client      — view dashboard, projects, history only
 *   viewer      — dashboard overview only (read-only)
 *
 * Phase 1: client-side enforcement only.
 * Phase 3: server validates role on every protected API call.
 */

'use strict';

(function () {
  const C   = window.Nexeta.AuthConstants;
  const ASM = window.Nexeta.AuthStateManager;

  /* ── Feature Flags per Role ────────────────────────────────────────────── */
  // Defines which UI features are enabled per role.
  // Used by applyRoleUI() to show/hide elements.
  const FEATURES = Object.freeze({
    admin: Object.freeze({
      canManageUsers:      true,
      canManageBilling:    true,
      canAccessSettings:   true,
      canDeleteProjects:   true,
      canExportData:       true,
      canUseAI:            true,
      canCreateCampaigns:  true,
      canViewAnalytics:    true,
      canManageAPIKeys:    true,
      canInviteMembers:    true,
      canViewAuditLog:     true,
    }),
    team_member: Object.freeze({
      canManageUsers:      false,
      canManageBilling:    false,
      canAccessSettings:   true,
      canDeleteProjects:   false,
      canExportData:       true,
      canUseAI:            true,
      canCreateCampaigns:  true,
      canViewAnalytics:    true,
      canManageAPIKeys:    false,
      canInviteMembers:    false,
      canViewAuditLog:     false,
    }),
    client: Object.freeze({
      canManageUsers:      false,
      canManageBilling:    false,
      canAccessSettings:   false,
      canDeleteProjects:   false,
      canExportData:       false,
      canUseAI:            false,
      canCreateCampaigns:  false,
      canViewAnalytics:    true,
      canManageAPIKeys:    false,
      canInviteMembers:    false,
      canViewAuditLog:     false,
    }),
    viewer: Object.freeze({
      canManageUsers:      false,
      canManageBilling:    false,
      canAccessSettings:   false,
      canDeleteProjects:   false,
      canExportData:       false,
      canUseAI:            false,
      canCreateCampaigns:  false,
      canViewAnalytics:    true,
      canManageAPIKeys:    false,
      canInviteMembers:    false,
      canViewAuditLog:     false,
    }),
  });

  /* ── RBAC Manager ──────────────────────────────────────────────────────── */

  const RBACManager = {

    /**
     * Returns the full feature set for a given role.
     * @param {string} role
     * @returns {Object}
     */
    getFeatures(role) {
      return FEATURES[role] || FEATURES[C.ROLES.VIEWER];
    },

    /**
     * Returns the feature set for the current authenticated user.
     * @returns {Object}
     */
    currentFeatures() {
      const role = ASM.getRole();
      return this.getFeatures(role);
    },

    /**
     * Checks if the current user has a specific feature enabled.
     * @param {string} featureKey — e.g., 'canManageUsers'
     * @returns {boolean}
     */
    can(featureKey) {
      return !!this.currentFeatures()[featureKey];
    },

    /**
     * Checks if the current user cannot use a feature.
     * @param {string} featureKey
     * @returns {boolean}
     */
    cannot(featureKey) {
      return !this.can(featureKey);
    },

    /**
     * Checks if the current user has access to a hash route.
     * @param {string} hash — e.g., '#settings'
     * @returns {boolean}
     */
    canAccessRoute(hash) {
      return ASM.canAccess(hash);
    },

    /**
     * Asserts access. If denied, redirects and returns false.
     * Use this before rendering sensitive dashboard sections.
     *
     * @param {string} featureKey
     * @param {function} [onDenied] — optional callback instead of redirect
     * @returns {boolean}
     */
    assert(featureKey, onDenied) {
      if (this.can(featureKey)) return true;

      if (typeof onDenied === 'function') {
        onDenied(featureKey);
      } else {
        console.warn(`[Nexeta RBAC] Access denied: "${featureKey}" not permitted for role "${ASM.getRole()}".`);
      }

      return false;
    },

    /* ── Admin Role Management ─────────────────────────────────────────────── */

    /**
     * Assigns a new role to a user.
     * Phase 1: updates local user record (admin-only).
     * Phase 3: PATCH /admin/users/:userId/role (server validates admin session).
     *
     * @param {string} targetEmail — user to update
     * @param {string} newRole     — new role to assign
     * @returns {boolean}
     */
    assignRole(targetEmail, newRole) {
      // [PHASE-3: replace with API call → PATCH /admin/users/:id/role]

      if (!ASM.hasRole(C.ROLES.ADMIN)) {
        console.error('[Nexeta RBAC] Only admins can assign roles.');
        return false;
      }

      if (!Object.values(C.ROLES).includes(newRole)) {
        console.error(`[Nexeta RBAC] Invalid role: "${newRole}".`);
        return false;
      }

      // Update user store (Phase 1 — client side only)
      const users = JSON.parse(localStorage.getItem('nexeta_users') || '{}');
      if (!users[targetEmail.toLowerCase()]) {
        console.error(`[Nexeta RBAC] User "${targetEmail}" not found.`);
        return false;
      }

      users[targetEmail.toLowerCase()].role = newRole;
      localStorage.setItem('nexeta_users', JSON.stringify(users));

      window.dispatchEvent(new CustomEvent(C.EVENTS.ROLE_CHANGED, {
        detail: { email: targetEmail, role: newRole }
      }));

      return true;
    },

    /* ── UI Role Application ─────────────────────────────────────────────── */

    /**
     * Applies role-based visibility to DOM elements.
     *
     * Elements with data-role-require="admin" are hidden for non-admins.
     * Elements with data-role-hide="client" are hidden for clients.
     * Elements with data-feature-require="canManageUsers" are hidden if feature is off.
     *
     * Call after DOMContentLoaded on any page that uses role-gated UI.
     *
     * @example (in HTML):
     *   <button data-role-require="admin">Manage Users</button>
     *   <section data-feature-require="canViewAnalytics">Analytics</section>
     *   <li data-role-hide="viewer">Settings</li>
     */
    applyRoleUI() {
      const role     = ASM.getRole() || C.ROLES.VIEWER;
      const features = this.getFeatures(role);

      // data-role-require="admin" → visible only if role matches
      document.querySelectorAll('[data-role-require]').forEach(el => {
        const required = el.getAttribute('data-role-require').split(',').map(r => r.trim());
        el.style.display = required.includes(role) ? '' : 'none';
      });

      // data-role-hide="client,viewer" → hidden for those roles
      document.querySelectorAll('[data-role-hide]').forEach(el => {
        const hidden = el.getAttribute('data-role-hide').split(',').map(r => r.trim());
        if (hidden.includes(role)) el.style.display = 'none';
      });

      // data-feature-require="canManageUsers" → visible only if feature is on
      document.querySelectorAll('[data-feature-require]').forEach(el => {
        const feature = el.getAttribute('data-feature-require');
        el.style.display = features[feature] ? '' : 'none';
      });

      // Add role class to body for CSS-based role targeting
      document.body.setAttribute('data-user-role', role);
    },

    /**
     * Returns a human-readable label for a role.
     * @param {string} role
     * @returns {string}
     */
    getRoleLabel(role) {
      const labels = {
        [C.ROLES.ADMIN]:       'Administrator',
        [C.ROLES.TEAM_MEMBER]: 'Team Member',
        [C.ROLES.CLIENT]:      'Client',
        [C.ROLES.VIEWER]:      'Viewer',
      };
      return labels[role] || 'Unknown';
    },

    /**
     * Returns all available roles as option objects for a select dropdown.
     * @returns {{ value: string, label: string }[]}
     */
    getRoleOptions() {
      return Object.values(C.ROLES).map(role => ({
        value: role,
        label: this.getRoleLabel(role),
      }));
    },
  };

  /* ── Expose ────────────────────────────────────────────────────────────── */
  window.Nexeta.RBACManager = RBACManager;

})();
