// ================= 录音带 =================
function nextTapeId() { const have = new Set([...META.tapes, ...S.runTapes, ...S.tapeItems.map(t => t.id)]); for (let i = 0; i < TAPES.length; i++) if (!have.has(i)) return i; return -1; }
function makeTape(x, y, deep) { return { x, y, id: nextTapeId(), deep, guard: false }; }
function updTapes(dt) {
  const p = S.player;
  if (layerAt(p.x, p.y) === 2 && !S.deepEntered) S.deepEntered = true;
  if (S.deepEntered && !S.tapeItems.some(t => t.deep)) {
    S.tapeT -= dt;
    if (S.tapeT <= 0) {
      S.tapeT = 70;
      for (let i = 0; i < 20; i++) { const pa = Math.atan2(p.y, p.x) + rand(-0.25, 0.25), pr = Math.max(100 * M, Math.hypot(p.x, p.y) + rand(8, 22) * M), x = Math.cos(pa) * pr, y = Math.sin(pa) * pr; if ((x - p.x) ** 2 + (y - p.y) ** 2 > (12 * M) ** 2) { S.tapeItems.push(makeTape(x, y, true)); break; } }
      banner('收到录音带信号', '屏幕边缘的青色箭头指着它。有精英守着。拿到它，活着带回去才算数。', '#9fe8ff', 3.5);
    }
  }
  for (const t of S.tapeItems) {
    const d2p = (t.x - p.x) ** 2 + (t.y - p.y) ** 2;
    if (!t.guard && d2p < (9 * M) ** 2) { t.guard = true; const n = t.deep ? 2 : 1; for (let i = 0; i < n; i++) spawnEnemy(Math.random() < 0.5 ? 'shell' : 'shade', true, t.x + rand(-2, 2) * M, t.y + rand(-2, 2) * M); }
    if (d2p < (p.r + 14) ** 2) {
      t.done = true; S.loot.part += 2; if (S.lootAtZero) S.lootAtZero.part += 2;
      burst(t.x, t.y, '#9fe8ff', 16, 120);
      if (t.id >= 0) { S.runTapes.push(t.id); banner(`录音带 #${t.id + 1} · 零件 +2`, TAPES[t.id], '#9fe8ff', 6); }
      else banner('录音带 · 零件 +2', '全部 12 盘都听过了，这盘只剩杂音。', '#9fe8ff', 3);
    }
  }
  S.tapeItems = S.tapeItems.filter(t => !t.done);
}

