/**
 * NEXETA AI MARKETING SUITE — Signup Page Controller
 * Phase 2: Production Authentication
 * ─────────────────────────────────────────────────────────────────────────────
 * Wires the signup form to Phase 1 AuthService.signup().
 * Handles: validation, password strength, loading states, error display, redirect.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initSpotlightGlows();
  initSignupParticles();
  initPasswordVisibility();
  initSelectPlaceholderColors();
  initPasswordStrength();
  initSignupValidation();
  initSocialButtonNotices();
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
function initSignupParticles() {
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
      this.x  = Math.random() * w; this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.35; this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < mouse.r) { const f=(mouse.r-d)/mouse.r; this.x+=(dx/d)*f*1.2; this.y+=(dy/d)*f*1.2; }
      }
    }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fillStyle='rgba(59,130,246,0.35)'; ctx.fill(); }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new P());
  window.addEventListener('mousemove', e => { const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; });
  window.addEventListener('mouseleave', () => { mouse.x=null; mouse.y=null; });
  window.addEventListener('resize', () => { w=canvas.width=canvas.offsetWidth; h=canvas.height=canvas.offsetHeight; });

  (function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p, i) => {
      p.update(); p.draw();
      for (let j=i+1; j<particles.length; j++) {
        const dx=p.x-particles[j].x, dy=p.y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if (d < DIST) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle=`rgba(59,130,246,${(1-d/DIST)*0.12})`; ctx.lineWidth=0.85; ctx.stroke(); }
      }
    });
    requestAnimationFrame(animate);
  })();
}

/* ─── 3. PASSWORD VISIBILITY ──────────────────────────────────────────────── */
function initPasswordVisibility() {
  setupToggle('toggle-password',         'password');
  setupToggle('toggle-confirm-password', 'confirm-password');

  function setupToggle(btnId, inputId) {
    const btn   = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    const eye    = btn.querySelector('.eye-icon');
    const eyeOff = btn.querySelector('.eye-off-icon');
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.style.display    = show ? 'none' : '';
      eyeOff.style.display = show ? ''     : 'none';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }
}

/* ─── 4. SELECT PLACEHOLDER COLORS ───────────────────────────────────────── */
function initSelectPlaceholderColors() {
  document.querySelectorAll('.select-field').forEach(sel => {
    const update = () => { sel.style.color = sel.value ? 'var(--text-primary)' : 'var(--text-muted)'; };
    update();
    sel.addEventListener('change', update);
  });
}

/* ─── 5. PASSWORD STRENGTH METER ─────────────────────────────────────────── */
function initPasswordStrength() {
  const input = document.getElementById('password');
  const bar   = document.getElementById('pw-strength-bar');
  const label = document.getElementById('pw-strength-label');
  if (!input || !bar || !label) return;

  input.addEventListener('input', () => {
    const val = input.value;
    const score = calcStrength(val);
    const levels = [
      { label: '',       color: 'transparent',               pct: '0%'   },
      { label: 'Weak',   color: '#ef4444',                   pct: '25%'  },
      { label: 'Fair',   color: '#f59e0b',                   pct: '50%'  },
      { label: 'Good',   color: '#3b82f6',                   pct: '75%'  },
      { label: 'Strong', color: 'linear-gradient(90deg,#10b981,#06b6d4)', pct: '100%' },
    ];
    const lv = levels[score];
    bar.style.width      = lv.pct;
    bar.style.background = lv.color;
    label.textContent    = lv.label;
    label.style.color    = score >= 4 ? '#10b981' : score >= 3 ? '#3b82f6' : score >= 2 ? '#f59e0b' : '#ef4444';
  });

  function calcStrength(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }
}

/* ─── 6. FORM VALIDATION & AUTH ───────────────────────────────────────────── */
function initSignupValidation() {
  const form          = document.getElementById('signup-form');
  const nameInput     = document.getElementById('fullname');
  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput  = document.getElementById('confirm-password');
  const countryInput  = document.getElementById('country');
  const roleInput     = document.getElementById('role');
  const termsBox      = document.getElementById('terms');
  const privacyBox    = document.getElementById('privacy');
  const submitBtn     = document.getElementById('signup-btn');
  const globalErr     = document.getElementById('global-error');

  const errors = {
    name:     document.getElementById('fullname-error'),
    email:    document.getElementById('email-error'),
    password: document.getElementById('password-error'),
    confirm:  document.getElementById('confirm-password-error'),
    country:  document.getElementById('country-error'),
    role:     document.getElementById('role-error'),
    policy:   document.getElementById('policy-error'),
  };

  if (!form) return;

  // Real-time error clearing
  const trackedInputs = [
    [nameInput,    errors.name],
    [emailInput,   errors.email],
    [passwordInput,errors.password],
    [confirmInput, errors.confirm],
    [countryInput, errors.country],
    [roleInput,    errors.role],
  ];
  trackedInputs.forEach(([el, err]) => {
    if (!el) return;
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => clearError(el, err));
  });
  [termsBox, privacyBox].forEach(cb => cb?.addEventListener('change', () => {
    if (errors.policy) errors.policy.style.display = 'none';
  }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    hideGlobalError();

    const userData = {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim().toLowerCase(),
      password: passwordInput.value,
      role:     roleInput?.value  || '',
      country:  countryInput?.value || '',
    };

    try {
      await window.Nexeta.AuthService.signup(userData, false);

      setSuccess();

      setTimeout(() => {
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity    = '0';
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 400);
      }, 800);

    } catch (err) {
      setLoading(false);
      const C = window.Nexeta?.AuthConstants?.ERRORS || {};
      if (err && err.code === C.EMAIL_NOT_VERIFIED) {
        setSuccess();
        const text = submitBtn.querySelector('.btn-text');
        if (text) text.textContent = '✓ Verification Sent!';
        showToast(err.message || 'Verification email sent! Redirecting...', 'success');
        setTimeout(() => {
          document.body.style.transition = 'opacity 0.4s ease';
          document.body.style.opacity    = '0';
          setTimeout(() => { window.location.href = 'verify-email.html'; }, 400);
        }, 1500);
      } else {
        showGlobalError(getFriendlyError(err));
      }
    }
  });

  /* ── Validators ─────────────────────────────────────────────────────────── */

  function validateInputs() {
    let ok = true;
    const name     = nameInput?.value.trim()    || '';
    const email    = emailInput?.value.trim()   || '';
    const password = passwordInput?.value       || '';
    const confirm  = confirmInput?.value        || '';
    const country  = countryInput?.value        || '';
    const role     = roleInput?.value           || '';

    if (!name) { showError(nameInput, errors.name, 'Full name is required.'); ok = false; }
    if (!email) { showError(emailInput, errors.email, 'Email address is required.'); ok = false; }
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showError(emailInput, errors.email, 'Please enter a valid email.'); ok = false; }
    if (!password) { showError(passwordInput, errors.password, 'Password is required.'); ok = false; }
    else if (password.length < 8) { showError(passwordInput, errors.password, 'Password must be at least 8 characters.'); ok = false; }
    else if (!/[A-Z]/.test(password)) { showError(passwordInput, errors.password, 'Password must contain an uppercase letter.'); ok = false; }
    else if (!/[0-9]/.test(password)) { showError(passwordInput, errors.password, 'Password must contain a number.'); ok = false; }
    if (!confirm) { showError(confirmInput, errors.confirm, 'Please confirm your password.'); ok = false; }
    else if (password !== confirm) { showError(confirmInput, errors.confirm, 'Passwords do not match.'); ok = false; }
    if (!country) { showError(countryInput, errors.country, 'Please select your country.'); ok = false; }
    if (!role)    { showError(roleInput,    errors.role,    'Please select your role.'); ok = false; }
    if (!termsBox?.checked || !privacyBox?.checked) {
      if (errors.policy) { errors.policy.textContent = 'You must accept both the Terms and Privacy Policy.'; errors.policy.style.display = 'block'; }
      ok = false;
    }
    return ok;
  }

  function showError(input, errEl, msg) {
    input?.classList.add('input-error');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    if (input) { input.style.animation = 'none'; setTimeout(() => { input.style.animation = 'shake 0.4s ease'; }, 10); }
  }

  function clearError(input, errEl) {
    input?.classList.remove('input-error');
    if (errEl) errEl.style.display = 'none';
  }

  /* ── Loading / Success ──────────────────────────────────────────────────── */

  function setLoading(active) {
    if (!submitBtn) return;
    const text = submitBtn.querySelector('.btn-text');
    submitBtn.disabled = active;
    submitBtn.classList.toggle('loading', active);
    if (text) text.textContent = active ? 'Creating Account...' : 'Create Free Account';
  }

  function setSuccess() {
    if (!submitBtn) return;
    submitBtn.disabled = true;
    const text = submitBtn.querySelector('.btn-text');
    submitBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    submitBtn.style.boxShadow  = '0 0 30px rgba(16,185,129,0.5)';
    if (text) text.textContent = '✓ Account Created!';
    submitBtn.classList.remove('loading');
  }

  /* ── Global Error ───────────────────────────────────────────────────────── */

  function showGlobalError(msg) {
    if (!globalErr) return;
    globalErr.textContent   = msg;
    globalErr.style.display = 'flex';
  }

  function hideGlobalError() {
    if (globalErr) globalErr.style.display = 'none';
  }

  function getFriendlyError(err) {
    if (!err) return 'Something went wrong. Please try again.';
    const C = window.Nexeta?.AuthConstants?.ERRORS || {};
    if (err.code === C.EMAIL_ALREADY_EXISTS) {
      return 'An account with this email already exists. Try signing in.';
    }
    if (err.code === C.WEAK_PASSWORD) {
      return err.message || 'Password does not meet requirements.';
    }
    if (err.code === C.RATE_LIMITED) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    return err.message || 'Something went wrong. Please try again.';
  }
}

/* ─── 7. SOCIAL BUTTON WIRING ────────────────────────────────────────────── */
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

/* ─── 8. TOAST ────────────────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const existing = document.getElementById('nexeta-toast');
  if (existing) existing.remove();
  const colors = { info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', icon: 'ℹ' }, success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', icon: '✓' }, error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', icon: '✕' } };
  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.id = 'nexeta-toast';
  toast.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:${c.bg};border:1px solid ${c.border};color:#e0e7ff;font-family:system-ui,sans-serif;font-size:0.85rem;padding:0.75rem 1.25rem;border-radius:12px;backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;gap:0.5rem;box-shadow:0 8px 32px rgba(0,0,0,0.4);white-space:nowrap;`;
  toast.innerHTML = `<span style="font-weight:700;">${c.icon}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 3500);
}
