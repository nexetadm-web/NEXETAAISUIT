/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — Route Guard
 * ─────────────────────────────────────────────────────────────────────────────
 * Protects dashboard routes from unauthenticated and unauthorized access.
 * Runs BEFORE DOMContentLoaded to prevent flash of protected content (FOPC).
 *
 * Guards:
 *  1. authGuard      — requires valid session
 *  2. roleGuard      — requires specific role(s)
 *  3. guestGuard     — redirects authenticated users away from login/signup
 *  4. verifyGuard    — requires email verification
 *  5. hashGuard      — enforces role-based hash route access
 *
 * Usage (top of each page's <head>, before other scripts):
 *   <script src="modules/auth/constants.js"></script>
 *   <script src="modules/auth/sessionManager.js"></script>
 *   <script src="modules/auth/routeGuard.js"></script>
 */

'use strict';

(function () {
  const C  = window.Nexeta.AuthConstants;
  const SM = window.Nexeta.SessionManager;

  /* ── Helpers ───────────────────────────────────────────────────────────── */

  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function currentHash() {
    return window.location.hash || '#dashboard';
  }

  function redirect(url) {
    window.location.replace(url);
  }

  function appendReason(url, reason) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}reason=${encodeURIComponent(reason)}`;
  }

  /**
   * Checks if the current user's role is allowed on the given hash route.
   * @param {string} role
   * @param {string} hash
   * @returns {boolean}
   */
  function isHashAllowed(role, hash) {
    const allowed = C.PERMISSIONS[role] || [];
    if (allowed.includes('*')) return true;
    // Match prefix (e.g., '#projects' matches '#projects', '#project-workspace')
    return allowed.some(prefix => hash.startsWith(prefix));
  }

  /* ── Guards ────────────────────────────────────────────────────────────── */

  const RouteGuard = {

    /**
     * AUTH GUARD
     * Blocks access to protected pages if no valid session exists.
     * Call this at the top of any protected page.
     *
     * @returns {boolean} true = access allowed, false = redirected
     */
    authGuard() {
      if (SM.exists()) return true;

      redirect(appendReason(C.REDIRECTS.UNAUTHENTICATED, 'no_session'));
      return false;
    },

    /**
     * GUEST GUARD
     * Redirects already-authenticated users away from login/signup.
     * Prevents authenticated users from hitting /login.html directly.
     *
     * @returns {boolean} true = user is guest (not authenticated), false = redirected
     */
    guestGuard() {
      if (!SM.exists()) return true;

      redirect(C.REDIRECTS.AFTER_LOGIN);
      return false;
    },

    /**
     * ROLE GUARD
     * Ensures the current user holds at least one of the required roles.
     *
     * @param {...string} requiredRoles — e.g., roleGuard('admin', 'team_member')
     * @returns {boolean}
     */
    roleGuard(...requiredRoles) {
      const session = SM.get();
      if (!session) {
        redirect(appendReason(C.REDIRECTS.UNAUTHENTICATED, 'no_session'));
        return false;
      }

      if (!requiredRoles.includes(session.role)) {
        redirect(appendReason(C.REDIRECTS.UNAUTHORIZED, 'insufficient_role'));
        return false;
      }

      return true;
    },

    /**
     * VERIFY GUARD
     * Blocks access if the user's email is not verified.
     * Skipped if email verification is not yet enforced (Phase 1).
     *
     * @param {boolean} enforce — set false to warn-only without blocking
     * @returns {boolean}
     */
    verifyGuard(enforce = false) {
      // Phase 1: verification is not enforced (just prepared).
      // Phase 3: set enforce = true once verification emails are live.
      if (!enforce) return true;

      const session = SM.get();
      if (!session) {
        redirect(appendReason(C.REDIRECTS.UNAUTHENTICATED, 'no_session'));
        return false;
      }

      if (!session.emailVerified) {
        redirect(appendReason('verify-email.html', 'email_not_verified'));
        return false;
      }

      return true;
    },

    /**
     * HASH GUARD
     * Enforces role-based access on dashboard hash routes.
     * Registered as a hashchange listener on protected pages.
     *
     * Usage: RouteGuard.installHashGuard()
     */
    installHashGuard() {
      const enforce = () => {
        const session = SM.get();
        if (!session) return; // authGuard already handles unauthenticated state

        const hash = currentHash();
        if (!isHashAllowed(session.role, hash)) {
          // Silently redirect to dashboard home without exposing route names
          window.location.hash = '#dashboard';
          console.warn(`[Nexeta Auth] Role "${session.role}" cannot access "${hash}". Redirected.`);
        }
      };

      window.addEventListener('hashchange', enforce);
      // Also enforce on initial load
      window.addEventListener('DOMContentLoaded', enforce);
    },

    /**
     * AUTO GUARD
     * Smart guard that detects the current page and applies the correct guard.
     * Call once from each HTML page's <head>.
     *
     * @returns {boolean}
     */
    auto() {
      const page = currentPage();

      // Protected pages → require auth
      if (C.PROTECTED_ROUTES.includes(page)) {
        if (!this.authGuard()) return false;
        this.installHashGuard();
        return true;
      }

      // Auth pages → redirect if already logged in
      if (['login.html', 'signup.html'].includes(page)) {
        if (!this.guestGuard()) return false;
        return true;
      }

      // All other pages → no guard
      return true;
    },

    /* ── Session Expiry UI ─────────────────────────────────────────────────── */

    /**
     * Renders a non-blocking session expiry notification banner.
     * Shown when the session expires mid-session (e.g., after 2 hours idle).
     * Phase 2: design the full modal/toast UI.
     */
    showExpiryBanner() {
      // Guard against duplicate banners
      if (document.getElementById('nexeta-session-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'nexeta-session-banner';
      banner.setAttribute('role', 'alert');
      banner.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'right: 0',
        'z-index: 99999',
        'background: linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)',
        'border-bottom: 1px solid rgba(99,102,241,0.5)',
        'color: #e0e7ff',
        'font-family: system-ui, sans-serif',
        'font-size: 0.875rem',
        'padding: 0.75rem 1.5rem',
        'display: flex',
        'align-items: center',
        'justify-content: space-between',
        'gap: 1rem',
      ].join(';');

      banner.innerHTML = `
        <span>⚠ Your session has expired. Please sign in again to continue.</span>
        <a href="${C.REDIRECTS.UNAUTHENTICATED}?reason=expired"
           style="color:#818cf8;font-weight:600;text-decoration:none;white-space:nowrap;">
          Sign In →
        </a>
      `;

      document.body.prepend(banner);
    },
  };

  /* ── Bind expiry banner ────────────────────────────────────────────────── */
  window.addEventListener(C.EVENTS.SESSION_EXPIRED, () => {
    RouteGuard.showExpiryBanner();
  });

  /* ── Expose ────────────────────────────────────────────────────────────── */
  window.Nexeta.RouteGuard = RouteGuard;

})();
