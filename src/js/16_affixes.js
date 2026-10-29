// ================= 词条（学 Megabonk / PokeBonk） =================
// 每个主动技能有自己的词条池；升级时按稀有度从池里抽 1–3 条，稀有度只放大数值。被动和数值节点按稀有度放大增量。
const RAR = [
  { name: '普通', mul: 1, n: [1, 2], p: 0.62, col: '#9aa3b5', cls: 'r0' },
  { name: '罕见', mul: 1.25, n: [2, 2], p: 0.26, col: '#6fdc8c', cls: 'r1' },
  { name: '稀有', mul: 1.5, n: [2, 2], p: 0.09, col: '#6fb7ff', cls: 'r2' },
  { name: '传说', mul: 2, n: [3, 3], p: 0.03, col: '#ffb454', cls: 'r3' },
  { name: '传奇', mul: 2, n: [0, 0], p: 0, col: '#ffd700', cls: 'r4' },
];
const pcf = v => Math.round(v * 100) + '%', n1 = v => String(Math.round(v * 10) / 10);
const AFX = {
  dmg: { name: '伤害', f: n1 }, size: { name: '范围', f: pcf }, count: { name: '数量', f: v => String(Math.round(v)), int: true }, chain: { name: '弹射', f: v => String(Math.round(v)), int: true },
  dur: { name: '持续', f: v => v.toFixed(1) + ' 秒' }, cd: { name: '冷却', f: v => v.toFixed(2) + ' 秒' }, aspd: { name: '攻速', f: pcf }, spd: { name: '速度', f: pcf },
  crit: { name: '暴击率', f: pcf }, knock: { name: '击退', f: pcf }, stun: { name: '眩晕', f: v => v.toFixed(1) + ' 秒' }, charge: { name: '过载积累', f: v => '+' + pcf(v) }, chance: { name: '触发率', f: pcf }, slow: { name: '减速', f: pcf }, mspd: { name: '移速', f: v => '+' + pcf(v) }, shield: { name: '护盾', f: v => pcf(v) + ' 生命' }, pick: { name: '拾取范围', f: v => '+' + pcf(v) }, xp: { name: '经验', f: v => '+' + pcf(v) }, hpup: { name: '生命上限', f: v => '+' + pcf(v) }, heal: { name: '回血', f: v => (v * 100).toFixed(2) + '%' },
};
// [初始值, 普通档增量, 上限（冷却是下限）]
const ST = {
  blade: { name: '消防斧', sub: '普攻', max: 12, s: { dmg: [14, 3.5], size: [1, 0.08, 1.8], aspd: [1, 0.07, 2], crit: [0, 0.05, 0.6], knock: [1, 0.25, 3] }, desc: '自动劈砍身边的敌人，三下一个终结技' },
  whirl: { s: { dmg: [9, 2.8], size: [1, 0.12, 2.2], dur: [1.5, 0.25, 4], cd: [6, -0.4, 2.5], spd: [1, 0.15, 2.5] } },
  leap: { s: { dmg: [40, 12], size: [1, 0.12, 2.2], cd: [8, -0.6, 3], stun: [0.8, 0.15, 2] } },
  axe: { s: { dmg: [20, 5.5], count: [1, 1, 6], size: [1, 0.12, 2.2], spd: [1, 0.12, 2], cd: [2.4, -0.2, 1] } },
  torch: { s: { dmg: [8, 2.4], cd: [0.5, -0.04, 0.25], chain: [0, 1, 6], size: [1, 0.1, 2] } },
  coil: { s: { dmg: [10, 3], count: [2, 1, 8], size: [1, 0.12, 2.2], spd: [1, 0.15, 2.5] } },
  ground: { s: { dmg: [18, 5.5], size: [1, 0.12, 2.2], cd: [3, -0.25, 1.2], stun: [0.5, 0.1, 1.5] } },
  rod: { s: { dmg: [7, 2.1], count: [1, 1, 5], dur: [5, 1, 12], cd: [6, -0.5, 2.5] } },
  short: { s: { dmg: [15, 4.5], count: [3, 1, 8], cd: [2, -0.2, 0.6] } },
  edge_fire: { name: '燃斧', sub: '火焰', s: { chance: [0.35, 0.08, 1], dmg: [6, 2.2], dur: [2, 0.5, 6] }, lab: { dmg: '火焰伤害', dur: '燃烧时间' } },
  edge_thunder: { name: '雷斧', sub: '落雷', s: { chance: [0.18, 0.05, 0.7], dmg: [16, 5], count: [1, 1, 4], size: [1, 0.15, 2.2] }, lab: { dmg: '落雷伤害', count: '落雷数' } },
  edge_frost: { name: '霜斧', sub: '寒霜', s: { dur: [2, 0.4, 5], dmg: [14, 5], stun: [0.8, 0.2, 2], size: [1, 0.15, 2.2] }, lab: { dur: '减速时间', dmg: '碎冰伤害', stun: '冰冻' } },
  edge_blunt: { name: '钝斧', sub: '震荡', s: { dmg: [5, 1.8], size: [1, 0.15, 2.2], knock: [1.6, 0.3, 3] }, lab: { dmg: '冲击波伤害' } },
  edge_vamp: { name: '血斧', sub: '出血', s: { dmg: [1.6, 0.5], count: [5, 2, 15], heal: [0.003, 0.0012, 0.012] }, lab: { dmg: '每层每秒', count: '层数上限', heal: '命中回血' } },
  edge_ash: { name: '灰蚀斧', sub: '灰蚀', s: { chance: [0.4, 0.1, 1], dmg: [28, 9], size: [1, 0.15, 2.2], cd: [1.2, -0.1, 0.5] }, lab: { dmg: '爆发伤害', cd: '爆发延迟' } },
  aura_burn: { name: '灼光', s: { dmg: [4, 1.6], size: [1, 0.15, 2.2], chance: [0.1, 0.08, 0.6] }, lab: { dmg: '灼烧伤害', chance: '点燃率' } },
  aura_storm: { name: '雷环', s: { dmg: [12, 4], count: [2, 1, 8], cd: [1.2, -0.1, 0.4], size: [1, 0.15, 2.2] }, lab: { dmg: '电击伤害', count: '目标数', cd: '间隔' } },
  aura_frost: { name: '霜环', s: { slow: [0.25, 0.06, 0.6], dmg: [2.5, 1], size: [1, 0.15, 2.2] }, lab: { dmg: '寒气伤害' } },
  aura_mend: { name: '愈光', s: { heal: [0.006, 0.003, 0.03], hpup: [0.05, 0.04, 0.4] }, lab: { heal: '每秒回复' } },
  aura_haste: { name: '疾光', s: { aspd: [0.1, 0.05, 0.5], mspd: [0.06, 0.03, 0.3] }, fmt: { aspd: v => '+' + pcf(v) } },
  aura_ward: { name: '守光', s: { shield: [0.08, 0.03, 0.3], cd: [10, -1, 4] }, lab: { cd: '间隔' } },
  aura_lure: { name: '磁光', s: { pick: [0.6, 0.3, 3], xp: [0.06, 0.03, 0.4] } },
  tune: { s: { dmg: [0.3, 0.3], charge: [0.3, 0.3] }, lab: { dmg: '脉冲伤害' }, fmt: { dmg: v => '+' + pcf(v) } },
};
blInitST();
const stName = id => ST[id].name ? ST[id].name + (ST[id].sub && id.startsWith('edge_') ? ' · ' + ST[id].sub : '') : (SKILLS[id] ? SKILLS[id].name : NODES[id].name);
const afName = (id, k) => (ST[id].lab && ST[id].lab[k]) || AFX[k].name;
const afFmt = (id, k, v) => ((ST[id].fmt && ST[id].fmt[k]) || AFX[k].f)(v);
function stInit(id) { S.st = S.st || {}; if (!S.st[id]) { const v = {}; for (const k in ST[id].s) v[k] = ST[id].s[k][0]; S.st[id] = { lvl: 0, v }; } return S.st[id]; }
const stv = (id, k) => (S && S.st && S.st[id]) ? S.st[id].v[k] : ST[id].s[k][0];
const stLvl = id => (S.st && S.st[id]) ? S.st[id].lvl : 0;
const stCapped = (id, k, v) => { const [, st, lim] = ST[id].s[k]; return lim != null && (st < 0 ? v <= lim + 1e-6 : v >= lim - 1e-6); };
function rollAffixes(id, rar) {
  const R = RAR[rar], cur = k => stv(id, k);
  let keys = Object.keys(ST[id].s).filter(k => !stCapped(id, k, cur(k)));
  const n = Math.min(keys.length, R.n[0] + (R.n[1] > R.n[0] && Math.random() < 0.5 ? 1 : 0)), out = [];
  for (let i = 0; i < n; i++) { const k = pickW(keys, k => k === 'dmg' ? 2 : 1); keys = keys.filter(x => x !== k);
    const [, st, lim] = ST[id].s[k], from = cur(k); let to = from + (AFX[k].int ? (rar >= 3 ? 2 : 1) : st * R.mul); if (lim != null) to = st < 0 ? Math.max(lim, to) : Math.min(lim, to); out.push({ k, from, to }); }
  return out;
}
// 全局加成（"书"）：哪些被动 / 节点 / 祝福在放大这个词条
function gmods(k) {
  const g = [], f = (n, v) => g.push([n, v]);
  if (k === 'size' && D.area !== 1) f('范围', pcs(D.area));
  if (k === 'cd' && D.cdMul !== 1) f('冷却', '×' + D.cdMul.toFixed(2));
  if (k === 'knock' && D.knock !== 1) f('击退', pcs(D.knock));
  if (k === 'dmg') { if (isW()) f('等级', '×' + lvlScale().toFixed(2)); if (D.dmg !== 1) f('伤害', pcs(D.dmg)); }
  if ((k === 'aspd' || (k === 'cd' && !isW())) && D.aspd !== 1) f('攻速', pcs(D.aspd));
  if (k === 'crit') f('暴击', pcs(D.crit) + ' ×' + D.critDmg.toFixed(1));
  if (k === 'count' && D.count >= 1) f('数量', '+' + Math.floor(D.count + 1e-6));
  if ((k === 'dur' || k === 'stun') && D.dur !== 1) f('持续', pcs(D.dur));
  if (k === 'spd' && D.pspd !== 1) f('弹速', pcs(D.pspd));
  return g;
}
const PAFX = { amplify: 'size', circuit: 'cd', heavy: 'knock', power: 'dmg', haste: 'aspd', multi: 'count', linger: 'dur' }, NAFX = { might: 'dmg', swift: 'aspd' };
const tidy = t => String(t).replace(/\d+\.\d{2,}/g, m => String(Math.round(parseFloat(m) * 10) / 10));
function ownedST() { return isW() ? ['blade', ...['whirl', 'leap', 'axe'].filter(id => nd(id))] : ['atk', ...Object.keys(S.bl || {}).filter(id => ST[id])]; }
function afxLines(id, rolls) { return rolls.map(r => `<div class="afx"><span>${afName(id, r.k)}</span><b>${afFmt(id, r.k, r.from)} <i>→</i> ${afFmt(id, r.k, r.to)}</b></div>`).join(''); }
function afxPool(id, rolls) {
  const on = new Set((rolls || []).map(r => r.k)); const keys = Object.keys(ST[id].s);
  const g = [...new Set(keys.flatMap(k => gmods(k).map(([n, v]) => `${n} ${v}`)))];
  return `<div class="pool"><span class="pl">词条</span>${keys.map(k => `<span class="pk${on.has(k) ? ' on' : ''}">${afName(id, k)}</span>`).join('')}</div>` + (g.length ? `<div class="pool"><span class="pl">全局</span>${g.map(x => `<span class="pk g">${x}</span>`).join('')}</div>` : '');
}
const stSummary = id => Object.keys(ST[id].s).map(k => `${afName(id, k)} ${afFmt(id, k, stv(id, k))}`).join(' · ');


