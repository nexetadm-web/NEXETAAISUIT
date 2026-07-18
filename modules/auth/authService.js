/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — Auth Service
 * ─────────────────────────────────────────────────────────────────────────────
 * The central authentication service. 
 * Bridges the application flows to Supabase Auth, with a local localStorage
 * fallback (mock mode) if Supabase is not configured.
 */

'use strict';

(function () {
  const C  = window.Nexeta.AuthConstants;
  const SM = window.Nexeta.SessionManager;
  const K  = C.KEYS;
  const PW = C.PASSWORD;

  /* ── Utilities ─────────────────────────────────────────────────────────── */

  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  function generateToken(prefix) {
    const arr = new Uint8Array(24);
    window.crypto.getRandomValues(arr);
    return `${prefix}_${Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  }

  function dispatch(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  class AuthError extends Error {
    constructor(code, message) {
      super(message);
      this.name  = 'AuthError';
      this.code  = code;
    }
  }

  /* ── Local Mock Store (Fallback when Supabase is not set up) ──────────── */
  const UserStore = {
    _getAll() {
      return safeParse(localStorage.getItem('nexeta_users')) || {};
    },
    _setAll(users) {
      localStorage.setItem('nexeta_users', JSON.stringify(users));
    },
    findByEmail(email) {
      const users = this._getAll();
      return users[email.toLowerCase()] || null;
    },
    create(userData) {
      const users = this._getAll();
      if (users[userData.email.toLowerCase()]) {
        throw new AuthError(C.ERRORS.EMAIL_ALREADY_EXISTS, 'An account with this email already exists.');
      }
      users[userData.email.toLowerCase()] = userData;
      this._setAll(users);
      return userData;
    },
    update(email, updates) {
      const users = this._getAll();
      const key   = email.toLowerCase();
      if (!users[key]) return null;
      users[key] = { ...users[key], ...updates };
      this._setAll(users);
      return users[key];
    },
  };

  /* ── Password Utilities ────────────────────────────────────────────────── */
  function validatePassword(password) {
    const errors = [];
    if (!password || password.length < PW.MIN_LENGTH)
      errors.push(`Password must be at least ${PW.MIN_LENGTH} characters.`);
    if (password.length > PW.MAX_LENGTH)
      errors.push(`Password must be no more than ${PW.MAX_LENGTH} characters.`);
    if (PW.REQUIRE_UPPERCASE && !/[A-Z]/.test(password))
      errors.push('Password must contain at least one uppercase letter.');
    if (PW.REQUIRE_LOWERCASE && !/[a-z]/.test(password))
      errors.push('Password must contain at least one lowercase letter.');
    if (PW.REQUIRE_NUMBER && !/[0-9]/.test(password))
      errors.push('Password must contain at least one number.');
    if (PW.REQUIRE_SYMBOL && !/[^A-Za-z0-9]/.test(password))
      errors.push('Password must contain at least one special character.');
    return errors;
  }

  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data    = encoder.encode(password + 'nexeta_salt_v1');
    const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function verifyPassword(password, storedHash) {
    const hash = await hashPassword(password);
    return hash === storedHash;
  }

  /* ── Auth Service ──────────────────────────────────────────────────────── */
  const AuthService = {

    /**
     * Initializes the auth system.
     */
    async init() {
      if (this._initialized) return;
      this._initialized = true;

      this._migrateLegacySession();
      this._bindSessionEvents();
      this._startHeartbeat();

      const sb = window.Nexeta.supabase;
      if (sb) {
        // Sync the initial session from Supabase
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
          const profile = await this._getProfile(session.user.id);
          SM.sync(session, profile);
          this._wasAuthenticated(true);
          
          // Sync remote details
          if (window.Nexeta && window.Nexeta.BillingManager) {
            window.Nexeta.BillingManager.syncWithRemote();
          }
          if (window.Nexeta && window.Nexeta.ProjectManager) {
            window.Nexeta.ProjectManager.syncWithRemote();
          }
        } else {
          SM.destroy();
          this._wasAuthenticated(false);
        }

        // Listen for auth changes
        sb.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const profile = await this._getProfile(session.user.id);
            const localSession = SM.sync(session, profile);
            dispatch(C.EVENTS.SIGNED_IN, { session: localSession, user: localSession });
            this._wasAuthenticated(true);
            
            // Sync remote details
            if (window.Nexeta && window.Nexeta.BillingManager) {
              window.Nexeta.BillingManager.syncWithRemote();
            }
            if (window.Nexeta && window.Nexeta.ProjectManager) {
              window.Nexeta.ProjectManager.syncWithRemote();
            }
          } else if (event === 'SIGNED_OUT') {
            SM.destroy();
            localStorage.removeItem(K.USER_PROFILE);
            // Also clean billing/project caches to avoid leaking metrics
            localStorage.removeItem('nexeta_billing');
            localStorage.removeItem('nexeta_projects');
            localStorage.removeItem(C.KEYS.ACTIVE_PROJECT_KEY || 'nexeta_active_project_id');
            dispatch(C.EVENTS.SIGNED_OUT);
            this._wasAuthenticated(false);
          }
        });
      } else {
        // Mock Mode: Seed demo user
        await this._seedDemoUser();
      }
    },

    /* ── Supabase Profile DB Helper ───────────────────────────────────────── */
    async _getProfile(userId) {
      const sb = window.Nexeta.supabase;
      if (!sb) return null;

      try {
        const { data, error } = await sb
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('[Nexeta Auth] Could not fetch DB profile:', error.message);
          return null;
        }
        return data;
      } catch (err) {
        return null;
      }
    },

    /* ── Core Auth Operations ─────────────────────────────────────────────── */

    /**
     * Authenticates a user.
     */
    async login(email, password, rememberMe = false) {
      if (!email || !password)
        throw new AuthError(C.ERRORS.INVALID_CREDENTIALS, 'Email and password are required.');

      const sb = window.Nexeta.supabase;
      if (sb) {
        // Save rememberMe configuration locally
        localStorage.setItem(K.REMEMBER_ME, JSON.stringify(!!rememberMe));

        const { data, error } = await sb.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password
        });

        if (error) {
          // Map common Supabase Auth errors
          if (error.message.includes('Email not confirmed')) {
            throw new AuthError(C.ERRORS.EMAIL_NOT_VERIFIED, 'Please verify your email address before logging in.');
          }
          throw new AuthError(C.ERRORS.INVALID_CREDENTIALS, 'Invalid email or password.');
        }

        const profile = await this._getProfile(data.user.id);
        const session = SM.sync(data.session, profile);
        dispatch(C.EVENTS.SIGNED_IN, { session, user: session });
        return session;
      }

      // Mock Mode Fallback
      const user = UserStore.findByEmail(email);
      if (!user)
        throw new AuthError(C.ERRORS.INVALID_CREDENTIALS, 'Invalid email or password.');

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid)
        throw new AuthError(C.ERRORS.INVALID_CREDENTIALS, 'Invalid email or password.');

      const session = SM.create(user, rememberMe);
      dispatch(C.EVENTS.SIGNED_IN, { session, user });
      return session;
    },

    /**
     * Authenticates using Google OAuth.
     */
    async loginWithGoogle() {
      const sb = window.Nexeta.supabase;
      if (sb) {
        localStorage.setItem(K.REMEMBER_ME, JSON.stringify(true));
        
        const currentUrl = window.location.href;
        const redirectUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/dashboard.html';

        const { error } = await sb.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        if (error) {
          throw new AuthError(C.ERRORS.UNKNOWN, error.message);
        }
        return true;
      }

      // Mock Mode Fallback
      const mockUser = {
        userId:        'usr_google_mock',
        name:          'Google Demo User',
        email:         'google-demo@nexeta.ai',
        role:          C.ROLES.CLIENT,
        plan:          'FREE',
        avatar:        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        emailVerified: true,
      };
      const session = SM.create(mockUser, true);
      dispatch(C.EVENTS.SIGNED_IN, { session, user: mockUser });
      window.location.href = C.REDIRECTS.AFTER_LOGIN;
      return true;
    },

    /**
     * Registers a new user account.
     */
    async signup(userData, rememberMe = false) {
      const { name, email, password, role, country } = userData;

      if (!name || !email || !password)
        throw new AuthError(C.ERRORS.INVALID_CREDENTIALS, 'Name, email and password are required.');

      const pwErrors = validatePassword(password);
      if (pwErrors.length)
        throw new AuthError(C.ERRORS.WEAK_PASSWORD, pwErrors[0]);

      const sb = window.Nexeta.supabase;
      if (sb) {
        localStorage.setItem(K.REMEMBER_ME, JSON.stringify(!!rememberMe));

        const { data, error } = await sb.auth.signUp({
          email: email.toLowerCase().trim(),
          password: password,
          options: {
            data: {
              name: name.trim(),
              role: role || C.ROLES.CLIENT,
              country: country || ''
            }
          }
        });

        if (error) {
          const isEmailTaken = error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('taken') || error.message.toLowerCase().includes('exist');
          const errorCode = isEmailTaken ? C.ERRORS.EMAIL_ALREADY_EXISTS : C.ERRORS.UNKNOWN;
          throw new AuthError(errorCode, error.message || 'Failed to sign up.');
        }

        // Keep track of registration details for verification flow
        localStorage.setItem(K.PENDING_VERIFY, JSON.stringify({
          email: email.toLowerCase().trim(),
          issuedAt: Date.now()
        }));

        if (data.session) {
          const profile = await this._getProfile(data.user.id);
          const session = SM.sync(data.session, profile);
          dispatch(C.EVENTS.SIGNED_IN, { session, user: session });
          return session;
        } else {
          // Email confirmation is required by Supabase configuration
          dispatch(C.EVENTS.VERIFY_SENT, { email: email.toLowerCase().trim() });
          // Throw so the page displays verification instructions
          throw new AuthError(C.ERRORS.EMAIL_NOT_VERIFIED, 'Verification email sent! Check your inbox to confirm.');
        }
      }

      // Mock Mode Fallback
      if (UserStore.findByEmail(email))
        throw new AuthError(C.ERRORS.EMAIL_ALREADY_EXISTS, 'An account with this email already exists.');

      const passwordHash = await hashPassword(password);
      const newUser = {
        userId:        generateToken('usr'),
        name:          name.trim(),
        email:         email.toLowerCase().trim(),
        passwordHash,
        role:          Object.values(C.ROLES).includes(role) ? role : C.ROLES.CLIENT,
        plan:          'FREE',
        country:       country || '',
        avatar:        '',
        emailVerified: false,
        createdAt:     Date.now(),
        onboardingDone: false,
      };

      UserStore.create(newUser);
      const verifyToken = this._prepareEmailVerification(newUser.email);
      const session = SM.create(newUser, rememberMe);
      dispatch(C.EVENTS.SIGNED_IN,   { session, user: newUser });
      dispatch(C.EVENTS.VERIFY_SENT, { email: newUser.email, token: verifyToken });
      return session;
    },

    /**
     * Logs out the current user.
     */
    async logout(redirect = true) {
      const session = SM.get();
      const sb = window.Nexeta.supabase;

      if (sb) {
        await sb.auth.signOut();
      }

      SM.destroy();
      localStorage.removeItem(K.USER_PROFILE);
      localStorage.removeItem(K.PENDING_VERIFY);
      localStorage.removeItem(K.RESET_TOKEN);

      dispatch(C.EVENTS.SIGNED_OUT, { sessionId: session?.sessionId });

      if (redirect) {
        window.location.href = C.REDIRECTS.AFTER_LOGOUT;
      }
    },

    /* ── Session Accessors ────────────────────────────────────────────────── */

    getSession() {
      return SM.get();
    },

    isAuthenticated() {
      return SM.exists();
    },

    getCurrentUser() {
      return SM.get();
    },

    getRole() {
      const session = SM.get();
      return session ? session.role : null;
    },

    hasRole(role) {
      return this.getRole() === role;
    },

    /**
     * Updates the current user's profile data.
     */
    async updateUser(updates) {
      const allowed = ['name', 'avatar', 'country', 'onboardingDone'];
      const safe = {};
      allowed.forEach(k => { if (k in updates) safe[k] = updates[k]; });

      const session = SM.get();
      if (!session) return null;

      const sb = window.Nexeta.supabase;
      if (sb) {
        const { error } = await sb
          .from('profiles')
          .update({
            name: safe.name,
            avatar_url: safe.avatar,
            country: safe.country,
            onboarding_done: safe.onboardingDone
          })
          .eq('id', session.userId);

        if (error) {
          throw new AuthError(C.ERRORS.UNKNOWN, error.message);
        }

        // Re-sync local cache
        const profile = await this._getProfile(session.userId);
        const { data: { session: currentSbSession } } = await sb.auth.getSession();
        SM.sync(currentSbSession, profile);
      } else {
        // Mock Mode Fallback
        SM.update(safe);
        UserStore.update(session.email, safe);
        const profile = safeParse(localStorage.getItem(K.USER_PROFILE)) || {};
        localStorage.setItem(K.USER_PROFILE, JSON.stringify({ ...profile, ...safe }));
      }

      dispatch(C.EVENTS.USER_UPDATED, { updates: safe });
      return this.getCurrentUser();
    },

    /* ── Password Reset Architecture ─────────────────────────────────────── */

    /**
     * Initiates a password reset.
     */
    async requestPasswordReset(email) {
      const sb = window.Nexeta.supabase;
      if (sb) {
        // Use current page origin for redirecting back to reset-password.html
        const currentUrl = window.location.href;
        const redirectUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/reset-password.html';

        await sb.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
          redirectTo: redirectUrl
        });

        // Always succeed to prevent email enumeration
        return { success: true };
      }

      // Mock Mode Fallback
      const user = UserStore.findByEmail(email);
      if (user) {
        const token = generateToken('pwr');
        const record = {
          token,
          email:     user.email,
          issuedAt:  Date.now(),
          expiresAt: Date.now() + C.TTL.RESET_TOKEN,
          used:      false,
        };
        localStorage.setItem(K.RESET_TOKEN, JSON.stringify(record));
        dispatch(C.EVENTS.RESET_SENT, { email, token });
      }
      return { success: true };
    },

    /**
     * Validates a password reset token.
     */
    validateResetToken(token) {
      const sb = window.Nexeta.supabase;
      if (sb) {
        // For Supabase, clicking the email link logs the user in with a temporary session.
        // We are valid if the user has an active session OR if a token is in the hash fragment.
        const hash = window.location.hash;
        const hasSession = SM.exists();
        const hasRecoveryToken = hash.includes('type=recovery') || hash.includes('access_token=');
        
        return { valid: hasSession || hasRecoveryToken };
      }

      // Mock Mode Fallback
      const record = safeParse(localStorage.getItem(K.RESET_TOKEN));
      if (!record || record.used || Date.now() > record.expiresAt || record.token !== token) {
        return { valid: false };
      }
      return { valid: true, email: record.email };
    },

    /**
     * Completes password reset.
     */
    async resetPassword(token, newPassword) {
      const pwErrors = validatePassword(newPassword);
      if (pwErrors.length)
        throw new AuthError(C.ERRORS.WEAK_PASSWORD, pwErrors[0]);

      const sb = window.Nexeta.supabase;
      if (sb) {
        const { error } = await sb.auth.updateUser({ password: newPassword });
        if (error) {
          throw new AuthError(C.ERRORS.TOKEN_EXPIRED, error.message || 'Password update failed.');
        }
        return true;
      }

      // Mock Mode Fallback
      const validation = this.validateResetToken(token);
      if (!validation.valid)
        throw new AuthError(C.ERRORS.TOKEN_EXPIRED, 'Reset link is invalid or has expired.');

      const passwordHash = await hashPassword(newPassword);
      UserStore.update(validation.email, { passwordHash });

      const record = safeParse(localStorage.getItem(K.RESET_TOKEN));
      if (record) {
        record.used = true;
        localStorage.setItem(K.RESET_TOKEN, JSON.stringify(record));
      }
      return true;
    },

    /* ── Email Verification Architecture ─────────────────────────────────── */

    _prepareEmailVerification(email) {
      const token = generateToken('evr');
      localStorage.setItem(K.PENDING_VERIFY, JSON.stringify({
        token,
        email,
        issuedAt:  Date.now(),
        expiresAt: Date.now() + C.TTL.VERIFY_TOKEN,
        verified:  false,
      }));
      return token;
    },

    async verifyEmail(token) {
      const sb = window.Nexeta.supabase;
      if (sb) {
        const pending = safeParse(localStorage.getItem(K.PENDING_VERIFY)) || {};
        let email = pending.email;

        if (!email) {
          const params = new URLSearchParams(window.location.search);
          email = params.get('email');
        }

        if (!email) {
          throw new AuthError(C.ERRORS.TOKEN_INVALID, 'Pending registration details not found. Please log in.');
        }

        const { data, error } = await sb.auth.verifyOtp({
          email: email,
          token: token,
          type: 'signup'
        });

        if (error) {
          throw new AuthError(C.ERRORS.TOKEN_EXPIRED, error.message || 'Email verification failed.');
        }

        const profile = await this._getProfile(data.user.id);
        SM.sync(data.session, profile);
        localStorage.removeItem(K.PENDING_VERIFY);
        return true;
      }

      // Mock Mode Fallback
      const record = safeParse(localStorage.getItem(K.PENDING_VERIFY));
      if (!record || record.verified || Date.now() > record.expiresAt || record.token !== token) {
        throw new AuthError(C.ERRORS.TOKEN_INVALID, 'Verification link is invalid or has expired.');
      }

      record.verified = true;
      localStorage.setItem(K.PENDING_VERIFY, JSON.stringify(record));

      UserStore.update(record.email, { emailVerified: true });
      SM.update({ emailVerified: true });
      return true;
    },

    async resendVerification() {
      const sb = window.Nexeta.supabase;
      if (sb) {
        const pending = safeParse(localStorage.getItem(K.PENDING_VERIFY));
        if (!pending || !pending.email) {
          throw new AuthError(C.ERRORS.SESSION_NOT_FOUND, 'No pending registration found.');
        }
        const { error } = await sb.auth.resend({
          type: 'signup',
          email: pending.email
        });
        if (error) {
          throw new AuthError(C.ERRORS.RATE_LIMITED, error.message || 'Failed to resend email.');
        }
        return { success: true };
      }

      // Mock Mode Fallback
      const session = SM.get();
      const email = session ? session.email : (safeParse(localStorage.getItem(K.PENDING_VERIFY)) || {}).email;
      if (!email) throw new AuthError(C.ERRORS.SESSION_NOT_FOUND, 'Not authenticated.');

      const token = this._prepareEmailVerification(email);
      dispatch(C.EVENTS.VERIFY_SENT, { email, token });
      return { success: true };
    },

    /* ── Internal Helpers ─────────────────────────────────────────────────── */

    _migrateLegacySession() {
      const legacy = safeParse(localStorage.getItem(K.LEGACY_AUTH));
      if (!legacy) return;

      if (!SM.exists()) {
        const sessionUser = {
          userId:        'usr_demo_admin',
          name:          legacy.name      || 'Sarah Mitchell',
          email:         (legacy.email    || 'sarah@nexeta.ai').toLowerCase(),
          role:          legacy.role      || C.ROLES.ADMIN,
          plan:          legacy.plan      || 'PRO',
          avatar:        legacy.avatar    || '',
          emailVerified: true,
          onboardingDone: true,
        };
        SM.create(sessionUser, false);
        localStorage.setItem(K.USER_PROFILE, JSON.stringify(sessionUser));
      }
      localStorage.removeItem(K.LEGACY_AUTH);
    },

    async _seedDemoUser() {
      const DEMO_EMAIL    = 'sarah@nexeta.ai';
      const DEMO_PASSWORD = 'Nexeta@2026';

      const passwordHash = await hashPassword(DEMO_PASSWORD);

      const users = safeParse(localStorage.getItem('nexeta_users')) || {};
      const existing = users[DEMO_EMAIL];

      if (existing) {
        if (!existing.passwordHash) {
          existing.passwordHash  = passwordHash;
          existing.emailVerified = true;
          existing.role          = existing.role || C.ROLES.ADMIN;
          existing.plan          = existing.plan || 'PRO';
          users[DEMO_EMAIL]      = existing;
          localStorage.setItem('nexeta_users', JSON.stringify(users));
        }
        return;
      }

      const demoUser = {
        userId:        'usr_demo_admin',
        name:          'Sarah Mitchell',
        email:         DEMO_EMAIL,
        passwordHash,
        role:          C.ROLES.ADMIN,
        plan:          'PRO',
        country:       'United States',
        avatar:        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        emailVerified: true,
        createdAt:     Date.now(),
        onboardingDone: true,
      };
      try {
        UserStore.create(demoUser);
      } catch (e) {}
    },

    _startHeartbeat() {
      setInterval(() => {
        if (!SM.exists() && this._wasAuthenticated()) {
          dispatch(C.EVENTS.SESSION_EXPIRED);
          this._wasAuthenticated(false);
        } else if (SM.exists()) {
          SM.touch();
          this._wasAuthenticated(true);
        }
      }, C.TTL.AUTH_CHECK_INTERVAL);

      ['click', 'keydown', 'mousemove', 'scroll'].forEach(evt => {
        document.addEventListener(evt, () => {
          if (SM.exists()) SM.touch();
        }, { passive: true, capture: true });
      });
    },

    _wasAuthenticated(set) {
      if (set === undefined) return sessionStorage.getItem('_nxa') === '1';
      set ? sessionStorage.setItem('_nxa', '1') : sessionStorage.removeItem('_nxa');
    },

    _bindSessionEvents() {
      window.addEventListener('storage', (e) => {
        if (e.key === K.SESSION && e.newValue === null && e.oldValue !== null) {
          dispatch(C.EVENTS.SIGNED_OUT, { source: 'cross_tab' });
          window.location.href = C.REDIRECTS.AFTER_LOGOUT;
        }
      });

      window.addEventListener(C.EVENTS.SESSION_EXPIRED, () => {
        const currentPage = window.location.pathname.split('/').pop();
        if (C.PROTECTED_ROUTES.includes(currentPage)) {
          // Small delay so any pending analytics/save operations complete
          setTimeout(() => {
            window.location.href = C.REDIRECTS.UNAUTHENTICATED + '?reason=expired';
          }, 300);
        }
      });
    },
  };

  /* ── Expose ────────────────────────────────────────────────────────────── */
  window.Nexeta.AuthService = AuthService;

  /* ── Backward Compat: map Auth → AuthService ──────────────────────────── */
  // The existing modules use window.Nexeta.Auth.getCurrentUser() etc.
  // This bridge ensures zero breaking changes.
  window.Nexeta.Auth = {
    init()               { return AuthService.init(); },
    login(e, p, r)       { return AuthService.login(e, p, r); },
    signup(u, r)         { return AuthService.signup(u, r); },
    loginWithGoogle()    { return AuthService.loginWithGoogle(); },
    getCurrentUser()     { return AuthService.getCurrentUser(); },
    updateUser(updates)  { return AuthService.updateUser(updates); },
    logout()             { return AuthService.logout(); },
    isAuthenticated()    { return AuthService.isAuthenticated(); },
    getSession()         { return AuthService.getSession(); },
    getRole()            { return AuthService.getRole(); },
    hasRole(role)        { return AuthService.hasRole(role); },
  };

})();
