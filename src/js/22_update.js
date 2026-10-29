// ================= 主更新 =================
function update(dt) {
  const p = S.player; S.t += dt; S.flashes = S.flashes || [];
  // 移动
  let mx = 0, my = 0;
  if (keys.has('w') || keys.has('arrowup')) my--; if (keys.has('s') || keys.has('arrowdown')) my++;
  if (keys.has('a') || keys.has('arrowleft')) mx--; if (keys.has('d') || keys.has('arrowright')) mx++;
  if (window.__bot) [mx, my] = window.__botStill ? [0, 0] : botMove();
  const ml = Math.hypot(mx, my); p.moving = ml > 0;
  const sm = isW() ? 1 + (S.berserkT > 0 ? 0.15 : 0) + (S.whirl.t > 0 && nd('swiftspin') ? 0.4 : 0) : 1;
  if (isW() && (S.dash || S.leapS.phase)) mx = my = 0;
  if (ml) { p.x += mx / ml * D.speed * sm * dt; p.y += my / ml * D.speed * sm * dt; if (!isW() || !(p.swingT > 0)) { p.fx = mx / ml; p.fy = my / ml; } }
  ensureChunks();
  p.iframes -= dt; p.hurtFlash -= dt; p.lightBoostT -= dt; p.afterHeatT -= dt;
  if (p.shieldT > 0 && (p.shieldT -= dt) <= 0) p.shield = 0;
  p.breath = isW() && S.t - (p.lastHurt || -9) >= 3;
  const reg = D.regen + (inPersistent(p.x, p.y) ? 0.04 + 0.03 * bl('hearth') : 0) + (isW() && p.breath ? 0.021 : 0);
  if (reg) p.hp = Math.min(D.maxHp, p.hp + D.maxHp * reg * dt);
  if (S.buff) { S.buff.t -= dt; if (S.buff.t <= 0) { S.buff = null; recalc(); banner('石碑的加成结束了', '', '#8b93a3', 1.5); } }
  updTide(dt);
  gridBuild();
  updSkills(dt);
  for (const d of S.delayed) { d.t -= dt; if (d.t <= 0) { d.done = true; d.fn(); } }
  S.delayed = S.delayed.filter(d => !d.done);
  if (mode !== 'play') return;
  updSpawns(dt);
  updEnemies(dt);
  if (mode !== 'play') return;
  updItems(dt);
  updBreaks();
  updTapes(dt);
  updInteract(dt);
  // 效果衰减
  for (const a of arcs) a.t -= dt; arcs = arcs.filter(a => a.t > 0);
  if (S.slashes) { for (const a of S.slashes) a.t -= dt; S.slashes = S.slashes.filter(a => a.t > 0); }
  if (S.bolts) { for (const a of S.bolts) a.t -= dt; S.bolts = S.bolts.filter(a => a.t > 0); }
  for (const r of rings) r.t -= dt; rings = rings.filter(r => r.t > 0);
  for (const q of parts) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.92; q.vy *= 0.92; } parts = parts.filter(q => q.t > 0);
  for (const n of nums) { n.t -= dt; n.y -= 30 * dt; } nums = nums.filter(n => n.t > 0);
  for (const q of sparks) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.86; q.vy *= 0.86; } sparks = sparks.filter(q => q.t > 0);
  for (const q of ash) { q.t -= dt; q.x += (q.vx + Math.sin(S.t * 4 + q.y * 0.1) * 8) * dt; q.y += q.vy * dt; q.vy *= 0.985; } ash = ash.filter(q => q.t > 0);
  if (isW() && p.breath && p.hp < D.maxHp && !window.__botFast && Math.random() < dt * 9) ash.push({ x: p.x + rand(-12, 12), y: p.y + rand(-4, 8), vx: 0, vy: rand(-40, -24), t: 0.9, life: 0.9, s: 2, c: '#9be08a', glow: 1 });
  for (const f of S.flashes) f.t -= dt; S.flashes = S.flashes.filter(f => f.t > 0);
  S.shake = Math.max(0, S.shake - 30 * dt);
  updAmbient(dt);
  // 升级
  if (mode === 'play' && mode !== 'end') {
    while (p.xp >= needXp(p.lvl)) { p.xp -= needXp(p.lvl); p.lvl++; S.pendingLv++; sfx('level'); { const R2 = (D.pickup * 3) ** 2; for (const it of items) if (it.kind === 'xp' && (it.x - p.x) ** 2 + (it.y - p.y) ** 2 < R2) it.mag = true; } }
    if (S.pendingLv > 0) openLevel(); else if (S.pendingChip > 0) openChip();
    else if (isW() && !S.benchDone && p.lvl >= 4) openBench();
  }
}

