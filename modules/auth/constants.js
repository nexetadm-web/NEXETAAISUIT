/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all authentication-related constants.
 * No magic strings anywhere else in the auth module.
 *
 * Phase 1 — Foundation (no backend provider).
 * Phase 2 — UI wiring.
 * Phase 3 — Backend provider (Firebase / Supabase / custom).
 */

'use strict';

window.Nexeta = window.Nexeta || {};
window.Nexeta.AuthConstants = Object.freeze({

  /* ── Storage Keys ─────────────────────────────────────────────────────── */
  KEYS: Object.freeze({
    SESSION:           'nexeta_session',        // Active session object
    REFRESH_TOKEN:     'nexeta_refresh_token',  // Long-lived refresh token
    REMEMBER_ME:       'nexeta_remember_me',    // "Remember me" flag (boolean)
    PENDING_VERIFY:    'nexeta_pending_verify', // Email verification pending state
    RESET_TOKEN:       'nexeta_reset_token',    // Password reset token (transient)
    USER_PROFILE:      'nexeta_user_profile',   // Cached user profile
    AUTH_STATE:        'nexeta_auth_state',     // Last known auth state snapshot
    ONBOARDING_DONE:   'nexeta_onboarded',      // Has user completed onboarding?
    LEGACY_AUTH:       'nexeta_auth',           // v1 key — migrated on first load
  }),

  /* ── Session Durations (milliseconds) ────────────────────────────────── */
  TTL: Object.freeze({
    SESSION_DEFAULT:    2  * 60 * 60 * 1000,   // 2 hours  — standard session
    SESSION_REMEMBER:  30  * 24 * 60 * 60 * 1000, // 30 days — "Remember Me"
    REFRESH_TOKEN:     90  * 24 * 60 * 60 * 1000, // 90 days — refresh token
    RESET_TOKEN:       15  *       60 * 1000,   // 15 minutes — password reset
    VERIFY_TOKEN:      24  * 60 * 60 * 1000,   // 24 hours  — email verification
    AUTH_CHECK_INTERVAL: 5 *       60 * 1000,  // 5 minutes — periodic session check
  }),

  /* ── User Roles ───────────────────────────────────────────────────────── */
  ROLES: Object.freeze({
    ADMIN:       'admin',
    TEAM_MEMBER: 'team_member',
    CLIENT:      'client',
    VIEWER:      'viewer',      // read-only access
  }),

  /* ── Permissions Matrix (role → allowed route prefixes) ──────────────── */
  PERMISSIONS: Object.freeze({
    admin:       ['*'],                                      // all routes
    team_member: ['*'],                                      // all routes
    client:      ['*'],                                      // all routes
    viewer:      ['#dashboard'],
  }),

  /* ── Protected Routes (require authenticated session) ────────────────── */
  PROTECTED_ROUTES: Object.freeze([
    'dashboard.html',
  ]),

  /* ── Public Routes (always accessible) ───────────────────────────────── */
  PUBLIC_ROUTES: Object.freeze([
    'index.html',
    'login.html',
    'signup.html',
    'forgot-password.html',
    'reset-password.html',
    'verify-email.html',
  ]),

  /* ── Redirect Targets ─────────────────────────────────────────────────── */
  REDIRECTS: Object.freeze({
    AFTER_LOGIN:        'dashboard.html',
    AFTER_LOGOUT:       'login.html',
    AFTER_SIGNUP:       'dashboard.html',
    AFTER_VERIFY:       'dashboard.html',
    AFTER_RESET:        'login.html',
    UNAUTHENTICATED:    'login.html',
    UNAUTHORIZED:       'dashboard.html#dashboard',
  }),

  /* ── Password Policy ──────────────────────────────────────────────────── */
  PASSWORD: Object.freeze({
    MIN_LENGTH:         8,
    MAX_LENGTH:         128,
    REQUIRE_UPPERCASE:  true,
    REQUIRE_LOWERCASE:  true,
    REQUIRE_NUMBER:     true,
    REQUIRE_SYMBOL:     false,   // Set true when backend is connected
    BCRYPT_ROUNDS:      12,      // Used when server-side hashing is enabled
  }),

  /* ── Auth Events (dispatched on window) ──────────────────────────────── */
  EVENTS: Object.freeze({
    SIGNED_IN:          'nexeta:auth:signed_in',
    SIGNED_OUT:         'nexeta:auth:signed_out',
    SESSION_EXPIRED:    'nexeta:auth:session_expired',
    SESSION_REFRESHED:  'nexeta:auth:session_refreshed',
    USER_UPDATED:       'nexeta:auth:user_updated',
    VERIFY_SENT:        'nexeta:auth:verify_sent',
    RESET_SENT:         'nexeta:auth:reset_sent',
    ROLE_CHANGED:       'nexeta:auth:role_changed',
  }),

  /* ── Auth Errors ──────────────────────────────────────────────────────── */
  ERRORS: Object.freeze({
    INVALID_CREDENTIALS:   'INVALID_CREDENTIALS',
    SESSION_EXPIRED:       'SESSION_EXPIRED',
    SESSION_NOT_FOUND:     'SESSION_NOT_FOUND',
    TOKEN_EXPIRED:         'TOKEN_EXPIRED',
    TOKEN_INVALID:         'TOKEN_INVALID',
    EMAIL_NOT_VERIFIED:    'EMAIL_NOT_VERIFIED',
    EMAIL_ALREADY_EXISTS:  'EMAIL_ALREADY_EXISTS',
    WEAK_PASSWORD:         'WEAK_PASSWORD',
    RATE_LIMITED:          'RATE_LIMITED',
    UNAUTHORIZED:          'UNAUTHORIZED',
    NETWORK_ERROR:         'NETWORK_ERROR',
    UNKNOWN:               'UNKNOWN_ERROR',
  }),

});
