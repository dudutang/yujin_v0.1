// ================= 灯魂（学 Death Must Die：每次升级一位灯魂来访，三张卡全是她的） =================
const GODS = {
  thunder: { pr: '他', name: '雷 · 弧光', who: '老冯', col: '#9fe8ff', lt: 'cyan', line: '电是最老实的东西，你给它一条路，它就走到底。', lines: ['线别缠在一起。缠在一起就都断。', '感电的东西会把电传给旁边的。记住这个。', '我修了三十年灯。灯没救我，电救了。'], elem: 'elec', status: 'shock' },
  fire: { pr: '他', name: '焰 · 炉火', who: '阿焰', col: '#ff9a4a', lt: 'ember', line: '灰怕火。别问我怎么知道的。', lines: ['烧起来的东西死了也还在烧，这就是火的好处。', '我以前烧锅炉。现在烧别的。', '着火了就别停下，火跟着你走。'], elem: 'fire', status: 'burn' },
  frost: { pr: '她', name: '霜 · 寒夜', who: '白婆', col: '#9fd0ff', lt: 'cyan', line: '冷下来，它们就不动了。不动的东西好打。', lines: ['五层霜，一块冰。冰是会碎的。', '它们身上挂的东西越多，越经不起冷。', '我没死在灰里。我死在冬天。'], elem: 'frost', status: 'chill' },
  light: { pr: '他', name: '光 · 守灯', who: '守灯人', col: '#ffe9a8', lt: 'lamp', line: '灯亮着，就还有规矩。', lines: ['照清楚了再打。照清楚的东西挨打更疼。', '挡一下，就够你回过神来。', '每二十五秒，我把灯举高一次。'], elem: 'light', status: 'expo' },
  curse: { pr: '它', name: '蚀 · 灰潮', who: '无名', col: '#c9b6ff', lt: 'violet', line: '你用灰打灰，它们分不清谁是谁。', lines: ['一秒半。数到一秒半，它就炸。', '死的东西会把病传给活的。我就是这么来的。', '乌鸦不是我的。乌鸦是它们的。'], elem: 'curse', status: 'curse' },
  time: { pr: '他', name: '时 · 钟表匠', who: '钟表匠', col: '#8fe6a6', lt: 'green', line: '慢一点，看清楚了再走。', lines: ['你多活一秒，就多升一级。', '我把钟拆了。灰也要按我的钟走。', '身后那个是你。别回头看。'], elem: 'time', status: null },
  fate: { pr: '她们', name: '命 · 命运', who: '三姐妹', col: '#f4f1ff', lt: 'white', line: '不急。你的线还长。', lines: ['我们不挑人。我们只给线。', '想换一位？我们不介意。', '线还没到头。走吧。'], elem: null, status: null },
};
const GOD_ORDER = ['thunder', 'fire', 'frost', 'light', 'curse', 'time'];
const TYPE_N = { atk: '普攻改造', lamp: '提灯', strike: '击发', cast: '施放', power: '威能', summon: '召唤', legend: '传奇', passive: '被动' };
const SLOT_CAP = { atk: 1, lamp: 1, strike: 3, cast: 3, power: 2, summon: 1 };
const EC = { elec: '#bfe6ff', fire: '#ffb06a', frost: '#bfe9ff', light: '#fff1b0', curse: '#c9b6ff', time: '#9be08a', phys: '#d9d4c8' };
// 祝福：id → 灯魂、槽位类型、名字、描述模板（{k} 会替换成当前词条值）、等级上限
const BL = {
  // 雷
  t_atk: { god: 'thunder', type: 'atk', name: '分叉弧', elem: 'elec', max: 10, txt: '焊枪电弧跳向额外 {chain} 个敌人（每跳 70%）。伤害 {dmg}，每 {cd} 一发，感电 45%' },
  t_lamp: { god: 'thunder', type: 'lamp', name: '雷芯', max: 10, txt: '光圈每 0.5 秒电击圈内敌人 {dmg}，感电 {chance}' },
  t_strike: { god: 'thunder', type: 'strike', name: '链闪', max: 8, txt: '普攻命中 {chance} 概率：从目标向 {count} 个敌人放电 {dmg}' },
  t_coil: { god: 'thunder', type: 'cast', name: '电容线圈', max: 8, txt: '{count} 个线圈绕身旋转，碰到就放电 {dmg}（每 0.5 秒一次）' },
  t_rod: { god: 'thunder', type: 'cast', name: '避雷针', max: 8, txt: '每 {cd} 在敌群里插 {count} 根针，嘲讽 4 米内敌人并每 0.5 秒放电 {dmg}，持续 {dur}' },
  t_short: { god: 'thunder', type: 'power', name: '短路', max: 8, txt: '受伤时向 {count} 个敌人放电 {dmg}（间隔 {cd}）' },
  t_ball: { god: 'thunder', type: 'summon', name: '球状闪电', max: 8, txt: '一团球状闪电在你身边游走，碰到的敌人每 0.4 秒受电伤 {dmg}' },
  t_legend: { god: 'thunder', type: 'legend', name: '雷暴', txt: '每 0.6 秒，所有感电敌人之间连起电弧（15 电伤，9 米内）。感电上限 3 → 5 层' },
  // 焰
  f_atk: { god: 'fire', type: 'atk', name: '灼烧弧', elem: 'fire', max: 10, txt: '焊枪改喷火弧：伤害 {dmg}，每 {cd} 一发，燃烧 {chance}' },
  f_lamp: { god: 'fire', type: 'lamp', name: '火芯', max: 10, txt: '光圈每 0.5 秒灼烧圈内敌人 {dmg}，燃烧 {chance}' },
  f_strike: { god: 'fire', type: 'strike', name: '火息', max: 8, txt: '普攻命中 {chance} 概率：朝目标方向喷出 3 米火锥 {dmg}（范围 {size}），60% 点燃' },
  f_meteor: { god: 'fire', type: 'cast', name: '流星', max: 8, txt: '每 {cd} 在最密集处落 {count} 颗流星：{dmg} 火伤 + 击退，留 2 秒地火（范围 {size}）' },
  f_ground: { god: 'fire', type: 'cast', name: '地火', max: 8, txt: '每 {cd} 在脚下留一片火地 {dur}：每 0.5 秒 {dmg} 火伤，30% 点燃（范围 {size}）' },
  f_ember: { god: 'fire', type: 'power', name: '余烬', max: 8, txt: '燃烧中的敌人死亡时留下 {dur} 火地（每 0.5 秒 {dmg}，范围 {size}）' },
  f_elem: { god: 'fire', type: 'summon', name: '火精灵', max: 8, txt: '{count} 只火精灵追着敌人打：每 0.6 秒 {dmg} 火伤，60% 点燃' },
  f_legend: { god: 'fire', type: 'legend', name: '炼狱', txt: '敌人身上每一种状态每秒给你 1 经验（上限 30/秒）。燃烧上限 5 → 10 层' },
  // 霜
  c_atk: { god: 'frost', type: 'atk', name: '霜弧', elem: 'frost', max: 10, txt: '焊枪改寒气弧：伤害 {dmg}，每 {cd} 一发，冰缓 {chance}；对冰冻敌人 +50%' },
  c_lamp: { god: 'frost', type: 'lamp', name: '霜芯', max: 10, txt: '光圈每 0.5 秒 {chance} 概率冰缓圈内敌人并造成 {dmg}，光圈减速 +{slow}' },
  c_strike: { god: 'frost', type: 'strike', name: '冰刺', max: 8, txt: '普攻命中 {chance} 概率：从目标炸出 {count} 根冰刺 {dmg}，冰缓' },
  c_ring: { god: 'frost', type: 'cast', name: '霜环', max: 8, txt: '每 {cd} 以你为中心炸开 3.5 米冰环 {dmg}（范围 {size}），冰缓 2 层' },
  c_zone: { god: 'frost', type: 'cast', name: '霜域', max: 8, txt: '每 {cd} 在最密集处放 {dur} 霜域：每 0.5 秒 {dmg}，30% 冰缓（范围 {size}）' },
  c_trail: { god: 'frost', type: 'power', name: '霜径', max: 8, txt: '走过的路留下 {dur} 霜迹：每 0.5 秒 {dmg}，30% 冰缓（范围 {size}）' },
  c_deer: { god: 'frost', type: 'summon', name: '霜鹿', max: 8, txt: '每 {cd} 一只霜鹿从你脚下冲过敌群 8 米：{dmg} 寒伤，冰缓 2 层（范围 {size}）' },
  c_legend: { god: 'frost', type: 'legend', name: '碎裂', txt: '冰缓或冰冻的敌人生命低于 20% 时直接碎掉（精英 10% 概率，Boss 无效）' },
  // 光
  l_atk: { god: 'light', type: 'atk', name: '审判弧', elem: 'light', max: 10, txt: '焊枪改审判弧：伤害 {dmg}，每 {cd} 一发，暴击率 +{crit}；每第 4 次命中必暴击并曝光' },
  l_lamp: { god: 'light', type: 'lamp', name: '光芯', max: 10, txt: '光圈每 0.5 秒 {chance} 概率曝光圈内敌人并造成 {dmg}；光圈 ×{size}，圈内受伤 −10%' },
  l_strike: { god: 'light', type: 'strike', name: '光束', max: 8, txt: '普攻命中 {chance} 概率：一道 6 米穿透光束 {dmg}（宽度 {size}），45% 曝光' },
  l_judge: { god: 'light', type: 'cast', name: '审判', max: 8, txt: '每 {cd} 一道闪光：13 米内所有敌人受 {dmg} 光伤并曝光' },
  l_pillar: { god: 'light', type: 'cast', name: '光柱', max: 8, txt: '每 {cd} 在最近敌人处落下光柱 {dmg}（范围 {size}），眩晕 {stun}' },
  l_shield: { god: 'light', type: 'power', name: '神圣护盾', max: 8, txt: '每 {cd} 挡下一次伤害，挡下时对周围放 {dmg} 光伤（范围 {size}）' },
  l_reprisal: { god: 'light', type: 'power', name: '惩戒', max: 8, txt: '打中你的敌人被眩晕 {stun} 并受 {dmg} 光伤' },
  l_arbiter: { god: 'light', type: 'summon', name: '仲裁者', max: 8, txt: '{count} 把光剑绕身旋转，碰到就斩 {dmg}（每 0.5 秒一次），40% 曝光' },
  l_legend: { god: 'light', type: 'legend', name: '审判日', txt: '每 25 秒，14 米内所有非精英敌人直接死亡；精英和 Boss 失去 10% 最大生命' },
  // 蚀
  k_atk: { god: 'curse', type: 'atk', name: '蚀弧', elem: 'curse', max: 10, txt: '焊枪改灰蚀弧：伤害 {dmg}，每 {cd} 一发，诅咒 {chance}；对生命低于 30% 的敌人 +30%' },
  k_lamp: { god: 'curse', type: 'lamp', name: '蚀芯', max: 10, txt: '光圈每 0.5 秒 {chance} 概率诅咒圈内敌人并造成 {dmg}；圈内每次击杀回 1 生命' },
  k_strike: { god: 'curse', type: 'strike', name: '魂刃', max: 8, txt: '普攻命中 {chance} 概率：幻影镰刀砍向 {count} 个敌人：{dmg} + 8% 当前生命，诅咒' },
  k_doom: { god: 'curse', type: 'cast', name: '骤死', max: 8, txt: '每 {cd} 引爆 5 米内所有诅咒（范围 {size}），结算 {dmg}' },
  k_snakes: { god: 'curse', type: 'cast', name: '黑蛇', max: 8, txt: '每 {cd} 放出 {count} 条黑蛇：穿透 3 个敌人，{dmg} 蚀伤并诅咒' },
  k_fear: { god: 'curse', type: 'power', name: '恐惧', max: 8, txt: '普攻和技能直接命中的普通敌人 {chance} 概率吓跑 {dur}（精英、Boss 无效）' },
  k_ravens: { god: 'curse', type: 'summon', name: '乌鸦', max: 8, txt: '{count} 只乌鸦轮流俯冲敌人：{dmg} 蚀伤并诅咒' },
  k_legend: { god: 'curse', type: 'legend', name: '瘟疫', txt: '敌人死亡时身上所有状态传给 3 米内的敌人；状态伤害 +30%' },
  // 时
  m_atk: { god: 'time', type: 'atk', name: '扭曲弧', elem: 'time', max: 10, txt: '焊枪改时光弧：伤害 {dmg}，每 {cd} 一发；命中 {chance} 概率让敌人吐出 1 点经验' },
  m_lamp: { god: 'time', type: 'lamp', name: '时芯', max: 10, txt: '光圈减速 +{slow}，光圈 ×{size}；光圈电击 {dmg}（感电照旧）' },
  m_strike: { god: 'time', type: 'strike', name: '能量飞弹', max: 8, txt: '普攻命中 {chance} 概率：向 {count} 个敌人发射追踪飞弹 {dmg}' },
  m_field: { god: 'time', type: 'cast', name: '时间力场', max: 8, txt: '每 {cd} 在脚下放 {dur} 力场（范围 {size}）：敌人慢 60%，每 0.5 秒 {dmg}' },
  m_rewind: { god: 'time', type: 'cast', name: '回溯', max: 8, txt: '每 {cd} 回复 {heal} 生命' },
  m_gemini: { god: 'time', type: 'power', name: '双子', max: 8, txt: '每次施放有 {chance} 概率在四分之一秒后再放一次' },
  m_clone: { god: 'time', type: 'summon', name: '残影', max: 8, txt: '一个残影跟在你身后，每 {cd} 复制一次你的普攻（{dmg} 伤害）' },
  m_legend: { god: 'time', type: 'legend', name: '时光之味', txt: '光圈内的敌人每秒失去 3% 最大生命（Boss 1%）。光圈 +15%' },
  // 命
  x_legend: { god: 'fate', type: 'legend', name: '先发制人', txt: '对满血的敌人伤害 ×4' },
};
const BL_ST = {
  t_atk: { dmg: [9, 2.6], chain: [2, 1, 6], cd: [0.9, -0.05, 0.45] }, t_lamp: { dmg: [6, 1.8], chance: [0.5, 0.08, 1] }, t_strike: { chance: [0.3, 0.06, 0.8], count: [3, 1, 7], dmg: [10, 3] },
  t_coil: { dmg: [10, 3], count: [2, 1, 8], size: [1, 0.12, 2.2], spd: [1, 0.15, 2.5] }, t_rod: { dmg: [7, 2.1], count: [1, 1, 5], dur: [5, 1, 12], cd: [6, -0.5, 2.5] }, t_short: { dmg: [18, 5], count: [3, 1, 8], cd: [3, -0.3, 0.8] }, t_ball: { dmg: [12, 3.5], size: [1, 0.15, 2.5], spd: [1, 0.15, 2.5] },
  f_atk: { dmg: [10, 3], chance: [0.6, 0.08, 1], cd: [0.9, -0.05, 0.45] }, f_lamp: { dmg: [4, 1.4], chance: [0.3, 0.06, 0.8] }, f_strike: { chance: [0.35, 0.06, 0.8], dmg: [14, 4], size: [1, 0.15, 2.2] },
  f_meteor: { dmg: [40, 12], cd: [4, -0.3, 1.6], size: [1, 0.15, 2.2], count: [1, 1, 4] }, f_ground: { dmg: [6, 2], cd: [3, -0.25, 1.2], size: [1, 0.15, 2.2], dur: [4, 0.8, 10] }, f_ember: { dmg: [5, 1.5], size: [1, 0.2, 2.6], dur: [2, 0.5, 6] }, f_elem: { dmg: [8, 2.5], count: [2, 1, 5], spd: [1, 0.15, 2.2] },
  c_atk: { dmg: [9, 2.6], chance: [0.6, 0.08, 1], cd: [0.9, -0.05, 0.45] }, c_lamp: { chance: [0.3, 0.06, 0.8], slow: [0.2, 0.05, 0.5], dmg: [2, 1] }, c_strike: { chance: [0.35, 0.06, 0.8], count: [4, 1, 10], dmg: [10, 3] },
  c_ring: { dmg: [20, 6], cd: [5, -0.4, 2], size: [1, 0.15, 2.2] }, c_zone: { dmg: [5, 1.6], cd: [6, -0.5, 2.5], size: [1, 0.15, 2.2], dur: [4, 0.8, 10] }, c_trail: { dmg: [4, 1.2], dur: [2, 0.4, 5], size: [1, 0.15, 2.2] }, c_deer: { dmg: [30, 9], cd: [5, -0.4, 2], size: [1, 0.15, 2] },
  l_atk: { dmg: [9, 2.6], crit: [0.1, 0.05, 0.5], cd: [0.9, -0.05, 0.45] }, l_lamp: { chance: [0.3, 0.06, 0.8], dmg: [3, 1], size: [1, 0.08, 1.6] }, l_strike: { chance: [0.3, 0.06, 0.8], dmg: [18, 5], size: [1, 0.15, 2.2] },
  l_judge: { dmg: [25, 8], cd: [8, -0.6, 3] }, l_pillar: { dmg: [28, 8], cd: [3, -0.25, 1.2], size: [1, 0.15, 2.2], stun: [0.3, 0.1, 1] }, l_shield: { cd: [8, -0.7, 3], dmg: [10, 4], size: [1, 0.15, 2] }, l_reprisal: { dmg: [30, 9], stun: [1, 0.2, 2.5] }, l_arbiter: { dmg: [10, 3], count: [2, 1, 6], size: [1, 0.12, 2.2], spd: [1, 0.15, 2.5] },
  k_atk: { dmg: [9, 2.6], chance: [0.4, 0.08, 1], cd: [0.9, -0.05, 0.45] }, k_lamp: { chance: [0.25, 0.05, 0.7], dmg: [3, 1] }, k_strike: { chance: [0.3, 0.06, 0.8], dmg: [10, 3], count: [1, 1, 4] },
  k_doom: { cd: [5, -0.4, 2], size: [1, 0.15, 2.2], dmg: [1.5, 0.25] }, k_snakes: { dmg: [14, 4], count: [3, 1, 8], cd: [4, -0.3, 1.6] }, k_fear: { chance: [0.15, 0.04, 0.5], dur: [2, 0.4, 5] }, k_ravens: { dmg: [6, 2], count: [2, 1, 5], spd: [1, 0.15, 2.2] },
  m_atk: { dmg: [10, 2.8], chance: [0.2, 0.05, 0.6], cd: [0.9, -0.05, 0.45] }, m_lamp: { slow: [0.3, 0.06, 0.7], size: [1, 0.1, 1.8], dmg: [4, 1.4] }, m_strike: { chance: [0.3, 0.06, 0.8], count: [2, 1, 6], dmg: [12, 3.5] },
  m_field: { cd: [7, -0.5, 3], size: [1, 0.15, 2.2], dur: [4, 0.8, 10], dmg: [3, 1] }, m_rewind: { cd: [12, -1, 5], heal: [0.1, 0.02, 0.3] }, m_gemini: { chance: [0.25, 0.05, 0.6] }, m_clone: { dmg: [0.6, 0.1, 1.5], cd: [1.2, -0.1, 0.5] },
  atk: { dmg: [8, 2.4], cd: [0.9, -0.05, 0.45] },
};
function blInitST() { for (const id in BL_ST) ST[id] = { name: BL[id] ? BL[id].name : '弧光焊枪', s: BL_ST[id], lab: id === 'k_doom' ? { dmg: '结算倍率' } : id === 'm_clone' ? { dmg: '复制比例' } : id === 'm_rewind' ? { heal: '回复' } : id === 'l_strike' ? { size: '宽度' } : undefined, fmt: id === 'k_doom' ? { dmg: v => '×' + v.toFixed(2) } : id === 'm_clone' ? { dmg: v => pcf(v) } : id === 'm_rewind' ? { heal: v => pcf(v) } : undefined }; }
const blText = id => { const d = BL[id]; return d.txt.replace(/\{(\w+)\}/g, (_, k) => ST[id] && ST[id].s[k] ? afFmt(id, k, stv(id, k)) : '?'); };
const blHas = id => !!(S.bl && S.bl[id]);
const blLvl = id => blHas(id) ? S.bl[id].lvl : 0;
const godOf = o => o.kind === 'bl' ? BL[o.id].god : o.kind === 'passive' ? (PASSIVES[o.id].god || null) : null;
function slotUsed(type) { let n = 0; for (const id in S.bl) if (BL[id].type === type) n++; return n; }
const slotFree = type => slotUsed(type) < (SLOT_CAP[type] || 99);
function godCount(g) { let n = 0; for (const id in S.bl) if (BL[id].god === g) n++; for (const id in S.passives) if (PASSIVES[id].god === g) n++; return n; }
function lockGod(g) {
  if (!g || g === 'fate' || S.gods.includes(g)) return;
  S.gods.push(g); S.run.gods = S.gods.slice(); sfx('synergy');
  banner(GODS[g].name + ' 与你同行', S.gods.length >= 3 ? '三位灯魂已定：之后只有他们和命运来访' : `还能再结缘 ${3 - S.gods.length} 位灯魂`, GODS[g].col, 3);
}
function godCards(g) {
  const out = [];
  for (const id in BL) { const d = BL[id]; if (d.god !== g || d.type === 'legend') continue;
    if (blHas(id)) { if (blLvl(id) < d.max) out.push({ kind: 'bl', id, owned: true }); }
    else if (slotFree(d.type) || ((d.type === 'atk' || d.type === 'lamp') && S.player.lvl >= 6)) out.push({ kind: 'bl', id, owned: false }); }
  const pc = Object.keys(S.passives).length;
  for (const id in PASSIVES) { const d = PASSIVES[id]; if (d.god !== g) continue; const l = plv(id); if (l) { if (l < 5) out.push({ kind: 'passive', id, owned: true }); } else if (pc < 8) out.push({ kind: 'passive', id, owned: false }); }
  return out.filter(o => !S.banned.has(o.kind + ':' + o.id));
}
function pickGod(exclude) {
  const locked = S.gods, cap = locked.length >= 3;
  let c = (cap ? [...locked, 'fate'] : Object.keys(GODS)).filter(g => g !== exclude && godCards(g).length);
  const h = S.godHist, last = h.length ? h[h.length - 1] : null;
  if (last && c.length > 1) c = c.filter(g => g !== last);
  if (!c.length) return 'fate';
  return pickW(c, g => g === 'fate' ? 0.8 : locked.includes(g) ? 2 : 1);
}
function genGodOffer() {
  if (!S.keepGod || !S.visit) S.visit = pickGod(null); S.keepGod = false; S.godHist.push(S.visit);
  const g = S.visit, cards = godCards(g), n = hasT('four') ? 4 : 3, res = [], used = new Set(); if (!window.__botFast) sfx('oath');
  for (let i = 0; i < n; i++) {
    const c = cards.filter(o => !used.has(o.kind + o.id)); if (!c.length) break;
    const owned = c.filter(o => o.owned), fresh = c.filter(o => !o.owned);
    const pool = owned.length && fresh.length ? (Math.random() < 0.5 ? owned : fresh) : owned.length ? owned : fresh;
    const o = pickW(pool, x => x.kind === 'passive' ? (res.some(r => r.kind === 'passive') ? 0.25 : 0.6) : 1); used.add(o.kind + o.id); res.push({ ...o, slot: o.owned ? '巩固' : '顺势' });
  }
  if (g === 'fate' && S.gods.length) { const own = S.gods.flatMap(gg => godCards(gg).filter(o => o.owned)); if (own.length) { const o = pickU(own); res[res.length - 1] = { ...o, slot: '巩固' }; } }
  res.forEach(o => rollRarity(o));
  // 传奇：掷中传说后再掷 25%，且已持有这位灯魂 ≥ 2 张
  const L = Object.keys(BL).find(id => BL[id].god === g && BL[id].type === 'legend');
  if (L && !blHas(L) && godCount(g) >= 2) { S.legP = S.legP || {}; const pr = legendP(g); if (Math.random() < pr) { const i = Math.max(0, res.findIndex(o => o.rar === 3)); res[i] = { kind: 'bl', id: L, rar: 4, slot: '传奇', rolls: [], owned: false }; S.legP[g] = 0; } else S.legP[g] = (S.legP[g] || 0) + 1; }
  const fill = [{ kind: 'res', id: 'calm', slot: '补给', rar: 0 }, { kind: 'res', id: 'heal', slot: '补给', rar: 0 }, { kind: 'res', id: 'parts', slot: '补给', rar: 0 }];
  while (res.length < 3) res.push(fill[res.length]);
  return res;
}
const legendP = g => { const n = (S.legP && S.legP[g]) || 0; return n >= 10 ? 1 : Math.min(1, (0.05 + 0.03 * n) * (1 + (D.luck || 0))); };
function doAlter() {
  if (!current || current.meta.kind !== 'level' || isW() || S.alts <= 0) return;
  S.alts--; S.run.altsUsed = (S.run.altsUsed || 0) + 1; S.run.choices.push({ kind: 'alter', t: +S.t.toFixed(1), from: S.visit });
  S.visit = pickGod(S.visit); S.keepGod = true; current = null; openLevel();
}
function takeBless(o) {
  const d = BL[o.id], b = S.bl[o.id] || (S.bl[o.id] = { lvl: 0, t: 0.3 });
  b.lvl++; if (ST[o.id]) applyRolls(o.id, o.rolls);
  if (d.type === 'atk') { if (S.atk && S.atk !== o.id) { delete S.bl[S.atk]; banner('普攻改造：' + d.name, '替换了之前的改造', GODS[d.god].col, 2); } S.atk = o.id; }
  if (d.type === 'lamp') { if (S.lamp && S.lamp !== o.id) delete S.bl[S.lamp]; S.lamp = o.id; }
  if (d.type === 'legend') { banner('传奇：' + d.name, d.txt, '#ffd700', 3.5); slowT = 0.6; }
  (S.run.bl = S.run.bl || []).push({ id: o.id, lvl: b.lvl, rar: o.rar, t: +S.t.toFixed(1) });
  lockGod(d.god);
}
// ---- 状态辅助 ----
const nStat = e => (e.shock ? 1 : 0) + (e.burn ? 1 : 0) + (e.expo ? 1 : 0) + (e.chill ? 1 : 0) + (e.curse ? 1 : 0);
function curseBurst(e, mult) {
  if (!e.curse || e.dead) return; const st = e.curse.st; e.curse = null;
  const others = nStat(e); const dmg = (18 + 4 * S.player.lvl) * st * (1 + 0.5 * others) * (1 + (D.statd || 0)) * (mult || 1);
  burst(e.x, e.y - 8, '#c9b6ff', 10, 110); addRing(e.x, e.y, 0.9 * M, '#c9b6ff', 0.3); sfx('fire');
  dealDamage(e, dmg, 'curse', { dot: true, depth: 2 });
}
function spreadStatus(e, R) {
  const ks = []; if (e.shock) ks.push('shock'); if (e.burn) ks.push('burn'); if (e.expo) ks.push('expo'); if (e.chill) ks.push('chill'); if (e.curse) ks.push('curse');
  if (!ks.length) return; for (const t of query(e.x, e.y, R)) { if (t === e || t.dead) continue; for (const k of ks) applyStatus(t, k, 2); }
  addRing(e.x, e.y, R, '#c9b6ff', 0.3);
}
// ---- 弧光师核心：普攻、击发、施放、威能、召唤 ----
function arcZap(x, y, t, dmg, elem, o) { if (elem === 'elec') sfx('zap'); addArc(x, y, t.x, t.y, EC[elem] || '#bfe6ff', 0.1, 1.6); dealDamage(t, dmg, elem, o || {}); }
function nova(x, y, R, dmg, elem, o = {}) {
  addRing(x, y, R, EC[elem], 0.35); if (o.shake) S.shake = Math.min(8, S.shake + 2); smash(x, y, R);
  for (const e of query(x, y, R)) { if (o.knock) applyKnock(e, x, y, o.knock); if (o.stun) applyStun(e, o.stun); dealDamage(e, dmg, elem, { sc: o.sc }); if (!e.dead && o.status) for (let i = 0; i < (o.n || 1); i++) applyStatus(e, o.status, 1); }
}
function zoneAdd(x, y, r, t, dmg, elem) { zones.push({ x, y, r, t, tick: 0, dmg, elem }); }
function sproj(x, y, ang, o) { S.sp.push({ x, y, ang, spd: (o.spd || 9) * M, dist: 0, max: o.max || 6 * M, dmg: o.dmg, elem: o.elem, pierce: o.pierce != null ? o.pierce : 1, hit: new Set(), r: o.r || 10, home: o.home, kind: o.kind || 'orb', t: 0, sc: o.sc }); }
function beam(x1, y1, x2, y2, w, dmg, elem) {
  const vx = x2 - x1, vy = y2 - y1, L2 = vx * vx + vy * vy || 1, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, half = Math.sqrt(L2) / 2;
  addArc(x1, y1, x2, y2, EC[elem], 0.14, 3); (S.beams = S.beams || []).push({ x1, y1, x2, y2, w, t: 0.18, c: EC[elem] });
  for (const e of query(mx, my, half + w)) { const t = clamp(((e.x - x1) * vx + (e.y - y1) * vy) / L2, 0, 1), px = x1 + vx * t, py = y1 + vy * t; if ((e.x - px) ** 2 + (e.y - py) ** 2 < (w + e.r) ** 2) dealDamage(e, dmg, elem, {}); }
}
function arcAttack(tgt, from, mul) {
  const p = S.player, aid = S.atk, id = aid || 'atk', fx = from ? from.x : p.x, fy = from ? from.y - 8 : p.y - 8;
  let dmg = stv(id, 'dmg') * (mul || 1); const elem = aid ? BL[aid].elem : 'elec', o = {};
  if (!from) S.hitN = (S.hitN || 0) + 1;
  if (aid) o.sc = ST[aid].s.chance ? stv(aid, 'chance') : undefined;
  if (aid === 'l_atk') { o.crit = Math.random() < stv('l_atk', 'crit'); if (!from && S.hitN % 4 === 0) { o.crit = true; o.expo = true; } }
  if (aid === 'k_atk' && tgt.hp < 0.3 * tgt.maxHp) dmg *= 1.3;
  if (aid === 'c_atk' && tgt.frozenT > 0) dmg *= 1.5;
  arcZap(fx, fy, tgt, dmg, elem, o);
  if (tgt.dead) { if (aid === 'm_atk' && Math.random() < stv('m_atk', 'chance')) drop('xp', tgt.x, tgt.y, 1); }
  else { if (o.expo) applyStatus(tgt, 'expo', 1); if (aid === 'm_atk' && Math.random() < stv('m_atk', 'chance')) drop('xp', tgt.x, tgt.y, 1); }
  const ch = aid === 't_atk' ? Math.round(stv('t_atk', 'chain')) : 0;
  if (ch > 0) { let prev = tgt; const hit = new Set([tgt]); for (let k = 0; k < ch; k++) { const n = nearest(prev.x, prev.y, 3 * M, e => !hit.has(e)); if (!n) break; hit.add(n); arcZap(prev.x, prev.y - 8, n, dmg * 0.7, elem, { sc: o.sc }); prev = n; } }
  if (from) return;
  for (const sid in S.bl) { const d = BL[sid]; if (d.type !== 'strike') continue; if (Math.random() < stv(sid, 'chance')) strikeFire(sid, tgt); }
}
function strikeFire(id, tgt) {
  const p = S.player, dmg = stv(id, 'dmg');
  if (id === 't_strike') { for (const e of nearestN(tgt.x, tgt.y, 4 * M, Math.round(stv(id, 'count')) + Math.floor(D.count + 1e-6), e => e !== tgt)) arcZap(tgt.x, tgt.y - 8, e, dmg, 'elec'); }
  else if (id === 'f_strike') { const a = Math.atan2(tgt.y - p.y, tgt.x - p.x), R = 3 * M * stv(id, 'size') * D.area; sfx('fire'); burst(p.x + Math.cos(a) * 30, p.y + Math.sin(a) * 30, '#ffb15a', 10, 120); S.flashes.push({ x: p.x + Math.cos(a) * R * 0.5, y: p.y + Math.sin(a) * R * 0.5, r: R * 0.6, t: 0.2 });
    for (const e of query(p.x, p.y, R)) { const b = Math.atan2(e.y - p.y, e.x - p.x); let da = Math.abs(b - a); if (da > Math.PI) da = 6.283 - da; if (da < 0.55) dealDamage(e, dmg, 'fire', { sc: 0.6 }); } }
  else if (id === 'c_strike') { const n = Math.round(stv(id, 'count')) + Math.floor(D.count + 1e-6); for (let i = 0; i < n; i++) sproj(tgt.x, tgt.y - 6, i / n * 6.283 + Math.random() * 0.4, { dmg, elem: 'frost', max: 3 * M, spd: 8, kind: 'shard', r: 8 }); }
  else if (id === 'l_strike') { const a = Math.atan2(tgt.y - p.y, tgt.x - p.x), L = 6 * M; beam(p.x, p.y - 8, p.x + Math.cos(a) * L, p.y - 8 + Math.sin(a) * L, 0.5 * M * stv(id, 'size') * D.area, dmg, 'light'); }
  else if (id === 'k_strike') { const n = Math.round(stv(id, 'count')) + Math.floor(D.count + 1e-6); for (const e of [tgt, ...nearestN(tgt.x, tgt.y, 4 * M, n - 1, e => e !== tgt)]) { addArc(p.x, p.y - 10, e.x, e.y - 6, '#c9b6ff', 0.12, 2); spark(e.x, e.y - 8, 0, '#c9b6ff', 6, 90); dealDamage(e, dmg + 0.08 * e.hp, 'curse', { sc: 0.6 }); } }
  else if (id === 'm_strike') { const n = Math.round(stv(id, 'count')) + Math.floor(D.count + 1e-6); const tg = nearestN(p.x, p.y, 8 * M, n); for (let i = 0; i < n; i++) { const t = tg[i % Math.max(1, tg.length)]; sproj(p.x, p.y - 10, Math.atan2((t ? t.y : p.y) - p.y, (t ? t.x : p.x + 1) - p.x) + rand(-0.8, 0.8), { dmg, elem: 'time', max: 9 * M, spd: 7, home: true, kind: 'missile', r: 9 }); } }
}
function castFire(id) {
  const p = S.player, dmg = ST[id].s.dmg ? stv(id, 'dmg') : 0, sz = ST[id].s.size ? stv(id, 'size') * D.area : D.area, dur = ST[id].s.dur ? stv(id, 'dur') * D.dur : 0, cnt = ST[id].s.count ? Math.round(stv(id, 'count')) + Math.floor(D.count + 1e-6) : 1;
  if (id === 't_rod') { for (let k = 0; k < cnt; k++) { const spot = densest(p.x, p.y, 8 * M); if (!spot) break; pins.push({ x: spot.x + rand(-12, 12), y: spot.y + rand(-12, 12), t: dur, tick: 0, ltick: 0, dmg }); } while (pins.length > cnt + 1) pins.shift(); }
  else if (id === 'f_meteor') { for (let k = 0; k < cnt; k++) { const spot = densest(p.x, p.y, 9 * M) || { x: p.x + rand(-60, 60), y: p.y + rand(-40, 40) }; const x = spot.x + rand(-10, 10), y = spot.y + rand(-10, 10), R = 2 * M * sz;
      (S.meteors = S.meteors || []).push({ x, y, t: 0.55 }); S.delayed.push({ t: 0.55, fn: () => { sfx('boom'); S.flashes.push({ x, y, r: R * 1.3, t: 0.25 }); burst(x, y, '#ffb06a', 16, 180); nova(x, y, R, dmg, 'fire', { knock: 1.2 * M, shake: true, sc: 0.6 }); zoneAdd(x, y, R * 0.8, 2 * D.dur, dmg * 0.12, 'fire'); } }); } }
  else if (id === 'f_ground') zoneAdd(p.x, p.y + 4, 2.5 * M * sz, dur, dmg, 'fire');
  else if (id === 'c_ring') { sfx('boom'); nova(p.x, p.y, 3.5 * M * sz, dmg, 'frost', { status: 'chill', n: 2, sc: 0 }); }
  else if (id === 'c_zone') { const spot = densest(p.x, p.y, 9 * M) || p; zoneAdd(spot.x, spot.y, 2.5 * M * sz, dur, dmg, 'frost'); }
  else if (id === 'l_judge') { sfx('pulse'); S.flashes.push({ x: p.x, y: p.y, r: 14 * M, t: 0.3 }); for (const e of query(p.x, p.y, 13 * M)) { dealDamage(e, dmg, 'light', { sc: 1 }); } }
  else if (id === 'l_pillar') { const t = nearest(p.x, p.y, 9 * M); if (t) { const R = 1.5 * M * sz; S.flashes.push({ x: t.x, y: t.y, r: R * 1.5, t: 0.25 }); (S.beams = S.beams || []).push({ x1: t.x, y1: t.y - 9 * M, x2: t.x, y2: t.y, w: R * 0.5, t: 0.3, c: EC.light }); nova(t.x, t.y, R, dmg, 'light', { stun: stv(id, 'stun') * D.dur, sc: 0.7 }); } }
  else if (id === 'k_doom') { let n = 0; for (const e of query(p.x, p.y, 5 * M * sz)) if (e.curse) { curseBurst(e, stv(id, 'dmg')); n++; } if (n) { addRing(p.x, p.y, 5 * M * sz, '#c9b6ff', 0.3); sfx('pulse'); } }
  else if (id === 'k_snakes') { const tg = nearestN(p.x, p.y, 9 * M, cnt); for (let i = 0; i < cnt; i++) { const t = tg[i % Math.max(1, tg.length)]; const a = t ? Math.atan2(t.y - p.y, t.x - p.x) : Math.random() * 6.283; sproj(p.x, p.y, a + rand(-0.25, 0.25), { dmg, elem: 'curse', max: 7 * M, spd: 6.5, pierce: 3, kind: 'snake', r: 10, sc: 0.7 }); } }
  else if (id === 'm_field') zoneAdd(p.x, p.y + 4, 3 * M * sz, dur, dmg, 'time');
  else if (id === 'm_rewind') { heal(stv(id, 'heal')); addRing(p.x, p.y, 1.6 * M, '#9be08a', 0.4); addNum(p.x, p.y - 16, 0, '#9be08a'); nums[nums.length - 1].v = '回溯'; }
}
function lampTick(m) {
  const p = S.player, id = S.lamp, elem = id ? (BL[id].god === 'time' ? 'elec' : GODS[BL[id].god].elem) : 'elec';
  const dmg = (id && ST[id].s.dmg ? stv(id, 'dmg') : 3) * m, ch = id && ST[id].s.chance ? stv(id, 'chance') : 0.18;
  for (const e of query(p.x, p.y, S.lr)) dealDamage(e, dmg, elem, { weak: true, sc: ch });
}
function blHurt(amount, src) {
  const p = S.player;
  if (blHas('t_short') && S.t >= (S.shortCd || 0)) { S.shortCd = S.t + stv('t_short', 'cd') * D.cdMul; for (const t of nearestN(p.x, p.y, 6 * M, Math.round(stv('t_short', 'count')) + Math.floor(D.count + 1e-6))) arcZap(p.x, p.y - 8, t, stv('t_short', 'dmg'), 'elec'); addRing(p.x, p.y, 1.2 * M, '#bfe6ff', 0.25); }
  if (blHas('l_reprisal') && src && !src.dead && !src.reaper) { applyStun(src, stv('l_reprisal', 'stun') * D.dur); dealDamage(src, stv('l_reprisal', 'dmg'), 'light', { sc: 0.6 }); addRing(src.x, src.y, 0.8 * M, '#fff1b0', 0.3); }
}
function blShieldBlock() {
  if (!blHas('l_shield') || S.t < (S.hshieldCd || 0)) return false;
  S.hshieldCd = S.t + stv('l_shield', 'cd') * D.cdMul; const p = S.player; p.iframes = Math.max(p.iframes, 0.3);
  addNum(p.x, p.y - 14, 0, '#fff1b0'); nums[nums.length - 1].v = '护盾'; sfx('shield');
  nova(p.x, p.y, 1.6 * M * stv('l_shield', 'size') * D.area, stv('l_shield', 'dmg'), 'light', { knock: 1 * M, sc: 0.5 }); return true;
}
function blKill(e) {
  const p = S.player;
  if (blHas('f_ember') && e.burn) zoneAdd(e.x, e.y, 1.2 * M * stv('f_ember', 'size') * D.area, stv('f_ember', 'dur') * D.dur, stv('f_ember', 'dmg'), 'fire');
  if (blHas('k_legend')) spreadStatus(e, 3 * M);
  if (blHas('k_lamp') && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < S.lr * S.lr && p.hp < D.maxHp) p.hp = Math.min(D.maxHp, p.hp + 1);
  if (e.curse) curseBurst(e, 1);
}
function updBless(dt) {
  const p = S.player, B = S.bl;
  S.atkT = (S.atkT || 0) - dt;
  if (S.atkT <= 0) { const id = S.atk || 'atk'; S.atkT = stv(id, 'cd') * D.cdMul / D.aspd; const tgt = nearest(p.x, p.y, 5 * M * D.area); if (tgt) arcAttack(tgt); else S.atkT = 0.1; }
  for (const id in B) {
    const d = BL[id]; if (d.type !== 'cast' || !ST[id].s.cd) continue;
    const st = B[id]; st.t = (st.t || 0) - dt;
    if (st.t <= 0) { st.t = stv(id, 'cd') * D.cdMul; castFire(id); if (B.m_gemini && Math.random() < stv('m_gemini', 'chance')) S.delayed.push({ t: 0.25, fn: () => castFire(id) }); }
  }
  // 线圈 / 仲裁者：绕身
  for (const [id, elem] of [['t_coil', 'elec'], ['l_arbiter', 'light']]) {
    if (!B[id]) { if (S.orb && S.orb[id]) delete S.orb[id]; continue; }
    const n = Math.round(stv(id, 'count')) + Math.floor(D.count + 1e-6), R = 2.2 * M * D.area * stv(id, 'size');
    const o = (S.orb = S.orb || {})[id] || (S.orb[id] = { a: 0, pos: [], R, elem });
    o.a += 3 * stv(id, 'spd') * D.pspd * dt; o.pos = []; o.R = R;
    for (let i = 0; i < n; i++) { const a = o.a + i * Math.PI * 2 / n, cx = p.x + Math.cos(a) * R, cy = p.y + Math.sin(a) * R; o.pos.push([cx, cy]);
      for (const e of query(cx, cy, 0.45 * M)) if ((e['cd_' + id] || 0) <= S.t) { e['cd_' + id] = S.t + 0.5; dealDamage(e, stv(id, 'dmg'), elem, { sc: 0.4 }); } }
  }
  if (B.c_trail && p.moving) { S.trailT = (S.trailT || 0) - dt; if (S.trailT <= 0) { S.trailT = 0.22; zoneAdd(p.x, p.y + 6, 0.7 * M * stv('c_trail', 'size') * D.area, stv('c_trail', 'dur') * D.dur, stv('c_trail', 'dmg'), 'frost'); } }
  if (B.t_legend) { S.stormT = (S.stormT || 0) - dt; if (S.stormT <= 0) { S.stormT = 0.6; const arr = query(p.x, p.y, 9 * M).filter(e => e.shock).slice(0, 40);
    for (const e of arr) { let best = null, bd = (4 * M) ** 2; for (const o of arr) { if (o === e) continue; const d = d2(e, o); if (d < bd) { bd = d; best = o; } } if (best) addArc(e.x, e.y, best.x, best.y, '#cdeeff', 0.16, 1.4); }
    for (const e of arr) dealDamage(e, 15, 'elec', { weak: true, sc: 0.3 }); } }
  if (B.l_legend) { S.jdT = (S.jdT == null ? 25 : S.jdT) - dt; if (S.jdT <= 0) { S.jdT = 25; sfx('pulse'); S.flashes.push({ x: p.x, y: p.y, r: 16 * M, t: 0.45 }); S.shake = Math.min(10, S.shake + 6); banner('审判日', '光照到的地方，灰都散了', '#ffe9a8', 2);
    for (const e of query(p.x, p.y, 14 * M)) { if (e.reaper) continue; if (!e.elite && e.type !== 'nest' && e.type !== 'boss') dealDamage(e, 1e6, 'light', { dot: true }); else dealDamage(e, 0.1 * e.maxHp, 'light', { dot: true, weak: true }); } } }
  S.secT = (S.secT || 0) - dt;
  if (S.secT <= 0) { S.secT = 1;
    if (B.m_legend) for (const e of query(p.x, p.y, S.lr)) if (!e.reaper) dealDamage(e, (e.type === 'boss' ? 0.01 : 0.03) * e.maxHp, 'time', { dot: true, weak: true });
    if (B.f_legend) { let n = 0; for (const e of enemies) if (!e.dead) n += nStat(e); if (n) { p.xp += Math.min(30, n) * D.xp; S.run.hellXp = (S.run.hellXp || 0) + Math.min(30, n); } }
  }
  updPets(dt); updSP(dt);
  for (const b of S.beams || []) b.t -= dt; if (S.beams) S.beams = S.beams.filter(b => b.t > 0);
  for (const m of S.meteors || []) m.t -= dt; if (S.meteors) S.meteors = S.meteors.filter(m => m.t > 0);
}
// ---- 召唤物 ----
function updPets(dt) {
  const p = S.player, B = S.bl, P = S.pets;
  const want = {};
  if (B.t_ball) want.ball = 1; if (B.f_elem) want.elem = Math.round(stv('f_elem', 'count')) + Math.floor(D.count + 1e-6); if (B.k_ravens) want.raven = Math.round(stv('k_ravens', 'count')) + Math.floor(D.count + 1e-6); if (B.m_clone) want.clone = 1;
  for (const k in want) { let n = P.filter(q => q.kind === k).length; while (n < want[k]) { P.push({ kind: k, x: p.x + rand(-30, 30), y: p.y + rand(-30, 30), ph: Math.random() * 6, atkT: 0, st: 0 }); n++; } }
  for (let i = P.length - 1; i >= 0; i--) if (!want[P[i].kind] || P.filter(q => q.kind === P[i].kind).length > want[P[i].kind]) P.splice(i, 1);
  if (B.c_deer) { const b = B.c_deer; b.t2 = (b.t2 || 0) - dt; if (b.t2 <= 0) { b.t2 = stv('c_deer', 'cd') * D.cdMul; const spot = densest(p.x, p.y, 9 * M); const a = spot ? Math.atan2(spot.y - p.y, spot.x - p.x) : Math.random() * 6.283; P.push({ kind: 'deer', x: p.x, y: p.y, ang: a, dist: 0, hit: new Set(), atkT: 0, ph: 0 }); } }
  for (const q of P) {
    q.atkT -= dt;
    if (q.kind === 'ball') { q.ph += dt * 0.9 * stv('t_ball', 'spd') * D.pspd; const R = 3 * M * stv('t_ball', 'size') * D.area, tx = p.x + Math.cos(q.ph) * R * (0.6 + 0.4 * Math.sin(q.ph * 2.3)), ty = p.y + Math.sin(q.ph * 1.7) * R * 0.7; q.x += (tx - q.x) * Math.min(1, 4 * dt); q.y += (ty - q.y) * Math.min(1, 4 * dt);
      if (q.atkT <= 0) { q.atkT = 0.4; for (const e of query(q.x, q.y, 0.6 * M)) dealDamage(e, stv('t_ball', 'dmg'), 'elec', { sc: 0.45 }); } }
    else if (q.kind === 'elem') { const tg = nearest(q.x, q.y, 8 * M); const tx = tg ? tg.x : p.x + Math.cos(q.ph + S.t) * 40, ty = tg ? tg.y : p.y + Math.sin(q.ph + S.t) * 40, dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy) || 1;
      if (tg && d < 0.8 * M + tg.r) { if (q.atkT <= 0) { q.atkT = 0.6; dealDamage(tg, stv('f_elem', 'dmg'), 'fire', { sc: 0.6 }); burst(tg.x, tg.y - 8, '#ffb15a', 4, 60); } }
      else if (d > 10) { const sp = 5 * M * stv('f_elem', 'spd'); q.x += dx / d * sp * dt; q.y += dy / d * sp * dt; }
      if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 > (14 * M) ** 2) { q.x = p.x + rand(-20, 20); q.y = p.y + rand(-20, 20); } }
    else if (q.kind === 'raven') { if (!q.tg || q.tg.dead || q.atkT <= -1.5) { q.tg = nearest(p.x, p.y, 9 * M, e => e !== q.tg); q.atkT = 0.9; q.st = 0; }
      const tg = q.tg; const tx = tg ? tg.x : p.x + Math.cos(q.ph + S.t * 1.5) * 50, ty = tg ? tg.y - 24 : p.y - 30 + Math.sin(q.ph + S.t) * 10, dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy) || 1, sp = 7 * M * stv('k_ravens', 'spd');
      q.x += dx / d * Math.min(d, sp * dt); q.y += dy / d * Math.min(d, sp * dt);
      if (tg && d < 14 && q.atkT <= 0 && !q.st) { q.st = 1; dealDamage(tg, stv('k_ravens', 'dmg'), 'curse', { sc: 0.6 }); spark(tg.x, tg.y - 10, -1.5, '#c9b6ff', 5, 80); q.atkT = 0; } }
    else if (q.kind === 'clone') { const tx = p.x - p.fx * 26, ty = p.y - p.fy * 26; q.x += (tx - q.x) * Math.min(1, 6 * dt); q.y += (ty - q.y) * Math.min(1, 6 * dt);
      if (q.atkT <= 0) { q.atkT = stv('m_clone', 'cd') * D.cdMul / D.aspd; const tg = nearest(q.x, q.y, 5 * M * D.area); if (tg) arcAttack(tg, q, stv('m_clone', 'dmg')); } }
    else if (q.kind === 'deer') { const sp = 11 * M; q.x += Math.cos(q.ang) * sp * dt; q.y += Math.sin(q.ang) * sp * dt; q.dist += sp * dt;
      for (const e of query(q.x, q.y, 0.9 * M * stv('c_deer', 'size') * D.area)) { if (q.hit.has(e)) continue; q.hit.add(e); dealDamage(e, stv('c_deer', 'dmg'), 'frost', { sc: 0 }); if (!e.dead) { applyStatus(e, 'chill', 1); applyStatus(e, 'chill', 1); applyKnock(e, q.x - Math.cos(q.ang) * 20, q.y - Math.sin(q.ang) * 20, 0.8 * M); } }
      if (q.dist > 8 * M) q.dead = true; }
  }
  S.pets = P.filter(q => !q.dead);
}
function updSP(dt) {
  const p = S.player;
  for (const q of S.sp) {
    q.t += dt;
    if (q.home) { const tg = nearest(q.x, q.y, 6 * M, e => !q.hit.has(e)); if (tg) { const want = Math.atan2(tg.y - q.y, tg.x - q.x); let da = want - q.ang; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; q.ang += clamp(da, -6 * dt, 6 * dt); } }
    q.x += Math.cos(q.ang) * q.spd * D.pspd * dt; q.y += Math.sin(q.ang) * q.spd * D.pspd * dt; q.dist += q.spd * D.pspd * dt;
    if (q.dist >= q.max || (q.x - p.x) ** 2 + (q.y - p.y) ** 2 > (40 * M) ** 2) q.dead = true;
    for (const e of query(q.x, q.y, q.r)) { if (q.hit.has(e)) continue; q.hit.add(e); dealDamage(e, q.dmg, q.elem, { sc: q.sc != null ? q.sc : 0.5 }); spark(q.x, q.y, q.ang + Math.PI, EC[q.elem], 4, 70); if (--q.pierce <= 0) { q.dead = true; break; } }
  }
  S.sp = S.sp.filter(q => !q.dead);
}
function drawPets() {
  for (const q of S.pets || []) {
    if (q.kind === 'ball') { ctx.fillStyle = 'rgba(191,230,255,.9)'; ctx.beginPath(); ctx.arc(q.x, q.y - 10, 5 + Math.sin(S.t * 30) * 1.2, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#eaf7ff'; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const a = S.t * 25 + i * 2.1; ctx.beginPath(); ctx.moveTo(q.x, q.y - 10); ctx.lineTo(q.x + Math.cos(a) * 11, q.y - 10 + Math.sin(a) * 11); ctx.stroke(); } }
    else if (q.kind === 'elem') { const h = 10 + Math.sin(S.t * 14 + q.ph) * 2; ctx.fillStyle = '#ff6a2a'; ctx.beginPath(); ctx.moveTo(q.x - 5, q.y); ctx.lineTo(q.x, q.y - h - 4); ctx.lineTo(q.x + 5, q.y); ctx.fill(); ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.moveTo(q.x - 2.5, q.y); ctx.lineTo(q.x, q.y - h * 0.6); ctx.lineTo(q.x + 2.5, q.y); ctx.fill(); ctx.fillStyle = '#1a1a22'; ctx.fillRect(q.x - 2, q.y - 5, 1.5, 1.5); ctx.fillRect(q.x + 1, q.y - 5, 1.5, 1.5); }
    else if (q.kind === 'raven') { ctx.fillStyle = '#2a2436'; const f = Math.sin(S.t * 18 + q.ph) * 5; ctx.beginPath(); ctx.moveTo(q.x - 9, q.y - f); ctx.lineTo(q.x, q.y + 2); ctx.lineTo(q.x + 9, q.y - f); ctx.lineTo(q.x, q.y - 1); ctx.fill(); ctx.fillStyle = '#c9b6ff'; ctx.fillRect(q.x - 1, q.y - 1, 2, 2); }
    else if (q.kind === 'clone') { const im = S.player.fx > 0 ? ART.pAf : ART.pA; ctx.globalAlpha = 0.45; ctx.drawImage(im, q.x - im.width / 2, q.y + 8 - im.height); ctx.globalAlpha = 1; }
    else if (q.kind === 'deer') { ctx.save(); ctx.translate(q.x, q.y - 8); ctx.rotate(q.ang); ctx.fillStyle = 'rgba(191,233,255,.85)'; ctx.fillRect(-14, -5, 24, 9); ctx.fillRect(6, -11, 7, 8); ctx.fillStyle = '#eaf7ff'; ctx.fillRect(9, -16, 2, 6); ctx.fillRect(12, -15, 2, 5); ctx.restore(); }
  }
  for (const q of S.sp || []) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.ang); ctx.fillStyle = EC[q.elem];
    if (q.kind === 'snake') { ctx.fillStyle = '#3a2d55'; ctx.fillRect(-10, -3, 20, 6); ctx.fillStyle = '#c9b6ff'; ctx.fillRect(4, -2, 5, 4); }
    else if (q.kind === 'shard') { ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-5, -3); ctx.lineTo(-5, 3); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0, 0, 4, 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-9, -1, 6, 2); }
    ctx.restore(); }
  for (const b of S.beams || []) { ctx.strokeStyle = b.c; ctx.lineWidth = b.w * 2 * (b.t / 0.18); ctx.globalAlpha = Math.min(1, b.t * 5); ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); ctx.globalAlpha = 1; }
  for (const m of S.meteors || []) { const k = 1 - m.t / 0.55; ctx.fillStyle = 'rgba(255,170,90,.9)'; ctx.beginPath(); ctx.arc(m.x + (1 - k) * 60, m.y - (1 - k) * 220, 6, 0, 6.283); ctx.fill(); ctx.strokeStyle = 'rgba(255,120,60,.5)'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(m.x, m.y, 2 * M * stv('f_meteor', 'size') * D.area * k, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
  for (const k in S.orb || {}) { const o = S.orb[k]; for (const q of o.pos) { if (k === 'l_arbiter') { ctx.save(); ctx.translate(q[0], q[1] - 8); ctx.rotate(o.a * 1.5); ctx.fillStyle = '#fff6d0'; ctx.fillRect(-2, -12, 4, 24); ctx.fillStyle = '#e8c160'; ctx.fillRect(-5, 4, 10, 3); ctx.restore(); } else { ctx.fillStyle = '#eaf7ff'; ctx.beginPath(); ctx.arc(q[0], q[1] - 6, 4, 0, 6.283); ctx.fill(); } } }
}
function petLights(lights) {
  for (const q of S.pets || []) lights.push([q.x, q.y - 8, 1.6 * M, 0.7, q.kind === 'elem' ? 'ember' : q.kind === 'raven' ? 'violet' : q.kind === 'deer' ? 'cyan' : q.kind === 'clone' ? 'green' : 'cyan']);
  for (const q of S.sp || []) lights.push([q.x, q.y, 1.2 * M, 0.6, q.elem === 'fire' ? 'ember' : q.elem === 'curse' ? 'violet' : q.elem === 'time' ? 'green' : q.elem === 'light' ? 'lamp' : 'cyan']);
  for (const k in S.orb || {}) for (const q of S.orb[k].pos) lights.push([q[0], q[1], 1.4 * M, 0.7, k === 'l_arbiter' ? 'lamp' : 'cyan']);
  for (const b of S.beams || []) lights.push([(b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2, 3 * M, 0.8, 'lamp']);
}
// ---- 界面：灯魂来访面板、构筑栏、暂停 ----
const SIGIL = {};
function godSigil(g) {
  if (SIGIL[g]) return SIGIL[g];
  const rows = {
    thunder: ['......oo....', '.....oLo....', '....oLLo....', '...oLLo.....', '..oLLLLLo...', '.oLLLLLLLo..', '....oLLo....', '....oLo.....', '...oLo......', '...oo.......', '............', '............'],
    fire: ['.....oo.....', '....oFo.....', '....oFFo....', '...oFFFo....', '..oFFYFFo...', '..oFYYYFo...', '.oFYYWYYFo..', '.oFYWWWYFo..', '.oFYYWYYFo..', '..oFYYYFo...', '...oFFFo....', '....ooo.....'],
    frost: ['.....oo.....', '..o..oCo..o.', '.oCo.oCo.oCo', '..oCoCCCoCo.', '...oCCCCCo..', '.oooCCWCCooo', '...oCCCCCo..', '..oCoCCCoCo.', '.oCo.oCo.oCo', '..o..oCo..o.', '.....oo.....', '............'],
    light: ['.....oo.....', '....oGGo....', '...oGYYGo...', '...oGYYGo...', '..oGYWWYGo..', '..oGYWWYGo..', '..oGYYYYGo..', '...oGYYGo...', '...oGGGGo...', '....oGGo....', '....oooo....', '............'],
    curse: ['....oooo....', '...oVVVVo...', '..oVVVVVVo..', '..oVoVVoVo..', '..oVooVooVo.', '..oVVVVVVo..', '...oVoVoVo..', '....oVVo....', '....oVVo....', '...oVooVo...', '....o..o....', '............'],
    time: ['....oooo....', '...oTTTTo...', '..oTTWTTTo..', '.oTTTWTTTTo.', '.oTTTWTTTTo.', '.oTTTWWWTTo.', '.oTTTTTTTTo.', '.oTTTTTTTTo.', '..oTTTTTTo..', '...oTTTTo...', '....oooo....', '............'],
    fate: ['............', '.oPo.oPo.oPo', '.oPo.oPo.oPo', '..oPoPPPoPo.', '...oPPPPPo..', '....oPPPo...', '....oPPPo...', '...oPPPPPo..', '..oPoPPPoPo.', '.oPo.oPo.oPo', '.oPo.oPo.oPo', '............'],
  };
  const pal = { o: '#0e1016', L: '#bfe6ff', F: '#ff6a2a', Y: '#ffd27a', W: '#ffffff', C: '#bfe9ff', G: '#e8c160', V: '#c9b6ff', T: '#8fe6a6', P: '#f4f1ff' };
  const c = spr(rows[g], pal, 3); SIGIL[g] = c.toDataURL(); return SIGIL[g];
}
function godHead(g) {
  const G = GODS[g], n = S.gods.length, locked = S.gods.includes(g) || g === 'fate';
  const L = Object.keys(BL).find(id => BL[id].god === g && BL[id].type === 'legend'), gc = godCount(g);
  const legTxt = L ? (blHas(L) ? ` · 传奇「${BL[L].name}」已拿` : gc >= 2 ? ` · 已持有 ${gc} 张，可遇传奇（本次 ${Math.round(legendP(g) * 100)}%）` : ` · 再拿 ${2 - gc} 张就可能遇到传奇`) : '';
  const state = (g === 'fate' ? '命运不占名额' : locked ? '已结缘' : n >= 3 ? '' : `拿${GODS[g].pr}的卡就结缘（${n}/3）`) + legTxt;
  const line = S.godHist.filter(x => x === g).length <= 1 ? G.line : pickU(G.lines);
  return `<div class="godhead" style="--g:${G.col}"><img class="godimg" src="${godSigil(g)}" alt=""><div class="godtext"><div class="godsig"><span class="godname">${G.name}</span><span class="godwho">${G.who}</span></div><div class="godline">"${line}"</div><div class="godstate">${state}${S.gods.length ? ' · 同行：' + S.gods.map(k => `<b style="color:${GODS[k].col}">${GODS[k].name.split(' ')[0]}</b>`).join(' ') : ''}</div></div></div>`;
}
function arcBuildHTML(ps, bs) {
  const by = t => Object.keys(S.bl).filter(id => BL[id].type === t);
  const slot = (id) => `<div class="slot skill" style="border-left-color:${GODS[BL[id].god].col}"><span>${BL[id].name}</span><span class="meta"><b>${S.bl[id].lvl}</b>/${BL[id].max || 1}</span></div>`;
  const row = (t) => { const ids = by(t), cap = SLOT_CAP[t] || ids.length; const out = ids.map(slot); if (ids.length < cap) out.push(`<div class="slot empty">${TYPE_N[t]} ${ids.length}/${cap}</div>`); return out.join(''); };
  const gods = S.gods.length ? S.gods.map(g => `<div class="slot bless" style="border-left-color:${GODS[g].col}"><span>${GODS[g].name}</span><span class="meta">结缘</span></div>`).join('') : '<div class="slot empty">还没结缘</div>';
  const leg = by('legend').map(slot).join('');
  return `${Object.keys(S.pact || {}).length ? `<div><h4>契约</h4><div class="slots">${Object.keys(S.pact).map(k => `<div class="slot bless"><span>${PACT[k].name}</span><span class="meta">契约</span></div>`).join('')}</div></div>` : ''}<div><h4>灯魂 ${S.gods.length}/3 · 换魂 ${S.alts}</h4><div class="slots">${gods}${leg}</div></div><div><h4>普攻 · 提灯</h4><div class="slots">${S.atk ? slot(S.atk) : '<div class="slot empty">弧光焊枪（无改造）</div>'}${S.lamp ? slot(S.lamp) : '<div class="slot empty">提灯（无灯芯）</div>'}</div></div><div><h4>击发 · 施放</h4><div class="slots">${row('strike')}${row('cast')}</div></div><div><h4>威能 · 召唤</h4><div class="slots">${row('power')}${row('summon')}</div></div>${(S.auras || []).length ? `<div><h4>光环</h4><div class="pool">${S.auras.map(id => `<span class="pk on">${AURA[id].name} ${stLvl('aura_' + id)}</span>`).join('')}</div></div>` : ''}<div><h4>被动 ${Object.keys(S.passives).length}</h4><div class="pool">${Object.keys(S.passives).map(id => `<span class="pk on" style="color:${PASSIVES[id].god ? GODS[PASSIVES[id].god].col : '#c3c9d6'}">${PASSIVES[id].name} ${S.passives[id]}</span>`).join('') || '<span class="pk">还没有</span>'}</div></div>${Object.keys(S.bless).length ? `<div><h4>路灯祝福</h4><div class="pool">${Object.entries(S.bless).map(([id, n]) => `<span class="pk on">${BLESS[id].name} ${n}</span>`).join('')}</div></div>` : ''}`;
}
function pauseArc() {
  mode = 'pause';
  const items = Object.keys(S.bl).map(id => { const d = BL[id]; return `<li><b style="color:${GODS[d.god].col}">${d.name}</b> ${d.type === 'legend' ? '传奇' : 'Lv ' + S.bl[id].lvl + '/' + d.max} · ${TYPE_N[d.type]} · ${GODS[d.god].name}${ST[id] ? afxPool(id, []) : ''}<span class="hint">${tidy(blText(id))}</span></li>`; }).join('') || '<li class="hint">还没有祝福。升级时一位灯魂会来访</li>';
  const ps = Object.entries(S.passives).map(([k, v]) => `<li><b>${PASSIVES[k].name}</b> Lv ${v}${PASSIVES[k].god ? ' · ' + GODS[PASSIVES[k].god].name : ''}<br><span class="hint">${PASSIVES[k].text(lv(k))}</span></li>`).join('') || '<li class="hint">还没有</li>';
  const bs = Object.entries(S.bless).map(([k, v]) => `<li><b>${BLESS[k].name}</b> ${v} 层<br><span class="hint">${BLESS[k].text(v)}</span></li>`).join('') || '<li class="hint">修好路灯或碰到祭坛时获得</li>';
  const gods = S.gods.map(g => `<span class="pk on" style="color:${GODS[g].col}">${GODS[g].name}</span>`).join('') || '<span class="pk">还没结缘</span>';
  $('#overlay').innerHTML = `<div class="panel"><div><div class="title">PAUSED</div><h2>当前构筑</h2><div class="sub">弧光师 · 每次升级一位灯魂来访，三张卡全是她的；一局最多结缘三位（命运不占名额）。状态：感电 / 燃烧 / 曝光 / 冰缓(5 层冰冻) / 诅咒(1.6 秒后爆发)。反应：感电+燃烧=爆燃，感电+曝光=电离，曝光+燃烧=熔毁；冰冻时反应追加碎裂。</div></div>
  <div class="grid2">${statsHTML()}</div><div class="box"><h3>职业特色</h3><ul>${CLS.arc.traits.map(t => `<li>${t}</li>`).join('')}</ul></div>
  <div class="box"><h3>灯魂 ${S.gods.length}/3 · 换魂 ${S.alts} · 重随 ${S.rerolls} · 禁用 ${S.bans}</h3><div class="pool">${gods}</div></div>
  <div class="grid2">${auraTreeHTML()}</div>
  <div class="grid2"><div class="box"><h3>祝福 ${Object.keys(S.bl).length}</h3><ul>${items}</ul></div><div class="box"><h3>被动 ${Object.keys(S.passives).length}</h3><ul>${ps}</ul></div><div class="box"><h3>路灯祝福</h3><ul>${bs}</ul></div></div>
  <div class="row-btns"><button class="btn" id="resume">继续（Esc）</button><button class="btn ghost" id="quit">放弃这局</button></div></div>`;
  $('#overlay').classList.add('on'); $('#resume').onclick = resume; $('#quit').onclick = () => { mode = 'play'; endRun('dead'); };
}

