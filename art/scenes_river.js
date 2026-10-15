/* 背景素材 · 赤水 / 娄山关 / 金沙江 / 彝海 / 大渡河 / 泸定桥（7 张）
 * 文件所有权：root。1920×1080，立体几何 low-poly。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P;
  var ART = G.ART = G.ART || {};
  ART.scenes = ART.scenes || {};
  var W = 1920, H = 1080;

  function plankBridge(x0, x1, y, th, deck, planks, seed) {
    var rng = GEO.RNG(seed || 'pb'), s = '';
    for (var i = 0; i < planks; i++) {
      var t0 = i / planks, t1 = (i + 1) / planks;
      var ax = GEO.lerp(x0, x1, t0), bx = GEO.lerp(x0, x1, t1);
      var yy = y + Math.sin(t0 * 3.1) * 3;
      s += GEO.facet([[ax, yy], [bx, yy], [bx, yy + th], [ax, yy + th]],
        GEO.mul(deck, 0.86 + rng() * 0.3), { light: 0.12, hl: 0.34, dark: 0.12, dl: 0.28, sw: 0.5 });
    }
    return s;
  }
  function boulder(x, y, r, color, seed) {
    var rng = GEO.RNG(seed || 'bd');
    var pts = GEO.jitter(GEO.ngon(x, y - r * 0.5, r, 7, rng() * 2, 0.72), rng, r * 0.14);
    return GEO.facet(pts, color, { light: 0.12, hl: 0.34, dark: 0.12, dl: 0.3, sw: 0.7 });
  }

  /* ------------------------------------------------------- 赤水河 */
  ART.scenes['bg_chishui'] = function () {
    var s = [], rng = GEO.RNG('cs');
    s.push(GEO.sky(W, H, P.sky.overcast, { horizon: 470 }));
    s.push(GEO.cloudBank(W, 150, '#aab2ba', { seed: 'cs-cl', count: 7, opacity: 0.45 }));
    /* 远处峡口 */
    s.push(GEO.mountainRange(W, 470, P.ramp(P.rockRed, 0.16), { amp: 150, segs: 14, seed: 'cs-ridge', light: 0.05 }));
    /* 红褐色河水：一直顶到远山脚下 */
    s.push(GEO.waterBand(W, 466, 820, P.waterRed, { seed: 'cs-water', streaks: 210 }));
    for (var i = 0; i < 16; i++) {
      var rx = rng.range(0, W), ry = rng.range(480, 800);
      s.push(GEO.poly([[rx, ry], [rx + rng.range(40, 150), ry], [rx + rng.range(30, 130), ry + 6], [rx - 8, ry + 6]], P.ramp(P.sand, 0.6), { opacity: rng.range(0.2, 0.45) }));
    }
    /* 近景峡谷两壁：夹住画面 */
    s.push(GEO.cliffWall(-160, 430, 250, H, P.ramp(P.rockRed, 0.3), { seed: 'cs-left', cols: 9 }));
    s.push(GEO.cliffWall(1490, W + 160, 220, H, P.ramp(P.rockRed, 0.26), { seed: 'cs-right', cols: 9 }));
    s.push(GEO.mistBand(W, 460, 110, '#c6c3bb', { op: 0.4 }));
    /* 渡口石阶 */
    s.push(GEO.stairs(960, 820, 420, 130, 9, P.ramp(P.stone, 0.4)));
    /* 木船与渡口 */
    s.push(GEO.woodenBoat(660, 700, 150, P.ramp(P.wood, 0.3), { oars: true }));
    s.push(GEO.woodenBoat(1320, 742, 130, P.ramp(P.wood, 0.24), { oars: true, mast: true, sail: P.ramp(P.cloth, 0.5) }));
    s.push(GEO.groundBand(W, 816, H, P.ramp(P.earthRed, 0.24), { seed: 'cs-gnd', rows: 5, patches: 120 }));
    var bs = GEO.RNG('cs-bd');
    for (var b = 0; b < 26; b++) s.push(boulder(bs.range(-40, W + 40), bs.range(830, H), bs.range(14, 52), GEO.mul(P.ramp(P.rockRed, 0.36), 0.8 + bs() * 0.5), 'csb' + b));
    s.push(GEO.shrubRow(W, 806, P.ramp(P.shrub, 0.3), 'cs-shrub', 26, 40));
    s.push(GEO.crowd(26, { x0: 240, x1: 1700, y0: 880, y1: 1046, h: 250, color: '#6d5f52', seed: 'cs-ppl', stride: 0.7 }));
    s.push(GEO.mistBand(W, 470, 130, '#b9c0c6', { op: 0.3 }));
    s.push(GEO.vignette(W, H, 0.5));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 土城 */
  ART.scenes['bg_tucheng'] = function () {
    var s = [], rng = GEO.RNG('tc');
    s.push(GEO.sky(W, H, P.sky.overcast, { horizon: 520 }));
    s.push(GEO.cloudBank(W, 190, '#9aa2aa', { seed: 'tc-cl', count: 8, opacity: 0.5 }));
    s.push(GEO.cliffWall(-80, W + 80, 500, 600, P.ramp(P.rockWarm, 0.3), { seed: 'tc-far', cols: 11 }));
    s.push(GEO.groundBand(W, 566, H, P.ramp(P.earth, 0.28), { seed: 'tc-gnd', rows: 5, patches: 110 }));
    /* 街心土路 */
    s.push(GEO.facet([[700, 590], [1220, 590], [1720, H], [180, H]], P.ramp(P.earth, 0.4), { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.2 }));
    /* 两侧土墙房屋（近大远小） */
    var hx = [120, 380, 1680, 1420];
    for (var i = 0; i < 4; i++) {
      var t = i < 2 ? i / 2 : (i - 2) / 2;
      var near = i % 2 === 0;
      var x = near ? (170 + t * -40) : (1750 - t * 40);
      s.push(GEO.house(x, 780 + (near ? 90 : 60), 430 - t * 120, 380 - t * 130, 190, P.ramp(P.brick, 0.42), P.ramp(P.tileDark, 0.3),
        { door: true, windows: 2, roofH: 86, eave: 26 }));
    }
    /* 硝烟 */
    s.push(GEO.smokePlume(560, 560, 420, '#8f8880', 'tc-sm1'));
    s.push(GEO.smokePlume(1420, 548, 460, '#867f78', 'tc-sm2'));
    /* 断墙、门板、碎木 */
    var d = GEO.RNG('tc-deb');
    for (var k = 0; k < 22; k++) {
      var dx = d.range(200, 1720), dy = d.range(760, H - 10), dw = d.range(30, 110);
      s.push(GEO.facet([[dx, dy], [dx + dw, dy - 8], [dx + dw, dy + 10], [dx, dy + 18]],
        GEO.mul(P.ramp(P.wood, 0.34), 0.8 + d() * 0.4), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26, sw: 0.6 }));
    }
    s.push(GEO.crowd(30, { x0: 260, x1: 1660, y0: 860, y1: 1050, h: 250, color: '#66594c', seed: 'tc-ppl', stride: 0.8 }));
    s.push(GEO.vignette(W, H, 0.56));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 娄山关 */
  ART.scenes['bg_loushanguan'] = function () {
    var s = [], rng = GEO.RNG('lsg');
    s.push(GEO.sky(W, H, P.sky.dusk, { horizon: 620, glow: P.ramp(P.flame, 0.7) }));
    s.push(GEO.sunDisc(1420, 300, 74, P.ramp(P.lamp, 0.86), { hr: 6 }));
    s.push(GEO.cloudBank(W, 250, '#c98f74', { seed: 'lsg-cl', count: 8, opacity: 0.42 }));
    /* 远山三重 */
    s.push(GEO.mountainRange(W, 560, P.ramp(P.rock, 0.24), { amp: 250, segs: 15, seed: 'lsg-f1', grad: '#6b5a6e', light: 0.06 }));
    s.push(GEO.mistBand(W, 520, 160, '#c9a48c', { op: 0.5 }));
    s.push(GEO.mountainRange(W, 630, P.ramp(P.karst, 0.34), { amp: 200, segs: 13, seed: 'lsg-f2', grad: '#7d6f78' }));
    s.push(GEO.mistBand(W, 610, 130, '#d3b39a', { op: 0.42 }));
    /* 雄关主体：绝壁与关隘 */
    s.push(GEO.cliffWall(-60, 560, 560, H, P.ramp(P.rock, 0.34), { seed: 'lsg-l', cols: 7 }));
    s.push(GEO.cliffWall(1360, W + 60, 540, H, P.ramp(P.rock, 0.3), { seed: 'lsg-r', cols: 7 }));
    s.push(GEO.cliffWall(500, 1420, 700, H, P.ramp(P.rock, 0.44), { seed: 'lsg-c', cols: 8 }));
    /* 石峰 */
    var pk = GEO.RNG('lsg-pk');
    for (var i = 0; i < 5; i++) {
      var px = 620 + i * 180, ph = pk.range(120, 250);
      s.push(GEO.facet([[px - 46, 780], [px + 46, 780], [px + 24, 780 - ph], [px - 30, 780 - ph - 20]], GEO.mul(P.ramp(P.rock, 0.5), 0.85 + pk() * 0.3),
        { light: 0.1, hl: 0.34, dark: 0.12, dl: 0.3, sw: 0.8 }));
    }
    /* 关楼与红旗 */
    s.push(GEO.gate(960, 792, 300, 170, P.ramp(P.brick, 0.4), { lamp: true }));
    s.push(GEO.flag(1092, 660, 190, 130, P.ramp(P.redFlag, 0.5), { emblem: P.ramp(P.gold, 0.6), poleW: 6 }));
    s.push(GEO.groundBand(W, 780, H, P.ramp(P.rock, 0.26), { seed: 'lsg-gnd', rows: 5, patches: 110 }));
    s.push(GEO.shrubRow(W, 790, P.ramp(P.shrub, 0.28), 'lsg-shrub', 30, 44));
    s.push(GEO.crowd(34, { x0: 300, x1: 1620, y0: 850, y1: 1050, h: 250, color: '#5e5a52', seed: 'lsg-ppl', stride: 0.95 }));
    s.push(GEO.embers(W, 700, 40, 'lsg-em', { color: P.ramp(P.flame, 0.8) }));
    s.push(GEO.vignette(W, H, 0.5, '#3a2418'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 金沙江·皎平渡 */
  ART.scenes['bg_jinsha'] = function () {
    var s = [], rng = GEO.RNG('js');
    s.push(GEO.sky(W, H, P.sky.clearDay, { horizon: 400 }));
    s.push(GEO.cloudBank(W, 150, '#e6f0f6', { seed: 'js-cl', count: 7, opacity: 0.4 }));
    s.push(GEO.cliffWall(-80, W + 80, 380, 520, P.ramp(P.rockRed, 0.34), { seed: 'js-far', cols: 13 }));
    s.push(GEO.mountainRange(W, 396, P.ramp(P.rockRed, 0.28), { amp: 190, segs: 15, seed: 'js-ridge' }));
    /* 深切峡谷两壁 */
    s.push(GEO.cliffWall(-140, 480, 430, H, P.ramp(P.rockRed, 0.24), { seed: 'js-l', cols: 8 }));
    s.push(GEO.cliffWall(1440, W + 140, 420, H, P.ramp(P.rockRed, 0.2), { seed: 'js-r', cols: 8 }));
    /* 江面 */
    s.push(GEO.waterBand(W, 500, 830, P.water, { seed: 'js-water', streaks: 200, cols: 24 }));
    s.push(GEO.waterReflection(560, 510, 800, 120, P.lightCool, { op: 0.3, seed: 'js-r1' }));
    /* 七条木船 */
    for (var b = 0; b < 7; b++) {
      var bx = 190 + b * 250 + rng.range(-40, 40), by = 620 + (b % 3) * 62;
      s.push(GEO.woodenBoat(bx, by, 150, P.ramp(P.wood, 0.34), { oars: b % 2 === 0 }));
    }
    /* 对岸渡口石阶 */
    s.push(GEO.stairs(1130, 520, 300, 110, 8, P.ramp(P.stone, 0.44)));
    s.push(GEO.groundBand(W, 822, H, P.ramp(P.rockWarm, 0.24), { seed: 'js-gnd', rows: 5, patches: 120 }));
    var bb = GEO.RNG('js-bd');
    for (var k = 0; k < 30; k++) s.push(boulder(bb.range(-40, W + 40), bb.range(850, H), bb.range(16, 60), GEO.mul(P.ramp(P.rockRed, 0.4), 0.8 + bb() * 0.5), 'jsb' + k));
    s.push(GEO.shrubRow(W, 826, P.ramp(P.shrub, 0.34), 'js-shrub', 22, 36));
    s.push(GEO.crowd(30, { x0: 200, x1: 1740, y0: 890, y1: 1052, h: 250, color: '#5f6455', seed: 'js-ppl', stride: 0.7 }));
    s.push(GEO.mistBand(W, 470, 120, '#c8dce8', { op: 0.34 }));
    s.push(GEO.vignette(W, H, 0.46));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 彝海 */
  ART.scenes['bg_yihai'] = function () {
    var s = [], rng = GEO.RNG('yh');
    s.push(GEO.sky(W, H, P.sky.dusk, { horizon: 520, glow: P.ramp(P.lamp, 0.5) }));
    s.push(GEO.cloudBank(W, 190, '#c69a92', { seed: 'yh-cl', count: 6, opacity: 0.4 }));
    s.push(GEO.sunDisc(400, 210, 58, P.ramp(P.lamp, 0.8), { hr: 5 }));
    s.push(GEO.mountainRange(W, 500, P.ramp(P.karst, 0.28), { amp: 210, segs: 15, seed: 'yh-far', grad: '#5d5a70', light: 0.07 }));
    /* 松林带 */
    var pt = GEO.RNG('yh-pine');
    for (var i = 0; i < 34; i++) {
      var px = 40 + i * 58 + pt.range(-24, 24);
      s.push(GEO.pineTree(px, 596 + pt.range(-10, 14), pt.range(120, 210), GEO.mul(P.ramp(P.pine, 0.4), 0.85 + pt() * 0.3), {}));
    }
    /* 高山湖泊 */
    s.push(GEO.lakeSurface(960, 716, 900, 168, [P.water[0], P.water[1], P.water[2], P.water[3]], 'yh-lake'));
    s.push(GEO.waterReflection(560, 640, 800, 130, P.ramp(P.lamp, 0.72), { op: 0.35, seed: 'yh-r1' }));
    s.push(GEO.waterReflection(1400, 636, 790, 110, P.ramp(P.flame, 0.7), { op: 0.28, seed: 'yh-r2' }));
    s.push(GEO.groundBand(W, 800, H, P.ramp(P.grass, 0.36), { seed: 'yh-gnd', rows: 5, patches: 120 }));
    s.push(GEO.grassTufts(W, 820, H, P.ramp(P.grass, 0.46), 'yh-grass', 300));
    /* 火把 */
    var glow = P.ramp(P.flame, 0.8);
    for (var t = 0; t < 8; t++) {
      var tx = 180 + t * 226;
      var id = 'yh-t' + t;
      s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(glow, 0.55)], [1, GEO.alpha(glow, 0)]])));
      s.push(GEO.circle(tx, 902, 120, 'url(#' + id + ')'));
      s.push(GEO.torch(tx, 986, 86));
    }
    /* 结盟的两方人马剪影 */
    s.push(GEO.silhouette(680, 1012, 300, '#2a2b2a', rng, 0.5, 'cap'));
    s.push(GEO.silhouette(742, 1020, 292, '#2a2b2a', rng, 0.5, 'cap'));
    s.push(GEO.silhouette(1160, 1010, 296, '#33302c', rng, 0.5, 'turban'));
    s.push(GEO.silhouette(1226, 1024, 286, '#33302c', rng, 0.5, 'turban'));
    s.push(GEO.crowd(24, { x0: 380, x1: 1560, y0: 900, y1: 1040, h: 220, color: '#3d3a34', seed: 'yh-ppl', stride: 0.4, hat: 'none' }));
    s.push(GEO.mistBand(W, 600, 140, '#c9b3ad', { op: 0.34 }));
    s.push(GEO.vignette(W, H, 0.5, '#2b1c24'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 大渡河·安顺场 */
  ART.scenes['bg_dadu'] = function () {
    var s = [], rng = GEO.RNG('dd');
    s.push(GEO.sky(W, H, P.sky.overcast, { horizon: 470 }));
    s.push(GEO.cloudBank(W, 180, '#a3abb3', { seed: 'dd-cl', count: 8, opacity: 0.5 }));
    s.push(GEO.cliffWall(-80, W + 80, 430, 560, P.ramp(P.rock, 0.3), { seed: 'dd-far', cols: 12 }));
    s.push(GEO.mountainRange(W, 424, P.ramp(P.rock, 0.26), { amp: 180, segs: 15, seed: 'dd-ridge' }));
    /* 对岸崖壁 */
    s.push(GEO.cliffWall(1150, W + 130, 400, 700, P.ramp(P.rock, 0.44), { seed: 'dd-right', cols: 7 }));
    /* 激流 */
    s.push(GEO.waterBand(W, 520, 830, P.water, { seed: 'dd-water', streaks: 300, cols: 26 }));
    for (var i = 0; i < 90; i++) {
      var wx = rng.range(0, W), wy = rng.range(540, 820);
      s.push(GEO.poly([[wx, wy], [wx + rng.range(30, 130), wy], [wx + rng.range(20, 110), wy + 5], [wx - 10, wy + 5]], '#e8f1f6', { opacity: rng.range(0.2, 0.6) }));
    }
    /* 渡船 */
    s.push(GEO.woodenBoat(1240, 720, 160, P.ramp(P.wood, 0.3), { oars: true }));
    s.push(GEO.woodenBoat(560, 668, 130, P.ramp(P.wood, 0.24), { oars: true }));
    /* 乱石滩 */
    s.push(GEO.groundBand(W, 824, H, P.ramp(P.rockWarm, 0.2), { seed: 'dd-gnd', rows: 5, patches: 130 }));
    var bb = GEO.RNG('dd-bd');
    for (var k = 0; k < 46; k++) s.push(boulder(bb.range(-40, W + 40), bb.range(846, H + 20), bb.range(20, 78), GEO.mul(P.ramp(P.rock, 0.42), 0.78 + bb() * 0.55), 'ddb' + k));
    s.push(GEO.crowd(28, { x0: 200, x1: 1720, y0: 900, y1: 1054, h: 250, color: '#5a6068', seed: 'dd-ppl', stride: 0.85 }));
    s.push(GEO.mistBand(W, 500, 150, '#b9c6ce', { op: 0.32 }));
    s.push(GEO.vignette(W, H, 0.52));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 泸定桥 */
  ART.scenes['bg_luding'] = function () {
    var s = [], rng = GEO.RNG('ld');
    s.push(GEO.sky(W, H, P.sky.storm, { horizon: 420 }));
    s.push(GEO.cloudBank(W, 150, '#5d6472', { seed: 'ld-cl', count: 9, opacity: 0.55 }));
    s.push(GEO.cliffWall(-80, W + 80, 300, 470, P.ramp(P.rock, 0.2), { seed: 'ld-far', cols: 13 }));
    /* 对岸桥楼 */
    s.push(GEO.cliffWall(1400, W + 160, 470, 660, P.ramp(P.rock, 0.34), { seed: 'ld-right', cols: 6 }));
    s.push(GEO.tower(1580, 470, 210, 250, P.ramp(P.brick, 0.34), P.ramp(P.tileDark, 0.3), { tiers: 3 }));
    s.push(GEO.cliffWall(-160, 500, 490, 680, P.ramp(P.rock, 0.3), { seed: 'ld-left', cols: 6 }));
    s.push(GEO.tower(320, 490, 200, 235, P.ramp(P.brick, 0.3), P.ramp(P.tileDark, 0.26), { tiers: 3 }));
    /* 急流 */
    s.push(GEO.waterBand(W, 640, H, P.water, { seed: 'ld-water', streaks: 300, cols: 20 }));
    for (var i = 0; i < 110; i++) {
      var wx = rng.range(0, W), wy = rng.range(660, H);
      s.push(GEO.poly([[wx, wy], [wx + rng.range(34, 150), wy], [wx + rng.range(24, 120), wy + 6], [wx - 12, wy + 6]], '#e6eff5', { opacity: rng.range(0.22, 0.62) }));
    }
    /* 十三根铁索：抽掉桥板，只剩几段残板 */
    s.push(GEO.ropeBridge(400, 520, 1520, 476, 130, P.ramp(P.wood, 0.34), {
      decks: 26, gaps: [3, 4, 5, 9, 10, 11, 12, 13, 16, 17, 18, 22, 23],
      deckColor: P.ramp(P.wood, 0.4), cable: P.ramp(P.metal, 0.34)
    }));
    for (var c = 0; c < 5; c++) {
      var tt = 0.18 + c * 0.17;
      s.push(GEO.pline([GEO.ptAt([[400, 520], [960, 588], [1520, 476]], Math.max(0, tt - 0.06)),
        GEO.ptAt([[400, 520], [960, 588], [1520, 476]], tt)], P.ramp(P.metal, 0.46), { sw: 2, opacity: 0.8 }));
    }
    s.push(GEO.mistBand(W, 560, 140, '#8d97a2', { op: 0.4 }));
    s.push(GEO.vignette(W, H, 0.58, '#101822'));
    return GEO.doc(W, H, s.join(''));
  };
})();
