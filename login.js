/**
 * NEXETA AI MARKETING SUITE — Login Page Controller
 * Phase 2: Production Authentication
 * ─────────────────────────────────────────────────────────────────────────────
 * Wires the login form to the Phase 1 AuthService.
 * Handles: validation, loading states, error display, remember-me, redirect.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initSpotlightGlows();
  initLoginParticles();
  initPasswordVisibility();
  initFormValidation();
  initSocialButtonNotices();
  prefillRememberMe();
});

/* ─── 1. SPOTLIGHT GLASS CARD GLOW ───────────────────────────────────────── */
function initSpotlightGlows() {
  document.querySelectorAll('.glass-card, .floating-glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
    });
  });
}

/* ─── 2. CANVAS PARTICLES ─────────────────────────────────────────────────── */
function initLoginParticles() {
  const canvas = document.getElementById('particles-js');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = (canvas.width  = canvas.offsetWidth);
  let h = (canvas.height = canvas.offsetHeight);
  const particles = [];
  const COUNT = Math.min(50, Math.floor((w * h) / 18000));
  const DIST  = 120;
  const mouse = { x: null, y: null, r: 150 };

  class P {
    constructor() {
      this.x  = Math.random() * w;
      this.y  = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < mouse.r) { const f = (mouse.r - d) / mouse.r; this.x += (dx/d)*f*1.2; this.y += (dy/d)*f*1.2; }
      }
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(59,130,246,0.35)'; ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new P());
  window.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  window.addEventListener('resize', () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; });

  (function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p, i) => {
      p.update(); p.draw();
      for (let j = i+1; j < particles.length; j++) {
        const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < DIST) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${(1-d/DIST)*0.12})`; ctx.lineWidth = 0.85; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(animate);
  })();
}

/* ─── 3. PASSWORD SHOW / HIDE ─────────────────────────────────────────────── */
function initPasswordVisibility() {
  const btn   = document.getElementById('toggle-password');
  const input = document.getElementById('password');
  if (!btn || !input) return;

  const eye    = btn.querySelector('.eye-icon');
  const eyeOff = btn.querySelector('.eye-off-icon');

  btn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.style.display    = show ? 'none'  : '';
    eyeOff.style.display = show ? ''      : 'none';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
}

/* ─── 4. REMEMBER ME PREFILL ──────────────────────────────────────────────── */
function prefillRememberMe() {
  const rememberMe   = localStorage.getItem('nexeta_remember_me');
  const checkbox     = document.getElementById('remember-me');
  const emailInput   = document.getElementById('email');
  const profileRaw   = localStorage.getItem('nexeta_user_profile');

  if (checkbox && rememberMe === 'true') {
    checkbox.checked = true;
    // Prefill email if available
    if (emailInput && profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.email) emailInput.value = profile.email;
      } catch { /* ignore */ }
    }
  }
}

/* ─── 5. FORM VALIDATION & AUTH ───────────────────────────────────────────── */
function initFormValidation() {
  const form          = document.getElementById('login-form');
  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberBox   = document.getElementById('remember-me');
  const submitBtn     = document.getElementById('signin-btn');
  const emailErr      = document.getElementById('email-error');
  const passwordErr   = document.getElementById('password-error');
  const globalErr     = document.getElementById('global-error');

  if (!form) return;

  // Clear errors on input
  emailInput?.addEventListener('input', () => clearError(emailInput, emailErr));
  passwordInput?.addEventListener('input', () => clearError(passwordInput, passwordErr));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const email      = emailInput.value.trim();
    const password   = passwordInput.value;
    const rememberMe = rememberBox?.checked || false;

    setLoading(true);
    hideGlobalError();

    try {
      // Use Phase 1 AuthService
      await window.Nexeta.AuthService.login(email, password, rememberMe);

      // Success state
      setSuccess();

      setTimeout(() => {
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity    = '0';
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 400);
      }, 700);

    } catch (err) {
      setLoading(false);
      showGlobalError(getFriendlyError(err));
      shakeButton();
    }
  });

  /* ── Validators ─────────────────────────────────────────────────────────── */

  function validateInputs() {
    let ok = true;
    const email    = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    if (!email) {
      showError(emailInput, emailErr, 'Email address is required.');
      ok = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showError(emailInput, emailErr, 'Please enter a valid email address.');
      ok = false;
    }

    if (!password) {
      showError(passwordInput, passwordErr, 'Password is required.');
      ok = false;
    }

    return ok;
  }

  function showError(input, errEl, msg) {
    input?.classList.add('input-error');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    // Shake animation
    if (input) { input.style.animation = 'none'; setTimeout(() => { input.style.animation = 'shake 0.4s ease'; }, 10); }
  }

  function clearError(input, errEl) {
    input?.classList.remove('input-error');
    if (errEl) errEl.style.display = 'none';
    hideGlobalError();
  }

  /* ── Loading / Success States ───────────────────────────────────────────── */

  function setLoading(active) {
    if (!submitBtn) return;
    const text    = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.signin-spinner');

    submitBtn.disabled = active;
    if (active) {
      submitBtn.classList.add('loading');
      if (text)    text.textContent = 'Signing In...';
      if (spinner) spinner.style.display = 'inline-block';
    } else {
      submitBtn.classList.remove('loading');
      if (text)    text.textContent = 'Sign In';
      if (spinner) spinner.style.display = '';
    }
  }

  function setSuccess() {
    if (!submitBtn) return;
    submitBtn.disabled = true;
    const text = submitBtn.querySelector('.btn-text');
    submitBtn.style.background  = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    submitBtn.style.boxShadow   = '0 0 30px rgba(16,185,129,0.5)';
    if (text) text.textContent  = '✓ Access Granted';
    submitBtn.classList.remove('loading');
    const spinner = submitBtn.querySelector('.signin-spinner');
    if (spinner) spinner.style.display = 'none';
  }

  function shakeButton() {
    if (!submitBtn) return;
    submitBtn.style.animation = 'none';
    setTimeout(() => { submitBtn.style.animation = 'shake 0.4s ease'; }, 10);
  }

  /* ── Global Error Banner ────────────────────────────────────────────────── */

  function showGlobalError(msg) {
    if (!globalErr) return;
    globalErr.textContent    = msg;
    globalErr.style.display  = 'flex';
    globalErr.style.animation = 'none';
    setTimeout(() => { globalErr.style.animation = 'fadeInDown 0.3s ease'; }, 10);
  }

  function hideGlobalError() {
    if (globalErr) globalErr.style.display = 'none';
  }

  /* ── Error Message Mapping ──────────────────────────────────────────────── */

  function getFriendlyError(err) {
    if (!err) return 'Something went wrong. Please try again.';
    const C = window.Nexeta?.AuthConstants?.ERRORS || {};
    if (err.code === C.INVALID_CREDENTIALS) {
      return 'Incorrect email or password. Please try again.';
    }
    if (err.code === C.SESSION_EXPIRED) {
      return 'Your session has expired. Please sign in again.';
    }
    if (err.code === C.EMAIL_NOT_VERIFIED) {
      return 'Please verify your email address before signing in.';
    }
    if (err.code === C.RATE_LIMITED) {
      return 'Too many attempts. Please wait a few minutes and try again.';
    }
    return err.message || 'Something went wrong. Please try again.';
  }
}

/* ─── 6. SOCIAL BUTTON WIRING ────────────────────────────────────────────── */
function initSocialButtonNotices() {
  const googleBtn = document.getElementById('social-btn-google');
  if (googleBtn) {
    googleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await window.Nexeta.AuthService.loginWithGoogle();
      } catch (err) {
        showToast(err.message || 'Google Sign-In failed.', 'error');
      }
    });
  }

  // Other social buttons show coming soon notice
  document.querySelectorAll('.btn-social:not(#social-btn-google)').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('This social login provider is coming soon.', 'info');
    });
  });
}

/* ─── 7. TOAST NOTIFICATION ──────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const existing = document.getElementById('nexeta-toast');
  if (existing) existing.remove();

  const colors = {
    info:    { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  icon: 'ℹ' },
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', icon: '✓' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  icon: '✕' },
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.id = 'nexeta-toast';
  toast.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
    background:${c.bg}; border:1px solid ${c.border};
    color:#e0e7ff; font-family:system-ui,sans-serif; font-size:0.85rem;
    padding:0.75rem 1.25rem; border-radius:12px;
    backdrop-filter:blur(12px); z-index:99999;
    display:flex; align-items:center; gap:0.5rem;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:fadeInUp 0.3s ease; white-space:nowrap;
  `;
  toast.innerHTML = `<span style="font-weight:700;">${c.icon}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'fadeOutDown 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3500);
}
