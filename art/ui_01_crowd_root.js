/* ==========================================================================
 * 背景群众印章 —— 用 NekoGptImage 生成的全身素材替换掉 geosvg 的多边形剪影
 *
 * 文件所有权：root。
 * 加载顺序：build-art.js 按文件名排序加载 art/ 下匹配
 *   /^(scenes|cg|ui|portraits)/ 的文件，且把 scenes.js 排在最后。
 *   本文件叫 ui_01_...，因此在 scenes*.js **之前**执行，
 *   可以覆盖 GEO.crowd / GEO.humanoid / GEO.doc，让所有已写好的场景自动改用新素材，
 *   不需要改动任何 art/scenes*.js。
 *
 * 背景里的队伍如果还用手写六边形剪影，和对话立绘（低多边形刻面人像）不是一个画风。
 * 这里把两者统一：群众与远景队伍一律用同一套 AI 素材。
 * ========================================================================== */
(function () {
  'use strict';

  var G = (typeof window !== 'undefined') ? window
    : (typeof globalThis !== 'undefined') ? globalThis : this;
  var GEO = G.GEO;
  if (!GEO) return;

  var S = G.CROWD_STAMPS;
  if (!S && typeof require === 'function') {
    try { S = require('./ui_00_crowd_stamps.js'); } catch (e) { }
  }
  if (!S || !Object.keys(S).length) {
    /* 没有素材就保持原样，绝不因为缺素材让构建失败 */
    return;
  }

  var IDS = Object.keys(S);
  function byPose(prefix) {
    return IDS.filter(function (k) { return k.indexOf(prefix + '_') === 0; });
  }
  var GROUPS = {
    stand: byPose('stand'),
    march: byPose('march'),
    carry: byPose('carry'),
    sit: byPose('sit'),
    peasant: byPose('peasant'),
    flag: byPose('flag'),
    nurse: byPose('nurse'),
    bayonet: byPose('bayonet')
  };

  /* 已用到的印章 → 在 doc() 里一次性写进 <defs> */
  var used = {};
  function resetUsed() { used = {}; }

  function pickTone(color) {
    var c = String(color || '').replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var n = parseInt(c, 16);
    var lum = isNaN(n) ? 0.5 : (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255;
    if (lum < 0.30) return 'f';
    if (lum < 0.48) return 'd';
    return 'n';
  }

  function symId(name, tone) { return 'cs-' + name + '-' + tone; }

  function symbolFor(name, tone) {
    var st = S[name];
    if (!st) return '';
    var id = symId(name, tone);
    if (used[id]) return '';
    used[id] = 1;
    return '<symbol id="' + id + '" viewBox="0 0 ' + st.w + ' ' + st.h + '" ' +
      'preserveAspectRatio="xMidYMax meet">' +
      '<image x="0" y="0" width="' + st.w + '" height="' + st.h + '" ' +
      'preserveAspectRatio="none" href="' + (st[tone] || st.n) + '"/>' +
      '</symbol>';
  }

  function useTag(name, x, y, w, h, tone, opacity) {
    var st = S[name];
    if (!st) return '';
    var def = symbolFor(name, tone);
    return def + '<use href="#' + symId(name, tone) + '" x="' + round(x) + '" y="' + round(y) +
      '" width="' + round(w) + '" height="' + round(h) + '"' +
      (opacity != null && opacity < 1 ? ' opacity="' + opacity + '"' : '') + '/>';
  }

  function round(v) { return Math.round(v * 100) / 100; }

  function pick(list, rng) {
    if (!list || !list.length) return IDS[0];
    return list[Math.floor(rng() * list.length) % list.length];
  }

  /* ---- 覆盖 crowd()：与原来同样的参数语义，只是换成印章 ---- */
  var _crowd = GEO.crowd;
  GEO.crowd = function (count, o) {
    o = o || {};
    if (!o.__noStamp) {
      var rng = GEO.RNG(o.seed || 'crowd');
      var y0 = o.y0 == null ? 0 : o.y0, y1 = o.y1 == null ? 100 : o.y1;
      var x0 = o.x0 == null ? 0 : o.x0, x1 = o.x1 == null ? 100 : o.x1;
      var stride = o.stride == null ? 0.72 : o.stride;
      /* 原来的剪影宽高比约 0.17，换成真人物素材后约 0.42 —— 同样的 h 会显得大得多、
         也更容易互相压住。整体收到 0.82，让群众退回到"背景"该有的体量。 */
      var hBase = (o.h || 170) * 0.82;
      var tone = pickTone(o.color);
      var pool = stride > 0.75 ? GROUPS.march.concat(GROUPS.stand)
        : stride < 0.5 ? GROUPS.stand.concat(GROUPS.peasant)
          : GROUPS.march.concat(GROUPS.stand, GROUPS.bayonet);
      if (o.hat === 'none') pool = GROUPS.peasant.concat(GROUPS.stand);
      var out = '';
      for (var i = 0; i < count; i++) {
        var t = i / Math.max(1, count - 1);
        var x = lerp(x0, x1, t) + rng.range(-30, 30);
        var y = lerp(y0, y1, Math.pow(rng(), 0.7));   /* y = 地面线 */
        var depth = (y - y0) / Math.max(1, y1 - y0);
        var k = 0.42 + depth * 0.72;
        var h = hBase * k * rng.range(0.92, 1.08);
        var name = pick(pool, rng);
        var st = S[name];
        var w = h * (st ? st.ar : 0.42);
        out += useTag(name, x - w / 2, y - h, w, h, tone, o.opacity);
      }
      return out;
    }
    return _crowd.apply(GEO, arguments);
  };

  /* ---- 覆盖 humanoid()：单个前景人物（担架队等） ---- */
  var _humanoid = GEO.humanoid;
  GEO.humanoid = function (o) {
    o = o || {};
    if (o.__noStamp) return _humanoid.apply(GEO, arguments);
    var map = {
      carry: GROUPS.carry, march: GROUPS.march, walk: GROUPS.march, stand: GROUPS.stand,
      run: GROUPS.bayonet, point: GROUPS.stand, salute: GROUPS.stand, hold: GROUPS.stand,
      armscrossed: GROUPS.stand, raiseone: GROUPS.stand, kneel: GROUPS.sit,
      sit: GROUPS.sit, shield: GROUPS.stand
    };
    var pool = map[o.pose] || GROUPS.stand;
    var rng = GEO.RNG(o.seed || ('hum' + (o.cx || 0) + (o.gy || 0)));
    /* o.stamp 可以点名用哪一张印章：背景里并排站着的人物（担架队的四个人）
       如果交给随机挑，两张池子里有一半概率挑到同一张 —— 玩家看到的就是"复制人"。
       点名之后每个人必然是不同的一张（用户 2026-10-16 的反馈）。 */
    var name = (o.stamp && S[o.stamp]) ? o.stamp : pick(pool.length ? pool : GROUPS.stand, rng);
    var st = S[name];
    var H = o.H || 900;
    var w = H * (st ? st.ar : 0.42);
    var cx = o.cx == null ? H * 0.5 : o.cx;
    var gy = o.gy == null ? H : o.gy;
    return useTag(name, cx - w / 2, gy - H, w, H, pickTone(o.cloth || o.color), o.opacity);
  };

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* 每张背景都要各自写一份 <symbol>，否则第二张之后的 <use> 全是悬空引用（画面上
   * 一个人都不会出现）。doc() 是每个场景 build 的最后一步，在这里重置计数器最稳。 */
  var _doc = GEO.doc;
  GEO.doc = function (w, h, body, o) {
    var svg = _doc(w, h, body, o || {});
    resetUsed();
    return svg;
  };

  /* <symbol> 直接内联在 body 里：SVG 允许 symbol 出现在任意位置且不渲染，
   * 所以每个背景只需写一份定义，后续都用 <use> 引用。doc() 无需改动。 */
  GEO.__crowdStamps = { tones: GROUPS, count: IDS.length };
})();
