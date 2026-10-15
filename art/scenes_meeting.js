/* 背景素材 · 室内与会议（6 张）
 * 文件所有权：root。1920×1080，立体几何 low-poly。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P;
  var ART = G.ART = G.ART || {};
  ART.scenes = ART.scenes || {};
  var W = 1920, H = 1080;

  /* 室内通用：砖/板墙 + 木梁 + 地面 */
  function room(wallColor, floorColor, seed, opt) {
    opt = opt || {};
    var rng = GEO.RNG(seed || 'room'), s = [];
    s.push(GEO.facet([[0, 0], [W, 0], [W, 1010], [0, 1010]], GEO.mul(wallColor, 0.72), { light: 0.06, hl: 0.18, dark: 0.08, dl: 0.24, sw: 0 }));
    /* 墙面砖/板缝 */
    var rows = 9;
    for (var r = 0; r < rows; r++) {
      var y0 = (r / rows) * 1010, y1 = ((r + 1) / rows) * 1010;
      var cols = 8 + (r % 3);
      for (var c = 0; c < cols; c++) {
        var x0 = (c / cols) * W + rng.range(-14, 14), x1 = ((c + 1) / cols) * W + rng.range(-14, 14);
        s.push(GEO.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], GEO.mul(wallColor, 0.8 + rng() * 0.42), { opacity: 0.6, stroke: null }));
      }
    }
    /* 顶梁 */
    for (var b = 0; b < 4; b++) {
      var by = 34 + b * 62;
      s.push(GEO.facet([[-20, by], [W + 20, by - 6], [W + 20, by + 26], [-20, by + 32]], GEO.mul(P.ramp(P.timber, 0.24), 0.85 + b * 0.05),
        { light: 0.1, hl: 0.28, dark: 0.12, dl: 0.3 }));
    }
    /* 地面 */
    s.push(GEO.facet([[0, 1006], [W, 1006], [W + 60, H], [-60, H]], floorColor, { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.28 }));
    for (var f = 0; f < 9; f++) {
      var fw = 260 + f * 20, fx = 960 - fw / 2 + rng.range(-40, 40);
      s.push(GEO.poly([[fx, 1010 + f * 8], [fx + fw, 1010 + f * 8], [fx + fw - 14, 1016 + f * 8], [fx + 14, 1016 + f * 8]], GEO.alpha(P.ink, 0.24)));
    }
    return s.join('');
  }
  /* 窗：窗棂 + 透光柱 */
  function window4(x, y, w, h, light, seed) {
    var s = '', rng = GEO.RNG(seed || 'win'), cols = 4, rows = 5;
    s += GEO.facet([[x - 14, y - 14], [x + w + 14, y - 14], [x + w + 14, y + h + 14], [x - 14, y + h + 14]], P.ramp(P.timber, 0.3), { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.26 });
    s += GEO.rect(x, y, w, h, light, { opacity: 0.92 });
    for (var c = 1; c < cols; c++) s += GEO.rect(x + (w / cols) * c - 3, y, 6, h, P.ramp(P.timber, 0.34));
    for (var r = 1; r < rows; r++) s += GEO.rect(x, y + (h / rows) * r - 3, w, 6, P.ramp(P.timber, 0.34));
    s += GEO.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 'none');
    var id = 'ws' + Math.round(x);
    s += GEO.defs(GEO.linearGrad(id, [[0, GEO.alpha(light, 0.42)], [1, GEO.alpha(light, 0)]], { x1: 0, y1: 0, x2: 0.4, y2: 1 }));
    s += GEO.poly([[x, y + h], [x + w, y + h], [x + w + 220, H], [x - 220, H]], 'url(#' + id + ')');
    return s;
  }

  /* ------------------------------------------------------- 会议厅·通用 */
  ART.scenes['bg_council_hall'] = function () {
    var s = [], rng = GEO.RNG('ch');
    s.push(room(P.ramp(P.plaster, 0.4), P.ramp(P.wood, 0.26), 'ch-room'));
    /* 墙上挂图 */
    s.push(GEO.rect(1290, 250, 470, 320, P.ramp(P.paper, 0.6), { rx: 4 }));
    for (var i = 0; i < 6; i++) {
      s.push(GEO.ln(1330, 300 + i * 46, 1720, 296 + i * 46, GEO.alpha(P.ink, 0.34), { sw: 2 }));
    }
    s.push(GEO.ln(1520, 264, 1520, 556, GEO.alpha(P.redDeep[2], 0.4), { sw: 3 }));
    s.push(window4(210, 250, 300, 320, '#c9d8e2', 'ch-win'));
    /* 长桌 */
    s.push(GEO.facet([[420, 760], [1500, 742], [1560, 872], [360, 892]], P.ramp(P.timber, 0.42), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.28 }));
    s.push(GEO.facet([[360, 880], [1560, 860], [1560, 910], [360, 930]], GEO.mul(P.ramp(P.timber, 0.28), 0.9), { light: 0.06, hl: 0.2, dark: 0.1, dl: 0.28 }));
    for (var lg = 0; lg < 4; lg++) {
      var lx = 500 + lg * 300;
      s.push(GEO.facet([[lx, 892], [lx + 40, 890], [lx + 40, H], [lx, H]], P.ramp(P.timber, 0.24), { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.26 }));
    }
    /* 桌上的地图与马灯 */
    s.push(GEO.mapOnTable(960, 812, 520, 92, P.ramp(P.paper, 0.62)));
    s.push(GEO.lantern(660, 742, 34, P.ramp(P.lamp, 0.8), {}));
    s.push(GEO.lantern(1300, 730, 28, P.ramp(P.lamp, 0.7), {}));
    /* 长凳 */
    s.push(GEO.facet([[300, 960], [1000, 950], [1004, 972], [296, 984]], P.ramp(P.timber, 0.34), { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.26 }));
    /* 围坐的剪影 */
    var seat = '';
    for (var k = 0; k < 7; k++) {
      seat += GEO.silhouette(500 + k * 168, 1006 + (k % 2) * 16, 240, '#241f1a', rng, 0.3, 'cap');
    }
    s.push(seat);
    /* 暖光 */
    var id = 'ch-glow';
    s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(P.ramp(P.lamp, 0.9), 0.34)], [1, GEO.alpha(P.ramp(P.lamp, 0.9), 0)]])));
    s.push(GEO.circle(960, 780, 760, 'url(#' + id + ')'));
    s.push(GEO.vignette(W, H, 0.66, '#100c08'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 通道·恭城书院 */
  ART.scenes['bg_tongdao'] = function () {
    var s = [], rng = GEO.RNG('td');
    s.push(room(GEO.mix(P.ramp(P.plaster, 0.36), '#6b7a72', 0.4), P.ramp(P.stone, 0.3), 'td-room'));
    /* 书院木柱 */
    for (var c = 0; c < 4; c++) {
      var cx = 180 + c * 520;
      s.push(GEO.facet([[cx - 32, 0], [cx + 32, 0], [cx + 40, 1010], [cx - 40, 1010]], P.ramp(P.timber, 0.3),
        { light: 0.1, hl: 0.3, dark: 0.12, dl: 0.3 }));
    }
    /* 窗棂 */
    s.push(window4(700, 200, 520, 420, '#8fa3a8', 'td-win'));
    /* 窗外冬雨 */
    s.push(GEO.rainfall(560, 640, 220, 'td-rain', { color: '#cfdae0' }));
    /* 天井湿光 */
    var id = 'td-light';
    s.push(GEO.defs(GEO.linearGrad(id, [[0, GEO.alpha('#cfe0e4', 0.4)], [1, GEO.alpha('#cfe0e4', 0)]], { x1: 0, y1: 0, x2: 0.3, y2: 1 })));
    s.push(GEO.poly([[700, 620], [1220, 620], [1480, H], [420, H]], 'url(#' + id + ')'));
    /* 案几与书册 */
    s.push(GEO.facet([[600, 800], [1340, 790], [1380, 880], [560, 892]], P.ramp(P.wood, 0.36), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 }));
    s.push(GEO.rect(860, 762, 150, 26, P.ramp(P.paper, 0.6), { rx: 2 }));
    s.push(GEO.rect(1030, 768, 130, 22, P.ramp(P.paper, 0.5), { rx: 2 }));
    s.push(GEO.lantern(1240, 742, 26, P.ramp(P.lamp, 0.72), {}));
    var seat = '';
    for (var k = 0; k < 5; k++) seat += GEO.silhouette(700 + k * 190, 1010 + (k % 2) * 14, 245, '#232a2b', rng, 0.3, 'cap');
    s.push(seat);
    s.push(GEO.mistBand(W, 620, 260, '#aebbc0', { op: 0.28 }));
    s.push(GEO.vignette(W, H, 0.62, '#0e1416'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 黎平会议 */
  ART.scenes['bg_liping'] = function () {
    var s = [], rng = GEO.RNG('lp');
    s.push(room(P.ramp(P.wood, 0.34), P.ramp(P.wood, 0.22), 'lp-room'));
    /* 板墙竖缝 */
    for (var i = 0; i < 16; i++) {
      s.push(GEO.rect(40 + i * 120, 90, 4, 920, GEO.alpha(P.ink, 0.3)));
    }
    s.push(window4(1320, 220, 340, 300, '#6d8288', 'lp-win'));
    /* 火塘 */
    s.push(GEO.poly(GEO.ngon(700, 900, 250, 10, 0.2, 0.3), P.ramp(P.stone, 0.28), { stroke: GEO.alpha(P.ink, 0.3), sw: 1.2 }));
    s.push(GEO.poly(GEO.ngon(700, 892, 200, 10, 0.4, 0.3), P.ramp(P.ink, 0.2)));
    s.push(GEO.campfire(700, 884, 1.5, 'lp-fire'));
    /* 吊锅 */
    s.push(GEO.ln(700, 700, 700, 800, P.ramp(P.metal, 0.3), { sw: 3 }));
    s.push(GEO.copperPot(700, 830, 54, P.ramp(P.metalRust, 0.4)));
    /* 木桌与长凳 */
    s.push(GEO.facet([[1180, 800], [1760, 792], [1790, 872], [1150, 882]], P.ramp(P.timber, 0.4), { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.26 }));
    s.push(GEO.mapOnTable(1470, 820, 340, 62, P.ramp(P.paper, 0.56)));
    var seat = '';
    for (var k = 0; k < 6; k++) {
      var sx = 240 + k * 200;
      if (k === 2 || k === 3) sx += 60;
      seat += GEO.silhouette(sx, 1012 + (k % 2) * 12, 235, '#2a231b', rng, 0.3, 'cap');
    }
    s.push(seat);
    var id = 'lp-glow';
    s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(P.ramp(P.flame, 0.9), 0.42)], [1, GEO.alpha(P.ramp(P.flame, 0.9), 0)]])));
    s.push(GEO.circle(700, 870, 720, 'url(#' + id + ')'));
    s.push(GEO.glowBand(W, 1006, P.ramp(P.flame, 0.7), 0.5));
    s.push(GEO.vignette(W, H, 0.7, '#140d08'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 猴场·跨年夜 */
  ART.scenes['bg_houchang'] = function () {
    var s = [], rng = GEO.RNG('hc');
    s.push(GEO.sky(W, H, P.sky.deepNight, { horizon: 470 }));
    s.push(GEO.stars(W, 460, 150, 'hc-star'));
    s.push(GEO.sunDisc(340, 150, 40, P.ramp(P.lamp, 0.7), { disc: 'moon', hr: 4 }));
    s.push(GEO.mountainRange(W, 470, P.ramp(P.rock, 0.08), { amp: 120, segs: 14, seed: 'hc-ridge', grad: '#0b1018', light: 0.04 }));
    /* 院墙与屋檐 */
    s.push(GEO.cityWall(-40, W + 40, 700, 250, P.ramp(P.plaster, 0.28)));
    s.push(GEO.facet([[-60, 700], [W + 60, 690], [W + 60, 640], [-60, 656]], P.ramp(P.tileDark, 0.24), { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.28 }));
    /* 冰凌 */
    for (var ic = 0; ic < 30; ic++) {
      var ix = 60 + ic * 62;
      s.push(GEO.poly([[ix - 5, 700], [ix + 5, 700], [ix, 700 + rng.range(18, 54)]], '#bcd8e8', { opacity: 0.7 }));
    }
    /* 院中地面 + 薄雪 */
    s.push(GEO.groundBand(W, 690, H, P.ramp(P.stone, 0.3), { seed: 'hc-gnd', rows: 4, patches: 90 }));
    s.push(GEO.poly([[0, 690], [W, 690], [W, H], [0, H]], '#dfe8ee', { opacity: 0.24 }));
    /* 爆竹红屑 */
    var scraps = GEO.RNG('hc-scrap');
    for (var k = 0; k < 300; k++) {
      var sx = scraps.range(0, W), sy = scraps.range(760, H);
      var sr = scraps.range(3, 11) * ((sy - 700) / 380 + 0.5);
      s.push(GEO.poly(GEO.ngon(sx, sy, sr, 5, scraps() * 3, 0.5), GEO.mul(P.ramp(P.redFlag, 0.6), 0.8 + scraps() * 0.5),
        { opacity: scraps.range(0.5, 0.95), stroke: null }));
    }
    /* 门灯 */
    var glow = P.ramp(P.lamp, 0.85);
    for (var d = 0; d < 4; d++) {
      var dx = 300 + d * 440;
      var id = 'hc-l' + d;
      s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(glow, 0.5)], [1, GEO.alpha(glow, 0)]])));
      s.push(GEO.circle(dx, 470, 220, 'url(#' + id + ')'));
      s.push(GEO.lantern(dx, 470, 40, glow, { hang: 360 }));
    }
    /* 庭院里的战士 */
    s.push(GEO.crowd(26, { x0: 120, x1: 1800, y0: 880, y1: 1058, h: 250, color: '#2e3540', seed: 'hc-ppl', stride: 0.4 }));
    s.push(GEO.snowfall(W, 700, 60, 'hc-snow'));
    s.push(GEO.vignette(W, H, 0.6, '#0a0d14'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 遵义会议楼 */
  ART.scenes['bg_zunyi'] = function () {
    var s = [], rng = GEO.RNG('zy');
    s.push(room(GEO.mix(P.ramp(P.woodRed, 0.42), P.ramp(P.plaster, 0.4), 0.5), P.ramp(P.wood, 0.24), 'zy-room'));
    /* 回廊红漆木柱 */
    for (var c = 0; c < 5; c++) {
      var cx = 120 + c * 430;
      s.push(GEO.facet([[cx - 34, 60], [cx + 34, 60], [cx + 42, 1010], [cx - 42, 1010]], P.ramp(P.woodRed, 0.34),
        { light: 0.1, hl: 0.3, dark: 0.12, dl: 0.3 }));
      s.push(GEO.poly([[cx - 52, 60], [cx + 52, 60], [cx + 42, 106], [cx - 42, 106]], P.ramp(P.woodRed, 0.2)));
    }
    /* 窗外遵义老城与晨光 */
    s.push(GEO.rect(1330, 230, 420, 330, '#c8b48e', { opacity: 0.95 }));
    s.push(GEO.house(1430, 560, 150, 90, 90, P.ramp(P.plaster, 0.5), P.ramp(P.tileDark, 0.4), { door: false, roofH: 46 }));
    s.push(GEO.house(1600, 556, 130, 76, 80, P.ramp(P.plaster, 0.44), P.ramp(P.tileDark, 0.36), { door: false, roofH: 40 }));
    s.push(GEO.mountainRange(1780, 470, P.ramp(P.karst, 0.3), { amp: 90, segs: 8, seed: 'zy-far', light: 0.06 }));
    s.push(window4(1330, 230, 420, 330, '#e0c9a0', 'zy-win'));
    /* 炭盆 */
    var bx = 700, by = 900;
    s.push(GEO.poly(GEO.ngon(bx, by, 190, 9, 0.2, 0.3), P.ramp(P.metal, 0.26), { stroke: GEO.alpha(P.ink, 0.3), sw: 1.2 }));
    s.push(GEO.poly(GEO.ngon(bx, by - 14, 150, 9, 0.5, 0.3), P.ramp(P.flame, 0.6)));
    for (var e = 0; e < 14; e++) {
      s.push(GEO.poly(GEO.ngon(bx + rng.range(-120, 120), by - 20 + rng.range(-16, 16), rng.range(6, 16), 5, rng() * 3), P.ramp(P.lamp, 0.8), { opacity: rng.range(0.5, 0.95) }));
    }
    /* 长桌与地图 */
    s.push(GEO.facet([[1080, 790], [1720, 776], [1750, 866], [1050, 882]], P.ramp(P.timber, 0.42), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 }));
    s.push(GEO.mapOnTable(1420, 812, 420, 66, P.ramp(P.paper, 0.6)));
    s.push(GEO.chair(1160, 900, 96, P.ramp(P.woodRed, 0.4)));
    s.push(GEO.chair(1660, 890, 90, P.ramp(P.woodRed, 0.34)));
    /* 围坐剪影 */
    var seat = '';
    for (var k = 0; k < 8; k++) seat += GEO.silhouette(300 + k * 150, 1014 + (k % 3) * 12, 240, '#241812', rng, 0.28, 'cap');
    s.push(seat);
    var id = 'zy-glow';
    s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(P.ramp(P.flame, 0.9), 0.4)], [1, GEO.alpha(P.ramp(P.flame, 0.9), 0)]])));
    s.push(GEO.circle(bx, by - 40, 640, 'url(#' + id + ')'));
    s.push(GEO.vignette(W, H, 0.66, '#140b06'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ------------------------------------------------------- 指挥部·地图桌 */
  ART.scenes['bg_map_table'] = function () {
    var s = [], rng = GEO.RNG('mt');
    s.push(GEO.rect(0, 0, W, H, '#0d0f14'));
    /* 桌面 */
    s.push(GEO.facet([[-80, 300], [W + 80, 250], [W + 80, H + 40], [-80, H + 40]], P.ramp(P.timber, 0.34),
      { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.3 }));
    for (var i = 0; i < 8; i++) {
      s.push(GEO.poly([[GEO.lerp(-80, W + 80, i / 8), 300 + i * 4], [GEO.lerp(-80, W + 80, (i + 1) / 8), 300 + i * 4],
        [GEO.lerp(-80, W + 80, (i + 1) / 8), 316 + i * 6], [GEO.lerp(-80, W + 80, i / 8), 316 + i * 6]],
        GEO.alpha(P.ink, 0.22)));
    }
    /* 大张作战地图 */
    s.push(GEO.poly([[300, 420], [1620, 372], [1720, 950], [180, 1010]], P.ramp(P.paper, 0.66), { stroke: GEO.alpha(P.ink, 0.3), sw: 1.4 }));
    for (var r = 0; r < 9; r++) {
      s.push(GEO.poly([[300 + r * 4, 420 + r * 62], [1620 + r * 4, 372 + r * 64], [1640 + r * 4, 392 + r * 64], [300 + r * 4, 440 + r * 62]],
        GEO.alpha(P.ink, 0.16)));
    }
    s.push(GEO.pline([[360, 880], [700, 760], [1020, 820], [1420, 600], [1660, 640]], P.alpha(P.redDeep[1], 0.55), { sw: 4, dash: '14 10' }));
    for (var d = 0; d < 9; d++) {
      s.push(GEO.poly(GEO.ngon(430 + d * 150, 640 + (d % 3) * 110, 13, 4, 0.78), P.ramp(P.red, 0.6)));
    }
    s.push(GEO.poly([[1080, 500], [1240, 486], [1260, 566], [1092, 578]], P.ramp(P.sand, 0.4), { opacity: 0.5 }));
    /* 蜡烛 */
    var candle = function (x, y) {
      var g = '', id = 'c' + x;
      g += GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(P.ramp(P.lamp, 0.9), 0.6)], [1, GEO.alpha(P.ramp(P.lamp, 0.9), 0)]]));
      g += GEO.circle(x, y - 40, 260, 'url(#' + id + ')');
      g += GEO.facet([[x - 13, y], [x + 13, y], [x + 11, y - 90], [x - 11, y - 90]], P.ramp(P.white, 0.66), { light: 0.1, hl: 0.3, dark: 0.08, dl: 0.2 });
      g += GEO.poly([[x, y - 92], [x + 9, y - 118], [x, y - 148], [x - 9, y - 118]], P.ramp(P.flame, 0.75));
      g += GEO.poly([[x, y - 100], [x + 5, y - 122], [x, y - 142], [x - 5, y - 122]], P.ramp(P.lamp, 0.9), { opacity: 0.85 });
      return g;
    };
    s.push(candle(250, 630));
    s.push(candle(1700, 690));
    s.push(candle(1420, 980));
    /* 铅笔、放大镜、电话机、茶缸 */
    s.push(GEO.ln(1320, 760, 1470, 736, P.ramp(P.wood, 0.5), { sw: 7, cap: 'round' }));
    s.push(GEO.poly(ngonPt(1478, 734), P.ramp(P.gold, 0.7)));
    s.push(GEO.rect(560, 560, 120, 150, P.ramp(P.ink, 0.18), { rx: 8 }));
    s.push(GEO.poly([[560, 566], [680, 566], [672, 540], [568, 540]], P.ramp(P.metal, 0.3)));
    s.push(GEO.poly(ngonPt(880, 900), P.ramp(P.white, 0.6)));
    s.push(GEO.rect(830, 862, 100, 46, P.ramp(P.metal, 0.4), { rx: 5 }));
    s.push(GEO.lantern(960, 300, 36, P.ramp(P.lamp, 0.82), {}));
    s.push(GEO.vignette(W, H, 0.8, '#07090d'));
    return GEO.doc(W, H, s.join(''));
  };
  function ngonPt(x, y) { return GEO.ngon(x, y, 12, 6, 0.3); }
})();
