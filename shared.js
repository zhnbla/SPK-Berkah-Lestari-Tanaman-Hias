/* ─── shared.js — data bersama semua halaman admin ─────────────────────── */

const USERS = [
  { username: 'admin',   password: 'berkah123',  display: 'Admin Toko', role: 'admin' },
  { username: 'manager', password: 'lestari456', display: 'Manajer',    role: 'manager' },
];

const DEFAULT_TANAMAN = [
  { nama:'Monstera Deliciosa',   harga:120000, frekuensi:9,  minat:8, stok:5,  kecepatan:8 },
  { nama:'Lidah Mertua',         harga:35000,  frekuensi:8,  minat:9, stok:2,  kecepatan:9 },
  { nama:'Pothos Marble Queen',  harga:45000,  frekuensi:7,  minat:7, stok:12, kecepatan:7 },
  { nama:'Calathea Ornata',      harga:95000,  frekuensi:6,  minat:6, stok:3,  kecepatan:5 },
  { nama:'Kaktus Barrel',        harga:55000,  frekuensi:4,  minat:5, stok:20, kecepatan:3 },
  { nama:'Aglaonema Pink',       harga:80000,  frekuensi:8,  minat:8, stok:4,  kecepatan:8 },
  { nama:'Philodendron Brasil',  harga:70000,  frekuensi:7,  minat:7, stok:8,  kecepatan:6 },
  { nama:'ZZ Plant',             harga:65000,  frekuensi:5,  minat:6, stok:15, kecepatan:4 },
];

const DEFAULT_BOBOT  = [0.35, 0.30, 0.25, 0.10];
const DEFAULT_JENIS  = ['benefit','benefit','cost','cost'];
const KRITERIA_NAMES = [
  'C1 — Frekuensi Penjualan',
  'C2 — Minat Pelanggan',
  'C3 — Sisa Stok',
  'C4 — Kecepatan Habis',
];

/* ── localStorage helpers ──────────────────────────────────────────────── */
function getData(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function getTanaman()   { return getData('bl_tanaman',    DEFAULT_TANAMAN); }
function saveTanamanLS(arr){ setData('bl_tanaman', arr); }

function getBobot()     { return getData('bl_bobot',      DEFAULT_BOBOT); }
function saveBobotLS(arr)  { setData('bl_bobot', arr); }

function getJenis()     { return getData('bl_jenis',      DEFAULT_JENIS); }

function getSAWResult() { return getData('bl_saw_result', null); }
function saveSAWResult(r){ setData('bl_saw_result', r); }

function getSAWTime()   { return localStorage.getItem('bl_saw_time') || null; }
function saveSAWTime(t) { localStorage.setItem('bl_saw_time', t); }

/* ── Auth ──────────────────────────────────────────────────────────────── */
function getAuth()  { return getData('bl_auth', null); }
function setAuth(u) { setData('bl_auth', u); }
function clearAuth(){ localStorage.removeItem('bl_auth'); }

function isManager() {
  const auth = getAuth();
  return auth && auth.role === 'manager';
}

function isAdmin() {
  const auth = getAuth();
  return auth && auth.role === 'admin';
}

function requireAuth(loginPath) {
  if (!getAuth()) {
    window.location.href = loginPath || '../login.html';
  }
}

function logout(loginPath) {
  if (!confirm('Yakin ingin keluar?')) return;
  clearAuth();
  window.location.href = loginPath || '../login.html';
}

/* ── Sidebar inject ────────────────────────────────────────────────────── */
function renderSidebar({ active, root }) {
  const user = getAuth() || { display: 'Admin', username: 'admin', role: 'admin' };
  const r = root || '../';
  const manager = user.role === 'manager';
  const badgeLabel = manager ? 'Panel Manajer' : 'Admin Panel';

  const html = `
  <aside class="sidebar">
    <div class="sidebar-logo">
      <h1>Berkah Lestari</h1>
      <div><span class="sidebar-badge">${badgeLabel}</span></div>
    </div>
    <nav>
      <div class="nav-section">Menu Utama</div>
      <a class="nav-item ${active==='dashboard'?'active':''}" href="${r}dashboard/index.html">
        <span class="icon">🏠</span> Dashboard
      </a>
      <a class="nav-item ${active==='tanaman'?'active':''}" href="${r}dashboard/tanaman.html">
        <span class="icon">🌿</span> Data Tanaman
      </a>
      <div class="nav-section">Proses SAW</div>
      <a class="nav-item ${active==='kriteria'?'active':''}" href="${r}saw/kriteria.html">
        <span class="icon">⚖️</span> Kriteria &amp; Bobot
      </a>
      <a class="nav-item ${active==='proses'?'active':''}" href="${r}saw/proses.html">
        <span class="icon">⚙️</span> Proses SAW
      </a>
      <a class="nav-item ${active==='ranking'?'active':''}" href="${r}saw/ranking.html">
        <span class="icon">🏆</span> Hasil Ranking
      </a>
    </nav>
    <div class="sidebar-bottom">
      <div class="user-info">
        <div class="user-avatar">${user.display[0].toUpperCase()}</div>
        <div>
          <div class="user-name">${user.display}</div>
          <div class="user-role">Berkah Lestari</div>
        </div>
      </div>
      <button class="logout-btn" onclick="logout('${r}login.html')">🚪 Keluar</button>
    </div>
  </aside>`;
  document.body.insertAdjacentHTML('afterbegin', html);
}

/* ── Utilities ─────────────────────────────────────────────────────────── */
function stockBadge(s) {
  if (s <= 3)  return '<span class="badge badge-red">🚨 Kritis</span>';
  if (s <= 6)  return '<span class="badge badge-amber">⚠️ Rendah</span>';
  if (s <= 12) return '<span class="badge badge-green">✅ Aman</span>';
  return '<span class="badge badge-blue">📦 Cukup</span>';
}
