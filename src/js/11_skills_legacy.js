// ================= 技能 =================
function zap(x, y, t, dmg, o) { sfx('zap'); addArc(x, y, t.x, t.y, '#bfe6ff', 0.1, 1.6); dealDamage(t, dmg, 'elec', o || {}); }
function shortFire(s, extra) { const p = S.player; for (const t of nearestN(p.x, p.y, 6 * M, Math.round(stv('short', 'count')) + Math.floor(D.count + 1e-6))) zap(p.x, p.y, t, stv('short', 'dmg') + extra, {}); addRing(p.x, p.y, 1.2 * M, '#bfe6ff', 0.25); }
function quake(x, y, R, dmg, stun = 0.5) { sfx('boom');
  addRing(x, y, R, '#bfe6ff', 0.35); S.shake = Math.min(8, S.shake + 2); smash(x, y, R);
  for (const e of query(x, y, R)) { applyKnock(e, x, y, 1.5 * M); applyStun(e, stun); dealDamage(e, dmg, 'elec', {}); }
}
function densest(x, y, r) {
  const c = query(x, y, r); if (!c.length) return null; let best = c[0], bn = -1;
  for (const e of shuffle(c).slice(0, 14)) { const n = query(e.x, e.y, 2.5 * M).length; if (n > bn) { bn = n; best = e; } }
  return best;
}
function segHit(x1, y1, x2, y2, w, dmg) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, half = Math.hypot(x2 - x1, y2 - y1) / 2;
  const vx = x2 - x1, vy = y2 - y1, L2 = vx * vx + vy * vy || 1;
  for (const e of query(mx, my, half + w)) {
    const t = clamp(((e.x - x1) * vx + (e.y - y1) * vy) / L2, 0, 1), px = x1 + vx * t, py = y1 + vy * t;
    if ((e.x - px) ** 2 + (e.y - py) ** 2 < (w + e.r) ** 2) dealDamage(e, dmg, 'elec', { weak: true });
  }
}
function pulse(f, free) { sfx('pulse');
  const tn = skillOf('tune'), p = S.player, R = S.lr * 1.15 * (tn && tn.ignited ? 1.3 : 1), dmg = 60 * (1 + (tn ? stv('tune', 'dmg') : 0)) * (1 + 0.15 * lv('capacitor')) * f;
  smash(p.x, p.y, R);
  addRing(p.x, p.y, R, '#ffffff', 0.45); S.flashes.push({ x: p.x, y: p.y, r: R * 1.5, t: 0.25 }); S.shake = Math.min(10, S.shake + 5);
  for (const e of query(p.x, p.y, R)) { applyKnock(e, p.x, p.y, 1.5 * M); dealDamage(e, dmg, 'light', { weak: true, noOverload: true, sc: 1 }); }
  p.lightBoostT = 2;
  const t = skillOf('tune');
  if (t && t.branch === 'A') p.afterHeatT = 3;
  if (t && t.ignited && !free) S.delayed.push({ t: 0.35, fn: () => pulse(0.5 * f, true) });
}
function updSkills(dt) {
  const p = S.player;
  updAuras(dt); updChallenge(dt); updBoss(dt);
  if (isW()) updWarrior(dt); else updBless(dt);
  for (const s of S.skills) {
    if (s.id === 'torch') {
      s.t -= dt;
      if (s.t <= 0) {
        s.t = stv('torch', 'cd') * D.cdMul / D.aspd;
        const tgt = nearest(p.x, p.y, 5 * M * stv('torch', 'size') * D.area);
        if (tgt) {
          let dmg = stv('torch', 'dmg'); if (s.branch === 'B') dmg *= 2.5;
          zap(p.x, p.y, tgt, dmg, { stun: s.branch === 'B' ? 0.5 : 0 });
          const ch = Math.round(stv('torch', 'chain')) + (s.branch === 'A' ? 2 : 0);
          if (ch > 0) { let prev = tgt; const hit = new Set([tgt]); for (let k = 0; k < ch; k++) { const n = nearest(prev.x, prev.y, 3 * M, e => !hit.has(e)); if (!n) break; hit.add(n); zap(prev.x, prev.y, n, dmg * 0.7); prev = n; } }
        }
      }
      if (s.ignited) {
        s.t2 -= dt;
        if (s.t2 <= 0) {
          s.t2 = 0.6; const arr = query(p.x, p.y, 9 * M).filter(e => e.shock).slice(0, 40);
          for (const e of arr) { let best = null, bd = (4 * M) ** 2; for (const o of arr) { if (o === e) continue; const d = d2(e, o); if (d < bd) { bd = d; best = o; } } if (best) addArc(e.x, e.y, best.x, best.y, '#cdeeff', 0.16, 1.4); }
          for (const e of arr) dealDamage(e, stv('torch', 'dmg') * 0.75, 'elec', { weak: true });
        }
      }
    } else if (s.id === 'coil') {
      const n = Math.round(stv('coil', 'count')) + Math.floor(D.count + 1e-6) + (s.branch === 'B' ? 2 : 0), R = 2.2 * M * (s.branch === 'A' ? 1.5 : 1) * D.area * stv('coil', 'size');
      s.angle = (s.angle || 0) + 3 * stv('coil', 'spd') * D.pspd * dt; s.pos = []; s.R = R;
      for (let i = 0; i < n; i++) {
        const a = s.angle + i * Math.PI * 2 / n, cx = p.x + Math.cos(a) * R, cy = p.y + Math.sin(a) * R; s.pos.push([cx, cy]);
        for (const e of query(cx, cy, 0.45 * M)) if ((e.cdCoil || 0) <= S.t) { e.cdCoil = S.t + 0.5; dealDamage(e, stv('coil', 'dmg'), 'elec', {}); }
      }
      if (s.ignited) { s.t2 -= dt; if (s.t2 <= 0) { s.t2 = 0.4; for (const e of query(p.x, p.y, R + 0.6 * M)) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (Math.abs(d - R) < 0.6 * M + e.r) dealDamage(e, stv('coil', 'dmg') * 0.6, 'elec', { weak: true }); } } }
    } else if (s.id === 'ground') {
      s.t -= dt;
      if (s.t <= 0) {
        s.t = stv('ground', 'cd') * D.cdMul; const R = 3 * M * D.area * stv('ground', 'size') * (s.ignited ? 2 : 1), dmg = stv('ground', 'dmg');
        quake(p.x, p.y, R, dmg, stv('ground', 'stun') * D.dur);
        if (s.branch === 'A') S.delayed.push({ t: 0.4, fn: () => quake(S.player.x, S.player.y, R, dmg * 0.6, stv('ground', 'stun') * D.dur) });
        if (s.branch === 'B' || s.ignited) zones.push({ x: p.x, y: p.y, r: 3 * M * D.area * stv('ground', 'size'), t: (s.ignited ? 8 : 3) * D.dur, tick: 0, dmg: stv('ground', 'dmg') * 0.22 });
      }
    } else if (s.id === 'rod') {
      s.t -= dt;
      if (s.t <= 0) {
        s.t = stv('rod', 'cd') * D.cdMul; const cnt = Math.round(stv('rod', 'count')) + Math.floor(D.count + 1e-6) + (s.branch === 'A' ? 1 : 0);
        for (let k = 0; k < cnt; k++) { const spot = densest(p.x, p.y, 8 * M); if (!spot) break; pins.push({ x: spot.x + rand(-12, 12), y: spot.y + rand(-12, 12), t: (stv('rod', 'dur') + (s.ignited ? 5 : 0)) * D.dur, tick: 0, ltick: 0, dmg: stv('rod', 'dmg') }); }
        const max = s.ignited ? cnt + 2 : cnt; while (pins.length > max) pins.shift();
      }
    } else if (s.id === 'short') {
      if (s.ignited) { s.t -= dt; if (s.t <= 0) { s.t = 1; shortFire(s, 0); } }
    }
  }
  // 针
  const rod = skillOf('rod');
  for (const pn of pins) {
    pn.t -= dt; pn.tick -= dt; pn.ltick -= dt;
    if (pn.tick <= 0) { pn.tick = 0.5; for (const e of nearestN(pn.x, pn.y, 2.5 * M * D.area, 3)) zap(pn.x, pn.y - 14, e, pn.dmg, {}); }
    if (rod && pn.ltick <= 0) {
      pn.ltick = 0.3;
      if (rod.branch === 'B') { segHit(pn.x, pn.y, p.x, p.y, 0.5 * M, stv('rod', 'dmg') * 0.7); addArc(pn.x, pn.y - 14, p.x, p.y, '#9fd6ff', 0.3, 1.2); }
    }
  }
  if (rod && rod.ignited && pins.length > 1) {
    S.netT = (S.netT || 0) - dt;
    if (S.netT <= 0) { S.netT = 0.3; for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) { const a = pins[i], b = pins[j]; segHit(a.x, a.y, b.x, b.y, 0.5 * M, stv('rod', 'dmg') * 0.85); addArc(a.x, a.y - 14, b.x, b.y - 14, '#ffffff', 0.3, 1.6); } }
  }
  pins = pins.filter(pn => pn.t > 0);
  // 带电地面
  for (const z of zones) { z.t -= dt; z.tick -= dt; if (z.tick <= 0) { z.tick = 0.5; for (const e of query(z.x, z.y, z.r)) { if (z.kind) e.inCrack = S.t + 0.6; if (z.elem === 'time') e.slowZ = S.t + 0.6; dealDamage(e, z.dmg, z.elem || (z.kind ? 'phys' : 'elec'), { weak: true, sc: z.elem === 'frost' ? 0.3 : z.elem === 'fire' ? 0.3 : undefined }); } } }
  zones = zones.filter(z => z.t > 0);
  // 职业特性：光圈电伤 + 过载（弧光师）
  if (isW()) return;
  S.lightTickT -= dt * D.aspd;
  if (S.lightTickT <= 0) { S.lightTickT = 0.5; const m = p.afterHeatT > 0 ? 2 : 1; lampTick(m); }
  p.overload = Math.max(0, p.overload - 3 * dt);
  const tune = skillOf('tune');
  if (tune && tune.branch === 'B' && p.overload >= 50 && !p.halfFired) { p.halfFired = true; pulse(0.5); }
  if (p.overload >= 100) { p.overload = 0; p.halfFired = false; pulse(1); }
}

