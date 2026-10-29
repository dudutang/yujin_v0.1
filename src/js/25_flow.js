// ================= 开始 / 暂停 =================
function titleScreen() {
  mode = 'title'; $('#hud').hidden = true;
  const h = loadHist();
  const techHTML = TECH.map(t => {
    const own = hasT(t.id), can = META.scrap >= t.cost[0] && META.part >= t.cost[1];
    const price = `${t.cost[0]} 废料${t.cost[1] ? ' · ' + t.cost[1] + ' 零件' : ''}`;
    return `<div class="tech${own ? ' own' : ''}"><div><b>${t.name}</b> <span class="hint">${t.line}</span><div class="hint">${t.text}</div></div>${own ? '<span class="ok">已拥有</span>' : `<button class="btn${can ? '' : ' ghost'} buy" data-t="${t.id}" ${can ? '' : 'disabled'}>${price}</button>`}</div>`;
  }).join('');
  const tapes = META.tapes.slice().sort((x, y) => x - y).map(i => `<li><b>#${i + 1}</b> ${TAPES[i]}</li>`).join('') || '<li class="hint">还没有带回任何录音带。中心层有一盘，进入深处后每 70 秒会出现新的信号。</li>';
  $('#overlay').innerHTML = `<div class="panel">
    <div><div class="title">EMBERS · 出征原型 2.5</div><h2>余烬：提着灯走进灰潮</h2><div class="sub">两个职业：弧光师、破障者。撤离时带回的废料和零件存进工坊，买永久科技；倒下就全丢——只有装备例外，倒下也带得回来。</div></div>
    <div class="grid2">
      <div class="box"><h3>工坊 · 库存 ${META.scrap} 废料 · ${META.part} 零件</h3><div class="techs">${techHTML}</div><div class="hint">零件主要来自精英（越深掉越多）和录音带。</div></div>
      <div class="box"><h3>老守灯人的录音带 ${META.tapes.length}/12</h3><ul class="tapes">${tapes}</ul></div>
    </div>
    <div class="grid2">${gearHTML()}</div>
    <div class="grid2"><div class="box"><h3>任务板（跨局累计，倒下也算）</h3><ul>${questHTML()}</ul></div></div>
    <div class="grid2">
      <div class="box"><h3>怎么玩</h3><ul>
        <li>攻击全自动，你只管走位和做选择。世界没有边：离灯塔越远越深，敌人越多，掉落越好。弧光师每次升级会有一位<b>灯魂</b>来访，三张卡全是她的；一局最多结缘三位，<kbd>Q</kbd> 可以换一位。</li>
        <li><b>灰潮浓度是唯一的计时器。</b>它一直在涨，越深涨得越快；过了 100 进入「吞没」，每 40 秒来一个打不死的<b>收灯人</b>，越来越多。</li>
        <li>修路灯（${REPAIR_COST} 废料）：浓度立刻 −8、一条祝福、一个撤离点，站在灯下浓度停涨 ${lampStore()} 秒。</li>
        <li>撞碎木箱、桶和灰茧会掉东西；储物柜花废料打开；打掉<b>灰潮巢穴</b>浓度 −6。</li>
        <li><b>神龛</b>二选一有代价；<b>挑战神龛</b>召一波带标记的怪，清完开金柜；<b>潮眼</b>召蚀壳巨兽；<b>拾荒者</b>用废料换骰子和芯片。按 <kbd>Tab</kbd> 看全图。</li>
        <li>灰潮每到 30 / 50 / 70 / 90 来一波：灰蛾潮、精英双子、烬影海、蚀壳墙。压住浓度就是推迟它们。</li>
        <li>深处会出现<b>录音带信号</b>，有精英守着；每盘 +2 零件。</li>
        <li>回血：红色暖烬，或站在持续光源里。回到光里按住 <kbd>E</kbd> 撤离。</li>
      </ul></div>
      <div class="box"><h3>操作</h3><ul>
        <li><kbd>WASD</kbd> / 方向键 移动 · 按住 <kbd>E</kbd> 交互</li>
        <li><kbd>1</kbd>–<kbd>4</kbd> 选卡 · <kbd>R</kbd> 重随（需要科技）</li><li><kbd>Esc</kbd> 暂停并查看完整构筑</li>
      </ul><div class="hint">需要键盘。存档只在这个浏览器里。</div></div>
    </div>
    <div class="row-btns"><button class="btn" id="go">开始出征（Enter）</button><span class="hint">已出征 ${META.runs} 局${h.length ? '，记录在结算页' : ''}。</span><button class="btn ghost" id="wipe">清空存档</button></div>
  </div>`;
  $('#overlay').classList.add('on'); $('#go').onclick = chooseClass; $('#go').focus({ preventScroll: true });
  gearBind();
  document.querySelectorAll('.buy').forEach(b => b.onclick = () => { const t = TECH.find(x => x.id === b.dataset.t); if (META.scrap >= t.cost[0] && META.part >= t.cost[1] && !hasT(t.id)) { META.scrap -= t.cost[0]; META.part -= t.cost[1]; META.tech[t.id] = true; saveMeta(); titleScreen(); } });
  const w = $('#wipe'); w.onclick = () => { if (w.dataset.armed) { try { localStorage.removeItem(META_KEY); localStorage.removeItem('ember-proto-runs'); } catch (e) { } META = loadMeta(); saveMeta(); titleScreen(); } else { w.dataset.armed = '1'; w.textContent = '再点一次确认清空'; } };
}
function start(cls, aspect, pacts) {
  keys.clear(); if (!cls) cls = window.__botCls || 'arc';
  newRun(cls, aspect); for (const k of pacts || window.__botPact || []) S.pact[k] = true; S.run.pact = Object.keys(S.pact); recalc(); S.player.hp = D.maxHp; hudDirty = true; $('#overlay').classList.remove('on'); $('#hud').hidden = false; mode = 'play'; current = null; banner('出征', '先在灯塔附近成型，再往任何方向走远。灰潮在涨。', '#ffb454'); if (hasT('startbless')) openBless(['keeper'], '出征前：选一条老守灯人的祝福'); }
function openMap() {
  mode = 'map'; const ov = $('#overlay');
  ov.innerHTML = `<div class="panel"><div><div class="title">MAP</div><h2>地图 · 以你为中心</h2><div class="sub">Tab 关闭。世界没有边，离灯塔越远灰潮涨得越快：外围 45 米内、中心 95 米内、再远是深处。黑的地方还没去过。用过的物件变灰。</div></div><canvas id="bigmap" width="1200" height="640" style="width:100%;max-width:1200px;border:1px solid var(--ash-2);border-radius:4px"></canvas>
  <div class="pool" style="margin-top:8px"><span class="pk" style="color:#8fe6a6">● 神龛</span><span class="pk" style="color:#c9b6ff">▲ 挑战</span><span class="pk" style="color:#ffb454">● 灯塔</span><span class="pk" style="color:#fff">● 你</span><span class="pk" style="color:#e8c160">● 贪婪碑</span><span class="pk" style="color:#ff9a4a">● 石碑(30 秒加成，颜色=种类)</span><span class="pk" style="color:#fff">■ 拾荒者</span><span class="pk" style="color:#ff6b5e">◆ 潮眼</span><span class="pk" style="color:#e7a93f">■ 储物柜</span><span class="pk" style="color:#ffe08a">■ 金柜</span><span class="pk" style="color:#ffb454">■ 路灯</span><span class="pk" style="color:#b79cff">● 巢穴</span><span class="pk" style="color:#9fe8ff">■ 录音带</span><span class="pk" style="color:#ffd28a">◆ 誓约碑</span></div></div>`;
  ov.classList.add('on'); const bc = $('#bigmap').getContext('2d'); drawMap(bc, 1200, 640, 4, true);
}
function pauseScreen() {
  if (isW()) return pauseWarrior();
  return pauseArc();
  mode = 'pause';
  const sk = S.skills.map(s => { const d = SKILLS[s.id]; return `<li><b>${d.name}</b> Lv ${s.lvl}${s.branch ? ' · ' + d[s.branch][0] : ''}${s.ignited ? ' · 点燃：' + d.form : ''}${afxPool(s.id, [])}<span class="hint">${d.base}。${d.stat(s.lvl)}${s.branch ? '。' + d[s.branch][1] : ''}${s.ignited ? '。' + d.formText : `。点燃：5 级 +「${PASSIVES[d.ignite].name}」`}</span></li>`; }).join('');
  const ps = Object.entries(S.passives).map(([k, v]) => `<li><b>${PASSIVES[k].name}</b> Lv ${v}<br><span class="hint">${PASSIVES[k].text(lv(k))}</span></li>`).join('') || '<li class="hint">还没有</li>';
  const bs = Object.entries(S.bless).map(([k, v]) => `<li><b>${BLESS[k].name}</b> ${v} 层<br><span class="hint">${BLESS[k].text(v)}</span></li>`).join('') || '<li class="hint">修好路灯或碰到祭坛时获得</li>';
  $('#overlay').innerHTML = `<div class="panel"><div><div class="title">PAUSED</div><h2>当前构筑</h2><div class="sub">弧光师 · 过载满 100 自动脉冲；光圈内敌人减速并持续受电伤。反应：燃烧+感电=爆燃，感电+曝光=电离，曝光+燃烧=熔毁。</div></div>
  <div class="grid2">${statsHTML()}</div><div class="box"><h3>职业特色</h3><ul>${CLS.arc.traits.map(t => `<li>${t}</li>`).join('')}</ul></div>
  <div class="grid2">${auraTreeHTML()}</div>
  <div class="grid2"><div class="box"><h3>技能 ${S.skills.length}/4</h3><ul>${sk}</ul></div><div class="box"><h3>被动 ${Object.keys(S.passives).length}/${passSlots()}</h3><ul>${ps}</ul></div><div class="box"><h3>祝福</h3><ul>${bs}</ul></div></div>
  <div class="row-btns"><button class="btn" id="resume">继续（Esc）</button><button class="btn ghost" id="quit">放弃这局</button></div></div>`;
  $('#overlay').classList.add('on'); $('#resume').onclick = resume; $('#quit').onclick = () => { mode = 'play'; endRun('dead'); };
}
function resume() { $('#overlay').classList.remove('on'); mode = 'play'; }

addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'm' && !e.repeat) { auToggle(); return; }
  if (k === 'tab' && S && (mode === 'play' || mode === 'map')) { e.preventDefault(); if (mode === 'play') openMap(); else { $('#overlay').classList.remove('on'); mode = 'play'; } return; }
  if (mode === 'title' && (k === 'enter' || k === ' ')) { e.preventDefault(); chooseClass(); return; }
  if (mode === 'select' && sel && ['1', '2', '3', '4', '5', '6'].includes(k)) { e.preventDefault(); pickSel(+k - 1); return; }
  if (mode === 'select' && sel && sel.confirm && k === 'enter') { e.preventDefault(); sel.confirm(); return; }
  if (mode === 'select' && k === 'escape') { if (sel && sel.inRun) { sel = null; $('#overlay').classList.remove('on'); mode = 'play'; } else titleScreen(); return; }
  if (mode === 'gold' && (k === 'enter' || k === ' ')) { e.preventDefault(); const b = $('#gok'); if (b) b.click(); return; }
  if (mode === 'end' && k === 'r') { const r = window.__lastRun || {}; start(r.cls || 'arc'); return; }
  if (mode === 'end' && k === 'w') { titleScreen(); return; }
  if (mode === 'choice' && current && ['1', '2', '3', '4'].includes(k)) { e.preventDefault(); pickCard(+k - 1); return; }
  if (mode === 'choice' && current && k === 'r') { doReroll(); return; }
  if (mode === 'choice' && current && k === 'q') { doAlter(); return; }
  if (k === 'escape' || k === 'p') { if (mode === 'play') pauseScreen(); else if (mode === 'pause') resume(); return; }
  if (['w', 'a', 's', 'd', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); if (k.startsWith('arrow')) e.preventDefault(); }
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => { keys.clear(); if (mode === 'play') pauseScreen(); });

