/* 开发期：把 index.html 复制成带自动推进脚本的探针页并截图。
 * 用法：node tools/_shotgame.js <out.png> <chapter> <steps>
 */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { EDGE } = require('./qa-shot.js');

const ROOT = path.resolve(__dirname, '..');
const outPng = path.resolve(ROOT, process.argv[2] || 'tmp/gameshot.png');
const chap = process.argv[3] || 'ch01';
const steps = parseInt(process.argv[4] || '45', 10);

let dom = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const inject = `
<style>*,*::before,*::after{transition:none !important;animation:none !important;}</style>
<script>
window.__log = [];
window.addEventListener('error', function (e) { window.__log.push('ERR ' + e.message + ' @' + e.lineno); });
window.addEventListener('load', function () {
  setTimeout(function () {
    try { VN.start(${JSON.stringify(chap)}); } catch (e) { window.__log.push('START ' + e.message); }
    var i = 0;
    var t = setInterval(function () {
      try {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
      } catch (e) { window.__log.push('KEY ' + e.message); }
      if (++i >= ${steps}) {
        clearInterval(t);
        var d = document.createElement('pre');
        d.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;color:#0f0;font:12px monospace;background:#000c;margin:0;padding:3px';
        d.textContent = window.__log.join('\\n') || 'no-errors';
        document.body.appendChild(d);
      }
    }, 30);
  }, 350);
});
</script>
`;
dom = dom.replace('</body>', inject + '</body>');
const probe = path.join(ROOT, '_probe.html');
fs.writeFileSync(probe, dom, 'utf8');
fs.mkdirSync(path.dirname(outPng), { recursive: true });
try { fs.unlinkSync(outPng); } catch (e) { /* 首次运行无旧文件 */ }
cp.execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--window-size=1600,900', '--screenshot=' + outPng, '--virtual-time-budget=16000',
  'file:///' + probe.replace(/\\/g, '/')], { stdio: 'ignore', timeout: 120000 });
console.log(outPng);
