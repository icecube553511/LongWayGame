/* 背景素材 · 雪山 / 草地 / 腊子口 / 陕北（8 张）
 * 文件所有权：root。1920×1080，立体几何 low-poly。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P;
  var ART = G.ART = G.ART || {};
  ART.scenes = ART.scenes || {};
  var W = 1920, H = 1080;
  var R = GEO.ramp, MUL = GEO.mul, LT = GEO.lighten;

  /* ------------------------------------------------------- 夹金山 */
  ART.scenes['bg_snow_mountain'] = function () {
    var s = [], rng = GEO.RNG('snow');
    s.push(GEO.sky(W, H, P.sky.snow, { horizon: 560 }));
    s.push(GEO.cloudBank(W, 200, '#eef4f9', { seed: 'snow-cl', count: 7, opacity: 0.45 }));
    s.push(GEO.sunDisc(1500, 210, 44, '#f2f7fb', { hr: 3.4, op: 0.5 }));
    /* 雪山三重 */
    s.push(GEO.mountainRange(W, 520, R(P.snow, 0.45), { amp: 300, segs: 14, seed: 'snow-f1', light: 0.14, snowcap: false, grad: '#9fb7cc' }));
    s.push(GEO.mistBand(W, 470, 140, '#e8f1f8', { op: 0.55 }));
    s.push(GEO.mountainRange(W, 600, R(P.snow, 0.62), { amp: 250, segs: 12, seed: 'snow-f2', light: 0.16, grad: '#c6d9e8' }));
    s.push(GEO.mistBand(W, 560, 150, '#eef5fb', { op: 0.5 }));
    /* 近景雪脊 */
    s.push(GEO.facet([[0, 700], [380, 640], [760, 700], [1100, 618], [1480, 690], [1860, 640], [1920, 700], [H, H], [0, H]],
      R(P.snow, 0.72), { light: 0.16, hl: 0.4, dark: 0.08, dl: 0.24, sw: 0.9 }));
    s.push(GEO.cliffWall(1120, 1840, 620, 980, R(P.ice, 0.5), { seed: 'snow-cl2', cols: 8 }));
    s.push(GEO.groundBand(W, 760, H, R(P.snow, 0.8), { seed: 'snow-gnd', rows: 5, patches: 130, op: 0.42 }));
    /* 冰川裂隙 */
    for (var i = 0; i < 5; i++) {
      var cx = 240 + i * 340 + rng.range(-50, 50);
      s.push(GEO.poly([[cx, 860], [cx + 90, 850], [cx + 60, 940], [cx - 30, 950]], R(P.ice, 0.3), { opacity: 0.75 }));
      s.push(GEO.poly([[cx + 20, 880], [cx + 70, 872], [cx + 50, 930], [cx + 2, 936]], R(P.ice, 0.14), { opacity: 0.8 }));
    }
    /* 结队上行的战士 */
    s.push(GEO.crowd(22, { x0: 500, x1: 1440, y0: 830, y1: 1000, h: 230, color: '#6b7482', seed: 'snow-ppl', stride: 0.55 }));
    s.push(GEO.poly([[0, 240], [W, 200], [W, H], [0, H]], '#eaf2fa', { opacity: 0.14 }));
    s.push(GEO.snowfall(W, H, 420, 'snow-fall'));
    s.push(GEO.mistBand(W, 640, 300, '#ffffff', { op: 0.28 }));
    s.push(GEO.vignette(W, H, 0.4, '#8ba6bd'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 懋功会师 */
  ART.scenes['bg_maogong'] = function () {
    var s = [], rng = GEO.RNG('mg');
    s.push(GEO.sky(W, H, P.sky.clearDay, { horizon: 430 }));
    s.push(GEO.cloudBank(W, 160, '#eaf4fa', { seed: 'mg-cl', count: 8, opacity: 0.5 }));
    s.push(GEO.mountainRange(W, 430, R(P.karst, 0.34), { amp: 230, segs: 15, seed: 'mg-far', grad: '#8fa7b4' }));
    s.push(GEO.mistBand(W, 420, 130, '#d6e4ee', { op: 0.45 }));
    /* 山城：层叠屋顶 */
    var rows = [{ y: 560, n: 11, h: 60, s: 1 }, { y: 660, n: 9, h: 78, s: 1.2 }, { y: 800, n: 7, h: 100, s: 1.5 }];
    rows.forEach(function (r, ri) {
      for (var i = 0; i < r.n; i++) {
        var x = 120 + i * (1700 / r.n) + rng.range(-30, 30);
        var w = 150 * r.s, hh = r.h * (0.9 + rng() * 0.4);
        s.push(GEO.house(x, r.y, w, hh, w * 0.66, R(P.plaster, 0.42 + ri * 0.06), R(P.tileDark, 0.28 + ri * 0.06),
          { door: ri === 2, windows: ri === 2 ? 2 : 0, roofH: hh * 0.52 }));
      }
    });
    s.push(GEO.groundBand(W, 846, H, R(P.earth, 0.36), { seed: 'mg-gnd', rows: 4, patches: 100 }));
    /* 会师旗队 */
    for (var f = 0; f < 6; f++) {
      var fx = 260 + f * 290;
      s.push(GEO.flag(fx, 900 + (f % 2) * 30, 210, 150, f % 3 === 0 ? R(P.red, 0.6) : R(P.redFlag, 0.5),
        { emblem: R(P.gold, 0.66), poleW: 6 }));
    }
    s.push(GEO.crowd(46, { x0: 60, x1: 1860, y0: 860, y1: 1060, h: 250, color: '#5f6858', seed: 'mg-ppl', stride: 0.5 }));
    s.push(GEO.crowd(26, { x0: 200, x1: 1720, y0: 560, y1: 620, h: 90, color: '#7a8272', seed: 'mg-far', stride: 0.6 }));
    s.push(GEO.mistBand(W, 560, 120, '#cfe0ea', { op: 0.3 }));
    s.push(GEO.vignette(W, H, 0.42));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 松潘草地 */
  ART.scenes['bg_grassland'] = function () {
    var s = [], rng = GEO.RNG('gl');
    s.push(GEO.sky(W, H, P.sky.grass, { horizon: 430 }));
    s.push(GEO.cloudBank(W, 170, '#aab4b8', { seed: 'gl-cl', count: 10, opacity: 0.55 }));
    s.push(GEO.mountainRange(W, 430, R(P.karst, 0.18), { amp: 90, segs: 16, seed: 'gl-far', grad: '#7d888c', light: 0.05 }));
    s.push(GEO.groundBand(W, 436, H, R(P.marsh, 0.36), { seed: 'gl-gnd', rows: 8, patches: 200, op: 0.4 }));
    /* 水洼 */
    var ponds = GEO.RNG('gl-pond');
    for (var i = 0; i < 46; i++) {
      var t = Math.pow(ponds(), 0.6);
      var py = GEO.lerp(452, H + 30, t);
      var px = ponds.range(-40, W + 40);
      var rx = GEO.lerp(50, 300, t) * ponds.range(0.6, 1.3);
      var ry = GEO.lerp(9, 44, t) * ponds.range(0.6, 1.2);
      s.push(GEO.poly(GEO.ngon(px, py, rx, 14, ponds() * 2, ry / rx), R(P.water, 0.24 + t * 0.2), { opacity: 0.72, stroke: null }));
      s.push(GEO.poly(GEO.ngon(px - rx * 0.12, py - ry * 0.2, rx * 0.6, 12, ponds() * 2, ry / rx), LT(R(P.water, 0.4), 0.3), { opacity: 0.22, stroke: null }));
    }
    /* 枯草 */
    s.push(GEO.grassTufts(W, 440, H + 20, R(P.grassDry, 0.3), 'gl-g', 700));
    /* 草甸墩 */
    var hum = GEO.RNG('gl-hum');
    for (var k = 0; k < 90; k++) {
      var t2 = Math.pow(hum(), 0.65);
      s.push(GEO.lotusHummock(hum.range(-30, W + 30), GEO.lerp(460, H + 20, t2), GEO.lerp(14, 66, t2),
        MUL(R(P.marsh, 0.44), 0.8 + hum() * 0.45), 'glh' + k));
    }
    /* 行军的纵队：长长的一列 */
    s.push(GEO.crowd(34, { x0: 260, x1: 1160, y0: 470, y1: 560, h: 74, color: '#5c6258', seed: 'gl-far', stride: 0.95, opacity: 0.7 }));
    s.push(GEO.crowd(30, { x0: 420, x1: 1560, y0: 700, y1: 880, h: 170, color: '#565c52', seed: 'gl-mid', stride: 0.9 }));
    s.push(GEO.crowd(18, { x0: 300, x1: 1700, y0: 940, y1: 1064, h: 250, color: '#4e544b', seed: 'gl-near', stride: 0.85 }));
    s.push(GEO.mistBand(W, 620, 260, '#a8b4b8', { op: 0.42 }));
    s.push(GEO.rainfall(W, H, 420, 'gl-rain', { color: '#c3ced4' }));
    s.push(GEO.vignette(W, H, 0.5, '#2c3436'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 腊子口 */
  ART.scenes['bg_lazikou'] = function () {
    var s = [], rng = GEO.RNG('lzk');
    s.push(GEO.sky(W, H, P.sky.overcast, { horizon: 300 }));
    s.push(GEO.cloudBank(W, 110, '#9aa3ab', { seed: 'lzk-cl', count: 6, opacity: 0.45 }));
    /* 一线天：两侧绝壁夹出很窄的天空 */
    s.push(GEO.cliffWall(-120, 700, 300, H + 60, R(P.rock, 0.3), { seed: 'lzk-l', cols: 10 }));
    s.push(GEO.cliffWall(1220, W + 120, 280, H + 60, R(P.rock, 0.26), { seed: 'lzk-r', cols: 10 }));
    s.push(GEO.mountainRange(700, 300, R(P.rock, 0.18), { amp: 130, segs: 8, seed: 'lzk-back', light: 0.05 }));
    /* 谷底河与木桥 */
    s.push(GEO.waterBand(W, 760, H, R(P.water, 0.28), { seed: 'lzk-water', streaks: 150 }));
    s.push(GEO.plankBridge(430, 1500, 742, 26, R(P.wood, 0.34), { planks: 22, rails: false }));
    for (var p = 0; p <= 8; p++) {
      var px = GEO.lerp(430, 1500, p / 8);
      s.push(GEO.facet([[px - 12, 760], [px + 12, 760], [px + 12, 900], [px - 12, 900]], R(P.timber, 0.26), { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.28 }));
    }
    /* 碉堡与铁丝网 */
    s.push(GEO.bunker(1560, 720, 240, 120, R(P.concrete, 0.28)));
    s.push(GEO.barbedWire(600, 1500, 700, 'lzk-w', 3));
    /* 崖上攀爬的小径与手榴弹爆点 */
    s.push(GEO.facet([[1180, 520], [1230, 500], [1250, 760], [1190, 780]], R(P.rock, 0.42), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.28 }));
    for (var k = 0; k < 7; k++) {
      var bx = 1300 + rng.range(-60, 60), by = 420 + k * 60;
      var id = 'lzk-x' + k;
      s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(R(P.flame, 0.9), 0.6)], [1, GEO.alpha(R(P.flame, 0.9), 0)]])));
      s.push(GEO.circle(bx, by, 86, 'url(#' + id + ')'));
    }
    s.push(GEO.smokePlume(1380, 460, 380, '#7d7a74', 'lzk-sm'));
    s.push(GEO.crowd(20, { x0: 200, x1: 1000, y0: 800, y1: 900, h: 170, color: '#4e545c', seed: 'lzk-ppl', stride: 0.9 }));
    s.push(GEO.vignette(W, H, 0.7, '#101820'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 哈达铺 */
  ART.scenes['bg_hadapu'] = function () {
    var s = [], rng = GEO.RNG('hdp');
    s.push(GEO.sky(W, H, P.sky.day, { horizon: 500 }));
    s.push(GEO.cloudBank(W, 180, '#e8f2f8', { seed: 'hdp-cl', count: 7, opacity: 0.45 }));
    s.push(GEO.mountainRange(W, 500, R(P.loess, 0.4), { amp: 140, segs: 14, seed: 'hdp-far', grad: '#c8b48e' }));
    s.push(GEO.groundBand(W, 600, H, R(P.earth, 0.4), { seed: 'hdp-gnd', rows: 5, patches: 120 }));
    /* 街心 */
    s.push(GEO.facet([[680, 620], [1240, 620], [1760, H], [160, H]], R(P.sand, 0.34), { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.22 }));
    /* 店铺两列 */
    for (var i = 0; i < 4; i++) {
      var near = i % 2 === 0, t = i < 2 ? i / 2 : (i - 2) / 2;
      var x = near ? 250 - t * 30 : 1670 + t * 30;
      var hh = near ? 320 : 250;
      s.push(GEO.house(x, 900 - t * 90, 420 - t * 90, hh, 200, R(P.plaster, 0.4), R(P.tileDark, 0.3),
        { door: true, windows: 2, roofH: 90, eave: 26 }));
    }
    /* 布幌 */
    var ban = GEO.RNG('hdp-ban');
    for (var b = 0; b < 10; b++) {
      var bx = 340 + b * 160 + ban.range(-20, 20), by = 620 + (b % 3) * 40;
      s.push(GEO.banner(bx, by, 120, 34, b % 2 ? R(P.red, 0.5) : R(P.gold, 0.5), ''));
    }
    /* 报摊与报纸 */
    s.push(GEO.facet([[880, 760], [1140, 756], [1156, 810], [868, 816]], R(P.timber, 0.42), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 }));
    for (var k = 0; k < 7; k++) {
      s.push(GEO.poly([[890 + k * 36, 748], [922 + k * 36, 744], [926 + k * 36, 762], [894 + k * 36, 766]], R(P.paper, 0.66), { opacity: 0.95 }));
    }
    s.push(GEO.broadleafTree(1500, 700, 360, R(P.leaf, 0.4), { seed: 'hdp-t', lobes: 6 }));
    s.push(GEO.crowd(30, { x0: 240, x1: 1700, y0: 830, y1: 1056, h: 250, color: '#6a6455', seed: 'hdp-ppl', stride: 0.5 }));
    s.push(GEO.vignette(W, H, 0.42));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 吴起镇 */
  ART.scenes['bg_wuqi'] = function () {
    var s = [], rng = GEO.RNG('wq');
    s.push(GEO.sky(W, H, P.sky.clearDay, { horizon: 460 }));
    s.push(GEO.cloudBank(W, 170, '#eef6fb', { seed: 'wq-cl', count: 7, opacity: 0.5 }));
    /* 黄土塬：层层台地 */
    s.push(GEO.facet([[0, 430], [420, 400], [900, 424], [1400, 392], [1920, 420], [1920, 620], [0, 620]], R(P.loess, 0.42),
      { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.3 }));
    s.push(GEO.facet([[0, 560], [520, 520], [1180, 556], [1920, 516], [1920, 760], [0, 760]], R(P.loess, 0.56),
      { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.3 }));
    s.push(GEO.groundBand(W, 740, H, R(P.loess, 0.68), { seed: 'wq-gnd', rows: 5, patches: 130 }));
    /* 窑洞排 */
    var cav = GEO.RNG('wq-cav');
    for (var i = 0; i < 7; i++) {
      var cx = 140 + i * 260 + cav.range(-30, 30);
      s.push(GEO.caveMouth(cx, 740, 118, 150, R(P.loess, 0.5), R(P.lamp, 0.5)));
      s.push(GEO.rect(cx - 34, 700, 34, 40, R(P.paper, 0.5), { opacity: 0.8 }));
    }
    /* 红旗成排 */
    for (var f = 0; f < 9; f++) {
      s.push(GEO.flag(120 + f * 210, 900 + (f % 2) * 24, 190, 132, R(P.redFlag, 0.52), { emblem: R(P.gold, 0.66), poleW: 5 }));
    }
    /* 枣树 */
    s.push(GEO.broadleafTree(1830, 880, 300, R(P.leaf, 0.34), { seed: 'wq-t1', lobes: 6 }));
    s.push(GEO.broadleafTree(90, 900, 280, R(P.leaf, 0.3), { seed: 'wq-t2', lobes: 5 }));
    s.push(GEO.crowd(40, { x0: 120, x1: 1800, y0: 880, y1: 1062, h: 250, color: '#6b6a4e', seed: 'wq-ppl', stride: 0.5 }));
    s.push(GEO.vignette(W, H, 0.4));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 会宁会师 */
  ART.scenes['bg_huining'] = function () {
    var s = [], rng = GEO.RNG('hn');
    s.push(GEO.sky(W, H, P.sky.clearDay, { horizon: 470 }));
    s.push(GEO.cloudBank(W, 160, '#f0f7fc', { seed: 'hn-cl', count: 8, opacity: 0.5 }));
    s.push(GEO.mountainRange(W, 470, R(P.loess, 0.5), { amp: 150, segs: 14, seed: 'hn-far', grad: '#d9c8a4' }));
    /* 黄土城墙 */
    s.push(GEO.cityWall(-40, W + 40, 760, 260, R(P.loess, 0.56)));
    for (var i = 0; i < 26; i++) {
      s.push(GEO.poly([[60 + i * 76, 500], [140 + i * 76, 496], [140 + i * 76, 530], [60 + i * 76, 534]], GEO.alpha(P.ink, 0.14)));
    }
    /* 城楼 */
    s.push(GEO.tower(960, 760, 300, 300, R(P.brick, 0.36), R(P.tileDark, 0.3), { tiers: 3 }));
    s.push(GEO.gate(960, 760, 190, 150, R(P.brick, 0.3), { lamp: true }));
    /* 三面军旗 */
    var flags = [[700, R(P.red, 0.62)], [960, R(P.redFlag, 0.56)], [1260, R(P.redDeep, 0.6)]];
    for (var f = 0; f < flags.length; f++) {
      s.push(GEO.flag(flags[f][0], 560 + (f * 40), 260, 180, flags[f][1], { emblem: R(P.gold, 0.66), poleW: 8 }));
    }
    /* 人海 */
    s.push(GEO.groundBand(W, 750, H, R(P.loess, 0.66), { seed: 'hn-gnd', rows: 4, patches: 110 }));
    s.push(GEO.crowd(60, { x0: -40, x1: W + 40, y0: 500, y1: 560, h: 80, color: '#8a7f66', seed: 'hn-far', stride: 0.5 }));
    s.push(GEO.crowd(56, { x0: -40, x1: W + 40, y0: 800, y1: 900, h: 170, color: '#6f6450', seed: 'hn-mid', stride: 0.45 }));
    s.push(GEO.crowd(48, { x0: -40, x1: W + 40, y0: 930, y1: 1066, h: 260, color: '#5d5442', seed: 'hn-near', stride: 0.45 }));
    s.push(GEO.vignette(W, H, 0.44));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 延安窑洞 */
  ART.scenes['bg_yanan_cave'] = function () {
    var s = [], rng = GEO.RNG('ya');
    s.push(GEO.rect(0, 0, W, H, '#171310'));
    /* 窑洞内壁：拱顶 */
    s.push(GEO.pth('M -40 1010 L -40 470 Q 960 60 1960 470 L 1960 1010 Z', R(P.loess, 0.34)));
    s.push(GEO.pth('M 60 1010 L 60 500 Q 960 120 1860 500 L 1860 1010 Z', R(P.loess, 0.46), { opacity: 0.9 }));
    for (var r = 0; r < 14; r++) {
      var t = r / 14;
      s.push(GEO.pline([[GEO.lerp(-40, 60, 1 - t), GEO.lerp(1010, 470, 1 - t)], [GEO.lerp(1960, 1860, 1 - t), GEO.lerp(1010, 470, 1 - t)]],
        GEO.alpha(P.ink, 0.12), { sw: 2 }));
    }
    /* 土炕 */
    s.push(GEO.facet([[80, 880], [820, 860], [860, 1010], [40, 1010]], R(P.loess, 0.3), { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.28 }));
    s.push(GEO.rect(140, 830, 620, 40, R(P.cloth, 0.34), { rx: 4 }));
    /* 木桌与地图 */
    s.push(GEO.facet([[1180, 840], [1720, 826], [1750, 928], [1150, 944]], R(P.timber, 0.4), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 }));
    s.push(GEO.mapOnTable(1450, 870, 420, 70, R(P.paper, 0.6)));
    s.push(GEO.chair(1240, 960, 100, R(P.timber, 0.34)));
    /* 墙上挂图与窗 */
    s.push(GEO.rect(300, 420, 420, 300, R(P.paper, 0.56), { rx: 4 }));
    for (var k = 0; k < 7; k++) s.push(GEO.pline([[330, 470 + k * 40], [690, 466 + k * 40]], GEO.alpha(P.ink, 0.3), { sw: 2 }));
    s.push(GEO.pline([[520, 430], [520, 710]], GEO.alpha(R(P.redDeep, 0.5), 0.5), { sw: 3 }));
    s.push(GEO.rect(1260, 380, 380, 300, '#7d95ab', { opacity: 0.9 }));
    for (var c = 1; c < 4; c++) s.push(GEO.rect(1260 + (380 / 4) * c - 4, 380, 8, 300, R(P.timber, 0.4)));
    for (var rr = 1; rr < 5; rr++) s.push(GEO.rect(1260, 380 + (300 / 5) * rr - 4, 380, 8, R(P.timber, 0.4)));
    s.push(GEO.rect(1280, 400, 90, 90, R(P.red, 0.5), { opacity: 0.75 }));
    s.push(GEO.rect(1520, 560, 110, 110, R(P.red, 0.5), { opacity: 0.75 }));
    /* 油灯 */
    var id = 'ya-glow';
    s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(R(P.lamp, 0.9), 0.5)], [1, GEO.alpha(R(P.lamp, 0.9), 0)]])));
    s.push(GEO.circle(1080, 700, 620, 'url(#' + id + ')'));
    s.push(GEO.lantern(1080, 706, 30, R(P.lamp, 0.86), {}));
    /* 围坐的人影 */
    var seat = '';
    for (var p = 0; p < 4; p++) seat += GEO.silhouette(1320 + p * 130, 940 + (p % 2) * 12, 230, '#1a1512', rng, 0.3, 'cap');
    s.push(seat);
    s.push(GEO.vignette(W, H, 0.66, '#0a0806'));
    return GEO.doc(W, H, s.join(''));
  };
})();
