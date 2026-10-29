// ================= HUD =================
let hudAcc = 0; const mini = $('#mini'), mctx = mini.getContext('2d');
function hudTick(dt) {
  if (bannerT > 0 && (bannerT -= dt) <= 0) $('#banner').classList.remove('on');
  if (!S || mode === 'title') return;
  hudAcc += dt; if (hudAcc < 0.1 && !hudDirty) return; hudAcc = 0;
  const p = S.player, c = S.conc;
  { const b = S.boss; $('#bBar').hidden = !b; if (b) { $('#bFill').style.transform = `scaleX(${Math.max(0, b.hp / b.maxHp)})`; $('#bName').textContent = (b.boss === 2 ? '深处的' : '') + '蚀壳巨兽'; $('#bText').textContent = (b.bshell > 0 ? `壳 ${b.bshell} · ` : '') + Math.ceil(b.hp) + ' / ' + Math.round(b.maxHp); } }
  $('#cFill').style.transform = `scaleX(${Math.min(1, c / 100)})`; $('#cBar').classList.toggle('flood', c >= 100);
  $('#cStage').textContent = '灰潮 · ' + stageOf(c); $('#cText').textContent = c >= 100 ? '100 + ' + Math.floor(c - 100) : Math.floor(c);
  { const nw = nextWave(); $('#cHint').textContent = (S.tideFreeze > 0 ? `巨兽倒下：停涨 ${Math.ceil(S.tideFreeze)} 秒 · ` : S.boss ? '巨兽在场：路灯失效 · 身边 5 米灰潮 ×3 · ' : '') + (S.chal ? `挑战：还剩 ${S.chal.left} 个 · ${Math.ceil(S.chal.t)} 秒 · ` : '') + (S.held ? '路灯压住了灰潮' : (S.nestNear ? '巢穴就在附近，灰潮涨得更快' : '每 ' + (1 / tideRate()).toFixed(1) + ' 秒 +1')) + (nw ? ` · 下一波：${nw.name} @${nw.th}` : '') + (c >= 85 && c < 100 ? ' · 到 100 就是吞没' : ''); }
  $('#hFill').style.transform = `scaleX(${Math.max(0, p.hp / D.maxHp)})`; $('#hText').textContent = Math.ceil(Math.max(0, p.hp)) + ' / ' + Math.round(D.maxHp) + (isW() && p.hp < D.maxHp ? (p.breath ? ' · 喘息回复' : '') : ''); $('#hFill').parentNode.classList.toggle('breath', !!(isW() && p.breath && p.hp < D.maxHp));
  if (isW()) { const bz = S.berserkT > 0; $('#oFill').style.transform = `scaleX(${bz ? Math.min(1, S.berserkT / (6 + (nd('warcry') ? 3 : 0))) : S.rage / 100})`; $('#oBar').classList.add('rage'); $('#oBar').classList.toggle('hot', bz); $('#oText').textContent = bz ? `狂暴 ${S.berserkT.toFixed(1)} 秒` : `怒气 ${Math.floor(S.rage)} · 满 100 狂暴`; }
  else { $('#oFill').style.transform = `scaleX(${p.overload / 100})`; $('#oBar').classList.remove('rage'); $('#oBar').classList.toggle('hot', p.overload > 80); $('#oText').textContent = '过载 · 满 100 自动脉冲'; }
  $('#xFill').style.transform = `scaleX(${Math.min(1, p.xp / needXp(p.lvl))})`;
  $('#lvText').textContent = 'LV ' + p.lvl; $('#tText').textContent = fmt(S.t);
  $('#scrapText').textContent = Math.floor(S.loot.scrap); $('#partText').textContent = Math.floor(S.loot.part); $('#killText').textContent = S.stats.kills;
  const deepTape = S.tapeItems.some(t => t.deep);
  $('#layerText').textContent = (S.buff ? STONES[S.buff.k].name + ' ' + Math.ceil(S.buff.t) + 's · ' : '') + LAYERS[layerAt(p.x, p.y)].name + ' · 离灯塔 ' + Math.round(Math.hypot(p.x, p.y) / M) + ' 米 · 路灯 ' + S.lamps.filter(l => l.rep).length + (S.altar.used ? '' : ' · 祭坛在深处') + (deepTape ? ' · 录音带信号：青色标记' : S.deepEntered ? ' · 下一个信号 ' + fmt(S.tapeT) : '') + (S.runTapes.length ? ' · 身上 ' + S.runTapes.length + ' 盘' : '');
  if (hudDirty) {
    hudDirty = false;
    const sk = []; for (let i = 0; i < 4; i++) { const s = S.skills[i]; if (s) { const d = SKILLS[s.id]; sk.push(`<div class="slot skill${s.ignited ? ' ign' : ''}"><span>${s.ignited ? d.form : d.name}</span><span class="meta"><b>${s.lvl}</b>/5${s.branch ? ' ' + d[s.branch][0] : ''}</span></div>`); } else sk.push('<div class="slot empty">空技能槽</div>'); }
    const pk = Object.keys(S.passives), ps = []; for (let i = 0; i < passSlots(); i++) { const id = pk[i]; ps.push(id ? `<div class="slot passive"><span>${PASSIVES[id].name}</span><span class="meta"><b>${S.passives[id]}</b>/5</span></div>` : '<div class="slot empty">空被动槽</div>'); }
    const bs = Object.entries(S.bless).map(([id, n]) => `<div class="slot bless"><span>${BLESS[id].name}</span><span class="meta"><b>${n}</b> 层</span></div>`);
    if (isW()) $('#build').innerHTML = warriorBuildHTML(ps, bs); else if (S.bl) $('#build').innerHTML = arcBuildHTML(ps, bs); else $('#build').innerHTML = `${Object.keys(S.pact || {}).length ? `<div><h4>契约</h4><div class="slots">${Object.keys(S.pact).map(k => `<div class="slot bless"><span>${PACT[k].name}</span><span class="meta">契约</span></div>`).join('')}</div></div>` : ''}<div><h4>技能</h4><div class="slots">${sk.join('')}</div></div>${(S.auras || []).length ? `<div><h4>光环</h4><div class="slots">${S.auras.map(id => `<div class="slot skill ign"><span>${AURA[id].name}光环</span><span class="meta">Lv ${stLvl('aura_' + id)}</span></div>`).join('')}</div></div>` : ''}<div><h4>被动</h4><div class="slots">${ps.join('')}</div></div>${bs.length ? `<div><h4>祝福</h4><div class="slots">${bs.join('')}</div></div>` : ''}`;
  }
  // 小地图（以玩家为中心，随探索揭露）
  drawMap(mctx, mini.width, mini.height, 3, false);
}

