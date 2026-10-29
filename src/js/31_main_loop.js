// ================= 主循环 =================
let last = performance.now();
function frame(now) {
  const rdt = Math.min(0.05, (now - last) / 1000); last = now;
  if (mode === 'play' && S) { if (hitStop > 0) hitStop -= rdt; else { const ts = slowT > 0 ? 0.3 : 1; if (slowT > 0) slowT -= rdt; update(rdt * ts); } }
  render(); hudTick(rdt); musicTick(rdt);
  requestAnimationFrame(frame);
}
titleScreen();
requestAnimationFrame(frame);
})();
