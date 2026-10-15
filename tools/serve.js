/* 本地预览服务器（零依赖）。
 * 用法：node tools/serve.js [端口]     默认 8788
 * 打开 http://127.0.0.1:<端口>/
 * 说明：游戏本身双击 index.html 也能跑（file://），此服务器只是为了
 *       某些浏览器对 file:// 的更严格限制时使用。
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2] || 8788);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2'
};

const server = http.createServer(function (req, res) {
  let p = decodeURIComponent(url.parse(req.url).pathname || '/');
  if (p === '/') p = '/index.html';
  const abs = path.join(ROOT, path.normalize(p).replace(/^([/\\])+/, ''));
  if (!abs.startsWith(ROOT)) { res.writeHead(403); res.end('403'); return; }
  fs.readFile(abs, function (err, buf) {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('404 ' + p);
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, '127.0.0.1', function () {
  console.log('《长征·万水千山》预览： http://127.0.0.1:' + PORT + '/');
  console.log('（Ctrl+C 停止）');
});
