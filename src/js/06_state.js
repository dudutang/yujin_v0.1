// ================= 运行状态 =================
let S = null, D = {}, enemies = [], items = [], zones = [], pins = [], arcs = [], rings = [], parts = [], nums = [];
let mode = 'title', slowT = 0, bannerT = 0, hudDirty = true, hitStop = 0, sparks = [], ash = [];
function stopFor(t) { if (!window.__botFast) hitStop = Math.min(0.09, Math.max(hitStop, t)); }
const keys = new Set();

function newRun(cls, aspect) {
  enemies = []; items = []; zones = []; pins = []; arcs = []; rings = []; parts = []; nums = [];
  S = {
    t: 0, conc: 0, spawnAcc: 0, waveT: 50, eliteT: 75, waveSeen: new Set(), surgeT: 0, pact: {}, pois: [], chal: null, scavBought: 0, lucky3: 0, eyes: [], eyeDone: new Set(), tideFreeze: 0, boss: null, lightTickT: 0, stageSeen: new Set(), chestsOpened: 0, nestNear: 0, hitCount: 0, pity: 0, firstChoice: true,
    player: { x: 1.2 * M, y: 0.8 * M, r: 11, hp: 100, xp: 0, lvl: 1, iframes: 0, shield: 0, shieldT: 0, overload: 0, halfFired: false, lightBoostT: 0, afterHeatT: 0, hurtFlash: 0, moving: false, fx: 1, fy: 0 },
    skills: [], passives: {}, bless: {}, bl: {}, gods: [], alts: 2, atk: null, lamp: null, pets: [], sp: [], visit: null, godHist: [], keepGod: false,
    pendingLv: 0, branchQueue: [], delayed: [], loot: { scrap: 0, part: 0 }, lootAtZero: null, usedSecond: false,
    lamps: [], seed: (Math.random() * 2147483000) | 0, altarAng: Math.random() * 6.283, ckSeen: new Set(),
    beacon: { x: 0, y: 0, r: 6 * M }, altar: { x: 0, y: 0, used: false },
    hold: 0, holdTarget: null, shake: 0, lr: 4 * M, maxDepth: 0, flashes: [],
    rerolls: (hasT('reroll') ? 1 : 0) + (unl('reroll') ? 1 : 0) + gearSum('rr'), bans: 2 + (hasT('ban') ? 1 : 0) + gearSum('ban'), banned: new Set(), tapeItems: [], runTapes: [], tapeT: 25, deepEntered: false,
    stats: { kills: 0, dmg: 0, taken: 0, reactions: { 爆燃: 0, 电离: 0, 熔毁: 0, 碎裂: 0 }, breaks: 0, nests: 0 },
    breaks: [], chests: [],
    run: { v: 'proto-0.7', shrines: [], started: new Date().toISOString(), tech: Object.keys(META.tech), choices: [], ignitions: [], branches: [], firstReaction: null, outcome: null, rerollsUsed: 0, bansUsed: 0 },
  };
  recalc(); S.player.hp = D.maxHp; hudDirty = true;
  S.cls = 'arc'; S.run.cls = 'arc';
  if (cls === 'warrior') { initWarrior(); recalc(); S.player.hp = D.maxHp; } else { S.alts += gearSum('alt'); }
  S.altar.x = Math.cos(S.altarAng) * 125 * M; S.altar.y = Math.sin(S.altarAng) * 125 * M;
  { const a = S.altarAng + 2.1 + Math.random() * 2; S.tapeItems.push(makeTape(Math.cos(a) * 70 * M, Math.sin(a) * 70 * M, false)); }
  CHUNKS.clear(); S.lastCk = null; populateMap();
}
const lv = id => (S.pval && S.pval[id] != null) ? S.pval[id] : (S.passives[id] || 0);
const plv = id => S.passives[id] || 0;
const bl = id => S.bless[id] || 0;
const skillOf = id => S.skills.find(s => s.id === id);
const sl = id => { const s = skillOf(id); return s ? s.lvl : 0; };
