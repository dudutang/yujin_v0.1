// ================= 基础 =================
const M = 32;                       // 1 米 = 32 px
const CH = 24 * M; // 区块边长：世界无限，按需生成    // 地图：无限，按区块生成
const $ = s => document.querySelector(s);
const cv = $('#game'), ctx = cv.getContext('2d');
const dark = document.createElement('canvas'), dctx = dark.getContext('2d'), lm = document.createElement('canvas'), lctx = lm.getContext('2d'), lm2 = document.createElement('canvas'), lctx2 = lm2.getContext('2d');
let DPR = 1, ZOOM = 1, VW = 0, VH = 0, SW = 0, SH = 0;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  SW = innerWidth; SH = innerHeight;
  cv.width = SW * DPR; cv.height = SH * DPR;
  cv.style.width = SW + 'px'; cv.style.height = SH + 'px';
  ZOOM = Math.max(0.6, Math.min(1.5, Math.min(SW / 1200, SH / 720)));
  VW = SW / ZOOM; VH = SH / ZOOM;
  dark.width = Math.ceil(SW / 2); dark.height = Math.ceil(SH / 2); lm.width = lm2.width = dark.width; lm.height = lm2.height = dark.height;
}
addEventListener('resize', resize); resize();

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const d2 = (a, b) => { const dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; };
const pickU = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
function pickW(a, wf) { let s = 0; const w = a.map(x => { const v = wf(x); s += v; return v; }); let r = Math.random() * s; for (let i = 0; i < a.length; i++) { r -= w[i]; if (r <= 0) return a[i]; } return a[a.length - 1]; }
const fmt = s => { s = Math.max(0, Math.floor(s)); return (s / 60 | 0) + ':' + String(s % 60).padStart(2, '0'); };
const median = a => { if (!a.length) return 0; const b = a.slice().sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };

