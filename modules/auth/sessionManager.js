/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — Session Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Synchronizes client-side session state with Supabase Auth.
 * 
 * To preserve the synchronous get() and exists() APIs, this manager:
 *  1. Caches the mapped Supabase session synchronously in localStorage/sessionStorage.
 *  2. Listens to Supabase auth events to keep the cache updated.
 *  3. Queries the Supabase public.profiles table for user roles and plans.
 */

'use strict';

(function () {
  const C   = window.Nexeta.AuthConstants;
  const K   = C.KEYS;
  const TTL = C.TTL;

  function now() { return Date.now(); }

  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  function getStore(rememberMe) {
    return rememberMe ? localStorage : sessionStorage;
  }

  const SessionManager = {

    /**
     * Maps a Supabase user/session object to the Nexeta session format.
     */
    mapSupabaseSession(sbSession, profileData = null) {
      if (!sbSession || !sbSession.user) return null;

      const user = sbSession.user;
      const meta = user.user_metadata || {};

      // Determine rememberMe based on how session is stored in localStorage
      const rememberMe = safeParse(localStorage.getItem(K.REMEMBER_ME)) !== false;

      return {
        sessionId:     sbSession.access_token || 'sb_session',
        userId:        user.id,
        email:         user.email,
        role:          profileData?.role || meta.role || C.ROLES.CLIENT,
        name:          profileData?.name || meta.full_name || meta.name || user.email.split('@')[0],
        avatar:        profileData?.avatar_url || meta.avatar_url || meta.picture || '',
        plan:          profileData?.plan || meta.plan || 'FREE',
        rememberMe:    rememberMe,
        emailVerified: !!user.email_confirmed_at || !!user.confirmed_at,
        issuedAt:      sbSession.expires_at ? (sbSession.expires_at * 1000 - (sbSession.expires_in * 1000 || TTL.SESSION_DEFAULT)) : now(),
        expiresAt:     sbSession.expires_at ? (sbSession.expires_at * 1000) : (now() + TTL.SESSION_DEFAULT),
        lastActivity:  now()
      };
    },

    /**
     * Synchronizes a Supabase session to the local storage.
     */
    sync(sbSession, profileData = null) {
      if (!sbSession) {
        this.destroy();
        return null;
      }

      const session = this.mapSupabaseSession(sbSession, profileData);
      if (!session) {
        this.destroy();
        return null;
      }

      const store = getStore(session.rememberMe);
      store.setItem(K.SESSION, JSON.stringify(session));
      localStorage.setItem(K.REMEMBER_ME, JSON.stringify(session.rememberMe));
      localStorage.setItem(K.USER_PROFILE, JSON.stringify(session));

      return session;
    },

    /**
     * Creates a new session locally (retained for backward compatibility).
     */
    create(userData, rememberMe = false) {
      const duration  = rememberMe ? TTL.SESSION_REMEMBER : TTL.SESSION_DEFAULT;
      const session = {
        sessionId:     userData.userId || 'sb_session',
        userId:        userData.userId || userData.email,
        email:         userData.email,
        role:          userData.role || C.ROLES.CLIENT,
        name:          userData.name || '',
        avatar:        userData.avatar || '',
        plan:          userData.plan || 'FREE',
        rememberMe:    !!rememberMe,
        emailVerified: userData.emailVerified || false,
        issuedAt:      now(),
        expiresAt:     now() + duration,
        lastActivity:  now()
      };

      const store = getStore(rememberMe);
      store.setItem(K.SESSION, JSON.stringify(session));
      localStorage.setItem(K.REMEMBER_ME, JSON.stringify(rememberMe));
      localStorage.setItem(K.USER_PROFILE, JSON.stringify(session));

      return session;
    },

    /**
     * Retrieves the current active session.
     */
    get() {
      const rememberMe = safeParse(localStorage.getItem(K.REMEMBER_ME));
      const store = getStore(rememberMe);

      let session = safeParse(store.getItem(K.SESSION));

      if (!session) {
        session = safeParse(sessionStorage.getItem(K.SESSION))
               || safeParse(localStorage.getItem(K.SESSION));
      }

      if (!session) return null;

      // Validate expiry
      if (now() > session.expiresAt) {
        this.destroy();
        this._dispatchExpired();
        return null;
      }

      return session;
    },

    /**
     * Checks if an active session exists.
     */
    exists() {
      return this.get() !== null;
    },

    /**
     * Updates session activity.
     */
    touch() {
      const session = this.get();
      if (!session) return;

      session.lastActivity = now();
      const store = getStore(session.rememberMe);
      store.setItem(K.SESSION, JSON.stringify(session));
    },

    /**
     * Merges updates into the session cache.
     */
    update(updates) {
      const session = this.get();
      if (!session) return null;

      const safeUpdates = { ...updates };
      delete safeUpdates.role;
      delete safeUpdates.sessionId;
      delete safeUpdates.issuedAt;
      delete safeUpdates.expiresAt;

      const updated = { ...session, ...safeUpdates, lastActivity: now() };
      const store   = getStore(updated.rememberMe);
      store.setItem(K.SESSION, JSON.stringify(updated));
      localStorage.setItem(K.USER_PROFILE, JSON.stringify(updated));

      return updated;
    },

    /**
     * Refreshes the session. If Supabase client exists, it triggers token refresh.
     */
    async refresh() {
      const sb = window.Nexeta.supabase;
      if (sb) {
        const { data, error } = await sb.auth.refreshSession();
        if (error || !data.session) {
          this.destroy();
          return null;
        }
        return this.sync(data.session);
      }

      // Fallback local logic for Phase 1/2 developer mode
      const session = this.get();
      if (!session || !session.rememberMe) return null;

      const newExpiry = now() + TTL.SESSION_REMEMBER;
      session.expiresAt    = newExpiry;
      session.lastActivity = now();

      localStorage.setItem(K.SESSION, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent(C.EVENTS.SESSION_REFRESHED, {
        detail: { session }
      }));

      return session;
    },

    /**
     * Clears all session storage keys.
     */
    destroy() {
      sessionStorage.removeItem(K.SESSION);
      localStorage.removeItem(K.SESSION);
      localStorage.removeItem(K.REFRESH_TOKEN);
      localStorage.removeItem(K.REMEMBER_ME);
    },

    _dispatchExpired() {
      window.dispatchEvent(new CustomEvent(C.EVENTS.SESSION_EXPIRED));
    }
  };

  window.Nexeta.SessionManager = SessionManager;
})();

