'use strict';

/* 《长征·万水千山》Windows 单文件便携版构建。
 * 桌面依赖只存在于本目录，游戏运行期仍不联网、不读取外部素材。
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DESKTOP = __dirname;
const ROOT = path.resolve(DESKTOP, '..');
const STAGE = path.join(DESKTOP, '.stage');
const OUTPUT = path.join(ROOT, 'dist', 'exe');
const BUILDER = path.join(DESKTOP, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js');
const ICON = path.join(DESKTOP, 'assets', 'icon.ico');
const APP_FILES = ['index.html', 'css', 'src', 'assets'];

function fail(message) {
  console.error('[桌面打包] ' + message);
  process.exit(1);
}

function assertInside(parent, target) {
  const relative = path.relative(parent, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    fail('拒绝操作构建目录之外的路径：' + target);
  }
}

function prepareStage() {
  assertInside(DESKTOP, STAGE);
  fs.rmSync(STAGE, { recursive: true, force: true });
  fs.mkdirSync(STAGE, { recursive: true });

  APP_FILES.forEach(function (name) {
    const source = path.join(ROOT, name);
    const target = path.join(STAGE, name);
    if (!fs.existsSync(source)) fail('缺少游戏文件：' + name);
    fs.cpSync(source, target, { recursive: true, dereference: true });
  });

  fs.copyFileSync(path.join(DESKTOP, 'main.js'), path.join(STAGE, 'main.js'));
  fs.mkdirSync(path.join(STAGE, 'assets'), { recursive: true });
  fs.copyFileSync(ICON, path.join(STAGE, 'assets', 'icon.ico'));

  const appPackage = JSON.parse(fs.readFileSync(path.join(DESKTOP, 'app-package.json'), 'utf8'));
  appPackage.build = {
    appId: 'com.martin.longwaygame',
    productName: '长征·万水千山',
    copyright: 'Copyright © 2026 Martin',
    electronVersion: '44.9.1',
    asar: true,
    compression: 'maximum',
    directories: { output: OUTPUT },
    files: ['**/*'],
    win: {
      target: [{ target: 'portable', arch: ['x64'] }],
      icon: 'assets/icon.ico',
      legalTrademarks: 'Martin',
      artifactName: 'LongWayGame-Martin-${version}.${ext}'
    },
    portable: {
      artifactName: 'LongWayGame-Martin-${version}.${ext}',
      requestExecutionLevel: 'user'
    }
  };
  fs.writeFileSync(path.join(STAGE, 'package.json'), JSON.stringify(appPackage, null, 2) + '\n', 'utf8');
}

if (!fs.existsSync(BUILDER)) {
  fail('未安装构建依赖。请先运行：npm install --prefix desktop');
}
if (!fs.existsSync(ICON)) {
  fail('缺少桌面图标。请先运行：python desktop/make-icon.py');
}

prepareStage();
fs.mkdirSync(OUTPUT, { recursive: true });

console.log('[桌面打包] 正在生成 Windows x64 便携版……');
const result = spawnSync(process.execPath, [
  BUILDER,
  '--win',
  'portable',
  '--x64',
  '--projectDir',
  STAGE
], {
  cwd: STAGE,
  env: process.env,
  stdio: 'inherit'
});

if (result.error) fail(result.error.message);
if (result.status !== 0) fail('electron-builder 退出码：' + result.status);

const expected = path.join(OUTPUT, 'LongWayGame-Martin-1.0.0.exe');
if (!fs.existsSync(expected)) fail('构建结束但未找到预期文件：' + expected);
console.log('[桌面打包] 完成：' + expected);
