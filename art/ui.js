/* UI 装饰素材（16 个）
 * 文件所有权：root。注册到 window.ART.ui[name]() → 完整 SVG 文档。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P;
  var ART = G.ART = G.ART || {};
  ART.ui = ART.ui || {};
  var R = GEO.ramp, A = GEO.alpha;
  var GOLD = R(P.gold, 0.6), RED = R(P.red, 0.6), INK = P.ink, PAPER = P.paper;

  ART.ui['title_frame'] = function () {
    var w = 1200, h = 300, s = '';
    s += GEO.uiFrame(24, 20, w - 48, h - 40, { color: GOLD, t: 3 });
    s += GEO.uiFrame(40, 34, w - 80, h - 68, { color: A(GOLD, 0.5), t: 1.4 });
    s += GEO.uiDivider(140, h - 66, w - 280, A(GOLD, 0.8));
    s += GEO.uiCloudMotif(96, 74, 180, A(GOLD, 0.4));
    s += GEO.uiCloudMotif(w - 276, 74, 180, A(GOLD, 0.4));
    s += GEO.uiStar(74, 78, 20, GOLD, { opacity: 0.9 });
    s += GEO.uiStar(w - 74, 78, 20, GOLD, { opacity: 0.9 });
    return GEO.doc(w, h, s);
  };

  ART.ui['divider'] = function () {
    var s = GEO.uiDivider(0, 16, 960, A(GOLD, 0.85));
    s += GEO.poly(GEO.ngon(480, 12, 9, 4, 0.78), GOLD);
    s += GEO.poly(GEO.ngon(58, 16, 6, 4, 0.78), A(GOLD, 0.6));
    s += GEO.poly(GEO.ngon(902, 16, 6, 4, 0.78), A(GOLD, 0.6));
    return GEO.doc(960, 32, s);
  };

  ART.ui['star_badge'] = function () {
    var s = GEO.poly(GEO.ngon(64, 64, 58, 12, 0.26), R(P.redDeep, 0.4), { stroke: GOLD, sw: 2 });
    s += GEO.poly(GEO.ngon(64, 64, 48, 12, 0.26), R(P.red, 0.55));
    s += GEO.uiStar(64, 62, 30, GOLD);
    s += GEO.uiStar(64, 62, 13, R(P.gold, 0.85));
    return GEO.doc(128, 128, s);
  };

  ART.ui['ribbon_chapter'] = function () {
    var w = 420, h = 76, s = '';
    s += GEO.uiRibbon(0, 0, w, h, { color: R(P.redDeep, 0.5) });
    s += GEO.uiRibbon(10, 8, w - 20, h - 16, { color: R(P.red, 0.58) });
    s += GEO.poly(GEO.ngon(w - 46, h / 2, 13, 4, 0.78), GOLD);
    s += GEO.poly(GEO.ngon(30, h / 2, 8, 4, 0.78), A(GOLD, 0.7));
    return GEO.doc(w, h, s);
  };

  ART.ui['btn_plate'] = function () { return GEO.doc(380, 84, GEO.uiBtn(380, 84, {})); };

  ART.ui['mountain_motif'] = function () {
    var s = GEO.uiMountainMotif(400, 150, 760, 130, R(P.inkLight, 0.5), 'ui-motif');
    s += GEO.mistBand(800, 70, 60, '#c8d6e2', { op: 0.24 });
    return GEO.doc(800, 160, s);
  };

  ART.ui['cloud_motif'] = function () {
    var s = '';
    s += GEO.uiCloudMotif(20, 60, 240, '#dfe8ef');
    s += GEO.uiCloudMotif(300, 40, 180, '#eaf2f8');
    s += GEO.uiCloudMotif(180, 90, 200, A('#ffffff', 0.7));
    return GEO.doc(560, 130, s);
  };

  ART.ui['paper_grain'] = function () {
    var rng = GEO.RNG('grain'), s = GEO.rect(0, 0, 256, 256, A('#000000', 0));
    for (var i = 0; i < 620; i++) {
      var x = rng.range(0, 256), y = rng.range(0, 256), r = rng.range(0.6, 3.2);
      s += GEO.poly(GEO.ngon(x, y, r, 4, rng() * 2), rng() < 0.5 ? '#000000' : '#ffffff',
        { opacity: rng.range(0.02, 0.1), stroke: null });
    }
    for (var k = 0; k < 26; k++) {
      s += GEO.pline([[rng.range(-40, 256), rng.range(0, 256)], [rng.range(0, 296), rng.range(0, 256)]], '#000000', { sw: rng.range(0.4, 1), opacity: rng.range(0.015, 0.05) });
    }
    return GEO.doc(256, 256, s);
  };

  ART.ui['vignette_soft'] = function () { return GEO.doc(1920, 1080, GEO.vignette(1920, 1080, 0.55, '#0b0f16')); };

  ART.ui['seal_red'] = function () {
    var w = 140, h = 140, s = '';
    s += GEO.facet([[6, 10], [w - 6, 4], [w - 2, h - 6], [10, h - 2]], R(P.redDeep, 0.46), { light: 0.1, hl: 0.3, dark: 0.12, dl: 0.3 });
    s += GEO.uiFrame(14, 16, w - 28, h - 32, { color: A('#f3ddd2', 0.6), t: 4 });
    for (var i = 0; i < 4; i++) {
      s += GEO.ln(38, 36 + i * 22, 60, 30 + i * 22, A('#f6e7dd', 0.8), { sw: 7, cap: 'round' });
      s += GEO.ln(78, 30 + i * 22, 102, 36 + i * 22, A('#f6e7dd', 0.8), { sw: 7, cap: 'round' });
    }
    return GEO.doc(w, h, s);
  };

  ART.ui['slot_frame'] = function () {
    var w = 600, h = 70, s = '';
    s += GEO.facet([[10, h - 8], [w - 10, h - 8], [w - 26, h - 26], [26, h - 26]], A(INK, 0.42), { light: 0.06, hl: 0.16, dark: 0.06, dl: 0.2, stroke: null });
    s += GEO.uiDivider(60, h - 46, w - 120, A(GOLD, 0.7));
    s += GEO.poly(GEO.ngon(w / 2, h - 46, 10, 4, 0.78), GOLD);
    return GEO.doc(w, h, s);
  };

  ART.ui['arrow_next'] = function () {
    var s = GEO.poly([[6, 4], [26, 16], [6, 28]], GOLD, { stroke: A(INK, 0.4), sw: 1.2, join: 'round' });
    s += GEO.poly([[12, 9], [22, 16], [12, 23]], R(P.gold, 0.9), { opacity: 0.9 });
    return GEO.doc(32, 32, s);
  };

  ART.ui['lock_icon'] = function () {
    var s = '';
    s += GEO.pth('M 8 16 A 8 8 0 0 1 24 16', 'none', { stroke: R(P.metal, 0.5), sw: 3.4 });
    s += GEO.facet([[5, 15], [27, 15], [27, 28], [5, 28]], R(P.metal, 0.4), { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 });
    s += GEO.poly(GEO.ngon(16, 21, 3.4, 6, 0.3), R(P.gold, 0.7));
    return GEO.doc(32, 32, s);
  };

  function bar(color) {
    var w = 240, h = 16, s = '';
    s += GEO.facet([[0, 2], [w, 0], [w, h - 2], [0, h]], A(INK, 0.55), { light: 0.05, hl: 0.14, dark: 0.06, dl: 0.2, stroke: null });
    s += GEO.facet([[3, 4], [w - 3, 3], [w - 3, h - 4], [3, h - 3]], R(color, 0.5), { light: 0.14, hl: 0.36, dark: 0.08, dl: 0.2, stroke: null });
    s += GEO.poly([[3, 4], [w - 3, 3], [w - 3, 7], [3, 8]], A('#ffffff', 0.28), { stroke: null });
    return GEO.doc(w, h, s);
  }
  ART.ui['bar_morale'] = function () { return bar(P.red); };
  ART.ui['bar_trust'] = function () { return bar(P.water); };
  ART.ui['bar_hope'] = function () { return bar(P.gold); };
})();
