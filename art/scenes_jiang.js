/* 背景素材 · 赣南 / 湘江 / 行军 / 夜营 / 担架（9 张）
 * 文件所有权：art-scenes-a。1920×1080，立体几何 low-poly 风格。
 * 注册到 window.ART.scenes[id]()，由 tools/build-art.js 烘焙。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P;
  var ART = G.ART = G.ART || {};
  ART.scenes = ART.scenes || {};
  var W = 1920, H = 1080;

  /* 斜跨水面的浮桥：从 (x0,y0) 到 (x1,y1) 铺板，带栏杆与水面投影 */
  function bridge(x0, y0, x1, y1, th, deck, planks, seed, opt) {
    var rng = GEO.RNG(seed || 'br'), s = '';
    opt = opt || {};
    /* 水面投影 */
    s += GEO.poly([[x0, y1 + th], [x1, y1 + th], [x1, y1 + th + th * 0.9], [x0, y0 + th + th * 0.9]], GEO.alpha('#050810', 0.34));
    for (var i = 0; i < planks; i++) {
      var t0 = i / planks, t1 = (i + 1) / planks;
      var ax = GEO.lerp(x0, x1, t0), ay = GEO.lerp(y0, y1, t0);
      var bx = GEO.lerp(x0, x1, t1), by = GEO.lerp(y0, y1, t1);
      var tt = th * (0.6 + 0.4 * t0);
      s += GEO.facet([[ax, ay], [bx, by], [bx, by + tt], [ax, ay + tt]],
        GEO.mul(deck, 0.86 + rng() * 0.3), { light: 0.12, hl: 0.34, dark: 0.12, dl: 0.28, sw: 0.5 });
    }
    if (opt.rail !== false) {
      var rc = opt.railColor || GEO.ramp(P.wood, 0.42), posts = opt.posts || 16;
      var tops = [];
      for (var k = 0; k <= posts; k++) {
        var t = k / posts;
        var px = GEO.lerp(x0, x1, t), py = GEO.lerp(y0, y1, t);
        tops.push([px, py - th * 1.5]);
        s += GEO.ln(px, py + th, px, py - th * 1.5, rc, { sw: Math.max(1.6, th * 0.16) });
      }
      s += GEO.pline(tops, rc, { sw: Math.max(1.4, th * 0.14), opacity: 0.9 });
      var mid = tops.map(function (p) { return [p[0], p[1] + th * 0.7]; });
      s += GEO.pline(mid, rc, { sw: Math.max(1, th * 0.1), opacity: 0.7 });
    }
    return s;
  }
  /* 火把：火光 + 水面倒影 */
  function torchPost(x, y, hh, glow) {
    var s = GEO.torch(x, y, hh);
    if (glow) {
      var id = 'tg' + Math.round(x) + '_' + Math.round(y);
      s = GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(glow, 0.5)], [0.5, GEO.alpha(glow, 0.14)], [1, GEO.alpha(glow, 0)]]))
        + GEO.circle(x, y - hh - 18, hh * 2.4, 'url(#' + id + ')') + s;
    }
    return s;
  }
  function refl(x, y, w, color, op) {
    var s = '';
    for (var i = 0; i < 5; i++) {
      var yy = y + i * 13;
      s += GEO.poly([[x - w / 2 + i * 4, yy], [x + w / 2 - i * 5, yy], [x + w / 2 - i * 5 - 6, yy + 5], [x - w / 2 + i * 4 - 6, yy + 5]], color, { opacity: op * (1 - i * 0.17) });
    }
    return s;
  }

  /* ---------------------------------------------------------------- 1 */
  ART.scenes['bg_yudu_night'] = function () {
    var s = [];
    s.push(GEO.sky(W, H, P.sky.deepNight, { horizon: 592 }));
    s.push(GEO.stars(W, 640, 170, 'yd-star'));
    s.push(GEO.cloudBank(W, 300, '#1a2340', { seed: 'yd-cl', count: 7, opacity: 0.55 }));
    s.push(GEO.sunDisc(1552, 176, 46, P.ramp(P.lamp, 0.72), { disc: 'moon', hr: 4.4 }));
    /* 远山两重 */
    s.push(GEO.mountainRange(W, 592, P.ramp(P.rock, 0.12), { amp: 138, segs: 20, seed: 'yd-far', grad: '#0a0f1e', light: 0.05 }));
    s.push(GEO.mountainRange(W, 606, P.ramp(P.rock, 0.06), { amp: 84, segs: 16, seed: 'yd-near', grad: '#070b16', light: 0.04 }));
    /* 对岸村庄剪影 */
    var rng = GEO.RNG('yd-vill');
    var bank = '';
    for (var i = 0; i < 9; i++) {
      var hx = 180 + i * 190 + rng.range(-40, 40), hw = rng.range(95, 150), hh = rng.range(48, 76);
      bank += GEO.house(hx, 600, hw, hh, hw * 0.7, '#1b2334', '#141b28', { door: false, roofH: hh * 0.5 });
    }
    s.push(GEO.grp(bank, { opacity: 0.95 }));
    s.push(GEO.crowd(46, { x0: -60, x1: W + 60, y0: 560, y1: 604, h: 96, color: '#232c3e', seed: 'yd-farbank', opacity: 0.85 }));
    /* 河面 */
    s.push(GEO.waterBand(W, 596, 892, P.waterNight, { seed: 'yd-water', cols: 30 }));
    /* 岸上火把在水里的倒影（先画，免得盖住浮桥） */
    var glow = P.ramp(P.lamp, 0.65);
    for (var r0 = 0; r0 < 5; r0++) {
      s.push(GEO.waterReflection(150 + r0 * 400, 626, 876, 78, glow, { op: 0.34, seed: 'ydt' + r0, steps: 18 }));
    }
    /* 浮桥五座 */
    var deck = P.ramp(P.wood, 0.66);
    var bs = [
      { y0: 638, y1: 652, th: 13 }, { y0: 684, y1: 702, th: 17 }, { y0: 738, y1: 762, th: 22 },
      { y0: 798, y1: 830, th: 28 }, { y0: 864, y1: 906, th: 36 }
    ];
    for (var b = 0; b < bs.length; b++) {
      s.push(bridge(-40, bs[b].y0, W + 40, bs[b].y1, bs[b].th, deck, 34, 'yd-br' + b,
        { posts: 26, railColor: P.ramp(P.wood, 0.8) }));
      s.push(GEO.pline([[-40, bs[b].y0], [W + 40, bs[b].y1]], P.ramp(P.wood, 0.9), { sw: 3, opacity: 0.85 }));
    }
    /* 火把：桥头 + 岸上 */
    for (var t = 0; t < 5; t++) {
      s.push(torchPost(150 + t * 400, 936, 78, glow));
      s.push(torchPost(150 + t * 400, 606, 58, glow));
    }
    /* 桥面压暗水面，让浮桥从水中跳出来 */
    for (var q = 0; q < bs.length; q++) {
      s.push(GEO.poly([[-40, bs[q].y1 + bs[q].th], [W + 40, bs[q].y1 + bs[q].th],
        [W + 40, bs[q].y1 + bs[q].th + 16], [-40, bs[q].y1 + bs[q].th + 16]], GEO.alpha('#050c18', 0.42)));
    }
    /* 近岸 */
    s.push(GEO.groundBand(W, 888, H, P.ramp(P.earth, 0.1), { seed: 'yd-gnd', cols: 16 }));
    /* 门板堆 */
    for (var m = 0; m < 7; m++) {
      var mx = 60 + m * 300 + rng.range(-50, 50);
      s.push(GEO.facet([[mx, 1006], [mx + 92, 1000], [mx + 88, 1018], [mx - 4, 1024]], GEO.mul(P.ramp(P.wood, 0.3), rng.range(0.85, 1.15)),
        { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.24, sw: 0.6 }));
    }
    /* 送别的百姓与待渡的战士 */
    s.push(GEO.crowd(34, { x0: -40, x1: W + 40, y0: 1000, y1: 1074, h: 240, color: '#38424f', seed: 'yd-near', stride: 0.5 }));
    s.push(GEO.crowd(22, { x0: 300, x1: 1500, y0: 946, y1: 986, h: 150, color: '#2b3444', seed: 'yd-soldiers', stride: 0.8 }));
    s.push(GEO.mistBand(W, 860, 130, '#3b4a68', { op: 0.32 }));
    s.push(GEO.vignette(W, H, 0.62));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 2 */
  ART.scenes['bg_yudu_village'] = function () {
    var rng = GEO.RNG('yv'), s = [];
    s.push(GEO.sky(W, H, P.sky.dawnCold, { horizon: 636, glow: P.ramp(P.lamp, 0.6) }));
    s.push(GEO.cloudBank(W, 190, '#c9cbd4', { seed: 'yv-cl', count: 6, opacity: 0.35 }));
    s.push(GEO.sunDisc(420, 168, 52, P.ramp(P.lamp, 0.8), { hr: 5 }));
    s.push(GEO.mountainRange(W, 636, P.ramp(P.karst, 0.2), { amp: 150, segs: 16, seed: 'yv-far', grad: '#8d94a2' }));
    /* 白墙黑瓦民居 */
    var walls = '', roof = '';
    for (var i = 0; i < 7; i++) {
      var hx = 90 + i * 262 + rng.range(-26, 26), hw = rng.range(160, 235), hh = rng.range(74, 112);
      walls += GEO.house(hx, 700, hw, hh, hw * 0.66, P.ramp(P.plaster, 0.55), P.ramp(P.tileDark, 0.35),
        { door: true, windows: 2, windowGlow: P.ramp(P.lamp, 0.5), roofH: hh * 0.5 });
    }
    s.push(walls);
    s.push(GEO.broadleafTree(1680, 706, 430, P.ramp(P.leaf, 0.4), { seed: 'yv-tree1', lobes: 7 }));
    s.push(GEO.broadleafTree(120, 716, 360, P.ramp(P.leaf, 0.3), { seed: 'yv-tree2', lobes: 6 }));
    s.push(GEO.mistBand(W, 640, 150, '#cfd6dd', { op: 0.4 }));
    s.push(GEO.groundBand(W, 696, H, P.ramp(P.earth, 0.28), { seed: 'yv-gnd', cols: 16 }));
    /* 石板路 */
    s.push(GEO.facet([[770, 700], [1150, 700], [1460, H], [470, H]], P.ramp(P.stone, 0.34), { light: 0.08, hl: 0.22, dark: 0.08, dl: 0.2 }));
    /* 鹅卵石铺面：近大远小的一粒粒面片 */
    var cob = GEO.RNG('yv-cob');
    for (var k = 0; k < 240; k++) {
      var t = Math.pow(cob(), 0.62);
      var yc = GEO.lerp(704, H + 20, t);
      var halfW = GEO.lerp(190, 500, t);
      var xc = 960 + cob.range(-halfW, halfW);
      var r = GEO.lerp(5, 21, t) * cob.range(0.7, 1.3);
      s.push(GEO.poly(GEO.ngon(xc, yc, r, 6, cob() * 2, 0.62),
        GEO.mul(P.ramp(P.stone, 0.42), 0.82 + cob() * 0.36), { opacity: GEO.lerp(0.9, 0.5, t), stroke: null }));
    }
    /* 井台 */
    s.push(GEO.poly(GEO.ngon(1356, 916, 76, 10, 0.2, 0.42), P.ramp(P.stone, 0.5), { stroke: GEO.alpha(P.ink, 0.3), sw: 1 }));
    s.push(GEO.poly(GEO.ngon(1356, 908, 60, 10, 0.4, 0.4), GEO.ramp(P.stone, 0.62)));
    s.push(GEO.poly(GEO.ngon(1356, 906, 42, 9, 0.1, 0.42), GEO.ramp(P.ink, 0.2)));
    s.push(GEO.poly(GEO.ngon(1356, 904, 34, 9, 0.6, 0.4), GEO.ramp(P.water, 0.34), { opacity: 0.9 }));
    s.push(GEO.ln(1356, 900, 1356, 838, P.ramp(P.wood, 0.4), { sw: 5 }));
    s.push(GEO.ln(1338, 840, 1374, 836, P.ramp(P.wood, 0.5), { sw: 6, cap: 'round' }));
    s.push(GEO.fenceRow(60, 640, 1010, 60, P.ramp(P.wood, 0.3)));
    s.push(GEO.grassTufts(W, 830, 1074, P.ramp(P.grass, 0.45), 'yv-grass', 220));
    s.push(GEO.crowd(14, { x0: 200, x1: 1300, y0: 900, y1: 1040, h: 215, color: '#6b6a60', seed: 'yv-ppl', stride: 0.42, hat: 'none' }));
    s.push(GEO.mistBand(W, 740, 200, '#dfe4e8', { op: 0.28 }));
    s.push(GEO.vignette(W, H, 0.4));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 3 */
  ART.scenes['bg_mountain_pass'] = function () {
    var s = [], rng = GEO.RNG('mp');
    s.push(GEO.sky(W, H, P.sky.clearDay, { horizon: 560 }));
    s.push(GEO.cloudBank(W, 230, '#eaf3f8', { seed: 'mp-cl', count: 8, opacity: 0.5 }));
    s.push(GEO.mountainRange(W, 560, P.ramp(P.karst, 0.35), { amp: 250, segs: 17, seed: 'mp-f1', grad: '#a9c3cf' }));
    s.push(GEO.mountainRange(W, 620, P.ramp(P.karst, 0.5), { amp: 170, segs: 15, seed: 'mp-f2', grad: '#8fa894' }));
    s.push(GEO.groundBand(W, 610, H, P.ramp(P.grass, 0.42), { seed: 'mp-gnd', cols: 18 }));
    /* 层叠石阶山路 */
    for (var i = 0; i < 13; i++) {
      var t = i / 13;
      var y0 = GEO.lerp(660, H, Math.pow(t, 0.86));
      var wd = GEO.lerp(120, 620, Math.pow(t, 0.8));
      s.push(GEO.facet([[990 - wd / 2, y0], [990 + wd / 2, y0 + 6], [990 + wd / 2 + 14, y0 + 26], [990 - wd / 2 - 14, y0 + 26]],
        GEO.mul(P.ramp(P.stone, 0.42), 0.9 + rng() * 0.2), { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.24, sw: 0.6 }));
    }
    /* 竹林 */
    s.push(GEO.bambooCluster(180, 980, 620, P.ramp(P.bamboo, 0.4), 'mp-b1', 9));
    s.push(GEO.bambooCluster(360, 900, 480, P.ramp(P.bamboo, 0.3), 'mp-b2', 7));
    s.push(GEO.bambooCluster(1740, 1010, 660, P.ramp(P.bamboo, 0.45), 'mp-b3', 10));
    s.push(GEO.bambooCluster(1560, 890, 420, P.ramp(P.bamboo, 0.28), 'mp-b4', 6));
    /* 田埂 */
    for (var k = 0; k < 5; k++) {
      var yy = 690 + k * 34;
      s.push(GEO.poly([[100, yy + k * 22], [1800, yy], [1800, yy + 9], [100, yy + k * 22 + 10]], P.ramp(P.grassDry, 0.4), { opacity: 0.75 }));
    }
    s.push(GEO.shrubRow(W, 700, P.ramp(P.shrub, 0.4), 'mp-shrub', 26, 44));
    s.push(GEO.grassTufts(W, 720, H, P.ramp(P.grass, 0.5), 'mp-grass', 300));
    s.push(GEO.crowd(28, { x0: 480, x1: 1560, y0: 800, y1: 1046, h: 250, color: '#5d6a62', seed: 'mp-march', stride: 0.9 }));
    s.push(GEO.mistBand(W, 590, 170, '#d6e6ef', { op: 0.34 }));
    s.push(GEO.vignette(W, H, 0.34));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 4 */
  ART.scenes['bg_blockade'] = function () {
    var s = [], rng = GEO.RNG('bl');
    s.push(GEO.sky(W, H, P.sky.storm, { horizon: 566 }));
    s.push(GEO.cloudBank(W, 250, '#5c6473', { seed: 'bl-cl', count: 9, opacity: 0.55 }));
    s.push(GEO.mountainRange(W, 566, P.ramp(P.rock, 0.28), { amp: 210, segs: 15, seed: 'bl-ridge', grad: '#3a4150' }));
    /* 探照灯光柱 */
    for (var b = 0; b < 3; b++) {
      var bx = 380 + b * 580;
      var id = 'bl-beam' + b;
      s.push(GEO.defs(GEO.linearGrad(id, [[0, GEO.alpha('#e8f0d8', 0.32)], [1, GEO.alpha('#e8f0d8', 0)]], { x1: 0, y1: 1, x2: 0, y2: 0 })));
      s.push(GEO.poly([[bx - 14, 570], [bx + 14, 570], [bx + 150, 60], [bx - 120, 60]], 'url(#' + id + ')'));
    }
    s.push(GEO.groundBand(W, 620, H, P.ramp(P.earth, 0.16), { seed: 'bl-gnd', cols: 15 }));
    /* 碉堡群 */
    s.push(GEO.bunker(420, 686, 250, 128, P.ramp(P.concrete, 0.3)));
    s.push(GEO.bunker(1420, 660, 210, 108, P.ramp(P.concrete, 0.24)));
    s.push(GEO.bunker(960, 716, 300, 150, P.ramp(P.concrete, 0.36)));
    /* 铁丝网 */
    s.push(GEO.barbedWire(-40, W + 40, 800, 'bl-w1', 3));
    s.push(GEO.barbedWire(-40, W + 40, 930, 'bl-w2', 4));
    s.push(GEO.barbedWire(-40, W + 40, 1064, 'bl-w3', 5));
    for (var p = 0; p < 12; p++) {
      var px = 60 + p * 165;
      s.push(GEO.poly([[px - 9, 800], [px + 9, 800], [px + 5, 620], [px - 5, 620]], P.ramp(P.metal, 0.22), { opacity: 0.8 }));
    }
    s.push(GEO.shrubRow(W, 660, P.ramp(P.shrub, 0.22), 'bl-shrub', 20, 34));
    s.push(GEO.grassTufts(W, 860, H, P.ramp(P.grassDry, 0.28), 'bl-grass', 200));
    s.push(GEO.smokePlume(980, 620, 420, '#6a7280', 'bl-smoke'));
    s.push(GEO.vignette(W, H, 0.58));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 5 */
  ART.scenes['bg_xiangjiang_day'] = function () {
    var s = [], rng = GEO.RNG('xj');
    s.push(GEO.sky(W, H, P.sky.overcast, { horizon: 566 }));
    s.push(GEO.cloudBank(W, 210, '#b6bec7', { seed: 'xj-cl', count: 9, opacity: 0.5 }));
    s.push(GEO.mountainRange(W, 566, P.ramp(P.karst, 0.22), { amp: 140, segs: 18, seed: 'xj-far', grad: '#8b949c' }));
    /* 对岸：村舍与树 */
    s.push(GEO.mountainRange(W, 566, P.ramp(P.karst, 0.42), { amp: 96, segs: 14, seed: 'xj-bank', grad: '#93a08c', light: 0.08 }));
    s.push(GEO.crowd(26, { x0: -40, x1: W + 40, y0: 552, y1: 572, h: 56, color: '#7c848c', seed: 'xj-farppl', opacity: 0.75 }));
    for (var i = 0; i < 5; i++) {
      s.push(GEO.house(210 + i * 400 + rng.range(-40, 40), 578, 128, 52, 84, P.ramp(P.plaster, 0.4), P.ramp(P.tileDark, 0.3), { door: false, roofH: 28 }));
    }
    /* 江面 */
    s.push(GEO.waterBand(W, 570, 780, P.water, { seed: 'xj-water', cols: 28 }));
    /* 浮桥 */
    s.push(bridge(-40, 686, W + 40, 700, 13, P.ramp(P.wood, 0.26), 40, 'xj-br'));
    s.push(bridge(-40, 758, W + 40, 776, 15, P.ramp(P.wood, 0.2), 40, 'xj-br2'));
    s.push(refl(560, 712, 260, P.ramp(P.lamp, 0.5), 0.24));
    s.push(refl(1360, 786, 260, P.ramp(P.lamp, 0.45), 0.2));
    /* 江心小舟 */
    for (var k = 0; k < 4; k++) {
      s.push(GEO.woodenBoat(300 + k * 430 + rng.range(-50, 50), 646 + k * 24, 130, P.ramp(P.wood, 0.22), { oars: true }));
    }
    /* 近岸 */
    s.push(GEO.groundBand(W, 776, H, P.ramp(P.sand, 0.22), { seed: 'xj-gnd', cols: 16 }));
    s.push(GEO.reeds(W, 900, P.ramp(P.grassDry, 0.3), 'xj-reed', 50));
    s.push(GEO.crowd(30, { x0: -40, x1: W + 40, y0: 940, y1: 1070, h: 250, color: '#5f6a62', seed: 'xj-near', stride: 0.85 }));
    s.push(GEO.smokePlume(1500, 600, 380, '#9aa3ad', 'xj-smoke'));
    s.push(GEO.mistBand(W, 540, 150, '#c4ccd3', { op: 0.34 }));
    s.push(GEO.vignette(W, H, 0.42));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 6 */
  ART.scenes['bg_xiangjiang_night'] = function () {
    var s = [], rng = GEO.RNG('xjn');
    s.push(GEO.sky(W, H, P.sky.storm, { horizon: 560, glow: P.ramp(P.flame, 0.6) }));
    s.push(GEO.cloudBank(W, 230, '#4b4038', { seed: 'xjn-cl', count: 10, opacity: 0.62 }));
    s.push(GEO.mountainRange(W, 560, P.ramp(P.rock, 0.08), { amp: 170, segs: 16, seed: 'xjn-ridge', grad: '#2a1c18', light: 0.04 }));
    /* 对岸火光 */
    for (var f = 0; f < 7; f++) {
      var fx = 160 + f * 270 + rng.range(-60, 60);
      var id = 'xjn-fire' + f;
      s.push(GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(P.ramp(P.flame, 0.85), 0.62)], [1, GEO.alpha(P.ramp(P.flame, 0.85), 0)]])));
      s.push(GEO.circle(fx, 552, 130, 'url(#' + id + ')'));
      s.push(GEO.poly([[fx - 26, 560], [fx + 26, 560], [fx + 12, 496], [fx - 14, 506]], P.ramp(P.flame, 0.7), { opacity: 0.85 }));
    }
    /* 泛红江水 */
    s.push(GEO.waterBand(W, 562, 826, P.waterRed, { seed: 'xjn-water', cols: 30 }));
    s.push(GEO.smokePlume(300, 540, 260, '#6a5a50', 'xjn-sm1'));
    s.push(GEO.smokePlume(1080, 530, 320, '#61524a', 'xjn-sm2'));
    s.push(GEO.smokePlume(1720, 546, 220, '#6a5a50', 'xjn-sm3'));
    /* 残破浮桥 */
    s.push(bridge(-40, 690, 620, 704, 12, P.ramp(P.wood, 0.14), 15, 'xjn-br1'));
    s.push(bridge(760, 716, 1260, 732, 13, P.ramp(P.wood, 0.11), 12, 'xjn-br2'));
    s.push(bridge(1420, 748, W + 40, 766, 15, P.ramp(P.wood, 0.16), 12, 'xjn-br3'));
    s.push(refl(360, 712, 220, P.ramp(P.flame, 0.6), 0.34));
    s.push(refl(1560, 772, 240, P.ramp(P.flame, 0.55), 0.3));
    /* 曳光 */
    for (var g = 0; g < 16; g++) {
      var tx = rng.range(80, W - 80), ty = rng.range(120, 520), len = rng.range(60, 190);
      s.push(GEO.ln(tx, ty, tx + len, ty - len * 0.36, P.ramp(P.flame, 0.8), { sw: rng.range(1, 2.4), opacity: rng.range(0.3, 0.75), cap: 'round' }));
    }
    s.push(GEO.groundBand(W, 822, H, P.ramp(P.earthRed, 0.1), { seed: 'xjn-gnd', cols: 15 }));
    /* 河滩碎石与弹坑 */
    var shore = GEO.RNG('xjn-shore');
    for (var sk = 0; sk < 130; sk++) {
      var sx = shore.range(-20, W + 20), sy = shore.range(826, H + 10), sr = shore.range(4, 26);
      s.push(GEO.poly(GEO.ngon(sx, sy, sr, 6, shore() * 2, 0.55),
        GEO.mul(P.ramp(P.rockRed, 0.3), 0.7 + shore() * 0.6), { opacity: shore.range(0.4, 0.9), stroke: null }));
    }
    for (var cr = 0; cr < 7; cr++) {
      s.push(GEO.poly(GEO.ngon(120 + cr * 280, 880 + cr * 26, 46 + cr * 6, 9, cr, 0.32), GEO.ramp(P.ink, 0.14), { opacity: 0.4 }));
    }
    s.push(GEO.crowd(24, { x0: -40, x1: W + 40, y0: 940, y1: 1074, h: 250, color: '#2a2320', seed: 'xjn-near', stride: 0.5 }));
    s.push(GEO.embers(W, 900, 90, 'xjn-em', { color: P.ramp(P.flame, 0.85) }));
    s.push(GEO.vignette(W, H, 0.72, '#1a0e0a'));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 7 */
  ART.scenes['bg_rain_march'] = function () {
    var s = [], rng = GEO.RNG('rm');
    s.push(GEO.sky(W, H, P.sky.rain, { horizon: 588 }));
    s.push(GEO.cloudBank(W, 220, '#8b959e', { seed: 'rm-cl', count: 10, opacity: 0.6 }));
    s.push(GEO.mountainRange(W, 588, P.ramp(P.karst, 0.16), { amp: 190, segs: 17, seed: 'rm-ridge', grad: '#4b555d' }));
    s.push(GEO.groundBand(W, 600, H, P.ramp(P.earth, 0.14), { seed: 'rm-gnd', cols: 16 }));
    /* 泥泞道路 */
    s.push(GEO.poly([[820, 600], [1120, 600], [1580, H], [330, H]], P.ramp(P.earth, 0.2), { opacity: 0.9 }));
    for (var k = 0; k < 10; k++) {
      var t = k / 10;
      s.push(GEO.ell(GEO.lerp(970, 950, t) + rng.range(-150, 260), GEO.lerp(640, H, t), GEO.lerp(30, 130, t), GEO.lerp(8, 26, t),
        P.ramp(P.water, 0.22), { opacity: 0.55 }));
    }
    /* 远处山道上的队伍 */
    s.push(GEO.crowd(26, { x0: 700, x1: 1200, y0: 604, y1: 654, h: 74, color: '#4d565e', seed: 'rm-far', stride: 0.95 }));
    /* 树 */
    s.push(GEO.broadleafTree(190, 720, 400, P.ramp(P.leaf, 0.22), { seed: 'rm-t1', lobes: 6 }));
    s.push(GEO.broadleafTree(1780, 700, 380, P.ramp(P.leaf, 0.18), { seed: 'rm-t2', lobes: 6 }));
    s.push(GEO.shrubRow(W, 660, P.ramp(P.shrub, 0.24), 'rm-shrub', 22, 38));
    /* 近处行军的蓑衣背影 */
    s.push(GEO.crowd(30, { x0: -40, x1: W + 40, y0: 900, y1: 1074, h: 290, color: '#3f483f', seed: 'rm-near', stride: 1.0 }));
    s.push(GEO.mistBand(W, 560, 170, '#6e7a84', { op: 0.42 }));
    s.push(GEO.rainfall(W, H, 900, 'rm-rain', { color: '#cfdbe4' }));
    s.push(GEO.vignette(W, H, 0.6));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 8 */
  ART.scenes['bg_camp_fire'] = function () {
    var s = [], rng = GEO.RNG('cf');
    s.push(GEO.sky(W, H, P.sky.deepNight, { horizon: 604 }));
    s.push(GEO.stars(W, 640, 190, 'cf-star'));
    s.push(GEO.sunDisc(300, 150, 40, P.ramp(P.lamp, 0.7), { disc: 'moon', hr: 3.8 }));
    s.push(GEO.mountainRange(W, 604, P.ramp(P.rock, 0.1), { amp: 160, segs: 18, seed: 'cf-ridge', grad: '#0c1120', light: 0.05 }));
    s.push(GEO.groundBand(W, 600, H, P.ramp(P.grassDry, 0.16), { seed: 'cf-gnd', cols: 16 }));
    s.push(GEO.grassTufts(W, 620, H, P.ramp(P.grassDry, 0.24), 'cf-grass', 320));
    /* 篝火与光晕 */
    var fy = 856, fx = 940, gid = 'cf-glow';
    s.push(GEO.defs(GEO.radialGrad(gid, [[0, GEO.alpha(P.ramp(P.flame, 0.85), 0.55)], [0.45, GEO.alpha(P.ramp(P.lamp, 0.7), 0.22)], [1, GEO.alpha(P.ramp(P.flame, 0.8), 0)]])));
    s.push(GEO.circle(fx, fy - 40, 620, 'url(#' + gid + ')'));
    s.push(GEO.campfire(fx, fy, 1.5, 'cf-fire'));
    s.push(GEO.embers(W, 620, 80, 'cf-em', { color: P.ramp(P.flame, 0.9) }));
    /* 帐篷 */
    s.push(GEO.tent(320, 700, 260, 150, P.ramp(P.cloth, 0.24)));
    s.push(GEO.tent(1640, 690, 240, 136, P.ramp(P.cloth, 0.2)));
    /* 围坐与站立的战士剪影 */
    var seat = '';
    for (var i = 0; i < 8; i++) {
      var a = Math.PI * (0.15 + i * 0.09);
      var sx = fx + Math.cos(Math.PI + a * 0.6) * 300 + (i - 3.5) * 92;
      var sy = fy + 62 + Math.abs(i - 3.5) * 12;
      seat += GEO.silhouette(sx, sy, 120, '#191d26', rng, 0.4, 'cap');
    }
    s.push(seat);
    s.push(GEO.crowd(16, { x0: 200, x1: 1700, y0: 720, y1: 800, h: 170, color: '#1d222c', seed: 'cf-far', stride: 0.5 }));
    s.push(GEO.mistBand(W, 660, 150, '#2a3448', { op: 0.3 }));
    s.push(GEO.vignette(W, H, 0.66));
    return GEO.doc(W, H, s.join(''));
  };

  /* ---------------------------------------------------------------- 9 */
  ART.scenes['bg_stretcher'] = function () {
    var s = [], rng = GEO.RNG('st');
    s.push(GEO.sky(W, H, P.sky.dawnCold, { horizon: 560 }));
    s.push(GEO.cloudBank(W, 220, '#c6ccd2', { seed: 'st-cl', count: 6, opacity: 0.4 }));
    /* 远景竹林：矮、灰、被雾压住 */
    var farBamboo = GEO.mix(P.ramp(P.bamboo, 0.3), '#8f9aa2', 0.45);
    for (var i = 0; i < 13; i++) {
      s.push(GEO.bambooCluster(50 + i * 155 + rng.range(-40, 40), 792, 300 + rng.range(-70, 90), farBamboo, 'st-fb' + i, 7));
    }
    s.push(GEO.mistBand(W, 600, 280, '#cfd8de', { op: 0.5 }));
    s.push(GEO.groundBand(W, 786, H, P.ramp(P.earth, 0.3), { seed: 'st-gnd', cols: 16 }));
    /* 小径 */
    s.push(GEO.facet([[830, 796], [1190, 796], [1530, H], [420, H]], P.ramp(P.earth, 0.38), { light: 0.1, hl: 0.26, dark: 0.08, dl: 0.22 }));
    var peb = GEO.RNG('st-peb');
    for (var pk = 0; pk < 150; pk++) {
      var pt = Math.pow(peb(), 0.6);
      s.push(GEO.poly(GEO.ngon(960 + peb.range(-1, 1) * GEO.lerp(170, 520, pt), GEO.lerp(800, H + 16, pt),
        GEO.lerp(4, 17, pt) * peb.range(0.7, 1.3), 6, peb() * 2, 0.6),
        GEO.mul(P.ramp(P.earth, 0.44), 0.8 + peb() * 0.4), { opacity: GEO.lerp(0.8, 0.4, pt), stroke: null }));
    }
    s.push(GEO.grassTufts(W, 820, H, P.ramp(P.grass, 0.4), 'st-grass', 240));
    /* 两副担架与抬担架的战士 */
    var sceneG = '';
    var pairs = [{ x: 470, y: 1000, sc: 1.0 }, { x: 1180, y: 928, sc: 0.82 }];
    pairs.forEach(function (p, idx) {
      var hh = 300 * p.sc;
      /* 前后两位抬担架的战士 */
      sceneG += GEO.humanoid({ H: hh * 1.42, gy: p.y + 4, cx: p.x - 150 * p.sc, build: 1.0, pose: 'carry',
        cloth: P.ramp(P.uniformGrn, 0.3), pants: P.ramp(P.uniformGrn, 0.2), hat: 'cap', puttee: true, collar: false, face: 'stern' });
      sceneG += GEO.humanoid({ H: hh * 1.42, gy: p.y - 16 * p.sc, cx: p.x + 150 * p.sc, build: 0.96, pose: 'carry',
        cloth: P.ramp(P.uniformGrn, 0.26), pants: P.ramp(P.uniformGrn, 0.18), hat: 'cap', puttee: true, collar: false, face: 'worry' });
      /* 担架 */
      sceneG += GEO.stretcher(p.x, p.y - 96 * p.sc, 260 * p.sc, P.ramp(P.cloth, 0.36));
      /* 伤员 */
      sceneG += GEO.poly(GEO.ngon(p.x, p.y - 108 * p.sc, 26 * p.sc, 7, 0.3, 0.7), P.ramp(P.skinPale, 0.4));
      sceneG += GEO.facet([[p.x - 84 * p.sc, p.y - 116 * p.sc], [p.x + 76 * p.sc, p.y - 112 * p.sc],
        [p.x + 78 * p.sc, p.y - 88 * p.sc], [p.x - 82 * p.sc, p.y - 92 * p.sc]], P.ramp(P.cloth, 0.3), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.24 });
    });
    s.push(sceneG);
    /* 斑驳光影 */
    for (var k = 0; k < 40; k++) {
      var lx = rng.range(0, W), ly = rng.range(600, 900), lr = rng.range(24, 90);
      s.push(GEO.poly(GEO.ngon(lx, ly, lr, 7, rng() * 2, 0.34), P.lightWarm, { opacity: rng.range(0.05, 0.16) }));
    }
    s.push(GEO.vignette(W, H, 0.5));
    return GEO.doc(W, H, s.join(''));
  };
})();
