// ================= 地图交互物：杂物、储物柜、巢穴 =================
function populateMap() { ensureChunks(); }
function smash(x, y, R) { for (const b of S.breaks) if (!b.dead && (b.x - x) ** 2 + (b.y - y) ** 2 < (R + 10) ** 2) breakIt(b); }
function breakIt(b) {
  b.dead = true; S.stats.breaks++; sfx('break');
  const li = layerAt(b.x, b.y), r = Math.random();
  burst(b.x, b.y - 8, b.kind === 'cocoon' ? '#8a7fa6' : '#8a6d47', 12, 110);
  if (r < 0.35) drop('heal', b.x, b.y, 1);
  if (Math.random() < 0.04) drop('chip', b.x, b.y - 6, 1);
  else if (r < 0.75) { for (let i = 0; i < 2 + li; i++) drop('scrap', b.x + rand(-8, 8), b.y + rand(-8, 8), 1); }
  else if (r < 0.85) drop('vac', b.x, b.y, 1);
  else if (r < 0.93) drop('calm', b.x, b.y, 1);
  else for (let i = 0; i < 5; i++) drop('xp', b.x + rand(-10, 10), b.y + rand(-10, 10), 2);
}
function updBreaks() {
  const p = S.player;
  for (const b of S.breaks) if (!b.dead && (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < (p.r + 14) ** 2) breakIt(b);
  if (S.breaks.some(b => b.dead)) S.breaks = S.breaks.filter(b => !b.dead);
}
function openShrine(o) {
  const d = SHRINES[o.type], dis = d.A.dis ? d.A.dis() : '';
  const html = `<div class="panel"><div><div class="title">SHRINE</div><h2>${d.name}</h2><div class="sub">二选一，选完神龛熄灭。按 1 / 2 或点击，Esc 走开。</div></div><div class="cards">${[['A', d.A], ['B', d.B]].map(([k, c], i) => `<button class="card" data-i="${i}" style="--r:${d.col}" ${i === 0 && dis ? 'disabled' : ''}><div class="head"><span class="name">${k === 'A' ? '代价换收益' : '稳妥'}</span><span class="key">${i + 1}</span></div><p>${c.t}</p>${i === 0 && dis ? `<p class="now">${dis}</p>` : ''}</button>`).join('')}</div></div>`;
  if (window.__bot && window.__botFast) { const pick = dis ? 1 : (Math.random() < 0.5 ? 0 : 1); o.used = true; (pick ? d.B : d.A).f(); recalc(); S.run.shrines.push({ type: o.type, pick, t: +S.t.toFixed(1) }); return; }
  selectPanel(html, 2, i => { if (i === 0 && dis) return; o.used = true; (i ? d.B : d.A).f(); recalc(); S.run.shrines.push({ type: o.type, pick: i, t: +S.t.toFixed(1) }); sfx('synergy'); addRing(o.x, o.y, 3 * M, d.col, 0.5); $('#overlay').classList.remove('on'); mode = 'play'; afterChoice(); });
  if (window.__bot) setTimeout(() => pickSel(dis ? 1 : (Math.random() * 2) | 0), 0);
}
function openScav(o) {
  const all = [...SCAV.map(c => ({ ...c, price: scavPrice(), ok: S.loot.scrap >= scavPrice(), lab: scavPrice() + ' 废料' })), ...SCAV_P.map(c => ({ ...c, ok: S.loot.part >= c.cost, lab: c.cost + ' 零件' }))];
  const html = `<div class="panel"><div><div class="title">SCAVENGER</div><h2>拾荒者</h2><div class="sub">你有 ${Math.floor(S.loot.scrap)} 废料 · ${Math.floor(S.loot.part)} 零件。废料货每买一件涨 4。撤离时超过 60 的废料只带回一半，所以在这里花掉不亏。按 1–6 或点击，Esc 走开。</div></div><div class="cards">${all.map((c, i) => `<button class="card" data-i="${i}" style="--r:${c.cost ? '#9fe8ff' : '#c9b9a0'}" ${c.ok ? '' : 'disabled'}><div class="head"><span class="name">${c.name}</span><span class="key">${i + 1}</span></div><p>${c.text}</p><p class="now">${c.lab}</p></button>`).join('')}</div></div>`;
  if (window.__bot && window.__botFast) { if (S.loot.scrap >= scavPrice()) { S.loot.scrap -= scavPrice(); S.scavBought++; pickU(SCAV).f(); S.run.scav = (S.run.scav || 0) + 1; } return; }
  selectPanel(html, all.length, i => { const c = all[i]; if (!c.ok) return; if (c.cost) S.loot.part -= c.cost; else { S.loot.scrap -= scavPrice(); S.scavBought++; } c.f(); sfx('scrap'); S.run.scav = (S.run.scav || 0) + 1; $('#overlay').classList.remove('on'); mode = 'play'; afterChoice(); });
  if (window.__bot) setTimeout(() => pickSel((Math.random() * all.length) | 0), 0);
}
const chalCount = () => Math.round(10 + S.conc / 4 + S.t / 40);
function startChallenge(o) {
  const n = chalCount(), p = S.player; o.used = true; S.chal = { obj: o, t: 60, left: 0 }; sfx('horn'); banner('挑战开始', `${n} 个带标记的怪，60 秒内清完开金柜`, '#c9b6ff', 3);
  for (let i = 0; i < n; i++) { const a = i / n * 6.283, r = rand(5, 8) * M, e = spawnEnemy(i % 5 === 0 ? 'shell' : i % 3 === 0 ? 'moth' : 'shade', i === 0 && S.conc >= 40, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); e.mark = true; e.noChip = true; S.chal.left++; }
}
function updChallenge(dt) {
  const C = S.chal; if (!C) return; C.t -= dt;
  if (C.left <= 0) { S.chal = null; S.chests.push({ x: C.obj.x + 24, y: C.obj.y + 8, open: false, gold: true }); sfx('level'); banner('挑战成功', '金柜出现了', '#ffd28a', 2.5); S.run.chalWon = (S.run.chalWon || 0) + 1; return; }
  if (C.t <= 0) { S.chal = null; for (const e of enemies) if (e.mark) e.mark = false; banner('挑战失败', '标记散了，金柜没有出现', '#8b93a3', 2.5); }
}
function summonBoss(E) {
  E.used = true; const T = ETYPES.boss, tier = E.tier, sc = (1 + S.t / 600) * (1 + S.conc / 100) * (tier === 2 ? 2 : 1);
  const e = spawnEnemy('boss', false, E.x, E.y - 20); e.hp = e.maxHp = T.hp * sc; e.dmg = T.dmg * (tier === 2 ? 1.3 : 1) * (1 + S.conc / 150); e.spd = T.spd; e.r = 30; e.xp = 80 * tier;
  e.boss = tier; e.phases = [0.75, 0.5, 0.25]; e.bshell = 0; e.summonT = 12; e.noChip = true;
  if (tier === 2) { e.elite = true; e.aff = ['devour']; }
  S.boss = e; S.shake = 12; sfx('oath'); banner('潮眼睁开了', tier === 2 ? '深处的蚀壳巨兽。吞光，召灰蛾。' : '蚀壳巨兽从灰里爬出来。每掉四分之一血套一层壳。', '#c9b6ff', 3.5); slowT = 0.8;
  S.run.bossAt = +S.t.toFixed(1);
}
function updBoss(dt) {
  const e = S.boss; if (!e) return; const p = S.player;
  if (e.dead) { S.boss = null; S.tideFreeze = 60; S.eyeDone.add(e.boss === 2 ? 2 : 1); S.run.bossKill = +S.t.toFixed(1); S.stats.boss = (S.stats.boss || 0) + 1;
    S.chests.push({ x: e.x, y: e.y + 10, open: false, gold: true }); drop('chip', e.x - 20, e.y, 1); dropGear(e.x + 30, e.y + 4, 2); S.tapeItems.push(makeTape(e.x + 24, e.y, true)); for (let i = 0; i < 4; i++) drop('part', e.x + rand(-20, 20), e.y + rand(-10, 10), 1);
    for (const it of items) if (it.kind === 'xp') it.mag = true;
    sfx('extract'); slowT = 1.2; S.flashes.push({ x: e.x, y: e.y, r: 14 * M, t: 0.7 }); S.shake = 14; banner('巨兽倒下', '灰潮停涨 60 秒，本层上涨 −30%。金柜、芯片、录音带掉在它身下。', '#ffd28a', 4); return; }
  e.tideT = (e.tideT || 0) + dt; if (e.tideT >= 10) { e.tideT -= 10; S.conc += 2; addNum(e.x, e.y - 30, 0, '#c9b6ff'); nums[nums.length - 1].v = '灰潮 +2'; }
  const f = e.hp / e.maxHp;
  while (e.phases.length && f <= e.phases[0]) { e.phases.shift(); e.bshell = 8 + 4 * e.boss; e.brokenT = 0; addRing(e.x, e.y, 3 * M, '#dfe3ea', 0.5); sfx('boom'); banner('巨兽套壳', `打碎 ${e.bshell} 下才能继续伤它`, '#dfe3ea', 2);
    const n = e.boss === 2 ? 4 : 3; for (let i = 0; i < n; i++) { const a = i / n * 6.283; spawnEnemy('shell', false, e.x + Math.cos(a) * 2.5 * M, e.y + Math.sin(a) * 2.5 * M); } }
  if (e.boss === 2) { e.summonT -= dt; if (e.summonT <= 0) { e.summonT = 12; for (let i = 0; i < 3; i++) { const a = Math.random() * 6.283; spawnEnemy('moth', false, e.x + Math.cos(a) * 3 * M, e.y + Math.sin(a) * 3 * M); } } }
}
function openGold(c) {
  const L = 1 + (D.luck || 0), r = Math.random(), n = r < 0.1 * L ? 5 : r < 0.1 * L + 0.3 * L ? 3 : 1;
  const got = [], used = new Set();
  for (let i = 0; i < n; i++) { const opts = genChoices().filter(o => o.kind !== 'res' && !used.has(o.kind + o.id)); if (!opts.length) break; const o = rollRarity({ ...pickU(opts) }, affixable(pickU(opts)) ? 2 : 0); used.add(o.kind + o.id); applyOption(o); got.push(o); }
  dropGear(c.x + 16, c.y + 6, 1); S.run.golds = (S.run.golds || 0) + 1; sfx('chest'); sfx('level'); S.flashes.push({ x: c.x, y: c.y, r: 6 * M, t: 0.5 }); burst(c.x, c.y - 8, '#ffd28a', 30, 220);
  if (window.__bot && window.__botFast) return;
  const html = `<div class="panel"><div><div class="title">GOLDEN LOCKER</div><h2>金柜开出 ${n} 张</h2><div class="sub">全部已经生效。${n === 5 ? '五连，今天手气在你这边。' : n === 3 ? '三张。' : '一张。幸运越高，开出 3 张和 5 张的概率越大。'}</div></div><div class="cards">${got.map((o, i) => cardHTML(o, i).replace('<button class="card"', `<button class="card reveal" style="animation-delay:${0.35 * i}s;`).replace('style="--r', '--r')).join('')}</div><div class="row-btns"><button class="btn" id="gok">继续（Enter）</button></div></div>`;
  const ov = $('#overlay'); ov.innerHTML = html; ov.classList.add('on'); mode = 'gold'; $('#gok').onclick = () => { ov.classList.remove('on'); mode = 'play'; afterChoice(); };
  if (window.__bot) setTimeout(() => { if (mode === 'gold') $('#gok').click(); }, 0);
}
function openChest(li) {
  if (isW()) {
    const slots = ['fin'].concat(S.benchDone ? ['atk'] : []);
    const sl = pickU(slots), ks = shuffle(Object.keys(AXEMODS[sl].opts).filter(k => k !== S.axe[sl])).slice(0, 2);
    const up = genChoices().filter(o => o.kind !== 'res').slice(0, 1).map(o => ({ ...rollRarity(o, affixable(o) ? 2 : 0), slot: '诱惑' }));
    const opts = [...ks.map(k => ({ kind: 'mod', id: sl + ':' + k, slot: '改造', rar: 0 })), ...up];
    if (window.__bot && window.__botFast) { applyOption(pickU(opts)); return; }
    showPanel(`<div class="panel"><div><div class="title">LOCKER</div><h2>储物柜里有工具：改造斧头的${AXEMODS[sl].label}</h2><div class="sub">现在是「${axeName(sl)}」。同一个改造位只能装一个，新的会替换旧的。也可以拿第三个稀有升级。按 ${opts.map((_, i) => i + 1).join(' / ')} 或点击。</div></div><div class="cards">${opts.map(cardHTML).join('')}</div></div>`,
      i => applyOption(opts[i]), { kind: 'chest', options: opts });
    if (window.__bot) setTimeout(() => pickCard((Math.random() * opts.length) | 0), 0);
    return;
  }
  const roll = o => { if (o.kind === 'res' || !affixable(o)) return o; return rollRarity(o, Math.random() < [0.08, 0.15, 0.3][li] ? 3 : 2); };
  if (window.__bot && window.__botFast) { const o = roll(pickU(genChoices())); applyOption(o); return; }
  const opts = genChoices().map(roll);
  showPanel(`<div class="panel"><div><div class="title">LOCKER</div><h2>储物柜里有东西：选一个</h2><div class="sub">储物柜开出的升级至少是稀有（词条 ×1.5），越深越容易出传说（×2，三条词条）。按 ${opts.map((_, i) => i + 1).join(' / ')} 或点击。</div></div><div class="cards">${opts.map(cardHTML).join('')}</div></div>`,
    i => applyOption(opts[i]), { kind: 'chest', options: opts });
  if (window.__bot) setTimeout(() => pickCard((Math.random() * 3) | 0), 0);
}

