/**
 * NEXETA AI MARKETING SUITE - Generation History Manager
 * Maintains persistent records of all user chat sessions, ad outputs, and prompt executions.
 */
(function() {
  const HISTORY_KEY = 'nexeta_generation_history';

  const defaultHistory = [
    {
      id: 'hist-1',
      timestamp: '6/24/2026, 11:30:15 AM',
      type: 'Ad Campaign',
      title: 'Meta smartwatch Q3 ad specs',
      content: 'Primary Text: Stop charging your watch every single night. 🔋\nMeet the Smartwatch Q3...\nHeadlines: 14-Day Battery Life, Stop Charging Daily'
    },
    {
      id: 'hist-2',
      timestamp: '6/23/2026, 3:15:22 PM',
      type: 'Chat Session',
      title: 'Email sequence brainstorm with Copywriter',
      content: 'User: Draft a follow up email sequence for cart abandonments.\nAssistant: Here is a 3-part sequence:\nEmail 1: Forgot something?\nEmail 2: 10% Discount inside...'
    },
    {
      id: 'hist-3',
      timestamp: '6/22/2026, 5:40:02 PM',
      type: 'Prompt Execution',
      title: 'AIDA model for landing page hook',
      content: 'Title: High-Converting Landing Page Hook\nPrompt: Write an AIDA copy for Nexeta AI suite targeting small agency leads.'
    }
  ];

  const HistoryManager = {
    init() {
      if (!localStorage.getItem(HISTORY_KEY)) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(defaultHistory));
      }
    },

    getHistory() {
      this.init();
      return JSON.parse(localStorage.getItem(HISTORY_KEY));
    },

    saveHistory(history) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    },

    addHistoryItem(type, title, content) {
      const history = this.getHistory();
      const newItem = {
        id: 'hist-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        type,
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
      };
      history.unshift(newItem);
      this.saveHistory(history);

      // Log in Activity log
      if (window.Nexeta && window.Nexeta.AnalyticsManager) {
        window.Nexeta.AnalyticsManager.logActivity(
          'History Logged',
          `Generation history for "${title}" (${type}) was cataloged.`
        );
      }

      return newItem;
    },

    deleteHistoryItem(id) {
      let history = this.getHistory();
      history = history.filter(item => item.id !== id);
      this.saveHistory(history);
    },

    clearAllHistory() {
      this.saveHistory([]);
    },

    searchAndFilter(query = '', type = 'All') {
      const history = this.getHistory();
      const lowerQuery = query.toLowerCase().trim();
      return history.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(lowerQuery) || 
                             item.content.toLowerCase().includes(lowerQuery);
        const matchesType = type === 'All' || item.type === type;
        return matchesQuery && matchesType;
      });
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.HistoryManager = HistoryManager;
})();
