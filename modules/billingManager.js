/**
 * NEXETA AI MARKETING SUITE - Billing & Credits Manager
 * Manages SaaS credit balance, usage tracking, tier allocations, and transaction receipts.
 * Phase 4: Syncs with Supabase public.billing_usage table when authenticated.
 */
(function() {
  const STORAGE_KEY = 'nexeta_billing';

  const defaultBilling = {
    creditsUsed: 21550,
    creditsTotal: 100000,
    plan: 'PRO',
    resetDays: 6,
    apiCalls: 1420,
    apiLimit: 5000,
    imagesGenerated: 1280,
    imagesLimit: 3000,
    billingCycle: 'Monthly',
    invoiceHistory: [
      { id: 'inv-492', date: 'June 15, 2026', amount: '$49.00', status: 'Paid' },
      { id: 'inv-311', date: 'May 15, 2026', amount: '$49.00', status: 'Paid' },
      { id: 'inv-120', date: 'April 15, 2026', amount: '$49.00', status: 'Paid' }
    ]
  };

  const BillingManager = {
    init() {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBilling));
      }
    },

    /**
     * Map database row format to the local frontend camelCase format.
     */
    mapFromDb(row) {
      if (!row) return defaultBilling;
      return {
        creditsUsed: row.credits_used ?? 0,
        creditsTotal: row.credits_total ?? 100000,
        plan: row.plan ?? 'FREE',
        resetDays: row.reset_days ?? 30,
        apiCalls: row.api_calls ?? 0,
        apiLimit: row.api_limit ?? 5000,
        imagesGenerated: row.images_generated ?? 0,
        imagesLimit: row.images_limit ?? 3000,
        billingCycle: row.billing_cycle ?? 'Monthly',
        invoiceHistory: defaultBilling.invoiceHistory // Retained for visual mock history
      };
    },

    /**
     * Map local format back to the database row format.
     */
    mapToDb(data) {
      return {
        credits_used: data.creditsUsed,
        credits_total: data.creditsTotal,
        plan: data.plan,
        reset_days: data.resetDays,
        api_calls: data.apiCalls,
        api_limit: data.apiLimit,
        images_generated: data.imagesGenerated,
        images_limit: data.imagesLimit,
        billing_cycle: data.billingCycle
      };
    },

    getBillingData() {
      this.init();
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    },

    saveBillingData(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // Update remote Supabase database asynchronously if authenticated
      const sb = window.Nexeta.supabase;
      const user = window.Nexeta.AuthService?.getCurrentUser();
      if (sb && user) {
        const dbRow = this.mapToDb(data);
        sb.from('billing_usage')
          .update(dbRow)
          .eq('user_id', user.userId)
          .then(({ error }) => {
            if (error) console.error('[BillingManager] Sync failed:', error.message);
          });
      }

      // Update Analytics UI
      if (window.Nexeta && window.Nexeta.AnalyticsManager) {
        window.Nexeta.AnalyticsManager.updateDashboardStats();
      }
    },

    /**
     * Fetches and caches remote billing details from Supabase.
     */
    async syncWithRemote() {
      const sb = window.Nexeta.supabase;
      const user = window.Nexeta.AuthService?.getCurrentUser();
      if (!sb || !user) return;

      try {
        let { data, error } = await sb
          .from('billing_usage')
          .select('*')
          .eq('user_id', user.userId)
          .single();

        if (error && error.code === 'PGRST116') {
          // Record does not exist, initialize a default one for this user
          const defaultDbRow = {
            user_id: user.userId,
            credits_used: 0,
            credits_total: 100000,
            plan: user.plan || 'PRO',
            reset_days: 30,
            api_calls: 0,
            api_limit: 5000,
            images_generated: 0,
            images_limit: 3000,
            billing_cycle: 'Monthly'
          };
          const { data: inserted, error: insertError } = await sb
            .from('billing_usage')
            .insert(defaultDbRow)
            .select()
            .single();

          if (insertError) throw insertError;
          data = inserted;
        } else if (error) {
          throw error;
        }

        if (data) {
          const mapped = this.mapFromDb(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          
          if (window.Nexeta && window.Nexeta.AnalyticsManager) {
            window.Nexeta.AnalyticsManager.updateDashboardStats();
          }
        }
      } catch (err) {
        console.warn('[BillingManager] Remote sync error:', err.message);
      }
    },

    consumeCredits(amount) {
      const data = this.getBillingData();
      const remaining = data.creditsTotal - data.creditsUsed;
      if (remaining >= amount) {
        data.creditsUsed += amount;
        data.apiCalls += 1;
        this.saveBillingData(data);
        return true;
      }
      return false; // Out of credits
    },

    getRemainingCredits() {
      const data = this.getBillingData();
      return Math.max(0, data.creditsTotal - data.creditsUsed);
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.BillingManager = BillingManager;
})();
