// ================= 交互点标记：光柱、地面涟漪、头顶徽记、名字、屏幕边缘箭头 =================
// 所有能按 E 交互（或捡起来）的东西统一从这里出标记，颜色 = 种类，徽记里的字 = 一眼认出是什么。
const MARK_LT = { '#ffb454': 'lamp', '#ffe08a': 'lamp', '#e7a93f': 'lamp', '#e8c160': 'lamp', '#ffd28a': 'lamp', '#c9b6ff': 'violet', '#b79cff': 'violet', '#a99cc9': 'violet', '#ff6b5e': 'red', '#9fe8ff': 'cyan', '#7ff0c8': 'cyan', '#9be08a': 'green', '#8fe6a6': 'green', '#ffffff': 'white', '#ff9a4a': 'ember' };
let MK = [];
function markList() {
  const out = [], add = (o, col, ch, name, sub, h, kind, far) => out.push({ o, x: o.x, y: o.y, col, ch, name, sub, h, kind, far: far || 70 * M });
  for (const l of S.lamps) if (!l.rep) add(l, '#ffb454', '灯', '路灯', S.loot.scrap >= REPAIR_COST ? `修复 ${REPAIR_COST} 废料 · 浓度 −${lampDrop()}` : `修复要 ${REPAIR_COST} 废料`, 58, 'lamp');
  for (const c of S.chests) if (!c.open) add(c, c.gold ? '#ffe08a' : '#e7a93f', c.gold ? '金' : '柜', c.gold ? '金柜' : '储物柜', c.gold ? '免费 · 1–5 张升级' : `${chestCost(c)} 废料 · 稀有以上`, 36, c.gold ? 'gold' : 'chest');
  for (const o of S.pois) {
    if (o.used) continue;
    if (o.kind === 'shrine') add(o, SHRINES[o.type].col, '神', SHRINES[o.type].name, '二选一，有代价', 50, 'shrine');
    else if (o.kind === 'challenge') add(o, '#c9b6ff', '战', '挑战', S.chal ? '进行中' : `召约 ${chalCount()} 个，清完开金柜`, 52, 'challenge');
    else if (o.kind === 'greed') add(o, '#e8c160', '贪', '贪婪碑', '灰潮 +25% · 废料 ×1.5', 50, 'greed');
    else if (o.kind === 'scav') add(o, '#ffffff', '商', '拾荒者', `${scavPrice()} 废料一件`, 44, 'scav');
    else if (o.kind === 'stone') add(o, STONES[o.type].col, '石', STONES[o.type].name, STONES[o.type].text, 50, 'stone', 40 * M);
  }
  for (const E of S.eyes) if (!E.used) add(E, '#ff6b5e', '眼', '潮眼', S.boss ? '巨兽还活着' : '召唤蚀壳巨兽 · 建议 15 级+', 26, 'eye');
  if (!S.altar.used) add(S.altar, '#a99cc9', '坛', '祭坛', '一条灰潮祝福', 44, 'altar', 200 * M);
  if (isW() && !S.spec) add(S.oath, '#ffd28a', '誓', '誓约碑', S.player.lvl >= 8 ? '可以转职' : '8 级转职', 50, 'oath', 200 * M);
  for (const t of S.tapeItems) add(t, '#9fe8ff', '带', '录音带', '+2 零件 · 带回去才算', 18, 'tape', 200 * M);
  for (const it of items) {
    if (it.kind === 'gear') add(it, GEAR_RAR[it.gear.rar].col, '装', it.gear.name, GEAR_RAR[it.gear.rar].name + ' · 倒下也带得回', 18, 'gear', 30 * M);
    else if (it.kind === 'chip') add(it, '#7ff0c8', '芯', '科技芯片', '装一个光环', 18, 'chip', 30 * M);
  }
  return out;
}
function markLights(lights) {
  for (const m of MK) { if (m.x < camX - 120 || m.x > camX + VW + 120 || m.y < camY - 120 || m.y > camY + VH + 160) continue; const k = MARK_LT[m.col] || 'white'; lights.push([m.x, m.y - 12, (m.kind === 'gear' || m.kind === 'chip' || m.kind === 'tape' ? 1.6 : 2.4) * M, 0.6, k]); }
}
// 光柱：从物件脚下往上，加法混合，远远就能看见
function markBeams(vx0, vy0, vx1, vy1) {
  for (const m of MK) {
    if (m.x < vx0 - 20 || m.x > vx1 + 20 || m.y < vy0 || m.y - 7 * M > vy1) continue;
    const big = m.kind === 'gold' || m.kind === 'eye' || m.kind === 'altar' || m.kind === 'tape' || m.kind === 'lamp', H = (big ? 9 : 6) * M, w = big ? 9 : 6, pu = 0.75 + 0.25 * Math.sin(S.t * 2.2 + m.x * 0.01);
    const g = ctx.createLinearGradient(0, m.y, 0, m.y - H); g.addColorStop(0, hexA(m.col, 0.55 * pu)); g.addColorStop(0.35, hexA(m.col, 0.22 * pu)); g.addColorStop(1, hexA(m.col, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(m.x - w / 2, m.y - H, w, H);
    ctx.fillStyle = hexA(m.col, 0.5 * pu); ctx.fillRect(m.x - 1, m.y - H * 0.8, 2, H * 0.8);
  }
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`; }
// 地面涟漪 + 头顶徽记 + 名字（画在雾之上）
function markWorld(inV) {
  const p = S.player, tg = interactTarget(), cur = tg && tg.obj;
  ctx.textAlign = 'center';
  for (const m of MK) {
    if (!inV(m.x, m.y)) continue;
    const d = Math.hypot(m.x - p.x, m.y - p.y), on = cur === m.o, near = d < 11 * M;
    // 涟漪：两圈向外扩散
    for (let k = 0; k < 2; k++) { const ph = ((S.t * 0.6 + k * 0.5 + m.x * 0.003) % 1), r = 14 + ph * 26; ctx.strokeStyle = hexA(m.col, (on ? 0.9 : 0.55) * (1 - ph)); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(m.x, m.y + 2, r, r * 0.42, 0, 0, 6.283); ctx.stroke(); }
    if (on) { ctx.strokeStyle = hexA(m.col, 0.95); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(m.x, m.y + 2, 30, 12.6, 0, 0, 6.283); ctx.stroke(); }
    // 徽记
    const bob = Math.sin(S.t * 3 + m.x * 0.02) * 2.5, by = m.y - m.h - 16 + bob, R = on ? 12 : near ? 10.5 : 9;
    ctx.fillStyle = 'rgba(10,12,18,.85)'; ctx.beginPath(); ctx.arc(m.x, by, R + 2, 0, 6.283); ctx.fill();
    ctx.strokeStyle = m.col; ctx.lineWidth = on ? 2.5 : 2; ctx.beginPath(); ctx.arc(m.x, by, R, 0, 6.283); ctx.stroke();
    ctx.fillStyle = hexA(m.col, 0.18 + 0.12 * Math.sin(S.t * 4 + m.y)); ctx.beginPath(); ctx.arc(m.x, by, R - 1, 0, 6.283); ctx.fill();
    ctx.fillStyle = m.col; ctx.font = `700 ${on ? 13 : 11}px ${BODY_FONT}`; ctx.fillText(m.ch, m.x, by + (on ? 4.5 : 4));
    ctx.beginPath(); ctx.moveTo(m.x - 4, by + R + 1); ctx.lineTo(m.x + 4, by + R + 1); ctx.lineTo(m.x, by + R + 6); ctx.fill();
    // 名字：靠近才显示，站上去显示按 E
    if (near || on) {
      const a = on ? 1 : Math.min(1, (11 * M - d) / (3 * M)), ty = by - R - 8;
      ctx.globalAlpha = a; ctx.font = `700 12px ${BODY_FONT}`;
      const t1 = (on ? '[E] ' : '') + m.name, w1 = ctx.measureText(t1).width; ctx.font = `11px ${BODY_FONT}`; const w2 = ctx.measureText(m.sub).width, W = Math.max(w1, w2) + 14;
      ctx.fillStyle = 'rgba(10,12,18,.82)'; ctx.fillRect(m.x - W / 2, ty - 26, W, 31); ctx.fillStyle = m.col; ctx.fillRect(m.x - W / 2, ty - 26, 2, 31);
      ctx.font = `700 12px ${BODY_FONT}`; ctx.fillStyle = on ? '#ffffff' : m.col; ctx.fillText(t1, m.x, ty - 12);
      ctx.font = `11px ${BODY_FONT}`; ctx.fillStyle = '#c3c9d6'; ctx.fillText(m.sub, m.x, ty + 1); ctx.globalAlpha = 1;
    }
  }
  ctx.textAlign = 'left';
}
// 屏幕边缘箭头：每种最近的一个，最多 7 个，带徽记字和距离
function markArrows(SW, SH) {
  const p = S.player, best = {};
  for (const m of MK) { const d = Math.hypot(m.x - p.x, m.y - p.y); if (d > m.far || d < 5 * M) continue; const ex = (m.x - camX) * ZOOM, ey = (m.y - camY) * ZOOM; if (ex > 30 && ex < SW - 30 && ey > 30 && ey < SH - 30) continue; const k = m.kind === 'shrine' ? 'shrine' + m.o.type : m.kind; if (!best[k] || best[k].d > d) best[k] = { m, d }; }
  const list = Object.values(best).sort((a, b) => a.d - b.d).slice(0, 7);
  // 安全区：避开左边构筑栏、顶部浓度条、右上小地图、底部提示
  const wide = SW > 760, L = wide ? 250 : 40, T = 96, R = SW - 40, B = SH - 130, cx = (L + R) / 2, cy = (T + B) / 2, placed = [];
  ctx.textAlign = 'center';
  for (const { m, d } of list) {
    const a = Math.atan2(m.y - p.y, m.x - p.x), ca = Math.cos(a), sa = Math.sin(a), t = Math.min(ca ? ((ca > 0 ? R : L) - cx) / ca : 1e9, sa ? ((sa > 0 ? B : T) - cy) / sa : 1e9);
    let x = cx + ca * t, y = cy + sa * t;
    if (wide && x > SW - 260 && y < 200) y = 200;
    for (let k = 0; k < 6 && placed.some(([px, py]) => Math.abs(px - x) < 84 && Math.abs(py - y) < 40); k++) { if (Math.abs(x - L) < 2 || Math.abs(x - R) < 2) y += 42; else x += 86; }
    placed.push([x, y]); const pu = 0.8 + 0.2 * Math.sin(S.t * 4 + d);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = m.col; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(14, -8); ctx.lineTo(14, 8); ctx.fill(); ctx.restore();
    ctx.globalAlpha = 0.92; ctx.fillStyle = 'rgba(10,12,18,.88)'; ctx.beginPath(); ctx.arc(x, y, 14, 0, 6.283); ctx.fill(); ctx.strokeStyle = m.col; ctx.lineWidth = 2; ctx.globalAlpha = pu; ctx.beginPath(); ctx.arc(x, y, 13, 0, 6.283); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = m.col; ctx.font = `700 13px ${BODY_FONT}`; ctx.fillText(m.ch, x, y + 4.5);
    const lx = x, ly = y > cy + 40 ? y - 22 : y + 32, lab = `${m.name} ${Math.round(d / M)}m`; ctx.font = `700 11px ${BODY_FONT}`; const w = ctx.measureText(lab).width + 8;
    ctx.fillStyle = 'rgba(10,12,18,.7)'; ctx.fillRect(lx - w / 2, ly - 11, w, 15); ctx.fillStyle = m.col; ctx.fillText(lab, lx, ly);
  }
  ctx.textAlign = 'left';
}
