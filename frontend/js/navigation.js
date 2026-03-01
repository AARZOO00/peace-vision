// ════════════════════════
//   PEACE VISION — Main
// ════════════════════════

// ─── MOBILE MENU ───
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const isOpen = menu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
window.toggleMenu = toggleMenu;

document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (menu?.classList.contains('open') && !nav?.contains(e.target)) {
    menu.classList.remove('open');
    hamburger?.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─── FAQ ───
function toggleFaq(btn) {
  const answer = btn.parentElement.querySelector('.faq-a');
  const isOpen = btn.classList.toggle('open');
  answer.classList.toggle('open', isOpen);
  document.querySelectorAll('.faq-q.open').forEach(openBtn => {
    if (openBtn !== btn) {
      openBtn.classList.remove('open');
      openBtn.parentElement.querySelector('.faq-a').classList.remove('open');
    }
  });
}
window.toggleFaq = toggleFaq;

// ─── SERVICE FILTER ───
function filterServices(category, event) {
  const cards = document.querySelectorAll('.service-card');
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (event?.target) event.target.classList.add('active');

  cards.forEach(card => {
    const show = category === 'all' || card.dataset.category === category;
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    if (show) {
      card.style.opacity = '0';
      card.classList.remove('hidden');
      setTimeout(() => { card.style.opacity = '1'; }, 30);
    } else {
      card.style.opacity = '0';
      setTimeout(() => card.classList.add('hidden'), 300);
    }
  });
}
window.filterServices = filterServices;

// ─── LANGUAGE ───
function setLang(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.textContent === lang));
  document.documentElement.lang = lang.toLowerCase();
  localStorage.setItem('pv_lang', lang);
}
window.setLang = setLang;

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── ACTIVE NAV ───
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const scrollY = window.scrollY + 130;
  sections.forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + section.id);
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ─── POPUP CLOSE ───
document.getElementById('guidePopup')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) window.closePopup?.();
});

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('pv_lang');
  if (savedLang) setLang(savedLang);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/js/sw.js').catch(() => {});
  }
});

// ─── GALLERY ───
// Fallback gallery images if local not found
const FALLBACK_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', title: 'Mountain Serenity', category: 'Nature' },
  { url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80', title: 'Inner Peace', category: 'Meditation' },
  { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80', title: 'Forest Healing', category: 'Nature' },
  { url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80', title: 'Morning Light', category: 'Spiritual' },
  { url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80', title: 'Golden Hour', category: 'Energy' },
  { url: 'https://images.unsplash.com/photo-1439853949212-36589f9f9e27?w=800&q=80', title: 'Sacred Waters', category: 'Healing' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', title: 'Earth Connection', category: 'Grounding' },
  { url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80', title: 'Soul Flight', category: 'Spiritual' },
  { url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80', title: 'Winter Stillness', category: 'Peace' },
  { url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', title: 'Desert Wisdom', category: 'Clarity' },
  { url: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80', title: 'Misty Path', category: 'Journey' },
  { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80', title: 'Green Peace', category: 'Nature' },
];

let GALLERY_IMAGES = FALLBACK_IMAGES;
let MEDITATION_IMAGES = FALLBACK_IMAGES.slice(0,5).map(i => i.url);



async function openGallery() {
  const modal = document.getElementById('galleryModal');
  const grid = document.getElementById('galleryGrid');
  if (!modal || !grid) return;

  // Show modal with loading state
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.classList.add('open'), 10);
  grid.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:4rem;font-family:var(--font-body);font-size:0.9rem;grid-column:1/-1;">✨ Loading your healing gallery...</div>';

  // Fetch images from backend
  let images = GALLERY_IMAGES;
  try {
    const res = await fetch('/api/images');
    const data = await res.json();
    if (data.images && data.images.length > 0) {
      const cats = ['Nature','Spiritual','Energy','Peace','Healing','Meditation','Grounding','Clarity'];
      images = data.images.map((url, i) => ({
        url,
        title: 'Healing Moment ' + (i + 1),
        category: cats[i % cats.length]
      }));
      // Update meditation images too
      MEDITATION_IMAGES = data.images.slice(0, 10);
    }
  } catch(e) { /* use fallback */ }

  grid.innerHTML = images.map((img, i) => `
    <div class="gallery-img-wrap" onclick="openLightbox('${img.url}', '${img.title}')" style="animation-delay:${i*0.04}s">
      <img src="${img.url}" alt="${img.title}" loading="lazy" />
      <div class="gallery-img-overlay">
        <span class="gallery-img-tag">${img.category}</span>
        <strong>${img.title}</strong>
      </div>
    </div>
  `).join('');
}
window.openGallery = openGallery;

function closeGallery() {
  const modal = document.getElementById('galleryModal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 400);
  document.body.style.overflow = '';
}
window.closeGallery = closeGallery;

function openLightbox(url, title) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if (!lb || !img) return;
  img.src = url;
  img.alt = title;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
window.openLightbox = openLightbox;

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.style.display = 'none'; }
}
window.closeLightbox = closeLightbox;

// Close lightbox on background click
document.addEventListener('click', (e) => {
  const lb = document.getElementById('lightbox');
  if (lb && e.target === lb) closeLightbox();
  const gm = document.getElementById('galleryModal');
  if (gm && e.target === gm) closeGallery();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLightbox(); closeGallery(); stopMeditation(); }
});

// ─── MEDITATION MODE ───
let meditationInterval = null;
let meditationImgIndex = 0;

function startMeditation() {
  const mode = document.getElementById('meditationMode');
  if (!mode) return;
  mode.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Set first image
  const imgEl = document.getElementById('meditationImage');
  if (imgEl) { imgEl.src = MEDITATION_IMAGES[0]; imgEl.style.opacity = '0.4'; }

  // Breath cycle
  const breathText = document.getElementById('breathText');
  const breathCycle = ['Inhale...', 'Hold...', 'Exhale...', 'Rest...'];
  const breathDurations = [4000, 2000, 4000, 2000];
  let breathIdx = 0;

  function nextBreath() {
    if (breathText) breathText.textContent = breathCycle[breathIdx];
    breathIdx = (breathIdx + 1) % breathCycle.length;
  }
  nextBreath();

  // Image slideshow
  function nextImage() {
    meditationImgIndex = (meditationImgIndex + 1) % MEDITATION_IMAGES.length;
    if (imgEl) {
      imgEl.style.opacity = '0';
      setTimeout(() => {
        imgEl.src = MEDITATION_IMAGES[meditationImgIndex];
        imgEl.style.opacity = '0.4';
      }, 1000);
    }
  }

  meditationInterval = setInterval(() => {
    nextBreath();
    if (meditationImgIndex % 2 === 0) nextImage();
  }, 3000);

  // Music
  const music = document.getElementById('meditationMusic');
  if (music) { music.volume = 0.3; music.play().catch(() => {}); }
}
window.startMeditation = startMeditation;

function stopMeditation() {
  const mode = document.getElementById('meditationMode');
  if (!mode) return;
  mode.style.display = 'none';
  document.body.style.overflow = '';
  if (meditationInterval) { clearInterval(meditationInterval); meditationInterval = null; }
  const music = document.getElementById('meditationMusic');
  if (music) { music.pause(); music.currentTime = 0; }
}
window.stopMeditation = stopMeditation;

// Popup
function closePopup() {
  document.getElementById('guidePopup')?.classList.remove('active');
}
window.closePopup = closePopup;

function submitGuide(e) {
  e.preventDefault();
  closePopup();
}
window.submitGuide = submitGuide;

setTimeout(() => {
  const popup = document.getElementById('guidePopup');
  if (popup && !sessionStorage.getItem('pv_popup')) {
    popup.classList.add('active');
    sessionStorage.setItem('pv_popup', '1');
  }
}, 8000);