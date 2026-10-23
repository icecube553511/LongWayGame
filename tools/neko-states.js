#!/usr/bin/env node
/* ==========================================================================
 * tools/neko-states.js —— 按剧情状态生成角色立绘
 *
 *   node tools/neko-states.js --dry-run --character mao
 *   node tools/neko-states.js --character mao,zhou
 *   node tools/neko-states.js --only xiaoman_ch20_huining
 *   node tools/neko-states.js --skip-existing
 *
 * 关键点：
 *   1. 清单只读 src/data/portraitStates.js；不改人物 id，不改表情枚举。
 *   2. 每个状态都以该角色的原始 calm 基准图为参考，禁止链式换脸；
 *      状态只改服装、磨损、道具和姿态。
 *   3. 每个状态的 calm 先出；其余表情用该状态 calm 做局部编辑，只改眉、眼、嘴。
 *   4. 原图留在 tmp/neko-states-raw/，成品由 tools/neko-post.py 抠底并缩到 600×900。
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');
const { STYLE, HEAD_STYLE_LOCK, FACEDESC, KEY_COLOR, getProvider } = require('./neko-art.js');

const ROOT = path.resolve(__dirname, '..');
const STORY_DIR = path.join(ROOT, 'src', 'story');
const OUT = path.join(ROOT, 'assets', 'generated', 'chars');
const RAW = path.join(ROOT, 'tmp', 'neko-states-raw');
const EXPR_MASK_PATH = path.join(ROOT, 'tmp', 'mask-expression-face.png');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(RAW, { recursive: true });

const argv = process.argv.slice(2);
const argOf = (flag, def) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const DRY = argv.includes('--dry-run');
const FORCE = argv.includes('--force');
const SKIP = argv.includes('--skip-existing');
const EXPR_ONLY = argv.includes('--expressions-only');
const EXPR_MASK = argv.includes('--expression-mask');
/* 只补表情、不重出 calm：用于单张表情返修，避免把已验收的状态基准图覆盖掉。 */
const NO_CALM = argv.includes('--no-calm');
const QUALITY = argOf('--quality', process.env.NEKO_QUALITY || 'low');
const SIZE = argOf('--size', '1024x1536');
const CONC = Math.max(1, Math.min(8, parseInt(argOf('--concurrency', '4'), 10)));
const charFilter = argOf('--character', '').split(',').map(s => s.trim()).filter(Boolean);
const stateFilter = argOf('--only', '').split(',').map(s => s.trim()).filter(Boolean);
const faceFilter = argOf('--faces', '').split(',').map(s => s.trim()).filter(Boolean);
const forceStateFilter = argOf('--force-state', '').split(',').map(s => s.trim()).filter(Boolean);
const forceFaceFilter = argOf('--force-face', '').split(',').map(s => s.trim()).filter(Boolean);
/* 单张返修用的补充提示词（只写画面，否定句仍走 avoid）；不写进长期清单。 */
const EXTRA = argOf('--extra', '');
const IDENTITY_OVERRIDE = argOf('--identity', '');
const BODY_REF_OVERRIDE = argOf('--body-ref', '');
const NO_IDENTITY = argv.includes('--no-identity');
const CROWD = { soldiers: 'three Red Army soldiers', villagers: 'three Chinese villagers', yi_people: 'three Yi people' };
/* HEAD_STYLE_LOCK 由 tools/neko-art.js 统一导出，基础立绘、剧情变种与
 * 局部表情重绘共用同一段头部刻面锁，避免两条出图链各写一份后漂移。 */

function loadStates() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'portraitStates.js'), 'utf8'), sandbox, {
    filename: 'src/data/portraitStates.js'
  });
  const data = sandbox.window.ART.portraitStates;
  const cbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characters.js'), 'utf8'), cbox, {
    filename: 'src/data/characters.js'
  });
  const meta = (cbox.window.ART && cbox.window.ART.charactersById) || {};
  Object.keys(data.characters).forEach(id => {
    const m = meta[id] || {};
    data.characters[id].name = m.name || id;
    data.characters[id].role = m.role || '红军人物';
  });
  return data;
}

function storyUsage() {
  const use = {};
  fs.readdirSync(STORY_DIR).filter(f => /^ch\d+\.js$/.test(f)).sort().forEach(file => {
    const id = file.replace('.js', '');
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(STORY_DIR, file), 'utf8'), sandbox, { filename: file });
    const ch = sandbox.window.STORY && sandbox.window.STORY[id];
    if (!ch) return;
    (function walk(steps) {
      (steps || []).forEach(step => {
        if ((step.t === 'say' || step.t === 'think' || step.t === 'show') && step.who) {
          use[id] = use[id] || {};
          const set = use[id][step.who] || (use[id][step.who] = new Set());
          set.add(step.face || 'calm');
        }
        if (step.t === 'if') { walk(step.then); walk(step.else); }
      });
    })(ch.steps);
  });
  return use;
}

function facesForState(state) {
  return state.faces.slice().filter(f => !faceFilter.length || faceFilter.indexOf(f) >= 0);
}

function headPhrase(head) {
  const h = head || {};
  const parts = ['facing the viewer with a natural three-quarter turn'];
  if (h.turn) parts.push('head turn: ' + h.turn);
  if (h.pitch) parts.push('head pitch: ' + h.pitch);
  const gaze = String(h.gaze || 'forward').replace(/_/g, ' ');
  parts.push('eyes looking ' + gaze);
  return parts.join(', ');
}

function injuryPhrase(code) {
  return ({
    none: 'no fresh injury',
    old_wound: 'an old healed scar, no fresh bleeding',
    bandaged: 'a neat period-appropriate cloth bandage, restrained and not graphic',
    stretcher: 'propped on a simple wooden carrying stretcher, still wounded but composed',
    frost: 'frost on brows and lashes, cracked dry skin, cold exhaustion rather than graphic injury',
    exhausted: 'deep fatigue, hollow cheeks, dark shadows under the eyes, no fresh wound'
  })[code] || 'no fresh injury';
}

function basePrompt(charId, state, face) {
  const c = state.characterData;
  const crowd = CROWD[charId];
  const faceText = FACEDESC[face] || FACEDESC.calm;
  const expression = charId === 'narrator'
    ? 'no facial features; keep the face hidden under the hood, with emotion conveyed only by the set of the shoulders'
    : faceText;
  return [
    STYLE,
    '',
    HEAD_STYLE_LOCK,
    '',
    crowd
      ? 'SUBJECT: half-body group portrait of exactly ' + crowd + ' from the Long March, 1934-1936 China.'
      : 'SUBJECT: half-body portrait of exactly one historical character from the Long March, 1934-1936 China.',
    'Name: ' + c.name + '. Role: ' + (c.role || 'Red Army figure') + '.',
    'STORY STATE: ' + state.label + '.',
    'APPEARANCE (approved character-progression spec, follow it literally): ' + state.appearance_en,
    'WEAR LEVEL: ' + state.wear + ' of 5, dirt ' + state.dirt + ' of 5.',
    'HEAD AND GAZE: ' + headPhrase(state.head) + '.',
    'POSTURE: ' + state.pose_cn.replace(/[。.]$/, '') + '.',
    'PROPS: ' + state.props_cn.join(', ') + '. Every prop must have a believable contact point with the body; no floating objects.',
    'EXPRESSION: ' + expression + '.',
    '',
    'FRAMING: head to waist, head occupying about one quarter of the image height, figure centred.',
    crowd
      ? 'The same three individuals always remain consistent: fixed builds, ages, faces, clothing and signature props.'
      : 'The character always remains the same individual: same face shape, age, eyebrows, nose, mouth, cap and signature props.',
    crowd ? 'Exactly three people. No fourth person.' : 'Exactly one person. No other people.',
    '',
    'BACKGROUND: a perfectly flat solid uniform pure magenta ' + KEY_COLOR + ' filling every pixel',
    'behind the figure. Single flat colour only - no gradient, no texture, no shadow, no floor,',
    'no horizon, no scenery. The figure stands on nothing.',
    '',
    'AVOID: text, letters, watermark, signature, frame, border, photographic realism, anime line art,',
    'smooth airbrushed shading, glossy highlights, high saturation, different face,',
    'changed age, modern insignia, modern clothing, graphic wounds, excessive blood, floating props,',
    'cropped head, full body, legs, ' + state.avoid_en
  ].join('\n');
}

function editBasePrompt(charId, state, face, fromState) {
  const c = state.characterData;
  const crowd = CROWD[charId];
  const expression = charId === 'narrator'
    ? 'leave the face completely hidden under the hood; do not create facial features'
    : (FACEDESC[face] || FACEDESC.calm);
  return [
    STYLE,
    '',
    HEAD_STYLE_LOCK,
    '',
    crowd
      ? 'Edit the supplied three-person group portrait. Preserve exactly the same three individuals: builds, ages, bone structure,'
      : 'Edit the supplied single-character portrait. Preserve the exact same person: face shape, age, bone structure,',
    'eyebrows, nose, mouth, skin tone, cap shape and the same low-poly rendering.',
    'This is a story progression of ' + c.name + ', not a redesign and not another actor.',
    'Preserve the exact same face shape and apparent age as the reference image; only change the clothing, wear, dirt, gear, pose and head direction described below. Do not recast the character or make the face look years older.',
    fromState ? 'The reference shows the character at the start of the story.' : '',
    'Now change only the story state:',
    'STORY STATE: ' + state.label + '.',
    'APPEARANCE (approved character-progression spec, follow it literally): ' + state.appearance_en,
    'WEAR LEVEL: ' + state.wear + ' of 5, dirt ' + state.dirt + ' of 5. Cloth may only become as worn as this level describes.',
    'HEAD AND GAZE: ' + headPhrase(state.head) + '.',
    'POSTURE: ' + state.pose_cn.replace(/[。.]$/, '') + '.',
    'PROPS: ' + state.props_cn.join(', ') + '. Keep believable contact points; no floating objects.',
    'EXPRESSION: ' + expression + '.',
    '',
    'KEEP: the same single person, head-to-waist framing, upper-left hard light, flat-shaded low-poly style,',
    'and a perfectly flat pure magenta ' + KEY_COLOR + ' background in every pixel behind the figure.',
    crowd ? 'Exactly three people. No fourth person.' : 'Exactly one person. No other people.',
    'AVOID: text, watermark, frame, border, extra people, different face, changed age, modern clothing,',
    'graphic wounds, excessive blood, floating props, full body, legs, ' + state.avoid_en
  ].join('\n');
}

function expressionPrompt(charId, state, face) {
  const crowd = CROWD[charId];
  const expression = charId === 'narrator'
    ? 'keep the face completely hidden; do not invent eyes, nose or mouth'
    : (FACEDESC[face] || FACEDESC.calm);
  return [
    HEAD_STYLE_LOCK,
    '',
    crowd
      ? 'Edit the supplied three-person group portrait. These are the same three people in the same story state.'
      : 'Edit the supplied single-character portrait. This is the same person, same story state.',
    'This is a LOCAL FACIAL EXPRESSION EDIT, not a redraw and not a new illustration.',
    'Preserve exactly: facial identity and proportions, age, skin tone, hair, cap, every garment,',
    'the exact amount of wear and dirt, all injuries and bandages, all held or carried props,',
    'the head turn, head tilt, eye direction, body pose, framing, camera angle, upper-left hard light,',
    'low-poly faceted style and the flat pure magenta background.',
    'Everything outside the eyebrows, eyes and mouth must stay as close to the reference as possible:',
    'same head size and position in frame, same shoulders, same hands, same arms, same props,',
    'same table or background objects, same crop. Do not zoom, reposition, stand up, kneel down,',
    'turn the body, redraw the clothing, change the light, or repaint the whole picture.',
    crowd
      ? 'Change only the three facial expressions, each reflecting the same group mood: ' + expression + '.'
      : 'Change only the facial expression: ' + expression + '.',
    crowd ? 'Keep exactly three people, with three different faces and builds.' : 'Keep exactly one person.',
    'Do not alter the clothing, equipment, props, head angle, pose, framing or background.',
    'BACKGROUND: perfectly flat solid magenta ' + KEY_COLOR + ' in every pixel behind the figure.',
    'AVOID: text, watermark, frame, border, extra people, changed clothing, changed props,',
    'different head angle, changed pose, changed crop, zoomed out, full body, standing up, kneeling down,',
    'redrawn background, bleached clothing, washed-out image, graphic wounds, excessive blood,',
    'photographic realism, anime line art.'
  ].join('\n');
}

function expressionMaskPrompt(charId, state, face) {
  const expression = charId === 'narrator'
    ? 'keep the face hidden and unchanged'
    : (FACEDESC[face] || FACEDESC.calm);
  return [
    HEAD_STYLE_LOCK,
    '',
    'Edit only the facial expression of the supplied portrait.',
    'Keep every pixel outside the face mask unchanged: same body pose, clothing, equipment, background, head angle, hair and hat.',
    'Inside the mask, preserve the existing low-poly facets and flat value steps; do not smooth, airbrush or repaint the forehead, temples, eye sockets, nose bridge and cheeks.',
    'Change only eyebrows, eyes and mouth to: ' + expression + '.',
    'Do not redesign the face, clothing or props. Do not move the head or shoulders.',
    'Exactly one person. No other people, no text, no watermark.',
    'AVOID: smooth airbrushed shading, soft painted skin, photographic realism, anime line art, gradient skin.'
  ].join('\n');
}

function isGoodPng(file) {
  try {
    const st = fs.statSync(file);
    /* P 模式调色板 PNG 可以只有 30–50 KB；这里只拒绝空文件/截断，
       不能再用旧的 "至少 50 KB" 经验值。 */
    if (st.size < 8 * 1024) return false;
    if (st.size > 512 * 1024) return false;
    const head = fs.readFileSync(file).subarray(0, 8);
    return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  } catch (_) { return false; }
}

async function requestImage(prompt, refPath) {
  const P = getProvider();
  const image = fs.readFileSync(refPath);
  let r;
  let text = '';
  for (const field of ['image', 'image[]']) {
    const fd = new FormData();
    fd.append('model', process.env.NEKO_MODEL || P.model);
    fd.append('prompt', prompt);
    fd.append(field, new Blob([image], { type: 'image/png' }), path.basename(refPath));
    fd.append('n', '1');
    fd.append('size', SIZE);
    fd.append('quality', QUALITY);
    r = await fetch(P.base + '/v1/images/edits', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + P.key },
      body: fd,
      signal: AbortSignal.timeout(240000)
    });
    text = await r.text();
    if (r.ok) break;
    if (field === 'image[]' || (r.status !== 400 && r.status !== 404 && r.status !== 422)) break;
  }
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 240));
  let j;
  try { j = JSON.parse(text); } catch (_) { throw new Error('非 JSON 响应：' + text.slice(0, 180)); }
  const b64 = j.data && j.data[0] && (j.data[0].b64_json || j.data[0].b64);
  if (!b64) throw new Error('响应里没有 b64_json：' + text.slice(0, 200));
  return Buffer.from(b64, 'base64');
}

async function requestImageMask(prompt, refPath) {
  if (!fs.existsSync(EXPR_MASK_PATH)) {
    const made = spawnSync('python', [path.join(ROOT, 'tools', 'make-expression-mask.py')], {
      cwd: ROOT,
      encoding: 'utf8'
    });
    if (made.status !== 0) throw new Error(made.stderr || '生成表情蒙版失败');
  }
  const P = getProvider();
  const fd = new FormData();
  fd.append('model', process.env.NEKO_MODEL || P.model);
  fd.append('prompt', prompt);
  fd.append('image', new Blob([fs.readFileSync(refPath)], { type: 'image/png' }), path.basename(refPath));
  fd.append('mask', new Blob([fs.readFileSync(EXPR_MASK_PATH)], { type: 'image/png' }), 'mask-expression-face.png');
  fd.append('n', '1');
  fd.append('size', SIZE);
  fd.append('quality', QUALITY);
  const r = await fetch(P.base + '/v1/images/edits', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + P.key },
    body: fd,
    signal: AbortSignal.timeout(240000)
  });
  const text = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 240));
  let j;
  try { j = JSON.parse(text); } catch (_) { throw new Error('非 JSON 响应：' + text.slice(0, 180)); }
  const b64 = j.data && j.data[0] && (j.data[0].b64_json || j.data[0].b64);
  if (!b64) throw new Error('响应里没有 b64_json：' + text.slice(0, 200));
  return Buffer.from(b64, 'base64');
}

async function requestImageMulti(prompt, refPaths) {
  const P = getProvider();
  const fd = new FormData();
  fd.append('model', process.env.NEKO_MODEL || P.model);
  fd.append('prompt', prompt);
  refPaths.forEach(function (refPath) {
    fd.append('image[]', new Blob([fs.readFileSync(refPath)], { type: 'image/png' }), path.basename(refPath));
  });
  fd.append('n', '1');
  fd.append('size', SIZE);
  fd.append('quality', QUALITY);
  const r = await fetch(P.base + '/v1/images/edits', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + P.key },
    body: fd,
    signal: AbortSignal.timeout(240000)
  });
  const text = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 240));
  let j;
  try { j = JSON.parse(text); } catch (_) { throw new Error('非 JSON 响应：' + text.slice(0, 180)); }
  const b64 = j.data && j.data[0] && (j.data[0].b64_json || j.data[0].b64);
  if (!b64) throw new Error('响应里没有 b64_json：' + text.slice(0, 200));
  return Buffer.from(b64, 'base64');
}

/* 双图锁脸：Image 1 只提供身份，Image 2 只提供服装、磨损、道具与动作。
 * 单图编辑在“换整套衣服”时仍会缓慢换脸，双图参考能明显压住这种漂移。 */
function identityStatePrompt(charId, state, face) {
  const c = state.characterData;
  const crowd = CROWD[charId];
  const expression = charId === 'narrator'
    ? 'leave the face hidden under the hood; do not create facial features'
    : (FACEDESC[face] || FACEDESC.calm);
  return [
    STYLE,
    '',
    HEAD_STYLE_LOCK,
    '',
    crowd
      ? 'Use Image 1 as the exact identity reference for the same three individuals, and Image 2 as the body, clothing, pose and story-state reference.'
      : 'Use Image 1 as the exact identity reference and Image 2 as the body, clothing, pose and story-state reference.',
    crowd
      ? 'Copy the same three builds, ages, faces, hair and head shapes from Image 1 exactly.'
      : 'Copy the face, head shape, apparent age, eyes, eyebrows, nose, mouth, skin tone and hair from Image 1 exactly. Do not average Image 1 and Image 2 faces. It must be the same person, not a different actor.',
    'Use Image 2 only as a continuity reference for the established clothing silhouette and overall framing.',
    'The earlier state must not override this scene. Apply every wear, dirt, injury, pose and prop change listed below.',
    'STATE-SPECIFIC POSTURE: ' + state.pose_cn.replace(/[。.]$/, '') + '.',
    'STATE-SPECIFIC PROPS: ' + state.props_cn.join(', ') + '. These are the only permitted story props.',
    'Remove any prop that belonged only to the earlier state and is not in this list.',
    'STORY STATE SUMMARY: ' + state.appearance_en,
    'EXPRESSION: ' + expression + '.',
    '',
    'FRAMING: head to waist, head occupying about one quarter of the image height, figure centred.',
    crowd ? 'Exactly three people from Image 1, no fourth person.' : 'Exactly one person. No other people.',
    'BACKGROUND: perfectly flat solid pure magenta ' + KEY_COLOR + ' behind the figure, no floor, no scenery.',
    'AVOID: changed face, older face, different facial structure, different actor, extra people, extra limbs,',
    'full body, legs, text, watermark, frame, photographic realism, anime line art, glossy highlights, ' + state.avoid_en
  ].join('\n');
}

async function requestTextImage(prompt) {
  const P = getProvider();
  const r = await fetch(P.base + '/v1/images/generations', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + P.key,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.NEKO_MODEL || P.model,
      prompt,
      n: 1,
      size: SIZE,
      quality: QUALITY
    }),
    signal: AbortSignal.timeout(240000)
  });
  const text = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 240));
  let j;
  try { j = JSON.parse(text); } catch (_) { throw new Error('非 JSON 响应：' + text.slice(0, 180)); }
  const b64 = j.data && j.data[0] && (j.data[0].b64_json || j.data[0].b64);
  if (!b64) throw new Error('响应里没有 b64_json：' + text.slice(0, 200));
  return Buffer.from(b64, 'base64');
}

function backupRaw(file) {
  if (!fs.existsSync(file)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(RAW, 'prev', stamp);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(file, path.join(dir, path.basename(file)));
}

function bakeBuffer(state, face, buf, force) {
  const stem = state.id + '_' + face;
  const raw = path.join(RAW, stem + '.png');
  if (force) backupRaw(raw);
  fs.writeFileSync(raw, buf);
  const py = spawnSync('python', [
    path.join(ROOT, 'tools', 'neko-post.py'),
    '--raw', RAW,
    '--out', OUT,
    stem
  ], { cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, { PYTHONIOENCODING: 'utf-8' }) });
  if (py.status !== 0) throw new Error(py.stderr || py.stdout || 'neko-post.py 失败');
  if (!isGoodPng(path.join(OUT, stem + '.png'))) throw new Error('成品不是完整 PNG');
  if (py.stdout.trim()) console.log('    ' + py.stdout.trim().split('\n').filter(Boolean).pop());
  return true;
}

async function generateOne(state, face, prompt, refPath, label) {
  const stem = state.id + '_' + face;
  const force = FORCE || forceStateFilter.indexOf(state.id) >= 0 ||
    forceFaceFilter.indexOf(state.id + ':' + face) >= 0;
  if (!force && SKIP && isGoodPng(path.join(OUT, stem + '.png'))) {
    console.log('  · 已有 ' + stem);
    return true;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log('  → ' + label + (attempt > 1 ? '（重试 ' + attempt + '）' : ''));
      const full = EXTRA ? (prompt + '\n' + EXTRA) : prompt;
      let buf;
      if (EXPR_MASK && refPath && face !== 'calm') {
        const masked = await requestImageMask(expressionMaskPrompt(state.character, state, face), refPath);
        const tmpRaw = path.join(RAW, stem + '_mask.png');
        fs.writeFileSync(tmpRaw, masked);
        const alpha = spawnSync('python', [
          path.join(ROOT, 'tools', 'apply-alpha.py'),
          tmpRaw,
          refPath
        ], { cwd: ROOT, encoding: 'utf8' });
        if (alpha.status !== 0) throw new Error(alpha.stderr || '应用基准 alpha 失败');
        buf = fs.readFileSync(tmpRaw);
      } else {
        buf = refPath ? await requestImage(full, refPath) : await requestTextImage(full);
      }
      return bakeBuffer(state, face, buf, force);
    } catch (e) {
      console.log('    × ' + e.message);
      if (attempt === 3) return false;
      await new Promise(r => setTimeout(r, 1600 * attempt));
    }
  }
  return false;
}

async function generateCalmIdentity(characterId, state, identityPath, stateRefPath) {
  const stem = state.id + '_calm';
  const force = FORCE || forceStateFilter.indexOf(state.id) >= 0;
  if (!force && SKIP && isGoodPng(path.join(OUT, stem + '.png'))) {
    console.log('  · 已有 ' + stem);
    return true;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log('  → ' + state.id + '/calm（双图锁脸）' + (attempt > 1 ? '（重试 ' + attempt + '）' : ''));
      let bodyRef = stateRefPath;
      if (!bodyRef) {
        const bodyBuf = await requestTextImage(basePrompt(characterId, state, 'calm'));
        bodyRef = path.join(RAW, state.id + '_body.png');
        fs.writeFileSync(bodyRef, bodyBuf);
      }
      const refs = identityPath ? [identityPath, bodyRef] : [bodyRef];
      const prompt = identityPath
        ? identityStatePrompt(characterId, state, 'calm')
        : basePrompt(characterId, state, 'calm');
      const full = EXTRA ? (prompt + '\n' + EXTRA) : prompt;
      const buf = refs.length > 1
        ? await requestImageMulti(full, refs)
        : await requestImage(full, refs[0]);
      return bakeBuffer(state, 'calm', buf, force);
    } catch (e) {
      console.log('    × ' + e.message);
      if (attempt === 3) return false;
      await new Promise(r => setTimeout(r, 1600 * attempt));
    }
  }
  return false;
}

function baseImage(charId) {
  const png = path.join(OUT, charId + '_calm.png');
  if (isGoodPng(png)) return png;
  return '';
}

async function pool(tasks, limit) {
  let i = 0;
  const results = [];
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

(async () => {
  const data = loadStates();
  const charIds = Object.keys(data.characters).filter(id => !charFilter.length || charFilter.indexOf(id) >= 0);
  const plan = [];
  charIds.forEach(id => {
    const c = data.characters[id];
    c.stateIds.forEach(stateId => {
      const st = data.states[stateId];
      if (stateFilter.length && stateFilter.indexOf(st.id) < 0) return;
      st.characterData = c;
      plan.push({ character: id, state: st, faces: facesForState(st) });
    });
  });

  const totalImages = plan.reduce((n, p) => n + p.faces.length, 0);
  console.log('角色 ' + charIds.length + ' 个，状态 ' + plan.length + ' 个，表情组合 ' + totalImages + ' 张');
  console.log('并发 ' + CONC + '，尺寸 ' + SIZE + '，质量 ' + QUALITY + '，参考图链=' + (DRY ? '仅打印' : '开'));

  if (DRY) {
    plan.forEach(p => {
      console.log('\n===== ' + p.state.id + ' [' + p.faces.join(',') + '] =====');
      console.log(basePrompt(p.character, p.state, 'calm'));
    });
    return;
  }

  /* 第一阶段：每个状态都锚定该角色的原始 calm 基准图，避免链式参考把脸越改越老。
   * 只有原始基准位图不存在时，才退回上一状态。角色之间并行，角色内部串行以控制并发。 */
  const byCharacter = [];
  plan.forEach(p => {
    let group = byCharacter.find(g => g.character === p.character);
    if (!group) {
      group = { character: p.character, items: [] };
      byCharacter.push(group);
    }
    group.items.push(p);
  });
  const baseResults = [];
  if (NO_CALM) {
    plan.forEach(p => {
      baseResults.push(isGoodPng(path.join(OUT, p.state.id + '_calm.png')));
    });
  } else {
    const baseGroups = await pool(byCharacter.map(group => async () => {
      const stateIds = data.characters[group.character].stateIds;
      const results = [];
      for (const p of group.items) {
        if (EXPR_ONLY) {
          results.push(isGoodPng(path.join(OUT, p.state.id + '_calm.png')));
          continue;
        }
        const idx = stateIds.indexOf(p.state.id);
        const prev = idx > 0 ? data.states[stateIds[idx - 1]] : null;
        const identity = NO_IDENTITY ? '' : (IDENTITY_OVERRIDE
          ? path.resolve(ROOT, IDENTITY_OVERRIDE)
          : baseImage(group.character));
        const previous = prev ? path.join(OUT, prev.id + '_calm.png') : '';
        /* 重出时不要拿“旧的坏图”当身体参考：只复用上一状态成品，
         * 首状态重出则从文字 + 人物基础图重新锁脸。 */
        const stateRef = NO_IDENTITY ? '' : (BODY_REF_OVERRIDE
          ? path.resolve(ROOT, BODY_REF_OVERRIDE)
          : (previous && isGoodPng(previous) ? previous : ''));
        results.push(await generateCalmIdentity(group.character, p.state, identity, stateRef));
      }
      return results;
    }), CONC);
    baseGroups.forEach(group => group.forEach(v => baseResults.push(v)));
  }

  /* 第二阶段：同一状态的其余表情只改五官，参考该状态 calm。 */
  const exprTasks = [];
  plan.forEach((p, i) => {
    if (!baseResults[i]) return;
    const ref = path.join(OUT, p.state.id + '_calm.png');
    p.faces.filter(f => f !== 'calm').forEach(face => {
      exprTasks.push(async () => generateOne(
        p.state, face, expressionPrompt(p.character, p.state, face), ref,
        p.state.id + '/' + face
      ));
    });
  });
  const exprResults = await pool(exprTasks, CONC);

  const okBase = baseResults.filter(Boolean).length;
  const okExpr = exprResults.filter(Boolean).length;
  console.log('\n完成：状态 calm ' + okBase + '/' + plan.length + '，表情 ' + okExpr + '/' + exprTasks.length);
  console.log('原始图：' + RAW);
  console.log('成品：' + OUT);
  if (okBase !== plan.length || okExpr !== exprTasks.length) process.exitCode = 1;
})().catch(e => {
  console.error('失败：' + e.stack);
  process.exit(1);
});
