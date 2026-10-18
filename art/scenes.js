/* ============================================================
 * art/scenes.js —— 背景素材（第 1 批：会议厅 / 书院 / 木楼 / 猴场 / 遵义 / 土城 / 地图桌）
 *
 * 依据：docs/ART_DIRECTION.md §0 §3、src/data/backgrounds.js（id 冻结）
 * 注册：window.ART.scenes[id]() -> 1920×1080 完整 SVG 文档
 * 烘焙：node tools/build-art.js --scenes
 *
 * 由 root 维护。
 * ============================================================ */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P, R = P.ramp, A = GEO.alpha;
  var ART = G.ART = G.ART || {};
  ART.scenes = ART.scenes || {};
  var W = 1920, H = 1080;

  /* ==========================================================
   * 局部通用块
   * ========================================================== */

  /** 竖向木板墙 / 土墙：不规则面 + 左上硬光 + 明度差极小 */
  function planks(x0, x1, yTop, yBot, color, seed, cols, o) {
    o = o || {};
    var rng = GEO.RNG(seed || 'pl'), s = '', i;
    cols = cols || 16;
    for (i = 0; i < cols; i++) {
      var ax = GEO.lerp(x0, x1, i / cols), bx = GEO.lerp(x0, x1, (i + 1) / cols);
      var ty0 = yTop + rng.range(-7, 7), ty1 = yTop + rng.range(-7, 7);
      s += GEO.facet([[ax, ty0], [bx, ty1], [bx, yBot], [ax, yBot]], GEO.mul(color, 0.9 + rng() * 0.2),
        { light: o.light == null ? 0.07 : o.light, hl: 0.2, dark: 0.07, dl: 0.18, sw: 0.5 });
    }
    return s;
  }

  /** 木地板：横向收窄的透视板条 */
  function floorPlanks(y0, y1, color, seed, rows) {
    var rng = GEO.RNG(seed || 'fp'), s = '', i, j;
    rows = rows || 9;
    for (i = 0; i < rows; i++) {
      var t0 = i / rows, t1 = (i + 1) / rows;
      var yy0 = GEO.lerp(y0, y1, Math.pow(t0, 1.35));
      var yy1 = GEO.lerp(y0, y1, Math.pow(t1, 1.35));
      var n = 5 + (i > 4 ? 2 : 0);
      for (j = 0; j < n; j++) {
        var ax = GEO.lerp(-120, W + 120, j / n), bx = GEO.lerp(-120, W + 120, (j + 1) / n);
        s += GEO.facet([[ax, yy0], [bx, yy0], [bx, yy1], [ax, yy1]], GEO.mul(color, 0.9 + rng() * 0.2),
          { light: 0.08, hl: 0.22, dark: 0.07, dl: 0.18, sw: 0.4 });
      }
    }
    return s;
  }

  /** 暖色光源晕圈（马灯 / 火塘 / 炭盆） */
  function glowBlob(cx, cy, r, color, op, tag) {
    var id = 'gb_' + (tag || 'x') + Math.round(cx) + '_' + Math.round(cy);
    return GEO.defs(GEO.radialGrad(id, [[0, A(color, op)], [0.45, A(color, op * 0.34)], [1, A(color, 0)]])) +
      GEO.circle(cx, cy, r, 'url(#' + id + ')');
  }

  /** 窗：木格 + 冷光柱 */
  function latticeWindow(x, y, w, h, frame, glass, seed) {
    var rng = GEO.RNG(seed || 'win'), s = '', i;
    s += GEO.facet([[x - 10, y - 10], [x + w + 10, y - 10], [x + w + 10, y + h + 10], [x - 10, y + h + 10]],
      frame, { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.22, sw: 0.9 });
    s += GEO.rect(x, y, w, h, glass);
    for (i = 1; i < 4; i++) s += GEO.rect(x + w * i / 4 - 3, y, 6, h, frame);
    for (i = 1; i < 3; i++) s += GEO.rect(x, y + h * i / 3 - 3, w, 6, frame);
    s += GEO.poly([[x, y + h], [x + w, y + h], [x + w * 1.16, y + h * 2.5], [x - w * 0.16, y + h * 2.6]],
      A(glass, 0.16), {});
    return s;
  }

  /** 长案 / 条凳 */
  function longTable(x, y, w, h, d, top, leg) {
    var s = GEO.boxIso(x, y, w, h, d, top, { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 });
    var halfW = w * 0.5;
    s += GEO.facet([[x - halfW * 0.86, y + h * 0.5], [x - halfW * 0.72, y + h * 0.5], [x - halfW * 0.78, y + h + d * 0.9], [x - halfW * 0.92, y + h + d * 0.9]],
      leg, { light: 0.06, hl: 0.18, dark: 0.08, dl: 0.2 });
    s += GEO.facet([[x + halfW * 0.72, y + h * 0.5], [x + halfW * 0.86, y + h * 0.5], [x + halfW * 0.92, y + h + d * 0.9], [x + halfW * 0.78, y + h + d * 0.9]],
      leg, { light: 0.06, hl: 0.18, dark: 0.08, dl: 0.2 });
    return s;
  }

  /** 矮凳 */
  function stool(x, y, w, h, top) {
    var s = GEO.facet([[x - w, y - h], [x + w, y - h - 4], [x + w, y - h + 10], [x - w, y - h + 12]],
      top, { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.24, sw: 0.7 });
    s += GEO.facet([[x - w, y - h + 12], [x + w, y - h + 10], [x + w * 0.9, y], [x - w * 0.9, y]],
      GEO.darken(top, 0.24), { light: 0.06, hl: 0.16, dark: 0.06, dl: 0.16 });
    return s;
  }

  /** 一排行进/站立的人（用 GEO.crowd，脚底对齐 feetY） */
  function marchLine(x0, x1, feetY, hgt, color, seed, n, o) {
    o = o || {};
    return GEO.crowd(n, {
      x0: x0, x1: x1,
      y0: feetY - hgt * 0.98, y1: feetY - hgt * 0.98,
      h: hgt, color: color, seed: seed,
      opacity: o.opacity == null ? 0.86 : o.opacity,
      hat: o.hat === undefined ? 'oct' : o.hat,
      collar: o.collar !== false
    });
  }

  /** 一排旗（S3 会师、入城用） */
  function flagRow(x, y, span, h, color, n) {
    var s = '', i;
    n = n || 4;
    for (i = 0; i < n; i++) {
      var t = n > 1 ? i / (n - 1) : 0;
      s += GEO.flag(x + span * t, y + (i % 2) * h * 0.06, h * (0.88 + (i % 3) * 0.06), h * 0.52, color, {});
    }
    return s;
  }

  /* ==========================================================
   * ch04 · 会议厅（通用）
   * ========================================================== */
/* 以下 7 个 id（会议厅 / 通道 / 黎平 / 猴场 / 遵义 / 土城 / 地图桌）此前在
 * art/scenes_meeting.js 里另有一份实现，并被本文件静态覆盖；R2-V02（e507990）
 * 已删掉那份，本段现为唯一实现。旧注释曾声称"注册键挪到 ART.__altScenes"，
 * 该机制从不存在，属过期描述，已删除。 */
ART.scenes['bg_council_hall'] = function () {
    var wood = R(P.wood, 0.20), woodD = GEO.darken(wood, 0.3);
    var b = '';
    b += GEO.sky(W, H * 0.74, ['#2a2018', '#241c15', '#1b1510'], { horizon: H * 0.74 });
    b += planks(-40, W + 40, 40, H * 0.74, wood, 'hall-wall', 20);
    /* 房梁 */
    b += GEO.poly([[-40, 92], [W + 40, 66], [W + 40, 148], [-40, 176]], GEO.darken(wood, 0.22), {});
    b += GEO.poly([[-40, 152], [W + 40, 124], [W + 40, 168], [-40, 198]], GEO.mul(wood, 0.8), {});
    b += GEO.poly([[300, 40], [360, 40], [352, H * 0.74], [316, H * 0.74]], GEO.darken(wood, 0.3), {});
    b += GEO.poly([[1500, 40], [1556, 40], [1548, H * 0.74], [1512, H * 0.74]], GEO.darken(wood, 0.3), {});
    /* 地板 */
    b += floorPlanks(H * 0.70, H + 20, GEO.mul(wood, 0.72), 'hall-floor', 10);
    /* 左墙挂图 */
    b += GEO.wallPoster(150, 300, 470, 300, R(P.paper, 0.42), R(P.ink, 0.2));
    /* 右窗 + 冷光 */
    b += latticeWindow(1500, 250, 300, 260, GEO.darken(wood, 0.28), '#8fa0ab', 'hallwin');
    /* 长桌 + 长凳 */
    b += longTable(960, 640, 980, 46, 150, R(P.wood, 0.30), woodD);
    b += stool(560, 806, 96, 74, R(P.wood, 0.26));
    b += stool(1360, 800, 92, 70, R(P.wood, 0.26));
    b += stool(760, 880, 104, 78, R(P.wood, 0.24));
    b += stool(1180, 890, 100, 76, R(P.wood, 0.24));
    /* 桌面：马灯、搪瓷缸、铅笔、纸 */
    b += GEO.lantern(700, 600, 52, '#f2c471', {});
    b += GEO.rect(1010, 596, 74, 54, R(P.paper, 0.5), { stroke: A(P.ink, 0.3), sw: 1 });
    b += GEO.rect(1120, 606, 58, 44, R(P.metal, 0.4), { stroke: A(P.ink, 0.3), sw: 1 });
    b += glowBlob(700, 594, 460, '#f0b95e', 0.20, 'hall');
    b += GEO.defs(GEO.radialGrad('hall-lamp', [[0, 'rgba(240,190,110,0.26)'], [0.5, 'rgba(240,190,110,0.08)'], [1, 'rgba(240,190,110,0)']]));
    b += GEO.circle(700, 590, 520, 'url(#hall-lamp)');
    b += GEO.vignette(W, H, 0.42, '#0a0806');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch04 · 通道·恭城书院（冬雨）
   * ========================================================== */
ART.scenes['bg_tongdao'] = function () {
    var wall = R(P.plaster, 0.34), roof = R(P.tileDark, 0.08), col = R(P.woodRed, 0.24);
    var b = '';
    b += GEO.sky(W, H, P.sky.rain, { horizon: H * 0.46 });
    b += GEO.mountainRange(W, H * 0.46, R(P.rock, 0.6), { amp: 190, segs: 13, seed: 'td-far', grad: '#9aa7ad' });
    b += GEO.mistBand(W, H * 0.44, 150, '#c3ccd0', { op: 0.42 });
    /* 书院主体：白墙 + 黑瓦 + 红柱 */
    var baseY = H * 0.80;
    b += GEO.poly([[-40, baseY], [W + 40, baseY], [W + 40, H * 0.40], [-40, H * 0.42]], wall, {});
    b += planks(-40, W + 40, H * 0.41, baseY, wall, 'td-wall', 22, { light: 0.05 });
    /* 屋檐两坡 */
    b += GEO.facet([[-80, H * 0.40], [W / 2, H * 0.245], [W + 80, H * 0.38], [W - 60, H * 0.44], [60, H * 0.46]],
      roof, { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.3 });
    b += GEO.facet([[-80, H * 0.40], [W / 2, H * 0.245], [W / 2 - 30, H * 0.44], [60, H * 0.46]],
      GEO.darken(roof, 0.16), { light: 0.07, hl: 0.2, dark: 0.08, dl: 0.24 });
    /* 檐下斗拱带 */
    var i;
    for (i = 0; i < 13; i++) {
      b += GEO.poly([[90 + i * 140, H * 0.425], [166 + i * 140, H * 0.418], [160 + i * 140, H * 0.468], [96 + i * 140, H * 0.474]],
        GEO.mul(col, 0.9 + (i % 3) * 0.05), {});
    }
    /* 门与窗棂 */
    b += latticeWindow(240, 560, 300, 250, GEO.darken(col, 0.3), '#5d6b72', 'td-w1');
    b += latticeWindow(1380, 560, 300, 250, GEO.darken(col, 0.3), '#5d6b72', 'td-w2');
    b += GEO.facet([[790, 560], [1130, 560], [1130, H * 0.80], [790, H * 0.80]], GEO.darken(col, 0.36),
      { light: 0.08, hl: 0.22, dark: 0.08, dl: 0.24 });
    b += GEO.rect(880, 620, 160, H * 0.80 - 620, A('#120e0a', 0.82), {});
    /* 红柱 */
    b += GEO.poly([[640, H * 0.40], [706, H * 0.40], [700, H * 0.84], [646, H * 0.84]], col, {});
    b += GEO.poly([[1214, H * 0.40], [1280, H * 0.40], [1274, H * 0.84], [1220, H * 0.84]], col, {});
    /* 天井石地与积水 */
    b += GEO.groundBand(W, H * 0.80, H + 30, R(P.stone, 0.34), { seed: 'td-fl', cols: 12 });
    b += GEO.poly([[120, 1000], [640, 964], [900, 1010], [400, 1058]], A('#2f3a42', 0.55), {});
    b += GEO.poly([[1120, 980], [1700, 950], [1800, 1010], [1220, 1042]], A('#2f3a42', 0.5), {});
    /* 台阶 */
    b += GEO.stairs(700, H * 0.80, 520, 130, 5, R(P.stone, 0.28));
    /* 檐水 */
    for (i = 0; i < 22; i++) {
      var lx = 60 + i * 88;
      b += GEO.ln(lx, H * 0.455, lx - 6, H * 0.9, A('#c8d6dc', 0.22), { sw: 2.2 });
    }
    b += GEO.rainfall(W, H, 420, 'td-rain', {});
    b += GEO.mistBand(W, H * 0.86, 220, '#aab6ba', { op: 0.24 });
    b += GEO.vignette(W, H, 0.40, '#0b0f12');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch05 · 黎平会议（木楼火塘）
   * ========================================================== */
ART.scenes['bg_liping'] = function () {
    var wood = R(P.wood, 0.16), b = '';
    b += GEO.sky(W, H, ['#171412', '#120f0d', '#0c0a09'], { horizon: H });
    b += planks(-40, W + 40, -20, H + 20, wood, 'lp-wall', 26, { light: 0.055 });
    /* 横向穿枋与斜撑 */
    b += GEO.poly([[-40, 268], [W + 40, 244], [W + 40, 278], [-40, 302]], GEO.darken(wood, 0.30), {});
    b += GEO.poly([[-40, 736], [W + 40, 716], [W + 40, 752], [-40, 772]], GEO.darken(wood, 0.26), {});
    b += GEO.poly([[250, 60], [312, 60], [430, H], [360, H]], GEO.darken(wood, 0.34), {});
    b += GEO.poly([[1660, 60], [1598, 60], [1484, H], [1552, H]], GEO.darken(wood, 0.34), {});
    /* 火塘：下沉的方形石围，内壁被熏黑 */
    b += GEO.poly([[430, 906], [1100, 882], [1210, 1006], [330, 1040]], R(P.stone, 0.14), {});
    b += GEO.poly([[486, 918], [1044, 898], [1128, 992], [412, 1018]], GEO.darken(R(P.stone, 0.10), 0.42), {});
    var i;
    for (i = 0; i < 11; i++) {
      var t = i / 10;
      var sx = 436 + t * 672, sy = 930 + Math.sin(t * Math.PI) * 26;
      b += GEO.facet([[sx - 34, sy - 16], [sx + 34, sy - 22], [sx + 40, sy + 34], [sx - 40, sy + 40]],
        GEO.mul(R(P.stone, 0.24), 0.86 + (i % 3) * 0.08), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26, sw: 0.8 });
    }
    /* 柴与火焰：多层不规则焰面，中心最亮 */
    var rng = GEO.RNG('lp-fire'), k;
    for (k = 0; k < 6; k++) {
      b += GEO.poly([[700 + rng.range(-40, 60), 952], [860 + rng.range(-50, 40), 946],
        [900 + rng.range(-40, 40), 962], [660 + rng.range(-30, 40), 968]], GEO.darken(R(P.wood, 0.16), 0.3), {});
    }
    var flames = [[766, 946, 300, 128, 0.62], [700, 950, 216, 92, 0.55], [838, 948, 232, 98, 0.55],
      [766, 944, 176, 74, 0.72], [730, 946, 108, 46, 0.8], [802, 946, 118, 50, 0.8]];
    for (k = 0; k < flames.length; k++) {
      var fx = flames[k][0], fy = flames[k][1], fh = flames[k][2], fw = flames[k][3];
      b += GEO.poly([[fx - fw, fy], [fx - fw * 0.2, fy - fh * 0.55], [fx + fw * 0.16, fy - fh],
        [fx + fw * 0.7, fy - fh * 0.42], [fx + fw, fy]],
        GEO.ramp(P.flame, 0.3 + k * 0.12), { opacity: flames[k][4] });
    }
    b += GEO.poly([[740, 946], [766, 830], [792, 946]], GEO.ramp(P.lamp, 0.9), { opacity: 0.7 });
    /* 火焰在墙与地上的暖光（两层，避免死黑） */
    b += glowBlob(766, 900, 1180, '#d9761f', 0.34, 'lpA');
    b += glowBlob(766, 878, 620, '#f0a83c', 0.30, 'lpB');
    b += glowBlob(766, 862, 300, '#ffd98a', 0.26, 'lpC');
    /* 三脚架与吊锅 */
    b += GEO.ln(596, 962, 700, 592, '#2f261d', { sw: 9 });
    b += GEO.ln(944, 960, 838, 596, '#2f261d', { sw: 9 });
    b += GEO.ln(700, 592, 838, 596, '#2f261d', { sw: 8 });
    b += GEO.ln(768, 594, 768, 686, '#3d3126', { sw: 6 });
    b += GEO.copperPot(768, 716, 54, R(P.metal, 0.30));
    /* 烟 */
    b += GEO.smokePlume(776, 580, 520, A('#cbb99b', 0.26), 'lp-smoke');
    /* 左侧门洞：冷夜光 + 门外雨幕的暗示 */
    b += GEO.facet([[86, 452], [286, 446], [286, 968], [86, 976]], GEO.darken(wood, 0.42),
      { light: 0.05, hl: 0.14, dark: 0.04, dl: 0.12 });
    b += GEO.poly([[112, 476], [264, 472], [264, 950], [112, 956]], A('#20303e', 0.85), {});
    b += glowBlob(190, 700, 300, '#7f9db4', 0.16, 'lpD');
    b += GEO.ln(150, 486, 142, 946, A('#c9d8e2', 0.20), { sw: 3 });
    b += GEO.ln(214, 482, 208, 944, A('#c9d8e2', 0.16), { sw: 2.6 });
    /* 右侧：草席与木凳 */
    b += GEO.facet([[1360, 900], [1760, 878], [1826, 986], [1320, 1010]], R(P.grassDry, 0.30),
      { light: 0.07, hl: 0.2, dark: 0.07, dl: 0.18, sw: 0.6 });
    b += stool(1520, 900, 92, 66, R(P.wood, 0.20));
    b += stool(1240, 940, 84, 60, R(P.wood, 0.18));
    /* 墙上挂的斗笠与蓑衣 */
    b += GEO.poly([[1560, 240], [1720, 232], [1752, 268], [1528, 278]], R(P.grassDry, 0.42), {});
    b += GEO.poly([[1572, 276], [1736, 268], [1700, 420], [1608, 424]], R(P.grassDry, 0.26), {});
    b += GEO.embers(W, H, 40, 'lp-emb', {});
    b += GEO.vignette(W, H, 0.62, '#050508');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch06 · 猴场跨年夜（庭院 / 薄雪 / 爆竹屑）
   * ========================================================== */
ART.scenes['bg_houchang'] = function () {
    var wall = R(P.plaster, 0.30), roof = R(P.tileDark, 0.06), b = '';
    b += GEO.sky(W, H, ['#141a2a', '#1d2334', '#2a2c33'], { horizon: H * 0.58 });
    b += GEO.stars(W, H * 0.5, 90, 'hc-stars');
    b += GEO.ell(1560, 200, 66, 60, '#e6e2d2', { opacity: 0.9 });
    b += GEO.ell(1560, 200, 150, 130, A('#e6e2d2', 0.10), {});
    b += GEO.mountainRange(W, H * 0.56, R(P.rock, 0.4), { amp: 130, segs: 12, seed: 'hc-far', grad: '#4a5568' });
    /* 院墙 */
    b += planks(-40, W + 40, H * 0.44, H * 0.78, wall, 'hc-wall', 26, { light: 0.05 });
    b += GEO.poly([[-40, H * 0.44], [W + 40, H * 0.42], [W + 40, H * 0.47], [-40, H * 0.49]], roof, {});
    /* 门楼 */
    b += GEO.facet([[760, H * 0.30], [1160, H * 0.30], [1160, H * 0.78], [760, H * 0.78]], GEO.mul(wall, 0.94),
      { light: 0.07, hl: 0.22, dark: 0.08, dl: 0.22 });
    b += GEO.facet([[700, H * 0.30], [1220, H * 0.30], [1200, H * 0.22], [720, H * 0.22]], roof,
      { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.3 });
    b += GEO.facet([[760, H * 0.30], [960, H * 0.19], [1220, H * 0.30], [1160, H * 0.34], [820, H * 0.34]], GEO.darken(roof, 0.1),
      { light: 0.09, hl: 0.24, dark: 0.1, dl: 0.28 });
    b += GEO.rect(870, 560, 180, H * 0.78 - 560, A('#160f0a', 0.88), {});
    /* 门上的红纸（门神 / 春联） */
    b += GEO.rect(890, 500, 60, 150, R(P.red, 0.36), { stroke: A(P.ink, 0.3), sw: 1 });
    b += GEO.rect(976, 500, 60, 150, R(P.red, 0.36), { stroke: A(P.ink, 0.3), sw: 1 });
    b += GEO.rect(770, 470, 380, 34, R(P.red, 0.32), { stroke: A(P.ink, 0.3), sw: 1 });
    /* 灯笼 */
    b += GEO.lantern(840, 470, 40, '#f0bd63', {});
    b += GEO.lantern(1080, 470, 40, '#f0bd63', {});
    b += glowBlob(960, 520, 620, '#e8a445', 0.22, 'hc');
    /* 雪地庭院 */
    b += GEO.groundBand(W, H * 0.78, H + 30, R(P.snow, 0.62), { seed: 'hc-fl', cols: 14 });
    b += GEO.poly([[-40, H * 0.78], [W + 40, H * 0.76], [W + 40, H * 0.82], [-40, H * 0.85]], A('#ffffff', 0.5), {});
    /* 爆竹红屑 */
    var rng = GEO.RNG('hc-paper'), i;
    for (i = 0; i < 130; i++) {
      var x = rng.range(80, W - 60), y = rng.range(H * 0.79, H - 12);
      var w2 = rng.range(10, 30), h2 = rng.range(4, 9);
      b += GEO.poly([[x, y], [x + w2, y - rng.range(2, 8)], [x + w2 * 0.94, y + h2], [x - 2, y + h2 + 2]],
        GEO.mul(R(P.red, 0.42), 0.82 + rng() * 0.4), { opacity: 0.9 });
    }
    /* 未化的雪堆与脚印 */
    b += GEO.poly([[220, 1000], [520, 980], [560, 1044], [180, 1060]], A('#e8eef4', 0.7), {});
    b += GEO.poly([[1320, 990], [1660, 968], [1720, 1030], [1300, 1052]], A('#e8eef4', 0.66), {});
    b += GEO.snowfall(W, H, 180, 'hc-snow', {});
    b += GEO.smokePlume(960, 330, 220, A('#c8c2b4', 0.20), 'hc-smk');
    b += GEO.vignette(W, H, 0.46, '#080a12');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch07 · 遵义会议楼（清晨回廊 / 炭盆）
   * ========================================================== */
ART.scenes['bg_zunyi'] = function () {
    var wall = R(P.plaster, 0.36), roof = R(P.tileDark, 0.07), col = R(P.woodRed, 0.30);
    var b = '';
    b += GEO.sky(W, H, P.sky.dawn, { horizon: H * 0.50, glow: '#f3c07a' });
    b += GEO.sunDisc(1500, 232, 74, '#f6d79a', {});
    b += GEO.mountainRange(W, H * 0.50, R(P.rock, 0.5), { amp: 150, segs: 12, seed: 'zy-far', grad: '#8d93a0' });
    b += GEO.mistBand(W, H * 0.50, 130, '#c6cbd4', { op: 0.38 });
    /* 主楼（白墙黑瓦） */
    var baseY = H * 0.80;
    b += GEO.poly([[-40, baseY], [W + 40, baseY], [W + 40, H * 0.40], [-40, H * 0.43]], wall, {});
    b += planks(-40, W + 40, H * 0.42, baseY, wall, 'zy-wall', 24, { light: 0.05 });
    b += GEO.facet([[-90, H * 0.40], [W * 0.5, H * 0.235], [W + 90, H * 0.385], [W - 40, H * 0.45], [40, H * 0.47]],
      roof, { light: 0.11, hl: 0.3, dark: 0.1, dl: 0.32 });
    b += GEO.facet([[-90, H * 0.40], [W * 0.5, H * 0.235], [W * 0.5 - 40, H * 0.45], [40, H * 0.47]],
      GEO.darken(roof, 0.15), { light: 0.08, hl: 0.22, dark: 0.08, dl: 0.26 });
    /* 瓦垄：沿两坡各铺一排薄瓦面，避免大块平涂 */
    var t2, rt = GEO.RNG('zy-tile');
    for (t2 = 0; t2 < 16; t2++) {
      var u0 = t2 / 16, u1 = (t2 + 1) / 16;
      /* 左坡：从檐口 (-90,H*0.40) 到屋脊 (W*0.5, H*0.235) */
      var la = [-90 + (W * 0.5 + 90) * u0, H * 0.40 + (H * 0.235 - H * 0.40) * u0];
      var lb = [-90 + (W * 0.5 + 90) * u1, H * 0.40 + (H * 0.235 - H * 0.40) * u1];
      b += GEO.facet([la, lb, [lb[0], lb[1] + H * 0.030], [la[0], la[1] + H * 0.030]],
        GEO.mul(roof, 0.86 + rt() * 0.26), { light: 0.06, hl: 0.18, dark: 0.06, dl: 0.16, sw: 0.4 });
      /* 右坡：从屋脊到檐口 (W+90, H*0.385) */
      var ra = [W * 0.5 + (W * 0.5 + 90) * u0, H * 0.235 + (H * 0.385 - H * 0.235) * u0];
      var rb = [W * 0.5 + (W * 0.5 + 90) * u1, H * 0.235 + (H * 0.385 - H * 0.235) * u1];
      b += GEO.facet([ra, rb, [rb[0], rb[1] + H * 0.026], [ra[0], ra[1] + H * 0.026]],
        GEO.mul(roof, 0.82 + rt() * 0.24), { light: 0.06, hl: 0.18, dark: 0.06, dl: 0.16, sw: 0.4 });
    }
    /* 屋脊 + 檐口压边 */
    b += GEO.poly([[W * 0.5 - 60, H * 0.238], [W * 0.5 + 60, H * 0.232],
      [W * 0.5 + 52, H * 0.208], [W * 0.5 - 52, H * 0.214]], GEO.darken(roof, 0.16), {});
    b += GEO.poly([[-100, H * 0.395], [W * 0.5, H * 0.243], [W + 100, H * 0.380],
      [W + 100, H * 0.402], [W * 0.5, H * 0.262], [-100, H * 0.417]], GEO.darken(roof, 0.34), {});
    /* 回廊：一排红漆柱 + 栏杆 + 拱券 */
    var i;
    for (i = 0; i < 9; i++) {
      var x = 120 + i * 222;
      b += GEO.facet([[x, H * 0.455], [x + 54, H * 0.455], [x + 48, baseY], [x + 6, baseY]], col,
        { light: 0.10, hl: 0.30, dark: 0.10, dl: 0.26 });
      b += GEO.poly([[x - 12, H * 0.455], [x + 66, H * 0.455], [x + 60, H * 0.425], [x - 6, H * 0.425]], GEO.darken(col, 0.24), {});
      b += GEO.poly([[x + 6, 760], [x + 48, 760], [x + 46, 790], [x + 8, 790]], GEO.darken(col, 0.18), {});
    }
    b += GEO.poly([[80, 756], [W - 60, 744], [W - 60, 772], [80, 784]], col, {});
    b += GEO.poly([[80, 900], [W - 60, 888], [W - 60, 916], [80, 928]], GEO.mul(col, 0.86), {});
    /* 窗与门 */
    b += latticeWindow(430, 540, 230, 190, GEO.darken(col, 0.34), '#7d8a92', 'zy-w1');
    b += latticeWindow(1260, 540, 230, 190, GEO.darken(col, 0.34), '#7d8a92', 'zy-w2');
    b += GEO.facet([[900, 540], [1030, 540], [1030, baseY], [900, baseY]], GEO.darken(col, 0.40),
      { light: 0.08, hl: 0.22, dark: 0.08, dl: 0.24 });
    /* 台阶 */
    b += GEO.stairs(760, baseY, 420, 120, 4, R(P.stone, 0.30));
    /* 院坝 */
    b += GEO.groundBand(W, H * 0.80, H + 30, R(P.stone, 0.30), { seed: 'zy-fl', cols: 13 });
    b += GEO.poly([[120, 1004], [700, 976], [780, 1040], [180, 1058]], A('#3a3228', 0.30), {});
    /* 炭盆（左前） */
    b += GEO.ell(330, 1000, 116, 44, R(P.metal, 0.22), {});
    b += GEO.ell(330, 986, 96, 34, GEO.darken(R(P.metal, 0.22), 0.34), {});
    b += GEO.poly([[262, 900], [398, 900], [382, 986], [278, 986]], GEO.darken(R(P.metal, 0.22), 0.12), {});
    var rng = GEO.RNG('zy-char'), k;
    for (k = 0; k < 14; k++) {
      b += GEO.poly([[300 + rng.range(-50, 50), 940 + rng.range(-16, 16)],
        [300 + rng.range(-40, 40), 946 + rng.range(-16, 16)], [300 + rng.range(-40, 40), 962 + rng.range(-14, 14)]],
        GEO.mul('#5a3a28', 0.8 + rng() * 0.5), {});
    }
    b += glowBlob(330, 950, 420, '#e08a2c', 0.32, 'zy-br');
    /* 晨光斜射 */
    b += GEO.poly([[1120, 0], [1920, 0], [1920, 420], [980, 120]], A('#ffe0a8', 0.10), {});
    b += GEO.vignette(W, H, 0.40, '#0c0d14');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch08 · 土城（土墙街道 / 硝烟）
   * ========================================================== */
  ART.scenes['bg_tucheng'] = function () {
    var mud = R(P.earth, 0.28), b = '';
    b += GEO.sky(W, H, ['#6d7076', '#87837c', '#a39784'], { horizon: H * 0.52 });
    /* R1-Q13：街市地平线以下的远景土坡（原来这片透舞台底色，洋红底重渲占 7.73%） */
    b += GEO.groundBand(W, H * 0.52 - 16, H * 0.80, GEO.mix(mud, '#a39784', 0.34), { seed: 'tc-v13', cols: 13, op: 0.68 });
    b += GEO.mistBand(W, H * 0.52 - 30, 120, '#a8a29a', { op: 0.28 });
    b += GEO.mountainRange(W, H * 0.52, R(P.rock, 0.5), { amp: 140, segs: 11, seed: 'tc-far', grad: '#8e8b84' });
    /* 左侧土墙房屋 */
    b += GEO.house(300, H * 0.72, 380, 300, 90, mud, R(P.tileDark, 0.09), {});
    b += GEO.house(700, H * 0.74, 300, 250, 80, GEO.mul(mud, 0.94), R(P.tileDark, 0.06), {});
    /* 右侧被炸塌的墙 */
    b += GEO.facet([[1180, H * 0.74], [1560, H * 0.74], [1520, H * 0.50], [1160, H * 0.56]],
      GEO.mul(mud, 0.9), { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.26, sw: 0.8 });
    b += GEO.facet([[1560, H * 0.74], [1860, H * 0.74], [1870, H * 0.48], [1600, H * 0.55]],
      GEO.mul(mud, 0.84), { light: 0.09, hl: 0.26, dark: 0.1, dl: 0.26, sw: 0.8 });
    /* 缺口处的碎砖 */
    var rng = GEO.RNG('tc-rub'), i;
    for (i = 0; i < 40; i++) {
      var x = rng.range(1100, 1800), y = rng.range(H * 0.74, H * 0.94);
      b += GEO.poly([[x, y], [x + rng.range(10, 32), y - rng.range(2, 10)], [x + rng.range(8, 26), y + rng.range(5, 14)]],
        GEO.mul(R(P.brick, 0.35), 0.8 + rng() * 0.5), {});
    }
    /* 街道 */
    b += GEO.groundBand(W, H * 0.78, H + 30, R(P.earth, 0.22), { seed: 'tc-fl', cols: 14 });
    b += GEO.poly([[760, H * 0.78], [1180, H * 0.78], [1420, H + 20], [520, H + 20]], A('#6b5a44', 0.36), {});
    /* 门板与散落的木料 */
    b += GEO.facet([[430, H * 0.78], [560, H * 0.78], [556, H * 0.62], [434, H * 0.63]], R(P.wood, 0.26),
      { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.24 });
    b += GEO.poly([[1500, H * 0.92], [1780, H * 0.80], [1792, H * 0.83], [1512, H * 0.95]], R(P.wood, 0.22), {});
    b += GEO.poly([[980, H * 0.90], [1240, H * 0.83], [1248, H * 0.86], [990, H * 0.93]], GEO.mul(R(P.wood, 0.22), 0.9), {});
    /* 弹痕：墙上深色小凹 */
    for (i = 0; i < 26; i++) {
      var hx = rng.range(1180, 1860), hy = rng.range(H * 0.50, H * 0.72);
      b += GEO.ell(hx, hy, rng.range(5, 12), rng.range(4, 10), A('#221a12', 0.6), {});
    }
    /* 硝烟 */
    b += GEO.smokePlume(520, H * 0.60, 460, A('#b6ada0', 0.34), 'tc-s1');
    b += GEO.smokePlume(1420, H * 0.54, 520, A('#a8a094', 0.30), 'tc-s2');
    b += GEO.mistBand(W, H * 0.72, 200, '#b9b2a4', { op: 0.30 });
    b += GEO.embers(W, H, 60, 'tc-emb', {});
    b += GEO.vignette(W, H, 0.48, '#14100c');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch08 · 指挥部·地图桌
   * ========================================================== */
ART.scenes['bg_map_table'] = function () {
    var wood = R(P.wood, 0.18), b = '';
    /* 帐篷布景（倾斜的帆布 + 支柱） */
    b += GEO.sky(W, H, ['#3a3630', '#332f2a', '#2a2621'], { horizon: H });
    var i;
    for (i = 0; i < 9; i++) {
      var ax = GEO.lerp(-200, W + 200, i / 9), bx = GEO.lerp(-200, W + 200, (i + 1) / 9);
      b += GEO.facet([[ax, -40], [bx, -40], [bx + 90, H * 0.72], [ax + 90, H * 0.72]],
        GEO.mul('#6b6055', 0.86 + (i % 4) * 0.06), { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.22, sw: 0.6 });
    }
    b += GEO.poly([[-40, H * 0.70], [W + 40, H * 0.66], [W + 40, H * 0.74], [-40, H * 0.78]], GEO.darken('#6b6055', 0.24), {});
    /* 支柱 */
    b += GEO.poly([[240, -30], [286, -30], [300, H * 0.74], [252, H * 0.76]], R(P.wood, 0.22), {});
    b += GEO.poly([[1620, -30], [1666, -30], [1686, H * 0.72], [1640, H * 0.74]], R(P.wood, 0.22), {});
    /* 前景：大木桌（斜置，占满下半） */
    b += GEO.facet([[-80, H * 0.72], [W + 80, H * 0.66], [W + 80, H + 40], [-80, H + 40]],
      R(P.wood, 0.24), { light: 0.09, hl: 0.26, dark: 0.09, dl: 0.24, sw: 0.8 });
    /* 桌面地图 */
    b += GEO.mapOnTable(360, H * 0.74, 1180, 300, R(P.paper, 0.46));
    /* 地图上的红蓝箭头与标注点 */
    var rng = GEO.RNG('mt-mark');
    for (i = 0; i < 26; i++) {
      var x = rng.range(430, 1460), y = rng.range(H * 0.755, H * 0.94);
      var red = rng() < 0.62;
      b += GEO.poly([[x, y], [x + 44, y - 9], [x + 40, y + 6]], red ? A(R(P.red, 0.4), 0.9) : A('#3a5a7a', 0.85), {});
    }
    for (i = 0; i < 12; i++) {
      var cx = rng.range(420, 1460), cy = rng.range(H * 0.76, H * 0.94);
      b += GEO.circle(cx, cy, 7, redMark(rng()), { stroke: A(P.ink, 0.5), sw: 1.2 });
    }
    function redMark(t) { return t < 0.5 ? A('#8a2a22', 0.9) : '#2c2c2c'; }
    /* 蜡烛 / 铅笔 / 搪瓷缸 / 电话机 */
    b += GEO.facet([[150, H * 0.86], [196, H * 0.856], [200, H * 0.79], [156, H * 0.795]], R(P.paper, 0.5),
      { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 });
    b += GEO.poly([[168, H * 0.78], [184, H * 0.778], [176, H * 0.735], [166, H * 0.737]], '#f2d488', {});
    b += glowBlob(176, H * 0.78, 460, '#f0bc62', 0.30, 'mt-c');
    b += GEO.poly([[1600, H * 0.855], [1760, H * 0.85], [1752, H * 0.885], [1596, H * 0.888]], R(P.wood, 0.30), {});
    b += GEO.poly([[1614, H * 0.848], [1640, H * 0.847], [1636, H * 0.812], [1612, H * 0.814]], '#3a3a3c', {});
    b += GEO.rect(1690, H * 0.60, 150, 120, R(P.metal, 0.34), { stroke: A(P.ink, 0.35), sw: 1.4 });
    b += GEO.rect(1700, H * 0.62, 130, 46, '#2c2c2e', {});
    b += GEO.ln(1760, H * 0.72, 1800, H * 0.80, '#2c2c2e', { sw: 7 });
    /* 马灯挂在支柱上 */
    b += GEO.lantern(250, 420, 46, '#f0c06a', {});
    b += glowBlob(250, 420, 520, '#e8a444', 0.20, 'mt-l');
    b += GEO.vignette(W, H, 0.54, '#08080a');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * 重做：飞夺泸定桥 / 赤水河（原版铁索与水流读不出来）
   * ========================================================== */

  /* ch15 · 泸定桥：十三根铁索横跨大渡河，桥板大半被抽走 */
  ART.scenes['bg_luding'] = function () {
    var b = GEO.rect(0, 0, W, H, R(P.rock, 0.24));
    var gorgeY = H * 0.46;
    b += GEO.sky(W, H, ['#39404f', '#5c6472', '#7d7264'], { horizon: gorgeY });
    /* 两岸绝壁 */
    b += GEO.cliffWall(-40, 470, -40, H + 40, R(P.rock, 0.12), { cols: 6 });
    b += GEO.cliffWall(1450, 1960, -40, H + 40, R(P.rock, 0.06), { cols: 6 });
    /* 对岸更远的崖与天光 */
    b += GEO.cliffWall(470, 1450, H * 0.30, H * 0.52, R(P.rock, 0.22), { cols: 7 });
    /* 河水 */
    b += GEO.waterBand(W, H * 0.60, H + 40, [R(P.water, 0.06), R(P.water, 0.22), R(P.water, 0.42)],
      { seed: 'ld-w', streaks: 240 });
    /* 急流白沫 */
    var rng = GEO.RNG('ld-foam'), i;
    for (i = 0; i < 120; i++) {
      var fx = rng.range(-20, W + 20), fy = rng.range(H * 0.62, H + 20);
      b += GEO.poly([[fx, fy], [fx + rng.range(30, 150), fy - rng.range(2, 10)],
        [fx + rng.range(26, 130), fy + rng.range(3, 10)]],
        GEO.alpha('#dfe9ee', 0.12 + rng() * 0.34), {});
    }
    /* 两岸桥楼（木构 + 瓦顶） */
    function bridgeHead(x, dir) {
      var s = '';
      s += GEO.facet([[x - 120 * dir, H * 0.44], [x + 120 * dir, H * 0.44],
        [x + 130 * dir, H * 0.66], [x - 130 * dir, H * 0.66]], R(P.wood, 0.18),
        { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26, sw: 0.9 });
      s += GEO.facet([[x - 155 * dir, H * 0.44], [x + 30 * dir, H * 0.36],
        [x + 165 * dir, H * 0.44], [x + 120 * dir, H * 0.485], [x - 120 * dir, H * 0.485]],
        R(P.tileDark, 0.07), { light: 0.11, hl: 0.3, dark: 0.1, dl: 0.3, sw: 0.9 });
      s += GEO.poly([[x - 40 * dir, H * 0.50], [x + 40 * dir, H * 0.50],
        [x + 36 * dir, H * 0.60], [x - 36 * dir, H * 0.60]], GEO.alpha('#150f0a', 0.85), {});
      return s;
    }
    b += bridgeHead(430, 1);
    b += bridgeHead(1490, -1);
    /* 十三根铁索：两端高、中段下垂 */
    var a0 = [455, H * 0.487], a1 = [1465, H * 0.487];
    var cc = [(a0[0] + a1[0]) / 2, H * 0.487 + 150];
    for (i = 0; i < 13; i++) {
      var row = (i - 6) * 26;
      var p0 = [a0[0] - 6, a0[1] + row * 0.55];
      var p2 = [a1[0] + 6, a1[1] + row * 0.55];
      var pc = [cc[0], cc[1] + row * 0.9];
      var d = 'M' + GEO.n(p0[0]) + ',' + GEO.n(p0[1]) + ' Q' + GEO.n(pc[0]) + ',' + GEO.n(pc[1]) +
        ' ' + GEO.n(p2[0]) + ',' + GEO.n(p2[1]);
      b += GEO.pth(d, null, { stroke: '#6a6a6a', sw: 4.6, cap: 'round' });
      b += GEO.pth(d, null, { stroke: '#c8c8c8', sw: 1.7, cap: 'round', opacity: 0.75 });
    }
    /* 剩下没被抽走的桥板：中段几块，歪歪扭扭 */
    var planksPos = [[880, 0.545], [930, 0.556], [1010, 0.548], [1060, 0.560], [1110, 0.552]];
    planksPos.forEach(function (pp, k) {
      var px = pp[0], py = H * pp[1];
      b += GEO.facet([[px - 46, py + (k % 2 ? 8 : -6)], [px + 46, py + (k % 2 ? 2 : -12)],
        [px + 46, py + 16 + (k % 2 ? 2 : -12)], [px - 46, py + 22 + (k % 2 ? 8 : -6)]],
        GEO.mul(R(P.wood, 0.26), 0.86 + (k % 3) * 0.09), { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.24, sw: 0.8 });
    });
    /* 对岸的火与烟 */
    b += GEO.smokePlume(1500, H * 0.42, 340, GEO.alpha('#8d8578', 0.28), 'ld-smk');
    b += GEO.campfire(1500, H * 0.605, 1.15, 'ld-f');
    for (i = 0; i < 6; i++) {
      b += GEO.torch(1150 + i * 54, H * 0.575, 52, {});
    }
    /* 近景：这一侧的桥头石与弹痕 */
    b += GEO.groundBand(W, H * 0.78, H + 30, R(P.stone, 0.22), { seed: 'ld-g', cols: 11 });
    for (i = 0; i < 30; i++) {
      b += GEO.ell(rng.range(60, 900), rng.range(H * 0.46, H * 0.72), rng.range(4, 10), rng.range(3, 8),
        GEO.alpha('#1c1712', 0.5), {});
    }
    b += GEO.vignette(W, H, 0.52, '#0a0c10');
    return GEO.doc(W, H, b, {});
  };

  /* ch08–ch11 · 赤水河：红砂岩峡谷 + 红褐色河水 */
  ART.scenes['bg_chishui'] = function () {
    var b = GEO.rect(0, 0, W, H, R(P.earthRed, 0.30));
    var hz = H * 0.50;
    b += GEO.sky(W, H, ['#6b7a8c', '#93a0ac', '#c2b49c'], { horizon: hz, glow: '#e8d3a8' });
    /* 远山：淡青 */
    b += GEO.mountainRange(W, hz - 10, R(P.rock, 0.34), { amp: 130, segs: 13, seed: 'cs-far', grad: '#a9b4bd' });
    /* 两岸红砂岩崖壁 */
    b += GEO.cliffWall(-40, 620, H * 0.30, H * 0.78, R(P.earthRed, 0.36), { cols: 7 });
    b += GEO.cliffWall(1340, 1960, H * 0.28, H * 0.78, R(P.earthRed, 0.28), { cols: 7 });
    /* 崖顶的土层与灌木 */
    b += GEO.facet([[-40, H * 0.30], [620, H * 0.29], [640, H * 0.36], [-40, H * 0.38]], R(P.earthRed, 0.46),
      { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.2, sw: 0.6 });
    b += GEO.facet([[1340, H * 0.28], [1960, H * 0.26], [1960, H * 0.35], [1320, H * 0.36]], R(P.earthRed, 0.40),
      { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.2, sw: 0.6 });
    b += GEO.shrubRow(700, H * 0.33, '#5c6b46', 'cs-sh1', 14, 22);
    b += GEO.shrubRow(1960, H * 0.32, '#556444', 'cs-sh2', 8, 20);
    /* 红褐色的水：横向波带，不是"木板" */
    var rng = GEO.RNG('cs-w'), i;
    b += GEO.rect(-10, hz, W + 20, H - hz + 20, R(P.waterRed, 0.34));
    for (i = 0; i < 34; i++) {
      var yy = hz + (H - hz) * Math.pow(i / 34, 1.25);
      var hh = 6 + i * 2.6;
      b += GEO.poly([[-20, yy], [W + 20, yy - 4], [W + 20, yy + hh], [-20, yy + hh]],
        GEO.mul(R(P.waterRed, 0.40), 0.9 + rng() * 0.2), { opacity: 0.9 });
    }
    for (i = 0; i < 90; i++) {
      var x = rng.range(-20, W), y = rng.range(hz + 20, H - 10);
      var len = rng.range(60, 320);
      b += GEO.poly([[x, y], [x + len, y - rng.range(1, 5)], [x + len * 0.94, y + rng.range(2, 6)], [x + 3, y + rng.range(3, 7)]],
        GEO.alpha('#f0dcb8', 0.10 + rng() * 0.24), {});
    }
    /* 渡口石阶（左下） */
    b += GEO.stairs(120, H * 0.78, 460, 170, 6, R(P.stone, 0.24));
    /* 渡船与竹筏 */
    b += GEO.woodenBoat(760, H * 0.80, 210, R(P.wood, 0.24), {});
    b += GEO.woodenBoat(1080, H * 0.86, 250, R(P.wood, 0.20), {});
    b += GEO.raft(520, H * 0.72, 120, R(P.bamboo, 0.30), 'cs-raft');
    /* 崖壁上的栈道与拉船的纤绳 */
    b += GEO.pline([[70, H * 0.62], [420, H * 0.60], [700, H * 0.615]], R(P.wood, 0.22), { sw: 7, opacity: 0.8 });
    b += GEO.pline([[420, H * 0.60], [520, H * 0.70]], R(P.wood, 0.26), { sw: 5, opacity: 0.7 });
    /* 浅雾 */
    b += GEO.mistBand(W, hz + 30, 150, '#e2d9c4', { op: 0.22 });
    b += GEO.vignette(W, H, 0.46, '#150e08');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * 第 2 批：雪山 / 草地 / 峡谷 / 小镇 / 黄土塬 / 会师 / 窑洞
   * ========================================================== */

  /* ch16 · 夹金山（雪脊 / 垭口 / 风雪） */
  ART.scenes['bg_snow_mountain'] = function () {
    var b = '';
    b += GEO.sky(W, H, P.sky.snow, { horizon: H * 0.42 });
    /* R1-Q13：雪脊与垭口之间的空隙（原来透舞台底色，洋红底重渲占 0.47%） */
    b += GEO.groundBand(W, H * 0.42 - 16, H + 40, GEO.mix(R(P.snow, 0.46), '#bdd2e2', 0.34), { seed: 'sm-v13', cols: 13, op: 0.60 });
    b += GEO.sunDisc(1420, 190, 96, '#e6ecf0', { glow: 0.22 });
    /* 远山：冷灰蓝 */
    b += GEO.mountainRange(W, H * 0.50, R(P.rock, 0.30), { amp: 250, segs: 15, seed: 'sm-f', grad: '#aebbca' });
    /* 主脊：雪山，带雪冠 */
    b += GEO.mountainRange(W, H * 0.62, R(P.snow, 0.42), {
      amp: 330, segs: 11, seed: 'sm-m', snowcap: true, snowColor: R(P.snow, 0.86), snowRatio: 0.56
    });
    b += GEO.mistBand(W, H * 0.60, 170, '#dbe6ee', { op: 0.44 });
    /* 垭口：中景雪坡与裂缝 */
    b += GEO.facet([[-40, H * 0.70], [520, H * 0.585], [980, H * 0.63], [1920, H * 0.70], [1920, H + 40], [-40, H + 40]],
      R(P.snow, 0.52), { light: 0.07, hl: 0.24, dark: 0.07, dl: 0.2, sw: 0.6 });
    var i, rng = GEO.RNG('sm-crack');
    for (i = 0; i < 7; i++) {
      var cx0 = rng.range(120, 1780), cy0 = rng.range(H * 0.66, H * 0.80);
      b += GEO.pline([[cx0, cy0], [cx0 + rng.range(60, 190), cy0 + rng.range(18, 46)]],
        GEO.alpha('#5f7488', 0.5), { sw: rng.range(4, 11) });
    }
    /* 近景：雪脊上的队伍剪影（背风行进） */
    b += marchLine(180, 1680, H * 0.94, 170, GEO.alpha('#5c6b7c', 0.88), 'sm-col', 13, { opacity: 0.88 });
    /* 风与雪 */
    b += GEO.mistBand(W, H * 0.74, 260, '#e8f1f7', { op: 0.30 });
    b += GEO.snowfall(W, H, 620, 'sm-snow', {});
    for (i = 0; i < 9; i++) {
      var wy = 120 + i * 96;
      b += GEO.pline([[0, wy], [rng.range(500, 1500), wy + rng.range(-18, 18)], [W, wy + rng.range(-26, 26)]],
        GEO.alpha('#ffffff', 0.14), { sw: rng.range(2, 6) });
    }
    b += GEO.vignette(W, H, 0.42, '#0e1720');
    return GEO.doc(W, H, b, {});
  };

  /* ch17 · 懋功会师（山城 / 旗队 / 栈道） */
  ART.scenes['bg_maogong'] = function () {
    var b = '';
    b += GEO.sky(W, H, P.sky.day, { horizon: H * 0.44 });
    /* R1-Q13：山脚到街面之间的远景山体（原来整片透舞台底色，洋红底重渲占 8.32%） */
    b += GEO.groundBand(W, H * 0.44 - 16, H * 0.72, GEO.mix(R(P.rock, 0.46), '#a6bfd4', 0.34), { seed: 'mg-v13', cols: 13, op: 0.70 });
    b += GEO.mistBand(W, H * 0.44 - 30, 130, '#cfdae0', { op: 0.32 });
    b += GEO.mountainRange(W, H * 0.46, R(P.rock, 0.42), { amp: 240, segs: 13, seed: 'mg-f', grad: '#93a3ad' });
    b += GEO.mistBand(W, H * 0.47, 120, '#cfdae0', { op: 0.34 });
    /* 山城：层层叠叠的石屋 */
    var rng = GEO.RNG('mg-town'), i;
    for (i = 0; i < 9; i++) {
      var t = i / 8;
      var x = -60 + t * 1900, y = H * 0.58 + Math.sin(t * 3.1) * 22;
      var w2 = 190 + rng.range(-40, 60), h2 = 150 + rng.range(-40, 70);
      b += GEO.house(x, y, w2, h2, 64, GEO.mul(R(P.plaster, 0.30), 0.9 + rng() * 0.2),
        R(P.tileDark, 0.10), { roofH: h2 * 0.4 });
    }
    /* 碉楼 */
    b += GEO.tower(1420, H * 0.62, 150, 320, R(P.stone, 0.26), R(P.tileDark, 0.08), { tiers: 3 });
    b += GEO.tower(300, H * 0.66, 120, 250, R(P.stone, 0.30), R(P.tileDark, 0.10), { tiers: 2 });
    /* 山道与栈道 */
    b += GEO.groundBand(W, H * 0.70, H + 30, R(P.stone, 0.26), { seed: 'mg-fl', cols: 14 });
    b += GEO.pline([[0, H * 0.80], [620, H * 0.755], [1300, H * 0.79], [1920, H * 0.762]], GEO.alpha('#6b5a44', 0.5), { sw: 46 });
    /* 会师的旗队：三处红旗群 */
    b += flagRow(260, H * 0.76, 380, 170, R(P.redFlag, 0.5), 4);
    b += flagRow(1420, H * 0.74, 340, 150, R(P.redFlag, 0.42), 3);
    b += GEO.flag(960, H * 0.62, 260, 150, R(P.redFlag, 0.55), {});
    /* 近景：两路队伍剪影相向而行 */
    b += marchLine(60, 760, H * 0.95, 150, GEO.alpha('#4e5a4a', 0.85), 'mg-c1', 7, { opacity: 0.88 });
    b += marchLine(1180, 1900, H * 0.97, 148, GEO.alpha('#4a5a62', 0.85), 'mg-c2', 7, { opacity: 0.88 });
    b += GEO.mistBand(W, H * 0.88, 160, '#d3dce2', { op: 0.22 });
    b += GEO.vignette(W, H, 0.38, '#101418');
    return GEO.doc(W, H, b, {});
  };

  /* ch17 · 松潘草地（沼泽 / 枯草 / 阴天） */
  ART.scenes['bg_grassland'] = function () {
    var b = '';
    b += GEO.sky(W, H, P.sky.overcast, { horizon: H * 0.40 });
    /* R1-Q13：草甸各带之间与地平线下方的空隙（原来透舞台底色，洋红底重渲占 1.46%） */
    b += GEO.groundBand(W, H * 0.40 - 16, H + 40, GEO.mix(R(P.grassDry, 0.30), '#c3cbd2', 0.26), { seed: 'gl-v13', cols: 14, op: 0.60 });
    b += GEO.cloudBank ? '' : '';
    /* 压得很低的阴云 */
    var rng = GEO.RNG('gl-cloud'), i;
    for (i = 0; i < 7; i++) {
      var cx0 = rng.range(-100, W), cy0 = rng.range(60, 260), w0 = rng.range(420, 780);
      b += GEO.facet([[cx0, cy0], [cx0 + w0 * 0.32, cy0 - rng.range(30, 70)], [cx0 + w0 * 0.72, cy0 - rng.range(10, 50)],
        [cx0 + w0, cy0 + rng.range(6, 30)], [cx0 + w0 * 0.5, cy0 + rng.range(30, 54)], [cx0, cy0 + rng.range(16, 40)]],
        GEO.mul(R(P.rock, 0.40), 0.86 + rng() * 0.2), { light: 0.06, hl: 0.18, dark: 0.06, dl: 0.16, sw: 0.5 });
    }
    b += GEO.mistBand(W, H * 0.38, 130, '#c8cfd4', { op: 0.32 });
    /* 草甸：一层层推向远方，无树 */
    b += GEO.groundBand(W, H * 0.42, H * 0.56, R(P.grassDry, 0.34), { seed: 'gl-1', cols: 14 });
    b += GEO.groundBand(W, H * 0.56, H * 0.72, R(P.grassDry, 0.26), { seed: 'gl-2', cols: 12 });
    b += GEO.groundBand(W, H * 0.72, H + 30, R(P.marsh, 0.30), { seed: 'gl-3', cols: 10 });
    /* 水洼：反光的天色 */
    for (i = 0; i < 13; i++) {
      var px = rng.range(40, W - 60), py = rng.range(H * 0.60, H * 0.96);
      var rw = rng.range(90, 340), rh = rw * rng.range(0.10, 0.20);
      b += GEO.ell(px, py, rw, rh, GEO.alpha('#93a7b4', 0.66), {});
      b += GEO.ell(px, py - rh * 0.2, rw * 0.86, rh * 0.5, GEO.alpha('#c3d2da', 0.42), {});
    }
    /* 枯草与芦苇 */
    b += GEO.grassTufts(W, H * 0.74, H + 10, R(P.grassDry, 0.30), 'gl-g', 260);
    b += GEO.reeds(W, H * 0.80, R(P.grassDry, 0.42), 'gl-r', 90);
    /* 远处的队伍：一条细线 */
    b += marchLine(420, 1520, H * 0.755, 74, GEO.alpha('#5a5c4e', 0.72), 'gl-c', 11, { opacity: 0.7 });
    b += GEO.rainfall(W, H, 300, 'gl-rain', {});
    b += GEO.mistBand(W, H * 0.86, 240, '#c2c8c4', { op: 0.24 });
    b += GEO.vignette(W, H, 0.46, '#141610');
    return GEO.doc(W, H, b, {});
  };

  /* ch18 · 腊子口（一线天 / 绝壁 / 木桥） */
  ART.scenes['bg_lazikou'] = function () {
    var b = '';
    b += GEO.sky(W, H, ['#7f92a6', '#9aa9b8', '#c2b39c'], { horizon: H * 0.30 });
    /* R1-Q13：地平线以下的远景谷壁。原来 x∈(660,1260)、y∈(324,~697) 这一整片没有任何地形图元，
       游戏里透出舞台底色（洋红底重渲占 9.61%）。这一层画在绝壁/激流/木桥/碉堡之下，只负责把空洞
       填成『远处退晕的岩体』，近景元素照旧压在上面。 */
    b += GEO.groundBand(W, H * 0.30 - 16, H * 0.64, GEO.mix(R(P.rock, 0.40), '#9aa9b8', 0.32), { seed: 'lz-v13', cols: 12, op: 0.72 });
    b += GEO.groundBand(W, H * 0.62, H + 40, GEO.mix(R(P.rock, 0.30), '#7f92a6', 0.22), { seed: 'lz-v13b', cols: 14, op: 0.8 });
    b += GEO.mistBand(W, H * 0.30 - 30, 120, '#aebcc6', { op: 0.30 });
    /* 左右绝壁夹成一线天，只在天顶露一线光 */
    b += GEO.cliffWall(-40, 660, H * 0.02, H + 40, R(P.rock, 0.24), { cols: 9 });
    b += GEO.cliffWall(1260, 1960, H * 0.02, H + 40, R(P.rock, 0.18), { cols: 9 });
    var i, rng = GEO.RNG('lz-rock');
    for (i = 0; i < 22; i++) {
      var side = i % 2 ? 1 : -1;
      var bx = side > 0 ? rng.range(1260, 1900) : rng.range(-20, 640);
      var by = rng.range(H * 0.05, H * 0.95);
      b += GEO.facet([[bx, by], [bx + side * rng.range(40, 130), by + rng.range(-26, 26)],
        [bx + side * rng.range(30, 110), by + rng.range(40, 130)]],
        GEO.mul(R(P.rock, 0.30), 0.8 + rng() * 0.4), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26, sw: 0.9 });
    }
    /* 谷底激流 */
    b += GEO.waterBand(W, H * 0.80, H + 30, [R(P.water, 0.10), R(P.water, 0.25), R(P.water, 0.40)], { seed: 'lz-w', streaks: 150 });
    /* 木桥：横跨谷口，桥面残破 */
    b += GEO.facet([[520, H * 0.66], [1260, H * 0.645], [1300, H * 0.70], [500, H * 0.72]],
      R(P.wood, 0.24), { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.26, sw: 0.9 });
    b += GEO.plankBridge(520, 1260, H * 0.66, 26, R(P.wood, 0.28), { gaps: 3 });
    b += GEO.poly([[500, H * 0.72], [620, H * 0.70], [604, H * 0.76], [488, H * 0.78]], R(P.wood, 0.18), {});
    /* 桥上方的碉堡与弹痕 */
    b += GEO.bunker(860, H * 0.44, 220, 150, R(P.concrete, 0.34));
    for (i = 0; i < 26; i++) {
      b += GEO.ell(rng.range(700, 1240), rng.range(H * 0.12, H * 0.58), rng.range(4, 11), rng.range(4, 9), GEO.alpha('#20191a', 0.5), {});
    }
    b += GEO.smokePlume(980, H * 0.40, 420, GEO.alpha('#b2aa9c', 0.34), 'lz-s');
    b += GEO.groundBand(W, H * 0.74, H * 0.82, R(P.stone, 0.20), { seed: 'lz-g', cols: 10 });
    b += GEO.vignette(W, H, 0.56, '#0a0c10');
    return GEO.doc(W, H, b, {});
  };

  /* ch19 · 哈达铺（小镇 / 店铺 / 报纸） */
  ART.scenes['bg_hadapu'] = function () {
    var b = '';
    b += GEO.sky(W, H, P.sky.clearDay, { horizon: H * 0.40 });
    /* R1-Q13：街面地平线以下的远景坡地（原来透舞台底色，洋红底重渲占 1.16%） */
    b += GEO.groundBand(W, H * 0.40 - 16, H + 40, GEO.mix(R(P.loess, 0.42), '#b6a281', 0.30), { seed: 'hd-v13', cols: 13, op: 0.62 });
    b += GEO.mountainRange(W, H * 0.42, R(P.loess, 0.42), { amp: 130, segs: 12, seed: 'hd-f', grad: '#b6a281' });
    /* 一条石板街斜向远处 */
    b += GEO.groundBand(W, H * 0.52, H + 30, R(P.stone, 0.30), { seed: 'hd-fl', cols: 12 });
    b += GEO.facet([[620, H * 0.54], [1300, H * 0.54], [1620, H + 30], [300, H + 30]], R(P.stone, 0.24),
      { light: 0.07, hl: 0.22, dark: 0.07, dl: 0.2, sw: 0.5 });
    /* 两侧店铺：木门脸 + 布幌 + 门板 */
    var rng = GEO.RNG('hd-shop'), i;
    for (i = 0; i < 5; i++) {
      var t = i / 4;
      var xl = -120 + t * 640, xr = 1380 + t * 580;
      var w2 = 300 - t * 40, h2 = 300 - t * 40;
      b += GEO.house(xl, H * 0.66 - t * 70, w2, h2, 70 - t * 10, GEO.mul(R(P.plaster, 0.34), 0.92 + rng() * 0.16), R(P.tileDark, 0.12), {});
      b += GEO.house(xr, H * 0.66 - t * 70, w2, h2, 70 - t * 10, GEO.mul(R(P.plaster, 0.32), 0.9 + rng() * 0.16), R(P.tileDark, 0.14), {});
      /* 布幌 */
      b += GEO.poly([[xl + w2 * 0.9, H * 0.40 - t * 70], [xl + w2 * 0.9 + 46, H * 0.40 - t * 70], [xl + w2 * 0.9 + 40, H * 0.52 - t * 70], [xl + w2 * 0.9 + 6, H * 0.52 - t * 70]],
        R(P.red, 0.34), {});
      b += GEO.poly([[xr - 46, H * 0.40 - t * 70], [xr, H * 0.40 - t * 70], [xr - 6, H * 0.52 - t * 70], [xr - 40, H * 0.52 - t * 70]],
        R(P.red, 0.30), {});
    }
    /* 邮政代办所 / 报纸摊（前景右） */
    b += GEO.facet([[1500, H * 0.74], [1830, H * 0.72], [1850, H * 0.86], [1490, H * 0.88]], R(P.wood, 0.26),
      { light: 0.1, hl: 0.28, dark: 0.1, dl: 0.24, sw: 0.8 });
    b += GEO.rect(1560, H * 0.62, 250, 120, R(P.paper, 0.52), { stroke: GEO.alpha(P.ink, 0.3), sw: 1.4 });
    for (i = 0; i < 6; i++) {
      b += GEO.ln(1580, H * 0.65 + i * 16, 1790 - (i % 3) * 30, H * 0.65 + i * 16, GEO.alpha(P.ink, 0.32), { sw: 1.6 });
    }
    /* 街上的人 */
    b += GEO.crowd(7, { x0: 520, x1: 1420, y0: H * 0.60, y1: H * 0.94, h: 220, color: R(P.cloth, 0.34), seed: 'hd-c', opacity: 0.9, hat: 'turban' });
    b += GEO.crowd(4, { x0: 700, x1: 1200, y0: H * 0.66, y1: H * 0.99, h: 300, color: R(P.uniform, 0.34), seed: 'hd-c2', opacity: 0.95, hat: 'oct' });
    b += GEO.vignette(W, H, 0.40, '#17130c');
    return GEO.doc(W, H, b, {});
  };

  /* ch19 · 吴起镇（黄土塬 / 窑洞 / 红旗） */
  ART.scenes['bg_wuqi'] = function () {
    var b = '';
    b += GEO.sky(W, H, ['#8fa6bd', '#bcc4c4', '#e0c79a'], { horizon: H * 0.42 });
    b += GEO.sunDisc(380, 210, 92, '#f2d59a', {});
    /* 层层黄土塬 */
    b += GEO.mountainRange(W, H * 0.44, R(P.loess, 0.52), { amp: 120, segs: 10, seed: 'wq-1', grad: '#c8ac82' });
    b += GEO.groundBand(W, H * 0.46, H * 0.60, R(P.loess, 0.46), { seed: 'wq-2', cols: 13 });
    b += GEO.groundBand(W, H * 0.60, H * 0.78, R(P.loess, 0.36), { seed: 'wq-3', cols: 11 });
    b += GEO.groundBand(W, H * 0.78, H + 30, R(P.loess, 0.26), { seed: 'wq-4', cols: 9 });
    /* 沟壑 */
    var i, rng = GEO.RNG('wq-gully');
    for (i = 0; i < 6; i++) {
      var gx = rng.range(200, 1700);
      b += GEO.pline([[gx, H * 0.48], [gx + rng.range(-60, 60), H * 0.64], [gx + rng.range(-120, 120), H * 0.80]],
        GEO.alpha('#8a7048', 0.55), { sw: rng.range(10, 30) });
    }
    /* 窑洞一排 */
    b += GEO.facet([[-40, H * 0.74], [W + 40, H * 0.70], [W + 40, H * 0.56], [-40, H * 0.60]],
      R(P.loess, 0.34), { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.2, sw: 0.6 });
    for (i = 0; i < 5; i++) {
      var dx = 180 + i * 350;
      var w2 = 190, h2 = 150;
      b += GEO.caveMouth(dx, H * 0.60, w2, h2, R(P.loess, 0.28), '#2a2118');
      b += GEO.rect(dx + w2 * 0.18, H * 0.585, w2 * 0.64, 26, R(P.paper, 0.44), { stroke: GEO.alpha(P.ink, 0.28), sw: 1 });
    }
    /* 红旗与标语墙 */
    b += GEO.flag(1480, H * 0.44, 300, 170, R(P.redFlag, 0.55), {});
    b += GEO.flag(1760, H * 0.50, 250, 140, R(P.redFlag, 0.48), {});
    b += flagRow(120, H * 0.72, 420, 150, R(P.redFlag, 0.42), 4);
    /* 窑洞前的队伍 */
    b += marchLine(260, 1560, H * 0.94, 130, GEO.alpha('#5b5442', 0.8), 'wq-c', 12, { opacity: 0.82 });
    b += GEO.smokePlume(760, H * 0.58, 200, GEO.alpha('#cbbfa8', 0.24), 'wq-smk');
    b += GEO.rainfall(W, H, 0, 'wq-none', {});
    b += GEO.vignette(W, H, 0.38, '#1a1408');
    return GEO.doc(W, H, b, {});
  };

  /* ch20 · 会宁大会师（城楼 / 三军旗 / 人海） */
  ART.scenes['bg_huining'] = function () {
    var b = GEO.rect(0, 0, W, H, R(P.loess, 0.34));
    b += GEO.sky(W, H, P.sky.dawnCold, { horizon: H * 0.40, glow: '#f0c88a' });
    b += GEO.sunDisc(1560, 200, 86, '#f7dfae', {});
    b += GEO.mountainRange(W, H * 0.44, R(P.loess, 0.50), { amp: 110, segs: 11, seed: 'hn-f', grad: '#b9a684' });
    /* 城墙 */
    b += GEO.cityWall(-40, W + 40, H * 0.62, 210, R(P.loess, 0.30));
    var i, rng = GEO.RNG('hn-wall');
    for (i = 0; i < 26; i++) {
      b += GEO.poly([[rng.range(-40, W), H * 0.62 - 24], [rng.range(-40, W) + 56, H * 0.62 - 24],
        [rng.range(-40, W) + 56, H * 0.62], [rng.range(-40, W), H * 0.62]],
        GEO.mul(R(P.loess, 0.36), 0.9 + rng() * 0.2), {});
    }
    /* 城楼三座 */
    b += GEO.tower(760, H * 0.58, 300, 320, R(P.loess, 0.34), R(P.tileDark, 0.10), { tiers: 3 });
    b += GEO.tower(300, H * 0.60, 220, 240, R(P.loess, 0.30), R(P.tileDark, 0.12), { tiers: 2 });
    b += GEO.tower(1400, H * 0.60, 220, 240, R(P.loess, 0.30), R(P.tileDark, 0.12), { tiers: 2 });
    /* 三军旗：红一方面军 / 红二方面军 / 红四方面军，旗列铺满城墙 */
    b += flagRow(120, H * 0.50, 1680, 210, R(P.redFlag, 0.55), 11);
    b += flagRow(420, H * 0.36, 1080, 150, R(P.redFlag, 0.44), 5);
    /* 城下的人海 */
    b += GEO.groundBand(W, H * 0.76, H + 30, R(P.loess, 0.22), { seed: 'hn-fl', cols: 12 });
    b += GEO.crowd(22, { x0: -40, x1: W + 40, y0: H * 0.66, y1: H * 0.74, h: 210, color: R(P.uniform, 0.36), seed: 'hn-c1', opacity: 0.94, hat: 'oct' });
    b += GEO.crowd(13, { x0: 160, x1: 1760, y0: H * 0.78, y1: H * 0.86, h: 250, color: R(P.uniform, 0.30), seed: 'hn-c2', opacity: 0.97, hat: 'oct' });
    b += GEO.crowd(7, { x0: 640, x1: 1320, y0: H * 0.90, y1: H * 0.96, h: 300, color: R(P.cloth, 0.30), seed: 'hn-c3', opacity: 1, hat: 'turban' });
    b += GEO.embers(W, H, 40, 'hn-emb', {});
    b += GEO.mistBand(W, H * 0.80, 180, '#ded0b4', { op: 0.20 });
    b += GEO.vignette(W, H, 0.40, '#161009');
    return GEO.doc(W, H, b, {});
  };

  /* ch19 · 延安窑洞（室内 / 油灯 / 地图） */
ART.scenes['bg_yanan_cave'] = function () {
    var b = '';
    b += GEO.sky(W, H, ['#3c3128', '#332a22', '#28211b'], { horizon: H });
    /* 拱形土壁 */
    b += GEO.pth('M -40 ' + (H + 40) + ' L -40 ' + (H * 0.34) + ' Q ' + (W * 0.5) + ' ' + (H * 0.02) + ' ' + (W + 40) + ' ' + (H * 0.34) +
      ' L ' + (W + 40) + ' ' + (H + 40) + ' Z', R(P.loess, 0.22));
    /* 土壁的横向夯层：明度差极小，避免"线框/格子"感 */
    var i, rng = GEO.RNG('ya-wall');
    for (i = 0; i < 11; i++) {
      var yy0 = -30 + i * (H * 0.115);
      b += GEO.facet([[-40, yy0], [W + 40, yy0 - 22], [W + 40, yy0 + H * 0.10], [-40, yy0 + H * 0.118]],
        GEO.mul(R(P.loess, 0.19), 0.9 + (i % 4) * 0.045), { light: 0.05, hl: 0.14, dark: 0.05, dl: 0.14, sw: 0.4 });
    }
    /* 窗纸：冷夜光 */
    b += GEO.poly([[1420, 300], [1740, 276], [1740, 560], [1420, 546]], R(P.paper, 0.34), { stroke: GEO.alpha(P.ink, 0.35), sw: 2 });
    b += GEO.poly([[1452, 306], [1712, 288], [1712, 548], [1452, 534]], GEO.alpha('#cbd8de', 0.34), {});
    for (i = 1; i < 4; i++) b += GEO.ln(1420 + i * 80, 292, 1420 + i * 80, 552, GEO.alpha(P.ink, 0.32), { sw: 2.4 });
    b += glowBlob(1580, 420, 420, '#9fb6c4', 0.14, 'ya-win');
    /* 土炕与木桌 */
    b += GEO.facet([[-40, H * 0.78], [900, H * 0.74], [940, H + 40], [-40, H + 40]], R(P.loess, 0.26),
      { light: 0.08, hl: 0.22, dark: 0.08, dl: 0.2, sw: 0.7 });
    b += GEO.facet([[880, H * 0.80], [1560, H * 0.78], [1620, H + 40], [900, H + 40]], R(P.wood, 0.22),
      { light: 0.09, hl: 0.26, dark: 0.09, dl: 0.24, sw: 0.8 });
    /* 满墙的作战地图 */
    b += GEO.rect(300, 240, 900, 420, R(P.paper, 0.44), { stroke: GEO.alpha(P.ink, 0.34), sw: 3 });
    for (i = 0; i < 14; i++) {
      b += GEO.pline([[340, 300 + i * 26], [1100 - rng.range(0, 160), 300 + i * 26 + rng.range(-7, 7)]],
        GEO.alpha('#6b5a3c', 0.55), { sw: rng.range(1.4, 3) });
    }
    /* 地图上的小箭头：整齐的作战标记，而不是随机色块 */
    for (i = 0; i < 18; i++) {
      var ax2 = 366 + (i % 6) * 128 + rng.range(-14, 14);
      var ay2 = 300 + Math.floor(i / 6) * 96 + rng.range(-12, 12);
      b += GEO.poly([[ax2, ay2], [ax2 + 46, ay2 - 10], [ax2 + 39, ay2 + 7]], GEO.alpha(R(P.red, 0.44), 0.9), {});
      b += GEO.circle(ax2 - 12, ay2 - 4, 6, GEO.alpha('#2c3a4a', 0.85), {});
    }
    /* 油灯 + 桌上物件 */
    b += GEO.facet([[1180, H * 0.80], [1240, H * 0.796], [1236, H * 0.72], [1186, H * 0.724]], R(P.metal, 0.30),
      { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 });
    b += GEO.poly([[1196, H * 0.71], [1230, H * 0.708], [1213, H * 0.655], [1200, H * 0.657]], '#f2d488', {});
    b += glowBlob(1213, H * 0.72, 760, '#e8a83c', 0.34, 'ya-lamp');
    b += GEO.rect(440, H * 0.80, 300, 46, R(P.paper, 0.5), { stroke: GEO.alpha(P.ink, 0.3), sw: 1.4 });
    b += GEO.rect(820, H * 0.82, 120, 60, R(P.metal, 0.28), { stroke: GEO.alpha(P.ink, 0.3), sw: 1.2 });
    b += GEO.facet([[1330, H * 0.99], [1560, H * 0.97], [1600, H + 40], [1300, H + 40]], R(P.wood, 0.16),
      { light: 0.07, hl: 0.2, dark: 0.07, dl: 0.18 });
    b += GEO.vignette(W, H, 0.58, '#0a0806');
    return GEO.doc(W, H, b, {});
  };
  /* ==========================================================
   * 新增场景的局部通用块（避免改动冻结的 art/geosvg.js）
   * ========================================================== */
  /** 冬季枯树：树干 + 分叉枝条，无叶 */
  function sbBareTree(x, y, h, color, seed) {
    var rng = GEO.RNG(seed || 'bare'), s = '', i;
    s += GEO.poly([[x - h * 0.030, y], [x + h * 0.030, y], [x + h * 0.016, y - h * 0.58], [x - h * 0.016, y - h * 0.58]], color, {});
    for (i = 0; i < 8; i++) {
      var t = 0.30 + i * 0.070;
      var bx = x + (i % 2 ? 1 : -1) * h * 0.008;
      var by = y - h * t;
      var dx = (i % 2 ? 1 : -1) * h * rng.range(0.10, 0.24);
      var dy = -h * rng.range(0.09, 0.20);
      s += GEO.ln(bx, by, bx + dx, by + dy, color, { sw: h * 0.012, cap: 'round', opacity: 0.96 });
      s += GEO.ln(bx + dx * 0.55, by + dy * 0.55, bx + dx * 1.08, by + dy * 0.72, color, { sw: h * 0.007, cap: 'round', opacity: 0.9 });
      s += GEO.ln(bx + dx * 0.70, by + dy * 0.70, bx + dx * 0.92, by + dy * 1.04, color, { sw: h * 0.005, cap: 'round', opacity: 0.82 });
    }
    return s;
  }

  /** 坐姿剪影：给镇口戏台上的老财用 */
  function sbSeated(cx, gy, h, color, rng) {
    var s = '', hd = h * 0.13;
    s += GEO.circle(cx, gy - h * 0.66, hd * 0.52, GEO.mul(color, 0.94), {});
    s += GEO.poly([[cx - h * 0.10, gy - h * 0.60], [cx + h * 0.10, gy - h * 0.60],
      [cx + h * 0.15, gy - h * 0.34], [cx - h * 0.15, gy - h * 0.34]], color, {});
    s += GEO.poly([[cx - h * 0.15, gy - h * 0.36], [cx + h * 0.15, gy - h * 0.36],
      [cx + h * 0.24, gy - h * 0.10], [cx - h * 0.22, gy - h * 0.10]], GEO.mul(color, 0.90), {});
    s += GEO.poly([[cx - h * 0.22, gy - h * 0.12], [cx + h * 0.24, gy - h * 0.12],
      [cx + h * 0.26, gy], [cx - h * 0.26, gy]], GEO.mul(color, 0.82), {});
    s += GEO.ln(cx - h * 0.12, gy - h * 0.38, cx - h * 0.20, gy - h * 0.20, GEO.mul(color, 0.78), { sw: h * 0.028, cap: 'round' });
    s += GEO.ln(cx + h * 0.12, gy - h * 0.38, cx + h * 0.20, gy - h * 0.20, GEO.mul(color, 0.78), { sw: h * 0.028, cap: 'round' });
    return s;
  }

  /** 靠桌/俯身剪影：教室会议用 */
  function sbLean(cx, gy, h, color, lean, rng) {
    var s = '', k = lean == null ? 0.16 : lean;
    s += GEO.circle(cx + h * k * 0.30, gy - h * 0.84, h * 0.062, GEO.mul(color, 0.96), {});
    s += GEO.poly([[cx - h * 0.085, gy - h * 0.78], [cx + h * 0.085, gy - h * 0.78],
      [cx + h * (0.10 + k), gy - h * 0.42], [cx - h * (0.10 - k), gy - h * 0.42]], color, {});
    s += GEO.ln(cx - h * 0.06, gy - h * 0.70, cx - h * (0.16 + k), gy - h * 0.47, GEO.mul(color, 0.82), { sw: h * 0.028, cap: 'round' });
    s += GEO.ln(cx + h * 0.06, gy - h * 0.70, cx + h * (0.18 + k), gy - h * 0.46, GEO.mul(color, 0.82), { sw: h * 0.028, cap: 'round' });
    s += GEO.poly([[cx - h * 0.075, gy - h * 0.46], [cx + h * 0.085, gy - h * 0.46],
      [cx + h * 0.095, gy], [cx - h * 0.085, gy]], GEO.mul(color, 0.88), {});
    return s;
  }

  /* ==========================================================
   * ch06 · 猴场镇口（1935-01 傍晚 / 薄雪 / 镇口戏台）
   * ========================================================== */
  ART.scenes['bg_houchang_street'] = function () {
    var b = '', rng = GEO.RNG('hs');
    var wall = R(P.loess, 0.34), wallDark = R(P.loess, 0.24), roof = R(P.tileDark, 0.08);
    b += GEO.sky(W, H, ['#0b1220', '#131c30', '#232d43'], { horizon: H * 0.56 });
    b += GEO.stars(W, H * 0.52, 120, 'hs-stars');
    b += GEO.ell(1580, 168, 58, 54, '#dfe2d2', { opacity: 0.86 });
    b += GEO.ell(1580, 168, 152, 122, A('#dfe2d2', 0.10), {});
    b += GEO.mountainRange(W, H * 0.55, R(P.rock, 0.32), { amp: 110, segs: 13, seed: 'hs-far', grad: '#3c4558' });
    /* 镇口土坯房：门楼右侧，房屋压住两翼 */
    b += GEO.house(150, H * 0.755, 330, 210, 80, wallDark, roof, { windows: 2, windowGlow: '#e0a552' });
    b += GEO.house(420, H * 0.745, 250, 180, 70, wall, roof, { windows: 1, windowGlow: '#d69a4c' });
    b += GEO.house(1400, H * 0.750, 300, 195, 80, wall, roof, { windows: 2, windowGlow: '#e0a552' });
    b += GEO.house(1660, H * 0.760, 300, 175, 70, wallDark, roof, { windows: 1 });
    /* 木镇门 */
    var gx = 1210, gy = H * 0.775;
    b += GEO.facet([[gx - 150, gy], [gx + 150, gy], [gx + 150, gy - 214], [gx - 150, gy - 214]], wallDark,
      { light: 0.07, hl: 0.22, dark: 0.08, dl: 0.20, sw: 0.6 });
    b += GEO.rect(gx - 52, gy - 152, 104, 152, A('#120d09', 0.90), {});
    b += GEO.rect(gx - 162, gy - 218, 24, 218, R(P.wood, 0.24), {});
    b += GEO.rect(gx + 138, gy - 218, 24, 218, R(P.wood, 0.24), {});
    b += GEO.facet([[gx - 196, gy - 214], [gx + 196, gy - 214], [gx + 154, gy - 272], [gx - 154, gy - 272]], roof,
      { light: 0.10, hl: 0.28, dark: 0.10, dl: 0.28, sw: 0.7 });
    for (var gt = 0; gt < 7; gt++) {
      b += GEO.ln(gx - 148 + gt * 49, gy - 272, gx - 148 + gt * 49, gy - 220, A('#1b1712', 0.5), { sw: 2 });
    }
    /* 枯树 */
    b += sbBareTree(1060, H * 0.795, 300, R(P.wood, 0.16), 'hs-bt1');
    b += sbBareTree(1790, H * 0.800, 340, R(P.wood, 0.14), 'hs-bt2');
    /* 薄雪地面 */
    b += GEO.groundBand(W, H * 0.775, H + 30, R(P.snow, 0.54), { seed: 'hs-gnd', cols: 15, rows: 4 });
    b += GEO.poly([[-60, H * 0.790], [W + 60, H * 0.766], [W + 60, H * 0.818], [-60, H * 0.844]], A('#eef4f8', 0.30), {});
    /* 矮石台戏台 */
    var sx0 = 250, sx1 = 1010, st = H * 0.695, sb = H * 0.808;
    b += GEO.facet([[sx0, st], [sx1, st], [sx1 + 46, sb], [sx0 - 34, sb]], R(P.stone, 0.28),
      { light: 0.08, hl: 0.26, dark: 0.09, dl: 0.24, sw: 0.8 });
    b += GEO.facet([[sx0, st], [sx1, st], [sx1 - 6, st + 20], [sx0 + 4, st + 20]], R(P.stone, 0.42),
      { light: 0.10, hl: 0.30, dark: 0.08, dl: 0.22, sw: 0.6 });
    for (var sk = 0; sk < 8; sk++) {
      var kx = sx0 - 10 + sk * 100;
      b += GEO.poly([[kx, st + 40 + (sk % 2) * 10], [kx + 88, st + 38 + (sk % 2) * 10],
        [kx + 84, st + 76 + (sk % 2) * 10], [kx + 2, st + 78 + (sk % 2) * 10]],
        GEO.mul(R(P.stone, 0.30), 0.86 + rng() * 0.24), { opacity: 0.72 });
    }
    /* 粗布幕与两根木杆 */
    var ct = st - 360, cb = st - 12, cl0 = 520, cl1 = 940;
    b += GEO.ln(470, st - 4, 470, ct - 20, R(P.wood, 0.26), { sw: 9 });
    b += GEO.ln(950, st - 4, 950, ct - 20, R(P.wood, 0.26), { sw: 9 });
    for (var cf = 0; cf < 10; cf++) {
      var fx0 = GEO.lerp(cl0, cl1, cf / 10), fx1 = GEO.lerp(cl0, cl1, (cf + 1) / 10);
      b += GEO.facet([[fx0, ct], [fx1, ct + (cf % 2 ? 5 : -3)], [fx1, cb], [fx0, cb - (cf % 2 ? 4 : -2)]],
        GEO.mul(R(P.cloth, 0.30), 0.84 + (cf % 4) * 0.055), { light: 0.05, hl: 0.16, dark: 0.06, dl: 0.16, sw: 0.4 });
    }
    b += GEO.poly([[cl0 - 10, ct - 14], [cl1 + 10, ct - 14], [cl1 + 10, ct + 8], [cl0 - 10, ct + 8]], R(P.wood, 0.24), {});
    /* 两盏油灯：画面唯一的暖光 */
    b += glowBlob(505, 456, 430, '#e8a84c', 0.28, 'hs-l1');
    b += glowBlob(935, 456, 430, '#e8a84c', 0.24, 'hs-l2');
    b += GEO.lantern(505, 456, 26, '#f0bd63', { hang: ct + 4 });
    b += GEO.lantern(935, 456, 26, '#f0bd63', { hang: ct + 4 });
    /* 台上：宣传员与老财 */
    b += GEO.silhouette(688, st + 12, 218, R(P.cloth, 0.46), GEO.RNG('hs-actor'), 0.55, 'cap');
    b += GEO.poly([[664, st - 194], [714, st - 196], [708, st - 176], [670, st - 174]], R(P.uniform, 0.34), {});
    b += sbSeated(902, st + 14, 186, R(P.cloth, 0.30), GEO.RNG('hs-lord'));
    b += GEO.poly([[878, st - 108], [930, st - 110], [934, st - 84], [874, st - 82]], R(P.uniform, 0.26), {});
    /* 台下乡亲：分两翼站，给中下部留出立绘位置 */
    b += GEO.crowd(20, { x0: -40, x1: 760, y0: H * 0.842, y1: H * 0.985, h: 250, color: R(P.cloth, 0.26), seed: 'hs-c1', opacity: 0.95, hat: 'turban' });
    b += GEO.crowd(16, { x0: 1120, x1: 1960, y0: H * 0.848, y1: H * 0.990, h: 250, color: R(P.cloth, 0.24), seed: 'hs-c2', opacity: 0.95, hat: 'turban' });
    b += GEO.crowd(5, { x0: 810, x1: 1060, y0: H * 0.878, y1: H * 0.990, h: 270, color: R(P.uniform, 0.28), seed: 'hs-c3', opacity: 0.95, hat: 'cap' });
    /* 把孩子扛在肩上的父亲 */
    b += GEO.silhouette(348, H * 0.945, 250, R(P.cloth, 0.20), GEO.RNG('hs-dad'), 0.5, 'turban');
    b += GEO.silhouette(352, H * 0.790, 108, R(P.cloth, 0.34), GEO.RNG('hs-kid'), 0.2, 'none');
    /* 呼出的白气、雪与炊烟 */
    b += GEO.smokePlume(300, H * 0.60, 220, A('#b9b8ae', 0.16), 'hs-smk');
    b += GEO.snowfall(W, H, 220, 'hs-snow', {});
    b += GEO.mistBand(W, H * 0.84, 110, '#c9ced6', { op: 0.18 });
    b += GEO.vignette(W, H, 0.46, '#080b14');
    return GEO.doc(W, H, b, {});
  };
  /* ==========================================================
   * ch07 · 遵义街头（1935-01 冬日 / 石板街 / 店铺）
   * ========================================================== */
  ART.scenes['bg_zunyi_street'] = function () {
    var b = '', rng = GEO.RNG('zs'), i;
    b += GEO.sky(W, H, ['#6b7f9e', '#aeb8c2', '#d9d2c2'], { horizon: H * 0.42, glow: '#efd3a2' });
    b += GEO.sunDisc(330, 188, 70, '#f3d9a8', {});
    b += GEO.cloudBank(W, H * 0.20, '#c2c5c4', { seed: 'zs-cl', count: 7, opacity: 0.32 });
    b += GEO.mountainRange(W, H * 0.44, R(P.rock, 0.42), { amp: 110, segs: 12, seed: 'zs-far', grad: '#8e96a0' });
    b += GEO.mistBand(W, H * 0.44, 120, '#c9cdd2', { op: 0.30 });
    /* 石板街：中间一条亮一些的车辙道 */
    b += GEO.groundBand(W, H * 0.54, H + 30, R(P.stone, 0.30), { seed: 'zs-gnd', cols: 14, rows: 6 });
    b += GEO.facet([[790, H * 0.54], [1130, H * 0.54], [1490, H + 30], [430, H + 30]], R(P.stone, 0.42),
      { light: 0.07, hl: 0.22, dark: 0.06, dl: 0.16, sw: 0.4 });
    /* 两侧两层木铺面：由远及近叠压 */
    for (i = 3; i >= 0; i--) {
      var t = i / 3;
      var yy = H * 0.800 - t * H * 0.165;
      var hh = 330 - t * 145;
      var ww = 335 - t * 95;
      var lx = 120 + t * 300;
      var rx = W - 120 - t * 300;
      var dd = 78 - t * 20;
      b += GEO.house(lx, yy, ww, hh, dd, GEO.mul(R(P.plaster, 0.34), 0.92 + rng() * 0.14), R(P.tileDark, 0.10),
        { windows: 2, windowGlow: '#e7b976' });
      b += GEO.house(rx, yy, ww, hh, dd, GEO.mul(R(P.plaster, 0.32), 0.90 + rng() * 0.16), R(P.tileDark, 0.12),
        { windows: 2, windowGlow: '#e0ad68' });
      /* 二层挑出的木栏与檐下横梁 */
      b += GEO.rect(lx - ww * 0.42, yy - hh * 0.92, ww * 0.84, 12, R(P.woodRed, 0.26), { opacity: 0.85 });
      b += GEO.rect(rx - ww * 0.42, yy - hh * 0.92, ww * 0.84, 12, R(P.woodRed, 0.26), { opacity: 0.85 });
    }
    /* 左侧药铺：整面小木抽屉药柜（只画空抽屉，不画字） */
    b += GEO.rect(28, H * 0.505, 258, 222, R(P.wood, 0.24), { stroke: A(P.ink, 0.35), sw: 2 });
    for (var dr = 0; dr < 6; dr++) {
      for (var dc = 0; dc < 6; dc++) {
        var dx0 = 40 + dc * 40, dy0 = H * 0.520 + dr * 32;
        b += GEO.rect(dx0, dy0, 34, 26, GEO.mul(R(P.wood, 0.34), 0.86 + ((dr + dc) % 3) * 0.08),
          { stroke: A(P.ink, 0.22), sw: 0.8 });
        b += GEO.circle(dx0 + 17, dy0 + 13, 2.4, R(P.gold, 0.46), {});
      }
    }
    /* 右侧布店：靛蓝与灰布匹 */
    b += GEO.rect(1600, H * 0.548, 270, 214, R(P.wood, 0.22), { stroke: A(P.ink, 0.32), sw: 1.6 });
    for (i = 0; i < 9; i++) {
      var bx = 1616 + (i % 3) * 82, by = H * 0.565 + Math.floor(i / 3) * 48;
      var bc = i % 2 ? R(P.water, 0.34) : R(P.cloth, 0.32);
      b += GEO.facet([[bx, by], [bx + 70, by - 4], [bx + 70, by + 34], [bx, by + 38]], bc,
        { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.22, sw: 0.6 });
    }
    /* 米行：敞口麻袋 */
    for (i = 0; i < 4; i++) {
      var mx = 1370 + i * 54, my = H * 0.760 + (i % 2) * 18;
      b += GEO.poly([[mx - 26, my], [mx + 26, my], [mx + 30, my - 72], [mx - 30, my - 72]], R(P.sand, 0.34), {});
      b += GEO.poly([[mx - 28, my - 72], [mx + 28, my - 72], [mx + 20, my - 86], [mx - 20, my - 86]], R(P.sand, 0.52), {});
      b += GEO.ell(mx, my - 74, 22, 7, R(P.sand, 0.66), { opacity: 0.9 });
    }
    /* 剃头摊：布棚、凳子、铜盆 */
    b += GEO.ln(1238, H * 0.795, 1238, H * 0.560, R(P.wood, 0.28), { sw: 7 });
    b += GEO.ln(1452, H * 0.795, 1452, H * 0.578, R(P.wood, 0.28), { sw: 7 });
    b += GEO.poly([[1208, H * 0.560], [1482, H * 0.578], [1450, H * 0.630], [1240, H * 0.612]], R(P.cloth, 0.34),
      { stroke: A(P.ink, 0.20), sw: 1 });
    b += GEO.rect(1300, H * 0.742, 96, 14, R(P.wood, 0.30), {});
    b += GEO.ln(1312, H * 0.752, 1312, H * 0.808, R(P.wood, 0.26), { sw: 7 });
    b += GEO.ln(1384, H * 0.752, 1384, H * 0.808, R(P.wood, 0.26), { sw: 7 });
    b += GEO.ell(1392, H * 0.704, 34, 13, R(P.metal, 0.38), {});
    b += GEO.ell(1392, H * 0.702, 26, 9, R(P.metal, 0.56), { opacity: 0.9 });
    /* 空白的红纸灯笼 */
    b += GEO.lantern(300, H * 0.512, 24, R(P.red, 0.40), { hang: H * 0.492 });
    b += GEO.lantern(560, H * 0.548, 20, R(P.red, 0.36), { hang: H * 0.528 });
    b += GEO.lantern(1620, H * 0.548, 24, R(P.red, 0.40), { hang: H * 0.528 });
    b += GEO.lantern(1830, H * 0.518, 20, R(P.red, 0.36), { hang: H * 0.498 });
    /* 街上的市民与战士 */
    b += GEO.crowd(9, { x0: 600, x1: 1320, y0: H * 0.620, y1: H * 0.870, h: 235, color: R(P.cloth, 0.30), seed: 'zs-c1', opacity: 0.94, hat: 'turban' });
    b += GEO.crowd(6, { x0: 780, x1: 1220, y0: H * 0.660, y1: H * 0.910, h: 250, color: R(P.uniform, 0.30), seed: 'zs-c2', opacity: 0.96, hat: 'cap' });
    /* 挑担的脚夫 */
    b += GEO.silhouette(470, H * 0.860, 240, R(P.cloth, 0.22), GEO.RNG('zs-porter'), 0.8, 'turban');
    b += GEO.ln(408, H * 0.760, 540, H * 0.752, R(P.wood, 0.30), { sw: 5 });
    b += GEO.ell(404, H * 0.792, 30, 15, R(P.wood, 0.34), {});
    b += GEO.ell(544, H * 0.784, 30, 15, R(P.wood, 0.34), {});
    b += GEO.vignette(W, H, 0.40, '#17130c');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch13 · 冕宁县政府·土牢（1935-05 / 被砸开的衙门）
   * ========================================================== */
  ART.scenes['bg_mianning_yamen'] = function () {
    var b = '', rng = GEO.RNG('my'), i;
    b += GEO.sky(W, H, ['#7d8794', '#a3a9ae', '#c4c0b4'], { horizon: H * 0.34 });
    b += GEO.cloudBank(W, H * 0.16, '#b9bcc0', { seed: 'my-cl', count: 6, opacity: 0.36 });
    b += GEO.mountainRange(W, H * 0.36, R(P.rock, 0.40), { amp: 95, segs: 11, seed: 'my-far', grad: '#8b9098' });
    /* 石板院坝 */
    b += GEO.groundBand(W, H * 0.56, H + 30, R(P.stone, 0.28), { seed: 'my-gnd', cols: 15, rows: 7 });
    /* 后排办公房：低矮瓦顶木构 */
    b += GEO.house(420, H * 0.615, 700, 178, 66, R(P.plaster, 0.30), R(P.tileDark, 0.10), { windows: 3 });
    b += GEO.house(1230, H * 0.610, 520, 170, 62, R(P.plaster, 0.28), R(P.tileDark, 0.12), { windows: 2 });
    /* 院子两侧的厢房 */
    b += GEO.house(90, H * 0.690, 280, 190, 62, R(P.plaster, 0.26), R(P.tileDark, 0.12), { windows: 1 });
    b += GEO.house(1810, H * 0.690, 280, 190, 62, R(P.plaster, 0.26), R(P.tileDark, 0.12), { windows: 1 });
    /* 三间土牢：右侧一排，中间一间敞着 */
    var cells = [1120, 1348, 1576];
    for (i = 0; i < 3; i++) {
      var cx0 = cells[i] - 96, cy0 = H * 0.735;
      b += GEO.facet([[cx0, cy0], [cx0 + 192, cy0], [cx0 + 192, cy0 - 150], [cx0, cy0 - 150]], R(P.loess, 0.26),
        { light: 0.07, hl: 0.24, dark: 0.09, dl: 0.24, sw: 0.7 });
      b += GEO.facet([[cx0 - 12, cy0 - 150], [cx0 + 204, cy0 - 150], [cx0 + 184, cy0 - 176], [cx0 + 8, cy0 - 176]], R(P.tileDark, 0.10),
        { light: 0.09, hl: 0.26, dark: 0.09, dl: 0.26 });
      b += GEO.rect(cx0 + 44, cy0 - 118, 104, 118, A('#140f0b', 0.90), {});
      if (i !== 1) {
        /* 上锁的牢门：铁链 + 大锁 */
        b += GEO.ln(cx0 + 44, cy0 - 74, cx0 + 148, cy0 - 66, R(P.metal, 0.34), { sw: 5 });
        b += GEO.circle(cx0 + 96, cy0 - 70, 9, 'none', { stroke: R(P.metal, 0.46), sw: 4 });
        b += GEO.rect(cx0 + 86, cy0 - 66, 20, 24, R(P.metalRust, 0.34), { stroke: A(P.ink, 0.4), sw: 1 });
      } else {
        /* 敞开的牢门：湿稻草、铁镣、小木窗 */
        b += GEO.rect(cx0 + 44, cy0 - 118, 104, 118, A('#2a2118', 0.92), {});
        for (var st = 0; st < 16; st++) {
          var sy = cy0 - 12 - rng.range(0, 16);
          b += GEO.ln(cx0 + 52 + rng.range(0, 88), sy, cx0 + 62 + rng.range(0, 92), sy + rng.range(-4, 4),
            R(P.grassDry, 0.44), { sw: rng.range(1.4, 3.2), opacity: 0.85 });
        }
        b += GEO.circle(cx0 + 78, cy0 - 30, 9, 'none', { stroke: R(P.metal, 0.40), sw: 3.4 });
        b += GEO.circle(cx0 + 112, cy0 - 30, 9, 'none', { stroke: R(P.metal, 0.40), sw: 3.4 });
        b += GEO.ln(cx0 + 86, cy0 - 30, cx0 + 104, cy0 - 30, R(P.metal, 0.36), { sw: 3 });
        b += GEO.rect(cx0 + 106, cy0 - 104, 34, 34, A('#101820', 0.85), {});
        for (var bar = 1; bar < 4; bar++) {
          b += GEO.ln(cx0 + 106 + bar * 8, cy0 - 104, cx0 + 106 + bar * 8, cy0 - 70, R(P.wood, 0.26), { sw: 2.4 });
        }
      }
      /* 墙根积水 */
      b += GEO.poly([[cx0 + 6, cy0], [cx0 + 186, cy0], [cx0 + 198, cy0 + 22], [cx0 - 6, cy0 + 22]],
        A('#3a4652', 0.42), {});
    }
    /* 被砸开的大门：两片裂开的门板压在画面两缘 */
    b += GEO.facet([[0, H * 0.155], [250, H * 0.205], [318, H + 40], [0, H + 40]], R(P.wood, 0.20),
      { light: 0.08, hl: 0.26, dark: 0.10, dl: 0.26, sw: 0.8 });
    b += GEO.facet([[W, H * 0.175], [W - 236, H * 0.220], [W - 302, H + 40], [W, H + 40]], R(P.wood, 0.18),
      { light: 0.07, hl: 0.24, dark: 0.09, dl: 0.24, sw: 0.8 });
    for (i = 0; i < 6; i++) {
      b += GEO.ln(30 + i * 38, H * 0.20 + i * 12, 80 + i * 34, H * 0.72 + i * 20, A('#160f0a', 0.65), { sw: 3 });
      b += GEO.ln(W - 30 - i * 38, H * 0.22 + i * 12, W - 80 - i * 34, H * 0.70 + i * 20, A('#160f0a', 0.65), { sw: 3 });
    }
    /* 院中积水与泡着的玉米芯 */
    b += GEO.poly([[180, H * 0.890], [660, H * 0.872], [760, H * 0.960], [240, H * 0.986]], A('#4a5660', 0.42), {});
    b += GEO.poly([[240, H * 0.902], [560, H * 0.890], [610, H * 0.944], [270, H * 0.958]], A('#9aa6ad', 0.18), {});
    for (i = 0; i < 4; i++) {
      var kx = 300 + i * 78, ky = H * 0.938 + (i % 2) * 12;
      b += GEO.ell(kx, ky, 18, 7, R(P.gold, 0.38), { transform: 'rotate(' + (-18 + i * 9) + ' ' + kx + ' ' + ky + ')' });
    }
    /* 被放出来的彝族百姓 */
    b += GEO.crowd(10, { x0: 300, x1: 1010, y0: H * 0.760, y1: H * 0.930, h: 235, color: R(P.earthRed, 0.24), seed: 'my-c1', opacity: 0.96, hat: 'turban' });
    b += GEO.crowd(5, { x0: 380, x1: 900, y0: H * 0.790, y1: H * 0.950, h: 245, color: R(P.cloth, 0.22), seed: 'my-c2', opacity: 0.96, hat: 'none' });
    /* 抱石头的老人 */
    b += GEO.silhouette(980, H * 0.930, 220, R(P.earthRed, 0.20), GEO.RNG('my-old'), 0.2, 'turban');
    b += GEO.circle(1006, H * 0.862, 30, R(P.rock, 0.34), {});
    b += GEO.ln(986, H * 0.884, 1002, H * 0.872, R(P.earthRed, 0.18), { sw: 8, cap: 'round' });
    b += GEO.vignette(W, H, 0.50, '#0d0c0a');
    return GEO.doc(W, H, b, {});
  };
  /** 攀崖的战士：贴在岩壁上，四肢向两侧抓握 */
  function sbClimber(cx, cy, h, color, rifle) {
    var s = '';
    s += GEO.circle(cx, cy - h * 0.30, h * 0.095, GEO.mul(color, 0.96), {});
    s += GEO.poly([[cx - h * 0.095, cy - h * 0.22], [cx + h * 0.095, cy - h * 0.22],
      [cx + h * 0.125, cy + h * 0.06], [cx - h * 0.125, cy + h * 0.06]], color, {});
    s += GEO.ln(cx - h * 0.06, cy - h * 0.16, cx - h * 0.24, cy - h * 0.32, GEO.mul(color, 0.84), { sw: h * 0.040, cap: 'round' });
    s += GEO.ln(cx + h * 0.06, cy - h * 0.16, cx + h * 0.22, cy - h * 0.02, GEO.mul(color, 0.84), { sw: h * 0.040, cap: 'round' });
    s += GEO.ln(cx - h * 0.07, cy + h * 0.04, cx - h * 0.19, cy + h * 0.28, GEO.mul(color, 0.80), { sw: h * 0.045, cap: 'round' });
    s += GEO.ln(cx + h * 0.07, cy + h * 0.04, cx + h * 0.20, cy + h * 0.24, GEO.mul(color, 0.80), { sw: h * 0.045, cap: 'round' });
    if (rifle) s += GEO.ln(cx + h * 0.14, cy + h * 0.12, cx - h * 0.20, cy - h * 0.28, R(P.wood, 0.24), { sw: h * 0.040, cap: 'round' });
    return s;
  }

  /* ==========================================================
   * ch18 · 夜攀腊子口绝壁（1935-09 夜 / 岩壁 / 绑腿绳）
   * ========================================================== */
  ART.scenes['bg_lazikou_cliff_night'] = function () {
    var b = '', rng = GEO.RNG('lcn'), i, j;
    b += GEO.sky(W, H, ['#050912', '#0a1222', '#141e32'], { horizon: H * 0.20 });
    b += GEO.stars(W, H * 0.24, 120, 'lcn-stars');
    /* 整幅岩壁：先铺底，再用不规则块面压出碎裂感 */
    b += GEO.poly([[-40, H * 0.10], [W + 40, H * 0.04], [W + 40, H + 40], [-40, H + 40]], R(P.rock, 0.12), {});
    for (j = 0; j < 8; j++) {
      var gy0 = H * (0.10 + j * 0.113);
      for (i = 0; i < 11; i++) {
        var gx0 = -60 + i * 190;
        var x0 = gx0 + rng.range(-36, 26), x1 = gx0 + 190 + rng.range(-26, 36);
        var y0 = gy0 + rng.range(-26, 22), y1 = gy0 + H * 0.118 + rng.range(-20, 30);
        var lit = 0.72 + (1 - i / 11) * 0.34 + (1 - j / 8) * 0.16;
        var rc = GEO.mul(R(P.rock, 0.14 + (j % 3) * 0.018), lit);
        b += GEO.facet([[x0, y0], [x1, y0 + rng.range(-14, 14)], [x1 - rng.range(4, 26), y1], [x0 + rng.range(4, 22), y1 - rng.range(-10, 10)]],
          rc, { light: 0.10, hl: 0.30, dark: 0.12, dl: 0.30, sw: 0.5 });
      }
    }
    /* 上缘被星光勾亮 */
    for (i = 0; i < 9; i++) {
      var sx = i * 230 - 40;
      b += GEO.facet([[sx, H * 0.115 + rng.range(-12, 12)], [sx + 220, H * 0.100 + rng.range(-12, 12)],
        [sx + 214, H * 0.128 + rng.range(-8, 8)], [sx + 6, H * 0.142 + rng.range(-8, 8)]],
        A('#a9b6c6', 0.26), {});
    }
    /* 岩缝与窄石棱 */
    var ledge = [[660, -20], [742, H * 0.22], [704, H * 0.48], [790, H * 0.70], [736, H + 30], [812, H + 30], [872, H * 0.66], [792, H * 0.44], [840, H * 0.20], [748, -20]];
    b += GEO.poly(ledge, A('#0c1017', 0.68), {});
    for (i = 0; i < 18; i++) {
      var cx0 = rng.range(40, W - 40), cy0 = rng.range(H * 0.12, H * 0.92);
      b += GEO.ln(cx0, cy0, cx0 + rng.range(-46, 46), cy0 + rng.range(40, 150), A('#080b11', 0.55), { sw: rng.range(2, 7) });
    }
    /* 首尾相接的绑腿长绳 */
    for (i = 0; i < 40; i++) {
      var t0 = i / 40, t1 = (i + 1) / 40;
      var rx0 = GEO.lerp(986, 884, t0) + Math.sin(t0 * 7.5) * 12;
      var rx1 = GEO.lerp(986, 884, t1) + Math.sin(t1 * 7.5) * 12;
      var ry0 = -20 + t0 * (H * 0.82);
      var ry1 = -20 + t1 * (H * 0.82);
      b += GEO.facet([[rx0 - 5, ry0], [rx0 + 5, ry0], [rx1 + 5, ry1], [rx1 - 5, ry1]],
        i % 3 === 0 ? A('#9a9486', 0.88) : A('#736e64', 0.86),
        { light: 0.12, hl: 0.30, dark: 0.10, dl: 0.26, sw: 0.3 });
      if (i % 4 === 0) b += GEO.rect(rx0 - 9, ry0 - 2, 18, 6, A('#4c4942', 0.82), {});
    }
    /* 攀崖的战士：三个高度，一个背着步枪 */
    b += sbClimber(900, H * 0.590, 190, R(P.uniform, 0.26), false);
    b += sbClimber(946, H * 0.420, 176, R(P.uniform, 0.22), true);
    b += sbClimber(858, H * 0.730, 210, R(P.uniform, 0.30), false);
    /* 右下角：峡谷深处的木桥与极小枪火 */
    b += GEO.poly([[1440, H * 0.745], [W + 40, H * 0.715], [W + 40, H + 40], [1500, H + 40]], A('#0c1420', 0.94), {});
    b += GEO.poly([[1540, H * 0.900], [W + 40, H * 0.876], [W + 40, H + 40], [1580, H + 40]], A('#142232', 0.92), {});
    b += GEO.plankBridge(1548, 1900, H * 0.884, 16, R(P.wood, 0.24), { gaps: [4, 9] });
    b += glowBlob(1690, H * 0.862, 220, '#e0913c', 0.16, 'lcn-m1');
    b += GEO.poly([[1674, H * 0.868], [1702, H * 0.856], [1684, H * 0.886]], '#f2ba68', {});
    b += GEO.poly([[1760, H * 0.858], [1786, H * 0.848], [1770, H * 0.878]], '#e8a24c', {});
    b += GEO.vignette(W, H, 0.62, '#04060b');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch18 · 甘南黄土坡（1935-09 晨 / 空阔高原 / 行军纵队）
   * ========================================================== */
  ART.scenes['bg_gannan_loess'] = function () {
    var b = '', rng = GEO.RNG('gl'), i;
    b += GEO.sky(W, H, ['#8fa6bd', '#bcc4c4', '#e0c79a'], { horizon: H * 0.34 });
    b += GEO.sunDisc(350, 196, 78, '#f2d59a', {});
    b += GEO.cloudBank(W, H * 0.16, '#d3d0c4', { seed: 'gl-cl', count: 6, opacity: 0.30 });
    b += GEO.mountainRange(W, H * 0.380, R(P.loess, 0.58), { amp: 96, segs: 12, seed: 'gl-f1', grad: '#cbb287' });
    b += GEO.groundBand(W, H * 0.360, H * 0.560, R(P.loess, 0.50), { seed: 'gl-b1', cols: 13, rows: 4 });
    b += GEO.mountainRange(W, H * 0.505, R(P.loess, 0.44), { amp: 128, segs: 11, seed: 'gl-f2', grad: '#b89d74' });
    b += GEO.groundBand(W, H * 0.500, H + 30, R(P.loess, 0.42), { seed: 'gl-gnd', cols: 14, rows: 7 });
    /* 远处梯田：一层层薄土埂，不画成网格 */
    for (i = 0; i < 6; i++) {
      var ty = H * (0.405 + i * 0.030);
      b += GEO.facet([[-60, ty], [W + 60, ty - 18 + i * 4], [W + 60, ty + 10 + i * 4], [-60, ty + 26]],
        GEO.mul(R(P.loess, 0.54), 0.92 + i * 0.025), { light: 0.06, hl: 0.18, dark: 0.05, dl: 0.14, sw: 0.4, opacity: 0.72 });
      b += GEO.ln(-40, ty + 26, W + 40, ty + 8 + i * 4, A('#7a6244', 0.26), { sw: 2.2 });
    }
    /* 深切的干沟 */
    b += GEO.poly([[920, H * 0.470], [1070, H * 0.500], [1140, H * 0.620], [1280, H * 0.760], [1330, H + 40], [1010, H + 40], [980, H * 0.760], [850, H * 0.610], [830, H * 0.510]],
      R(P.loess, 0.22), { stroke: A('#6b5539', 0.35), sw: 1 });
    b += GEO.poly([[850, H * 0.505], [925, H * 0.500], [1010, H * 0.640], [1080, H * 0.790], [1010, H + 40], [860, H + 40], [890, H * 0.760], [800, H * 0.610]],
      A('#6f583c', 0.34), {});
    /* 另一条浅沟，打破对称 */
    b += GEO.poly([[240, H * 0.540], [360, H * 0.560], [420, H * 0.700], [520, H * 0.820], [500, H + 40], [330, H + 40], [300, H * 0.820], [220, H * 0.690]],
      A('#725a3d', 0.30), {});
    /* 蜿蜒下行的土路 */
    var col = [[1420, 0.585], [1348, 0.606], [1270, 0.631], [1310, 0.657], [1208, 0.681], [1118, 0.709], [1038, 0.738], [966, 0.770], [892, 0.806], [812, 0.843], [732, 0.881], [654, 0.922], [584, 0.966]];
    var pathPts = [];
    for (i = 0; i < col.length; i++) pathPts.push([col[i][0], H * col[i][1]]);
    b += GEO.pline(pathPts, R(P.sand, 0.52), { sw: 30, cap: 'round', join: 'round', opacity: 0.72 });
    b += GEO.pline(pathPts, R(P.sand, 0.66), { sw: 12, cap: 'round', join: 'round', opacity: 0.68 });
    /* 沿路下行的纵队：越近越大 */
    for (i = 0; i < col.length; i++) {
      b += GEO.silhouette(col[i][0], H * col[i][1], 54 + i * 5.2, R(P.uniform, 0.26), rng, 0.55, 'cap');
    }
    /* 枯草、光秃灌木 */
    b += GEO.grassTufts(W, H * 0.520, H * 0.985, R(P.grassDry, 0.34), 'gl-grass', 340);
    b += GEO.shrubRow(W, H * 0.555, R(P.shrub, 0.24), 'gl-shrub1', 26, 22);
    b += GEO.shrubRow(W, H * 0.640, R(P.shrub, 0.20), 'gl-shrub2', 18, 30);
    /* 沟底薄雾 */
    b += GEO.mistBand(W, H * 0.690, 150, '#d7cbb2', { op: 0.22 });
    b += GEO.mistBand(W, H * 0.845, 120, '#cabda4', { op: 0.16 });
    b += GEO.vignette(W, H, 0.42, '#17120b');
    return GEO.doc(W, H, b, {});
  };
  /* ==========================================================
   * ch19 · 哈达铺读报会议（1935-09 下午 / 小学教室）
   * ========================================================== */
  ART.scenes['bg_hadapu_school'] = function () {
    var b = '', rng = GEO.RNG('hds'), i;
    b += GEO.rect(0, 0, W, H, R(P.plaster, 0.24));
    b += GEO.sky(W, H, ['#a49c8c', '#b4ac9a', '#c4baa6'], { horizon: H * 0.735 });
    /* 白灰土墙：大块面，明度差很小 */
    for (i = 0; i < 7; i++) {
      var wy = i * H * 0.108;
      b += GEO.facet([[-40, wy], [W + 40, wy - 18], [W + 40, wy + H * 0.104], [-40, wy + H * 0.120]],
        GEO.mul(R(P.plaster, 0.26), 0.93 + (i % 3) * 0.045), { light: 0.05, hl: 0.16, dark: 0.05, dl: 0.14, sw: 0.4 });
    }
    /* 夯土地面 */
    b += GEO.groundBand(W, H * 0.735, H + 30, R(P.earth, 0.28), { seed: 'hds-fl', cols: 13, rows: 5 });
    /* 后墙长黑板：擦得干净，不画任何字 */
    b += GEO.rect(430, H * 0.150, 800, 300, R(P.wood, 0.20), { stroke: A(P.ink, 0.35), sw: 3 });
    b += GEO.rect(454, H * 0.168, 752, 258, '#2f3938', { stroke: A('#101716', 0.6), sw: 2 });
    b += GEO.poly([[454, H * 0.168], [1206, H * 0.168], [1188, H * 0.205], [470, H * 0.205]], A('#4b5654', 0.24), {});
    b += GEO.rect(424, H * 0.470, 812, 16, R(P.wood, 0.30), {});
    /* 左侧纸窗：冷白天光 */
    b += GEO.rect(90, H * 0.120, 300, 372, R(P.wood, 0.24), { stroke: A(P.ink, 0.35), sw: 3 });
    b += GEO.rect(112, H * 0.142, 256, 328, A('#c9d5d8', 0.72), {});
    for (i = 1; i < 4; i++) b += GEO.rect(112 + i * 64, H * 0.142, 5, 328, R(P.wood, 0.24), {});
    for (i = 1; i < 3; i++) b += GEO.rect(112, H * 0.142 + i * 108, 256, 5, R(P.wood, 0.24), {});
    b += glowBlob(120, H * 0.28, 620, '#c6d4d8', 0.14, 'hds-win');
    b += GEO.poly([[112, H * 0.485], [368, H * 0.485], [760, H * 0.985], [400, H * 0.985]], A('#d8e0dc', 0.16), {});
    /* 靠墙推着的长凳与课桌 */
    b += GEO.rect(70, H * 0.700, 230, 18, R(P.wood, 0.28), {});
    b += GEO.ln(92, H * 0.712, 92, H * 0.800, R(P.wood, 0.24), { sw: 8 });
    b += GEO.ln(276, H * 0.712, 276, H * 0.800, R(P.wood, 0.24), { sw: 8 });
    b += GEO.rect(1420, H * 0.700, 340, 20, R(P.wood, 0.26), {});
    b += GEO.ln(1450, H * 0.714, 1450, H * 0.805, R(P.wood, 0.22), { sw: 9 });
    b += GEO.ln(1730, H * 0.714, 1730, H * 0.805, R(P.wood, 0.22), { sw: 9 });
    /* 俯在桌边看报的人：先画人，再让桌面压住下半身 */
    var cols = R(P.uniform, 0.28);
    b += sbLean(790, H * 0.788, 244, cols, 0.20, rng);
    b += sbLean(880, H * 0.792, 238, GEO.mul(cols, 0.94), 0.16, rng);
    b += sbLean(968, H * 0.790, 246, GEO.mul(cols, 0.88), 0.22, rng);
    b += sbLean(1054, H * 0.794, 232, GEO.mul(cols, 0.96), 0.14, rng);
    b += sbLean(1146, H * 0.786, 240, GEO.mul(cols, 0.90), 0.24, rng);
    /* 旧八仙桌 */
    b += GEO.facet([[720, H * 0.652], [1310, H * 0.640], [1328, H * 0.690], [712, H * 0.702]], R(P.wood, 0.22),
      { light: 0.09, hl: 0.28, dark: 0.09, dl: 0.24, sw: 0.8 });
    b += GEO.facet([[712, H * 0.702], [1328, H * 0.690], [1320, H * 0.716], [720, H * 0.728]], R(P.wood, 0.16),
      { light: 0.06, hl: 0.18, dark: 0.07, dl: 0.18 });
    b += GEO.ln(760, H * 0.724, 748, H * 0.812, R(P.wood, 0.18), { sw: 14 });
    b += GEO.ln(1280, H * 0.712, 1300, H * 0.802, R(P.wood, 0.18), { sw: 14 });
    /* 摊满桌的旧报纸：只有折痕与空白版面，不画字 */
    for (i = 0; i < 7; i++) {
      var nx = 760 + (i % 4) * 128, ny = H * 0.655 + Math.floor(i / 4) * 34;
      b += GEO.poly([[nx, ny], [nx + 116, ny - 4], [nx + 122, ny + 26], [nx + 4, ny + 30]], R(P.paper, 0.52),
        { stroke: A(P.ink, 0.16), sw: 0.8 });
      b += GEO.ln(nx + 56, ny, nx + 60, ny + 28, A('#8b8273', 0.24), { sw: 1.2 });
    }
    /* 举到光下的一张报 */
    b += GEO.poly([[1168, H * 0.430], [1268, H * 0.414], [1276, H * 0.520], [1176, H * 0.536]], R(P.paper, 0.60),
      { stroke: A(P.ink, 0.24), sw: 1 });
    b += GEO.ln(1222, H * 0.422, 1228, H * 0.528, A('#8b8273', 0.26), { sw: 1.4 });
    /* 搪瓷缸与折起的地图 */
    b += GEO.rect(1244, H * 0.618, 34, 40, R(P.white, 0.60), { stroke: A(P.ink, 0.26), sw: 1 });
    b += GEO.ell(1261, H * 0.618, 17, 6, R(P.white, 0.72), {});
    b += GEO.rect(1244, H * 0.630, 34, 6, R(P.water, 0.30), { opacity: 0.8 });
    b += GEO.poly([[1010, H * 0.640], [1104, H * 0.632], [1116, H * 0.676], [1022, H * 0.684]], R(P.paper, 0.44),
      { stroke: A(P.ink, 0.20), sw: 0.8 });
    b += GEO.ln(1058, H * 0.636, 1068, H * 0.680, A('#7d7464', 0.28), { sw: 1 });
    b += GEO.vignette(W, H, 0.46, '#100d09');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch19 · 榜罗镇小学会议（1935-09 白天 / 两张长桌）
   * ========================================================== */
  ART.scenes['bg_bangluo_school'] = function () {
    var b = '', rng = GEO.RNG('bls'), i;
    b += GEO.rect(0, 0, W, H, R(P.plaster, 0.22));
    b += GEO.sky(W, H, ['#a79c88', '#b8ad97', '#c9bda5'], { horizon: H * 0.720 });
    /* 粗糙白灰墙 */
    for (i = 0; i < 8; i++) {
      var wy = i * H * 0.096;
      b += GEO.facet([[-40, wy], [W + 40, wy - 20], [W + 40, wy + H * 0.092], [-40, wy + H * 0.106]],
        GEO.mul(R(P.plaster, 0.24), 0.91 + (i % 4) * 0.035), { light: 0.05, hl: 0.14, dark: 0.05, dl: 0.13, sw: 0.4 });
    }
    /* 夯土地面 */
    b += GEO.groundBand(W, H * 0.720, H + 30, R(P.earth, 0.24), { seed: 'bls-fl', cols: 13, rows: 5 });
    /* 后墙黑板：抹得干净 */
    b += GEO.rect(520, H * 0.140, 880, 268, R(P.wood, 0.18), { stroke: A(P.ink, 0.36), sw: 3 });
    b += GEO.rect(544, H * 0.158, 832, 228, '#343d3a', { stroke: A('#101614', 0.58), sw: 2 });
    b += GEO.poly([[544, H * 0.158], [1376, H * 0.158], [1356, H * 0.192], [560, H * 0.192]], A('#505a56', 0.22), {});
    b += GEO.rect(514, H * 0.402, 892, 15, R(P.wood, 0.28), {});
    /* 左侧纸窗：日光斜照到地面 */
    b += GEO.rect(80, H * 0.118, 300, 360, R(P.wood, 0.22), { stroke: A(P.ink, 0.34), sw: 3 });
    b += GEO.rect(102, H * 0.140, 256, 316, A('#cdd7d6', 0.74), {});
    for (i = 1; i < 4; i++) b += GEO.rect(102 + i * 64, H * 0.140, 5, 316, R(P.wood, 0.22), {});
    for (i = 1; i < 3; i++) b += GEO.rect(102, H * 0.140 + i * 104, 256, 5, R(P.wood, 0.22), {});
    b += glowBlob(110, H * 0.280, 600, '#c8d4d4', 0.15, 'bls-win');
    b += GEO.poly([[102, H * 0.470], [358, H * 0.470], [702, H * 0.978], [380, H * 0.978]], A('#dbe2dc', 0.17), {});
    /* 两张深色长木桌拼在一起 */
    b += GEO.facet([[560, H * 0.642], [1330, H * 0.628], [1348, H * 0.674], [552, H * 0.690]], R(P.wood, 0.18),
      { light: 0.09, hl: 0.26, dark: 0.09, dl: 0.24, sw: 0.8 });
    b += GEO.facet([[552, H * 0.690], [1348, H * 0.674], [1338, H * 0.700], [560, H * 0.716]], R(P.wood, 0.13),
      { light: 0.06, hl: 0.16, dark: 0.07, dl: 0.16 });
    b += GEO.facet([[620, H * 0.742], [1320, H * 0.730], [1328, H * 0.758], [614, H * 0.770]], R(P.wood, 0.16),
      { light: 0.07, hl: 0.20, dark: 0.08, dl: 0.20 });
    for (i = 0; i < 3; i++) {
      b += GEO.ln(640 + i * 300, H * 0.706, 634 + i * 300, H * 0.812, R(P.wood, 0.15), { sw: 13 });
      b += GEO.ln(640 + i * 300, H * 0.762, 634 + i * 300, H * 0.846, R(P.wood, 0.15), { sw: 13 });
    }
    /* 长凳 */
    b += GEO.rect(660, H * 0.782, 600, 14, R(P.wood, 0.22), {});
    b += GEO.ln(700, H * 0.794, 700, H * 0.856, R(P.wood, 0.18), { sw: 8 });
    b += GEO.ln(1220, H * 0.794, 1220, H * 0.856, R(P.wood, 0.18), { sw: 8 });
    /* 沿桌坐着的人 */
    var c1 = R(P.uniform, 0.26);
    b += sbSeated(660, H * 0.742, 208, c1, rng);
    b += sbSeated(760, H * 0.744, 212, GEO.mul(c1, 0.94), rng);
    b += sbSeated(860, H * 0.742, 204, GEO.mul(c1, 0.88), rng);
    b += sbSeated(960, H * 0.746, 214, GEO.mul(c1, 0.96), rng);
    b += sbSeated(1060, H * 0.742, 206, GEO.mul(c1, 0.90), rng);
    b += sbSeated(1160, H * 0.744, 212, GEO.mul(c1, 0.86), rng);
    b += sbSeated(1258, H * 0.742, 204, GEO.mul(c1, 0.94), rng);
    /* 桌首站着说话的人：抬起一只手 */
    b += GEO.silhouette(1372, H * 0.792, 258, R(P.uniform, 0.30), GEO.RNG('bls-spk'), 0.5, 'cap');
    b += GEO.ln(1378, H * 0.720, 1442, H * 0.646, R(P.uniform, 0.24), { sw: 13, cap: 'round' });
    b += GEO.circle(1446, H * 0.640, 10, GEO.mul(R(P.uniform, 0.30), 0.94), {});
    /* 桌上的水壶、纸张与铅笔 */
    b += GEO.rect(960, H * 0.608, 38, 42, R(P.metal, 0.26), { stroke: A(P.ink, 0.24), sw: 1 });
    b += GEO.poly([[996, H * 0.626], [1018, H * 0.620], [1018, H * 0.634], [996, H * 0.638]], R(P.metal, 0.24), {});
    b += GEO.rect(988, H * 0.626, 12, 7, R(P.metal, 0.34), {});
    for (i = 0; i < 4; i++) {
      b += GEO.poly([[790 + i * 90, H * 0.640], [862 + i * 90, H * 0.636], [866 + i * 90, H * 0.660], [794 + i * 90, H * 0.664]],
        R(P.paper, 0.50), { stroke: A(P.ink, 0.16), sw: 0.7 });
    }
    b += GEO.ln(1104, H * 0.646, 1160, H * 0.650, R(P.wood, 0.26), { sw: 4, cap: 'round' });
    b += GEO.vignette(W, H, 0.45, '#100d09');
    return GEO.doc(W, H, b, {});
  };
  /* ==========================================================
   * ch20 · 会宁文庙大成殿（1936-10 / 会师联欢）
   * ========================================================== */
  ART.scenes['bg_huining_confucian_temple'] = function () {
    var b = '', rng = GEO.RNG('hct'), i;
    b += GEO.sky(W, H, P.sky.dawnCold, { horizon: H * 0.34, glow: '#f0c88a' });
    b += GEO.sunDisc(340, 190, 84, '#f7dfae', {});
    b += GEO.cloudBank(W, H * 0.16, '#c9b9a8', { seed: 'hct-cl', count: 6, opacity: 0.30 });
    b += GEO.mountainRange(W, H * 0.400, R(P.loess, 0.52), { amp: 100, segs: 11, seed: 'hct-f', grad: '#b9a684' });
    /* 大殿台基与石阶 */
    b += GEO.facet([[180, H * 0.660], [1740, H * 0.660], [1800, H * 0.700], [120, H * 0.700]], R(P.stone, 0.30),
      { light: 0.07, hl: 0.22, dark: 0.08, dl: 0.22, sw: 0.6 });
    b += GEO.stairs(820, H * 0.700, 280, 120, 6, R(P.stone, 0.34));
    /* 大殿墙体与红漆木柱 */
    b += GEO.facet([[250, H * 0.620], [1670, H * 0.620], [1670, H * 0.345], [250, H * 0.360]], R(P.plaster, 0.28),
      { light: 0.07, hl: 0.24, dark: 0.08, dl: 0.22, sw: 0.6 });
    for (i = 0; i < 6; i++) {
      var colx = 380 + i * 232;
      b += GEO.facet([[colx - 15, H * 0.620], [colx + 15, H * 0.620], [colx + 14, H * 0.360], [colx - 14, H * 0.362]], R(P.woodRed, 0.34),
        { light: 0.11, hl: 0.32, dark: 0.10, dl: 0.28, sw: 0.5 });
    }
    /* 格扇门：深色木格，空着不题字 */
    for (i = 0; i < 5; i++) {
      var dx0 = 402 + i * 232;
      b += GEO.rect(dx0, H * 0.435, 180, 185, R(P.woodRed, 0.16), { stroke: A(P.ink, 0.35), sw: 1.4 });
      for (var gx = 1; gx < 3; gx++) b += GEO.rect(dx0 + gx * 60, H * 0.435, 4, 185, A('#1c130f', 0.55), {});
      for (var gy = 1; gy < 4; gy++) b += GEO.rect(dx0, H * 0.435 + gy * 46, 180, 4, A('#1c130f', 0.55), {});
    }
    /* 深色瓦顶：正脊、两坡与起翘的檐角 */
    b += GEO.facet([[150, H * 0.360], [960, H * 0.118], [1770, H * 0.360], [1660, H * 0.405], [260, H * 0.405]], R(P.tileDark, 0.10),
      { light: 0.10, hl: 0.30, dark: 0.10, dl: 0.30, sw: 0.8 });
    b += GEO.facet([[150, H * 0.360], [960, H * 0.118], [940, H * 0.400], [240, H * 0.410]], GEO.darken(R(P.tileDark, 0.10), 0.12),
      { light: 0.07, hl: 0.22, dark: 0.08, dl: 0.24 });
    b += GEO.poly([[110, H * 0.352], [190, H * 0.344], [170, H * 0.405], [96, H * 0.398]], R(P.tileDark, 0.18), {});
    b += GEO.poly([[1730, H * 0.344], [1810, H * 0.352], [1824, H * 0.398], [1750, H * 0.405]], R(P.tileDark, 0.18), {});
    for (i = 0; i < 11; i++) {
      var tx0 = 210 + i * 150;
      b += GEO.ln(tx0, H * 0.392, tx0 + 120, H * 0.398, A('#1a1d24', 0.55), { sw: 3 });
    }
    /* 老柏树：从右侧斜压过殿顶 */
    b += GEO.broadleafTree(1580, H * 0.672, 560, R(P.pine, 0.30), { seed: 'hct-cyp', lobes: 7 });
    b += GEO.ln(1500, H * 0.400, 1360, H * 0.300, R(P.pine, 0.22), { sw: 20, cap: 'round' });
    b += GEO.ln(1560, H * 0.360, 1430, H * 0.210, R(P.pine, 0.24), { sw: 16, cap: 'round' });
    /* 石板院坝 */
    b += GEO.groundBand(W, H * 0.700, H + 30, R(P.stone, 0.32), { seed: 'hct-gnd', cols: 15, rows: 6 });
    for (i = 0; i < 12; i++) {
      b += GEO.ln(-40, H * 0.720 + i * 26, W + 40, H * 0.716 + i * 26, A('#3f444c', 0.20), { sw: 1.6 });
    }
    /* 殿前木桌与电报纸张 */
    for (i = 0; i < 3; i++) {
      var tbx = 430 + i * 520;
      b += GEO.facet([[tbx - 150, H * 0.720], [tbx + 150, H * 0.714], [tbx + 162, H * 0.748], [tbx - 140, H * 0.756]], R(P.wood, 0.24),
        { light: 0.08, hl: 0.26, dark: 0.08, dl: 0.22 });
      b += GEO.ln(tbx - 110, H * 0.752, tbx - 116, H * 0.820, R(P.wood, 0.18), { sw: 10 });
      b += GEO.ln(tbx + 110, H * 0.748, tbx + 118, H * 0.816, R(P.wood, 0.18), { sw: 10 });
      for (var pp = 0; pp < 3; pp++) {
        b += GEO.poly([[tbx - 90 + pp * 62, H * 0.720], [tbx - 34 + pp * 62, H * 0.718], [tbx - 30 + pp * 62, H * 0.742], [tbx - 86 + pp * 62, H * 0.744]],
          R(P.paper, 0.56), { stroke: A(P.ink, 0.14), sw: 0.6 });
      }
    }
    /* 满院战士与院边老乡 */
    b += GEO.crowd(28, { x0: -40, x1: 1960, y0: H * 0.740, y1: H * 0.960, h: 245, color: R(P.uniform, 0.28), seed: 'hct-c1', opacity: 0.96, hat: 'oct' });
    b += GEO.crowd(16, { x0: 180, x1: 1760, y0: H * 0.800, y1: H * 0.995, h: 265, color: R(P.uniform, 0.24), seed: 'hct-c2', opacity: 0.98, hat: 'oct' });
    b += GEO.crowd(7, { x0: 60, x1: 1880, y0: H * 0.860, y1: H * 0.998, h: 280, color: R(P.cloth, 0.24), seed: 'hct-c3', opacity: 0.98, hat: 'turban' });
    /* 三面高竖的红旗 */
    b += GEO.flag(520, H * 0.840, 360, 180, R(P.redFlag, 0.50), { emblem: R(P.gold, 0.56), poleW: 7 });
    b += GEO.flag(960, H * 0.850, 390, 190, R(P.redFlag, 0.54), { emblem: R(P.gold, 0.58), poleW: 7 });
    b += GEO.flag(1400, H * 0.840, 350, 175, R(P.redFlag, 0.48), { emblem: R(P.gold, 0.54), poleW: 7 });
    b += GEO.mistBand(W, H * 0.780, 130, '#d3c6b2', { op: 0.14 });
    b += GEO.vignette(W, H, 0.42, '#161009');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch20 · 将台堡会师（1936-10 / 土堡院内）
   * ========================================================== */
  ART.scenes['bg_jiangtaibao'] = function () {
    var b = '', rng = GEO.RNG('jtb'), i;
    b += GEO.sky(W, H, ['#8fa6bd', '#bcc4c4', '#e0c79a'], { horizon: H * 0.30 });
    b += GEO.sunDisc(320, 180, 82, '#f2d59a', {});
    b += GEO.cloudBank(W, H * 0.14, '#d3d0c4', { seed: 'jtb-cl', count: 6, opacity: 0.28 });
    b += GEO.mountainRange(W, H * 0.340, R(P.loess, 0.52), { amp: 110, segs: 12, seed: 'jtb-f1', grad: '#c7ae83' });
    b += GEO.mountainRange(W, H * 0.425, R(P.loess, 0.44), { amp: 90, segs: 10, seed: 'jtb-f2', grad: '#b89d74' });
    /* 厚夯土堡墙：横向夯层，顶部有女墙 */
    b += GEO.facet([[-40, H * 0.670], [W + 40, H * 0.670], [W + 40, H * 0.440], [-40, H * 0.455]], R(P.loess, 0.32),
      { light: 0.08, hl: 0.26, dark: 0.09, dl: 0.24, sw: 0.8 });
    for (i = 0; i < 9; i++) {
      var ly = H * 0.470 + i * H * 0.022;
      b += GEO.ln(-40, ly, W + 40, ly - 8, A('#7a5f3f', 0.26), { sw: 2.2 });
    }
    for (i = 0; i < 16; i++) {
      var mx = i * 128;
      b += GEO.facet([[mx, H * 0.440], [mx + 64, H * 0.438], [mx + 64, H * 0.410], [mx, H * 0.414]], R(P.loess, 0.38),
        { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.22 });
    }
    /* 堡门与两座角楼 */
    b += GEO.facet([[890, H * 0.670], [1110, H * 0.670], [1110, H * 0.500], [890, H * 0.500]], R(P.loess, 0.38),
      { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.22 });
    b += GEO.rect(955, H * 0.580, 90, H * 0.090, A('#1a130d', 0.90), {});
    b += GEO.facet([[870, H * 0.500], [1130, H * 0.500], [1100, H * 0.462], [900, H * 0.462]], R(P.tileDark, 0.12),
      { light: 0.09, hl: 0.26, dark: 0.09, dl: 0.26 });
    b += GEO.tower(300, H * 0.560, 230, 190, R(P.loess, 0.34), R(P.tileDark, 0.12), { tiers: 2 });
    b += GEO.tower(1630, H * 0.560, 230, 190, R(P.loess, 0.34), R(P.tileDark, 0.12), { tiers: 2 });
    /* 院内夯土院坝 */
    b += GEO.groundBand(W, H * 0.665, H + 30, R(P.loess, 0.36), { seed: 'jtb-gnd', cols: 14, rows: 6 });
    /* 院一侧的窑洞与低瓦房 */
    b += GEO.facet([[-40, H * 0.760], [420, H * 0.740], [420, H * 0.620], [-40, H * 0.640]], R(P.loess, 0.28),
      { light: 0.06, hl: 0.18, dark: 0.08, dl: 0.20 });
    for (i = 0; i < 2; i++) {
      var cvx = 70 + i * 170;
      b += GEO.pth('M ' + cvx + ' ' + (H * 0.742) + ' L ' + cvx + ' ' + (H * 0.700) +
        ' Q ' + (cvx + 52) + ' ' + (H * 0.662) + ' ' + (cvx + 104) + ' ' + (H * 0.700) +
        ' L ' + (cvx + 104) + ' ' + (H * 0.742) + ' Z', A('#19140f', 0.86));
      b += GEO.rect(cvx + 6, H * 0.704, 92, 4, R(P.wood, 0.22), {});
      for (var ck = 1; ck < 4; ck++) b += GEO.ln(cvx + ck * 26, H * 0.710, cvx + ck * 26, H * 0.740, A('#2a2118', 0.7), { sw: 2 });
    }
    b += GEO.house(180, H * 0.815, 340, 168, 66, R(P.plaster, 0.28), R(P.tileDark, 0.12), { windows: 1, door: false });
    b += GEO.house(460, H * 0.805, 220, 150, 60, R(P.plaster, 0.26), R(P.tileDark, 0.14), { windows: 1, door: false });
    /* 两列会合的战士 */
    b += GEO.crowd(17, { x0: 120, x1: 820, y0: H * 0.780, y1: H * 0.960, h: 250, color: R(P.uniform, 0.28), seed: 'jtb-c1', opacity: 0.96, hat: 'oct' });
    b += GEO.crowd(17, { x0: 1800, x1: 1080, y0: H * 0.780, y1: H * 0.960, h: 250, color: R(P.uniform, 0.26), seed: 'jtb-c2', opacity: 0.96, hat: 'oct' });
    /* 握手与拥抱的两对 */
    b += GEO.silhouette(760, H * 0.900, 244, R(P.uniform, 0.30), GEO.RNG('jtb-m1'), 0.4, 'cap');
    b += GEO.silhouette(816, H * 0.902, 240, R(P.uniform, 0.28), GEO.RNG('jtb-m2'), 0.4, 'cap');
    b += GEO.ln(788, H * 0.806, 800, H * 0.800, R(P.uniform, 0.22), { sw: 14, cap: 'round' });
    b += GEO.silhouette(1128, H * 0.914, 248, R(P.uniform, 0.28), GEO.RNG('jtb-m3'), 0.4, 'cap');
    b += GEO.silhouette(1186, H * 0.916, 244, R(P.uniform, 0.30), GEO.RNG('jtb-m4'), 0.4, 'cap');
    b += GEO.ln(1156, H * 0.814, 1170, H * 0.808, R(P.uniform, 0.22), { sw: 14, cap: 'round' });
    /* 发毛袜的妇女与篮子 */
    b += GEO.silhouette(1330, H * 0.920, 226, R(P.cloth, 0.28), GEO.RNG('jtb-w1'), 0.2, 'turban');
    b += GEO.silhouette(1406, H * 0.926, 232, R(P.cloth, 0.26), GEO.RNG('jtb-w2'), 0.2, 'turban');
    b += GEO.silhouette(1480, H * 0.918, 222, R(P.cloth, 0.30), GEO.RNG('jtb-w3'), 0.2, 'turban');
    for (i = 0; i < 3; i++) {
      var bkx = 1360 + i * 76, bky = H * 0.918;
      b += GEO.ell(bkx, bky, 38, 16, R(P.wood, 0.30), {});
      b += GEO.ell(bkx, bky - 8, 32, 12, R(P.wood, 0.38), {});
      b += GEO.poly([[bkx - 22, bky - 18], [bkx + 18, bky - 20], [bkx + 14, bky - 44], [bkx - 16, bky - 42]], R(P.cloth, 0.52), {});
      b += GEO.poly([[bkx + 8, bky - 16], [bkx + 30, bky - 18], [bkx + 26, bky - 36], [bkx + 6, bky - 34]], R(P.red, 0.30), {});
    }
    /* 把新毛袜贴在脸上的战士 */
    b += GEO.silhouette(1260, H * 0.940, 238, R(P.uniform, 0.24), GEO.RNG('jtb-sock'), 0.2, 'cap');
    b += GEO.poly([[1244, H * 0.842], [1284, H * 0.838], [1286, H * 0.866], [1246, H * 0.870]], R(P.cloth, 0.58), {});
    b += GEO.vignette(W, H, 0.44, '#161009');
    return GEO.doc(W, H, b, {});
  };
  /* ==========================================================
   * ch02 · 敌机（1934-10 阴雨 / 开阔积水稻田 / 三架双翼机）
   * 与「山地行军」「湘江」区分：没有树林、没有沟渠，只有低泥埂
   * 与连到天边的水田；飞机和泥水柱是这一景的识别点。
   * ========================================================== */
  /** 从下方看到的单发双翼机：两层翼面、固定起落架、机头在左 */
  function arPlane(cx, cy, len, color) {
    var s = '';
    var wing = GEO.mul(color, 1.16), dark = GEO.mul(color, 0.82);
    /* 上翼 */
    s += GEO.poly([[cx - len * 0.48, cy - len * 0.090], [cx + len * 0.34, cy - len * 0.090],
      [cx + len * 0.27, cy - len * 0.020], [cx - len * 0.41, cy - len * 0.020]], wing, {});
    /* 下翼 */
    s += GEO.poly([[cx - len * 0.42, cy + len * 0.100], [cx + len * 0.39, cy + len * 0.100],
      [cx + len * 0.32, cy + len * 0.176], [cx - len * 0.35, cy + len * 0.176]], color, {});
    /* 翼间支柱 */
    s += GEO.ln(cx - len * 0.30, cy - len * 0.030, cx - len * 0.26, cy + len * 0.128, dark, { sw: Math.max(2, len * 0.016) });
    s += GEO.ln(cx + len * 0.14, cy - len * 0.034, cx + len * 0.18, cy + len * 0.126, dark, { sw: Math.max(2, len * 0.016) });
    /* 机身 */
    s += GEO.poly([[cx - len * 0.35, cy - len * 0.004], [cx + len * 0.34, cy - len * 0.004],
      [cx + len * 0.46, cy + len * 0.074], [cx - len * 0.31, cy + len * 0.098]], dark, {});
    /* 尾翼 */
    s += GEO.poly([[cx + len * 0.30, cy + len * 0.006], [cx + len * 0.53, cy - len * 0.066],
      [cx + len * 0.57, cy + len * 0.004], [cx + len * 0.35, cy + len * 0.082]], color, {});
    s += GEO.poly([[cx + len * 0.38, cy - len * 0.004], [cx + len * 0.50, cy - len * 0.050],
      [cx + len * 0.51, cy - len * 0.020], [cx + len * 0.40, cy + len * 0.018]], wing, {});
    /* 螺旋桨：只画成半透明的转盘，不画叶片 */
    s += GEO.ell(cx - len * 0.405, cy + len * 0.046, len * 0.030, len * 0.150, A('#8d959c', 0.46), {});
    s += GEO.ell(cx - len * 0.405, cy + len * 0.046, len * 0.010, len * 0.060, A('#3b4148', 0.52), {});
    /* 固定起落架与轮子 */
    s += GEO.ln(cx - len * 0.10, cy + len * 0.128, cx - len * 0.15, cy + len * 0.250, dark, { sw: Math.max(2, len * 0.014) });
    s += GEO.ln(cx + len * 0.08, cy + len * 0.128, cx + len * 0.04, cy + len * 0.248, dark, { sw: Math.max(2, len * 0.014) });
    s += GEO.circle(cx - len * 0.155, cy + len * 0.258, len * 0.032, dark, {});
    s += GEO.circle(cx + len * 0.035, cy + len * 0.256, len * 0.032, dark, {});
    return s;
  }

  /** 炸弹落水：泥水柱 + 水花 + 上方的烟 */
  function arBurst(cx, baseY, hgt, seed) {
    var rng = GEO.RNG(seed || 'burst'), s = '', i;
    s += GEO.ell(cx, baseY + 4, hgt * 0.30, hgt * 0.070, A('#6b6047', 0.58), {});
    s += GEO.poly([[cx - hgt * 0.12, baseY], [cx + hgt * 0.13, baseY],
      [cx + hgt * 0.19, baseY - hgt * 0.60], [cx + hgt * 0.04, baseY - hgt * 1.02],
      [cx - hgt * 0.10, baseY - hgt * 0.78], [cx - hgt * 0.20, baseY - hgt * 0.46]],
      A('#8c7c5c', 0.72), {});
    s += GEO.poly([[cx - hgt * 0.06, baseY], [cx + hgt * 0.05, baseY],
      [cx + hgt * 0.08, baseY - hgt * 0.66], [cx + hgt * 0.01, baseY - hgt * 0.92],
      [cx - hgt * 0.05, baseY - hgt * 0.62]], A('#d9d9ce', 0.72), {});
    for (i = 0; i < 14; i++) {
      var a = rng.range(-1.25, 1.25);
      var d = hgt * rng.range(0.30, 0.78);
      s += GEO.circle(cx + Math.sin(a) * d, baseY - Math.cos(a) * d * 0.92, rng.range(2, 6),
        A('#e4e2d6', 0.42 + rng() * 0.30), {});
    }
    s += GEO.smokePlume(cx + hgt * 0.05, baseY - hgt * 0.82, hgt * 0.92, A('#6f6d62', 0.24), seed + '-smk');
    return s;
  }

  /** 趴在泥水里的战士：头、背、枪，只有露出水面的部分 */
  function arProne(cx, gy, len, color, rng, mode) {
    var s = '', k = len / 180;
    s += GEO.ell(cx, gy + 3, len * 0.42, len * 0.045, A('#4e4a38', 0.36), {});
    if (mode === 2) {
      /* 半沉：只露头和一点背 */
      s += GEO.poly([[cx - len * 0.16, gy], [cx + len * 0.18, gy], [cx + len * 0.12, gy - len * 0.075],
        [cx - len * 0.10, gy - len * 0.070]], color, {});
      s += GEO.circle(cx - len * 0.18, gy - len * 0.095, len * 0.072, GEO.mul(color, 0.94), {});
      s += GEO.poly([[cx - len * 0.255, gy - len * 0.128], [cx - len * 0.105, gy - len * 0.126],
        [cx - len * 0.115, gy - len * 0.102], [cx - len * 0.245, gy - len * 0.104]], GEO.mul(color, 0.80), {});
      return s;
    }
    /* 背与臀：一个低矮的弧面，不是站立剪影 */
    s += GEO.poly([[cx - len * 0.26, gy - len * 0.010], [cx - len * 0.12, gy - len * 0.115],
      [cx + len * 0.20, gy - len * 0.090], [cx + len * 0.34, gy - len * 0.020], [cx + len * 0.26, gy + len * 0.012],
      [cx - len * 0.22, gy + len * 0.012]], color, {});
    s += GEO.poly([[cx - len * 0.10, gy - len * 0.105], [cx + len * 0.11, gy - len * 0.092],
      [cx + len * 0.14, gy - len * 0.050], [cx - len * 0.09, gy - len * 0.060]], GEO.mul(color, 0.88), {});
    /* 草帽 / 八角帽 */
    s += GEO.circle(cx - len * 0.31, gy - len * 0.105, len * 0.076, GEO.mul(color, 0.92), {});
    s += GEO.poly([[cx - len * 0.39, gy - len * 0.128], [cx - len * 0.23, gy - len * 0.126],
      [cx - len * 0.245, gy - len * 0.102], [cx - len * 0.375, gy - len * 0.104]], GEO.mul(color, 0.74), {});
    /* 背包与枪 */
    s += GEO.poly([[cx + len * 0.04, gy - len * 0.096], [cx + len * 0.22, gy - len * 0.078],
      [cx + len * 0.19, gy - len * 0.020], [cx + len * 0.02, gy - len * 0.036]], GEO.mul(color, 0.76), {});
    if (rng() < 0.72) {
      s += GEO.ln(cx - len * 0.02, gy - len * 0.072, cx + len * 0.47, gy - len * 0.150, GEO.mul(color, 0.62),
        { sw: Math.max(1.6, 2.4 * k), cap: 'round' });
    }
    /* 水线：把下半身压进泥水里 */
    s += GEO.poly([[cx - len * 0.30, gy - len * 0.006], [cx + len * 0.38, gy - len * 0.002],
      [cx + len * 0.36, gy + len * 0.020], [cx - len * 0.30, gy + len * 0.016]], A('#68705f', 0.42), {});
    return s;
  }

  /** 田埂间缩着的人：只画弓起的背和头 */
  function arCrouch(cx, gy, h, color) {
    var s = '';
    s += GEO.poly([[cx - h * 0.20, gy], [cx - h * 0.15, gy - h * 0.52], [cx + h * 0.05, gy - h * 0.62],
      [cx + h * 0.23, gy - h * 0.38], [cx + h * 0.28, gy]], color, {});
    s += GEO.circle(cx - h * 0.14, gy - h * 0.66, h * 0.15, GEO.mul(color, 0.96), {});
    s += GEO.poly([[cx - h * 0.30, gy - h * 0.72], [cx - h * 0.00, gy - h * 0.70],
      [cx - h * 0.01, gy - h * 0.64], [cx - h * 0.29, gy - h * 0.66]], GEO.mul(color, 0.78), {});
    s += GEO.ln(cx + h * 0.02, gy - h * 0.45, cx + h * 0.34, gy - h * 0.58, GEO.mul(color, 0.70), { sw: Math.max(1.5, h * 0.035) });
    return s;
  }

  ART.scenes['bg_air_raid_paddy'] = function () {
    var b = '', rng = GEO.RNG('arp'), i, r, c;
    /* 阴天：天低、云厚、没有直射光 */
    b += GEO.sky(W, H, ['#6f7a86', '#98a2aa', '#c2c4bd'], { horizon: H * 0.345 });
    b += GEO.cloudBank(W, H * 0.150, '#c6c9c3', { seed: 'arp-cl', count: 9, opacity: 0.42 });
    b += GEO.cloudBank(W, H * 0.245, '#aeb4b6', { seed: 'arp-cl2', count: 7, opacity: 0.32 });
    /* 远处只有一线低平的田埂，没有树、没有山 */
    b += GEO.mountainRange(W, H * 0.350, R(P.marsh, 0.28), { amp: 22, segs: 24, seed: 'arp-far', grad: '#8f9482' });
    b += GEO.mistBand(W, H * 0.310, 170, '#c8cbc2', { op: 0.24 });
    /* 水田底色：灰色天光映在水面 */
    b += GEO.groundBand(W, H * 0.340, H + 40, R(P.marsh, 0.34), { seed: 'arp-gnd', cols: 17, rows: 8, op: 0.54 });
    var rows = 10;
    for (r = 0; r < rows; r++) {
      var t0 = r / rows, t1 = (r + 1) / rows;
      var y0 = GEO.lerp(H * 0.348, H + 26, Math.pow(t0, 1.55));
      var y1 = GEO.lerp(H * 0.348, H + 26, Math.pow(t1, 1.55));
      var cells = 5 + (r % 3);
      var off = rng.range(-90, 90);
      for (c = 0; c < cells; c++) {
        var x0 = -80 + (W + 160) * c / cells + off + rng.range(-46, 46);
        var x1 = -80 + (W + 160) * (c + 1) / cells + off + rng.range(-46, 46);
        var wy = y0 + rng.range(-9, 9), wy1 = y1 + rng.range(-7, 7);
        /* 积水：较低纯度，避免蓝得像湖 */
        b += GEO.poly([[x0, wy], [x1, wy - rng.range(0, 5)], [x1 + rng.range(-8, 8), wy1], [x0 + rng.range(-8, 8), wy1 + rng.range(0, 5)]],
          GEO.mix(R(P.water, 0.28), '#a8aead', 0.42), { opacity: 0.55 + rng() * 0.16 });
        /* 水面天光：横向的碎亮带 */
        var la = GEO.lerp(0.05, 0.22, (r / rows));
        b += GEO.poly([[x0 + 18, wy + (wy1 - wy) * 0.30], [x1 - 18, wy + (wy1 - wy) * 0.26],
          [x1 - 22, wy + (wy1 - wy) * 0.34], [x0 + 16, wy + (wy1 - wy) * 0.38]],
          A('#d6dcda', la), {});
        /* 低泥埂：横向一条，竖向一条，错开，不形成规则网格 */
        b += GEO.poly([[x0 - 6, wy1 - 2], [x1 + 6, wy1 - 3], [x1 + 5, wy1 + 6], [x0 - 5, wy1 + 7]],
          R(P.earth, 0.24), { opacity: 0.66 });
        b += GEO.poly([[x1 - 5, wy + 2], [x1 + 3, wy + 1], [x1 + 4, wy1 - 1], [x1 - 2, wy1]],
          R(P.earth, 0.20), { opacity: 0.48 });
      }
    }
    /* 田里的短稻茬：稀疏、贴水，不画成草地 */
    for (i = 0; i < 190; i++) {
      var sx = rng.range(0, W), sy = rng.range(H * 0.37, H + 10), sh = rng.range(3, 11);
      b += GEO.ln(sx, sy, sx + rng.range(-3, 3), sy - sh, A('#777550', 0.26), { sw: rng.range(0.8, 1.6) });
    }
    /* 三架低空双翼机：大小、位置拉开，避免复制粘贴 */
    b += arPlane(410, H * 0.145, 250, '#2c3137');
    b += arPlane(1250, H * 0.215, 196, '#30353a');
    b += arPlane(1690, H * 0.118, 132, '#353a3f');
    /* 中景两处炸弹落水：位置一左一右，大小不同 */
    b += arBurst(632, H * 0.545, 188, 'arp-b1');
    b += arBurst(1388, H * 0.620, 238, 'arp-b2');
    b += GEO.mistBand(W, H * 0.500, 150, '#b6b8ac', { op: 0.18 });
    /* 趴在泥水里的战士：远近、姿态、装具都拉开 */
    var prone = [
      [150, 0.700, 116, 0], [286, 0.748, 128, 1], [382, 0.672, 92, 2], [510, 0.792, 148, 0],
      [604, 0.706, 108, 2], [742, 0.842, 162, 1], [870, 0.760, 122, 0], [1010, 0.886, 178, 1],
      [1112, 0.724, 104, 2], [1218, 0.806, 140, 0], [1330, 0.748, 120, 2], [1448, 0.902, 186, 0],
      [1548, 0.786, 134, 1], [1652, 0.846, 154, 2], [1776, 0.918, 196, 1], [72, 0.952, 206, 0],
      [932, 0.968, 212, 1], [1216, 0.968, 204, 2]
    ];
    for (i = 0; i < prone.length; i++) {
      var p = prone[i];
      b += arProne(p[0], H * p[1], p[2], GEO.mul(R(P.uniform, 0.26), 0.82 + (p[1] - 0.67) * 0.55), rng, p[3]);
    }
    /* 缩在田埂间的几个人：小、低、只露上半身 */
    b += arCrouch(690, H * 0.932, 96, R(P.uniform, 0.24));
    b += arCrouch(806, H * 0.958, 110, GEO.mul(R(P.uniform, 0.24), 0.86));
    b += arCrouch(1560, H * 0.952, 104, GEO.mul(R(P.uniform, 0.26), 0.92));
    /* 雨丝与低雾 */
    b += GEO.rainfall(W, H, 210, 'arp-rain', { color: '#c8d1d4' });
    b += GEO.mistBand(W, H * 0.880, 150, '#b9bdb6', { op: 0.12 });
    b += GEO.vignette(W, H, 0.42, '#1a1a14');
    return GEO.doc(W, H, b, {});
  };

  /* ==========================================================
   * ch19 · 六盘山（1935-10 山脊 / 南望层山、北望黄土塬）
   * 与「山地行军」区分：没有竹林、没有绿色梯田；南侧层叠蓝灰
   * 群山，北侧开阔赭黄塬面，近景是风压向一侧的枯草。
   * ========================================================== */
  /** 一队向南飞的大雁：只画极简的 V 字剪影 */
  function lmGeese(cx, cy, sc, color) {
    var s = '', k = sc || 1;
    var pts = [[0, 0], [-34, -18], [34, -18], [-66, -34], [66, -34], [-98, -50], [98, -50], [-130, -66], [130, -66]];
    for (var i = 0; i < pts.length; i++) {
      var gx = cx + pts[i][0] * k, gy = cy + pts[i][1] * k;
      s += GEO.ln(gx - 9 * k, gy + 3 * k, gx, gy - 3 * k, color, { sw: Math.max(1.2, 1.9 * k), cap: 'round' });
      s += GEO.ln(gx, gy - 3 * k, gx + 9 * k, gy + 3 * k, color, { sw: Math.max(1.2, 1.9 * k), cap: 'round' });
    }
    return s;
  }

  ART.scenes['bg_liupan_mountain'] = function () {
    var b = '', rng = GEO.RNG('lm'), i;
    /* 高而淡的天，几缕薄云 */
    b += GEO.sky(W, H, ['#9fbfd8', '#c9dce8', '#e8e2cf'], { horizon: H * 0.430 });
    b += GEO.sunDisc(1540, 152, 54, '#f4ecd0', { halo: true, hr: 5.4, op: 0.34 });
    b += GEO.cloudBank(W, H * 0.100, '#eef4f7', { seed: 'lm-cl1', count: 5, opacity: 0.22 });
    b += GEO.cloudBank(W, H * 0.185, '#dfe9ee', { seed: 'lm-cl2', count: 4, opacity: 0.16 });
    /* 南侧：一层叠一层的蓝灰群山（随后被右侧黄土塬压住一半） */
    b += GEO.mountainRange(W, H * 0.445, GEO.mix(R(P.rock, 0.52), '#8fa3ae', 0.40), { amp: 92, segs: 13, seed: 'lm-s1', grad: '#9bb0b8' });
    b += GEO.mountainRange(W, H * 0.485, GEO.mix(R(P.rock, 0.42), '#7f949f', 0.38), { amp: 126, segs: 12, seed: 'lm-s2', grad: '#82989f' });
    b += GEO.mountainRange(W, H * 0.530, GEO.mix(R(P.rock, 0.34), '#6e828c', 0.32), { amp: 150, segs: 11, seed: 'lm-s3', grad: '#6f838b' });
    b += GEO.mistBand(W, H * 0.470, 190, '#c6d4da', { op: 0.24 });
    /* 北侧：一整片开阔的赭黄塬面，从山脊线一直铺到天边 */
    b += GEO.poly([[760, H * 0.455], [W + 60, H * 0.472], [W + 60, H * 0.640], [690, H * 0.620]],
      R(P.loess, 0.44), {});
    for (i = 0; i < 9; i++) {
      var ty = H * (0.470 + i * 0.018);
      b += GEO.facet([[700 - i * 8, ty], [W + 40, ty + 10], [W + 40, ty + H * 0.020], [700 - i * 8, ty + H * 0.016]],
        GEO.mul(R(P.loess, 0.40), 0.92 + (i % 3) * 0.05), { light: 0.06, hl: 0.18, dark: 0.05, dl: 0.16, sw: 0.4, opacity: 0.72 });
    }
    /* 塬上的浅沟与土坎：只画几条，保持开阔 */
    b += GEO.pline([[980, H * 0.500], [1120, H * 0.550], [1200, H * 0.628]], A('#8b6c46', 0.26), { sw: 18 });
    b += GEO.pline([[1440, H * 0.488], [1540, H * 0.548], [1660, H * 0.604]], A('#8b6c46', 0.22), { sw: 14 });
    b += GEO.poly([[860, H * 0.510], [1050, H * 0.512], [1120, H * 0.560], [930, H * 0.556]], A('#c9ae7c', 0.22), {});
    b += GEO.poly([[1500, H * 0.520], [1770, H * 0.516], [1850, H * 0.572], [1580, H * 0.574]], A('#c9ae7c', 0.18), {});
    /* 近景山脊：一条自左下升起、在画面中部略高、再向右下落的脊线 */
    var crest = [[-60, H * 0.720], [180, H * 0.690], [420, H * 0.650], [660, H * 0.664],
      [900, H * 0.620], [1140, H * 0.632], [1380, H * 0.606], [1640, H * 0.622], [1980, H * 0.662]];
    var ridgePoly = crest.concat([[1980, H + 40], [-60, H + 40]]);
    b += GEO.poly(ridgePoly, R(P.loess, 0.32), {});
    /* 山脊的碎黄土块面：左上受光，右下压暗 */
    for (i = 0; i < 34; i++) {
      var rx = rng.range(-30, W + 30), ry = rng.range(H * 0.625, H * 0.985);
      var rw = rng.range(34, 150), rh = rng.range(8, 26);
      b += GEO.facet([[rx, ry], [rx + rw, ry + rng.range(-4, 4)], [rx + rw - rng.range(4, 18), ry + rh],
        [rx + rng.range(2, 14), ry + rh + rng.range(-2, 2)]], GEO.mul(R(P.loess, 0.34), 0.82 + rng() * 0.36),
        { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.22, sw: 0.4, opacity: 0.72 });
    }
    /* 山脊上的窄路：贴着脊线走，先上后下 */
    var pathPts = [[40, H * 0.760], [250, H * 0.708], [470, H * 0.672], [690, H * 0.686],
      [900, H * 0.642], [1110, H * 0.654], [1330, H * 0.630], [1530, H * 0.642], [1760, H * 0.680]];
    b += GEO.pline(pathPts, R(P.sand, 0.54), { sw: 24, cap: 'round', join: 'round', opacity: 0.62 });
    b += GEO.pline(pathPts, R(P.sand, 0.68), { sw: 9, cap: 'round', join: 'round', opacity: 0.54 });
    /* 风把枯草全部压向右侧：每一丛都是斜的 */
    for (i = 0; i < 420; i++) {
      var gx = rng.range(0, W), gy = rng.range(H * 0.618, H + 10);
      var gh = rng.range(8, 28) * ((gy - H * 0.618) / (H * 0.382) * 0.5 + 0.55);
      var lean = gh * rng.range(0.42, 0.72);
      b += GEO.pline([[gx, gy], [gx + lean * 0.38, gy - gh * 0.52], [gx + lean, gy - gh]],
        GEO.mul(R(P.grassDry, 0.40), 0.82 + rng() * 0.34), { sw: rng.range(0.8, 1.8), opacity: 0.82, cap: 'round' });
    }
    /* 贴着山脊上行的一列小人：越近越大，姿态各不相同 */
    var troops = [
      [90, 0.746, 34], [210, 0.720, 31], [330, 0.696, 29], [450, 0.678, 27],
      [560, 0.676, 26], [680, 0.682, 25], [790, 0.660, 24], [900, 0.640, 23],
      [1010, 0.646, 22], [1120, 0.650, 21], [1240, 0.632, 20], [1360, 0.626, 19],
      [1490, 0.638, 18], [1620, 0.660, 17]
    ];
    for (i = 0; i < troops.length; i++) {
      var tr = troops[i];
      b += GEO.silhouette(tr[0], H * tr[1], tr[2], GEO.mul(R(P.uniform, 0.30), 0.82 + (i % 4) * 0.05),
        rng, 0.9, 'cap');
    }
    /* 最前面的两个稍大一点，背着枪，身上有补丁色差 */
    b += GEO.silhouette(930, H * 0.652, 38, R(P.uniform, 0.26), GEO.RNG('lm-t1'), 1.0, 'cap');
    b += GEO.silhouette(1000, H * 0.658, 35, GEO.mul(R(P.uniform, 0.26), 0.90), GEO.RNG('lm-t2'), 0.8, 'cap');
    /* 队形松散的大雁：从画面右上方往南飞 */
    b += lmGeese(1520, H * 0.220, 1.0, A('#3c4852', 0.78));
    b += lmGeese(1180, H * 0.285, 0.62, A('#46525b', 0.62));
    b += GEO.mistBand(W, H * 0.585, 130, '#d5d3c1', { op: 0.14 });
    b += GEO.vignette(W, H, 0.34, '#18140c');
    return GEO.doc(W, H, b, {});
  };

})();
