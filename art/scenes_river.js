/* 背景素材 · 娄山关 / 金沙江 / 彝海 / 大渡河（4 张）
 * 文件所有权：root。1920×1080，立体几何 low-poly。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P, R = P.ramp, A = GEO.alpha;
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
    /* ------------------------------------------------------- 土城 */
    /* ------------------------------------------------------- 娄山关 */
  ART.scenes['bg_loushanguan'] = function () {
    var s = [], rng = GEO.RNG('lsg');
    s.push(GEO.sky(W, H, P.sky.dusk, { horizon: 620, glow: P.ramp(P.flame, 0.7) }));
    /* R1-Q13：远山与关隘之间的空隙（原来透舞台底色，洋红底重渲占 0.13%） */
    s.push(GEO.groundBand(W, 620 - 16, H + 40, GEO.mix(P.ramp(P.rock, 0.28), '#6b5a6e', 0.30), { seed: 'lsg-v13', cols: 13, op: 0.62 }));
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
    /* R1-Q13：湖面与远山之间的空隙（原来透舞台底色，洋红底重渲占 4.13%） */
    s.push(GEO.groundBand(W, 520 - 16, H + 40, GEO.mix(P.ramp(P.karst, 0.30), '#8a6a72', 0.30), { seed: 'yh-v13', cols: 13, op: 0.62 }));
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

  /* ------------------------------------------------------- 乌江·江界河强渡 */
  function wjRaft(cx, cy, L, color, seed) {
    var s = GEO.raft(cx, cy, L, color, seed);
    var rng = GEO.RNG(seed + '-p'), i;
    for (i = 0; i < 6; i++) {
      var px = cx - L * 0.34 + i * L * 0.135;
      var fy = cy - L * 0.30 + (i % 3) * 4;
      s += GEO.silhouette(px, fy, L * 0.52 + (i % 2) * 10, R(P.uniform, 0.26), rng, 0.32, 'cap');
    }
    for (i = 0; i < 3; i++) {
      s += GEO.ln(cx - L * 0.30 + i * L * 0.26, cy - L * 0.18, cx - L * 0.42 + i * L * 0.30, cy + 26, R(P.wood, 0.30), { sw: 3.4, cap: 'round' });
    }
    return s;
  }
  function wjGlow(cx, cy, r, color, op, tag) {
    var id = 'wjg_' + (tag || 'x') + Math.round(cx);
    return GEO.defs(GEO.radialGrad(id, [[0, GEO.alpha(color, op)], [0.45, GEO.alpha(color, op * 0.34)], [1, GEO.alpha(color, 0)]])) +
      GEO.circle(cx, cy, r, 'url(#' + id + ')');
  }
  function wjSplash(cx, cy, h, seed) {
    var rng = GEO.RNG(seed || 'spl'), s = '', i;
    s += GEO.poly([[cx - h * 0.09, cy], [cx + h * 0.09, cy], [cx + h * 0.13, cy - h * 0.58], [cx, cy - h],
      [cx - h * 0.13, cy - h * 0.58]], A('#e9f2f4', 0.60), {});
    s += GEO.poly([[cx - h * 0.04, cy], [cx + h * 0.04, cy], [cx + h * 0.05, cy - h * 0.52], [cx, cy - h * 0.78],
      [cx - h * 0.05, cy - h * 0.52]], A('#f7fbfc', 0.48), {});
    for (i = 0; i < 8; i++) {
      s += GEO.circle(cx + rng.range(-h * 0.20, h * 0.20), cy - h * rng.range(0.72, 1.24), rng.range(2, 6),
        A('#eef6f7', 0.62), {});
    }
    return s;
  }

  ART.scenes['bg_wujiang'] = function () {
    var s = [], rng = GEO.RNG('wj'), i;
    s.push(GEO.sky(W, H, ['#8d9aa8', '#b9bdbd', '#ddd6c6'], { horizon: H * 0.18 }));
    s.push(GEO.cloudBank(W, H * 0.12, '#d8d4c8', { seed: 'wj-cl', count: 8, opacity: 0.34 }));
    /* 对岸一线灰白的峡谷 */
    s.push(GEO.mountainRange(W, H * 0.195, R(P.rock, 0.22), { amp: 110, segs: 11, seed: 'wj-ridge', grad: '#7f8896' }));
    s.push(GEO.cliffWall(180, 1740, H * 0.170, H * 0.560, R(P.rock, 0.26), { seed: 'wj-far', cols: 15 }));
    /* 近岸两侧的绝壁，把峡谷夹成一线 */
    s.push(GEO.cliffWall(-80, 430, H * 0.040, H + 40, R(P.rock, 0.18), { seed: 'wj-left', cols: 8 }));
    s.push(GEO.cliffWall(1490, 2000, H * 0.040, H + 40, R(P.rock, 0.14), { seed: 'wj-right', cols: 8 }));
    for (i = 0; i < 26; i++) {
      var side = i % 2 ? 1 : -1;
      var bx = side > 0 ? rng.range(1500, 1920) : rng.range(-40, 420);
      var by = rng.range(H * 0.06, H * 0.96);
      s.push(GEO.facet([[bx, by], [bx + side * rng.range(30, 110), by + rng.range(-24, 24)],
        [bx + side * rng.range(24, 96), by + rng.range(38, 120)]],
        GEO.mul(R(P.rock, 0.22), 0.80 + rng() * 0.42), { light: 0.10, hl: 0.30, dark: 0.10, dl: 0.26, sw: 0.8 }));
    }
    /* 青黑色的急流 */
    s.push(GEO.waterBand(W, H * 0.500, H * 0.900, [R(P.water, 0.04), R(P.water, 0.16), R(P.water, 0.34)], { seed: 'wj-w', streaks: 300 }));
    for (i = 0; i < 90; i++) {
      var wx = rng.range(0, W), wy = rng.range(H * 0.52, H * 0.89);
      s.push(GEO.poly([[wx, wy], [wx + rng.range(30, 140), wy], [wx + rng.range(20, 120), wy + 4], [wx - 10, wy + 4]],
        '#e4eef2', { opacity: rng.range(0.18, 0.52) }));
    }
    /* 横过峡谷的竹缆 */
    s.push(GEO.pth('M 400 ' + (H * 0.500) + ' Q ' + (W * 0.5) + ' ' + (H * 0.585) + ' 1520 ' + (H * 0.470),
      'none', { stroke: A('#6b5a3d', 0.78), sw: 5 }));
    s.push(GEO.pth('M 400 ' + (H * 0.508) + ' Q ' + (W * 0.5) + ' ' + (H * 0.594) + ' 1520 ' + (H * 0.478),
      'none', { stroke: A('#4a3d2b', 0.45), sw: 2 }));
    /* 对岸崖根的碉堡、战壕与枪口火光 */
    s.push(GEO.groundBand(W, H * 0.455, H * 0.535, GEO.mix(R(P.earth, 0.30), '#5b5547', 0.32), { seed: 'wj-farbank', cols: 13, op: 0.82 }));
    s.push(GEO.bunker(1348, H * 0.442, 250, 136, R(P.concrete, 0.24)));
    for (i = 0; i < 5; i++) {
      var fx = 1250 + i * 58, fy = H * (0.468 + (i % 2) * 0.008);
      s.push(GEO.poly([[fx, fy], [fx + 28, fy - 12], [fx + 12, fy + 8]], '#f0b463', { opacity: 0.95 }));
      s.push(GEO.poly([[fx + 4, fy - 2], [fx + 22, fy - 9], [fx + 12, fy + 3]], '#fbe0a6', { opacity: 0.9 }));
    }
    s.push(wjGlow(1390, H * 0.455, 320, '#e09a48', 0.18, 'wj-far'));
    s.push(GEO.smokePlume(1390, H * 0.360, 330, A('#b9b3a7', 0.30), 'wj-smk'));
    /* 三只竹排载着战士冲向对岸 */
    s.push(wjSplash(530, H * 0.700, 130, 'wj-sp1'));
    s.push(wjSplash(760, H * 0.778, 150, 'wj-sp2'));
    s.push(wjSplash(1120, H * 0.632, 118, 'wj-sp3'));
    s.push(wjSplash(1280, H * 0.735, 106, 'wj-sp4'));
    s.push(wjRaft(620, H * 0.708, 190, R(P.bamboo, 0.34), 'wj-r1'));
    s.push(wjRaft(930, H * 0.782, 210, R(P.bamboo, 0.30), 'wj-r2'));
    s.push(wjRaft(1180, H * 0.650, 170, R(P.bamboo, 0.38), 'wj-r3'));
    /* 近岸窄石滩：待渡的战士与叠放的竹排 */
    s.push(GEO.groundBand(W, H * 0.865, H + 30, R(P.rockWarm, 0.24), { seed: 'wj-beach', cols: 14, rows: 5 }));
    for (i = 0; i < 22; i++) {
      s.push(boulder(rng.range(-40, W + 40), rng.range(H * 0.880, H + 20), rng.range(18, 62),
        GEO.mul(R(P.rock, 0.36), 0.78 + rng() * 0.50), 'wjb' + i));
    }
    s.push(GEO.raft(300, H * 0.940, 230, R(P.bamboo, 0.28), 'wj-st1'));
    s.push(GEO.raft(430, H * 0.958, 230, R(P.bamboo, 0.24), 'wj-st2'));
    s.push(GEO.raft(1570, H * 0.942, 220, R(P.bamboo, 0.26), 'wj-st3'));
    s.push(GEO.crowd(18, { x0: 40, x1: 700, y0: H * 0.870, y1: H * 0.995, h: 250, color: R(P.uniform, 0.26), seed: 'wj-c1', opacity: 0.96, hat: 'cap' }));
    s.push(GEO.crowd(12, { x0: 1240, x1: 1900, y0: H * 0.872, y1: H * 0.995, h: 250, color: R(P.uniform, 0.24), seed: 'wj-c2', opacity: 0.96, hat: 'cap' }));
    /* 岩缝里的冬季枯草 */
    s.push(GEO.shrubRow(W, H * 0.860, R(P.grassDry, 0.30), 'wj-shrub', 28, 24));
    s.push(GEO.grassTufts(W, H * 0.855, H * 0.980, R(P.grassDry, 0.28), 'wj-grass', 180));
    s.push(GEO.mistBand(W, H * 0.495, 130, '#c7cdd0', { op: 0.26 }));
    s.push(GEO.vignette(W, H, 0.52, '#0c1118'));
    return GEO.doc(W, H, s.join(''));
  };
})();
