// ================= 装备（学 DMD：倒下也带得回去的东西；在工坊换装） =================
// 临时石碑（学 DMD 的 30 秒神龛）：碰一下，30 秒加成
const STONES = { xp: { name: '求知石', col: '#8fe6a6', text: '30 秒内经验 +60%' }, pull: { name: '收集石', col: '#c4a8ff', text: '30 秒内拾取范围无限' }, power: { name: '威能石', col: '#ff9a4a', text: '30 秒内伤害 +60%' }, calm: { name: '镇潮石', col: '#9fe8ff', text: '20 秒内灰潮停涨' }, haste: { name: '疾风石', col: '#ffe08a', text: '30 秒内攻速 +40%、移速 +20%' } };
const GEAR_SLOTS = { lantern: '提灯', coat: '外套', boots: '靴子', ring: '戒指', charm: '护符' };
const GEAR_BASE = { lantern: ['铜提灯', '风灯', '矿灯', '马灯'], coat: ['雨衣', '工装', '斗篷', '旧大衣'], boots: ['胶靴', '军靴', '登山靴', '草鞋'], ring: ['铜戒', '铁戒', '骨戒', '玻璃戒'], charm: ['铜牌', '骨符', '平安结', '旧照片'] };
const GEAR_AFX = {
  hp: { name: '生命上限', pre: '厚实的', v: [8, 18], f: v => '+' + Math.round(v) }, armor: { name: '护甲', pre: '加固的', v: [1, 2.5], f: v => '+' + (Math.round(v * 10) / 10) },
  dmg: { name: '伤害', pre: '锋利的', v: [0.05, 0.14], f: v => '+' + Math.round(v * 100) + '%' }, aspd: { name: '攻速', pre: '轻快的', v: [0.05, 0.14], f: v => '+' + Math.round(v * 100) + '%' },
  cd: { name: '冷却缩减', pre: '回路的', v: [0.04, 0.1], f: v => '+' + Math.round(v * 100) + '%' }, area: { name: '范围', pre: '广角的', v: [0.05, 0.14], f: v => '+' + Math.round(v * 100) + '%' },
  speed: { name: '移速', pre: '疾行的', v: [0.04, 0.1], f: v => '+' + Math.round(v * 100) + '%' }, pickup: { name: '拾取范围', pre: '磁性的', v: [0.15, 0.45], f: v => '+' + Math.round(v * 100) + '%' },
  xp: { name: '经验', pre: '求知的', v: [0.05, 0.15], f: v => '+' + Math.round(v * 100) + '%' }, luck: { name: '幸运', pre: '幸运的', v: [0.1, 0.3], f: v => '+' + Math.round(v * 100) + '%' },
  scrap: { name: '废料获取', pre: '拾荒者的', v: [0.1, 0.3], f: v => '+' + Math.round(v * 100) + '%' }, regen: { name: '生命回复', pre: '温热的', v: [0.002, 0.005], f: v => '+' + (v * 100).toFixed(1) + '%/秒' },
  rr: { name: '重随', pre: '骰子的', v: [1, 1], int: true, f: v => '+' + v }, ban: { name: '禁用', pre: '封印的', v: [1, 1], int: true, f: v => '+' + v },
  rar1: { name: '罕见出现率', pre: '稀世的', v: [0.05, 0.15], f: v => '+' + Math.round(v * 100) + '%' }, rar2: { name: '稀有出现率', pre: '珍藏的', v: [0.03, 0.08], f: v => '+' + Math.round(v * 100) + '%' }, rar3: { name: '传说出现率', pre: '传世的', v: [0.01, 0.03], f: v => '+' + Math.round(v * 100) + '%' },
};
const GEAR_UNIQ = { lantern: ['长明', '光圈 +20%，圈内敌人受到的伤害 +10%'], coat: ['余温', '受伤后无敌时间 +0.4 秒'], boots: ['不停', '移动时伤害 +10%'], ring: ['第四张牌', '升级时变成四选一'], charm: ['回光', '每局第一次倒下时满血复活'] };
const GEAR_RAR = [{ name: '普通', n: 1, col: '#9aa3b5' }, { name: '罕见', n: 2, col: '#6fdc8c' }, { name: '稀有', n: 3, col: '#6fb7ff' }, { name: '传说', n: 4, col: '#ffb454' }];
function gearRoll(minR) {
  const L = 1 + (D.luck || 0), r = Math.random(); let rar = r < 0.03 * L ? 3 : r < 0.15 * L ? 2 : r < 0.45 * L ? 1 : 0; rar = Math.max(rar, minR || 0);
  const slot = pickU(Object.keys(GEAR_SLOTS)), n = GEAR_RAR[rar].n, keys = shuffle(Object.keys(GEAR_AFX)).filter(k => !(rar < 2 && k === 'rar3')).slice(0, n);
  const afx = keys.map(k => { const A = GEAR_AFX[k], q = 0.4 + 0.6 * Math.random() * (0.7 + 0.3 * rar); let v = A.v[0] + (A.v[1] - A.v[0]) * Math.min(1, q); if (A.int) v = Math.round(v); else v = Math.round(v * 1000) / 1000; return { k, v }; });
  const main = afx.slice().sort((a, b) => (GEAR_AFX[b.k].v[0] ? b.v / GEAR_AFX[b.k].v[1] : 0) - (GEAR_AFX[a.k].v[0] ? a.v / GEAR_AFX[a.k].v[1] : 0))[0];
  const base = pickU(GEAR_BASE[slot]);
  const name = rar === 3 ? GEAR_UNIQ[slot][0] + '·' + base : GEAR_AFX[main.k].pre + base;
  return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), slot, rar, name, afx, uniq: rar === 3 ? slot : null };
}
const gearEq = () => (META.gear && META.gear.eq) || {};
const gearU = slot => { const it = gearEq()[slot]; return !!(it && it.uniq); };
function gearSum(k) { let n = 0; for (const s in gearEq()) { const it = gearEq()[s]; if (!it) continue; for (const a of it.afx) if (a.k === k) n += a.v; } return n; }
function gearApply(add, mul) {
  for (const s in gearEq()) { const it = gearEq()[s]; if (!it) continue; const n = '装备·' + it.name;
    for (const a of it.afx) { if (a.k === 'hp') add('maxHp', a.v, n); else if (a.k === 'armor') add('armor', a.v, n); else if (a.k === 'dmg') add('dmg', a.v, n); else if (a.k === 'aspd') add('aspd', a.v, n); else if (a.k === 'cd') mul('cdMul', 1 - a.v, n); else if (a.k === 'area') add('area', a.v, n); else if (a.k === 'speed') mul('speed', 1 + a.v, n); else if (a.k === 'pickup') mul('pickup', 1 + a.v, n); else if (a.k === 'xp') add('xp', a.v, n); else if (a.k === 'luck') add('luck', a.v, n); else if (a.k === 'scrap') add('scrap', a.v, n); else if (a.k === 'regen') add('regen', a.v, n); }
    if (it.uniq === 'lantern') mul('lightBase', 1.2, n); if (it.uniq === 'coat') add('ifr', 0.4, n); }
}
function gearHTMLItem(it, btns) {
  const R = GEAR_RAR[it.rar];
  return `<div class="gear" style="--r:${R.col}"><div class="gn"><b style="color:${R.col}">${it.name}</b> <span class="hint">${GEAR_SLOTS[it.slot]} · ${R.name}</span></div><div class="ga">${it.afx.map(a => `<span class="pk on">${GEAR_AFX[a.k].name} ${GEAR_AFX[a.k].f(a.v)}</span>`).join('')}${it.uniq ? `<span class="pk" style="color:#ffb454">${GEAR_UNIQ[it.uniq][1]}</span>` : ''}</div>${btns || ''}</div>`;
}
const gearScrap = it => [4, 10, 24, 60][it.rar];
function gearHTML() {
  const G = META.gear, eq = G.eq, slots = Object.keys(GEAR_SLOTS).map(s => eq[s] ? gearHTMLItem(eq[s], `<div class="row-btns"><button class="btn ghost gear-off" data-s="${s}">脱下</button></div>`) : `<div class="gear empty"><span class="hint">${GEAR_SLOTS[s]}：空</span></div>`).join('');
  const bag = G.bag.map((it, i) => gearHTMLItem(it, `<div class="row-btns"><button class="btn gear-on" data-i="${i}">穿上${eq[it.slot] ? '（替换）' : ''}</button><button class="btn ghost gear-sc" data-i="${i}">拆解 +${gearScrap(it)} 废料</button></div>`)).join('') || '<div class="hint">背包是空的。装备掉自 Boss（必掉）、金柜（必掉）、精英和储物柜；倒下也带得回来。</div>';
  return `<div class="box"><h3>装备 · 穿在身上的 ${Object.values(eq).filter(Boolean).length}/5</h3><div class="gears">${slots}</div></div><div class="box"><h3>背包 ${G.bag.length}/20</h3><div class="gears">${bag}</div></div>`;
}
function gearBind() {
  document.querySelectorAll('.gear-on').forEach(b => b.onclick = () => { const it = META.gear.bag.splice(+b.dataset.i, 1)[0]; if (!it) return; const old = META.gear.eq[it.slot]; if (old) META.gear.bag.push(old); META.gear.eq[it.slot] = it; saveMeta(); titleScreen(); });
  document.querySelectorAll('.gear-off').forEach(b => b.onclick = () => { const it = META.gear.eq[b.dataset.s]; if (!it) return; META.gear.eq[b.dataset.s] = null; META.gear.bag.push(it); saveMeta(); titleScreen(); });
  document.querySelectorAll('.gear-sc').forEach(b => b.onclick = () => { const it = META.gear.bag.splice(+b.dataset.i, 1)[0]; if (!it) return; META.scrap += gearScrap(it); saveMeta(); titleScreen(); });
}
function gearPickup(it) {
  const G = META.gear, R = GEAR_RAR[it.rar]; S.run.gear = (S.run.gear || []).concat([{ name: it.name, rar: it.rar, slot: it.slot }]);
  const cur = G.eq[it.slot];
  if (!cur || cur.rar < it.rar) { if (cur) G.bag.push(cur); G.eq[it.slot] = it; recalc(); banner('穿上：' + it.name, it.afx.map(a => GEAR_AFX[a.k].name + ' ' + GEAR_AFX[a.k].f(a.v)).join(' · ') + (cur ? `（替换 ${cur.name}，旧的进背包）` : ''), R.col, 3.5); }
  else if (G.bag.length < 20) { G.bag.push(it); banner('捡到：' + it.name, it.afx.map(a => GEAR_AFX[a.k].name + ' ' + GEAR_AFX[a.k].f(a.v)).join(' · ') + ' · 放进背包，出征前在工坊换装', R.col, 3); }
  else { META.scrap += gearScrap(it); banner('背包满了：' + it.name + ' 拆成 ' + gearScrap(it) + ' 废料', '', R.col, 2); }
  sfx('level'); if (!window.__bot) saveMeta();
}
function dropGear(x, y, minR) { const it = gearRoll(minR); items.push({ kind: 'gear', x: x + rand(-6, 6), y: y + rand(-6, 6), v: 1, mag: false, t: 0, gear: it }); }

