// ================= 三选一 =================
function optionPool() {
  const opts = [];
  if (isW()) {
    for (const id in NODES) if (nodeAvail(id)) opts.push({ kind: 'node', id, owned: nd(id) > 0 });
    if (stLvl('blade') < ST.blade.max) opts.push({ kind: 'skill', id: 'blade', owned: true });
    if (S.axe.edge) { if (stLvl('edge_' + S.axe.edge) < 10) opts.push({ kind: 'edge', id: S.axe.edge, owned: true }); if (S.player.lvl >= 6) opts.push({ kind: 'edge', id: pickU(EDGES.filter(k => k !== S.axe.edge)), owned: false }); }
    else shuffle(EDGES).slice(0, 2).forEach(k => opts.push({ kind: 'edge', id: k, owned: false }));
    const pc = Object.keys(S.passives).length;
    for (const id in PASSIVES) { if (id === 'capacitor' || id === 'curio' || id === 'swift2') continue; const l = plv(id); if (l) { if (l < 5) opts.push({ kind: 'passive', id, owned: true }); } else if (pc < passSlots()) opts.push({ kind: 'passive', id, owned: false }); }
    return opts.filter(o => !S.banned.has(o.kind + ':' + o.id));
  }
  { const gs = S.gods.length ? [...S.gods, 'fate'] : Object.keys(GODS); const out = []; for (const g of gs) out.push(...godCards(g)); return out; }
  const pc = Object.keys(S.passives).length;
  for (const id in PASSIVES) { const l = plv(id); if (l) { if (l < 5) opts.push({ kind: 'passive', id, owned: true }); } else if (pc < passSlots()) opts.push({ kind: 'passive', id, owned: false }); }
  return opts.filter(o => !S.banned.has(o.kind + ':' + o.id));
}
const defOf = o => o.kind === 'bl' ? { name: BL[o.id].name, tags: [TYPE_N[BL[o.id].type]] } : o.kind === 'aura' ? { name: AURA[o.id].name, tags: ['光环', AURA[o.id].type === 'dmg' ? '伤害型' : '辅助型'] } : o.kind === 'edge' ? { name: ST['edge_' + o.id].name, tags: ['普攻', { fire: '火', thunder: '电', frost: '冰', blunt: '击退', vamp: '生存', ash: '区域' }[o.id]] } : o.kind === 'skill' ? (o.id === 'blade' ? { name: '消防斧', tags: ['普攻', '伤害'] } : SKILLS[o.id]) : o.kind === 'node' ? { name: NODES[o.id].name, tags: treeOf(o.id).tags } : o.kind === 'mod' ? { name: modOf(o.id).name, tags: ['斧头改造'] } : PASSIVES[o.id];
function buildTags() { const t = new Set(); if (isW()) for (const k in TREES) if (treePts(k)) TREES[k].tags.forEach(x => t.add(x)); for (const s of S.skills) SKILLS[s.id].tags.forEach(x => t.add(x)); for (const id in S.passives) PASSIVES[id].tags.forEach(x => t.add(x)); return t; }
function wanted() { const w = new Set(); for (const s of S.skills) if (s.lvl >= 4 && !s.ignited) w.add(SKILLS[s.id].ignite); return w; }
const overlap = (o, tags) => defOf(o).tags.filter(x => tags.has(x)).length;
function rollBless(o) { const r = Math.random(); o.rar = r < 0.05 ? 2 : r < 0.30 ? 1 : 0; return o; }
const stIdOf = o => o.kind === 'aura' ? 'aura_' + o.id : o.kind === 'edge' ? 'edge_' + o.id : (o.kind === 'skill' || o.kind === 'node' || o.kind === 'bl') && ST[o.id] ? o.id : null;
const affixable = o => o.kind === 'skill' || o.kind === 'edge' || o.kind === 'aura' || o.kind === 'passive' || (o.kind === 'bl' && !!ST[o.id]) || (o.kind === 'node' && (NODES[o.id].max || 1) > 1);
function rollRarity(o, minR = 0) {
  if (!affixable(o)) { o.rar = -1; return o; }
  const L = 1 + (D.luck || 0), ps = [0, RAR[1].p * L + gearSum('rar1'), RAR[2].p * L * (pact('surge') ? 1.5 : 1) + gearSum('rar2'), RAR[3].p * L * (pact('surge') ? 2 : 1) + gearSum('rar3')]; ps[0] = S.lucky3 > 0 ? 0 : 1 - ps[1] - ps[2] - ps[3];
  let r = Math.random() * (ps[0] + ps[1] + ps[2] + ps[3]), i = 0; while (i < 3 && r >= ps[i]) { r -= ps[i]; i++; } o.rar = Math.max(minR, i);
  const id = stIdOf(o); if (id) { const owned = o.kind === 'aura' ? (S.auras || []).includes(o.id) : o.kind === 'edge' ? S.axe.edge === o.id : o.kind === 'bl' ? blHas(o.id) : o.kind === 'skill' ? (id === 'blade' || !!skillOf(id)) : nd(id) > 0; o.rolls = owned || o.rar > 0 ? rollAffixes(id, o.rar) : []; }
  return o;
}
function genChoices() {
  if (S.forceOpts) { const f = S.forceOpts; S.forceOpts = null; return f.map(o => rollRarity({ slot: '巩固', ...o }, o.minR || 0)); }
  if (S.forceMin) { const m = S.forceMin; S.forceMin = 0; if (!isW()) { if (!S.visit) S.visit = pickGod(null); S.keepGod = true; S.godHist.push(S.visit); } const pool0 = (isW() ? optionPool() : godCards(S.visit)).filter(affixable); const picks = shuffle(pool0).slice(0, 3).map(o => rollRarity({ ...o, slot: m >= 3 ? '诱惑' : '顺势' }, m)); if (picks.length) return picks; }
  if (!isW()) return genGodOffer();
  const pool = optionPool(); const key = o => o.kind + o.id;
  if (!pool.length) return [{ kind: 'res', id: 'calm', slot: '补给', rar: 0 }, { kind: 'res', id: 'heal', slot: '补给', rar: 0 }, { kind: 'res', id: 'parts', slot: '补给', rar: 0 }];
  const tags = buildTags(), want = wanted(); const res = [], used = new Set();
  if (S.firstChoice && isW()) {
    S.firstChoice = false;
    const ent = Object.keys(TREES).filter(t => !TREES[t].spec).map(t => ({ kind: 'node', id: TREES[t].nodes[0], owned: false }));
    const war = shuffle(ent.filter(o => treeOf(o.id).war)).slice(0, 1), rest = shuffle(ent.filter(o => !treeOf(o.id).war)).slice(0, hasT('four') ? 3 : 2);
    return [...war, ...rest].map(o => ({ ...o, slot: '顺势' })).map(rollRarity);
  }
  if (S.firstChoice) {
    S.firstChoice = false;
    const a = shuffle(pool.filter(o => o.kind === 'skill' && !o.owned)).slice(0, 2).map(o => ({ ...o, slot: '顺势' }));
    const b = shuffle(pool.filter(o => o.kind === 'passive' && !o.owned)).slice(0, 1).map(o => ({ ...o, slot: '诱惑' }));
    const first = [...a, ...b];
    if (hasT('four')) { const c = shuffle(pool.filter(o => !first.some(f => f.kind === o.kind && f.id === o.id))).slice(0, 1).map(o => ({ ...o, slot: '诱惑' })); first.push(...c); }
    return first.map(rollRarity);
  }
  const last = S.lastOffer || new Set(), fresh = pool.filter(o => !last.has(o.kind + o.id)); const pool1 = fresh.length >= 3 ? fresh : pool;
  const synW = o => { if (o.kind !== 'node') return 1; const sy = SYN.find(x => x.need.includes(o.id) && !S.syn.has(x.id)); if (!sy) return 1; const oth = sy.need.find(x => x !== o.id); return nd(oth) ? 3 : 1; };
  const owned = pool1.filter(o => o.owned);
  if (owned.length) { const o = pickW(owned, synW); res.push({ ...o, slot: '巩固' }); used.add(key(o)); }
  let cand = pool1.filter(o => !o.owned && !used.has(key(o)));
  if (!cand.length) cand = pool1.filter(o => !used.has(key(o)));
  if (cand.length) { const o = pickW(cand, o => (1 + 0.5 * overlap(o, tags)) * (o.kind === 'passive' && want.has(o.id) ? 3 : 1) * synW(o)); res.push({ ...o, slot: '顺势' }); used.add(key(o)); }
  cand = pool1.filter(o => !used.has(key(o)));
  if (cand.length) {
    const momentumMiss = res.length > 1 && overlap(res[res.length - 1], tags) === 0;
    const o = momentumMiss ? pickW(cand, o => (1 + 0.5 * overlap(o, tags)) * (o.kind === 'passive' && want.has(o.id) ? 3 : 1)) : pickU(cand);
    res.push({ ...o, slot: '诱惑' }); used.add(key(o));
  }
  if (want.size) {
    if (res.some(o => o.kind === 'passive' && want.has(o.id))) S.pity = 0;
    else if (++S.pity >= 5) { const o = pool.find(o => o.kind === 'passive' && want.has(o.id) && !used.has(key(o))); if (o) { res[res.length - 1] = { ...o, slot: '诱惑' }; S.pity = 0; } }
  }
  while (res.length < (hasT('four') ? 4 : 3)) { const c = pool.filter(o => !used.has(key(o))); if (!c.length) break; const o = pickW(c, o => 1 + 0.5 * overlap(o, tags)); res.push({ ...o, slot: '诱惑' }); used.add(key(o)); }
  res.forEach(rollRarity); S.lastOffer = new Set(res.map(key));
  const fill = [{ kind: 'res', id: 'calm', slot: '补给', rar: 0 }, { kind: 'res', id: 'heal', slot: '补给', rar: 0 }, { kind: 'res', id: 'parts', slot: '补给', rar: 0 }];
  while (res.length < 3) res.push(fill[res.length]);
  return res;
}
const _slotChip = { 改造: 'rar2' };
const RES = { calm: ['镇潮符', '灰潮浓度 −10'], heal: ['急救包', '回复 30% 生命'], parts: ['零件箱', '背包 +2 零件'], scrap20: ['拆成废料', '光环已满，这个芯片换 20 废料'] };
function cardHTML(o, i) {
  const tags = buildTags(), want = wanted();
  let name, lvl = '', body = '', now = '', chips = [], rcol = o.rar === 4 ? '#ffd700' : o.rar >= 0 && affixable(o) ? RAR[o.rar].col : '#9aa3b5', afx = '';
  const slotCls = { 巩固: 'slot-c', 顺势: 'slot-m', 诱惑: 'slot-t', 补给: '', 改造: 'rar2', 科技: 'slot-k' }[o.slot];
  chips.push(`<span class="chip ${slotCls}">${o.slot}</span>`);
  if (o.rar >= 0 && o.rar < 4 && affixable(o)) chips.push(`<span class="chip ${RAR[o.rar].cls}">${RAR[o.rar].name}${o.rar ? ' ×' + RAR[o.rar].mul : ''}</span>`);
  const sid = stIdOf(o);
  if (sid) { const isNew = o.kind === 'aura' ? !(S.auras || []).includes(o.id) : o.kind === 'edge' ? S.axe.edge !== o.id : o.kind === 'bl' ? !blHas(o.id) : o.kind === 'node' ? !nd(sid) : (sid !== 'blade' && !skillOf(sid)); afx = (isNew ? `<div class="afx base">基础：${stSummary(sid)}</div>` : '') + (o.rolls && o.rolls.length ? afxLines(sid, o.rolls) : '') + afxPool(sid, o.rolls); }
  if (o.kind === 'aura') {
    const A = AURA[o.id], mine = (S.auras || []).includes(o.id), l = stLvl('aura_' + o.id); name = A.name + '光环'; lvl = mine ? `灯核光环 · Lv ${l} → ${l + 1}` : `新光环 · ${A.type === 'dmg' ? '伤害型' : '辅助型'}`; body = A.text;
    chips.unshift(`<span class="chip need">光环</span>`);
    if (!mine) { const S2 = { dmg: auraCnt('dmg') + (A.type === 'dmg'), sup: auraCnt('sup') + (A.type === 'sup') }; const r = AURA_RES.find(r => !auraRes(r.id) && (r.id === 'dmg2' ? S2.dmg >= 2 : r.id === 'sup2' ? S2.sup >= 2 : S2.dmg >= 1 && S2.sup >= 1)); now = `占 1 个光环位（${(S.auras || []).length}/${auraSlots()}）` + (r ? `。拿了触发「${r.name}」：${r.text}` : ''); }
    if (A.type === 'sup') { const diff = whatIf(() => { S.auras = [...(S.auras || [])]; if (!mine) S.auras.push(o.id); S.st = JSON.parse(JSON.stringify(S.st || {})); applyRolls('aura_' + o.id, o.rolls); }); if (diff) afx = diff; }
  } else if (o.kind === 'edge') {
    const id = 'edge_' + o.id, mine = S.axe.edge === o.id, l = stLvl(id); name = stName(id); lvl = mine ? `普攻效果 · Lv ${l} → ${l + 1}` : '新普攻效果'; body = AXEMODS.edge.opts[o.id].text;
    chips.unshift(`<span class="chip need">普攻</span>`);
    if (!mine && S.axe.edge) now = `替换现在的「${stName('edge_' + S.axe.edge)} Lv ${stLvl('edge_' + S.axe.edge)}」。普攻同一时间只能有一种效果`;
    else if (!mine) now = '普攻同一时间只能有一种效果，之后可以继续升级它';
  } else if (o.kind === 'bl') {
    const d = BL[o.id], cur = blLvl(o.id), G = GODS[d.god];
    name = d.name; lvl = d.type === 'legend' ? '传奇 · 只有 1 级，改变玩法' : cur ? `${TYPE_N[d.type]} · Lv ${cur} → ${cur + 1}` : `新${TYPE_N[d.type]} · Lv 1`;
    body = blText(o.id);
    chips.unshift(`<span class="chip need" style="background:${G.col}">${G.name.split(' ')[0]}</span>`);
    if (d.type === 'legend') chips.push(`<span class="chip r4">传奇</span>`);
    if (!cur && d.type !== 'legend') { const cap = SLOT_CAP[d.type]; now = cap ? `占 1 个${TYPE_N[d.type]}槽（${slotUsed(d.type)}/${cap}）` : ''; if (d.type === 'atk' && S.atk) now = `替换现在的「${BL[S.atk].name} Lv ${blLvl(S.atk)}」`; if (d.type === 'lamp' && S.lamp) now = `替换现在的「${BL[S.lamp].name} Lv ${blLvl(S.lamp)}」`; }
    if (!S.gods.includes(d.god) && d.god !== 'fate') now += (now ? '。' : '') + (S.gods.length < 3 ? `拿了就和 ${G.name} 结缘（${S.gods.length + 1}/3）` : '');
  } else if (o.kind === 'skill' && o.id === 'blade') {
    const cur = stLvl('blade'); name = '消防斧 · 普攻'; lvl = `Lv ${cur + 1} → ${cur + 2}`; body = ST.blade.desc + '。词条作用于每一次斧击（包括终结技和投出去的斧头）';
  } else if (o.kind === 'skill') {
    const d = SKILLS[o.id], s = skillOf(o.id), cur = s ? s.lvl : 0, nx = cur + 1;
    name = d.name; lvl = cur ? `Lv ${cur} → ${nx}` : `新技能 · Lv 1`;
    body = d.base;
    if (cur < 3 && nx >= 3) now = `到 3 级选分支：${d.A[0]} / ${d.B[0]}`;
    if (nx === 5) now = `满级。持有「${PASSIVES[d.ignite].name}」即点燃为「${d.form}」`;
    else if (!now) now = `点燃需要：5 级 +「${PASSIVES[d.ignite].name}」`;
  } else if (o.kind === 'passive') {
    const d = PASSIVES[o.id], cur = plv(o.id), pts = lv(o.id), np = pts + RAR[Math.max(0, o.rar)].mul;
    if (d.god) chips.unshift(`<span class="chip need" style="background:${GODS[d.god].col}">${GODS[d.god].name.split(' ')[0]}</span>`);
    name = d.name; lvl = cur ? `Lv ${cur} → ${cur + 1}` : `新被动 · Lv 1`; body = d.text(np);
    const diff = whatIf(() => { S.pval = S.pval || {}; S.pval[o.id] = np; S.passives[o.id] = cur + 1; });
    afx = diff || (cur ? `<div class="afx now2"><span>现在</span><b>${tidy(d.text(pts))}</b></div>` : '');
    const ak = PAFX[o.id]; if (ak) { const hit = ownedST().filter(id => ST[id].s[ak]).map(stName); afx += `<div class="pool"><span class="pl">影响</span>${hit.length ? hit.map(x => `<span class="pk on">${x}</span>`).join('') : '<span class="pk">还没有带「' + AFX[ak].name + '」词条的技能</span>'}</div>`; }
    const users = S.skills.length ? Object.keys(SKILLS).filter(k => SKILLS[k].ignite === o.id).map(k => SKILLS[k].name) : [];
    now = users.length ? `是「${users.join('、')}」的点燃条件` : (PASSIVES[o.id].hint || '');
    if (want.has(o.id)) chips.push('<span class="chip need">点燃所需</span>');
  } else if (o.kind === 'node') {
    const N = NODES[o.id], T = treeOf(o.id), [e, b1, b2, cap] = T.nodes, cur = nd(o.id), mx = N.max || 1, nx = Math.min(mx, cur + 1);
    name = N.name; body = N.text(mx > 1 && !ST[o.id] ? npt(o.id) + RAR[Math.max(0, o.rar)].mul : nx);
    if (mx > 1 && !ST[o.id]) { const np2 = npt(o.id) + RAR[Math.max(0, o.rar)].mul; afx = whatIf(() => { S.npt = S.npt || {}; S.npt[o.id] = np2; S.nodes[o.id] = cur + 1; }) || (cur ? `<div class="afx now2"><span>现在</span><b>${tidy(N.text(npt(o.id)))}</b></div>` : ''); }
    else if (o.id === 'crit' && !cur) afx = whatIf(() => { S.nodes.crit = 1; });
    if (mx > 1 && !ST[o.id]) { const ak = NAFX[o.id]; if (ak) { const hit = ownedST().filter(id => ST[id].s[ak]).map(stName); afx += `<div class="pool"><span class="pl">影响</span>${hit.map(x => `<span class="pk on">${x}</span>`).join('') || '<span class="pk">—</span>'}</div>`; } }
    lvl = mx > 1 ? (cur ? `Lv ${cur} → ${nx}` : `进入「${T.name}」树 · Lv 1`) : (o.id === cap ? '终极节点' : '分支节点');
    chips.unshift(`<span class="chip need">${T.name}${T.war ? ' · 战技' : ''}</span>`);
    if (o.id === e && !cur) now = `解锁分支：${NODES[b1].name}、${NODES[b2].name}` + (T.war ? `。战技最多两个（已有 ${warTrees()}）` : '');
    else if (o.id === b1 || o.id === b2) { const other = o.id === b1 ? b2 : b1; now = nd(other) ? `拿了就解锁终极「${NODES[cap].name}」` : `再拿「${NODES[other].name}」解锁终极「${NODES[cap].name}」`; }
    const sy = SYN.find(x => x.need.includes(o.id) && !S.syn.has(x.id));
    if (sy) { const oth = sy.need.find(x => x !== o.id); now += (now ? '。' : '') + (nd(oth) ? `拿了就触发协同「${sy.name}」` : `协同「${sy.name}」还需「${NODES[oth].name}」`); }
  } else if (o.kind === 'mod') {
    const m = modOf(o.id);
    name = m.name; lvl = '斧头改造 · ' + AXEMODS[m.slot].label; body = m.text; now = `替换现在的「${axeName(m.slot)}」`;
    if (S.spec && m.slot === 'atk') now += `。${SPECS[S.spec].short}共鸣：${SPECS[S.spec].reso[m.k]}`;
  } else { name = RES[o.id][0]; body = RES[o.id][1]; }
  if (o.kind !== 'res') for (const t of defOf(o).tags) chips.push(`<span class="chip${tags.has(t) ? ' tagm' : ''}">${t}</span>`);
  return `<button class="card" data-i="${i}" style="--r:${rcol}"><div class="head"><span class="name">${name}</span><span class="key">${i + 1}</span></div>${lvl ? `<div class="lvl">${lvl}</div>` : ''}<div class="chips">${chips.join('')}</div><p>${tidy(body)}</p>${afx ? `<div class="afxbox">${afx}</div>` : ''}${now ? `<p class="now">${now}</p>` : ''}</button>`;
}
let current = null;
function showPanel(html, onPick, choiceMeta) {
  const ov = $('#overlay'); ov.innerHTML = html; ov.classList.add('on'); mode = 'choice';
  current = { onPick, t0: performance.now(), meta: choiceMeta };
  ov.querySelectorAll('.card').forEach(b => b.addEventListener('click', () => pickCard(+b.dataset.i)));
  const f = ov.querySelector('.card'); if (f) f.focus({ preventScroll: true });
}
function pickCard(i) { sfx('pick');
  if (!current) return; const c = current; const n = c.meta.options.length; if (i < 0 || i >= n) return;
  current = null;
  const dwell = (performance.now() - c.t0) / 1000;
  S.run.choices.push({ kind: c.meta.kind, t: +S.t.toFixed(1), dwell: +dwell.toFixed(2), options: c.meta.options.map(o => (o.kind || '') + ':' + o.id + (o.rar ? '+' + o.rar : '')), slots: c.meta.options.map(o => o.slot || ''), picked: i, pickedSlot: c.meta.options[i].slot || '' });
  $('#overlay').classList.remove('on'); mode = 'play';
  c.onPick(i);
  hudDirty = true;
  afterChoice();
}
function afterChoice() {
  if (mode !== 'play') return;
  if (S.branchQueue.length) return openBranch(S.branchQueue.shift());
  if (S.pendingLv > 0) return openLevel();
  if (S.pendingChip > 0) return openChip();
}
function openLevel() {
  if (window.__bot && window.__botFast) { S.pendingLv--; const o = genChoices(); applyOption(botPick(o)); return; }
  const opts = genChoices();
  if (S.lucky3 > 0) S.lucky3--;
  const keysTxt = opts.map((_, i) => i + 1).join(' / ');
  const tools = `<div class="row-btns"><button class="btn ghost" id="skip">跳过这次升级（+8 废料）</button>${!isW() && S.alts > 0 ? `<button class="btn ghost" id="alt">换一位灯魂（Q）· 剩 ${S.alts}</button>` : ''}${S.rerolls ? `<button class="btn ghost" id="rr">重随整组（R）· 剩 ${S.rerolls}</button>` : ''}${S.bans ? opts.filter(o => o.kind !== 'res').map((o, i) => `<button class="btn ghost ban" data-b="${opts.indexOf(o)}">禁用「${defOf(o).name}」</button>`).join('') + `<span class="hint">禁用剩 ${S.bans} 次：这张卡本局不再出现</span>` : ''}</div>`;
  const head = isW() ? `<div class="sub">巩固 = 升级已有 · 顺势 = 和你的标签契合 · 诱惑 = 另一条路。按 ${keysTxt} 或点击。游戏已暂停。</div>` : `<div class="sub">${GODS[S.visit].name} 来访：${hasT('four') ? '四' : '三'}张卡都是${GODS[S.visit].pr}的。巩固 = 升级已有 · 顺势 = 新祝福。按 ${keysTxt} 或点击${S.alts > 0 ? '，Q 换一位灯魂' : ''}。</div>`;
  showPanel(`<div class="panel"><div><div class="title">LEVEL ${S.player.lvl - S.pendingLv + 1}</div><h2>${isW() ? '选一个' : '灯魂来访'}</h2>${head}</div>${isW() ? '' : godHead(S.visit)}<div class="cards">${opts.map(cardHTML).join('')}</div>${tools}</div>`,
    i => { S.pendingLv--; applyOption(opts[i]); }, { kind: 'level', options: opts });
  const rr = $('#rr'); if (rr) rr.onclick = doReroll; const al = $('#alt'); if (al) al.onclick = doAlter;
  const sk = $('#skip'); if (sk) sk.onclick = () => { if (!current) return; current = null; S.pendingLv--; S.loot.scrap += 8; S.run.choices.push({ kind: 'skip', t: +S.t.toFixed(1) }); $('#overlay').classList.remove('on'); mode = 'play'; addNum(S.player.x, S.player.y - 14, 0, '#a19582'); nums[nums.length - 1].v = '+8 废料'; afterChoice(); };
  document.querySelectorAll('.ban').forEach(b => b.onclick = () => doBan(opts[+b.dataset.b]));
  if (window.__bot) setTimeout(() => pickCard((Math.random() * 3) | 0), 0);
}
function doReroll() {
  if (!current || current.meta.kind !== 'level' || S.rerolls <= 0) return;
  S.rerolls--; S.run.rerollsUsed++; S.run.choices.push({ kind: 'reroll', t: +S.t.toFixed(1), dwell: +((performance.now() - current.t0) / 1000).toFixed(2), options: current.meta.options.map(o => (o.kind || '') + ':' + o.id) });
  if (!isW()) S.keepGod = true; current = null; openLevel();
}
function doBan(o) {
  if (!current || S.bans <= 0 || !o) return;
  S.bans--; S.run.bansUsed++; S.banned.add(o.kind + ':' + o.id); S.run.choices.push({ kind: 'ban', t: +S.t.toFixed(1), banned: o.kind + ':' + o.id });
  if (!isW()) S.keepGod = true; current = null; openLevel();
}
function applyRolls(id, rolls) { const st = stInit(id); st.lvl++; for (const r of rolls || []) st.v[r.k] = r.to; }
function applyOption(o) {
  const mul = o.rar >= 0 ? RAR[o.rar].mul : 1;
  if (o.kind === 'skill' && o.id === 'blade') applyRolls('blade', o.rolls);
  else if (o.kind === 'skill') {
    let s = skillOf(o.id); if (!s) { s = { id: o.id, lvl: 0, branch: null, ignited: false, t: 0.3, t2: 0 }; S.skills.push(s); }
    s.lvl++; if (s.lvl === 3 && !s.branch) S.branchQueue.push(s.id); applyRolls(o.id, o.rolls);
  } else if (o.kind === 'passive') { S.pval = S.pval || {}; S.pval[o.id] = lv(o.id) + mul; S.passives[o.id] = plv(o.id) + 1; if (!isW()) { if (PASSIVES[o.id].god) lockGod(PASSIVES[o.id].god); if (o.id === 'curio') S.alts++; } }
  else if (o.kind === 'bl') takeBless(o);
  else if (o.kind === 'node') { const mx = NODES[o.id].max || 1; if (mx > 1 && !ST[o.id]) { S.npt = S.npt || {}; S.npt[o.id] = npt(o.id) + mul; } S.nodes[o.id] = Math.min(mx, nd(o.id) + 1); if (ST[o.id]) applyRolls(o.id, o.rolls); (S.run.nodes = S.run.nodes || []).push({ id: o.id, t: +S.t.toFixed(1) }); }
  else if (o.kind === 'aura') { S.auras = S.auras || []; if (!S.auras.includes(o.id)) { S.auras.push(o.id); banner('光环：' + AURA[o.id].name, AURA[o.id].text, AURA[o.id].col); sfx('synergy'); } applyRolls('aura_' + o.id, o.rolls); }
  else if (o.kind === 'edge') { if (S.axe.edge !== o.id) { S.axe.edge = o.id; banner('普攻效果：' + stName('edge_' + o.id), AXEMODS.edge.opts[o.id].text, EDGE_COL[o.id]); } applyRolls('edge_' + o.id, o.rolls); }
  else if (o.kind === 'mod') { const m = modOf(o.id); S.axe[m.slot] = m.k; S.run.mods.push({ id: o.id, t: +S.t.toFixed(1) }); banner(AXEMODS[m.slot].label + '：' + m.name, m.text, AXE.color); }
  else if (o.id === 'calm') lowerTide(10);
  else if (o.id === 'heal') S.player.hp = Math.min(D.maxHp, S.player.hp + 0.3 * D.maxHp);
  else if (o.id === 'parts') S.loot.part += 2;
  else if (o.id === 'scrap20') S.loot.scrap += 20;
  recalc(); checkIgnite(); if (isW()) checkSyn();
  if (window.__bot && window.__botFast) { while (S.branchQueue.length) { const id = S.branchQueue.shift(); skillOf(id).branch = Math.random() < 0.5 ? 'A' : 'B'; S.run.branches.push({ skill: id, branch: skillOf(id).branch, t: +S.t.toFixed(1) }); } }
}
function openBranch(id) {
  const d = SKILLS[id];
  const opts = [{ id: 'A', slot: '' }, { id: 'B', slot: '' }];
  const html = `<div class="panel"><div><div class="title">BRANCH</div><h2>${d.name} 到 3 级：选一条分支</h2><div class="sub">不可逆。按 1 / 2 或点击。</div></div><div class="cards">${['A', 'B'].map((k, i) => `<button class="card" data-i="${i}" style="--r:#7fb8ff"><div class="head"><span class="name">${d[k][0]}</span><span class="key">${i + 1}</span></div><p>${d[k][1]}</p></button>`).join('')}</div></div>`;
  showPanel(html, i => { const s = skillOf(id); s.branch = i ? 'B' : 'A'; S.run.branches.push({ skill: id, branch: s.branch, t: +S.t.toFixed(1) }); slowT = 0.5; banner(d.name + ' · ' + d[s.branch][0], '', '#bfe6ff'); }, { kind: 'branch', options: opts.map(o => ({ ...o, kind: id })) });
  if (window.__bot) setTimeout(() => pickCard((Math.random() * 2) | 0), 0);
}
function checkIgnite() {
  for (const s of S.skills) {
    const d = SKILLS[s.id];
    if (!s.ignited && s.lvl >= 5 && lv(d.ignite) > 0) {
      s.ignited = true; S.run.ignitions.push({ skill: s.id, form: d.form, t: +S.t.toFixed(1) });
      sfx('synergy'); banner('点燃：' + d.form, d.formText, '#ffffff'); slowT = 1; S.flashes = S.flashes || []; S.flashes.push({ x: S.player.x, y: S.player.y, r: 12 * M, t: 0.5 }); S.shake = 8;
    }
  }
}
function openBless(voices, title) {
  const pool = Object.keys(BLESS).filter(id => voices.includes(BLESS[id].v) && bl(id) < (BLESS[id].max || 3));
  let opts;
  if (voices.length > 1) { const a = shuffle(pool.filter(id => BLESS[id].v === voices[0])).slice(0, 1), b = shuffle(pool.filter(id => BLESS[id].v === voices[1])).slice(0, 1); const rest = shuffle(pool.filter(id => !a.includes(id) && !b.includes(id))).slice(0, 1); opts = [...a, ...b, ...rest]; }
  else opts = shuffle(pool).slice(0, 3);
  opts = opts.map(id => rollBless({ kind: 'bless', id })); opts.forEach(o => { if ((BLESS[o.id].max || 3) - bl(o.id) <= 1) o.rar = 0; });
  if (!opts.length) return;
  if (window.__bot && window.__botFast) { const o = pickU(opts), d = BLESS[o.id]; S.bless[o.id] = Math.min(d.max || 3, bl(o.id) + 1 + o.rar); recalc(); return; }
  const html = `<div class="panel"><div><div class="title">BLESSING</div><h2>${title}</h2><div class="sub">祝福改规则，不占槽，同一条最多叠 3 层。稀有 = 一次 2 层，传奇 = 3 层。</div></div><div class="cards">${opts.map((o, i) => {
    const d = BLESS[o.id], cur = bl(o.id), nx = Math.min(d.max || 3, cur + 1 + o.rar), vc = VOICES[d.v];
    return `<button class="card" data-i="${i}" style="--r:${vc[1]}"><div class="head"><span class="name">${d.name}</span><span class="key">${i + 1}</span></div><div class="chips"><span class="chip" style="color:${vc[1]}">${vc[0]}</span>${o.rar === 1 ? '<span class="chip rar1">稀有</span>' : o.rar === 2 ? '<span class="chip rar2">传奇</span>' : ''}</div><div class="lvl">${cur ? `${cur} 层 → ${nx} 层` : `${nx} 层`}</div><p>${d.text(nx)}</p></button>`;
  }).join('')}</div></div>`;
  showPanel(html, i => { const o = opts[i], d = BLESS[o.id]; S.bless[o.id] = Math.min(d.max || 3, bl(o.id) + 1 + o.rar); recalc(); if (o.id === 'shell' && S.player.hp > D.maxHp) S.player.hp = D.maxHp; }, { kind: 'bless', options: opts.map(o => ({ ...o, slot: BLESS[o.id].v })) });
  if (window.__bot) setTimeout(() => pickCard((Math.random() * opts.length) | 0), 0);
}

