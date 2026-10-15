/* 可玩性探针（临时脚本，不进版本库）
 * 统计：选项写过的变量 → 全剧有没有被 if 读过；分支文本占比；选项后果是否可见。 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const chapters = {};
const order = [];
for (let i = 1; i <= 20; i++) {
  const n = String(i).padStart(2, '0');
  const id = 'ch' + n;
  const code = fs.readFileSync(path.join(ROOT, 'src/story', id + '.js'), 'utf8');
  chapters[id] = eval('(function(){const window={STORY:{}};' + code + ';return window.STORY.' + id + ';})()');
  order.push(id);
}

function condVars(cond, out) {
  if (!cond || typeof cond !== 'object') return out;
  if (cond.var) out.push(cond.var);
  ['all', 'any'].forEach(function (k) { (cond[k] || []).forEach(function (c) { condVars(c, out); }); });
  if (cond.not) condVars(cond.not, out);
  return out;
}

const writtenByChoice = new Map(); // var -> Set(chapter)
const readByIf = new Map();        // var -> Set(chapter)
const choiceCount = new Map();     // var -> count of options writing it

order.forEach(function (id) {
  const ch = chapters[id];
  (function walk(steps) {
    (steps || []).forEach(function (s) {
      if (!s || !s.t) return;
      if (s.t === 'choice') {
        (s.options || []).forEach(function (o) {
          (o.set || []).forEach(function (x) {
            if (!writtenByChoice.has(x.var)) writtenByChoice.set(x.var, new Set());
            writtenByChoice.get(x.var).add(id);
            choiceCount.set(x.var, (choiceCount.get(x.var) || 0) + 1);
          });
        });
      }
      if (s.t === 'if') {
        condVars(s.cond, []).forEach(function (v) {
          if (!readByIf.has(v)) readByIf.set(v, new Set());
          readByIf.get(v).add(id);
          if (s.else) { /* else 也算读过 */ }
        });
        walk(s.then);
        if (s.else) walk(s.else);
      }
    });
  })(ch.steps);
});

console.log('=== 选项写入的变量总数：' + writtenByChoice.size);
console.log('=== 被 if 读取过的变量总数：' + readByIf.size);

const neverRead = [...writtenByChoice.keys()].filter(function (k) { return !readByIf.has(k); });
console.log('\n--- 选项写过、但全剧没有任何 if 读取的变量（' + neverRead.length + ' 个）---');
console.log(neverRead.join('  '));

const meterOnly = ['morale', 'trust', 'hope'];
const flags = [...writtenByChoice.keys()].filter(function (k) { return meterOnly.indexOf(k) < 0; });
console.log('\n--- 选项写过的非仪表变量（' + flags.length + ' 个）---');
console.log(flags.join('  '));

console.log('\n--- 每个选项铺开的“被读到”比例 ---');
order.forEach(function (id) {
  let w = 0, r = 0, wf = 0, rf = 0;
  writtenByChoice.forEach(function (chs, k) {
    if (!chs.has(id)) return;
    w++;
    if (readByIf.has(k)) r++;
    if (meterOnly.indexOf(k) < 0) {
      wf++;
      if (readByIf.has(k)) rf++;
    }
  });
  console.log(id + '  写变量 ' + w + ' / 被读 ' + r + '   （非仪表 ' + wf + ' / 被读 ' + rf + '）');
});
