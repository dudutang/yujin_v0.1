// ================= 数据：敌人 =================
const ETYPES = {
  shade: { name: '烬影', hp: 20, spd: 2.2, dmg: 6, r: 10, xp: 1 },
  moth: { name: '灰蛾', hp: 12, spd: 3.4, dmg: 15, r: 8, xp: 2 },
  shell: { name: '蚀壳', hp: 60, spd: 1.5, dmg: 14, r: 14, xp: 4 },
  nest: { name: '灰潮巢穴', hp: 500, spd: 0, dmg: 0, r: 26, xp: 20 },
  reaper: { name: '收灯人', hp: 1e9, spd: 2.0, dmg: 30, r: 16, xp: 0 },
  boss: { name: '蚀壳巨兽', hp: 5000, spd: 1.1, dmg: 12, r: 26, xp: 60 },
};
const AFFIX = {
  devour: { name: '吞光', color: '#7d5cff' },
  ashshield: { name: '灰盾', color: '#dfe3ea' },
  fission: { name: '裂变', color: '#ff5577' },
  resonance: { name: '共鸣', color: '#33d6a6' },
};
const PACT = {
  surge: { name: '潮涌', cost: '灰潮上涨速度 +30%', gain: '传说卡出现率 ×2，稀有 ×1.5', col: '#c9b6ff' },
  dim: { name: '薄灯', cost: '光圈 −20%', gain: '科技芯片掉率 +15%', col: '#7ff0c8' },
  frail: { name: '脆弱', cost: '生命上限 −20%', gain: '废料获取 ×1.5', col: '#ff8a80' },
  swift: { name: '疾潮', cost: '敌人速度 +15%，伤害 +10%', gain: '经验获取 +25%', col: '#ffd28a' },
};
const pact = k => !!(S && S.pact && S.pact[k]);
// 地图物件：取舍神龛、挑战神龛、贪婪碑、拾荒者、潮眼
const SHRINES = {
  tomb: { name: '守灯人之墓', col: '#9be08a', A: { t: '立刻 +1 级，生命上限 −10%', f: () => { S.tombHp = (S.tombHp || 0) - 0.1; S.pendingLv++; } }, B: { t: '生命上限 +15%，移速 −8%', f: () => { S.tombHp = (S.tombHp || 0) + 0.15; S.tombSlow = true; } } },
  penance: { name: '忏悔碑', col: '#ffd28a', A: { t: '立刻 +1 级，灰潮 +12', f: () => { S.conc += 12; S.pendingLv++; } }, B: { t: '本局经验 +25%，光圈 −20%', f: () => { S.penance = true; } } },
  rift: { name: '灰潮裂口', col: '#c9b6ff', A: { t: '灰潮 +25，换一张传说卡（路灯停涨期间不可用）', f: () => { S.conc += 25; S.forceMin = 3; S.pendingLv++; }, dis: () => S.held ? '路灯压着灰潮时裂口不开' : '' }, B: { t: '灰潮 −8', f: () => { lowerTide(8); } } },
  statue: { name: '灰影雕像', col: '#b79cff', A: { t: '一张稀有卡，但召来 2 个吞光精英（不掉芯片）', f: () => { S.forceMin = 2; S.pendingLv++; const p = S.player; for (let i = 0; i < 2; i++) { const a = i * 3.14 + 0.5, e = spawnEnemy(i ? 'shell' : 'shade', true, p.x + Math.cos(a) * 7 * M, p.y + Math.sin(a) * 7 * M); e.aff = ['devour', ...e.aff.filter(x => x !== 'devour')].slice(0, 2); e.noChip = true; } } }, B: { t: '下 3 次升级至少罕见', f: () => { S.lucky3 = (S.lucky3 || 0) + 3; } } },
};
const SCAV_P = [
  { id: 'preroll', name: '零件换重随', text: '3 零件换本局重随 +1', cost: 3, f: () => { S.rerolls++; } },
  { id: 'pchip', name: '零件换芯片', text: '6 零件换一个光环芯片', cost: 6, f: () => { S.pendingChip = (S.pendingChip || 0) + 1; } },
];
const SCAV = [
  { id: 'reroll', name: '重随骰子', text: '本局重随 +1', f: () => { S.rerolls++; } },
  { id: 'ban', name: '禁用骰子', text: '本局禁用 +1', f: () => { S.bans++; } },
  { id: 'chip', name: '科技芯片', text: '一个光环芯片', f: () => { S.pendingChip = (S.pendingChip || 0) + 1; } },
  { id: 'med', name: '急救包', text: '回复 40% 生命', f: () => { S.player.hp = Math.min(D.maxHp, S.player.hp + 0.4 * D.maxHp); } },
];
const scavPrice = () => unl('scavfree') && !(S.scavBought || 0) ? 0 : 12 + 4 * (S.scavBought || 0);
const LAYERS = [
  { name: '外围', r0: 0, r1: 45 * M, floor: 0, scrap: 0.08, ground: '#1b1f28' },
  { name: '中心', r0: 45 * M, r1: 95 * M, floor: 30, scrap: 0.12, ground: '#181a22', rec: 8 },
  { name: '深处', r0: 95 * M, r1: Infinity, floor: 60, scrap: 0.2, ground: '#15151b', rec: 14 },
];
const needXp = l => l <= 3 ? [0, 5, 9, 14][l] : Math.round(4 + 2.6 * Math.pow(l, 1.5));
const layerAt = (x, y) => { const d = x * x + y * y; return d < LAYERS[1].r0 * LAYERS[1].r0 ? 0 : d < LAYERS[2].r0 * LAYERS[2].r0 ? 1 : 2; };
const REPAIR_COST = 8, LAMP_BASE = 60;
// 工坊存档（只在这个浏览器里）
const META_KEY = 'ember-proto-meta';
function loadMeta() { const d = { scrap: 0, part: 0, tech: {}, tapes: [], runs: 0, q: {}, unl: {}, gear: { eq: {}, bag: [] } }; try { const m = JSON.parse(localStorage.getItem(META_KEY) || 'null'); if (m) return Object.assign(d, m); } catch (e) { } return d; }
function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch (e) { } }
let META = loadMeta();
const QUESTS = [
  { id: 'lv12', name: '老手', text: '累计 3 局升到 12 级', need: 3, unlock: 'reroll', gain: '每局起始重随 +1', prog: R => R.level >= 12 ? 1 : 0 },
  { id: 'elite', name: '猎手', text: '累计击杀 10 个精英', need: 10, unlock: 'statue', gain: '神龛：灰影雕像会出现', prog: R => R.elites || 0 },
  { id: 'syn', name: '构筑师', text: '累计触发 5 次协同或点燃', need: 5, unlock: 'swift', gain: '契约：疾潮', prog: R => (R.syn ? R.syn.length : 0) + (R.ignitions ? R.ignitions.length : 0) },
  { id: 'boss', name: '屠兽', text: '击杀蚀壳巨兽 1 次', need: 1, unlock: 'rift', gain: '神龛：灰潮裂口会出现', prog: R => R.boss || 0 },
  { id: 'chest', name: '撬锁', text: '累计打开 20 个储物柜', need: 20, unlock: 'scavfree', gain: '拾荒者每局第一件免费', prog: R => R.chests || 0 },
  { id: 'fall', name: '余烬不灭', text: '累计倒下 3 次', need: 3, unlock: 'keep', gain: '倒下也保留 15% 废料', prog: R => R.outcome === 'dead' ? 1 : 0 },
];
const unl = k => !!(META.unl && META.unl[k]);
function questTick(R) { META.q = META.q || {}; META.unl = META.unl || {}; const done = []; for (const Q of QUESTS) { if (META.unl[Q.unlock]) continue; META.q[Q.id] = Math.min(Q.need, (META.q[Q.id] || 0) + Q.prog(R)); if (META.q[Q.id] >= Q.need) { META.unl[Q.unlock] = true; done.push(Q); } } return done; }
const questHTML = () => QUESTS.map(Q => `<li>${META.unl && META.unl[Q.unlock] ? '<b class="ok">✓ ' + Q.name + '</b>' : `<b>${Q.name}</b> <span class="hint">${(META.q && META.q[Q.id]) || 0}/${Q.need}</span>`}：${Q.text}<br><span class="hint">解锁：${Q.gain}</span></li>`).join('');
const hasT = id => !!META.tech[id] || (id === 'four' && typeof gearU === 'function' && gearU('ring'));
const lampStore = () => hasT('lampcap') ? 150 : LAMP_BASE;
const passSlots = () => 4 + (hasT('pslot') ? 1 : 0);
const TECH = [
  { id: 'hood', name: '厚灯罩', line: '电网', cost: [40, 0], text: '光圈 +15%' },
  { id: 'reroll', name: '重随', line: '档案', cost: [40, 3], text: '每局 1 次：把一组三选一整组重抽（按 R）' },
  { id: 'lampcap', name: '路灯扩容', line: '电网', cost: [60, 4], text: '路灯压住灰潮的时间 60 → 150 秒' },
  { id: 'ban', name: '禁用', line: '档案', cost: [60, 6], text: '每局 1 次：把一张卡从本局卡池里删掉' },
  { id: 'safe', name: '保险箱', line: '电网', cost: [60, 6], text: '倒下时保住 30% 的废料和零件' },
  { id: 'startbless', name: '起始祝福', line: '档案', cost: [80, 8], text: '出征前先选一条老守灯人的祝福' },
  { id: 'pslot', name: '第五个被动槽', line: '军械', cost: [100, 10], text: '被动槽 4 → 5' },
  { id: 'four', name: '第四个选项', line: '档案', cost: [150, 20], text: '升级时变成四选一' },
];
const TAPES = [
  '第一盘。灯又闪了一下。我把备用柴油搬上了二楼，钥匙在罐头盒里。',
  '雾从海上来的那晚，研究所那边先黑了。不是停电，是光被吃掉了。',
  '它们怕光，但不怕火把的光。要稳定的、电的光。我也说不清为什么。',
  '小满问我灯塔为什么叫余晖站。我说太阳落了，总得有人接着亮。',
  '我年轻时在辉光研究所画过图纸。主灯的线圈，是我亲手绕的。',
  '他们管那个项目叫"影光"，从阴影里取电。听起来像诗，做起来像赌博。',
  '灰潮往没有光的地方流，像水往低处走。所以别让灯灭，一秒都别。',
  '今天在商场门口看见一个影子，站着不动，喊我的名字。我没回头。',
  '老冯说我该把真相写下来。可写下来的东西，灰会先找到。',
  '主灯越亮，来的东西越多。它是墙，也是钟。我早该想到的。',
  '如果你听到这盘，说明灯还亮着。替我谢谢你，也替我说声对不起。',
  '最后一盘。研究所地下室有一份图纸，能把灯反过来用。代价是有人得留下。',
];


