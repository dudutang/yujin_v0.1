// 截图检查：node tools/shots.js  → shots/ 下生成升级面板、战斗、全图、暂停界面
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const FILE = path.join(__dirname, '../dist/index.html'), OUT = path.join(__dirname, '../shots');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + FILE); await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/title.png' });
  // 第一次灯魂来访
  await page.evaluate(() => { window.__botStill = true; __ember.start('arc'); let n = 0; while (__ember.mode() === 'play' && n++ < 2000) __ember.sim(1); });
  await page.waitForTimeout(300); await page.screenshot({ path: OUT + '/levelup.png' });
  // 战斗中（bot 跑 4 分钟）
  await page.evaluate(() => { window.__botStill = false; Object.assign(window, { __bot: true, __botFast: true, __botCls: 'arc', __botPick: 'random', __botConc: 130 }); __ember.start('arc'); __ember.sim(240); window.__botFast = false; });
  await page.waitForTimeout(1500); await page.screenshot({ path: OUT + '/combat.png' });
  await page.keyboard.press('Tab'); await page.waitForTimeout(300); await page.screenshot({ path: OUT + '/map.png' });
  await page.keyboard.press('Tab'); await page.keyboard.press('Escape'); await page.waitForTimeout(300); await page.screenshot({ path: OUT + '/pause.png', fullPage: true });
  console.log('截图在 shots/ 下', errs.length ? '\n页面错误：' + errs.join('\n') : '· 页面错误：无');
  await b.close(); if (errs.length) process.exit(1);
})();
