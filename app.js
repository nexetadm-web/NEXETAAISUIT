/**
 * NEXETA AI MARKETING SUITE - Premium Interactivity Script
 * Core Features: Particle Canvas, Spotlight Glows, Dashboard Simulators, Feature Search, Pricing Toggles, FAQs, Stat Count-ups
 */

document.addEventListener('DOMContentLoaded', () => {
  initSpotlightGlows();
  initHeaderScroll();
  initMobileMenu();
  initHeroParticles();
  initDashboardTabs();
  initFeatureExplorer();
  initPricingToggle();
  initFaqAccordion();
  initStatsObserver();
});

/* ================= 1. SPOTLIGHT GLASS CARDS GLOW ================= */
function initSpotlightGlows() {
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ================= 2. HEADER SCROLL STATE ================= */
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });
}

/* ================= 3. MOBILE MENU DRAWER ================= */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const closeBtn = document.getElementById('mobile-close');
  const drawer = document.getElementById('mobile-menu-drawer');
  const links = document.querySelectorAll('.mobile-link');

  const openDrawer = () => drawer.classList.add('active');
  const closeDrawer = () => drawer.classList.remove('active');

  toggleBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  links.forEach(link => link.addEventListener('click', closeDrawer));
}

/* ================= 4. HERO CANVAS PARTICLES ================= */
function initHeroParticles() {
  const canvas = document.getElementById('particles-js');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  const particles = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 15000));
  const connectionDistance = 110;
  const mouse = { x: null, y: null, radius: 150 };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce on boundaries
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interactive push/pull
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fill();
    }
  }

  // Generate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Track mouse coordinates
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle window resizing
  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  // Loop animation
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw and connect particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / connectionDistance) * 0.12;
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ================= 5. DASHBOARD TAB TRIGGERS & TYPING SIMULATORS ================= */
function initDashboardTabs() {
  const tabs = document.querySelectorAll('.mockup-tab');
  const contents = document.querySelectorAll('.tab-content');

  // Typing simulator variables
  let typingTimer = null;
  const adPromptText = "Create an Instagram Carousel Ad presenting a minimalist smartwatch with a 50% discount. Highlight AMOLED screen and a 14-day battery life.";
  const scriptPromptText = "Hook: 85% of people watch social media videos on mute. Here is how you can catch attention in the first 2 seconds using smart graphics...";

  function typeText(elementId, text, index = 0) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    if (index === 0) {
      container.innerHTML = '<span class="prompt-cursor"></span>';
    }

    if (index < text.length) {
      const cursor = container.querySelector('.prompt-cursor');
      const letter = document.createTextNode(text[index]);
      container.insertBefore(letter, cursor);
      
      typingTimer = setTimeout(() => {
        typeText(elementId, text, index + 1);
      }, 35);
    }
  }

  function startTabSimulators(tabId) {
    clearTimeout(typingTimer);
    if (tabId === 'tab-ads') {
      typeText('typing-ads-box', adPromptText);
    } else if (tabId === 'tab-script') {
      typeText('typing-script-box', scriptPromptText);
    }
  }

  // Initialize first active simulator
  startTabSimulators('tab-ads');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle Tab button
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Toggle Content visibility
      const targetTab = tab.getAttribute('data-tab');
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });

      // Start specific tab interactive simulators
      startTabSimulators(targetTab);
    });
  });
}

/* ================= 6. FEATURE EXPLORER GRID SEARCH & FILTERING ================= */
function initFeatureExplorer() {
  const searchInput = document.getElementById('features-search');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.feature-card');
  const gridContainer = document.getElementById('features-grid-container');

  let currentCategory = 'all';
  let searchQuery = '';

  // Create an inline "No Results" element if missing
  let noResultsEl = document.createElement('div');
  noResultsEl.className = 'no-results';
  noResultsEl.style.display = 'none';
  noResultsEl.innerHTML = `
    <i data-lucide="alert-circle" style="width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 1rem; display: inline-block;"></i>
    <h3>No matching AI tools found</h3>
    <p>Try searching for keywords like 'ads', 'video', 'copywriter', or switch categories.</p>
  `;
  gridContainer.appendChild(noResultsEl);
  if (window.lucide) window.lucide.createIcons();

  function applyFilter() {
    let visibleCount = 0;
    
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();

      const matchesCategory = (currentCategory === 'all' || category === currentCategory);
      const matchesSearch = (title.includes(searchQuery) || desc.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      noResultsEl.style.display = 'block';
    } else {
      noResultsEl.style.display = 'none';
    }
  }

  // Tab click listener
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-filter');
      applyFilter();
    });
  });

  // Keyword Search listener
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilter();
  });
}

/* ================= 7. PRICING TOGGLE SYSTEM ================= */
function initPricingToggle() {
  const toggleBtn = document.getElementById('billing-toggle');
  const monthlyLabel = document.getElementById('label-monthly');
  const yearlyLabel = document.getElementById('label-yearly');
  
  // Find price tags containing data attributes
  const priceCreator = document.getElementById('price-creator');
  const pricePro = document.getElementById('price-pro');
  const priceBusiness = document.getElementById('price-business');

  let isYearly = false;

  function updatePrices() {
    if (isYearly) {
      toggleBtn.classList.add('yearly');
      monthlyLabel.classList.remove('active');
      yearlyLabel.classList.add('active');
      
      // Update text values smoothly
      animatePriceChange(priceCreator, priceCreator.getAttribute('data-yearly'));
      animatePriceChange(pricePro, pricePro.getAttribute('data-yearly'));
      animatePriceChange(priceBusiness, priceBusiness.getAttribute('data-yearly'));
    } else {
      toggleBtn.classList.remove('yearly');
      monthlyLabel.classList.add('active');
      yearlyLabel.classList.remove('active');
      
      animatePriceChange(priceCreator, priceCreator.getAttribute('data-monthly'));
      animatePriceChange(pricePro, pricePro.getAttribute('data-monthly'));
      animatePriceChange(priceBusiness, priceBusiness.getAttribute('data-monthly'));
    }
  }

  function animatePriceChange(element, targetPrice) {
    if (!element) return;
    element.style.transform = 'scale(0.9)';
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.innerHTML = `$${targetPrice}<span>/mo</span>`;
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    }, 150);
  }

  toggleBtn.addEventListener('click', () => {
    isYearly = !isYearly;
    updatePrices();
  });
}

/* ================= 8. FAQ ACCORDION TRANSITIONS ================= */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other accordions
      items.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-content').style.maxHeight = '0px';
        }
      });

      // Toggle current accordion
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        item.classList.remove('active');
        content.style.maxHeight = "0px";
      }
    });
  });
}

/* ================= 9. SCROLL TRIGGER STAT COUNTUPS ================= */
function initStatsObserver() {
  const statsSection = document.querySelector('.trust-stats');
  if (!statsSection) return;

  const stats = [
    { id: 'stat-users', target: 150, suffix: 'K+', delay: 0 },
    { id: 'stat-content', target: 24, suffix: 'M+', delay: 0 },
    { id: 'stat-hours', target: 620, suffix: 'K', delay: 0 },
    { id: 'stat-roi', target: 10.2, suffix: 'x', delay: 0, decimal: true }
  ];

  let animated = false;

  function countUp(stat) {
    const el = document.getElementById(stat.id);
    if (!el) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = stat.target / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      start += increment;
      stepCount++;

      if (stepCount >= steps) {
        el.textContent = stat.target + stat.suffix;
        clearInterval(timer);
      } else {
        if (stat.decimal) {
          el.textContent = start.toFixed(1) + stat.suffix;
        } else {
          el.textContent = Math.floor(start) + stat.suffix;
        }
      }
    }, duration / steps);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        stats.forEach(stat => countUp(stat));
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}
