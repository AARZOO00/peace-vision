// ══════════════════════════════════════
//   PEACE VISION — Admin Dashboard JS
//   Full auth + all CRUD + real stats
// ══════════════════════════════════════

const API = '/api';
let authToken = localStorage.getItem('pv_admin_token') || null;
let currentView = 'overview';

// ─── DATE ───
const dateEl = document.getElementById('currentDate');
if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ─── AUTH ───
function isLoggedIn() { return !!authToken; }

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appShell').style.display = 'none';
}

function showAppShell() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
}

async function adminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  const btn = e.target.querySelector('button');

  btn.textContent = 'Signing in...'; btn.disabled = true;
  errEl.style.display = 'none';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || data.user?.role !== 'admin') {
      throw new Error(data.error || 'Invalid credentials or insufficient permissions.');
    }
    authToken = data.token;
    localStorage.setItem('pv_admin_token', authToken);
    document.getElementById('adminName').textContent = data.user.name;
    showAppShell();
    loadOverview();
  } catch (err) {
    errEl.textContent = err.message; errEl.style.display = 'block';
  } finally {
    btn.textContent = 'Sign In'; btn.disabled = false;
  }
}

function adminLogout() {
  authToken = null;
  localStorage.removeItem('pv_admin_token');
  showLoginScreen();
}

// ─── API FETCH (with auth) ───
async function apiFetch(url, opts = {}) {
  try {
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...opts.headers,
      },
    });
    if (res.status === 401) { adminLogout(); return null; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error('API error:', url, err.message);
    showToast(err.message, 'error');
    return null;
  }
}

// ─── NAVIGATION ───
function showView(name, el) {
  currentView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('pageTitle');
  if (titleEl && el) titleEl.textContent = el.querySelector('.nav-label')?.textContent || name;

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('open');

  if (name === 'overview') loadOverview();
  else if (name === 'contacts') loadContacts();
  else if (name === 'bookings') loadBookings();
  else if (name === 'subscribers') loadSubscribers();
}
window.showView = showView;

// ─── TOAST ───
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;z-index:99999;
    padding:1rem 1.5rem;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:0.88rem;
    color:#f8f4ef;animation:slideUp 0.3s ease;max-width:360px;
    box-shadow:0 8px 30px rgba(0,0,0,0.3);
    background:${type === 'error' ? 'linear-gradient(135deg,#8b1a1a,#c0392b)' : 'linear-gradient(135deg,#1a4a5c,#2a7a8c)'};
  `;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.remove(), 4000);
}

// ─── OVERVIEW ───
async function loadOverview() {
  try {
    const [contactStats, bookingStats, subCount] = await Promise.all([
      apiFetch(`${API}/contact/stats`),
      apiFetch(`${API}/bookings/stats`),
      apiFetch(`${API}/newsletter/count`),
    ]);

    if (contactStats) {
      document.getElementById('stat-contacts').textContent = contactStats.total || 0;
      document.getElementById('stat-new-contacts').textContent = contactStats.new || 0;
    }
    if (bookingStats) {
      document.getElementById('stat-bookings').textContent = bookingStats.total || 0;
      document.getElementById('stat-pending-bookings').textContent = bookingStats.pending || 0;
    }
    if (subCount) {
      document.getElementById('stat-subscribers').textContent = subCount.count || 0;
    }

    // Recent contacts table
    const contacts = await apiFetch(`${API}/contact?limit=6`);
    if (contacts?.contacts) renderContactsTable('recent-contacts-body', contacts.contacts);

  } catch (err) {
    console.error('Overview load error:', err);
  }
}

// ─── CONTACTS ───
let contactFilter = 'all';
let contactSearch = '';

async function loadContacts() {
  const container = document.getElementById('contacts-body');
  if (container) container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading contacts...</div>';

  const params = new URLSearchParams({ limit: '50' });
  if (contactFilter !== 'all') params.set('status', contactFilter);
  if (contactSearch) params.set('search', contactSearch);

  const data = await apiFetch(`${API}/contact?${params}`);
  if (!data) return;

  if (container) renderContactsTable('contacts-body', data.contacts, data.total);
}

function filterContacts(status, btn) {
  contactFilter = status;
  document.querySelectorAll('#view-contacts .filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadContacts();
}
window.filterContacts = filterContacts;

function searchContacts(val) {
  contactSearch = val;
  clearTimeout(searchContacts._timer);
  searchContacts._timer = setTimeout(loadContacts, 400);
}
window.searchContacts = searchContacts;

function renderContactsTable(containerId, contacts, total) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!contacts?.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No contacts found.</p></div>';
    return;
  }

  const isOverview = containerId === 'recent-contacts-body';
  container.innerHTML = `
    ${total !== undefined ? `<div class="table-meta">Showing ${contacts.length} of ${total} contacts</div>` : ''}
    <table>
      <thead><tr>
        <th>Name</th><th>Email</th><th>Service</th>
        <th>Status</th><th>Date</th>
        ${!isOverview ? '<th>Actions</th>' : ''}
      </tr></thead>
      <tbody>
        ${contacts.map(c => `
          <tr>
            <td><strong>${escH(c.name)}</strong></td>
            <td><a href="mailto:${escH(c.email)}" class="email-link">${escH(c.email)}</a></td>
            <td>${escH(c.service || '—')}</td>
            <td><span class="badge badge-${c.status}">${c.status}</span></td>
            <td>${fmtDate(c.createdAt)}</td>
            ${!isOverview ? `<td class="actions-cell">
              <button class="btn-sm" onclick="updateContactStatus('${c._id}','contacted')">Contacted</button>
              <button class="btn-sm success" onclick="updateContactStatus('${c._id}','converted')">Converted</button>
              <button class="btn-sm danger" onclick="deleteContact('${c._id}')">✕</button>
            </td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateContactStatus(id, status) {
  const data = await apiFetch(`${API}/contact/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (data) { showToast(`Marked as ${status}`); loadContacts(); }
}
window.updateContactStatus = updateContactStatus;

async function deleteContact(id) {
  if (!confirm('Delete this contact permanently?')) return;
  const data = await apiFetch(`${API}/contact/${id}`, { method: 'DELETE' });
  if (data) { showToast('Contact deleted'); loadContacts(); }
}
window.deleteContact = deleteContact;

// ─── BOOKINGS ───
let bookingFilter = 'all';

async function loadBookings() {
  const container = document.getElementById('bookings-body');
  if (container) container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading bookings...</div>';

  const params = new URLSearchParams({ limit: '50' });
  if (bookingFilter !== 'all') params.set('status', bookingFilter);

  const data = await apiFetch(`${API}/bookings?${params}`);
  if (!data?.bookings) return;

  if (!data.bookings.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>No bookings found.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="table-meta">Showing ${data.bookings.length} of ${data.total} bookings</div>
    <table>
      <thead><tr>
        <th>Name</th><th>Email</th><th>Service</th>
        <th>Requested</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${data.bookings.map(b => `
          <tr>
            <td><strong>${escH(b.name)}</strong></td>
            <td><a href="mailto:${escH(b.email)}" class="email-link">${escH(b.email)}</a></td>
            <td>${escH(b.service)}</td>
            <td>${b.preferredDate ? fmtDate(b.preferredDate) : '—'} ${b.preferredTime ? '<br/><small>' + escH(b.preferredTime) + '</small>' : ''}</td>
            <td><span class="badge badge-${b.status}">${b.status}</span></td>
            <td class="actions-cell">
              ${b.status === 'pending' ? `<button class="btn-sm success" onclick="confirmBookingModal('${b._id}','${escH(b.name)}','${escH(b.service)}')">Confirm</button>` : ''}
              ${b.status !== 'cancelled' ? `<button class="btn-sm danger" onclick="cancelBooking('${b._id}')">Cancel</button>` : ''}
              <button class="btn-sm" onclick="deleteBooking('${b._id}')">✕</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterBookings(status, btn) {
  bookingFilter = status;
  document.querySelectorAll('#view-bookings .filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadBookings();
}
window.filterBookings = filterBookings;

function confirmBookingModal(id, name, service) {
  const meetLink = prompt(`Confirm booking for ${name} (${service}).\n\nEnter meeting link (or leave blank):`) ;
  if (meetLink === null) return; // cancelled
  confirmBooking(id, meetLink.trim());
}
window.confirmBookingModal = confirmBookingModal;

async function confirmBooking(id, meetLink = '') {
  const data = await apiFetch(`${API}/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'confirmed', ...(meetLink && { meetLink }) }),
  });
  if (data) { showToast('Booking confirmed — client notified ✓'); loadBookings(); }
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking? The client will be notified.')) return;
  const data = await apiFetch(`${API}/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (data) { showToast('Booking cancelled'); loadBookings(); }
}
window.cancelBooking = cancelBooking;

async function deleteBooking(id) {
  if (!confirm('Delete this booking permanently?')) return;
  const data = await apiFetch(`${API}/bookings/${id}`, { method: 'DELETE' });
  if (data) { showToast('Booking deleted'); loadBookings(); }
}
window.deleteBooking = deleteBooking;

// ─── SUBSCRIBERS ───
async function loadSubscribers() {
  const countEl = document.getElementById('sub-count');
  const container = document.getElementById('subscribers-body');
  if (container) container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading...</div>';

  const [countData, listData] = await Promise.all([
    apiFetch(`${API}/newsletter/count`),
    apiFetch(`${API}/newsletter/subscribers?limit=100`),
  ]);

  if (countData && countEl) countEl.textContent = countData.count;

  if (!listData?.subscribers?.length) {
    if (container) container.innerHTML = '<div class="empty-state"><div class="empty-icon">💌</div><p>No subscribers yet.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="table-meta">${listData.total} total subscribers</div>
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
      <tbody>
        ${listData.subscribers.map(s => `
          <tr>
            <td>${escH(s.name || '—')}</td>
            <td><a href="mailto:${escH(s.email)}" class="email-link">${escH(s.email)}</a></td>
            <td>${fmtDate(s.createdAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ─── HELPERS ───
function fmtDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escH(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ─── MOBILE SIDEBAR ───
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}
window.toggleSidebar = toggleSidebar;

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (isLoggedIn()) {
    // Verify token is still valid
    apiFetch(`${API}/auth/me`).then(data => {
      if (data?.user?.role === 'admin') {
        document.getElementById('adminName').textContent = data.user.name;
        showAppShell();
        loadOverview();
      } else {
        adminLogout();
      }
    });
  } else {
    showLoginScreen();
  }

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', adminLogin);

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', adminLogout);
});