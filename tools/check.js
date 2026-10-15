#!/usr/bin/env node
/* ==========================================================================
 * 《长征·万水千山》交付验收检查器
 *   node tools/check.js            # 全量检查
 *   node tools/check.js --assets   # 额外检查 assets/generated 下的实际文件
 * 退出码：0 = 通过；1 = 有错误。
 * 文件所有权：root。
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

/* ---------------- 契约常量（与 docs/SPEC.md 一致） ---------------- */
const CHAPTERS = [
  ['ch01', 1, '于都河畔'], ['ch02', 2, '突破封锁线'], ['ch03', 3, '湘江血战'], ['ch04', 4, '通道转兵'],
  ['ch05', 5, '黎平会议'], ['ch06', 6, '猴场跨年'], ['ch07', 7, '遵义会议'], ['ch08', 8, '一渡赤水'],
  ['ch09', 9, '扎西整编·二渡赤水'], ['ch10', 10, '娄山关大捷'], ['ch11', 11, '三渡·四渡赤水'], ['ch12', 12, '巧渡金沙江'],
  ['ch13', 13, '彝海结盟'], ['ch14', 14, '强渡大渡河'], ['ch15', 15, '飞夺泸定桥'], ['ch16', 16, '翻越夹金山'],
  ['ch17', 17, '懋功会师与草地'], ['ch18', 18, '激战腊子口'], ['ch19', 19, '吴起镇·落脚陕北'], ['ch20', 20, '会宁大会师']
];

const WHO = [
  'mao', 'zhou', 'zhu', 'zhang_wentian', 'wang_jiaxiang', 'bogu', 'lide', 'peng', 'lin', 'nie',
  'liu_bocheng', 'chen_yun', 'he_zizhen', 'deng_yingchao', 'xu_teli', 'dong_biwu', 'lin_boqu',
  'xie_juezai', 'ye_jianying', 'zhang_guotao', 'xu_xiangqian', 'li_xiannian', 'xiao_yedan',
  'xiaoman', 'li_tiezhu', 'he_xiaomei', 'guo_daniang', 'shi_zhu', 'a_yue', 'wu_laoliu', 'san_wa',
  'soldiers', 'villagers', 'yi_people', 'narrator'
];

const FACES = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];

const BGS = [
  'bg_yudu_night', 'bg_yudu_village', 'bg_mountain_pass', 'bg_blockade', 'bg_xiangjiang_day',
  'bg_xiangjiang_night', 'bg_council_hall', 'bg_tongdao', 'bg_liping', 'bg_houchang',
  'bg_zunyi', 'bg_chishui', 'bg_tucheng', 'bg_loushanguan', 'bg_jinsha',
  'bg_yihai', 'bg_dadu', 'bg_luding', 'bg_snow_mountain', 'bg_maogong',
  'bg_grassland', 'bg_lazikou', 'bg_hadapu', 'bg_wuqi', 'bg_huining',
  'bg_yanan_cave', 'bg_rain_march', 'bg_camp_fire', 'bg_map_table', 'bg_stretcher'
];

const STEP_TYPES = ['bg', 'show', 'hide', 'clear', 'say', 'narr', 'think', 'title', 'fx', 'cg',
  'choice', 'set', 'if', 'label', 'goto', 'sfx', 'bgm', 'wait', 'unlock', 'end', 'note'];
const FX_KINDS = ['flash', 'shake', 'fadeout', 'fadein', 'snow', 'rain', 'ash', 'blood', 'star'];
const SLOTS = ['left', 'center', 'right'];
const OPS = ['=', '!=', '>', '>=', '<', '<='];
const SET_OPS = ['=', '+=', '-=', 'max', 'min'];
const BUILTIN_VARS = ['morale', 'trust', 'hope'];

const MIN = { steps: 90, hanzi: 3000, choice: 2, archive: 3 };

/* ---------------- 结果收集 ---------------- */
const errors = [];
const warns = [];
function err(file, msg) { errors.push({ file, msg }); }
function warn(file, msg) { warns.push({ file, msg }); }

/* ---------------- 载入章节 ---------------- */
function loadChapter(id) {
  const file = path.join(ROOT, 'src', 'story', id + '.js');
  if (!fs.existsSync(file)) { err('src/story/' + id + '.js', '文件不存在'); return null; }
  const sandbox = { window: {}, console };
  sandbox.window.window = sandbox.window;
  try {
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file, timeout: 15000 });
  } catch (e) {
    err('src/story/' + id + '.js', '执行失败：' + e.message);
    return null;
  }
  const ch = sandbox.window.STORY && sandbox.window.STORY[id];
  if (!ch) { err('src/story/' + id + '.js', '未注册 window.STORY.' + id); return null; }
  return ch;
}

/* ---------------- 步进校验 ---------------- */
function hanzi(s) {
  const m = String(s || '').match(/[\u4e00-\u9fa5]/g);
  return m ? m.length : 0;
}

function checkCond(cond, file, ctx) {
  if (!cond || typeof cond !== 'object') { err(file, ctx + ' 条件为空或非对象'); return; }
  if (cond.all || cond.any) {
    const list = cond.all || cond.any;
    if (!Array.isArray(list) || !list.length) { err(file, ctx + ' all/any 必须是非空数组'); return; }
    list.forEach((c, i) => checkCond(c, file, ctx + '.all[' + i + ']'));
    return;
  }
  if (cond.not) { checkCond(cond.not, file, ctx + '.not'); return; }
  if (typeof cond.var !== 'string') { err(file, ctx + ' 缺少 var'); return; }
  if (OPS.indexOf(cond.op) < 0) { err(file, ctx + ' 非法 op: ' + cond.op); }
  if (cond.value === undefined) { err(file, ctx + ' 缺少 value'); }
}

function walk(steps, file, ctx, stats, labels, gotos) {
  if (!Array.isArray(steps)) { err(file, ctx + ' 不是数组'); return; }
  steps.forEach((s, i) => {
    const w = ctx + '[' + i + ']';
    if (!s || typeof s !== 'object') { err(file, w + ' 不是对象'); return; }
    stats.steps++;
    if (typeof s.t !== 'string') { err(file, w + ' 缺少 t'); return; }
    if (STEP_TYPES.indexOf(s.t) < 0) { err(file, w + ' 未知 step 类型：' + s.t); return; }

    switch (s.t) {
      case 'bg':
        if (BGS.indexOf(s.id) < 0) err(file, w + ' 未知背景 id：' + s.id);
        stats.bgs.add(s.id); break;
      case 'cg':
        if (BGS.indexOf(s.id) < 0) err(file, w + ' cg 必须是背景表中的 id：' + s.id);
        stats.cgs.add(s.id); break;
      case 'show':
        if (WHO.indexOf(s.who) < 0) err(file, w + ' 未知人物 id：' + s.who);
        if (s.face && FACES.indexOf(s.face) < 0) err(file, w + ' 未知表情：' + s.face);
        if (s.slot && SLOTS.indexOf(s.slot) < 0) err(file, w + ' 未知 slot：' + s.slot);
        stats.who.add(s.who); break;
      case 'hide':
        if (WHO.indexOf(s.who) < 0) err(file, w + ' 未知人物 id：' + s.who); break;
      case 'say':
        if (WHO.indexOf(s.who) < 0) err(file, w + ' 未知人物 id：' + s.who);
        if (s.face && FACES.indexOf(s.face) < 0) err(file, w + ' 未知表情：' + s.face);
        if (!s.text) err(file, w + ' say 缺少 text');
        stats.who.add(s.who); stats.hanzi += hanzi(s.text); break;
      case 'think':
        if (WHO.indexOf(s.who) < 0) err(file, w + ' 未知人物 id：' + s.who);
        if (!s.text) err(file, w + ' think 缺少 text');
        stats.hanzi += hanzi(s.text); break;
      case 'narr':
      case 'note':
        if (!s.text) err(file, w + ' ' + s.t + ' 缺少 text');
        stats.hanzi += hanzi(s.text); break;
      case 'title':
        if (!s.text) err(file, w + ' title 缺少 text'); break;
      case 'fx':
        if (FX_KINDS.indexOf(s.kind) < 0) err(file, w + ' 未知特效：' + s.kind);
        stats.fx++; break;
      case 'label':
        if (!s.name) err(file, w + ' label 缺少 name');
        else if (labels.has(s.name)) err(file, w + ' label 重名：' + s.name);
        else labels.add(s.name);
        break;
      case 'goto':
        if (!s.target) err(file, w + ' goto 缺少 target');
        else gotos.push({ target: s.target, where: w });
        break;
      case 'set':
        if (typeof s.var !== 'string') err(file, w + ' set 缺少 var');
        else if (SET_OPS.indexOf(s.op) < 0) err(file, w + ' 非法 set op：' + s.op);
        if (s.value === undefined) err(file, w + ' set 缺少 value');
        break;
      case 'if':
        checkCond(s.cond, file, w + '.cond');
        walk(s.then, file, w + '.then', stats, labels, gotos);
        if (s.else) walk(s.else, file, w + '.else', stats, labels, gotos);
        break;
      case 'choice': {
        stats.choice++;
        if (!Array.isArray(s.options) || s.options.length < 2) { err(file, w + ' choice 至少 2 个选项'); break; }
        s.options.forEach((o, j) => {
          const ow = w + '.options[' + j + ']';
          if (!o || !o.text) err(file, ow + ' 缺少 text');
          if (o.set && !Array.isArray(o.set)) err(file, ow + '.set 必须是数组');
          else if (o.set) o.set.forEach((x, k) => {
            if (typeof x.var !== 'string') err(file, ow + '.set[' + k + '] 缺少 var');
            else if (SET_OPS.indexOf(x.op) < 0) err(file, ow + '.set[' + k + '] 非法 op：' + x.op);
          });
          if (o.goto) gotos.push({ target: o.goto, where: ow + '.goto' });
          if (o.record) stats.records.add(o.record);
        });
        break;
      }
      case 'unlock':
        if (['char', 'archive', 'cg'].indexOf(s.kind) < 0) err(file, w + ' unlock.kind 非法：' + s.kind);
        break;
      case 'bgm':
        if (!s.stop && !s.id) err(file, w + ' bgm 需要 id 或 stop:true'); break;
      case 'sfx':
        if (!s.id) err(file, w + ' sfx 缺少 id'); break;
      case 'end':
        stats.end++; break;
    }
  });
}

/* ---------------- 主流程 ---------------- */
const report = [];
const allBgs = new Set();
const allWho = new Set();

CHAPTERS.forEach(([id, num, title]) => {
  const ch = loadChapter(id);
  if (!ch) return;
  const file = 'src/story/' + id + '.js';

  if (ch.num !== num) err(file, 'num 应为 ' + num + '，实际 ' + ch.num);
  if (ch.id !== id) err(file, 'id 应为 ' + id + '，实际 ' + ch.id);
  if (ch.title !== title) warn(file, '标题为「' + ch.title + '」，期望「' + title + '」');
  if (!ch.date) err(file, '缺少 date');
  if (!ch.place) err(file, '缺少 place');

  const stats = { steps: 0, hanzi: 0, choice: 0, fx: 0, end: 0, bgs: new Set(), cgs: new Set(), who: new Set(), records: new Set() };
  const labels = new Set();
  const gotos = [];
  walk(ch.steps, file, 'steps', stats, labels, gotos);

  gotos.forEach(g => { if (!labels.has(g.target)) err(file, g.where + ' 跳转到不存在的 label：' + g.target); });

  const archive = Array.isArray(ch.archive) ? ch.archive : [];
  if (archive.length < MIN.archive) warn(file, 'archive 只有 ' + archive.length + ' 条（要求 ≥ ' + MIN.archive + '）');
  archive.forEach((a, i) => {
    if (!a.id || !a.title || !a.text) err(file, 'archive[' + i + '] 缺少 id/title/text');
  });
  if (stats.steps < MIN.steps) warn(file, 'steps 只有 ' + stats.steps + '（要求 ≥ ' + MIN.steps + '）');
  if (stats.hanzi < MIN.hanzi) warn(file, '正文字数 ' + stats.hanzi + '（要求 ≥ ' + MIN.hanzi + '）');
  if (stats.choice < MIN.choice) warn(file, 'choice 只有 ' + stats.choice + '（要求 ≥ ' + MIN.choice + '）');
  if (stats.end === 0) warn(file, '没有 end 步骤');

  stats.bgs.forEach(b => allBgs.add(b));
  stats.who.forEach(w => allWho.add(w));
  report.push({
    id, title, steps: stats.steps, hanzi: stats.hanzi, choice: stats.choice,
    fx: stats.fx, archive: archive.length, bgs: stats.bgs.size, who: stats.who.size,
    cg: stats.cgs.size, end: stats.end
  });
});

/* ---------------- 资源检查 ---------------- */
const ASSET_BG = path.join(ROOT, 'assets', 'generated', 'bg');
const ASSET_CH = path.join(ROOT, 'assets', 'generated', 'chars');
const CH_EXTS = ['.png', '.svg'];   /* 立绘优先位图（NekoGptImage），回退矢量 */
function listSvg(dir) {
  try {
    return new Set(fs.readdirSync(dir)
      .filter(f => CH_EXTS.some(e => f.endsWith(e)))
      .map(f => path.basename(f, path.extname(f))));
  }
  catch (e) { return null; }
}
const haveBg = listSvg(ASSET_BG);
const haveCh = listSvg(ASSET_CH);
const assetReport = { bg: 0, bgWant: BGS.length, chars: 0, charsWant: WHO.length * FACES.length, missingBg: [], missingChars: [] };

if (!haveBg) { err('assets/generated/bg', '目录不存在'); }
else {
  BGS.forEach(b => { if (haveBg.has(b)) assetReport.bg++; else assetReport.missingBg.push(b); });
}
if (!haveCh) { err('assets/generated/chars', '目录不存在'); }
else {
  WHO.forEach(w => {
    FACES.forEach(f => {
      if (haveCh.has(w + '_' + f)) assetReport.chars++;
      else assetReport.missingChars.push(w + '_' + f);
    });
  });
}

/* ---------------- 输出 ---------------- */
function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
function padL(s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; }

console.log('\n=== 剧本统计 ===');
console.log(pad('章节', 8) + pad('标题', 18) + padL('steps', 7) + padL('汉字', 7) +
  padL('选项', 6) + padL('特效', 6) + padL('档案', 6) + padL('背景', 6) + padL('人物', 6) + padL('CG', 5));
let T = { steps: 0, hanzi: 0, choice: 0, archive: 0 };
report.forEach(r => {
  T.steps += r.steps; T.hanzi += r.hanzi; T.choice += r.choice; T.archive += r.archive;
  console.log(pad(r.id, 8) + pad(r.title, 18) + padL(r.steps, 7) + padL(r.hanzi, 7) +
    padL(r.choice, 6) + padL(r.fx, 6) + padL(r.archive, 6) + padL(r.bgs, 6) + padL(r.who, 6) + padL(r.cg, 5));
});
console.log(pad('合计', 8) + pad(report.length + ' 章', 18) + padL(T.steps, 7) + padL(T.hanzi, 7) +
  padL(T.choice, 6) + padL('', 6) + padL(T.archive, 6));

console.log('\n=== 资源统计 ===');
console.log('背景   ' + assetReport.bg + ' / ' + assetReport.bgWant);
console.log('立绘   ' + assetReport.chars + ' / ' + assetReport.charsWant);
console.log('本篇用到背景 ' + allBgs.size + ' / ' + BGS.length + '，出场人物 ' + allWho.size + ' / ' + WHO.length);

const unusedBg = BGS.filter(b => !allBgs.has(b));
const unusedWho = WHO.filter(w => !allWho.has(w));
if (unusedBg.length) warn('全局', '未被任何章节引用的背景（' + unusedBg.length + '）：' + unusedBg.join(', '));
if (unusedWho.length) warn('全局', '未出场的角色（' + unusedWho.length + '）：' + unusedWho.join(', '));

if (warns.length) {
  console.log('\n--- 警告 (' + warns.length + ') ---');
  warns.slice(0, 60).forEach(w => console.log('  · [' + w.file + '] ' + w.msg));
  if (warns.length > 60) console.log('  … 其余 ' + (warns.length - 60) + ' 条省略');
}
if (errors.length) {
  console.log('\n--- 错误 (' + errors.length + ') ---');
  errors.slice(0, 80).forEach(e => console.log('  × [' + e.file + '] ' + e.msg));
  if (errors.length > 80) console.log('  … 其余 ' + (errors.length - 80) + ' 条省略');
  console.log('\n检查未通过。');
  process.exit(1);
}
console.log('\n检查通过。');
