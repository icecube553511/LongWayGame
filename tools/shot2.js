#!/usr/bin/env node
/* ============================================================
 * tools/shot2.js —— 无竞态的无头 Edge 截图
 *
 * 与 tools/qa-shot.js 的区别：qa-shot.js 把页面写死在 tmp/qa.html，
 * 两条命令并行跑就会互相覆盖（截出来的图会串）。
 * 本模块每次调用都写一个**唯一临时文件**，因此可以安全并行。
 *
 *   const { shot } = require('./shot2.js');
 *   shot(html, outPng, w, h, virtualMs);
 * 由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TMP = path.join(ROOT, 'tmp');
const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find((p) => fs.existsSync(p));

let seq = 0;

function shot(html, outPng, w, h, virtualMs) {
  if (!EDGE) throw new Error('shot2.js: 找不到 Edge/Chrome 可执行文件');
  fs.mkdirSync(TMP, { recursive: true });
  const tag = `${process.pid}_${Date.now().toString(36)}_${seq++}`;
  const tmpHtml = path.join(TMP, `_shot_${tag}.html`);
  fs.mkdirSync(path.dirname(outPng), { recursive: true });
  fs.writeFileSync(tmpHtml, html, 'utf8');
  const args = ['--headless=new', '--edge-skip-compat-layer-relaunch',
    '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--disable-extensions', '--force-device-scale-factor=1',
    `--window-size=${w},${h}`, `--screenshot=${outPng}`,
    '--default-background-color=00000000',
    `--virtual-time-budget=${virtualMs || 1500}`,
    'file:///' + tmpHtml.replace(/\\/g, '/')];
  try {
    cp.execFileSync(EDGE, args, { stdio: 'ignore', timeout: 180000 });
  } finally {
    try { fs.unlinkSync(tmpHtml); } catch (e) { /* 忽略 */ }
  }
  if (!fs.existsSync(outPng)) throw new Error('shot2.js: 截图未生成 ' + outPng);
  return outPng;
}

module.exports = { shot, EDGE, ROOT, TMP };
