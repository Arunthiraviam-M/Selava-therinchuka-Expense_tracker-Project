/**
 * dashboard.js – Complete dashboard logic
 * Selava Therinchuka 💰
 * Full-stack: all data from real Node.js + MySQL backend.
 */

// ─── Auth guard ───────────────────────────────────────────────────────────────
if (!isAuthenticated()) {
  window.location.href = 'index.html';
}

// ─── State ────────────────────────────────────────────────────────────────────
let allExpenses       = [];
let calendarYear      = new Date().getFullYear();
let calendarMonth     = new Date().getMonth();
let categoryChartInst = null;
let trendChartInst    = null;
let barChartInst      = null;
let donutChartInst    = null;
let pendingDeleteId   = null;
let editingId         = null;

// ─── Constants ────────────────────────────────────────────────────────────────
const CAT_ICONS = {
  Food: '🍕', Transport: '🚌', Shopping: '🛍', Entertainment: '🎬',
  Health: '💊', Education: '📚', Utilities: '⚡', Other: '📦'
};
const CAT_COLORS = [
  '#6C63FF', '#A8FF78', '#FF6B6B', '#FFB347',
  '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
];
const CATEGORIES  = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Utilities', 'Other'];
const BUDGETS_DEF = { Food: 5000, Transport: 2000, Shopping: 3000, Entertainment: 1500, Health: 2000, Education: 1000, Utilities: 1500, Other: 1000 };

// ─── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initGreeting();
  initUserProfile();
  initNavigation();
  initSidebarOverlay();
  initLogout();
  initMonthFilter();
  initModal();
  await loadAll();
});

// ─── Load all data from backend ───────────────────────────────────────────────
async function loadAll() {
  try {
    showLoading(true);

    const [expData, dashData] = await Promise.all([
      apiRequest('/expenses?limit=500&sortBy=expense_date&sortOrder=DESC'),
      apiRequest('/dashboard')
    ]);

    allExpenses = expData.expenses || [];

    renderStatCards(dashData);
    renderRecentList();
    renderCalendar();
    renderCategoryChart();
    renderTrendChart();
    renderExpenseTable();
    renderBudgetGrid(dashData.categoryTotals || {});

  } catch (err) {
    console.error('Dashboard load error:', err);
    showToast('Failed to load data. Is the backend running?', 'error');
  } finally {
    showLoading(false);
  }
}

function showLoading(on) {
  // Optional: could add a spinner to topbar in future
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function initGreeting() {
  const user = getUser();
  if (!user) return;

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  const greetEl = document.getElementById('greeting-text');
  if (greetEl) greetEl.textContent = `${greeting}, ${firstName}!`;

  const subEl = document.getElementById('greeting-sub');
  if (subEl) {
    subEl.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

function initUserProfile() {
  const user = getUser();
  if (!user) return;
  const avatarEl = document.getElementById('sidebar-avatar');
  const nameEl   = document.getElementById('sidebar-name');
  const emailEl  = document.getElementById('sidebar-email');
  if (avatarEl) avatarEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  if (nameEl)   nameEl.textContent   = user.name  || 'User';
  if (emailEl)  emailEl.textContent  = user.email || '';
}

// ─── Logout ───────────────────────────────────────────────────────────────────
function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (_) { /* ignore – logout locally regardless */ }
    clearToken();
    window.location.href = 'index.html';
  });
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const section = link.dataset.section;
      if (section) showSection(section);
      if (window.innerWidth < 768) closeSidebar();
    });
  });
}

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const sec = document.getElementById('section-' + name);
  if (sec) sec.classList.add('active');

  const nav = document.querySelector(`[data-section="${name}"]`);
  if (nav) nav.classList.add('active');

  if (name === 'analytics') {
    renderAnalyticsBar();
    renderAnalyticsDonut();
  }
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  if (sb) sb.classList.toggle('open');
  if (ov) ov.classList.toggle('visible');
}

function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.classList.remove('visible');
}

function initSidebarOverlay() {
  // The original HTML may not have the overlay div — create it
  if (!document.getElementById('sidebar-overlay')) {
    const ov = document.createElement('div');
    ov.id = 'sidebar-overlay';
    ov.className = 'sidebar-overlay';
    ov.addEventListener('click', closeSidebar);
    document.body.appendChild(ov);
  }
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function renderStatCards(data) {
  const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('stat-total',   fmt(data.monthTotal));
  set('stat-count',   data.monthCount || 0);
  set('stat-max',     fmt(data.maxExpense));
  set('stat-max-cat', data.maxCategory || '—');
  set('stat-avg',     fmt(data.dailyAverage));

  const trendEl = document.getElementById('stat-trend');
  if (trendEl && data.trendPercent != null) {
    const sign = data.trendPercent >= 0 ? '+' : '';
    trendEl.textContent = `${sign}${data.trendPercent}% vs last month`;
    trendEl.style.color = data.trendPercent > 0 ? '#FF6B6B' : '#A8FF78';
  }
}

// ─── Month Filter ─────────────────────────────────────────────────────────────
function initMonthFilter() {
  const sel = document.getElementById('filter-month');
  if (!sel) return;
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (i === 0) opt.selected = true;
    sel.appendChild(opt);
  }
}

// ─── Expense Table ────────────────────────────────────────────────────────────
function renderExpenseTable() {
  const catFilter   = document.getElementById('filter-category')?.value || '';
  const monthFilter = document.getElementById('filter-month')?.value    || '';

  let list = [...allExpenses];

  if (catFilter) {
    list = list.filter(e => e.category === catFilter);
  }
  if (monthFilter) {
    const [y, m] = monthFilter.split('-').map(Number);
    list = list.filter(e => {
      const d = new Date(e.expense_date);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
  }

  list.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));

  const tbody = document.getElementById('expense-table-body');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No expenses found.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(exp => {
    const icon    = CAT_ICONS[exp.category] || '📦';
    const dateStr = new Date(exp.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return `<tr>
      <td>${dateStr}</td>
      <td>
        <strong>${esc(exp.description)}</strong>
        ${exp.notes ? `<br><small style="color:var(--text-muted)">${esc(exp.notes)}</small>` : ''}
      </td>
      <td><span class="cat-badge">${icon} ${esc(exp.category)}</span></td>
      <td>
        <span style="font-family:var(--font-display);font-weight:700;color:var(--accent)">
          ₹${Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span><br>
        <small style="color:var(--text-muted)">${esc(exp.payment_mode || 'Cash')}</small>
      </td>
      <td>
        <div class="action-btns">
          <button class="action-btn" onclick="openEditModal(${exp.id})">✏️ Edit</button>
          <button class="action-btn delete" onclick="openDeleteModal(${exp.id})">🗑️ Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ─── Recent Expenses List ─────────────────────────────────────────────────────
function renderRecentList() {
  const now  = new Date();
  const list = allExpenses
    .filter(e => {
      const d = new Date(e.expense_date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
    .slice(0, 8);

  const container = document.getElementById('recent-list');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>No expenses yet this month</p>
      <button class="btn-add-inline" onclick="openModal()">Add your first expense</button>
    </div>`;
    return;
  }

  container.innerHTML = list.map(exp => {
    const icon    = CAT_ICONS[exp.category] || '📦';
    const dateStr = new Date(exp.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return `<div class="expense-item">
      <div class="exp-icon">${icon}</div>
      <div class="exp-info">
        <div class="exp-desc">${esc(exp.description)}</div>
        <div class="exp-meta">${dateStr} · ${esc(exp.category)} · ${esc(exp.payment_mode || 'Cash')}</div>
      </div>
      <div class="exp-amount">₹${Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>`;
  }).join('');
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function renderCalendar() {
  const grid  = document.getElementById('calendar-grid');
  const label = document.getElementById('cal-month-label');
  if (!grid || !label) return;

  label.textContent = new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build expense date set for this month
  const expDays = new Set();
  allExpenses.forEach(e => {
    const d = new Date(e.expense_date);
    if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
      expDays.add(d.getDate());
    }
  });

  const firstDow    = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today       = new Date();

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let html = DAYS.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  // Empty cells before 1st
  for (let i = 0; i < firstDow; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday  = today.getDate() === day && today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
    const hasExp   = expDays.has(day);
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (hasExp)  cls += ' has-expense';
    html += `<div class="${cls}" onclick="selectDay(${day})">${day}</div>`;
  }

  grid.innerHTML = html;
}

function changeMonth(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0)  { calendarMonth = 11; calendarYear--; }
  if (calendarMonth > 11) { calendarMonth = 0;  calendarYear++; }
  renderCalendar();
  closeDrawer();
}

function selectDay(day) {
  // Mark selected
  document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.cal-day:not(.empty)').forEach(cell => {
    if (parseInt(cell.textContent) === day) cell.classList.add('selected');
  });

  const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const label   = new Date(calendarYear, calendarMonth, day)
    .toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const dayExps = allExpenses.filter(e => {
    const expDate = (e.expense_date || '').split('T')[0];
    return expDate === dateStr;
  });

  const titleEl = document.getElementById('day-drawer-title');
  const listEl  = document.getElementById('day-drawer-list');
  if (titleEl) titleEl.textContent = label;

  if (!dayExps.length) {
    listEl.innerHTML = `<div class="empty-state small">
      <p>No expenses on this day</p>
      <button class="btn-add-inline" onclick="openModalForDate('${dateStr}')">Add expense</button>
    </div>`;
  } else {
    const total = dayExps.reduce((s, e) => s + Number(e.amount), 0);
    listEl.innerHTML = dayExps.map(e => `
      <div class="expense-item">
        <div class="exp-icon">${CAT_ICONS[e.category] || '📦'}</div>
        <div class="exp-info">
          <div class="exp-desc">${esc(e.description)}</div>
          <div class="exp-meta">${esc(e.category)} · ${esc(e.payment_mode || 'Cash')}</div>
        </div>
        <div class="exp-amount">₹${Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>`).join('') +
      `<div style="padding:10px 20px;border-top:1px solid var(--border-light);display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted)">
        <span>Total</span>
        <strong style="color:var(--accent)">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>`;
  }

  document.getElementById('day-drawer')?.classList.add('open');
}

function closeDrawer() {
  document.getElementById('day-drawer')?.classList.remove('open');
  document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
}

// ─── Charts ───────────────────────────────────────────────────────────────────
function destroyChart(inst) {
  if (inst) { try { inst.destroy(); } catch (_) {} }
  return null;
}

function renderCategoryChart() {
  const canvas = document.getElementById('category-chart');
  if (!canvas) return;
  categoryChartInst = destroyChart(categoryChartInst);

  const now = new Date();
  const monthExp = allExpenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const totals = {};
  CATEGORIES.forEach(c => (totals[c] = 0));
  monthExp.forEach(e => { if (e.category in totals) totals[e.category] += Number(e.amount); });

  const cats   = CATEGORIES.filter(c => totals[c] > 0);
  const data   = cats.map(c => totals[c]);
  const colors = cats.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]);

  if (!cats.length) {
    const wrapper = canvas.closest('.chart-container');
    if (wrapper) wrapper.innerHTML = '<div class="empty-state" style="flex:1">No data yet for this month</div>';
    return;
  }

  categoryChartInst = new Chart(canvas, {
    type: 'doughnut',
    data: { labels: cats, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}` } }
      }
    }
  });

  const legend = document.getElementById('category-legend');
  if (legend) {
    legend.innerHTML = cats.map((cat, i) => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${colors[i]}"></div>
        <span class="legend-label">${cat}</span>
        <span class="legend-val">₹${Number(totals[cat]).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
      </div>`).join('');
  }
}

function renderTrendChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;
  trendChartInst = destroyChart(trendChartInst);

  const now = new Date();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daily = Array(days).fill(0);

  allExpenses.forEach(e => {
    const d = new Date(e.expense_date);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      daily[d.getDate() - 1] += Number(e.amount);
    }
  });

  trendChartInst = new Chart(canvas, {
    type: 'line',
    data: {
      labels: Array.from({ length: days }, (_, i) => i + 1),
      datasets: [{
        data: daily,
        borderColor: '#6C63FF',
        backgroundColor: 'rgba(108,99,255,0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#6C63FF'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8888AA', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8888AA', font: { size: 10 }, callback: v => '₹' + v } }
      }
    }
  });
}

function renderAnalyticsBar() {
  const canvas = document.getElementById('monthly-bar-chart');
  if (!canvas) return;
  barChartInst = destroyChart(barChartInst);

  const now = new Date();
  const months = [], totals = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('default', { month: 'short' }));
    const t = allExpenses.reduce((s, e) => {
      const ed = new Date(e.expense_date);
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth() ? s + Number(e.amount) : s;
    }, 0);
    totals.push(t);
  }

  barChartInst = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        data: totals,
        backgroundColor: months.map((_, i) => i === 5 ? '#6C63FF' : 'rgba(108,99,255,0.35)'),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8888AA' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8888AA', callback: v => '₹' + v } }
      }
    }
  });
}

function renderAnalyticsDonut() {
  const canvas = document.getElementById('analytics-donut');
  if (!canvas) return;
  donutChartInst = destroyChart(donutChartInst);

  const totals = {};
  CATEGORIES.forEach(c => (totals[c] = 0));
  allExpenses.forEach(e => { if (e.category in totals) totals[e.category] += Number(e.amount); });

  const cats   = CATEGORIES.filter(c => totals[c] > 0);
  const data   = cats.map(c => totals[c]);
  const colors = cats.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]);

  if (!cats.length) return;

  donutChartInst = new Chart(canvas, {
    type: 'doughnut',
    data: { labels: cats, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}` } }
      }
    }
  });

  const legend = document.getElementById('analytics-legend');
  if (legend) {
    legend.innerHTML = cats.map((cat, i) => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${colors[i]}"></div>
        <span class="legend-label">${cat}</span>
        <span class="legend-val">₹${Number(totals[cat]).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
      </div>`).join('');
  }
}

// ─── Budget Grid ──────────────────────────────────────────────────────────────
function renderBudgetGrid(categoryTotals) {
  const grid = document.getElementById('budget-grid');
  if (!grid) return;

  const now = new Date();
  grid.innerHTML = CATEGORIES.map(cat => {
    // Use backend totals if available, else calculate from allExpenses
    const spent = (categoryTotals && categoryTotals[cat] != null)
      ? Number(categoryTotals[cat])
      : allExpenses.filter(e => {
          const d = new Date(e.expense_date);
          return e.category === cat && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((s, e) => s + Number(e.amount), 0);

    const budget    = BUDGETS_DEF[cat] || 1000;
    const pct       = Math.min((spent / budget) * 100, 100);
    const colorClass = pct >= 90 ? 'red' : pct >= 70 ? 'yellow' : 'green';
    const remaining  = Math.max(budget - spent, 0);
    const icon = CAT_ICONS[cat];

    return `<div class="budget-card">
      <div class="budget-card-header">
        <div class="budget-cat">${icon} ${cat}</div>
        <div class="budget-amounts">
          <span>₹${Number(spent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          / ₹${Number(budget).toLocaleString('en-IN')}
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${colorClass}" style="width:${pct}%"></div>
      </div>
      <div class="budget-meta">
        <span>${pct.toFixed(1)}% used</span>
        <span>₹${Number(remaining).toLocaleString('en-IN', { maximumFractionDigits: 0 })} left</span>
      </div>
    </div>`;
  }).join('');
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function initModal() {
  const form = document.getElementById('expense-form');
  if (form) form.addEventListener('submit', handleExpenseSubmit);
}

function openModal() {
  editingId = null;
  const title   = document.getElementById('modal-title');
  const btnText = document.getElementById('modal-submit-btn')?.querySelector('.btn-text');
  if (title)   title.textContent   = 'Add Expense';
  if (btnText) btnText.textContent = 'Save Expense';

  document.getElementById('expense-form')?.reset();

  // Set today's date
  const dateEl = document.getElementById('exp-date');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];

  clearModalErrors();
  document.getElementById('modal-overlay')?.classList.remove('hidden');
}

function openModalForDate(dateStr) {
  openModal();
  const dateEl = document.getElementById('exp-date');
  if (dateEl) dateEl.value = dateStr;
}

function openEditModal(id) {
  const exp = allExpenses.find(e => e.id === id);
  if (!exp) return;
  editingId = id;

  const title   = document.getElementById('modal-title');
  const btnText = document.getElementById('modal-submit-btn')?.querySelector('.btn-text');
  if (title)   title.textContent   = 'Edit Expense';
  if (btnText) btnText.textContent = 'Update Expense';

  const s = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
  s('exp-amount',   exp.amount);
  s('exp-date',     (exp.expense_date || '').split('T')[0]);
  s('exp-desc',     exp.description);
  s('exp-category', exp.category);
  s('exp-mode',     exp.payment_mode || 'Cash');
  s('exp-note',     exp.notes || '');

  clearModalErrors();
  document.getElementById('modal-overlay')?.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay')?.classList.add('hidden');
}

function closeModalOnOverlay(e) {
  if (e.target && e.target.id === 'modal-overlay') closeModal();
}

function clearModalErrors() {
  ['exp-amount-error', 'exp-date-error', 'exp-desc-error', 'exp-category-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

async function handleExpenseSubmit(e) {
  e.preventDefault();
  clearModalErrors();

  const amount       = parseFloat(document.getElementById('exp-amount')?.value);
  const date         = document.getElementById('exp-date')?.value;
  const description  = document.getElementById('exp-desc')?.value?.trim();
  const category     = document.getElementById('exp-category')?.value;
  const payment_mode = document.getElementById('exp-mode')?.value || 'Cash';
  const notes        = document.getElementById('exp-note')?.value?.trim() || null;
  let valid = true;

  if (!amount || amount <= 0) { setErr('exp-amount-error',   'Enter a valid amount.');   valid = false; }
  if (!date)                  { setErr('exp-date-error',     'Select a date.');           valid = false; }
  if (!description)           { setErr('exp-desc-error',     'Enter a description.');     valid = false; }
  if (!category)              { setErr('exp-category-error', 'Select a category.');       valid = false; }
  if (!valid) return;

  const btn     = document.getElementById('modal-submit-btn');
  const btnText = btn?.querySelector('.btn-text');
  const spinner = btn?.querySelector('.btn-spinner');
  if (btnText) btnText.classList.add('hidden');
  if (spinner) spinner.classList.remove('hidden');
  if (btn)    btn.disabled = true;

  try {
    const payload = { amount, expense_date: date, description, category, payment_mode, notes };

    if (editingId != null) {
      await apiRequest(`/expenses/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('✅ Expense updated!', 'success');
    } else {
      await apiRequest('/expenses', { method: 'POST', body: JSON.stringify(payload) });
      showToast('✅ Expense added!', 'success');
    }

    closeModal();
    await loadAll();

  } catch (err) {
    showToast(err.message || 'Failed to save. Try again.', 'error');
  } finally {
    if (btnText) btnText.classList.remove('hidden');
    if (spinner) spinner.classList.add('hidden');
    if (btn)    btn.disabled = false;
  }
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function openDeleteModal(id) {
  pendingDeleteId = id;
  const btn = document.getElementById('confirm-delete-btn');
  if (btn) btn.onclick = confirmDelete;
  document.getElementById('delete-overlay')?.classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('delete-overlay')?.classList.add('hidden');
}

function closeDeleteOnOverlay(e) {
  if (e.target && e.target.id === 'delete-overlay') closeDeleteModal();
}

async function confirmDelete() {
  const idToDelete = pendingDeleteId;
  if (!idToDelete) return;
  const btn = document.getElementById('confirm-delete-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Deleting...'; }
  try {
    await apiRequest(`/expenses/${idToDelete}`, { method: 'DELETE' });
    closeDeleteModal();
    showToast('🗑️ Expense deleted.', 'success');
    await loadAll();
  } catch (err) {
    showToast(err.message || 'Failed to delete.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Delete'; }
  }
}
// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
