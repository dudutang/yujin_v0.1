// ================= 渲染 =================
let camX = 0, camY = 0, RIM = null;
function rimDraw(img, x, y, w, h, cx, cy) { if (!RIM) return; const dx = cx - RIM.x, dy = cy - RIM.y, d = Math.hypot(dx, dy); if (d > RIM.R || d < 2) return; ctx.globalAlpha = Math.min(1, (1 - d / RIM.R) * 2) * 0.95; ctx.drawImage(tintC(img, '#ffd09a'), x - dx / d * 2, y - dy / d * 2, w, h); ctx.globalAlpha = 1; } const BODY_FONT = "'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif";
const TCACHE = new Map();
function tintC(img, col) { let m = TCACHE.get(img); if (!m) { m = new Map(); TCACHE.set(img, m); } let t = m.get(col); if (!t) { t = tint(img, col); m.set(col, t); } return t; }
function drawNest(e) {
  const pu = 1 + 0.05 * Math.sin(S.t * 3 + e.ph), fl = e.flash > 0;
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(e.x, e.y + 14, 38, 12, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = fl ? '#ffffff' : '#15121c';
  for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6 + 0.1 * Math.sin(S.t * 2 + i), L = 30 + (i % 2) * 10; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * 14, e.y); ctx.lineTo(e.x + Math.cos(a) * L, e.y + Math.sin(a) * L * 0.8 - 6); ctx.lineTo(e.x + Math.cos(a + 0.2) * 16, e.y + 2); ctx.fill(); }
  ctx.fillStyle = fl ? '#ffffff' : '#241d31'; ctx.beginPath(); ctx.ellipse(e.x, e.y, 28 * pu, 18 * pu, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = fl ? '#ffffff' : '#3a2f50'; ctx.beginPath(); ctx.ellipse(e.x - 5, e.y - 5, 18 * pu, 10 * pu, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#b79cff'; ctx.beginPath(); ctx.ellipse(e.x, e.y - 3, 7 * pu, 5 * pu, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#efe6ff'; ctx.fillRect(e.x - 2, e.y - 5, 3, 2);
  e._l = e.x - 28; e._t = e.y - 26; e._sc = 1; e._fy = 1;
}
function drawSlash(sl) {
  const a = sl.t / sl.life, prog = Math.min(1, (1 - a) * 3.2), full = sl.arc >= 360;
  const half = full ? Math.PI : sl.arc * Math.PI / 360, r = sl.R * (0.62 + 0.3 * (1 - a)), th = (sl.fin ? 15 : 10) * (0.5 + 0.5 * a);
  const a0 = sl.ang - half, span = 2 * half * prog, N = 22, fade = Math.min(1, a * 1.6);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [k, al, col] of [[1.9, 0.18, sl.col], [1, 0.75, sl.col]]) {
    ctx.globalAlpha = al * fade; ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const u = i / N, an = a0 + span * u, w = th * k * (full ? 0.8 : Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.7 * (0.35 + 0.65 * u)); ctx.lineTo(sl.x + Math.cos(an) * (r + w * 0.5), sl.y + Math.sin(an) * (r + w * 0.5)); }
    for (let i = N; i >= 0; i--) { const u = i / N, an = a0 + span * u, w = th * k * (full ? 0.8 : Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.7 * (0.35 + 0.65 * u)); ctx.lineTo(sl.x + Math.cos(an) * (r - w * 0.5), sl.y + Math.sin(an) * (r - w * 0.5)); }
    ctx.fill();
  }
  ctx.globalAlpha = fade; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = sl.fin ? 2.5 : 1.8; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.arc(sl.x, sl.y, r + th * 0.35, a0 + span * 0.25, a0 + span); ctx.stroke();
  ctx.restore();
}
function drawEnemy(e) {
  if (e.type === 'nest') return drawNest(e);
  const sc = e.type === 'boss' ? 2.8 : e.reaper ? 2.2 : e.elite ? 1.5 : 1; let img;
  if (e.reaper) img = tintC(((S.t * 3 + e.ph) | 0) % 2 ? ART.shadeA : ART.shadeB, '#0a0a10');
  else if (e.type === 'shade') img = e.flash > 0 ? ART.shadeW : (((S.t * 4 + e.ph) | 0) % 2 ? ART.shadeA : ART.shadeB);
  else if (e.type === 'moth') img = e.flash > 0 ? ART.mothW : ART.moth;
  else img = e.flash > 0 ? ART.shellW : (e.type === 'boss' ? tintC(ART.shell, e.bshell > 0 ? '#e8ecf4' : e.boss === 2 ? '#9a7fd6' : '#b89a7a') : ART.shell);
  const fk = e.flinchT > 0 ? Math.min(1, e.flinchT / 0.3) : 0;
  const w = img.width * sc * (1 + 0.2 * fk), h = img.height * sc * (1 - 0.16 * fk);
  const fy = e.type === 'moth' ? 0.55 + 0.45 * Math.abs(Math.sin(S.t * 14 + e.ph)) : 1;
  const lift = e.type === 'shade' ? Math.sin(S.t * 5 + e.ph) * 1.5 : e.type === 'moth' ? 10 + Math.sin(S.t * 3 + e.ph) * 4 : 0;
  const foot = e.y + e.r * 0.6;
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(e.x, foot, w * 0.36, w * 0.12, 0, 0, 6.283); ctx.fill();
  const left = e.x - w / 2, top = foot - h * fy - lift;
  if (e.elite && e.type !== 'boss') { ctx.globalAlpha = 0.9; ctx.drawImage(tintC(img, AFFIX[e.aff[0]].color), left - 2, top - 2, w + 4, h * fy + 4); ctx.globalAlpha = 1; }
  if (e.type === 'boss' && e.bshell > 0) { ctx.strokeStyle = `rgba(230,236,244,${0.5 + 0.3 * Math.sin(S.t * 10)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, foot - h * 0.5, w * 0.62, 0, 6.283); ctx.stroke(); }
  rimDraw(img, left, top, w, h * fy, e.x, top + h * fy * 0.5);
  ctx.drawImage(img, left, top, w, h * fy);
  if (e.chill) { ctx.globalAlpha = 0.25 + 0.12 * e.chill.n; ctx.drawImage(tintC(img, '#a8e0ff'), left, top, w, h * fy); ctx.globalAlpha = 1; }
  if (e.reaper) { ctx.fillStyle = '#ff3b3b'; ctx.fillRect(e.x - 7, top + 10, 4, 3); ctx.fillRect(e.x + 3, top + 10, 4, 3); }
  if (e.mark) { ctx.fillStyle = '#c9b6ff'; ctx.beginPath(); ctx.moveTo(e.x, top - 4); ctx.lineTo(e.x - 4, top - 11); ctx.lineTo(e.x + 4, top - 11); ctx.fill(); }
  if (e.gold) { ctx.fillStyle = '#ffd28a'; ctx.beginPath(); ctx.moveTo(e.x, top - 14); ctx.lineTo(e.x - 5, top - 22); ctx.lineTo(e.x + 5, top - 22); ctx.fill(); }
  if (e.ash) { const k = 1 - e.ash.t / 1.4; ctx.strokeStyle = `rgba(196,168,255,${0.5 + 0.4 * Math.sin(S.t * 18)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, top - 6, 5 + 4 * k, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#e6dbff'; ctx.fillRect(e.x - 1, top - 7, 2, 2); }
  e._l = left; e._t = top; e._sc = sc; e._fy = fy;
  if (e.shielded && e.shieldReady && e.brokenT <= 0) { ctx.strokeStyle = 'rgba(210,216,228,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, foot - h * 0.45, w * 0.62, -2.5, -0.6); ctx.stroke(); }
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#121620'; ctx.fillRect(0, 0, cv.width, cv.height);
  if (!S) return;
  const p = S.player;
  camX = p.x - VW / 2; camY = p.y - VH / 2;
  const sh = S.shake ? [rand(-S.shake, S.shake), rand(-S.shake, S.shake)] : [0, 0];
  const k = DPR * ZOOM;
  ctx.setTransform(k, 0, 0, k, (-camX + sh[0]) * k, (-camY + sh[1]) * k);
  ctx.imageSmoothingEnabled = false;
  const vx0 = camX - 80, vx1 = camX + VW + 80, vy0 = camY - 80, vy1 = camY + VH + 80;
  const inV = (x, y) => x > vx0 && x < vx1 && y > vy0 && y < vy1;
  collectVis(vx0, vy0, vx1, vy1);
  if (!TILE_PAT) { TILE_PAT = TILE_IMG.map(c => ctx.createPattern(c, 'repeat')); ROAD_PAT = ctx.createPattern(ROAD_IMG, 'repeat'); }
  // 地面
  ctx.fillStyle = TILE_PAT[2]; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
  { const nx = clamp(0, vx0, vx1), ny = clamp(0, vy0, vy1), dmin = Math.hypot(nx, ny);
    for (const li of [1, 0]) { const R = LAYERS[li + 1].r0; if (dmin > R) continue; ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.clip(); ctx.fillStyle = TILE_PAT[li]; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0); ctx.restore(); } }
  const rx0 = Math.max(-ROAD_L, vx0), rx1 = Math.min(ROAD_L, vx1);
  if (rx1 > rx0 && ROAD_W > vy0 && -ROAD_W < vy1) { ctx.save(); ctx.translate(0, -ROAD_W); ctx.fillStyle = ROAD_PAT; ctx.fillRect(rx0, 0, rx1 - rx0, 2 * ROAD_W); ctx.restore(); ctx.fillStyle = '#50535c'; ctx.fillRect(rx0, -ROAD_W - 4, rx1 - rx0, 4); ctx.fillRect(rx0, ROAD_W, rx1 - rx0, 4); }
  for (const d of VIS.dec) { if (d.x < vx0 - 40 || d.x > vx1 + 40 || d.y < vy0 - 20 || d.y > vy1 + 20) continue; ctx.drawImage(d.img, d.x - d.img.width / 2, d.y - d.img.height / 2); }
  for (const q of VIS.pud) { if (!inV(q.x, q.y)) continue; ctx.fillStyle = 'rgba(12,16,28,.4)'; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.rx, q.ry, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(110,130,175,.14)'; ctx.beginPath(); ctx.ellipse(q.x - q.rx * 0.15, q.y - q.ry * 0.25, q.rx * 0.6, q.ry * 0.35, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = 'rgba(160,175,210,.2)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.rx, q.ry, 0, 3.4, 6.0); ctx.stroke(); }
  // 投影：玩家的提灯、修好的路灯、灯塔把东西的影子投在地上
  const SHS = []; { const fl = 1 + 0.025 * Math.sin(S.t * 9) + 0.015 * Math.sin(S.t * 23);
    SHS.push({ x: p._lx || p.x, y: (p._ly || p.y) + 10, R: S.lr * 1.3 * fl, a: 0.62, self: p });
    for (const l of S.lamps) if (l.rep && Math.abs(l.x - p.x) < VW) SHS.push({ x: l.x + 3, y: l.y + 2, R: 6 * M, a: 0.55, self: l });
    { const B = S.beacon; if (Math.abs(B.x - p.x) < VW) SHS.push({ x: B.x, y: B.y + 12, R: B.r * 1.25, a: 0.55, self: B }); }
    if (isW()) for (const T of S.tempLights) SHS.push({ x: T.x, y: T.y, R: T.r, a: 0.5, self: T }); }
  const castShadow = (x, y, w, h, self) => { for (const sc of SHS) { if (sc.self === self) continue; const dx = x - sc.x, dy = y - sc.y, d = Math.hypot(dx, dy); if (d > sc.R || d < 3) continue;
    const f = 1 - d / sc.R, len = h * (0.6 + 1.9 * d / sc.R) + 8; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx)); ctx.globalAlpha = sc.a * Math.min(1, f * 1.8); ctx.drawImage(SHD, -w * 0.12, -w * 0.5, len + w * 0.12, w); ctx.restore(); } };
  ctx.imageSmoothingEnabled = true;
  for (const pr of VIS.scen) if (inV(pr.x, pr.y)) castShadow(pr.x, pr.y - 2, pr.img.width * 0.75, pr.img.height, pr);
  for (const o of S.breaks) if (inV(o.x, o.y)) castShadow(o.x, o.y, 16, 18, o);
  for (const c of S.chests) if (inV(c.x, c.y)) castShadow(c.x, c.y, 18, 30, c);
  for (const l of S.lamps) if (inV(l.x, l.y)) castShadow(l.x + 3, l.y + 4, 8, 46, l);
  for (const e of enemies) if (!e.dead && inV(e.x, e.y) && e.type !== 'moth') castShadow(e.x, e.y + e.r * 0.6, e.r * 1.6 * (e.elite ? 1.5 : 1), e.r * 2.6 * (e.elite ? 1.5 : 1), e);
  castShadow(p.x, p.y + 12, 18, 30, p);
  ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false;
  RIM = { x: p._lx || p.x, y: p._ly || p.y, R: S.lr * 1.25 };
  ctx.strokeStyle = 'rgba(169,156,201,.3)'; ctx.setLineDash([10, 14]); ctx.lineWidth = 2;
  for (const L of LAYERS.slice(1)) { ctx.beginPath(); ctx.arc(0, 0, L.r0, 0, 6.283); ctx.stroke(); }
  ctx.setLineDash([]);
  // 摆件
  for (const pr of VIS.scen) {
    const w = pr.img.width, h = pr.img.height; if (pr.x + w < vx0 || pr.x - w > vx1 || pr.y < vy0 || pr.y - h > vy1) continue;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(pr.x, pr.y - 2, w * 0.45, Math.max(4, h * 0.12), 0, 0, 6.283); ctx.fill();
    rimDraw(pr.img, pr.x - w / 2, pr.y - h, w, h, pr.x, pr.y - h * 0.5);
    ctx.drawImage(pr.img, pr.x - w / 2, pr.y - h);
  }
  // 可打碎的杂物与储物柜
  for (const o of S.breaks) {
    if (!inV(o.x, o.y)) continue; const im = o.kind === 'cocoon' ? ART.cocoon : PSPR[o.kind];
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(o.x, o.y, im.width * 0.4, 4, 0, 0, 6.283); ctx.fill();
    ctx.drawImage(im, o.x - im.width / 2, o.y - im.height + 2);
    if (((S.t * 0.7 + o.x * 0.013) % 3) < 0.15) { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(o.x - im.width / 2 + 3, o.y - im.height + 4, 2, 2); }
  }
  for (const c of S.chests) { if (!inV(c.x, c.y)) continue; const im = c.open ? ART.lockerOpen : (c.gold ? tintC(ART.locker, '#e8c160') : ART.locker); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 13, 4, 0, 0, 6.283); ctx.fill(); ctx.drawImage(im, c.x - im.width / 2, c.y - im.height + 2); }
  // 灯塔、路灯、祭坛
  const b = S.beacon, LH = ART.lighthouse;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 18, 30, 9, 0, 0, 6.283); ctx.fill();
  ctx.drawImage(LH, b.x - LH.width / 2, b.y + 20 - LH.height);
  for (const l of S.lamps) { const im = l.rep ? ART.lampOn : ART.lampOff; ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(l.x, l.y + 4, 10, 4, 0, 0, 6.283); ctx.fill(); ctx.drawImage(im, l.x - im.width / 2 + 4, l.y + 6 - im.height); }
  if (!S.altar.used) { const A = ART.altar; ctx.drawImage(A, S.altar.x - A.width / 2, S.altar.y + 12 - A.height); }
  for (const E of S.eyes) { if (!inV(E.x, E.y)) continue; const t = S.t; ctx.fillStyle = E.used ? 'rgba(30,28,40,.7)' : 'rgba(60,40,100,.55)'; ctx.beginPath(); ctx.ellipse(E.x, E.y, 42, 20, 0, 0, 6.283); ctx.fill(); if (!E.used) { ctx.strokeStyle = `rgba(201,182,255,${0.5 + 0.3 * Math.sin(t * 2)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(E.x, E.y, 30 + 4 * Math.sin(t * 2), 14 + 2 * Math.sin(t * 2), 0, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#e6dbff'; ctx.beginPath(); ctx.ellipse(E.x, E.y, 8, 11, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#1a1226'; ctx.beginPath(); ctx.ellipse(E.x, E.y, 3, 7, 0, 0, 6.283); ctx.fill(); } }
  for (const o of S.pois) { if (!inV(o.x, o.y)) continue; const im = o.kind === 'scav' ? ART.tent : o.kind === 'challenge' ? ART.obelisk : ART.stele; const col = o.used ? '#5a5a62' : o.kind === 'shrine' ? SHRINES[o.type].col : o.kind === 'greed' ? '#e8c160' : o.kind === 'stone' ? STONES[o.type].col : null;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(o.x, o.y + 4, im.width * 0.5, 5, 0, 0, 6.283); ctx.fill();
    ctx.drawImage(col && o.kind !== 'scav' ? tintC(im, col) : im, o.x - im.width / 2, o.y + 6 - im.height);
    if (!o.used && o.kind !== 'scav') { ctx.fillStyle = o.kind === 'shrine' ? SHRINES[o.type].col : o.kind === 'greed' ? '#e8c160' : o.kind === 'stone' ? STONES[o.type].col : '#c9b6ff'; ctx.globalAlpha = 0.7 + 0.3 * Math.sin(S.t * 3 + o.x); ctx.fillRect(o.x - 2, o.y - im.height + 14, 4, 4); ctx.globalAlpha = 1; } }
  if (isW()) {
    const O = S.oath, A = ART.altar;
    if (inV(O.x, O.y)) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(O.x, O.y + 10, 26, 8, 0, 0, 6.283); ctx.fill(); ctx.drawImage(tintC(A, S.spec ? '#5a5040' : '#b8955a'), O.x - A.width / 2 * 1.2, O.y + 12 - A.height * 1.3, A.width * 1.2, A.height * 1.3); }
    for (const T of S.tempLights) { const im = ART.lampOn; ctx.drawImage(im, T.x - im.width / 2 + 4, T.y + 6 - im.height); }
  }
  // 带电地面
  for (const z of zones) { if (!inV(z.x, z.y)) continue; ctx.fillStyle = z.elem === 'fire' ? `rgba(255,120,50,${0.22 + 0.06 * Math.sin(S.t * 14 + z.x)})` : z.elem === 'frost' ? `rgba(190,235,255,${0.16 + 0.04 * Math.sin(S.t * 8 + z.x)})` : z.elem === 'time' ? `rgba(140,230,170,${0.12 + 0.04 * Math.sin(S.t * 6 + z.x)})` : z.kind === 'tide' ? `rgba(90,60,140,${0.35 + 0.05 * Math.sin(S.t * 10 + z.x)})` : z.kind === 'crack' ? `rgba(120,70,40,${0.35 + 0.05 * Math.sin(S.t * 10 + z.x)})` : `rgba(140,200,255,${0.08 + 0.05 * Math.sin(S.t * 30 + z.x)})`; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 6.283); ctx.fill(); }
  // 掉落物（经验暖烬在黑暗之上画）
  for (const it of items) {
    if (it.kind === 'xp' || !inV(it.x, it.y)) continue;
    const im = ART[it.kind]; if (!im) continue;
    const bob = it.kind === 'heal' || it.kind === 'vac' || it.kind === 'calm' || it.kind === 'chip' || it.kind === 'gear' ? Math.sin(S.t * 4 + it.x) * 2 : 0;
    ctx.drawImage(im, it.x - im.width / 2, it.y - im.height / 2 + bob);
  }
  for (const t of S.tapeItems) if (inV(t.x, t.y)) ctx.drawImage(ART.tape, t.x - ART.tape.width / 2, t.y - ART.tape.height / 2 + Math.sin(S.t * 3) * 2);
  // 角色，按 y 排序
  const vis = enemies.filter(e => inV(e.x, e.y)); vis.push(p); vis.sort((a, c) => a.y - c.y);
  for (const e of vis) {
    if (e === p) {
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 12, 11, 4, 0, 0, 6.283); ctx.fill();
      const right = p.fx > 0.1 || (p.fx > -0.1 && p.faceR); if (Math.abs(p.fx) > 0.1) p.faceR = p.fx > 0;
      const walk = p.moving && ((S.t * 8) | 0) % 2;
      let im = p.hurtFlash > 0 ? (right ? ART.pWf : ART.pW) : walk ? (right ? ART.pBf : ART.pB) : (right ? ART.pAf : ART.pA);
      const bob = p.moving ? Math.abs(Math.sin(S.t * 12)) * -2 : 0;
      if (p.iframes > 0 && ((S.t * 20) | 0) % 2) ctx.globalAlpha = 0.55;
      const lh = isW() && S.leapS.phase ? Math.sin(Math.min(1, S.leapS.u) * Math.PI) * 46 : 0;
      ctx.drawImage(im, p.x - im.width / 2, p.y + 14 - im.height + bob - lh); ctx.globalAlpha = 1;
      if (isW()) drawWeapon(p, right, bob - lh);
      const hx = p.x + (right ? 11 : -11); ctx.fillStyle = '#15171d'; ctx.fillRect(hx - 3, p.y - 6 + bob, 7, 9); ctx.fillStyle = '#ffd98a'; ctx.fillRect(hx - 2, p.y - 5 + bob, 5, 6); p._lx = hx; p._ly = p.y - 2 + bob;
      if (p.shield > 0) { ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, 6.283); ctx.stroke(); }
    } else drawEnemy(e);
  }
  for (const e of vis) if (e !== p) {
    if (e.burn) { for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#ffb347' : '#ff6a2a'; const fx = e.x + (i - 1) * 4, fh = 3 + ((S.t * 20 + i * 3 + e.ph) % 4); ctx.fillRect(fx - 1, e._t - fh, 3, fh); } }
    if (e.shock) { ctx.strokeStyle = '#cfeaff'; ctx.lineWidth = 1.5; ctx.beginPath(); const sx = e.x + Math.sin(S.t * 40 + e.ph) * e.r * 0.6; ctx.moveTo(sx - 4, e._t + 4); ctx.lineTo(sx, e._t + 9); ctx.lineTo(sx - 2, e._t + 11); ctx.lineTo(sx + 3, e._t + 16); ctx.stroke(); }
    if (e.chill && e.chill.st != null) { ctx.fillStyle = 'rgba(190,235,255,.85)'; for (let i = 0; i < e.chill.st; i++) { const a = e.ph + i * 1.3 + S.t * 0.8, rx = e.x + Math.cos(a) * (e.r + 3), ry = e.y - e.r * 0.6 + Math.sin(a) * 3; ctx.fillRect(rx - 1, ry - 3, 2, 6); ctx.fillRect(rx - 3, ry - 1, 6, 2); } }
    if (e.frozenT > 0) { ctx.fillStyle = 'rgba(200,236,255,.32)'; ctx.fillRect(e._l - 2, e._t - 3, e.x - e._l + 2 + (e.x - e._l), e.y - e._t + 6); ctx.strokeStyle = 'rgba(230,246,255,.8)'; ctx.lineWidth = 1; ctx.strokeRect(e._l - 2, e._t - 3, (e.x - e._l) * 2 + 2, e.y - e._t + 6); }
    if (e.curse) { ctx.fillStyle = '#c9b6ff'; const cy = e._t - 8 + Math.sin(S.t * 6 + e.ph) * 1.5; ctx.fillRect(e.x - 3, cy - 3, 6, 5); ctx.fillStyle = '#2a2436'; ctx.fillRect(e.x - 2, cy - 2, 1.5, 1.5); ctx.fillRect(e.x + 0.5, cy - 2, 1.5, 1.5); ctx.fillStyle = '#c9b6ff'; for (let i = 0; i < e.curse.st; i++) ctx.fillRect(e.x - 4 + i * 2.2, cy + 3, 1.5, 1.5); }
    if (e.fearT > 0) { ctx.fillStyle = '#ffd28a'; ctx.font = 'bold 9px monospace'; ctx.fillText('!', e.x - 2, e._t - 6); }
    if (e.expo) { ctx.strokeStyle = '#fff1b0'; ctx.lineWidth = 1.5; const L0 = e._l - 2, T0 = e._t - 2, W0 = e.x - e._l + 2; ctx.beginPath(); ctx.moveTo(L0, T0 + 5); ctx.lineTo(L0, T0); ctx.lineTo(L0 + 5, T0); ctx.moveTo(e.x + W0 - 5, T0); ctx.lineTo(e.x + W0, T0); ctx.lineTo(e.x + W0, T0 + 5); ctx.stroke(); }
  }
  for (const pn of pins) ctx.drawImage(ART.rod, pn.x - 4, pn.y - 22);
  if (!isW() && S.bl) drawPets();
  if (isW()) for (const m of S.minions) { if (!inV(m.x, m.y)) continue; const im = tintC(ART.shadeA, '#5b4a82'); ctx.globalAlpha = Math.min(1, m.t) * (0.75 + 0.15 * Math.sin(S.t * 6 + m.ph)); ctx.drawImage(im, m.x - im.width / 2, m.y - im.height + 6 + Math.sin(S.t * 4 + m.ph) * 2); ctx.globalAlpha = 1; }

  // ---- 光照贴图：月光底色 × 彩色光源；再盖一层被光吃掉的雾 ----
  const fl = 1 + 0.025 * Math.sin(S.t * 9) + 0.015 * Math.sin(S.t * 23);
  const lights = [];
  lights.push([p._lx || p.x, p._ly || p.y, S.lr * 1.35 * fl, 1, 'lantern']);
  lights.push([p.x, p.y, S.lr * 0.55, 0.35, 'lantern']);
  lights.push([b.x, b.y - 20, b.r * 1.3, 1, 'beacon']);
  for (const l of S.lamps) { if (l.rep) { const k = 0.8 + 0.2 * l.store / lampStore(); lights.push([l.x + 3, l.y - 10, 6.2 * M * fl, k, 'lamp']); lights.push([l.x + 3, l.y - 34, 1.6 * M, 0.9, 'white']); } else if (Math.random() < 0.6) lights.push([l.x + 3, l.y - 34, 1.1 * M * (0.6 + 0.4 * Math.random()), 0.6, 'lamp']); }
  if (!S.altar.used) lights.push([S.altar.x, S.altar.y - 10, 2.6 * M, 0.8, 'violet']);
  if (isW()) { if (!S.spec) lights.push([S.oath.x, S.oath.y - 20, 3 * M, 0.85, 'lamp']); for (const T of S.tempLights) lights.push([T.x, T.y - 10, T.r * 1.2, 1, 'lamp']); for (const m of S.minions) lights.push([m.x, m.y, 1 * M, 0.5, 'violet']);
    if (S.spec === 'paladin') lights.push([p.x, p.y, S.lr * 0.9, 0.35, 'white']); if (S.berserkT > 0) lights.push([p.x, p.y, 2.4 * M, 0.55, 'red']); if (S.devourT > 0) lights.push([p.x, p.y, 2.6 * M, 0.6, 'violet']);
    for (const sl of S.slashes) { const al = sl.t / sl.life; lights.push([sl.x + Math.cos(sl.ang) * sl.R * 0.6, sl.y + Math.sin(sl.ang) * sl.R * 0.6, (sl.fin ? 3 : 2.2) * M, 0.45 * al, S.axe.edge === 'fire' ? 'ember' : S.axe.edge === 'thunder' || S.axe.edge === 'frost' ? 'cyan' : S.axe.edge === 'ash' ? 'violet' : S.axe.edge === 'vamp' ? 'red' : 'white']); } }
  for (const it of items) if (it.kind === 'gear') lights.push([it.x, it.y, 1.6 * M, 0.8, ['white', 'green', 'cyan', 'lamp'][it.gear.rar]]);
  for (const it of items) if (it.kind === 'heal' || it.kind === 'vac') lights.push([it.x, it.y, 1.3 * M, 0.7, 'red']); else if (it.kind === 'calm') lights.push([it.x, it.y, 1.3 * M, 0.7, 'violet']); else if (it.kind === 'part') lights.push([it.x, it.y, 0.9 * M, 0.5, 'cyan']); else if (it.kind === 'chip') lights.push([it.x, it.y, 2 * M, 0.9, 'cyan']);
  { let n = 0; for (const it of items) if (it.kind === 'xp' && n < 40 && inV(it.x, it.y)) { n++; lights.push([it.x, it.y, (it.v >= 5 ? 1.1 : 0.7) * M, 0.45, 'ember']); } }
  for (const E of S.eyes) if (!E.used) lights.push([E.x, E.y, 3 * M, 0.8, 'violet']);
  for (const o of S.pois) if (!o.used) lights.push([o.x, o.y - 12, 2 * M, 0.7, o.kind === 'shrine' ? (o.type === 'tomb' ? 'green' : o.type === 'penance' ? 'lamp' : 'violet') : o.kind === 'greed' ? 'lamp' : o.kind === 'scav' ? 'lamp' : o.kind === 'stone' ? (o.type === 'power' ? 'ember' : o.type === 'xp' ? 'green' : o.type === 'haste' ? 'lamp' : o.type === 'calm' ? 'cyan' : 'violet') : 'violet']);
  for (const c of S.chests) if (!c.open) lights.push([c.x, c.y - 12, c.gold ? 2.4 * M : 1.5 * M, c.gold ? 0.9 : 0.6, 'lamp']);
  for (const e of enemies) { if (e.reaper && inV(e.x, e.y)) lights.push([e.x, e.y - 10, 1.6 * M, 0.6, 'red']); if (e.type === 'boss') lights.push([e.x, e.y, 4 * M, 0.9, e.bshell > 0 ? 'white' : 'violet']); if (e.type === 'nest') lights.push([e.x, e.y, 3 * M, 0.75, 'violet']); else if (e.burn && inV(e.x, e.y)) lights.push([e.x, e.y - 6, 1.4 * M, 0.55, 'ember']); else if (e.elite && inV(e.x, e.y)) lights.push([e.x, e.y - 6, 1.6 * M, 0.35, 'violet']); }
  for (const t of S.tapeItems) lights.push([t.x, t.y, (1.8 + 0.3 * Math.sin(S.t * 5)) * M, 0.9, 'cyan']);
  for (const z of zones) lights.push([z.x, z.y, z.r * 1.2, 0.6, z.elem === 'fire' ? 'ember' : z.elem === 'time' ? 'green' : z.kind === 'tide' ? 'violet' : z.kind === 'crack' ? 'ember' : 'cyan']);
  if (!isW()) petLights(lights);
  for (const pn of pins) lights.push([pn.x, pn.y - 10, 2 * M, 0.7, 'cyan']);
  for (const s of S.skills) if (s.pos) for (const q of s.pos) lights.push([q[0], q[1], 1.4 * M, 0.7, 'cyan']);
  for (const a of arcs) lights.push([(a.x1 + a.x2) / 2, (a.y1 + a.y2) / 2, 2 * M, 0.6 * a.t / a.life, 'cyan']);
  for (const r of rings) { const t = 1 - r.t / r.life; lights.push([r.x, r.y, r.r * (0.4 + 0.8 * t), 0.4 * (1 - t), r.color === '#bfe6ff' || r.color === '#cfe8ff' ? 'cyan' : r.color === '#b79cff' || r.color === '#c9b9ff' ? 'violet' : 'lamp']); }
  for (const f of S.flashes || []) lights.push([f.x, f.y, f.r, Math.min(1, f.t * 4), 'white']);
  for (const bo of S.bolts || []) lights.push([bo.x, bo.y, 4 * M, bo.t * 3, 'cyan']);
  for (const id of S.auras || []) lights.push([p.x, p.y, auraR(id) * 1.1, 0.22, AURA[id].lt]);
  for (const e of enemies) if (e.ign && inV(e.x, e.y)) lights.push([e.x, e.y - 6, 1.2 * M, 0.45, 'ember']);
  for (const pr of VIS.scen) if (pr.kind === 'crystal' && inV(pr.x, pr.y)) lights.push([pr.x, pr.y - 10, 1.8 * M, 0.6, 'cyan']);
  { let n = 0; for (const d of VIS.dec) if (d.k === 'fungus' && n < 30 && inV(d.x, d.y)) { n++; lights.push([d.x, d.y, 1.1 * M, 0.38 + 0.1 * Math.sin(S.t * 1.5 + d.x), 'cyan']); } }
  const hs = 0.5 * ZOOM, lx = Math.hypot(p.x, p.y) / M, c = Math.min(1, S.conc / 100);
  const AMB = [[92, 104, 150], [78, 84, 132], [68, 58, 114]]; const li = layerAt(p.x, p.y), fr = li < 2 ? Math.max(0, (lx - LAYERS[li + 1].r0 / M + 6) / 6) : 0;
  let amb = AMB[li].map((v, i) => v + ((AMB[Math.min(2, li + 1)][i]) - v) * Math.min(1, fr)); amb = amb.map(v => v * (1 - 0.32 * c)); if (S.conc >= 100) amb = [amb[0] * 1.25 + 14, amb[1] * 0.75, amb[2] * 1.05];
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-over'; lctx.globalAlpha = 1; lctx.fillStyle = `rgb(${amb.map(v => v | 0).join(',')})`; lctx.fillRect(0, 0, lm.width, lm.height);
  lctx.globalCompositeOperation = 'lighter'; 
  for (const [x, y, r, a, k] of lights) {
    if (x + r < vx0 || x - r > vx1 || y + r < vy0 || y - r > vy1 || a <= 0.01) continue;
    const sx = (x - camX) * hs, sy = (y - camY) * hs, sr = r * hs, L = lightSpr(k); lctx.globalAlpha = Math.min(1, a); lctx.drawImage(L, sx - sr, sy - sr, sr * 2, sr * 2);
  }
  lctx.globalAlpha = 1;
  if (!TONE_PAT) TONE_PAT = lctx.createPattern(TONE, 'repeat');
  TONE_PAT.setTransform(new DOMMatrix().translate(-camX * hs, -camY * hs).scale(30 * hs)); lctx.imageSmoothingEnabled = true; lctx.globalCompositeOperation = 'multiply'; lctx.fillStyle = TONE_PAT; lctx.fillRect(0, 0, lm.width, lm.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(lm, 0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // 雾：光源附近被照透
  dctx.globalCompositeOperation = 'source-over'; dctx.setTransform(1, 0, 0, 1, 0, 0); dctx.imageSmoothingEnabled = true; dctx.clearRect(0, 0, dark.width, dark.height);
  for (const [spd, scl, al] of [[14, 22, 0.7], [26, 14, 0.45]]) {
    const T = FOG.width * scl * hs, ox = ((-(camX * 0.95 + S.t * spd) * hs) % T + T) % T - T, oy = ((-(camY * 0.95 + S.t * spd * 0.3) * hs) % T + T) % T - T;
    dctx.globalAlpha = al * (0.45 + 0.6 * c);
    for (let x = ox; x < dark.width; x += T) for (let y = oy; y < dark.height; y += T) dctx.drawImage(FOG, x, y, T, T);
  }
  dctx.globalAlpha = 1; dctx.globalCompositeOperation = 'destination-out';
  for (const [x, y, r, a] of lights) { if (r < 1.5 * M || x + r < vx0 || x - r > vx1 || y + r < vy0 || y - r > vy1) continue; const sx = (x - camX) * hs, sy = (y - camY) * hs, sr = r * hs; dctx.globalAlpha = Math.min(1, a) * 0.6; dctx.drawImage(CUT, sx - sr, sy - sr, sr * 2, sr * 2); }
  dctx.globalAlpha = 1;
  ctx.drawImage(dark, 0, 0, cv.width, cv.height);

  // ---- 发光（叠加） ----
  ctx.setTransform(k, 0, 0, k, (-camX + sh[0]) * k, (-camY + sh[1]) * k);
  ctx.globalCompositeOperation = 'lighter';
  const glow = (G, x, y, r, a) => { if (x + r < vx0 || x - r > vx1 || y + r < vy0 || y - r > vy1) return; ctx.globalAlpha = a; ctx.drawImage(G, x - r, y - r, r * 2, r * 2); };
  const low = S.conc >= 100;
  glow(GLOW.amber, p.x, p.y, S.lr * 1.1, low ? 0.05 : 0.08);
  glow(GLOW.amber, p._lx || p.x, p._ly || p.y, 20 * fl, 0.95); glow(GLOW.white, p._lx || p.x, p._ly || p.y, 6, 0.9);
  for (const [x, y, r, a, k] of lights) if (r >= 1.5 * M && a > 0.05) glow(lightSpr(k), x, y, r * 0.8, Math.min(1, a) * 0.26);
  glow(GLOW.amber, b.x, b.y - 20, b.r, 0.08);
  const cone = (hx, hy, gy, W1, al) => { if (!inV(hx, gy)) return; const lg = ctx.createLinearGradient(0, hy, 0, gy + 8); lg.addColorStop(0, `rgba(255,196,120,${0.26 * al})`); lg.addColorStop(0.7, `rgba(255,170,90,${0.08 * al})`); lg.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(hx - 6, hy); ctx.lineTo(hx + 6, hy); ctx.lineTo(hx + W1, gy); ctx.lineTo(hx - W1, gy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe2b0'; for (let i = 0; i < 12; i++) { const u = (S.t * 0.07 + i * 0.0833 + hx * 0.001) % 1, y = hy + (gy - hy) * u, x = hx + Math.sin(S.t * 0.6 + i * 2.4) * W1 * u * 0.85; ctx.globalAlpha = Math.sin(Math.PI * u) * 0.75 * al; ctx.fillRect(x, y, 1.6, 1.6); } ctx.globalAlpha = 1; };
  for (const l of S.lamps) if (l.rep) cone(l.x + 3, l.y - 32, l.y + 8, 2.4 * M, fl * (0.75 + 0.25 * l.store / lampStore()));
  if (isW()) for (const T of S.tempLights) cone(T.x + 3, T.y - 32, T.y + 8, 2.4 * M, Math.min(1, T.t));
  // 积水倒影：附近最亮的光源映在水面上
  for (const q of VIS.pud) { if (!inV(q.x, q.y)) continue; let best = null, bi = 0;
    for (const [x, y, r, a, k] of lights) { if (r < 1.5 * M) continue; const d = Math.hypot(x - q.x, y - q.y); if (d > r) continue; const I = a * (1 - d / r) ** 1.5; if (I > bi) { bi = I; best = [x, y, k]; } }
    if (!best || bi < 0.03) continue; ctx.save(); ctx.beginPath(); ctx.ellipse(q.x, q.y, q.rx, q.ry, 0, 0, 6.283); ctx.clip();
    const rx = q.x + Math.max(-q.rx * 0.6, Math.min(q.rx * 0.6, (best[0] - q.x) * 0.25)), sh = Math.sin(S.t * 2 + q.ph);
    ctx.globalAlpha = Math.min(0.85, bi * 1.2); ctx.drawImage(lightSpr(best[2]), rx - q.rx * 0.9, q.y - q.ry * 2.2, q.rx * 1.8, q.ry * 4.4);
    ctx.fillStyle = `rgba(${LCOL[best[2]]},${Math.min(0.9, bi * 1.5)})`; for (let i = -2; i <= 2; i++) ctx.fillRect(rx - 6 + sh * 2 + i * 1.5, q.y - 2 + i * 1.6, 12 - Math.abs(i) * 3, 1);
    ctx.restore(); }
  ctx.globalAlpha = 1;
  // 灯塔旋转光束
  if (inV(b.x, b.y) || Math.abs(b.x - p.x) < VW) {
    const ly = b.y + 20 - LH.height + 9, ang = S.t * 0.6;
    for (const off of [0, Math.PI]) { const a0 = ang + off; const g = ctx.createRadialGradient(b.x, ly, 0, b.x, ly, 14 * M); g.addColorStop(0, 'rgba(255,215,140,0.32)'); g.addColorStop(1, 'rgba(255,215,140,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x, ly); ctx.arc(b.x, ly, 14 * M, a0 - 0.13, a0 + 0.13); ctx.closePath(); ctx.fill(); }
    glow(GLOW.amber, b.x, ly, 30, 0.9);
  }
  for (const l of S.lamps) if (l.rep) { glow(GLOW.amber, l.x + 3, l.y - 34, 26 * fl, 0.9); glow(GLOW.white, l.x + 3, l.y - 34, 7, 0.9); }
  if (!S.altar.used) glow(GLOW.violet, S.altar.x, S.altar.y - 20, 2.4 * M, 0.35 + 0.1 * Math.sin(S.t * 2));
  if (isW()) {
    if (!S.spec) glow(GLOW.amber, S.oath.x, S.oath.y - 26, 2.8 * M, 0.35 + 0.15 * Math.sin(S.t * 2));
    for (const T of S.tempLights) { glow(GLOW.amber, T.x, T.y - 20, T.r, 0.25); glow(GLOW.amber, T.x, T.y - 38, 22, 0.8); }
    if (S.spec === 'paladin') glow(GLOW.amber, p.x, p.y, S.lr, 0.12 + 0.04 * Math.sin(S.t * 3));
    if (S.devourT > 0) glow(GLOW.violet, p.x, p.y - 6, 44, 0.45 + 0.15 * Math.sin(S.t * 8));
  }
  for (const t of S.tapeItems) glow(GLOW.cyan, t.x, t.y, 1.8 * M, 0.45 + 0.15 * Math.sin(S.t * 5));
  for (const pr of VIS.scen) if (pr.kind === 'crystal' && inV(pr.x, pr.y)) glow(GLOW.cyan, pr.x, pr.y - 12, 26, 0.35);
  for (const z of zones) glow(z.elem === 'fire' ? GLOW.ember : z.elem === 'time' ? GLOW.green : z.kind === 'tide' ? GLOW.violet : z.kind === 'crack' ? GLOW.ember : GLOW.blue, z.x, z.y, z.r, z.kind ? 0.4 : 0.25);
  for (const o of S.pois) if (!o.used) glow(o.kind === 'challenge' || (o.kind === 'shrine' && (o.type === 'rift' || o.type === 'statue')) ? GLOW.violet : GLOW.amber, o.x, o.y - 16, 22, 0.5 + 0.2 * Math.sin(S.t * 2.5 + o.y));
  for (const c of S.chests) if (!c.open) glow(GLOW.amber, c.x, c.y - 14, c.gold ? 26 : 14, (c.gold ? 0.9 : 0.55) + 0.2 * Math.sin(S.t * 3 + c.x));
  for (const e of vis) if (e.type === 'nest') glow(GLOW.violet, e.x, e.y - 6, 2.4 * M, 0.35 + 0.15 * Math.sin(S.t * 3 + e.ph));
  for (const it of items) {
    if (!inV(it.x, it.y)) continue;
    if (it.kind === 'xp') { const big = it.v >= 5; glow(GLOW.ember, it.x, it.y, big ? 12 : 8, 0.9); ctx.globalAlpha = 1; ctx.fillStyle = big ? '#ffe2a8' : '#ffb15a'; const s = big ? 3 : 2; ctx.fillRect(it.x - s / 2, it.y - s / 2, s, s); }
    else if (it.kind === 'vac') glow(GLOW.red, it.x, it.y, 16, 0.5);
    else if (it.kind === 'calm') glow(GLOW.violet, it.x, it.y, 18, 0.6);
    else if (it.kind === 'heal') glow(GLOW.red, it.x, it.y, 18, 0.6);
    else if (it.kind === 'part') glow(GLOW.cyan, it.x, it.y, 12, 0.5);
    else if (it.kind === 'chip') { glow(GLOW.cyan, it.x, it.y, 26, 0.6 + 0.25 * Math.sin(S.t * 5)); glow(GLOW.white, it.x, it.y, 8, 0.8); }
    else if (it.kind === 'gear') { glow([GLOW.white, GLOW.green, GLOW.blue, GLOW.amber][it.gear.rar], it.x, it.y, 22 + 8 * it.gear.rar, 0.6 + 0.25 * Math.sin(S.t * 5)); }
  }
  for (const s of S.skills) if (s.pos) for (const q of s.pos) { glow(GLOW.blue, q[0], q[1], 22, 0.8); glow(GLOW.white, q[0], q[1], 6, 1); }
  for (const pn of pins) glow(GLOW.blue, pn.x, pn.y - 20, 18, 0.8);
  for (const k in S.orb || {}) for (const q of S.orb[k].pos) { glow(k === 'l_arbiter' ? GLOW.lamp || GLOW.white : GLOW.blue, q[0], q[1], 22, 0.8); }
  for (const q of S.pets || []) glow(q.kind === 'elem' ? GLOW.ember : q.kind === 'raven' ? GLOW.violet : GLOW.blue, q.x, q.y - 8, 18, 0.6);
  drawAuras(glow);
  // 眼睛
  for (const e of vis) {
    if (e === p) continue; const E = ART.eyes[e.type]; if (!E) continue;
    for (const [ex, ey, col] of E) { const x = e._l + ex * PX * e._sc, y = e._t + ey * PX * e._sc * e._fy; glow(GLOW.white, x, y, 5 * e._sc, 0.55); ctx.globalAlpha = 1; ctx.fillStyle = e.elite ? AFFIX[e.aff[0]].color : col; ctx.fillRect(x - 1, y - 1, 2 * e._sc, 2 * e._sc); }
  }
  ctx.globalAlpha = 1;
  // 电弧
  for (const a of arcs) {
    const al = a.t / a.life; const dx = a.x2 - a.x1, dy = a.y2 - a.y1, n = Math.max(2, Math.min(8, (Math.hypot(dx, dy) / 18) | 0));
    ctx.beginPath(); ctx.moveTo(a.x1, a.y1); for (let i = 1; i < n; i++) { const t = i / n; ctx.lineTo(a.x1 + dx * t + rand(-7, 7), a.y1 + dy * t + rand(-7, 7)); } ctx.lineTo(a.x2, a.y2);
    ctx.strokeStyle = `rgba(110,170,255,${0.35 * al})`; ctx.lineWidth = a.w * 4; ctx.stroke(); ctx.strokeStyle = a.color; ctx.globalAlpha = al; ctx.lineWidth = a.w; ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (isW()) {
    for (const sl of S.slashes) drawSlash(sl);
    for (const bo of S.bolts || []) { const al = bo.t / 0.3; let sd = bo.seed; const rr = () => ((sd = (sd * 16807 + 7) % 2147483647) / 2147483647 - 0.5); const pts = [[bo.x + rr() * 30, bo.y - 260]]; for (let i = 1; i <= 8; i++) pts.push([bo.x + rr() * 26 * (1 - i / 8), bo.y - 260 + 260 * i / 8]);
      for (const [w, c, a] of [[9, 'rgba(120,180,255,', 0.35], [3, 'rgba(235,245,255,', 1]]) { ctx.strokeStyle = c + a * al + ')'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...pts[0]); for (const q of pts) ctx.lineTo(...q); ctx.stroke(); }
      glow(GLOW.cyan, bo.x, bo.y, 40, al); }
    ctx.globalAlpha = 1; ctx.lineCap = 'butt';
    if (S.berserkT > 0) glow(GLOW.red, p.x, p.y - 6, 40, 0.5 + 0.2 * Math.sin(S.t * 12));
  }
  for (const s of S.skills) if (s.ignited && s.R) { ctx.strokeStyle = `rgba(190,230,255,${0.35 + 0.2 * Math.sin(S.t * 20)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, s.R, 0, 6.283); ctx.stroke(); }
  for (const r of rings) { const t = 1 - r.t / r.life; ctx.strokeStyle = r.color; ctx.globalAlpha = 1 - t; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (0.3 + 0.7 * t), 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1; }
  for (const q of parts) { ctx.fillStyle = q.c; ctx.globalAlpha = q.t / q.life; ctx.fillRect(q.x, q.y, q.s, q.s); }
  for (const q of ash) { const al = Math.min(1, q.t / q.life * 1.8); if (q.glow) glow(GLOW.ember, q.x, q.y, 5, al * 0.4); ctx.globalAlpha = al; ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, q.s, q.s); }
  if (sparks.length) { ctx.lineCap = 'round'; ctx.lineWidth = 2; for (const q of sparks) { ctx.globalAlpha = q.t / q.life; ctx.strokeStyle = q.c; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035); ctx.stroke(); } ctx.lineCap = 'butt'; }
  for (const q of S.amb || []) { const a = Math.min(1, q.t / q.life * 2); if (q.k) { ctx.globalAlpha = a * (0.6 + 0.4 * Math.sin(S.t * 20 + q.x)); ctx.fillStyle = '#ffb35a'; } else { ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#b9bccb'; } ctx.fillRect(q.x, q.y, q.s, q.s); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (isW()) for (const q of S.projs) {
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.kind === 'jav' ? q.ang : q.rot);
    if (q.kind === 'axe') { ctx.fillStyle = '#15171d'; ctx.fillRect(-9, -2, 18, 4); ctx.fillRect(4, -7, 8, 14); ctx.fillStyle = '#6b4a2e'; ctx.fillRect(-8, -1, 14, 2); ctx.fillStyle = '#c9d1de'; ctx.fillRect(5, -6, 6, 12); }
    else if (q.kind === 'blade') { ctx.fillStyle = '#e8ecf4'; ctx.fillRect(-9, -1.5, 18, 3); ctx.fillRect(-1.5, -9, 3, 18); }
    else { ctx.fillStyle = '#5a3d27'; ctx.fillRect(-22, -1.5, 30, 3); ctx.fillStyle = '#e8ecf4'; ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(20, 0); ctx.lineTo(8, 4); ctx.fill(); }
    ctx.restore();
  }
  // 精英血条
  for (const e of vis) if (e !== p && (e.elite || e.type === 'nest') && e.type !== 'boss') { ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(e.x - 18, e._t - 10, 36, 5); ctx.fillStyle = '#ff6b5e'; ctx.fillRect(e.x - 17, e._t - 9, 34 * Math.max(0, e.hp / e.maxHp), 3); }
  // 层边界文字
  ctx.font = '700 20px ' + BODY_FONT;
  for (const L of LAYERS.slice(1)) { const a = Math.atan2(p.y, p.x), bx = Math.cos(a) * L.r0, by = Math.sin(a) * L.r0; if (!inV(bx, by)) continue; const t = L.name + ' · 灰潮每 ' + (L.r0 > 60 * M ? 2.5 : 4) + ' 秒 +1 · 建议 LV ' + L.rec + '+'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(t, bx + 2, by + 2); ctx.fillStyle = 'rgba(200,190,235,.75)'; ctx.fillText(t, bx, by); ctx.textAlign = 'left'; }
  // 光圈边、过载环、交互进度
  ctx.strokeStyle = low ? 'rgba(255,90,79,.4)' : 'rgba(255,190,110,.25)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(p.x, p.y, S.lr, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
  if (p.overload > 0) { ctx.strokeStyle = p.overload > 80 ? 'rgba(255,255,255,.85)' : 'rgba(159,208,255,.45)'; ctx.lineWidth = p.overload > 80 ? 2 : 1.5; ctx.beginPath(); ctx.arc(p.x, p.y + 4, 26, -Math.PI / 2, -Math.PI / 2 + 6.283 * p.overload / 100); ctx.stroke(); }
  if (S.hold > 0) { ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, 28, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.min(1, S.hold / (S.holdNeed || 1))); ctx.stroke(); }
  ctx.font = '700 12px Silkscreen, monospace'; ctx.textAlign = 'center';
  for (const n of nums) { const pop = 1 + 0.7 * Math.max(0, (n.t - 0.48) / 0.12), big = typeof n.v === 'number' && n.v >= 40 ? Math.min(1.7, 1 + Math.log2(n.v / 40) * 0.25) : 1, sz = 12 * pop * big;
    ctx.font = `700 ${sz.toFixed(1)}px Silkscreen, monospace`; ctx.globalAlpha = Math.min(1, n.t * 2.5); ctx.fillStyle = '#000'; ctx.fillText(n.v, n.x + 1, n.y + 1); ctx.fillStyle = n.c; ctx.fillText(n.v, n.x, n.y); } ctx.globalAlpha = 1; ctx.textAlign = 'left';
  // 屏幕边缘箭头：最近的未用神龛 / 潮眼 / 金柜
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  { const tg = []; const near = (arr, col, lab) => { let b = null, bd = Infinity; for (const o of arr) { const d = (o.x - p.x) ** 2 + (o.y - p.y) ** 2; if (d < bd) { bd = d; b = o; } } if (b && bd > (6 * M) ** 2) tg.push([b, col, lab, Math.sqrt(bd)]); };
    { let b = null, bd = Infinity; for (const o of S.pois) { if (o.used || o.kind === 'scav' || o.kind === 'stone') continue; const d = (o.x - p.x) ** 2 + (o.y - p.y) ** 2; if (d < bd) { bd = d; b = o; } } if (b && bd > (6 * M) ** 2) tg.push([b, b.kind === 'challenge' ? '#c9b6ff' : b.kind === 'greed' ? '#e8c160' : '#8fe6a6', b.kind === 'challenge' ? '挑战' : b.kind === 'greed' ? '贪婪碑' : SHRINES[b.type].name, Math.sqrt(bd)]); } near(S.eyes.filter(E => !E.used), '#ff6b5e', '潮眼'); near(S.chests.filter(c => !c.open && c.gold), '#ffe08a', '金柜'); near(S.pois.filter(o => !o.used && o.kind === 'scav'), '#ffffff', '拾荒者'); if (S.loot.scrap >= REPAIR_COST) near(S.lamps.filter(l => !l.rep), '#ffb454', '路灯'); near(S.tapeItems, '#9fe8ff', '录音带');
    for (const [o, col, lab, dist] of tg) { const dx = o.x - p.x, dy = o.y - p.y, a = Math.atan2(dy, dx); const ex = (o.x - camX) * ZOOM, ey = (o.y - camY) * ZOOM; if (ex > 40 && ex < SW - 40 && ey > 40 && ey < SH - 40) continue;
      const cx = SW / 2, cy = SH / 2, rx = SW / 2 - 70, ry = SH / 2 - 60, t = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6)); const x = cx + Math.cos(a) * t, y = cy + Math.sin(a) * t;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-6, -8); ctx.lineTo(-2, 0); ctx.lineTo(-6, 8); ctx.fill(); ctx.restore();
      ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.font = '11px ' + BODY_FONT; ctx.textAlign = 'center'; ctx.fillText(`${lab} ${(dist / M).toFixed(0)}m`, x - Math.cos(a) * 22, y - Math.sin(a) * 22 + 4); ctx.globalAlpha = 1; ctx.textAlign = 'left'; } }
  // 暗角与危险提示
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(vignette(), 0, 0);
  if (p.hurtFlash > 0) { const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.45, cv.width / 2, cv.height / 2, Math.max(cv.width, cv.height) * 0.6); g.addColorStop(0, 'rgba(200,20,20,0)'); g.addColorStop(1, `rgba(200,20,20,${(0.26 * p.hurtFlash / 0.2).toFixed(3)})`); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (S.conc >= 100 || p.hp / D.maxHp < 0.3) { const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.35, cv.width / 2, cv.height / 2, Math.max(cv.width, cv.height) * 0.7); g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, `rgba(140,20,15,${0.3 + 0.1 * Math.sin(S.t * 6)})`); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); }
}

function warriorBuildHTML(ps, bs) {
  const wpn = ['atk', 'fin', 'edge'].map(sl => `<div class="slot skill${S.axe[sl] ? ' ign' : ''}"><span>${axeName(sl)}</span><span class="meta">${AXEMODS[sl].label}</span></div>`).join('');
  const pc = Object.keys(S.pact || {}).map(k => `<div class="slot bless"><span>${PACT[k].name}</span><span class="meta">契约</span></div>`).join('');
  const spec = S.spec ? `<div class="slot bless"><span>${SPECS[S.spec].name}</span><span class="meta">誓约</span></div>` : `<div class="slot empty">${S.player.lvl >= 8 ? '去中心层的誓约碑转职' : '8 级后可在誓约碑转职'}</div>`;
  const trees = Object.keys(TREES).filter(t => treePts(t)).map(t => `<div class="slot skill${nd(TREES[t].nodes[3]) ? ' ign' : ''}"><span>${TREES[t].name}${TREES[t].war ? ' · 战技' : ''}</span><span class="meta"><b>${treePts(t)}</b>/${TREES[t].spec ? 4 : 6}</span></div>`).join('') || '<div class="slot empty">还没有进入任何树</div>';
  const sy = [...S.syn].map(x => `<div class="slot bless"><span>${SYN.find(y => y.id === x).name}</span><span class="meta">协同</span></div>`).join('');
  const au = (S.auras || []).map(id => `<div class="slot skill ign"><span>${AURA[id].name}光环</span><span class="meta">Lv ${stLvl('aura_' + id)}</span></div>`).join('');
  return `${pc ? `<div><h4>契约</h4><div class="slots">${pc}</div></div>` : ''}<div><h4>消防斧</h4><div class="slots">${wpn}</div></div>${au ? `<div><h4>光环</h4><div class="slots">${au}</div></div>` : ''}<div><h4>职业</h4><div class="slots">${spec}</div></div><div><h4>技能树</h4><div class="slots">${trees}</div></div>${sy ? `<div><h4>协同</h4><div class="slots">${sy}</div></div>` : ''}<div><h4>被动</h4><div class="slots">${ps.join('')}</div></div>${bs.length ? `<div><h4>祝福</h4><div class="slots">${bs.join('')}</div></div>` : ''}`;
}
function drawWeapon(p, right, oy) {
  const ang = p.swingT > 0 ? p.swingAng + (0.15 - p.swingT) * 10 - 0.75 : (right ? -0.6 : Math.PI + 0.6);
  ctx.save(); ctx.translate(p.x + (right ? 4 : -4), p.y - 4 + oy); ctx.rotate(ang);
  ctx.fillStyle = '#15171d'; ctx.fillRect(-2, -2.5, 28, 5); ctx.fillStyle = '#7a4a2c'; ctx.fillRect(-1, -1.5, 26, 3);
  ctx.fillStyle = '#15171d'; ctx.beginPath(); ctx.moveTo(18, -3); ctx.lineTo(30, -11); ctx.lineTo(33, 1); ctx.lineTo(18, 3); ctx.fill();
  const edge = S.axe.edge, col = edge === 'fire' ? '#ff9a4a' : edge === 'thunder' ? '#bfe6ff' : edge === 'vamp' ? '#e0574f' : edge === 'blunt' ? '#8f98ab' : edge === 'frost' ? '#9fdcff' : edge === 'ash' ? '#a58bdc' : '#c84a3a';
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(20, -2); ctx.lineTo(29, -9); ctx.lineTo(31, 0); ctx.lineTo(20, 2); ctx.fill();
  ctx.fillStyle = '#e8ecf4'; ctx.fillRect(29, -9, 2, 9);
  ctx.restore();
}
function pauseWarrior() {
  mode = 'pause';
  const vis = Object.keys(TREES).filter(t => !TREES[t].spec || TREES[t].spec === S.spec);
  const trees = vis.map(t => { const T = TREES[t]; const rows = T.nodes.map((id, i) => { const N = NODES[id], r = nd(id), av = nodeAvail(id); const st = r ? `<span class="ok">${N.max > 1 ? r + '/' + N.max : '已拿'}</span>` : av ? '<span class="chip slot-m">可出现</span>' : '<span class="hint">锁定</span>'; return `<li><b>${T.spec ? ['核心', '分支', '分支', '觉醒'][i] : ['入口', '分支', '分支', '终极'][i]} · ${N.name}</b> ${st}<br><span class="hint">${N.text(Math.max(1, r))}</span></li>`; }).join(''); return `<div class="box"><h3>${T.name}${T.war ? ' · 战技' : T.spec ? ' · 职业树' : ''} · ${treePts(t)}/${T.spec ? 4 : 6}</h3><ul>${rows}</ul></div>`; }).join('');
  const edgeLi = S.axe.edge ? `<li><b>普攻效果：${stName('edge_' + S.axe.edge)}</b> Lv ${stLvl('edge_' + S.axe.edge)}<br><span class="hint">${AXEMODS.edge.opts[S.axe.edge].text}</span><br><span class="hint">${stSummary('edge_' + S.axe.edge)}</span></li>` : '<li><b>普攻效果：无</b><br><span class="hint">升级时会出现燃斧、雷斧、霜斧、钝斧、血斧、灰蚀斧</span></li>';
  const mods = ['atk', 'fin'].map(sl => `<li><b>${AXEMODS[sl].label}：${axeName(sl)}</b><br><span class="hint">${S.axe[sl] ? AXEMODS[sl].opts[S.axe[sl]].text : AXEMODS[sl].def.text}</span><br><span class="hint">可换：${Object.keys(AXEMODS[sl].opts).filter(k => k !== S.axe[sl]).map(k => AXEMODS[sl].opts[k].name).join('、')}</span></li>`).join('');
  const specs = S.spec ? `<li><b class="ok">${SPECS[S.spec].name}</b>：${SPECS[S.spec].tide}<br><span class="hint">改写：${SPECS[S.spec].rewrite}</span><br><span class="hint">共鸣（${axeName('atk')}）：${SPECS[S.spec].reso[atkMode()]}</span></li>` : Object.keys(SPECS).map(k => `<li><b>${SPECS[k].name}</b>：${SPECS[k].tide}<br><span class="hint">契合 ${SPECS[k].affinity.map(t => TREES[t].name).join('、')}</span></li>`).join('') + `<li class="hint">${S.player.lvl >= 8 ? '到中心层的誓约碑（小地图金色菱形）按住 E 转职' : '8 级后到中心层的誓约碑转职'}</li>`;
  const sy = SYN.map(x => `<li>${S.syn.has(x.id) ? '<b class="ok">' + x.name + '</b>' : x.name}：${x.need.map(n => NODES[n].name).join(' + ')}<br><span class="hint">${x.text}</span></li>`).join('');
  const ps = Object.entries(S.passives).map(([k, v]) => `<li><b>${PASSIVES[k].name}</b> Lv ${v}<br><span class="hint">${PASSIVES[k].text(lv(k))}</span></li>`).join('') || '<li class="hint">还没有</li>';
  const bs = Object.entries(S.bless).map(([k, v]) => `<li><b>${BLESS[k].name}</b> ${v} 层<br><span class="hint">${BLESS[k].text(v)}</span></li>`).join('') || '<li class="hint">修好路灯或碰到祭坛时获得</li>';
  const stb = ['blade', 'whirl', 'leap', 'axe'].filter(id => id === 'blade' || nd(id)).map(id => `<li><b>${id === 'blade' ? '消防斧 · 普攻' : stName(id)}</b> Lv ${id === 'blade' ? stLvl(id) + 1 : nd(id)}<br><span class="hint">${stSummary(id)}</span>${afxPool(id, [])}</li>`).join('');
  $('#overlay').innerHTML = `<div class="panel"><div><div class="title">PAUSED</div><h2>破障者${S.spec ? ' · ' + SPECS[S.spec].name : ''}</h2><div class="sub">一把消防斧。4 级改装工作台选普攻模式，储物柜换终结技或普攻，升级时选普攻效果（斧刃）。怒气满 100 狂暴 6 秒。每棵树：入口 → 两个分支 → 终极；战技树最多进两棵。</div></div>
  <div class="grid2">${statsHTML()}</div><div class="box"><h3>职业特色</h3><ul>${CLS.warrior.traits.map(t => `<li>${t}</li>`).join('')}${S.spec ? `<li><b class="ok">${SPECS[S.spec].name}</b>：${SPECS[S.spec].core}</li>` : ''}</ul></div>
  <div class="grid2">${auraTreeHTML()}</div>
  <div class="grid2"><div class="box"><h3>技能词条</h3><ul>${stb}</ul></div><div class="box"><h3>斧头</h3><ul>${mods}${edgeLi}</ul></div><div class="box"><h3>誓约</h3><ul>${specs}</ul></div><div class="box"><h3>协同（凑齐自动触发）</h3><ul>${sy}</ul></div></div>
  <div class="grid2">${trees}</div>
  <div class="grid2"><div class="box"><h3>被动 ${Object.keys(S.passives).length}/${passSlots()}</h3><ul>${ps}</ul></div><div class="box"><h3>祝福</h3><ul>${bs}</ul></div></div>
  <div class="row-btns"><button class="btn" id="resume">继续（Esc）</button><button class="btn ghost" id="quit">放弃这局</button></div></div>`;
  $('#overlay').classList.add('on'); $('#resume').onclick = resume; $('#quit').onclick = () => { mode = 'play'; endRun('dead'); };
}

