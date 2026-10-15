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
/* 以下 7 个 id 改由室内版本提供（art/scenes_meeting.js / art/scenes_north.js）。
 * 注册键挪到 ART.__altScenes，避免覆盖室内版；代码保留备查。 */
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
})();
