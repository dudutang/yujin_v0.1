// ================= 结算与历史 =================
function loadHist() { try { return JSON.parse(localStorage.getItem('ember-proto-runs') || '[]'); } catch (e) { return []; } }
function saveHist(h) { try { localStorage.setItem('ember-proto-runs', JSON.stringify(h.slice(-20))); } catch (e) { } }
function mainTags() { if (isW()) { const ts = Object.keys(TREES).filter(t => treePts(t)).sort((a, b) => treePts(b) - treePts(a)).slice(0, 2).map(t => TREES[t].name); return (S.spec ? SPECS[S.spec].short : '未转职') + ' · ' + axeName('atk') + ' · ' + (ts.join('+') || '无'); } const c = {}; for (const s of S.skills) for (const t of SKILLS[s.id].tags) c[t] = (c[t] || 0) + s.lvl; for (const id in S.passives) for (const t of PASSIVES[id].tags) c[t] = (c[t] || 0) + S.passives[id]; delete c['电']; return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]).join('+') || '电'; }
function endRun(outcome) {
  if (mode === 'end') return;
  mode = 'end'; $('#overlay').classList.remove('on'); current = null;
  const p = S.player, R = S.run;
  sfx(outcome === 'extract' ? 'extract' : 'death'); R.outcome = outcome; R.t = +S.t.toFixed(1); R.level = p.lvl; R.kills = S.stats.kills; R.conc = Math.round(S.conc);
  R.depth = LAYERS[S.maxDepth].name; R.chests = S.chestsOpened; R.nests = S.stats.nests; R.breaks = S.stats.breaks;
  const keep = outcome === 'extract' ? 1 : hasT('safe') ? 0.3 : unl('keep') ? 0.15 : 0;
  const sc0 = Math.floor(S.loot.scrap * keep), sc1 = outcome === 'extract' ? Math.min(60, sc0) + Math.floor(Math.max(0, sc0 - 60) / 2) : sc0;
  R.loot = { scrap: sc1, part: Math.floor(S.loot.part * keep) }; R.scrapTaxed = sc0 - sc1;
  R.lostLoot = outcome === 'extract' ? null : { scrap: Math.floor(S.loot.scrap) - R.loot.scrap, part: Math.floor(S.loot.part) - R.loot.part };
  R.build = { skills: S.skills.map(s => ({ id: s.id, lvl: s.lvl, branch: s.branch, ignited: s.ignited })), passives: { ...S.passives }, bless: { ...S.bless }, mainTags: mainTags() };
  R.reactions = { ...S.stats.reactions };
  R.reapers = S.reapers || 0; R.elites = S.stats.elites || 0; R.waves = [...S.waveSeen]; R.golds = S.run.golds || 0; R.boss = S.stats.boss || 0; R.bossAt = S.run.bossAt; R.bossKill = S.run.bossKill;
  if (!isW()) R.build.arc = { gods: S.gods.slice(), bl: Object.fromEntries(Object.entries(S.bl).map(([k, v]) => [k, v.lvl])), atk: S.atk, lamp: S.lamp, alts: S.alts, altsUsed: S.run.altsUsed || 0, pets: S.pets.length, hellXp: S.run.hellXp || 0 };
  if (isW()) R.build.warrior = { spec: S.spec, axe: { ...S.axe }, axeNames: { atk: axeName('atk'), fin: axeName('fin'), edge: axeName('edge') }, nodes: { ...S.nodes }, syn: [...S.syn], berserks: S.run.berserks || 0, minionsMax: S.minions.length };
  R.tapes = outcome === 'extract' ? S.runTapes.slice() : []; R.lostTapes = outcome === 'extract' ? [] : S.runTapes.slice();
  META.scrap += R.loot.scrap; META.part += R.loot.part;
  if (outcome === 'extract') { for (const id of S.runTapes) if (!META.tapes.includes(id)) META.tapes.push(id); }
  META.runs++; R.questsDone = questTick(R).map(q => q.name + '：' + q.gain); if (!window.__bot) saveMeta();
  const lvc = R.choices.filter(c => c.kind === 'level'), dw = lvc.map(c => c.dwell);
  R.dwellMedian = +median(dw).toFixed(2);
  const h = loadHist(); h.push({ when: R.started, outcome, t: R.t, level: R.level, tags: R.build.mainTags, ign: (R.syn && R.syn.length) ? R.syn[0].t : R.ignitions.length ? R.ignitions[0].t : null, conc: R.conc, dwell: R.dwellMedian, depth: R.depth, loot: R.loot }); saveHist(h);
  window.__lastRun = R;
  if (window.__bot) return;
  renderEnd(R, h);
}
function renderEnd(R, h) {
  const ok = R.outcome === 'extract';
  const lvc = R.choices.filter(c => c.kind === 'level');
  const slotCount = { 巩固: 0, 顺势: 0, 诱惑: 0, 补给: 0 }; lvc.forEach(c => { slotCount[c.pickedSlot] = (slotCount[c.pickedSlot] || 0) + 1; });
  const fast = lvc.filter(c => c.dwell < 2).length, slow = lvc.filter(c => c.dwell > 15).length;
  const WB = R.build.warrior, AB = R.build.arc;
  const skillsL = AB ? `<li><b>灯魂：</b>${AB.gods.length ? AB.gods.map(g => `<span style="color:${GODS[g].col}">${GODS[g].name}</span>`).join(' · ') : '没有结缘'}${AB.altsUsed ? `（换魂 ${AB.altsUsed} 次）` : ''}</li>` + Object.keys(AB.bl).map(id => `<li><span style="color:${GODS[BL[id].god].col}">${BL[id].name}</span> ${BL[id].type === 'legend' ? '<b>传奇</b>' : 'Lv ' + AB.bl[id]} · ${TYPE_N[BL[id].type]}</li>`).join('') + (AB.hellXp ? `<li>炼狱给的经验：${AB.hellXp}</li>` : '') : WB ? `<li><b>${WB.spec ? SPECS[WB.spec].name : '未转职'}</b> · 普攻 ${WB.axeNames.atk} · 终结技 ${WB.axeNames.fin} · 斧刃 ${WB.axeNames.edge}</li>` + Object.keys(TREES).filter(t => TREES[t].nodes.some(n => WB.nodes[n])).map(t => `<li>${TREES[t].name}：${TREES[t].nodes.filter(n => WB.nodes[n]).map(n => NODES[n].name + (NODES[n].max > 1 ? ' ' + WB.nodes[n] : '')).join('、')}</li>`).join('') + (WB.syn.length ? `<li>协同：${WB.syn.map(x => SYN.find(y => y.id === x).name).join('、')}</li>` : '') : R.build.skills.map(s => `<li>${SKILLS[s.id].name} Lv ${s.lvl}${s.branch ? ' · ' + SKILLS[s.id][s.branch][0] : ''}${s.ignited ? ' · <b>点燃：' + SKILLS[s.id].form + '</b>' : ''}</li>`).join('');
  const passL = Object.entries(R.build.passives).map(([k, v]) => `<li>${PASSIVES[k].name} Lv ${v}</li>`).join('') || '<li class="hint">没有被动</li>';
  const blessL = Object.entries(R.build.bless).map(([k, v]) => `<li>${BLESS[k].name} ${v} 层（${VOICES[BLESS[k].v][0]}）</li>`).join('') || '<li class="hint">没有祝福</li>';
  const ign = WB ? ((R.syn || []).map(x => `${SYN.find(y => y.id === x.id).name} @ ${fmt(x.t)}`).join('，') || '没有协同') + ` · 狂暴 ${WB.berserks} 次` : R.ignitions.map(i => `${SKILLS[i.skill].form} @ ${fmt(i.t)}`).join('，') || '没有点燃';
  const rx = Object.entries(R.reactions).filter(x => x[1]).map(x => `${x[0]} ×${x[1]}`).join('，') || '无';
  const rows = h.slice(-10).reverse().map(r => `<tr><td>${r.outcome === 'extract' ? '<span class="ok">撤离</span>' : '<span class="bad">倒下</span>'}</td><td>${fmt(r.t)}</td><td>${r.depth || ''}</td><td>${r.level}</td><td>${r.tags}</td><td>${r.ign != null ? fmt(r.ign) : '—'}</td><td>${r.conc != null ? r.conc : '—'}</td><td>${r.dwell}s</td><td>${r.loot ? r.loot.scrap + ' / ' + r.loot.part : ''}</td></tr>`).join('');
  const html = `<div class="panel">
    <div><div class="title">RUN REPORT</div><h2 class="${ok ? 'ok' : 'bad'}">${ok ? '撤离成功' : '倒下了'}</h2><div class="sub">${ok ? '带着东西回到了光里。' : '同行的人把你拖了回来，背包里的东西都丢了。'}</div></div>
    <div class="grid2">
      <div class="box"><h3>这一局</h3><dl class="kv">
        <dt>用时</dt><dd>${fmt(R.t)}</dd><dt>最深到达</dt><dd>${R.depth}</dd><dt>等级 / 击杀</dt><dd>${R.level} / ${R.kills}</dd>
        <dt>带回</dt><dd>${R.loot.scrap} 废料 · ${R.loot.part} 零件${R.lostLoot ? `（丢了 ${R.lostLoot.scrap} 废料 · ${R.lostLoot.part} 零件）` : '，已存入工坊'}</dd>
        <dt>录音带</dt><dd>${R.tapes.length ? R.tapes.map(i => '#' + (i + 1)).join(' ') + ' 已带回' : R.lostTapes.length ? `丢了 ${R.lostTapes.length} 盘` : '没有'} · 共听过 ${META.tapes.length}/12</dd>
        <dt>${ok ? '撤离时浓度' : '倒下时浓度'}</dt><dd>${R.conc}（${stageOf(R.conc)}）</dd>
        <dt>装备</dt><dd>${(S.run.gear || []).length ? S.run.gear.map(g => `<b style="color:${GEAR_RAR[g.rar].col}">${g.name}</b>`).join('、') + '（倒下也带回来了）' : '这局没捡到'}</dd>
        <dt>地图</dt><dd>打碎 ${R.breaks} · 储物柜 ${R.chests} · 巢穴 ${R.nests}</dd></dl></div>
      <div class="box"><h3>构筑判据</h3><dl class="kv">
        <dt>三选一次数</dt><dd>${lvc.length}</dd><dt>停留中位数</dt><dd>${R.dwellMedian} 秒（目标 3–8）</dd>
        <dt>秒选 / 卡住</dt><dd>${fast} 次 &lt;2 秒 · ${slow} 次 &gt;15 秒</dd>
        <dt>选了哪个槽</dt><dd>巩固 ${slotCount.巩固} · 顺势 ${slotCount.顺势} · 诱惑 ${slotCount.诱惑}</dd>
        <dt>${WB ? '协同' : '传奇'}</dt><dd>${WB ? ign : (AB && Object.keys(AB.bl).filter(k => BL[k].type === 'legend').map(k => BL[k].name).join('、')) || '没有拿到传奇（掷中传说后 25%，且那位灯魂已有 2 张）'}</dd><dt>元素反应</dt><dd>${rx}${R.firstReaction ? `，首次 @ ${fmt(R.firstReaction.t)}` : ''}</dd>
        <dt>主标签</dt><dd>${R.build.mainTags}</dd></dl></div>
      <div class="box"><h3>构筑</h3><div class="hint">技能</div><ul>${skillsL}</ul><div class="hint">被动</div><ul>${passL}</ul><div class="hint">祝福</div><ul>${blessL}</ul></div>
    </div>
    <div class="box"><h3>最近 10 局（只存在你这个浏览器里）</h3><div class="tablewrap"><table class="hist"><thead><tr><th>结果</th><th>用时</th><th>最深</th><th>等级</th><th>主标签</th><th>首次点燃</th><th>结束浓度</th><th>停留中位</th><th>带回 废料/零件</th></tr></thead><tbody>${rows}</tbody></table></div></div>
    <div class="row-btns"><button class="btn" id="again">再来一局（R）</button><button class="btn ghost" id="toshop">去工坊（W）</button><button class="btn ghost" id="copy">复制本局数据</button><span class="hint" id="copyMsg"></span></div>
    <textarea id="dump" readonly hidden></textarea>
  </div>`;
  const ov = $('#overlay'); ov.innerHTML = html; ov.classList.add('on');
  $('#again').onclick = () => start(R.cls || 'arc'); $('#toshop').onclick = titleScreen; $('#again').focus({ preventScroll: true });
  $('#copy').onclick = async () => {
    const txt = JSON.stringify(R); const ta = $('#dump');
    try { await navigator.clipboard.writeText(txt); $('#copyMsg').textContent = '已复制，可以直接粘贴到对话里。'; }
    catch (e) { ta.hidden = false; ta.value = txt; ta.select(); $('#copyMsg').textContent = '浏览器不让直接复制：数据在下面的框里，已全选，按 Ctrl/Cmd + C。'; }
  };
}

