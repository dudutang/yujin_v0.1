// ================= 角色属性（学 Megabonk：一张统一的属性表，被动、节点、祝福、誓约都往上加） =================
const pcs = v => Math.round(v * 100) + '%', sgn = v => (v >= 0 ? '+' : '−') + Math.abs(Math.round(v * 100)) + '%', mf = v => (v / M).toFixed(1) + ' 米';
const CSTAT = [
  ['maxHp', '生命上限', '生存', v => String(Math.round(v))], ['regen', '生命回复', '生存', v => (v * 100).toFixed(1) + '%/秒'], ['armor', '护甲', '生存', v => String(Math.round(v * 10) / 10)],
  ['evade', '闪避', '生存', pcs], ['leech', '吸血', '生存', pcs], ['ifr', '受伤无敌', '生存', v => v.toFixed(2) + ' 秒'],
  ['dmg', '伤害', '攻击', pcs], ['crit', '暴击率', '攻击', pcs], ['critDmg', '暴击伤害', '攻击', v => '×' + v.toFixed(2)], ['aspd', '攻速', '攻击', pcs],
  ['count', '数量', '攻击', v => '+' + Math.floor(v + 1e-6)], ['area', '范围', '攻击', pcs], ['dur', '持续', '攻击', pcs], ['cdMul', '冷却缩减', '攻击', v => sgn(1 - v).replace('+', '')],
  ['pspd', '弹速', '攻击', pcs], ['knock', '击退', '攻击', pcs], ['elite', '对精英伤害', '攻击', sgn], ['statd', '状态伤害', '攻击', sgn],
  ['speed', '移速', '功能', v => (v / M).toFixed(1) + ' 米/秒'], ['pickup', '拾取范围', '功能', mf], ['xp', '经验获取', '功能', pcs], ['lightBase', '光圈', '功能', mf], ['luck', '幸运', '功能', sgn], ['scrap', '废料获取', '功能', pcs],
];
const CLS = {
  arc: { name: '弧光师', color: '#9fe8ff', base: { maxHp: 110, regen: 0, armor: 1, evade: 0.04, leech: 0, ifr: 0.6, dmg: 1, crit: 0.05, critDmg: 2, aspd: 1, count: 0, area: 1.1, dur: 1, cdMul: 0.9, pspd: 1, knock: 1, elite: 0, statd: 0, speed: 4.1 * M, pickup: 2.8 * M, xp: 1, lightBase: 4.6 * M, luck: 0, scrap: 1 },
    traits: ['灯魂来访：每次升级一位灯魂来访，三张卡全是她的；一局最多结缘三位，命运不占名额', '弧光焊枪：自动向最近敌人放电弧（感电 45%）；普攻改造和击发都挂在它上面', '光圈放电：光圈里的敌人每 0.5 秒受伤并减速；灯芯决定光圈施加哪种状态', '过载：任何技能命中积累过载，满 100 放一次棱光脉冲，曝光圈内所有敌人', '身板薄：生命 110、护甲 1，但范围 +10%、冷却 −10%、光圈更大'] },
  warrior: { name: '破障者', color: '#ffb454', base: { maxHp: 120, regen: 0.004, armor: 2, evade: 0, leech: 0, ifr: 0.6, dmg: 1, crit: 0.05, critDmg: 2, aspd: 1, count: 0, area: 1, dur: 1, cdMul: 1, pspd: 1, knock: 1.25, elite: 0, statd: 0, speed: 3.9 * M, pickup: 2.6 * M, xp: 1, lightBase: 4 * M, luck: 0, scrap: 1 },
    traits: ['喘息：3 秒没挨打，生命回复升到 2.5%/秒', '硬直：每一斧都让敌人顿住、推开半步，顿住的敌人不咬人', '怒气：命中积累怒气，满 100 狂暴 6 秒（攻速 +40%、伤害 +20%）', '身板厚：生命 120、护甲 2、击退 +25%，但走得慢一点'] },
};
let DSRC = {};
function recalc() {
  const p = S.player, old = D.maxHp || 100, B = CLS[S.cls || 'arc'].base, v = { ...B }, src = {};
  for (const k in B) src[k] = [['职业基础', CSTAT.find(c => c[0] === k)[3](B[k])]];
  const dfmt = (k, x) => k === 'count' || k === 'armor' ? String(Math.round(x * 10) / 10) : k === 'ifr' ? x.toFixed(2) + ' 秒' : k === 'regen' ? (x * 100).toFixed(1) + '%/秒' : ['speed', 'pickup', 'lightBase', 'maxHp'].includes(k) ? String(Math.round(x)) : Math.round(x * 1000) / 10 + '%';
  const add = (k, x, n) => { if (!x) return; v[k] += x; src[k].push([n, (x > 0 ? '+' : '') + dfmt(k, x)]); };
  const mul = (k, f, n) => { if (f === 1) return; v[k] *= f; src[k].push([n, '×' + f.toFixed(2)]); };
  const P = id => PASSIVES[id].name;
  mul('maxHp', 1 + 0.1 * lv('vigor'), P('vigor')); add('regen', 0.002 * lv('vigor'), P('vigor'));
  add('armor', lv('tough'), P('tough')); add('ifr', 0.15 * lv('tough'), P('tough'));
  mul('speed', 1 + 0.06 * lv('swift'), P('swift')); mul('speed', 1 + 0.05 * lv('swift2'), P('swift2'));
  mul('pickup', 1 + 0.2 * lv('magnet'), P('magnet')); add('xp', 0.04 * lv('magnet'), P('magnet'));
  mul('lightBase', 1 + 0.06 * lv('afterglow'), P('afterglow'));
  add('area', 0.08 * lv('amplify'), P('amplify')); mul('cdMul', 1 - 0.06 * lv('circuit'), P('circuit'));
  add('knock', 0.15 * lv('heavy'), P('heavy')); add('elite', 0.12 * lv('hunter'), P('hunter')); add('scrap', 0.1 * lv('scavenge'), P('scavenge'));
  add('dmg', 0.08 * lv('power'), P('power')); add('crit', 0.05 * lv('keen'), P('keen')); add('critDmg', 0.25 * lv('brutal'), P('brutal'));
  add('aspd', 0.08 * lv('haste'), P('haste')); add('count', Math.floor(0.5 * lv('multi') + 1e-6), P('multi')); add('dur', 0.12 * lv('linger'), P('linger'));
  add('leech', 0.015 * lv('thirst'), P('thirst')); add('evade', 0.04 * lv('dodge'), P('dodge')); add('luck', 0.1 * lv('fortune'), P('fortune'));
  add('regen', 0.004 * lv('peace'), P('peace')); add('armor', 1.5 * lv('guard'), P('guard'));
  if (S.bl) { if (S.bl.k_legend) add('statd', 0.3, '传奇·瘟疫'); if (S.lamp === 'l_lamp') mul('lightBase', stv('l_lamp', 'size'), '光芯'); if (S.lamp === 'm_lamp') mul('lightBase', stv('m_lamp', 'size'), '时芯'); if (S.bl.m_legend) mul('lightBase', 1.15, '传奇·时光之味'); }
  gearApply(add, mul);
  if (S.buff) { const n = STONES[S.buff.k].name; if (S.buff.k === 'xp') add('xp', 0.6, n); if (S.buff.k === 'pull') mul('pickup', 8, n); if (S.buff.k === 'power') add('dmg', 0.6, n); if (S.buff.k === 'haste') { add('aspd', 0.4, n); mul('speed', 1.2, n); } }
  if (S.cls === 'warrior') {
    add('dmg', 0.12 * npt('might'), '千钧'); add('aspd', 0.12 * npt('swift'), '趁势'); add('armor', 2 * npt('plate'), '厚甲');
    if (nd('crit')) { add('crit', 0.15, '会心'); add('critDmg', 0.5, '会心'); }
    if (S.spec === 'paladin') { add('armor', 3, '守灯骑士'); mul('maxHp', 1.15, '守灯骑士'); mul('lightBase', 1.15, '守灯骑士'); }
    if (S.spec === 'berserker') { add('aspd', 0.15, '狂战士'); mul('speed', 1.06, '狂战士'); add('leech', 0.02, '狂战士'); }
    if (S.spec === 'dark') { add('dmg', 0.1, '黑暗骑士'); mul('maxHp', 0.9, '黑暗骑士'); add('dur', 0.2, '黑暗骑士'); }
  }
  for (const id of S.auras || []) { const sv = k => stv('aura_' + id, k), n = '光环·' + AURA[id].name;
    if (id === 'mend') { add('regen', sv('heal'), n); mul('maxHp', 1 + sv('hpup'), n); }
    if (id === 'haste') { add('aspd', sv('aspd'), n); mul('speed', 1 + sv('mspd'), n); }
    if (id === 'lure') { mul('pickup', 1 + sv('pick'), n); add('xp', sv('xp'), n); } }
  if (S.auras && auraRes('sup2')) add('regen', 0.004, '护持共鸣');
  add('dmg', 0.25 * bl('tidepower'), '灰潮之力'); mul('lightBase', 1 - 0.1 * bl('tidepower'), '灰潮之力'); mul('maxHp', 1 - 0.1 * bl('shell'), '灰潮之壳'); add('scrap', 0.5 * bl('greed'), '贪婪');
  if (hasT('hood')) mul('lightBase', 1.15, '科技·遮光罩');
  if (pact('dim')) mul('lightBase', 0.8, '契约·薄灯'); if (pact('frail')) { mul('maxHp', 0.8, '契约·脆弱'); mul('scrap', 1.5, '契约·脆弱'); } if (pact('swift')) add('xp', 0.25, '契约·疾潮');
  if (S.greed) { mul('scrap', 1.5, '贪婪碑'); }
  if (S.penance) { add('xp', 0.25, '忏悔碑'); mul('lightBase', 0.8, '忏悔碑'); }
  if (S.tombSlow) mul('speed', 0.92, '守灯人之墓');
  if (S.tombHp) mul('maxHp', 1 + S.tombHp, '守灯人之墓');
  v.crit = Math.min(0.9, v.crit); v.evade = Math.min(0.5, v.evade);
  Object.assign(D, v); DSRC = src;
  if (D.maxHp > old) p.hp += D.maxHp - old;
  p.hp = Math.min(p.hp, D.maxHp);
  hudDirty = true;
}
// 预览：拿了这张卡之后属性怎么变
function whatIf(fn) {
  const p = S.player, snap = { auras: S.auras ? [...S.auras] : undefined, st: S.st, pval: { ...(S.pval || {}) }, npt: { ...(S.npt || {}) }, nodes: { ...S.nodes }, passives: { ...S.passives }, hp: p.hp }, before = { ...D };
  fn(); recalc(); const after = { ...D };
  S.pval = snap.pval; S.npt = snap.npt; S.nodes = snap.nodes; S.passives = snap.passives; S.auras = snap.auras; S.st = snap.st; recalc(); p.hp = snap.hp;
  return CSTAT.filter(([k]) => Math.abs((after[k] || 0) - (before[k] || 0)) > 1e-6).map(([k, n, , f]) => `<div class="afx"><span>${n}</span><b>${f(before[k])} <i>→</i> ${f(after[k])}</b></div>`).join('');
}
function shadeHit() { const c = S.conc; return 6 * [1, 1.12, 1.3][layerAt(S.player.x, S.player.y)] * (1 + S.t / 1200) * (1 + c / 100) * (c > 100 ? Math.min(4, Math.pow(1.03, c - 100)) : 1); }
const STX = {
  maxHp: () => `现在 ${Math.ceil(S.player.hp)} / ${Math.round(D.maxHp)}`,
  regen: v => `每秒回 ${(v * D.maxHp).toFixed(1)} 点` + (isW() ? `；喘息时每秒 ${((v + 0.021) * D.maxHp).toFixed(1)} 点` : ''),
  armor: v => { const h = shadeHit(), a = Math.max(1, h - v); return `每次受伤固定 −${Math.round(v * 10) / 10} 点。此处烬影一下 ${h.toFixed(1)} → ${a.toFixed(1)}（−${Math.round((1 - a / h) * 100)}%）`; },
  evade: v => v ? `${pcs(v)} 概率完全躲开一次伤害` : '',
  leech: v => v ? `每次命中 ${pcs(v)} 概率回 ${(0.006 * D.maxHp).toFixed(1)} 点生命` : '',
  ifr: v => `挨打后 ${v.toFixed(2)} 秒内不会再受伤`,
  dmg: v => `所有伤害 ×${v.toFixed(2)}`,
  crit: v => `期望伤害 ×${(1 + v * (D.critDmg - 1)).toFixed(2)}`,
  critDmg: v => `暴击时伤害 ×${v.toFixed(2)}`,
  aspd: v => isW() ? `普攻每 ${(ATK_CD[atkMode()] / (stv('blade', 'aspd') * v)).toFixed(2)} 秒一下` : '焊枪和光圈放电更快',
  count: v => isW() ? '回旋斧、落雷多出这么多个' : '线圈、避雷针、击发、召唤物多出这么多个',
  area: v => isW() ? `普攻半径 ${(wRange() / M).toFixed(1)} 米；所有技能范围 ×${v.toFixed(2)}` : `所有技能范围 ×${v.toFixed(2)}`,
  dur: v => isW() ? `旋风、针、地面、燃烧、眩晕的时间 ×${v.toFixed(2)}` : `针、地面、霜域、力场、眩晕、冰冻的时间 ×${v.toFixed(2)}`,
  cdMul: v => `所有技能冷却 ×${v.toFixed(2)}`,
  pspd: v => isW() ? `飞斧、线圈转得更快` : `线圈、仲裁者转得更快，球状闪电、飞弹更快`,
  knock: v => `击退距离 ×${v.toFixed(2)}`,
  elite: v => v ? `对精英和巢穴伤害 ×${(1 + v).toFixed(2)}` : '',
  statd: v => `燃烧、诅咒结算 ×${(1 + v).toFixed(2)}` + (lv('bite') ? `；霜咬：敌人每个状态再 +${10 * lv('bite')}%` : ''),
  speed: v => '',
  pickup: v => '',
  xp: v => '',
  lightBase: v => `灰潮越浓光圈越小，现在 ${(S.lr / M).toFixed(1)} 米`,
  luck: v => `罕见以上出现率 ${pcs((RAR[1].p + RAR[2].p + RAR[3].p) * (1 + v))}，传说 ${(RAR[3].p * (1 + v) * 100).toFixed(1)}%`,
  scrap: v => '',
};
function statsHTML() {
  return ['生存', '攻击', '功能'].map(g => `<div class="box"><h3>${g}</h3><table class="stt">${CSTAT.filter(c => c[2] === g).map(([k, n, , f]) => { const sr = (DSRC[k] || []).slice(1); const ex = STX[k] ? STX[k](D[k]) : ''; return `<tr><td>${n}</td><td class="v${sr.length ? ' up' : ''}">${f(D[k])}</td></tr>${ex ? `<tr class="ex"><td colspan="2">${ex}</td></tr>` : ''}${sr.length ? `<tr class="src"><td colspan="2">来源：${sr.map(([a, b]) => a + ' ' + b).join(' · ')}</td></tr>` : ''}`; }).join('')}</table></div>`).join('');
}

