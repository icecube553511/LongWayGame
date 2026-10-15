/* ==========================================================================
 * ART.portraits —— 半身刻面立绘（root 版）
 * 文件所有权：root（独占）。此文件在 art/portraits.js 之后加载，按
 * tools/build-art.js 的排序规则覆盖同名 id。
 *
 * 规格（docs/SPEC.md §4.2）：600×900 透明背景，半身特写
 *   发顶 y≈34，下巴 y≈452，肩线 y≈500，画面下沿 y=900（不画腿）
 *   头宽 ≈300px，脸占画布高度 ≥45%
 *
 * 结构：统一头骨网格（11 块刻面）+ 五官叠加 + 帽发 + 胡须 + 眼镜 + 服装 + 手持道具
 * ========================================================================== */
(function () {
  'use strict';

  var G = (typeof window !== 'undefined') ? window
    : (typeof globalThis !== 'undefined') ? globalThis : this;
  var P = G.ART_PALETTE, GEO = G.GEO;
  if (!P && typeof require === 'function') { try { P = require('./palette.js'); } catch (e) { } }
  if (!GEO && typeof require === 'function') { try { GEO = require('./geosvg.js'); } catch (e) { } }
  if (!P || !GEO) throw new Error('portraits_root.js: 需要先加载 art/palette.js 与 art/geosvg.js');

  var ART = G.ART = G.ART || { portraits: {}, scenes: {}, cg: {}, ui: {}, meta: {}, characters: {} };
  ART.portraits = ART.portraits || {};

  var W = 600, H = 900;
  var FACES = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];

  /* ---------------------------- 0. 几何工具 ---------------------------- */
  function poly(pts, fill, o) { return GEO.poly(pts, fill, o); }
  function facet(pts, fill, o) { return GEO.facet(pts, fill, o); }
  function ln(a, b, c, d, col, o) { return GEO.ln(a, b, c, d, col, o); }
  function pth(d, fill, o) { return GEO.pth(d, fill, o); }

  /* 变宽度线段 → 四边形（眉、皱纹、绑带） */
  function taper(ax, ay, bx, by, ta, tb) {
    var dx = bx - ax, dy = by - ay;
    var l = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    var nx = -dy / l, ny = dx / l;
    return [[ax + nx * ta, ay + ny * ta], [bx + nx * tb, by + ny * tb],
      [bx - nx * tb, by - ny * tb], [ax - nx * ta, ay - ny * ta]];
  }
  /* 二次贝塞尔采样 */
  function arcPts(x0, y0, x1, y1, bulge, n) {
    n = n || 10;
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    var dx = x1 - x0, dy = y1 - y0, l = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    var nx = -dy / l, ny = dx / l;
    var cx = mx + nx * bulge, cy = my + ny * bulge, out = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, it = 1 - t;
      out.push([it * it * x0 + 2 * it * t * cx + t * t * x1, it * it * y0 + 2 * it * t * cy + t * t * y1]);
    }
    return out;
  }
  function mirror(pts) {
    return pts.map(function (p) { return [600 - p[0], p[1]]; });
  }

  /* ---------------------------- 1. 头骨网格 ---------------------------- */
  /* 归一化空间：u 右为正（±0.56 为头骨最宽处半径），v 上为正（+1 头顶，-1 下巴）
   *
   * 形参（全部有默认值，缺省＝标准脸型；每人才有的差异看 §8 角色表）：
   *   up      上半张脸（额/颞/颅）横向宽度系数 —— 额宽 / 太阳穴宽
   *   lw      下半张脸（腮/下颌）横向宽度系数 —— 腮帮子宽窄
   *   skull   颅顶高度系数 —— 额头高矮
   *   low     下半张脸纵向长度系数 —— 脸长（中庭 + 下庭）
   *   jaw     下颌角宽度       cheek   颧骨宽度       chin   下巴长度
   *   browH   眉弓高度         browU   眉间距
   *   eyeY    眼线高度         eyeU    两眼半间距
   *   noseV   鼻底高度         mouthV  嘴的高度
   */
  function landmarks(k) {
    var jaw = k.jaw, chin = k.chin, cheek = k.cheek, lw = k.lw, up = k.up;
    var sk = k.skull, low = k.low, brow = k.browH, eU = k.eyeU / 0.255;
    function Q(u, v) { return [u, v]; }
    return {
      top: Q(0.02, 1.00 * sk), topL: Q(-0.30 * up, 0.95 * sk), topR: Q(0.34 * up, 0.96 * sk),
      foreL: Q(-0.50 * up, 0.70 * sk), foreR: Q(0.50 * up, 0.71 * sk),
      tempL: Q(-0.56 * up, 0.36 * sk), tempR: Q(0.56 * up, 0.37 * sk),
      zygoL: Q(-0.55 * cheek, 0.02), zygoR: Q(0.55 * cheek, 0.03),
      cheekL: Q(-0.48 * lw, -0.28 * low), cheekR: Q(0.48 * lw, -0.29 * low),
      angL: Q(-0.37 * jaw, -0.62 * low), angR: Q(0.37 * jaw, -0.63 * low),
      chinL: Q(-0.18 * jaw, -0.90 * chin * low), chinR: Q(0.19 * jaw, -0.91 * chin * low),
      chinP: Q(0.00, -1.00 * chin * low),
      midBrow: Q(0.01, 0.46 * sk), browL: Q(-0.23 * eU, 0.38 + brow), browR: Q(0.25 * eU, 0.39 + brow),
      eyeL: Q(-k.eyeU, k.eyeY), eyeR: Q(k.eyeU * 1.04, k.eyeY + 0.01),
      noseBase: Q(0.03, k.noseV), mouthC: Q(0.03, k.mouthV),
      cheekCL: Q(-0.41 * cheek, 0.00), cheekCR: Q(0.43 * cheek, 0.01),
      jawL: Q(-0.33 * jaw, -0.58 * low), jawR: Q(0.35 * jaw, -0.59 * low)
    };
  }

  function transform(k) {
    /* 头骨轮廓的最宽处在归一化空间只有 ±0.56，因此：
     *   hw —— 归一化 u 的像素半径（0.56*hw = 头的实际半宽）
     *   uw —— 五官/躯干使用的「头宽单位」（≈ 头的实际半宽，px）
     *
     * 画布几何按 docs/SPEC.md §4.2 的硬性规格：
     *   发顶 y≈34、下巴 y≈452、肩线 y≈500（肩半宽≈200）、下沿 y=900（不画腿）
     *   头宽 ≈300px、头高 ≈420px（脸占画布高度 ≥45%）
     * 取 hw=268 → 头宽 = 2*0.56*268 = 300px；hh=207 → 头高 = 2.0*207 = 414px。
     * cy 由「发顶落在 y≈34」反推：cy - 1.03*hh ≈ 34 → cy ≈ 247；此时下巴落在
     * y≈454、肩线 y≈500，胸腹一直画到画布下沿（半身特写，不画腿）。 */
    var hw = 268 * k.w, hh = 207 * k.h;
    var uw = hw * 0.56;
    var cx = 300, cy = 247;
    return {
      hw: hw, uw: uw, hh: hh, cx: cx, cy: cy,
      x: function (u) { return cx + u * hw; },
      y: function (v) { return cy - v * hh; },
      p: function (a) { return [cx + a[0] * hw, cy - a[1] * hh]; },
      fx: function (u) { return cx + (u + (k.turn || 0)) * hw; },
      fp: function (a) { return [cx + (a[0] + (k.turn || 0)) * hw, cy - a[1] * hh]; }
    };
  }

  /* 11 块基础刻面，每块一个色调系数 —— 立体几何的明暗分区 */
  function skullFaces(L) {
    return [
      { p: [L.foreL, L.topL, L.midBrow, L.browL], t: 1.04 },
      { p: [L.topL, L.top, L.topR, L.foreR, L.browR, L.midBrow], t: 0.95 },
      { p: [L.foreL, L.tempL, L.eyeL, L.browL], t: 0.99 },
      { p: [L.foreR, L.browR, L.eyeR, L.tempR], t: 0.84 },
      { p: [L.eyeL, L.cheekCL, L.zygoL, L.tempL], t: 1.00 },
      { p: [L.eyeR, L.tempR, L.zygoR, L.cheekCR], t: 0.85 },
      { p: [L.cheekCL, L.cheekL, L.angL, L.jawL], t: 0.94 },
      { p: [L.cheekCR, L.jawR, L.angR, L.cheekR], t: 0.80 },
      { p: [L.browL, L.midBrow, L.noseBase, L.mouthC, L.jawL, L.cheekCL], t: 0.99 },
      { p: [L.midBrow, L.browR, L.cheekCR, L.jawR, L.mouthC, L.noseBase], t: 0.83 },
      { p: [L.mouthC, L.jawL, L.angL, L.chinL, L.chinP, L.chinR, L.angR, L.jawR], t: 0.90 }
    ];
  }

  /* ---------------------------- 2. 表情表 ---------------------------- */
  var EXPR = {
    calm: { brow: { dy: 0.00, ang: 0.00, th: 1.00, w: 1.00 }, eye: { open: 1.00, lid: 0.34, shine: 0.55 }, mouth: { w: 1.00, curve: 0.06, open: 0.00, lip: 1.00 }, ex: [] },
    stern: { brow: { dy: 0.22, ang: 0.38, th: 1.10, w: 0.98 }, eye: { open: 0.82, lid: 0.54, shine: 0.40 }, mouth: { w: 1.02, curve: -0.14, open: 0.00, lip: 1.05 }, ex: [] },
    smile: { brow: { dy: -0.10, ang: 0.05, th: 1.00, w: 1.03 }, eye: { open: 0.72, lid: 0.60, shine: 0.80 }, mouth: { w: 1.16, curve: 0.55, open: 0.14, lip: 1.00 }, ex: ['warm'] },
    sad: { brow: { dy: -0.06, ang: -0.38, th: 1.00, w: 1.00 }, eye: { open: 0.88, lid: 0.30, shine: 0.90 }, mouth: { w: 0.94, curve: -0.48, open: 0.05, lip: 1.00 }, ex: ['tear'] },
    worry: { brow: { dy: -0.16, ang: -0.26, th: 0.96, w: 0.93 }, eye: { open: 1.14, lid: 0.20, shine: 0.72 }, mouth: { w: 0.78, curve: -0.22, open: 0.26, lip: 1.05 }, ex: ['sweat'] },
    fierce: { brow: { dy: 0.34, ang: 0.60, th: 1.18, w: 1.06 }, eye: { open: 1.06, lid: 0.44, shine: 0.50 }, mouth: { w: 1.10, curve: -0.36, open: 0.66, lip: 1.10 }, ex: ['vein'] },
    weak: { brow: { dy: 0.08, ang: -0.10, th: 0.82, w: 0.96 }, eye: { open: 0.52, lid: 0.60, shine: 0.34 }, mouth: { w: 0.94, curve: -0.10, open: 0.22, lip: 1.00 }, ex: ['pale'] },
    dawn: { brow: { dy: -0.14, ang: 0.16, th: 1.02, w: 1.02 }, eye: { open: 1.04, lid: 0.24, shine: 1.00 }, mouth: { w: 1.08, curve: 0.34, open: 0.06, lip: 1.00 }, ex: ['shine', 'warm'] }
  };

  /* ---------------------------- 3. 五官 ---------------------------- */
  function drawEye(cx, cy, ew, eh, dir, ex, col, k) {
    k = k || {};
    var tilt = (k.eyeTilt || 0) * eh;                       /* 外眼角上挑（+）/ 下垂（-） */
    var s = '';
    var ox = cx - dir * ew * 0.92, oy = cy - eh * 0.10;      /* 内眼角 */
    var ix = cx + dir * ew * 0.92, iy = cy + eh * 0.14 - tilt;  /* 外眼角 */
    var upper = arcPts(ox, oy, ix, iy, -eh * 1.06, 8);
    var lower = arcPts(ix, iy, ox, oy, -eh * 0.62, 8);
    s += poly(upper.concat(lower.slice(1, -1)), col.sclera, { stroke: 'rgba(20,16,14,0.5)', sw: 1.1 });
    var ir = eh * 0.86 * (k.iris || 1);
    var px = cx + dir * ew * 0.06, py = cy - eh * 0.06;
    s += GEO.circle(px, py, ir, col.iris);
    s += GEO.circle(px, py, ir * 0.52, col.pupil);
    if (ex.shine > 0.2) {
      s += GEO.circle(px - ir * 0.34, py - ir * 0.38, ir * 0.30, 'rgba(255,255,255,' + (0.5 + ex.shine * 0.45) + ')');
      s += GEO.circle(px + ir * 0.34, py + ir * 0.36, ir * 0.15, 'rgba(255,255,255,0.26)');
    }
    var lidY = cy - eh * (1.22 - ex.lid * 0.92);
    var lidTop = arcPts(ox, oy - eh * 0.1, ix, iy - eh * 0.1, -eh * 1.12, 8);
    s += poly(lidTop.concat([[ix, lidY], [ox, lidY]]), col.lid, { opacity: 0.93 });
    s += pth('M ' + GEO.n(ox) + ' ' + GEO.n(oy) + ' Q ' + GEO.n(cx) + ' ' + GEO.n(cy - eh * 1.36) + ' ' +
      GEO.n(ix) + ' ' + GEO.n(iy), 'none', { stroke: col.lash, sw: eh * 0.30, cap: 'round' });
    return s;
  }

  function drawBrow(x0, y0, x1, y1, t0, t1, col) {
    return poly(taper(x0, y0, x1, y1, t0, t1), col, { stroke: 'rgba(18,14,12,0.35)', sw: 0.8 }) +
      poly(taper(x0, y0 - t0 * 0.35, x1, y1 - t1 * 0.35, t0 * 0.32, t1 * 0.32), P.lighten(col, 0.24), { opacity: 0.5 });
  }

  /* 嘴：m.curve 为「嘴角抬升」——正数＝嘴角上翘（笑），负数＝嘴角下垂（悲/怒）。
   * 唇线中央朝相反方向弯，才成弧；两端同向平移只会得到"歪嘴"，因此这里按端点 + 中央
   * 反向控制点来构造（8 种表情的嘴必须一眼可分，见 SPEC §4.2）。 */
  function drawMouth(mx, my, mw, m, col, lh0, k) {
    lh0 = lh0 || 9;
    var lipT = (k && k.lipTh) || 1;
    var s = '';
    var cy0 = m.curve * lh0;
    var cl = [mx - mw, my - cy0];
    var cr = [mx + mw, my - cy0];
    var midY = my + cy0 * 0.55;
    var lh = (lh0 + m.open * lh0 * 2.0) * m.lip * lipT;
    if (m.open > 0.06) {
      s += poly([cl, [mx - mw * 0.42, midY - lh * 0.5], [mx + mw * 0.42, midY - lh * 0.5], cr,
        [mx + mw * 0.42, midY + lh * 0.62], [mx - mw * 0.42, midY + lh * 0.62]], col.mouthIn);
      if (m.open > 0.3) {
        s += poly([[mx - mw * 0.34, midY - lh * 0.48], [mx + mw * 0.34, midY - lh * 0.48],
          [mx + mw * 0.30, midY - lh * 0.16], [mx - mw * 0.30, midY - lh * 0.16]], '#e6e0cf', { opacity: 0.92 });
      }
    }
    s += poly([cl, [mx - mw * 0.36, midY - lh], [mx, midY - lh * 1.20], [mx + mw * 0.36, midY - lh], cr,
      [mx + mw * 0.50, midY + lh * 0.06], [mx, midY + lh * 0.16], [mx - mw * 0.50, midY + lh * 0.06]],
      col.lipUp, { stroke: 'rgba(60,26,22,0.5)', sw: 0.9 });
    s += poly([cr, [mx + mw * 0.36, midY + lh * 0.84], [mx, midY + lh * 1.00], [mx - mw * 0.36, midY + lh * 0.84], cl,
      [mx - mw * 0.62, midY + lh * 0.40], [mx, midY + lh * 0.86], [mx + mw * 0.62, midY + lh * 0.40]],
      col.lipDn, { stroke: 'rgba(60,26,22,0.45)', sw: 0.9 });
    s += pth('M ' + GEO.n(cl[0]) + ' ' + GEO.n(cl[1]) + ' Q ' + GEO.n(mx) + ' ' + GEO.n(midY + lh * 0.18) + ' ' +
      GEO.n(cr[0]) + ' ' + GEO.n(cr[1]), 'none',
      { stroke: 'rgba(52,20,18,0.78)', sw: m.open > 0.06 ? lh0 * 0.14 : lh0 * 0.24, cap: 'round' });
    return s;
  }

  /* ---------------------------- 4. 头骨渲染 ---------------------------- */
  function drawSkull(L, T, k, col) {
    var fs = skullFaces(L), s = '', i;
    for (i = 0; i < fs.length; i++) {
      var f = fs[i];
      var pts = f.p.map(function (a) { return T.p(a); });
      s += facet(pts, P.mul(col.skin, f.t), { light: f.t > 0.95 ? 0.18 : 0.07, hl: 0.44,
        dark: 0.12, dl: 0.32, sw: 1.2, rim: 16, rim2: 30 });
    }
    /* 颧骨 / 下颌结构影 */
    s += poly(taper(T.x(L.zygoR[0] + 0.03), T.y(L.zygoR[1] - 0.06), T.x(0.30), T.y(-0.34), 4, 1.6), 'rgba(70,40,28,0.14)');
    s += poly(taper(T.x(L.zygoL[0] - 0.03), T.y(L.zygoL[1] - 0.06), T.x(-0.30), T.y(-0.34), 4, 1.6), 'rgba(70,40,28,0.10)');
    /* 鼻：鼻梁（鼻根 → 鼻底）＋鼻头 ＋两侧鼻翼。nw 同时吃 nose/noseW，wing 单独放开鼻翼，
     * 于是"哪个人鼻子大"是可以一眼看出来的（李德 1.5+1.3、朱德 1.26、林彪 0.86）。
     * 鼻根取 v=0.26（略高于眼线），旧版从眉心 v=0.46 起笔，鼻子会横跨整个中庭，像"长喙"。 */
    var nb = T.fp(L.noseBase), mb = T.fp([0.01, 0.26 * k.skull]);
    var nw = T.uw * 0.078 * (k.nose || 1) * (k.noseW || 1);
    var wing = k.wing || 1;
    s += poly([[mb[0] - nw * 0.9, mb[1]], [mb[0] + nw * 1.0, mb[1]], [nb[0] + nw * 1.5 * wing, nb[1] + 6], [nb[0] - nw * 1.35 * wing, nb[1] + 6]],
      P.mul(col.skin, 1.06), { stroke: 'rgba(80,45,30,0.20)', sw: 1.0 });
    s += poly([[mb[0] + nw * 0.6, mb[1] - 5], [mb[0] + nw * 1.6, mb[1] + 8], [nb[0] + nw * 2.3 * wing, nb[1] + 8], [nb[0] + nw * 0.8, nb[1] + 3]],
      'rgba(74,42,28,0.24)');
    s += poly([[nb[0] - nw * 1.5 * wing, nb[1] + 4], [nb[0] + nw * 2.4 * wing, nb[1] + 4], [nb[0] + nw * 2.1 * wing, nb[1] + nw * 1.6],
      [nb[0] - nw * 1.2 * wing, nb[1] + nw * 1.5]], P.mul(col.skin, 1.14), { light: 0.26, hl: 0.62, dark: 0.02, dl: 0 });
    s += poly([[nb[0] - nw * 1.7 * wing, nb[1] + nw * 1.2], [nb[0] - nw * 0.5 * wing, nb[1] + nw * 1.3], [nb[0] - nw * 0.6 * wing, nb[1] + nw * 2.2],
      [nb[0] - nw * 1.8 * wing, nb[1] + nw * 2.0]], 'rgba(56,30,20,0.44)');
    s += poly([[nb[0] + nw * 0.9 * wing, nb[1] + nw * 1.3], [nb[0] + nw * 2.1 * wing, nb[1] + nw * 1.2], [nb[0] + nw * 2.0 * wing, nb[1] + nw * 2.0],
      [nb[0] + nw * 0.8 * wing, nb[1] + nw * 2.2]], 'rgba(56,30,20,0.38)');
    return s;
  }

  function drawAge(T, k) {
    if (!k.age) return '';
    var s = '', a = k.age, ink = 'rgba(84,48,32,' + (0.16 + a * 0.22) + ')';
    s += poly(taper(T.x(-0.17), T.y(-0.20), T.x(-0.27), T.y(-0.50), 3.2 * a, 2.0 * a), ink);
    s += poly(taper(T.x(0.19), T.y(-0.21), T.x(0.29), T.y(-0.51), 3.2 * a, 2.0 * a), ink);
    for (var i = 0; i < 3; i++) {
      var y = 0.52 - i * 0.09;
      s += pth('M ' + GEO.n(T.fx(-0.26)) + ' ' + GEO.n(T.y(y)) + ' Q ' + GEO.n(T.fx(0.01)) + ' ' + GEO.n(T.y(y + 0.05)) +
        ' ' + GEO.n(T.fx(0.28)) + ' ' + GEO.n(T.y(y)), 'none', { stroke: ink, sw: 1.4 + a * 1.6, cap: 'round' });
    }
    s += ln(T.fx(-0.44), T.y(0.16), T.fx(-0.53), T.y(0.25), ink, { sw: 1.6 * a });
    s += ln(T.fx(-0.44), T.y(0.11), T.fx(-0.54), T.y(0.10), ink, { sw: 1.6 * a });
    s += ln(T.fx(0.48), T.y(0.17), T.fx(0.57), T.y(0.26), ink, { sw: 1.6 * a });
    s += ln(T.fx(0.48), T.y(0.12), T.fx(0.58), T.y(0.11), ink, { sw: 1.6 * a });
    return s;
  }

  /* ---------------------------- 5. 头发 / 帽子 ---------------------------- */
  function drawCap(k, T, col) {
    var s = '', type = k.cap || 'hairShort', hc = col.hair;
    function Q(u, v) { return T.p([u, v]); }
    function hairline(v) {
      return [Q(-0.53, v), Q(-0.30, v + 0.16), Q(0.02, v + 0.22), Q(0.34, v + 0.17), Q(0.53, v),
        Q(0.57, v - 0.02), Q(0.30, 0.99), Q(-0.06, 1.03), Q(-0.34, 0.99), Q(-0.58, v - 0.02)];
    }
    if (type === 'hairLong') {
      s += poly(hairline(0.56), hc);
      s += poly([Q(-0.58, 0.56), Q(-0.30, 0.99), Q(0.02, 1.02), Q(0.34, 0.98), Q(0.58, 0.56),
        Q(0.34, 0.72), Q(0.02, 0.80), Q(-0.32, 0.72)], P.mul(hc, 1.22));
      s += poly(taper(T.fx(-0.02), T.y(0.98), T.fx(-0.02), T.y(0.62), 5, 6), P.mul(hc, 1.3));
      s += poly([Q(-0.56, 0.54), Q(-0.61, 0.10), Q(-0.50, 0.06), Q(-0.48, 0.54)], hc);
      s += poly([Q(0.56, 0.54), Q(0.62, 0.10), Q(0.51, 0.06), Q(0.48, 0.54)], hc);
    } else if (type === 'hairShort') {
      s += poly(hairline(0.56), hc);
      s += poly([Q(-0.58, 0.56), Q(-0.34, 0.99), Q(0.02, 1.02), Q(0.34, 0.98), Q(0.58, 0.56),
        Q(0.36, 0.76), Q(0.02, 0.82), Q(-0.34, 0.76)], P.mul(hc, 1.20));
    } else if (type === 'bob') {   /* 女式齐耳短发 */
      s += poly(hairline(0.60), hc);
      s += poly([Q(-0.60, 0.60), Q(-0.36, 1.00), Q(0.02, 1.03), Q(0.36, 0.99), Q(0.60, 0.60),
        Q(0.52, 0.16), Q(0.44, 0.30), Q(0.30, 0.66), Q(-0.30, 0.66), Q(-0.44, 0.30), Q(-0.52, 0.16)],
        P.mul(hc, 1.16));
      s += poly([Q(-0.58, 0.56), Q(-0.66, 0.02), Q(-0.56, -0.02), Q(-0.48, 0.52)], hc);
      s += poly([Q(0.58, 0.56), Q(0.66, 0.02), Q(0.56, -0.02), Q(0.48, 0.52)], hc);
    } else if (type === 'buzz') {
      s += poly(hairline(0.58), P.mul(hc, 0.94));
      s += poly([Q(-0.50, 0.58), Q(-0.30, 0.94), Q(0.02, 0.97), Q(0.32, 0.93), Q(0.50, 0.58),
        Q(0.30, 0.74), Q(0.02, 0.80), Q(-0.30, 0.74)], P.mul(hc, 1.14), { opacity: 0.85 });
    } else if (type === 'receding') {
      s += poly([Q(-0.56, 0.62), Q(-0.34, 0.98), Q(0.02, 1.01), Q(0.36, 0.97), Q(0.57, 0.62),
        Q(0.54, 0.44), Q(0.30, 0.54), Q(-0.30, 0.52), Q(-0.54, 0.42)], hc);
      s += poly([Q(-0.56, 0.62), Q(-0.34, 0.98), Q(0.02, 1.01), Q(0.36, 0.97), Q(0.57, 0.62),
        Q(0.34, 0.74), Q(0.02, 0.78), Q(-0.32, 0.74)], P.mul(hc, 1.22));
    } else if (type === 'bajiao') {   /* 红军八角帽 */
      var cc = k.capColor || P.ramp(P.uniformPad, 0.45);
      s += poly(hairline(0.62), P.mul(hc, 0.9));
      s += poly([Q(-0.62, 0.58), Q(-0.35, 1.02), Q(0.02, 1.08), Q(0.38, 1.02), Q(0.62, 0.58),
        Q(0.54, 0.50), Q(0.02, 0.66), Q(-0.54, 0.50)], cc, { stroke: 'rgba(20,24,26,0.5)', sw: 1.2 });
      for (var i = -2; i <= 2; i++) {
        s += pth('M ' + GEO.n(T.fx(i * 0.19)) + ' ' + GEO.n(T.y(1.05)) + ' L ' + GEO.n(T.fx(i * 0.19 + 0.09)) + ' ' + GEO.n(T.y(0.64)),
          'none', { stroke: 'rgba(24,28,30,0.22)', sw: 1.2 });
      }
      s += poly([Q(-0.62, 0.58), Q(-0.35, 1.02), Q(0.02, 1.08), Q(0.38, 1.02), Q(0.62, 0.58),
        Q(0.42, 0.74), Q(0.02, 0.78), Q(-0.40, 0.74)], P.lighten(cc, 0.18), { opacity: 0.42 });
      s += poly([Q(-0.62, 0.58), Q(0.62, 0.58), Q(0.60, 0.48), Q(-0.60, 0.48)], P.mul(cc, 0.84));
      if (k.star !== false) s += GEO.uiStar(T.fx(-0.01), T.y(0.84), T.uw * 0.085, k.starColor || P.ramp(P.red, 0.74));
    } else if (type === 'junguan') {  /* 大檐军帽 */
      var mc = k.capColor || P.ramp(P.uniform, 0.28);
      s += poly(hairline(0.60), P.mul(hc, 0.9));
      s += poly([Q(-0.60, 0.62), Q(-0.33, 1.02), Q(0.02, 1.06), Q(0.37, 1.02), Q(0.60, 0.62)], mc,
        { stroke: 'rgba(18,22,24,0.55)', sw: 1.2 });
      s += poly([Q(-0.60, 0.62), Q(-0.33, 1.02), Q(0.02, 1.06), Q(0.37, 1.02), Q(0.60, 0.62),
        Q(0.40, 0.76), Q(0.02, 0.80), Q(-0.38, 0.76)], P.lighten(mc, 0.20), { opacity: 0.45 });
      s += poly([Q(-0.72, 0.62), Q(0.72, 0.62), Q(0.66, 0.47), Q(-0.66, 0.47)], P.mul(mc, 0.72),
        { stroke: 'rgba(14,18,20,0.55)', sw: 1.2 });
      s += poly([Q(-0.60, 0.645), Q(0.60, 0.645), Q(0.60, 0.585), Q(-0.60, 0.585)], P.ramp(P.redDeep, 0.5));
      s += GEO.uiStar(T.fx(-0.01), T.y(0.82), T.uw * 0.075, P.ramp(P.red, 0.78));
    } else if (type === 'turban') {   /* 彝族黑布包头 */
      var tc = k.turbanColor || '#2d2a2e';
      s += poly(hairline(0.66), P.mul(hc, 0.9));
      s += poly([Q(-0.64, 0.66), Q(-0.37, 1.04), Q(0.02, 1.10), Q(0.39, 1.04), Q(0.64, 0.66),
        Q(0.68, 0.50), Q(0.02, 0.62), Q(-0.68, 0.50)], tc, { stroke: 'rgba(12,12,14,0.6)', sw: 1.2 });
      for (var w2 = 0; w2 < 3; w2++) {
        s += poly([Q(-0.64, 0.64 - w2 * 0.055), Q(0.64, 0.64 - w2 * 0.055), Q(0.65, 0.60 - w2 * 0.055), Q(-0.65, 0.60 - w2 * 0.055)],
          w2 % 2 ? '#3b3740' : '#4a4550', { opacity: 0.7 });
      }
      s += poly([Q(0.62, 0.64), Q(0.78, 0.46), Q(0.68, 0.38), Q(0.56, 0.56)], tc, { opacity: 0.95 });
    } else if (type === 'scarf') {    /* 头巾 */
      var sc = k.scarfColor || P.ramp(P.cloth, 0.55);
      s += poly(hairline(0.62), P.mul(hc, 0.86));
      s += poly([Q(-0.66, 0.58), Q(-0.37, 1.00), Q(0.02, 1.05), Q(0.39, 1.00), Q(0.66, 0.58),
        Q(0.60, 0.48), Q(0.02, 0.60), Q(-0.60, 0.48)], sc, { stroke: 'rgba(30,26,22,0.45)', sw: 1.2 });
      s += poly([Q(0.52, 0.56), Q(0.76, 0.52), Q(0.72, 0.24), Q(0.54, 0.32)], P.mul(sc, 0.9));
      s += poly([Q(-0.60, 0.54), Q(-0.37, 0.96), Q(0.02, 1.01), Q(0.39, 0.96), Q(0.60, 0.54),
        Q(0.34, 0.70), Q(0.02, 0.74), Q(-0.34, 0.70)], P.lighten(sc, 0.22), { opacity: 0.4 });
    } else if (type === 'miao') {     /* 苗族银饰头面：银箍压在发际线上，银坠挂在耳上 */
      var sil = '#d8d3c4';
      s += poly(hairline(0.52), P.mul(hc, 1.12));
      s += poly([Q(-0.58, 0.58), Q(-0.36, 1.00), Q(0.02, 1.04), Q(0.38, 1.00), Q(0.58, 0.58),
        Q(0.36, 0.66), Q(0.02, 0.70), Q(-0.34, 0.66)], P.mul(hc, 1.20));
      /* 银箍贴着发际线，不再横穿额头（旧版会看成一条白绷带） */
      s += poly([Q(-0.56, 0.745), Q(0.56, 0.745), Q(0.55, 0.645), Q(-0.55, 0.645)], sil, { opacity: 0.96 });
      for (var mI = -3; mI <= 3; mI++) {
        s += GEO.circle(T.fx(mI * 0.115), T.y(0.695), T.uw * 0.022, sil);
        s += GEO.circle(T.fx(mI * 0.115), T.y(0.695), T.uw * 0.010, '#a8a294');
      }
      /* 银坠：垂在耳朵上，不再是悬在眼侧的"耳机罩" */
      s += ln(T.fx(-0.58), T.y(0.34), T.fx(-0.58), T.y(-0.02), sil, { sw: T.uw * 0.018 });
      s += ln(T.fx(0.58), T.y(0.34), T.fx(0.58), T.y(-0.02), sil, { sw: T.uw * 0.018 });
      s += GEO.circle(T.fx(-0.58), T.y(-0.06), T.uw * 0.028, sil);
      s += GEO.circle(T.fx(0.58), T.y(-0.06), T.uw * 0.028, sil);
    }
    return s;
  }

  function drawBeard(k, T, col) {
    var b = k.beard, bc = col.beard || col.hair, s = '';
    if (!b || b === 'none') return '';
    /* 髭：只压在上唇上，不越到唇下 */
    var mo = [T.fp([-0.17, -0.235]), T.fp([-0.02, -0.275]), T.fp([0.03, -0.275]), T.fp([0.21, -0.235]),
      T.fp([0.17, -0.325]), T.fp([0.03, -0.355]), T.fp([-0.02, -0.355]), T.fp([-0.15, -0.325])];
    if (b === 'mustache') {
      s += poly(mo, bc, { stroke: 'rgba(20,16,14,0.3)', sw: 0.8 });
    } else if (b === 'stubble' || b === 'short') {
      /* 胡茬/短须一律从唇线以下起步，旧版从唇上起笔，胡子会把嘴整个糊住 */
      var a = b === 'stubble' ? 0.26 : 0.46;
      var bot = -0.94 * k.chin * k.low;
      s += poly([T.fp([-0.36, -0.56]), T.fp([-0.30, -0.74]), T.fp([0.0, -0.82]), T.fp([0.30, -0.74]),
        T.fp([0.38, -0.56]), T.fp([0.28, bot]), T.fp([-0.26, bot + 0.01])], bc,
        { opacity: a, light: 0.10, hl: 0.30, dark: 0.14, dl: 0.30 });
      s += poly(mo, bc, { opacity: Math.min(1, a + 0.42) });
      if (b === 'short') {   /* 连鬓角 */
        s += poly([T.fp([-0.50, -0.22]), T.fp([-0.40, -0.26]), T.fp([-0.38, -0.60]), T.fp([-0.49, -0.56])], bc, { opacity: a });
        s += poly([T.fp([0.50, -0.23]), T.fp([0.41, -0.27]), T.fp([0.39, -0.61]), T.fp([0.50, -0.57])], bc, { opacity: a });
      }
    } else if (b === 'full' || b === 'elder') {
      /* 长须：过下巴但不糊住嘴（嘴在 -0.46，所以颏须从 -0.56 起） */
      var grow = b === 'elder' ? 1.14 : 1.0, bot2 = -1.02 * k.chin * k.low * grow;
      s += poly([T.fp([-0.38, -0.56]), T.fp([-0.32, -0.76]), T.fp([0.0, -0.86]), T.fp([0.32, -0.76]),
        T.fp([0.40, -0.56]), T.fp([0.36, bot2 + 0.10]), T.fp([0.0, bot2]), T.fp([-0.32, bot2 + 0.11])],
        bc, { stroke: 'rgba(24,20,18,0.35)', sw: 1.0, light: 0.12, hl: 0.38, dark: 0.15, dl: 0.32 });
      s += poly(mo, bc);
    }
    return s;
  }

  function drawGlasses(k, T, L) {
    if (!k.glass) return '';
    var s = '', gc = k.glassColor || '#3a3a3e', lw = 2.0;
    var eL = T.fp(L.eyeL), eR = T.fp(L.eyeR);
    var rw = T.uw * 0.30, rh = T.hh * 0.155;
    if (k.glass === 'round') {
      s += GEO.ell(eL[0], eL[1], rw, rh, 'rgba(190,214,232,0.15)', { stroke: gc, sw: lw });
      s += GEO.ell(eR[0], eR[1], rw, rh, 'rgba(190,214,232,0.15)', { stroke: gc, sw: lw });
    } else {
      s += GEO.rect(eL[0] - rw, eL[1] - rh, rw * 2, rh * 2, 'rgba(190,214,232,0.15)', { stroke: gc, sw: lw, rx: 5 });
      s += GEO.rect(eR[0] - rw, eR[1] - rh, rw * 2, rh * 2, 'rgba(190,214,232,0.15)', { stroke: gc, sw: lw, rx: 5 });
    }
    s += ln(eL[0] + rw, eL[1], eR[0] - rw, eR[1], gc, { sw: lw });
    s += ln(eL[0] - rw, eL[1], T.cx - T.uw * 0.92, T.cy - T.hh * 0.04, gc, { sw: lw });
    s += ln(eR[0] + rw, eR[1], T.cx + T.uw * 0.92, T.cy - T.hh * 0.04, gc, { sw: lw });
    s += poly([[eL[0] - rw * 0.86, eL[1] - rh * 0.78], [eL[0] - rw * 0.16, eL[1] - rh * 0.78],
      [eL[0] - rw * 0.46, eL[1] + rh * 0.30], [eL[0] - rw * 0.86, eL[1] + rh * 0.30]], 'rgba(255,255,255,0.18)');
    s += poly([[eR[0] - rw * 0.86, eR[1] - rh * 0.78], [eR[0] - rw * 0.16, eR[1] - rh * 0.78],
      [eR[0] - rw * 0.46, eR[1] + rh * 0.30], [eR[0] - rw * 0.86, eR[1] + rh * 0.30]], 'rgba(255,255,255,0.18)');
    return s;
  }

  /* 眼罩：绷带从眼罩外侧斜绕到对侧颞部，眼罩本身严丝合缝盖住一只眼睛。
   * 旧版是一条横贯整张脸的细带，远看像"贴了张膏药"，这里按解剖位置重画。 */
  function drawPatch(k, T, L) {
    if (!k.eyePatch) return '';
    var side = k.eyePatch === 'left' ? -1 : 1;
    var e = T.fp(side < 0 ? L.eyeL : L.eyeR);
    var w = T.uw * 0.33, h = T.hh * 0.165, s = '';
    s += poly(taper(e[0] - side * w * 1.02, e[1] - h * 0.50, T.cx - side * T.uw * 1.06, e[1] - T.hh * 0.44,
      T.uw * 0.055, T.uw * 0.085), '#2b2724', { stroke: 'rgba(12,10,10,0.5)', sw: 1.0 });
    s += poly(taper(e[0] + side * w * 0.98, e[1] + h * 0.44, T.cx + side * T.uw * 1.02, e[1] + T.hh * 0.30,
      T.uw * 0.050, T.uw * 0.062), '#2b2724', { stroke: 'rgba(12,10,10,0.5)', sw: 1.0 });
    s += poly([[e[0] - w, e[1] - h], [e[0] + w, e[1] - h * 0.92], [e[0] + w * 0.92, e[1] + h],
      [e[0] - w * 0.96, e[1] + h * 0.90]], '#332f2a',
      { stroke: 'rgba(12,10,10,0.6)', sw: 1.6, light: 0.12, hl: 0.34, dark: 0.14, dl: 0.3 });
    return s;
  }

  /* ---------------------------- 6. 半身服装 ---------------------------- */
  function drawTorso(k, T, col) {
    /* 半身特写：肩线落在 y≈500、肩半宽≈200，胸口一直画到画布下沿（不画腿、不画悬空手臂）。
     * 肩线由下巴推出来（下巴到肩固定 48px），所以脸长的角色肩线会跟着下移，
     * 但 SPEC §4.2「下巴到肩 ≤60px」始终成立。 */
    var chinY = T.y(-1.00 * k.chin * k.low);
    var neckBot = chinY + 40 * k.neck;
    var shY = chinY + 48;
    var shW = 200 * k.build;
    var chestW = shW * 0.94;
    var s = '', o = k.outfit, c = col.coat, c2 = P.mul(c, 0.85);
    var F = { light: 0.11, hl: 0.30, dark: 0.12, dl: 0.32, sw: 1.2, rim: 18, rim2: 34 };
    /* 三块刻面：左肩斜面 / 胸正面 / 右肩斜面 */
    s += facet([[T.cx - shW, shY + 24], [T.cx - shW * 0.40, shY - 20], [T.cx - shW * 0.10, shY - 28],
      [T.cx - chestW * 0.34, H + 10], [T.cx - chestW * 0.98, H + 10]], c2, F);
    s += facet([[T.cx - shW * 0.40, shY - 20], [T.cx + shW * 0.40, shY - 20],
      [T.cx + chestW * 0.34, H + 10], [T.cx - chestW * 0.34, H + 10]], c, F);
    s += facet([[T.cx + shW * 0.40, shY - 20], [T.cx + shW, shY + 24],
      [T.cx + chestW * 0.98, H + 10], [T.cx + chestW * 0.34, H + 10]], c2, F);
    s += poly([[T.cx - shW * 0.98, shY + 20], [T.cx - shW * 0.50, shY - 16], [T.cx - shW * 0.26, shY + 2],
      [T.cx - shW * 0.80, shY + 40]], P.lighten(c, 0.15), { opacity: 0.42 });
    s += poly([[T.cx + shW * 0.98, shY + 20], [T.cx + shW * 0.50, shY - 16], [T.cx + shW * 0.26, shY + 2],
      [T.cx + shW * 0.80, shY + 40]], P.lighten(c, 0.10), { opacity: 0.26 });

    if (o === 'hongjun' || o === 'hongjunF') {
      /* 立领 + 红领章 */
      s += poly([[T.cx - T.uw * 0.58, neckBot - 8], [T.cx - T.uw * 0.14, neckBot - 16],
        [T.cx - T.uw * 0.09, neckBot + 16], [T.cx - T.uw * 0.62, neckBot + 22]], P.mul(c, 1.10),
        { stroke: 'rgba(24,28,26,0.42)', sw: 1.0 });
      s += poly([[T.cx + T.uw * 0.58, neckBot - 8], [T.cx + T.uw * 0.14, neckBot - 16],
        [T.cx + T.uw * 0.09, neckBot + 16], [T.cx + T.uw * 0.62, neckBot + 22]], P.mul(c, 1.10),
        { stroke: 'rgba(24,28,26,0.42)', sw: 1.0 });
      s += poly([[T.cx - T.uw * 0.56, neckBot - 4], [T.cx - T.uw * 0.20, neckBot - 14],
        [T.cx - T.uw * 0.16, neckBot + 12], [T.cx - T.uw * 0.54, neckBot + 20]], P.ramp(P.red, 0.62),
        { stroke: 'rgba(70,14,16,0.55)', sw: 0.9 });
      s += poly([[T.cx + T.uw * 0.56, neckBot - 4], [T.cx + T.uw * 0.20, neckBot - 14],
        [T.cx + T.uw * 0.16, neckBot + 12], [T.cx + T.uw * 0.54, neckBot + 20]], P.ramp(P.red, 0.62),
        { stroke: 'rgba(70,14,16,0.55)', sw: 0.9 });
      /* 前襟 + 扣子 */
      s += ln(T.cx, neckBot + 28, T.cx, H, 'rgba(24,28,26,0.48)', { sw: 2.4 });
      for (var b = 0; b < 3; b++) {
        var by = neckBot + 70 + b * 78;
        s += GEO.circle(T.cx + T.uw * 0.05, by, 6.2, P.ramp(P.metal, 0.55));
        s += GEO.circle(T.cx + T.uw * 0.05, by, 2.8, 'rgba(20,22,20,0.55)');
      }
      /* 胸袋 */
      s += poly([[T.cx - T.uw * 0.86, neckBot + 150], [T.cx - T.uw * 0.30, neckBot + 144],
        [T.cx - T.uw * 0.32, neckBot + 232], [T.cx - T.uw * 0.84, neckBot + 238]], P.mul(c, 0.93),
        { stroke: 'rgba(24,28,26,0.38)', sw: 1.0 });
      s += poly([[T.cx + T.uw * 0.30, neckBot + 144], [T.cx + T.uw * 0.86, neckBot + 150],
        [T.cx + T.uw * 0.84, neckBot + 238], [T.cx + T.uw * 0.32, neckBot + 232]], P.mul(c, 0.93),
        { stroke: 'rgba(24,28,26,0.38)', sw: 1.0 });
      /* 挎包带改由 gear === 'satchel' 单独绘制：不再人人一条同款斜带 */
    } else if (o === 'changshan') {
      s += poly([[T.cx - T.uw * 0.74, neckBot + 6], [T.cx + T.uw * 0.74, neckBot + 6],
        [T.cx + T.uw * 0.82, H], [T.cx - T.uw * 0.82, H]], P.mul(c, 1.06), { stroke: 'rgba(30,26,20,0.42)', sw: 1.0 });
      s += poly([[T.cx - T.uw * 0.74, neckBot + 6], [T.cx - T.uw * 0.10, neckBot + 24],
        [T.cx - T.uw * 0.10, H], [T.cx - T.uw * 0.80, H]], c, { opacity: 0.5 });
      s += ln(T.cx + T.uw * 0.12, neckBot + 34, T.cx + T.uw * 0.20, H, 'rgba(28,24,18,0.48)', { sw: 2.0 });
      for (var q = 0; q < 2; q++) s += GEO.circle(T.cx + T.uw * 0.26, neckBot + 110 + q * 110, 5.4, P.ramp(P.gold, 0.4));
    } else if (o === 'apron') {
      /* 挑夫的围腰：系在腰上，不是从领口挂下来的"围嘴"。肩、领、胸口仍是军装本色。 */
      var waist = neckBot + 196;
      s += poly([[T.cx - T.uw * 0.62, waist], [T.cx + T.uw * 0.62, waist],
        [T.cx + T.uw * 0.70, H], [T.cx - T.uw * 0.70, H]], P.ramp(P.cloth, 0.30),
        { stroke: 'rgba(34,28,22,0.42)', sw: 1.0 });
      s += poly([[T.cx - T.uw * 0.44, waist + 26], [T.cx + T.uw * 0.44, waist + 26],
        [T.cx + T.uw * 0.50, H], [T.cx - T.uw * 0.50, H]], P.ramp(P.plaster, 0.32), { opacity: 0.55 });
      s += poly([[T.cx - T.uw * 0.66, waist - 16], [T.cx + T.uw * 0.66, waist - 16],
        [T.cx + T.uw * 0.68, waist + 16], [T.cx - T.uw * 0.68, waist + 16]], P.ramp(P.wood, 0.30),
        { stroke: 'rgba(40,30,20,0.5)', sw: 1.1 });
      s += GEO.rect(T.cx - 13, waist - 11, 26, 22, P.ramp(P.metal, 0.42), { rx: 3 });
    } else if (o === 'yi') {
      s += poly([[T.cx - T.uw * 0.74, neckBot + 8], [T.cx + T.uw * 0.74, neckBot + 8],
        [T.cx + T.uw * 0.82, H], [T.cx - T.uw * 0.82, H]], P.ramp(P.inkSoft, 0.5), { stroke: 'rgba(14,14,16,0.55)', sw: 1.2 });
      s += poly(taper(T.cx - T.uw * 0.42, neckBot, T.cx + T.uw * 0.10, H * 0.66, 14, 18), P.ramp(P.redDeep, 0.42));
      s += poly(taper(T.cx + T.uw * 0.42, neckBot, T.cx - T.uw * 0.10, H * 0.66, 14, 18), P.ramp(P.redDeep, 0.36));
      s += poly([[T.cx - shW * 1.04, shY + 24], [T.cx + shW * 1.04, shY + 24], [T.cx + shW * 0.94, shY + 300],
        [T.cx - shW * 0.94, shY + 300]], P.ramp(P.cloth, 0.28), { opacity: 0.55, stroke: 'rgba(30,26,20,0.32)', sw: 1.2 });
    } else if (o === 'miao') {
      s += poly([[T.cx - T.uw * 0.72, neckBot + 8], [T.cx + T.uw * 0.72, neckBot + 8],
        [T.cx + T.uw * 0.80, H], [T.cx - T.uw * 0.80, H]], P.ramp(P.inkSoft, 0.42), { stroke: 'rgba(14,14,18,0.55)', sw: 1.2 });
      s += poly([[T.cx - T.uw * 0.56, neckBot + 44], [T.cx + T.uw * 0.56, neckBot + 44],
        [T.cx + T.uw * 0.62, H], [T.cx - T.uw * 0.62, H]], P.ramp(P.redDeep, 0.40), { opacity: 0.55 });
      for (var nI = 0; nI < 3; nI++) {
        s += GEO.ell(T.cx, neckBot + 58 + nI * 30, T.uw * (0.56 - nI * 0.09), 13, 'none',
          { stroke: '#d8d3c4', sw: 6 - nI * 1.0 });
      }
    } else if (o === 'cloth') {
      var cc = P.ramp(P.water, 0.34);
      s += poly([[T.cx - T.uw * 0.76, neckBot + 6], [T.cx + T.uw * 0.76, neckBot + 6],
        [T.cx + T.uw * 0.84, H], [T.cx - T.uw * 0.84, H]], cc, { stroke: 'rgba(24,30,38,0.5)', sw: 1.2 });
      s += poly(taper(T.cx - T.uw * 0.40, neckBot + 12, T.cx + T.uw * 0.06, H * 0.68, 12, 16), P.mul(cc, 0.9));
      s += poly([[T.cx - T.uw * 0.80, neckBot + 6], [T.cx - T.uw * 0.46, neckBot + 10], [T.cx - T.uw * 0.48, H],
        [T.cx - T.uw * 0.82, H]], P.mul(cc, 0.94));
      for (var fI = 0; fI < 2; fI++) s += GEO.circle(T.cx + T.uw * 0.32, neckBot + 100 + fI * 96, 5.6, P.ramp(P.plaster, 0.5));
    } else {
      s += poly([[T.cx - T.uw * 0.74, neckBot + 8], [T.cx + T.uw * 0.74, neckBot + 8],
        [T.cx + T.uw * 0.82, H], [T.cx - T.uw * 0.82, H]], P.ramp(P.uniform, 0.42), { stroke: 'rgba(24,28,26,0.42)', sw: 1.0 });
    }

    /* —— 个人装备：35 个人穿同一身军装，靠这一层在肩胸处再分一次形状 —— */
    var g = k.gear;
    if (g === 'satchel') {
      s += poly(taper(T.cx - T.uw * 0.94, shY + 4, T.cx + T.uw * 0.62, H, 17, 21), P.ramp(P.cloth, 0.32),
        { stroke: 'rgba(30,26,20,0.42)', sw: 1.2, opacity: 0.95 });
      s += poly([[T.cx + T.uw * 0.30, H - 158], [T.cx + T.uw * 0.98, H - 170], [T.cx + T.uw * 1.02, H - 42],
        [T.cx + T.uw * 0.34, H - 30]], P.ramp(P.cloth, 0.44), { stroke: 'rgba(36,30,22,0.5)', sw: 1.3 });
      s += poly([[T.cx + T.uw * 0.30, H - 158], [T.cx + T.uw * 0.98, H - 170], [T.cx + T.uw * 1.00, H - 132],
        [T.cx + T.uw * 0.32, H - 120]], P.mul(P.ramp(P.cloth, 0.44), 0.86));
    } else if (g === 'armband') {
      s += poly([[T.cx - shW * 0.99, shY + 34], [T.cx - shW * 0.72, shY + 8], [T.cx - shW * 0.66, shY + 104],
        [T.cx - shW * 0.96, shY + 132]], P.ramp(P.red, 0.56), { stroke: 'rgba(70,14,16,0.5)', sw: 1.2 });
      s += poly([[T.cx - shW * 0.99, shY + 34], [T.cx - shW * 0.72, shY + 8], [T.cx - shW * 0.70, shY + 42],
        [T.cx - shW * 0.97, shY + 68]], P.lighten(P.ramp(P.red, 0.62), 0.16), { opacity: 0.5 });
    } else if (g === 'bandolier') {
      s += poly(taper(T.cx - T.uw * 0.94, shY + 2, T.cx + T.uw * 0.66, H, 16, 20), P.ramp(P.cloth, 0.22),
        { stroke: 'rgba(24,20,14,0.45)', sw: 1.2, opacity: 0.95 });
      for (var bI = 0; bI < 6; bI++) {
        var bp = 0.16 + bI * 0.135;
        var bx = T.cx - T.uw * 0.94 + (T.uw * 1.60) * bp, byy = shY + 2 + (H - shY - 2) * bp;
        s += GEO.rect(bx - 7, byy - 15, 15, 30, P.ramp(P.metal, 0.36), { rx: 3, stroke: 'rgba(20,24,28,0.5)', sw: 1.0 });
      }
    } else if (g === 'towel') {
      /* 脖子上的毛巾：绕颈一圈 + 胸前垂两条。旧版是横贯整个胸口的一块米色布，像围嘴 */
      s += poly([[T.cx - T.uw * 0.50, neckBot - 12], [T.cx + T.uw * 0.50, neckBot - 12],
        [T.cx + T.uw * 0.58, neckBot + 26], [T.cx - T.uw * 0.58, neckBot + 26]],
        P.ramp(P.plaster, 0.54), { stroke: 'rgba(46,40,32,0.38)', sw: 1.1 });
      s += poly([[T.cx - T.uw * 0.48, neckBot + 14], [T.cx - T.uw * 0.20, neckBot + 12],
        [T.cx - T.uw * 0.14, neckBot + 152], [T.cx - T.uw * 0.44, neckBot + 160]],
        P.ramp(P.plaster, 0.46), { stroke: 'rgba(46,40,32,0.30)', sw: 1.0 });
      s += poly([[T.cx + T.uw * 0.22, neckBot + 12], [T.cx + T.uw * 0.50, neckBot + 14],
        [T.cx + T.uw * 0.46, neckBot + 124], [T.cx + T.uw * 0.18, neckBot + 116]],
        P.ramp(P.plaster, 0.60), { stroke: 'rgba(46,40,32,0.30)', sw: 1.0 });
    } else if (g === 'cape') {
      s += poly([[T.cx - shW * 1.06, shY + 16], [T.cx - shW * 0.44, shY - 30], [T.cx + shW * 0.44, shY - 30],
        [T.cx + shW * 1.06, shY + 16], [T.cx + shW * 1.10, H + 10], [T.cx - shW * 1.10, H + 10]],
        P.ramp(P.cloth, 0.30), { opacity: 0.94, stroke: 'rgba(28,24,18,0.42)', sw: 1.3 });
      s += poly(taper(T.cx - shW * 0.30, shY - 26, T.cx - shW * 0.34, H, 20, 26), P.ramp(P.cloth, 0.22));
      s += poly(taper(T.cx + shW * 0.30, shY - 26, T.cx + shW * 0.34, H, 20, 26), P.ramp(P.cloth, 0.22));
    } else if (g === 'medbag') {
      s += poly(taper(T.cx + T.uw * 0.92, shY + 6, T.cx - T.uw * 0.52, H, 15, 19), P.ramp(P.cloth, 0.30),
        { opacity: 0.95, stroke: 'rgba(30,26,20,0.4)', sw: 1.1 });
      s += poly([[T.cx - T.uw * 1.00, H - 156], [T.cx - T.uw * 0.34, H - 168], [T.cx - T.uw * 0.30, H - 44],
        [T.cx - T.uw * 0.96, H - 32]], P.ramp(P.plaster, 0.44), { stroke: 'rgba(46,40,32,0.5)', sw: 1.3 });
      s += GEO.rect(T.cx - T.uw * 0.72, H - 122, 26, 12, P.ramp(P.red, 0.6));
      s += GEO.rect(T.cx - T.uw * 0.66, H - 130, 12, 28, P.ramp(P.red, 0.6));
    }
    return s;
  }

  /* ---------------------------- 7. 手持道具（贴身，不浮空） ---------------------------- */
  function drawProp(k, T) {
    if (!k.prop) return '';
    var S = 1.30;                    /* 头身放大后，手持道具同步放大，否则会显得缩水 */
    var s = '';
    var x = T.cx + T.uw * 0.98;      /* 贴在人物右侧胸口附近 */
    var y = 660;
    switch (k.prop) {
      case 'bugle':
        /* 背带：从右肩斜挂到号身，保证不悬空 */
        s += poly(taper(T.cx + T.uw * 0.92, 566, x + 4, y + 46, 10, 9), P.ramp(P.cloth, 0.32),
          { opacity: 0.95, stroke: 'rgba(30,26,20,0.35)', sw: 1.0 });
        /* 号管（由号嘴向喇叭口渐宽） */
        s += poly(taper(x - 44, y + 96, x + 30, y - 46, 9, 19), P.ramp(P.gold, 0.46),
          { stroke: 'rgba(60,44,10,0.55)', sw: 1.3 });
        /* 喇叭口 */
        s += poly([[x + 22, y - 54], [x + 74, y - 84], [x + 96, y - 26], [x + 44, y + 4]], P.ramp(P.gold, 0.70),
          { stroke: 'rgba(60,44,10,0.55)', sw: 1.4, light: 0.24, hl: 0.54, dark: 0.12, dl: 0.3 });
        s += poly([[x + 34, y - 60], [x + 78, y - 82], [x + 88, y - 56], [x + 44, y - 34]], P.lighten(P.ramp(P.gold, 0.78), 0.14),
          { opacity: 0.5 });
        /* 号嘴 */
        s += poly([[x - 56, y + 84], [x - 38, y + 72], [x - 30, y + 92], [x - 48, y + 104]], P.ramp(P.gold, 0.58),
          { stroke: 'rgba(60,44,10,0.5)', sw: 1.1 });
        /* 红缨 */
        s += poly([[x + 12, y - 40], [x + 2, y + 6], [x - 14, y + 2], [x - 4, y - 42]], P.ramp(P.red, 0.56),
          { stroke: 'rgba(70,14,16,0.45)', sw: 1.0 });
        break;
      case 'pot':
        s += GEO.ell(x, y + 84, 62, 52, P.ramp(P.metalRust, 0.44), { stroke: 'rgba(40,26,14,0.55)', sw: 1.6 });
        s += GEO.ell(x, y + 42, 62, 20, P.ramp(P.metalRust, 0.60), { stroke: 'rgba(40,26,14,0.55)', sw: 1.4 });
        s += GEO.ell(x, y + 42, 48, 13, P.ramp(P.wood, 0.14));
        s += poly(taper(x - 58, y + 92, x - 78, y + 40, 8, 8), P.ramp(P.metal, 0.46));
        s += poly(taper(x + 58, y + 92, x + 78, y + 40, 8, 8), P.ramp(P.metal, 0.46));
        s += poly(taper(x - 58, y + 8, x - 70, y - 40, 5, 5), P.ramp(P.cloth, 0.30), { opacity: 0.9 });
        break;
      case 'medbox':
        s += GEO.rect(x - 56, y + 20, 112, 88, P.ramp(P.plaster, 0.42), { rx: 5, stroke: 'rgba(40,34,26,0.55)', sw: 1.4 });
        s += GEO.rect(x - 56, y + 20, 112, 18, P.ramp(P.plaster, 0.28));
        s += GEO.rect(x - 6, y + 44, 12, 40, P.ramp(P.red, 0.62));
        s += GEO.rect(x - 20, y + 56, 40, 12, P.ramp(P.red, 0.62));
        s += poly(taper(x - 46, y + 16, x - 62, y - 30, 5, 5), P.ramp(P.cloth, 0.30), { opacity: 0.9 });
        break;
      case 'ledger':
        s += poly([[x - 52, y + 34], [x + 44, y + 20], [x + 52, y + 104], [x - 44, y + 118]], P.ramp(P.redDeep, 0.4),
          { stroke: 'rgba(40,20,16,0.55)', sw: 1.4 });
        s += poly([[x - 46, y + 40], [x - 12, y + 34], [x - 4, y + 112], [x - 38, y + 118]], P.ramp(P.plaster, 0.6));
        s += poly(taper(x - 50, y + 36, x - 66, y - 6, 9, 8), P.ramp(P.cloth, 0.32), { opacity: 0.9 });
        break;
      case 'map':
        s += poly([[x - 48, y - 40], [x + 48, y - 56], [x + 56, y + 78], [x - 40, y + 92]], P.ramp(P.plaster, 0.62),
          { stroke: 'rgba(50,44,32,0.55)', sw: 1.4 });
        s += poly([[x - 34, y - 18], [x + 34, y - 30], [x + 26, y + 40], [x - 26, y + 50]], 'none',
          { stroke: 'rgba(70,60,40,0.5)', sw: 1.6 });
        s += ln(x - 16, y + 22, x + 30, y + 12, 'rgba(140,30,30,0.6)', { sw: 2.6 });
        s += poly(taper(x - 44, y - 34, x - 58, y - 76, 9, 8), P.ramp(P.cloth, 0.32), { opacity: 0.9 });
        break;
      case 'bino':
        s += GEO.rect(x - 34, y + 10, 30, 70, P.ramp(P.metal, 0.40), { rx: 7, stroke: 'rgba(20,24,28,0.6)', sw: 1.4 });
        s += GEO.rect(x + 6, y + 10, 30, 70, P.ramp(P.metal, 0.40), { rx: 7, stroke: 'rgba(20,24,28,0.6)', sw: 1.4 });
        s += GEO.rect(x - 34, y + 2, 74, 13, P.ramp(P.metal, 0.30), { rx: 4 });
        s += poly(taper(x - 20, y + 4, x - 44, y - 44, 6, 6), P.ramp(P.cloth, 0.30), { opacity: 0.9 });
        break;
      case 'flag':
        s += poly(taper(x - 8, y + 130, x + 6, y - 120, 7, 6), P.ramp(P.wood, 0.24));
        s += poly([[x + 6, y - 118], [x + 118, y - 96], [x + 112, y - 30], [x + 4, y - 46]],
          P.ramp(P.redFlag, 0.62), { stroke: 'rgba(70,14,16,0.55)', sw: 1.4 });
        s += poly([[x + 6, y - 118], [x + 118, y - 96], [x + 115, y - 66], [x + 5, y - 86]],
          P.lighten(P.ramp(P.redFlag, 0.62), 0.22), { opacity: 0.5 });
        break;
    }
    return '<g transform="translate(' + GEO.n(x) + ' ' + GEO.n(y + 84) + ') scale(' + S + ') translate(' +
      GEO.n(-x) + ' ' + GEO.n(-(y + 84)) + ')">' + s + '</g>';
  }

  /* ---------------------------- 8. 角色参数表 ---------------------------- */
  /* 每一项都会真正落在画面上，缺省即"标准脸/标准身材"。设计意图见 docs/ART_DIRECTION.md §2，
   * 每人的差异来源必须能一句话说清（脸型 / 年龄 / 胡须 / 眼镜 / 发型帽型 / 肤色 / 性别），
   * 对应 docs/SPEC.md §4.2「35 个角色必须在脸部层面一眼可区分」。 */
  function C(o) {
    return {
      w: o.w || 1, h: o.h || 1,
      /* —— 脸型 —— */
      up: o.up || 1, lw: o.lw || 1, skull: o.skull || 1, low: o.low || 1,
      jaw: o.jaw === undefined ? 0.95 : o.jaw,
      chin: o.chin === undefined ? 1 : o.chin,
      cheek: o.cheek === undefined ? 1 : o.cheek,
      browH: o.browH || 0, browTh: o.browTh || 1,
      /* —— 五官 —— */
      eyeY: o.eyeY === undefined ? 0.15 : o.eyeY,
      eyeU: o.eyeU === undefined ? 0.255 : o.eyeU,
      eyeW: o.eyeW || 1, eyeH: o.eyeH || 1, eyeTilt: o.eyeTilt || 0, iris: o.iris || 1,
      noseV: o.noseV === undefined ? -0.18 : o.noseV,
      nose: o.nose || 1, noseW: o.noseW || 1, noseL: o.noseL || 1, wing: o.wing || 1,
      mouthV: o.mouthV === undefined ? -0.46 : o.mouthV,
      mouthW: o.mouthW || 1, lipTh: o.lipTh || 1,
      build: o.build || 1, neck: o.neck || 1, age: o.age || 0,
      turn: o.turn === undefined ? 0.02 : o.turn,
      cap: o.cap || 'hairShort', capColor: o.capColor, turbanColor: o.turbanColor, scarfColor: o.scarfColor,
      star: o.star, starColor: o.starColor,
      beard: o.beard || 'none', beardColor: o.beardColor,
      glass: o.glass || null, eyePatch: o.eyePatch || null,
      prop: o.prop || null, outfit: o.outfit || 'hongjun', gear: o.gear || null,
      skin: o.skin || P.ramp(P.skin, 0.55), hair: o.hair || P.ramp(P.hair, 0.45),
      coat: o.coat || P.ramp(P.uniform, 0.35)
    };
  }
  var SK = function (t) { return P.ramp(P.skin, t); };
  var HR = function (t) { return P.ramp(P.hair, t); };
  var HG = function (t) { return P.ramp(P.hairGrey, t); };
  var UN = function (t) { return P.ramp(P.uniform, t); };

  var CHARS = {
    /* ============ 历史人物 ============ */
    /* 毛泽东 41 岁：长脸宽额、中庭深、阔嘴薄唇、眼神冷；疟疾初愈故偏瘦 */
    mao: C({ w: 1.00, h: 1.02, up: 1.00, lw: 0.95, skull: 1.02, low: 1.02, jaw: 0.92, chin: 0.96, cheek: 1.00,
      browH: 0.01, browTh: 1.25, eyeY: 0.17, eyeU: 0.265, eyeW: 1.02, noseW: 1.05, noseL: 1.06,
      mouthV: -0.47, mouthW: 1.10, lipTh: 1.05, age: 0.22, cap: 'hairLong', hair: '#221c18',
      skin: SK(0.52), coat: UN(0.30), prop: 'map' }),
    /* 周恩来 36 岁：瓜子脸窄下巴、眉细而上挑、眼窝深、嘴唇薄 */
    zhou: C({ w: 0.97, h: 1.02, up: 0.96, lw: 0.88, skull: 1.00, low: 1.04, jaw: 0.84, chin: 1.02, cheek: 0.90,
      browH: 0.02, browTh: 1.05, eyeY: 0.16, eyeU: 0.26, eyeW: 1.10, eyeH: 1.02, noseV: -0.19, noseL: 1.10,
      mouthW: 0.94, lipTh: 1.06, age: 0.16, build: 0.94, cap: 'hairShort', hair: '#1f1a17', skin: SK(0.48),
      coat: UN(0.42), beard: 'stubble', gear: 'satchel', prop: 'ledger' }),
    /* 朱德 48 岁：方脸宽腮、厚眉、大鼻、身板最厚实 —— 一眼就"最宽" */
    zhu: C({ w: 1.06, h: 1.02, up: 1.06, lw: 1.14, skull: 0.98, low: 0.97, jaw: 1.18, chin: 0.94, cheek: 1.10,
      browH: 0.02, browTh: 1.40, eyeY: 0.14, eyeU: 0.235, eyeW: 0.94, noseW: 1.26, wing: 1.18,
      mouthW: 1.12, lipTh: 1.05, age: 0.32, build: 1.16, cap: 'junguan', capColor: P.ramp(P.uniformPad, 0.38),
      hair: HR(0.5), skin: SK(0.60), coat: UN(0.44), beard: 'short', beardColor: HG(0.5), gear: 'towel' }),
    /* 张闻天 34 岁：长脸窄额、圆框眼镜、下颌收得很窄 */
    zhang_wentian: C({ w: 0.97, h: 1.00, up: 0.97, lw: 0.86, skull: 1.03, low: 1.02, jaw: 0.84, chin: 1.02, cheek: 0.88,
      browH: 0.02, eyeY: 0.16, eyeW: 0.96, noseV: -0.20, noseL: 1.10, mouthW: 0.94, age: 0.10, build: 0.94,
      cap: 'hairShort', hair: HR(0.4), skin: SK(0.50), coat: UN(0.34), glass: 'round', gear: 'satchel', prop: 'ledger' }),
    /* 王稼祥 28 岁：重伤未愈，最瘦最黄、脸颊凹陷、脸最长 */
    wang_jiaxiang: C({ w: 0.95, h: 1.03, up: 0.94, lw: 0.84, skull: 1.00, low: 1.05, jaw: 0.84, chin: 1.04, cheek: 0.84,
      browTh: 0.95, eyeY: 0.19, eyeU: 0.25, eyeW: 0.98, mouthV: -0.48, mouthW: 0.90, lipTh: 0.92,
      age: 0.08, build: 0.86, cap: 'hairShort', hair: HR(0.38), skin: SK(0.34), coat: UN(0.38) }),
    /* 博古 27 岁：圆脸软下巴、书卷气、圆框眼镜、气色最好也最年轻 */
    bogu: C({ w: 0.99, h: 1.02, up: 1.00, lw: 1.02, skull: 1.04, low: 1.00, jaw: 0.94, chin: 1.00, cheek: 1.06,
      browTh: 0.9, eyeY: 0.13, eyeU: 0.265, eyeW: 1.06, eyeH: 1.02, mouthW: 0.98, lipTh: 1.02,
      age: 0.02, build: 0.96, cap: 'hairShort', hair: HR(0.42), skin: SK(0.56), coat: UN(0.40),
      glass: 'round', prop: 'ledger' }),
    /* 李德 34 岁：德国人——高鼻梁大鼻子、深眼窝、灰发、窄长脸、八字胡、灰蓝大衣 */
    lide: C({ w: 1.03, h: 1.03, up: 0.95, lw: 0.94, skull: 1.04, low: 1.04, jaw: 0.94, chin: 1.00, cheek: 0.98,
      browH: 0.06, browTh: 1.15, eyeY: 0.20, eyeU: 0.27, eyeW: 0.94, eyeTilt: 0.10, iris: 0.90,
      noseV: -0.22, noseW: 1.46, noseL: 1.28, wing: 0.92, mouthW: 0.94, age: 0.24, build: 1.06,
      cap: 'hairShort', hair: '#8b8177', skin: '#d9b79c', coat: P.ramp(P.metal, 0.42),
      beard: 'mustache', beardColor: '#8b8177', gear: 'bandolier', prop: 'map' }),
    /* 彭德怀 36 岁：最方最硬的下颌、厚眉压眼、宽嘴，怒相最重 */
    peng: C({ w: 1.05, h: 1.03, up: 1.02, lw: 1.12, skull: 0.97, low: 0.96, jaw: 1.20, chin: 0.92, cheek: 1.06,
      browH: 0.05, browTh: 1.40, eyeY: 0.17, eyeU: 0.235, eyeW: 0.92, noseW: 1.12, mouthW: 1.10,
      mouthV: -0.45, age: 0.28, build: 1.10, cap: 'bajiao', hair: '#241d19', skin: SK(0.58),
      coat: UN(0.20), beard: 'stubble', gear: 'bandolier' }),
    /* 林彪 27 岁：全片最窄最长的一张脸、眉眼距离近、嘴小 */
    lin: C({ w: 0.94, h: 1.00, up: 0.90, lw: 0.80, skull: 1.01, low: 1.02, jaw: 0.78, chin: 1.04, cheek: 0.82,
      browTh: 0.95, eyeY: 0.16, eyeU: 0.245, eyeW: 0.94, noseV: -0.21, noseL: 1.10, mouthW: 0.86, lipTh: 0.94,
      age: 0.06, build: 0.88, cap: 'bajiao', hair: '#1e1916', skin: SK(0.54), coat: UN(0.34) }),
    /* 聂荣臻 35 岁：最"标准"的一张脸——身材和脸都居中，靠圆框眼镜认出 */
    nie: C({ w: 1.00, h: 1.00, up: 1.00, lw: 1.00, jaw: 0.98, chin: 1.00, cheek: 0.98, browTh: 1.10,
      eyeY: 0.14, eyeW: 1.00, mouthW: 1.00, age: 0.14, build: 1.00, cap: 'bajiao', hair: '#221c18',
      skin: SK(0.55), coat: UN(0.50), glass: 'round' }),
    /* 刘伯承 42 岁：「军神」——右眼摘除＋眼罩＋眼镜，额高、鼻宽、身板直 */
    liu_bocheng: C({ w: 1.02, h: 1.01, up: 1.02, lw: 1.02, skull: 1.01, low: 1.00, jaw: 1.04, chin: 1.00, cheek: 1.04,
      browH: 0.03, browTh: 1.20, eyeY: 0.16, eyeU: 0.255, eyeW: 1.00, noseW: 1.16, wing: 1.08,
      mouthW: 1.00, age: 0.34, build: 1.06, cap: 'junguan', capColor: P.ramp(P.uniformPad, 0.34),
      hair: HR(0.5), skin: SK(0.54), coat: UN(0.40), eyePatch: 'right', gear: 'satchel', prop: 'map' }),
    /* 陈云 29 岁：五官规矩、脸型偏窄、表情最"平"，靠整洁的短发与深色军装区分 */
    chen_yun: C({ w: 0.98, h: 1.01, up: 0.98, lw: 0.94, jaw: 0.92, chin: 1.00, cheek: 0.96, browTh: 1.05,
      eyeY: 0.14, eyeW: 1.00, mouthW: 0.96, age: 0.10, build: 0.94, cap: 'hairShort', hair: HR(0.40),
      skin: SK(0.51), coat: UN(0.24), gear: 'satchel', prop: 'ledger' }),
    /* 贺子珍 24 岁：女兵——脸小、颧骨高、下颌收窄、眉细眼大唇厚 */
    he_zizhen: C({ w: 0.92, h: 1.00, up: 0.92, lw: 0.84, skull: 0.99, low: 0.96, jaw: 0.84, chin: 1.00, cheek: 0.94,
      browH: 0.05, browTh: 0.56, eyeY: 0.14, eyeU: 0.27, eyeW: 1.16, eyeH: 1.08, iris: 1.04,
      mouthV: -0.48, mouthW: 0.90, lipTh: 1.22, age: 0.10, build: 0.86, neck: 0.94, cap: 'bajiao',
      hair: '#221c19', skin: SK(0.58), coat: UN(0.44), star: true, outfit: 'hongjunF' }),
    /* 邓颖超 30 岁：圆一些的鹅蛋脸、眉弯、气质最温和 */
    deng_yingchao: C({ w: 0.92, h: 1.02, up: 0.94, lw: 0.90, skull: 0.99, low: 0.95, jaw: 0.88, chin: 0.98, cheek: 1.02,
      browH: 0.05, browTh: 0.58, eyeY: 0.13, eyeU: 0.275, eyeW: 1.20, eyeH: 1.08, iris: 1.04,
      mouthV: -0.48, mouthW: 0.92, lipTh: 1.18, age: 0.12, build: 0.84, neck: 0.94, cap: 'hairLong',
      hair: '#241e1b', skin: SK(0.50), coat: UN(0.46), outfit: 'hongjunF', gear: 'satchel' }),
    /* 徐特立 57 岁：最长的白胡子＋圆框眼镜＋长衫，老态最完整 */
    xu_teli: C({ w: 1.00, h: 1.02, up: 0.98, lw: 0.93, skull: 1.00, low: 1.02, jaw: 0.96, chin: 1.02, cheek: 0.94,
      browTh: 0.85, eyeY: 0.17, eyeU: 0.25, eyeW: 0.96, noseV: -0.21, mouthV: -0.49, mouthW: 0.94,
      age: 0.68, build: 0.96, cap: 'hairShort', hair: HG(0.55), skin: SK(0.48), coat: UN(0.46),
      glass: 'round', outfit: 'changshan', beard: 'elder', beardColor: HG(0.72) }),
    /* 董必武 48 岁：长衫＋八字胡、脸型端正、眉眼平和 */
    dong_biwu: C({ w: 0.99, h: 1.01, up: 0.99, lw: 0.99, jaw: 0.97, chin: 1.01, cheek: 0.99, browTh: 0.95,
      eyeY: 0.16, mouthW: 0.96, age: 0.46, build: 1.00, cap: 'hairShort', hair: HG(0.42), skin: SK(0.50),
      coat: UN(0.44), beard: 'mustache', beardColor: HG(0.5), outfit: 'changshan', prop: 'ledger' }),
    /* 林伯渠 48 岁：短须、额头高、军装不穿长衫——和董必武靠胡型与服装分开 */
    lin_boqu: C({ w: 1.00, h: 1.02, up: 1.01, lw: 1.00, skull: 1.02, low: 1.01, jaw: 0.98, chin: 1.00, cheek: 0.98,
      browTh: 0.95, eyeY: 0.15, mouthW: 0.98, age: 0.50, build: 1.00, cap: 'hairShort', hair: HG(0.46),
      skin: SK(0.52), coat: UN(0.36), beard: 'short', beardColor: HG(0.6), gear: 'towel', prop: 'ledger' }),
    /* 谢觉哉 50 岁：长须＋最苍白的肤色＋凹陷的面颊，长衫 */
    xie_juezai: C({ w: 0.99, h: 1.02, up: 0.97, lw: 0.92, skull: 1.00, low: 1.03, jaw: 0.92, chin: 1.04, cheek: 0.92,
      browTh: 0.85, eyeY: 0.18, eyeW: 0.94, mouthV: -0.49, mouthW: 0.94, age: 0.60, build: 0.98,
      cap: 'hairShort', hair: HG(0.66), skin: SK(0.42), coat: UN(0.48), beard: 'elder',
      beardColor: HG(0.85), outfit: 'changshan' }),
    /* 叶剑英 37 岁：英挺的方脸、眉压得低而厚、肩最宽之一 */
    ye_jianying: C({ w: 1.02, h: 1.01, up: 1.03, lw: 1.05, jaw: 1.10, chin: 0.98, cheek: 1.03, browH: 0.04,
      browTh: 1.30, eyeY: 0.16, eyeU: 0.25, eyeW: 1.00, noseW: 1.08, mouthW: 1.06, age: 0.14, build: 1.08,
      cap: 'bajiao', hair: HR(0.42), skin: SK(0.55), coat: UN(0.28), gear: 'satchel', prop: 'map' }),
    /* 张国焘 37 岁：全片最宽最厚的一张脸、肉鼻、大檐军帽、望远镜 */
    zhang_guotao: C({ w: 1.08, h: 1.00, up: 1.08, lw: 1.18, skull: 0.99, low: 0.98, jaw: 1.20, chin: 0.96, cheek: 1.18,
      browTh: 1.25, eyeY: 0.15, eyeU: 0.23, eyeW: 0.94, noseW: 1.22, wing: 1.12, mouthW: 1.14,
      mouthV: -0.45, lipTh: 1.10, age: 0.22, build: 1.22, cap: 'junguan', capColor: P.ramp(P.uniformPad, 0.30),
      hair: HR(0.44), skin: SK(0.62), coat: UN(0.30), gear: 'bandolier', prop: 'bino' }),
    /* 徐向前 33 岁：山西人的窄长脸、单眼皮、肤色深、敦实 */
    xu_xiangqian: C({ w: 1.02, h: 0.99, up: 1.00, lw: 1.02, jaw: 1.02, chin: 0.98, cheek: 1.02, browTh: 1.15,
      eyeY: 0.15, eyeU: 0.245, eyeW: 0.96, iris: 0.94, noseW: 1.06, mouthW: 1.02, age: 0.16, build: 1.06,
      cap: 'bajiao', hair: HR(0.42), skin: SK(0.58), coat: UN(0.52) }),
    /* 李先念 25 岁：年轻的红脸膛、眉眼都精神、下巴方圆 */
    li_xiannian: C({ w: 1.02, h: 0.99, up: 1.01, lw: 1.02, jaw: 1.02, chin: 0.97, cheek: 1.03, browTh: 1.05,
      eyeY: 0.13, eyeU: 0.26, eyeW: 1.04, eyeH: 1.02, mouthW: 1.02, age: 0.04, build: 1.05,
      cap: 'bajiao', hair: HR(0.40), skin: SK(0.60), coat: UN(0.32), gear: 'bandolier' }),
    /* 小叶丹：彝族首领——黑布包头、深肤色、宽颧骨、厚眉、黑彝披毡 */
    xiao_yedan: C({ w: 1.05, h: 1.00, up: 1.07, lw: 1.12, jaw: 1.16, chin: 0.98, cheek: 1.12, browH: 0.03,
      browTh: 1.35, eyeY: 0.16, eyeU: 0.25, eyeW: 0.98, noseW: 1.20, wing: 1.15, mouthW: 1.08,
      lipTh: 1.10, age: 0.24, build: 1.12, cap: 'turban', turbanColor: '#2b2830', hair: '#191518',
      skin: SK(0.26), coat: P.ramp(P.inkSoft, 0.5), beard: 'stubble', outfit: 'yi' }),
    /* ============ 贯穿全剧的虚构人物 ============ */
    /* 小满：15 岁号手——圆脸颊、大眼、尖下巴、脖子细、身材最小 */
    xiaoman: C({ w: 0.93, h: 1.00, up: 0.94, lw: 1.00, skull: 0.99, low: 0.97, jaw: 0.82, chin: 0.96, cheek: 1.12,
      browH: 0.03, browTh: 0.70, eyeY: 0.13, eyeU: 0.28, eyeW: 1.22, eyeH: 1.08, iris: 1.06,
      noseV: -0.15, noseW: 0.90, noseL: 0.92, mouthV: -0.47, mouthW: 0.92, lipTh: 1.12,
      age: 0, build: 0.78, neck: 0.92, cap: 'bajiao', hair: '#241d18', skin: SK(0.66),
      coat: UN(0.48), prop: 'bugle', star: true }),
    /* 李铁柱：35 岁挑夫——最宽最厚的方脸、厚眉、蒜头鼻、围裙＋铜锅 */
    li_tiezhu: C({ w: 1.08, h: 1.00, up: 1.08, lw: 1.16, skull: 0.97, low: 0.97, jaw: 1.20, chin: 0.96, cheek: 1.14,
      browH: 0.04, browTh: 1.45, eyeY: 0.16, eyeU: 0.23, eyeW: 0.92, noseW: 1.28, wing: 1.22,
      mouthV: -0.44, mouthW: 1.14, lipTh: 1.08, age: 0.42, build: 1.20, cap: 'bajiao', hair: HR(0.44),
      skin: SK(0.56), coat: UN(0.46), beard: 'stubble', prop: 'pot', outfit: 'apron' }),
    /* 何晓梅：20 岁卫生员——最白净的圆脸、大眼、细眉、白罩衫＋红十字药箱 */
    he_xiaomei: C({ w: 0.92, h: 1.02, up: 0.93, lw: 0.94, skull: 0.98, low: 0.97, jaw: 0.84, chin: 0.98, cheek: 1.06,
      browH: 0.05, browTh: 0.55, eyeY: 0.13, eyeU: 0.28, eyeW: 1.22, eyeH: 1.10, iris: 1.06,
      noseV: -0.16, noseW: 0.92, mouthV: -0.48, mouthW: 0.90, lipTh: 1.22, age: 0.02, build: 0.82,
      neck: 0.94, cap: 'bob', hair: '#211b18', skin: SK(0.64), coat: P.ramp(P.white, 0.42),
      prop: 'medbox', outfit: 'hongjunF', gear: 'medbag' }),
    /* 郭大娘：55 岁房东——凹陷的颊、深深的法令纹、薄唇、头巾＋坐蓝布衣 */
    guo_daniang: C({ w: 0.98, h: 0.98, up: 0.96, lw: 0.90, skull: 0.99, low: 1.00, jaw: 0.98, chin: 0.98, cheek: 0.88,
      browTh: 0.78, eyeY: 0.18, eyeU: 0.245, eyeW: 0.94, eyeH: 0.96, noseV: -0.20, mouthV: -0.49,
      mouthW: 0.94, lipTh: 0.78, age: 0.74, build: 0.94, cap: 'scarf', scarfColor: P.ramp(P.cloth, 0.50),
      hair: HG(0.55), skin: SK(0.44), coat: P.ramp(P.water, 0.34), outfit: 'cloth' }),
    /* 石柱：19 岁战士——憨厚的方下巴、眉粗、眼睛小，背挎包 */
    shi_zhu: C({ w: 1.03, h: 0.99, up: 1.02, lw: 1.04, jaw: 1.06, chin: 0.98, cheek: 1.04, browH: 0.02,
      browTh: 1.25, eyeY: 0.15, eyeU: 0.24, eyeW: 0.94, noseW: 1.10, mouthW: 1.04, age: 0.10, build: 1.08,
      cap: 'bajiao', hair: '#221c18', skin: SK(0.60), coat: UN(0.40), gear: 'satchel' }),
    /* 阿月：17 岁苗族少女——最圆最软的一张脸、最大的眼睛、银饰头面；旧版银饰会看成
     * "白色耳机"，这里把银片收到发际线上方并缩小圆环 */
    a_yue: C({ w: 0.92, h: 1.02, up: 0.90, lw: 0.90, skull: 0.97, low: 0.97, jaw: 0.82, chin: 0.98, cheek: 1.08,
      browH: 0.05, browTh: 0.55, eyeY: 0.13, eyeU: 0.28, eyeW: 1.24, eyeH: 1.10, iris: 1.06,
      noseV: -0.15, noseW: 0.88, noseL: 0.94, mouthV: -0.48, mouthW: 0.88, lipTh: 1.25,
      age: 0, build: 0.78, neck: 0.92, cap: 'miao', hair: '#171315', skin: SK(0.32),
      coat: P.ramp(P.inkSoft, 0.42), outfit: 'miao' }),
    /* 吴老六：40 岁老兵——眯眼、风吹日晒的粗皮、宽腮、毛巾搭脖 */
    wu_laoliu: C({ w: 1.02, h: 0.99, up: 1.00, lw: 1.04, skull: 0.99, low: 1.00, jaw: 1.08, chin: 0.96, cheek: 1.00,
      browTh: 1.25, eyeY: 0.17, eyeU: 0.24, eyeW: 0.88, eyeH: 0.94, noseW: 1.14, mouthV: -0.45,
      mouthW: 1.00, lipTh: 0.96, age: 0.44, build: 1.04, cap: 'bajiao', hair: HR(0.48), skin: SK(0.54),
      coat: UN(0.16), beard: 'stubble', gear: 'towel' }),
    /* 三娃：12 岁娃娃——头大身小、脸颊最鼓、下巴最短、眼睛最大 */
    san_wa: C({ w: 0.92, h: 1.00, up: 0.91, lw: 0.96, skull: 1.02, low: 0.95, jaw: 0.78, chin: 0.96, cheek: 1.18,
      browH: 0.04, browTh: 0.60, eyeY: 0.12, eyeU: 0.29, eyeW: 1.30, eyeH: 1.12, iris: 1.08,
      noseV: -0.14, noseW: 0.86, noseL: 0.90, mouthV: -0.48, mouthW: 0.86, lipTh: 1.15,
      age: 0, build: 0.70, neck: 0.88, cap: 'bajiao', hair: '#241d18', skin: SK(0.70), coat: UN(0.34) }),
    /* ============ 群众（3 组 + 旁白） ============ */
    soldiers: C({ cap: 'bajiao', skin: SK(0.58), coat: UN(0.38), jaw: 1.00, chin: 0.98, cheek: 1.02,
      browTh: 1.10, eyeY: 0.15, mouthW: 1.02, build: 1.04, gear: 'bandolier' }),
    villagers: C({ cap: 'scarf', skin: SK(0.50), coat: P.ramp(P.cloth, 0.44), outfit: 'cloth',
      age: 0.30, jaw: 0.98, chin: 0.99, cheek: 0.98, eyeY: 0.16, mouthW: 0.98, build: 0.98, gear: 'towel' }),
    yi_people: C({ w: 1.02, cap: 'turban', skin: SK(0.30), coat: P.ramp(P.inkSoft, 0.5), outfit: 'yi',
      jaw: 1.08, chin: 0.98, cheek: 1.06, browTh: 1.20, eyeW: 0.96, mouthW: 1.04, build: 1.06 }),
    narrator: C({ cap: 'none', skin: SK(0.5), coat: UN(0.30), outfit: 'changshan',
      up: 0.99, lw: 0.98, jaw: 0.96, chin: 1.00, cheek: 0.98, browTh: 0.9, eyeY: 0.15, mouthW: 0.98,
      age: 0.20, build: 1.00 })
  };

  /* ---------------------------- 9. 组装 ---------------------------- */
  function build(id, face) {
    var k = CHARS[id] || CHARS.soldiers;
    var ex = EXPR[face] || EXPR.calm;
    var T = transform(k);
    var L = landmarks(k);
    var col = {
      skin: k.skin, hair: k.hair, coat: k.coat, beard: k.beardColor,
      sclera: '#e9e3d6', iris: '#4a3020', pupil: '#171210',
      lid: P.mul(k.skin, 0.83), lash: 'rgba(28,20,16,0.88)',
      /* 唇色只比肤色暗一档、红一点。旧版偏"口红"，放在红军军装人物上不合适。 */
      lipUp: P.mul(P.mix('#9c5a48', k.skin, 0.44), 0.92),
      lipDn: P.mix('#ab6551', k.skin, 0.50),
      mouthIn: '#5a2b28'
    };
    if (ex.ex.indexOf('pale') >= 0) col.skin = P.mix(k.skin, '#e3dcd2', 0.46);
    if (ex.ex.indexOf('warm') >= 0) col.skin = P.mix(k.skin, '#e2a184', 0.14);

    var s = '';
    var chinY = T.y(-1.00 * k.chin * k.low);
    /* 躯干在底层 */
    s += drawTorso(k, T, col);
    /* 短脖子：下巴到衣领只留 ~36px（SPEC §4.2：下巴到肩 ≤60px）。
     * 用「同色系暗一档 + 下颌投影」而不是一整块深色梯形，否则远看会像一撮胡子。 */
    var neckW = T.uw * 0.40 * k.neck;
    s += poly([[T.cx - neckW, chinY - 4], [T.cx + neckW, chinY - 4],
      [T.cx + neckW * 1.18, chinY + 40 * k.neck], [T.cx - neckW * 1.18, chinY + 40 * k.neck]],
      P.mul(col.skin, 0.86), { stroke: 'rgba(70,42,28,0.24)', sw: 1.0 });
    s += poly([[T.cx - neckW, chinY - 2], [T.cx + neckW, chinY - 2],
      [T.cx + neckW * 1.04, chinY + 12], [T.cx - neckW * 1.04, chinY + 12]], 'rgba(58,34,22,0.26)');
    /* 耳：上缘齐眼线、下缘齐鼻底；外缘收成一条弧（不是一块方板），只露出头骨轮廓之外
     * 的一小截，避免"招风耳 / 耳罩"的观感。 */
    var earY0 = T.y(Math.max(k.eyeY + 0.02, 0.13)), earY1 = T.y(k.noseV - 0.03);
    /* 内缘必须留在头骨轮廓以内（下颌处头骨最窄只有 0.87 个头宽单位），
     * 否则耳朵下半截会"悬"在脸外面。头骨后画，会把内侧那一截盖掉。 */
    var earH = earY1 - earY0, eo = 1.05, ei = 0.78;
    function earPts(sgn) {
      return [[T.cx + sgn * T.uw * ei, earY0 + earH * 0.30],
        [T.cx + sgn * T.uw * eo * 0.94, earY0 + earH * 0.02],
        [T.cx + sgn * T.uw * eo, earY0 + earH * 0.42],
        [T.cx + sgn * T.uw * eo * 0.90, earY1],
        [T.cx + sgn * T.uw * ei, earY1 - earH * 0.24]];
    }
    s += poly(earPts(-1), P.mul(col.skin, 0.95), { stroke: 'rgba(78,46,30,0.26)', sw: 1.0 });
    s += poly(earPts(1), P.mul(col.skin, 0.86), { stroke: 'rgba(78,46,30,0.26)', sw: 1.0 });
    /* 头骨 */
    s += drawSkull(L, T, k, col);
    s += drawAge(T, k);
    /* 眼 */
    /* 眼睛：半宽取 0.23 个头宽单位（两眼内角之间正好留出一只眼的宽度），
     * 旧版 0.30 会让眼睛占到头宽的三成，远看像"瞪眼"。 */
    var ew = T.uw * 0.23 * k.eyeW, eh = T.hh * 0.080 * ex.eye.open * k.eyeH;
    var eL = T.fp(L.eyeL), eR = T.fp(L.eyeR);
    s += GEO.ell(eL[0], eL[1] - eh * 0.5, ew * 1.3, eh * 1.6, 'rgba(88,52,34,0.10)');
    s += GEO.ell(eR[0], eR[1] - eh * 0.5, ew * 1.3, eh * 1.6, 'rgba(88,52,34,0.14)');
    s += drawEye(eL[0], eL[1], ew, eh, -1, ex.eye, col, k);
    s += drawEye(eR[0], eR[1], ew, eh, 1, ex.eye, col, k);
    s += drawPatch(k, T, L);
    /* 眉：锚在各自的眼睛外侧 / 内侧，换 eyeU 时眉不会和眼睛分家 */
    var bt = T.hh * 0.030 * ex.brow.th * k.browTh, bdy = T.hh * 0.050 * ex.brow.dy;
    var bh = L.browL[1], bs = ex.brow.w;
    var bl0 = T.fp([L.eyeL[0] - 0.150 * bs, bh + 0.02 + ex.brow.ang * 0.06]);
    var bl1 = T.fp([L.eyeL[0] + 0.135 * bs, bh - 0.03 - ex.brow.ang * 0.16]);
    var br0 = T.fp([L.eyeR[0] - 0.135 * bs, bh - 0.02 - ex.brow.ang * 0.16]);
    var br1 = T.fp([L.eyeR[0] + 0.150 * bs, bh + 0.03 + ex.brow.ang * 0.06]);
    s += drawBrow(bl0[0], bl0[1] + bdy, bl1[0], bl1[1] + bdy * 1.5, bt * 0.7, bt, col.hair);
    s += drawBrow(br0[0], br0[1] + bdy * 1.5, br1[0], br1[1] + bdy, bt, bt * 0.7, col.hair);
    /* 嘴 */
    var mp = T.fp(L.mouthC);
    s += drawMouth(mp[0], mp[1], T.uw * 0.30 * k.mouthW * ex.mouth.w, ex.mouth, col, T.uw * 0.085, k);
    s += drawBeard(k, T, col);
    /* 表情附加 */
    if (ex.ex.indexOf('sweat') >= 0) {
      s += poly([[T.cx + T.uw * 0.80, T.y(0.52)], [T.cx + T.uw * 0.96, T.y(0.60)], [T.cx + T.uw * 0.84, T.y(0.32)]],
        'rgba(180,214,236,0.78)');
    }
    if (ex.ex.indexOf('tear') >= 0) {
      s += GEO.ell(eL[0] + ew * 0.4, eL[1] + eh * 1.6, 5.2, 9.0, 'rgba(190,220,240,0.88)');
    }
    if (ex.ex.indexOf('vein') >= 0) {
      s += ln(T.cx - T.uw * 0.52, T.y(0.62), T.cx - T.uw * 0.32, T.y(0.72), 'rgba(150,48,40,0.5)', { sw: 2.6 });
      s += ln(T.cx - T.uw * 0.38, T.y(0.60), T.cx - T.uw * 0.24, T.y(0.74), 'rgba(150,48,40,0.4)', { sw: 2.2 });
    }
    s += drawGlasses(k, T, L);
    s += drawCap(k, T, col);
    s += drawProp(k, T);

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H +
      '" viewBox="0 0 ' + W + ' ' + H + '">' + s + '</svg>';
  }

  /* ---------------------------- 10. 注册 ---------------------------- */
  Object.keys(CHARS).forEach(function (id) {
    ART.portraits[id] = { faces: FACES, draw: function (face) { return build(id, face); } };
  });
  /* 注意：不要把辅助字段挂在 ART.portraits 上——build-art.js 会遍历它当成立绘条目。 */
  ART.portraitsRoot = { build: build, CHARS: CHARS, EXPR: EXPR, FACES: FACES };

  if (typeof module === 'object' && module.exports) module.exports = ART.portraits;
})();
