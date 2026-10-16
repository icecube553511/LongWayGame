#!/usr/bin/env node
/* 《长征·万水千山》剧本静态检查器。
 *
 *   node tools/lint-story.js                # 检查 manifest 中全部章节
 *   node tools/lint-story.js src/story/ch03.js ...   # 只检查指定文件
 *
 * 退出码：0 = 全绿，1 = 有错误。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

/* ---------------- 契约常量（与 docs/SPEC.md 一致） ---------------- */
const WHO = [
  'mao', 'zhou', 'zhu', 'zhang_wentian', 'wang_jiaxiang', 'bogu', 'lide', 'peng',
  'lin', 'nie', 'liu_bocheng', 'chen_yun', 'he_zizhen', 'deng_yingchao', 'xu_teli',
  'dong_biwu', 'lin_boqu', 'xie_juezai', 'ye_jianying', 'zhang_guotao', 'xu_xiangqian',
  'li_xiannian', 'xiao_yedan',
  'xiaoman', 'li_tiezhu', 'he_xiaomei', 'guo_daniang', 'shi_zhu', 'a_yue', 'wu_laoliu', 'san_wa',
  'soldiers', 'villagers', 'yi_people', 'narrator'
];
const FACES = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];
const BG = [
  'bg_yudu_night', 'bg_yudu_village', 'bg_mountain_pass', 'bg_blockade',
  'bg_xiangjiang_day', 'bg_xiangjiang_night', 'bg_council_hall', 'bg_tongdao',
  'bg_liping', 'bg_houchang', 'bg_zunyi', 'bg_chishui', 'bg_tucheng',
  'bg_loushanguan', 'bg_jinsha', 'bg_yihai', 'bg_dadu', 'bg_luding',
  'bg_snow_mountain', 'bg_maogong', 'bg_grassland', 'bg_lazikou', 'bg_hadapu',
  'bg_wuqi', 'bg_huining', 'bg_yanan_cave', 'bg_rain_march', 'bg_camp_fire',
  'bg_map_table', 'bg_stretcher'
  , 'bg_bullets_3', 'bg_bullets_2', 'bg_bullets_1', 'bg_black'
];
const SFX = ['gunfire', 'distant_gun', 'shell', 'horse', 'water', 'bell', 'paper',
  'footsteps', 'wind', 'thunder', 'horn', 'cheer', 'click', 'page', 'vertigo'];
/* 重要事件插画（CG）的 id 来自 src/data/cg.js —— 与引擎、画廊、check.js 同一个来源。
 * 只认 bg_* 的旧写法会让「cg 步改用 cg_* id」被误判成「未知背景 id」，所以这里读表。
 * 读不到表（文件缺失/语法坏）时退回只认背景 id，并明确告警，不静默放过。 */
const CG_IDS = (function () {
  try {
    const sb = { window: {} };
    require('vm').runInNewContext(
      require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'data', 'cg.js'), 'utf8'), sb);
    const list = (sb.window.ART && sb.window.ART.cgList) || [];
    return list.map((c) => c.id);
  } catch (e) {
    console.warn('[lint-story] 读不到 src/data/cg.js 的 CG 清单，cg 步只按背景 id 校验：' + e.message);
    return [];
  }
})();
const BGM = ['departure', 'march', 'tense', 'battle', 'grief', 'hope', 'victory',
  'night', 'river', 'snow', 'grassland', 'council'];
const FX = ['flash', 'shake', 'fadeout', 'fadein', 'snow', 'rain', 'ash', 'blood', 'star'];
const BG_FX = ['fade', 'cut', 'dissolve', 'black'];
const SLOTS = ['left', 'center', 'right'];
const CHAR_FX = ['slidein', 'fadein', 'pop'];
const UNLOCK = ['char', 'archive', 'cg'];
const OPS = ['=', '+=', '-=', 'max', 'min'];
const COPS = ['=', '!=', '>', '>=', '<', '<='];
const STEP_TYPES = ['bg', 'show', 'hide', 'clear', 'say', 'narr', 'think', 'title',
  'fx', 'cg', 'choice', 'set', 'if', 'label', 'goto', 'sfx', 'bgm', 'wait',
  'unlock', 'end', 'note'];

/* ---------------- 工具 ---------------- */
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;

function loadStory() {
  const sandbox = { window: {}, console, globalThis: {} };
  sandbox.globalThis = sandbox;
  sandbox.window.window = sandbox.window;
  const ctx = vm.createContext(sandbox);

  const manifestPath = path.join(ROOT, 'src/story/manifest.js');
  vm.runInContext(fs.readFileSync(manifestPath, 'utf8'), ctx, { filename: 'src/story/manifest.js' });

  const CHAPTERS = {};
  const manifest = sandbox.window.STORY.__manifest || [];
  for (const entry of manifest) {
    const fp = path.join(ROOT, entry.file);
    if (!fs.existsSync(fp)) { CHAPTERS[entry.id] = { __missing: entry }; continue; }
    sandbox.window.STORY[entry.id] = undefined;
    try {
      vm.runInContext(fs.readFileSync(fp, 'utf8'), ctx, { filename: entry.file });
    } catch (e) {
      CHAPTERS[entry.id] = { __parseError: entry, __err: e };
      continue;
    }
    CHAPTERS[entry.id] = sandbox.window.STORY[entry.id] || { __missing: entry };
  }
  return { manifest, CHAPTERS };
}

function counter() {
  const out = [];
  return {
    errors: out,
    err(ch, msg) { out.push({ ch, msg, level: 'error' }); },
    warn(ch, msg) { out.push({ ch, msg, level: 'warn' }); }
  };
}

function cjkCount(text) {
  if (typeof text !== 'string') return 0;
  const m = text.match(CJK);
  return m ? m.length : 0;
}

function condVars(cond, out) {
  if (!cond || typeof cond !== 'object') return;
  if (Array.isArray(cond.all)) cond.all.forEach((c) => condVars(c, out));
  else if (Array.isArray(cond.any)) cond.any.forEach((c) => condVars(c, out));
  else if (cond.not) condVars(cond.not, out);
  else if (typeof cond.var === 'string') out.push(cond);
}

/* ---------------- 单章检查 ---------------- */
function checkChapter(ch, file, c, stats) {
  if (!ch || typeof ch !== 'object') { c.err(file, '章节对象不存在（未向 window.STORY 注册）'); return; }
  if (ch.__missing) { c.err(file, '文件缺失或未注册 STORY.' + ch.__missing.id); return; }
  if (ch.__parseError) { c.err(file, '脚本执行异常：' + ch.__err.message); return; }

  ['id', 'num', 'title', 'date', 'place', 'summary'].forEach((k) => {
    if (ch[k] === undefined || ch[k] === '') c.err(file, '缺少字段 ' + k);
  });
  if (!Array.isArray(ch.steps)) { c.err(file, 'steps 必须是数组'); return; }
  if (!Array.isArray(ch.archive)) c.err(file, 'archive 必须是数组');
  if (ch.titleCard && (!ch.titleCard.text || !ch.titleCard.sub)) c.err(file, 'titleCard 需要 text/sub');

  const labels = new Set();
  const gotos = [];
  const archiveIds = new Set((ch.archive || []).map((a) => a.id));
  const records = new Set();

  stats.chars += cjkCount(ch.summary || '');

  let stepCount = 0;
  let sayCount = 0;
  let choiceCount = 0;
  let chars = 0;
  const speakerSet = new Set();
  const bgSet = new Set();
  const faceUse = new Set();

  function needWho(where, who) {
    if (!WHO.includes(who)) c.err(file, where + '：未知人物 id \"' + who + '\"');
  }
  function needFace(where, face) {
    if (face === undefined) return;
    if (!FACES.includes(face)) c.err(file, where + '：未知表情 \"' + face + '\"');
    else faceUse.add(face);
  }
  function needBg(where, id) {
    if (!BG.includes(id)) c.err(file, where + '：未知背景 id \"' + id + '\"');
    else bgSet.add(id);
  }
  function applySets(where, sets) {
    if (sets === undefined) return;
    if (!Array.isArray(sets)) { c.err(file, where + '：set 必须是数组'); return; }
    for (const s of sets) {
      if (!s || typeof s.var !== 'string' || !s.var) c.err(file, where + '：set 缺少 var');
      if (!OPS.includes(s.op)) c.err(file, where + '：非法 op \"' + s.op + '\"');
      if (s.value === undefined) c.err(file, where + '：set 缺少 value');
      if (typeof s.var === 'string' && (s.var === 'morale' || s.var === 'trust' || s.var === 'hope')) {
        const v = s.value;
        if (typeof v === 'number' && (v < -100 || v > 100)) c.warn(file, where + '：数值变化过大 ' + JSON.stringify(s));
      }
    }
  }

  function walkRaw(where, item, depth) {
    if (!item || typeof item !== 'object') { c.err(file, where + '：step 不是对象'); return; }
    stepCount++;
    const t = item.t;
    if (!STEP_TYPES.includes(t)) { c.err(file, where + '：非法 step 类型 \"' + t + '\"'); return; }
    switch (t) {
      case 'bg':
        needBg(where, item.id);
        if (item.fx !== undefined && !BG_FX.includes(item.fx)) {
          if (item.fx === 'flash' || item.fx === 'fadein' || item.fx === 'fadeout') {
            c.warn(file, where + '：bg fx \"' + item.fx + '\" 不在 SPEC 枚举内（引擎按淡入 + 特效处理）');
          } else {
            c.err(file, where + '：非法 bg fx \"' + item.fx + '\"');
          }
        }
        break;
      case 'show':
        needWho(where, item.who); needFace(where, item.face);
        if (item.slot !== undefined && !SLOTS.includes(item.slot)) c.err(file, where + '：非法 slot \"' + item.slot + '\"');
        if (item.fx !== undefined && !CHAR_FX.includes(item.fx)) c.err(file, where + '：非法 show fx \"' + item.fx + '\"');
        break;
      case 'hide':
        needWho(where, item.who);
        break;
      case 'say':
        sayCount++; speakerSet.add(item.who);
        needWho(where, item.who); needFace(where, item.face);
        if (!item.text) c.err(file, where + '：say 缺少 text');
        chars += cjkCount(item.text) + cjkCount(item.note || '');
        break;
      case 'narr':
        if (!item.text) c.err(file, where + '：narr 缺少 text');
        chars += cjkCount(item.text) + cjkCount(item.note || '');
        break;
      case 'think':
        needWho(where, item.who); needFace(where, item.face);
        if (!item.text) c.err(file, where + '：think 缺少 text');
        chars += cjkCount(item.text);
        break;
      case 'title':
        if (!item.text) c.err(file, where + '：title 缺少 text');
        break;
      case 'fx':
        if (!FX.includes(item.kind)) c.err(file, where + '：非法特效 \"' + item.kind + '\"');
        break;
      case 'cg':
        /* cg 步的 id 可以是背景 id（老写法：插画复用背景加强版），也可以是
           src/data/cg.js 里的 cg_* （本轮的重要事件插画）。两者之外才算错。 */
        if (CG_IDS.indexOf(item.id) < 0) needBg(where, item.id);
        if (item.text) chars += cjkCount(item.text);
        break;
      case 'choice': {
        choiceCount++;
        if (item.prompt) chars += cjkCount(item.prompt);
        if (!Array.isArray(item.options) || item.options.length < 2) {
          c.err(file, where + '：choice 至少需要 2 个 options');
        } else if (item.options.length > 4) {
          c.warn(file, where + '：choice 超过 4 个选项（键盘 1-4 只能覆盖前 4 个）');
        }
        (item.options || []).forEach((o, i) => {
          const w2 = where + '.opt' + (i + 1);
          if (!o || !o.text) { c.err(file, w2 + '：缺少 text'); return; }
          chars += cjkCount(o.text);
          applySets(w2, o.set);
          if (o.goto !== undefined) gotos.push({ from: w2, to: o.goto });
          if (o.record !== undefined) records.add(o.record);
        });
        break;
      }
      case 'set':
        applySets(where, [item]);
        break;
      case 'if': {
        if (!item.cond) c.err(file, where + '：if 缺少 cond');
        else {
          const vars = []; condVars(item.cond, vars);
          vars.forEach((v) => { if (!COPS.includes(v.op)) c.err(file, where + '：非法条件运算符 \"' + v.op + '\"'); });
          if (!vars.length) c.warn(file, where + '：cond 未解析到任何变量');
        }
        if (!Array.isArray(item.then)) c.err(file, where + '：if 缺少 then 数组');
        else item.then.forEach((s, i) => walkRaw(where + '>then' + i, s, depth + 1));
        if (item.else !== undefined) {
          if (!Array.isArray(item.else)) c.err(file, where + '：else 必须是数组');
          else item.else.forEach((s, i) => walkRaw(where + '>else' + i, s, depth + 1));
        }
        break;
      }
      case 'label':
        if (!item.name) c.err(file, where + '：label 缺少 name');
        else if (labels.has(item.name)) c.err(file, where + '：label 重名 \"' + item.name + '\"');
        else labels.add(item.name);
        break;
      case 'goto':
        if (!item.target) c.err(file, where + '：goto 缺少 target');
        else gotos.push({ from: where, to: item.target });
        break;
      case 'sfx':
        if (!SFX.includes(item.id)) c.err(file, where + '：未知音效 \"' + item.id + '\"');
        break;
      case 'bgm':
        if (item.stop === true) break;
        if (!BGM.includes(item.id)) c.err(file, where + '：未知 BGM \"' + item.id + '\"');
        break;
      case 'wait':
        if (typeof item.ms !== 'number') c.err(file, where + '：wait 需要数字 ms');
        break;
      case 'unlock':
        if (!UNLOCK.includes(item.kind)) c.err(file, where + '：非法 unlock kind');
        else if (item.kind === 'archive' && !archiveIds.has(item.id)) c.err(file, where + '：unlock 了本章不存在的档案 \"' + item.id + '\"');
        else if (item.kind === 'char') needWho(where, item.id);
        break;
      case 'end':
        break;
      case 'note':
        if (!item.text) c.err(file, where + '：note 缺少 text');
        chars += cjkCount(item.text);
        break;
    }
  }

  ch.steps.forEach((s, i) => walkRaw('steps[' + i + ']', s, 0));

  gotos.forEach((g) => {
    if (!labels.has(g.to)) c.err(file, g.from + '：goto 目标未定义 \"' + g.to + '\"');
  });
  if (!ch.steps.some((s, i) => s && s.t === 'end')) c.err(file, 'steps 中没有任何 end 步骤');

  if (stepCount < 90) c.warn(file, 'steps 数量 ' + stepCount + ' < 90（SPEC §7 要求）');
  if (chars < 3000) c.warn(file, '本章正文汉字 ' + chars + ' < 3000（SPEC §7 要求）');
  if (choiceCount < 2) c.warn(file, 'choice 数量 ' + choiceCount + ' < 2（SPEC §7 要求）');
  if ((ch.archive || []).length < 3) c.warn(file, 'archive 数量 ' + (ch.archive || []).length + ' < 3（SPEC §7 要求）');
  (ch.archive || []).forEach((a, i) => {
    if (!a || !a.id) c.err(file, 'archive[' + i + '] 缺少 id');
    else if (!a.title || !a.text) c.err(file, 'archive[' + i + '] 缺少 title/text');
    stats.chars += cjkCount(a && a.text);
  });

  stats.steps += stepCount;
  stats.dialogue += chars;
  stats.choices += choiceCount;
  stats.archives += (ch.archive || []).length;
  stats.bgs = new Set([...(stats.bgs || []), ...bgSet]);
  stats.speakers = new Set([...(stats.speakers || []), ...speakerSet]);
  stats.faces = new Set([...(stats.faces || []), ...faceUse]);
  stats.records = new Set([...(stats.records || []), ...records]);

  ch.__stats = { steps: stepCount, chars, choices: choiceCount, say: sayCount, speakers: speakerSet.size, bgs: bgSet.size };
  return ch;
}

/* ---------------- 主流程 ---------------- */
function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const quiet = process.argv.includes('--quiet');
  const { manifest, CHAPTERS } = loadStory();
  const c = counter();
  const stats = { steps: 0, dialogue: 0, chars: 0, choices: 0, archives: 0, bgs: new Set(), speakers: new Set(), faces: new Set(), records: new Set() };

  let targets = manifest;
  if (args.length) {
    const wanted = new Set(args.map((a) => path.basename(a).replace(/\.js$/, '')));
    targets = manifest.filter((e) => wanted.has(e.id));
    wanted.forEach((w) => { if (!manifest.some((e) => e.id === w)) c.err(w, '不在 manifest 中'); });
  }

  const rows = [];
  for (const entry of targets) {
    const ch = CHAPTERS[entry.id];
    const before = c.errors.length;
    checkChapter(ch, entry.file, c, stats);
    if (ch && ch.__stats) {
      rows.push({
        id: entry.id, num: entry.num, title: entry.title,
        steps: ch.__stats.steps, chars: ch.__stats.chars,
        choices: ch.__stats.choices, speakers: ch.__stats.speakers, bgs: ch.__stats.bgs,
        errs: c.errors.length - before
      });
    } else {
      rows.push({ id: entry.id, num: entry.num, title: entry.title, steps: 0, chars: 0, choices: 0, speakers: 0, bgs: 0, errs: c.errors.length - before });
    }
  }

  if (!quiet) {
    console.log('章节  步骤  汉字  选项  人物  背景  错误');
    console.log('----  ----  ----  ----  ----  ----  ----');
    rows.forEach((r) => {
      console.log(
        [String(r.num).padStart(4), String(r.steps).padStart(4), String(r.chars).padStart(5),
         String(r.choices).padStart(4), String(r.speakers).padStart(4), String(r.bgs).padStart(4),
         String(r.errs).padStart(4)].join('  ') + '   ' + r.id + ' ' + r.title
      );
    });
  }

  const errors = c.errors.filter((e) => e.level === 'error');
  const warns = c.errors.filter((e) => e.level === 'warn');
  const shown = errors.concat(warns).slice(0, 120);
  if (shown.length) {
    console.log('');
    shown.forEach((e) => console.log((e.level === 'error' ? '[错误] ' : '[警告] ') + e.ch + ' — ' + e.msg));
    if (errors.length + warns.length > shown.length) console.log('… 其余 ' + (errors.length + warns.length - shown.length) + ' 条已省略');
  }

  console.log('');
  console.log('合计：' + rows.length + ' 章 / ' + stats.steps + ' 步 / 正文 ' + stats.dialogue + ' 汉字 / '
    + stats.choices + ' 个选项 / ' + stats.archives + ' 条档案');
  console.log('覆盖：人物 ' + stats.speakers.size + '/' + WHO.length
    + ' · 背景 ' + stats.bgs.size + '/' + BG.length
    + ' · 表情 ' + stats.faces.size + '/' + FACES.length);

  if (errors.length) {
    console.log('\n✗ 检查未通过：' + errors.length + ' 个错误，' + warns.length + ' 个警告。');
    process.exit(1);
  }
  console.log('\n✓ 无错误' + (warns.length ? '（' + warns.length + ' 个警告）' : '') + '。');
}

if (require.main === module) main();
module.exports = { WHO, FACES, BG, BGM, SFX, STEP_TYPES };
