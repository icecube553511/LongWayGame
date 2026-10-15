#!/usr/bin/env node
/* ==========================================================================
 * tools/cg-art.js —— 生成「重要事件全屏插画」（CG）
 *
 *   node tools/cg-art.js --list                       # 看 id / 优先级 / 提示词是否已填
 *   node tools/cg-art.js --only cg_luding_bridge      # 生成一张
 *   node tools/cg-art.js --ch ch15 --concurrency 2    # 生成一章
 *   node tools/cg-art.js --all-p0 --concurrency 2     # 全剧 P0
 *   node tools/cg-art.js --only cg_dadu --provider gugu   # 换一个 provider（额度池不同）
 *   node tools/cg-art.js --only cg_dadu --dry-run     # 只打印最终提示词，不发请求
 *   node tools/cg-art.js --only cg_dadu --extra "add drifting smoke" --tag b
 *
 * 流程：读 src/data/cg.js（提示词与 id 的唯一来源）
 *      → 调 cc-switch 里的 provider 出图 → 存原始图 tmp/cg-raw/{id}[__tag].png
 *      → 自动跑 python tools/cg-post.py 烘焙成 assets/generated/cg/{id}.png
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
const RAW_DIR = path.join(ROOT, 'tmp', 'cg-raw');
const PREV_DIR = path.join(RAW_DIR, 'prev');
const DB = 'C:/Users/12254/.cc-switch/cc-switch.db';

/* ---------------- provider ---------------- */
const PROVIDERS = {
  neko: { name: 'NekoGptImage', model: 'gpt-image-2.5' },
  gugu: { name: 'Gugu-gpt-QQ', model: 'gpt-image-2.5' }
};

function loadProvider(which) {
  const spec = PROVIDERS[which];
  if (!spec) throw new Error('未知 provider：' + which + '（可选 ' + Object.keys(PROVIDERS).join(' / ') + '）');
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
const CONC = Math.max(1, Math.min(6, parseInt(argOf('--concurrency', '2'), 10)));
const SIZE = argOf('--size', '1536x1024');
const PROVIDER = argOf('--provider', 'neko');
const ALL_P0 = argv.includes('--all-p0');
const DRY = argv.includes('--dry-run');
const LIST = argv.includes('--list');
const FORCE = argv.includes('--force');
const NO_POST = argv.includes('--no-post');

/* ---------------- 读 CG 表 ---------------- */
const sandbox = { window: {}, globalThis: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'cg.js'), 'utf8'), sandbox);
const CG = (sandbox.window.ART || sandbox.ART || {}).cgList || [];
if (!CG.length) { console.error('读不到 src/data/cg.js 的 ART.cgList'); process.exit(2); }

/* ---------------- 提示词 ---------------- */
/* 风格头。措辞直接对齐 tools/neko-art.js 的 promptFor()：那一套在本作实测能出「硬边刻面」
   的立绘，是被验收过的调性；这里只是把同一套话术从「角色半身像」放大到「宽幅场景」。
   2026-10-15 修订（root）：第一张 CG（cg_yudu_night）用旧措辞出成了写实油画质感——
   水面、雾气、火光全是连续渐变，与 docs/CG_DESIGN.md §4 的红线 1/3 和已验收的立绘风格都不符。
   修订点：把「每块面 = 一个平涂色块、相邻面有色阶差」写成硬要求，并明确"像低多边形渲染、
   不像画、不像照片"。 */
const STYLE = [
  'Low-poly faceted 3D illustration, flat-shaded polygons with hard angular facets, exactly one',
  'strong directional light from the upper left, matte surfaces, thin dark edges only where a',
  'silhouette breaks, no gradients, no halftones, no soft shadows, no texture detail, no fine detail.',
  'Every surface -- sky, water, terrain, rock, wood, cloth, flesh -- is built from visible flat',
  'polygon facets: each facet is a single flat colour, neighbouring facets differ in value, and the',
  'facet boundaries stay visible. The image must read as a low-poly 3D render from a 1934-1936',
  'Chinese Red Army historical game, in the same style as its low-poly character portraits:',
  'not a painting, not a photograph, no rendering that looks photographic.',
  'PALETTE (strict, muted, low saturation): slate blue-grey #243447, faded grey-green #6d7a55,',
  'ochre #a8906a, dull brick red #a33a2e, river green-grey #3f5a55, snow #e8eef2.',
  'No neon, no vivid saturation, no HDR glow, no lens flare, no bloom, no hazy atmospheric',
  'gradients, no glossy specular highlights, no airbrushed shading, no anime cel shading,',
  'no line-art outlines, no wireframe grids.'
].join(' ');

const COMPOSITION = [
  'Wide 16:9 full-screen illustration (no caption, no border, no frame), horizon on the lower third,',
  'three depth layers (far / middle / near) separated by clear value steps, the nearest layer',
  'darker and more saturated, all essential content inside the central horizontal band.',
  'The soldiers wear the 1934-1936 Chinese Red Army uniform: faded grey-green tunic, octagonal',
  'cloth cap with a red star, cloth puttees, straw sandals, bolt-action rifles.'
].join(' ');

/* 光照纪律：只允许场景描述里点明的光源发光。
   第一张图的原句是「without one torch burning」（剧本正文也是「河上没有一支火把」），
   而旧措辞下模型自作主张点了一圈火把来照亮画面 —— 既违背 avoid，也和图注打架。
   这一句把「光源必须来自描述」定成硬规则；描述里本来就有火把的场景（金沙江、彝海等）
   不受影响。 */
const LIGHTING = [
  'LIGHTING RULE: the only light in the image is the light named in the scene description.',
  'If the description says a person carries no lamp, or that no torch or fire is burning, then no',
  'flame, no torch, no lantern and no warm glow appears anywhere in the picture, not even small or',
  'in the distance, and the scene is lit by a single cool moonlit or ambient source from the upper',
  'left. Never add a light source that the description does not mention.'
].join(' ');

const AVOID_BASE = [
  'text, letters, chinese characters, caption, watermark, signature, logo, frame, border',
  'modern buildings, cars, power lines, modern clothing, watches, plastic, zombie, gore',
  'bright saturated colours, anime, manga, cartoon, cel shading, blur, bokeh, lens flare',
  'duplicated limbs, deformed faces, distorted hands, extra fingers, people staring at the camera'
];

function promptFor(c) {
  const parts = [STYLE, '', c.prompt_en || ''];
  if (c.must && c.must.length) parts.push('', 'The composition must clearly show: ' + c.must.join('; ') + '.');
  /* 条目自己的 avoid 放在场景描述**后面紧接着**再讲一遍：
     旧版只在末尾那一长串 AVOID 里出现一次，模型把它当成了可选项——
     第一张图就出现了被 avoid 明确禁掉的「火把 + 暖色火光」。 */
  if (c.avoid && c.avoid.length) {
    parts.push('', 'HARD CONSTRAINTS -- none of the following may appear anywhere in the image, '
      + 'not small, not distant, not as a light source, not as a reflection: '
      + c.avoid.join(', ') + '.');
  }
  parts.push('', COMPOSITION, '', LIGHTING);
  if (EXTRA) parts.push('', EXTRA);
  /* 逐条去重（大小写不敏感）：条目自己写的 avoid 常常与基础禁忌重叠，
     重复词不会让模型更听话，只会把提示词撑长。 */
  var seenAvoid = {};
  var avoid = [];
  AVOID_BASE.concat(c.avoid || []).forEach(function (chunk) {
    String(chunk).split(',').forEach(function (t) {
      t = t.trim();
      var k = t.toLowerCase();
      if (!t || seenAvoid[k]) return;
      seenAvoid[k] = 1;
      avoid.push(t);
    });
  });
  parts.push('', 'AVOID: ' + avoid.join(', ') + '.');
  return parts.join('\n');
}

/* ---------------- 出图 ---------------- */
async function genOne(c, P, model) {
  const body = { model: model, prompt: promptFor(c), n: 1, size: SIZE, quality: 'high' };
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
  const raw = path.join(RAW_DIR, c.id + (TAG ? '__' + TAG : '') + '.png');
  if (fs.existsSync(raw)) {
    fs.mkdirSync(PREV_DIR, { recursive: true });
    fs.copyFileSync(raw, path.join(PREV_DIR, c.id + '.' + Date.now() + '.png'));
  }
  fs.writeFileSync(raw, Buffer.from(b64, 'base64'));
  return raw;
}

async function withRetry(c, P, model) {
  let last;
  for (let a = 1; a <= 3; a++) {
    try { return await genOne(c, P, model); }
    catch (e) {
      last = e;
      const wait = 4000 * a;
      console.log('  · ' + c.id + ' 第 ' + a + ' 次失败：' + last.message.slice(0, 120) + '，' + (wait / 1000) + 's 后重试');
      await new Promise(r => setTimeout(r, wait));
    }
  }
  console.log('  × ' + c.id + ' 三次都失败：' + last.message.slice(0, 200));
  return null;
}

async function pool(items, n, fn) {
  let i = 0, ok = [], fail = [];
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
  if (LIST) {
    console.log('id'.padEnd(22) + 'ch'.padEnd(7) + 'pri'.padEnd(5) + 'motion'.padEnd(11) + '提示词  caption');
    CG.forEach(c => {
      const ready = (c.prompt_en || '').trim().length > 40;
      console.log((c.id + (ready ? '' : '  ← 提示词为空')).padEnd(22) + (c.ch || '-').padEnd(7)
        + (c.priority || '-').padEnd(5) + (c.motion || 'zoom-in').padEnd(11)
        + (ready ? '  ✓' : '  ✗') + '  ' + (c.caption || ''));
    });
    console.log('共 ' + CG.length + ' 条，P0 ' + CG.filter(c => c.priority === 'P0').length + ' 条');
    return;
  }

  let todo = CG;
  if (ONLY.length) todo = todo.filter(c => ONLY.indexOf(c.id) >= 0);
  if (CH.length) todo = todo.filter(c => CH.indexOf(c.ch) >= 0);
  if (ALL_P0) todo = todo.filter(c => c.priority === 'P0');
  if (!ONLY.length && !CH.length && !ALL_P0) { console.error('要指定范围：--only / --ch / --all-p0（或 --list）'); process.exit(2); }

  const missing = todo.filter(c => !(c.prompt_en || '').trim());
  if (missing.length) {
    console.log('跳过 ' + missing.length + ' 条（提示词为空，等 cg-story-audit 填完）：' + missing.map(c => c.id).join(', '));
    todo = todo.filter(c => (c.prompt_en || '').trim());
  }
  if (DRY) {
    todo.forEach(c => { console.log('\n================ ' + c.id + '  [' + c.ch + '] ' + c.title + '\n' + promptFor(c)); });
    return;
  }
  if (!todo.length) { console.log('没有要生成的条目'); return; }

  const already = todo.filter(c => fs.existsSync(path.join(RAW_DIR, c.id + (TAG ? '__' + TAG : '') + '.png')));
  if (already.length && !FORCE) {
    console.log('已有 ' + already.length + ' 张原始图，跳过（--force 可重出）：' + already.map(c => c.id).join(', '));
    todo = todo.filter(c => already.indexOf(c) < 0);
  }
  if (!todo.length) { console.log('没有要生成的条目'); return; }

  fs.mkdirSync(RAW_DIR, { recursive: true });
  const P = loadProvider(PROVIDER);
  const model = argOf('--model', process.env.CG_MODEL || PROVIDERS[PROVIDER].model);
  console.log('provider=' + P.name + '  model=' + model + '  size=' + SIZE + '  并发=' + CONC);
  console.log('待生成 ' + todo.length + ' 张：' + todo.map(c => c.id).join(', '));
  const t0 = Date.now();
  const { ok, fail } = await pool(todo, CONC, async (c) => {
    const t = Date.now();
    const raw = await withRetry(c, P, model);
    if (!raw) return null;
    console.log('  ✓ ' + c.id + '  ' + ((Date.now() - t) / 1000).toFixed(0) + 's  -> ' + path.relative(ROOT, raw));
    if (!NO_POST) {
      try {
        execFileSync('python', [path.join(ROOT, 'tools', 'cg-post.py'), '--raw', raw,
          '--out', path.join(ROOT, 'assets', 'generated', 'cg', c.id + '.png')], { stdio: 'inherit' });
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
