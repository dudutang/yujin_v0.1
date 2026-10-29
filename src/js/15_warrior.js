// ================= 破障者（近战） =================
const AXE = { dmg: 14, range: 2.2, arc: 120, rage: 1.2, color: '#ffe2b0' };
const ATK_CD = { base: 0.5, split: 0.85, flurry: 0.23, wave: 0.55, throw: 0.7 };
const AXEMODS = {
  atk: { label: '普攻', def: { name: '三段劈砍', text: '横劈、横劈，第三下是终结技' }, opts: {
    split: { name: '裂地劈', text: '每 0.85 秒一记重劈，伤害 ×2.2，落点放一圈冲击波' },
    flurry: { name: '乱斩', text: '攻速 ×2.2，伤害 ×0.45，角度更宽；每第 10 下自动旋斩一圈' },
    wave: { name: '斧气', text: '每次挥砍放出一道贯穿的斧气，飞 5 米' },
    throw: { name: '投斧', text: '普攻变成掷出回旋斧，射程 5.5 米，去和回各伤一次' } } },
  fin: { label: '终结技', def: { name: '下劈', text: '200° 大劈，伤害 ×1.8' }, opts: {
    quake: { name: '震地', text: '3 米内眩晕 0.6 秒并击退，伤害 ×1.5' },
    charge: { name: '冲锋劈', text: '突进到目标身边劈下，伤害 ×2.2，突进中无敌' },
    execute: { name: '处刑', text: '对单个敌人 ×4 伤害，对精英和巢穴 ×6' },
    gale: { name: '劈风', text: '扇形放出三道贯穿的斧气，每道 ×1.2' } } },
  edge: { label: '斧刃', def: { name: '普通斧刃', text: '命中没有附带效果' }, opts: {
    fire: { name: '燃斧', text: '命中有概率爆出火焰：额外火伤并点燃，燃烧持续掉血' },
    thunder: { name: '雷斧', text: '命中有概率引下落雷：砸中目标和周围的敌人' },
    frost: { name: '霜斧', text: '命中让敌人减速；叠 3 层冻住，碎冰伤害周围' },
    blunt: { name: '钝斧', text: '每一下都震出一圈冲击波，击退更远，能砸开蚀壳的护壳' },
    vamp: { name: '血斧', text: '命中叠出血（每层持续掉血），每次命中回一点生命' },
    ash: { name: '灰蚀斧', text: '命中有概率刻下灰蚀，片刻后在敌人身上爆开，伤及周围' } } },
};
const EDGES = ['fire', 'thunder', 'frost', 'blunt', 'vamp', 'ash'];
const EDGE_COL = { fire: '#ffb15a', thunder: '#cfe8ff', frost: '#bfe9ff', blunt: '#ffe2b0', vamp: '#ff7b7b', ash: '#c4a8ff' };
const edgeCol = () => EDGE_COL[S.axe.edge] || AXE.color;
const modOf = id => { const [slot, k] = id.split(':'); const o = AXEMODS[slot] && AXEMODS[slot].opts[k]; return o ? { slot, k, ...o } : null; };
const axeName = slot => S.axe[slot] ? AXEMODS[slot].opts[S.axe[slot]].name : AXEMODS[slot].def.name;
const SPECS = {
  paladin: { name: '守灯骑士', short: '圣骑士', color: '#fff1b0', tree: 'paladin', affinity: ['guard', 'whirl'],
    core: '提灯变成圣光光环：光圈内的敌人持续受到光伤，你每秒回复 1% 生命', ult: '灯塔降临：每 45 秒原地立一盏临时路灯，12 秒内站在灯下灰潮停涨', rewrite: '格挡 → 圣盾格挡：格挡时给周围敌人施加曝光', tide: '把灰潮推回去：最安全，能待得最久',
    reso: { base: '终结技附带一圈圣光（60% 伤害）', split: '重劈的落点升起光柱：额外伤害并施加曝光', flurry: '每次命中 15% 概率施加曝光', wave: '斧气变宽 50%，并施加曝光', throw: '飞回来的斧头为你回复 1% 生命' } },
  berserker: { name: '狂战士', short: '狂战士', color: '#ff6b5e', tree: 'berserker', affinity: ['rage', 'combo'],
    core: '怒气不再衰减；狂暴中每次击杀延长狂暴 0.3 秒；每损失 1% 生命，伤害 +1%（最多 +50%）', ult: '血怒：狂暴时不会倒下，每次终结技放出一圈血浪', rewrite: '嗜血 → 狂暴之外也能吸血，效果减半', tide: '赶时间：杀得越快越强',
    reso: { base: '狂暴时每一下都是终结技', split: '狂暴时重劈攻速 +40%', flurry: '狂暴时每第 5 下就旋斩', wave: '狂暴时一次放出两道斧气', throw: '狂暴时一次掷两把斧头' } },
  dark: { name: '黑暗骑士', short: '黑暗骑士', color: '#b79cff', tree: 'dark', affinity: ['heavy', 'leap'],
    core: '浓度越高伤害越高（每 2 点 +1%）；终结技消耗 2% 生命，伤害 +60%；击杀 15% 概率召唤一个灰影随从', ult: '吞潮：每 40 秒吸走 15 点浓度，换来 15 秒攻速 +30%、伤害 +40%', rewrite: '斩首 → 处决时召唤一个灰影，并回复 1% 生命', tide: '把灰潮吃进去：越浓越强，贪婪的路线',
    reso: { base: '终结技留下 3 秒灰潮地面，持续伤害并减速', split: '每一记重劈 20% 概率召唤灰影', flurry: '每第 10 下吸取 1% 生命', wave: '被斧气杀死的敌人 30% 概率变成灰影', throw: '投斧命中施加燃烧' } },
};
const TREES = {
  combo: { name: '连斩', tags: ['攻速', '连击'], nodes: ['swift', 'opening', 'flow', 'endless'] },
  heavy: { name: '重创', tags: ['伤害', '精英'], nodes: ['might', 'sunder', 'crit', 'execute'] },
  rage: { name: '怒火', tags: ['怒气', '生存'], nodes: ['blood', 'bloodlust', 'warcry', 'undying'] },
  guard: { name: '铁壁', tags: ['防御', '受伤触发'], nodes: ['plate', 'parry', 'thorns', 'mountain'] },
  whirl: { name: '旋风', tags: ['战技', '区域'], war: true, nodes: ['whirl', 'vortex', 'swiftspin', 'eye'] },
  leap: { name: '跃斩', tags: ['战技', '眩晕'], war: true, nodes: ['leap', 'crack', 'double', 'meteor'] },
  axe: { name: '飞斧', tags: ['战技', '远程'], war: true, nodes: ['axe', 'twinaxe', 'hook', 'rain'] },
  paladin: { name: '守灯骑士', tags: ['光', '防御'], spec: 'paladin', nodes: ['p_aura', 'p_shield', 'p_judge', 'p_beacon'] },
  berserker: { name: '狂战士', tags: ['怒气', '攻速'], spec: 'berserker', nodes: ['b_core', 'b_war', 'b_roar', 'b_rage'] },
  dark: { name: '黑暗骑士', tags: ['灰潮', '召唤物'], spec: 'dark', nodes: ['d_core', 'd_legion', 'd_soul', 'd_devour'] },
};
const NODES = {
  swift: { tree: 'combo', name: '趁势', max: 3, text: l => `攻速 +${12 * l}%` },
  opening: { tree: 'combo', name: '破绽', text: () => '终结技伤害 +60%，并且必定击退' },
  flow: { tree: 'combo', name: '余势', text: () => '终结技之后 2 秒内攻速 +30%' },
  endless: { tree: 'combo', name: '无尽连斩', text: () => '每第二下就是终结技' },
  might: { tree: 'heavy', name: '千钧', max: 3, text: l => `所有伤害 +${12 * l}%` },
  sunder: { tree: 'heavy', name: '碎甲', text: () => '对精英和巢穴伤害 +30%，无视护壳' },
  crit: { tree: 'heavy', name: '会心', text: () => '15% 暴击，暴击伤害 ×2.5' },
  execute: { tree: 'heavy', name: '斩首', text: () => S && S.spec === 'dark' ? '生命低于 20% 的普通敌人直接处决；处决时召唤一个灰影并回复 1% 生命' : '生命低于 20% 的普通敌人直接处决' },
  blood: { tree: 'rage', name: '血性', max: 3, text: l => `怒气获取 +${25 * l}%` },
  bloodlust: { tree: 'rage', name: '嗜血', text: () => S && S.spec === 'berserker' ? '狂暴时每次命中回复 0.6% 生命，平时减半' : '狂暴时每次命中回复 0.6% 生命' },
  warcry: { tree: 'rage', name: '战意', text: () => '狂暴持续 +3 秒' },
  undying: { tree: 'rage', name: '不灭', text: () => '狂暴时生命不会低于 1，狂暴结束时回复 25% 生命' },
  plate: { tree: 'guard', name: '厚甲', max: 3, text: l => `护甲 +${2 * l}` },
  parry: { tree: 'guard', name: '格挡', text: () => S && S.spec === 'paladin' ? '每 4 秒完全格挡一次伤害并反击；格挡时给周围敌人施加曝光' : '每 4 秒完全格挡一次伤害，并反击一下' },
  thorns: { tree: 'guard', name: '荆棘', text: () => '受伤时对周围造成 100% 武器伤害' },
  mountain: { tree: 'guard', name: '不动如山', text: () => '站定 0.6 秒后受到的伤害 −40%，攻击范围 +25%' },
  whirl: { tree: 'whirl', name: '旋风斩', max: 8, text: () => '周期性原地旋转，持续砍周围的敌人' },
  vortex: { tree: 'whirl', name: '吸附', text: () => '旋风把 4 米内的普通敌人拉进来' },
  swiftspin: { tree: 'whirl', name: '疾旋', text: () => '旋风期间移速 +40%，多转 1 秒' },
  eye: { tree: 'whirl', name: '风暴之眼', text: () => '旋风结束时放一圈冲击波，每个敌人受到这次旋风单体伤害的 60%' },
  leap: { tree: 'leap', name: '跃击', max: 8, text: () => '周期性跳向最密的敌群砸地，击退并眩晕' },
  crack: { tree: 'leap', name: '裂地', text: () => '落点留下 3 秒裂地，持续伤害并减速 40%' },
  double: { tree: 'leap', name: '连跳', text: () => '落地后紧接着再跳一次' },
  meteor: { tree: 'leap', name: '陨星', text: () => '落地范围翻倍，对普通敌人伤害 ×3' },
  axe: { tree: 'axe', name: '回旋斧', max: 8, text: () => '周期性向最远的敌人掷斧，飞回来时再伤一次' },
  twinaxe: { tree: 'axe', name: '双斧', text: () => '一次掷两把' },
  hook: { tree: 'axe', name: '钩链', text: () => '飞斧把命中的普通敌人往你身边拖' },
  rain: { tree: 'axe', name: '斧雨', text: () => '每第 3 次掷斧变成一圈环形斧：8 把，每多 1 把飞斧（数量、双斧）再多 4 把' },
  p_aura: { tree: 'paladin', name: '圣光光环', text: () => SPECS.paladin.core },
  p_shield: { tree: 'paladin', name: '圣盾', text: () => '每 8 秒获得一个护盾，吸收 20% 最大生命的伤害' },
  p_judge: { tree: 'paladin', name: '审判', text: () => '每 3 秒，光圈内 3 个敌人被光柱击中' },
  p_beacon: { tree: 'paladin', name: '觉醒 · 灯塔降临', text: () => SPECS.paladin.ult },
  b_core: { tree: 'berserker', name: '不息之怒', text: () => SPECS.berserker.core },
  b_war: { tree: 'berserker', name: '血战', text: () => '狂暴中每次击杀回复 1% 生命' },
  b_roar: { tree: 'berserker', name: '怒吼', text: () => '进入狂暴时震退 4 米内的敌人并眩晕 1 秒' },
  b_rage: { tree: 'berserker', name: '觉醒 · 血怒', text: () => SPECS.berserker.ult },
  d_core: { tree: 'dark', name: '灰潮之血', text: () => SPECS.dark.core },
  d_legion: { tree: 'dark', name: '灰影军团', text: () => '灰影上限 4 → 8，持续 12 → 20 秒，攻击附带燃烧' },
  d_soul: { tree: 'dark', name: '吸魂', text: () => '每次击杀回复 0.3% 生命，浓度 60 以上翻倍' },
  d_devour: { tree: 'dark', name: '觉醒 · 吞潮', text: () => SPECS.dark.ult },
};
const SYN = [
  { id: 'bloodwhirl', name: '血旋风', need: ['whirl', 'bloodlust'], text: '旋风的每次命中都回血、都给怒气' },
  { id: 'thunder', name: '雷霆一击', need: ['leap', 'crit'], text: '跃斩落地必定暴击' },
  { id: 'counter', name: '反击风暴', need: ['parry', 'opening'], text: '格挡后的反击是一次终结技' },
  { id: 'berserker', name: '狂战士', need: ['flow', 'warcry'], text: '狂暴中每次终结技把狂暴延长 0.5 秒' },
  { id: 'shatter', name: '碎地', need: ['crack', 'sunder'], text: '裂地和灰潮地面上的敌人受到的伤害 +25%' },
  { id: 'reel', name: '归斧', need: ['hook', 'mountain'], text: '飞斧拖回来的敌人眩晕 1 秒' },
];
const isW = () => !!(S && S.cls === 'warrior');
const nd = id => (S && S.nodes && S.nodes[id]) || 0;
const npt = id => (S && S.npt && S.npt[id] != null) ? S.npt[id] : nd(id);
const syn = id => !!(S && S.syn && S.syn.has(id));
const treeOf = id => TREES[NODES[id].tree];
const treePts = t => TREES[t].nodes.reduce((a, id) => a + nd(id), 0);
const warTrees = () => Object.keys(TREES).filter(t => TREES[t].war && nd(TREES[t].nodes[0]) > 0).length;
const isBz = () => S.berserkT > 0;
const atkMode = () => S.axe.atk || 'base';
function nodeAvail(id) {
  const N = NODES[id], T = TREES[N.tree], [e, b1, b2, cap] = T.nodes, r = nd(id);
  if (T.spec && S.spec !== T.spec) return false;
  if (id === e) { if (r >= (N.max || 1)) return false; if (!r && T.war && warTrees() >= 2) return false; return true; }
  if (r || !nd(e)) return false;
  if (id === cap) return nd(b1) > 0 && nd(b2) > 0;
  return true;
}
function initWarrior() {
  Object.assign(S, { cls: 'warrior', skills: [], nodes: {}, axe: { atk: null, fin: null, edge: null }, spec: null, benchDone: false, syn: new Set(), rage: 0, rageIdle: 0, berserkT: 0, atkT: 0.3, combo: 0, comboReset: 0, swings: 0, finishers: 0, momT: 0, flurryN: 0, dash: null,
    whirl: { cd: 1.5, t: 0, tick: 0, dmg: 0, ang: 0 }, leapS: { cd: 2, phase: null, u: 0, second: false }, axeS: { cd: 1, n: 0 }, projs: [], slashes: [], parryT: 0,
    minions: [], tempLights: [], palT: 0, palShieldT: 2, judgeT: 3, beaconT: 8, devourCd: 15, devourT: 0, oath: { x: Math.cos(S.altarAng - 1.9) * 68 * M, y: Math.sin(S.altarAng - 1.9) * 68 * M } });
  S.run.cls = 'warrior'; S.run.mods = []; S.run.syn = []; S.run.spec = null;
}
const lvlScale = () => 1 + 0.04 * (S.player.lvl - 1);
function wRange() { return AXE.range * stv('blade', 'size') * M * (nd('mountain') && S.player.still > 0.6 ? 1.25 : 1) * D.area; }
function wDmg() { return stv('blade', 'dmg') * lvlScale(); }
function heal(f) { S.player.hp = Math.min(D.maxHp, S.player.hp + f * D.maxHp); }
function gainRage(n) {
  if (isBz()) return;
  S.rage += n * (1 + 0.25 * npt('blood')); S.rageIdle = 0;
  if (S.rage >= 100) {
    const p = S.player; S.rage = 0; sfx('rage'); S.berserkT = 6 + (nd('warcry') ? 3 : 0); banner('狂暴', '攻速 +40% · 伤害 +20% · 移速 +15%', '#ff6b5e', 2); S.shake = Math.min(10, S.shake + 4); S.run.berserks = (S.run.berserks || 0) + 1;
    if (nd('b_roar')) { addRing(p.x, p.y, 4 * M, '#ff6b5e', 0.5); for (const e of query(p.x, p.y, 4 * M)) { applyKnock(e, p.x, p.y, 2 * M); applyStun(e, 1); } }
  }
}
function leech() { if (!nd('bloodlust')) return; if (isBz()) heal(0.006); else if (S.spec === 'berserker') heal(0.003); }
function summon(x, y) {
  if (S.spec !== 'dark') return; const cap = nd('d_legion') ? 8 : 4;
  if (S.minions.length >= cap) S.minions.shift();
  S.minions.push({ x, y, t: nd('d_legion') ? 20 : 12, atkT: 0, ph: Math.random() * 6 }); burst(x, y, '#8f6fd6', 8, 60);
}
function flinch(e, t) { if (e.dead || e.type === 'nest' || e.type === 'boss' || e.reaper || e.flinchCD > 0) return; t *= e.elite ? 0.4 : 1; e.flinchT = Math.max(e.flinchT || 0, t); e.flinchCD = t + 0.45; }
function spark(x, y, ang, col, n, spd) { if (window.__botFast) return; for (let i = 0; i < n && sparks.length < 220; i++) { const a = ang + rand(-0.55, 0.55), v = rand(0.5, 1) * spd; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: rand(0.12, 0.24), life: 0.24, c: col }); } }
function bolt(x, y) { (S.bolts = S.bolts || []).push({ x, y, t: 0.3, seed: Math.random() * 1000 }); }
function edgeHit(e, o) {
  const k = S.axe.edge; if (!k || e.type === 'nest' && k === 'frost') return; const id = 'edge_' + k, sv = q => stv(id, q);
  if (k === 'fire') { if (Math.random() < sv('chance')) { burst(e.x, e.y - 8, '#ffb15a', 6, 90); sfx('fire'); dealDamage(e, sv('dmg'), 'fire', {}); if (!e.dead) { e.ign = { t: sv('dur') * D.dur, d: sv('dmg') * 0.35, acc: 0 }; applyStatus(e, 'burn', 1); } } }
  else if (k === 'thunder') { if (S.t >= (S.boltCd || 0) && Math.random() < sv('chance')) { S.boltCd = S.t + 0.1; sfx('thunder'); S.shake = Math.min(8, S.shake + 2);
      const R = 1.2 * M * sv('size') * D.area, tg = [e, ...nearestN(e.x, e.y, 4 * M, Math.round(sv('count')) - 1 + Math.floor(D.count + 1e-6), q => q !== e)];
      for (const t of tg) { bolt(t.x, t.y); addRing(t.x, t.y, R, '#bfe6ff', 0.25); for (const q of query(t.x, t.y, R)) { dealDamage(q, sv('dmg'), 'elec', { depth: 2 }); if (!q.dead && Math.random() < 0.3) applyStatus(q, 'shock', 1); } } } }
  else if (k === 'frost') { if (e.dead) return; const n = (e.chill && e.chill.t > 0 ? e.chill.n : 0) + 1; e.chill = { t: sv('dur') * D.dur, n };
    if (n >= 3) { e.chill = { t: sv('dur') * D.dur, n: 0 }; applyStun(e, sv('stun') * D.dur); sfx('ice'); const R = 1.3 * M * sv('size') * D.area; addRing(e.x, e.y, R, '#bfe6ff', 0.3); burst(e.x, e.y - 6, '#dff4ff', 12, 160); for (const q of query(e.x, e.y, R)) dealDamage(q, sv('dmg'), 'phys', { depth: 2 }); } }
  else if (k === 'blunt') { if (S.t >= (S.bluntT || 0)) { S.bluntT = S.t + 0.06; const R = 0.9 * M * sv('size') * D.area; addRing(e.x, e.y, R, '#ffe2b0', 0.18); for (const q of query(e.x, e.y, R)) if (q !== e) { dealDamage(q, sv('dmg'), 'phys', { depth: 2 }); applyKnock(q, e.x, e.y, 0.8 * M); } } }
  else if (k === 'vamp') { if (!e.dead) e.bleed = { n: Math.min(Math.round(sv('count')), (e.bleed && e.bleed.t > 0 ? e.bleed.n : 0) + 1), t: 3, acc: e.bleed ? e.bleed.acc : 0 }; heal(sv('heal')); }
  else if (k === 'ash') { if (!e.dead && !e.ash && Math.random() < sv('chance')) e.ash = { t: sv('cd'), d: sv('dmg'), r: 1.6 * M * sv('size') * D.area }; }
}
function wHit(e, dmg, o = {}) {
  const p = S.player;
  spark(e.x, e.y - 6, Math.atan2(e.y - (o.ky != null ? o.ky : p.y), e.x - (o.kx != null ? o.kx : p.x)), edgeCol(), o.fin ? 6 : 3, o.fin ? 420 : 300);
  const kd = (S.axe.edge === 'blunt' ? Math.max(stv('edge_blunt', 'knock'), o.knockDist || 0) : o.knock ? (o.knockDist || 1.2) : 0.55) * stv('blade', 'knock');
  if (!o.crit && stv('blade', 'crit') > 0 && Math.random() < stv('blade', 'crit')) o = { ...o, crit: true };
  applyKnock(e, o.kx != null ? o.kx : p.x, o.ky != null ? o.ky : p.y, kd * M);
  flinch(e, o.fin ? 0.5 : 0.3);
  if (o.stun) applyStun(e, o.stun);
  dealDamage(e, dmg, 'phys', { crit: o.crit });
  if (!e.dead) {
    if (S.spec === 'paladin' && (atkMode() === 'flurry' && Math.random() < 0.15 || o.expo)) applyStatus(e, 'expo', 1);
    if (S.spec === 'dark' && o.burn) applyStatus(e, 'burn', 1);
  }
  edgeHit(e, o);
  leech();
}
function addSlash(x, y, ang, arc, R, col, fin) { if (S.slashes.length < 60) S.slashes.push({ x, y, ang, arc, R, col, fin, t: fin ? 0.26 : 0.18, life: fin ? 0.26 : 0.18 }); }
function arcHit(ang, arcDeg, R, dmg, o = {}) {
  const p = S.player, half = arcDeg * Math.PI / 360; let n = 0;
  for (const e of query(p.x, p.y, R)) {
    if (arcDeg < 360) { let da = Math.atan2(e.y - p.y, e.x - p.x) - ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > half + 0.15) continue; }
    n++; wHit(e, dmg, o);
  }
  if (n && !o.noRage) gainRage((o.rage || AXE.rage) * (o.fin ? 2 : 1) * (1 + 0.25 * Math.min(4, n - 1)));
  if (n) { stopFor(o.fin ? 0.055 : n >= 4 ? 0.025 : 0.012); sfx(o.fin ? 'heavy' : 'hit', n); if (o.fin) S.shake = Math.min(10, S.shake + 2.5); }
  if (arcDeg >= 360) smash(p.x, p.y, R); else smash(p.x + Math.cos(ang) * R * 0.55, p.y + Math.sin(ang) * R * 0.55, R * 0.5);
  addSlash(p.x, p.y, ang, arcDeg, R, o.color || edgeCol(), o.fin);
  return n;
}
function axeQuake(dmg, fo) { sfx('boom');
  const p = S.player, R = 3 * M * D.area;
  addRing(p.x, p.y, R, '#ffd28a', 0.4); S.shake = Math.min(10, S.shake + 4); smash(p.x, p.y, R);
  let n = 0; for (const e of query(p.x, p.y, R)) { applyStun(e, 0.6); wHit(e, dmg, { knock: true, knockDist: 1.8 }); n++; }
  if (n) gainRage(AXE.rage * 2 * (1 + 0.25 * Math.min(4, n - 1)));
  addSlash(p.x, p.y, 0, 360, R, '#ffd28a', true);
}
function throwProj(kind, ang, dmg, opt = {}) { S.projs.push(Object.assign({ kind, x: S.player.x, y: S.player.y - 6, ang, spd: 13 * M, dist: 0, max: 7 * M, boom: true, dmg, hit: new Set(), r: 12, rot: 0 }, opt)); }
function doSwing(t) {
  const p = S.player, atk = atkMode(), every = nd('endless') ? 2 : 3;
  S.combo++; S.swings++; S.comboReset = 1.5;
  let fin = S.combo % every === 0;
  if (S.spec === 'berserker' && atk === 'base' && isBz()) fin = true;
  const ang = Math.atan2(t.y - p.y, t.x - p.x); sfx('swing', fin || atk === 'split');
  p.fx = Math.cos(ang); p.fy = Math.sin(ang); if (Math.abs(p.fx) > 0.1) p.faceR = p.fx > 0; p.swingT = 0.15; p.swingAng = ang;
  const R = wRange(), base = wDmg(), bz2 = S.spec === 'berserker' && isBz();
  if (atk === 'split') {
    arcHit(ang, 70, R * 1.1, base * 2.2, { knock: true, knockDist: 1.4, rage: 2.2 });
    const x = p.x + Math.cos(ang) * R * 0.8, y = p.y + Math.sin(ang) * R * 0.8;
    addRing(x, y, 2 * M * D.area, '#ffd28a', 0.3); for (const e of query(x, y, 2 * M * D.area)) dealDamage(e, base * 0.6, 'phys', {});
    if (S.spec === 'paladin') { addArc(x, y - 150, x, y, '#fff1b0', 0.25, 4); for (const e of query(x, y, 1.3 * M)) { dealDamage(e, base * 1.1, 'light', {}); applyStatus(e, 'expo', 1); } }
    if (S.spec === 'dark' && Math.random() < 0.2) summon(x, y);
  } else if (atk === 'flurry') {
    S.flurryN++; arcHit(ang, 150, R, base * 0.45, { rage: 0.5 });
    if (S.flurryN % (bz2 ? 5 : 10) === 0) arcHit(ang, 360, R * 1.15, base * 1.2, { rage: 0.5, color: '#ffffff' });
    if (S.spec === 'dark' && S.flurryN % 10 === 0) heal(0.01);
  } else if (atk === 'wave') {
    arcHit(ang, 100, R, base * 0.8, {});
    const n = (bz2 ? 2 : 1) + Math.floor(D.count + 1e-6); for (let i = 0; i < n; i++) throwProj('wave', ang + (i - (n - 1) / 2) * 0.25, base * 0.8, { boom: false, max: 5 * M, spd: 16 * M, r: S.spec === 'paladin' ? 22 : 15, weapon: true });
  } else if (atk === 'throw') {
    const n = (bz2 ? 2 : 1) + Math.floor(D.count + 1e-6); for (let i = 0; i < n; i++) throwProj('axe', ang + (i - (n - 1) / 2) * 0.3, base * 1.1, { max: 5.5 * M, spd: 14 * M, weapon: true, atk: true });
  } else if (!fin) arcHit(ang, AXE.arc, R, base, {});
  if (fin) doFinisher(t, ang);
}
function doFinisher(t, ang) {
  const p = S.player, f = S.axe.fin || 'base', R = wRange(), base = wDmg(), atk = atkMode();
  let mul = 1 + (nd('opening') ? 0.6 : 0); const fo = { fin: true, knock: nd('opening') > 0, knockDist: 1.6 };
  S.finishers++; if (nd('flow')) S.momT = 2; if (syn('berserker') && isBz()) S.berserkT += 0.5;
  if (S.spec === 'dark') { p.hp = Math.max(1, p.hp - 0.02 * D.maxHp); mul *= 1.6; }
  if (f === 'quake') axeQuake(base * 1.5 * mul, fo);
  else if (f === 'charge') { const dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy) || 1, step = Math.max(0, Math.min(3.5 * M, d - 0.8 * M)); S.dash = { fx: p.x, fy: p.y, tx: p.x + dx / d * step, ty: p.y + dy / d * step, u: 0, ang, dmg: base * 2.2 * mul, fo }; }
  else if (f === 'execute') { const e = t.dead ? nearest(p.x, p.y, R + M) : t; if (e) { wHit(e, base * ((e.elite || e.type === 'nest') ? 6 : 4) * mul, fo); addSlash(p.x, p.y, Math.atan2(e.y - p.y, e.x - p.x), 50, R * 1.2, '#ff8a80', true); gainRage(AXE.rage * 2); } }
  else if (f === 'gale') { for (const da of [-0.35, 0, 0.35]) throwProj('wave', ang + da, base * 1.2 * mul, { boom: false, max: 6 * M, spd: 16 * M, r: 16, weapon: true }); addSlash(p.x, p.y, ang, 90, R, AXE.color, true); }
  else arcHit(ang, 200, R * 1.2, base * 1.8 * mul, fo);
  if (S.spec === 'paladin' && atk === 'base') { const r = 2.5 * M * D.area; addRing(p.x, p.y, r, '#fff1b0', 0.4); for (const e of query(p.x, p.y, r)) dealDamage(e, base * 0.6, 'light', {}); }
  if (S.spec === 'dark' && atk === 'base') zones.push({ kind: 'tide', x: p.x, y: p.y, r: 2.5 * M * D.area, t: 3, tick: 0, dmg: 4 * lvlScale() });
  if (nd('b_rage') && isBz()) { const r = 3 * M * D.area; addRing(p.x, p.y, r, '#ff6b5e', 0.4); for (const e of query(p.x, p.y, r)) dealDamage(e, base * 1.5, 'phys', {}); }
}
function counterSwing() {
  const fin = syn('counter'), dmg = wDmg() * (fin ? 1.8 + (nd('opening') ? 0.6 : 0) : 1);
  arcHit(0, 360, wRange() * 1.1, dmg, { fin, knock: true, knockDist: 1.6, color: '#cfe8ff', expo: S.spec === 'paladin' });
}
function farthest(x, y, r) { let best = null, bd = -1; for (const e of query(x, y, r)) { const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d > bd) { bd = d; best = e; } } return best; }
function startLeap(s) { const L = S.leapS, p = S.player; L.fx = p.x; L.fy = p.y; L.tx = s.x; L.ty = s.y; L.u = 0; L.phase = 'air'; }
function leapSlam() { sfx('boom');
  const p = S.player, R = 3 * M * D.area * stv('leap', 'size') * (nd('meteor') ? 2 : 1), dmg = stv('leap', 'dmg') * lvlScale();
  addRing(p.x, p.y, R, '#ffcf8a', 0.45); S.shake = Math.min(12, S.shake + 6); smash(p.x, p.y, R); burst(p.x, p.y, '#a19582', 18, 160);
  for (const e of query(p.x, p.y, R)) { applyStun(e, stv('leap', 'stun') * D.dur); applyKnock(e, p.x, p.y, 1.5 * M); dealDamage(e, nd('meteor') && !e.elite && e.type !== 'nest' ? dmg * 3 : dmg, 'phys', { crit: syn('thunder') }); leech(); }
  gainRage(4);
  addSlash(p.x, p.y, 0, 360, R, '#ffcf8a', true);
  if (nd('crack')) zones.push({ kind: 'crack', x: p.x, y: p.y, r: 2.5 * M * D.area, t: 3, tick: 0, dmg: 5 * lvlScale() });
}
function checkSyn() {
  for (const s of SYN) if (!S.syn.has(s.id) && s.need.every(id => nd(id) > 0)) {
    S.syn.add(s.id); S.run.syn.push({ id: s.id, t: +S.t.toFixed(1) });
    sfx('synergy'); banner('协同：' + s.name, s.text, '#ffd28a', 3); slowT = 1; S.flashes.push({ x: S.player.x, y: S.player.y, r: 12 * M, t: 0.5 }); S.shake = 8;
  }
}
const inTemp = (x, y) => isW() && S.tempLights.some(L => (x - L.x) ** 2 + (y - L.y) ** 2 < L.r * L.r);
function updWarrior(dt) {
  const p = S.player, W = S.whirl, L = S.leapS, X = S.axeS;
  p.still = p.moving ? 0 : (p.still || 0) + dt; p.swingT = (p.swingT || 0) - dt;
  S.momT -= dt; S.parryT -= dt; S.comboReset -= dt; if (S.comboReset <= 0) S.combo = 0;
  S.rageIdle += dt; if (S.rageIdle > 3 && S.spec !== 'berserker') S.rage = Math.max(0, S.rage - 10 * dt);
  if (S.berserkT > 0) { S.berserkT -= dt; if (S.berserkT <= 0 && nd('undying')) heal(0.25); }
  // 进阶职业
  if (S.spec === 'paladin') {
    heal(0.01 * dt);
    S.palT -= dt; if (S.palT <= 0) { S.palT = 0.5; for (const e of query(p.x, p.y, S.lr)) dealDamage(e, 4 * lvlScale(), 'light', { weak: true }); }
    if (nd('p_shield')) { S.palShieldT -= dt; if (S.palShieldT <= 0) { S.palShieldT = 8; p.shield = Math.max(p.shield, 0.2 * D.maxHp); p.shieldT = 8; } }
    if (nd('p_judge')) { S.judgeT -= dt; if (S.judgeT <= 0) { S.judgeT = 3; for (const e of nearestN(p.x, p.y, S.lr * 1.2, 3)) { addArc(e.x, e.y - 160, e.x, e.y, '#fff1b0', 0.25, 4); addRing(e.x, e.y, 0.8 * M, '#fff1b0', 0.3); dealDamage(e, 30 * lvlScale(), 'light', {}); } } }
    if (nd('p_beacon')) { S.beaconT -= dt; if (S.beaconT <= 0) { S.beaconT = 45; S.tempLights.push({ x: p.x, y: p.y, r: 5 * M, t: 12 }); banner('灯塔降临', '12 秒内，站在这盏灯下灰潮停涨', '#fff1b0', 2); } }
  }
  for (const T of S.tempLights) T.t -= dt; S.tempLights = S.tempLights.filter(T => T.t > 0);
  if (S.spec === 'dark') {
    S.devourT -= dt;
    if (nd('d_devour')) { S.devourCd -= dt; if (S.devourCd <= 0 && S.conc >= 30) { S.devourCd = 40; const d = lowerTide(15); S.devourT = 15; addRing(p.x, p.y, 6 * M, '#b79cff', 0.6); banner('吞潮', `吸走 ${Math.round(d)} 点浓度：15 秒攻速 +30%、伤害 +40%`, '#b79cff', 2.5); } }
    for (const m of S.minions) {
      m.t -= dt; m.atkT -= dt;
      const tg = nearest(m.x, m.y, 8 * M);
      const tx = tg ? tg.x : p.x + Math.cos(m.ph) * 40, ty = tg ? tg.y : p.y + Math.sin(m.ph) * 40, dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1;
      if (tg && d < 0.8 * M + tg.r) { if (m.atkT <= 0) { m.atkT = 0.6; dealDamage(tg, 6 * lvlScale(), 'phys', {}); if (nd('d_legion')) applyStatus(tg, 'burn', 1); } }
      else if (d > 10) { m.x += dx / d * 5 * M * dt; m.y += dy / d * 5 * M * dt; }
    }
    S.minions = S.minions.filter(m => m.t > 0);
  }
  // 冲锋劈
  if (S.dash) {
    const Dd = S.dash; Dd.u += dt / 0.12; const u = Math.min(1, Dd.u); p.x = Dd.fx + (Dd.tx - Dd.fx) * u; p.y = Dd.fy + (Dd.ty - Dd.fy) * u; p.iframes = Math.max(p.iframes, 0.1);
    if (u >= 1) { S.dash = null; arcHit(Dd.ang, 160, wRange() * 1.1, Dd.dmg, Dd.fo); }
  }
  // 跃斩
  if (nd('leap')) {
    if (L.phase) {
      L.u += dt / 0.35; const u = Math.min(1, L.u); p.x = L.fx + (L.tx - L.fx) * u; p.y = L.fy + (L.ty - L.fy) * u; p.iframes = Math.max(p.iframes, 0.12);
      if (u >= 1) { L.phase = null; leapSlam(); if (nd('double') && !L.second) { L.second = true; const s = densest(p.x, p.y, 8 * M); if (s) startLeap(s); else L.second = false; } else L.second = false; }
    } else { L.cd -= dt; if (L.cd <= 0 && !S.dash) { const s = densest(p.x, p.y, 9 * M); if (s) { L.cd = stv('leap', 'cd') * D.cdMul; startLeap(s); } } }
  }
  // 旋风
  if (nd('whirl')) {
    if (W.t > 0) {
      W.t -= dt; W.tick -= dt; W.ang += dt * 14;
      if (nd('vortex')) for (const e of query(p.x, p.y, 4 * M)) if (e.type !== 'nest' && !e.elite) { const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > 1.2 * M) { e.x += dx / d * 3 * M * dt; e.y += dy / d * 3 * M * dt; } }
      if (W.tick <= 0) {
        W.tick = 0.25 / stv('whirl', 'spd'); const R = 2.2 * M * D.area * stv('whirl', 'size'), dmg = stv('whirl', 'dmg') * lvlScale();
        W.dmg += dmg; for (const e of query(p.x, p.y, R)) { dealDamage(e, dmg, 'phys', {}); if (syn('bloodwhirl')) { gainRage(0.4); heal(0.004); } else leech(); }
        smash(p.x, p.y, R); addSlash(p.x, p.y, W.ang, 300, R, '#ffe2b0', false);
      }
      if (W.t <= 0) {
        W.cd = stv('whirl', 'cd') * D.cdMul;
        if (nd('eye') && W.dmg > 0) { const R = 4.5 * M * D.area, d = W.dmg * 0.6; addRing(p.x, p.y, R, '#ffffff', 0.45); S.shake = Math.min(10, S.shake + 5); for (const e of query(p.x, p.y, R)) { applyKnock(e, p.x, p.y, 1.5 * M); dealDamage(e, d, 'phys', {}); } }
        W.dmg = 0;
      }
    } else { W.cd -= dt; if (W.cd <= 0 && query(p.x, p.y, 4 * M).length) { W.t = stv('whirl', 'dur') * D.dur + (nd('swiftspin') ? 1 : 0); W.tick = 0; } }
  }
  // 飞斧（战技）
  if (nd('axe')) {
    X.cd -= dt;
    if (X.cd <= 0) { const f = farthest(p.x, p.y, 10 * M); if (f) { X.cd = stv('axe', 'cd') * D.cdMul; X.n++; const dmg = stv('axe', 'dmg') * lvlScale(), ang = Math.atan2(f.y - p.y, f.x - p.x), hook = nd('hook') > 0, sz = stv('axe', 'size'), ao = { hook, spd: 13 * M * stv('axe', 'spd') * D.pspd, r: 12 * sz, max: 7 * M * (0.85 + 0.15 * sz) };
      const n = (Math.round(stv('axe', 'count')) + Math.floor(D.count + 1e-6)) * (nd('twinaxe') ? 2 : 1);
      if (nd('rain') && X.n % 3 === 0) { const m = 8 + 4 * (n - 1); for (let i = 0; i < m; i++) throwProj('axe', i * 2 * Math.PI / m, dmg, ao); }
      else for (let i = 0; i < n; i++) throwProj('axe', ang + (i - (n - 1) / 2) * 0.32, dmg, ao); } }
  }
  // 投射物
  for (const q of S.projs) {
    if (!q.ret) { q.x += Math.cos(q.ang) * q.spd * dt; q.y += Math.sin(q.ang) * q.spd * dt; q.dist += q.spd * dt; if (q.dist >= q.max) { if (q.boom) { q.ret = true; q.hit = new Set(); } else q.dead = true; } }
    else { const dx = p.x - q.x, dy = p.y - 6 - q.y, d = Math.hypot(dx, dy) || 1; q.x += dx / d * q.spd * 1.2 * dt; q.y += dy / d * q.spd * 1.2 * dt; if (d < 18) { q.dead = true; if (q.atk && S.spec === 'paladin') heal(0.01); } }
    q.rot += dt * 18;
    if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 > (40 * M) ** 2) q.dead = true;
    for (const e of query(q.x, q.y, q.r)) {
      if (q.hit.has(e)) continue; q.hit.add(e);
      if (q.weapon) { wHit(e, q.dmg, { kx: q.x, ky: q.y, expo: q.kind === 'wave' && S.spec === 'paladin', burn: q.atk && S.spec === 'dark' }); gainRage(q.atk ? 0.8 : 0.4); if (e.dead && q.kind === 'wave' && S.spec === 'dark' && atkMode() === 'wave' && Math.random() < 0.3) summon(e.x, e.y); }
      else { dealDamage(e, q.dmg, 'phys', {}); gainRage(0.3); }
      if (q.hook && !q.ret && !e.elite && e.type !== 'nest' && e.type !== 'boss') { const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1; e.kbx = dx / d * Math.min(d, 6 * M) * 4; e.kby = dy / d * Math.min(d, 6 * M) * 4; e.knockT = 1; if (syn('reel')) applyStun(e, 1); }
    }
  }
  S.projs = S.projs.filter(q => !q.dead);
  // 普攻
  if (!(W.t > 0) && !L.phase && !S.dash) {
    const atk = atkMode();
    const as = stv('blade', 'aspd') * D.aspd + (S.momT > 0 ? 0.3 : 0) + (isBz() ? 0.4 : 0) + (S.devourT > 0 ? 0.3 : 0) + (S.spec === 'berserker' && atk === 'split' && isBz() ? 0.4 : 0);
    S.atkT -= dt;
    if (S.atkT <= 0) { const rr = atk === 'throw' ? 6 * M : wRange() + 0.8 * M; let t = null, bm = rr * rr; for (const e of query(p.x, p.y, rr)) if (e.type === 'moth' && !e.dead) { const d = d2(e, p); if (d < bm) { bm = d; t = e; } } t = t || nearest(p.x, p.y, rr); if (t) { S.atkT = ATK_CD[atk] / as; doSwing(t); } else S.atkT = 0; }
  }
}
function openBench() {
  S.benchDone = true;
  const opts = shuffle(Object.keys(AXEMODS.atk.opts)).slice(0, 3).map(k => ({ kind: 'mod', id: 'atk:' + k, slot: '改造', rar: 0 }));
  if (window.__bot && window.__botFast) { applyOption(pickU(opts)); return; }
  showPanel(`<div class="panel"><div><div class="title">WORKBENCH</div><h2>改装工作台：选一种普攻模式</h2><div class="sub">斧头还是那把斧头，只是挥法变了。之后储物柜里还能换终结技，也能再换普攻；斧刃效果（燃斧、雷斧……）在升级时出现。按 1 / 2 / 3 或点击。</div></div><div class="cards">${opts.map(cardHTML).join('')}</div></div>`,
    i => applyOption(opts[i]), { kind: 'bench', options: opts });
  if (window.__bot) setTimeout(() => pickCard((Math.random() * 3) | 0), 0);
}
function openOath() {
  const ks = Object.keys(SPECS), atk = atkMode(), aff = k => SPECS[k].affinity.reduce((a, t) => a + treePts(t), 0);
  if (window.__bot && window.__botFast) { swear(pickU(ks)); return; }
  const opts = ks.map(k => ({ kind: 'spec', id: k }));
  showPanel(`<div class="panel"><div><div class="title">OATH</div><h2>誓约碑：选一条路</h2><div class="sub">转职后，之前的技能树、斧头改造、被动、祝福全部保留。每个职业多一套核心机制、一棵专属树（觉醒是它的终极），并改写一个旧节点。按 1 / 2 / 3 或点击。</div></div><div class="cards">${ks.map((k, i) => { const Sp = SPECS[k], a = aff(k); return `<button class="card" data-i="${i}" style="--r:${Sp.color}"><div class="head"><span class="name">${Sp.name}</span><span class="key">${i + 1}</span></div><div class="chips"><span class="chip${a ? ' tagm' : ''}">契合：${Sp.affinity.map(t => TREES[t].name).join('、')}${a ? ` · 已投 ${a} 点` : ''}</span></div><p><b>${Sp.tide}</b></p><p>${Sp.core}</p><p class="now">觉醒：${Sp.ult}</p><p class="now">改写：${Sp.rewrite}</p><p class="now">共鸣（${axeName('atk')}）：${Sp.reso[atk]}</p></button>`; }).join('')}</div></div>`,
    i => swear(ks[i]), { kind: 'oath', options: opts });
  if (window.__bot) setTimeout(() => pickCard((Math.random() * 3) | 0), 0);
}
function swear(k) {
  const Sp = SPECS[k]; S.spec = k; S.run.spec = { id: k, t: +S.t.toFixed(1) }; S.nodes[TREES[Sp.tree].nodes[0]] = 1;
  sfx('oath'); banner('誓约：' + Sp.name, Sp.core, Sp.color, 3.5); slowT = 1; S.flashes.push({ x: S.player.x, y: S.player.y, r: 14 * M, t: 0.6 }); S.shake = 8;
  recalc(); hudDirty = true;
}
// 选职业
let sel = null;
function selectPanel(html, n, onPick) {
  const ov = $('#overlay'); ov.innerHTML = html; ov.classList.add('on'); mode = 'select'; sel = { n, onPick, inRun: !!(S && S.t > 0.5 && mode !== 'title') };
  ov.querySelectorAll('.card').forEach(b => b.addEventListener('click', () => pickSel(+b.dataset.i)));
  const f = ov.querySelector('.card'); if (f) f.focus({ preventScroll: true });
}
function pickSel(i) { if (!sel || i < 0 || i >= sel.n) return; sfx('pick'); const s = sel; sel = null; s.onPick(i); }
function choosePact(cls) {
  const ks = Object.keys(PACT).filter(k => k !== 'swift' || unl('swift')), on = new Set();
  const render = () => { const ov = $('#overlay'); ov.innerHTML = `<div class="panel"><div><div class="title">PACT</div><h2>灰潮契约：要不要给自己加点难度</h2><div class="sub">每条契约一个代价换一个奖励，选 0–3 条。按 1–4 切换，Enter 出征。</div></div><div class="cards">${ks.map((k, i) => `<button class="card${on.has(k) ? ' on' : ''}" data-i="${i}" style="--r:${PACT[k].col}"><div class="head"><span class="name">${PACT[k].name}</span><span class="key">${i + 1}</span></div><div class="chips"><span class="chip ${on.has(k) ? 'need' : ''}">${on.has(k) ? '已选' : '未选'}</span></div><p>代价：${PACT[k].cost}</p><p class="now">换来：${PACT[k].gain}</p></button>`).join('')}</div><div class="row-btns"><button class="btn" id="go">出征（Enter）· 已选 ${on.size} 条</button><button class="btn ghost" id="back">返回</button></div></div>`; ov.classList.add('on'); mode = 'select';
    sel = { n: ks.length, onPick: i => { const k = ks[i]; if (on.has(k)) on.delete(k); else if (on.size < 3) on.add(k); render(); }, confirm: () => { sel = null; start(cls, null, [...on]); } };
    ov.querySelectorAll('.card').forEach(b => b.addEventListener('click', () => pickSel(+b.dataset.i))); $('#go').onclick = () => sel && sel.confirm(); $('#back').onclick = chooseClass; };
  render();
}
function chooseClass() {
  const statRow = c => { const B = CLS[c].base; return ['maxHp', 'armor', 'regen', 'speed', 'area', 'cdMul', 'knock', 'lightBase'].map(k => { const S0 = CSTAT.find(x => x[0] === k); return `<span class="pk">${S0[1]} ${S0[3](B[k])}</span>`; }).join(''); };
  const cls = [['arc', '弧光师', '#9fe8ff', '远程电系。六个技能各自升级、3 级选分支、满级配被动点燃。光圈持续放电，过载满了自动脉冲。'], ['warrior', '破障者', '#ffb454', '近战，一把消防斧。每一斧都把敌人砍得一顿、往后推半步；挨打后 3 秒没再受伤就开始喘息回血。4 级在改装工作台选普攻模式，储物柜换终结技，升级时选燃斧、雷斧、霜斧等普攻效果；到中心层的誓约碑（8 级）转职守灯骑士、狂战士或黑暗骑士。']];
  selectPanel(`<div class="panel"><div><div class="title">CLASS</div><h2>选职业</h2><div class="sub">按 1 / 2 或点击。</div></div><div class="cards">${cls.map((c, i) => `<button class="card" data-i="${i}" style="--r:${c[2]}"><div class="head"><span class="name">${c[1]}</span><span class="key">${i + 1}</span></div>${META.lastCls === c[0] ? '<div class="chips"><span class="chip">上次用的</span></div>' : ''}<p>${c[3]}</p><div class="afxbox"><div class="pool">${statRow(c[0])}</div>${CLS[c[0]].traits.map(t => `<div class="afx base">· ${t}</div>`).join('')}</div></button>`).join('')}</div><div class="row-btns"><button class="btn ghost" id="back">返回工坊</button></div></div>`,
    2, i => { META.lastCls = i ? 'warrior' : 'arc'; saveMeta(); choosePact(META.lastCls); });
  $('#back').onclick = titleScreen;
}


