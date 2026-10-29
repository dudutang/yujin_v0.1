// ================= 数据：祝福 =================
const VOICES = { keeper: ['老守灯人', '#ffb454'], tide: ['灰潮', '#a99cc9'], lab: ['辉光研究所', '#9fe8ff'] };
const BLESS = {
  homeward: { v: 'keeper', name: '归途之光', text: n => `修灯时浓度额外 −${8 * n}；路灯压住灰潮的时间 +${40 * n} 秒` },
  secondwind: { v: 'keeper', name: '余温', max: 1, text: () => '本局第一次倒下时，满电满血复活' },
  hearth: { v: 'keeper', name: '守护灯火', text: n => `站在持续光源里每秒回复 ${3 * n}% 生命` },
  tidepower: { v: 'tide', name: '灰潮之力', text: n => `伤害 +${25 * n}%，但光圈 −${10 * n}%` },
  greed: { v: 'tide', name: '贪婪', text: n => `废料和零件掉落 +${50 * n}%，但精英出现频率 +${50 * n}%` },
  shell: { v: 'tide', name: '灰潮之壳', text: n => `受到伤害的 ${200 * n}% 反弹给攻击者，但生命上限 −${10 * n}%` },
  seventh: { v: 'lab', name: '第七次', text: n => `每第 ${[7, 5, 3][n - 1]} 次命中必定施加一个随机元素状态` },
  tobattery: { v: 'lab', name: '净化', text: n => `每杀一个精英，灰潮浓度 −${n}（本局最多 −${12 * n}）` },
  reactor: { v: 'lab', name: '反应放大', text: n => `元素反应伤害 +${40 * n}%，范围 +${30 * n}%` },
};
