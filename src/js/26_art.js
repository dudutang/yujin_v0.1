// ================= 美术：程序生成的像素画 =================
const PX = 2; // 一个美术像素 = 2 世界像素
function bevel(c, s = PX) {
  const g = c.getContext('2d'), W = c.width, H = c.height, im = g.getImageData(0, 0, W, H), d = im.data, src = new Uint8ClampedArray(d);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? -1 : (y * W + x) * 4;
  const solid = i => i >= 0 && src[i + 3] > 40 && (src[i] + src[i + 1] + src[i + 2]) > 75;
  for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
    const i = at(x, y); if (!solid(i)) continue;
    let k = 0; if (!solid(at(x, y - s))) k += 0.24; if (!solid(at(x - s, y))) k += 0.1; if (!solid(at(x, y + s))) k -= 0.26; if (!solid(at(x + s, y))) k -= 0.1;
    if (!k) continue;
    for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) { const j = at(x + xx, y + yy); if (j < 0) continue;
      if (k > 0) { d[j] = src[j] + (255 - src[j]) * k * 0.9; d[j + 1] = src[j + 1] + (242 - src[j + 1]) * k * 0.9; d[j + 2] = src[j + 2] + (215 - src[j + 2]) * k * 0.8; }
      else { d[j] = src[j] * (1 + k); d[j + 1] = src[j + 1] * (1 + k); d[j + 2] = src[j + 2] * (1 + k * 0.6); } }
  }
  g.putImageData(im, 0, 0); return c;
}
function spr(rows, pal, s = PX) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = w * s; c.height = h * s; const g = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) { const ch = rows[y][x]; if (!pal[ch]) continue; g.fillStyle = pal[ch]; g.fillRect(x * s, y * s, s, s); }
  return bevel(c, s);
}
function rectSpr(w, h, fn, s = PX, flat) { const c = document.createElement('canvas'); c.width = w * s; c.height = h * s; const g = c.getContext('2d'); fn((x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x * s, y * s, ww * s, hh * s); }); return flat ? c : bevel(c, s); }
function tint(c, color) { const t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const g = t.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, t.width, t.height); return t; }
function flip(c) { const t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const g = t.getContext('2d'); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return t; }
function glowSpr(r, rgb) { const c = document.createElement('canvas'); c.width = c.height = r * 2; const g = c.getContext('2d'); const gr = g.createRadialGradient(r, r, 0, r, r, r); gr.addColorStop(0, `rgba(${rgb},0.85)`); gr.addColorStop(0.3, `rgba(${rgb},0.3)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c; }
const GLOW = { amber: glowSpr(64, '255,168,72'), red: glowSpr(32, '255,96,84'), cyan: glowSpr(64, '140,225,255'), blue: glowSpr(48, '150,200,255'), violet: glowSpr(64, '180,150,255'), white: glowSpr(16, '235,240,255'), ember: glowSpr(16, '255,150,60'), green: glowSpr(48, '150,230,170'), lamp: glowSpr(48, '255,225,150') };

const ART = {};
(() => {
  // 守灯人：线路巡检员，黄安全帽、橙色工装、反光条
  const pp = { o: '#15171d', h: '#e2a53f', H: '#f6d37c', s: '#e4b48e', e: '#1b1d24', j: '#d4652a', J: '#93421d', r: '#f3ead2', p: '#3d4459', b: '#23262f' };
  const body = ['...oooo...', '..oHHhho..', '.oHhhhhhho', '.oooooooo.', '..osesso..', '..osssso..', '.ojjjjjjo.', 'ojrjjjjrjo', 'ojjjjjjjjo', 'osJjjjjJso', '.oJJJJJJo.', '.oppppppo.'];
  ART.pA = spr([...body, '.opp..ppo.', '.obb..bbo.'], pp); ART.pB = spr([...body, '..oppppo..', '..obbbbo..'], pp);
  ART.pAf = flip(ART.pA); ART.pBf = flip(ART.pB); ART.pW = tint(ART.pA, '#ffffff'); ART.pWf = flip(ART.pW);
  // 烬影：烟一样的团块，底部是飘动的触须
  const sp = { o: '#0e1016', H: '#58627c', '#': '#2c3244', d: '#1c202b', e: '#eef3ff' };
  const top = ['....oooo....', '..ooHHHHoo..', '.oHHH###HHo.', '.oH#######o.', 'o##e####e##o', 'o##########o', 'o##########o', 'o#########do', 'od#######ddo', '.od#d##d#do.'];
  ART.shadeA = spr([...top, '.od.dd.dd.o.', '..o..o..o...'], sp); ART.shadeB = spr([...top, '.o.dd.dd.do.', '...o..o..o..'], sp);
  ART.shadeW = tint(ART.shadeA, '#ffffff');
  // 灰蛾
  const mp = { o: '#121318', w: '#7d7b90', W: '#b2b0c6', b: '#3b3948', e: '#ffcf8a' };
  ART.moth = spr(['oo..........oo', 'oWwo......owWo', 'oWwwo.oo.owwWo', '.oWwwobbowwWo.', '..owwbeebwwo..', '...oowbbwoo...', '.....obbo.....', '......oo......'], mp);
  ART.mothW = tint(ART.moth, '#ffffff');
  // 蚀壳：甲壳虫一样的灰色装甲
  const shp = { o: '#101217', A: '#8f98ab', a: '#5e687b', d: '#383e4c', e: '#ff9a5a', l: '#242830' };
  ART.shell = spr(['.....oooooo.....', '...ooAAAAaaoo...', '..oAAaaaaaaado..', '.oAaaoaaaoaaddo.', '.oaaaoaaaoaaddo.', 'oaaaaoaaaoaaaddo', 'oddaaoaaaoaaddoo', 'oddddoddddoddddo', '.ooeoooooooooeo.', '.l.l..l..l..l.l.', 'l..l..l..l..l..l'], shp);
  ART.shellW = tint(ART.shell, '#ffffff');
  ART.eyes = { shade: [[3.5, 4.5, '#eef3ff'], [8.5, 4.5, '#eef3ff']], moth: [[6.5, 4.5, '#ffcf8a'], [7.5, 4.5, '#ffcf8a']], shell: [[3.5, 8.5, '#ff9a5a'], [13.5, 8.5, '#ff9a5a']] };
  // 灯塔（余晖站）
  const lp = { o: '#14161c', W: '#e0dacb', w: '#aaa496', R: '#b04a3c', r: '#7d3229', L: '#ffd98a', g: '#3a3f4a', B: '#2c303a', b: '#434856' };
  ART.lighthouse = spr(['.....oooo.....', '....oggggo....', '....oLLLLo....', '...ogLLLLgo...', '...oooooooo...', '....oWWWwo....', '....oWWWwo....', '....oRRRro....', '....oRRRro....', '...oWWWWwwo...', '...oWWWWwwo...', '...oRRRRrro...', '...oRRRRrro...', '..oWWWWWwwwo..', '..oWWWWWwwwo..', '..oRRRRRrrro..', '..oRRRRRrrro..', '.oWWWWWWwwwwo.', '.oWWWWWWwwwwo.', 'obbbbbbbbBBBBo', 'oBBBBBBBBBBBBo'], lp, 3);
  // 路灯
  const lampRows = lit => { const rows = ['ooooooo..', 'oHHHHHHo.', '.oLLLLlo.', '..ooooPo.']; for (let i = 0; i < 16; i++) rows.push('.....oPo.'); rows.push('....oPPpo', '...oPPPpo', '...oooooo'); return spr(rows, { o: '#15171d', P: '#5a606f', p: '#3a3f4b', H: '#6e7484', L: lit ? '#ffe2a8' : '#30333c', l: lit ? '#ffb454' : '#262930' }); };
  ART.lampOn = lampRows(true); ART.lampOff = lampRows(false);
  // 灰潮祭坛
  ART.altar = spr(['...oo...', '..oVvo..', '..oVvo..', '..oVgo..', '..oVvo..', '.oVvvdo.', '.oVgvdo.', '.oVvvdo.', 'oVvvvddo', 'oddddddo'], { o: '#121018', v: '#4b3f66', V: '#6c5a94', g: '#c9b6ff', d: '#2c2540' }, 3);
  // 掉落物
  ART.vac = rectSpr(8, 8, R => { R(0, 0, 3, 8, '#15171d'); R(5, 0, 3, 8, '#15171d'); R(0, 5, 8, 3, '#15171d'); R(1, 2, 1, 4, '#e0574f'); R(6, 2, 1, 4, '#e0574f'); R(1, 6, 6, 1, '#e0574f'); R(1, 0, 1, 2, '#d9dde6'); R(6, 0, 1, 2, '#d9dde6'); });
  ART.calm = rectSpr(6, 9, R => { R(0, 0, 6, 9, '#15171d'); R(1, 1, 4, 7, '#efe6d0'); R(2, 2, 2, 1, '#8f6fd6'); R(2, 4, 2, 1, '#8f6fd6'); R(2, 6, 2, 1, '#8f6fd6'); R(1, 1, 4, 1, '#fff8e8'); });
  ART.locker = rectSpr(11, 15, R => { R(0, 0, 11, 15, '#15171d'); R(1, 1, 9, 13, '#4f5f5a'); R(1, 1, 9, 1, '#6c7e78'); R(5, 1, 1, 13, '#33403c'); R(2, 3, 2, 1, '#2a3330'); R(7, 3, 2, 1, '#2a3330'); R(2, 5, 2, 1, '#2a3330'); R(7, 5, 2, 1, '#2a3330'); R(4, 8, 3, 3, '#15171d'); R(4, 8, 3, 2, '#e7a93f'); R(5, 8, 1, 1, '#ffe2a8'); R(1, 13, 9, 1, '#2a3330'); });
  ART.lockerOpen = rectSpr(11, 15, R => { R(0, 0, 11, 15, '#15171d'); R(1, 1, 9, 13, '#1d2422'); R(1, 1, 3, 13, '#4f5f5a'); R(1, 1, 3, 1, '#6c7e78'); R(5, 10, 4, 3, '#2b2b2b'); R(1, 13, 9, 1, '#2a3330'); });
  ART.cocoon = rectSpr(10, 12, R => { R(2, 0, 6, 12, '#15171d'); R(0, 3, 10, 7, '#15171d'); R(3, 1, 4, 10, '#5a5070'); R(1, 4, 8, 5, '#5a5070'); R(3, 1, 2, 4, '#7d7298'); R(2, 6, 1, 1, '#3c3550'); R(6, 3, 1, 1, '#3c3550'); R(5, 8, 1, 2, '#3c3550'); R(4, 5, 2, 2, '#b79cff'); });
  ART.heal = rectSpr(7, 7, R => { R(2, 0, 3, 7, '#15171d'); R(0, 2, 7, 3, '#15171d'); R(3, 1, 1, 5, '#ff6b5e'); R(1, 3, 5, 1, '#ff6b5e'); R(3, 1, 1, 1, '#ffc0b8'); });
  ART.scrap = rectSpr(6, 4, R => { R(0, 0, 6, 4, '#15171d'); R(1, 1, 4, 2, '#a19582'); R(1, 1, 2, 1, '#c8bca6'); });
  ART.part = rectSpr(6, 6, R => { R(1, 0, 4, 6, '#15171d'); R(0, 1, 6, 4, '#15171d'); R(1, 1, 4, 4, '#9fe8ff'); R(2, 2, 2, 2, '#2a4a55'); });
  ART.tape = rectSpr(10, 7, R => { R(0, 0, 10, 7, '#15171d'); R(1, 1, 8, 5, '#d9f6ff'); R(2, 2, 2, 2, '#2a4a55'); R(6, 2, 2, 2, '#2a4a55'); R(3, 5, 4, 1, '#7fc6d8'); });
  ART.gear = rectSpr(11, 10, R => { R(2, 0, 7, 2, '#15171d'); R(3, 0, 5, 1, '#8a6d47'); R(1, 2, 9, 8, '#15171d'); R(2, 3, 7, 6, '#6b4a2e'); R(3, 4, 5, 2, '#a07a4f'); R(4, 6, 3, 2, '#e8c160'); });
  ART.chip = rectSpr(9, 9, R => { R(1, 0, 7, 9, '#15171d'); R(0, 1, 9, 7, '#15171d'); R(1, 1, 7, 7, '#1f5a4a'); R(2, 2, 5, 5, '#7ff0c8'); R(3, 3, 3, 3, '#e8fff6'); for (let i = 1; i < 8; i += 2) { R(i, 0, 1, 1, '#c9d6e8'); R(i, 8, 1, 1, '#c9d6e8'); } });
  ART.stele = rectSpr(10, 16, R => { R(1, 2, 8, 14, '#15171d'); R(2, 3, 6, 12, '#5d6070'); R(2, 3, 6, 1, '#8a8f9c'); R(3, 0, 4, 3, '#15171d'); R(4, 1, 2, 2, '#787c8e'); R(0, 14, 10, 2, '#15171d'); R(1, 14, 8, 1, '#3e414d'); });
  ART.obelisk = rectSpr(10, 20, R => { R(3, 0, 4, 20, '#15171d'); R(2, 4, 6, 16, '#15171d'); R(4, 1, 2, 18, '#3a2f50'); R(3, 5, 4, 14, '#4b3f66'); R(4, 8, 2, 3, '#c9b6ff'); R(0, 18, 10, 2, '#15171d'); R(1, 18, 8, 1, '#241d31'); });
  ART.tent = rectSpr(22, 14, R => { R(0, 6, 22, 8, '#15171d'); R(1, 7, 20, 6, '#6b5a3e'); R(1, 7, 20, 1, '#8a7a55'); R(4, 1, 14, 6, '#15171d'); R(5, 2, 12, 5, '#8a6d47'); R(5, 2, 12, 1, '#a68a5b'); R(9, 8, 4, 5, '#2a2420'); R(16, 3, 2, 3, '#ffd98a'); R(3, 9, 2, 3, '#4a4a4a'); R(18, 9, 2, 3, '#4a4a4a'); });
  ART.rod = rectSpr(4, 12, R => { R(1, 0, 2, 12, '#15171d'); R(1, 1, 1, 10, '#c9d6e8'); R(0, 0, 4, 2, '#ffffff'); });
})();

// 摆件
const PSPR = {
  car: [['#6e4b3a', '#8a5f48', '#4c3328'], ['#3f5560', '#55707c', '#2d3d45'], ['#6b6a52', '#86856a', '#4a4938']].map(([b, h, d]) => rectSpr(30, 15, R => { R(2, 5, 26, 7, '#15171d'); R(3, 5, 24, 6, b); R(3, 5, 24, 1, h); R(8, 1, 14, 5, '#15171d'); R(9, 2, 12, 4, b); R(10, 2, 4, 3, '#2a3644'); R(15, 2, 5, 3, '#334253'); R(10, 2, 1, 1, '#55708a'); R(3, 10, 24, 1, d); R(5, 10, 5, 4, '#111216'); R(20, 10, 5, 4, '#111216'); R(6, 11, 3, 2, '#3a3d45'); R(21, 11, 3, 2, '#3a3d45'); R(26, 6, 1, 2, '#c9a76a'); R(3, 6, 1, 2, '#7a2b25'); })),
  crate: rectSpr(10, 10, R => { R(0, 0, 10, 10, '#15171d'); R(1, 1, 8, 8, '#6f5536'); R(1, 1, 8, 1, '#8a6d47'); R(1, 4, 8, 1, '#4e3b26'); R(4, 1, 1, 8, '#4e3b26'); }),
  barrel: rectSpr(8, 11, R => { R(0, 0, 8, 11, '#15171d'); R(1, 1, 6, 9, '#4f5e47'); R(1, 1, 6, 1, '#6a7a5e'); R(1, 3, 6, 1, '#3a4535'); R(1, 7, 6, 1, '#3a4535'); R(2, 2, 1, 6, '#7a8a6e'); R(5, 5, 1, 2, '#7a4a2c'); }),
  rubble: [0, 1, 2].map(k => rectSpr(16, 9, R => { const cols = ['#5b5752', '#47433f', '#6c6762']; let sd = k * 97 + 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 9; i++) { const w = 2 + (r() * 5 | 0), h = 2 + (r() * 3 | 0), x = r() * (16 - w) | 0, y = 9 - h - (r() * 4 | 0); R(x, y, w, h, '#15171d'); R(x, y, w - 1, h - 1, cols[r() * 2 | 0]); R(x, y, w - 1, 1, cols[2]); } })),
  tree: rectSpr(14, 22, R => { R(6, 8, 3, 14, '#2e2622'); R(7, 8, 1, 14, '#4a3b32'); R(3, 4, 1, 6, '#2e2622'); R(4, 8, 3, 1, '#2e2622'); R(10, 2, 1, 7, '#2e2622'); R(8, 7, 3, 1, '#2e2622'); R(1, 2, 1, 3, '#2e2622'); R(2, 4, 1, 1, '#2e2622'); R(12, 0, 1, 3, '#2e2622'); R(11, 2, 1, 1, '#2e2622'); }),
  wall: rectSpr(22, 12, R => { R(0, 1, 22, 11, '#15171d'); R(1, 2, 20, 9, '#5a4a45'); for (let y = 2; y < 11; y += 2) R(1, y, 20, 1, '#43352f'); for (let y = 3; y < 11; y += 2) for (let x = (y % 4 === 1 ? 3 : 1); x < 21; x += 5) R(x, y, 1, 1, '#43352f'); R(1, 2, 20, 1, '#6e5c55'); }),
  pillar: rectSpr(10, 20, R => { R(0, 0, 10, 20, '#15171d'); R(1, 1, 8, 18, '#5d6070'); R(1, 1, 8, 2, '#787c8e'); R(6, 3, 2, 15, '#4a4d5b'); R(3, 8, 1, 4, '#3e414d'); R(4, 11, 1, 3, '#3e414d'); R(0, 18, 10, 2, '#2c2e36'); }),
  cart: rectSpr(14, 11, R => { R(1, 1, 12, 1, '#8a8f9c'); for (let x = 1; x < 13; x += 2) R(x, 1, 1, 6, '#6b707c'); R(1, 6, 12, 1, '#8a8f9c'); R(0, 0, 2, 1, '#8a8f9c'); R(2, 7, 1, 2, '#8a8f9c'); R(11, 7, 1, 2, '#8a8f9c'); R(2, 9, 2, 2, '#1c1d22'); R(10, 9, 2, 2, '#1c1d22'); }),
  crystal: rectSpr(9, 12, R => { R(3, 1, 3, 11, '#15171d'); R(4, 2, 1, 9, '#c9f3ff'); R(3, 3, 1, 8, '#6cc6d6'); R(5, 4, 1, 7, '#3f8a99'); R(0, 6, 3, 6, '#15171d'); R(1, 7, 1, 5, '#6cc6d6'); R(6, 7, 3, 5, '#15171d'); R(7, 8, 1, 4, '#4fa3b3'); }),
  ashrock: rectSpr(18, 10, R => { R(1, 3, 16, 7, '#15171d'); R(2, 3, 14, 6, '#46404f'); R(2, 3, 14, 1, '#5d5767'); R(4, 1, 7, 3, '#15171d'); R(5, 1, 5, 2, '#524c5c'); }),
};

// 地面纹理（可平铺）
function makeTile(kind) {
  const N = 128, s = PX; const c = document.createElement('canvas'); c.width = c.height = N * s; const g = c.getContext('2d');
  let sd = { outer: 11, road: 23, center: 37, deep: 51 }[kind]; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const P = { outer: ['#40453b', '#4a4f43', '#373b32', '#2c2f29'], road: ['#30333a', '#383b42', '#2a2c32', '#24262b'], center: ['#3d3f4b', '#454756', '#35373f', '#2c2e37'], deep: ['#38333f', '#433d4b', '#2e2a35', '#25222b'] }[kind];
  g.fillStyle = P[0]; g.fillRect(0, 0, N * s, N * s);
  const dot = (x, y, col) => { g.fillStyle = col; g.fillRect((((x | 0) % N) + N) % N * s, (((y | 0) % N) + N) % N * s, s, s); };
  for (let i = 0; i < 26; i++) { const cx = r() * N, cy = r() * N, rad = 2 + r() * 6, col = P[r() < 0.5 ? 1 : 2]; for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) if (x * x + y * y <= rad * rad && r() < 0.75) dot(cx + x, cy + y, col); }
  for (let i = 0; i < 1300; i++) dot(r() * N, r() * N, P[1 + (r() * 3 | 0)]);
  for (let i = 0; i < 7; i++) { let x = r() * N, y = r() * N, a = r() * 6.28; const n = 16 + r() * 22; for (let k = 0; k < n; k++) { dot(x, y, P[3]); a += (r() - 0.5) * 0.9; x += Math.cos(a); y += Math.sin(a); } }
  if (kind === 'outer') for (let i = 0; i < 46; i++) { const x = r() * N, y = r() * N, gc = r() < 0.5 ? '#5a6542' : '#4c5639'; dot(x, y, gc); dot(x + 1, y - 1, gc); dot(x - 1, y - 1, gc); dot(x, y - 2, '#6a7650'); }
  if (kind === 'center') { g.fillStyle = 'rgba(28,29,36,.6)'; for (let i = 0; i < N; i += 16) { g.fillRect(i * s, 0, s, N * s); g.fillRect(0, i * s, N * s, s); } for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(70,110,150,.22)'; g.beginPath(); g.ellipse(r() * N * s, r() * N * s, (6 + r() * 10) * s, (3 + r() * 5) * s, 0, 0, 6.283); g.fill(); } }
  if (kind === 'deep') for (let i = 0; i < 12; i++) { const x = r() * N, y = r() * N; dot(x, y, '#5f97a4'); dot(x, y - 1, '#3f6a75'); }
  if (kind === 'road') { g.fillStyle = 'rgba(170,150,90,.5)'; for (let x = 0; x < N; x += 32) g.fillRect(x * s, (N / 2 | 0) * s, 16 * s, 2 * s); }
  return c;
}
const TILE_IMG = [makeTile('outer'), makeTile('center'), makeTile('deep')], ROAD_IMG = makeTile('road');
let TILE_PAT = null, ROAD_PAT = null;

// 灰潮的雾：可平铺的平滑噪声
const FOG = (() => {
  const n = 64, G = 8, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'); const img = g.createImageData(n, n);
  const grid = []; for (let i = 0; i < G * G; i++) grid.push(Math.random());
  const at = (i, j) => grid[(((j % G) + G) % G) * G + (((i % G) + G) % G)];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const fx = x / n * G, fy = y / n * G, i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const v = (at(i, j) * (1 - sx) + at(i + 1, j) * sx) * (1 - sy) + (at(i, j + 1) * (1 - sx) + at(i + 1, j + 1) * sx) * sy;
    const o = (y * n + x) * 4; img.data[o] = 110; img.data[o + 1] = 120; img.data[o + 2] = 150; img.data[o + 3] = Math.max(0, v - 0.3) * 200;
  }
  g.putImageData(img, 0, 0); return c;
})();
const LCOL = { lantern: '255,192,122', lamp: '255,158,78', beacon: '255,194,126', violet: '170,135,255', cyan: '110,210,255', red: '255,92,76', green: '140,232,130', white: '255,246,232', ember: '255,140,60', moon: '150,170,255' };
const LSPR = {}; function lightSpr(k) { if (LSPR[k]) return LSPR[k]; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), rgb = LCOL[k] || LCOL.white; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  [[0, 1], [0.15, 0.82], [0.35, 0.5], [0.6, 0.2], [0.82, 0.05], [1, 0]].forEach(([t, a]) => gr.addColorStop(t, `rgba(${rgb},${a})`)); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return LSPR[k] = c; }
const SHD = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 32; const g = c.getContext('2d'); const lg = g.createLinearGradient(0, 0, 128, 0); lg.addColorStop(0, 'rgba(4,5,12,0.9)'); lg.addColorStop(0.55, 'rgba(4,5,12,0.4)'); lg.addColorStop(1, 'rgba(4,5,12,0)'); g.fillStyle = lg; g.fillRect(0, 0, 128, 32);
  g.globalCompositeOperation = 'destination-in'; g.scale(1, 0.25); const rg = g.createRadialGradient(8, 64, 0, 8, 64, 124); rg.addColorStop(0, '#000'); rg.addColorStop(0.75, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); return c; })();
const TONE = (() => { const n = 32, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), im = g.createImageData(n, n); let sd = 777; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; const G = 4, grid = []; for (let i = 0; i < G * G; i++) grid.push(r());
  const at = (i, j) => grid[((j % G + G) % G) * G + ((i % G + G) % G)];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const fx = x / n * G, fy = y / n * G, i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const v = (at(i, j) * (1 - sx) + at(i + 1, j) * sx) * (1 - sy) + (at(i, j + 1) * (1 - sx) + at(i + 1, j + 1) * sx) * sy, o = (y * n + x) * 4, L = 175 + v * 80; im.data[o] = L; im.data[o + 1] = L; im.data[o + 2] = Math.min(255, L + 8); im.data[o + 3] = 255; }
  g.putImageData(im, 0, 0); return c; })();
let TONE_PAT = null;
// 地面贴花：裂缝、油污、落叶、纸屑、井盖、苔藓、碎砖、积水、深处发光菌
const DSPR = (() => { let sd = 99; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; const D = {};
  const mk = (w, h, fn) => rectSpr(w, h, fn, PX, true);
  D.crack = [0, 1, 2].map(() => mk(24, 14, R => { let x = 2, y = 7 + (r() * 4 - 2) | 0; for (let i = 0; i < 20; i++) { R(x, y, 1, 1, 'rgba(10,11,15,.45)'); if (r() < 0.25) R(x, y + 1, 1, 1, 'rgba(10,11,15,.28)'); x++; y += r() < 0.3 ? -1 : r() < 0.3 ? 1 : 0; y = Math.max(1, Math.min(12, y)); if (r() < 0.12) { let bx = x, by = y; for (let k = 0; k < 4; k++) { by += r() < 0.5 ? -1 : 1; bx++; R(bx, by, 1, 1, 'rgba(10,11,15,.32)'); } } } }));
  D.oil = [0, 1].map(() => mk(16, 9, R => { for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = r() * 0.9; R(8 + Math.cos(a) * d * 7 | 0, 4 + Math.sin(a) * d * 4 | 0, 2, 1, 'rgba(8,8,14,.35)'); } R(6, 3, 2, 1, 'rgba(120,90,160,.18)'); R(9, 5, 2, 1, 'rgba(80,140,150,.15)'); }));
  D.leaves = [0, 1].map(() => mk(14, 10, R => { for (let i = 0; i < 9; i++) R(r() * 13 | 0, r() * 9 | 0, 1 + (r() < 0.4), 1, ['#7a4a26', '#9a6a2c', '#5e3a22', '#8a7a3a'][r() * 4 | 0]); }));
  D.paper = [0, 1].map(() => mk(6, 5, R => { R(0, 1, 5, 3, '#8c8a82'); R(1, 1, 3, 1, '#b2afa4'); R(1, 2, 3, 1, '#77756e'); }));
  D.manhole = [mk(12, 7, R => { R(2, 0, 8, 7, '#202228'); R(1, 1, 10, 5, '#202228'); R(3, 1, 6, 5, '#3c3f47'); R(2, 2, 8, 3, '#3c3f47'); for (let x = 3; x < 10; x += 2) R(x, 2, 1, 3, '#2a2c33'); R(3, 1, 6, 1, '#555963'); })];
  D.moss = [0, 1].map(() => mk(14, 8, R => { for (let i = 0; i < 26; i++) R(r() * 13 | 0, r() * 7 | 0, 1, 1, ['#4f6a3a', '#5f7c42', '#3e5530'][r() * 3 | 0]); }));
  D.brick = [0, 1].map(() => mk(14, 8, R => { for (let i = 0; i < 5; i++) { const x = r() * 11 | 0, y = r() * 6 | 0; R(x, y, 3, 2, '#5a3c34'); R(x, y, 3, 1, '#7a5448'); } }));
  D.arrow = [mk(10, 16, R => { const c = 'rgba(190,175,130,.38)'; R(4, 5, 2, 11, c); R(2, 4, 6, 1, c); R(3, 3, 4, 1, c); R(4, 2, 2, 1, c); })];
  D.fungus = [0, 1].map(() => mk(10, 7, R => { for (let i = 0; i < 6; i++) { const x = r() * 8 | 0, y = 2 + r() * 4 | 0; R(x, y, 1, 2, '#2b3f47'); R(x - (r() < 0.5), y - 1, 2, 1, r() < 0.5 ? '#7fe3f0' : '#5fc2d6'); } }));
  return D; })();
const CUT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.9)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c; })();
let VIG = null;
function vignette() { if (VIG && VIG.width === cv.width && VIG.height === cv.height) return VIG; VIG = document.createElement('canvas'); VIG.width = cv.width; VIG.height = cv.height; const g = VIG.getContext('2d'); const gr = g.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.38, cv.width / 2, cv.height / 2, Math.hypot(cv.width, cv.height) * 0.55); gr.addColorStop(0, 'rgba(6,8,14,0)'); gr.addColorStop(1, 'rgba(6,8,14,0.6)'); g.fillStyle = gr; g.fillRect(0, 0, VIG.width, VIG.height); return VIG; }

// 环境粒子：飘落的灰烬、提灯里升起的火星
function updAmbient(dt) {
  const A = S.amb || (S.amb = []);
  let ash = 0; for (const q of A) if (!q.k) ash++;
  for (let i = 0; i < 3 && ash < 110; i++, ash++) A.push({ x: camX + Math.random() * (VW + 200) - 100, y: camY - 30 + Math.random() * VH, vx: rand(10, 24), vy: rand(12, 26), t: rand(4, 7), life: 7, k: 0, s: Math.random() < 0.3 ? 3 : 2 });
  if (Math.random() < dt * 16) { const p = S.player; A.push({ x: p.x + rand(-0.6, 0.6) * S.lr, y: p.y + rand(-0.4, 0.4) * S.lr, vx: rand(-6, 6), vy: rand(-34, -14), t: rand(1.2, 2.6), life: 2.6, k: 1, s: 2 }); }
  for (const q of A) { q.t -= dt; q.x += q.vx * dt + (q.k ? Math.sin(S.t * 3 + q.y * 0.05) * 10 * dt : 0); q.y += q.vy * dt; }
  S.amb = A.filter(q => q.t > 0);
}

