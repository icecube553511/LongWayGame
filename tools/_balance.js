/* 开发期小工具：扫描 JS 文件的括号平衡，定位第一个不平衡的行。 */
'use strict';
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
let d = 0, line = 1, inStr = null, inC = false, inR = false;
for (let i = 0; i < src.length; i++) {
  const c = src[i], nx = src[i + 1];
  if (inR) { if (c === '\n') { inR = false; line++; } continue; }
  if (inC) { if (c === '*' && nx === '/') { inC = false; i++; } continue; }
  if (inStr) {
    if (c === '\\') { i++; continue; }
    if (c === inStr) inStr = null;
    if (c === '\n') line++;
    continue;
  }
  if (c === '\n') { line++; continue; }
  if (c === '/' && nx === '/') { inR = true; i++; continue; }
  if (c === '/' && nx === '*') { inC = true; i++; continue; }
  if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
  if (c === '(' || c === '[' || c === '{') d++;
  if (c === ')' || c === ']' || c === '}') { d--; if (d < 0) { console.log('NEGATIVE depth at line', line); process.exit(0); } }
}
console.log('final depth =', d);
/* 逐行深度（用于定位未闭合的调用） */
let dd = 0, ln = 1, s2 = null, c2 = false, r2 = false;
const out = [];
for (let i = 0; i < src.length; i++) {
  const c = src[i], nx = src[i + 1];
  const eol = () => { out.push(ln + ':' + dd); ln++; };
  if (r2) { if (c === '\n') { r2 = false; eol(); } continue; }
  if (c2) { if (c === '*' && nx === '/') { c2 = false; i++; } continue; }
  if (s2) { if (c === '\\') { i++; continue; } if (c === s2) s2 = null; if (c === '\n') eol(); continue; }
  if (c === '\n') { eol(); continue; }
  if (c === '/' && nx === '/') { r2 = true; i++; continue; }
  if (c === '/' && nx === '*') { c2 = true; i++; continue; }
  if (c === "'" || c === '"' || c === '`') { s2 = c; continue; }
  if (c === '(' || c === '[' || c === '{') dd++;
  if (c === ')' || c === ']' || c === '}') dd--;
}
const lo = Number(process.argv[3] || 0), hi = Number(process.argv[4] || out.length);
console.log(out.slice(lo, hi).join('  '));
