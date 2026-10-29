// ================= 灯核光环（科技树：靠拾取科技芯片获得，不走升级） =================
const AURA = {
  burn: { name: '灼光', type: 'dmg', col: '#ff9a4a', lt: 'ember', text: '身边燃起一圈火：每 0.5 秒灼烧圈内敌人，有概率点燃' },
  storm: { name: '雷环', type: 'dmg', col: '#bfe6ff', lt: 'cyan', text: '周期性向圈内多个敌人放电' },
  frost: { name: '霜环', type: 'dmg', col: '#bfe9ff', lt: 'cyan', text: '圈内敌人持续减速，并受到寒气伤害' },
  mend: { name: '愈光', type: 'sup', col: '#9be08a', lt: 'green', text: '持续回复生命，生命上限提高' },
  haste: { name: '疾光', type: 'sup', col: '#ffe08a', lt: 'lamp', text: '攻速和移速提高' },
  ward: { name: '守光', type: 'sup', col: '#ffd28a', lt: 'white', text: '周期性获得一层护盾' },
  lure: { name: '磁光', type: 'sup', col: '#c4a8ff', lt: 'violet', text: '拾取范围和经验提高' },
};
const AURA_RES = [
  { id: 'dmg2', name: '炽燃共鸣', need: '两个伤害型', text: '伤害型光环伤害 +40%' },
  { id: 'sup2', name: '护持共鸣', need: '两个辅助型', text: '所有光环范围 +25%，生命回复 +0.4%/秒' },
  { id: 'mix', name: '灯火相济', need: '伤害型 + 辅助型各一', text: '所有光环范围 +10%，伤害 +15%' },
];
const auraSlots = () => 3;
const auraCnt = t => (S.auras || []).filter(a => AURA[a].type === t).length;
const auraRes = id => id === 'dmg2' ? auraCnt('dmg') >= 2 : id === 'sup2' ? auraCnt('sup') >= 2 : auraCnt('dmg') >= 1 && auraCnt('sup') >= 1;
const auraR = id => 2.6 * M * (ST['aura_' + id].s.size ? stv('aura_' + id, 'size') : 1) * D.area * (auraRes('sup2') ? 1.25 : 1) * (auraRes('mix') ? 1.1 : 1);
const auraDmg = () => (auraRes('dmg2') ? 1.4 : 1) * (auraRes('mix') ? 1.15 : 1);
function updAuras(dt) {
  if (!S.auras || !S.auras.length) return; const p = S.player; S.auraT = S.auraT || {};
  for (const id of S.auras) {
    const A = S.auraT[id] = S.auraT[id] || { t: 0.5 }; A.t -= dt; if (A.t > 0) continue; const R = auraR(id), sv = k => stv('aura_' + id, k);
    if (id === 'burn') { A.t = 0.5; for (const e of query(p.x, p.y, R)) { dealDamage(e, sv('dmg') * auraDmg(), 'fire', { weak: true, dot: true }); if (!e.dead && Math.random() < sv('chance')) applyStatus(e, 'burn', 1); } }
    else if (id === 'storm') { A.t = sv('cd') * D.cdMul; const ts = nearestN(p.x, p.y, R, Math.round(sv('count')) + Math.floor(D.count + 1e-6)); if (ts.length) sfx('zap'); for (const t of ts) { addArc(p.x, p.y - 10, t.x, t.y, '#cfeaff', 0.15, 1.8); dealDamage(t, sv('dmg') * auraDmg(), 'elec', {}); } }
    else if (id === 'frost') { A.t = 0.5; for (const e of query(p.x, p.y, R)) { e.auraSlow = S.t + 0.6; dealDamage(e, sv('dmg') * auraDmg(), 'phys', { weak: true, dot: true }); } }
    else if (id === 'ward') { A.t = sv('cd') * D.cdMul; p.shield = Math.max(p.shield, sv('shield') * D.maxHp); p.shieldT = A.t + 0.5; addRing(p.x, p.y, 1.2 * M, '#ffd28a', 0.35); }
    else A.t = 1;
  }
}
function auraChoices() {
  const own = S.auras || [], opts = [];
  for (const id of own) if (stLvl('aura_' + id) < 8) opts.push({ kind: 'aura', id, owned: true });
  if (own.length < auraSlots()) for (const id of Object.keys(AURA)) if (!own.includes(id)) opts.push({ kind: 'aura', id, owned: false });
  const li = layerAt(S.player.x, S.player.y);
  const out = shuffle(opts).slice(0, own.length >= auraSlots() ? 2 : 3).map(o => rollRarity({ ...o, slot: o.owned ? '巩固' : '科技' }, li));
  if (own.length >= auraSlots()) out.push({ kind: 'res', id: 'scrap20', slot: '补给', rar: -1 });
  return out;
}
function openChip() {
  S.pendingChip--; const opts = auraChoices();
  if (!opts.length) { S.loot.part += 2; return; }
  if (window.__bot && window.__botFast) { applyOption(pickU(opts)); return; }
  showPanel(`<div class="panel"><div><div class="title">TECH CHIP</div><h2>科技芯片：给提灯装一个光环</h2><div class="sub">光环只能从芯片获得（精英 35%、巢穴必掉、储物柜 50%），最多 ${auraSlots()} 个。同类两个触发共鸣；伤害型 + 辅助型触发「灯火相济」。越深芯片越稀有。按 ${opts.map((_, i) => i + 1).join(' / ')} 或点击。</div></div><div class="cards">${opts.map(cardHTML).join('')}</div></div>`,
    i => applyOption(opts[i]), { kind: 'chip', options: opts });
  if (window.__bot) setTimeout(() => pickCard((Math.random() * opts.length) | 0), 0);
}
function auraTreeHTML() {
  const own = S.auras || [];
  const row = t => Object.keys(AURA).filter(id => AURA[id].type === t).map(id => { const has = own.includes(id); return `<li>${has ? `<b class="ok">${AURA[id].name}</b> Lv ${stLvl('aura_' + id)}` : AURA[id].name}<br><span class="hint">${AURA[id].text}</span>${has ? `<br><span class="hint">${stSummary('aura_' + id)}${ST['aura_' + id].s.size || id === 'storm' ? ' · 半径 ' + (auraR(id) / M).toFixed(1) + ' 米' : ''}</span>` : ''}</li>`; }).join('');
  const res = AURA_RES.map(r => `<li>${auraRes(r.id) && own.length ? `<b class="ok">${r.name}</b>` : r.name}（${r.need}）<br><span class="hint">${r.text}</span></li>`).join('');
  return `<div class="box"><h3>灯核光环 ${own.length}/${auraSlots()} · 伤害型</h3><ul>${row('dmg')}</ul></div><div class="box"><h3>辅助型</h3><ul>${row('sup')}</ul></div><div class="box"><h3>共鸣 · 来源</h3><ul>${res}<li class="hint">科技芯片：精英 35%、巢穴必掉、储物柜 50%、箱子桶 4%</li></ul></div>`;
}
function drawAuras(glow) {
  if (!S.auras || !S.auras.length) return; const p = S.player;
  S.auras.forEach((id, j) => {
    const A = AURA[id], R = auraR(id), t = S.t; ctx.globalAlpha = 1;
    ctx.strokeStyle = A.col; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.22 + 0.08 * Math.sin(t * 3 + j); ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 20 * (j % 2 ? -1 : 1); ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    if (id === 'burn') { ctx.fillStyle = '#ffb15a'; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283 + t * 0.4, h = 3 + 4 * Math.abs(Math.sin(t * 9 + i * 1.7)); ctx.globalAlpha = 0.55; ctx.fillRect(p.x + Math.cos(a) * R - 1, p.y + Math.sin(a) * R - h, 2.5, h); } glow(GLOW.ember, p.x, p.y, R, 0.12); }
    else if (id === 'storm') { for (let i = 0; i < 3; i++) { const a = t * 2.2 + i * 2.094, x = p.x + Math.cos(a) * R, y = p.y + Math.sin(a) * R; glow(GLOW.cyan, x, y, 10, 0.8); } }
    else if (id === 'frost') { ctx.fillStyle = '#e8f6ff'; for (let i = 0; i < 18; i++) { const u = (t * 0.25 + i * 0.137) % 1, a = i * 2.39, r = R * (0.25 + 0.7 * ((i * 0.61) % 1)); ctx.globalAlpha = Math.sin(Math.PI * u) * 0.7; ctx.fillRect(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r - 12 + u * 24, 2, 2); } glow(GLOW.blue, p.x, p.y, R, 0.08); }
    else if (id === 'mend') { ctx.fillStyle = '#b8f0a8'; for (let i = 0; i < 14; i++) { const u = (t * 0.5 + i * 0.071) % 1, a = i * 2.39, r = R * 0.8 * ((i * 0.37) % 1); ctx.globalAlpha = Math.sin(Math.PI * u) * 0.8; ctx.fillRect(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * 0.6 - u * 26, 2, 2); } }
    else if (id === 'haste') { ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = t * 5 + i * 1.571; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(p.x, p.y, 0.55 * R, a, a + 0.5); ctx.stroke(); } }
    else if (id === 'ward') { ctx.strokeStyle = '#ffd28a'; ctx.lineWidth = 2; ctx.globalAlpha = p.shield > 0 ? 0.7 : 0.3; ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * 6.283 + t * 0.5; ctx[i ? 'lineTo' : 'moveTo'](p.x + Math.cos(a) * 26, p.y - 4 + Math.sin(a) * 26); } ctx.stroke(); if (p.shield > 0) glow(GLOW.amber, p.x, p.y - 4, 30, 0.35); }
    else if (id === 'lure') { ctx.fillStyle = '#d8c8ff'; for (let i = 0; i < 16; i++) { const u = 1 - (t * 0.6 + i * 0.0625) % 1, a = i * 2.39 + t * 0.3; ctx.globalAlpha = (1 - u) * 0.8; ctx.fillRect(p.x + Math.cos(a) * D.pickup * u, p.y + Math.sin(a) * D.pickup * u, 2, 2); } }
  });
  ctx.globalAlpha = 1;
}

