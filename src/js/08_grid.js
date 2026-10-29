// ================= 空间网格 =================
const CELL = 64; const grid = new Map();
const gk = (i, j) => (i + 32768) * 65536 + (j + 32768);
function gridBuild() { grid.clear(); for (const e of enemies) { if (e.dead) continue; const k = gk(Math.floor(e.x / CELL), Math.floor(e.y / CELL)); let a = grid.get(k); if (!a) { a = []; grid.set(k, a); } a.push(e); } }
function query(x, y, r) {
  const out = []; const x0 = Math.floor((x - r - 24) / CELL), x1 = Math.floor((x + r + 24) / CELL), y0 = Math.floor((y - r - 24) / CELL), y1 = Math.floor((y + r + 24) / CELL);
  for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) { const a = grid.get(gk(i, j)); if (!a) continue; for (const e of a) { if (e.dead) continue; const dx = e.x - x, dy = e.y - y, rr = r + e.r; if (dx * dx + dy * dy <= rr * rr) out.push(e); } }
  return out;
}
function nearest(x, y, r, f) { let best = null, bd = 1e18; for (const e of query(x, y, r)) { if (f && !f(e)) continue; const dx = e.x - x, dy = e.y - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = e; } } return best; }
function nearestN(x, y, r, n, f) { return query(x, y, r).filter(e => !f || f(e)).sort((a, b) => ((a.x - x) ** 2 + (a.y - y) ** 2) - ((b.x - x) ** 2 + (b.y - y) ** 2)).slice(0, n); }
function inPersistent(x, y) {
  const b = S.beacon; if ((x - b.x) ** 2 + (y - b.y) ** 2 < b.r * b.r) return true;
  for (const l of S.lamps) if (l.rep && (x - l.x) ** 2 + (y - l.y) ** 2 < (5 * M) ** 2) return true;
  return false;
}

