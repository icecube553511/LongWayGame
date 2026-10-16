/* ============================================================
 * art/scenes_bullets.js —— 「三发子弹」叙事画面（第 3 章脚山铺阵地）
 *
 * 依据：用户要求 + docs/ART_DIRECTION.md §0（立体几何：块面成立、左上硬光、
 *       低饱和、禁线框）与 §3.1（本文件的特征表）。
 * 注册：window.ART.scenes[id]() -> 1920×1080 完整 SVG 文档
 * 烘焙：node tools/build-art.js --scenes
 *
 * 四张画：bg_bullets_3 / bg_bullets_2 / bg_bullets_1 / bg_black
 *   · 底是纯黑（#05070a，与插画的电影黑边同色），画面上只有子弹，没有别的物件；
 *   · 子弹是步枪弹：弹壳（黄铜，六棱柱折成三块竖面）+ 斜肩 + 弹颈 + 弹头（铅灰尖头）；
 *   · 三张画的子弹位置**完全一致**，少的只是「已经被打出去的那一发」——
 *     所以看起来是「一排子弹被一发一发用掉」，而不是「图排重新居中」；
 *   · 剩下来的是正中那一颗（第三发，留着给自己的那一发）；bg_black 是它被用掉之后的全黑。
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

  var BLACK = '#05070a';          /* 与插画黑边同色，屏幕上是"纯黑" */
  /* 金属色一律往土色里压一档：palette 的 gold 直接用在纯黑上会跳出画面
     （§0 第 6 条要求整体低饱和），所以混进 loess / ink 再画。 */
  function brass(t) { return GEO.mix(R(P.gold, t), R(P.loess, 0.42), 0.5); }
  function lead(t) { return GEO.mix(R(P.metal, t), P.ink, 0.18); }
  function rust(t) { return GEO.mix(R(P.metalRust, t), R(P.loess, 0.3), 0.35); }

  /* 一颗立着的步枪弹。cx=中轴，yBase=底边，h=总高（含弹头），w=弹壳宽。
     拆法：底缘 → 弹壳（三段竖面 = 六棱柱）→ 斜肩 → 弹颈 → 弹头（两段 + 尖）。
     左上光：左侧面最亮，正面中，右侧最暗（明度差 ~26%，与 §0 第 2 条一致）。 */
  function bullet(cx, yBase, h, w) {
    var s = '';
    var x0 = cx - w / 2, x1 = cx - w / 6, x2 = cx + w / 6, x3 = cx + w / 2;
    var yRim = yBase - h * 0.045;         /* 底缘上沿 */
    var yTop = yBase - h * 0.52;          /* 弹壳口 */
    var ySh  = yTop - h * 0.10;           /* 斜肩顶（收窄） */
    var yNeck = ySh - h * 0.05;           /* 弹颈上沿 */
    var yTip = yBase - h;                 /* 弹尖 */
    var nw = w * 0.46;                    /* 弹颈宽 */
    var nx0 = cx - nw / 2, nx1 = cx + nw / 2;
    var opt = { sw: 0.7, light: 0.12, hl: 0.3, dark: 0.14, dl: 0.3 };

    /* 底缘（比壳身略宽一圈，最暗的铜色） */
    s += GEO.facet([[x0 - 6, yBase], [x3 + 6, yBase], [x3 + 6, yRim], [x0 - 6, yRim]],
      rust(0.42), { sw: 0.9, light: 0.08, hl: 0.22, dark: 0.12, dl: 0.34 });
    /* 弹壳：左 / 正 / 右 三块竖面 */
    s += GEO.facet([[x0, yRim], [x1, yRim], [x1, yTop], [x0, yTop]], brass(0.92), opt);
    s += GEO.facet([[x1, yRim], [x2, yRim], [x2, yTop], [x1, yTop]], brass(0.66), opt);
    s += GEO.facet([[x2, yRim], [x3, yRim], [x3, yTop], [x2, yTop]], brass(0.42), opt);
    /* 斜肩：三段收窄的斜面 */
    s += GEO.facet([[x0, yTop], [x1, yTop], [cx - nw / 3, ySh], [nx0, ySh]], brass(0.86), opt);
    s += GEO.facet([[x1, yTop], [x2, yTop], [cx + nw / 3, ySh], [cx - nw / 3, ySh]], brass(0.6), opt);
    s += GEO.facet([[x2, yTop], [x3, yTop], [nx1, ySh], [cx + nw / 3, ySh]], brass(0.38), opt);
    /* 弹颈 */
    s += GEO.facet([[nx0, ySh], [cx - nw / 6, ySh], [cx - nw / 6, yNeck], [nx0, yNeck]], brass(0.8), opt);
    s += GEO.facet([[cx + nw / 6, ySh], [nx1, ySh], [nx1, yNeck], [cx + nw / 6, yNeck]], brass(0.34), opt);
    /* 弹头：两段折面 + 尖 */
    var yHead = yNeck - h * 0.24;         /* 弹头柱段顶（再往上收成尖） */
    s += GEO.facet([[nx0, yNeck], [cx - nw / 8, yNeck], [cx - nw / 8, yHead], [nx0, yHead]], lead(0.94), opt);
    s += GEO.facet([[cx - nw / 8, yNeck], [cx + nw / 8, yNeck], [cx + nw / 8, yHead], [cx - nw / 8, yHead]], lead(0.7), opt);
    s += GEO.facet([[cx + nw / 8, yNeck], [nx1, yNeck], [nx1, yHead], [cx + nw / 8, yHead]], lead(0.46), opt);
    s += GEO.facet([[nx0, yHead], [cx - nw / 8, yHead], [cx, yTip]], lead(0.86), { sw: 0.6, light: 0.1, hl: 0.34 });
    s += GEO.facet([[cx - nw / 8, yHead], [cx + nw / 8, yHead], [cx, yTip]], lead(0.62), { sw: 0.6, light: 0.1, hl: 0.3 });
    s += GEO.facet([[cx + nw / 8, yHead], [nx1, yHead], [cx, yTip]], lead(0.4), { sw: 0.6, light: 0.1, hl: 0.26 });
    return s;
  }

  /* 三颗子弹的中轴：正中 + 左右各一颗。
     三张画面共用同一组坐标 —— 少掉的是两侧那两颗，剩下的是正中那一颗。 */
  var AXIS = [660, 960, 1260];
  var BH = 476, BW = 106;                /* 一颗子弹的高与壳宽 */
  var YBASE = 782;                       /* 底边：画面中央偏下，正好在对话框上方 */

  function board(keep) {
    var s = [];
    s.push(GEO.rect(0, 0, W, H, BLACK));
    /* keep = 保留哪几颗（AXIS 的下标）。顺序按从左到右画，遮挡关系稳定。 */
    keep.forEach(function (i) {
      s.push(bullet(AXIS[i], YBASE, BH, BW));
    });
    return GEO.doc(W, H, s.join(''));
  }

  /* 三颗 / 两颗（左一已打出去）/ 一颗（只剩正中那发） */
  ART.scenes['bg_bullets_3'] = function () { return board([0, 1, 2]); };
  ART.scenes['bg_bullets_2'] = function () { return board([1, 2]); };
  ART.scenes['bg_bullets_1'] = function () { return board([1]); };
  /* 全黑：最后一发「留着给自己」之后，整张画面硬切到这里 */
  ART.scenes['bg_black'] = function () { return GEO.doc(W, H, GEO.rect(0, 0, W, H, BLACK)); };
})();
