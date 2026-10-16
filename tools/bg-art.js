#!/usr/bin/env node
/* ==========================================================================
 * tools/bg-art.js —— 生成「场景背景」整屏位图（把 30 个 bg_* 从程序化 SVG 换成 AI 出图）
 *
 *   node tools/bg-art.js --list                        # 看 id / 章节 / 提示词是否已填
 *   node tools/bg-art.js --only bg_luding              # 生成一张
 *   node tools/bg-art.js --ch ch15 --concurrency 2     # 生成一章的场景
 *   node tools/bg-art.js --all --concurrency 4         # 全部 30 张（跳过 svgOnly 的四张）
 *   node tools/bg-art.js --only bg_dadu --provider gugu    # 换额度池（图像模型只有 Neko 组有）
 *   node tools/bg-art.js --only bg_dadu --dry-run      # 只打印最终提示词，不发请求
 *   node tools/bg-art.js --only bg_dadu --extra "add drifting smoke" --tag b
 *
 * 流程：读 src/data/bgart.js（提示词与 id 的唯一来源）
 *      → 调 cc-switch 里的 provider 出图 → 存原始图 tmp/bg-raw/{id}[__tag].png
 *      → 自动跑 python tools/bg-post.py 烘焙成 assets/generated/bg/{id}.png
 *
 * 引擎侧的回退链：bg/{id}.png（本工具产出）→ bg/{id}.svg（art/scenes*.js 烘焙的矢量兜底）。
 * 因此本工具产不出图也不会让游戏黑屏，但 tools/check.js 会要求 30 张场景背景都有位图。
 *
 * 密钥从 cc-switch 数据库读取，不落盘、不打印。
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'tmp', 'bg-raw');
const PREV_DIR = path.join(RAW_DIR, 'prev');
const DB = 'C:/Users/12254/.cc-switch/cc-switch.db';

/* ---------------- provider ----------------
 * 两个分组（2026-10-16 由 root 实测）：
 *   NekoGptImage（本文件用）  —— /v1/models: gpt-image-2 / gpt-image-2.5 /
 *                                gpt-image-2.5-flare / gpt-image-2.5-sunburst，能出图；
 *   Gugu-gpt-QQ（tools/bg-judge.js 用）—— /v1/models: gpt-5.6-sol / gpt-5.6-terra /
 *                                gpt-6-astra / gpt-6-sol / gpt-6.1-sol，是文本+视觉模型，
 *                                对 images/generations 一律 404 "not available for this group"。
 *                                所以它在本工程里承担「看图验收」，不承担出图。 */
const PROVIDERS = {
  neko: { name: 'NekoGptImage', model: 'gpt-image-2.5-sunburst' }
};

function loadProvider(which) {
  const spec = PROVIDERS[which];
  if (!spec) throw new Error('未知 provider：' + which + '（本条流水线只有 ' + Object.keys(PROVIDERS).join(' / ') + '）');
  const db = new DatabaseSync(DB, { readOnly: true });
  const row = db.prepare('select * from providers where name = ?').get(spec.name);
  if (!row) { db.close(); throw new Error('cc-switch 里找不到 provider：' + spec.name); }
  const cfg = JSON.parse(row.settings_config || '{}');
  const key = cfg.auth && (cfg.auth.OPENAI_API_KEY || cfg.auth.ANTHROPIC_API_KEY);
  const m = /base_url\s*=\s*"([^"]+)"/.exec(cfg.config || '');
  db.close();
  if (!key) throw new Error(spec.name + ' 没有可用的 key');
  return { key: key, base: (m ? m[1] : 'https://api.999555999.com').replace(/\/+$/, ''), name: spec.name };
}

/* ---------------- 参数 ---------------- */
const argv = process.argv.slice(2);
const argOf = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const ONLY = argOf('--only', '').split(',').map(s => s.trim()).filter(Boolean);
const CH = argOf('--ch', '').split(',').map(s => s.trim()).filter(Boolean);
const TAG = argOf('--tag', '').trim();
const EXTRA = argOf('--extra', '').trim();
const CONC = Math.max(1, Math.min(6, parseInt(argOf('--concurrency', '3'), 10)));
/* 16:9 是本游戏的画布比例。实测该端点对 1920x1080 会返回 1672x941（真 16:9，
   不需要裁），烘焙时只是等比放大到 1920x1080。 */
const SIZE = argOf('--size', '1920x1080');
const PROVIDER = argOf('--provider', 'neko');
const ALL = argv.includes('--all');
const DRY = argv.includes('--dry-run');
const LIST = argv.includes('--list');
const JSON_OUT = argv.includes('--json');
const FORCE = argv.includes('--force');
const NO_POST = argv.includes('--no-post');
const WITH_SVG_ONLY = argv.includes('--with-svg-only');

/* ---------------- 读背景提示词表 ---------------- */
const sandbox = { window: {}, globalThis: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'bgart.js'), 'utf8'), sandbox);
const BG = (sandbox.window.ART || sandbox.ART || {}).bgArtList || [];
if (!BG.length) { console.error('读不到 src/data/bgart.js 的 ART.bgArtList'); process.exit(2); }

/* ---------------- 提示词 ---------------- */
/* 风格头与 tools/cg-art.js 同源（同一套措辞在立绘、插画上已实测能出「硬边刻面」），
   只把「宽幅插画」改成「整屏舞台背景」：不压电影黑边、不压金线画框（那是 CG 的画框），
   并额外要求画面中下部留白 —— 立绘（600×900）与对话框就压在那里。 */
const STYLE = [
  'Low-poly faceted 3D illustration, flat-shaded polygons with hard angular facets, exactly one',
  'strong directional light from the upper left, matte surfaces, thin dark edges only where a',
  'silhouette breaks, no gradients, no halftones, no soft shadows, no texture detail, no fine detail.',
  'Every surface -- sky, water, terrain, rock, wood, cloth, flesh -- is built from visible flat',
  'polygon facets: each facet is a single flat colour, neighbouring facets differ in value, and the',
  'facet boundaries stay visible. The image must read as a low-poly 3D render from a 1934-1936',
  'Chinese Red Army historical game, in the same style as its low-poly character portraits and its',
  'full-screen event illustrations: not a painting, not a photograph, no rendering that looks photographic.',
  'PALETTE (strict, muted, low saturation): slate blue-grey #243447, faded grey-green #6d7a55,',
  'ochre #a8906a, dull brick red #a33a2e, river green-grey #3f5a55, snow #e8eef2.',
  'No neon, no vivid saturation, no HDR glow, no lens flare, no bloom, no hazy atmospheric',
  'gradients, no glossy specular highlights, no airbrushed shading, no anime cel shading,',
  'no line-art outlines, no wireframe grids.'
].join(' ');

const COMPOSITION = [
  'Exactly one full-bleed 16:9 background illustration: no caption, no border, no frame, no black',
  'bars, no letterboxing, nothing drawn on top of the picture. Horizon on the lower third, three',
  'depth layers (far / middle / near) separated by clear value steps, the nearest layer darker and',
  'more saturated, and every essential element inside the central horizontal band.',
  'THIS IS A STAGE, NOT A POSTER: 600x900 character portraits and a dialogue box are drawn over',
  'this image, so the centre and the lower middle of the frame stay calm and uncluttered -- no',
  'large near-foreground figure, no face in the middle of the picture, nobody looking at the camera.',
  'People appear at middle distance or further, and any figure close to the frame edge is cropped',
  'by the edge instead of posed in the centre.',
  'The soldiers wear the 1934-1936 Chinese Red Army uniform: faded grey-green tunic, octagonal',
  'cloth cap with a red star, cloth puttees, straw sandals, bolt-action rifles.'
].join(' ');

/* 群像硬要求。措辞直接沿用 tools/neko-crowd.js 里那两段已验收过的 VARIETY / UNIFORM WEAR
   （2026-10-16 用户反馈「人物是复制出来的」后立的规矩，见 ART_DIRECTION §2.3.1）：
   这一轮把同一条要求从「背景印章」提到「背景整图」上 —— 群像里的每一个人都要看得出是不同的人。 */
function crowdBlock(what) {
  return [
    'CROWD: ' + what + '.',
    'CROWD VARIETY (hard requirement): every person in the crowd must read as a visibly DIFFERENT',
    'INDIVIDUAL, so that a viewer can pick out and count separate people. Vary the stature and build',
    '(tall and thin, short and stocky, broad-shouldered, slightly stooped), the age (boy, young',
    'recruit, weathered middle-aged veteran, grey-stubbled older man, old woman), the face shape,',
    'the hair and headwear, what each person carries, and the pose.',
    'UNIFORM WEAR (hard requirement): each person must show their own degree of damage, and no two',
    'people may wear the same level of wear -- range from nearly new to badly worn: sun-bleached and',
    'faded cloth, mismatched cloth patches sewn on the tunic, a torn sleeve or a torn hem, mud and',
    'dust staining on the trousers and puttees, a missing button, a frayed collar, a strip of cloth',
    'bandage wound around the forearm, a rope belt instead of a leather one.',
    'No two figures may look like the same person repeated, mirrored or copy-pasted, and no row of',
    'identical silhouettes. Do not build the crowd from one figure repeated at different scales.'
  ].join(' ');
}

/* 光照纪律（与 cg-art.js 同一条）：只允许场景描述里点明的光源发光。 */
const LIGHTING = [
  'LIGHTING RULE: the only light in the image is the light named in the scene description.',
  'If the description says a person carries no lamp, or that no torch or fire is burning, then no',
  'flame, no torch, no lantern and no warm glow appears anywhere in the picture, not even small or',
  'in the distance, and the scene is lit by a single cool moonlit or ambient source from the upper',
  'left. Never add a light source that the description does not mention.'
].join(' ');

const AVOID_BASE = [
  'text, letters, chinese characters, caption, watermark, signature, logo, frame, border',
  /* 背景上最容易长出来的「字」不是标题，是店铺招牌、门匾、墙上的标语：
     实测 bg_hadapu 的布幌子按提示词写「空白的」才干净，bg_wuqi 的标语墙头一版就画出了字形。
     这一条把「像字的东西」整体禁掉 —— 招牌一律画成空白板、墙面一律只留抽象痕迹。 */
  'painted calligraphy, letter-like marks, glyphs, printed signage, shop signs with writing, plaques with writing',
  'modern buildings, cars, power lines, modern clothing, watches, plastic, zombie, gore',
  'bright saturated colours, anime, manga, cartoon, cel shading, blur, bokeh, lens flare',
  'duplicated limbs, deformed faces, distorted hands, extra fingers, people staring at the camera',
  'identical repeated people, copy-pasted faces, mirrored figures, rows of clones'
];

function promptFor(b) {
  const parts = [STYLE, '', b.prompt_en || ''];
  if (b.must && b.must.length) parts.push('', 'The composition must clearly show: ' + b.must.join('; ') + '.');
  if (b.crowd) parts.push('', crowdBlock(b.crowd));
  parts.push('', COMPOSITION, '', LIGHTING);
  if (EXTRA) parts.push('', EXTRA);
  /* 逐条去重（大小写不敏感）：条目自己的 avoid 常与基础禁忌重叠。 */
  const seen = {};
  const avoid = [];
  AVOID_BASE.concat(b.avoid || []).forEach(function (chunk) {
    String(chunk).split(',').forEach(function (t) {
      t = t.trim();
      const k = t.toLowerCase();
      if (!t || seen[k]) return;
      seen[k] = 1;
      avoid.push(t);
    });
  });
  parts.push('', 'AVOID: ' + avoid.join(', ') + '.');
  return parts.join('\n');
}

/* ---------------- 出图 ---------------- */
async function genOne(b, P, model) {
  const body = { model: model, prompt: promptFor(b), n: 1, size: SIZE, quality: 'high' };
  const r = await fetch(P.base + '/v1/images/generations', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + P.key, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 200).replace(/\s+/g, ' '));
  let j;
  try { j = JSON.parse(text); } catch (e) { throw new Error('非 JSON 响应：' + text.slice(0, 160)); }
  const d = j.data && j.data[0];
  const b64 = d && (d.b64_json || d.b64);
  if (!b64) throw new Error('响应里没有 b64_json：' + text.slice(0, 200));
  const raw = path.join(RAW_DIR, b.id + (TAG ? '__' + TAG : '') + '.png');
  if (fs.existsSync(raw)) {
    fs.mkdirSync(PREV_DIR, { recursive: true });
    fs.copyFileSync(raw, path.join(PREV_DIR, b.id + '.' + Date.now() + '.png'));
  }
  fs.writeFileSync(raw, Buffer.from(b64, 'base64'));
  return raw;
}

async function withRetry(b, P, model) {
  let last;
  for (let a = 1; a <= 3; a++) {
    try { return await genOne(b, P, model); }
    catch (e) {
      last = e;
      const wait = 4000 * a;
      console.log('  · ' + b.id + ' 第 ' + a + ' 次失败：' + last.message.slice(0, 140) + '，' + (wait / 1000) + 's 后重试');
      await new Promise(r => setTimeout(r, wait));
    }
  }
  console.log('  × ' + b.id + ' 三次都失败：' + last.message.slice(0, 220));
  return null;
}

async function pool(items, n, fn) {
  let i = 0; const ok = [], fail = [];
  async function worker() {
    while (i < items.length) {
      const it = items[i++];
      const r = await fn(it);
      if (r) ok.push(it.id); else fail.push(it.id);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return { ok, fail };
}

/* ---------------- 主流程 ---------------- */
(async () => {
  /* --json：把提示词表原样吐成 JSON，给 tools/bg-judge.py（看图验收）与文档用。
     它是「同一份清单的另一种读法」，不重新拼提示词，避免两边口径漂移。 */
  if (JSON_OUT) {
    const slim = BG.map(b => ({
      id: b.id, ch: b.ch, name: b.name, svgOnly: !!b.svgOnly,
      scene_cn: b.prompt_cn || '', must: b.must || [], crowd: b.crowd || '',
      prompt_en: b.prompt_en || ''
    }));
    console.log(JSON.stringify(slim, null, 1));
    return;
  }
  if (LIST) {
    console.log('id'.padEnd(22) + 'ch'.padEnd(7) + '提示词     人群  ' + '名称');
    BG.forEach(b => {
      const ready = (b.prompt_en || '').trim().length > 120;
      const crowd = b.crowd ? '有' : '—';
      console.log((b.id + (b.svgOnly ? '  ← svgOnly' : '')).padEnd(22) + (b.ch || '-').padEnd(7)
        + (ready ? '  ✓' : '  ✗').padEnd(11) + crowd.padEnd(6) + (b.name || ''));
    });
    console.log('共 ' + BG.length + ' 条：出图的 ' + BG.filter(b => !b.svgOnly).length
      + ' 条，svgOnly（程序化 SVG，不出位图）' + BG.filter(b => b.svgOnly).length + ' 条');
    return;
  }

  let todo = BG;
  if (ONLY.length) todo = todo.filter(b => ONLY.indexOf(b.id) >= 0);
  else if (CH.length) todo = todo.filter(b => CH.indexOf(b.ch) >= 0);
  else if (!ALL) { console.error('要指定范围：--only / --ch / --all（或 --list）'); process.exit(2); }

  const svgOnly = todo.filter(b => b.svgOnly && !WITH_SVG_ONLY);
  if (svgOnly.length) {
    console.log('跳过 ' + svgOnly.length + ' 条 svgOnly（程序化 SVG 更贴合「子弹位置完全一致」这类跨图不变式）：'
      + svgOnly.map(b => b.id).join(', '));
    todo = todo.filter(b => !b.svgOnly || WITH_SVG_ONLY);
  }
  const missing = todo.filter(b => !(b.prompt_en || '').trim());
  if (missing.length) {
    console.log('跳过 ' + missing.length + ' 条（提示词为空）：' + missing.map(b => b.id).join(', '));
    todo = todo.filter(b => (b.prompt_en || '').trim());
  }
  if (DRY) {
    todo.forEach(b => { console.log('\n================ ' + b.id + '  [' + b.ch + '] ' + b.name + '\n' + promptFor(b)); });
    return;
  }
  if (!todo.length) { console.log('没有要生成的条目'); return; }

  const already = todo.filter(b => fs.existsSync(path.join(RAW_DIR, b.id + (TAG ? '__' + TAG : '') + '.png')));
  if (already.length && !FORCE) {
    console.log('已有 ' + already.length + ' 张原始图，跳过（--force 可重出）：' + already.map(b => b.id).join(', '));
    todo = todo.filter(b => already.indexOf(b) < 0);
  }
  if (!todo.length) { console.log('没有要生成的条目'); return; }

  fs.mkdirSync(RAW_DIR, { recursive: true });
  const P = loadProvider(PROVIDER);
  const model = argOf('--model', process.env.BG_MODEL || PROVIDERS[PROVIDER].model);
  console.log('provider=' + P.name + '  model=' + model + '  size=' + SIZE + '  并发=' + CONC);
  console.log('待生成 ' + todo.length + ' 张：' + todo.map(b => b.id).join(', '));
  const t0 = Date.now();
  const { ok, fail } = await pool(todo, CONC, async (b) => {
    const t = Date.now();
    const raw = await withRetry(b, P, model);
    if (!raw) return null;
    console.log('  ✓ ' + b.id + '  ' + ((Date.now() - t) / 1000).toFixed(0) + 's  -> ' + path.relative(ROOT, raw));
    if (!NO_POST) {
      try {
        execFileSync('python', [path.join(ROOT, 'tools', 'bg-post.py'), '--raw', raw,
          '--out', path.join(ROOT, 'assets', 'generated', 'bg', b.id + '.png')], { stdio: 'inherit' });
      } catch (e) {
        console.log('    ! 烘焙失败：' + e.message.slice(0, 160));
      }
    }
    return true;
  });
  console.log('成功 ' + ok.length + '，失败 ' + fail.length + (fail.length ? '（' + fail.join(', ') + '）' : '')
    + '，用时 ' + Math.round((Date.now() - t0) / 1000) + 's');
  if (fail.length) process.exitCode = 1;
})();
