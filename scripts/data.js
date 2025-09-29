// Pure data transformation helpers (testable in isolation)

export function groupXpByDate(transactions, { to = 'date' } = {}) {
  // Input: [{ amount, createdAt }]
  // Output: [{ key: 'YYYY-MM-DD', total: number }]
  const map = new Map();
  for (const t of transactions || []) {
    const d = new Date(t.createdAt);
    if (isNaN(d)) continue;
    const key = to === 'month'
      ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      : d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + (t.amount || 0));
  }
  return Array.from(map, ([key, total]) => ({ key, total })).sort((a, b) => a.key.localeCompare(b.key));
}

export function passFailFromResults(results) {
  let pass = 0, fail = 0;
  for (const r of results || []) {
    if (r.grade === 1) pass++;
    else if (r.grade === 0) fail++;
  }
  return { pass, fail };
}

export function xpByProject(transactions, objectsById) {
  const map = new Map();
  for (const t of transactions || []) {
    const obj = objectsById.get(t.objectId);
    const name = obj?.name || `#${t.objectId}`;
    map.set(name, (map.get(name) || 0) + (t.amount || 0));
  }
  return Array.from(map, ([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}
