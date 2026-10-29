// ================= 测试机器人（仅自动测试用） =================
function botPick(o) {
  if (isW() && window.__botPick === 'focus') return o.find(x => x.kind === 'node' && treePts(NODES[x.id].tree) > 0) || o.find(x => x.kind === 'node') || o[0];
  if (window.__botPick !== 'focus') return pickU(o);
  const want = wanted();
  return o.find(x => x.kind === 'passive' && want.has(x.id))
    || o.filter(x => x.kind === 'skill' && x.owned).sort((a, b) => skillOf(b.id).lvl - skillOf(a.id).lvl)[0]
    || (S.skills.length < 3 && o.find(x => x.kind === 'skill'))
    || o.find(x => x.kind === 'passive' && Object.values(SKILLS).some(d => d.ignite === x.id && skillOf(Object.keys(SKILLS).find(k => SKILLS[k] === d))))
    || o.find(x => x.slot === '顺势') || o[0];
}
function botMove() {
  const p = S.player; keys.delete('e');
  let tx, ty;
  const homeLamp = [S.beacon, ...S.lamps.filter(l => l.rep)].sort((a, b) => d2(a, p) - d2(b, p))[0];
  const unrep = S.lamps.find(l => !l.rep && S.loot.scrap >= REPAIR_COST && d2(l, p) < (40 * M) ** 2);
  const plan = window.__botPlan || [150, 330];
  const goalR = (S.t < plan[0] ? 25 : S.t < plan[1] ? 70 : 120) * M; if (S.botAng == null) S.botAng = Math.random() * 6.283; const goalX = Math.cos(S.botAng) * goalR, goalY = Math.sin(S.botAng) * goalR;
  if (S.conc > (window.__botConc || 100) || p.hp < 0.25 * D.maxHp && S.conc > 60 || (S.reapers || 0) >= 1) S.botHome = true;
  const chest = S.chests.find(c => !c.open && (c.gold || S.loot.scrap >= chestCost(c) + REPAIR_COST) && (c.x - p.x) ** 2 + (c.y - p.y) ** 2 < (14 * M) ** 2);
  if (S.botHome) { tx = homeLamp.x; ty = homeLamp.y; keys.add('e'); }
  else if (unrep) { tx = unrep.x; ty = unrep.y; if (d2(unrep, p) < (2 * M) ** 2) keys.add('e'); }
  else if (isW() && !S.spec && p.lvl >= 8) { tx = S.oath.x; ty = S.oath.y; if (d2(S.oath, p) < (2 * M) ** 2) keys.add('e'); }
  else if (S.boss && !S.boss.dead) { const B = S.boss, dx = p.x - B.x, dy = p.y - B.y, d = Math.hypot(dx, dy) || 1, want = isW() ? 2.2 * M : 5 * M; tx = B.x + dx / d * want; ty = B.y + dy / d * want; keys.delete('e'); }
  else if (!S.botHome && p.lvl >= 10 && p.hp > 0.6 * D.maxHp && S.eyes.some(E => !E.used && d2(E, p) < (25 * M) ** 2)) { const E = S.eyes.find(E => !E.used && d2(E, p) < (25 * M) ** 2); tx = E.x; ty = E.y; if (d2(E, p) < (2 * M) ** 2) keys.add('e'); }
  else if (chest && !S.botHome) { tx = chest.x; ty = chest.y; if (d2(chest, p) < (1.6 * M) ** 2) keys.add('e'); }
  else if (!S.botHome && S.pois.some(o => !o.used && d2(o, p) < (20 * M) ** 2 && !(o.kind === 'challenge' && (S.chal || S.t < 60)) && !(o.kind === 'scav' && S.loot.scrap < scavPrice()))) { const o = S.pois.filter(o => !o.used && d2(o, p) < (20 * M) ** 2 && !(o.kind === 'challenge' && (S.chal || S.t < 60)) && !(o.kind === 'scav' && S.loot.scrap < scavPrice())).sort((a, b) => d2(a, p) - d2(b, p))[0]; tx = o.x; ty = o.y; if (d2(o, p) < (1.8 * M) ** 2) keys.add('e'); }
  else if (S.tapeItems.length && d2(S.tapeItems[0], p) < (35 * M) ** 2 && S.t > 120) { tx = S.tapeItems[0].x; ty = S.tapeItems[0].y; keys.delete('e'); }
  else if (!S.altar.used && S.t > plan[1] + 30 && d2(S.altar, p) < (30 * M) ** 2) { tx = S.altar.x; ty = S.altar.y; if (d2(S.altar, p) < (2 * M) ** 2) keys.add('e'); }
  else { const a = S.t * 0.35; tx = goalX + Math.cos(a) * 7 * M; ty = goalY + Math.sin(a) * 7 * M; keys.delete('e'); }
  if (window.__botBrawl && isW() && !S.botHome) { let be = null, bd = (6 * M) ** 2; for (const e of query(p.x, p.y, 6 * M)) { if (e.type === 'nest') continue; const d = d2(e, p); if (d < bd) { bd = d; be = e; } } if (be && p.hp > 0.35 * D.maxHp) { tx = be.x; ty = be.y; } }
  let ax = tx - p.x, ay = ty - p.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  const RR = window.__botBrawl && isW() && p.hp > 0.35 * D.maxHp ? 1.1 * M : 3 * M;
  for (const n of query(p.x, p.y, RR)) { const dx = p.x - n.x, dy = p.y - n.y, dl = Math.hypot(dx, dy) || 1; const w = (RR - dl) / RR * 1.5; ax += dx / dl * w; ay += dy / dl * w; }
  return [ax, ay];
}
window.__ember = {
  gearRoll, meta: () => META, titleScreen, start, state: () => S, D: () => D, fx: () => ({ sparks: sparks.length, ash: ash.length }), openShrine, startChallenge, summonBoss, openGold, openScav, mode: () => mode, enemies: () => enemies,
  sim(seconds, dt = 1 / 30) { const n = Math.round(seconds / dt); for (let i = 0; i < n && mode === 'play'; i++) update(dt); return mode; },
};

