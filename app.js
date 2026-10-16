// ===== CONFIG =====
const PB_URL = 'https://noble-backend-production-16f3.up.railway.app';
const USE_MOCK = false; // false = real PocketBase (default). true = offline demo using localStorage + mock.js.
const pb = USE_MOCK ? createMockPB() : new PocketBase(PB_URL);
pb.autoCancellation?.(false); // the pages fire several identical requests in parallel; don't let the SDK cancel them

document.head.insertAdjacentHTML('beforeend', '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>body{font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}</style>');

// ===== helpers =====
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const naira = n => '₦' + Number(n || 0).toLocaleString();
const date = d => d ? new Date(d.replace(' ', 'T')).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const inp = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700';
const btn = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition';
const btn2 = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition';
const refresh = () => dispatchEvent(new Event('hashchange'));
const FQ = { daily: 'day', weekly: 'week', monthly: 'month' };
const ic = d => `<svg class="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
const IC = { overview: 'M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-3H4z', plans: 'M4 6h16M4 12h16M4 18h10', mine: 'M4 20V10M10 20V4M16 20v-7M22 20H2', payments: 'M3 6h18v12H3zM3 10h18', payouts: 'M12 4v11m0 0l-4-4m4 4l4-4M5 20h14', profile: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0', users: 'M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 20v-1a4 4 0 00-3-3.9', subs: 'M9 12l2 2 4-4M5 4h14v16H5z', out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h9', menu: 'M4 6h16M4 12h16M4 18h16', moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z', sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4', rules: 'M9 12h6M9 16h6M7 3h8l4 4v14H7zM15 3v4h4', search: 'M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z' };

// ===== theme (light / dark) =====
const THEME_KEY = 'noble_theme';
const getTheme = () => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } };
const applyTheme = t => { document.documentElement.classList.toggle('dark', t === 'dark'); };
applyTheme(getTheme() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
window.toggleTheme = () => {
  const t = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  applyTheme(t);
  const b = $('#tg'); if (b) b.innerHTML = ic(t === 'dark' ? IC.sun : IC.moon);
};
document.head.insertAdjacentHTML('beforeend', `<style>
html.dark{color-scheme:dark}
html.dark *{border-color:#24332d}
.dark body.bg-slate-50{background-color:#0a110f;color:#e2ebe7}
.dark .bg-white{background-color:#111c18}
.dark .bg-slate-50{background-color:#0e1814}
.dark .bg-slate-100{background-color:#1a2722}
.dark .bg-slate-900{background-color:#1c2b25}
.dark .bg-slate-50\\/95{background-color:rgba(10,17,15,.95)}
.dark .bg-white\\/90{background-color:rgba(17,28,24,.9)}
.dark .hover\\:bg-slate-50:hover,.dark .hover\\:bg-slate-100:hover,.dark .hover\\:bg-slate-50\\/60:hover{background-color:#1a2722}
.dark .text-slate-900{color:#f1f6f4}
.dark .text-slate-800{color:#e2ebe7}
.dark .text-slate-700{color:#cdd9d4}
.dark .text-slate-600{color:#b4c2bc}
.dark .text-slate-500{color:#8fa19a}
.dark .text-slate-400,.dark input::placeholder{color:#6d7f78}
.dark .text-emerald-800{color:#34d399}
.dark .text-amber-800{color:#fbbf24}
.dark .text-red-700,.dark .text-red-600{color:#f87171}
.dark .text-blue-700{color:#60a5fa}
.dark .bg-emerald-50{background-color:rgba(16,185,129,.14)}
.dark .bg-amber-50{background-color:rgba(245,158,11,.14)}
.dark .bg-red-50{background-color:rgba(239,68,68,.14)}
.dark .bg-blue-50{background-color:rgba(59,130,246,.14)}
.dark .ring-emerald-200{--tw-ring-color:rgba(52,211,153,.3)}
.dark .ring-amber-200{--tw-ring-color:rgba(251,191,36,.3)}
.dark .ring-red-200{--tw-ring-color:rgba(248,113,113,.3)}
.dark .ring-blue-200{--tw-ring-color:rgba(96,165,250,.3)}
.dark .ring-slate-200{--tw-ring-color:#2c3f37}
.dark select option{background-color:#111c18;color:#e2ebe7}
</style>`);

// ===== payment rules (all deadlines use Lagos time, WAT = UTC+1, no daylight saving) =====
// lateMultiplier 2 = a late instalment costs double (e.g. ₦100 becomes ₦200).
const RULES = { cutoffHour: 12, lateMultiplier: 2, weeklyDay: 5 /* Friday */, monthlyGraceDay: 2 };
const LAGOS = 1;
const toL = d => new Date(d.getTime() + LAGOS * 36e5);                       // read Lagos wall-clock with getUTC*()
const fromL = (y, m, d, h = 0, mi = 0, s = 0) => new Date(Date.UTC(y, m, d, h, mi, s) - LAGOS * 36e5);
const parseTs = s => { if (s instanceof Date) return s; const t = String(s).trim().replace(' ', 'T'); return new Date(/(Z|[+-]\d\d:?\d\d)$/.test(t) ? t : t + 'Z'); };
const unit = (n, f) => FQ[f] + (n === 1 ? '' : 's');
const plural = (n, f) => n + ' ' + unit(n, f);
const fmtDue = (f, d) => !d ? 'Fully paid' : d.toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + (f === 'monthly' ? ' (end of day)' : ', ' + RULES.cutoffHour + ':00 noon');

// deadline of the very first instalment, from the moment the user joined
function firstDue(freq, joined) {
  const L = toL(joined), y = L.getUTCFullYear(), m = L.getUTCMonth(), d = L.getUTCDate();
  if (freq === 'daily') { const t = fromL(y, m, d, RULES.cutoffHour); return joined < t ? t : fromL(y, m, d + 1, RULES.cutoffHour); }
  if (freq === 'weekly') { const add = (RULES.weeklyDay - L.getUTCDay() + 7) % 7; let t = fromL(y, m, d + add, RULES.cutoffHour); if (joined >= t) t = fromL(y, m, d + add + 7, RULES.cutoffHour); return t; }
  return fromL(y, m + 1, RULES.monthlyGraceDay, 23, 59, 59);               // monthly: 2nd of next month
}
// deadline of instalment number i (0-based)
function dueAt(freq, first, i) {
  const L = toL(first), y = L.getUTCFullYear(), m = L.getUTCMonth(), d = L.getUTCDate();
  if (freq === 'daily') return fromL(y, m, d + i, RULES.cutoffHour);
  if (freq === 'weekly') return fromL(y, m, d + 7 * i, RULES.cutoffHour);
  return fromL(y, m + i, RULES.monthlyGraceDay, 23, 59, 59);
}
// how many instalments a payment record covers (older records without the field are estimated)
const instOf = (p, pl) => p.installments || Math.max(1, Math.round(((p.amount || 0) - (p.penalty || 0)) / (pl.amount || 1)));

// where a subscription stands right now: instalments covered, overdue count, next deadline, cost of each next instalment
function planState(sub, pl, pays, now = new Date()) {
  const A = pl.amount, pen = A * (RULES.lateMultiplier - 1);
  const paid = pays.filter(p => p.subscription === sub.id && p.status !== 'rejected').reduce((a, p) => a + instOf(p, pl), 0);
  const left = Math.max(0, pl.duration - paid), first = firstDue(pl.frequency, parseTs(sub.created)), due = i => dueAt(pl.frequency, first, i);
  let overdue = 0; while (overdue < left && due(paid + overdue) <= now) overdue++;
  return { A, pen, paid, left, duration: pl.duration, due, overdue, next: left ? due(paid) : null, cost: k => A + (k < overdue ? pen : 0) };
}
// validate a typed amount: it must be a whole number of instalments, late ones including their penalty
function quoteFor(st, amount) {
  const cum = [0];
  for (let k = 0; k < st.left && cum[k] < amount; k++) cum.push(cum[k] + st.cost(k));
  const n = cum.indexOf(amount), c = Math.max(n, 0), late = Math.min(c, st.overdue);
  return { ok: n > 0, n: c, cum, total: amount, base: c * st.A, late, penalty: late * st.pen,
    max: st.left * st.A + Math.min(st.overdue, st.left) * st.pen,
    next: n > 0 && st.paid + n < st.duration ? st.due(st.paid + n) : null,
    lower: [...cum].reverse().find(v => v > 0 && v < amount), higher: cum.find(v => v > amount) };
}
// ===== end payment rules =====

const penBadge = p => p.penalty > 0 ? `<span class="inline-flex px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset bg-amber-50 text-amber-800 ring-amber-200">Late · +${naira(p.penalty)}</span>` : '<span class="text-slate-400">—</span>';
const covers = p => { const pl = p.expand?.subscription?.expand?.plan || {}; return pl.frequency ? plural(instOf(p, pl), pl.frequency) : '—'; };
const rulesHTML = () => {
  const m = RULES.lateMultiplier, c = (t, d) => `<div class="bg-white border rounded-xl p-5"><h3 class="font-semibold text-slate-900 text-sm">${t}</h3><p class="text-sm text-slate-600 mt-1.5 leading-relaxed">${d}</p></div>`;
  return '<div class="grid md:grid-cols-2 gap-4 max-w-4xl">'
    + c('Daily plans', `Pay before <b>${RULES.cutoffHour}:00 noon</b> each day. After noon the payment is doubled: ${naira(100)} becomes ${naira(100 * m)}.`)
    + c('Weekly plans', `Pay any time from Monday up to <b>Friday ${RULES.cutoffHour}:00 noon</b>. After that the week's payment is doubled.`)
    + c('Monthly plans', `Each month's payment is due by the <b>${RULES.monthlyGraceDay}nd day of the following month</b>. After that it is doubled.`)
    + c('Late penalty', `The payment form will not accept a late payment without its penalty. If several payments were missed, each one carries its own penalty. A penalty is a fee: it does not count towards your savings or payout.`)
    + c('Paying ahead', `You can pay more than one instalment at once. On a ${naira(100)} daily plan, paying ${naira(500)} covers 5 days. The form shows how many it covers and when your next payment is due. The amount must be a whole number of instalments.`)
    + c('Your first payment', `Daily: today before noon if you join before noon, otherwise tomorrow before noon. Weekly: the coming Friday noon (or the one after, if it has passed). Monthly: the 2nd of next month.`)
    + c('Admin visibility', `Every payment that includes a penalty is flagged to the admin, with the penalty amount shown.`)
    + c('Time and confirmation', `All deadlines use Lagos time (WAT), whatever your device clock says. Payments count once the admin confirms them.`) + '</div>';
};

function toast(m, err, ms = 3000) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-5 right-5 z-[60] px-4 py-2.5 rounded-lg text-sm text-white shadow-lg ' + (err ? 'bg-red-700' : 'bg-slate-900');
  t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), ms);
}
function guard(role) {
  if (!pb.authStore.isValid) { location.href = 'auth.html'; return false; }
  if (role === 'admin' && pb.authStore.record.role !== 'admin') { location.href = 'dashboard.html'; return false; }
  // re-check with the server: picks up role changes and deleted accounts, and renews the token
  pb.collection('users').authRefresh().then(() => {
    if (role === 'admin' && pb.authStore.record.role !== 'admin') location.href = 'dashboard.html';
  }).catch(e => { if ([401, 403, 404].includes(e.status)) { pb.authStore.clear(); location.href = 'auth.html'; } });
  return true;
}
function logout() { pb.authStore.clear(); location.href = 'index.html'; }

const badge = s => `<span class="inline-flex px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${({ active: 'bg-emerald-50 text-emerald-800 ring-emerald-200', confirmed: 'bg-emerald-50 text-emerald-800 ring-emerald-200', pending: 'bg-amber-50 text-amber-800 ring-amber-200', rejected: 'bg-red-50 text-red-700 ring-red-200', cancelled: 'bg-slate-50 text-slate-600 ring-slate-200', completed: 'bg-blue-50 text-blue-700 ring-blue-200' })[s] || 'bg-slate-50 text-slate-600 ring-slate-200'}">${cap(s)}</span>`;
const head = (t, sub, action = '') => `<div class="flex flex-wrap items-end justify-between gap-3 mb-6"><div><h1 class="text-xl font-semibold text-slate-900">${t}</h1><p class="text-sm text-slate-500 mt-0.5">${sub || ''}</p></div><div class="flex gap-2">${action}</div></div>`;
const stat = (l, v, s = '') => `<div class="bg-white border rounded-xl p-5"><p class="text-xs font-medium uppercase tracking-wide text-slate-500">${l}</p><p class="text-2xl font-semibold text-slate-900 mt-2">${v}</p>${s ? `<p class="text-xs text-slate-500 mt-1">${s}</p>` : ''}</div>`;
const table = (heads, rows) => rows.length
  ? `<div class="bg-white border rounded-xl overflow-x-auto"><table class="w-full text-sm text-left"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>${heads.map(h => `<th class="px-4 py-3 font-medium whitespace-nowrap">${h}</th>`).join('')}</tr></thead><tbody class="divide-y">${rows.map(r => `<tr class="hover:bg-slate-50/60">${r.map(c => `<td class="px-4 py-3 whitespace-nowrap">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
  : `<div class="bg-white border border-dashed rounded-xl p-10 text-center text-slate-500 text-sm">Nothing here yet.</div>`;
const fld = (label, name, val = '', type = 'text', extra = '') => `<label class="block text-sm"><span class="text-slate-600">${label}</span><input name="${name}" type="${type}" value="${esc(val)}" ${extra} class="${inp} mt-1"></label>`;
const sel = (label, name, opts, val) => `<label class="block text-sm"><span class="text-slate-600">${label}</span><select name="${name}" class="${inp} mt-1">${opts.map(o => `<option ${o == val ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;

function modal(title, body, onSubmit, cta = 'Save') {
  const d = document.createElement('div');
  d.className = 'fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4';
  d.innerHTML = `<form class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto"><h3 class="font-semibold text-slate-900">${title}</h3>${body}<div class="flex justify-end gap-2 pt-2"><button type="button" class="c ${btn2}">Cancel</button><button class="${btn}">${cta}</button></div></form>`;
  document.body.appendChild(d);
  $('.c', d).onclick = () => d.remove();
  $('form', d).onsubmit = async e => {
    e.preventDefault();
    try { await onSubmit(Object.fromEntries(new FormData(e.target))); d.remove(); refresh(); }
    catch (x) { toast(x.message, 1); }
  };
}

// ===== plan explorer: search, filters, sort, detail drawer with previous/next =====
const PS = { q: '', cat: 'all', freq: 'all', bud: 'all', sort: 'amount-asc' };
const BUD = { all: ['Any budget', () => true], a: ['Up to ₦500', p => p.amount <= 500], b: ['₦501 – ₦2,000', p => p.amount > 500 && p.amount <= 2000], c: ['Above ₦2,000', p => p.amount > 2000] };
const SORT = { 'amount-asc': ['Amount: low to high', (a, b) => a.amount - b.amount], 'amount-desc': ['Amount: high to low', (a, b) => b.amount - a.amount], 'payout-desc': ['Payout: high to low', (a, b) => b.payout - a.payout], name: ['Name: A to Z', (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })] };
const matchQ = (p, q) => [p.name, p.description, p.category, p.frequency, p.amount].join(' ').toLowerCase().includes(q.toLowerCase());
const filterPlans = l => l.filter(p => (PS.cat === 'all' || p.category === PS.cat) && (PS.freq === 'all' || p.frequency === PS.freq) && BUD[PS.bud][1](p) && (!PS.q.trim() || matchQ(p, PS.q.trim()))).sort(SORT[PS.sort][1]);
const opts = (o, v) => Object.entries(o).map(([k, x]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${Array.isArray(x) ? x[0] : x}</option>`).join('');

const planCard = (p, i, quick = '') => `<div onclick="openPlan(${i})" class="cursor-pointer bg-white border rounded-xl p-5 flex flex-col hover:border-emerald-700 hover:shadow-sm transition">
  <div class="flex items-center justify-between"><span class="text-xs font-medium uppercase tracking-wide text-slate-500">${p.category} · ${p.frequency}</span>${p.active === false ? badge('cancelled').replace('Cancelled', 'Hidden') : ''}</div>
  <h3 class="font-semibold text-slate-900 mt-2">${esc(p.name)}</h3>
  <p class="mt-3 text-2xl font-semibold text-slate-900">${naira(p.amount)}<span class="text-sm font-normal text-slate-500"> / ${FQ[p.frequency]}</span></p>
  <dl class="mt-3 text-sm space-y-1"><div class="flex justify-between"><dt class="text-slate-500">Duration</dt><dd>${p.duration} payments</dd></div><div class="flex justify-between"><dt class="text-slate-500">Total payout</dt><dd class="font-medium">${naira(p.payout)}</dd></div></dl>
  ${p.description ? `<p class="mt-3 text-xs text-slate-500 line-clamp-2">${esc(p.description)}</p>` : ''}
  <div class="mt-auto pt-4 flex gap-2" onclick="event.stopPropagation()">${quick}</div></div>`;

function explorer(m, all, o = {}) {
  const n = k => all.filter(p => p.category === k).length;
  m.innerHTML = `<div class="sticky top-16 z-10 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 mb-5 bg-slate-50/95 backdrop-blur border-b space-y-3">
    <div class="flex flex-wrap gap-2">
      <div class="relative flex-1 min-w-[220px]"><span class="absolute left-3 top-2.5 text-slate-400">${ic(IC.search)}</span><input id="pq" value="${esc(PS.q)}" placeholder="Search by name, amount or item…" class="${inp} pl-10"></div>
      <select id="pf" class="${inp} !w-auto">${opts({ all: 'All frequencies', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }, PS.freq)}</select>
      <select id="pb" class="${inp} !w-auto">${opts(BUD, PS.bud)}</select>
      <select id="ps" class="${inp} !w-auto">${opts(SORT, PS.sort)}</select></div>
    <div class="flex items-center justify-between gap-3"><div id="pt" class="flex gap-1.5 overflow-x-auto">${[['all', 'All plans', all.length], ['grocery', 'Grocery', n('grocery')], ['cash', 'Cash savings', n('cash')]].map(c => `<button data-c="${c[0]}" class="whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium border">${c[1]} <span class="opacity-60">${c[2]}</span></button>`).join('')}</div>
    <p class="text-sm text-slate-500 whitespace-nowrap"><span id="pc"></span> <button id="px" class="ml-2 text-emerald-800 font-medium hover:underline">Clear</button></p></div></div><div id="pr"></div>`;
  const paint = () => {
    const l = window._pl = filterPlans(all);
    document.querySelectorAll('#pt button').forEach(b => { const on = b.dataset.c === PS.cat; b.className = 'whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium border ' + (on ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-slate-600 hover:bg-slate-100'); });
    $('#pc').textContent = `Showing ${l.length} of ${all.length}`;
    $('#px').classList.toggle('hidden', !PS.q && PS.cat === 'all' && PS.freq === 'all' && PS.bud === 'all');
    $('#pr').innerHTML = !l.length ? '<div class="bg-white border border-dashed rounded-xl p-12 text-center text-sm text-slate-500">No plans match your search. Try clearing a filter.</div>'
      : o.cols ? table(o.cols.heads, l.map(o.cols.row))
      : `<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${l.map((p, i) => planCard(p, i, o.quick ? o.quick(p) : '')).join('')}</div>`;
  };
  $('#pq').oninput = e => { PS.q = e.target.value; paint(); };
  [['pf', 'freq'], ['pb', 'bud'], ['ps', 'sort']].forEach(([id, k]) => $('#' + id).onchange = e => { PS[k] = e.target.value; paint(); });
  $('#pt').onclick = e => { const b = e.target.closest('button'); if (b) { PS.cat = b.dataset.c; paint(); } };
  $('#px').onclick = () => { Object.assign(PS, { q: '', cat: 'all', freq: 'all', bud: 'all' }); explorer(m, all, o); };
  paint();
}

const dBtn = 'w-9 h-9 rounded-lg border grid place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white';
window.closePlan = () => $('#dr')?.remove();
window.openPlan = i => {
  const L = window._pl || [], p = L[i]; if (!p) return;
  closePlan();
  const d = document.createElement('div'); d.id = 'dr'; d.className = 'fixed inset-0 z-50 flex justify-end';
  const row = (k, v) => `<div class="flex justify-between py-3 text-sm"><dt class="text-slate-500">${k}</dt><dd class="font-medium text-slate-900 text-right">${v}</dd></div>`;
  const nb = (j, lab) => L[j] ? `<button onclick="openPlan(${j})" class="text-left flex-1 border rounded-lg p-3 hover:bg-slate-50"><span class="block text-xs text-slate-500">${lab}</span><span class="block text-sm font-medium truncate">${esc(L[j].name)}</span></button>` : '<span class="flex-1"></span>';
  d.innerHTML = `<div class="absolute inset-0 bg-slate-900/40" onclick="closePlan()"></div><aside class="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
    <div class="h-16 px-5 border-b flex items-center justify-between shrink-0"><div class="flex items-center gap-2"><button onclick="openPlan(${i - 1})" ${i ? '' : 'disabled'} class="${dBtn}" aria-label="Previous plan">‹</button><button onclick="openPlan(${i + 1})" ${i < L.length - 1 ? '' : 'disabled'} class="${dBtn}" aria-label="Next plan">›</button><span class="ml-1 text-sm text-slate-500">Plan ${i + 1} of ${L.length}</span></div><button onclick="closePlan()" class="${dBtn}" aria-label="Close">✕</button></div>
    <div class="flex-1 overflow-y-auto p-6"><p class="text-xs font-medium uppercase tracking-wide text-slate-500">${p.category} · ${p.frequency}</p><h2 class="text-xl font-semibold text-slate-900 mt-1">${esc(p.name)}</h2>
      <p class="mt-4 text-3xl font-semibold">${naira(p.amount)}<span class="text-base font-normal text-slate-500"> / ${FQ[p.frequency]}</span></p>
      <dl class="mt-5 divide-y border-y">${row('Number of payments', p.duration)}${row('Total you contribute', naira(p.amount * p.duration))}${row('Total payout', naira(p.payout))}${row('Status', p.active === false ? 'Hidden' : 'Open for enrolment')}</dl>
      ${p.description ? `<h3 class="mt-6 text-sm font-semibold">What's included</h3><p class="mt-2 text-sm text-slate-600 leading-relaxed">${esc(p.description)}</p>` : ''}
      <div class="mt-8 flex gap-2">${nb(i - 1, '← Previous')}${nb(i + 1, 'Next →')}</div></div>
    <div class="p-5 border-t shrink-0">${(window.PLAN_ACTION || (() => ''))(p)}</div></aside>`;
  document.body.appendChild(d);
};

// ===== app shell: sidebar, top bar with global plan search, keyboard shortcuts =====
function layout({ brand, nav, views }) {
  const u = pb.authStore.record, ini = (u.name || u.email || '?').trim()[0].toUpperCase();
  $('#app').innerHTML = `<div class="min-h-screen lg:flex">
  <div id="ov" class="fixed inset-0 bg-slate-900/40 z-30 hidden lg:hidden"></div>
  <aside id="sb" class="fixed lg:sticky top-0 z-40 h-screen w-60 shrink-0 bg-white border-r flex flex-col -translate-x-full lg:translate-x-0 transition-transform">
    <a href="index.html" class="h-16 px-5 flex items-center gap-3 border-b"><img src="logo.jpeg" alt="" class="w-8 h-8 rounded-md object-cover"><span class="font-semibold text-slate-900 text-[15px]">${brand}</span></a>
    <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">${nav.map(n => `<a href="#${n[0]}" data-id="${n[0]}" class="nl flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">${ic(IC[n[0]] || IC.overview)}${n[1]}</a>`).join('')}</nav>
    <div class="p-3 border-t"><button onclick="logout()" class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100">${ic(IC.out)}Log out</button></div>
  </aside>
  <div class="flex-1 min-w-0">
    <header class="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur border-b flex items-center gap-3 px-4 sm:px-8">
      <button id="mb" class="lg:hidden p-2 -ml-2 text-slate-600" aria-label="Menu">${ic(IC.menu)}</button>
      <span id="ttl" class="hidden md:block text-sm font-medium text-slate-900 w-44 shrink-0"></span>
      <div class="relative flex-1 max-w-md"><span class="absolute left-3 top-2.5 text-slate-400">${ic(IC.search)}</span><input id="gs" autocomplete="off" placeholder="Jump to a plan…  ( / )" class="${inp} pl-10 bg-slate-50"><div id="gr" class="hidden absolute left-0 right-0 top-11 bg-white border rounded-xl shadow-lg overflow-hidden divide-y"></div></div>
      <div class="ml-auto flex items-center gap-3"><button id="tg" onclick="toggleTheme()" class="p-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Switch between light and dark mode" title="Light / dark mode">${ic(document.documentElement.classList.contains('dark') ? IC.sun : IC.moon)}</button><div class="hidden sm:block text-right leading-tight"><p class="text-sm font-medium text-slate-900">${esc(u.name || u.email)}</p><p class="text-xs text-slate-500">${u.role === 'admin' ? 'Administrator' : 'Member'}</p></div><div class="w-9 h-9 rounded-full bg-emerald-800 text-white grid place-items-center text-sm font-semibold">${esc(ini)}</div></div>
    </header>
    <main id="main" class="p-4 sm:p-8 max-w-6xl mx-auto"></main>
  </div></div>`;
  const tog = () => { $('#sb').classList.toggle('-translate-x-full'); $('#ov').classList.toggle('hidden'); };
  $('#mb').onclick = tog; $('#ov').onclick = tog;

  let ALL = null;
  const loadAll = async () => ALL || (ALL = (await pb.collection('plans').getFullList({ sort: 'category,frequency,amount' })).filter(p => u.role === 'admin' || p.active !== false));
  const gs = $('#gs'), gr = $('#gr');
  gs.oninput = async () => {
    const q = gs.value.trim(); if (!q) return gr.classList.add('hidden');
    const all = await loadAll(), m = all.filter(p => matchQ(p, q)).slice(0, 8);
    gr.innerHTML = m.length ? m.map(p => `<button data-id="${p.id}" class="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex justify-between gap-3 text-sm"><span class="truncate">${esc(p.name)}</span><span class="text-slate-500 whitespace-nowrap">${naira(p.amount)}/${FQ[p.frequency]}</span></button>`).join('') : '<p class="px-4 py-3 text-sm text-slate-500">No matching plans</p>';
    gr.classList.remove('hidden');
    gr.querySelectorAll('button').forEach(b => b.onclick = () => { window._pl = all; openPlan(all.findIndex(p => p.id === b.dataset.id)); gr.classList.add('hidden'); gs.value = ''; });
  };
  gs.onkeydown = e => { if (e.key === 'Enter') gr.querySelector('button')?.click(); if (e.key === 'Escape') { gr.classList.add('hidden'); gs.blur(); } };
  addEventListener('click', e => { if (!e.target.closest('#gs,#gr')) gr.classList.add('hidden'); });
  addEventListener('keydown', e => {
    const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName), cur = window._cur;
    if (e.key === '/' && !typing) { e.preventDefault(); ($('#pq') || gs).focus(); }
    if (!$('#dr')) return;
    if (e.key === 'Escape') closePlan();
    if (!typing && e.key === 'ArrowLeft' && cur > 0) openPlan(cur - 1);
    if (!typing && e.key === 'ArrowRight') openPlan(cur + 1);
  });
  const _open = window.openPlan; window.openPlan = i => { if ((window._pl || [])[i]) { window._cur = i; _open(i); } };

  const go = async () => {
    const id = (location.hash || '#' + nav[0][0]).slice(1).split('?')[0], v = views[id] ? id : nav[0][0];
    document.querySelectorAll('.nl').forEach(a => { const on = a.dataset.id === v; a.classList.toggle('bg-emerald-50', on); a.classList.toggle('text-emerald-800', on); a.classList.toggle('text-slate-600', !on); });
    $('#ttl').textContent = nav.find(n => n[0] === v)[1];
    ALL = null; closePlan(); scrollTo(0, 0);
    if (!$('#ov').classList.contains('hidden')) tog();
    const m = $('#main'); m.innerHTML = '<p class="text-sm text-slate-400">Loading…</p>';
    try { await views[v](m); } catch (e) { m.innerHTML = `<p class="text-red-600 text-sm">${esc(e.message)}</p>`; }
  };
  addEventListener('hashchange', go); go();
}
