/* 视觉 QA：把一批 SVG（立绘/背景）拼成一张对比页并用 Edge 无头截图。
 * 用法：node tools/qa-shot.js <outDir> <mode:chars|scene> [args...]
 * 仅开发期使用，不属于游戏运行时。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const GEO = require(path.join(ROOT, 'art', 'geosvg.js'));

const EDGE = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find(p => fs.existsSync(p));

function shot(html, outPng, w, h, virtualMs) {
  const tmpHtml = path.join(ROOT, 'tmp', 'qa.html');
  fs.mkdirSync(path.dirname(tmpHtml), { recursive: true });
  fs.writeFileSync(tmpHtml, html, 'utf8');
  const args = ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=${w},${h}`, `--screenshot=${outPng}`, '--default-background-color=00000000',
    /* 让页面里的 setTimeout / 动画先跑完再截图（用于标题画面、淡入淡出） */
    `--virtual-time-budget=${virtualMs || 1500}`,
    'file:///' + tmpHtml.replace(/\\/g, '/')];
  cp.execFileSync(EDGE, args, { stdio: 'ignore', timeout: 120000 });
  return outPng;
}

module.exports = { shot, EDGE, GEO, ROOT };

if (require.main === module) {
  const outDir = path.resolve(ROOT, process.argv[2] || 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const mode = process.argv[3] || 'chars';
  fs.mkdirSync(path.join(ROOT, 'tmp'), { recursive: true });

  if (mode === 'chars') {
    const ids = (process.argv[4] || '').split(',').filter(Boolean);
    const faces = (process.argv[5] || 'calm,stern').split(',');
    const cells = [];
    ids.forEach(id => faces.forEach(f => {
      const f2 = path.join(ROOT, 'tmp', `${id}_${f}.svg`);
      fs.writeFileSync(f2, GEO.portraitSVG({ id, face: f, opts: JSON.parse(process.env.QOPTS || '{}') }));
      cells.push(`<div style="width:200px;background:#22303f"><div style="font:12px sans-serif;color:#fff">${id}/${f}</div><img src="${id}_${f}.svg" style="width:200px"></div>`);
    }));
    const html = `<body style="margin:0;background:#111;display:flex;flex-wrap:wrap">${cells.join('')}</body>`;
    const png = shot(html, path.join(outDir, 'chars.png'), 1000, 1000);
    console.log(png);
  } else {
    const files = (process.argv[4] || '').split(',').filter(Boolean);
    const cells = files.map(f => `<div style="width:640px"><div style="font:12px sans-serif;color:#fff">${f}</div><img src="file:///${path.join(ROOT, f).replace(/\\/g, '/')}" style="width:640px"></div>`);
    const html = `<body style="margin:0;background:#111;display:flex;flex-wrap:wrap">${cells.join('')}</body>`;
    const png = shot(html, path.join(outDir, 'scenes.png'), 1300, 900);
    console.log(png);
  }
}
