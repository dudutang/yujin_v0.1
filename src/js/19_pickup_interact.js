// ================= 拾取、交互、电量 =================
function updItems(dt) {
  const p = S.player, pr2 = D.pickup * D.pickup;
  for (const it of items) {
    it.t += dt;
    const dx = p.x - it.x, dy = p.y - it.y, d2v = dx * dx + dy * dy;
    if (!it.mag && d2v < pr2) it.mag = true;
    if (it.mag) { const d = Math.sqrt(d2v) || 1, sp = 300 + it.t * 30; it.x += dx / d * Math.min(d, sp * dt); it.y += dy / d * Math.min(d, sp * dt); }
    if (d2v < (p.r + 8) ** 2) {
      it.dead = true;
      if (it.kind === 'xp') { p.xp += it.v * D.xp; sfx('xp'); }
      else if (it.kind === 'vac') { for (const o of items) if (o.kind === 'xp') o.mag = true; addNum(p.x, p.y - 10, 0, '#ffd28a'); nums[nums.length - 1].v = '磁铁'; }
      else if (it.kind === 'calm') { const d = lowerTide(5); addNum(p.x, p.y - 10, 0, '#c9b6ff'); nums[nums.length - 1].v = '浓度 −' + Math.round(d); }
      else if (it.kind === 'heal') { sfx('heal'); const g = Math.min(D.maxHp - p.hp, 0.12 * D.maxHp); p.hp += g; if (g >= 1) { addNum(p.x, p.y - 10, g, '#ff8a80'); nums[nums.length - 1].v = '+' + Math.round(g); } }
      else if (it.kind === 'gear') gearPickup(it.gear);
      else if (it.kind === 'chip') { sfx('level'); S.pendingChip = (S.pendingChip || 0) + 1; addNum(p.x, p.y - 14, 0, '#7ff0c8'); nums[nums.length - 1].v = '科技芯片'; }
      else if (it.kind === 'scrap') { sfx('scrap'); S.loot.scrap += it.v; if (S.lootAtZero) S.lootAtZero.scrap += it.v; }
      else if (it.kind === 'part') { sfx('scrap'); S.loot.part += it.v; if (S.lootAtZero) S.lootAtZero.part += it.v; }
    }
  }
  items = items.filter(i => !i.dead);
}
function interactTarget() {
  const p = S.player, near = (o, r) => (o.x - p.x) ** 2 + (o.y - p.y) ** 2 < r * r;
  for (const l of S.lamps) if (!l.rep && near(l, 2.5 * M)) return { kind: 'repair', obj: l, need: 1.5 };
  if (isW() && !S.spec && near(S.oath, 2.5 * M)) return { kind: 'oath', obj: S.oath, need: 1.2 };
  if (!S.altar.used && near(S.altar, 2.5 * M)) return { kind: 'altar', obj: S.altar, need: 1 };
  for (const c of S.chests) if (!c.open && near(c, 2 * M)) return { kind: 'chest', obj: c, need: 1, cost: c.gold ? 0 : chestCost(c) };
  for (const E of S.eyes) if (!E.used && !S.boss && near(E, 2.5 * M)) return { kind: 'eye', obj: E, need: 1.5 };
  for (const o of S.pois) if (!o.used && near(o, 2.2 * M) && !(o.kind === 'challenge' && S.chal)) return { kind: o.kind, obj: o, need: o.kind === 'scav' ? 0.6 : o.kind === 'stone' ? 0.4 : 1 };
  if (inPersistent(p.x, p.y)) return { kind: 'extract', need: 1 };
  return null;
}
function updInteract(dt) {
  const tg = interactTarget(); const pEl = $('#prompt');
  let msg = '', warn = false;
  if (tg) {
    if (tg.kind === 'repair') { if (S.loot.scrap >= REPAIR_COST) msg = `按住 E 修复路灯（花 ${REPAIR_COST} 废料）：浓度 −${lampDrop()} · 祝福 · 撤离点`; else { msg = `修复需要 ${REPAIR_COST} 废料，你有 ${Math.floor(S.loot.scrap)}`; warn = true; } }
    else if (tg.kind === 'oath') { if (S.player.lvl >= 8) msg = '按住 E 在誓约碑前立誓：守灯骑士 / 狂战士 / 黑暗骑士'; else { msg = `誓约碑：8 级才能转职（现在 ${S.player.lvl} 级）`; warn = true; } }
    else if (tg.kind === 'chest' && tg.obj.gold) msg = '按住 E 打开金柜：免费，开出 1 / 3 / 5 张稀有以上的卡';
    else if (tg.kind === 'chest') { if (S.loot.scrap >= tg.cost) msg = `按住 E 撬开储物柜（花 ${tg.cost} 废料）：稀有以上的升级三选一 + 零件`; else { msg = `撬开需要 ${tg.cost} 废料，你有 ${Math.floor(S.loot.scrap)}`; warn = true; } }
    else if (tg.kind === 'altar') msg = '按住 E 触碰灰潮祭坛：灰潮祝福，每条都有代价';
    else if (tg.kind === 'eye') msg = `按住 E 唤醒潮眼：召来蚀壳巨兽（${tg.obj.tier === 2 ? '深处的更强，带吞光' : '中心层'}）。它活着时路灯压不住灰潮、不能撤离，身边 5 米灰潮涨三倍；它每活 10 秒灰潮 +2。打死它：灰潮停涨 60 秒，本层上涨 −30%，吸全图经验，金柜 + 芯片 + 录音带`;
    else if (tg.kind === 'shrine') { const d = SHRINES[tg.obj.type]; msg = `按住 E 触碰${d.name}：${d.A.t} / ${d.B.t}`; }
    else if (tg.kind === 'challenge') msg = `按住 E 发起挑战：召一波带标记的怪（约 ${chalCount()} 个），60 秒内清完开金柜`;
    else if (tg.kind === 'greed') msg = '按住 E 触碰贪婪碑：本局灰潮上涨 +25%，换废料 ×1.5、柜子费用 −30%';
    else if (tg.kind === 'stone') msg = `按住 E 触碰${STONES[tg.obj.type].name}：${STONES[tg.obj.type].text}`;
    else if (tg.kind === 'scav') msg = `按住 E 和拾荒者交易：${scavPrice()} 废料一件（重随 / 禁用 / 芯片 / 急救包），零件也收（3 换重随、6 换芯片）。你有 ${Math.floor(S.loot.scrap)} 废料 · ${Math.floor(S.loot.part)} 零件`;
    else if (S.boss) { msg = '蚀壳巨兽还活着：路灯压不住灰潮，也不能撤离'; warn = true; }
    else { const l = S.lamps.find(l => l.rep && (l.x - S.player.x) ** 2 + (l.y - S.player.y) ** 2 < (5 * M) ** 2); msg = `按住 E 撤离，带回 ${Math.min(60, Math.floor(S.loot.scrap)) + Math.floor(Math.max(0, Math.floor(S.loot.scrap) - 60) / 2)} 废料${S.loot.scrap > 60 ? '（超过 60 的只带回一半，在这里花掉更划算）' : ''} · ${Math.floor(S.loot.part)} 零件` + (l ? (l.store > 0 ? ` · 灯下灰潮停涨，还剩 ${Math.ceil(l.store)} 秒` : ' · 这盏灯已经压不住灰潮了') : ''); }
  }
  const holding = keys.has('e') && tg && !(tg.kind === 'extract' && S.boss) && !(tg.kind === 'repair' && S.loot.scrap < REPAIR_COST) && !(tg.kind === 'chest' && S.loot.scrap < tg.cost) && !(tg.kind === 'oath' && S.player.lvl < 8);
  if (holding && S.holdTarget === (tg.obj || tg.kind)) S.hold += dt; else { S.hold = holding ? dt : 0; S.holdTarget = tg ? (tg.obj || tg.kind) : null; }
  S.holdNeed = tg ? tg.need : 1;
  if (holding && S.hold >= tg.need) {
    S.hold = 0; keys.delete('e');
    if (tg.kind === 'repair') { sfx('lamp'); S.loot.scrap -= REPAIR_COST; tg.obj.rep = true; tg.obj.store = lampStore() + 40 * bl('homeward'); const d = lowerTide(lampDrop()); addRing(tg.obj.x, tg.obj.y, 5 * M, '#ffb454', 0.6); banner('路灯亮了', `灰潮退了 ${Math.round(d)}。站在灯下，浓度停涨 ${Math.round(tg.obj.store)} 秒。这里也是撤离点。`, '#ffb454', 3.5); openBless(['keeper', 'lab'], '路灯亮了，选择一条祝福'); }
    else if (tg.kind === 'oath') { addRing(tg.obj.x, tg.obj.y, 5 * M, '#ffd28a', 0.6); openOath(); }
    else if (tg.kind === 'chest' && tg.obj.gold) { tg.obj.open = true; openGold(tg.obj); }
    else if (tg.kind === 'chest') { sfx('chest'); S.loot.scrap -= tg.cost; tg.obj.open = true; S.chestsOpened++; if (Math.random() < 0.3 + (pact('dim') ? 0.15 : 0)) drop('chip', tg.obj.x + 12, tg.obj.y, 1); if (Math.random() < 0.1) dropGear(tg.obj.x - 12, tg.obj.y + 4, 0); const li = layerAt(tg.obj.x, tg.obj.y); for (let i = 0; i <= li; i++) drop('part', tg.obj.x + rand(-10, 10), tg.obj.y + 12, 1); burst(tg.obj.x, tg.obj.y, '#ffd28a', 16, 120); openChest(li); }
    else if (tg.kind === 'eye') summonBoss(tg.obj);
    else if (tg.kind === 'shrine') openShrine(tg.obj);
    else if (tg.kind === 'challenge') startChallenge(tg.obj);
    else if (tg.kind === 'greed') { tg.obj.used = true; S.greed = true; recalc(); sfx('horn'); addRing(tg.obj.x, tg.obj.y, 4 * M, '#e8c160', 0.6); banner('贪婪碑', '灰潮上涨 +25%。废料 ×1.5，柜子费用 −30%。', '#e8c160', 3); }
    else if (tg.kind === 'scav') openScav(tg.obj);
    else if (tg.kind === 'stone') { const d = STONES[tg.obj.type]; tg.obj.used = true; sfx('synergy'); addRing(tg.obj.x, tg.obj.y, 3 * M, d.col, 0.5); if (tg.obj.type === 'calm') S.tideFreeze = Math.max(S.tideFreeze || 0, 20); else if (S.buff && S.buff.k === tg.obj.type) S.buff.t += 30; else S.buff = { k: tg.obj.type, t: 30 }; recalc(); banner(d.name, d.text, d.col, 2.5); S.run.stones = (S.run.stones || 0) + 1; }
    else if (tg.kind === 'altar') { sfx('horn'); tg.obj.used = true; addRing(tg.obj.x, tg.obj.y, 4 * M, '#a99cc9', 0.6); openBless(['tide'], '灰潮在低语，选择一条祝福'); }
    else endRun('extract');
  }
  if (pEl.textContent !== msg) pEl.textContent = msg; pEl.classList.toggle('warn', warn);
}
const STAGES = [[0, '薄雾'], [30, '灰雾'], [60, '浓雾'], [85, '涨潮'], [100, '吞没']];
const stageOf = c => { let n = STAGES[0][1]; for (const [t, name] of STAGES) if (c >= t) n = name; return n; };
const tideRate = () => (S.conc >= 100 ? 1 / 2.5 : [1 / 6, 1 / 4, 1 / 2.5][layerAt(S.player.x, S.player.y)]) * (pact('surge') ? 1.3 : 1) * (S.greed ? 1.25 : 1) * (S.eyeDone && S.eyeDone.has(layerAt(S.player.x, S.player.y)) ? 0.7 : 1);
const lampDrop = () => 8 + 6 * bl('homeward');
function lowerTide(n) { const before = S.conc; S.conc = Math.max(0, S.conc - n); return before - S.conc; }
function chestCost(c) { return Math.round([10, 16, 24][layerAt(c.x, c.y)] * (1 + 0.25 * S.chestsOpened) * (S.greed ? 0.7 : 1)); }
function updTide(dt) {
  const p = S.player, li = layerAt(p.x, p.y), L = LAYERS[li];
  S.maxDepth = Math.max(S.maxDepth, li);
  const lamp = S.boss ? null : S.lamps.find(l => l.rep && l.store > 0 && (l.x - p.x) ** 2 + (l.y - p.y) ** 2 < (5 * M) ** 2);
  S.held = !S.boss && (!!lamp || inTemp(p.x, p.y));
  if (S.tideFreeze > 0) { S.tideFreeze -= dt; S.held = true; }
  else if (lamp) lamp.store = Math.max(0, lamp.store - dt);
  else if (S.held) {}
  else S.conc += tideRate() * dt * (1 + 0.25 * Math.min(4, S.nestNear)) * (S.boss && !S.boss.dead && d2(S.boss, p) < (5 * M) ** 2 ? 3 : 1);
  for (const [th, title, sub] of [[30, '灰雾', '烬影变多，灰蛾和蚀壳出现了'], [60, '浓雾', '怪潮从两个方向来，精英成群'], [85, '涨潮', '怪潮从三个方向来。该想想怎么回去了'], [100, '吞没', '光圈在收缩，敌人的伤害每过几秒就翻一截。现在就走'], [120, '吞没 · 120', '再待下去会死']]) {
    if (S.conc >= th && !S.stageSeen.has(th)) { S.stageSeen.add(th); if (th > 0) banner('灰潮 · ' + title, sub, th >= 100 ? '#ff5a4f' : '#c9b6ff', 3); }
  }
  // 光圈：灰潮越浓越小
  const c = S.conc; let r = D.lightBase;
  r *= c <= 100 ? 1 - 0.25 * c / 100 : Math.max(0.45, 0.75 - (c - 100) / 200);
  if (c >= 100) r *= 0.94 + 0.06 * Math.sin(S.t * 23) * Math.sin(S.t * 7);
  let dv = 0; for (const e of query(p.x, p.y, 3 * M)) if (e.elite && e.aff.includes('devour')) dv++;
  r *= Math.max(0.5, Math.pow(0.8, dv));
  if (p.lightBoostT > 0) r *= 1.5;
  S.lr = r;
  if (S.lamp === 'c_lamp' || S.lamp === 'm_lamp') S.lrSlow = stv(S.lamp, 'slow'); else S.lrSlow = 0;
}

