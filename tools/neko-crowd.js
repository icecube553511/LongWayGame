#!/usr/bin/env node
/* ==========================================================================
 * tools/neko-crowd.js —— 生成背景用的「群众」素材印章
 *
 *   node tools/neko-crowd.js                # 生成全部姿态
 *   node tools/neko-crowd.js --only march   # 只生成一个
 *   node tools/neko-crowd.js --concurrency 4
 *
 * 产物：tmp/neko-crowd/{pose}.png（原始图，洋红底，全身）
 * 之后由 tools/neko-crowd-post.py 抠底 → 缩放 → 烘焙成 art/ui_00_crowd_stamps.js
 *
 * 为什么要单独做一套：背景里的队伍原本是 art/geosvg.js 用六边形拼的剪影，
 * 和对话立绘（NekoGptImage 低多边形刻面）不是一种画风。这里用同一个模型、
 * 同一段风格约束生成全身素材，供背景复用。
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadProvider } = require('../tmp/devkit/neko.js');

const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'tmp', 'neko-crowd');
fs.mkdirSync(RAW, { recursive: true });

const argv = process.argv.slice(2);
const argOf = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const CONC = Math.max(1, Math.min(6, parseInt(argOf('--concurrency', '4'), 10)));
const only = argOf('--only', '').split(',').map(s => s.trim()).filter(Boolean);
const SIZE = argOf('--size', '1024x1024');
const KEY_COLOR = '#FF00FF';

/* 背景里用得上的姿态。desc 决定画什么，count 决定生成几张不同变体（避免队伍里
   每个人长得一模一样）。 */
const POSES = [
  { id: 'stand',   n: 3, desc: 'a single Red Army soldier standing at ease, seen from the front, bolt-action rifle slung across the back, octagonal cloth cap with a red star, grey-green tunic with red collar tabs, puttees on the lower legs, cloth shoes' },
  { id: 'march',   n: 3, desc: 'a single Red Army soldier walking in profile facing left, mid-stride, rifle on the shoulder, pack and blanket roll, octagonal cap with red star, grey-green tunic, puttees, cloth shoes' },
  /* carry 从 2 张扩到 6 张：担架队是一排并排的人，只有两张贴图时四个人必然长得一样
     （用户 2026-10-16 的反馈："人物是复制出来的"）。同时把姿态写得更明确：
     肩上扛的是担架的一头，身后吊着折叠的帆布担架与毯子。 */
  { id: 'carry',   n: 6, desc: 'a single Red Army soldier carrying one end of a canvas stretcher on his shoulder, leaning forward under the weight and straining; a folded grey canvas litter and a rolled blanket hang from the pole behind his shoulder; simple tunic and octagonal cap with a red star' },
  { id: 'sit',     n: 2, desc: 'a single Red Army soldier sitting on the ground with knees drawn up, resting, tunic and octagonal cap, rifle laid across the knees' },
  { id: 'peasant', n: 3, desc: 'a single Chinese peasant of the 1930s standing, white cloth headscarf wound around the head, dark blue homespun jacket and loose trousers, carrying a carrying pole or a basket' },
  { id: 'flag',    n: 1, desc: 'a single Red Army soldier standing and holding a tall bamboo pole with a plain red flag, tunic and octagonal cap with red star' },
  { id: 'nurse',   n: 1, desc: 'a single young Chinese woman army nurse standing, short bob hair, white apron over grey-green tunic, red cross armband, wooden medicine box in one hand' },
  { id: 'bayonet', n: 2, desc: 'a single Red Army soldier charging forward in profile, rifle held with bayonet fixed, running stance, tunic and octagonal cap with red star' }
];

const STYLE = [
  'Low-poly faceted 3D video game character art, flat-shaded polygons with hard angular facets,',
  'one strong directional light from the upper left, matte surfaces, no gradients, no outlines,',
  'muted desaturated palette of slate blue-grey, faded grey-green, ochre and dull brick red.',
  'Exactly the same art style as a low-poly isometric historical game set in 1934-1936 China.'
].join(' ');

function promptFor(pose, variant) {
  return [
    STYLE,
    '',
    'SUBJECT: ' + pose.desc + '.',
    'Variant ' + (variant + 1) + ' of several — vary the face, height, build and small details,',
    'but keep the same uniform, palette and rendering style.',
    '',
    /* 用户 2026-10-16 反馈：背景里的人物是"复制出来的"。一条硬要求：同一姿态的不同变体
       必须是**看得出来的不同人** —— 体态、年龄、脸型、神态都要分开；军装的磨损程度也要分开。 */
    'VARIETY (hard requirement): this variant must read as a visibly DIFFERENT PERSON from the',
    'other variants of this pose. Vary the stature and build (tall and thin, short and stocky,',
    'broad-shouldered, slightly stooped), the age (young recruit, weathered middle-aged veteran,',
    'grey-stubbled older man), the face shape, and the expression (straining, grim, exhausted,',
    'calm, teeth clenched).',
    'UNIFORM WEAR (hard requirement): the clothing must show its own degree of damage, different',
    'from the other variants — range from nearly new to badly worn: sun-bleached and faded cloth,',
    'mismatched cloth patches sewn on the tunic, a torn sleeve or a torn hem, mud and dust',
    'staining on the trousers and puttees, a missing button, a frayed collar, a strip of cloth',
    'bandage wound around the forearm, a rope belt instead of a leather one.',
    '',
    'FRAMING: the complete figure from the top of the head down to the feet, standing on nothing,',
    'centered, filling most of the frame vertically, clearly readable as a small game sprite.',
    'Simplify fine detail — this figure will be displayed small in the background of a scene.',
    'Exactly one person. No other people, no ground, no props floating in the air.',
    '',
    'BACKGROUND: a perfectly flat solid uniform pure magenta ' + KEY_COLOR + ' filling every pixel',
    'behind the figure. Single flat colour only - no gradient, no texture, no shadow, no floor,',
    'no horizon. The figure stands on nothing.',
    '',
    'AVOID: text, letters, watermark, signature, frame, border, photographic realism,',
    'anime line art, smooth airbrushed shading, glossy highlights, high saturation.'
  ].join('\n');
}

const P = loadProvider();

async function gen(name, pose, variant) {
  const r = await fetch(P.base + '/v1/images/generations', {
    method: 'POST',
    headers: { 'authorization': 'Bearer ' + P.key, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.NEKO_MODEL || P.model,
      prompt: promptFor(pose, variant),
      n: 1, size: SIZE, quality: 'high'
    })
  });
  const text = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 180));
  const j = JSON.parse(text);
  const b64 = j.data && j.data[0] && (j.data[0].b64_json || j.data[0].b64);
  if (!b64) throw new Error('响应里没有 b64_json');
  fs.writeFileSync(path.join(RAW, name + '.png'), Buffer.from(b64, 'base64'));
}

async function withRetry(name, pose, variant) {
  let last;
  for (let a = 1; a <= 3; a++) {
    try { await gen(name, pose, variant); return true; }
    catch (e) { last = e; await new Promise(r => setTimeout(r, 1500 * a)); }
  }
  console.log('  × ' + name + ' 失败：' + last.message);
  return false;
}

async function pool(tasks, n) {
  let i = 0, done = 0, ok = 0;
  async function worker() {
    while (i < tasks.length) {
      const t = tasks[i++];
      if (await withRetry(t[0], t[1], t[2])) ok++;
      done++;
      process.stdout.write('  ' + done + '/' + tasks.length + '\r');
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, worker));
  process.stdout.write('\n');
  return ok;
}

(async () => {
  const poses = only.length ? POSES.filter(p => only.indexOf(p.id) >= 0) : POSES;
  const tasks = [];
  for (const p of poses) {
    for (let v = 0; v < p.n; v++) tasks.push([p.id + '_' + (v + 1), p, v]);
  }
  console.log('姿态 ' + poses.length + ' 种，共 ' + tasks.length + ' 张；模型 ' +
    (process.env.NEKO_MODEL || P.model) + '，尺寸 ' + SIZE + '，并发 ' + CONC);
  const t0 = Date.now();
  const ok = await pool(tasks, CONC);
  console.log('完成 ' + ok + '/' + tasks.length + '，用时 ' + Math.round((Date.now() - t0) / 1000) + 's');
  console.log('原始图：' + RAW);
})();
