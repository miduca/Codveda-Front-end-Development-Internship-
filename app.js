// CodVeda Level 1 demo interactions
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile navigation toggle
  const navToggle = $('.nav-toggle');
  const navMenu = $('#nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('open');
    });

    // Close menu on link click (mobile)
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      }
    });
  }

  // Smooth scrolling via JS enhancement (CSS also has scroll-behavior)
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Reveal-on-scroll using IntersectionObserver
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // Advanced animations using GSAP (if available) with reduced motion respect
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && window.gsap) {
    try {
      // Animate hero blob gently
      const blob = document.querySelector('.blob');
      if (blob) {
        gsap.to(blob, { y: -10, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }

      // Use ScrollTrigger if available for reveal elements
      if (gsap.ScrollTrigger && revealEls.length) {
        gsap.registerPlugin(gsap.ScrollTrigger);
        gsap.utils.toArray('.reveal').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    } catch (e) {
      // If GSAP fails for any reason, fallback reveal already applied above
    }
  }

  // Form validation (real-time)
  const form = $('#contactForm');
  if (form) {
    const fields = {
      name: {
        el: $('#name'),
        error: $('#nameError'),
        validate: (v) => /^(?=.{2,})([A-Za-zÀ-ÿ'’\-]+\s?)+$/.test(v.trim()),
        message: 'Please enter your full name (min 2 characters).',
      },
      email: {
        el: $('#email'),
        error: $('#emailError'),
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
        message: 'Please enter a valid email address.',
      },
      phone: {
        el: $('#phone'),
        error: $('#phoneError'),
        validate: (v) => {
          const digits = v.replace(/\D/g, '');
          return digits.length >= 10; // allow various formats, ensure 10+ digits
        },
        message: 'Please enter a valid phone number (10+ digits).',
      },
      password: {
        el: $('#password'),
        error: $('#passwordError'),
        validate: (v) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(v),
        message: 'Min 8 chars, include 1 number and 1 uppercase letter.',
      },
    };

    const setError = (field, hasError) => {
      if (!field) return;
      const { el, error, message } = field;
      if (hasError) {
        el.classList.add('invalid');
        if (error) error.textContent = message;
      } else {
        el.classList.remove('invalid');
        if (error) error.textContent = '';
      }
    };

    const validateField = (field) => {
      const { el, validate } = field;
      const value = el.value;
      const ok = validate(value);
      setError(field, !ok);
      return ok;
    };

    Object.values(fields).forEach((field) => {
      field.el.addEventListener('input', () => validateField(field));
      field.el.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let allOk = true;
      for (const field of Object.values(fields)) {
        allOk = validateField(field) && allOk;
      }
      const successEl = $('#formSuccess');
      if (allOk) {
        if (successEl) successEl.hidden = false;
        form.reset();
        // Clear errors and invalid state after reset
        Object.values(fields).forEach((f) => setError(f, false));
      } else {
        if (successEl) successEl.hidden = true;
      }
    });
  }

  // Counter app
  const countEl = $('#count');
  const incBtn = $('#increment');
  const decBtn = $('#decrement');
  const resetBtn = $('#reset');
  let count = 0;
  const update = () => {
    if (countEl) countEl.textContent = String(count);
  };
  const increment = () => { count += 1; update(); };
  const decrement = () => { count = Math.max(0, count - 1); update(); };
  const reset = () => { count = 0; update(); };

  if (incBtn) incBtn.addEventListener('click', increment);
  if (decBtn) decBtn.addEventListener('click', decrement);
  if (resetBtn) resetBtn.addEventListener('click', reset);
})();
