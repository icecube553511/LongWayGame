#!/usr/bin/env node
/* ============================================================
 * tools/e2e-shot.js —— 真浏览器端到端冒烟测试
 *
 *   node tools/e2e-shot.js ch16            # 跳到第 16 章并截图
 *   node tools/e2e-shot.js ch16 8000       # 指定虚拟时间预算（ms）
 *   node tools/e2e-shot.js title           # 只截标题画面
 *
 * 做法：把 index.html 复制成仓库根目录下的 `_e2e.html`（保证相对路径可用），
 * 在末尾注入一段探针脚本：捕获 window.onerror、跳到指定章节、并把统计写进页面，
 * 然后用无头 Edge 截图。截图里能直接看到报错横幅与对白/立绘/状态条是否正确。
 * 由 root 维护。
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const qa = require(path.join(__dirname, 'qa-shot.js'));

const ROOT = qa.ROOT;
const target = process.argv[2] || 'title';
const virtualMs = parseInt(process.argv[3] || '6000', 10);

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const probe =
  '\n<script>\n' +
  '(function () {\n' +
  '  var errs = [];\n' +
  '  window.onerror = function (m, f, l) { errs.push(m + " @" + String(f).split("/").pop() + ":" + l); };\n' +
  '  window.addEventListener("unhandledrejection", function (e) { errs.push("unhandled: " + (e.reason && e.reason.message || e.reason)); });\n' +
  '  function banner() {\n' +
  '    var d = document.createElement("div");\n' +
  '    d.style.cssText = "position:fixed;left:0;top:0;z-index:99999;background:#b00020;color:#fff;font:14px/1.5 monospace;padding:6px 10px;max-width:100%";\n' +
  '    var st = (window.VN && VN.state) ? (VN.state.chapter + " / frame " + (VN.state.frames && VN.state.frames.length)) : "(no VN)";\n' +
  '    d.textContent = "JS 错误 " + errs.length + " 条 ｜ " + st + " ｜ " + errs.slice(0, 3).join(" ｜ ");\n' +
  '    d.style.background = errs.length ? "#b00020" : "#0b6b32";\n' +
  '    document.body.appendChild(d);\n' +
  '  }\n' +
  '  window.addEventListener("load", function () {\n' +
  '    var target = ' + JSON.stringify(target) + ';\n' +
  '    var tries = 0;\n' +
  '    /* 引擎 boot 完成时间不确定，轮询到 VN.start 可用为止 */\n' +
  '    (function boot() {\n' +
  '      tries++;\n' +
  '      if (target !== "title" && window.VN && VN.start) {\n' +
  '        try { VN.start(target, { fresh: true }); } catch (e) { errs.push("start: " + e.message); }\n' +
  '        setTimeout(banner, 2500);\n' +
  '        return;\n' +
  '      }\n' +
  '      if (tries > 60) { setTimeout(banner, 400); return; }\n' +
  '      setTimeout(boot, 200);\n' +
  '    })();\n' +
  '  });\n' +
  '})();\n' +
  '</script>\n';

const pagePath = path.join(ROOT, '_e2e.html');
fs.writeFileSync(pagePath, src.replace('</body>', probe + '</body>'), 'utf8');

const out = path.join(ROOT, 'tmp', 'e2e_' + target + '.png');
qa.shot('<body style="margin:0"><iframe src="file:///' + pagePath.replace(/\\/g, '/') +
  '" style="border:0;width:1600px;height:900px"></iframe></body>', out, 1600, 900, virtualMs);
fs.unlinkSync(pagePath);
console.log(out);
