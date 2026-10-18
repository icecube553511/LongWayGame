#!/usr/bin/env node
/* ============================================================
 * tools/e2e-run.js —— 全剧通关验证（20 章从头走到尾）
 *
 * 一次加载 index.html，然后逐章：
 *   1) VN.start(ch, {fresh:true})
 *   2) 循环推进；遇到选项面板就点第 N 个选项（VN.advance() 在选项打开时
 *      不会推进，引擎在等玩家点击）
 *   3) 直到 VN.state.running === false（本章走完）或达到步数上限
 * 记录每章：推进步数、是否走完、选项次数、途经过的 cg/bg 数量、JS 报错。
 *
 * 用法：
 *   node tools/e2e-run.js [选项索引=1] [每步间隔ms=8]
 *   node tools/e2e-run.js 2 6         # 每次自动点第 2 个选项，间隔 6ms
 *
 * 判定：任何一章 reachedEnd=false（卡住走不完）或出现 JS 报错 → 不合格。
 * 由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { EDGE, ROOT } = require(path.join(__dirname, 'shot2.js'));

const pickIndex = parseInt(process.argv[2] || '1', 10);
const stepMs = parseInt(process.argv[3] || '8', 10);
/* 虚拟时间上限默认值。
 * 原为 600000，到 R2 已经不够用：每章 3 个选项各加了一段停顿（PLAY 批的"选择有回音"），
 * 20 章合计要消耗的虚拟时间越过了 600000 —— 页面跑不完，浏览器一直转到 spawnSync 的
 * 900 秒墙钟超时，于是 `node tools/e2e-run.js` 这条默认命令**取不到任何结果**。
 * 2000000 实测 20 章全部走完（墙钟约 7 秒）。由 root 修复，证据见 docs/reviews/R1-REGRESSION.md §4.2。 */
const budget = parseInt(process.argv[4] || '2000000', 10);
/* 第 5 个参数可选：只跑指定章节，逗号分隔（例如 ch01,ch20） */
const ONLY = (process.argv[5] || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY_JSON = JSON.stringify(ONLY);

/* ---- 位置参数校验（R2-E05）----------------------------------------------
 * 以前这里直接摊给 parseInt，敲错一个参数就会让 pickIndex 变成 NaN：
 * 选项面板永远点不开 → 每章跑满步数上限 → 最后打印「ch01 不合格」。
 * 那是一个**看起来像内容缺陷、实际是参数错误**的结论，而且和真正的
 * 「内容不合格」共用退出码 2，脚本里没法区分。这里在开工前就挡下，
 * 并用退出码 1 把它和 2（内容不合格）分开。
 * ---------------------------------------------------------------------- */
function argFail(msg) {
  console.error('[e2e-run] 参数错误：' + msg);
  console.error('');
  console.error('用法：node tools/e2e-run.js [选项索引] [每步间隔ms] [虚拟时间上限ms] [只看这些章,逗号分隔]');
  console.error('  选项索引      1–9 的整数，自动点第几个选项（默认 1）');
  console.error('  每步间隔ms    正整数，两次推进之间的等待（默认 8）');
  console.error('  虚拟时间上限  正整数毫秒（默认 2000000）');
  console.error('  只看这些章    可选，例如 ch09,ch15；省略＝全部 20 章');
  console.error('');
  console.error('退出码：0 = 全部通过；1 = 参数错误；2 = 有章节不合格。');
  process.exit(1);
}
function isPosInt(v) { return Number.isInteger(v) && v > 0; }

if (!Number.isInteger(pickIndex) || pickIndex < 1 || pickIndex > 9) {
  argFail('选项索引必须是 1–9 的整数，收到 ' + JSON.stringify(process.argv[2]));
}
if (!isPosInt(stepMs)) argFail('每步间隔必须是正整数的毫秒数，收到 ' + JSON.stringify(process.argv[3]));
if (!isPosInt(budget)) argFail('虚拟时间上限必须是正整数的毫秒数，收到 ' + JSON.stringify(process.argv[4]));

const PROBE = `
<div id="probe-out" style="display:none"></div>
<script>
(function () {
  var st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition-duration:0s !important;transition-delay:0s !important}';
  (document.head || document.documentElement).appendChild(st);

  var errs = [];
  window.onerror = function (m, f, l) { errs.push(m + " @" + String(f).split("/").pop() + ":" + l); };
  window.addEventListener("unhandledrejection", function (e) {
    errs.push("unhandled: " + ((e.reason && e.reason.message) || e.reason));
  });

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function choiceOpen() {
    var el = document.getElementById('choice-layer');
    return !!(el && !el.classList.contains('hidden'));
  }
  function pick(i) {
    var list = document.getElementById('choice-list');
    var bs = list ? Array.prototype.slice.call(list.querySelectorAll('button')) : [];
    var b = bs[Math.min(i, bs.length) - 1];
    if (b) { b.click(); return true; }
    return false;
  }
  /* 【关键】扮演"有耐心的玩家"：
     引擎的 advance() 第一步就是 unblock()，所以**无脑狂点会取消 cg/title/wait
     这些有时长的停顿**（CG 会被瞬间跳过，看起来像"没有 CG"）。
     正确做法：只有等待玩家输入（blockKind==='text'）时才推进；
     遇到有时长的 block（cg/title/wait）就让引擎自己的定时器去推进。 */
  function shouldAdvance() {
    var s = VN.state;
    if (s.choice) return false;
    if (!s.waiting) return true;         /* 本帧步骤链已走完，继续下一帧 */
    return s.blockKind === 'text';       /* 等对白时模拟玩家点击 */
  }
  /* 当前 step 类型（帧对象是 {steps,i}） */
  function curStep() {
    try {
      var f = VN.topFrame();
      return (f && f.steps && f.steps[f.i]) || null;
    } catch (e) { return null; }
  }

  async function playChapter(id, cap) {
    var localErrs = [];
    var before = errs.length;
    var cg = 0, choices = 0, bgs = {}, seenSrc = {};
    /* 每个循环采样一次屏幕上真实显示的图层图片路径：
       cg / bg 步骤都是"非阻塞"的，会被 VN.advance() 在内部连续吃掉，
       所以不能靠"在循环顶部看当前 step 类型"来统计，必须看 DOM 实际换了什么图。 */
    function sampleOne(el, visEl) {
      visEl = visEl || el;
      var s = el && el.getAttribute('src');
      if (!s) return;
      /* 只统计"真的显示出来"的那一层：另一个背景元素会残留上一张图的 src，
         若不加这个判断就会把陈图误算成本章看过的图。 */
      if (!visEl.classList.contains('on')) return;
      if (!(parseFloat(getComputedStyle(visEl).opacity) > 0.5)) return;
      /* 归一化时不要假设 src 是哪种写法：setAttribute 出来的是相对路径
         （assets/generated/cg/x.png），属性赋值/浏览器回读出来的是绝对 file:/// 路径，
         两种都要能剥成 cg/x.png —— 否则统计会静默全灭（实测踩过一次）。 */
      var key = s.replace(/^.*assets[\\/\\\\]generated[\\/\\\\]/, '');
      seenSrc[key] = 1;
    }
    function sampleBg() {
      ['bg-a', 'bg-b'].forEach(function (bid) { sampleOne(document.getElementById(bid)); });
      /* 重要事件 CG 自本轮起搬到了独立的 #cg-layer（index.html），不再借道背景层。
         采样必须跟着搬：否则每一章的「CG」列都会是 0，末尾还会报「全程没用 CG 的章节」——
         那是仪器瞎了，不是剧本没写。 */
      sampleOne(document.getElementById('cg-img'), document.getElementById('cg-layer'));
    }
    function onLayers() {
      var rows = ['bg-a', 'bg-b'].map(function (bid) {
        var el = document.getElementById(bid);
        if (!el) return bid + ':-';
        var s = (el.getAttribute('src') || '').split('/').pop() || '-';
        return bid + ':' + (el.classList.contains('on') ? 'ON' : 'off') + ':' + s +
          ':o' + Number(getComputedStyle(el).opacity).toFixed(1);
      });
      var cg = document.getElementById('cg-layer');
      if (cg) {
        var ci = document.getElementById('cg-img');
        rows.push('cg-layer:' + (cg.classList.contains('on') ? 'ON' : 'off') + ':' +
          ((ci && (ci.getAttribute('src') || '').split('/').pop()) || '-') +
          ':o' + Number(getComputedStyle(cg).opacity).toFixed(1));
      }
      return rows.join('  ');
    }
    var onAtStart = onLayers();
    VN.start(id, { fresh: true });
    onAtStart = onAtStart + '  ‖ start后: ' + onLayers();
    if (!VN.state.running) { localErrs.push('VN.start 后 running=false（章节没起来）'); }
    var n = 0;
    while (VN.state.running && n < cap) {
      var cs = curStep();
      if (cs && cs.t === 'cg') { cg++; bgs['cg:' + cs.id] = 1; }
      else if (cs && cs.t === 'bg') { bgs['bg:' + cs.id] = 1; }
      sampleBg();
      if (choiceOpen()) {
        if (pick(${pickIndex})) { choices++; await sleep(30); }
        else { await sleep(30); }
      } else {
        if (shouldAdvance()) {
          try { VN.advance(); } catch (e) { localErrs.push('advance: ' + e.message); break; }
        } else {
          /* 有时长的停顿（CG / 标题卡 / wait）：让它自己走完，同时继续采样 */
          await sleep(30);
        }
      }
      n++;
      await sleep(${stepMs});
    }
    var m = VN.manifest(id) || {};
    return {
      id: id, title: m.title || '', steps: n,
      reachedEnd: !VN.state.running,
      choices: choices,
      cgSteps: cg,
      bgKeys: Object.keys(bgs).length,
      seenBg: Object.keys(seenSrc).filter(function (k) { return k.indexOf('bg/') === 0; }).length,
      seenCg: Object.keys(seenSrc).filter(function (k) { return k.indexOf('cg/') === 0; }),
      seenAll: Object.keys(seenSrc).sort(),
      onAtStart: onAtStart,
      onAtEnd: onLayers(),
      meters: { morale: VN.state.morale, trust: VN.state.trust, hope: VN.state.hope },
      errors: errs.slice(before).concat(localErrs)
    };
  }

  async function main() {
    var list = (VN.manifest && VN.manifest()) || [];
    /* VN.manifest() 传 undefined 时返回全部章节清单（引擎行为）；取不到就退回 20 章 */
    var ids = [];
    if (Array.isArray(list) && list.length) ids = list.map(function (m) { return m.id; });
    if (!ids.length) for (var i = 1; i <= 20; i++) ids.push('ch' + (i < 10 ? '0' + i : i));
    var ONLY = ${ONLY_JSON};
    if (ONLY.length) ids = ids.filter(function (x) { return ONLY.indexOf(x) >= 0; });

    var results = [];
    for (var k = 0; k < ids.length; k++) {
      var r = await playChapter(ids[k], 4000);
      results.push(r);
      document.getElementById('probe-out').textContent =
        '@@PROBE@@' + JSON.stringify({ done: k + 1, total: ids.length, results: results }) + '@@END@@';
    }
    document.getElementById('probe-out').textContent =
      '@@PROBE@@' + JSON.stringify({ done: ids.length, total: ids.length, results: results }) + '@@END@@';
  }

  window.addEventListener('load', function () {
    var t = 0;
    (function boot() {
      t++;
      if (window.VN && VN.start && VN.advance && VN.missingChapters !== undefined) { main(); return; }
      if (t > 200) { document.getElementById('probe-out').textContent = '@@PROBE@@{"fatal":"引擎未就绪"}@@END@@'; return; }
      setTimeout(boot, 150);
    })();
  });
})();
</script>
`;

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const pagePath = path.join(ROOT, `_e2erun_${process.pid}_${Date.now().toString(36)}.html`);
fs.writeFileSync(pagePath, src.replace(/<\/body>/, PROBE + '</body>'), 'utf8');
const pageUrl = 'file:///' + pagePath.replace(/\\/g, '/');

console.log(`通关验证：每章自动点第 ${pickIndex} 个选项，步间隔 ${stepMs}ms，虚拟时间上限 ${budget}ms`);
let out = '';
try {
  out = cp.execFileSync(EDGE, ['--headless=new', '--edge-skip-compat-layer-relaunch',
    '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--disable-extensions', '--window-size=1600,900',
    `--virtual-time-budget=${budget}`, '--dump-dom', pageUrl],
    { encoding: 'utf8', timeout: 900000, maxBuffer: 512 * 1024 * 1024 });
} catch (e) {
  console.log('（浏览器执行失败：' + e.message + '）');
}
try { fs.unlinkSync(pagePath); } catch (e) { /* 忽略 */ }

const m = out.match(/@@PROBE@@([\s\S]*?)@@END@@/);
if (!m) { console.log('未取到结果（虚拟时间可能不够，或引擎启动失败）'); process.exit(1); }
const data = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
if (data.fatal) { console.log('致命：' + data.fatal); process.exit(1); }

console.log('');
console.log('章   标题                步数  走完  选项  背景  CG   报错');
let bad = [];
data.results.forEach((r) => {
  const title = (r.title + '                    ').slice(0, 18);
  console.log(`${r.id}  ${title}  ${String(r.steps).padStart(4)}  ${r.reachedEnd ? ' ✔ ' : ' ✘ '}  ${String(r.choices).padStart(3)}  ${String(r.seenBg).padStart(4)}  ${String(r.seenCg.length).padStart(3)}  ${r.errors.length}`);
  if (!r.reachedEnd || r.errors.length) bad.push(r);
});
console.log('');
const tot = data.results.reduce((a, r) => a + r.steps, 0);
const cgTot = data.results.reduce((a, r) => a + r.seenCg.length, 0);
console.log(`合计：${data.results.length} 章 / ${tot} 步 / 实际渲染的 CG ${cgTot} 张次`);
const noCg = data.results.filter((r) => r.seenCg.length === 0).map((r) => r.id);
if (noCg.length) console.log(`全程没用 CG 的章节：${noCg.join(' ')}`);
if (process.env.LW_SHOW_SEEN) {
  data.results.forEach((r) => {
    console.log(`  ${r.id} 看过的图：${r.seenAll.join(' ')}`);
    console.log(`  ${r.id} 章首图层：${r.onAtStart}`);
    console.log(`  ${r.id} 章末图层：${r.onAtEnd}`);
  });
}
if (bad.length) {
  console.log('');
  console.log('不合格章节：');
  bad.forEach((r) => {
    console.log(`  · ${r.id}：走完=${r.reachedEnd}，步数=${r.steps}`);
    r.errors.slice(0, 6).forEach((e) => console.log('      ' + e));
  });
  process.exit(2);
} else {
  /* 只跑指定的几章（第 5 个参数 ONLY）时，不能说「全部 20 章」——
     那句话会被维护者当作全剧结论读，属于误导性输出。 */
  if (ONLY.length) {
    console.log(`本次只跑了 ${data.results.length} 章（${data.results.map((r) => r.id).join(' ')}），`
      + '全部从头走到结尾，且无 JS 报错。');
  } else {
    console.log('全部 20 章均从头走到结尾，且无 JS 报错。');
  }
}
