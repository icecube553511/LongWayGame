/* 白军俘虏立绘兜底 —— 只由 ch06 的局部 portraitId 使用，不进入冻结人物表。
 * 画面要点：旧棉军装、旧布帽、帽徽被扯掉后的浅色布痕与拆线孔，
 * 不出现红星、红领章、完整青天白日徽或武器。
 */
(function () {
  'use strict';
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO;
  var ART = G.ART = G.ART || {};
  ART.portraits = ART.portraits || {};

  function draw(face) {
    var worried = face === 'worry';
    return GEO.portraitSVG({
      id: 'white_pow',
      face: face,
      frame: 'bust',
      opts: {
        build: 0.97,
        headScale: 1.01,
        cloth: '#6f6858',
        pants: '#5c584b',
        hat: 'cap',
        hatColor: '#625c4d',
        star: false,
        collar: false,
        hair: 'short',
        hairColor: '#2b2520',
        browColor: '#302821',
        eyeColor: '#3a2b22',
        skin: '#b58a68',
        facialHair: 'stubble',
        puttee: false,
        shoe: '#3c342a',
        belt: '#4d4030',
        buckle: '#8b7656',
        coat: true,
        coatLen: 0.11,
        extra: function (c) {
          var hs = 1.01;
          var top = c.Y(-0.985 + (1 - hs) * 0.05);
          var hw = c.H * 0.052 * hs;
          var hh = hw * 2.06;
          var cx = c.X(0);
          var s = '';

          /* 帽徽被扯掉的痕迹：只有一块很淡的浅色布痕和几根短线头，
             不能画成新的徽章。 */
          var bx = cx, by = top + hh * 0.045;
          var bw = c.H * 0.0135, bh = c.H * 0.0062;
          s += GEO.poly([
            [bx - bw, by - bh], [bx + bw * 0.94, by - bh * 0.86],
            [bx + bw * 0.88, by + bh], [bx - bw * 0.92, by + bh * 0.88]
          ], 'rgba(206,195,171,0.24)');
          s += GEO.pline([
            [bx - bw * 0.78, by - bh * 0.30], [bx + bw * 0.74, by - bh * 0.22]
          ], 'rgba(84,75,61,0.42)', { sw: c.H * 0.0022 });
          s += GEO.pline([
            [bx - bw * 0.52, by + bh * 0.42], [bx - bw * 0.20, by + bh * 0.30]
          ], 'rgba(84,75,61,0.40)', { sw: c.H * 0.0018 });
          s += GEO.pline([
            [bx + bw * 0.24, by - bh * 0.46], [bx + bw * 0.56, by - bh * 0.34]
          ], 'rgba(84,75,61,0.40)', { sw: c.H * 0.0018 });

          /* 左胸补丁：旧军装磨破后粗针缝补，避免把俘虏画成整齐的新兵。 */
          var px = c.X(-0.058), py = c.Y(-0.678);
          var pw = c.H * 0.020, ph = c.H * 0.024;
          s += GEO.poly([
            [px - pw, py - ph], [px + pw * 0.82, py - ph * 1.08],
            [px + pw, py + ph * 0.82], [px - pw * 0.88, py + ph]
          ], 'rgba(82,75,61,0.72)', { stroke: 'rgba(55,49,40,0.5)', sw: 0.8 });
          s += GEO.pline([
            [px - pw * 0.74, py - ph * 0.76], [px + pw * 0.64, py - ph * 0.82]
          ], 'rgba(190,177,148,0.42)', { sw: c.H * 0.0022 });

          /* 兜底 SVG 的五官参数差异太小，这里按剧情把表情画实：
             calm 平眉闭嘴，worry 内眉上抬、微张嘴。 */
          var er = hw * 0.19;
          var ex = hw * 0.42;
          var browY = top + hh * 0.330;
          var ink = '#332a22';
          for (var m = -1; m <= 1; m += 2) {
            var xo = cx + m * (ex + er * 1.10);
            var xi = cx + m * (ex - er * 1.10);
            var yo = browY + (worried ? hh * 0.012 : 0);
            var yi = browY + (worried ? -hh * 0.030 : 0);
            s += GEO.pline([[xo, yo], [xi, yi]], ink, { sw: hh * 0.050, cap: 'round' });
          }

          var my = top + hh * 0.845, mw = hw * 0.30;
          if (worried) {
            s += GEO.poly([
              [cx - mw * 0.92, my - hh * 0.010], [cx + mw * 0.92, my - hh * 0.010],
              [cx + mw * 0.66, my + hh * 0.042], [cx - mw * 0.66, my + hh * 0.042]
            ], 'rgba(58,36,30,0.86)');
            s += GEO.pline([[cx - mw * 0.82, my + hh * 0.050], [cx + mw * 0.82, my + hh * 0.050]],
              'rgba(122,72,58,0.72)', { sw: hh * 0.016, cap: 'round' });
          } else {
            s += GEO.pline([[cx - mw * 1.05, my], [cx, my + hh * 0.004], [cx + mw * 1.05, my]], 'rgba(104,62,50,0.92)', { sw: hh * 0.034, cap: 'round' });
          }
          return s;
        }
      }
    });
  }

  ART.portraits.white_pow = { faces: ['calm', 'worry'], draw: draw };
})();


