// ================= 声音（全部实时合成，无外部素材） =================
const AU = { ctx: null, muted: false, vol: 0.8, last: {}, live: 0, chain: 0, chainT: 0, I: 0, nextT: 0, step: 0, stage: 0, beatT: 0 };
window.__au = AU;
try { const a = JSON.parse(localStorage.getItem('ember-audio') || '{}'); AU.muted = !!a.muted; if (a.vol != null) AU.vol = a.vol; } catch (e) {}
function auSave() { try { localStorage.setItem('ember-audio', JSON.stringify({ muted: AU.muted, vol: AU.vol })); } catch (e) {} }
function auInit() {
  if (AU.ctx || window.__bot) return; const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  const c = AU.ctx = new C();
  AU.master = c.createGain(); AU.master.gain.value = AU.muted ? 0 : AU.vol;
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
  AU.master.connect(comp); comp.connect(c.destination);
  AU.sfx = c.createGain(); AU.sfx.gain.value = 1.05; AU.sfx.connect(AU.master);
  AU.musF = c.createBiquadFilter(); AU.musF.type = 'lowpass'; AU.musF.frequency.value = 12000; AU.musF.connect(AU.master);
  AU.mus = c.createGain(); AU.mus.gain.value = 1.0; AU.mus.connect(AU.musF);
  const len = c.sampleRate * 2.8 | 0, ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  AU.rev = c.createConvolver(); AU.rev.buffer = ir; const rg = c.createGain(); rg.gain.value = 0.32; AU.rev.connect(rg); rg.connect(AU.master);
  AU.dl = c.createDelay(1); AU.dl.delayTime.value = 0.625; const fb = c.createGain(); fb.gain.value = 0.38; const dlf = c.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 2200;
  AU.dl.connect(dlf); dlf.connect(fb); fb.connect(AU.dl); dlf.connect(AU.mus); dlf.connect(AU.rev);
  const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nz = nb.getChannelData(0); for (let i = 0; i < nz.length; i++) nz[i] = Math.random() * 2 - 1; AU.noise = nb;
  const ws = AU.dist = c.createWaveShaper(), cu = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; cu[i] = Math.tanh(x * 4); } ws.curve = cu; ws.connect(AU.sfx);
  AU.nextT = c.currentTime + 0.1;
}
function auWake() { auInit(); if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); }
addEventListener('pointerdown', auWake); addEventListener('keydown', auWake);
function auToggle() { auWake(); AU.muted = !AU.muted; auSave(); if (AU.master) AU.master.gain.setTargetAtTime(AU.muted ? 0 : AU.vol, AU.ctx.currentTime, 0.05); banner(AU.muted ? '声音关闭' : '声音开启', '按 M 切换', '#cfd6e6', 1.2); }
const auOk = () => AU.ctx && !AU.muted && AU.ctx.state === 'running';
function gap(k, g) { const n = AU.ctx.currentTime; if ((AU.last[k] || 0) + g > n) return false; AU.last[k] = n; return true; }
// 基本发声器
function env(g, t0, a, d, v) { g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d); }
function tn(o) {
  const c = AU.ctx; if (AU.live > 48) return; const t0 = (o.at || c.currentTime) + (o.delay || 0);
  const s = c.createOscillator(), g = c.createGain(); s.type = o.type || 'sine'; s.frequency.setValueAtTime(o.f, t0); if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.glide || o.d));
  if (o.det) s.detune.value = o.det;
  let n = s; if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o.lp, t0); if (o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t0 + o.d); f.Q.value = o.q || 0.7; n.connect(f); n = f; }
  n.connect(g); env(g, t0, o.a || 0.004, o.d, o.v);
  g.connect(o.to || AU.sfx); if (o.rev) { const r = c.createGain(); r.gain.value = o.rev; g.connect(r); r.connect(AU.rev); } if (o.echo) { const r = c.createGain(); r.gain.value = o.echo; g.connect(r); r.connect(AU.dl); }
  AU.live++; s.onended = () => AU.live--; s.start(t0); s.stop(t0 + (o.a || 0.004) + o.d + 0.05);
}
function nz(o) {
  const c = AU.ctx; if (AU.live > 48) return; const t0 = (o.at || c.currentTime) + (o.delay || 0);
  const s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true; s.playbackRate.value = o.rate || 1; const f = c.createBiquadFilter(); f.type = o.ft || 'bandpass';
  f.frequency.setValueAtTime(o.f, t0); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.d); f.Q.value = o.q || 1; const g = c.createGain();
  s.connect(f); f.connect(g); env(g, t0, o.a || 0.003, o.d, o.v); g.connect(o.to || AU.sfx); if (o.rev) { const r = c.createGain(); r.gain.value = o.rev; g.connect(r); r.connect(AU.rev); }
  AU.live++; s.onended = () => AU.live--; s.start(t0, Math.random() * 0.5); s.stop(t0 + (o.a || 0.003) + o.d + 0.05);
}
const jit = (f, k = 0.06) => f * (1 + (Math.random() * 2 - 1) * k);
const NOTE = m => 440 * Math.pow(2, (m - 69) / 12);
function sfx(k, arg) {
  if (!auOk()) return; const c = AU.ctx, now = c.currentTime;
  switch (k) {
    case 'swing': { if (!gap('sw', 0.05)) return; const h = arg; nz({ ft: 'bandpass', f: h ? 260 : 700, f2: h ? 1300 : 2600, d: h ? 0.2 : 0.11, v: h ? 0.2 : 0.12, q: 1.4 }); break; }
    case 'hit': { if (!gap('hit', 0.04)) return; const n = Math.min(5, arg || 1); tn({ f: jit(150), f2: 50, d: 0.11, v: 0.26 + 0.03 * n }); nz({ ft: 'highpass', f: 1800, d: 0.035, v: 0.12 + 0.02 * n }); nz({ ft: 'lowpass', f: 900, f2: 200, d: 0.07, v: 0.12 }); break; }
    case 'heavy': { if (!gap('hv', 0.06)) return; tn({ f: jit(110), f2: 38, d: 0.22, v: 0.42 }); tn({ type: 'square', f: jit(70), f2: 35, d: 0.16, v: 0.1, lp: 900, to: AU.dist }); nz({ ft: 'lowpass', f: 1400, f2: 120, d: 0.2, v: 0.25, rev: 0.25 }); break; }
    case 'crit': { if (!gap('cr', 0.08)) return; tn({ type: 'triangle', f: jit(1900, 0.03), d: 0.18, v: 0.07, rev: 0.4 }); tn({ type: 'triangle', f: jit(2850, 0.03), d: 0.12, v: 0.045 }); break; }
    case 'kill': { const e = arg; if (e && e.elite) { tn({ f: 90, f2: 30, d: 0.6, v: 0.45, rev: 0.6 }); nz({ ft: 'lowpass', f: 2200, f2: 90, d: 0.6, v: 0.32, rev: 0.5 }); return; }
      if (e && e.type === 'moth') { if (!gap('mo', 0.05)) return; nz({ ft: 'lowpass', f: 1500, f2: 180, d: 0.26, v: 0.22 }); tn({ f: 210, f2: 60, d: 0.18, v: 0.16 }); return; }
      if (!gap('kl', 0.035)) return; nz({ ft: 'bandpass', f: jit(520, 0.15), f2: 160, d: 0.09, v: 0.1, q: 2 }); break; }
    case 'xp': { if (!gap('xp', 0.03)) return; if (now - AU.chainT > 0.5) AU.chain = 0; AU.chainT = now; const P = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24], m = 74 + P[Math.min(P.length - 1, AU.chain++ >> 1)]; tn({ type: 'sine', f: NOTE(m), d: 0.09, v: 0.045 }); break; }
    case 'scrap': { if (!gap('sc', 0.05)) return; tn({ type: 'triangle', f: jit(2300, 0.05), d: 0.06, v: 0.05 }); tn({ type: 'triangle', f: jit(3100, 0.05), d: 0.05, v: 0.03, delay: 0.035 }); break; }
    case 'heal': tn({ type: 'sine', f: NOTE(74), d: 0.25, v: 0.09, rev: 0.4 }); tn({ type: 'sine', f: NOTE(81), d: 0.35, v: 0.09, delay: 0.09, rev: 0.4 }); break;
    case 'level': if (!gap('lv', 0.5)) return; [62, 65, 69, 74, 77].forEach((m, i) => tn({ type: 'triangle', f: NOTE(m), d: 0.6, v: 0.09, delay: i * 0.07, rev: 0.5, echo: 0.2 })); break;
    case 'pick': tn({ type: 'triangle', f: 1300, f2: 900, d: 0.06, v: 0.06 }); break;
    case 'hurt': { if (!gap('hu', 0.12)) return; tn({ f: 95, f2: 38, d: 0.2, v: 0.4 }); tn({ type: 'sawtooth', f: 120, f2: 60, d: 0.12, v: 0.08, lp: 700, to: AU.dist }); nz({ ft: 'lowpass', f: 600, d: 0.12, v: 0.18 }); break; }
    case 'heart': tn({ f: 62, f2: 40, d: 0.13, v: 0.32 }); tn({ f: 58, f2: 38, d: 0.16, v: 0.24, delay: 0.17 }); break;
    case 'lamp': [62, 66, 69, 74].forEach((m, i) => tn({ type: 'sine', f: NOTE(m), a: 0.25, d: 1.8, v: 0.07, delay: i * 0.05, rev: 0.7 })); nz({ ft: 'highpass', f: 5000, d: 0.5, v: 0.03, rev: 0.6 }); break;
    case 'chest': tn({ type: 'square', f: 220, d: 0.09, v: 0.05, lp: 2400 }); tn({ type: 'square', f: 331, d: 0.12, v: 0.045, lp: 2400, delay: 0.05 }); nz({ ft: 'highpass', f: 3000, d: 0.08, v: 0.08 }); [74, 78, 81].forEach((m, i) => tn({ type: 'triangle', f: NOTE(m + 12), d: 0.3, v: 0.04, delay: 0.12 + i * 0.06, rev: 0.4 })); break;
    case 'break': { if (!gap('br', 0.05)) return; nz({ ft: 'bandpass', f: jit(380, 0.2), d: 0.12, v: 0.2, q: 1.5 }); tn({ type: 'triangle', f: jit(170), f2: 90, d: 0.08, v: 0.14 }); break; }
    case 'boom': { if (!gap('bm', 0.08)) return; tn({ f: 70, f2: 28, d: 0.45, v: 0.5, rev: 0.4 }); nz({ ft: 'lowpass', f: 900, f2: 70, d: 0.4, v: 0.32, rev: 0.3 }); break; }
    case 'zap': { if (!gap('zp', 0.06)) return; nz({ ft: 'highpass', f: 3500, d: 0.05, v: 0.06 }); tn({ type: 'square', f: jit(1400, 0.2), f2: 300, d: 0.05, v: 0.025, lp: 4000 }); break; }
    case 'thunder': nz({ ft: 'highpass', f: 2500, d: 0.08, v: 0.25 }); nz({ ft: 'lowpass', f: 700, f2: 80, d: 0.7, v: 0.3, rev: 0.6 }); tn({ f: 70, f2: 30, d: 0.5, v: 0.3 }); break;
    case 'ice': { if (!gap('ic', 0.08)) return; [88, 93, 96].forEach((m, i) => tn({ type: 'triangle', f: NOTE(m), d: 0.25, v: 0.05, delay: i * 0.03, rev: 0.4 })); nz({ ft: 'highpass', f: 4000, d: 0.12, v: 0.1 }); break; }
    case 'fire': { if (!gap('fi', 0.08)) return; nz({ ft: 'bandpass', f: 900, f2: 300, d: 0.22, v: 0.12, q: 0.7 }); break; }
    case 'pulse': tn({ f: 240, f2: 45, d: 0.4, v: 0.35, rev: 0.4 }); nz({ ft: 'highpass', f: 2500, f2: 600, d: 0.3, v: 0.1, rev: 0.4 }); break;
    case 'rage': tn({ type: 'sawtooth', f: 82, f2: 62, a: 0.03, d: 0.9, v: 0.18, lp: 900, to: AU.dist }); tn({ type: 'sawtooth', f: 123, f2: 92, a: 0.03, d: 0.8, v: 0.1, lp: 1200, to: AU.dist }); nz({ ft: 'bandpass', f: 600, f2: 250, d: 0.8, v: 0.18, q: 0.8, rev: 0.3 }); break;
    case 'oath': [38, 50, 57, 62, 65, 69].forEach((m, i) => { tn({ type: 'sawtooth', f: NOTE(m), a: 0.5, d: 2.8, v: 0.045, lp: 1200, lp2: 400, rev: 0.8, det: -6 }); tn({ type: 'sawtooth', f: NOTE(m), a: 0.5, d: 2.8, v: 0.04, lp: 1200, lp2: 400, rev: 0.8, det: 7, delay: 0.02 * i }); }); tn({ f: 55, f2: 30, d: 1, v: 0.4 }); break;
    case 'horn': tn({ type: 'sawtooth', f: NOTE(38), a: 0.35, d: 1.6, v: 0.09, lp: 380, rev: 0.6 }); tn({ type: 'sawtooth', f: NOTE(44), a: 0.35, d: 1.6, v: 0.06, lp: 380, rev: 0.6, delay: 0.05 }); break;
    case 'extract': [62, 66, 69, 74, 78, 81].forEach((m, i) => tn({ type: 'triangle', f: NOTE(m), d: 1.4, v: 0.08, delay: i * 0.11, rev: 0.6, echo: 0.25 })); break;
    case 'death': tn({ type: 'sawtooth', f: 220, f2: 40, d: 2.2, v: 0.14, lp: 1200, lp2: 120, rev: 0.6 }); tn({ type: 'sawtooth', f: 233, f2: 42, d: 2.2, v: 0.1, lp: 1200, lp2: 120, rev: 0.6 }); nz({ ft: 'lowpass', f: 800, f2: 60, d: 1.8, v: 0.2, rev: 0.6 }); break;
    case 'synergy': [69, 74, 76, 81].forEach((m, i) => tn({ type: 'triangle', f: NOTE(m), d: 1, v: 0.08, delay: i * 0.05, rev: 0.6, echo: 0.3 })); break;
  }
}
// ---- 音乐：D 小调，Dm–B♭–F–C，72 BPM；危险度驱动心跳鼓、低音和不协和
const CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]], PENTA = [62, 65, 67, 69, 72, 74, 77, 79];
function danger() {
  if (!S || mode === 'title' || mode === 'select') return 0;
  const p = S.player; let near = 0; for (const e of enemies) if (!e.dead && Math.abs(e.x - p.x) < 7 * M && Math.abs(e.y - p.y) < 7 * M) near++;
  return Math.min(1, Math.max(S.conc / 100 * 0.8, near / 30) + (S.berserkT > 0 ? 0.25 : 0));
}
function musicTick(rdt) {
  if (!AU.ctx || AU.ctx.state !== 'running') return; const c = AU.ctx, E = 60 / 72 / 2;
  AU.I += (danger() - AU.I) * Math.min(1, rdt * 0.6);
  AU.musF.frequency.setTargetAtTime(mode === 'pause' || mode === 'choice' ? 700 : 12000, c.currentTime, 0.15);
  if (mode === 'end') return;
  // 低血心跳 & 灰潮阶段号角
  if (S && mode === 'play') {
    const p = S.player; if (p.hp / D.maxHp < 0.3) { AU.beatT -= rdt; if (AU.beatT <= 0) { AU.beatT = 0.85; sfx('heart'); } }
    const st = STAGES.filter(([t]) => S.conc >= t).length; if (st > AU.stage && S.t > 2) sfx('horn'); AU.stage = st;
  }
  if (AU.nextT < c.currentTime - 0.5) AU.nextT = c.currentTime + 0.05;
  while (AU.nextT < c.currentTime + 0.25) {
    const t = AU.nextT, s = AU.step, bar = s >> 3, b8 = s & 7, ch = CHORDS[(bar >> 1) % 4], I = AU.I, title = !S || mode === 'title' || mode === 'select';
    if (b8 === 0 && bar % 2 === 0) { // 垫音：每两小节换和弦
      for (const m of ch) { tn({ at: t, type: 'sawtooth', f: NOTE(m), a: 1.4, d: 3.2, v: 0.022, lp: 520 + 500 * I, det: -8, to: AU.mus, rev: 0.5 }); tn({ at: t, type: 'sawtooth', f: NOTE(m), a: 1.4, d: 3.2, v: 0.022, lp: 520 + 500 * I, det: 8, to: AU.mus, rev: 0.5 }); }
      tn({ at: t, type: 'sine', f: NOTE(ch[0] - 12), a: 0.8, d: 3.4, v: 0.08, to: AU.mus });
      if (S && S.conc >= 100 && !title) tn({ at: t, type: 'sawtooth', f: NOTE(ch[0] + 6), a: 1.5, d: 3, v: 0.016, lp: 700, to: AU.mus, rev: 0.6 });
    }
    // 八音盒：稀疏的五声音阶，危险时更密
    const pr = title ? 0.28 : 0.22 + 0.25 * I;
    if (Math.random() < pr && (b8 % 2 === 0 || I > 0.4)) { const pool = PENTA.filter(m => ch.some(x => (m - x) % 12 === 0) || Math.random() < 0.35); const m = pool[(Math.random() * pool.length) | 0] || 69; tn({ at: t, type: 'triangle', f: NOTE(m), d: 1.1, v: 0.035, to: AU.mus, echo: 0.35, rev: 0.4 }); }
    if (!title) {
      if (I > 0.3 && (b8 === 0 || b8 === 1 && I > 0.5 || b8 === 4 && I > 0.7)) tn({ at: t, f: 64, f2: 36, d: 0.16, v: 0.18 + 0.15 * I, to: AU.mus });
      if (I > 0.5) tn({ at: t, type: 'sawtooth', f: NOTE(ch[0] - 12), d: E * 0.8, v: 0.03 + 0.03 * I, lp: 260 + 300 * I, to: AU.mus });
      if (I > 0.65 && b8 % 2 === 1) nz({ at: t, ft: 'highpass', f: 7000, d: 0.04, v: 0.025 * I, to: AU.mus });
    }
    AU.step++; AU.nextT += E;
  }
}

