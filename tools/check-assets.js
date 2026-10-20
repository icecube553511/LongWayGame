#!/usr/bin/env node
/* ==========================================================================
 * tools/check-assets.js —— 「制作规范」的可执行检查
 *
 *   node tools/check-assets.js
 *
 * 规范写在 docs/PRODUCTION_SPEC.md 与 AGENTS.md 里；本脚本只把其中**最容易违反、
 * 又完全能用机器判定**的几条挑出来跑：
 *
 *   1. 规范文件本身要在、且互相被引用（否则新 agent 读不到 = 规范白写）
 *   2. 群众印章池：关键姿态的变体数量够不够（不能只有 2 张却并排站 4 个人）
 *   3. 印章不许重复登记（同一张 base64 出现两次 = 换了名字的复制人）
 *
 * 退出码：0 = 通过；1 = 有错误。
 * 文件所有权：root。
 *
 * 为什么单独一个文件而不是塞进 check.js：多个 agent 并行工作时，共用文件谁后写谁赢；
 * 规范的检查不该参与那种竞争。
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

/* ---------- 1. 规范文件与交叉引用 ---------- */
const DOCS = ['AGENTS.md', 'docs/PRODUCTION_SPEC.md', 'docs/SPEC.md', 'docs/ART_DIRECTION.md',
  'docs/CG_DESIGN.md', 'docs/BG_DESIGN.md', 'docs/AGENT_BRIEF.md'];
DOCS.forEach((d) => { if (!fs.existsSync(path.join(ROOT, d))) err('规范文件缺失：' + d); });

/* 剧情造型这条产线的四个关键文件：清单、编译、生成、运行时表。
 * 缺任何一个，都存在“清单写了但没人生成/引擎看不到”的假完成风险。 */
const PORTRAIT_FILES = [
  'docs/reviews/char-progression-spec.json',
  'src/data/portraitStates.js',
  'tools/build-portrait-states.js',
  'tools/neko-states.js',
  'tools/neko-post.py',
  'tools/check-portrait-key.py',
  'tools/qc-portraits.py',
  'tools/apply-alpha.py',
  'tools/make-expression-mask.py'
];
PORTRAIT_FILES.forEach((f) => { if (!fs.existsSync(path.join(ROOT, f))) err('剧情造型产线文件缺失：' + f); });

/* 入口文件必须指向总纲，否则"新 agent 会读到"这句话不成立 */
const REFS = [
  ['AGENTS.md', 'PRODUCTION_SPEC.md'],
  ['README.md', 'PRODUCTION_SPEC.md'],
  ['docs/AGENT_BRIEF.md', 'PRODUCTION_SPEC.md'],
  ['docs/AGENT_WORKFLOW.md', 'PRODUCTION_SPEC.md'],
  ['docs/SPEC.md', 'PRODUCTION_SPEC.md'],
  ['docs/STORY_BRIEF.md', 'PRODUCTION_SPEC.md']
];
REFS.forEach(([file, needle]) => {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) { err('交叉引用检查：文件不存在 ' + file); return; }
  if (fs.readFileSync(p, 'utf8').indexOf(needle) < 0) err(file + ' 没有指向 ' + needle + '（新 agent 读不到规范）');
});

/* ---------- 2/3. 群众印章池 ---------- */
/* 关键姿态的最低变体数。
 *   carry 4 = 担架队一景里并排四个人，池子不够就一定出现复制人（用户 2026-10-16 反馈的原案）。
 *   其余按"一排群众里不该有明显重复"的最小值给。 */
const MIN_VARIANTS = { carry: 4, march: 3, stand: 3, peasant: 3, sit: 2, bayonet: 2 };

/* 允许指向别的文件只为自测（构造"印章重复/变体不足"的样本验证本脚本会红）；
   正常跑不设这个环境变量。 */
const stampsPath = process.env.CROWD_STAMPS_PATH || path.join(ROOT, 'art', 'ui_00_crowd_stamps.js');
let stampsTable = null;
if (!fs.existsSync(stampsPath)) {
  err('缺少 art/ui_00_crowd_stamps.js（群众印章未烘焙：python tools/neko-crowd-post.py）');
} else {
  const m = /var S = (\{[\s\S]*?\});\s*\n/.exec(fs.readFileSync(stampsPath, 'utf8'));
  if (!m) err('art/ui_00_crowd_stamps.js 结构异常：读不到 var S = {...}');
  else {
    try { stampsTable = JSON.parse(m[1]); } catch (e) { err('art/ui_00_crowd_stamps.js 解析失败：' + e.message); }
  }
}

const stampReport = [];
if (stampsTable) {
  const names = Object.keys(stampsTable);
  const byPose = {};
  names.forEach((n) => {
    const pose = n.replace(/_\d+$/, '');
    (byPose[pose] = byPose[pose] || []).push(n);
  });
  Object.keys(byPose).sort().forEach((pose) => {
    const list = byPose[pose].sort();
    const need = MIN_VARIANTS[pose];
    stampReport.push(pose + ' ' + list.length + (need ? '/' + need : ''));
    if (need && list.length < need) {
      err('印章变体不足：' + pose + ' 只有 ' + list.length + ' 张，规范要求 ≥ ' + need +
        '（一排人必然出现复制人；改 tools/neko-crowd.js 的 POSES.n 后重新出图并烘焙）');
    }
  });
  /* 重复登记：同一张图（n 档 base64 相同）出现两次 —— 换个名字的"复制人" */
  const seen = {};
  names.forEach((n) => {
    const key = (stampsTable[n].n || '').slice(0, 4000);
    if (!key) return;
    if (seen[key]) err('印章重复登记：' + n + ' 与 ' + seen[key] + ' 是同一张图（换上不同变体再烘焙）');
    else seen[key] = n;
  });
}

/* ---------- 输出 ---------- */
console.log('\n=== 制作规范检查 ===');
console.log('规范文件 ' + DOCS.length + ' 份：' + (errors.length ? '见下方' : '齐全'));
console.log('剧情造型产线 ' + PORTRAIT_FILES.length + ' 份：' + (errors.length ? '见下方' : '齐全'));
console.log('交叉引用 ' + REFS.length + ' 处');
if (stampReport.length) console.log('群众印章 ' + Object.keys(stampsTable).length + ' 张（姿态/要求）：' + stampReport.join('  '));

if (warns.length) { console.log('\n--- 警告 (' + warns.length + ') ---'); warns.forEach((w) => console.log('  · ' + w)); }
if (errors.length) {
  console.log('\n--- 错误 (' + errors.length + ') ---');
  errors.forEach((e) => console.log('  × ' + e));
  console.log('\n规范检查未通过。');
  process.exit(1);
}
console.log('\n规范检查通过。');
