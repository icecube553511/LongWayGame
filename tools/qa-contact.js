#!/usr/bin/env node
/* ============================================================
 * tools/qa-contact.js —— 用「真正的烘焙产物」拼对比图
 *
 * 与 qa-shot.js 的 chars 模式不同：本脚本不调用 GEO.portraitSVG()，
 * 而是直接引用 assets/generated/** 下已经烘焙好的 SVG 文件，
 * 因此反映的是玩家实际看到的画面（设计表 100% 生效）。
 *
 *   node tools/qa-contact.js <outPng> <cellW> <cols> <file...>
 *
 * 每个参数可以是：
 *   chars/mao_calm         → assets/generated/chars/mao_calm.svg
 *   bg/bg_zunyi            → assets/generated/bg/bg_zunyi.svg
 *   assets/generated/xxx.svg → 原样使用
 * 由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
/* 用 shot2.js 而不是 qa-shot.js：qa-shot.js 的 shot() 把页面写死在 tmp/qa.html，
 * 多个 agent 并行出图时会互相覆盖（截出来的图会串）。shot2.js 每次用唯一临时文件。 */
const { shot } = require(path.join(__dirname, 'shot2.js'));

const ROOT = path.resolve(__dirname, '..');
const outPng = path.resolve(ROOT, process.argv[2] || 'tmp/qa/contact.png');
const cellW = parseInt(process.argv[3] || '240', 10);
const cols = parseInt(process.argv[4] || '8', 10);
const items = process.argv.slice(5);

function resolveItem(s) {
  let rel = s;
  if (!/\.svg$/i.test(rel)) rel = rel + '.svg';
  if (!rel.includes('/') && !rel.includes('\\')) rel = 'chars/' + rel;
  return path.join(ROOT, 'assets', 'generated', rel);
}

const cells = items.map((s) => {
  const abs = resolveItem(s);
  const exists = fs.existsSync(abs);
  const url = 'file:///' + abs.replace(/\\/g, '/');
  return `<figure style="margin:0 0 10px 0;width:${cellW}px">` +
    `<figcaption style="font:11px/1.4 ui-monospace,monospace;color:#cfd8e3;word-break:break-all">` +
    `${path.basename(abs)}${exists ? '' : '  ⚠缺失'}</figcaption>` +
    (exists ? `<img src="${url}" style="width:${cellW}px;display:block;background:#1b2430">` : '') +
    `</figure>`;
}).join('');

const rowW = cellW * cols + (cols - 1) * 8;
const html = `<body style="margin:0;background:#0e1319">` +
  `<div style="display:flex;flex-wrap:wrap;gap:8px;padding:8px;width:${rowW}px">${cells}</div></body>`;

const H = Math.max(400, Math.ceil(items.length / cols) * Math.round(cellW * 1.55) + 60);
fs.mkdirSync(path.dirname(outPng), { recursive: true });
shot(html, outPng, rowW, H, 1200);
console.log(outPng + '  (' + items.length + ' 项, ' + rowW + 'x' + H + ')');
