/* 开发期：列出各 art 文件注册了哪些 id，用于排查重复/冲突。 */
'use strict';
const fs = require('fs');
require('./../art/geosvg.js');
const re = /ART\.(scenes|cg|portraits|ui)\[\s*['"]([A-Za-z0-9_]+)['"]\s*\]/g;
['scenes.js', 'portraits_root.js', 'ui.js', 'portraits.js', 'scenes_jiang.js', 'scenes_river.js', 'scenes_meeting.js', 'scenes_north.js'].forEach(f => {
  const p = 'art/' + f;
  if (!fs.existsSync(p)) return;
  const src = fs.readFileSync(p, 'utf8');
  const ids = [...src.matchAll(re)].map(m => m[1] + ':' + m[2]);
  console.log('--- ' + p + '  ' + (src.length / 1024 | 0) + 'KB  regs=' + ids.length);
  console.log(ids.join(' '));
});
