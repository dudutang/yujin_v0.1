// ================= 视觉效果 =================
function addArc(x1, y1, x2, y2, color, life = 0.12, w = 1.5) { if (arcs.length < 220) arcs.push({ x1, y1, x2, y2, color, t: life, life, w }); }
function addRing(x, y, r, color, life = 0.35) { if (rings.length < 80) rings.push({ x, y, r, color, t: life, life }); }
function burst(x, y, color, n = 8, spd = 90) { for (let i = 0; i < n && parts.length < 500; i++) { const a = Math.random() * 6.283, s = rand(0.3, 1) * spd; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: rand(0.3, 0.7), life: 0.7, c: color, s: rand(1.5, 3) }); } }
function addNum(x, y, v, color) { if (nums.length > 70) nums.shift(); nums.push({ x: x + rand(-6, 6), y: y - 10, v: Math.round(v), t: 0.6, c: color }); }
function banner(t1, t2, color, dur) { $('#b1').textContent = t1; $('#b1').style.color = color; $('#b2').textContent = t2 || ''; $('#banner').classList.add('on'); bannerT = dur || 2.4; }

