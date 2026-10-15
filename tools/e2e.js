#!/usr/bin/env node
/* ==========================================================================
 * 《长征·万水千山》端到端冒烟测试（无头 Edge）
 *   node tools/e2e.js                 # 启动 → 标题 → 逐章自动推进 → 截图
 *   node tools/e2e.js --shot-only     # 只截标题画面
 * 产物：tmp/e2e/e2e.html、tmp/e2e/01-title.png、tmp/e2e/02-chNN.png、
 *       tmp/e2e/report.json
 * 文件所有权：root。仅开发期使用。
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tmp', 'e2e');
fs.mkdirSync(OUT, { recursive: true });

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(p => fs.existsSync(p));
if (!EDGE) { console.error('找不到 Edge/Chrome，无法运行 e2e。'); process.exit(2); }

/* 每次运行必须用独立的 user-data-dir：否则 Edge 会附到已存在的实例上，
 * --window-size 被忽略，页面按默认的 750×485 渲染 —— 截图会小得莫名其妙。 */
const PROFILE = path.join(OUT, 'profile-' + process.pid);
fs.mkdirSync(PROFILE, { recursive: true });
const PROFILE_ARG = '--user-data-dir=' + PROFILE;

/* 读取 manifest 拿到章节清单 */
function manifest() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'story', 'manifest.js'), 'utf8');
  const sandbox = { window: {} };
  require('vm').runInNewContext(src, sandbox);
  return sandbox.window.STORY.__manifest;
}
const MAN = manifest();

/* 探针页面放在**项目根目录**：manifest 里的章节路径是相对根目录写的，
 * 若把探针放进子目录，引擎按相对路径加载 src/story/chNN.js 会全部 404。
 * 这里直接取真实的 index.html，在 </body> 前注入驱动器。 */
const PAGE = path.join(ROOT, '_e2e.html');

const driver = `
<script>
(function () {
  var LOG = { errors: [], missingScripts: [], chapters: [], steps: 0, shots: [] };
  window.__E2E = LOG;
  window.addEventListener('error', function (e) {
    LOG.errors.push(String((e && e.message) || e));
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    LOG.errors.push('unhandledrejection: ' + String((e && e.reason) || e));
  });
  /* 记录加载失败的脚本 */
  Array.prototype.slice.call(document.querySelectorAll('script[src]')).forEach(function (s) {
    s.addEventListener('error', function () { LOG.missingScripts.push(s.getAttribute('src')); });
  });
  function finish() {
    LOG.pageTitle = document.title;
    LOG.overlayText = (function () {
      var ov = document.getElementById('overlay');
      return ov ? (ov.textContent || '').trim().slice(0, 60) : null;
    })();
    var pre = document.createElement('pre');
    pre.id = 'e2e-report';
    pre.style.cssText = 'position:fixed;left:-99999px;top:0';
    pre.textContent = '###E2E###' + JSON.stringify(LOG) + '###END###';
    document.body.appendChild(pre);
    document.title = 'E2E-DONE';
  }
  window.__e2eFinish = function () {
    var old = document.getElementById('e2e-report');
    if (old) old.parentNode.removeChild(old);
    LOG.assets = LOG.assets || null;
    finish();
  };
  function advance(n) {
    /* 用「点击舞台」推进对话；引擎在打点时点击=立即全显，再点=推进 */
    var stage = document.getElementById('stage') || document.body;
    for (var i = 0; i < n; i++) {
      var ev = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 640, clientY: 600 });
      stage.dispatchEvent(ev);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      LOG.steps++;
    }
  }
  window.__e2eRun = function (chapterId, taps, cb) {
    try {
      function snapshot() {
        function im(el) {
          if (!el) return null;
          return { src: (el.getAttribute('src') || '').slice(-58), w: el.naturalWidth || 0,
                   op: getComputedStyle(el).opacity, vis: getComputedStyle(el).visibility,
                   z: getComputedStyle(el).zIndex };
        }
        var slots = {};
        Array.prototype.slice.call(document.querySelectorAll('#char-layer .slot')).forEach(function (s) {
          var i2 = s.querySelector('img');
          slots[s.getAttribute('data-slot')] = {
            src: i2 ? (i2.getAttribute('src') || '').slice(-40) : '',
            w: i2 ? (i2.naturalWidth || 0) : 0, cls: s.className,
            op: i2 ? getComputedStyle(i2).opacity : '-' };
        });
        var nm = document.getElementById('name-text');
        var tx = document.getElementById('text-main');
        return {
          bgA: im(document.getElementById('bg-a')), bgB: im(document.getElementById('bg-b')),
          slots: slots, speaker: nm ? nm.textContent : '',
          text: tx ? tx.textContent.slice(0, 36) : '',
          dialogueCls: document.getElementById('dialogue') ? document.getElementById('dialogue').className : ''
        };
      }
      window.__e2eSnapshot = snapshot;
  /* 按可见文字点击界面上的按钮/菜单项（用于覆盖层各页的截图） */
  window.__e2eClick = function (label) {
    var all = document.querySelectorAll('button, a, li, [class*="menu"], [class*="item"], [class*="btn"], #overlay div');
    for (var i = 0; i < all.length; i++) {
      var t = (all[i].textContent || '').trim();
      if (t.indexOf(label) !== 0) continue;
      var el = all[i], guard = 0;
      while (el && guard++ < 6 && t.length > label.length + 8) { el = el.parentNode; }
      try { (el || all[i]).click(); return true; } catch (e) { }
    }
    return false;
  };
      var VN = window.VN;
      if (!VN) { LOG.errors.push('window.VN 不存在'); return cb(); }
      LOG.running = true;
      if (VN.ui && VN.ui.hideOverlay) VN.ui.hideOverlay();
      VN.start(chapterId);
      var t = 0;
      var timer = setInterval(function () {
        advance(6);
        t += 6;
        if (t >= taps) {
          clearInterval(timer);
          setTimeout(function () { LOG.assets = snapshot(); LOG.running = false; cb(); if (window.__e2eFinish) window.__e2eFinish(); }, 600);
        }
      }, 60);
    } catch (e) { LOG.errors.push('run(' + chapterId + '): ' + e.message); cb(); }
  };
  window.addEventListener('load', function () {
    setTimeout(function () {
      LOG.booted = !!(window.VN && window.VN.state);
      LOG.manifest = (window.STORY && window.STORY.__manifest || []).length;
      LOG.loadedChapters = (window.STORY && window.STORY.__manifest || [])
        .filter(function (c) { return !!window.STORY[c.id]; }).map(function (c) { return c.id; });
      LOG.missingChapters = (window.STORY && window.STORY.__manifest || [])
        .filter(function (c) { return !window.STORY[c.id]; }).map(function (c) { return c.id; });
      LOG.assetProbe = {};
      if (VN && VN.missingChapters) LOG.engineMissing = VN.missingChapters.slice();
      if (!LOG.running) finish();
    }, 3500);
  });
})();
</script>
`;

const BASE_HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
/* 无头 + 虚拟时间下 CSS transition 的推进不可靠，截图会停在 opacity:0 的初始帧。
 * 测试页里统一关掉 transition/animation，让每一帧都是终态。 */
const NOTRANS = '<style>*,*::before,*::after{transition:none !important;animation:none !important;}</style>';
const html = BASE_HTML.replace('</head>', NOTRANS + '</head>').replace('</body>', driver + '</body>');
fs.writeFileSync(PAGE, html, 'utf8');

function shot(name, w, h, budget, extraJs) {
  let page = PAGE;
  if (extraJs) {
    const p2 = path.join(ROOT, '_e2e-' + name + '.html');
    fs.writeFileSync(p2, html.replace('</body>', `<script>${extraJs}</script></body>`), 'utf8');
    page = p2;
  }
  const url = 'file:///' + page.replace(/\\/g, '/');
  const png = path.join(OUT, name + '.png');
  cp.execFileSync(EDGE, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    PROFILE_ARG,
    `--window-size=${w},${h}`,
    `--virtual-time-budget=${budget}`,
    `--screenshot=${png}`, url
  ], { stdio: 'ignore', timeout: 120000 });
  return png;
}

function domDump(extraJs, budget, size) {
  const p2 = path.join(ROOT, '_e2e-dom.html');
  fs.writeFileSync(p2, html.replace('</body>', `<script>${extraJs}</script></body>`), 'utf8');
  const url = 'file:///' + p2.replace(/\\/g, '/');
  const out = cp.execFileSync(EDGE, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    PROFILE_ARG,
    `--window-size=${size || '1600,900'}`,
    `--virtual-time-budget=${budget}`, '--dump-dom', url
  ], { encoding: 'utf8', timeout: 120000, maxBuffer: 1 << 28 });
  /* 只取探针 <pre id="e2e-report"> 的内容（页面里还有驱动脚本的源码，不能误匹配） */
  const m = out.match(/<pre id="e2e-report"[^>]*>###E2E###([\s\S]*?)###END###<\/pre>/);
  if (!m) return null;
  const json = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
  try { return JSON.parse(json); } catch (e) { return { parseError: e.message, raw: json.slice(0, 400) }; }
}

const shotOnly = process.argv.includes('--shot-only');
const probeIdx = process.argv.indexOf('--probe');
const uiMode = process.argv.includes('--ui');
/* --run <jsFile>：把该文件里的 JS 注入页面后再 dump 报告，用于精确调试 */
const runIdx = process.argv.indexOf('--run');

if (runIdx >= 0) {
  const jsFile = process.argv[runIdx + 1];
  const extra = fs.readFileSync(path.resolve(ROOT, jsFile), 'utf8');
  const shotIdx = process.argv.indexOf('--shotjs');
  if (shotIdx >= 0) {
    const p = shot('runjs', 1600, 900, 14000, extra);
    console.log('截图：' + p);
  } else {
    const st = domDump(extra, 14000);
    console.log(JSON.stringify(st, null, 1));
  }
  ['_e2e.html', '_e2e-dom.html'].forEach(f => { const p = path.join(ROOT, f); if (fs.existsSync(p)) fs.unlinkSync(p); });
  fs.readdirSync(ROOT).filter(f => /^_e2e-.*\.html$/.test(f)).forEach(f => fs.unlinkSync(path.join(ROOT, f)));
  process.exit(0);
}

if (uiMode) {
  const labels = ['人物图鉴', '史料档案', '章节选择', '插画画廊', '设置', '关于本作'];
  const calls = ['VN.gallery.showChars()', 'VN.gallery.showArchives()', 'VN.ui.showChapterSelect()',
    'VN.gallery.showArt()', 'VN.ui.showSettings()', 'VN.ui.showAbout()'];
  const names = ['gallery', 'archive', 'chapters', 'cg', 'settings', 'about'];
  console.log('· 采集引导状态…');
  console.log('  ' + JSON.stringify(domDump('', 9000)));
  labels.forEach((label, i) => {
    const js = `window.addEventListener('load',function(){setTimeout(function(){` +
      `try{${calls[i]}}catch(e){document.title='ERR '+e.message;} },900);});`;
    const name = 'ui-' + (i + 1) + '-' + names[i];
    try { shot(name, 1600, 900, 9000, js); console.log('  ✓ ' + label + ' → tmp/e2e/' + name + '.png'); }
    catch (e) { console.log('  × ' + label + '：' + e.message.split('\n')[0]); }
  });
  ['_e2e.html', '_e2e-dom.html'].forEach(f => { const p = path.join(ROOT, f); if (fs.existsSync(p)) fs.unlinkSync(p); });
  fs.readdirSync(ROOT).filter(f => /^_e2e-.*\.html$/.test(f)).forEach(f => fs.unlinkSync(path.join(ROOT, f)));
  process.exit(0);
}

if (probeIdx >= 0) {
  const id = process.argv[probeIdx + 1] || 'ch01';
  const taps = parseInt(process.argv[probeIdx + 2] || '220', 10);
  const js = `window.addEventListener('load',function(){setTimeout(function(){window.__e2eRun('${id}',${taps},function(){});},1200);});`;
  console.log('· 探针 ' + id + '，推进 ' + taps + ' 次…');
  const st = domDump(js, 45000);
  if (!st) { console.log('无报告'); }
  else {
    console.log('errors         : ' + JSON.stringify(st.errors));
    console.log('missingScripts : ' + JSON.stringify(st.missingScripts));
    console.log('loadedChapters : ' + JSON.stringify(st.loadedChapters));
    console.log('画面状态       : ' + JSON.stringify(st.assets, null, 1));
  }
  shot('probe-' + id, 1600, 900, 45000, js);
  console.log('截图：' + path.join(OUT, 'probe-' + id + '.png'));
  ['_e2e.html', '_e2e-dom.html'].forEach(f => { const p = path.join(ROOT, f); if (fs.existsSync(p)) fs.unlinkSync(p); });
  process.exit(0);
}

console.log('· 采集引导状态…');
const boot = domDump('', 9000);
console.log(JSON.stringify(boot, null, 2));

console.log('· 截标题画面…');
shot('01-title', 1600, 900, 9000);

if (!shotOnly) {
  const playable = (boot && boot.loadedChapters || []).slice(0, 3);
  for (const id of playable) {
    console.log('· 试玩 ' + id + ' …');
    const js = `window.addEventListener('load',function(){setTimeout(function(){window.__e2eRun('${id}',240,function(){});},1200);});`;
    shot('02-' + id, 1600, 900, 26000, js);
    try {
      const st = domDump(js, 30000);
      console.log('  画面状态：' + JSON.stringify((st && st.assets) || (st && st.parseError) || null));
    } catch (e) {
      console.log('  画面状态：探针超时（' + e.message.split('\n')[0] + '）');
    }
  }
  if (!playable.length) console.log('  （盘上还没有任何章节文件，跳过试玩）');
}

console.log('\n产物目录：' + OUT);

/* 清理根目录下的临时探针页面，避免污染工作区 */
['_e2e.html', '_e2e-dom.html'].forEach(f => {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});
fs.readdirSync(ROOT).filter(f => /^_e2e-.*\.html$/.test(f)).forEach(f => {
  fs.unlinkSync(path.join(ROOT, f));
});
