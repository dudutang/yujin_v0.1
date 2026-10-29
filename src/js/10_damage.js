// ================= 伤害与状态 =================
const ELEM_COLOR = { elec: '#bfe6ff', fire: '#ff9a4a', light: '#fff1b0', phys: '#d9d4c8', frost: '#bfe9ff', curse: '#c9b6ff', time: '#9be08a' };
function applyStun(e, t) { if (e.dead || e.type === 'nest' || e.reaper) return; if (e.type === 'boss') t *= 0.25; e.stunT = Math.max(e.stunT, t); if (e.shielded) e.brokenT = 4; }
function applyKnock(e, x, y, dist) {
  if (e.dead || e.type === 'nest' || e.reaper) return; const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1; const k = dist * D.knock * (e.type === 'boss' ? 0.08 : e.elite ? 0.4 : 1) * 6;
  e.kbx = dx / d * k; e.kby = dy / d * k; e.knockT = 1; if (e.shielded) e.brokenT = 4;
}
function dealDamage(e, base, elem, o = {}) {
  if (e.dead) return;
  if (e.reaper) { if (!o.dot && Math.random() < 0.3) { addNum(e.x, e.y - 8, 0, '#8b93a3'); nums[nums.length - 1].v = '无效'; } return; }
  const depth = o.depth || 0;
  if (e.bshell > 0 && !o.dot) { e.bshell--; e.flash = 0.06; addNum(e.x, e.y - 10, 0, '#dfe3ea'); nums[nums.length - 1].v = '壳 ' + e.bshell; sfx('hit', 1); if (e.bshell === 0) { e.brokenT = 6; burst(e.x, e.y - 10, '#dfe3ea', 24, 200); sfx('boom'); banner('壳碎了', '6 秒内它受到的伤害 ×1.5', '#ffd28a', 1.5); } return; }
  if (!o.dot && e.shielded && e.brokenT <= 0 && e.shieldReady && !(isW() && nd('sunder'))) { e.shieldReady = false; e.shieldT = 3; addNum(e.x, e.y, 0, '#8b93a3'); nums[nums.length - 1].v = '挡'; return; }
  const p = S.player;
  let add = 0;
  if (elem === 'elec') add += 0.10 * lv('conductor');
  if (elem === 'fire') add += 0.10 * lv('scorch');
  if (elem === 'light') add += 0.10 * lv('prism');
  if (lv('exec') && e.hp < 0.3 * e.maxHp) add += 0.25 * lv('exec');
  add += D.dmg - 1;
  if (p.overload > 70) add += 0.05 * lv('capacitor');
  if (e.elite) add += D.elite;
  if (e.knockT > 0) add += 0.10 * lv('heavy');
  if (gearU('boots') && p.moving) add += 0.1;
  if (isW()) {
    if ((e.elite || e.type === 'nest') && nd('sunder')) add += 0.3; if (S.berserkT > 0) add += 0.2;
    if (S.spec === 'berserker') add += Math.min(0.5, 1 - p.hp / D.maxHp);
    if (S.spec === 'dark') add += S.conc / 200 + (S.devourT > 0 ? 0.4 : 0);
  }
  let mult = 1;
  if (elem === 'elec' && e.shock) mult *= 1 + 0.2 * e.shock.st;
  if (e.expo) mult *= 1 + 0.15 * e.expo.st;
  if (e.frozenT > 0) mult *= 1.25;
  if (gearU('lantern') && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < S.lr * S.lr) mult *= 1.1;
  if (lv('bite')) mult *= 1 + 0.1 * lv('bite') * nStat(e);
  if (S.bl && S.bl.x_legend && e.hp >= e.maxHp - 0.5) mult *= 4;
  if (e.shielded && e.brokenT > 0) mult *= 1.5;
  if (isW() && syn('shatter') && e.inCrack > S.t) mult *= 1.25;
  if (!o.dot && !o.crit && Math.random() < D.crit) o.crit = true;
  const crit = o.crit ? D.critDmg : 1;
  const dmg = base * (1 + add) * mult * crit;
  e.hp -= dmg; e.flash = 0.09; if (o.crit) sfx('crit'); S.stats.dmg += dmg;
  if (isW() && nd('execute') && !e.elite && e.type !== 'nest' && e.type !== 'boss' && e.hp > 0 && e.hp < 0.2 * e.maxHp) { e.hp = 0; addNum(e.x, e.y - 8, 0, '#ff6b5e'); nums[nums.length - 1].v = '处决'; if (S.spec === 'dark') { summon(e.x, e.y); heal(0.01); } }
  if (!o.weak || dmg >= 8) addNum(e.x, e.y, dmg, o.crit ? '#ffffff' : ELEM_COLOR[elem]);
  if (S.bl && S.bl.c_legend && e.hp > 0 && e.hp < 0.2 * e.maxHp && (e.chill || e.frozenT > 0) && e.type !== 'boss' && e.type !== 'nest' && !e.reaper && (!e.elite || Math.random() < 0.1)) { e.hp = 0; addNum(e.x, e.y - 8, 0, '#bfe9ff'); nums[nums.length - 1].v = '碎裂'; burst(e.x, e.y - 8, '#dff4ff', 12, 140); sfx('ice'); }
  if (o.stun) applyStun(e, o.stun);
  if (!o.dot && D.leech > 0 && Math.random() < D.leech) heal(0.006);
  if (e.hp <= 0) { kill(e); return; }
  if (!o.dot && depth < 3) onHit(e, elem, o, base, depth);
}
function onHit(e, elem, o, base, depth) {
  const p = S.player;
  if (isW() && lv('conductor') && Math.random() < 0.06 * lv('conductor')) applyStatus(e, 'shock', depth);
  if (!isW() && !o.noOverload && !o.dot) p.overload = Math.min(100, p.overload + (o.weak ? 0.5 : 2));
  const sc = o.sc != null ? o.sc : (o.weak ? 0.18 : 0.45);
  if (!isW() && elem === 'fire' && Math.random() < sc + 0.08 * lv('scorch')) applyStatus(e, 'burn', depth);
  if (!isW() && elem === 'light' && Math.random() < sc + 0.08 * lv('prism')) applyStatus(e, 'expo', depth);
  if (!isW() && elem === 'frost' && Math.random() < sc) applyStatus(e, 'chill', depth);
  if (!isW() && elem === 'curse' && Math.random() < sc) applyStatus(e, 'curse', depth);
  if (!isW() && !o.weak && !o.dot && S.bl && S.bl.k_fear && !e.elite && e.type !== 'nest' && e.type !== 'boss' && !e.reaper && Math.random() < stv('k_fear', 'chance')) e.fearT = stv('k_fear', 'dur') * D.dur;
  if (elem === 'elec') {
    const had = !!e.shock;
    if (Math.random() < (isW() ? 0.35 : sc) + 0.08 * lv('conductor')) applyStatus(e, 'shock', depth);
    if (had && !o.weak && depth < 2 && !e.dead && Math.random() < 0.3) {
      const n = nearest(e.x, e.y, 3 * M, x => !x.shock && x !== e);
      if (n) { addArc(e.x, e.y, n.x, n.y, '#bfe6ff', 0.12, 1.2); dealDamage(n, base * 0.5, 'elec', { depth: depth + 1 }); }
    }
  }
  if (e.dead) return;
  const sc2 = lv('scorch'); if (sc2 && Math.random() < 0.06 * sc2) applyStatus(e, 'burn', depth);
  const pr = lv('prism'); if (pr && Math.random() < 0.06 * pr) applyStatus(e, 'expo', depth);
  const n7 = bl('seventh'); if (n7 && !e.dead) { S.hitCount++; if (S.hitCount % [7, 5, 3][n7 - 1] === 0) applyStatus(e, pickU(['shock', 'burn', 'expo']), depth); }
}
function applyStatus(e, kind, depth) {
  if (e.dead || e.reaper) return;
  const T = 4 * (1 + 0.25 * lv('shiver')), B = S.bl || {};
  if (kind === 'shock') { const cap = B.t_legend ? 5 : 3; if (e.shock) { e.shock.st = Math.min(cap, e.shock.st + 1); e.shock.t = T; } else e.shock = { st: 1, t: T }; }
  else if (kind === 'burn') { const cap = e.melt || B.f_legend ? 10 : 5; if (e.burn) { e.burn.st = Math.min(cap, e.burn.st + 1); e.burn.t = T; } else e.burn = { st: 1, t: T, acc: 0 }; }
  else if (kind === 'expo') { if (e.expo) { e.expo.st = Math.min(3, e.expo.st + 1); e.expo.t = T; } else e.expo = { st: 1, t: T }; }
  else if (kind === 'chill') { if (e.frozenT > 0 || e.type === 'boss') { if (e.type === 'boss') { e.chill = { st: 2, t: T }; } return; } if (e.chill && e.chill.st != null) { e.chill.st = Math.min(5, e.chill.st + 1); e.chill.t = T; } else e.chill = { st: 1, t: T };
    if (e.chill.st >= 5 && e.type !== 'nest') { e.chill = null; e.frozenT = 2 * D.dur; applyStun(e, 2 * D.dur); addRing(e.x, e.y, 0.9 * M, '#dff4ff', 0.3); sfx('ice'); } }
  else if (kind === 'curse') { if (e.curse) { e.curse.st = Math.min(5, e.curse.st + 1); } else e.curse = { st: 1, t: 1.6 }; }
  react(e, depth);
}
function noteReaction(name) {
  S.stats.reactions[name]++;
  if (!S.run.firstReaction) { S.run.firstReaction = { name, t: +S.t.toFixed(1) }; banner('首次元素反应：' + name, '两种来源的状态在同一个敌人身上相遇', '#ffd28a'); slowT = 0.8; }
}
function react(e, depth) {
  if (depth >= 3 || e.dead) return;
  const rm = (1 + 0.4 * bl('reactor')) * (1 + 0.06 * (S.player.lvl - 1)), rr = (1 + 0.3 * bl('reactor')) * D.area;
  const willReact = (e.shock && e.burn) || (e.shock && e.expo) || (e.expo && e.burn);
  if (willReact && e.frozenT > 0 && e.type !== 'boss') { e.frozenT = 0; S.stats.reactions.碎裂 = (S.stats.reactions.碎裂 || 0) + 1; addNum(e.x, e.y - 12, 0, '#dff4ff'); nums[nums.length - 1].v = '碎裂'; burst(e.x, e.y - 8, '#dff4ff', 14, 150); dealDamage(e, Math.min(200, 0.3 * e.maxHp), 'phys', { dot: true, depth: depth + 1 }); if (e.dead) return; }
  if (e.shock && e.burn) {
    const dmg = Math.max(15, e.burn.st * 4 * e.burn.t + e.shock.st * 8) * 1.5 * rm, R = 2 * M * rr, x = e.x, y = e.y;
    e.shock = null; e.burn = null; noteReaction('爆燃');
    addRing(x, y, R, '#ff9a4a', 0.4); burst(x, y, '#ffb06a', 14, 160); S.flashes.push({ x, y, r: R * 1.4, t: 0.3 });
    smash(x, y, R); for (const t of query(x, y, R)) { applyKnock(t, x, y, 1.2 * M); dealDamage(t, dmg, 'fire', { depth: depth + 1 }); }
    return;
  }
  if (e.shock && e.expo) {
    e.shock = null; e.expo = null; noteReaction('电离');
    const ns = nearestN(e.x, e.y, 4 * M * rr, 3, x => x !== e);
    addRing(e.x, e.y, 1.2 * M, '#e6f7ff', 0.3);
    dealDamage(e, 12 * rm, 'elec', { crit: true, depth: depth + 1 });
    for (const t of ns) { addArc(e.x, e.y, t.x, t.y, '#ffffff', 0.2, 2.2); dealDamage(t, 12 * rm, 'elec', { crit: true, depth: depth + 1 }); applyStatus(t, 'expo', depth + 1); }
    return;
  }
  if (e.expo && e.burn) {
    e.expo = null; e.melt = true; e.burn.st = 10; e.burn.t = 4; noteReaction('熔毁');
    addRing(e.x, e.y, 1 * M, '#ffcf6a', 0.4); burst(e.x, e.y, '#ffcf6a', 10, 80);
  }
}
function kill(e) {
  if (e.dead) return; e.dead = true; S.stats.kills++;
  if (e.elite && e.type !== 'boss') S.stats.elites = (S.stats.elites || 0) + 1;
  if (e.mark && S.chal) S.chal.left--;
  if (e.gold) { S.chests.push({ x: e.x, y: e.y + 6, open: false, gold: true }); addRing(e.x, e.y, 2 * M, '#ffd28a', 0.5); }
  if (!window.__botFast) { const n = e.elite ? 22 : e.type === 'shell' ? 12 : 7; for (let i = 0; i < n && ash.length < 360; i++) ash.push({ x: e.x + rand(-8, 8), y: e.y + rand(-12, 4), vx: rand(-14, 14), vy: rand(-55, -20), t: rand(0.5, 1.1), life: 1.1, s: rand(1.5, 3.2), c: Math.random() < 0.25 ? '#ffb35a' : Math.random() < 0.5 ? '#4a4556' : '#7a7387' }); }
  sfx('kill', e);
  if (!isW() && S.bl) blKill(e);
  drop('xp', e.x, e.y, e.xp);
  const L = LAYERS[layerAt(e.x, e.y)];
  const sc = L.scrap * D.scrap;
  if (Math.random() < sc) drop('scrap', e.x, e.y, 1);
  if (Math.random() < [0.03, 0.02, 0.012][layerAt(e.x, e.y)]) drop('heal', e.x, e.y, 1);
  if (e.elite) {
    let n = layerAt(e.x, e.y) + 1; if (Math.random() < 0.05 * lv('scavenge')) n++; if (bl('greed') && Math.random() < 0.5 * bl('greed')) n++;
    for (let i = 0; i < n; i++) drop('part', e.x + rand(-12, 12), e.y + rand(-12, 12), 1);
    drop('heal', e.x - 8, e.y, 1); drop('heal', e.x + 8, e.y, 1); if (!e.noChip && Math.random() < 0.2 + (pact('dim') ? 0.15 : 0)) drop('chip', e.x, e.y - 10, 1); if (!e.noChip && Math.random() < 0.08) dropGear(e.x, e.y + 8, 0);
  }
  if (isW()) {
    if (S.spec === 'dark') { if (Math.random() < 0.15) summon(e.x, e.y); if (nd('d_soul')) heal(S.conc >= 60 ? 0.006 : 0.003); }
    if (S.spec === 'berserker' && S.berserkT > 0) { S.berserkT = Math.min(S.berserkT + 0.3, 20); if (nd('b_war')) heal(0.01); }
  }
  if (e.elite && bl('tobattery') && (S.purged || 0) < 12 * bl('tobattery')) S.purged = (S.purged || 0) + lowerTide(bl('tobattery'));
  if (e.type === 'nest') {
    S.stats.nests++; lowerTide(6); S.nestChip = Math.random() < 0.4; if (Math.random() < 0.15) dropGear(e.x, e.y + 10, 0); const n = layerAt(e.x, e.y) === 2 ? 3 : 2;
    for (let i = 0; i < n; i++) drop('part', e.x + rand(-16, 16), e.y + rand(-16, 16), 1);
    drop('heal', e.x - 12, e.y, 1); drop('heal', e.x + 12, e.y, 1); if (S.nestChip) drop('chip', e.x, e.y - 14, 1);
    addRing(e.x, e.y, 4 * M, '#b79cff', 0.6); burst(e.x, e.y, '#b79cff', 30, 200); S.shake = Math.min(10, S.shake + 6);
    banner('巢穴摧毁', '灰潮浓度 −6，附近不再从这里涌出烬影。', '#c9b6ff');
  }
  if (e.burn && Math.random() < (e.melt ? 1 : 0.25)) { for (const t of nearestN(e.x, e.y, 2 * M, 2, x => x !== e)) { applyStatus(t, 'burn', 2); applyStatus(t, 'burn', 2); } }
  if (e.type === 'moth') { addRing(e.x, e.y, 1.5 * M, '#c9b9ff', 0.3); for (const t of query(e.x, e.y, 1.5 * M)) dealDamage(t, 20, 'phys', { depth: 2 }); }
  if (e.aff.includes('fission')) for (let i = 0; i < 3; i++) spawnEnemy('shade', false, e.x + rand(-20, 20), e.y + rand(-20, 20));
  burst(e.x, e.y, '#7c8496', e.elite ? 18 : 6, 70);
}
function drop(kind, x, y, v) { if (items.length > 700 && kind === 'xp') { const it = items.find(i => i.kind === 'xp'); if (it) { it.v += v; return; } } items.push({ kind, x: x + rand(-6, 6), y: y + rand(-6, 6), v, mag: false, t: 0 }); }

function hurtPlayer(amount, src) {
  const p = S.player; if (p.iframes > 0 || mode !== 'play') return;
  if (D.evade > 0 && Math.random() < D.evade) { p.iframes = 0.25; addNum(p.x, p.y - 14, 0, '#cfe8ff'); nums[nums.length - 1].v = '闪避'; return; }
  if (isW() && nd('parry') && S.parryT <= 0) { S.parryT = 4; p.iframes = 0.3; addNum(p.x, p.y - 14, 0, '#cfe8ff'); nums[nums.length - 1].v = '格挡'; counterSwing(); return; }
  if (!isW() && blShieldBlock()) return;
  amount = Math.max(1, amount - D.armor);
  if (isW() && nd('mountain') && p.still > 0.6) amount *= 0.6;
  if (!isW() && S.lamp === 'l_lamp') amount *= 0.9;
  if (p.moving) amount *= 1 - 0.03 * lv('swift');
  if (p.shield > 0) { const a = Math.min(p.shield, amount); p.shield -= a; amount -= a; }
  p.hp -= amount; S.stats.taken += amount; { const sk = src ? (src.elite ? 'elite' : src.type) : 'moth'; S.stats.src = S.stats.src || {}; S.stats.src[sk] = (S.stats.src[sk] || 0) + amount; } p.lastHurt = S.t; p.iframes = src && src.reaper ? Math.max(D.ifr, 1.2) : D.ifr; sfx('hurt'); p.hurtFlash = 0.2; S.shake = Math.min(8, S.shake + 4);
  if (src && !src.dead && bl('shell')) dealDamage(src, amount * 2 * bl('shell'), 'phys', { depth: 2 });
  if (isW() && nd('thorns')) arcHit(0, 360, 2.2 * M * D.area, wDmg(), { noRage: true, color: '#ff8a80' });
  if (isW() && (nd('undying') || nd('b_rage')) && S.berserkT > 0 && p.hp <= 0) p.hp = 1;
  if (!isW()) blHurt(amount, src);
  const s = skillOf('short');
  if (s && S.t >= (s.cdUntil || 0)) { s.cdUntil = S.t + stv('short', 'cd') * D.cdMul; shortFire(s, s.branch === 'A' ? amount * 3 : 0); if (s.branch === 'B') { p.shield = 15; p.shieldT = 2; } }
  if (p.hp <= 0) {
    if ((bl('secondwind') || gearU('charm')) && !S.usedSecond) { S.usedSecond = true; p.hp = D.maxHp; p.iframes = 2; pulse(1.5, true); banner('余温', '老守灯人把你从灰里拉了回来', '#ffb454'); }
    else endRun('dead');
  }
}

