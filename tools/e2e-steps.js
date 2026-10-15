#!/usr/bin/env node
/* ============================================================
 * tools/e2e-steps.js —— 能"走进剧情深处"的端到端截图探针
 *
 * 旧探针（tools/e2e-shot.js）只会 VN.start(ch)，因此永远停在第 1 帧，
 * 看不到立绘 / 选项 / CG / 会议 / 结算等真正的界面。
 * 本工具可以按脚本推进剧情并逐个截图，输出图里带一条状态横幅
 * （错误数 / 章 / 帧 / 当前 step 类型 / 三个数值），
 * 同时用 --dump-dom 回读一份机器可读诊断打到标准输出。
 *
 * 用法：
 *   node tools/e2e-steps.js <outName> "<script>" [虚拟时间ms]
 *
 * script 里用 `|` 分隔若干操作：
 *   title                  回到标题画面
 *   ch03                   跳到第 3 章
 *   n120                   推进 120 次
 *   untilChoice            一直推进到选项出现（最多 4000 次）
 *   until:<js表达式>       一直推进到表达式为真（例如 until:VN.state.morale>60）
 *   autoPick:1             遇到选项自动点第 1 个（1–9）。VN.advance() 在选项
 *                          面板打开时不会推进，所以"自动走完一章"必须自动点按钮。
 *   ui:showHistory         VN.ui.<名>()     （showTitle/showChapterSelect/showHistory/
 *                          showSlots/showSettings/showSystem/showResult）
 *   gallery:showChars      VN.gallery.<名>()（showChars/showArchives/showArt）
 *   click:<css选择器>      点击元素
 *   wait:800               等 800ms
 *   js:<语句>              直接执行 JS（语句里可以有逗号，但不能有 |）
 *   note:<表达式>          求值并写进诊断（用来读取页面内部状态，例如
 *                          note:VN.audio.tracks().length）
 *
 * 例：
 *   node tools/e2e-steps.js ch07            "ch07|n220"
 *   node tools/e2e-steps.js ch03-choice     "ch03|untilChoice"
 *   node tools/e2e-steps.js gallery-chars   "title|gallery:showChars"
 *
 * 由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { EDGE, ROOT } = require(path.join(__dirname, 'shot2.js'));

const outName = process.argv[2] || 'probe';
const script = process.argv[3] || 'title';
const budget = parseInt(process.argv[4] || '24000', 10);
/* 可选：LW_WINDOW=1280x720 用来验证不同视口下的排版（默认 1600x900） */
const WIN = (process.env.LW_WINDOW || '1600x900').split('x').map((n) => parseInt(n, 10));
const WINW = WIN[0], WINH = WIN[1];

const outPng = path.join(ROOT, 'tmp', 'e2e', outName + '.png');

/* ---------------- 注入探针 ---------------- */
const PROBE = `
<div id="probe-out" style="display:none"></div>
<script>
(function () {
  /* 【重要】无头 Edge 的 --virtual-time-budget 不会推进 CSS transition，
     结果是"靠 transition 从 opacity:0 淡入"的元素（背景、立绘）永远停在 opacity:0，
     截出来的图全黑——这是**探针的伪影**，不是游戏 bug（已验证：注入 transition:none 后
     opacity 立刻变 1.00）。因此这里统一把 transition 时长压成 0，
     让截图反映的是"动画结束后的稳定态"。keyframes 动画保持不动。 */
  var st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition-duration:0s !important;transition-delay:0s !important}';
  (document.head || document.documentElement).appendChild(st);
  var errs = [];
  window.onerror = function (m, f, l) { errs.push(m + " @" + String(f).split("/").pop() + ":" + l); };
  window.addEventListener("unhandledrejection", function (e) {
    errs.push("unhandled: " + ((e.reason && e.reason.message) || e.reason));
  });
  var OPS = ${JSON.stringify(script.split('|').filter(Boolean).map(function (s) { return s.trim(); }))};
  var log = [];
  var seen = [];

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function frame() { try { return (window.VN && VN.topFrame && VN.topFrame()) || null; } catch (e) { return null; } }
  /* 帧对象形状是 { steps:[...], i:n }，当前 step = steps[i] */
  function curStep() {
    var f = frame();
    return (f && f.steps && f.steps[f.i]) || null;
  }
  function stepType() { var st = curStep(); return (st && st.t) || '?'; }
  function choiceOpen() {
    var el = document.getElementById('choice-layer');
    return !!(el && !el.classList.contains('hidden'));
  }
  function advance() { try { VN.advance(); } catch (e) { errs.push('advance: ' + e.message); } }

  /* 选项自动选择：VN.advance() 在选项面板打开时不会推进（引擎故意阻塞等待玩家），
     所以"自动走完一章"必须真的点按钮。autoPick 打开后，遇到选项就点第 N 个。 */
  var autoPick = 0;   /* 0 = 关闭；1/2/3... = 自动点第几个选项 */
  var picked = [];
  function optionButtons() {
    var list = document.getElementById('choice-list');
    return list ? Array.prototype.slice.call(list.querySelectorAll('button')) : [];
  }
  function tryPick() {
    if (!autoPick || !choiceOpen()) return false;
    var bs = optionButtons();
    var b = bs[Math.min(autoPick, bs.length) - 1];
    if (!b) return false;
    picked.push((b.innerText || b.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 40));
    b.click();
    return true;
  }

  async function runOps() {
    for (var i = 0; i < OPS.length; i++) {
      var op = OPS[i];
      try {
        if (op === 'title') { VN.ui.showTitle(); }
        else if (/^ch[0-9]+$/.test(op)) { VN.start(op, { fresh: true }); }
        else if (/^n[0-9]+(@[0-9]+)?$/.test(op)) {
          var parts = op.slice(1).split('@');
          var k = parseInt(parts[0], 10);
          var ms = parts[1] ? parseInt(parts[1], 10) : 14;
          for (var j = 0; j < k; j++) { if (!tryPick()) advance(); await sleep(ms); }
          log.push('n' + k + '@' + ms + 'ms');
        }
        else if (op === 'untilChoice') {
          var g = 0;
          while (!choiceOpen() && g++ < 4000) { advance(); await sleep(12); }
          log.push('untilChoice: 推进 ' + g + ' 次, 选项面板=' + choiceOpen());
        }
        else if (/^until:/.test(op)) {
          var expr = op.slice(6);
          var h = 0;
          while (h++ < 4000) {
            var ok = false;
            try { ok = !!eval(expr); } catch (e) { errs.push('until 表达式出错: ' + e.message); break; }
            if (ok) break;
            if (!tryPick()) advance(); await sleep(12);
          }
          log.push('until: 推进 ' + h + ' 次');
        }
        else if (/^autoPick:[0-9]$/.test(op)) { autoPick = parseInt(op.slice(9), 10); }
        else if (/^ui:/.test(op)) {
          var m1 = op.slice(3);
          if (VN.ui && typeof VN.ui[m1] === 'function') VN.ui[m1](); else errs.push('无 VN.ui.' + m1);
          await sleep(700);
        }
        else if (/^gallery:/.test(op)) {
          var m2 = op.slice(8);
          if (VN.gallery && typeof VN.gallery[m2] === 'function') VN.gallery[m2](); else errs.push('无 VN.gallery.' + m2);
          await sleep(700);
        }
        else if (/^click:/.test(op)) {
          var sel = op.slice(6);
          var el = document.querySelector(sel);
          if (el) el.click(); else errs.push('click 找不到 ' + sel);
          await sleep(400);
        }
        else if (/^wait:/.test(op)) { await sleep(parseInt(op.slice(5), 10)); }
        else if (/^js:/.test(op)) { eval(op.slice(3)); await sleep(300); }
        else if (/^note:/.test(op)) {
          var q = op.slice(5);
          var v = null;
          try { v = eval(q); } catch (e) { v = '求值出错: ' + e.message; }
          log.push(q + ' = ' + JSON.stringify(v));
        }
        else { errs.push('未知操作 ' + op); }
      } catch (e) { errs.push('op[' + op + ']: ' + e.message); }
    }
  }

  function report() {
    var st = (window.VN && VN.state) || {};
    var f = frame();
    var cs = curStep();
    var info = {
      errors: errs,
      chapter: st.chapter || null,
      frameIndex: f ? f.i : null,
      frameDepth: st.frames ? st.frames.length : null,
      stepCount: (f && f.steps) ? f.steps.length : null,
      stepType: stepType(),
      stepText: cs ? String(cs.text || cs.id || cs.name || '').slice(0, 80) : null,
      speaker: cs ? (cs.who || null) : null,
      waiting: !!st.waiting,
      typing: !!st.typing,
      meters: { morale: st.morale, trust: st.trust, hope: st.hope },
      choiceOpen: choiceOpen(),
      /* 区分"真的站在台上"和"只剩 src 残留"：后者是 hide 之后 img 还留着 src，
         不能算作在场人物（否则会误报成"同一个人出现两次"）。 */
      portraits: Array.prototype.slice.call(document.querySelectorAll('#char-layer .slot img'))
        .filter(function (im) { return im.getAttribute('src'); })
        .map(function (im) {
          var s = im.closest('.slot');
          var vis = s && s.classList.contains('on') && !s.classList.contains('leaving') &&
            parseFloat(getComputedStyle(s).opacity) > 0.05;
          return (vis ? '✔' : '·') + (s ? s.dataset.slot : '?') + ':' + im.getAttribute('src').split('/').pop();
        }),
      bg: (function () {
        var a = document.getElementById('bg-a'), b = document.getElementById('bg-b');
        function info(el) {
          if (!el) return null;
          var src = el.getAttribute('src');
          if (!src) return null;
          return { f: src.split('/').pop(), o: Number(getComputedStyle(el).opacity).toFixed(2), on: el.classList.contains('on') };
        }
        return { a: info(a), b: info(b) };
      })(),
      fx: {
        fade: Number(getComputedStyle(document.getElementById('fx-fade')).opacity).toFixed(2),
        flash: Number(getComputedStyle(document.getElementById('fx-flash')).opacity).toFixed(2)
      },
      imgHealth: (function () {
        function h(id) {
          var el = document.getElementById(id);
          if (!el) return null;
          return { src: (el.getAttribute('src') || '').split('/').pop(), complete: el.complete, nw: el.naturalWidth, nh: el.naturalHeight };
        }
        return { a: h('bg-a'), b: h('bg-b') };
      })(),
      stackAtCenter: document.elementsFromPoint(800, 300).slice(0, 8).map(function (e) {
        var cs = getComputedStyle(e);
        return (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + (e.className || '').toString().split(' ')[0]) +
          '[o=' + cs.opacity + ';z=' + cs.zIndex + ';bg=' + cs.backgroundColor + ']';
      }),
      overlayVisible: (function () {
        var o = document.getElementById('overlay');
        return !!(o && !o.classList.contains('hidden'));
      })(),
      domSample: (function () {
        var o = document.getElementById('overlay');
        return o && !o.classList.contains('hidden') ? (o.innerText || '').slice(0, 240).replace(/\\s+/g, ' ') : null;
      })(),
      log: log
      , seen: seen
      , picked: picked
    };
    document.getElementById('probe-out').textContent = '@@PROBE@@' + JSON.stringify(info) + '@@END@@';

    var d = document.createElement('div');
    d.style.cssText = "position:fixed;left:0;top:0;z-index:99999;font:13px/1.45 ui-monospace,monospace;padding:6px 10px;max-width:96%;white-space:pre-wrap;border-radius:0 0 6px 0";
    d.style.background = errs.length ? '#b00020' : '#0b6b32';
    d.style.color = '#fff';
    d.textContent = '错误 ' + errs.length + ' 条 | ' + (info.chapter || 'title') +
      ' | 帧 ' + info.frameIndex + '/' + info.stepCount + ' | step=' + info.stepType +
      (info.speaker ? ' | who=' + info.speaker : '') +
      ' | bg=' + ((info.bg.a && info.bg.a.f) || (info.bg.b && info.bg.b.f) || '-') + ' | 立绘=' + (info.portraits.join(',') || '-') +
      ' | 选项=' + info.choiceOpen + ' | 遮罩=' + info.overlayVisible +
      (errs.length ? '\\n' + errs.slice(0, 3).join('\\n') : '');
    document.body.appendChild(d);
  }

  window.addEventListener('load', function () {
    var t = 0;
    (function boot() {
      t++;
      if (t <= 3 || t % 20 === 0) {
        seen.push(t + ':' + (typeof window.VN) + '/' +
          (window.VN ? typeof VN.start : '-') + '/' +
          (window.VN ? typeof VN.advance : '-') + '/' +
          (window.VN ? typeof VN.ui : '-') + '/ready=' + document.readyState);
      }
      if (window.VN && VN.start && VN.advance) { runOps().then(function () { setTimeout(report, 1500); }); return; }
      if (t > 100) { errs.push('引擎未就绪'); report(); return; }
      setTimeout(boot, 120);
    })();
  });
})();
</script>
`;

/* 每次运行写**唯一**的临时页面，避免并行跑时互相覆盖；直接加载它（不套 iframe），
   这样 --dump-dom 才能回读到探针输出。
   注意：必须写在**仓库根目录**（不能写 tmp/），否则 index.html 里的
   src/**、art/**、css/** 这些相对路径全部会 404。 */
fs.mkdirSync(path.join(ROOT, 'tmp'), { recursive: true });
const pagePath = path.join(ROOT, `_e2e_${process.pid}_${Date.now().toString(36)}.html`);
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
fs.writeFileSync(pagePath, src.replace(/<\/body>/, PROBE + '</body>'), 'utf8');
const pageUrl = 'file:///' + pagePath.replace(/\\/g, '/');

/* ---- 临时页的异常路径清理（R2-E06）---------------------------------------
 * 以前只在正常收尾那一行 unlink，被 Ctrl+C / SIGTERM 打断就在仓库根目录
 * 留一个 `_e2e_<pid>_<ts>.html`，越积越多，而且它是一份**能当入口打开的**页面副本。
 * 两层兜底：
 *   1) 本进程的退出路径（exit / SIGINT / SIGTERM / SIGHUP）都清自己的页；
 *   2) 启动时清扫"上一位探针的孤儿页" —— 只删文件名里那个 PID **已经不存在**的，
 *      正在并行跑的其它 agent 的临时页一律不碰。
 * 被 Stop-Process -Force 强杀那一下拦不住，那是第 2 层负责的。
 * ------------------------------------------------------------------------ */
let pageCleaned = false;
function cleanupPage() {
  if (pageCleaned) return;
  pageCleaned = true;
  try { fs.unlinkSync(pagePath); } catch (e) { /* 忽略 */ }
}
process.on('exit', cleanupPage);
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((sig) => {
  process.on(sig, () => { cleanupPage(); process.exit(130); });
});

/* 第二层：启动时清扫"上一位探针的孤儿页"。
 * 只删文件名里那个 PID **已经不存在**的临时页；并行跑的其它探针一律不碰。
 * （被 Stop-Process -Force 强杀时第一层拦不住，由这一层兜。）
 * —— 这一层由 root 补完（原改动被中断在只有第一层的状态）。 */
try {
  const mine = path.basename(pagePath);
  fs.readdirSync(ROOT)
    .filter((f) => /^_e2e(?:run)?_\d+_[0-9a-z]+\.html$/.test(f) && f !== mine)
    .forEach((f) => {
      const pid = Number(f.split('_')[2]);
      let alive = true;
      try { process.kill(pid, 0); } catch (e) { alive = false; }
      if (!alive) { try { fs.unlinkSync(path.join(ROOT, f)); } catch (e) { /* 忽略 */ } }
    });
} catch (e) { /* 清扫失败不影响探针本身 */ }

function runEdge(extraArgs, opts) {
  const args = ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--disable-extensions', '--force-device-scale-factor=1',
    `--window-size=${WINW},${WINH}`, `--virtual-time-budget=${budget}`, ...extraArgs, pageUrl];
  return cp.execFileSync(EDGE, args, { timeout: 300000, maxBuffer: 256 * 1024 * 1024, ...(opts || {}) });
}

/* ---------------- 1. 截图 ---------------- */
runEdge([`--screenshot=${outPng}`], { stdio: 'ignore' });
if (!fs.existsSync(outPng)) throw new Error('e2e-steps: 截图未生成 ' + outPng);

/* ---------------- 2. 回读 DOM 里的诊断 ---------------- */
let diag = null;
try {
  const out = runEdge(['--dump-dom'], { encoding: 'utf8' });
  const m = out.match(/@@PROBE@@([\s\S]*?)@@END@@/);
  if (m) diag = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
} catch (e) {
  console.log('（DOM 回读失败：' + e.message + '）');
}

console.log('截图: ' + outPng);
if (diag) {
  console.log('错误: ' + (diag.errors.length ? diag.errors.join(' ; ') : '0 条'));
  console.log('状态: ' + JSON.stringify({
    chapter: diag.chapter, frame: diag.frameIndex + '/' + diag.stepCount, step: diag.stepType,
    who: diag.speaker, text: diag.stepText, bg: diag.bg, fx: diag.fx, portraits: diag.portraits,
    choice: diag.choiceOpen, overlay: diag.overlayVisible, waiting: diag.waiting, typing: diag.typing,
    meters: diag.meters
  }, null, 0));
  if (diag.log && diag.log.length) console.log('过程: ' + diag.log.join(' | '));
  if (diag.seen && diag.seen.length) console.log('探针轮询: ' + diag.seen.join('  '));
  if (diag.imgHealth) console.log('图片: ' + JSON.stringify(diag.imgHealth));
  if (diag.stackAtCenter) console.log('屏幕中心堆叠: ' + diag.stackAtCenter.join(' | '));
  if (diag.domSample) console.log('遮罩文本: ' + diag.domSample);
  if (diag.picked && diag.picked.length) console.log('选项(自动): ' + diag.picked.join(' → '));
} else {
  console.log('（未取到诊断）');
}
try { fs.unlinkSync(pagePath); } catch (e) { /* 忽略 */ }
