/**
 * auth.js – Shared authentication utilities
 * Selava Therinchuka 💰
 * Full-stack version: all calls go to the real Node.js backend.
 */

// ─── API BASE ─────────────────────────────────────────────────────────────────
// Automatically picks localhost in development, or your Render URL in production.
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://selava-therinchuka-backend.onrender.com/api'; // ← update this when deploying

// ─── TOKEN / USER ────────────────────────────────────────────────────────────
function getToken()   { return localStorage.getItem('selava_token') || null; }
function setToken(t)  { localStorage.setItem('selava_token', t); }
function clearToken() { localStorage.removeItem('selava_token'); localStorage.removeItem('selava_user'); }
function setUser(u)   { localStorage.setItem('selava_user', JSON.stringify(u)); }
function getUser()    { try { return JSON.parse(localStorage.getItem('selava_user')) || null; } catch { return null; } }
function isAuthenticated() { return !!getToken(); }

// ─── API REQUEST ──────────────────────────────────────────────────────────────
/**
 * Make an authenticated API request to the backend.
 * @param {string} endpoint  – e.g. '/expenses'
 * @param {object} options   – fetch options (method, body, etc.)
 * @returns {Promise<object>} – parsed JSON data
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.location.href = 'index.html';
      return;
    }
    const err = new Error(data.message || `Request failed: ${response.status}`);
    err.statusCode = response.status;
    throw err;
  }

  return data;
}

// ─── FORM HELPERS ─────────────────────────────────────────────────────────────
function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  const banner = document.getElementById('error-banner');
  if (banner) banner.classList.add('hidden');
}

function togglePassword(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}
