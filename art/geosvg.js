/* 《长征·万水千山》立体几何（low-poly / 等距）SVG 渲染库
 * 文件所有权：root（冻结）。任何 agent 不得修改本文件；如需新增原语，向 /root 提出。
 * 浏览器与 Node 双端可用，零依赖。所有绘制确定性：同一 seed → 同一字节输出。
 * 命名空间：window.GEO（Node 下挂到 globalThis.GEO）。
 */
(function () {
  'use strict';

  var G = (typeof window !== 'undefined') ? window
        : (typeof globalThis !== 'undefined') ? globalThis
        : this;

  var P = G.ART_PALETTE;
  if (!P && typeof module === 'object' && module.exports) P = require('./palette.js');
  if (!P) throw new Error('geosvg.js: 需要先加载 art/palette.js');

  /* =========================================================================
   * 0. 内部工具
   * ====================================================================== */
  var _gid = 0;
  function uid(pfx) { _gid += 1; return (pfx || 'g') + _gid; }
  function n(v) { var r = Math.round(v * 100) / 100; return String(r === 0 ? 0 : r); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function hashStr(s) {
    var h = 2166136261 >>> 0; s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function RNG(seed) {
    var a = (typeof seed === 'number') ? (seed >>> 0) : hashStr(seed);
    var f = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = function (lo, hi) { return lo + (hi - lo) * f(); };
    f.int = function (lo, hi) { return Math.floor(lo + (hi - lo + 1) * f()); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length) % arr.length]; };
    return f;
  }

  /* =========================================================================
   * 1. 基础 SVG 图元
   * ====================================================================== */
  function attrStr(o) {
    o = o || {};
    var s = '';
    if (o.stroke) s += ' stroke="' + o.stroke + '" stroke-width="' + (o.sw == null ? 1 : o.sw) + '"';
    if (o.opacity != null) s += ' opacity="' + o.opacity + '"';
    if (o.fillOpacity != null) s += ' fill-opacity="' + o.fillOpacity + '"';
    if (o.strokeOpacity != null) s += ' stroke-opacity="' + o.strokeOpacity + '"';
    if (o.dash) s += ' stroke-dasharray="' + o.dash + '"';
    if (o.cap) s += ' stroke-linecap="' + o.cap + '"';
    if (o.join) s += ' stroke-linejoin="' + o.join + '"';
    if (o.transform) s += ' transform="' + o.transform + '"';
    if (o.cls) s += ' class="' + o.cls + '"';
    if (o.filter) s += ' filter="' + o.filter + '"';
    if (o.rotate != null) s += ' transform="rotate(' + o.rotate + (o.rx != null ? ' ' + n(o.rx) + ' ' + n(o.ry) : '') + ')"';
    return s;
  }
  function pts2str(pts) {
    var out = [];
    for (var i = 0; i < pts.length; i++) out.push(n(pts[i][0]) + ',' + n(pts[i][1]));
    return out.join(' ');
  }
  function poly(pts, fill, o) {
    o = o || {};
    return '<polygon points="' + pts2str(pts) + '" fill="' + (fill || 'none') + '"' + attrStr(o) + '/>';
  }
  function pline(pts, stroke, o) {
    o = o || {};
    return '<polyline points="' + pts2str(pts) + '" fill="none" stroke="' + stroke + '" stroke-width="' + (o.sw == null ? 1 : o.sw) + '"' + attrStr(o) + '/>';
  }
  function pth(d, fill, o) {
    o = o || {};
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + attrStr(o) + '/>';
  }
  function rect(x, y, w, h, fill, o) {
    o = o || {};
    return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + (fill || 'none') + '"'
      + (o.rx ? ' rx="' + n(o.rx) + '"' : '') + attrStr(o) + '/>';
  }
  function circle(cx, cy, r, fill, o) {
    o = o || {};
    return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" fill="' + (fill || 'none') + '"' + attrStr(o) + '/>';
  }
  function ell(cx, cy, rx, ry, fill, o) {
    o = o || {};
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + (fill || 'none') + '"' + attrStr(o) + '/>';
  }
  function ln(x1, y1, x2, y2, stroke, o) {
    o = o || {};
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" stroke="' + stroke + '" stroke-width="' + (o.sw == null ? 1 : o.sw) + '"' + attrStr(o) + '/>';
  }
  function grp(children, o) {
    o = o || {};
    var body = (children instanceof Array) ? children.join('') : String(children);
    return '<g' + attrStr(o) + '>' + body + '</g>';
  }
  function text(x, y, str, o) {
    o = o || {};
    /* 注意：属性用双引号包裹，字体名内部必须用单引号，否则嵌套双引号会让整个 SVG 解析失败。 */
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-family="' + (o.font || "'Noto Sans CJK SC','Source Han Sans SC','Microsoft YaHei','PingFang SC',sans-serif")
      + '" font-size="' + n(o.size || 16) + '" fill="' + (o.fill || '#fff') + '" text-anchor="' + (o.anchor || 'start')
      + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : '') + (o.ls != null ? ' letter-spacing="' + o.ls + '"' : '')
      + (o.opacity != null ? ' opacity="' + o.opacity + '"' : '') + (o.transform ? ' transform="' + o.transform + '"' : '') + '>'
      + String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</text>';
  }
  function linearGrad(id, stops, o) {
    o = o || {};
    var s = '<linearGradient id="' + id + '" x1="' + (o.x1 == null ? 0 : o.x1) + '" y1="' + (o.y1 == null ? 0 : o.y1)
      + '" x2="' + (o.x2 == null ? 0 : o.x2) + '" y2="' + (o.y2 == null ? 1 : o.y2) + '">';
    for (var i = 0; i < stops.length; i++) {
      var st = stops[i];
      s += '<stop offset="' + st[0] + '" stop-color="' + st[1] + '"' + (st[2] != null ? ' stop-opacity="' + st[2] + '"' : '') + '/>';
    }
    return s + '</linearGradient>';
  }
  function radialGrad(id, stops, o) {
    o = o || {};
    var s = '<radialGradient id="' + id + '" cx="' + (o.cx == null ? 0.5 : o.cx) + '" cy="' + (o.cy == null ? 0.5 : o.cy)
      + '" r="' + (o.r == null ? 0.5 : o.r) + '" fx="' + (o.fx == null ? (o.cx == null ? 0.5 : o.cx) : o.fx)
      + '" fy="' + (o.fy == null ? (o.cy == null ? 0.5 : o.cy) : o.fy) + '">';
    for (var i = 0; i < stops.length; i++) {
      var st = stops[i];
      s += '<stop offset="' + st[0] + '" stop-color="' + st[1] + '"' + (st[2] != null ? ' stop-opacity="' + st[2] + '"' : '') + '/>';
    }
    return s + '</radialGradient>';
  }
  function defs(str) { return '<defs>' + str + '</defs>'; }

  /* =========================================================================
   * 2. 几何/色彩辅助
   * ====================================================================== */
  var mix = P.mix, lighten = P.lighten, darken = P.darken, alpha = P.alpha, mul = P.mul, ramp = P.ramp;

  function centroid(pts) {
    var sx = 0, sy = 0;
    for (var i = 0; i < pts.length; i++) { sx += pts[i][0]; sy += pts[i][1]; }
    return [sx / pts.length, sy / pts.length];
  }
  function inset(pts, t) {
    var c = centroid(pts), out = [];
    for (var i = 0; i < pts.length; i++) out.push([pts[i][0] + (c[0] - pts[i][0]) * t, pts[i][1] + (c[1] - pts[i][1]) * t]);
    return out;
  }
  function expand(pts, t) { return inset(pts, -t); }
  function move(pts, dx, dy) {
    var out = [];
    for (var i = 0; i < pts.length; i++) out.push([pts[i][0] + dx, pts[i][1] + dy]);
    return out;
  }
  function scalePts(pts, k, ax, ay) {
    ax = ax == null ? 0 : ax; ay = ay == null ? 0 : ay;
    var out = [];
    for (var i = 0; i < pts.length; i++) out.push([ax + (pts[i][0] - ax) * k, ay + (pts[i][1] - ay) * k]);
    return out;
  }
  function jitter(pts, rng, amt) {
    var out = [];
    for (var i = 0; i < pts.length; i++) out.push([pts[i][0] + rng.range(-amt, amt), pts[i][1] + rng.range(-amt, amt)]);
    return out;
  }

  /* 关键原语：低多边形面片。底色 + 高光块 + 暗部块 + 描边。 */
  function facet(pts, color, o) {
    o = o || {};
    var s = poly(pts, color, {
      stroke: o.stroke === null ? null : (o.stroke || alpha(P.ink, 0.22)),
      sw: o.sw == null ? 0.9 : o.sw,
      join: 'round',
      opacity: o.opacity
    });
    /* 大面片自动收窄内嵌高光/暗部，避免出现「窗格」伪影 */
    var _bw = 0, _bh = 0, _x0 = Infinity, _x1 = -Infinity, _y0 = Infinity, _y1 = -Infinity;
    for (var _i = 0; _i < pts.length; _i++) {
      if (pts[_i][0] < _x0) _x0 = pts[_i][0];
      if (pts[_i][0] > _x1) _x1 = pts[_i][0];
      if (pts[_i][1] < _y0) _y0 = pts[_i][1];
      if (pts[_i][1] > _y1) _y1 = pts[_i][1];
    }
    _bw = _x1 - _x0; _bh = _y1 - _y0;
    var _sz = Math.max(_bw, _bh, 1);
    var _t1max = (o.rim == null ? 15 : o.rim) / _sz;
    var _t2max = (o.rim2 == null ? 26 : o.rim2) / _sz;
    if (o.flat === true) { _t1max = 0; _t2max = 0; }
    var li = (o.light == null ? 0.1 : o.light);
    if (li > 0) {
      var _t1 = Math.min(o.inset == null ? 0.2 : o.inset, _t1max);
      if (_t1 > 0.0005) {
        var ip = inset(pts, _t1);
        s += poly(move(ip, -(o.dx == null ? 1.4 : o.dx), -(o.dy == null ? 1.8 : o.dy)), lighten(color, li * 2.2),
          { opacity: o.hl == null ? 0.42 : o.hl });
      }
    }
    var dk = (o.dark == null ? 0.1 : o.dark);
    if (dk > 0) {
      var _t2 = Math.min(o.inset2 == null ? 0.34 : o.inset2, _t2max);
      if (_t2 > 0.0005) {
        var dp = inset(pts, _t2);
        s += poly(move(dp, (o.dx2 == null ? 1.6 : o.dx2), (o.dy2 == null ? 2.0 : o.dy2)), darken(color, dk),
          { opacity: o.dl == null ? 0.3 : o.dl });
      }
    }
    return s;
  }

  /* 面片带：把两条等长折线之间的区域切成逐段面片 */
  function facetBand(topPts, botPts, color, o) {
    o = o || {};
    var s = '';
    var steps = Math.min(topPts.length, botPts.length) - 1;
    for (var i = 0; i < steps; i++) {
      var q = [topPts[i], topPts[i + 1], botPts[i + 1], botPts[i]];
      var t = steps > 1 ? i / (steps - 1) : 0;
      var c = o.grad ? mix(color, o.grad, t) : mul(color, 0.92 + 0.16 * Math.abs(Math.sin(i * 1.7)));
      s += facet(q, c, { sw: o.sw == null ? 0.8 : o.sw, light: o.light == null ? 0.08 : o.light, hl: 0.3, dark: 0.08, dl: 0.22, stroke: o.stroke });
    }
    return s;
  }

  /* 等距立方体：正面 + 顶面 + 右侧面 */
  function boxIso(x, y, w, h, d, color, o) {
    o = o || {};
    var tw = w * 0.5, td = d * 0.5;
    var front = [[x - tw, y], [x + tw, y], [x + tw, y - h], [x - tw, y - h]];
    var topF = [[x - tw, y - h], [x + tw, y - h], [x + tw + td, y - h - d * 0.42], [x - tw + td, y - h - d * 0.42]];
    var sideF = [[x + tw, y], [x + tw + td, y - d * 0.42], [x + tw + td, y - h - d * 0.42], [x + tw, y - h]];
    var s = '';
    if (o.noTop !== true) s += facet(topF, lighten(color, 0.16), { light: 0.08, hl: 0.3, dark: 0.06, dl: 0.2 });
    s += facet(front, color, { light: o.light == null ? 0.1 : o.light, hl: o.hl == null ? 0.34 : o.hl, dark: 0.1, dl: 0.3 });
    s += facet(sideF, darken(color, 0.16), { light: 0.06, hl: 0.22, dark: 0.1, dl: 0.3 });
    return s;
  }

  /* =========================================================================
   * 3. 天空与天气
   * ====================================================================== */
  function sky(w, h, rampColors, o) {
    o = o || {};
    var id = uid('sky');
    var horizon = o.horizon == null ? h * 0.66 : o.horizon;
    var s = defs(linearGrad(id, [[0, rampColors[0]], [0.42, rampColors[0]], [0.72, rampColors[1]], [1, rampColors[2]]], { x1: 0, y1: 0, x2: 0, y2: 1 }));
    s += rect(0, 0, w, horizon + 2, 'url(#' + id + ')');
    if (o.glow) s += glowBand(w, horizon, o.glow, o.glowAt == null ? 0.5 : o.glowAt);
    return s;
  }
  function glowBand(w, horizon, color, at) {
    var id = uid('glow');
    return defs(linearGrad(id, [[0, alpha(color, 0)], [0.62, alpha(color, 0.34)], [1, alpha(color, 0.72)]], { x1: 0, y1: 0, x2: 0, y2: 1 }))
      + rect(0, horizon - 150, w, 150, 'url(#' + id + ')');
  }
  function ngon(cx, cy, r, sides, rot, squash) {
    var out = [], sq = squash == null ? 1 : squash;
    for (var i = 0; i < sides; i++) {
      var a = (i / sides) * Math.PI * 2 + (rot || 0);
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * sq]);
    }
    return out;
  }
  function sunDisc(cx, cy, r, color, o) {
    o = o || {};
    var s = '';
    if (o.halo !== false) {
      var id = uid('halo');
      s += defs(radialGrad(id, [[0, alpha(color, 0.55)], [0.55, alpha(color, 0.18)], [1, alpha(color, 0)]]))
        + circle(cx, cy, r * (o.hr || 3.6), 'url(#' + id + ')');
    }
    s += poly(ngon(cx, cy, r, 14, 0.1), color, { opacity: o.op == null ? 0.95 : o.op });
    if (o.disc === 'moon') {
      s += poly(ngon(cx - r * 0.3, cy - r * 0.2, r * 0.24, 8, 0), darken(color, 0.16), { opacity: 0.35 });
      s += poly(ngon(cx + r * 0.26, cy + r * 0.24, r * 0.18, 7, 0.4), darken(color, 0.12), { opacity: 0.28 });
    }
    return s;
  }
  function stars(w, h, count, seed) {
    var rng = RNG(seed || 'stars'), s = '';
    for (var i = 0; i < count; i++) {
      var x = rng.range(0, w), y = rng.range(0, h * 0.6), r = rng.range(0.6, 1.9);
      s += poly(ngon(x, y, r, 4, Math.PI / 4), rng() < 0.2 ? P.lightCool : '#ffffff', { opacity: rng.range(0.25, 0.95) });
    }
    return s;
  }
  function cloudBank(w, y, color, o) {
    o = o || {};
    var rng = RNG(o.seed || ('cloud' + Math.round(y)));
    var cnt = o.count || 7, s = '', op = o.opacity == null ? 0.5 : o.opacity;
    for (var i = 0; i < cnt; i++) {
      var cx = rng.range(-140, w + 140), cy = y + rng.range(-40, 40), sc = rng.range(0.65, 1.6);
      var lobes = 7, body = '';
      for (var j = 0; j < lobes; j++) {
        var u = j / (lobes - 1);
        var lx = cx + (u - 0.5) * 320 * sc;
        var lr = (44 + Math.sin(u * Math.PI) * 30) * sc * rng.range(0.82, 1.2);
        var ly = cy - Math.sin(u * Math.PI) * 30 * sc;
        body += poly(ngon(lx, ly, lr, 7, rng() * 2, 0.7), color, { opacity: op });
      }
      body += poly([[cx - 168 * sc, cy + 20 * sc], [cx + 168 * sc, cy + 20 * sc], [cx + 156 * sc, cy + 46 * sc], [cx - 156 * sc, cy + 46 * sc]], color, { opacity: op });
      s += body;
      s += poly(ngon(cx - 52 * sc, cy - 34 * sc, 54 * sc, 6, 0.4, 0.58), lighten(color, 0.24), { opacity: op * 0.34 });
    }
    return s;
  }
  function mistBand(w, y, hgt, color, o) {
    o = o || {};
    var id = uid('mist');
    return defs(linearGrad(id, [[0, alpha(color, 0)], [0.45, alpha(color, o.op == null ? 0.5 : o.op)], [1, alpha(color, 0)]], { x1: 0, y1: 0, x2: 0, y2: 1 }))
      + rect(0, y, w, hgt, 'url(#' + id + ')');
  }
  function snowfall(w, h, count, seed, o) {
    o = o || {};
    var rng = RNG(seed || 'snow'), s = '';
    for (var i = 0; i < count; i++) {
      var x = rng.range(0, w), y = rng.range(0, h), r = rng.range(0.8, 2.6);
      s += poly(ngon(x, y, r, 6, rng() * 2), o.color || '#eef5fb', { opacity: rng.range(0.28, 0.9) });
    }
    return s;
  }
  function rainfall(w, h, count, seed, o) {
    o = o || {};
    var rng = RNG(seed || 'rain'), s = '';
    for (var i = 0; i < count; i++) {
      var x = rng.range(-60, w + 60), y = rng.range(0, h), len = rng.range(26, 86);
      s += ln(x, y, x - len * 0.52, y + len, o.color || '#c8d6e2', { sw: rng.range(0.7, 1.7), opacity: rng.range(0.16, 0.5), cap: 'round' });
    }
    return s;
  }
  function embers(w, h, count, seed, o) {
    o = o || {};
    var rng = RNG(seed || 'ember'), s = '';
    for (var i = 0; i < count; i++) {
      var x = rng.range(0, w), y = rng.range(h * 0.2, h), r = rng.range(0.9, 2.6);
      s += poly(ngon(x, y, r, 5, rng() * 3), rng() < 0.5 ? (o.color || P.ramp(P.flame, 0.6)) : P.ramp(P.lamp, 0.4), { opacity: rng.range(0.3, 0.95) });
    }
    return s;
  }
  function smokePlume(cx, base, hgt, color, seed) {
    var rng = RNG(seed || ('smoke' + Math.round(cx)));
    var s = '', x = cx, y = base, steps = 9;
    for (var i = 0; i < steps; i++) {
      var t = i / (steps - 1), r = lerp(16, 78, t) * rng.range(0.8, 1.2);
      x += rng.range(-22, 26); y -= hgt / steps * rng.range(0.75, 1.25);
      s += poly(ngon(x, y, r, 7, rng() * 2), color, { opacity: (1 - t) * 0.3 + 0.06 });
    }
    return s;
  }
  function vignette(w, h, strength, color) {
    var id = uid('vig'), c = color || P.ink;
    return defs(radialGrad(id, [[0, alpha(c, 0)], [0.62, alpha(c, 0)], [1, alpha(c, strength == null ? 0.5 : strength)]], { cx: 0.5, cy: 0.48, r: 0.78 }))
      + rect(0, 0, w, h, 'url(#' + id + ')');
  }

  /* =========================================================================
   * 4. 地形
   * ====================================================================== */
  function ridgeLine(x0, x1, yBase, amp, segs, rng, jag) {
    var pts = [];
    for (var i = 0; i <= segs; i++) {
      var t = i / segs;
      var y = yBase - Math.sin(t * Math.PI) * amp * rng.range(0.55, 1.25) - rng.range(0, amp * (jag == null ? 0.18 : jag));
      pts.push([lerp(x0, x1, t), y]);
    }
    return pts;
  }
  function mountainRange(w, horizon, color, o) {
    o = o || {};
    var rng = RNG(o.seed || 'ridge');
    var segs = o.segs || 16;
    var pts = ridgeLine(-20, w + 20, horizon, o.amp || 170, segs, rng, o.jag);
    var s = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var q = [pts[i], pts[i + 1], [pts[i + 1][0], horizon + 60], [pts[i][0], horizon + 60]];
      var t = i / (pts.length - 1);
      var c = o.grad ? mix(color, o.grad, t) : mul(color, 0.86 + 0.3 * rng());
      s += facet(q, c, { light: o.light == null ? 0.09 : o.light, hl: 0.32, dark: 0.12, dl: 0.3, sw: 0.7 });
    }
    if (o.snowcap) {
      /* 雪线：峰顶越高，积雪带越深（沿山脊向下延伸），形成自然的角状雪冠 */
      var amp = o.amp || 170;
      var snowY = o.snowY == null ? horizon - amp * (o.snowRatio == null ? 0.52 : o.snowRatio) : o.snowY;
      var capMax = o.capMax == null ? amp * 0.5 : o.capMax;
      var snowCol = o.snowColor || P.ramp(P.snow, 0.8);
      for (var k = 0; k < pts.length - 1; k++) {
        var d0 = clamp(snowY - pts[k][1], 0, capMax);
        var d1 = clamp(snowY - pts[k + 1][1], 0, capMax);
        if (d0 <= 0.5 && d1 <= 0.5) continue;
        if (d0 <= 0.5) d0 = 0.5;
        if (d1 <= 0.5) d1 = 0.5;
        s += poly([[pts[k][0], pts[k][1]], [pts[k + 1][0], pts[k + 1][1]],
          [pts[k + 1][0], pts[k + 1][1] + d1], [pts[k][0], pts[k][1] + d0]],
          snowCol, { opacity: o.snowOpacity == null ? 0.92 : o.snowOpacity });
      }
    }
    return s;
  }
  function cliffWall(x0, x1, yTop, yBot, color, o) {
    o = o || {};
    var rng = RNG(o.seed || 'cliff');
    var cols = o.cols || 7, s = '';
    for (var i = 0; i < cols; i++) {
      var ax = lerp(x0, x1, i / cols), bx = lerp(x0, x1, (i + 1) / cols);
      var ty0 = yTop + rng.range(-14, 14), ty1 = yTop + rng.range(-14, 14);
      s += facet([[ax, ty0], [bx, ty1], [bx, yBot], [ax, yBot]], mul(color, 0.82 + 0.36 * rng()), { light: 0.1, hl: 0.34, dark: 0.1, dl: 0.28, sw: 0.8 });
    }
    return s;
  }
  function groundBand(w, y0, y1, color, o) {
    o = o || {};
    var rng = RNG(o.seed || 'ground');
    var rows = o.rows || 6, s = '';
    var id = uid('grd');
    s += defs(linearGrad(id, [[0, mul(color, 0.82)], [0.45, color], [1, mul(color, 1.12)]], { x1: 0, y1: 0, x2: 0, y2: 1 }));
    s += rect(-40, y0 - 4, w + 80, (y1 - y0) + 8, 'url(#' + id + ')');
    for (var r = 0; r < rows; r++) {
      var t0 = Math.pow(r / rows, 0.72), t1 = Math.pow((r + 1) / rows, 0.72);
      var ya = lerp(y0, y1, t0), yb = lerp(y0, y1, t1) + 2;
      var cols = 5 + r * 2;
      for (var c = 0; c < cols; c++) {
        var xa = -60 + (w + 120) * (c / cols) + rng.range(-34, 34);
        var xb = -60 + (w + 120) * ((c + 1) / cols) + rng.range(-34, 34);
        var dy = rng.range(-7, 7);
        s += poly([[xa, ya + dy], [xb, ya + rng.range(-7, 7)], [xb, yb], [xa, yb]],
          mul(color, 0.82 + rng() * 0.4), { opacity: o.op == null ? 0.5 : o.op, stroke: null });
      }
    }
    /* 细碎斑块，打散"墙面"感 */
    var n = o.patches || 90;
    for (var k = 0; k < n; k++) {
      var pt = Math.pow(rng(), 0.6);
      var px = rng.range(-30, w + 30), py = lerp(y0, y1, pt);
      var pr = lerp(6, 34, pt) * rng.range(0.5, 1.3);
      s += poly(ngon(px, py, pr, 6, rng() * 2, 0.5), mul(color, 0.72 + rng() * 0.62),
        { opacity: rng.range(0.18, 0.5), stroke: null });
    }
    return s;
  }
  function waterBand(w, y0, y1, colors, o) {
    o = o || {};
    var rng = RNG(o.seed || 'water');
    var id = uid('wat');
    var s = defs(linearGrad(id, [[0, colors[0]], [0.42, colors[1]], [1, colors[colors.length - 1]]], { x1: 0, y1: 0, x2: 0, y2: 1 }));
    s += rect(-10, y0, w + 20, (y1 - y0) + 12, 'url(#' + id + ')');
    var hgt = y1 - y0;
    /* 水平水纹：近大远小、近疏远密 */
    var n = o.streaks || 190;
    for (var i = 0; i < n; i++) {
      var t = Math.pow(rng(), 0.55);
      var y = y0 + t * hgt;
      var len = lerp(w * 0.05, w * 0.36, rng()) * (0.45 + t);
      var x = rng.range(-60, w + 20);
      var th = lerp(1.2, 7.5, t) * rng.range(0.6, 1.5);
      var c = rng() < 0.2 ? lighten(rng.pick(colors), 0.36) : mul(rng.pick(colors), 0.84 + rng() * 0.34);
      s += poly([[x, y], [x + len, y], [x + len - len * 0.09, y + th], [x - len * 0.05, y + th]], c, { opacity: rng.range(0.3, 0.82) });
    }
    /* 镜面高光细线 */
    for (var k = 0; k < 30; k++) {
      var t2 = Math.pow(rng(), 0.6);
      var y2 = y0 + t2 * hgt, x2 = rng.range(0, w);
      var len2 = lerp(26, 190, rng()) * (0.5 + t2);
      s += ln(x2, y2, x2 + len2, y2, lighten(rng.pick(colors), 0.66), { sw: lerp(0.7, 2.8, t2), opacity: rng.range(0.16, 0.46), cap: 'round' });
    }
    return s;
  }
  /* 水面倒影：一列摇晃的横向光斑 */
  function waterReflection(cx, yTop, yBot, w, color, o) {
    o = o || {};
    var rng = RNG(o.seed || ('refl' + Math.round(cx) + Math.round(yTop)));
    var s = '', steps = o.steps || 16;
    for (var i = 0; i < steps; i++) {
      var t = i / steps;
      var y = lerp(yTop, yBot, t);
      var ww = w * (0.55 + t * 0.9) * rng.range(0.6, 1.15);
      var xx = cx + rng.range(-1, 1) * w * 0.22 * t;
      var th = lerp(2, 7, t);
      s += poly([[xx - ww / 2, y], [xx + ww / 2, y], [xx + ww / 2 - 5, y + th], [xx - ww / 2 - 5, y + th]], color,
        { opacity: (o.op == null ? 0.4 : o.op) * (1 - t * 0.62) });
    }
    return s;
  }
  function lakeSurface(cx, cy, rx, ry, colors, seed) {
    var rng = RNG(seed || 'lake'), pts = [], N = 18;
    for (var i = 0; i < N; i++) {
      var a = i / N * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx * rng.range(0.86, 1.1), cy + Math.sin(a) * ry * rng.range(0.86, 1.1)]);
    }
    var s = facet(pts, colors[1], { light: 0.16, hl: 0.36, dark: 0.08, dl: 0.16 });
    for (var k = 0; k < 22; k++) {
      var x = cx + rng.range(-rx * 0.8, rx * 0.8), y = cy + rng.range(-ry * 0.7, ry * 0.7), ww = rng.range(18, 62);
      s += poly([[x, y], [x + ww, y], [x + ww - 6, y + 4.5], [x - 6, y + 4.5]], rng.pick(colors.slice(2)), { opacity: 0.4 });
    }
    return s;
  }

  /* =========================================================================
   * 5. 植被
   * ====================================================================== */
  function pineTree(x, y, h, color, o) {
    o = o || {};
    var w = h * 0.42, s = '';
    s += poly([[x - h * 0.035, y], [x + h * 0.035, y], [x + h * 0.025, y - h * 0.22], [x - h * 0.025, y - h * 0.22]], darken(color, 0.3));
    for (var i = 0; i < 4; i++) {
      var t = i / 4, ww = w * (1 - t * 0.62), yy = y - h * (0.18 + t * 0.78);
      s += poly([[x - ww, yy], [x + ww, yy], [x, yy - h * 0.26]], mul(color, 0.9 + i * 0.06));
      s += poly([[x - ww, yy], [x, yy], [x, yy - h * 0.26]], lighten(color, 0.16), { opacity: 0.4 });
    }
    return s;
  }
  function bambooCluster(x, y, h, color, seed, count) {
    var rng = RNG(seed || 'bamboo'), s = '';
    count = count || 6;
    for (var i = 0; i < count; i++) {
      var bx = x + rng.range(-h * 0.18, h * 0.18), bh = h * rng.range(0.7, 1.15), lean = rng.range(-h * 0.06, h * 0.06);
      var topX = bx + lean, topY = y - bh;
      var cw = Math.max(2.2, h * 0.009);
      s += poly([[bx - cw, y], [bx + cw, y], [topX + cw * 0.8, topY], [topX - cw * 0.8, topY]], mul(color, 0.9 + rng() * 0.22));
      /* 竹节 */
      for (var j = 1; j < 7; j++) {
        var ty = lerp(y, topY, j / 7);
        s += ln(bx + lean * (j / 7) - cw, ty, bx + lean * (j / 7) + cw, ty, alpha(P.ink, 0.28), { sw: Math.max(0.6, cw * 0.5) });
      }
      /* 细长竹叶：短而密 */
      var leafL = Math.min(h * 0.14, 78), nLeaf = 7;
      for (var k = 0; k < nLeaf; k++) {
        var t = 0.42 + k * 0.08;
        var lx = lerp(bx, topX, t), ly = lerp(y, topY, t), dir = k % 2 ? 1 : -1;
        s += poly([[lx, ly], [lx + dir * leafL * 0.85, ly - leafL * 0.34], [lx + dir * leafL * 0.8, ly - leafL * 0.12]],
          lighten(color, 0.2 + rng() * 0.12), { opacity: 0.9 });
        s += poly([[lx, ly + 4], [lx + dir * leafL * 0.7, ly - leafL * 0.52], [lx + dir * leafL * 0.66, ly - leafL * 0.34]],
          lighten(color, 0.3), { opacity: 0.72 });
      }
    }
    return s;
  }
  function broadleafTree(x, y, h, color, o) {
    o = o || {};
    var rng = RNG(o.seed || ('tree' + Math.round(x)));
    var s = poly([[x - h * 0.04, y], [x + h * 0.04, y], [x + h * 0.03, y - h * 0.42], [x - h * 0.03, y - h * 0.42]], P.ramp(P.wood, 0.35));
    var lobes = o.lobes || 5;
    for (var i = 0; i < lobes; i++) {
      var a = -Math.PI / 2 + (i - (lobes - 1) / 2) * 0.62;
      var r = h * 0.3 * rng.range(0.8, 1.15);
      var cx = x + Math.cos(a) * h * 0.2, cy = y - h * 0.55 + Math.sin(a) * h * 0.16;
      s += poly(ngon(cx, cy, r, 7, rng() * 2), mul(color, 0.82 + rng() * 0.4));
      s += poly(inset(ngon(cx, cy, r, 7, rng() * 2), 0.35), lighten(color, 0.24), { opacity: 0.34 });
    }
    return s;
  }
  function shrubRow(w, y, color, seed, count, size) {
    var rng = RNG(seed || 'shrub'), s = '';
    count = count || 18; size = size || 40;
    for (var i = 0; i < count; i++) {
      var x = rng.range(-20, w + 20), sy = y + rng.range(-10, 10), r = size * rng.range(0.5, 1.1);
      s += poly(ngon(x, sy - r * 0.4, r, 6, rng() * 2, 0.78), mul(color, 0.8 + rng() * 0.4), { opacity: 0.96 });
    }
    return s;
  }
  function grassTufts(w, y0, y1, color, seed, count) {
    var rng = RNG(seed || 'tuft'), s = '';
    count = count || 120;
    for (var i = 0; i < count; i++) {
      var x = rng.range(0, w), y = rng.range(y0, y1);
      var hh = rng.range(5, 18) * ((y - y0) / Math.max(1, y1 - y0) * 0.8 + 0.4);
      s += poly([[x - 1.6, y], [x + 1.6, y], [x + rng.range(-5, 5), y - hh]], mul(color, 0.78 + rng() * 0.46), { opacity: 0.85 });
    }
    return s;
  }
  function reeds(w, y, color, seed, count) {
    var rng = RNG(seed || 'reed'), s = '';
    count = count || 60;
    for (var i = 0; i < count; i++) {
      var x = rng.range(0, w), hh = rng.range(30, 90), lean = rng.range(-12, 12);
      s += pline([[x, y + rng.range(0, 26)], [x + lean * 0.5, y - hh * 0.6], [x + lean, y - hh]], mul(color, 0.85 + rng() * 0.3), { sw: rng.range(1.2, 2.4), cap: 'round' });
    }
    return s;
  }
  function lotusHummock(x, y, r, color, seed) {
    var rng = RNG(seed || 'hummock');
    return poly(ngon(x, y, r, 8, rng() * 2, 0.5), color)
      + poly(inset(ngon(x, y - r * 0.2, r * 0.8, 8, rng() * 2, 0.5), 0.3), lighten(color, 0.2), { opacity: 0.3 });
  }

  /* =========================================================================
   * 6. 建筑与结构
   * ====================================================================== */
  function house(x, y, w, h, d, wall, roof, o) {
    o = o || {};
    var s = boxIso(x, y, w, h, d, wall, o);
    var tw = w * 0.5, td = d * 0.5, roofH = o.roofH == null ? h * 0.45 : o.roofH, eave = o.eave == null ? 12 : o.eave;
    var front = [[x - tw - eave, y - h], [x + tw + eave, y - h], [x + td, y - h - roofH], [x - td, y - h - roofH]];
    var side = [[x + tw + eave, y - h], [x + tw + td + eave, y - h - d * 0.42], [x + td, y - h - roofH - d * 0.42], [x + td, y - h - roofH]];
    s += facet(side, darken(roof, 0.14), { light: 0.06, hl: 0.2, dark: 0.1, dl: 0.3 });
    s += facet(front, roof, { light: 0.1, hl: 0.32, dark: 0.1, dl: 0.28 });
    if (o.ridge !== false) {
      s += poly([[x - td - 4, y - h - roofH - d * 0.42 - 2], [x + td + 4, y - h - roofH - d * 0.42 - 2],
        [x + td + 4, y - h - roofH - d * 0.42 + 5], [x - td - 4, y - h - roofH - d * 0.42 + 5]], lighten(roof, 0.14));
    }
    if (o.door !== false) {
      var dw = w * 0.26, dh = h * 0.5;
      s += rect(x - dw / 2, y - dh, dw, dh, darken(wall, 0.42));
      s += rect(x - dw / 2 + dw * 0.3, y - dh, dw * 0.14, dh, P.ramp(P.gold, 0.3), { opacity: 0.5 });
    }
    if (o.windows) {
      for (var i = 0; i < o.windows; i++) {
        var wx = x - tw * 0.55 + i * (w * 0.4);
        s += rect(wx, y - h * 0.86, w * 0.16, h * 0.2, darken(wall, 0.36));
        if (o.windowGlow) s += rect(wx, y - h * 0.86, w * 0.16, h * 0.2, o.windowGlow, { opacity: 0.55 });
      }
    }
    return s;
  }
  function tower(x, y, w, h, wall, roof, o) {
    o = o || {};
    var s = boxIso(x, y, w, h, w * 0.8, wall, o);
    var tw = w * 0.5;
    if (o.tiers) {
      for (var i = 0; i < o.tiers; i++) {
        var t = i / o.tiers, ty = y - h * (0.42 + t * 0.52), ww = tw * (1 - t * 0.22);
        s += poly([[x - ww * 1.3, ty], [x + ww * 1.3, ty], [x + ww * 1.1, ty - h * 0.07], [x - ww * 1.1, ty - h * 0.07]], roof || P.ramp(P.tileDark, 0.5));
        s += poly([[x - ww * 0.8, ty - h * 0.07], [x + ww * 0.8, ty - h * 0.07], [x + ww * 0.75, ty - h * 0.2], [x - ww * 0.75, ty - h * 0.2]], mul(wall, 0.92));
      }
      s += poly([[x - tw * 0.9, y - h * 1.02], [x + tw * 0.9, y - h * 1.02], [x, y - h * 1.18]], roof || P.ramp(P.tileDark, 0.6));
    }
    return s;
  }
  function gate(x, y, w, h, wall, o) {
    o = o || {};
    var s = '', tw = w * 0.5;
    s += boxIso(x, y, w, h, w * 0.7, wall, o);
    s += poly([[x - tw, y - h], [x + tw, y - h], [x + tw, y - h - h * 0.14], [x - tw, y - h - h * 0.14]], lighten(wall, 0.12));
    var gw = w * 0.34, gh = h * 0.62;
    s += pth('M ' + n(x - gw / 2) + ' ' + n(y) + ' L ' + n(x - gw / 2) + ' ' + n(y - gh) + ' A ' + n(gw / 2) + ' ' + n(gw * 0.4) + ' 0 0 1 ' + n(x + gw / 2) + ' ' + n(y - gh) + ' L ' + n(x + gw / 2) + ' ' + n(y) + ' Z', P.ramp(P.ink, 0.14));
    if (o.lamp) s += circle(x - gw * 0.7, y - gh * 1.25, 7, P.ramp(P.lamp, 0.7), { opacity: 0.85 });
    return s;
  }
  function ptAt(pts, t) {
    var x = t * (pts.length - 1), i = Math.floor(x), f = x - i;
    var a = pts[Math.min(i, pts.length - 1)], b = pts[Math.min(i + 1, pts.length - 1)];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  }
  function ropeBridge(x0, y0, x1, y1, sag, deck, o) {
    o = o || {};
    var s = '', n1 = o.decks == null ? 14 : o.decks;
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + sag;
    var pts = [];
    for (var i = 0; i <= 20; i++) {
      var t = i / 20, mt = 1 - t;
      pts.push([mt * mt * x0 + 2 * mt * t * cx + t * t * x1, mt * mt * y0 + 2 * mt * t * cy + t * t * y1]);
    }
    var cable = o.cable || P.ramp(P.metal, 0.3), deckC = o.deckColor || deck;
    for (var k = 0; k < n1; k++) {
      var a = ptAt(pts, k / n1), b = ptAt(pts, (k + 1) / n1);
      if (o.gaps && o.gaps.indexOf(k) >= 0) continue;
      s += poly([[a[0], a[1] - 7], [b[0], b[1] - 7], [b[0], b[1] + 7], [a[0], a[1] + 7]], deckC);
      s += poly([[a[0], a[1] - 7], [b[0], b[1] - 7], [b[0], b[1] - 4], [a[0], a[1] - 4]], lighten(deckC, 0.2), { opacity: 0.4 });
    }
    var up = [], dn = [];
    for (var j = 0; j <= 20; j++) { up.push([pts[j][0], pts[j][1] - 30 - Math.sin(j / 20 * Math.PI) * 6]); dn.push([pts[j][0], pts[j][1] + 20]); }
    s += pline(up, cable, { sw: 3, cap: 'round' });
    s += pline(dn, cable, { sw: 3, cap: 'round' });
    s += pline(pts, cable, { sw: 2.4, cap: 'round' });
    for (var m = 0; m <= 20; m += 2) s += ln(pts[m][0], pts[m][1] - 30, pts[m][0], pts[m][1] + 20, cable, { sw: 1.1, opacity: 0.8 });
    return s;
  }
  function plankBridge(x0, x1, y, hgt, deck, o) {
    o = o || {};
    var s = '', n1 = o.planks == null ? 16 : o.planks;
    for (var i = 0; i < n1; i++) {
      if (o.gaps && ((i % 3) === 1)) continue;
      var ax = lerp(x0, x1, i / n1), bx = lerp(x0, x1, (i + 1) / n1);
      s += facet([[ax, y], [bx, y], [bx, y + hgt], [ax, y + hgt]], mul(deck, 0.9 + (i % 3) * 0.07), { light: 0.08, hl: 0.28, dark: 0.1, dl: 0.24 });
    }
    if (o.rails) {
      var rc = o.railColor || P.ramp(P.wood, 0.4);
      s += pline([[x0, y - 46], [x1, y - 46]], rc, { sw: 4 });
      for (var k = 0; k <= 5; k++) { var rx = lerp(x0, x1, k / 5); s += ln(rx, y, rx, y - 46, rc, { sw: 3.4 }); }
    }
    return s;
  }
  function tent(x, y, w, h, cloth) {
    var s = '', tw = w * 0.5;
    s += poly([[x - tw, y], [x + tw, y], [x, y - h]], mul(cloth, 0.92));
    s += poly([[x - tw, y], [x, y], [x, y - h]], lighten(cloth, 0.18), { opacity: 0.5 });
    s += poly([[x, y], [x + tw, y], [x, y - h]], darken(cloth, 0.16));
    s += poly([[x - tw * 0.18, y], [x + tw * 0.18, y], [x, y - h * 0.62]], darken(cloth, 0.42));
    return s;
  }
  function cityWall(x0, x1, y, h, color) {
    var s = facet([[x0, y], [x1, y], [x1, y - h], [x0, y - h]], color, { light: 0.06, hl: 0.2, dark: 0.08, dl: 0.24 });
    var n2 = Math.max(1, Math.floor((x1 - x0) / 70));
    for (var i = 0; i <= n2; i++) {
      var bx = lerp(x0, x1, i / n2);
      s += poly([[bx - 20, y - h], [bx + 20, y - h], [bx + 20, y - h - 20], [bx - 20, y - h - 20]], mul(color, 0.92 + (i % 2) * 0.08));
    }
    return s;
  }
  function stairs(x, y, w, h, steps, color) {
    var s = '';
    for (var i = 0; i < steps; i++) {
      var t = i / steps;
      s += facet([[x - w / 2 + t * w * 0.1, y - t * h], [x + w / 2 - t * w * 0.1, y - t * h - h / steps],
        [x + w / 2 - t * w * 0.1, y - (t + 1) * h / steps], [x - w / 2 + t * w * 0.1, y - (t + 1) * h / steps]],
        mul(color, 0.88 + (i % 2) * 0.14), { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.2 });
    }
    return s;
  }
  function caveMouth(x, y, w, h, rock, glow) {
    var s = facet([[x - w, y], [x + w, y], [x + w * 0.9, y - h], [x - w * 0.9, y - h]], rock, { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.28 });
    s += pth('M ' + n(x - w * 0.42) + ' ' + n(y) + ' L ' + n(x - w * 0.42) + ' ' + n(y - h * 0.5)
      + ' Q ' + n(x) + ' ' + n(y - h * 1.05) + ' ' + n(x + w * 0.42) + ' ' + n(y - h * 0.5) + ' L ' + n(x + w * 0.42) + ' ' + n(y) + ' Z', P.ramp(P.ink, 0.1));
    if (glow) {
      s += pth('M ' + n(x - w * 0.3) + ' ' + n(y) + ' L ' + n(x - w * 0.3) + ' ' + n(y - h * 0.44)
        + ' Q ' + n(x) + ' ' + n(y - h * 0.86) + ' ' + n(x + w * 0.3) + ' ' + n(y - h * 0.44)
        + ' L ' + n(x + w * 0.3) + ' ' + n(y) + ' Z', glow, { opacity: 0.55 });
    }
    return s;
  }

  /* =========================================================================
   * 7. 道具
   * ====================================================================== */
  function torch(x, y, h) {
    return poly([[x - 3.5, y], [x + 3.5, y], [x + 2.5, y - h], [x - 2.5, y - h]], P.ramp(P.wood, 0.38))
      + poly([[x - 12, y - h], [x + 12, y - h], [x + 6, y - h - 26], [x - 6, y - h - 26]], P.ramp(P.flame, 0.7), { opacity: 0.95 })
      + poly([[x - 6, y - h - 12], [x + 6, y - h - 12], [x, y - h - 44]], lighten(P.ramp(P.flame, 0.85), 0.25), { opacity: 0.9 });
  }
  function campfire(x, y, scale, seed) {
    var rng = RNG(seed || 'fire'), s = '', sc = scale || 1;
    s += ell(x, y + 6 * sc, 60 * sc, 18 * sc, P.ramp(P.ink, 0.16), { opacity: 0.5 });
    for (var i = 0; i < 5; i++) {
      var a = i * 1.25 + rng.range(-0.2, 0.2), L = 74 * sc * rng.range(0.8, 1.1);
      s += poly([[x - 5 * sc, y], [x + 5 * sc, y], [x + Math.cos(a) * L, y - 26 * sc]], P.ramp(P.wood, 0.3));
    }
    for (var k = 0; k < 4; k++) {
      var t = k / 4, hh = (96 - t * 34) * sc, ww = (40 - t * 14) * sc;
      s += poly([[x - ww, y], [x + ww, y], [x + ww * 0.4, y - hh * 0.7], [x, y - hh]],
        k < 2 ? P.ramp(P.flame, 0.4 + t * 0.3) : P.ramp(P.lamp, 0.7), { opacity: 0.72 - t * 0.12 });
    }
    return s;
  }
  function lantern(x, y, r, glow, o) {
    o = o || {};
    var s = '';
    if (glow) { var id = uid('lant'); s += defs(radialGrad(id, [[0, alpha(glow, 0.62)], [1, alpha(glow, 0)]])) + circle(x, y, r * 5, 'url(#' + id + ')'); }
    s += ell(x, y, r, r * 0.92, glow || P.ramp(P.lamp, 0.7));
    s += ell(x, y, r * 0.62, r * 0.6, lighten(glow || P.ramp(P.lamp, 0.8), 0.3), { opacity: 0.7 });
    s += poly([[x - r * 1.1, y - r * 0.9], [x + r * 1.1, y - r * 0.9], [x, y - r * 1.6]], P.ramp(P.metalRust, 0.4));
    if (o.hang) s += ln(x, y - r * 1.6, x, o.hang, P.ramp(P.metal, 0.3), { sw: 1.6 });
    return s;
  }
  function flag(x, y, h, w, color, o) {
    o = o || {};
    var s = ln(x, y, x, y - h, o.pole || P.ramp(P.wood, 0.3), { sw: o.poleW || 5 });
    var wave = [], back = [];
    for (var i = 0; i <= 8; i++) {
      var t = i / 8;
      wave.push([x + w * t + Math.sin(t * 6) * 6, y - h + 4 + Math.sin(t * 7 + 1.2) * 8 * t]);
    }
    for (var j = 8; j >= 0; j--) {
      var t2 = j / 8;
      back.push([x + w * t2 + Math.sin(t2 * 6) * 6, y - h + 4 + w * 0.62 + Math.sin(t2 * 7 + 1.2) * 8 * t2]);
    }
    s += poly(wave.concat(back), color, { opacity: 0.96 });
    s += poly(wave.concat(back), null, { stroke: darken(color, 0.2), sw: 1 });
    if (o.emblem) s += poly(ngon(x + w * 0.34, y - h + w * 0.34, w * 0.14, 5, -Math.PI / 2), o.emblem, { opacity: 0.95 });
    return s;
  }
  function banner(x, y, h, w, color, textStr) {
    var s = poly([[x, y], [x + w, y - 10], [x + w, y - h - 10], [x, y - h]], color);
    s += poly([[x, y], [x + w * 0.34, y - 3], [x + w * 0.34, y - h - 3], [x, y - h]], lighten(color, 0.16), { opacity: 0.4 });
    var str = String(textStr || '');
    for (var i = 1; i <= 5; i++) s += text(x + w * 0.5, y - h + i * (h / 6), str[i - 1] || '', { anchor: 'middle', size: w * 0.34, fill: P.paper });
    return s;
  }
  function woodenBoat(x, y, L, color, o) {
    o = o || {};
    var Hh = L * 0.3, s = '';
    s += pth('M ' + n(x - L / 2) + ' ' + n(y - Hh) + ' Q ' + n(x) + ' ' + n(y + Hh * 0.35) + ' ' + n(x + L / 2) + ' ' + n(y - Hh)
      + ' L ' + n(x + L / 2 - 8) + ' ' + n(y - Hh - 10) + ' Q ' + n(x) + ' ' + n(y + Hh * 0.18) + ' ' + n(x - L / 2 + 8) + ' ' + n(y - Hh - 10) + ' Z', color);
    s += poly([[x - L * 0.3, y - Hh - 4], [x + L * 0.3, y - Hh - 4], [x + L * 0.24, y - Hh - 14], [x - L * 0.24, y - Hh - 14]], darken(color, 0.3));
    if (o.mast) {
      s += ln(x, y - Hh - 10, x, y - Hh - L * 0.9, P.ramp(P.wood, 0.3), { sw: 4 });
      s += poly([[x + 4, y - Hh - L * 0.85], [x + L * 0.4, y - Hh - L * 0.4], [x + 4, y - Hh - L * 0.2]], o.sail || P.paper, { opacity: 0.92 });
    }
    if (o.rope) s += pline([[x - L / 2 + 6, y - Hh - 8], [x, y - Hh - 26], [x + L / 2 - 6, y - Hh - 8]], o.rope, { sw: 1.6 });
    if (o.oars) {
      for (var k = -1; k <= 1; k += 2) {
        var ox = x + k * L * 0.3;
        s += ln(ox, y - Hh - 6, ox + k * 40, y + 18, P.ramp(P.wood, 0.36), { sw: 4.5, cap: 'round' });
      }
    }
    return s;
  }
  function raft(x, y, L, color, seed) {
    var rng = RNG(seed || 'raft'), s = '';
    for (var i = 0; i < 7; i++) {
      var yy = y - i * (L * 0.055);
      s += poly([[x - L / 2 + i * 3, yy], [x + L / 2 - i * 3, yy], [x + L / 2 - i * 3, yy + L * 0.05], [x - L / 2 + i * 3, yy + L * 0.05]], mul(color, 0.86 + rng() * 0.3));
    }
    return s;
  }
  function stretcher(x, y, L, color) {
    var s = ln(x - L / 2, y - 4, x + L / 2, y - 4, P.ramp(P.wood, 0.38), { sw: 6, cap: 'round' });
    s += rect(x - L / 2 + 10, y - 22, L - 20, 18, color, { rx: 3 });
    s += ln(x + L / 2, y - 4, x + L / 2 + 46, y + 14, P.ramp(P.wood, 0.34), { sw: 5, cap: 'round' });
    s += ln(x - L / 2, y - 4, x - L / 2 - 46, y + 14, P.ramp(P.wood, 0.34), { sw: 5, cap: 'round' });
    return s;
  }
  function rifle(x, y, len, lean) {
    var r = (lean || 0) * Math.PI / 180;
    var dx = Math.cos(r) * len, dy = Math.sin(r) * len;
    return ln(x, y, x + dx, y + dy, P.ramp(P.wood, 0.32), { sw: 6, cap: 'round' })
      + ln(x + dx * 0.5, y + dy * 0.5, x + dx * 1.16, y + dy * 1.16, P.ramp(P.metal, 0.34), { sw: 3.4, cap: 'round' });
  }
  function packBag(x, y, w, h, color) {
    return facet([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]], color, { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 })
      + poly([[x - w * 0.22, y - h], [x + w * 0.22, y - h], [x + w * 0.18, y - h - h * 0.22], [x - w * 0.18, y - h - h * 0.22]], darken(color, 0.2));
  }
  function copperPot(x, y, r, color) {
    return ell(x, y, r, r * 0.72, color)
      + ell(x, y - r * 0.1, r * 0.72, r * 0.5, lighten(color, 0.22), { opacity: 0.6 })
      + poly([[x - r * 1.1, y - r * 0.55], [x + r * 1.1, y - r * 0.55], [x + r * 1.1, y - r * 0.72], [x - r * 1.1, y - r * 0.72]], darken(color, 0.22));
  }
  function bugle(x, y, len, color) {
    return poly([[x, y], [x + len * 0.72, y - len * 0.1], [x + len * 0.72, y + len * 0.1], [x, y + len * 0.09]], color)
      + poly([[x + len * 0.72, y - len * 0.1], [x + len, y - len * 0.24], [x + len, y + len * 0.24], [x + len * 0.72, y + len * 0.1]], lighten(color, 0.2))
      + poly(ngon(x + len * 0.12, y + len * 0.05, len * 0.09, 6, 0), darken(color, 0.15));
  }
  function mapOnTable(x, y, w, h, color) {
    var s = poly([[x - w / 2, y], [x + w / 2, y - h * 0.25], [x + w / 2, y - h], [x - w / 2, y - h * 0.75]], color);
    s += poly([[x - w / 2, y], [x + w / 2, y - h * 0.25], [x + w / 2, y - h * 0.32], [x - w / 2, y - h * 0.07]], darken(color, 0.2), { opacity: 0.5 });
    for (var i = 1; i < 5; i++) s += ln(x - w / 2 + w * 0.1, y - h * 0.8 + i * h * 0.14, x + w / 2 - w * 0.06, y - h * 0.85 + i * h * 0.16, alpha(P.ink, 0.35), { sw: 1 });
    return s;
  }
  function chair(x, y, h, color) {
    return poly([[x - 14, y - h], [x + 14, y - h], [x + 14, y - h * 1.9], [x - 14, y - h * 1.9]], color)
      + poly([[x - 16, y - h], [x + 16, y - h], [x + 16, y - h + 8], [x - 16, y - h + 8]], color)
      + ln(x - 11, y, x - 11, y - h, P.ramp(P.wood, 0.3), { sw: 4 }) + ln(x + 11, y, x + 11, y - h, P.ramp(P.wood, 0.3), { sw: 4 })
      + ln(x, y, x, y - h, P.ramp(P.wood, 0.3), { sw: 3 });
  }
  function telegraphPole(x, y, h, color) {
    return ln(x, y, x, y - h, color, { sw: 5 })
      + ln(x - 26, y - h + 12, x + 26, y - h + 12, color, { sw: 3.4 })
      + ln(x - 20, y - h + 30, x + 20, y - h + 30, color, { sw: 3 })
      + poly([[x - 26, y - h + 10], [x - 26, y - h + 16], [x - 22, y - h + 16], [x - 22, y - h + 10]], P.ramp(P.white, 0.4));
  }
  function fenceRow(x0, x1, y, h, color) {
    var s = '', cnt = Math.max(2, Math.round((x1 - x0) / 34));
    for (var i = 0; i <= cnt; i++) { var x = lerp(x0, x1, i / cnt); s += ln(x, y, x, y - h, color, { sw: 3.4 }); }
    s += ln(x0, y - h * 0.7, x1, y - h * 0.7, color, { sw: 2.6 }) + ln(x0, y - h * 0.34, x1, y - h * 0.34, color, { sw: 2.6 });
    return s;
  }
  function stoneMarker(x, y, w, h, color, label) {
    return facet([[x - w, y], [x + w, y], [x + w * 0.86, y - h], [x - w * 0.86, y - h]], color, { light: 0.1, hl: 0.3, dark: 0.1, dl: 0.26 })
      + (label ? text(x, y - h * 0.42, label, { anchor: 'middle', size: h * 0.26, fill: alpha(P.ink, 0.6) }) : '');
  }
  function barbedWire(x0, x1, y, seed, rows) {
    var s = '';
    rows = rows || 3;
    for (var r = 0; r < rows; r++) {
      var yy = y - r * 26;
      s += pline([[x0, yy], [lerp(x0, x1, 0.5), yy + 8], [x1, yy]], P.ramp(P.metal, 0.5), { sw: 1.4, opacity: 0.85 });
    }
    for (var i = 0; i <= 8; i++) {
      var x = lerp(x0, x1, i / 8);
      s += ln(x, y, x, y - (rows - 1) * 26, P.ramp(P.metalRust, 0.4), { sw: 3 });
      for (var k = 0; k < 3; k++) s += ln(x - 5, y - k * 26 - 3, x + 5, y - k * 26 + 3, P.ramp(P.metal, 0.42), { sw: 1.1 });
    }
    return s;
  }
  function bunker(x, y, w, h, color) {
    return boxIso(x, y, w, h, w * 0.7, color, {})
      + rect(x - w * 0.2, y - h * 0.62, w * 0.4, h * 0.16, P.ramp(P.ink, 0.14))
      + poly([[x - w * 0.5, y - h], [x + w * 0.5, y - h], [x + w * 0.4, y - h * 1.16], [x - w * 0.4, y - h * 1.16]], darken(color, 0.22));
  }
  function wallPoster(x, y, w, h, paper, ink) {
    return rect(x, y, w, h, paper, { rx: 1 })
      + ln(x + 5, y + h * 0.3, x + w - 5, y + h * 0.3, ink, { sw: 1.4, opacity: 0.5 })
      + ln(x + 5, y + h * 0.5, x + w - 12, y + h * 0.5, ink, { sw: 1.1, opacity: 0.4 })
      + ln(x + 5, y + h * 0.68, x + w - 8, y + h * 0.68, ink, { sw: 1.1, opacity: 0.4 });
  }

  /* =========================================================================
   * 8. 人物
   * ====================================================================== */
  var POSES = {
    stand: { hipL: [-0.040, -0.492], kneeL: [-0.049, -0.268], ankL: [-0.052, -0.048], hipR: [0.040, -0.492], kneeR: [0.049, -0.268], ankR: [0.052, -0.048], shL: [-0.104, -0.812], elL: [-0.116, -0.646], wrL: [-0.120, -0.482], shR: [0.104, -0.812], elR: [0.116, -0.646], wrR: [0.120, -0.482] },
    walk: { hipL: [-0.040, -0.492], kneeL: [-0.052, -0.270], ankL: [-0.104, -0.072], hipR: [0.040, -0.492], kneeR: [0.052, -0.262], ankR: [0.086, -0.030], shL: [-0.104, -0.812], elL: [-0.124, -0.650], wrL: [-0.142, -0.492], shR: [0.104, -0.812], elR: [0.100, -0.644], wrR: [0.068, -0.478] },
    march: { hipL: [-0.040, -0.496], kneeL: [-0.060, -0.272], ankL: [-0.132, -0.096], hipR: [0.040, -0.496], kneeR: [0.050, -0.272], ankR: [0.062, -0.028], shL: [-0.106, -0.812], elL: [-0.132, -0.652], wrL: [-0.166, -0.498], shR: [0.106, -0.812], elR: [0.116, -0.652], wrR: [0.104, -0.480] },
    run: { hipL: [-0.044, -0.500], kneeL: [-0.100, -0.300], ankL: [-0.190, -0.180], hipR: [0.044, -0.500], kneeR: [0.070, -0.286], ankR: [0.096, -0.030], shL: [-0.108, -0.812], elL: [-0.170, -0.690], wrL: [-0.208, -0.560], shR: [0.108, -0.812], elR: [0.110, -0.664], wrR: [0.044, -0.516] },
    salute: { hipL: [-0.040, -0.492], kneeL: [-0.049, -0.268], ankL: [-0.052, -0.048], hipR: [0.040, -0.492], kneeR: [0.049, -0.268], ankR: [0.052, -0.048], shL: [-0.104, -0.812], elL: [-0.116, -0.646], wrL: [-0.120, -0.482], shR: [0.104, -0.812], elR: [0.176, -0.716], wrR: [0.078, -0.842] },
    point: { hipL: [-0.040, -0.492], kneeL: [-0.049, -0.268], ankL: [-0.052, -0.048], hipR: [0.040, -0.492], kneeR: [0.049, -0.268], ankR: [0.052, -0.048], shL: [-0.104, -0.812], elL: [-0.114, -0.648], wrL: [-0.118, -0.486], shR: [0.104, -0.812], elR: [0.186, -0.780], wrR: [0.288, -0.804] },
    armscrossed: { hipL: [-0.040, -0.492], kneeL: [-0.049, -0.268], ankL: [-0.052, -0.048], hipR: [0.040, -0.492], kneeR: [0.049, -0.268], ankR: [0.052, -0.048], shL: [-0.104, -0.812], elL: [-0.128, -0.664], wrL: [0.062, -0.700], shR: [0.104, -0.812], elR: [0.128, -0.664], wrR: [-0.062, -0.700] },
    hold: { hipL: [-0.040, -0.492], kneeL: [-0.049, -0.268], ankL: [-0.052, -0.048], hipR: [0.040, -0.492], kneeR: [0.049, -0.268], ankR: [0.052, -0.048], shL: [-0.104, -0.812], elL: [-0.118, -0.660], wrL: [-0.058, -0.612], shR: [0.104, -0.812], elR: [0.118, -0.660], wrR: [0.062, -0.606] },
    carry: { hipL: [-0.040, -0.492], kneeL: [-0.049, -0.268], ankL: [-0.052, -0.048], hipR: [0.040, -0.492], kneeR: [0.049, -0.268], ankR: [0.052, -0.048], shL: [-0.104, -0.812], elL: [-0.104, -0.706], wrL: [-0.018, -0.848], shR: [0.104, -0.812], elR: [0.104, -0.706], wrR: [0.018, -0.848] },
    raiseone: { hipL: [-0.040, -0.492], kneeL: [-0.049, -0.268], ankL: [-0.052, -0.048], hipR: [0.040, -0.492], kneeR: [0.049, -0.268], ankR: [0.052, -0.048], shL: [-0.104, -0.812], elL: [-0.112, -0.646], wrL: [-0.116, -0.482], shR: [0.104, -0.812], elR: [0.150, -0.884], wrR: [0.122, -1.012] },
    kneel: { hipL: [-0.044, -0.360], kneeL: [-0.086, -0.238], ankL: [-0.120, -0.044], hipR: [0.044, -0.360], kneeR: [0.060, -0.196], ankR: [0.086, -0.024], shL: [-0.100, -0.680], elL: [-0.112, -0.520], wrL: [-0.104, -0.360], shR: [0.100, -0.680], elR: [0.112, -0.520], wrR: [0.106, -0.360] },
    sit: { hipL: [-0.044, -0.300], kneeL: [-0.108, -0.276], ankL: [-0.112, -0.060], hipR: [0.044, -0.300], kneeR: [0.108, -0.276], ankR: [0.112, -0.060], shL: [-0.100, -0.620], elL: [-0.116, -0.462], wrL: [-0.078, -0.322], shR: [0.100, -0.620], elR: [0.116, -0.462], wrR: [0.078, -0.322] },
    shield: { hipL: [-0.044, -0.492], kneeL: [-0.056, -0.268], ankL: [-0.060, -0.048], hipR: [0.044, -0.492], kneeR: [0.056, -0.268], ankR: [0.060, -0.048], shL: [-0.104, -0.812], elL: [-0.130, -0.700], wrL: [-0.028, -0.760], shR: [0.104, -0.812], elR: [0.140, -0.700], wrR: [0.036, -0.766] }
  };

  var FACES = {
    calm:   { brow: 0.00, browTilt: 0, eye: 1.00, mouth: 'flat',  mouthC: 0.00, tilt: 0 },
    stern:  { brow: -0.10, browTilt: -0.16, eye: 0.86, mouth: 'flat',  mouthC: -0.02, tilt: 0 },
    smile:  { brow: 0.06, browTilt: 0.05, eye: 0.82, mouth: 'smile', mouthC: 0.05, tilt: 0 },
    sad:    { brow: 0.10, browTilt: 0.22, eye: 0.90, mouth: 'frown', mouthC: -0.05, tilt: 0 },
    worry:  { brow: 0.08, browTilt: 0.16, eye: 0.94, mouth: 'frown', mouthC: -0.03, tilt: -3 },
    fierce: { brow: -0.16, browTilt: -0.30, eye: 1.10, mouth: 'open',  mouthC: 0.02, tilt: 0 },
    weak:   { brow: 0.12, browTilt: 0.14, eye: 0.48, mouth: 'flat',  mouthC: -0.02, tilt: 4 },
    dawn:   { brow: 0.04, browTilt: 0.06, eye: 0.96, mouth: 'smile', mouthC: 0.04, tilt: -4 }
  };

  function lerpPose(a, b, t) {
    var out = {};
    for (var k in POSES[a]) out[k] = [lerp(POSES[a][k][0], POSES[b][k][0], t), lerp(POSES[a][k][1], POSES[b][k][1], t)];
    return out;
  }
  function poseOf(name) { return POSES[name] || POSES.stand; }

  function limbSeg(p0, p1, w0, w1, color, o) {
    o = o || {};
    var dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / L, ny = dx / L;
    var q = [[p0[0] + nx * w0, p0[1] + ny * w0], [p1[0] + nx * w1, p1[1] + ny * w1],
             [p1[0] - nx * w1, p1[1] - ny * w1], [p0[0] - nx * w0, p0[1] - ny * w0]];
    var s = facet(q, color, { light: o.light == null ? 0.11 : o.light, hl: 0.34, dark: 0.1, dl: 0.26, sw: 0.9 });
    if (o.highlight) {
      var hq = [[p0[0] + nx * w0 * 0.66, p0[1] + ny * w0 * 0.66], [p1[0] + nx * w1 * 0.6, p1[1] + ny * w1 * 0.6],
                [p1[0] + nx * w1 * 0.18, p1[1] + ny * w1 * 0.18], [p0[0] + nx * w0 * 0.24, p0[1] + ny * w0 * 0.24]];
      s += poly(hq, lighten(color, 0.24), { opacity: 0.34 });
    }
    return s;
  }

  function headStr(o) {
    var cx = o.cx, top = o.top, hw = o.hw, hh = o.hh;
    var skin = o.skin, skinD = o.skinDark, skinL = o.skinLight;
    var jawW = hw * 0.72, chinY = top + hh;
    var pts = [[cx - hw, top + hh * 0.30], [cx - hw * 0.86, top + hh * 0.02], [cx + hw * 0.86, top + hh * 0.02], [cx + hw, top + hh * 0.30],
      [cx + hw * 0.94, top + hh * 0.66], [cx + jawW, top + hh * 0.86], [cx, chinY], [cx - jawW, top + hh * 0.86], [cx - hw * 0.94, top + hh * 0.66]];
    var s = poly(pts, skin, { stroke: alpha(P.ink, 0.24), sw: 0.9, join: 'round' });
    s += poly([[cx + hw * 0.28, top + hh * 0.04], [cx + hw * 0.86, top + hh * 0.02], [cx + hw, top + hh * 0.3], [cx + hw * 0.94, top + hh * 0.66],
      [cx + jawW, top + hh * 0.86], [cx, chinY], [cx + hw * 0.16, top + hh * 0.72]], skinD, { opacity: 0.4 });
    s += poly([[cx - hw * 0.86, top + hh * 0.06], [cx - hw * 0.2, top + hh * 0.02], [cx - hw * 0.24, top + hh * 0.3], [cx - hw * 0.82, top + hh * 0.34]], skinL, { opacity: 0.5 });
    s += poly([[cx - hw * 0.9, top + hh * 0.56], [cx - hw * 0.42, top + hh * 0.62], [cx - hw * 0.5, top + hh * 0.74], [cx - hw * 0.78, top + hh * 0.72]], skinD, { opacity: 0.26 });
    s += poly([[cx - hw * 0.98, top + hh * 0.42], [cx - hw * 1.14, top + hh * 0.38], [cx - hw * 1.16, top + hh * 0.6], [cx - hw * 0.98, top + hh * 0.64]], skinD);
    s += poly([[cx + hw * 0.98, top + hh * 0.42], [cx + hw * 1.14, top + hh * 0.38], [cx + hw * 1.16, top + hh * 0.6], [cx + hw * 0.98, top + hh * 0.64]], skinD);
    return s;
  }

  function faceFeatures(o) {
    var cx = o.cx, top = o.top, hw = o.hw, hh = o.hh, F = FACES[o.face] || FACES.calm;
    var ink = o.inkColor || P.ink;
    var eyeY = top + hh * 0.50, ex = hw * 0.42, er = hw * 0.19, s = '';
    for (var k = -1; k <= 1; k += 2) {
      var ecx = cx + k * ex;
      var open = clamp(F.eye, 0.2, 1.2) * hh * 0.062;
      s += poly([[ecx - er, eyeY], [ecx, eyeY - open * 0.9], [ecx + er, eyeY], [ecx, eyeY + open * 0.78]], '#f7f4ec', { opacity: 0.95 });
      s += poly(ngon(ecx + k * er * 0.12, eyeY - open * 0.06, Math.min(er * 0.52, open * 0.66), 7, 0.3), o.eyeColor || P.ramp(P.hair, 0.25));
      s += pline([[ecx - er * 1.12, eyeY - open * 0.72], [ecx, eyeY - open * 1.12], [ecx + er * 1.12, eyeY - open * 0.72]], ink, { sw: hh * 0.026, cap: 'round', opacity: 0.9 });
    }
    var browY = eyeY - hh * 0.17 + F.brow * hh * 0.1;
    for (var m = -1; m <= 1; m += 2) {
      var bx = cx + m * ex, tilt = F.browTilt * m;
      s += poly([[bx - er * 1.16, browY + tilt * hh * 0.3], [bx + er * 1.12, browY - tilt * hh * 0.3],
        [bx + er * 1.12, browY - tilt * hh * 0.3 + hh * 0.035], [bx - er * 1.16, browY + tilt * hh * 0.3 + hh * 0.035]],
        o.browColor || P.ramp(P.hair, 0.22));
    }
    var noseY = top + hh * 0.70;
    s += poly([[cx - hw * 0.06, noseY - hh * 0.14], [cx + hw * 0.06, noseY - hh * 0.14], [cx + hw * 0.14, noseY], [cx - hw * 0.14, noseY]], o.skinDark, { opacity: 0.42 });
    s += pline([[cx - hw * 0.1, noseY + hh * 0.012], [cx + hw * 0.1, noseY + hh * 0.012]], o.skinDark, { sw: hh * 0.02, opacity: 0.5 });
    var my = top + hh * 0.845, mw = hw * 0.34;
    var lip = o.lipColor || mix(o.skin || P.ramp(P.skin, 0.45), P.ramp(P.redDeep, 0.4), 0.42);
    if (F.mouth === 'smile') {
      s += pth('M ' + n(cx - mw) + ' ' + n(my - hh * 0.012) + ' Q ' + n(cx) + ' ' + n(my + hh * 0.05) + ' ' + n(cx + mw) + ' ' + n(my - hh * 0.012), null, { stroke: lip, sw: hh * 0.032, cap: 'round' });
    } else if (F.mouth === 'frown') {
      s += pth('M ' + n(cx - mw) + ' ' + n(my + hh * 0.018) + ' Q ' + n(cx) + ' ' + n(my - hh * 0.03) + ' ' + n(cx + mw) + ' ' + n(my + hh * 0.018), null, { stroke: lip, sw: hh * 0.032, cap: 'round' });
    } else if (F.mouth === 'open') {
      s += poly([[cx - mw, my - hh * 0.01], [cx + mw, my - hh * 0.01], [cx + mw * 0.7, my + hh * 0.075], [cx - mw * 0.7, my + hh * 0.075]], P.ramp(P.ink, 0.12));
    } else {
      s += pline([[cx - mw, my], [cx, my + F.mouthC * hh * 0.4], [cx + mw, my]], lip, { sw: hh * 0.03, cap: 'round' });
    }
    return s;
  }

  function hairStyle(o) {
    var cx = o.cx, top = o.top, hw = o.hw, hh = o.hh, style = o.style || 'short';
    var c = o.color || P.ramp(P.hair, 0.28), c2 = darken(c, 0.2), c3 = lighten(c, 0.14), s = '';
    if (style === 'none') return '';
    if (style === 'bald') return poly([[cx - hw * 0.96, top + hh * 0.3], [cx - hw * 0.5, top + hh * 0.12], [cx + hw * 0.5, top + hh * 0.12], [cx + hw * 0.96, top + hh * 0.3]], c3, { opacity: 0.25 });
    if (style === 'receding') {
      return poly([[cx - hw * 1.0, top + hh * 0.26], [cx - hw * 0.94, top + hh * 0.02], [cx + hw * 0.94, top + hh * 0.02], [cx + hw * 1.0, top + hh * 0.26],
        [cx + hw * 0.78, top + hh * 0.2], [cx + hw * 0.3, top + hh * 0.3], [cx - hw * 0.3, top + hh * 0.3], [cx - hw * 0.78, top + hh * 0.2]], c)
        + poly([[cx - hw * 1.0, top + hh * 0.2], [cx + hw * 1.0, top + hh * 0.2], [cx + hw * 0.9, top + hh * 0.34], [cx - hw * 0.9, top + hh * 0.34]], c2, { opacity: 0.5 });
    }
    if (style === 'long') {
      s += poly([[cx - hw * 1.06, top + hh * 0.34], [cx - hw * 0.98, top - hh * 0.06], [cx + hw * 0.98, top - hh * 0.06], [cx + hw * 1.06, top + hh * 0.34],
        [cx + hw * 1.02, top + hh * 1.05], [cx + hw * 0.72, top + hh * 1.02], [cx + hw * 0.8, top + hh * 0.36],
        [cx - hw * 0.8, top + hh * 0.36], [cx - hw * 0.72, top + hh * 1.02], [cx - hw * 1.02, top + hh * 1.05]], c);
      s += poly([[cx - hw * 1.0, top + hh * 0.2], [cx - hw * 0.3, top + hh * 0.06], [cx - hw * 0.3, top + hh * 0.4], [cx - hw * 0.86, top + hh * 0.5]], c3, { opacity: 0.35 });
      return s;
    }
    if (style === 'bun') {
      s += poly([[cx - hw * 1.02, top + hh * 0.34], [cx - hw * 0.96, top], [cx + hw * 0.96, top], [cx + hw * 1.02, top + hh * 0.34],
        [cx + hw * 0.94, top + hh * 0.52], [cx - hw * 0.94, top + hh * 0.52]], c);
      s += poly(ngon(cx + hw * 0.86, top + hh * 0.34, hw * 0.3, 7, 0.4), c2);
      return s;
    }
    if (style === 'braid') {
      s += poly([[cx - hw * 1.04, top + hh * 0.36], [cx - hw * 0.98, top - hh * 0.02], [cx + hw * 0.98, top - hh * 0.02], [cx + hw * 1.04, top + hh * 0.36],
        [cx + hw * 0.96, top + hh * 0.5], [cx - hw * 0.96, top + hh * 0.5]], c);
      s += poly([[cx - hw * 1.06, top + hh * 0.5], [cx - hw * 0.8, top + hh * 0.5], [cx - hw * 0.86, top + hh * 1.1], [cx - hw * 1.14, top + hh * 1.08]], c2);
      s += poly([[cx + hw * 1.06, top + hh * 0.5], [cx + hw * 0.8, top + hh * 0.5], [cx + hw * 0.86, top + hh * 1.1], [cx + hw * 1.14, top + hh * 1.08]], c2);
      return s;
    }
    if (style === 'crew') {
      return poly([[cx - hw * 1.0, top + hh * 0.24], [cx - hw * 0.92, top - hh * 0.01], [cx + hw * 0.92, top - hh * 0.01], [cx + hw * 1.0, top + hh * 0.24],
        [cx + hw * 0.6, top + hh * 0.16], [cx - hw * 0.6, top + hh * 0.16]], c)
        + poly([[cx - hw * 0.9, top + hh * 0.02], [cx + hw * 0.2, top - hh * 0.02], [cx + hw * 0.2, top + hh * 0.14], [cx - hw * 0.84, top + hh * 0.14]], c3, { opacity: 0.3 });
    }
    s += poly([[cx - hw * 1.04, top + hh * 0.3], [cx - hw * 0.96, top - hh * 0.03], [cx + hw * 0.96, top - hh * 0.03], [cx + hw * 1.04, top + hh * 0.3],
      [cx + hw * 0.96, top + hh * 0.42], [cx + hw * 0.3, top + hh * 0.3], [cx - hw * 0.34, top + hh * 0.3], [cx - hw * 0.96, top + hh * 0.42]], c);
    s += poly([[cx - hw * 0.9, top + hh * 0.06], [cx + hw * 0.3, top - hh * 0.02], [cx + hw * 0.3, top + hh * 0.16], [cx - hw * 0.86, top + hh * 0.2]], c3, { opacity: 0.28 });
    return s;
  }

  function headwear(o) {
    var cx = o.cx, top = o.top, hw = o.hw, hh = o.hh, kind = o.kind || 'none';
    var c = o.color || P.ramp(P.uniform, 0.4), s = '';
    if (kind === 'none') return '';
    if (kind === 'cap' || kind === 'oct') {
      s += poly([[cx - hw * 1.16, top + hh * 0.3], [cx - hw * 1.02, top - hh * 0.18], [cx, top - hh * 0.3], [cx + hw * 1.02, top - hh * 0.18], [cx + hw * 1.16, top + hh * 0.3]],
        c, { stroke: alpha(P.ink, 0.28), sw: 0.9, join: 'round' });
      s += poly([[cx - hw * 1.16, top + hh * 0.3], [cx + hw * 1.16, top + hh * 0.3], [cx + hw * 1.1, top + hh * 0.42], [cx - hw * 1.1, top + hh * 0.42]], darken(c, 0.24));
      s += poly([[cx - hw * 0.9, top - hh * 0.12], [cx - hw * 0.1, top - hh * 0.26], [cx - hw * 0.02, top + hh * 0.06], [cx - hw * 0.86, top + hh * 0.2]], lighten(c, 0.2), { opacity: 0.32 });
      if (o.star !== false) s += poly(ngon(cx, top + hh * 0.02, hw * 0.28, 5, -Math.PI / 2), o.starColor || P.ramp(P.red, 0.6));
      return s;
    }
    if (kind === 'helmet') {
      return poly([[cx - hw * 1.14, top + hh * 0.34], [cx - hw * 1.06, top - hh * 0.2], [cx, top - hh * 0.34], [cx + hw * 1.06, top - hh * 0.2], [cx + hw * 1.14, top + hh * 0.34]], c, { stroke: alpha(P.ink, 0.3), sw: 1 })
        + poly([[cx - hw * 1.2, top + hh * 0.34], [cx + hw * 1.2, top + hh * 0.34], [cx + hw * 1.14, top + hh * 0.46], [cx - hw * 1.14, top + hh * 0.46]], darken(c, 0.26));
    }
    if (kind === 'straw') {
      return poly(ngon(cx, top + hh * 0.24, hw * 1.85, 12, 0.26, 0.5), P.ramp(P.grassDry, 0.55))
        + poly(ngon(cx, top + hh * 0.2, hw * 1.5, 12, 0.26, 0.42), lighten(P.ramp(P.grassDry, 0.5), 0.16), { opacity: 0.5 })
        + poly([[cx - hw * 0.8, top + hh * 0.22], [cx + hw * 0.8, top + hh * 0.22], [cx + hw * 0.62, top - hh * 0.2], [cx - hw * 0.62, top - hh * 0.2]], P.ramp(P.grassDry, 0.42));
    }
    if (kind === 'turban') {
      s += poly([[cx - hw * 1.18, top + hh * 0.3], [cx - hw * 1.1, top - hh * 0.26], [cx + hw * 1.1, top - hh * 0.26], [cx + hw * 1.18, top + hh * 0.3],
        [cx + hw * 0.9, top + hh * 0.2], [cx - hw * 0.9, top + hh * 0.2]], c, { stroke: alpha(P.ink, 0.25), sw: 0.9 });
      s += poly([[cx - hw * 1.0, top - hh * 0.06], [cx + hw * 1.0, top - hh * 0.06], [cx + hw * 0.98, top - hh * 0.2], [cx - hw * 0.98, top - hh * 0.2]], darken(c, 0.2), { opacity: 0.7 });
      s += poly([[cx + hw * 0.9, top + hh * 0.16], [cx + hw * 1.5, top + hh * 0.5], [cx + hw * 1.34, top + hh * 0.6], [cx + hw * 0.86, top + hh * 0.34]], mul(c, 0.9));
      return s;
    }
    if (kind === 'scarf') {
      return poly([[cx - hw * 1.16, top + hh * 0.3], [cx - hw * 1.04, top - hh * 0.06], [cx + hw * 1.04, top - hh * 0.06], [cx + hw * 1.16, top + hh * 0.3],
        [cx + hw * 1.06, top + hh * 0.46], [cx + hw * 0.4, top + hh * 0.46], [cx + hw * 0.42, top + hh * 0.72], [cx + hw * 0.16, top + hh * 0.7],
        [cx + hw * 0.1, top + hh * 0.46], [cx - hw * 1.06, top + hh * 0.46]], c, { stroke: alpha(P.ink, 0.22), sw: 0.8 });
    }
    if (kind === 'fur') {
      return poly([[cx - hw * 1.2, top + hh * 0.28], [cx - hw * 1.1, top - hh * 0.28], [cx + hw * 1.1, top - hh * 0.28], [cx + hw * 1.2, top + hh * 0.28]], c)
        + poly(ngon(cx, top + hh * 0.02, hw * 1.05, 10, 0.2, 0.62), lighten(c, 0.18), { opacity: 0.4 });
    }
    if (kind === 'hood') {
      return poly([[cx - hw * 1.24, top + hh * 0.36], [cx - hw * 1.16, top - hh * 0.24], [cx, top - hh * 0.44], [cx + hw * 1.16, top - hh * 0.24], [cx + hw * 1.24, top + hh * 0.36],
        [cx + hw * 0.86, top + hh * 0.24], [cx, top + hh * 0.14], [cx - hw * 0.86, top + hh * 0.24]], c);
    }
    return '';
  }

  function facialHair(o) {
    var cx = o.cx, top = o.top, hw = o.hw, hh = o.hh, c = o.color;
    if (o.kind === 'mustache') return poly([[cx - hw * 0.44, top + hh * 0.79], [cx + hw * 0.44, top + hh * 0.79], [cx + hw * 0.4, top + hh * 0.85], [cx - hw * 0.4, top + hh * 0.85]], c);
    if (o.kind === 'beard') return poly([[cx - hw * 0.5, top + hh * 0.76], [cx + hw * 0.5, top + hh * 0.76], [cx + hw * 0.6, top + hh * 1.02], [cx, top + hh * 1.16], [cx - hw * 0.6, top + hh * 1.02]], c, { opacity: 0.95 });
    if (o.kind === 'stubble') return poly([[cx - hw * 0.72, top + hh * 0.72], [cx + hw * 0.72, top + hh * 0.72], [cx + hw * 0.5, top + hh], [cx - hw * 0.5, top + hh]], c, { opacity: 0.22 });
    if (o.kind === 'full') {
      return poly([[cx - hw * 0.66, top + hh * 0.72], [cx + hw * 0.66, top + hh * 0.72], [cx + hw * 0.72, top + hh * 1.06], [cx, top + hh * 1.22], [cx - hw * 0.72, top + hh * 1.06]], c)
        + poly([[cx - hw * 0.42, top + hh * 0.8], [cx + hw * 0.42, top + hh * 0.8], [cx + hw * 0.38, top + hh * 0.87], [cx - hw * 0.38, top + hh * 0.87]], lighten(c, 0.14), { opacity: 0.6 });
    }
    return '';
  }
  function glasses(o) {
    var cx = o.cx, top = o.top, hw = o.hw, hh = o.hh, c = o.color || P.ramp(P.metal, 0.28);
    var r = hw * 0.3, y = top + hh * 0.5;
    return ln(cx - hw * 0.72, y, cx - hw * 0.44, y - hh * 0.04, c, { sw: hh * 0.02 })
      + ln(cx + hw * 0.44, y - hh * 0.04, cx + hw * 0.72, y, c, { sw: hh * 0.02 })
      + poly(ngon(cx - hw * 0.42, y, r, 8, 0.4), null, { stroke: c, sw: hh * 0.022 })
      + poly(ngon(cx + hw * 0.42, y, r, 8, 0.4), null, { stroke: c, sw: hh * 0.022 })
      + ln(cx - hw * 0.1, y, cx + hw * 0.1, y, c, { sw: hh * 0.02 });
  }
  function bandageWrap(o) {
    var cx = o.cx, top = o.top, hw = o.hw, hh = o.hh, c = o.color || P.ramp(P.white, 0.6);
    return poly([[cx - hw * 1.06, top + hh * 0.2], [cx - hw * 0.1, top + hh * 0.06], [cx - hw * 0.06, top + hh * 0.5], [cx - hw * 1.02, top + hh * 0.64]], c, { opacity: 0.94 })
      + poly([[cx - hw * 1.04, top + hh * 0.22], [cx - hw * 0.14, top + hh * 0.1], [cx - hw * 0.12, top + hh * 0.2], [cx - hw * 1.02, top + hh * 0.32]], darken(c, 0.18), { opacity: 0.6 });
  }

  function humanoid(o) {
    o = o || {};
    var H = o.H || 900;
    var gy = o.gy == null ? H : o.gy;
    var cx = o.cx == null ? H * 0.5 : o.cx;
    var b = o.build == null ? 1 : o.build;
    var POSE = o.poseJoint || poseOf(o.pose || 'stand');
    function X(v) { return cx + v * H; }
    function Y(v) { return gy + v * H; }

    var skin = o.skin || P.ramp(P.skin, 0.45);
    var skinD = darken(skin, 0.24), skinL = lighten(skin, 0.16);
    var cloth = o.cloth || P.ramp(P.uniform, 0.45);
    var clothD = darken(cloth, 0.2);
    var pants = o.pants || darken(cloth, 0.12);
    var hs = o.headScale == null ? 1 : o.headScale;
    var hw = H * 0.052 * hs, hh = hw * 2.06;
    var headTopY = gy - H * 0.985 + (1 - hs) * H * 0.05;

    var back = [], front = [];

    function drawLeg(key) {
      var hip = POSE['hip' + key], knee = POSE['knee' + key], ank = POSE['ank' + key], s = '';
      s += limbSeg([X(hip[0]), Y(hip[1])], [X(knee[0]), Y(knee[1])], H * 0.044 * b, H * 0.032 * b, pants, { highlight: true });
      s += limbSeg([X(knee[0]), Y(knee[1])], [X(ank[0]), Y(ank[1])], H * 0.032 * b, H * 0.023 * b, o.puttee ? clothD : pants, {});
      if (o.puttee) {
        for (var i = 0; i < 5; i++) {
          var t = 0.16 + i * 0.18;
          s += pline([[X(lerp(knee[0], ank[0], t)), Y(lerp(knee[1], ank[1], t))],
            [X(lerp(knee[0], ank[0], t + 0.14)), Y(lerp(knee[1], ank[1], t + 0.14))]], alpha(P.ink, 0.26), { sw: H * 0.012 });
        }
      }
      s += poly([[X(ank[0]) - H * 0.034, Y(ank[1]) + H * 0.008], [X(ank[0]) + H * 0.05, Y(ank[1]) + H * 0.008],
        [X(ank[0]) + H * 0.048, Y(ank[1]) + H * 0.032], [X(ank[0]) - H * 0.036, Y(ank[1]) + H * 0.032]],
        o.shoe || P.ramp(P.wood, 0.16), { stroke: alpha(P.ink, 0.3), sw: 0.8 });
      return s;
    }
    function drawArm(key) {
      var sh = POSE['sh' + key], el = POSE['el' + key], wr = POSE['wr' + key], s = '';
      s += limbSeg([X(sh[0]), Y(sh[1])], [X(el[0]), Y(el[1])], H * 0.032 * b, H * 0.026 * b, cloth, { highlight: true });
      s += limbSeg([X(el[0]), Y(el[1])], [X(wr[0]), Y(wr[1])], H * 0.026 * b, H * 0.022 * b, o.sleeve2 || cloth, {});
      s += poly(ngon(X(wr[0]), Y(wr[1]) + H * 0.012, H * 0.024, 6, 0.3), skin);
      return s;
    }

    var farKey = o.faceRight === false ? 'L' : 'R';
    var nearKey = o.faceRight === false ? 'R' : 'L';

    if (o.cloak) {
      back.push(facet([[X(-0.128), Y(POSE.shL[1])], [X(0.128), Y(POSE.shL[1])],
        [X(0.126), Y(POSE.hipL[1] + 0.34)], [X(-0.126), Y(POSE.hipL[1] + 0.34)]],
        o.cloakColor || P.ramp(P.cloth, 0.3), { light: 0.09, hl: 0.26, dark: 0.1, dl: 0.24 }));
    }
    if (o.pack) back.push(packBag(X(0), Y(POSE.shL[1] + 0.06), H * 0.075, H * 0.11, o.packColor || P.ramp(P.cloth, 0.34)));
    back.push(drawLeg(farKey));
    back.push(drawArm(farKey));

    var shW = H * 0.108 * b, waW = H * 0.072 * b, hiW = H * 0.082 * b;
    var shY = Y(POSE.shL[1]), hiY = Y(POSE.hipL[1]), waY = lerp(shY, hiY, 0.56);
    var torso = [];
    torso.push(poly([[X(-shW / H), shY], [X(shW / H), shY], [X(waW / H), waY], [X(hiW / H), hiY + H * 0.012],
      [X(-hiW / H), hiY + H * 0.012], [X(-waW / H), waY]], cloth, { stroke: alpha(P.ink, 0.26), sw: 0.9, join: 'round' }));
    torso.push(poly([[X(-shW / H), shY], [X(-waW / H), waY], [X(-hiW / H), hiY + H * 0.012], [X(0), hiY + H * 0.012], [X(0), shY]], clothD, { opacity: 0.34 }));
    torso.push(poly([[X(0), shY + H * 0.01], [X(0), hiY + H * 0.01], [X(hiW / H), hiY + H * 0.012], [X(waW / H), waY], [X(shW / H), shY + H * 0.01]], clothD, { opacity: 0.22 }));
    torso.push(poly([[X(-shW / H * 0.42), shY + H * 0.008], [X(shW / H * 0.42), shY + H * 0.008], [X(0), shY + H * 0.058]], clothD, { opacity: 0.7 }));
    torso.push(pline([[X(0), shY + H * 0.05], [X(0), hiY + H * 0.01]], alpha(P.ink, 0.28), { sw: H * 0.007 }));
    if (o.collar !== false) {
      var col = o.collarColor || P.ramp(P.red, 0.55);
      torso.push(poly([[X(-shW / H * 0.5), shY + H * 0.006], [X(-shW / H * 0.2), shY + H * 0.006], [X(-shW / H * 0.16), shY + H * 0.05], [X(-shW / H * 0.42), shY + H * 0.05]], col));
      torso.push(poly([[X(shW / H * 0.2), shY + H * 0.006], [X(shW / H * 0.5), shY + H * 0.006], [X(shW / H * 0.42), shY + H * 0.05], [X(shW / H * 0.16), shY + H * 0.05]], col));
    }
    torso.push(poly([[X(-hiW / H * 1.06), hiY - H * 0.006], [X(hiW / H * 1.06), hiY - H * 0.006], [X(hiW / H * 1.06), hiY + H * 0.024], [X(-hiW / H * 1.06), hiY + H * 0.024]],
      o.belt || P.ramp(P.wood, 0.14)));
    torso.push(rect(X(-H * 0.016), hiY - H * 0.002, H * 0.032, H * 0.022, o.buckle || P.ramp(P.gold, 0.55)));
    if (o.sash) torso.push(poly([[X(-shW / H), shY], [X(-shW / H * 0.72), shY], [X(hiW / H * 0.9), hiY], [X(hiW / H * 0.5), hiY]], o.sashColor || P.ramp(P.cloth, 0.35), { opacity: 0.95 }));
    if (o.coat) {
      torso.push(facet([[X(-hiW / H * 1.14), hiY], [X(hiW / H * 1.14), hiY], [X(hiW / H * 1.2), hiY + H * (o.coatLen || 0.2)],
        [X(-hiW / H * 1.2), hiY + H * (o.coatLen || 0.2)]], mul(cloth, 0.94), { light: 0.08, hl: 0.24, dark: 0.1, dl: 0.24 }));
      torso.push(pline([[X(0), hiY], [X(0), hiY + H * (o.coatLen || 0.2)]], alpha(P.ink, 0.24), { sw: H * 0.006 }));
    }
    if (o.apron) torso.push(facet([[X(-hiW / H * 0.9), hiY - H * 0.02], [X(hiW / H * 0.9), hiY - H * 0.02], [X(hiW / H * 0.8), hiY + H * 0.18], [X(-hiW / H * 0.8), hiY + H * 0.18]],
      o.apronColor || P.ramp(P.cloth, 0.42), { light: 0.08, hl: 0.24, dark: 0.08, dl: 0.2 }));
    front.push(torso.join(''));
    front.push(drawLeg(nearKey));
    front.push(drawArm(nearKey));

    var neckW = H * 0.026 * b;
    var neck = poly([[X(-neckW / H), shY + H * 0.004], [X(neckW / H), shY + H * 0.004],
      [X(neckW / H * 0.9), headTopY + hh * 0.98], [X(-neckW / H * 0.9), headTopY + hh * 0.98]], skinD);
    var headBody = headStr({ cx: X(0), top: headTopY, hw: hw, hh: hh, skin: skin, skinDark: skinD, skinLight: skinL })
      + faceFeatures({ cx: X(0), top: headTopY, hw: hw, hh: hh, face: o.face || 'calm', skin: skin, skinDark: skinD, eyeColor: o.eyeColor, browColor: o.browColor, inkColor: o.inkColor })
      + (o.facialHair ? facialHair({ cx: X(0), top: headTopY, hw: hw, hh: hh, color: o.browColor || P.ramp(P.hair, 0.3), kind: o.facialHair }) : '')
      + (o.glasses ? glasses({ cx: X(0), top: headTopY, hw: hw, hh: hh, color: o.glassColor }) : '')
      + (o.bandage ? bandageWrap({ cx: X(0), top: headTopY, hw: hw, hh: hh, color: o.bandageColor }) : '')
      + hairStyle({ cx: X(0), top: headTopY, hw: hw, hh: hh, style: o.hair || 'short', color: o.hairColor })
      + headwear({ cx: X(0), top: headTopY, hw: hw, hh: hh, kind: o.hat || 'none', color: o.hatColor || cloth, starColor: o.starColor, star: o.star });
    front.push(neck + headBody);

    if (o.armband) front.push(poly([[X(shW / H * 0.86), shY + H * 0.05], [X(shW / H * 1.14), shY + H * 0.05],
      [X(shW / H * 1.14), shY + H * 0.088], [X(shW / H * 0.86), shY + H * 0.088]], o.armbandColor || P.paper));
    if (o.scarf) front.push(poly([[X(-shW / H * 0.5), shY + H * 0.01], [X(shW / H * 0.5), shY + H * 0.01],
      [X(shW / H * 0.4), shY + H * 0.062], [X(-shW / H * 0.4), shY + H * 0.062]], o.scarfColor || P.ramp(P.red, 0.4)));
    if (o.extra) front.push(typeof o.extra === 'function' ? o.extra({ X: X, Y: Y, H: H, shY: shY, hiY: hiY, shW: shW, hiW: hiW }) : o.extra);

    var body = back.join('') + front.join('');
    if (o.transform) body = grp(body, { transform: o.transform });
    return body;
  }

  function crowd(count, o) {
    o = o || {};
    var rng = RNG(o.seed || 'crowd'), s = [];
    var y0 = o.y0 == null ? 0 : o.y0, y1 = o.y1 == null ? 100 : o.y1;
    var x0 = o.x0 == null ? 0 : o.x0, x1 = o.x1 == null ? 100 : o.x1;
    var stride = o.stride == null ? 0.72 : o.stride;
    for (var i = 0; i < count; i++) {
      var t = i / Math.max(1, count - 1);
      var x = lerp(x0, x1, t) + rng.range(-30, 30);
      var y = lerp(y0, y1, Math.pow(rng(), 0.7));
      var depth = (y - y0) / Math.max(1, y1 - y0);
      var k = 0.42 + depth * 0.72;
      var color = o.color || mul(P.ramp(P.uniform, 0.4), 0.6 + depth * 0.5);
      var h = (o.h || 170) * k;
      s.push(silhouette(x, y + h * 0.98, h, color, rng, stride, o.hat));
    }
    return s.join('');
  }

  /* 轻量剪影：远景队伍用。5~7 个多边形，~350 字节。 */
  function silhouette(cx, gy, h, color, rng, stride, hat) {
    var w = h * 0.17, hd = h * 0.135, step = (stride == null ? 0.72 : stride) * rng.range(0.8, 1.25);
    var s = '', sw = w * 1.05, lg = w * 0.42;
    var lift = rng() * 0.22;
    /* 腿 */
    s += poly([[cx - lg * 1.1, gy], [cx - lg * 0.1, gy], [cx - lg * 0.2, gy - h * 0.46], [cx - lg * 1.15, gy - h * 0.46]], color);
    s += poly([[cx + lg * 0.15, gy - h * 0.01 * (1 - step)], [cx + lg * 1.15, gy], [cx + lg * 1.1, gy - h * 0.46], [cx + lg * 0.2, gy - h * 0.46]],
      mul(color, 0.9));
    /* 躯干 */
    s += poly([[cx - sw * 0.5, gy - h * 0.44], [cx + sw * 0.5, gy - h * 0.44], [cx + sw * 0.4, gy - h * 0.79], [cx - sw * 0.4, gy - h * 0.79]], color);
    /* 臂 */
    s += poly([[cx - sw * 0.52, gy - h * 0.77], [cx - sw * 0.3, gy - h * 0.77], [cx - sw * 0.34, gy - h * 0.44], [cx - sw * 0.56, gy - h * 0.44]], mul(color, 0.88));
    /* 头 */
    s += poly(ngon(cx, gy - h * (0.85 + lift), hd * 0.5, 6, 0.3), color);
    /* 帽（八角帽） */
    if (hat !== 'none') {
      s += poly([[cx - hd * 0.66, gy - h * (0.885 + lift)], [cx + hd * 0.66, gy - h * (0.885 + lift)],
        [cx + hd * 0.5, gy - h * (0.945 + lift)], [cx - hd * 0.5, gy - h * (0.945 + lift)]], mul(color, 0.82));
    }
    /* 背包 */
    if (rng() < 0.55) s += poly([[cx + sw * 0.5, gy - h * 0.76], [cx + sw * 0.78, gy - h * 0.72], [cx + sw * 0.74, gy - h * 0.52], [cx + sw * 0.48, gy - h * 0.54]], mul(color, 0.78));
    /* 枪 */
    if (rng() < 0.45) s += ln(cx - sw * 0.2, gy - h * 0.3, cx + sw * 0.75, gy - h * 1.02, mul(color, 0.72), { sw: Math.max(1.4, h * 0.014), cap: 'round' });
    return s;
  }

  function portraitSVG(spec) {
    spec = spec || {};
    var W = 600, Ht = 900, face = spec.face || 'calm';
    /* frame: 'three-quarter'(默认，膝上构图，面部清晰) | 'full'(全身) | 'bust'(胸像) */
    var frame = spec.frame || 'three-quarter';
    var FH, FGY;
    if (frame === 'full') { FH = Ht * 0.98; FGY = Ht - 8; }
    else if (frame === 'bust') { FH = 1960; FGY = 1990; }
    else { FH = 1010; FGY = 1058; }
    var k = spec.scale || 1;
    var base = {};
    for (var kk in (spec.opts || {})) base[kk] = spec.opts[kk];
    base.H = FH * k;
    base.gy = FGY * k + (spec.groundGap || 0);
    base.cx = W / 2;
    base.face = face;
    var body = humanoid(base);
    var shadow = frame === 'full'
      ? poly(ngon(W / 2, Ht - 6, 118 * k, 12, 0.2, 0.22), P.ramp(P.ink, 0.2), { opacity: 0.34 })
      : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + Ht + '" viewBox="0 0 ' + W + ' ' + Ht + '">'
      + shadow + body + '</svg>';
  }

  /* =========================================================================
   * 9. UI 装饰
   * ====================================================================== */
  function uiStar(cx, cy, r, color, o) {
    o = o || {};
    var pts = [], inner = r * 0.42;
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? inner : r;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return poly(pts, color, o);
  }
  function uiFrame(x, y, w, h, o) {
    o = o || {};
    var c = o.color || P.ramp(P.gold, 0.5), t = o.t == null ? 3 : o.t, s = '';
    s += ln(x, y, x + w * 0.24, y, c, { sw: t }); s += ln(x, y, x, y + h * 0.24, c, { sw: t });
    s += ln(x + w, y, x + w - w * 0.24, y, c, { sw: t }); s += ln(x + w, y, x + w, y + h * 0.24, c, { sw: t });
    s += ln(x, y + h, x + w * 0.24, y + h, c, { sw: t }); s += ln(x, y + h, x, y + h - h * 0.24, c, { sw: t });
    s += ln(x + w, y + h, x + w - w * 0.24, y + h, c, { sw: t }); s += ln(x + w, y + h, x + w, y + h - h * 0.24, c, { sw: t });
    return s;
  }
  function uiRibbon(x, y, w, h, o) {
    o = o || {};
    var c = o.color || P.ramp(P.red, 0.5);
    return poly([[x, y], [x + w, y], [x + w - h * 0.28, y + h / 2], [x + w, y + h], [x, y + h], [x + h * 0.28, y + h / 2]], c)
      + poly([[x + h * 0.28, y + h / 2], [x, y + h], [x, y]], darken(c, 0.18));
  }
  function uiBtn(w, h, o) {
    o = o || {};
    var c = o.color || P.ramp(P.uniform, 0.35);
    var s = pth('M 10 2 L ' + (w - 22) + ' 2 L ' + (w - 2) + ' ' + (h / 2) + ' L ' + (w - 22) + ' ' + (h - 2) + ' L 10 ' + (h - 2) + ' L 2 ' + (h / 2) + ' Z', c, { stroke: alpha(P.ink, 0.28), sw: 1.4 });
    s += pth('M 12 5 L ' + (w - 24) + ' 5 L ' + (w - 6) + ' ' + (h / 2) + ' L ' + (w - 24) + ' ' + (h - 5) + ' L 12 ' + (h - 5) + ' L 6 ' + (h / 2) + ' Z', lighten(c, 0.18), { opacity: 0.3 });
    return s;
  }
  function uiMountainMotif(cx, cy, w, h, color, seed) {
    var rng = RNG(seed || 'motif'), s = '', pts = [], segs = 9;
    for (var i = 0; i <= segs; i++) {
      var t = i / segs;
      pts.push([cx - w / 2 + w * t, cy - Math.abs(Math.sin(t * Math.PI * 1.6)) * h * rng.range(0.5, 1)]);
    }
    for (var k = 0; k < pts.length - 1; k++) s += poly([pts[k], pts[k + 1], [pts[k + 1][0], cy], [pts[k][0], cy]], mul(color, 0.85 + rng() * 0.3), { opacity: 0.9 });
    return s;
  }
  function uiCloudMotif(x, y, w, color) {
    return poly([[x, y], [x + w * 0.2, y - w * 0.12], [x + w * 0.48, y - w * 0.06], [x + w * 0.72, y - w * 0.16], [x + w, y], [x + w * 0.9, y + w * 0.07], [x + w * 0.1, y + w * 0.07]], color, { opacity: 0.5 });
  }
  function uiDivider(x, y, w, color) {
    return pline([[x, y], [x + w * 0.38, y], [x + w * 0.44, y - 5], [x + w * 0.5, y], [x + w * 0.56, y - 5], [x + w * 0.62, y], [x + w, y]], color, { sw: 1.6, cap: 'round' });
  }

  /* =========================================================================
   * 10. 文档包装
   * ====================================================================== */
  function doc(w, h, body, o) {
    o = o || {};
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"'
      + (o.extra ? ' ' + o.extra : '') + '>'
      + (o.defs ? defs(o.defs) : '')
      + (o.bg ? rect(0, 0, w, h, o.bg) : '')
      + body + '</svg>';
  }

  G.ART = G.ART || { portraits: {}, scenes: {}, cg: {}, ui: {}, meta: {}, characters: {} };

  var GEO = {
    P: P, RNG: RNG, hashStr: hashStr, uid: uid, n: n, clamp: clamp, lerp: lerp,
    mix: mix, lighten: lighten, darken: darken, alpha: alpha, mul: mul, ramp: ramp,
    poly: poly, pline: pline, pth: pth, rect: rect, circle: circle, ell: ell, ln: ln, grp: grp, text: text,
    defs: defs, linearGrad: linearGrad, radialGrad: radialGrad,
    centroid: centroid, inset: inset, expand: expand, move: move, scalePts: scalePts, jitter: jitter,
    facet: facet, facetBand: facetBand, ngon: ngon, boxIso: boxIso,
    sky: sky, glowBand: glowBand, sunDisc: sunDisc, stars: stars, cloudBank: cloudBank, mistBand: mistBand,
    snowfall: snowfall, rainfall: rainfall, embers: embers, smokePlume: smokePlume, vignette: vignette,
    ridgeLine: ridgeLine, mountainRange: mountainRange, cliffWall: cliffWall, groundBand: groundBand,
    waterBand: waterBand, waterReflection: waterReflection, lakeSurface: lakeSurface,
    pineTree: pineTree, bambooCluster: bambooCluster, broadleafTree: broadleafTree, shrubRow: shrubRow,
    grassTufts: grassTufts, reeds: reeds, lotusHummock: lotusHummock,
    house: house, tower: tower, gate: gate, ropeBridge: ropeBridge, plankBridge: plankBridge,
    tent: tent, cityWall: cityWall, stairs: stairs, caveMouth: caveMouth, ptAt: ptAt,
    torch: torch, campfire: campfire, lantern: lantern, flag: flag, banner: banner,
    woodenBoat: woodenBoat, raft: raft, stretcher: stretcher, rifle: rifle, packBag: packBag,
    copperPot: copperPot, bugle: bugle, mapOnTable: mapOnTable, chair: chair, telegraphPole: telegraphPole,
    fenceRow: fenceRow, stoneMarker: stoneMarker, barbedWire: barbedWire, bunker: bunker, wallPoster: wallPoster,
    humanoid: humanoid, crowd: crowd, silhouette: silhouette, portraitSVG: portraitSVG,
    POSES: POSES, FACES: FACES, poseOf: poseOf, lerpPose: lerpPose,
    uiStar: uiStar, uiFrame: uiFrame, uiRibbon: uiRibbon, uiBtn: uiBtn,
    uiMountainMotif: uiMountainMotif, uiCloudMotif: uiCloudMotif, uiDivider: uiDivider,
    doc: doc, ART: G.ART
  };

  G.GEO = GEO;
  if (typeof module === 'object' && module.exports) module.exports = GEO;
})();
