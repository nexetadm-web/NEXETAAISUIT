/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — Auth Loader (Entry Point)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single entry-point script that loads and initializes the entire auth stack
 * in the correct dependency order.
 *
 * LOAD ORDER (enforced):
 *   1. constants.js      — no deps
 *   2. sessionManager.js — needs: constants
 *   3. routeGuard.js     — needs: constants, sessionManager
 *   4. authService.js    — needs: constants, sessionManager
 *   5. authState.js      — needs: constants, sessionManager
 *   6. rbacManager.js    — needs: constants, authState
 *   7. authLoader.js     — orchestrates all of the above (THIS FILE)
 *
 * Usage in HTML (replace existing modules/auth.js reference):
 *
 *   <!-- Auth Foundation (must be first among all modules) -->
 *   <script src="modules/auth/constants.js"></script>
 *   <script src="modules/auth/sessionManager.js"></script>
 *   <script src="modules/auth/routeGuard.js"></script>
 *   <script src="modules/auth/authService.js"></script>
 *   <script src="modules/auth/authState.js"></script>
 *   <script src="modules/auth/rbacManager.js"></script>
 *   <script src="modules/auth/authLoader.js"></script>
 *
 * After this, window.Nexeta.Auth is fully initialized and backward-compatible.
 */

'use strict';

(function () {

  /* ── Dependency Check ──────────────────────────────────────────────────── */
  const required = [
    'Nexeta.AuthConstants',
    'Nexeta.SessionManager',
    'Nexeta.RouteGuard',
    'Nexeta.AuthService',
    'Nexeta.AuthStateManager',
    'Nexeta.RBACManager',
  ];

  required.forEach(path => {
    const parts = path.split('.');
    let obj = window;
    parts.forEach(p => { obj = obj?.[p]; });
    if (!obj) {
      console.error(`[Nexeta AuthLoader] Missing dependency: ${path}. Check script load order.`);
    }
  });

  /* ── Initialize Stack ──────────────────────────────────────────────────── */

  /**
   * Wires UI-level auth behaviors after DOM is ready.
   * (Runs AFTER DOMContentLoaded)
   */
  function initAuthUI() {
    // Apply role-based UI visibility
    window.Nexeta.RBACManager.applyRoleUI();

    // Wire logout buttons (any element with data-action="logout")
    document.querySelectorAll('[data-action="logout"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.Nexeta.AuthService.logout(true);
      });
    });

    // Wire profile display elements (any element with data-auth-field)
    _bindAuthFields();
  }

  /**
   * Fills elements with data-auth-field="name|email|role|plan|avatar" attributes
   * from the current session.
   *
   * @example
   *   <span data-auth-field="name">Loading...</span>
   *   <img data-auth-field="avatar" />
   */
  function _bindAuthFields() {
    const user = window.Nexeta.AuthService.getCurrentUser();
    if (!user) return;

    document.querySelectorAll('[data-auth-field]').forEach(el => {
      const field = el.getAttribute('data-auth-field');
      const value = user[field];
      if (value === undefined) return;

      if (el.tagName === 'IMG') {
        el.src = value || '';
      } else if (field === 'avatar' && el.style !== undefined) {
        el.style.backgroundImage = `url('${value}')`;
      } else {
        el.textContent = value;
      }
    });
  }

  /* ── Run ───────────────────────────────────────────────────────────────── */

  // Auth stack init is async (must await _seedDemoUser before anything else runs).
  // We start it immediately and chain all dependent work inside the promise.
  (async function () {
    // 1. Migrate legacy session + seed/repair demo user (awaited)
    await window.Nexeta.AuthService.init();

    // 2. Initialize reactive state manager
    window.Nexeta.AuthStateManager.init();

    // 3. Apply route guard AFTER seed is guaranteed complete
    const allowed = window.Nexeta.RouteGuard.auto();
    if (allowed && document.body) {
      document.body.classList.add('auth-loaded');
    }

    // 4. UI bindings after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAuthUI);
    } else {
      initAuthUI();
    }
  })();

  /* ── Dev Tools Helper (removed in production) ──────────────────────────── */
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '') {

    window.__NexetaAuth = {
      state:     () => window.Nexeta.AuthStateManager.getState(),
      session:   () => window.Nexeta.SessionManager.get(),
      user:      () => window.Nexeta.AuthService.getCurrentUser(),
      role:      () => window.Nexeta.AuthStateManager.getRole(),
      features:  () => window.Nexeta.RBACManager.currentFeatures(),
      logout:    () => window.Nexeta.AuthService.logout(),
      constants: window.Nexeta.AuthConstants,
    };

    console.info(
      '%c[Nexeta Auth] Dev mode active. Use window.__NexetaAuth to inspect auth state.',
      'color: #818cf8; font-weight: bold;'
    );
  }

})();
