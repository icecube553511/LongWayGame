/* 开发期：只加载指定的 art 模块，把同一批 id 渲染到指定目录，用于 A/B 对比。 */
'use strict';
const fs = require('fs');
const path = require('path');
require('./../art/geosvg.js');
const mod = process.argv[2];
require(path.join(__dirname, '..', mod));
const outDir = path.resolve(process.argv[3] || 'tmp/ab');
const ids = String(process.argv[4] || '').split(',').filter(Boolean);
fs.mkdirSync(outDir, { recursive: true });
ids.forEach(id => {
  const src = globalThis.ART.scenes[id];
  if (typeof src !== 'function') { console.log('MISS ' + id); return; }
  const svg = src();
  fs.writeFileSync(path.join(outDir, id + '.svg'), svg);
  console.log('ok ' + id + ' ' + (svg.length / 1024 | 0) + 'KB');
});
