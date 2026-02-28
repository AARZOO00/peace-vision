// ═══════════════════════════════════════
//   PEACE VISION — Advanced Animations
// ═══════════════════════════════════════

// ─── CUSTOM CURSOR ───
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Ring follows with lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effects
  document.querySelectorAll('a, button, .service-card, .pillar, .quiz-option, .testimonial-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

// ─── SCROLL PROGRESS BAR ───
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / docH) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
}

// ─── SCROLL REVEAL (multiple types) ───
function initReveal() {
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const elements = document.querySelectorAll(selectors);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ─── PARALLAX EFFECT ───
function initParallax() {
  const hero = document.querySelector('.hero-content');
  const orbs = document.querySelectorAll('.orb');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (hero && scrollY < window.innerHeight) {
      hero.style.transform = `translateY(${scrollY * 0.25}px)`;
      hero.style.opacity = 1 - (scrollY / window.innerHeight) * 1.4;
    }

    // Orbs move at different speeds (parallax depth)
    orbs.forEach((orb, i) => {
      const speed = 0.05 + i * 0.04;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
}

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = parseInt(el.dataset.target, 10);
  const duration = 2200;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Elastic easing
    const eased = progress < 1
      ? 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * (2 * Math.PI) / 3)
      : 1;
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateCounter(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ─── TESTIMONIALS SLIDER ───
let currentSlide = 0;
let totalSlides = 0;
let autoSlideInterval;

function initSlider() {
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('sliderDots');
  if (!track || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const visibleCount = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  totalSlides = Math.max(1, cards.length - visibleCount + 1);

  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }

  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => nextSlide(), 5500);
}

function goToSlide(index) {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;
  const cardWidth = cards[0].offsetWidth + 24;

  currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;

  document.querySelectorAll('.slider-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function nextSlide() { goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1); }
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;

// ─── NAV SCROLL BEHAVIOR ───
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  const floatingCta = document.getElementById('floatingCta');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav?.classList.toggle('scrolled', y > 80);
        floatingCta?.classList.toggle('visible', y > 600);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ─── SECTION ENTRANCE TEXT ANIMATION ───
function initSectionTitles() {
  // Add stagger to service cards that come into view
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.service-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('visible'), i * 80);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(grid);
}

// ─── SMOOTH HOVER MAGNETIC EFFECT on buttons ───
function initMagneticButtons() {
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollProgress();
  initReveal();
  initParallax();
  initCounters();
  initNavScroll();
  initSectionTitles();

  setTimeout(() => {
    initSlider();
    initMagneticButtons();
  }, 200);

  window.addEventListener('resize', () => {
    currentSlide = 0;
    initSlider();
  });
});