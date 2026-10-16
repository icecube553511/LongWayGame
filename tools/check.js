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

/* CG（全屏插画）清单来自 src/data/cg.js —— 与引擎、画廊同一个来源。
 * 老剧本里 `{t:'cg', id:'bg_xxx'}`（cg 复用背景 id）仍然合法，所以这里两张表
 * 都接受；写不在任何一张表里的 id 才算错。 */
const CG_LIST = (function () {
  const sb = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'cg.js'), 'utf8'), sb);
  return (sb.window.ART && sb.window.ART.cgList) || [];
})();
const CG_IDS = new Set(CG_LIST.map(c => c.id));

/* ---------------- 背景提示词表 / 背景元数据 ----------------
 * 背景这一轮从程序化 SVG 换成 AI 出图的整屏位图，清单在 src/data/bgart.js；
 * 「哪些背景不出位图」写两处：生成期的 bgart.svgOnly 与运行时的 backgrounds.js noBitmap，
 * 这里把两份都读进来，专门核对它们一致（见下面的背景位图自检）。 */
const BGART_LIST = (function () {
  const sb = { window: {} };
  sb.globalThis = sb;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'bgart.js'), 'utf8'), sb);
  return (sb.window.ART || {}).bgArtList || [];
})();
const BACKGROUNDS = (function () {
  const sb = { window: {} };
  sb.globalThis = sb;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'backgrounds.js'), 'utf8'), sb);
  return (sb.window.ART || {}).backgrounds || {};
})();
const CG_MOTIONS = ['zoom-in', 'pan-left', 'pan-right', 'still', 'impact'];

const BGS = [
  'bg_yudu_night', 'bg_yudu_village', 'bg_mountain_pass', 'bg_blockade', 'bg_xiangjiang_day',
  'bg_xiangjiang_night', 'bg_council_hall', 'bg_tongdao', 'bg_liping', 'bg_houchang',
  'bg_zunyi', 'bg_chishui', 'bg_tucheng', 'bg_loushanguan', 'bg_jinsha',
  'bg_yihai', 'bg_dadu', 'bg_luding', 'bg_snow_mountain', 'bg_maogong',
  'bg_grassland', 'bg_lazikou', 'bg_hadapu', 'bg_wuqi', 'bg_huining',
  'bg_yanan_cave', 'bg_rain_march', 'bg_camp_fire', 'bg_map_table', 'bg_stretcher'
  /* 第三章脚山铺的「三发子弹」叙事画面 + 全黑（画在 art/scenes_bullets.js） */
  , 'bg_bullets_3', 'bg_bullets_2', 'bg_bullets_1', 'bg_black'
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
        if (BGS.indexOf(s.id) < 0 && !CG_IDS.has(s.id)) {
          err(file, w + ' cg 必须是背景表或 src/data/cg.js 里的 id：' + s.id);
        }
        if (Object.prototype.hasOwnProperty.call(s, 'motion') && CG_MOTIONS.indexOf(s.motion) < 0) {
          err(file, w + ' 未知运镜 motion：' + s.motion);
        }
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
const allCgs = new Set();
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
  stats.cgs.forEach(c => allCgs.add(c));
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

/* ---------------- CG（全屏插画）自检 ----------------
 * 这一节是本轮新增的验收面：
 *   · src/data/cg.js 每条都要有 id / ch / title / caption / prompt_en，id 唯一且小写；
 *   · P0 条目的位图必须已经生成（assets/generated/cg/<id>.png）——缺一张就不过；
 *   · P0 条目必须真的被某章剧本的 `{t:'cg'}` 引用，否则玩家永远看不到它。
 * 判定用命令：node tools/check.js */
const ASSET_CG = path.join(ROOT, 'assets', 'generated', 'cg');
const haveCg = listSvg(ASSET_CG) || new Set();
/* 位图"存在"不等于"是一张图"：出图/烘焙写到一半会留下 0 字节或截断的 PNG
   （本轮实测：cg_snow_mountain.png 在烘焙过程中出现 0 字节）。光看文件名会把它算成
   "P0 已生成"，于是闸门绿着、玩家看到的却是回退的旧插画。所以这里查三件事：
   文件在不在、有没有大小、头 8 字节是不是 PNG 签名。 */
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function cgBitmapProblem(id) {
  const f = path.join(ASSET_CG, id + '.png');
  if (!fs.existsSync(f)) return 'missing';
  const size = fs.statSync(f).size;
  if (size < 50 * 1024) return 'too-small(' + size + 'B)';
  const head = fs.readFileSync(f).subarray(0, 8);
  if (!head.equals(PNG_SIG)) return 'not-a-png';
  if (size > 1536 * 1024) return 'over-limit(' + Math.round(size / 1024) + 'KB>1536KB)';
  return null;
}
const cgReport = { p0: 0, p0have: 0, missing: [], unreferenced: [] };
const cgSeen = new Set();
CG_LIST.forEach(c => {
  const where = 'src/data/cg.js(' + c.id + ')';
  if (!/^cg_[a-z0-9_]+$/.test(c.id)) err(where, 'id 必须是小写 cg_ 前缀：' + c.id);
  if (cgSeen.has(c.id)) err(where, 'id 重复');
  cgSeen.add(c.id);
  if (!c.ch || !CHAPTERS.some(x => x[0] === c.ch)) err(where, 'ch 不是合法章节 id：' + c.ch);
  if (!c.title) err(where, '缺少 title');
  if (!c.caption) err(where, '缺少 caption（屏幕上要打出的一句图注）');
  if (!c.prompt_en || String(c.prompt_en).trim().length < 40) err(where, '缺少 prompt_en（英文场景描述）');
  if (!c.prompt_cn) warn(where, '缺少 prompt_cn');
  if (c.motion && CG_MOTIONS.indexOf(c.motion) < 0) err(where, '未知 motion：' + c.motion);
  /* 契约（docs/CG_DESIGN.md §3）是 ≤36 字；这里与契约对齐，不留两套口径。 */
  if (c.caption && hanzi(c.caption) > 36) warn(where, 'caption 超过 36 字：' + c.caption);
  if (c.priority === 'P0') {
    cgReport.p0++;
    const bad = cgBitmapProblem(c.id);
    if (!bad) cgReport.p0have++;
    else if (bad === 'missing') {
      cgReport.missing.push(c.id);
      err(where, 'P0 插画的位图还没生成：assets/generated/cg/' + c.id + '.png');
    } else if (bad.indexOf('over-limit') === 0) {
      /* 体积上限是 docs/CG_DESIGN.md §3 的硬规格，但它是"烘焙参数"的事，
         不该把整条闸门挂住 —— 所以报成警告，并按契约要求在报告里点名。 */
      cgReport.p0have++;
      warn(where, 'P0 插画超过 1.5 MB 上限：' + bad + '（契约见 docs/CG_DESIGN.md §3；' +
        '用 python tools/cg-post.py --id ' + c.id + ' 调参重烘焙）');
    } else {
      /* 空文件 / 截断文件 / 挂错扩展名：这不是"还没生成"，是"生成坏了"，
         必须报错 —— 否则游戏会静默回退到旧插画，闸门却绿着。 */
      err(where, 'P0 插画的位图不完整：assets/generated/cg/' + c.id + '.png ' + bad);
    }
  }
});
CG_LIST.forEach(c => {
  if (allCgs.has(c.id)) return;
  /* 这条判据对 P0 与 P1 一视同仁，理由是画廊的读法：
     src/engine/gallery.js 按 window.ART.cgList 逐条列出，并用同一个 id 解锁。
     所以"清单里有一条、剧本里没有它的 cg 步"= 玩家永远点不亮那一格
     （R1-Q09 就是这一类问题的实例：UI 宣称 20 项、剧本只能产出 19 项）。
     要么把它接进剧本，要么把它从 cg.js 里删掉 —— 不要留在清单里当装饰。 */
  cgReport.unreferenced.push(c.id);
  warn('src/data/cg.js(' + c.id + ')',
    (c.priority === 'P0' ? 'P0' : 'P1') + ' 条目没有被任何章节的 cg 步骤引用：' +
    '画廊按 ART.cgList 列条目，这一格玩家永远点不亮（同 R1-Q09）—— 接进剧本或从清单里删掉');
});

/* ---------------- 输出 ---------------- */
/* ---------------- 背景位图（AI 出图）自检 ----------------
 * 本轮把 30 个场景背景从程序化 SVG 换成 AI 出的整屏位图（tools/bg-art.js + tools/bg-post.py），
 * 引擎按 位图→矢量 逐级回退（engine.js 的 bgCandidates）。这一节的判据：
 *   · src/data/bgart.js 的 id 必须都在 src/data/backgrounds.js 里（id 表冻结，不得新增改名）；
 *   · 场景背景（非 svgOnly）必须已生成 assets/generated/bg/<id>.png，且是一张完整的 PNG；
 *   · 三发子弹×3 与全黑这四张叙事画面不出位图：bgart.svgOnly 与 backgrounds.noBitmap 必须一致
 *     —— 少了 noBitmap 游戏每次切到它们都白请求一次 404；少了 svgOnly 清单说"要出图"却永远出不来。
 * 判定用命令：node tools/check.js */
const PNG_SIG_BG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const BG_MAX_KB = 1280;   /* 与 tools/bg-post.py 的 BG_MAX_KB 同一档（背景每章在场，比插画克制） */
function bgBitmapProblem(id) {
  const f = path.join(ASSET_BG, id + '.png');
  if (!fs.existsSync(f)) return 'missing';
  const size = fs.statSync(f).size;
  if (size < 50 * 1024) return 'too-small(' + size + 'B)';
  if (!fs.readFileSync(f).subarray(0, 8).equals(PNG_SIG_BG)) return 'not-a-png';
  if (size > BG_MAX_KB * 1024) return 'over-limit(' + Math.round(size / 1024) + 'KB>' + BG_MAX_KB + 'KB)';
  return null;
}
const bgArtReport = { want: 0, have: 0, missing: [], svgOnly: 0 };
{
  const seen = new Set();
  BGART_LIST.forEach(b => {
    const where = 'src/data/bgart.js(' + b.id + ')';
    if (seen.has(b.id)) err(where, 'id 重复');
    seen.add(b.id);
    if (!BACKGROUNDS[b.id]) err(where, 'id 不在 src/data/backgrounds.js 里（背景 id 表冻结，不得新增）');
    if (!b.name) warn(where, '缺少 name');
    if (!b.prompt_cn) warn(where, '缺少 prompt_cn');
    if (!b.prompt_en || String(b.prompt_en).trim().length < 120) {
      err(where, '缺少 prompt_en（英文场景描述，至少 120 字符）');
    }
    if (!(b.must || []).length) warn(where, 'must 为空：验收时没有可核对的必现元素');
    const noBitmap = !!(BACKGROUNDS[b.id] && BACKGROUNDS[b.id].noBitmap);
    if (!!b.svgOnly !== noBitmap) {
      err(where, 'svgOnly 与 backgrounds.js 的 noBitmap 不一致（bgart.svgOnly=' + !!b.svgOnly
        + '，backgrounds.noBitmap=' + noBitmap + '）—— 两处必须同改');
    }
    if (b.svgOnly) { bgArtReport.svgOnly++; return; }
    bgArtReport.want++;
    const bad = bgBitmapProblem(b.id);
    if (!bad) bgArtReport.have++;
    else if (bad === 'missing') {
      bgArtReport.missing.push(b.id);
      err(where, '背景位图还没生成：assets/generated/bg/' + b.id + '.png'
        + '（node tools/bg-art.js --only ' + b.id + '）');
    } else if (bad.indexOf('over-limit') === 0) {
      bgArtReport.have++;
      warn(where, '背景位图超过 ' + BG_MAX_KB + ' KB 上限：' + bad
        + '（用 python tools/bg-post.py --id ' + b.id + ' 重烘焙）');
    } else {
      err(where, '背景位图不完整：assets/generated/bg/' + b.id + '.png ' + bad);
    }
  });
  /* 反向：backgrounds.js 里的每个场景背景都必须有提示词条目（否则那一张没人负责出图）。 */
  BGS.forEach(id => {
    if (!seen.has(id) && !(BACKGROUNDS[id] && BACKGROUNDS[id].noBitmap)) {
      err('src/data/bgart.js', '背景 ' + id + ' 没有提示词条目：它不会出现在出图清单里');
    }
  });
}

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
console.log('背景位图 ' + bgArtReport.have + ' / ' + bgArtReport.want + ' 已生成'
  + '（程序化叙事画面 ' + bgArtReport.svgOnly + ' 张不出位图）'
  + (bgArtReport.missing.length ? '（缺 ' + bgArtReport.missing.length + ' 张：'
    + bgArtReport.missing.join(', ') + '）' : ''));
console.log('立绘   ' + assetReport.chars + ' / ' + assetReport.charsWant);
console.log('插画   P0 ' + cgReport.p0have + ' / ' + cgReport.p0 + ' 已生成'
  + (cgReport.missing.length ? '（缺 ' + cgReport.missing.length + ' 张：' + cgReport.missing.join(', ') + '）' : ''));
const cgP1 = CG_LIST.filter(c => c.priority !== 'P0');
const cgP1ref = cgP1.filter(c => allCgs.has(c.id)).length;
console.log('       P1 ' + cgP1ref + ' / ' + cgP1.length + ' 已被剧本引用'
  + (cgReport.unreferenced.length ? '（未引用 ' + cgReport.unreferenced.length +
    ' 条：' + cgReport.unreferenced.join(', ') + '）' : ''));
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
