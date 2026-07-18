/**
 * NEXETA AI MARKETING SUITE - Prompt Library Module
 * Handles prompt storage, searching, adding, editing, deleting, categorizing, and favoriting.
 */
(function() {
  const STORAGE_KEY = 'nexeta_prompts';

  const defaultPrompts = [
    {
      id: 'prompt-1',
      title: 'High-Converting Facebook Ad Hook',
      content: 'Write a high-converting Facebook Ad copy headline for a product called [ProductName] that solves [Problem]. The target audience is [Audience]. Ensure the headline uses a curiosity loop hook.',
      category: 'Ads',
      favorite: true,
      custom: false
    },
    {
      id: 'prompt-2',
      title: 'Instagram Product Showcase Carousel',
      content: 'Create a 5-slide Instagram carousel layout script for [ProductName]. Describe the visual hook for each slide and draft a high-engagement caption matching the brand tone: [BrandTone].',
      category: 'Social Media',
      favorite: false,
      custom: false
    },
    {
      id: 'prompt-3',
      title: '3-Second Retention YouTube Hook',
      content: 'Draft a high-CTR, 3-second retention YouTube video intro script hook for [ProductName]. The script must grab attention immediately with a visual shock factor or key statistics.',
      category: 'Video',
      favorite: true,
      custom: false
    },
    {
      id: 'prompt-4',
      title: 'SEO Long-Form Product Review Article',
      content: 'Write a 1200-word SEO-optimized blog review article about [ProductName]. Include H2 headings, keyword inclusion (Smartwatch, Battery, Health tracker), and a final rating comparison.',
      category: 'SEO',
      favorite: false,
      custom: false
    },
    {
      id: 'prompt-5',
      title: 'Persuasive Cart Abandonment Email Campaign',
      content: 'Create a 3-part persuasive email campaign sequence to recover abandoned shopping carts for [ProductName]. Emphasize limited availability, a 10% coupon hook, and target pain points.',
      category: 'Email Marketing',
      favorite: false,
      custom: false
    }
  ];

  const PromptLibraryManager = {
    init() {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrompts));
      }
    },

    getPrompts() {
      this.init();
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    },

    savePrompts(prompts) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    },

    addPrompt(title, content, category) {
      const prompts = this.getPrompts();
      const newPrompt = {
        id: 'prompt-' + Date.now(),
        title,
        content,
        category,
        favorite: false,
        custom: true
      };
      prompts.unshift(newPrompt);
      this.savePrompts(prompts);
      return newPrompt;
    },

    updatePrompt(id, updates) {
      const prompts = this.getPrompts();
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        Object.assign(prompt, updates);
        this.savePrompts(prompts);
      }
    },

    deletePrompt(id) {
      let prompts = this.getPrompts();
      prompts = prompts.filter(p => p.id !== id);
      this.savePrompts(prompts);
    },

    toggleFavorite(id) {
      const prompts = this.getPrompts();
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        prompt.favorite = !prompt.favorite;
        this.savePrompts(prompts);
      }
    },

    searchAndFilter(query = '', category = 'All') {
      const prompts = this.getPrompts();
      return prompts.filter(p => {
        const matchesQuery = p.title.toLowerCase().includes(query.toLowerCase()) || 
                             p.content.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'All' ? true : (category === 'Favorites' ? p.favorite : p.category === category);
        return matchesQuery && matchesCategory;
      });
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.PromptLibraryManager = PromptLibraryManager;
})();
