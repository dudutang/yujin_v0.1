// ================= 敌人 =================
function spawnEnemy(type, elite, x, y) {
  const T = ETYPES[type], lyr = layerAt(x, y), hpm = (1 + S.conc / 50) * (1 + S.t / 600) * [1, 1.2, 1.5][lyr], dmm = [1, 1.12, 1.3][lyr] * (1 + S.t / 1200);
  const e = { type, x, y, r: T.r * (elite ? 1.5 : 1), hp: T.hp * hpm * (elite ? 5 : 1), spd: T.spd * (elite ? 0.9 : 1) * rand(0.9, 1.1) * (pact('swift') ? 1.15 : 1) * (1 + Math.max(0, S.conc - 100) / 200), dmg: T.dmg * dmm * (pact('swift') ? 1.1 : 1) * (elite ? 1.5 : 1) * (1 + S.conc / 100) * (S.conc > 100 ? Math.min(4, Math.pow(1.03, S.conc - 100)) : 1), xp: T.xp * (elite ? 5 : 1),
    elite, aff: [], kbx: 0, kby: 0, stunT: 0, knockT: 0, brokenT: 0, shieldReady: true, shieldT: 0, flash: 0, lt: 0, resT: 0, ph: Math.random() * 6.28, shielded: type === 'shell' };
  e.maxHp = e.hp;
  if (elite) { e.aff = shuffle(Object.keys(AFFIX)).slice(0, S.conc >= 60 ? 2 : 1); if (e.aff.includes('ashshield')) e.shielded = true; }
  enemies.push(e); return e;
}
function spawnPos(angle, spread) {
  const p = S.player, d = Math.hypot(VW, VH) / 2 + 50;
  for (let i = 0; i < 10; i++) {
    const a = angle == null ? Math.random() * 6.283 : angle + rand(-spread, spread);
    const x = p.x + Math.cos(a) * d * rand(1, 1.15), y = p.y + Math.sin(a) * d * rand(1, 1.15);
    if (!inPersistent(x, y)) return { x, y };
  }
  return null;
}
const WAVES = [
  { th: 30, id: 'moths', name: '灰蛾潮', sub: '三十只灰蛾从一侧扑来' },
  { th: 50, id: 'twins', name: '精英双子', sub: '两个精英一起来了，都打掉会开出金柜' },
  { th: 70, id: 'sea', name: '烬影海', sub: '60 秒内刷怪三倍' },
  { th: 90, id: 'wall', name: '蚀壳墙', sub: '一排蚀壳从深处往外推' },
];
const nextWave = () => WAVES.find(w => !S.waveSeen.has(w.id));
function fireWave(id) {
  const W = WAVES.find(w => w.id === id), p = S.player; banner('灰潮 · ' + W.name, W.sub, '#c9b6ff', 3); sfx('horn');
  if (id === 'moths') { const a = Math.random() * 6.283; for (let i = 0; i < 30; i++) { const pos = spawnPos(a, 0.5); if (pos) spawnEnemy('moth', false, pos.x, pos.y); } }
  else if (id === 'twins') { const a = Math.random() * 6.283; for (let i = 0; i < 2; i++) { const pos = spawnPos(a + i * 0.6, 0.2); if (pos) { const e = spawnEnemy(i ? 'shell' : 'shade', true, pos.x, pos.y); e.gold = i === 1; e.noChip = true; } } }
  else if (id === 'sea') S.surgeT = 60;
  else if (id === 'wall') { const a = Math.atan2(p.y, p.x) || Math.random() * 6.283, cx = p.x + Math.cos(a) * 14 * M, cy = p.y + Math.sin(a) * 14 * M; for (let i = 0; i < 12; i++) { const o = (i - 5.5) * 1.6 * M; spawnEnemy('shell', false, cx + Math.cos(a + 1.5708) * o + rand(-20, 20), cy + Math.sin(a + 1.5708) * o + rand(-20, 20)); } }
}
function pickType() {
  const c = S.conc; if (c < 30) return Math.random() < 0.08 ? 'moth' : 'shade';
  const r = Math.random(); if (c < 60) return r < 0.7 ? 'shade' : r < 0.85 ? 'moth' : 'shell';
  return r < 0.55 ? 'shade' : r < 0.8 ? 'moth' : 'shell';
}
function updSpawns(dt) {
  cullFar();
  let liveN = 0; for (const e of enemies) if (!e.dead && e.type !== 'nest') liveN++; if (liveN >= 320) return;
  const c = S.conc;
  S.spawnAcc += dt * (0.8 + c * 0.035) * (S.surgeT > 0 ? 3 : 1);
  while (S.spawnAcc >= 1) { S.spawnAcc -= 1; const pos = spawnPos(); if (pos) spawnEnemy(pickType(), false, pos.x, pos.y); }
  S.waveT -= dt;
  if (S.waveT <= 0) {
    S.waveT = c < 30 ? 60 : c < 60 ? 45 : 30;
    const dirs = c < 60 ? 1 : c < 85 ? 2 : 3, n = Math.round(8 + c / 3);
    for (let d = 0; d < dirs; d++) { const a = Math.random() * 6.283; for (let i = 0; i < n; i++) { const pos = spawnPos(a, 0.45); if (pos) spawnEnemy(pickType(), false, pos.x, pos.y); } }
  }
  S.surgeT = Math.max(0, (S.surgeT || 0) - dt);
  if (c >= 100) { S.reaperT = (S.reaperT || 0) - dt; if (S.reaperT <= 0) { S.reaperT = 40; const ra = (Math.atan2(S.player.y, S.player.x) || 0) + rand(-0.5, 0.5), pos = { x: S.player.x + Math.cos(ra) * 11 * M, y: S.player.y + Math.sin(ra) * 11 * M }; { const e = spawnEnemy('reaper', false, pos.x, pos.y); e.hp = e.maxHp = 1e9; e.reaper = true; e.noChip = true; e.dmg = 30; e.spd = 2.0; S.reapers = (S.reapers || 0) + 1; banner(S.reapers === 1 ? '收灯人来了' : '又一个收灯人', S.reapers === 1 ? '打不死。它只会越来越多，该回去了。' : `场上 ${S.reapers} 个`, '#ff5a4f', 3); sfx('death'); } } }
  for (const [th, id] of WAVES.map(w => [w.th, w.id])) if (c >= th && !S.waveSeen.has(id)) { S.waveSeen.add(id); fireWave(id); }
  S.eliteT -= dt;
  if (S.eliteT <= 0) {
    S.eliteT = (c < 30 ? 90 : c < 85 ? 45 : 30) / (1 + 0.5 * bl('greed'));
    const n = c < 60 ? 1 : 3, a = Math.random() * 6.283;
    for (let i = 0; i < n; i++) { const pos = spawnPos(a, 0.3); if (pos) spawnEnemy(Math.random() < 0.6 ? 'shade' : c >= 30 ? 'shell' : 'shade', true, pos.x, pos.y); }
  }
}
function updEnemies(dt) {
  const p = S.player, lr2 = S.lr * S.lr, slowL = 0.3 + 0.05 * lv('afterglow'); S.nestNear = 0;
  for (const e of enemies) if (!e.dead && e.elite && e.aff.includes('resonance')) for (const o of query(e.x, e.y, 4 * M)) o.resT = S.t + 0.25;
  for (const e of enemies) {
    if (e.dead) continue;
    if (e.shock && (e.shock.t -= dt) <= 0) e.shock = null;
    if (e.expo && (e.expo.t -= dt) <= 0) e.expo = null;
    if (e.burn) { e.burn.t -= dt; e.burn.acc += dt; if (e.burn.acc >= 0.5) { e.burn.acc -= 0.5; dealDamage(e, 2 * e.burn.st * (1 + (D.statd || 0)), 'fire', { dot: true, weak: true }); } if (e.burn && e.burn.t <= 0) e.burn = null; }
    if (e.dead) continue;
    if (e.type === 'nest') {
      e.flash -= dt;
      const nd2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
      if (nd2 < (22 * M) ** 2) { S.nestNear++; e.spawnT = (e.spawnT || 0) - dt; if (e.spawnT <= 0 && enemies.length < 320) { e.spawnT = 2.2; const a = Math.random() * 6.283; spawnEnemy(pickType(), false, e.x + Math.cos(a) * (e.r + 14), e.y + Math.sin(a) * (e.r + 14)); } }
      continue;
    }
    if (!e.shieldReady && (e.shieldT -= dt) <= 0) e.shieldReady = true;
    if (e.ign) { e.ign.t -= dt; e.ign.acc += dt; if (e.ign.acc >= 0.5) { e.ign.acc -= 0.5; dealDamage(e, e.ign.d, 'fire', { dot: true, weak: true }); if (e.dead) continue; } if (e.ign && e.ign.t <= 0) e.ign = null; }
    if (e.bleed) { e.bleed.t -= dt; e.bleed.acc += dt; if (e.bleed.acc >= 0.5) { e.bleed.acc -= 0.5; dealDamage(e, e.bleed.n * stv('edge_vamp', 'dmg') * 0.5, 'phys', { dot: true, weak: true }); if (e.dead) continue; if (Math.random() < 0.3) parts.push({ x: e.x + rand(-5, 5), y: e.y - 4, vx: 0, vy: 40, t: 0.4, life: 0.4, c: '#c0392b', s: 2 }); } if (e.bleed && e.bleed.t <= 0) e.bleed = null; }
    if (e.chill) { e.chill.t -= dt; if (e.chill.t <= 0) e.chill = null; }
    if (e.frozenT > 0) e.frozenT -= dt;
    if (e.fearT > 0) e.fearT -= dt;
    if (e.curse) { e.curse.t -= dt; if (e.curse.t <= 0) { curseBurst(e, 1); if (e.dead) continue; } }
    if (e.ash) { e.ash.t -= dt; if (e.ash.t <= 0) { const A = e.ash; e.ash = null; sfx('boom'); addRing(e.x, e.y, A.r, '#b79cff', 0.4); burst(e.x, e.y - 6, '#b79cff', 16, 180); for (const q of query(e.x, e.y, A.r)) dealDamage(q, A.d, 'phys', { depth: 2 }); if (e.dead) continue; } }
    e.brokenT -= dt; e.stunT -= dt; e.knockT -= dt; e.flash -= dt; if (e.flinchT > 0) e.flinchT -= dt; if (e.flinchCD > 0) e.flinchCD -= dt;
    // 击退
    if (e.kbx || e.kby) { e.x += e.kbx * dt; e.y += e.kby * dt; const f = Math.max(0, 1 - 9 * dt); e.kbx *= f; e.kby *= f; if (Math.abs(e.kbx) + Math.abs(e.kby) < 4) e.kbx = e.kby = 0; }
    // 持续光源灼伤
    const inP = inPersistent(e.x, e.y) || inTemp(e.x, e.y);
    if (inP) { e.lt += dt; if (e.lt >= 0.5) { e.lt -= 0.5; dealDamage(e, 2.5, 'phys', { dot: true, weak: true }); if (e.dead) continue; } }
    const pdx = p.x - e.x, pdy = p.y - e.y, pd2 = pdx * pdx + pdy * pdy, pd = Math.sqrt(pd2) || 1;
    if (e.stunT <= 0 && !(e.flinchT > 0)) {
      let tx = p.x, ty = p.y;
      if (pins.length && e.type !== 'moth') { let bd = (4 * M * D.area) ** 2; for (const pn of pins) { const d = (pn.x - e.x) ** 2 + (pn.y - e.y) ** 2; if (d < bd) { bd = d; tx = pn.x; ty = pn.y; } } }
      const dx = tx - e.x, dy = ty - e.y, dd = Math.hypot(dx, dy) || 1;
      let spd = e.spd * M;
      if (e.resT > S.t) spd *= 1.3;
      if (pd2 < lr2 && !e.reaper) spd *= 1 - Math.min(0.85, slowL + (S.lrSlow || 0));
      if (inP) spd *= 0.5;
      if (e.chill && !e.reaper) spd *= 1 - Math.min(0.75, 0.15 * (e.chill.st != null ? e.chill.st : 3));
      if (e.slowZ > S.t) spd *= 0.4;
      if (e.auraSlow > S.t) spd *= 1 - stv('aura_frost', 'slow');
      if (e.inCrack > S.t) spd *= 0.6;
      if (e.fearT > 0) { e.x -= dx / dd * spd * 0.8 * dt; e.y -= dy / dd * spd * 0.8 * dt; }
      else if (dd > 6) { e.x += dx / dd * spd * dt; e.y += dy / dd * spd * dt; }
    }
    // 接触
    if (e.type === 'moth') { if (pd < 0.8 * M) { e.dead = true; addRing(e.x, e.y, 1.2 * M, '#c9b9ff', 0.3); burst(e.x, e.y, '#c9b9ff', 10, 120); hurtPlayer(e.dmg, null); } }
    else if (pd < e.r + p.r && e.stunT <= 0 && !(e.flinchT > 0) && !(e.fearT > 0)) hurtPlayer(e.dmg, e);
  }
  // 分离（避免叠成一个点）
  for (const e of enemies) {
    if (e.dead || e.type === 'moth' || e.type === 'nest') continue;
    const near = query(e.x, e.y, e.r); let c = 0;
    for (const o of near) { if (o === e || o.type === 'moth') continue; const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 0.01, ov = e.r + o.r - d; if (ov > 0 && o.type === 'nest') { e.x += dx / d * ov; e.y += dy / d * ov; continue; } if (ov > 0) { const k = ov * 0.3 / d; e.x += dx * k; e.y += dy * k; o.x -= dx * k; o.y -= dy * k; } if (++c > 5) break; }
  }
  enemies = enemies.filter(e => !e.dead);
}

