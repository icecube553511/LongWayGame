/* 开发期：把一批已生成的 SVG 拼成对比页并截图，用于目视 QA。
 * 用法：node tools/sheet.js <out.png> <w> <h> <cols> <outDirPrefix> <file1,file2,...>
 * 例如：node tools/sheet.js tmp/sheet.png 1240 1400 2 tmp/bg bg_yudu_night.svg,bg_camp_fire.svg
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { shot } = require('./qa-shot.js');

const [outPng, wArg, hArg, colsArg, dirArg, filesArg] = process.argv.slice(2);
const W = Number(wArg || 1240), H = Number(hArg || 1400), COLS = Number(colsArg || 2);
const dir = path.resolve(dirArg || '.');
const files = String(filesArg || '').split(',').filter(Boolean);
const cw = Math.floor((W - (COLS + 1) * 8) / COLS);

const cells = files.map(f => {
  const abs = path.join(dir, f).replace(/\\/g, '/');
  return '<div style="width:' + cw + 'px;margin:8px">'
    + '<div style="font:11px monospace;color:#7fd">' + f + '</div>'
    + '<img src="file:///' + abs + '" style="width:' + cw + 'px;display:block;border:1px solid #234">'
    + '</div>';
}).join('');

const html = '<body style="margin:0;background:#06080c;display:flex;flex-wrap:wrap">' + cells + '</body>';
console.log(shot(html, path.resolve(outPng), W, H));
