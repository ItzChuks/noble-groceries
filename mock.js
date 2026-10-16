// Frontend-only demo backend: mimics the PocketBase calls the pages use, stored in localStorage.
function createMockPB() {
  const mem = {};
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }, del: k => { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } } };
  const KEY = 'noble_db_v2', REL = { user: 'users', plan: 'plans', subscription: 'subscriptions' };
  let db = JSON.parse(ls.get(KEY) || 'null');
  const save = () => ls.set(KEY, JSON.stringify(db));
  const uid = () => Math.random().toString(36).slice(2, 12).padEnd(10, '0');
  const now = (age = 0) => new Date(Date.now() - age * 864e5).toISOString().replace('T', ' ').slice(0, 19);
  const add = (c, o, age = 0) => { const r = { id: uid(), created: now(age), ...o }; db[c].push(r); return r; };
  if (!db) {
    db = { users: [], plans: [], subscriptions: [], payments: [], payouts: [] };
    add('users', { email: 'admin@noble.com', password: 'admin12345', name: 'Noble Admin', country: 'Nigeria', phone: '08037795455', role: 'admin' }, 60);
    const u = add('users', { email: 'user@noble.com', password: 'user12345', name: 'Ada Okafor', country: 'Nigeria', phone: '08012345678', role: 'user' }, 40);
    add('users', { email: 'chidi@example.com', password: 'pass12345', name: 'Chidi Eze', country: 'Ghana', phone: '0244000111', role: 'user' }, 15);
    const n = a => '₦' + a.toLocaleString();
    [['Grocery Plan 1', 250, ' 50kg Rice, 5L Groundnut Oil, 1 Carton of Indomitable'], ['Grocery Plan 2', 500, '2 Bags of 50kg Rice, 10kg Semo, 5L Groundnut Oil, 1 Carton of Indomitable, 2 Packets of Knorr Cubes'], ['Grocery Plan 3', 800, '3 Bags of 50kg Rice, 5L Groundnut Oil, 3 Cartons of Indomitable, 2 Cartons of Spaghetti, 2 Packets of Knorr Cubes'], ['Grocery Plan 4', 1000, '4 Bags of 50kg Rice, 10kg Groundnut Oil, 10kg Semo, 4 Cartons of Indomitable, 1 Carton of Spaghetti']]
      .forEach(([name, a, d]) => add('plans', { name, category: 'grocery', frequency: 'daily', amount: a, duration: 365, payout: a * 365, description: d.trim(), active: true }, 50));
    [['daily', 365, [100, 200, 300, 400, 500, 1000, 1500, 2000, 2500, 3000]], ['weekly', 53, [500, 1000, 1500, 2000, 2500, 3000]], ['monthly', 12, [2000, 2500, 3000, 5000, 10000, 15000, 20000]]]
      .forEach(([f, d, l]) => l.forEach(a => add('plans', { name: f[0].toUpperCase() + f.slice(1) + ' Savings ' + n(a), category: 'cash', frequency: f, amount: a, duration: d, payout: a * d, description: '', active: true }, 50)));
    const pl = nm => db.plans.find(p => p.name === nm).id;
    const s1 = add('subscriptions', { user: u.id, plan: pl('Daily Savings ₦500'), status: 'active' }, 11);
    const s2 = add('subscriptions', { user: u.id, plan: pl('Grocery Plan 2'), status: 'active' }, 3);
    // s1: 12 instalments covered; payment #10 was made after the deadline, so it carries a ₦500 penalty
    for (let i = 0; i < 12; i++) { const late = i === 10; add('payments', { user: u.id, subscription: s1.id, amount: late ? 1000 : 500, penalty: late ? 500 : 0, installments: 1, late_count: late ? 1 : 0, note: 'TRF' + (1000 + i), status: i < 10 ? 'confirmed' : 'pending' }, 11 - i); }
    for (let i = 0; i < 4; i++) add('payments', { user: u.id, subscription: s2.id, amount: 500, penalty: 0, installments: 1, late_count: 0, note: 'TRF' + (2000 + i), status: 'confirmed' }, 3 - i);
    save();
  }
  const test = (r, f) => !f || f.split('&&').every(c => { const m = c.trim().match(/^(\w+)\s*=\s*(?:"([^"]*)"|(true|false))$/); if (!m) return true; return r[m[1]] === (m[2] !== undefined ? m[2] : m[3] === 'true'); });
  const sortBy = (l, s) => { const k = (s || '-created').split(','); return [...l].sort((a, b) => { for (let x of k) { x = x.trim(); const d = x[0] === '-', f = d ? x.slice(1) : x; if (a[f] < b[f]) return d ? 1 : -1; if (a[f] > b[f]) return d ? -1 : 1; } return 0; }); };
  const expand = (r, paths) => { if (!paths) return r; const o = { ...r, expand: {} }; paths.split(',').forEach(p => { const [f, ...rest] = p.trim().split('.'); const x = db[REL[f]].find(z => z.id === r[f]); if (x) o.expand[f] = rest.length ? expand(x, rest.join('.')) : x; }); return o; };
  let aid = null; try { const a = JSON.parse(ls.get('pocketbase_auth') || 'null'); aid = a && a.model && a.model.id; } catch (e) {}
  const authStore = { get model() { return db.users.find(u => u.id === aid) || null; }, get record() { return this.model; }, get isValid() { return !!this.model; }, clear() { aid = null; ls.del('pocketbase_auth'); } };
  const list = (c, o = {}) => sortBy(db[c].filter(r => test(r, o.filter)), o.sort).map(r => expand(r, o.expand));
  const col = c => ({
    async getFullList(o) { return list(c, o); },
    async getList(p, n, o) { const l = list(c, o); return { items: l.slice((p - 1) * n, p * n), totalItems: l.length, page: p, perPage: n }; },
    async getOne(id) { const r = db[c].find(x => x.id === id); if (!r) throw new Error('Record not found.'); return r; },
    async create(d) {
      d = { ...d }; delete d.passwordConfirm;
      if (c === 'users') { if (db.users.some(u => u.email === d.email)) throw new Error('That email is already registered.'); d.role = 'user'; }
      const r = { id: uid(), created: now(), ...d }; db[c].push(r); save(); return r;
    },
    async update(id, d) { const r = db[c].find(x => x.id === id); if (!r) throw new Error('Record not found.'); Object.assign(r, d); save(); return r; },
    async delete(id) { db[c] = db[c].filter(x => x.id !== id); save(); return true; },
    async authRefresh() { return { record: authStore.model }; },
    async authWithPassword(e, p) {
      const u = db.users.find(x => x.email === e && x.password === p); if (!u) throw new Error('Invalid email or password.');
      aid = u.id; ls.set('pocketbase_auth', JSON.stringify({ token: 'mock', model: { id: u.id, role: u.role } })); return { record: u };
    }
  });
  return { collection: col, authStore };
}
