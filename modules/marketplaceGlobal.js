/**
 * NEXETA AI MARKETING SUITE - Marketplace Global Foundation
 * Manages database records, user installations, favorites, integrations configuration, and helper functions.
 */
(function() {
  const STORAGE_PREFIX = 'nexeta_market_';
  const KEYS = {
    INSTALLED: STORAGE_PREFIX + 'installed',
    ENABLED: STORAGE_PREFIX + 'enabled',
    FAVORITES: STORAGE_PREFIX + 'favorites',
    INTEGRATIONS: STORAGE_PREFIX + 'integrations',
    COMMUNITY: STORAGE_PREFIX + 'community_assets',
    FOLLOWS: STORAGE_PREFIX + 'followed_creators',
    HISTORY: STORAGE_PREFIX + 'history',
    REVIEWS: STORAGE_PREFIX + 'reviews'
  };

  // Static product database
  const marketplaceDatabase = {
    plugins: [
      {
        id: 'plug-1',
        name: 'Meta Ad CTR Optimizer',
        category: 'Marketing',
        desc: 'Analyzes target audience demographics and historical performance to rewrite headlines, descriptions, and CTA overlays for Meta campaigns to maximize click-through rates.',
        creator: 'Nexeta Labs',
        creatorId: 'c-nexeta',
        version: '2.4.1',
        versions: ['2.4.1', '2.3.0', '2.1.0'],
        installs: 2450,
        rating: 4.8,
        reviewsCount: 34,
        icon: 'zap',
        updated: '2026-06-15'
      },
      {
        id: 'plug-2',
        name: 'Google Ads Keyword Injector',
        category: 'SEO & Search',
        desc: 'Dynamically updates keyword bidding tables by scraping trending terms and user search intent matrices directly from Google Search Console.',
        creator: 'SearchEngine Pro',
        creatorId: 'c-seopro',
        version: '1.8.0',
        versions: ['1.8.0', '1.7.2', '1.5.0'],
        installs: 940,
        rating: 4.5,
        reviewsCount: 12,
        icon: 'search',
        updated: '2026-05-28'
      },
      {
        id: 'plug-3',
        name: 'Urdu Nastaliq Preprocessor',
        category: 'Design & Localization',
        desc: 'Automatically adjusts visual spacing, kerning parameters, and font scaling factors for premium Urdu Nastaliq calligraphy scripts inside visual image generators.',
        creator: 'Ahmad Tech',
        creatorId: 'c-ahmad',
        version: '3.1.2',
        versions: ['3.1.2', '3.0.0'],
        installs: 1250,
        rating: 4.9,
        reviewsCount: 56,
        icon: 'type',
        updated: '2026-06-20'
      },
      {
        id: 'plug-4',
        name: 'Stripe Dashboard Connector',
        category: 'Analytics & Revenue',
        desc: 'Securely syncs daily subscriber cohorts, MRR data, lifetime values, and churn analytics charts into the primary marketing suite dashboard.',
        creator: 'Stripe Inc.',
        creatorId: 'c-stripe',
        version: '4.0.2',
        versions: ['4.0.2', '4.0.0', '3.8.0'],
        installs: 5120,
        rating: 4.7,
        reviewsCount: 118,
        icon: 'credit-card',
        updated: '2026-06-01'
      },
      {
        id: 'plug-5',
        name: 'Claude Code Auditor',
        category: 'Development',
        desc: 'Scans script repositories for safety guidelines, efficiency, code quality, and formatting rules. Provides inline code recommendations.',
        creator: 'Anthropic Labs',
        creatorId: 'c-anthropic',
        version: '1.2.0',
        versions: ['1.2.0', '1.0.0'],
        installs: 3410,
        rating: 4.9,
        reviewsCount: 89,
        icon: 'terminal',
        updated: '2026-06-25'
      },
      {
        id: 'plug-6',
        name: 'Midjourney Prompt Refiner',
        category: 'Design & Localization',
        desc: 'Converts simple descriptors into dense, styled prompt sentences featuring aspect ratios, lighting rigs, styles, and rendering options.',
        creator: 'VisualArt Studio',
        creatorId: 'c-visualart',
        version: '2.0.1',
        versions: ['2.0.1', '1.9.0', '1.5.0'],
        installs: 4190,
        rating: 4.6,
        reviewsCount: 62,
        icon: 'image',
        updated: '2026-06-18'
      }
    ],
    templates: [
      {
        id: 'temp-1',
        name: 'Product Hunt Launch Sequence',
        category: 'Marketing',
        desc: 'A complete schedule of pre-launch announcements, day-of teaser stories, badge images copy, and founder Q&A templates.',
        creator: 'Vercel Team',
        installs: 3820,
        rating: 4.9,
        icon: 'rocket',
        layoutPreview: {
          title: 'Product Hunt Launch Campaign Blueprint',
          sections: [
            { label: 'T-Minus 7 Days: Teaser Post', body: '🚀 Exciting news! We are bringing [Product Name] to Product Hunt next week! Stay tuned for modern AI workflows...' },
            { label: 'Launch Day: Headline Hook', body: '🐱 We are live on Product Hunt! Check out [Product Name] - the next-gen AI automation suite built for enterprises...' },
            { label: 'Launch Day: First Comment', body: '👋 Hello Hunters! I\'m [Founder Name], and I built [Product Name] to solve the complex integration problems marketing agencies face...' }
          ]
        }
      },
      {
        id: 'temp-2',
        name: 'B2B SaaS Cold Outreach Campaign',
        category: 'Sales',
        desc: 'A high-converting 5-step follow-up email funnel designed for sales executives. Tailored variable insertion hooks.',
        creator: 'InboxHype',
        installs: 1950,
        rating: 4.4,
        icon: 'mail',
        layoutPreview: {
          title: 'SaaS Cold Email Outreach',
          sections: [
            { label: 'Email 1: Value Proposition', body: 'Subject: Quick question regarding marketing workflows at [Company Name]\n\nHi [First Name],\n\nI noticed you\'re running ad campaigns for [Competitor/Topic]. I wanted to share a framework that helped [Similar Company] boost conversion by 42%...' },
            { label: 'Email 2: Social Proof (T+2 days)', body: 'Hi [First Name],\n\nQuick follow-up on my last note. I forgot to mention that [Case Study Company] saw a ROI boost of 3x within 30 days of integrating our AI engine. Here\'s the breakdown...' }
          ]
        }
      },
      {
        id: 'temp-3',
        name: 'Viral Tech Twitter/X Thread',
        category: 'Social Media',
        desc: 'Structured hook matrices, case-study narrative frameworks, and viral sharing indicators optimized for tech Twitter/X accounts.',
        creator: 'TrendHacks',
        installs: 8200,
        rating: 4.7,
        icon: 'hash',
        layoutPreview: {
          title: 'Twitter Thread Template',
          sections: [
            { label: 'Tweet 1: Hook (High Curiosity)', body: 'I built an AI marketing agent that does 40 hours of marketing work in 5 minutes.\n\nHere is the step-by-step breakdown of how we did it (and how you can replicate it for $0):\n\n🧵 👇' },
            { label: 'Tweet 2: Context / The Problem', body: '1/ Most marketing agencies spend 70% of their billable hours writing and editing copy manually.\n\nThis bottlenecks scaling. We wanted to automate the entire funnel from asset ingestion to distribution...' }
          ]
        }
      },
      {
        id: 'temp-4',
        name: 'SaaS Black Friday Email Blast',
        category: 'Email Templates',
        desc: 'High-urgency promotional newsletters with interactive countdown placements and tier discount headers.',
        creator: 'Nexeta Labs',
        installs: 1450,
        rating: 4.6,
        icon: 'mail',
        layoutPreview: {
          title: 'Black Friday Campaign Layout',
          sections: [
            { label: 'Pre-Header Teaser', body: 'The biggest sale of the year starts NOW. Unlock 50% lifetime discount.' },
            { label: 'Main Offer Banner', body: '🏷 BLACK FRIDAY SPECIAL: Get 50% OFF Nexeta Pro Forever.\n\nUse Code: BF50PRO at checkout.' }
          ]
        }
      },
      {
        id: 'temp-5',
        name: 'High-Conversion Webinar Funnel',
        category: 'Funnel Templates',
        desc: 'Copywriting blueprints for registration pages, landing page headers, SMS notifications, and thank-you scripts.',
        creator: 'FunnelFlow',
        installs: 2150,
        rating: 4.8,
        icon: 'layers',
        layoutPreview: {
          title: 'Webinar Registration Blueprint',
          sections: [
            { label: 'Landing Page Title', body: 'Free Masterclass: How to Scale Your B2B Outreach Using Autonomous AI Agents' },
            { label: 'Register CTA Page', body: 'Secure your virtual seat today. Only 200 slots available. [Register Button]' }
          ]
        }
      }
    ],
    prompts: [
      {
        id: 'pr-1',
        name: 'CMO Strategic Marketing Audit',
        category: 'Strategy & GTM',
        tags: ['GTM', 'Audit', 'Strategic'],
        desc: 'Transforms raw company descriptions and marketing numbers into a complete competitive analysis, SWOT chart, and channels budget audit plan.',
        promptContent: 'Act as an expert Chief Marketing Officer. Analyze the following business description and metrics:\n\n[Business Description & Metrics]\n\nProvide:\n1. A comprehensive SWOT analysis tailored for Q3/Q4.\n2. Three primary marketing channels recommendations with estimated CPA.\n3. A 60-day launch schedule with key KPIs for each channel.',
        creator: 'ChiefGrowth',
        installs: 4610,
        rating: 4.9
      },
      {
        id: 'pr-2',
        name: 'High-CTR YouTube Hook Generator',
        category: 'Video Production',
        tags: ['Video', 'YouTube', 'Engagement'],
        desc: 'Produces 5 distinct styles of introductory video hook sentences (Curiosity, Contrast, Shock, Question, Story) based on target topic.',
        promptContent: 'Create 5 attention-grabbing YouTube video hooks (under 15 seconds speaking time) for a video about [Video Topic].\n\nStyles needed:\n1. The Curiosity Gap\n2. Shocking Statistic\n3. Counter-Intuitive Truth\n4. Direct Question\n5. Story Opener',
        creator: 'VideoMaster',
        installs: 3100,
        rating: 4.7
      },
      {
        id: 'pr-3',
        name: 'SEO Blog Outline & Keyword Map',
        category: 'SEO & Search',
        tags: ['SEO', 'Blogging', 'Keywords'],
        desc: 'Takes a target keyword and generates H1-H3 layout outline optimized for semantic SEO entities, search intent, and user queries.',
        promptContent: 'Act as an expert SEO Specialist. Generate a blog article outline optimized for the keyword "[Target Keyword]".\n\nInclude:\n- Secondary keyword injection suggestions for each heading.\n- Search intent description (Informational, Transactional, etc.).\n- H1, H2, and H3 titles.\n- Bullet point summary of what to cover under each heading.',
        creator: 'SearchEngine Pro',
        installs: 2790,
        rating: 4.8
      },
      {
        id: 'pr-4',
        name: 'AIDA Copywriting Enhancer',
        category: 'Copywriting',
        tags: ['Copywriting', 'AIDA', 'Marketing'],
        desc: 'Re-writes any basic product announcement into a high-converting text block formatted strictly to the AIDA framework.',
        promptContent: 'Rewrite the following draft using the Attention, Interest, Desire, Action (AIDA) copywriting framework.\n\nInput draft:\n[Insert Draft Content]\n\nMake sure the Action section contains a single, compelling Call to Action (CTA).',
        creator: 'Nexeta Labs',
        installs: 5120,
        rating: 4.9
      }
    ],
    automations: [
      {
        id: 'auto-1',
        name: 'Blog-to-Video Syndication',
        desc: 'Monitors RSS/Webflow posts, generates script summaries, and queues storyboard drafts inside Nexeta Video Creator.',
        trigger: 'New Webflow Article Published',
        steps: [
          { name: 'Fetch Post Content', service: 'WordPress/Webflow' },
          { name: 'Generate Script Summary', service: 'Gemini 1.5 Pro' },
          { name: 'Create Storyboard Video Project', service: 'Nexeta Video Engine' }
        ],
        creator: 'Nexeta Automation',
        installs: 1540,
        rating: 4.8
      },
      {
        id: 'auto-2',
        name: 'Meta Leads Slack Auto-Responder',
        desc: 'Instantly alerts your sales channels with AI-summarized insights whenever a prospect completes a Meta Form.',
        trigger: 'New Lead on Meta Ads Form',
        steps: [
          { name: 'Parse Lead Fields', service: 'Meta Lead Ads' },
          { name: 'Summarize Business Profile', service: 'Claude 3.5 Sonnet' },
          { name: 'Send Detailed Slack Message', service: 'Slack' }
        ],
        creator: 'SalesForce Team',
        installs: 2850,
        rating: 4.7
      },
      {
        id: 'auto-3',
        name: 'Shopify Low Stock Marketing alert',
        desc: 'Detects inventory drop-offs on Shopify, drafts social media scarcity posts, and queues an email broadcast draft.',
        trigger: 'Shopify Inventory Drops below 10 units',
        steps: [
          { name: 'Get Product Info', service: 'Shopify' },
          { name: 'Draft Scarcity Copy', service: 'OpenAI GPT-4o' },
          { name: 'Queue Email Campaign Draft', service: 'Mailchimp' }
        ],
        creator: 'Nexeta Labs',
        installs: 1100,
        rating: 4.5
      }
    ],
    integrations: [
      { id: 'int-openai', name: 'OpenAI', desc: 'Interface with GPT-4o and DALL-E 3 models for high-quality text & design generations.', category: 'AI Models', icon: 'zap' },
      { id: 'int-claude', name: 'Claude (Anthropic)', desc: 'Configure API keys to leverage Claude 3.5 Sonnet\'s advanced reasoning & coding capabilities.', category: 'AI Models', icon: 'brain' },
      { id: 'int-gemini', name: 'Gemini (Google)', desc: 'Activate Google\'s highly efficient Gemini 1.5 Pro models for large context workflows.', category: 'AI Models', icon: 'globe' },
      { id: 'int-gdrive', name: 'Google Drive', desc: 'Securely import asset catalogs, templates, and raw documents directly into the platform.', category: 'Cloud Storage', icon: 'folder-open' },
      { id: 'int-gdocs', name: 'Google Docs', desc: 'Export completed copy drafts directly into formatted Google Documents with a single click.', category: 'Productivity', icon: 'file-text' },
      { id: 'int-gmail', name: 'Gmail', desc: 'Send automated outreach campaigns and receive lead alerts directly inside your inbox.', category: 'Communication', icon: 'mail' },
      { id: 'int-slack', name: 'Slack', desc: 'Send real-time alerts, lead digests, and export graphics updates to dedicated channels.', category: 'Communication', icon: 'slack' },
      { id: 'int-discord', name: 'Discord', desc: 'Alert servers and channel groups on campaign statuses or system updates.', category: 'Communication', icon: 'message-square' },
      { id: 'int-zapier', name: 'Zapier', desc: 'Forward triggers and data tables to thousands of endpoints via Zapier Webhooks.', category: 'Automation', icon: 'workflow' },
      { id: 'int-notion', name: 'Notion', desc: 'Sync your content calendar tables, prompt notes, and copywriting pipelines.', category: 'Productivity', icon: 'database' },
      { id: 'int-trello', name: 'Trello', desc: 'Automatically construct tasks and tracking boards on new marketing campaign launches.', category: 'Productivity', icon: 'columns' },
      { id: 'int-airtable', name: 'Airtable', desc: 'Log campaign metrics, clicks, generated copy, and feedback rankings in relational databases.', category: 'Productivity', icon: 'grid' },
      { id: 'int-wordpress', name: 'WordPress', desc: 'Publish generated articles and blogs directly to your self-hosted site in draft format.', category: 'E-commerce & Web', icon: 'globe' },
      { id: 'int-shopify', name: 'Shopify', desc: 'Pull active catalog specifications, images, and prices into BrandKit layouts.', category: 'E-commerce & Web', icon: 'shopping-bag' },
      { id: 'int-meta', name: 'Meta Ads', desc: 'Upload campaigns directly to Facebook/Instagram Ads Manager and fetch real-time CPA.', category: 'Marketing & Ads', icon: 'megaphone' },
      { id: 'int-linkedin', name: 'LinkedIn', desc: 'Publish company announcements and B2B newsletters directly to your feed.', category: 'Marketing & Ads', icon: 'share-2' },
      { id: 'int-twitter', name: 'X (Twitter)', desc: 'Automate tweet campaigns, thread syndication, and trending hashtags monitoring.', category: 'Marketing & Ads', icon: 'hash' }
    ],
    community: [
      {
        id: 'com-1',
        name: 'Ad Creator Figma Layout Kit',
        type: 'templates',
        desc: 'Figma templates containing accurate grids matching generated advertisement specifications for all modern networks.',
        creator: 'DesignGrid',
        creatorId: 'u-designgrid',
        downloads: 6710,
        rating: 4.8,
        reviewsCount: 42,
        icon: 'layout',
        updated: '2026-06-10'
      },
      {
        id: 'com-2',
        name: 'SEO Content Planner Notion Hub',
        type: 'templates',
        desc: 'All-in-one Notion workspace designed to map keywords, manage author assignments, and track campaign schedules.',
        creator: 'MarieNotion',
        creatorId: 'u-marienotion',
        downloads: 11200,
        rating: 4.9,
        reviewsCount: 96,
        icon: 'database',
        updated: '2026-06-22'
      },
      {
        id: 'com-3',
        name: 'E-commerce Ad Copy Prompt Kit',
        type: 'prompts',
        desc: '15 tailored prompts for Shopify store owners to draft product bundles ads, catalog hooks, and discount emails.',
        creator: 'ShopifyGrowth',
        creatorId: 'u-sopgrow',
        downloads: 4100,
        rating: 4.7,
        reviewsCount: 18,
        icon: 'book-open',
        updated: '2026-06-14'
      },
      {
        id: 'com-4',
        name: 'Webflow Content Auto-Updater Plugin',
        type: 'plugins',
        desc: 'Synchronizes your local brand kits assets folder directly into Webflow CMS database collections hourly.',
        creator: 'WebflowHacks',
        creatorId: 'u-wfhacks',
        downloads: 1840,
        rating: 4.6,
        reviewsCount: 22,
        icon: 'zap',
        updated: '2026-06-24'
      }
    ]
  };

  // Safe localStorage helper
  const storage = {
    get(key, defaultValue = []) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('LocalStorage read error for key:', key, e);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('LocalStorage write error for key:', key, e);
      }
    }
  };

  const MarketplaceGlobal = {
    getDatabase() {
      return marketplaceDatabase;
    },

    getInstalledItems() {
      return storage.get(KEYS.INSTALLED, ['plug-1', 'int-openai', 'int-gemini']); // Pre-install a couple for realistic feel
    },

    installItem(id) {
      const installed = this.getInstalledItems();
      if (!installed.includes(id)) {
        installed.push(id);
        storage.set(KEYS.INSTALLED, installed);
        this.logHistory(id, 'install');
        this.logAnalytics('Asset Installed', `Asset ID ${id} was installed successfully.`);
      }
    },

    uninstallItem(id) {
      let installed = this.getInstalledItems();
      installed = installed.filter(itemId => itemId !== id);
      storage.set(KEYS.INSTALLED, installed);
      
      // Also turn off enabled state if it was enabled
      this.disableItem(id);
      
      this.logHistory(id, 'uninstall');
      this.logAnalytics('Asset Uninstalled', `Asset ID ${id} was uninstalled.`);
    },

    getEnabledItems() {
      return storage.get(KEYS.ENABLED, ['plug-1', 'int-openai']);
    },

    enableItem(id) {
      const enabled = this.getEnabledItems();
      if (!enabled.includes(id)) {
        enabled.push(id);
        storage.set(KEYS.ENABLED, enabled);
        this.logHistory(id, 'enable');
        this.logAnalytics('Asset Enabled', `Asset ID ${id} was enabled.`);
      }
    },

    disableItem(id) {
      let enabled = this.getEnabledItems();
      enabled = enabled.filter(itemId => itemId !== id);
      storage.set(KEYS.ENABLED, enabled);
      this.logHistory(id, 'disable');
      this.logAnalytics('Asset Disabled', `Asset ID ${id} was disabled.`);
    },

    getFavorites() {
      return storage.get(KEYS.FAVORITES, ['temp-1', 'pr-1']);
    },

    toggleFavorite(id) {
      const favs = this.getFavorites();
      const idx = favs.indexOf(id);
      let status = false;
      if (idx === -1) {
        favs.push(id);
        status = true;
      } else {
        favs.splice(idx, 1);
      }
      storage.set(KEYS.FAVORITES, favs);
      return status;
    },

    getIntegrationConfigs() {
      const defaultConfigs = {};
      marketplaceDatabase.integrations.forEach(int => {
        defaultConfigs[int.id] = {
          connected: int.id === 'int-openai' || int.id === 'int-gemini',
          apiKey: int.id === 'int-openai' || int.id === 'int-gemini' ? '••••••••••••••••••••••••••••' : '',
          syncSchedule: 'hourly',
          permissions: ['read', 'write'],
          settings: {
            modelName: int.id === 'int-openai' ? 'gpt-4o' : int.id === 'int-gemini' ? 'gemini-1.5-pro' : ''
          }
        };
      });
      
      // Merge with stored values
      const stored = storage.get(KEYS.INTEGRATIONS, {});
      return { ...defaultConfigs, ...stored };
    },

    saveIntegrationConfig(id, config) {
      const allConfigs = this.getIntegrationConfigs();
      allConfigs[id] = { ...allConfigs[id], ...config };
      storage.set(KEYS.INTEGRATIONS, allConfigs);
      this.logAnalytics('Integration Updated', `Configured integration settings for ${id}.`);
    },

    getCommunityAssets() {
      const defaults = marketplaceDatabase.community;
      const uploaded = storage.get(KEYS.COMMUNITY, []);
      return [...defaults, ...uploaded];
    },

    uploadCommunityAsset(asset) {
      const assets = storage.get(KEYS.COMMUNITY, []);
      const newAsset = {
        id: 'com-' + Date.now(),
        downloads: 0,
        rating: 5.0,
        reviewsCount: 0,
        updated: new Date().toISOString().split('T')[0],
        ...asset
      };
      assets.unshift(newAsset);
      storage.set(KEYS.COMMUNITY, assets);
      this.logAnalytics('Community Asset Shared', `Shared community asset: ${newAsset.name}`);
      return newAsset;
    },

    getFollowedCreators() {
      return storage.get(KEYS.FOLLOWS, ['c-nexeta']);
    },

    toggleFollowCreator(creatorId) {
      const follows = this.getFollowedCreators();
      const idx = follows.indexOf(creatorId);
      let followed = false;
      if (idx === -1) {
        follows.push(creatorId);
        followed = true;
      } else {
        follows.splice(idx, 1);
      }
      storage.set(KEYS.FOLLOWS, follows);
      this.logAnalytics(followed ? 'Creator Followed' : 'Creator Unfollowed', `Updated follow state for ${creatorId}`);
      return followed;
    },

    getHistory() {
      return storage.get(KEYS.HISTORY, [
        { id: 'h-1', itemId: 'plug-1', type: 'install', timestamp: '2026-06-27T12:00:00Z' },
        { id: 'h-2', itemId: 'plug-1', type: 'enable', timestamp: '2026-06-27T12:05:00Z' },
        { id: 'h-3', itemId: 'int-openai', type: 'connect', timestamp: '2026-06-27T10:00:00Z' }
      ]);
    },

    logHistory(itemId, type) {
      const history = this.getHistory();
      history.unshift({
        id: 'h-' + Date.now(),
        itemId,
        type,
        timestamp: new Date().toISOString()
      });
      storage.set(KEYS.HISTORY, history.slice(0, 100)); // Cap logs at 100
    },

    getReviews(itemId) {
      const storedReviews = storage.get(KEYS.REVIEWS, {});
      const defaults = [
        { reviewer: 'Alex M.', rating: 5, comment: 'Saves me hours of fine-tuning Facebook ads! Highly recommend.', date: '2026-06-20' },
        { reviewer: 'Sarah K.', rating: 4, comment: 'Very useful, though a search integration would make it perfect.', date: '2026-06-18' }
      ];
      return storedReviews[itemId] || defaults;
    },

    addReview(itemId, review) {
      const storedReviews = storage.get(KEYS.REVIEWS, {});
      if (!storedReviews[itemId]) {
        storedReviews[itemId] = this.getReviews(itemId);
      }
      const newReview = {
        reviewer: review.reviewer || 'Anonymous',
        rating: Number(review.rating) || 5,
        comment: review.comment || '',
        date: new Date().toISOString().split('T')[0]
      };
      storedReviews[itemId].unshift(newReview);
      storage.set(KEYS.REVIEWS, storedReviews);

      // Dynamically recalculate average rating for that product if present in DB
      this.recalculateRating(itemId, storedReviews[itemId]);
      
      this.logAnalytics('Review Added', `Submitted a ${newReview.rating}-star review for ${itemId}.`);
      return newReview;
    },

    recalculateRating(itemId, reviews) {
      const db = marketplaceDatabase;
      // Search in plugins
      const plugin = db.plugins.find(p => p.id === itemId);
      if (plugin) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        plugin.rating = Number((sum / reviews.length).toFixed(1));
        plugin.reviewsCount = reviews.length;
        return;
      }
      // Search in community
      const comm = db.community.find(c => c.id === itemId);
      if (comm) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        comm.rating = Number((sum / reviews.length).toFixed(1));
        comm.reviewsCount = reviews.length;
      }
    },

    logAnalytics(action, details) {
      if (window.Nexeta && window.Nexeta.AnalyticsManager) {
        window.Nexeta.AnalyticsManager.logActivity(action, details);
      } else {
        console.log(`[Nexeta Analytics] Action: ${action} | Details: ${details}`);
      }
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.MarketplaceGlobal = MarketplaceGlobal;
})();
