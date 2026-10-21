'use strict';

/* 仅供本机打包排障：把预下载的 electron-builder 工具包通过 127.0.0.1 提供。
 * electron-builder 仍会按内置 SHA-256 校验归档；此服务不修改归档内容。
 */

const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(process.env.LW_BINARIES_DIR || path.join(__dirname, '.cache-binaries'));
const port = Number(process.env.LW_BINARIES_PORT || 0);

if (!fs.existsSync(root)) {
  console.error('工具包目录不存在：' + root);
  process.exit(1);
}

const server = http.createServer(function (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }
  const name = path.basename(decodeURIComponent((req.url || '').split('?')[0]));
  const file = path.join(root, name);
  if (!name || path.dirname(file) !== root || !fs.existsSync(file)) {
    console.log('MISS ' + name);
    res.writeHead(404);
    res.end();
    return;
  }
  console.log('GET ' + name);
  const stat = fs.statSync(file);
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': 'no-store'
  });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    fs.createReadStream(file).pipe(res);
  }
});

server.listen(port, '127.0.0.1', function () {
  console.log('BINARIES_READY ' + server.address().port);
});
