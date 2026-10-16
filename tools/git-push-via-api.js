#!/usr/bin/env node
/* ============================================================
 * tools/git-push-via-api.js —— 当 git 传输断了、但 api.github.com 还通时的兜底推送
 *
 * 由来（2026-10-16）：本机走本地代理出网，`github.com` 那条 TLS 会间歇性断
 * （`schannel: failed to receive handshake` / `server closed abruptly`），
 * 同一时刻 `api.github.com` 走同一个代理是 200。两条并行线因此各卡过一轮推送。
 *
 * 做法：用 GitHub 的 Git Data API 逐对象补齐 —— blob → tree → commit → ref。
 * **每一步都把 API 返回的 SHA 与本地 git 对象的 SHA 比对**；任一步对不上就中止，
 * 绝不更新 ref。宁可远端落后，也不要一个"内容对不上、SHA 却装作一样"的提交。
 *
 * 用法：
 *   node tools/git-push-via-api.js                # 推 HEAD 到 origin/main
 *   node tools/git-push-via-api.js <commit>       # 推指定提交
 *   node tools/git-push-via-api.js <commit> <ref> # 推到指定分支，默认 main
 *
 * 限制（照实写，别指望它万能）：
 *   - 只做**内容差异**的比对（`git diff --name-status 父 子`），能处理新增/修改/删除；
 *     能改模式的提交（100644→100755）本仓库不会出现，遇到就当普通修改处理。
 *   - 合并提交：要求所有父提交**已经在远端**（否则先补祖先）。本脚本只补当前这一笔。
 *   - 一次性补多个提交不划算，那个场景还是等 git 传输恢复。
 *   - 需要本机 `git` 与已登录的 `gh`（repo 权限）。
 *
 * 由 root 维护。
 * ============================================================ */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const target = process.argv[2] || 'HEAD';
const refName = process.argv[3] || 'main';

function git(args, opts) {
  return execFileSync('git', args, Object.assign({ cwd: ROOT, maxBuffer: 1 << 28 }, opts || {}));
}
function gitText(args) { return git(args, { encoding: 'utf8' }).trim(); }

/* 远端身份：从 origin 的 URL 里取 owner/repo，避免写死 */
function remoteSlug() {
  const url = gitText(['remote', 'get-url', 'origin']);
  const m = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!m) throw new Error('无法从 origin 解析 owner/repo：' + url);
  return { owner: m[1], repo: m[2] };
}
const { owner, repo } = remoteSlug();

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lw-api-push-'));
function gh(endpoint, method, body) {
  const args = ['api', '--method', method, endpoint];
  if (body !== undefined) {
    const f = path.join(tmpDir, 'body.json');
    fs.writeFileSync(f, JSON.stringify(body), 'utf8');
    args.push('--input', f);
  }
  return JSON.parse(execFileSync('gh', args, { maxBuffer: 1 << 28, encoding: 'utf8' }));
}
function die(msg) {
  console.error('中止（远端未改动）：' + msg);
  process.exit(1);
}
/* 把 git 的 "epoch ±HHMM" 转成 API 认的 ISO 8601 */
function isoFromGitDate(epoch, tz) {
  const sign = tz[0] === '-' ? -1 : 1;
  const offMin = sign * (Number(tz.slice(1, 3)) * 60 + Number(tz.slice(3, 5)));
  const d = new Date((Number(epoch) + offMin * 60) * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + 'T' +
    p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) +
    (offMin < 0 ? '-' : '+') + p(Math.floor(Math.abs(offMin) / 60)) + ':' + p(Math.abs(offMin) % 60);
}

const sha = gitText(['rev-parse', target]);
const raw = gitText(['cat-file', 'commit', sha]);
const parents = (raw.match(/^parent (.+)$/gm) || []).map((l) => l.split(' ')[1]);
if (!parents.length) die('这是根提交，本脚本不支持');
const parent = parents[0];
const localTree = gitText(['rev-parse', sha + '^{tree}']);
const parentTree = gitText(['rev-parse', parent + '^{tree}']);

const m = raw.match(/^author ([^<]*)<([^>]*)> (\d+) ([+-]\d{4})$/m);
const c = raw.match(/^committer ([^<]*)<([^>]*)> (\d+) ([+-]\d{4})$/m);
if (!m || !c) die('解析提交的 author/committer 失败');
const author = { name: m[1].trim(), email: m[2], date: isoFromGitDate(m[3], m[4]) };
const committer = { name: c[1].trim(), email: c[2], date: isoFromGitDate(c[3], c[4]) };
const message = gitText(['log', '-1', '--format=%B', sha]) + '\n';

console.log('要补的提交：' + sha);
console.log('父提交：' + parent + '（' + parents.length + ' 个父）');
for (const p of parents) {
  try { gh(`/repos/${owner}/${repo}/git/commits/${p}`, 'GET'); }
  catch (e) { die('父提交不在远端：' + p + ' —— 需先补祖先'); }
}

/* ---- 差异清单 ---- */
const diff = gitText(['diff', '--name-status', parent, sha]).split('\n').filter(Boolean);
const entries = [];
for (const line of diff) {
  const parts = line.split('\t');
  const st = parts[0][0];
  const p = parts[parts.length - 1];
  if (st === 'D') { entries.push({ path: p, mode: '100644', type: 'blob', sha: null }); continue; }
  const mode = gitText(['ls-tree', sha, '--', p]).split(/\s+/)[0];
  const blobSha = gitText(['rev-parse', sha + ':' + p]);
  entries.push({ path: p, mode: mode, type: 'blob', sha: blobSha, _status: st });
}
console.log('差异文件：' + entries.length + ' 个（新增/修改 ' + entries.filter((e) => e.sha).length +
  '，删除 ' + entries.filter((e) => !e.sha).length + '）');

/* ---- blob ---- */
for (const e of entries) {
  if (!e.sha) continue;
  const bytes = git(['cat-file', 'blob', e.sha]);
  const res = gh(`/repos/${owner}/${repo}/git/blobs`, 'POST',
    { content: bytes.toString('base64'), encoding: 'base64' });
  if (res.sha !== e.sha) die('blob sha 不一致：' + e.path + ' 本地 ' + e.sha + ' 远端 ' + res.sha);
}
console.log('blob 全部一致 ✓');

/* ---- tree ---- */
const treeBody = { base_tree: parentTree, tree: entries.map((e) => ({ path: e.path, mode: e.mode, type: e.type, sha: e.sha })) };
const tree = gh(`/repos/${owner}/${repo}/git/trees`, 'POST', treeBody);
if (tree.sha !== localTree) die('tree sha 不一致：本地 ' + localTree + ' 远端 ' + tree.sha);
console.log('tree 一致 ✓ ' + tree.sha);

/* ---- commit ---- */
const commit = gh(`/repos/${owner}/${repo}/git/commits`, 'POST',
  { message: message, tree: tree.sha, parents: parents, author: author, committer: committer });
if (commit.sha !== sha) die('commit sha 不一致：本地 ' + sha + ' 远端 ' + commit.sha);
console.log('commit 一致 ✓ ' + commit.sha);

/* ---- ref ---- */
const ref = gh(`/repos/${owner}/${repo}/git/refs/heads/${refName}`, 'PATCH', { sha: commit.sha, force: false });
console.log('ref 已更新 ✓ ' + ref.ref + ' -> ' + ref.object.sha);
console.log('远端 ' + refName + ' 与本地 ' + target + ' 现在是同一个对象：' + (ref.object.sha === sha));
