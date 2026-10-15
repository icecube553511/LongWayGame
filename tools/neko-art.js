#!/usr/bin/env node
/* ==========================================================================
 * tools/neko-art.js —— 用 NekoGptImage (gpt-image-2.5-sunburst) 生成立绘
 *
 *   node tools/neko-art.js --only mao --faces calm          # 单张试片
 *   node tools/neko-art.js                                  # 全部 35 人 × 8 表情
 *   node tools/neko-art.js --only mao,zhou --faces calm,stern
 *   node tools/neko-art.js --concurrency 6 --size 1024x1536
 *
 * 流程：调用 https://api.999555999.com/v1/images/generations
 *      → 存原始 PNG 到 tmp/neko-raw/{id}_{face}.png
 *      → 抠掉洋红底色、裁切、缩放到 600×900 → assets/generated/chars/{id}_{face}.png
 *
 * 密钥从 cc-switch 数据库读取，不落盘、不打印。
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadProvider } = require('../tmp/devkit/neko.js');

const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'tmp', 'neko-raw');
const OUT = path.join(ROOT, 'assets', 'generated', 'chars');
fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const KEY_COLOR = '#FF00FF';

/* ---------------- 参数 ---------------- */
const argv = process.argv.slice(2);
const argOf = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const only = argOf('--only', '').split(',').map(s => s.trim()).filter(Boolean);
const faceFilter = argOf('--faces', '').split(',').map(s => s.trim()).filter(Boolean);
const CONC = Math.max(1, Math.min(8, parseInt(argOf('--concurrency', '5'), 10)));
const SIZE = argOf('--size', '1024x1536');
const NEEDED = argv.includes('--needed');
const SKIP_DONE = argv.includes('--skip-existing') || NEEDED;

/* ---------------- 人物表 ---------------- */
const CHAR_SRC = fs.readFileSync(path.join(ROOT, 'src', 'data', 'characters.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(CHAR_SRC, sandbox);
const ALL = sandbox.window.ART.charactersById || {};
const IDS = Object.keys(ALL);

/* 每个人物「必须画出来」的外形要点（与 art/portraits_root.js 的参数表一致） */
const LOOK = {
  mao: 'tall forehead with receding centre-parted long black hair, clean-shaven, thin face, plain grey-green Red Army tunic with red collar tabs',
  zhou: 'lean gaunt face, thick dark eyebrows, short stubble beard, neat grey-green tunic',
  zhu: 'broad square face, thick lips, grey-flecked short beard, soft officer cap with red star',
  zhang_wentian: 'scholarly long thin face, round wire-rimmed glasses, neat short hair',
  wang_jiaxiang: 'pale gaunt face, short hair, wounded and weak, bandage hints at the abdomen',
  bogu: 'young round face, round wire-rimmed glasses, short hair',
  lide: 'European features, long straight nose, deep-set eyes, grey hair, grey moustache, grey-blue uniform',
  peng: 'square jaw, heavy low-set eyebrows, dark stubble, octagonal Red Army cap',
  lin: 'young narrow sharp face, pointed chin, short hair, octagonal Red Army cap',
  nie: 'round steady face, round glasses, short hair, octagonal cap',
  liu_bocheng: 'round face, black eyepatch over the right eye, short grey hair, officer cap',
  chen_yun: 'lean tidy face, short parted hair',
  he_zizhen: 'young woman, short ear-length bob, narrow jaw, grey-green tunic, belt with two pistols',
  deng_yingchao: 'thin gentle woman, short bob, pale, plain grey-green tunic',
  xu_teli: 'elderly scholar aged 57, long white beard, round glasses, grey long gown, walking stick',
  dong_biwu: 'middle-aged, neat moustache, grey-streaked hair, grey long gown',
  lin_boqu: 'middle-aged, short grey beard, ledger-carrying quartermaster look',
  xie_juezai: 'elderly, long white beard and white hair, plain cloth gown',
  ye_jianying: 'alert lean staff officer, short hair, octagonal cap, map case',
  zhang_guotao: 'heavy-set fleshy face, broad cheeks, thick eyebrows, officer cap, stout build',
  xu_xiangqian: 'honest broad-cheeked peasant-like face, short hair, octagonal cap',
  li_xiannian: 'young sturdy former carpenter, short hair, octagonal cap',
  xiao_yedan: 'Yi ethnic chief, dark brown skin, black cloth turban wound around the head, felt cloak over a dark jacket, silver ear ornament',
  xiaoman: 'fifteen-year-old boy bugler, round childish face, big eyes, small build, octagonal cap with red star, brass bugle slung on a strap',
  li_tiezhu: 'forty-year-old cook, weathered round face, dark stubble, cloth apron over the tunic, a bronze cooking pot slung on his back',
  he_xiaomei: 'nineteen-year-old army nurse woman, short bob, white apron over the tunic, red cross armband, wooden medicine box',
  guo_daniang: 'woman in her fifties, blue cotton headscarf, deeply lined face, plain blue homespun jacket',
  shi_zhu: 'twenty-two-year-old sturdy Jiangxi peasant soldier, round honest face, octagonal cap, carries a red flag',
  a_yue: 'Miao ethnic girl of sixteen, dark skin, silver head ornaments in a row across the brow, silver neck rings, dark indigo jacket',
  wu_laoliu: 'thirty-five-year-old veteran squad leader, unshaven, worn faded tunic',
  san_wa: 'thirteen-year-old boy, small and thin, oversized tunic, octagonal cap',
  soldiers: 'a generic young Red Army soldier, octagonal cap with red star, grey-green tunic',
  villagers: 'a middle-aged Chinese peasant man in a cloth headscarf and dark blue homespun jacket',
  yi_people: 'a Yi ethnic man, dark skin, black cloth turban, dark felt cloak',
  narrator: 'an abstract faceless figure in a plain grey long gown, no facial features, symbolic representation'
};

const FACEDESC = {
  calm: 'calm and composed, level eyebrows, eyes open normally, mouth closed in a straight thin line',
  stern: 'stern and resolute, eyebrows pressed down and drawn together, eyes slightly narrowed, mouth a hard straight line',
  smile: 'a restrained warm smile, eyebrows slightly raised, eyes softly creased, corners of the mouth lifted',
  sad: 'grief-stricken, inner ends of the eyebrows raised, eyes downturned and glossy, corners of the mouth pulled down',
  worry: 'anxious and worried, inner eyebrows raised and drawn together, eyes wide open, mouth slightly open',
  fierce: 'fierce and furious, eyebrows heavily lowered, eyes wide and glaring, mouth open in a shout',
  weak: 'exhausted and weak, eyebrows slack, eyes half closed, mouth slightly open, pale desaturated skin',
  dawn: 'quiet hope and relief, eyebrows lifted, eyes bright and open, a faint upward curve of the mouth'
};

const FACES = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];

function promptFor(id, face) {
  const c = ALL[id];
  const look = LOOK[id] || 'a Chinese Red Army figure';
  return [
    'Low-poly faceted 3D character art, flat-shaded polygons with hard angular facets,',
    'one strong directional light from the upper left, matte surfaces, thin dark edges only at',
    'silhouette breaks, no gradients, no halftones, muted desaturated palette of slate blue-grey,',
    'faded grey-green, ochre and dull brick red. Style must match a low-poly isometric historical',
    'game set in 1934-1936 China.',
    '',
    'SUBJECT: half-body bust portrait of one Chinese Red Army figure from the Long March.',
    'Name: ' + c.name + '. Role: ' + c.role + '.',
    'Appearance: ' + look + '.',
    'Framing: head to waist, head occupying about one quarter of the image height, figure centred,',
    'facing the viewer with a slight three-quarter turn, shoulders square, arms resting naturally',
    'at the sides. Exactly one person. No other people, no floating objects.',
    '',
    'EXPRESSION: ' + (FACEDESC[face] || FACEDESC.calm) + '.',
    '',
    'BACKGROUND: a perfectly flat solid uniform pure magenta ' + KEY_COLOR + ' filling every pixel',
    'behind the figure. Single flat colour only - no gradient, no texture, no shadow, no floor,',
    'no horizon, no props, no scenery. The figure stands on nothing.',
    '',
    'AVOID: text, letters, watermark, signature, frame, border, photographic realism,',
    'anime line art, smooth airbrushed shading, glossy highlights, high saturation.'
  ].join('\n');
}

/* ---------------- 调用 ---------------- */
const P = loadProvider();

async function gen(id, face, attempt) {
  const body = {
    model: process.env.NEKO_MODEL || P.model,
    prompt: promptFor(id, face),
    n: 1,
    size: SIZE,
    quality: 'high'
  };
  const r = await fetch(P.base + '/v1/images/generations', {
    method: 'POST',
    headers: { 'authorization': 'Bearer ' + P.key, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 200));
  let j;
  try { j = JSON.parse(text); } catch (e) { throw new Error('非 JSON 响应：' + text.slice(0, 160)); }
  const b64 = j.data && j.data[0] && (j.data[0].b64_json || j.data[0].b64);
  if (!b64) throw new Error('响应里没有 b64_json：' + text.slice(0, 200));
  const buf = Buffer.from(b64, 'base64');
  const raw = path.join(RAW, id + '_' + face + '.png');
  fs.writeFileSync(raw, buf);
  return raw;
}

async function withRetry(id, face) {
  let last;
  for (let a = 1; a <= 3; a++) {
    try { await gen(id, face, a); return true; }
    catch (e) {
      last = e;
      await new Promise(r => setTimeout(r, 1500 * a));
    }
  }
  console.log('  × ' + id + '/' + face + ' 失败：' + last.message);
  return false;
}

async function pool(tasks, n) {
  let i = 0, ok = 0, fail = 0, done = 0;
  const total = tasks.length;
  async function worker() {
    while (i < tasks.length) {
      const t = tasks[i++];
      const r = await withRetry(t[0], t[1]);
      if (r) ok++; else fail++;
      done++;
      if (done % 5 === 0 || done === total) process.stdout.write('  ' + done + '/' + total + '\r');
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, worker));
  process.stdout.write('\n');
  return { ok, fail };
}

/* ---------------- 主流程 ---------------- */
(async () => {
  const tasks = [];
  let label;
  if (NEEDED) {
    /* 只生成剧本真正引用到的 (人物,表情)，按出场频次从高到低排队 */
    const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'tmp', 'devkit', 'face-need.json'), 'utf8'));
    for (const [id, f] of plan.tasks.map(t => [t[0], t[1]])) tasks.push([id, f]);
    label = '按剧本实际用量（' + tasks.length + ' 张）';
  } else {
    const ids = only.length ? only : IDS;
    const faces = faceFilter.length ? faceFilter : FACES;
    for (const id of ids) for (const f of faces) tasks.push([id, f]);
    label = ids.length + ' 人 × ' + faces.length + ' 表情 = ' + tasks.length + ' 张';
  }
  const pending = SKIP_DONE
    ? tasks.filter(([id, f]) => !fs.existsSync(path.join(RAW, id + '_' + f + '.png')))
    : tasks;
  console.log('目标：' + label + '；已有 ' + (tasks.length - pending.length) + ' 张，待生成 ' + pending.length + ' 张');
  console.log('模型：' + (process.env.NEKO_MODEL || P.model) + '   尺寸：' + SIZE + '   并发：' + CONC);
  const t0 = Date.now();
  const { ok, fail } = await pool(pending, CONC);
  console.log('原始图完成：成功 ' + ok + '，失败 ' + fail + '，用时 ' + Math.round((Date.now() - t0) / 1000) + 's');
  console.log('原始图目录：' + RAW);
})();
