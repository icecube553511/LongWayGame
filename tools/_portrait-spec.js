#!/usr/bin/env node
/* ============================================================
 * tools/_portrait-spec.js —— 立绘几何自检（SPEC §4.2）
 *
 *   node tools/_portrait-spec.js
 *
 * 按 art/portraits_root.js 的设计表复算每个角色的画布几何，逐项对照
 * docs/SPEC.md §4.2 的硬性规格：
 *   发顶 ≈34 / 下巴 ≈452 / 肩线 ≈500（肩半宽 ≈200）/ 画布 600×900
 *   头宽 ≈300 / 头高 ≈420 / 脸占画布高度 ≥45%
 * check.js 只看文件是否齐备，看不出"头画得太小"这类几何偏差，所以单独留一支工具。
 * 开发期使用，不属于游戏运行时。
 * ============================================================ */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
globalThis.window = globalThis;
require(path.join(ROOT, 'art', 'palette.js'));
require(path.join(ROOT, 'art', 'geosvg.js'));
require(path.join(ROOT, 'art', 'portraits_root.js'));

const CHARS = globalThis.ART.portraitsRoot.CHARS;
/* 各类帽/发的最高点（归一化 v），与 drawCap 里的多边形保持一致 */
const CAPTOP = {
  hairShort: 1.02, hairLong: 1.02, bob: 1.03, buzz: 0.97, receding: 1.01,
  bajiao: 1.08, junguan: 1.06, turban: 1.10, scarf: 1.05, miao: 1.04, none: 1.00
};
const H = 900;
const TOL = {
  crown: [12, 62], chin: [425, 480], shoulder: [470, 540],
  headW: [275, 325], headRatio: 0.45
};
const rows = [];
let bad = 0;
Object.keys(CHARS).forEach((id) => {
  const k = CHARS[id];
  const hw = 268 * k.w, hh = 207 * k.h, cy = 247;
  const capTop = CAPTOP[k.cap] === undefined ? 1.02 : CAPTOP[k.cap];
  const crown = cy - capTop * k.skull * hh;            /* 发顶 / 帽顶 */
  const chin = cy + k.chin * k.low * hh;               /* 下巴 */
  const shoulder = chin + 48;                          /* 肩线 */
  const headW = 2 * 0.56 * hw;                         /* 头宽（头骨最宽处） */
  const headH = (capTop * k.skull + k.chin * k.low) * hh;
  const ratio = headH / H;
  const errs = [];
  if (ratio < TOL.headRatio) errs.push('头高占比 ' + (ratio * 100).toFixed(1) + '% < 45%');
  if (crown < TOL.crown[0] || crown > TOL.crown[1]) errs.push('发顶 ' + crown.toFixed(0) + ' 偏离 34');
  if (chin < TOL.chin[0] || chin > TOL.chin[1]) errs.push('下巴 ' + chin.toFixed(0) + ' 偏离 452');
  if (shoulder < TOL.shoulder[0] || shoulder > TOL.shoulder[1]) errs.push('肩线 ' + shoulder.toFixed(0) + ' 偏离 500');
  if (headW < TOL.headW[0] || headW > TOL.headW[1]) errs.push('头宽 ' + headW.toFixed(0) + ' 偏离 300');
  if (errs.length) bad++;
  rows.push([id, k.cap, crown.toFixed(0), chin.toFixed(0), shoulder.toFixed(0),
    (200 * k.build).toFixed(0), headW.toFixed(0), headH.toFixed(0), (ratio * 100).toFixed(1) + '%',
    errs.join('; ')]);
});
const head = ['角色', '帽型', '发顶', '下巴', '肩线', '肩半宽', '头宽', '头高', '头高占比', '偏差'];
const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i] || '').length)));
console.log(head.map((h, i) => h.padEnd(widths[i])).join('  '));
rows.forEach((r) => console.log(r.map((c, i) => String(c).padEnd(widths[i])).join('  ')));
console.log('\n' + Object.keys(CHARS).length + ' 个角色，' + bad + ' 个超出 SPEC §4.2 容差');
process.exit(bad ? 1 : 0);
