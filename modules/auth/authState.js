/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — Auth State Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Reactive authentication state for the UI layer.
 * Components subscribe to auth state changes and re-render accordingly.
 *
 * Pattern: Lightweight Observer (pub/sub) over the auth event bus.
 *
 * Phase 1: event-driven state via CustomEvents + localStorage snapshot.
 * Phase 3: can be swapped for a React/Vue reactive store if framework adopted.
 */

'use strict';

(function () {
  const C  = window.Nexeta.AuthConstants;
  const SM = window.Nexeta.SessionManager;

  /* ── State Shape ───────────────────────────────────────────────────────── */
  /**
   * @typedef {Object} AuthState
   * @property {'loading'|'authenticated'|'unauthenticated'} status
   * @property {NexetaSession|null}  session
   * @property {Object|null}         user
   * @property {string|null}         role
   * @property {boolean}             emailVerified
   * @property {string|null}         error
   */

  /* ── Internal State ────────────────────────────────────────────────────── */
  let _state = {
    status:        'loading',
    session:       null,
    user:          null,
    role:          null,
    emailVerified: false,
    error:         null,
  };

  /** Registered subscriber callbacks. Map<string, function> */
  const _subscribers = new Map();
  let   _subId = 0;

  /* ── Helpers ───────────────────────────────────────────────────────────── */

  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  /** Builds a fresh state snapshot from the current session. */
  function _buildState() {
    const session = SM.get();
    const profile = safeParse(localStorage.getItem(C.KEYS.USER_PROFILE));

    if (!session) {
      return {
        status:        'unauthenticated',
        session:       null,
        user:          null,
        role:          null,
        emailVerified: false,
        error:         null,
      };
    }

    return {
      status:        'authenticated',
      session,
      user:          profile || { name: session.name, email: session.email },
      role:          session.role,
      emailVerified: session.emailVerified || false,
      error:         null,
    };
  }

  /** Notifies all subscribers with the current state. */
  function _notify() {
    _subscribers.forEach(cb => {
      try { cb({ ..._state }); }
      catch (e) { console.error('[Nexeta AuthState] Subscriber error:', e); }
    });
  }

  /** Merges a partial update into state and notifies subscribers. */
  function _setState(partial) {
    _state = { ..._state, ...partial };
    _notify();

    // Persist a lightweight snapshot for cross-tab awareness
    sessionStorage.setItem(C.KEYS.AUTH_STATE, JSON.stringify({
      status: _state.status,
      role:   _state.role,
    }));
  }

  /* ── AuthStateManager ──────────────────────────────────────────────────── */

  const AuthStateManager = {

    /**
     * Initializes state from the current session (call after AuthService.init).
     */
    init() {
      _setState(_buildState());
      this._bindEvents();
    },

    /**
     * Returns the current auth state snapshot (read-only copy).
     * @returns {AuthState}
     */
    getState() {
      return { ..._state };
    },

    /**
     * Checks if the current state is authenticated.
     * @returns {boolean}
     */
    isAuthenticated() {
      return _state.status === 'authenticated';
    },

    /**
     * Returns the current user role.
     * @returns {string|null}
     */
    getRole() {
      return _state.role;
    },

    /**
     * Checks if the current user has a specific role.
     * @param {string} role
     * @returns {boolean}
     */
    hasRole(role) {
      return _state.role === role;
    },

    /**
     * Checks if the current user has at least one of the given roles.
     * @param {...string} roles
     * @returns {boolean}
     */
    hasAnyRole(...roles) {
      return roles.includes(_state.role);
    },

    /**
     * Subscribes to auth state changes.
     * The callback is called immediately with the current state,
     * then on every subsequent state change.
     *
     * @param {function(AuthState): void} callback
     * @returns {function} unsubscribe — call to remove this subscriber
     *
     * @example
     *   const unsub = AuthStateManager.subscribe(state => {
     *     if (state.status === 'authenticated') showDashboard();
     *     else showLogin();
     *   });
     *   // Later: unsub();
     */
    subscribe(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('[Nexeta AuthState] subscribe() requires a function.');
      }

      const id = `sub_${++_subId}`;
      _subscribers.set(id, callback);

      // Immediately invoke with current state
      try { callback({ ..._state }); } catch { /* ignore */ }

      // Return unsubscribe function
      return () => _subscribers.delete(id);
    },

    /**
     * One-time subscriber — automatically unsubscribes after first call.
     * Useful for "wait until authenticated" patterns.
     *
     * @param {function(AuthState): void} callback
     * @returns {function} cancel
     */
    once(callback) {
      const unsub = this.subscribe(state => {
        callback(state);
        unsub();
      });
      return unsub;
    },

    /**
     * Returns a Promise that resolves when auth status is no longer 'loading'.
     * Useful for async initialization flows.
     *
     * @returns {Promise<AuthState>}
     *
     * @example
     *   const state = await AuthStateManager.ready();
     *   if (state.status === 'authenticated') { ... }
     */
    ready() {
      if (_state.status !== 'loading') return Promise.resolve({ ..._state });

      return new Promise(resolve => {
        const unsub = this.subscribe(state => {
          if (state.status !== 'loading') {
            unsub();
            resolve(state);
          }
        });
      });
    },

    /* ── RBAC Helpers ──────────────────────────────────────────────────────── */

    /**
     * Returns the permission set for the current user's role.
     * @returns {string[]}
     */
    getPermissions() {
      if (!_state.role) return [];
      return C.PERMISSIONS[_state.role] || [];
    },

    /**
     * Checks if the current user can access a given hash route.
     * @param {string} hash — e.g., '#settings'
     * @returns {boolean}
     */
    canAccess(hash) {
      const perms = this.getPermissions();
      if (perms.includes('*')) return true;
      return perms.some(prefix => hash.startsWith(prefix));
    },

    /* ── Internal Event Bindings ───────────────────────────────────────────── */

    _bindEvents() {
      window.addEventListener(C.EVENTS.SIGNED_IN, (e) => {
        _setState({
          ..._buildState(),
          status: 'authenticated',
        });
      });

      window.addEventListener(C.EVENTS.SIGNED_OUT, () => {
        _setState({
          status:        'unauthenticated',
          session:       null,
          user:          null,
          role:          null,
          emailVerified: false,
          error:         null,
        });
      });

      window.addEventListener(C.EVENTS.SESSION_EXPIRED, () => {
        _setState({
          status:        'unauthenticated',
          session:       null,
          user:          null,
          role:          null,
          emailVerified: false,
          error:         'session_expired',
        });
      });

      window.addEventListener(C.EVENTS.SESSION_REFRESHED, () => {
        _setState(_buildState());
      });

      window.addEventListener(C.EVENTS.USER_UPDATED, () => {
        // Re-build from updated profile
        _setState(_buildState());
      });

      window.addEventListener(C.EVENTS.ROLE_CHANGED, (e) => {
        _setState({ role: e.detail?.role || _state.role });
      });
    },
  };

  /* ── Expose ────────────────────────────────────────────────────────────── */
  window.Nexeta.AuthStateManager = AuthStateManager;

})();
