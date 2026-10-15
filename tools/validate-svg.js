#!/usr/bin/env node
/* ============================================================
 * tools/validate-svg.js —— 生成物结构校验（防"静默空白图"）
 *
 *   node tools/validate-svg.js             # 校验 assets/generated 下全部 SVG
 *   node tools/validate-svg.js <目录或文件>
 *
 * 背景：出现过两类会让浏览器整张图渲染失败、但脚本"成功"的故障：
 *   1) 属性值里嵌套了未转义的双引号（font-family="\"Noto Sans CJK SC\",..."）
 *      → XML 解析直接失败，整张 SVG 变空白
 *   2) 数值算出 NaN / undefined → 该图形元素被丢弃，画面缺块
 * 本脚本用严格属性切分 + 标签配平把这两类问题挡在交付前。
 *
 * 注意（2026-10-15）：下面三个字面量检查必须先剔除内嵌 data URI（base64 位图素材）
 * 再匹配。base64 载荷的随机三个字母会凑出 "NaN"（18 张背景里都有群众贴图），
 * 子串匹配会把干净仓库判成 34 个文件失败——一个恒红的守卫等于没有守卫。
 * 由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'assets', 'generated');

function walk(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    fs.readdirSync(p).forEach((f) => walk(path.join(p, f), out));
  } else if (/\.svg$/i.test(p)) out.push(p);
  return out;
}

const VOID = { br: 1, hr: 1, img: 1, meta: 1, link: 1 };

/** 返回该 SVG 的问题数组（空数组 = 通过） */
function checkSVG(src) {
  const problems = [];

  /* 先去掉 XML 声明与注释，避免误判 */
  const clean = src.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  /* 再剔除内嵌 data URI：命中 base64 载荷的子串不是故障（见文件头说明） */
  const bare = clean.replace(/data:[A-Za-z0-9.+-]+\/[A-Za-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, '«B64»');
  if (bare.trim().indexOf('<svg') !== 0) problems.push('文件不以 <svg 开头');
  if (bare.indexOf('NaN') >= 0) problems.push('含 NaN 数值');
  if (bare.indexOf('undefined') >= 0) problems.push('含 undefined');
  if (/\bfill=""/.test(bare)) problems.push('含空 fill=""');

  /* 标签扫描 + 严格属性切分 */
  const tagRe = /<(\/?)([A-Za-z_][-A-Za-z0-9_.:]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const stack = [];
  const covered = [];
  let m;
  while ((m = tagRe.exec(bare)) !== null) {
    covered.push([m.index, tagRe.lastIndex]);
    const closing = m[1] === '/';
    const name = m[2];
    const attrs = m[3];
    const selfClose = /\/\s*$/.test(m[3]);
    if (VOID[name]) continue;

    if (!closing) {
      /* 严格校验属性：把所有合法属性抠掉后，剩余内容只能是空白 */
      let rest = attrs;
      const attrRe = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
      rest = rest.replace(attrRe, ' ').replace(/\/\s*$/, ' ');
      if (rest.trim() !== '') {
        problems.push('<' + name + '> 属性格式非法（可能是值里嵌套了未转义的双引号）：' + rest.trim().slice(0, 60));
      }
      if (!selfClose) stack.push(name);
    } else {
      const open = stack.pop();
      if (open !== name) problems.push('标签不配平：</' + name + '> 对应 <' + (open || '?') + '>');
    }
  }
  if (stack.length) problems.push('未闭合标签：<' + stack.join('>, <') + '>');

  /* 是否有标签被属性扫描漏掉（说明存在无法解析的裸 '<'） */
  const ltCount = (bare.match(/</g) || []).length;
  if (ltCount > covered.length) {
    problems.push('存在无法解析的 < （可能属性值里有裸 < 或未转义的 &）');
  }
  return problems;
}

const files = walk(TARGET, []);
const bad = [];
let total = 0;
files.forEach((f) => {
  const src = fs.readFileSync(f, 'utf8');
  total += src.length;
  const p = checkSVG(src);
  if (p.length) bad.push({ f, p });
});

const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');
console.log('[validate-svg] 检查 ' + files.length + ' 个文件，合计 ' +
  (total / 1024 / 1024).toFixed(1) + ' MB');
if (bad.length) {
  console.error('[validate-svg] ' + bad.length + ' 个文件有问题：');
  bad.slice(0, 30).forEach((b) => {
    console.error('  × ' + rel(b.f));
    [...new Set(b.p)].slice(0, 4).forEach((t) => console.error('      - ' + t));
  });
  process.exit(1);
}
console.log('[validate-svg] 全部通过。');
