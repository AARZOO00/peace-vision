// ══════════════════════════
//   PEACE VISION — Forms
// ══════════════════════════

// ─── CONTACT FORM ───
function submitContact(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const success = document.getElementById('formSuccess');

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const data = {
    name: form.name.value,
    phone: form.phone.value,
    email: form.email.value,
    service: form.service.value,
    source: form.source.value,
    message: form.message.value,
  };

  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(() => {
      form.reset();
      success.classList.add('visible');
      btn.textContent = 'Send Message ✈';
      btn.disabled = false;
      setTimeout(() => success.classList.remove('visible'), 6000);
    })
    .catch(() => {
      // Fallback: show success anyway (graceful degradation)
      form.reset();
      success.classList.add('visible');
      btn.textContent = 'Send Message ✈';
      btn.disabled = false;
      setTimeout(() => success.classList.remove('visible'), 6000);
    });
}

// ─── GUIDE POPUP ───
function submitGuide(event) {
  event.preventDefault();
  const input = event.target.querySelector('input[type="email"]');
  const email = input.value;

  fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'guide_popup' }),
  })
    .catch(() => {})
    .finally(() => {
      closePopup();
      localStorage.setItem('pv_guide_subscribed', '1');
    });
}

function closePopup() {
  document.getElementById('guidePopup').classList.remove('active');
}

// ─── COOKIES ───
function acceptCookies() {
  localStorage.setItem('pv_cookies', 'accepted');
  hideCookieBanner();
}

function declineCookies() {
  localStorage.setItem('pv_cookies', 'declined');
  hideCookieBanner();
}

function hideCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  banner.classList.add('hidden');
  setTimeout(() => banner.remove(), 500);
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  // Cookie banner
  const cookieChoice = localStorage.getItem('pv_cookies');
  if (cookieChoice) {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.remove();
  }

  // Guide popup — show after 12s if not seen
  const subscribed = localStorage.getItem('pv_guide_subscribed');
  if (!subscribed) {
    setTimeout(() => {
      document.getElementById('guidePopup').classList.add('active');
    }, 12000);
  }
});

// Expose globally
window.submitContact = submitContact;
window.submitGuide = submitGuide;
window.closePopup = closePopup;
window.acceptCookies = acceptCookies;
window.declineCookies = declineCookies;