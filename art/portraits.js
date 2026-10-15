/* 人物立绘 · 35 个 id（600×900，透明背景，膝上构图）
 * 文件所有权：root。注册到 window.ART.portraits[id](face) → 完整 SVG 文档。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO, P = GEO.P;
  var ART = G.ART = G.ART || {};
  ART.portraits = ART.portraits || {};
  var R = GEO.ramp, MIX = GEO.mix, MUL = GEO.mul, DK = GEO.darken, LT = GEO.lighten;

  function def(id, opts, frame, scale) {
    ART.portraits[id] = function (face) {
      return GEO.portraitSVG({ id: id, face: face, frame: frame || 'three-quarter', scale: scale || 1, opts: opts });
    };
  }
  function group(ids, fn) { ids.forEach(fn); }

  /* 常用色 */
  var GRAY = R(P.uniform, 0.5), GRAYD = R(P.uniform, 0.4), GREEN = R(P.uniformGrn, 0.42), GREEN2 = R(P.uniformGrn, 0.34);
  var PAD = R(P.uniformPad, 0.42), PANT = R(P.cloth, 0.34), SKIN = R(P.skin, 0.45), SKIND = R(P.skinDeep, 0.5), SKINP = R(P.skinPale, 0.5);
  var BASE = { build: 1, puttee: true, collar: true, hair: 'short', hat: 'cap', cloth: GRAY, pants: GRAYD };
  function O(extra) { var o = {}; for (var k in BASE) o[k] = BASE[k]; for (var j in extra) o[j] = extra[j]; return o; }

  /* ======================= 历史人物 ======================= */
  def('mao', O({ cloth: R(P.uniform, 0.46), coat: true, coatLen: 0.2, sash: true, sashColor: R(P.cloth, 0.3),
    build: 1.0, hair: 'short', hairColor: R(P.hair, 0.24) }));

  def('zhou', O({ cloth: DK(GRAY, 0.08), build: 0.94, facialHair: 'stubble', coat: true, coatLen: 0.15,
    browColor: R(P.hair, 0.3), collarColor: R(P.red, 0.5) }));

  def('zhu', O({ cloth: PAD, pants: DK(PAD, 0.16), build: 1.16, facialHair: 'stubble', hatColor: PAD,
    armband: true, armbandColor: R(P.red, 0.5) }));

  def('zhang_wentian', O({ cloth: DK(GRAY, 0.04), build: 0.98, glasses: true, glassColor: R(P.metal, 0.34),
    coat: true, coatLen: 0.14 }));

  def('wang_jiaxiang', O({ cloth: GRAY, build: 0.9, skin: SKINP, cloak: true, cloakColor: R(P.cloth, 0.42),
    pose: 'sit', hat: 'none', hair: 'short' }), 'bust');

  def('bogu', O({ cloth: R(P.uniform, 0.54), build: 0.96, hair: 'long', coat: true, coatLen: 0.2, sash: true }));

  def('lide', O({ cloth: R(P.uniform, 0.36), pants: DK(R(P.uniform, 0.36), 0.16), build: 1.1,
    hairColor: '#b08a4a', browColor: '#96773e', eyeColor: '#9fc4dc', star: false,
    facialHair: 'mustache', sash: true, sashColor: R(P.wood, 0.34) }));

  def('peng', O({ cloth: GRAYD, build: 1.14, facialHair: 'stubble', sash: true, sashColor: R(P.cloth, 0.28) }));

  def('lin', O({ cloth: R(P.uniform, 0.44), build: 0.95, headScale: 0.97 }));

  def('nie', O({ cloth: R(P.uniform, 0.48), build: 1.04, facialHair: 'stubble' }));

  def('liu_bocheng', O({ cloth: R(P.uniform, 0.42), build: 1.06, glasses: true, bandage: true,
    bandageColor: R(P.white, 0.66) }));

  def('chen_yun', O({ cloth: R(P.uniform, 0.52), build: 1.0, sash: true, sashColor: R(P.cloth, 0.34) }));

  def('he_zizhen', O({ cloth: GREEN, pants: DK(GREEN, 0.16), build: 0.9, hair: 'braid', build2: 0,
    bandage: true, bandageColor: R(P.white, 0.62), sash: true, sashColor: R(P.wood, 0.3) }));

  def('deng_yingchao', O({ cloth: GREEN2, pants: DK(GREEN2, 0.16), build: 0.92, hair: 'bun', coat: true, coatLen: 0.18 }));

  def('xu_teli', O({ cloth: R(P.cloth, 0.44), pants: R(P.cloth, 0.34), build: 0.94, hair: 'receding',
    hairColor: R(P.hairGrey, 0.4), browColor: R(P.hairGrey, 0.4), facialHair: 'full', hat: 'straw', coat: true, coatLen: 0.16 }));

  def('dong_biwu', O({ cloth: R(P.uniform, 0.5), build: 1.0, hair: 'receding', hairColor: R(P.hairGrey, 0.3),
    browColor: R(P.hairGrey, 0.34), facialHair: 'stubble', coat: true, coatLen: 0.18 }));

  def('lin_boqu', O({ cloth: R(P.uniform, 0.48), build: 1.02, hair: 'receding', hairColor: R(P.hairGrey, 0.34),
    browColor: R(P.hairGrey, 0.36), glasses: true, sash: true, sashColor: R(P.cloth, 0.3) }));

  def('xie_juezai', O({ cloth: R(P.cloth, 0.4), build: 0.98, hair: 'receding', hairColor: R(P.hairGrey, 0.5),
    browColor: R(P.hairGrey, 0.5), facialHair: 'full' }));

  def('ye_jianying', O({ cloth: R(P.uniform, 0.5), build: 1.02, sash: true, sashColor: R(P.cloth, 0.28) }));

  def('zhang_guotao', O({ cloth: R(P.uniform, 0.56), build: 1.3, coat: true, coatLen: 0.24, collarColor: R(P.gold, 0.4) }));

  def('xu_xiangqian', O({ cloth: R(P.uniform, 0.44), build: 1.08 }));

  def('li_xiannian', O({ cloth: GREEN, pants: DK(GREEN, 0.16), build: 1.0 }));

  def('xiao_yedan', O({ cloth: R(P.cloth, 0.28), pants: R(P.cloth, 0.2), build: 1.1, skin: SKIND,
    hat: 'turban', hatColor: '#22242b', cloak: true, cloakColor: '#33313a', facialHair: 'full',
    hairColor: '#1c1a1c', browColor: '#1c1a1c', puttee: false, collar: false }));

  /* ======================= 虚构人物 ======================= */
  def('xiaoman', O({ cloth: GREEN, pants: DK(GREEN, 0.14), build: 0.84, headScale: 1.1,
    extra: function (c) { return GEO.bugle(c.X(-0.2), c.Y(-0.58), c.H * 0.17, R(P.metal, 0.66)); } }));

  def('li_tiezhu', O({ cloth: R(P.cloth, 0.4), pants: R(P.cloth, 0.3), build: 1.2, apron: true,
    apronColor: R(P.cloth, 0.5), hairColor: R(P.hairGrey, 0.28), browColor: R(P.hairGrey, 0.3),
    facialHair: 'stubble',
    extra: function (c) { return GEO.copperPot(c.X(-0.24), c.Y(-0.5), c.H * 0.09, R(P.metalRust, 0.5)); } }));

  def('he_xiaomei', O({ cloth: GREEN2, pants: DK(GREEN2, 0.14), build: 0.88, headScale: 1.04, hair: 'braid',
    armband: true, armbandColor: R(P.white, 0.7),
    extra: function (c) {
      var x = c.X(0.115), y = c.Y(-0.66);
      return GEO.poly([[x - 6, y - 7], [x + 6, y - 7], [x + 6, y + 7], [x - 6, y + 7]], R(P.red, 0.62))
        + GEO.poly([[x - 13, y - 5], [x - 8, y - 5], [x - 8, y + 5], [x - 13, y + 5]], R(P.red, 0.62))
        + GEO.poly([[x + 8, y - 5], [x + 13, y - 5], [x + 13, y + 5], [x + 8, y + 5]], R(P.red, 0.62));
    } }));

  def('guo_daniang', O({ cloth: R(P.cloth, 0.5), pants: R(P.cloth, 0.4), build: 0.94, hair: 'bun',
    hairColor: R(P.hairGrey, 0.46), browColor: R(P.hairGrey, 0.46), hat: 'scarf', hatColor: R(P.cloth, 0.42),
    apron: true, apronColor: R(P.cloth, 0.56), puttee: false, shoe: R(P.wood, 0.12), collar: false }));

  def('shi_zhu', O({ cloth: GREEN, pants: DK(GREEN, 0.14), build: 1.06,
    extra: function (c) { return GEO.rifle(c.X(0.14), c.Y(-0.34), c.H * 0.42, -68); } }));

  def('a_yue', O({ cloth: MIX(R(P.cloth, 0.4), R(P.redDeep, 0.5), 0.34), pants: R(P.cloth, 0.28),
    build: 0.86, headScale: 1.05, hair: 'braid', hairColor: '#1a1618', browColor: '#1a1618',
    hat: 'none', cloak: true, cloakColor: MIX(R(P.cloth, 0.36), '#3d5f7a', 0.4), puttee: false, collar: false,
    extra: function (c) {
      var s = '', x0 = c.X(0), y0 = c.Y(-0.86);
      for (var k = 0; k < 7; k++) {
        var a = -1.15 + k * 0.38;
        s += GEO.poly(GEO.ngon(x0 + Math.sin(a) * c.H * 0.058, y0 + Math.cos(a) * c.H * 0.05 + c.H * 0.06,
          c.H * 0.013, 6, k), '#cfd6dc');
      }
      return s;
    } }));

  def('wu_laoliu', O({ cloth: R(P.uniform, 0.42), build: 1.04, facialHair: 'stubble', pack: true,
    packColor: R(P.cloth, 0.32) }));

  def('san_wa', O({ cloth: R(P.uniform, 0.48), pants: DK(R(P.uniform, 0.48), 0.14), build: 0.78,
    headScale: 1.16, hatColor: R(P.uniform, 0.42) }));

  /* ======================= 群众 ======================= */
  /* 群体立绘：三到四个不同姿态的人物并排 */
  function groupPortrait(specs) {
    return function (face) {
      var f = face || 'calm', out = '';
      var n = specs.length, span = 380;
      specs.forEach(function (sp, i) {
        var cx = 300 + (i - (n - 1) / 2) * (span / Math.max(1, n - 1)) * 0.9;
        var o = {};
        for (var k in sp) o[k] = sp[k];
        o.face = sp.faceBy === false ? 'calm' : f;
        o.H = 1158 * (sp.sc || 1);
        o.gy = 1210 * (sp.gy || 1);
        o.cx = cx;
        out += GEO.humanoid(o);
      });
      return '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">' + out + '</svg>';
    };
  }
  ART.portraits['soldiers'] = groupPortrait([
    { cloth: GREEN, pants: DK(GREEN, 0.14), pose: 'stand', build: 1.0, hat: 'cap', puttee: true, sc: 0.9, gy: 0.96 },
    { cloth: GRAY, pants: GRAYD, pose: 'salute', build: 1.04, hat: 'cap', puttee: true, sc: 0.98, gy: 1.0 },
    { cloth: GREEN2, pants: DK(GREEN2, 0.14), pose: 'march', build: 0.96, hat: 'cap', puttee: true, sc: 0.88, gy: 0.94 }
  ]);
  ART.portraits['villagers'] = groupPortrait([
    { cloth: R(P.cloth, 0.5), pants: R(P.cloth, 0.4), pose: 'stand', build: 0.94, hat: 'scarf', puttee: false, collar: false, sc: 0.9, gy: 0.96 },
    { cloth: R(P.cloth, 0.4), pants: R(P.cloth, 0.32), pose: 'point', build: 1.02, hat: 'straw', puttee: false, collar: false, sc: 0.98, gy: 1.0 },
    { cloth: R(P.cloth, 0.56), pants: R(P.cloth, 0.44), pose: 'hold', build: 0.88, hat: 'none', hair: 'bun', puttee: false, collar: false, sc: 0.86, gy: 0.94 }
  ]);
  ART.portraits['yi_people'] = groupPortrait([
    { cloth: '#3a3840', pants: '#2b2a30', pose: 'stand', build: 1.06, skin: SKIND, hat: 'turban', hatColor: '#22242b', cloak: true, cloakColor: '#454049', puttee: false, collar: false, sc: 0.94, gy: 0.98 },
    { cloth: '#33313a', pants: '#26252b', pose: 'point', build: 1.0, skin: SKIND, hat: 'fur', hatColor: '#3d3a42', puttee: false, collar: false, sc: 0.9, gy: 0.96 },
    { cloth: '#43403f', pants: '#333130', pose: 'hold', build: 0.9, skin: SKIND, hat: 'turban', hatColor: '#1e1f25', puttee: false, collar: false, sc: 0.86, gy: 0.94 }
  ]);
  ART.portraits['narrator'] = function (face) {
    var o = { H: 1158, gy: 1210, cx: 300, build: 1.0, pose: 'stand', face: face || 'calm',
      cloth: '#2f333c', pants: '#262a31', hat: 'hood', hatColor: '#2a2e36', hair: 'none',
      collar: false, puttee: false, shoe: '#1e2126',
      extra: function (c) {
        return GEO.poly([[c.X(-0.16), c.Y(-0.83)], [c.X(0.16), c.Y(-0.83)], [c.X(0.2), c.Y(0.02)], [c.X(-0.2), c.Y(0.02)]],
          GEO.alpha('#7d8a9c', 0.18));
      } };
    return GEO.portraitSVG({ id: 'narrator', face: face, frame: 'three-quarter', opts: o });
  };
})();
