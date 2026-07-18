/**
 * NEXETA AI MARKETING SUITE
 * Auth Module — Supabase Client Initializer
 * ─────────────────────────────────────────────────────────────────────────────
 * Establishes the connection to the Supabase backend.
 * Provides the central `window.Nexeta.supabase` instance.
 *
 * Config values can be overridden via localStorage keys:
 * - 'NEXETA_SUPABASE_URL'
 * - 'NEXETA_SUPABASE_ANON_KEY'
 * to avoid hardcoding production keys in version control.
 */

'use strict';

(function () {
  window.Nexeta = window.Nexeta || {};

  // Default configuration placeholders.
  // Replace these with your actual credentials from the Supabase Dashboard:
  // Project Settings -> API -> URL and anon public key.
  const DEFAULT_URL = 'https://your-project.supabase.co';
  const DEFAULT_KEY = 'your-anon-key-placeholder';

  // Read config from window.ENV (production), localStorage (dev override), or defaults
  const supabaseUrl = (window.ENV && window.ENV.SUPABASE_URL && window.ENV.SUPABASE_URL !== 'https://your-project.supabase.co')
    ? window.ENV.SUPABASE_URL
    : (localStorage.getItem('NEXETA_SUPABASE_URL') || DEFAULT_URL);

  const supabaseKey = (window.ENV && window.ENV.SUPABASE_ANON_KEY && window.ENV.SUPABASE_ANON_KEY !== 'your-anon-key-placeholder')
    ? window.ENV.SUPABASE_ANON_KEY
    : (localStorage.getItem('NEXETA_SUPABASE_ANON_KEY') || DEFAULT_KEY);

  let supabaseClient = null;

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      if (supabaseUrl && supabaseUrl !== DEFAULT_URL && supabaseKey && supabaseKey !== DEFAULT_KEY) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        console.log('[Nexeta Supabase] Initialized successfully.');
      } else {
        console.warn(
          '[Nexeta Supabase] Running with default placeholders. Authentication will be in mock mode.\n' +
          'To set real credentials without modifying files, run in the browser console:\n' +
          'localStorage.setItem("NEXETA_SUPABASE_URL", "https://your-project.supabase.co");\n' +
          'localStorage.setItem("NEXETA_SUPABASE_ANON_KEY", "your-actual-anon-key");\n' +
          'Then refresh the page.'
        );
      }
    } catch (err) {
      console.error('[Nexeta Supabase] Initialization error:', err);
    }
  } else {
    console.error('[Nexeta Supabase] SDK library not loaded. Make sure the CDN script is included.');
  }

  window.Nexeta.supabase = supabaseClient;
})();
