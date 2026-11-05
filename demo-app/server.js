// Tiny dependency-free demo server: static pages + a mock JSON API.
// All data is fake and kept in memory. Restarting the server resets it.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, 'public');

const DEMO_USER = { email: 'qa.user@example.test', password: 'Passw0rd!demo', name: 'QA User' };
const TOKEN = 'demo-token-not-a-secret';

const seedEmployees = () => [
  { id: 1, firstName: 'Alice', lastName: 'Anderson', email: 'alice.anderson@example.test', department: 'Finance', salary: 72000 },
  { id: 2, firstName: 'Bob', lastName: 'Baker', email: 'bob.baker@example.test', department: 'Engineering', salary: 88000 },
  { id: 3, firstName: 'Carla', lastName: 'Chen', email: 'carla.chen@example.test', department: 'HR', salary: 65000 },
  { id: 4, firstName: 'Dmitri', lastName: 'Dunn', email: 'dmitri.dunn@example.test', department: 'Engineering', salary: 91000 },
  { id: 5, firstName: 'Elena', lastName: 'Evans', email: 'elena.evans@example.test', department: 'Operations', salary: 58000 },
];
let employees = seedEmployees();
let nextId = 6;

const DEPARTMENTS = ['Finance', 'Engineering', 'HR', 'Operations', 'Sales'];

// Deterministic payslip so visual tests are stable.
const payslip = {
  period: 'March 2025',
  employee: 'Alice Anderson',
  gross: 6000.0,
  deductions: [
    { name: 'Income tax', amount: 1050.0 },
    { name: 'Social contribution', amount: 420.0 },
    { name: 'Pension', amount: 300.0 },
  ],
};

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve(null); }
    });
  });
}

function validateEmployee(e) {
  const errors = {};
  if (!e.firstName || !String(e.firstName).trim()) errors.firstName = 'First name is required';
  if (!e.lastName || !String(e.lastName).trim()) errors.lastName = 'Last name is required';
  if (!e.email || !String(e.email).trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)) errors.email = 'Enter a valid email address';
  if (!DEPARTMENTS.includes(e.department)) errors.department = 'Department is required';
  const salary = Number(e.salary);
  if (e.salary === '' || e.salary === undefined || e.salary === null) errors.salary = 'Salary is required';
  else if (!Number.isFinite(salary)) errors.salary = 'Salary must be a number';
  else if (salary <= 0) errors.salary = 'Salary must be greater than zero';
  return errors;
}

async function handleApi(req, res, url) {
  const route = `${req.method} ${url.pathname}`;

  if (route === 'POST /api/login') {
    const body = await readBody(req);
    if (body && body.email === DEMO_USER.email && body.password === DEMO_USER.password) {
      return send(res, 200, { token: TOKEN, name: DEMO_USER.name });
    }
    return send(res, 401, { error: 'Invalid email or password' });
  }

  if (route === 'POST /api/test/reset') {
    employees = seedEmployees();
    nextId = 6;
    return send(res, 200, { ok: true });
  }

  if (route === 'GET /api/health') return send(res, 200, { status: 'ok' });

  // Everything below requires auth.
  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    return send(res, 401, { error: 'Unauthorized' });
  }

  if (route === 'GET /api/employees') {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const list = q
      ? employees.filter((e) => `${e.firstName} ${e.lastName} ${e.email} ${e.department}`.toLowerCase().includes(q))
      : employees;
    return send(res, 200, { total: list.length, items: list });
  }

  if (route === 'POST /api/employees') {
    const body = await readBody(req);
    if (body === null) return send(res, 400, { error: 'Invalid JSON' });
    const errors = validateEmployee(body);
    if (Object.keys(errors).length) return send(res, 422, { errors });
    const emp = {
      id: nextId++,
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      email: String(body.email).trim(),
      department: body.department,
      salary: Number(body.salary),
    };
    employees.push(emp);
    return send(res, 201, emp);
  }

  if (route === 'GET /api/payslip') return send(res, 200, payslip);

  return send(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);

  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Demo app listening on http://localhost:${PORT}`));
