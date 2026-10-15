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
    /* ------------------------------------------------------- 通道·恭城书院 */
    /* ------------------------------------------------------- 黎平会议 */
    /* ------------------------------------------------------- 猴场·跨年夜 */
    /* ------------------------------------------------------- 遵义会议楼 */
    /* ------------------------------------------------------- 指挥部·地图桌 */
    function ngonPt(x, y) { return GEO.ngon(x, y, 12, 6, 0.3); }
})();
