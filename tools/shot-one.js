#!/usr/bin/env node
/* 单图放大截图：把一张 SVG 按 1920×1080 渲染成 PNG，便于肉眼验收。
 *
 *   node tools/shot-one.js assets/generated/bg/bg_zunyi.svg
 *   node tools/shot-one.js assets/generated/chars/mao_calm.svg 600 900
 */
'use strict';
const fs = require('fs');
const path = require('path');
const qa = require(path.join(__dirname, 'qa-shot.js'));

const rel = process.argv[2];
if (!rel) {
  console.error('用法: node tools/shot-one.js <svg路径> [宽] [高]');
  console.error('      node tools/shot-one.js --sheet <目录> <通配前缀> [列数] [单元格宽]');
  process.exit(1);
}

/* 整页截图：直接对一个 html 文件（如 index.html）截图，用于端到端冒烟测试 */
if (rel === '--page') {
  const page = path.join(qa.ROOT, process.argv[3]);
  const w = parseInt(process.argv[4] || '1920', 10);
  const h = parseInt(process.argv[5] || '1080', 10);
  const out = path.join(qa.ROOT, 'tmp', 'page_' + path.basename(page, '.html') + '.png');
  const vm = parseInt(process.argv[6] || '4000', 10);
  qa.shot('<body style="margin:0"><iframe src="file:///' + page.replace(/\\/g, '/') +
    '" style="border:0;width:' + w + 'px;height:' + h + 'px"></iframe></body>', out, w, h, vm);
  console.log(out);
  process.exit(0);
}

/* 拼版模式：把一组 SVG 排成一张对比图（人物辨识度 / 表情差异的自检手段） */
if (rel === '--sheet') {
  const dir = path.join(qa.ROOT, process.argv[3]);
  const prefix = process.argv[4] || '';
  const cols = parseInt(process.argv[5] || '7', 10);
  const cw = parseInt(process.argv[6] || '190', 10);
  const ch = Math.round(cw * 1.5);
  const list = prefix.indexOf(',') >= 0 ? prefix.split(',') : null;
  const match = list
    ? (f) => list.indexOf(f) >= 0 || list.indexOf(f.replace('.svg', '')) >= 0
    : (prefix.charAt(0) === '*'
      ? (f) => f.slice(0, -4).endsWith(prefix.slice(1))
      : (f) => f.indexOf(prefix) === 0);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg') && match(f)).sort();
  const cells = files.map((f) => {
    const url = 'file:///' + path.join(dir, f).replace(/\\/g, '/');
    return '<div style="width:' + cw + 'px;background:#1b2430">' +
      '<img src="' + url + '" style="display:block;width:' + cw + 'px;height:' + ch + 'px">' +
      '<div style="font:11px sans-serif;color:#9fb0c0;padding:1px 3px">' + f.replace('.svg', '') + '</div></div>';
  });
  const rows = Math.ceil(files.length / cols);
  const html = '<body style="margin:0;background:#0d1218;display:flex;flex-wrap:wrap;width:' +
    (cols * cw) + 'px">' + cells.join('') + '</body>';
  const safe = (prefix || 'all').replace(/[^A-Za-z0-9_-]/g, '_');
  const out = path.join(qa.ROOT, 'tmp', 'sheet_' + safe + '.png');
  qa.shot(html, out, cols * cw, rows * (ch + 16) + 8);
  console.log(out + '  (' + files.length + ' 张，' + cols + ' 列)');
  process.exit(0);
}
const w = parseInt(process.argv[3] || '1920', 10);
const h = parseInt(process.argv[4] || '1080', 10);
const abs = path.isAbsolute(rel) ? rel : path.join(qa.ROOT, rel);
const url = 'file:///' + abs.replace(/\\/g, '/');
const out = path.join(qa.ROOT, 'tmp', 'one_' + path.basename(rel, '.svg') + '.png');
const html = '<body style="margin:0;background:#101820"><img src="' + url +
  '" style="display:block;width:' + w + 'px;height:' + h + 'px"></body>';
qa.shot(html, out, w, h);
console.log(out);
