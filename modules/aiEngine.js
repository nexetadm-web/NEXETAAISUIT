/**
 * NEXETA AI MARKETING SUITE - Central AI Generation Engine
 * Handles Gemini / OpenAI API calls and provides high-quality mock fallbacks.
 */
(function() {
  // Automatically remove invalid foreign characters (Chinese, Japanese, Korean) and corrupted Unicode symbols
  function cleanAndValidateResponse(text) {
    if (!text) return 'No response generated.';
    
    // Regex for Chinese (CJK), Japanese (Hiragana/Katakana/Kanji), Korean (Hangul), and corrupted Unicode symbols (\ufffd)
    const invalidCharsRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\ufffd]/g;
    
    let cleaned = text.replace(invalidCharsRegex, '');
    return cleaned;
  }

  const AIEngine = {
    // Generate complete GTM Marketing Strategy
    async generateMarketingStrategy(productName, description) {
      const keys = window.Nexeta.APIManager.getKeys();
      const brandKit = window.Nexeta.BrandKitManager.getBrandKit();
      
      const prompt = `You are a Chief Marketing Officer.
Create a comprehensive, premium, world-class Go-To-Market AI Marketing Strategy for:
- Product Name: ${productName}
- Product Description: ${description}
- Brand Voice Guidelines: Tone is ${brandKit.tone}. voiceDescription is ${brandKit.voiceDescription}.

You MUST return a JSON object with this exact structure:
{
  "marketingPlan": "An executive summary of the GTM approach and objectives.",
  "targetAudience": "3 detailed buyer personas and demographic targeting profiles.",
  "competitorAnalysis": "Direct competitor landscape mapping, positioning strategy, and core differentiators.",
  "contentCalendar": "A structured 4-week content themes outline (social channels, blog topics, and schedule).",
  "adStrategy": "Recommended paid advertising approach for Google, Meta, or LinkedIn including targeting parameters.",
  "seoPlan": "Top 10 high-intent search keywords, semantic hubs, and on-page optimization guide.",
  "emailCampaign": "A 3-step drip campaign flow (Subject lines, triggers, and body outline).",
  "salesFunnel": "Detailed funnel stage mapping (TOFU, MOFU, BOFU) with lead magnet suggestions.",
  "launchStrategy": "90-day launch roadmap, milestone checklists, and key success metrics."
}`;

      // If Gemini is active
      if (keys.gemini && keys.gemini.enabled && keys.gemini.key) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          });
          const data = await res.json();
          const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return JSON.parse(rawContent.trim());
        } catch (e) {
          console.error("Gemini API call failed, falling back to mock strategy generation.", e);
        }
      }

      // Mock fallback response
      return {
        marketingPlan: `Our GTM approach for ${productName} focuses on digital-first, value-led customer acquisition. We will position this offering as a premium, highly automated alternative to manual solutions, addressing the core problem of user inefficiency. Objectives include achieving a 15% conversion rate from lead magnet to trial and scaling monthly recurring users.`,
        targetAudience: `1. Agency Owners: Age 30-50, frustrated by staff resource constraints, seeking scalable AI generation.
2. In-house Marketing Directors: Age 28-45, managing tight content deadlines, focused on CTR and conversion metrics.
3. Freelance Copywriters & Strategists: Age 22-38, looking to double client output and accelerate brief creation speed.`,
        competitorAnalysis: `Direct competitors rely on generic chat interfaces (ChatGPT, Claude) without structured project folders or integrated automation queues. Our differentiators include:
- Brand kit matching on every generation.
- Dedicated workflows for ads, video outlines, and scheduled posts.
- Premium SaaS shell with project workspace asset locking.`,
        contentCalendar: `Week 1: Problem Definition & Frustration triggers (e.g. 'Why manual templates are dead').
Week 2: Product Walkthroughs & Speed demonstrations (showing 2-second creations).
Week 3: Social Proof & Trial signups (case studies, agency testimonials).
Week 4: Interactive QA & Urgency campaign (limited premium seat offerings).`,
        adStrategy: `Meta Ads: Target 'Marketing Managers', 'Ad Agency Owners', 'Hubspot users', ages 25-54, using conversion-objective campaigns.
Google Ads: Bid on high-intent phrases like 'automated marketing tools', 'AI ad creator for agencies', and 'SaaS marketing workspace'.`,
        seoPlan: `Keywords: 'AI marketing strategy', 'automated ad copy', 'SaaS project workspace', 'campaign brief generator'.
Plan: Publish 4 pillar articles (1500+ words each) link-mapped to the primary website hubs. Ensure structured schema markups.`,
        emailCampaign: `Email 1 (Day 1): Welcome & Setup wizard link. (Subject: 'Welcome to your AI workspace 🚀')
Email 2 (Day 3): How to generate your first ad brief in 10 seconds. (Subject: 'Stop copying templates...')
Email 3 (Day 7): Case study showcasing agency scaling. (Subject: 'How Sarah scaled her agency to 15 clients')`,
        salesFunnel: `TOFU: Lead magnet PDF guide: 'The 2026 Agency Automation Blueprint'.
MOFU: Interactive webinar, 14-day free trial, API sandbox playground.
BOFU: Direct 1-on-1 team onboarding, 20% annual discount offer.`,
        launchStrategy: `Days 1-30: Private Beta launch, gather feedback from first 100 users, optimize generation speed.
Days 31-60: Public Launch via Product Hunt and newsletter sponsors, scale search advertising bids.
Days 61-90: Enterprise tier release, agency portal rollouts, custom credit scaling package activations.`
      };
    },

    // Generate Ad Campaign structure
    async generateAd(productName, description, audience, platform, toneOverride = '') {
      const keys = window.Nexeta.APIManager.getKeys();
      const brandKit = window.Nexeta.BrandKitManager.getBrandKit();
      const activeTone = toneOverride || brandKit.tone;
      
      const brandInstructions = `Brand Voice: ${activeTone}. Brand Context: ${brandKit.voiceDescription}. Website: ${brandKit.website}`;
      
      const prompt = `You are a Senior SaaS Ad Copywriter.
Create a complete marketing ad campaign for:
- Product Name: ${productName}
- Product Description: ${description}
- Target Audience: ${audience}
- Platform: ${platform}
- Brand Voice Guidelines: ${brandInstructions}

You MUST return a JSON object with this exact structure:
{
  "primaryText": "Write a compelling, high-converting primary body copy matching the platform spec. Max 3 paragraphs.",
  "headlines": [
    "Catchy headline 1 (short, punchy)",
    "Catchy headline 2",
    "Catchy headline 3"
  ],
  "cta": "Appropriate CTA text (e.g. Shop Now, Learn More, Sign Up)",
  "hooks": [
    "Engagement hook variation 1 (first 3 seconds)",
    "Engagement hook variation 2",
    "Engagement hook variation 3"
  ],
  "variations": [
    "Ad variation copy 1 (different angle, e.g. benefit-focused)",
    "Ad variation copy 2 (e.g. social-proof or discount-focused)"
  ],
  "imagePrompt": "Detailed descriptive image generation prompt to create the perfect ad display matching this campaign.",
  "videoPrompt": "A micro script hook scene description for generating a video promotion asset."
}`;

      // 1. Try Gemini
      if (keys.gemini.enabled && keys.gemini.key) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt + "\n\nRespond ONLY with a valid JSON object matching the keys." }] }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return JSON.parse(text);
          }
        } catch (e) {
          console.error("Gemini Ad Gen Error, trying fallback:", e);
        }
      }

      // 2. Try OpenAI
      if (keys.openai.enabled && keys.openai.key) {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${keys.openai.key}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              response_format: { type: "json_object" },
              messages: [
                { role: 'system', content: 'You are an expert SaaS Copywriter. Respond only in JSON.' },
                { role: 'user', content: prompt }
              ]
            })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            return JSON.parse(text);
          }
        } catch (e) {
          console.error("OpenAI Ad Gen Error, trying fallback:", e);
        }
      }

      // 3. Fallback Smart Mock Engine
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      return this.getMockAd(productName, description, audience, platform, activeTone);
    },

    // AI Marketing Chat assistant
    async chat(message, history, persona = 'marketing') {
      const keys = window.Nexeta.APIManager.getKeys();
      const brandKit = window.Nexeta.BrandKitManager.getBrandKit();
      const brandInstructions = window.Nexeta.BrandKitManager.getBrandInstructions();

      const personaSystemPrompts = {
        marketing: "You are Nexeta AI, an advanced SaaS Marketing Assistant & Strategy Advisor. Your objective is to provide high-CTR ad concepts, strategy briefs, email pitches, and content suggestions. Emphasize value and outcomes.",
        copywriter: "You are Nexeta AI, a Copywriting Expert & conversion copy specialist. Your objective is to write highly persuasive email copy, SEO blog outlines, high-retention social media hooks, or product descriptions that convert readers into buyers.",
        'ad-specialist': "You are Nexeta AI, a Paid Ads Specialist. Your objective is to design platform-optimized ad copy (Meta, LinkedIn, Google, TikTok), headlines, CTAs, and hooks, targeting the correct demographics and platform formats.",
        seo: "You are Nexeta AI, an SEO Strategist & Search Engine Marketing expert. Your objective is to perform semantic keyword mapping, identify high-intent search terms, design article outlines, and optimize meta tag structures for search engine rankings."
      };

      const systemPrompt = `${personaSystemPrompts[persona] || personaSystemPrompts.marketing}
${brandInstructions}
Ensure all answers are extremely actionable, formatted beautifully, and match the specified brand tone.

CRITICAL LANGUAGE & CHARACTER RULES:

[LANGUAGE DETECTION RULES]
1. If the user writes in Urdu, respond in Urdu.
2. If the user writes in English, respond in English.
3. If the user writes in Roman Urdu, respond in Roman Urdu (e.g., Urdu written in Latin script like "aap kaise hain?").
4. Always match the language and script of the user's message.
5. Do not automatically translate English into Urdu.
6. Do not automatically translate Roman Urdu into Urdu.
7. Only change language when the user explicitly requests translation.

[URDU DISPLAY RULES]
1. When responding in Urdu, optimize text for Nastaliq Urdu display.
2. Use proper Urdu grammar and punctuation.
3. Use RTL formatting for Urdu responses only.

[CHARACTER FILTER RULES]
1. Never output Chinese characters.
2. Never output Japanese characters.
3. Never output Korean characters.
4. Never output corrupted Unicode symbols.
5. Automatically remove any invalid foreign characters.
6. Perform a final self-validation before generating your response to ensure full compliance.`;

      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history
      history.slice(-10).forEach(chat => {
        messages.push({
          role: chat.sender === 'user' ? 'user' : 'assistant',
          content: chat.text
        });
      });

      messages.push({ role: 'user', content: message });

      // 1. Try Groq
      if (keys.groq.enabled && keys.groq.key) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${keys.groq.key}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages
            })
          });
          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content || 'No response generated.';
            return cleanAndValidateResponse(rawContent);
          } else {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Groq API returned status ${res.status}`);
          }
        } catch (e) {
          console.error("Groq Chat Error:", e);
          throw new Error(`Groq API Error: ${e.message}`);
        }
      }

      // 2. Try Gemini
      if (keys.gemini.enabled && keys.gemini.key) {
        try {
          const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));
          // Fix first message role if it is system (Gemini beta systemInstruction support)
          let systemInstruction = undefined;
          if (messages[0].role === 'system') {
            systemInstruction = { parts: [{ text: messages[0].content }] };
            contents.shift(); // Remove system message from main contents
          }

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction
            })
          });
          if (res.ok) {
            const data = await res.json();
            const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
            return cleanAndValidateResponse(rawContent);
          } else {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Gemini API returned status ${res.status}`);
          }
        } catch (e) {
          console.error("Gemini Chat Error:", e);
          throw new Error(`Gemini API Error: ${e.message}`);
        }
      }

      // 3. Try OpenAI
      if (keys.openai.enabled && keys.openai.key) {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${keys.openai.key}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages
            })
          });
          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content || 'No response generated.';
            return cleanAndValidateResponse(rawContent);
          } else {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `OpenAI API returned status ${res.status}`);
          }
        } catch (e) {
          console.error("OpenAI Chat Error:", e);
          throw new Error(`OpenAI API Error: ${e.message}`);
        }
      }

      // Fallback message when no keys are configured
      throw new Error("No active AI key found. Please configure and enable an API key (Groq, Gemini, or OpenAI) in the API Hub.");
    },

    getMockAd(productName, description, audience, platform, tone) {
      const lowerProduct = productName.toLowerCase();
      let theme = 'general';
      if (lowerProduct.includes('watch') || lowerProduct.includes('smartwatch')) theme = 'smartwatch';
      else if (lowerProduct.includes('shoe') || lowerProduct.includes('footwear') || lowerProduct.includes('snkr')) theme = 'shoes';
      else if (lowerProduct.includes('saas') || lowerProduct.includes('software') || lowerProduct.includes('app')) theme = 'saas';

      const templates = {
        smartwatch: {
          primaryText: `Stop charging your watch every single night. 🔋\n\nMeet the ${productName}. Designed for active lives, it features an incredible 14-day battery life, high-res AMOLED display, and heart-rate monitoring synced directly to our secure AI suite.\n\nReady to upgrade? Get yours today for 50% OFF. Free shipping included!`,
          headlines: [
            "14-Day Battery Life Smartwatch 🔋",
            "Stop Charging Daily",
            "Track Fitness in Real Time"
          ],
          cta: "Shop Now",
          hooks: [
            "If you are charging your smartwatch every single night, you are doing it wrong.",
            "What if your watch could predict your fatigue levels before you even felt tired?",
            "Most fitness trackers are just expensive pedometers. This one is different."
          ],
          variations: [
            `Benefit-focused: No chargers in your gym bag. No battery anxiety. Just pure health analytics. Get the new ${productName} and take charge.`,
            `Social-proof: "The best smartwatch I have ever owned. The 14-day battery is a total game changer." - Sarah K.`
          ],
          imagePrompt: `Premium commercial product photography of ${productName} smartwatch, dark futuristic backdrop, neon blue glowing interface, wet stone rock floor, volumetric smoke, cinematic studio lighting, 8k resolution, shot on 85mm.`,
          videoPrompt: `Slow-motion macro shot of the fitness metrics loading on the AMOLED screen of ${productName}, steel body reflecting high contrast light, transitions to user running in morning fog.`
        },
        shoes: {
          primaryText: `Step into pure cloud-like comfort. ☁️\n\nIntroducing the new ${productName}. Engineered with responsive dual-density foam technology and lightweight breathable mesh, these sneakers are designed to handle your daily commute, marathon, and everything in between.\n\nOrder now and receive a free premium carrying pouch!`,
          headlines: [
            "Pure Cloud Comfort ☁️",
            "Engineered for Peak Performance",
            "Responsive Foam Sneakers"
          ],
          cta: "Buy Now",
          hooks: [
            "Are your feet sore after a 30-minute walk? That is not normal.",
            "The shoe industry has been hiding this foam technology for a decade.",
            "These sneakers make hard concrete feel like soft cloud cushions."
          ],
          variations: [
            `Feature-focused: Dual-density memory foam, mesh ventilation grids, and slip-resistant rubber tread. The ${productName} is designed to last.`,
            `Urgency-focused: Only 50 pairs left from our launch collection. Get your size before they are gone forever.`
          ],
          imagePrompt: `Epic shot of ${productName} running sneaker floating in mid-air, dynamic water splash and paint particles exploding in background, bright energetic lighting, HSL color grading, ultra-sharp detail.`,
          videoPrompt: `Close-up of dual-density foam sole compressing under running impact, high-speed camera rendering mud and water droplets floating away, athletic focus.`
        },
        saas: {
          primaryText: `Is your team wasting hours on manual marketing data entry? 📉\n\nMaximize your team's workflow output with the ${productName} platform. Sync campaigns, generate AI creative assets, and build optimized strategy roadmaps inside a single centralized workspace.\n\nStart your 14-day free trial today. No credit card required.`,
          headlines: [
            "Automate Your Marketing Workflows",
            "10x Asset Creation Speed 🚀",
            "Save 15 Hours Weekly"
          ],
          cta: "Sign Up",
          hooks: [
            "Stop wasting 3 hours a day copy-pasting campaign metrics into spreadsheets.",
            "The secret to scaling marketing agency portfolios without hiring more staff.",
            "We rebuilt marketing asset generation from the ground up."
          ],
          variations: [
            `Outcomes-focused: Join over 1,400 marketing teams using ${productName} to reduce campaign setup time by 80% and lower acquisition costs.`,
            `Offer-focused: Get full premium features, unlimited seats, and 100,000 generation credits completely free for 14 days.`
          ],
          imagePrompt: `Clean modern UI dashboard displaying SaaS marketing charts, glassmorphism design, colorful gradients, glowing metrics, premium minimal laptop on workspace table.`,
          videoPrompt: `Screen recording showing click-to-generate ad copies completing in 2 seconds, displaying visual feedback loader bar, fast transitions.`
        },
        general: {
          primaryText: `Discover the ultimate solution for your daily routine.\n\n${productName} is built to deliver unmatched quality, durability, and convenience. Designed specifically for ${audience}, it integrates seamlessly into your lifestyle to solve key bottlenecks and improve metrics.\n\nSpecial launch pricing active today! Click below to learn more.`,
          headlines: [
            `Meet the New ${productName}`,
            `The Ultimate Solution for ${audience}`,
            "Premium Quality Guaranteed"
          ],
          cta: "Learn More",
          hooks: [
            `If you are still struggling with your daily routines, you need to read this.`,
            `The innovative product that is changing how ${audience} handles their workflow.`,
            `Say goodbye to stress and hello to automated efficiency.`
          ],
          variations: [
            `Problem-focused: Tired of manual workarounds? ${productName} simplifies your life by offering structured tools built to scale.`,
            `Quality-focused: Made from high-grade materials and backed by a lifetime warranty. Experience the difference.`
          ],
          imagePrompt: `Studio product shot of ${productName}, clean minimalist styling, soft shadows, pastel color palette, warm corporate lighting, elegant composition.`,
          videoPrompt: `User unboxing ${productName} with a big smile, showing detailed product aesthetics, rotating 360-degree turntable shot.`
        }
      };

      // Custom tone adjustment
      const selected = templates[theme];
      if (tone === 'Humorous' || tone === 'Witty') {
        selected.headlines[1] = "No boring chargers here!";
        selected.hooks[0] = "Charging your watch daily is so 2015. Let's fix that.";
      } else if (tone === 'Casual') {
        selected.primaryText = selected.primaryText.replace('Introducing', 'Hey there! Check out').replace('Meet the', 'This is');
      }

      return selected;
    },

     getMockChatReply(message, brandKit) {
      const msg = message.toLowerCase();
      const isUrduInput = /[\u0600-\u06FF]/.test(message);

      if (isUrduInput) {
        return `### 📢 نیکیٹا اے آئی (Nexeta AI) مارکیٹنگ اسسٹنٹ

میں آپ کے برانڈ **${brandKit.name}** کے رہنما اصولوں کے مطابق کام کر رہا ہوں:
* **برانڈ کا نام:** ${brandKit.name}
* **برانڈ کا لہجہ:** ${brandKit.tone}
* **ویب سائٹ:** ${brandKit.website}

**تجویز کردہ کمانڈز:**
* *فیس بک اشتہار بنانے کے لیے "فیس بک اشتہار بنائیں" لکھیں۔*
* *بلاگ آؤٹ لائن شروع کرنے کے لیے "سمارٹ واچ کے لیے بلاگ آؤٹ لائن بنائیں" لکھیں۔*
* *کی ورڈز کی حکمت عملی کے بارے میں مشورہ طلب کریں۔*

براہ کرم بتائیں کہ میں آج آپ کی کیا مدد کر سکتا ہوں؟`;
      }
      
      if (msg.includes('facebook') || msg.includes('ad copy') || msg.includes('ad creator')) {
        return `### 📢 AI Ad Creator Setup

Here is a recommended Facebook ad campaign structure for your **${brandKit.name}** product:

* **Primary Text:**
  Are you tired of slow campaign creation? 🚀
  
  Our marketing engine handles high-conversions in just one click. Set up API Keys, configure your Brand Voice, and scale your brand assets effortlessly. 
  
  👉 **CTA:** Sign Up (Link)
  
* **Headlines:**
  * 10x Asset Creation Speed 🚀
  * Automate Campaign Setup
  
* **Image Prompt:**
  * *Modern UI dashboard displaying glowing metrics, glassmorphism design, clean workspace.*

_This ad copy aligns with your **${brandKit.tone}** brand tone and is saved inside your active project._`;
      }
      
      if (msg.includes('strategy') || msg.includes('advisor') || msg.includes('marketing strategy')) {
        return `### 📈 Strategic Growth Roadmap

Based on your brand parameters (**${brandKit.name}** | **${brandKit.tone}**), here is a 3-part growth roadmap:

1. **Leverage AI Social Assets:** 
   Utilize your scheduled posts queue inside the *Automation* tab to publish content 3x/week.
2. **Optimize CTR Hooks:**
   Use the *Prompt Library* to retrieve high-CTR retention hooks for short videos on TikTok/Instagram.
3. **Verify API Credentials:**
   Ensure your Stability AI key is active to automatically render product visual prompts.

Would you like to write an email copy or blog brief next?`;
      }

      return `Hello! I am your **${brandKit.name}** AI Marketing Assistant. 

I'm currently operating in standard mode using your brand kit guidelines:
* **Brand Name:** ${brandKit.name}
* **Tone of Voice:** ${brandKit.tone}
* **Target Website:** ${brandKit.website}

**Suggested Commands:**
* *Type "Create Facebook Ad" to generate ad creatives.*
* *Type "Generate blog outline for smartwatch" to start writing.*
* *Ask for keyword strategy optimization advice.*

Let me know what you would like to build!`;
    }
  };

  // Expose to window namespace
  window.Nexeta = window.Nexeta || {};
  window.Nexeta.AIEngine = AIEngine;
})();
