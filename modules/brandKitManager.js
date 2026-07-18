/**
 * NEXETA AI MARKETING SUITE - Brand Kit Module
 * Manages brand profile, logo, color tokens, and injects guidelines into AI generations.
 */
(function() {
  const STORAGE_KEY = 'nexeta_brand_kit';

  const defaultBrandKit = {
    name: 'Nexeta',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&auto=format&fit=crop',
    primaryColor: '#3B82F6',
    secondaryColor: '#06B6D4',
    font: 'Outfit',
    website: 'https://nexeta.ai',
    tone: 'Professional',
    voiceDescription: 'Innovative, client-focused, bold, and clear. Avoid buzzwords. Emphasize value and outcomes.'
  };

  const BrandKitManager = {
    init() {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBrandKit));
      }
    },

    getBrandKit() {
      this.init();
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    },

    saveBrandKit(data) {
      const current = this.getBrandKit();
      const updated = { ...current, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Log activity
      if (window.Nexeta && window.Nexeta.AnalyticsManager) {
        window.Nexeta.AnalyticsManager.logActivity('Brand Kit updated', `Profile settings for "${updated.name}" saved.`);
      }

      return updated;
    },

    getBrandInstructions() {
      const kit = this.getBrandKit();
      return `Brand Profile Context:
- Brand Name: ${kit.name}
- Brand Tone of Voice: ${kit.tone}
- Brand Core Message: ${kit.voiceDescription}
- Website: ${kit.website}
- Emphasize this brand voice and style guidelines in all copy generation. Ensure it matches a "${kit.tone}" perspective.`;
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.BrandKitManager = BrandKitManager;
})();
