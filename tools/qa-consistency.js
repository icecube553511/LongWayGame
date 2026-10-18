#!/usr/bin/env node
/* ============================================================
 * tools/qa-consistency.js —— 全剧"舞台一致性"探针
 *
 * 通关验证（tools/e2e-run.js）只回答"能不能走完、有没有报错"。
 * 本工具回答的是内容层的问题：**玩家实际看到的每一句台词，
 * 屏幕上的人和姓名条对不对得上**。
 *
 * 做法：真浏览器里逐章走完，每次 advance 后若 VN.state.history
 * 新增了一条对白记录，就同步抓一份 DOM 快照（台上立绘 / 姓名条），
 * 把"这一句"和"这一刻的画面"绑在一起。然后逐条判定：
 *
 *   1) 说话人不在台上 —— say/think 的 who 没有任何可见立绘
 *      （群众与旁白 id 不算：soldiers/villagers/yi_people/narrator）
 *   2) 同屏重复立绘 —— 同一个角色同时出现在两个槽位
 *   3) 立绘缺图 —— src 已设置但 naturalWidth==0（文件缺失/坏图）
 *   4) 背景缺图 —— 当前显示层 naturalWidth==0
 *   5) 姓名条与台词类型不符 —— 旁白却显示姓名条 / 有说话人却隐藏姓名条
 *
 * 用法：
 *   node tools/qa-consistency.js [选项索引=1] [步间隔ms=6] [虚拟时间上限=900000] [只跑章节,ch01,ch20]
 *   node tools/qa-consistency.js 2 6 900000 ch13
 *
 * 退出码：0 = 无违规；2 = 有违规。
 * 由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { EDGE, ROOT } = require(path.join(__dirname, 'shot2.js'));

const pickIndex = parseInt(process.argv[2] || '1', 10);
const stepMs = parseInt(process.argv[3] || '6', 10);
const budget = parseInt(process.argv[4] || '900000', 10);
const ONLY = (process.argv[5] || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY_JSON = JSON.stringify(ONLY);

/* 群众 / 旁白：允许"有人声没立绘" */
const CROWD = ['soldiers', 'villagers', 'yi_people', 'narrator'];
const CROWD_JSON = JSON.stringify(CROWD);

const PROBE = `
<div id="probe-out" style="display:none"></div>
<script>
(function () {
  var CROWD = ${CROWD_JSON};
  var errs = [];
  window.onerror = function (m, f, l) { errs.push('JS: ' + m + ' @' + String(f).split('/').pop() + ':' + l); };
  window.addEventListener('unhandledrejection', function (e) {
    errs.push('rejection: ' + ((e.reason && e.reason.message) || e.reason));
  });

  var PICK = ${pickIndex};
  var STEPMS = ${stepMs};
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
  function shouldAdvance() {
    var s = VN.state;
    if (s.choice) return false;
    if (!s.waiting) return true;
    return s.blockKind === 'text';
  }
  function charOf(file) {
    return String(file || '').replace(/_(calm|stern|smile|sad|worry|fierce|weak|dawn)\\.svg$/, '');
  }
  function slots() {
    return Array.prototype.slice.call(document.querySelectorAll('#char-layer .slot')).map(function (sl) {
      var im = sl.querySelector('img');
      var src = (im && im.getAttribute('src')) || '';
      /* 判定"在台上"以引擎自己的簿记为准：showChar 在 onload 里写 dataset.who/empty='0'，
         hideChar 写 empty='1'/who=''。不看 class、也不看 computed opacity——
         两者都受 CSS transition 影响，会把"刚上屏、还在淡入"误判成不在台上。 */
      var bookkept = !!(sl.dataset.who && sl.dataset.empty !== '1');
      var vis = bookkept && sl.classList.contains('on');
      return {
        slot: sl.dataset.slot,
        id: bookkept ? sl.dataset.who : '',
        on: bookkept,
        vis: vis,
        file: src.split('/').pop() || '',
        complete: im ? !!im.complete : false,
        nw: im ? im.naturalWidth : 0
      };
    });
  }
  /* 等"这一步画完"。
     引擎是 new Image() 再 onload 才把 src 挂到槽位上，所以在 onload 之前
     那个 Image 对象**不在 DOM 里**，光看"已挂载的 img 是否 complete"会提前返回。
     因此这里等到：说话人已经在台上（或超时），且已挂载的图片都解码完。

     上限从 1.2s（48×25ms）放宽到 4s（160×25ms）—— 由 root 修改，原因是一次实证：
     全 20 章串跑时偶发「[ch15] xiaoman 说话但台上没有他的立绘」，而
     ch15 单章跑两次、ch14→ch15 串章跑一次都**干净**；现场是 ch15 第 61-62 步
     的 show xiaoman / show he_xiaomei 紧跟第 63 步 say，引擎要等
     new Image().onload（见 engine.js:395）才会写 dataset.who。
     也就是说：这条判定依赖"本地图片解码能在上限内完成"，而 56MB 立绘 PNG 在
     机器有负载（并行跑第二个探针 / 解码排队）时会越过 1.2s，于是**工具说谎**。
     放宽上限不影响正常路径：正常情况第一轮就满足 onStage 且无 pending，直接提前返回，
     只有"判定为不在台上"时才把等待烧满 —— 那正是需要给图片时间的情形。
     另外：这条也和"群众说话时循环卡死"无关，群众 id 直接算进 onStage。

     **没有闭环，别当已修**：放宽到 4s 后仍实测到 1 次同签名误报（4s 下 9 次全章跑里 1 次，
     1.2s 下 3 次里 1 次），所以"等待不够"只是部分解释。剩下的部分我查不出来：
     ch15 单章 2 次、ch14→ch15 串章 1 次、加固后全章 6 连跑都干净，
     抓不到"正在违规"那一瞬的现场快照（工具只在判定后写 dump，违规那一刻的槽位状态没留住）。
     可疑机制（未证实）：showChar 的簿记写在 image.onload 里，而 slotOf() 在
     "请求的槽已被别人占了"时可能返回 null → show 被静默丢弃；两个背靠背 show
     的簿记落点不同就可能在某一帧读到"没人"。要证实，需要在违规瞬间 dump
     #char-layer 三个槽的 dataset + img.complete。 */
  async function settle(who) {
    for (var i = 0; i < 160; i++) {
      var imgs = Array.prototype.slice.call(document.querySelectorAll('#char-layer .slot img'))
        .filter(function (im) { return im.getAttribute('src'); });
      var pending = imgs.filter(function (im) { return !im.complete; });
      var onStage = !who || CROWD.indexOf(who) >= 0 ||
        Array.prototype.slice.call(document.querySelectorAll('#char-layer .slot'))
          .some(function (sl) { return sl.dataset.who === who && sl.dataset.empty !== '1'; });
      if (onStage && !pending.length) { await sleep(30); return; }
      await sleep(25);
    }
    await sleep(30);
  }
  function bgHealth() {
    return ['bg-a', 'bg-b'].map(function (bid) {
      var el = document.getElementById(bid);
      if (!el) return { id: bid, miss: true };
      var src = el.getAttribute('src') || '';
      var on = el.classList.contains('on');
      return { id: bid, on: on, file: src.split('/').pop() || '', nw: el.naturalWidth, complete: !!el.complete };
    }).filter(function (b) { return b.on && b.file; });
  }
  function snap(h) {
    var sl = slots();
    var vis = sl.filter(function (s) { return s.id; });
    var count = {};
    vis.forEach(function (s) { count[s.id] = (count[s.id] || 0) + 1; });
    var plate = document.getElementById('name-plate');
    return {
      kind: h.kind || '',
      who: h.who || '',
      name: h.name || '',
      text: String(h.text || '').slice(0, 46),
      onStage: vis.map(function (s) { return s.slot + '=' + s.id; }),
      speakerOn: !h.who || CROWD.indexOf(h.who) >= 0 ||
        vis.some(function (s) { return s.id === h.who; }),
      crowd: CROWD.indexOf(h.who) >= 0,
      dup: Object.keys(count).filter(function (k) { return count[k] > 1; }),
      brokenChar: vis.filter(function (s) { return !s.complete || s.nw === 0; })
        .map(function (s) { return s.slot + ':' + s.file; }),
      namePlateHidden: !!(plate && plate.classList.contains('hidden')),
      bg: bgHealth().filter(function (b) { return !b.complete || b.nw === 0; })
        .map(function (b) { return b.id + ':' + b.file; })
    };
  }

  async function playChapter(id, cap) {
    var before = errs.length;
    var rec = [];
    var localErrs = [];
    var choices = 0, picks = [];
    VN.start(id, { fresh: true });
    if (!VN.state.running) localErrs.push('VN.start 后 running=false（章节没起来）');
    var n = 0;
    while (VN.state.running && n < cap) {
      if (choiceOpen()) {
        if (pick(PICK)) {
          choices++;
          var list = document.getElementById('choice-list');
          var b = list && list.querySelectorAll('button')[Math.min(PICK, list.querySelectorAll('button').length) - 1];
          picks.push(((b && b.innerText) || '').replace(/\\s+/g, ' ').trim().slice(0, 30));
        }
        await sleep(30);
      } else if (shouldAdvance()) {
        var h0 = VN.state.history.length;
        try { VN.advance(); } catch (e) { localErrs.push('advance: ' + e.message); break; }
        if (VN.state.history.length > h0) {
          var h = VN.state.history[VN.state.history.length - 1];
          /* 立绘/背景都是"先 new Image() 再 onload 上屏"，要等这一步真正画出来再快照。
             这一步是阻塞的（等玩家点击），等待期间引擎不会自己往下走。 */
          await settle(h.who);
          var s = snap(h);
          s.ch = id;
          s.n = n;
          rec.push(s);
        }
      } else {
        await sleep(25);
      }
      n++;
      await sleep(STEPMS);
    }
    return {
      id: id, steps: n, reachedEnd: !VN.state.running, choices: choices, picks: picks,
      lines: rec.length, errors: errs.slice(before).concat(localErrs), rec: rec
    };
  }

  async function main() {
    var list = (VN.manifest && VN.manifest()) || [];
    var ids = [];
    if (Array.isArray(list) && list.length) ids = list.map(function (m) { return m.id; });
    if (!ids.length) for (var i = 1; i <= 20; i++) ids.push('ch' + (i < 10 ? '0' + i : i));
    var ONLY = ${ONLY_JSON};
    if (ONLY.length) ids = ids.filter(function (x) { return ONLY.indexOf(x) >= 0; });
    var out = [];
    for (var k = 0; k < ids.length; k++) {
      var r = await playChapter(ids[k], 4000);
      out.push(r);
      /* 逐章回吐，避免最后一次性序列化过大 */
      document.getElementById('probe-out').textContent =
        '@@PROBE@@' + JSON.stringify({ done: k + 1, total: ids.length, results: out }) + '@@END@@';
    }
    document.getElementById('probe-out').textContent =
      '@@PROBE@@' + JSON.stringify({ done: ids.length, total: ids.length, results: out }) + '@@END@@';
  }

  window.addEventListener('load', function () {
    var t = 0;
    (function boot() {
      t++;
      if (window.VN && VN.start && VN.advance && VN.state) { main(); return; }
      if (t > 200) { document.getElementById('probe-out').textContent = '@@PROBE@@{"fatal":"引擎未就绪"}@@END@@'; return; }
      setTimeout(boot, 150);
    })();
  });
})();
</script>
`;

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const pagePath = path.join(ROOT, `_qa_${process.pid}_${Date.now().toString(36)}.html`);
fs.writeFileSync(pagePath, src.replace(/<\/body>/, PROBE + '</body>'), 'utf8');
const pageUrl = 'file:///' + pagePath.replace(/\\/g, '/');

console.log(`舞台一致性检查：每章自动点第 ${pickIndex} 个选项，步间隔 ${stepMs}ms`);
let out = '';
try {
  out = cp.execFileSync(EDGE, ['--headless=new', '--edge-skip-compat-layer-relaunch',
    '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--disable-extensions', '--window-size=1600,900',
    `--virtual-time-budget=${budget}`, '--dump-dom', pageUrl],
    { encoding: 'utf8', timeout: 900000, maxBuffer: 1024 * 1024 * 1024 });
} catch (e) {
  console.log('（浏览器执行失败：' + e.message + '）');
}
try { fs.unlinkSync(pagePath); } catch (e) { /* 忽略 */ }

const m = out.match(/@@PROBE@@([\s\S]*?)@@END@@/);
if (!m) { console.log('未取到结果（虚拟时间可能不够，或引擎启动失败）'); process.exit(1); }
const data = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'"));
if (data.fatal) { console.log('致命：' + data.fatal); process.exit(1); }

/* ---------------- 判定 ---------------- */
function violations(rec) {
  const v = [];
  rec.forEach((r) => {
    if (r.kind === 'narr') {
      if (!r.namePlateHidden) v.push(['姓名条', '旁白却显示了姓名条', r]);
      return;
    }
    if (r.namePlateHidden) v.push(['姓名条', '有说话人却隐藏了姓名条', r]);
    if (!r.speakerOn) v.push(['不在台上', (r.crowd ? '[群众]' : '') + r.who + ' 说话但台上没有他的立绘', r]);
    if (r.dup.length) v.push(['重复立绘', '同屏重复：' + r.dup.join(','), r]);
    if (r.brokenChar.length) v.push(['缺立绘', r.brokenChar.join(' '), r]);
    if (r.bg.length) v.push(['缺背景', r.bg.join(' '), r]);
  });
  return v;
}

console.log('');
console.log('章    标题                台词数  走完  选项  违规  报错');
let totalV = 0, totalBad = 0, totalLines = 0;
const detail = [];
data.results.forEach((r) => {
  const v = violations(r.rec);
  const nErr = r.errors.length;
  totalV += v.length;
  totalLines += r.lines;
  if (v.length || nErr || !r.reachedEnd) totalBad++;
  console.log(`${r.id}  ${String(r.steps).padStart(4)}步  ${String(r.lines).padStart(4)}  ${r.reachedEnd ? ' ✔ ' : ' ✘ '}  ${String(r.choices).padStart(3)}  ${String(v.length).padStart(3)}  ${nErr}`);
  v.forEach((x) => detail.push({ ch: r.id, kind: x[0], msg: x[1], who: x[2].who, text: x[2].text }));
  r.errors.forEach((e) => detail.push({ ch: r.id, kind: 'JS报错', msg: e, who: '', text: '' }));
});

console.log('');
console.log(`合计：${data.results.length} 章 / 共 ${totalLines} 句台词 / 违规 ${totalV} 条`);
if (detail.length) {
  const byKind = {};
  detail.forEach((d) => { byKind[d.kind] = (byKind[d.kind] || 0) + 1; });
  console.log('分类：' + Object.keys(byKind).map((k) => k + ' ' + byKind[k]).join(' · '));
  console.log('');
  console.log('前 40 条明细：');
  detail.slice(0, 40).forEach((d, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. [${d.ch}] ${d.kind}｜${d.msg}｜${d.who ? d.who + '：' : ''}${d.text}`);
  });
  if (detail.length > 40) console.log(`  …… 另有 ${detail.length - 40} 条`);
}
if (process.env.LW_DUMP) {
  fs.writeFileSync(path.join(ROOT, 'tmp', 'qa-consistency.json'), JSON.stringify(data, null, 1), 'utf8');
  console.log('明细已写入 tmp/qa-consistency.json');
}
if (totalBad) { console.log(''); console.log('有违规章节：' + totalBad); process.exit(2); }
console.log('全过程没有发现舞台一致性问题。');
