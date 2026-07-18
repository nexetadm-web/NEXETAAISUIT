/**
 * NEXETA AI MARKETING SUITE - Auth Module
 * Handles session storage and basic user profile state.
 */
(function() {
  const STORAGE_KEY = 'nexeta_auth';

  const defaultUser = {
    name: 'Sarah',
    email: 'sarah@nexeta.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    plan: 'PRO',
    joined: 'Jan 15, 2026'
  };

  const Auth = {
    init() {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
      }
    },

    getCurrentUser() {
      this.init();
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    },

    updateUser(updates) {
      const user = this.getCurrentUser();
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },

    logout() {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = 'login.html';
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.Auth = Auth;
})();
