/* 《长征·万水千山》配色系统
 * 立体几何（low-poly / isometric）风格的低饱和土色基底 + 革命红点缀。
 * 浏览器与 Node 均可加载。
 */
(function () {
  'use strict';

  var P = {
    /* ---- 基础墨色与光照 ---- */
    ink:        '#101723',
    inkSoft:    '#1d2739',
    inkLight:   '#33405a',
    paper:      '#e9e2d4',
    lightWarm:  '#ffe6bd',
    lightCool:  '#bcd6f2',

    /* ---- 天空梯度：一律 [天顶, 中天, 地平线] ---- */
    sky: {
      night:      ['#0d1424', '#16203a', '#26365a'],
      deepNight:  ['#070c16', '#0f1829', '#1c2740'],
      dawn:       ['#5a5f86', '#b98a86', '#f2b477'],
      dawnCold:   ['#5d6b8c', '#a9a6b4', '#d9c3a6'],
      day:        ['#5e8ec0', '#9dc6e4', '#cfe6f2'],
      clearDay:   ['#6aa2cf', '#a8d2ea', '#dff0f7'],
      dusk:       ['#4a3a63', '#b56a5a', '#f0a86a'],
      overcast:   ['#6e7a88', '#9aa5b0', '#c3cbd2'],
      snow:       ['#8fa8c2', '#bdd2e2', '#e6f0f7'],
      storm:      ['#2b3341', '#48505f', '#6f7684'],
      grass:      ['#5d6a74', '#8f9ba0', '#b9c2c4'],
      rain:       ['#3d4650', '#69757f', '#8e9aa6']
    },

    /* ---- 地貌 ---- */
    rock:       ['#4c5366', '#5d657a', '#727a90', '#8b93a6'],
    rockWarm:   ['#5b4f45', '#6f6152', '#867660', '#9d8c73'],
    rockRed:    ['#6b4a44', '#7f5a50', '#94695b', '#a97a68'],
    karst:      ['#4a5b52', '#5c7064', '#708a79', '#879c8c'],
    loess:      ['#8a6a45', '#a07e54', '#b69263', '#cbab79'],
    snow:       ['#c9d9e6', '#dcebf5', '#edf5fb', '#ffffff'],
    grass:      ['#5c6f4a', '#6d8355', '#7f9563', '#93a873'],
    grassDry:   ['#7d7a52', '#928f60', '#a7a36f', '#bdb97f'],
    marsh:      ['#4d5a48', '#5d6b54', '#6d7c62', '#7f8e72'],
    earth:      ['#5a4a3a', '#6d5a47', '#816c56', '#96806a'],
    earthRed:   ['#7a5242', '#8d6250', '#a0745f', '#b3876f'],
    sand:       ['#8a7a5c', '#a1906f', '#b8a684', '#cfbf9c'],

    /* ---- 水 ---- */
    water:      ['#22384f', '#2d4a66', '#3a5f80', '#4a779b'],
    waterRed:   ['#3d2a28', '#563a33', '#6f4c40', '#8a6151'],
    waterNight: ['#101c2e', '#182a42', '#22395a', '#2f4c70'],
    ice:        ['#7fa4bf', '#9dc0d6', '#bcd8e8', '#d9ecf6'],

    /* ---- 植被 ---- */
    pine:       ['#2c4536', '#38543f', '#44654b', '#527a5b'],
    bamboo:     ['#4a6b3f', '#5b7f4b', '#6d9358', '#82a869'],
    leaf:       ['#456b3c', '#567f48', '#6a9457', '#82a869'],
    shrub:      ['#4c5c40', '#5d6e4e', '#6f8160', '#839573'],

    /* ---- 人造物 ---- */
    wood:       ['#4a3826', '#5d4830', '#71583c', '#866b49'],
    woodRed:    ['#6b3428', '#82412f', '#99503a', '#b06247'],
    timber:     ['#5b452e', '#6d5438', '#826744', '#997d55'],
    stone:      ['#565b68', '#6a707e', '#7e8593', '#939aa8'],
    brick:      ['#6a4335', '#7d5240', '#91624c', '#a5745b'],
    tileDark:   ['#2f3542', '#3d4453', '#4c5465', '#5c6578'],
    plaster:    ['#8d8779', '#a19a89', '#b5ad9a', '#c8c1ad'],
    metal:      ['#4a5058', '#5d646d', '#727a84', '#88909b'],
    metalRust:  ['#5e4433', '#71543e', '#86674c', '#9c7c5d'],
    concrete:   ['#5f646b', '#727880', '#868d95', '#9ba2aa'],

    /* ---- 服装（红军）---- */
    uniform:    ['#4e5650', '#5f6a62', '#718074', '#849585'],
    uniformPad: ['#6d7460', '#7e866f', '#909980', '#a3ac92'],
    uniformGrn: ['#4a5a4a', '#5a6c58', '#6b7f68', '#7e9379'],
    white:      ['#c9c8c0', '#dcdbd3', '#ebe9e0', '#f7f5ec'],
    cloth:      ['#7d7364', '#918779', '#a69b8c', '#bbb0a0'],

    /* ---- 肤色 ---- */
    skin:       ['#b98d6c', '#c79a77', '#d4a982', '#e0b992'],
    skinPale:   ['#c2a48c', '#cfb29a', '#dcc0a8', '#e8cdb7'],
    skinDeep:   ['#9a6b4c', '#a97a58', '#b88964', '#c79a76'],

    /* ---- 发色 ---- */
    hair:       ['#241d1a', '#332a25', '#443830', '#57493e'],
    hairGrey:   ['#5a5651', '#6f6b65', '#868179', '#9e998f'],

    /* ---- 革命红与点缀 ---- */
    red:        ['#8c1f22', '#a8282c', '#c33338', '#d94a4f'],
    redDeep:    ['#6b1a1e', '#7f2126', '#93282e', '#a73137'],
    redFlag:    ['#a51f24', '#c02b30', '#d94146', '#e6666a'],
    gold:       ['#8a6a2a', '#a5822f', '#bf9a38', '#d7b148'],
    flame:      ['#b04a18', '#d4661f', '#e88830', '#f7a94c'],
    lamp:       ['#c98a35', '#e0a844', '#f0c263', '#f9d98c']
  };

  /* 便捷取色：P.ramp(P.rock, 0.6) → 在色阶上采样（0..1） */
  function ramp(list, t) {
    /* 单色槽（paper/ink/lightWarm/lightCool 等）直接返回自身。
     * 注意：以前这里会把字符串当成"字符数组"再 mix，结果是 #00000x 的黑色，
     * 已导致多处纸/绷带/医药物品被画成黑色。 */
    if (typeof list === 'string') return list;
    if (!list || !list.length) return '#888888';
    if (t <= 0) return list[0];
    if (t >= 1) return list[list.length - 1];
    var x = t * (list.length - 1), i = Math.floor(x), f = x - i;
    return mix(list[i], list[i + 1] || list[i], f);
  }

  function hex2rgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hex(c) {
    function q(v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }
    return '#' + q(c[0]) + q(c[1]) + q(c[2]);
  }
  function mix(a, b, t) {
    var A = hex2rgb(a), B = hex2rgb(b);
    return rgb2hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
  }
  function mul(h, k) { var c = hex2rgb(h); return rgb2hex([c[0] * k, c[1] * k, c[2] * k]); }
  function lighten(h, t) { return mix(h, '#ffffff', t); }
  function darken(h, t) { return mix(h, P.ink, t); }
  function alpha(h, a) {
    var c = hex2rgb(h);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  P.ramp = ramp;
  P.hex2rgb = hex2rgb;
  P.rgb2hex = rgb2hex;
  P.mix = mix;
  P.mul = mul;
  P.lighten = lighten;
  P.darken = darken;
  P.alpha = alpha;

  /* 章节主题色（UI 用） */
  P.chapterAccent = {
    ch01: '#c98a35', ch02: '#7f8f6a', ch03: '#a8282c', ch04: '#6f7f95',
    ch05: '#8a6a2a', ch06: '#b04a18', ch07: '#c33338', ch08: '#8a6151',
    ch09: '#6d7c62', ch10: '#d7b148', ch11: '#a03a34', ch12: '#3a5f80',
    ch13: '#5b7f4b', ch14: '#2d4a66', ch15: '#a51f24', ch16: '#bcd8e8',
    ch17: '#5d6b54', ch18: '#565b68', ch19: '#b69263', ch20: '#c02b30'
  };

  if (typeof window !== 'undefined') window.ART_PALETTE = P;
  if (typeof module === 'object' && module.exports) module.exports = P;
})();
