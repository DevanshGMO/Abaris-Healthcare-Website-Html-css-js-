// assets/js/products-abaris.js
(function () {
  const DATA_URL = '/assets/data/products.json';
  const COLUMNS_URL = '/assets/data/columns.json';
  const PAGE_SIZE = 20;

  const preferredCols = [
    '__sheet', 'therapeutic_category', 'therapeuticCategory', 'category',
    'product', 'product_name', 'brand_name', 'strength', 'volume',
    'pack_type', 'container', 'pack'
  ];

  async function fetchJSON(url, fallback = []) {
    try { const r = await fetch(url, { cache: 'no-store' }); return await r.json(); }
    catch { return fallback; }
  }

  function pickDisplayColumns(allColumns) {
    const uniq = new Set();
    const picked = [];
    for (const p of preferredCols) {
      if (allColumns.includes(p) && !uniq.has(p)) { picked.push(p); uniq.add(p); }
    }
    // Always include id for navigation (not shown in mobile label)
    if (!picked.includes('id') && allColumns.includes('id')) picked.push('id');
    return picked;
  }

  function textContains(obj, q) {
    if (!q) return true;
    q = q.toLowerCase();
    for (const k in obj) {
      const v = (obj[k] ?? '').toString().toLowerCase();
      if (v.includes(q)) return true;
    }
    return false;
  }

  /* ---------------------- LIST PAGE ---------------------- */
  async function initListPage() {
    const $q = document.getElementById('q');
    const $sheet = document.getElementById('sheet');
    const $cat = document.getElementById('cat');
    const $tbody = document.querySelector('#productsTable tbody');
    const $theadRow = document.getElementById('theadRow');
    const $pager = document.getElementById('pager');

    const data = await fetchJSON(DATA_URL, []);
    const allColumns = [...new Set(data.flatMap(r => Object.keys(r)))];
    const cols = pickDisplayColumns(allColumns);

    // Build <thead>
    $theadRow.innerHTML = cols
      .filter(c => c !== 'id')
      .map(c => `<th>${c.replace(/_/g, ' ').toUpperCase()}</th>`).join('');

    // Build filters (sheet + therapeutic category if present)
    const sheets = [...new Set(data.map(r => r.__sheet).filter(Boolean))].sort();
    sheets.forEach(s => $sheet.appendChild(new Option(s, s)));
    const catKeys = ['therapeutic_category', 'therapeuticCategory', 'category'];
    const catKey = catKeys.find(k => allColumns.includes(k));
    if (catKey) {
      const cats = [...new Set(data.map(r => r[catKey]).filter(Boolean))].sort();
      cats.forEach(c => $cat.appendChild(new Option(c, c)));
    } else {
      $cat.closest('.filters')?.removeChild($cat); // hide if not present
    }

    let state = { filtered: data.slice(), page: 1 };

    function apply() {
      const q = $q.value.trim();
      const s = $sheet.value;
      const c = $cat ? $cat.value : '';
      state.filtered = data.filter(r =>
        textContains(r, q) &&
        (s ? r.__sheet === s : true) &&
        (c ? r[catKey] === c : true)
      );
      state.page = 1;
      render();
    }

    function render() {
      const start = (state.page - 1) * PAGE_SIZE;
      const items = state.filtered.slice(start, start + PAGE_SIZE);
      $tbody.innerHTML = items.map(rec => {
        const cells = cols.filter(c => c !== 'id').map(c => {
          const label = c.replace(/_/g, ' ').toUpperCase();
          const val = (rec[c] ?? '').toString().replace(/</g, '&lt;');
          return `<td data-label="${label}">${val}</td>`;
        }).join('');
        const id = encodeURIComponent(rec.id || '');
        return `<tr onclick="location.href='/supplies-single.html?id=${id}'">${cells}</tr>`;
      }).join('');

      const pages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
      $pager.innerHTML = Array.from({ length: pages }, (_, i) => {
        const p = i + 1;
        const cls = p === state.page ? 'active' : '';
        return `<button class="${cls}" onclick="window.gotoPage(${p})">${p}</button>`;
      }).join('');
      window.gotoPage = (p) => { state.page = p; render(); };
    }

    $q.addEventListener('input', apply);
    $sheet.addEventListener('change', apply);
    if ($cat) $cat.addEventListener('change', apply);
    render();
  }

  /* ---------------------- DETAIL PAGE ---------------------- */
  async function initDetailPage() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const $name = document.getElementById('name');
    const $kv = document.getElementById('kv');

    const data = await fetchJSON(DATA_URL, []);
    const rec = data.find(r => (r.id || '') === id);

    if (!rec) {
      document.getElementById('detail-root').innerHTML =
        `<h2>Product not found.</h2><p><a class="link" href="/supplies.html">Back to list</a></p>`;
      return;
    }

    const name = rec.product || rec.product_name || rec.brand_name || 'Product';
    $name.textContent = name;

    const keys = Object.keys(rec).filter(k => k !== 'id');
    $kv.innerHTML = keys.map(k => `
      <dt>${k.replace(/_/g, ' ').toUpperCase()}</dt>
      <dd>${(rec[k] ?? '').toString().replace(/</g, '&lt;')}</dd>
    `).join('');
  }

  /* ---------------------- ROUTER ---------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('list-root')) return initListPage();
    if (document.getElementById('detail-root')) return initDetailPage();
  });
})();
