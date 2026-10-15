#!/usr/bin/env node
/* ============================================================
 * tools/build-art.js —— 把 art/*.js 里的美术定义烘焙成 SVG 文件
 *
 *   node tools/build-art.js               # 构建全部
 *   node tools/build-art.js --chars       # 只构建立绘
 *   node tools/build-art.js --scenes      # 只构建背景与 CG
 *   node tools/build-art.js --ui          # 只构建 UI 装饰
 *   node tools/build-art.js --only mao    # 只构建指定 id
 *
 * 产物（路径由 docs/SPEC.md §4.3 冻结）：
 *   assets/generated/bg/{bgId}.svg                1920×1080
 *   assets/generated/chars/{charId}_{face}.svg    600×900
 *   assets/generated/cg/{cgId}.svg                1920×1080
 *   assets/generated/ui/{name}.svg
 *
 * 只由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'generated');

/* ---------- 1. 在 Node 里加载浏览器端的 art/*.js ---------- */
globalThis.window = globalThis;
require(path.join(ROOT, 'art', 'palette.js'));
const GEO = require(path.join(ROOT, 'art', 'geosvg.js'));
require(path.join(ROOT, 'art', 'portraits.js'));

/* 美术 agent 可以各自提交 art/scenes_*.js / art/cg_*.js / art/ui_*.js / art/portraits_*.js，
 * 这里按文件名自动收编，无需改动本文件。 */
let scenesLoaded = false;
const artDir = path.join(ROOT, 'art');
const isRootArt = (f) => f === 'scenes.js' || f === 'portraits_root.js';
fs.readdirSync(artDir)
  .filter((f) => /^(scenes|cg|ui|portraits)[_A-Za-z0-9-]*\.js$/.test(f))
  /* root 的文件最后加载：同名 id 以 root 的注册为准（避免并发写入互相覆盖） */
  .sort((a, b) => (isRootArt(a) ? 1 : 0) - (isRootArt(b) ? 1 : 0) || a.localeCompare(b))
  .forEach((f) => {
    require(path.join(artDir, f));
    if (/^scenes/.test(f)) scenesLoaded = true;
  });

const ART = globalThis.ART || {};
const BGS = ART.scenes || {};
const CGS = ART.cg || {};
const UI = ART.ui || {};
const PORTRAITS = ART.portraits || {};

/* ---------- 2. 参数 ---------- */
const argv = process.argv.slice(2);
const has = (f) => argv.indexOf(f) >= 0;
const onlyIdx = argv.indexOf('--only');
const only = onlyIdx >= 0 && argv[onlyIdx + 1] ? argv[onlyIdx + 1].split(',') : null;
const allFlag = argv.length === 0 || has('--all');
const mode = {
  chars: has('--chars') || allFlag,
  scenes: has('--scenes') || allFlag,
  ui: has('--ui') || allFlag
};

/* ---------- 3. 写入 ---------- */
function write(rel, svg) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, svg, 'utf8');
  return svg.length;
}
function human(bytes) {
  return bytes > 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + 'MB' : Math.round(bytes / 1024) + 'KB';
}
function want(id) {
  return !only || only.indexOf(id) >= 0;
}

/* ---------- CG 兜底：把背景升级成"全屏插画" ---------- */
let vigSeq = 0;
function gradeCG(svg, id) {
  const cut = svg.lastIndexOf('</svg>');
  if (cut < 0) return svg;
  const w = 1920, h = 1080;
  const vid = 'cgvig' + (++vigSeq);
  /* 插画化的"画框"处理：电影黑边 + 更强的暗角 + 暖调 + 内嵌细金线 + 四角框标。
     目的：让 cg/ 与 bg/ 在屏幕上**一眼就能分开**——此前两者只差一层很淡的暗角，
     并排看几乎一样，玩家根本感觉不到"这里进了一张全屏插画"。
     全部是平面几何块面，符合 docs/ART_DIRECTION.md 的红线。—— 由 root 加强 */
  const GOLD = '#d7b148';
  const BAR = 84;              /* 上下黑边高度 */
  const INSET = 34;            /* 内框距画布边缘 */
  const MARK = 78;             /* 四角框标臂长 */
  const defs =
    '<radialGradient id="' + vid + '" cx="50%" cy="46%" r="78%">' +
    '<stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="0.5" stop-color="#000" stop-opacity="0.14"/>' +
    '<stop offset="1" stop-color="#000" stop-opacity="0.74"/></radialGradient>';
  /* 四个角的直角框标（左上的角标用两条臂拼出来） */
  function corner(x, y, sx, sy) {
    return GEO.poly([[x, y], [x + sx * MARK, y], [x + sx * MARK, y + sy * 3], [x + sx * 3, y + sy * 3],
      [x + sx * 3, y + sy * MARK], [x, y + sy * MARK]], GOLD, { opacity: 0.34 });
  }
  const extra =
    defs +
    GEO.poly([[0, 0], [w, 0], [w, BAR], [0, BAR]], '#05070a', {}) +
    GEO.poly([[0, h - BAR], [w, h - BAR], [w, h], [0, h]], '#05070a', {}) +
    GEO.rect(0, 0, w, h, '#2a1f14', { opacity: 0.12 }) +
    GEO.rect(0, 0, w, h, '#0b1017', { opacity: 0.10 }) +
    GEO.rect(0, 0, w, h, 'url(#' + vid + ')') +
    /* 黑边内侧的细金线 */
    GEO.rect(0, BAR, w, 2.4, GOLD, { opacity: 0.42 }) +
    GEO.rect(0, h - BAR - 2.4, w, 2.4, GOLD, { opacity: 0.42 }) +
    /* 内嵌画框（细金线）+ 四角框标 */
    GEO.rect(INSET, BAR + 26, w - INSET * 2, 2, GOLD, { opacity: 0.22 }) +
    GEO.rect(INSET, h - BAR - 28, w - INSET * 2, 2, GOLD, { opacity: 0.22 }) +
    GEO.rect(INSET, BAR + 26, 2, h - BAR * 2 - 54, GOLD, { opacity: 0.22 }) +
    GEO.rect(w - INSET - 2, BAR + 26, 2, h - BAR * 2 - 54, GOLD, { opacity: 0.22 }) +
    corner(INSET + 16, BAR + 44, 1, 1) +
    corner(w - INSET - 16, BAR + 44, -1, 1) +
    corner(INSET + 16, h - BAR - 44, 1, -1) +
    corner(w - INSET - 16, h - BAR - 44, -1, -1) +
    GEO.poly([[0, h * 0.5 - 210], [w * 0.34, h * 0.5 - 260], [w * 0.30, h * 0.5 - 150], [0, h * 0.5 - 110]], GEO.alpha('#f0e0bc', 0.07), {});
  return svg.slice(0, cut) + extra + svg.slice(cut);
}

const report = { chars: 0, bg: 0, cg: 0, ui: 0, errors: [], bytes: 0 };

/* ---------- 4. 立绘 ---------- */
if (mode.chars) {
  const ids = Object.keys(PORTRAITS);
  if (!ids.length) report.errors.push('art/portraits.js 未注册任何 ART.portraits');
  ids.forEach((id) => {
    if (!want(id)) return;
    const spec = PORTRAITS[id];
    const faces = spec.faces || GEO.FACES;
    faces.forEach((face) => {
      try {
        const svg = spec.draw(face);
        if (!svg || svg.indexOf('<svg') !== 0) {
          report.errors.push(id + '/' + face + ': draw() 未返回 SVG 文档');
          return;
        }
        report.bytes += write(path.join('chars', id + '_' + face + '.svg'), svg);
        report.chars++;
      } catch (e) {
        report.errors.push(id + '/' + face + ': ' + e.message);
      }
    });
  });
}

/* ---------- 5. 背景与 CG ---------- */
if (mode.scenes) {
  if (!scenesLoaded) report.errors.push('缺少 art/scenes.js（背景未注册）');
  Object.keys(BGS).forEach((id) => {
    if (!want(id)) return;
    try {
      const v = BGS[id];
      const svg = typeof v === 'function' ? v({ cg: false }) : v;
      report.bytes += write(path.join('bg', id + '.svg'), svg);
      report.bg++;
    } catch (e) {
      report.errors.push('bg/' + id + ': ' + e.message);
    }
  });
  const cgIds = Object.keys(CGS).slice();
  Object.keys(BGS).forEach((id) => { if (cgIds.indexOf(id) < 0) cgIds.push(id); });
  cgIds.forEach((id) => {
    if (!want(id)) return;
    try {
      let svg;
      if (typeof CGS[id] === 'function') svg = CGS[id]({ cg: true });
      else if (typeof CGS[id] === 'string') svg = CGS[id];
      else {
        /* 兜底：同 id 背景的加强版（加深对比 + 暗角 + 上下压边） */
        const v = BGS[id];
        if (v === undefined) return;
        const base = typeof v === 'function' ? v({ cg: true }) : v;
        svg = gradeCG(base, id);
      }
      report.bytes += write(path.join('cg', id + '.svg'), svg);
      report.cg++;
    } catch (e) {
      report.errors.push('cg/' + id + ': ' + e.message);
    }
  });
}

/* ---------- 6. UI 装饰 ---------- */
if (mode.ui) {
  Object.keys(UI).forEach((name) => {
    if (!want(name)) return;
    try {
      const v = UI[name];
      const svg = typeof v === 'function' ? v({}) : v;
      report.bytes += write(path.join('ui', name + '.svg'), svg);
      report.ui++;
    } catch (e) {
      report.errors.push('ui/' + name + ': ' + e.message);
    }
  });
}

/* ---------- 7. 报告 ---------- */
console.log('[build-art] chars=' + report.chars + '  bg=' + report.bg + '  cg=' + report.cg +
  '  ui=' + report.ui + '  体积=' + human(report.bytes) + (only ? '  (--only ' + only.join(',') + ')' : ''));
if (report.errors.length) {
  console.error('[build-art] ' + report.errors.length + ' 个错误：');
  report.errors.slice(0, 40).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
if (report.chars === 0 && report.bg === 0 && report.cg === 0 && report.ui === 0) {
  console.error('[build-art] 没有产出任何文件。');
  process.exit(1);
}
