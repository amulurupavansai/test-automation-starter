// Shared helpers for the demo pages (no framework).
const TOKEN_KEY = 'demo_token';
const $ = (sel) => document.querySelector(sel);

function token() { return localStorage.getItem(TOKEN_KEY); }
function requireAuth() { if (!token()) { location.href = '/index.html'; return false; } return true; }

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(options.headers || {}) },
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

function money(n) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }

function renderHeader(active) {
  const h = document.createElement('header');
  h.innerHTML = `<span class="brand">Demo HR App</span>
    <nav aria-label="Main"><a href="/employees.html">Employees</a> · <a href="/add-employee.html">Add employee</a> · <a href="/payslip.html">Payslip</a></nav>
    <button class="link" id="logout" type="button">Log out</button>`;
  document.body.prepend(h);
  $('#logout').addEventListener('click', () => { localStorage.removeItem(TOKEN_KEY); location.href = '/index.html'; });
}

// ---- Page initialisers (selected via <body data-page="...">) ----
const pages = {
  login() {
    $('#login-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const email = $('#email').value.trim();
      const password = $('#password').value;
      $('#email-error').textContent = email ? '' : 'Email is required';
      $('#password-error').textContent = password ? '' : 'Password is required';
      $('#login-error').hidden = true;
      if (!email || !password) return;
      const r = await api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }), headers: { Authorization: '' } });
      if (r.ok) { localStorage.setItem(TOKEN_KEY, r.data.token); location.href = '/employees.html'; }
      else { $('#login-error').textContent = r.data?.error || 'Login failed'; $('#login-error').hidden = false; }
    });
  },

  async employees() {
    if (!requireAuth()) return;
    renderHeader();
    const body = $('#employee-rows');
    async function load(q = '') {
      const r = await api(`/api/employees?q=${encodeURIComponent(q)}`);
      if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); location.href = '/index.html'; return; }
      body.innerHTML = '';
      r.data.items.forEach((e) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${e.firstName} ${e.lastName}</td><td>${e.email}</td><td>${e.department}</td><td class="num">${money(e.salary)}</td>`;
        body.appendChild(tr);
      });
      $('#result-count').textContent = `${r.data.total} employee(s) found`;
      $('#empty-state').hidden = r.data.total !== 0;
    }
    $('#search').addEventListener('input', (ev) => load(ev.target.value));
    load();
  },

  addEmployee() {
    if (!requireAuth()) return;
    renderHeader();
    const fields = ['firstName', 'lastName', 'email', 'department', 'salary'];
    $('#employee-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const payload = Object.fromEntries(fields.map((f) => [f, $('#' + f).value]));
      fields.forEach((f) => ($('#' + f + '-error').textContent = ''));
      $('#form-success').hidden = true;
      const r = await api('/api/employees', { method: 'POST', body: JSON.stringify(payload) });
      if (r.status === 422) {
        Object.entries(r.data.errors).forEach(([f, msg]) => ($('#' + f + '-error').textContent = msg));
      } else if (r.ok) {
        $('#form-success').textContent = `Employee ${r.data.firstName} ${r.data.lastName} added`;
        $('#form-success').hidden = false;
        $('#employee-form').reset();
      }
    });
  },

  async payslip() {
    if (!requireAuth()) return;
    renderHeader();
    const r = await api('/api/payslip');
    const p = r.data;
    const totalDed = p.deductions.reduce((s, d) => s + d.amount, 0);
    $('#payslip-meta').textContent = `${p.employee} — ${p.period}`;
    $('#payslip-rows').innerHTML =
      `<tr><th scope="row">Gross pay</th><td class="num">${money(p.gross)}</td></tr>` +
      p.deductions.map((d) => `<tr><th scope="row">${d.name}</th><td class="num">-${money(d.amount)}</td></tr>`).join('') +
      `<tr><th scope="row">Net pay</th><td class="num" id="net-pay">${money(p.gross - totalDed)}</td></tr>`;
  },
};

const initName = document.body.dataset.page;
if (initName && pages[initName]) pages[initName]();
