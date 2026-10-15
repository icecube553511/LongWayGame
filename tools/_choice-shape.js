/* 选项形状分析：有没有"取舍"，还是清一色的"好人选项"。 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const METERS = ['morale', 'trust', 'hope'];
let total = 0, hasTrade = 0, allOptionsPositive = 0, identical = 0;
const samples = [];

function vecOf(o) {
  const v = { morale: 0, trust: 0, hope: 0 };
  (o.set || []).forEach(function (x) {
    if (v[x.var] === undefined) return;
    if (x.op === '+=') v[x.var] += x.value;
    else if (x.op === '-=') v[x.var] -= x.value;
    else if (x.op === '=') v[x.var] = x.value;
  });
  return v;
}

for (let i = 1; i <= 20; i++) {
  const id = 'ch' + String(i).padStart(2, '0');
  const code = fs.readFileSync(path.join(ROOT, 'src/story', id + '.js'), 'utf8');
  const ch = eval('(function(){const window={STORY:{}};' + code + ';return window.STORY.' + id + ';})()');
  (function walk(steps) {
    (steps || []).forEach(function (s) {
      if (!s || !s.t) return;
      if (s.t === 'choice') {
        total++;
        const vecs = (s.options || []).map(vecOf);
        // 所有选项、所有仪表都不为负 → 没有"代价"
        const anyNegative = vecs.some(function (v) { return METERS.some(function (k) { return v[k] < 0; }); });
        if (!anyNegative) {
          allOptionsPositive++;
          if (samples.length < 12) {
            samples.push(id + ' 「' + (s.prompt || '').slice(0, 24) + '」 → ' +
              (s.options || []).map(function (o) { return o.tag || (o.text || '').slice(0, 8); }).join(' / '));
          }
        }
        // 有没有两个选项在仪表上完全等价
        let same = false;
        for (let a = 0; a < vecs.length; a++) {
          for (let b = a + 1; b < vecs.length; b++) {
            if (METERS.every(function (k) { return vecs[a][k] === vecs[b][k]; })) same = true;
          }
        }
        if (same) identical++;
        // 有没有"一项在某个仪表上比另一项低"（真取舍）
        let trade = false;
        for (let a = 0; a < vecs.length; a++) {
          for (let b = 0; b < vecs.length; b++) {
            if (a === b) continue;
            const better = METERS.some(function (k) { return vecs[a][k] > vecs[b][k]; });
            const worse = METERS.some(function (k) { return vecs[a][k] < vecs[b][k]; });
            if (better && worse) trade = true;
          }
        }
        if (trade) hasTrade++;
      }
      if (s.t === 'if') { walk(s.then); walk(s.else); }
    });
  })(ch.steps);
}

console.log('选项总数：' + total);
console.log('存在真实取舍（A 某指标高、B 另一指标高）：' + hasTrade + ' / ' + total);
console.log('全部选项在所有仪表上都不为负（无代价）：' + allOptionsPositive + ' / ' + total);
console.log('存在仪表效果完全等价的选项对：' + identical + ' / ' + total);
console.log('--- 无代价选项样例 ---');
samples.forEach(function (s) { console.log('  ' + s); });
