// ================= 数据：职业技能（弧光师） =================
const scale = l => 1 + 0.25 * (l - 1);
const SKILLS = {
  torch: { name: '弧光焊枪', tags: ['电', '链式'], ignite: 'conductor', form: '弧光网',
    base: '周期性向最近的敌人放一道电弧', stat: () => stSummary('torch'),
    A: ['链式', '电弧额外跳向 2 个敌人（每跳 70% 伤害）'], B: ['聚焦', '单体伤害 ×2.5，命中麻痹 0.5 秒'],
    formText: '所有感电敌人之间周期性连起电弧' },
  coil: { name: '电容线圈', tags: ['电', '召唤物', '区域'], ignite: 'amplify', form: '电环',
    base: '线圈绕身旋转，接触放电', stat: () => stSummary('coil'),
    A: ['扩圈', '旋转半径 +50%'], B: ['增数', '线圈 +2 个'], formText: '线圈之间连成电环，持续电击环上的敌人' },
  ground: { name: '接地', tags: ['电', '区域', '眩晕', '击退'], ignite: 'heavy', form: '地脉',
    base: '周期性以自身为中心震击，眩晕并击退', stat: () => stSummary('ground'),
    A: ['余震', '0.4 秒后再震一次（60% 伤害）'], B: ['导体地面', '留下 3 秒带电地面'], formText: '震击范围翻倍，每次都留下 8 秒带电地面' },
  rod: { name: '避雷针', tags: ['电', '召唤物', '区域'], ignite: 'magnet', form: '针阵',
    base: '周期性在敌群里插针，嘲讽 4 米内敌人并持续放电', stat: () => stSummary('rod'),
    A: ['多根', '一次插 2 根'], B: ['连线', '针与你之间连一道伤人的电弧'], formText: '针持续 10 秒，所有针之间连成电网' },
  short: { name: '短路', tags: ['电', '受伤触发'], ignite: 'tough', form: '永动',
    base: '受伤时向周围放电弧（有冷却）', stat: () => stSummary('short'),
    A: ['反弹', '电弧额外附加受到伤害的 300%'], B: ['护盾', '受伤后获得 2 秒护盾（吸收 15）'], formText: '不需要受伤，每秒自动放电' },
  tune: { name: '过载调谐', tags: ['电', '过载'], ignite: 'capacitor', form: '蓄能脉冲',
    base: '过载积累更快，过载脉冲更强', stat: () => stSummary('tune'),
    A: ['余热', '脉冲后 3 秒光圈伤害翻倍'], B: ['稳压', '过载到 50 时先放一次半脉冲'], formText: '脉冲范围 +30%，并在 0.35 秒后补一次 50% 的余波' },
};
