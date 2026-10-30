// ================= 无限地图（学 DMD：从灯塔出发，往任何方向走都走不到头；区块按需生成） =================
const CHUNKS = new Map();
const ckey = (i, j) => (i + 50000) * 100003 + (j + 50000);
function hash2(i, j, s) { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s | 0, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177) | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function chunkRng(i, j) { let s = Math.floor(hash2(i, j, S.seed) * 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const onRoad = (x, y) => Math.abs(y) < 4.6 * M && Math.abs(x) < 95 * M;
const ROAD_L = 95 * M, ROAD_W = 4 * M;
const SCEN_SETS = [['car', 'car', 'tree', 'tree', 'crate', 'barrel', 'rubble', 'rubble', 'wall'], ['pillar', 'pillar', 'cart', 'crate', 'rubble', 'rubble', 'wall', 'car'], ['crystal', 'crystal', 'ashrock', 'ashrock', 'rubble', 'crystal']];
const DEC_SETS = [['crack', 'crack', 'oil', 'leaves', 'leaves', 'leaves', 'paper', 'moss', 'moss', 'moss'], ['crack', 'crack', 'crack', 'oil', 'oil', 'paper', 'paper', 'manhole', 'brick', 'brick'], ['crack', 'crack', 'oil', 'fungus', 'fungus', 'fungus', 'brick']];
function genChunk(i, j) {
  const key = ckey(i, j); if (CHUNKS.has(key)) return CHUNKS.get(key);
  const r = chunkRng(i, j), x0 = i * CH, y0 = j * CH, cx = x0 + CH / 2, cy = y0 + CH / 2, li = layerAt(cx, cy), dist = Math.hypot(cx, cy);
  const c = { key, i, j, x0, y0, li, scen: [], dec: [], pud: [], seen: false, objs: 0 };
  const near = (x, y, R) => x * x + y * y < R * R;
  const taken = [[S.altar.x, S.altar.y, 4 * M], ...S.tapeItems.map(t => [t.x, t.y, 3 * M]), ...(S.oath ? [[S.oath.x, S.oath.y, 4 * M]] : [])]; const free = (x, y, R) => taken.every(([ax, ay, ar]) => (x - ax) ** 2 + (y - ay) ** 2 > (R + ar) ** 2);
  const pick = (R, tries = 8) => { for (let k = 0; k < tries; k++) { const x = x0 + 1.5 * M + r() * (CH - 3 * M), y = y0 + 1.5 * M + r() * (CH - 3 * M); if (near(x, y, 9 * M) || onRoad(x, y) || !free(x, y, R)) continue; taken.push([x, y, R]); return [x, y]; } return null; };
  // 摆件
  for (let k = 0; k < 8; k++) { const kind = SCEN_SETS[li][r() * SCEN_SETS[li].length | 0], v = PSPR[kind], img = Array.isArray(v) ? v[r() * v.length | 0] : v; const x = x0 + 16 + r() * (CH - 32), y = y0 + 16 + r() * (CH - 32); if (near(x, y, 9 * M)) continue; if (onRoad(x, y) && kind !== 'car' && r() < 0.8) continue; c.scen.push({ img, x, y, kind }); taken.push([x, y, 1.5 * M]); }
  c.scen.sort((a, b) => a.y - b.y);
  for (let k = 0; k < 22; k++) { const kk = DEC_SETS[li][r() * DEC_SETS[li].length | 0], v = DSPR[kk]; c.dec.push({ k: kk, img: v[r() * v.length | 0], x: x0 + r() * CH, y: y0 + r() * CH }); }
  for (let k = 0; k < 2; k++) { const road = li < 2 && r() < 0.4 && Math.abs(cy) < 10 * M && Math.abs(cx) < ROAD_L; c.pud.push({ x: x0 + r() * CH, y: road ? r() * 6 * M - 3 * M : y0 + r() * CH, rx: 14 + r() * 22, ry: 5 + r() * 6, ph: r() * 6 }); }
  if (y0 < 2 * M && y0 + CH > 2 * M && Math.abs(cx) < ROAD_L) c.dec.push({ k: 'arrow', img: DSPR.arrow[0], x: x0 + CH / 2, y: 2 * M });
  c.dec.sort((a, b) => a.y - b.y);
  // 交互物（只在当前这局的状态里，带 ck 标记；同一区块一局只生成一次）
  const fresh = !S.ckSeen.has(key); S.ckSeen.add(key);
  if (fresh) {
  const nb = li === 2 ? 4 : 5; for (let k = 0; k < nb; k++) { const q = pick(1.5 * M, 4); if (q) S.breaks.push({ x: q[0], y: q[1], kind: li === 2 ? 'cocoon' : r() < 0.55 ? 'crate' : 'barrel', ck: key }); }
  if (dist > 12 * M && r() < (li === 0 ? 0.4 : 0.5)) { const q = pick(3 * M); if (q) S.chests.push({ x: q[0], y: q[1], open: false, ck: key }); }
  if (dist > 14 * M && r() < (li === 0 ? 0.25 : 0.3)) { const q = pick(3 * M); if (q) { const sk = Object.keys(SHRINES).filter(k => (k !== 'statue' || unl('statue')) && (k !== 'rift' || unl('rift'))); S.pois.push({ kind: 'shrine', type: sk[r() * sk.length | 0], x: q[0], y: q[1], used: false, ck: key }); } }
  if (dist > 18 * M && r() < 0.2) { const q = pick(3 * M); if (q) S.pois.push({ kind: 'challenge', x: q[0], y: q[1], used: false, ck: key }); }
  if (dist > 10 * M && r() < (li === 0 ? 0.2 : 0.3)) { const q = pick(2.5 * M); if (q) { const ks = Object.keys(STONES); S.pois.push({ kind: 'stone', type: ks[r() * ks.length | 0], x: q[0], y: q[1], used: false, ck: key }); } }
  if (!S.greedPlaced && li <= 1 && dist > 30 * M && r() < 0.08) { const q = pick(3 * M); if (q) { S.greedPlaced = true; S.pois.push({ kind: 'greed', x: q[0], y: q[1], used: false, ck: key }); } }
  if (li >= 1 && r() < 0.12) { const q = pick(3 * M); if (q) S.eyes.push({ x: q[0], y: q[1], tier: li, used: false, ck: key }); }
  if (li >= 1 && r() < (li === 2 ? 0.7 : 0.35)) { const q = pick(3 * M); if (q) { const e = spawnEnemy('nest', false, q[0], q[1]); e.hp = e.maxHp = li === 2 ? 1200 : 500; e.ck = key; } }
  if (li >= 1 && r() < 0.45 && dist > 25 * M && S.lamps.every(l => (l.x - cx) ** 2 + (l.y - cy) ** 2 > (18 * M) ** 2)) { const q = pick(4 * M); if (q) { S.lamps.push({ x: q[0], y: q[1], rep: false, store: 0, ck: key }); S.pois.push({ kind: 'scav', x: q[0] + 3.5 * M, y: q[1] + 1.5 * M, used: false, ck: key }); } }
  }
  CHUNKS.set(key, c); return c;
}
function ensureChunks() {
  const p = S.player, ci = Math.floor(p.x / CH), cj = Math.floor(p.y / CH);
  if (S.lastCk && S.lastCk[0] === ci && S.lastCk[1] === cj) return;
  S.lastCk = [ci, cj];
  for (let i = ci - 3; i <= ci + 3; i++) for (let j = cj - 2; j <= cj + 2; j++) genChunk(i, j);
  for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) { const c = CHUNKS.get(ckey(i, j)); if (c) c.seen = true; }
  if (CHUNKS.size > 220) {
    for (const [key, c] of CHUNKS) { if (Math.abs(c.i - ci) <= 7 && Math.abs(c.j - cj) <= 5) continue; CHUNKS.delete(key); }
  }
}
function visChunks(vx0, vy0, vx1, vy1) { const out = []; for (let i = Math.floor(vx0 / CH); i <= Math.floor(vx1 / CH); i++) for (let j = Math.floor(vy0 / CH); j <= Math.floor(vy1 / CH); j++) { const c = CHUNKS.get(ckey(i, j)); if (c) out.push(c); } return out; }
let VIS = { scen: [], dec: [], pud: [] };
function collectVis(vx0, vy0, vx1, vy1) { const cs = visChunks(vx0, vy0, vx1, vy1); VIS.scen = [].concat(...cs.map(c => c.scen)).sort((a, b) => a.y - b.y); VIS.dec = [].concat(...cs.map(c => c.dec)); VIS.pud = [].concat(...cs.map(c => c.pud)); }
// 远处的普通敌人消失（无限地图上追不上你的东西没必要留着）
function cullFar() { const p = S.player; for (const e of enemies) if (!e.dead && e.type !== 'nest' && e.type !== 'boss' && !e.reaper && !e.mark && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 > (55 * M) ** 2) e.dead = true; }
function drawMap(mc, W, H, sm, big) {
  const s = sm / M, p = S.player, X = x => (x - p.x) * s + W / 2, Y = y => (y - p.y) * s + H / 2;
  mc.clearRect(0, 0, W, H); mc.fillStyle = '#0e1118'; mc.fillRect(0, 0, W, H);
  // 已生成的区块按环着色；没生成的是黑的（随探索揭露）
  const cols = ['#2b3142', '#262a38', '#20222c'];
  for (const c of CHUNKS.values()) { const x = X(c.x0), y = Y(c.y0), w = CH * s; if (x > W || y > H || x + w < 0 || y + w < 0) continue; mc.fillStyle = cols[c.li]; mc.globalAlpha = c.seen ? 1 : 0.55; mc.fillRect(x, y, w + 0.5, w + 0.5); }
  mc.globalAlpha = 1;
  mc.fillStyle = 'rgba(80,83,92,.5)'; if (Math.abs(p.y) < H / s) mc.fillRect(X(-ROAD_L), Y(-ROAD_W), 2 * ROAD_L * s, 2 * ROAD_W * s);
  mc.strokeStyle = 'rgba(169,156,201,.5)'; mc.setLineDash([4, 4]); mc.lineWidth = 1; for (const L of LAYERS.slice(1)) { mc.beginPath(); mc.arc(X(0), Y(0), L.r0 * s, 0, 6.283); mc.stroke(); } mc.setLineDash([]);
  const inM = (x, y) => Math.abs(x - p.x) * s < W / 2 + 10 && Math.abs(y - p.y) * s < H / 2 + 10;
  if (inM(0, 0)) { mc.fillStyle = '#ffb454'; mc.beginPath(); mc.arc(X(0), Y(0), big ? 8 : 5, 0, 6.283); mc.fill(); }
  for (const l of S.lamps) if (inM(l.x, l.y)) { mc.fillStyle = l.rep ? '#ffb454' : '#6a7487'; mc.fillRect(X(l.x) - 4, Y(l.y) - 4, 8, 8); }
  if (isW() && !S.spec && inM(S.oath.x, S.oath.y)) { const ox = X(S.oath.x), oy = Y(S.oath.y); mc.fillStyle = '#ffd28a'; mc.beginPath(); mc.moveTo(ox, oy - 7); mc.lineTo(ox + 6, oy); mc.lineTo(ox, oy + 7); mc.lineTo(ox - 6, oy); mc.fill(); }
  if (!S.altar.used && inM(S.altar.x, S.altar.y)) { mc.fillStyle = '#a99cc9'; mc.beginPath(); mc.moveTo(X(S.altar.x), Y(S.altar.y) - 6); mc.lineTo(X(S.altar.x) + 6, Y(S.altar.y) + 5); mc.lineTo(X(S.altar.x) - 6, Y(S.altar.y) + 5); mc.fill(); }
  for (const t of S.tapeItems) if (inM(t.x, t.y)) { mc.fillStyle = '#9fe8ff'; const pu = 4 + 2 * Math.sin(S.t * 6); mc.fillRect(X(t.x) - pu, Y(t.y) - pu, pu * 2, pu * 2); }
  for (const ch of S.chests) if (!ch.open && inM(ch.x, ch.y)) { mc.fillStyle = ch.gold ? '#ffe08a' : '#e7a93f'; mc.fillRect(X(ch.x) - 3, Y(ch.y) - 3, 6, 6); }
  for (const E of S.eyes) if (inM(E.x, E.y)) { const x = X(E.x), y = Y(E.y); mc.fillStyle = E.used ? '#4a4f5a' : '#ff6b5e'; mc.beginPath(); mc.moveTo(x, y - 7); mc.lineTo(x + 7, y); mc.lineTo(x, y + 7); mc.lineTo(x - 7, y); mc.fill(); }
  if (S.boss && !S.boss.dead && inM(S.boss.x, S.boss.y)) { mc.fillStyle = '#ff6b5e'; mc.beginPath(); mc.arc(X(S.boss.x), Y(S.boss.y), 6, 0, 6.283); mc.fill(); }
  for (const o of S.pois) { if (!inM(o.x, o.y)) continue; const x = X(o.x), y = Y(o.y); mc.fillStyle = o.used ? '#4a4f5a' : o.kind === 'challenge' ? '#c9b6ff' : o.kind === 'greed' ? '#e8c160' : o.kind === 'scav' ? '#ffffff' : o.kind === 'stone' ? STONES[o.type].col : '#8fe6a6'; mc.beginPath(); if (o.kind === 'challenge') { mc.moveTo(x, y - 5); mc.lineTo(x + 5, y + 4); mc.lineTo(x - 5, y + 4); } else if (o.kind === 'scav') { mc.rect(x - 3, y - 3, 6, 6); } else { mc.arc(x, y, 4, 0, 6.283); } mc.fill(); }
  for (const it of items) if (it.kind === 'gear' && inM(it.x, it.y)) { mc.fillStyle = GEAR_RAR[it.gear.rar].col; mc.fillRect(X(it.x) - 3, Y(it.y) - 3, 6, 6); }
  for (const e of enemies) if (e.mark && !e.dead && inM(e.x, e.y)) { mc.fillStyle = '#c9b6ff'; mc.fillRect(X(e.x) - 1.5, Y(e.y) - 1.5, 3, 3); }
  for (const e of enemies) if (e.reaper && !e.dead && inM(e.x, e.y)) { mc.fillStyle = '#ff3b3b'; mc.beginPath(); mc.arc(X(e.x), Y(e.y), 5, 0, 6.283); mc.fill(); }
  for (const e of enemies) if (e.type === 'nest' && !e.dead && inM(e.x, e.y)) { mc.fillStyle = '#b79cff'; mc.beginPath(); mc.arc(X(e.x), Y(e.y), 5, 0, 6.283); mc.fill(); }
  mc.fillStyle = 'rgba(255,107,94,.8)'; for (const e of enemies) if (e.elite && e.type !== 'nest' && !e.dead && inM(e.x, e.y)) mc.fillRect(X(e.x) - 2, Y(e.y) - 2, 4, 4);
  if (big) { mc.fillStyle = 'rgba(255,255,255,.08)'; for (const e of enemies) if (!e.dead && !e.elite && inM(e.x, e.y)) mc.fillRect(X(e.x) - 1, Y(e.y) - 1, 2, 2); }
  for (const m of MK) if (inM(m.x, m.y)) { mc.strokeStyle = m.col; mc.lineWidth = big ? 2 : 1.5; mc.globalAlpha = 0.5 + 0.4 * Math.sin(S.t * 4 + m.x); mc.beginPath(); mc.arc(X(m.x), Y(m.y), (big ? 9 : 6) + Math.sin(S.t * 4 + m.x) * 1.5, 0, 6.283); mc.stroke(); mc.globalAlpha = 1; if (big) { mc.fillStyle = m.col; mc.font = '700 12px ' + BODY_FONT; mc.textAlign = 'center'; mc.fillText(m.ch, X(m.x), Y(m.y) - 12); mc.textAlign = 'left'; } }
  mc.fillStyle = '#ffffff'; mc.beginPath(); mc.arc(W / 2, H / 2, 4, 0, 6.283); mc.fill();
  if (!inM(0, 0)) { const a = Math.atan2(-p.y, -p.x); mc.fillStyle = '#ffb454'; mc.save(); mc.translate(W / 2 + Math.cos(a) * Math.min(W, H) * 0.42, H / 2 + Math.sin(a) * Math.min(W, H) * 0.42); mc.rotate(a); mc.beginPath(); mc.moveTo(8, 0); mc.lineTo(-5, -5); mc.lineTo(-5, 5); mc.fill(); mc.restore(); }
  mc.fillStyle = 'rgba(255,255,255,.55)'; mc.font = (big ? 16 : 11) + 'px monospace'; mc.textAlign = 'right'; mc.fillText('离灯塔 ' + Math.round(Math.hypot(p.x, p.y) / M) + ' 米', W - 6, H - 6); mc.textAlign = 'left';
}

