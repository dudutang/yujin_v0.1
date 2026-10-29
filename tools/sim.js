// bot 快进模拟：node tools/sim.js [局数] [职业,职业]   例：node tools/sim.js 6 arc,warrior
// 需要 playwright（npm i 之后 npx playwright install chromium）
const { chromium } = require('playwright'), path = require('path');
const N = +(process.argv[2] || 6), CLS = (process.argv[3] || 'arc,warrior').split(','), FILE = path.join(__dirname, '../dist/index.html');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + FILE); await page.waitForTimeout(300);
  const res = await page.evaluate(([N, CLS]) => {
    const out = {};
    for (const cls of CLS) {
      const rows = [];
      for (let i = 0; i < N; i++) {
        Object.assign(window, { __bot: true, __botFast: true, __botCls: cls, __botBrawl: cls === 'warrior', __botPick: 'random', __botConc: [100, 115, 130][i % 3], __botPlan: [150, 330], __lastRun: null });
        __ember.start(); let minHp = 1;
        while (__ember.mode() === 'play' && __ember.state().t < 900) { __ember.sim(2); const S = __ember.state(); minHp = Math.min(minHp, S.player.hp / __ember.D().maxHp); }
        const R = window.__lastRun || { t: __ember.state().t, level: __ember.state().player.lvl }, S = __ember.state();
        rows.push({ o: R.outcome || 'timeout', t: Math.round(R.t), lv: R.level, conc: R.conc, kills: S.stats.kills, gods: (S.gods || []).join('+'), legend: Object.keys(S.bl || {}).filter(k => k.endsWith('legend')).join(','), react: Object.values(S.stats.reactions).reduce((a, b) => a + b, 0), minHp: +minHp.toFixed(2), dist: Math.round(Math.hypot(S.player.x, S.player.y) / 32) });
      }
      out[cls] = rows;
    }
    return out;
  }, [N, CLS]);
  for (const c in res) {
    const r = res[c], avg = k => (r.reduce((a, x) => a + (x[k] || 0), 0) / r.length).toFixed(0);
    console.log(`== ${c}: 倒下 ${r.filter(x => x.o === 'dead').length}/${r.length} · 平均 ${avg('t')} 秒 · ${avg('lv')} 级 · 反应 ${avg('react')} 次/局`);
    for (const x of r) console.log('  ', JSON.stringify(x));
  }
  console.log(errs.length ? '页面错误：\n' + errs.slice(0, 8).join('\n') : '页面错误：无');
  await b.close(); if (errs.length) process.exit(1);
})();
