/* 开发期：校验 index.html 引用的脚本是否都存在。 */
'use strict';
const fs = require('fs');
const dom = fs.readFileSync('index.html', 'utf8');
const scripts = [...dom.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]);
let miss = 0;
console.log('scripts in index.html:', scripts.length);
scripts.forEach(s => { const ok = fs.existsSync(s); if (!ok) miss++; console.log((ok ? 'OK   ' : 'MISS ') + s); });
console.log('missing:', miss);
