#!/usr/bin/env node
/* ==========================================================================
 * tools/build-portrait-states.js —— 把评审组确认的形象演进清单编译成运行时数据
 *
 *   node tools/build-portrait-states.js
 *   node tools/build-portrait-states.js --check
 *
 * 唯一来源：
 *   docs/reviews/char-progression-spec.json
 * 生成物：
 *   src/data/portraitStates.js
 *
 * 这里只做机械转换与契约校验，不重新解释剧情。评审组改完 JSON 后重跑本脚本，
 * 生成组与引擎就会同时看到同一份状态表。
 * ========================================================================== */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'docs', 'reviews', 'char-progression-spec.json');
const OUT = path.join(ROOT, 'src', 'data', 'portraitStates.js');
const CHECK = process.argv.includes('--check');
const FACES = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];
const INJURY = new Set(['none', 'old_wound', 'bandaged', 'stretcher', 'frost', 'exhausted']);

function fail(message) {
  console.error('形象演进清单校验失败：' + message);
  process.exit(1);
}

const raw = fs.readFileSync(SRC);
const spec = JSON.parse(raw.toString('utf8'));
if (spec.version !== 1) fail('version 必须为 1');
if (!spec.characters || typeof spec.characters !== 'object') fail('缺少 characters');

const ids = Object.keys(spec.characters);
if (ids.length !== 35) fail('角色数应为 35，实际为 ' + ids.length);

const states = {};
const chapterStates = {};
const beats = [];
const characters = {};
const seenState = new Set();

for (const charId of ids) {
  const source = spec.characters[charId];
  if (!source || !source.chapterStates || !source.states) fail(charId + ' 缺少 chapterStates 或 states');

  const character = {
    name: source.name || charId,
    stateIds: [],
    beats: Array.isArray(source.beats) ? source.beats : []
  };

  for (const [stateId, state] of Object.entries(source.states)) {
    if (seenState.has(stateId)) fail('状态 id 重复：' + stateId);
    seenState.add(stateId);
    if (!stateId.startsWith(charId + '_')) fail(stateId + ' 的前缀不是 ' + charId);
    if (!Number.isInteger(state.wear) || state.wear < 0 || state.wear > 5) fail(stateId + ' 的 wear 不是 0–5 整数');
    if (!Number.isInteger(state.dirt) || state.dirt < 0 || state.dirt > 5) fail(stateId + ' 的 dirt 不是 0–5 整数');
    if (!INJURY.has(state.injury)) fail(stateId + ' 的 injury 不在枚举内');
    if (!Array.isArray(state.faces) || !state.faces.length) fail(stateId + ' 的 faces 为空');
    if (state.faces.indexOf('calm') < 0) fail(stateId + ' 的 faces 缺少 calm');
    state.faces.forEach(face => {
      if (FACES.indexOf(face) < 0) fail(stateId + ' 含非法表情 ' + face);
    });
    for (const key of ['appearance_en', 'avoid_en', 'label', 'pose_cn', 'outfit_cn', 'equipment_cn']) {
      if (typeof state[key] !== 'string' || !state[key].trim()) fail(stateId + ' 缺少 ' + key);
    }
    if (!Array.isArray(state.props_cn) || !state.props_cn.length) fail(stateId + ' 缺少道具清单');

    const row = {
      id: stateId,
      character: charId,
      label: state.label,
      chapters: state.chapters.slice(),
      wear: state.wear,
      dirt: state.dirt,
      injury: state.injury,
      outfit_cn: state.outfit_cn,
      equipment_cn: state.equipment_cn,
      head: state.head,
      pose_cn: state.pose_cn,
      props_cn: state.props_cn,
      faces: state.faces.slice(),
      appearance_en: state.appearance_en,
      avoid_en: state.avoid_en
    };
    states[stateId] = row;
    character.stateIds.push(stateId);
  }

  for (const [chapter, stateId] of Object.entries(source.chapterStates)) {
    if (!states[stateId]) fail(charId + ' 的 ' + chapter + ' 指向不存在的状态 ' + stateId);
    if (states[stateId].character !== charId) fail(charId + ' 的 ' + chapter + ' 指向了别人的状态 ' + stateId);
    chapterStates[chapter] = chapterStates[chapter] || {};
    if (chapterStates[chapter][charId]) fail(charId + ' 在 ' + chapter + ' 有两个状态');
    chapterStates[chapter][charId] = stateId;
  }

  character.beats.forEach(beat => {
    if (!states[beat.portraitId]) fail(charId + ' 的 beat 指向不存在的状态 ' + beat.portraitId);
    if (states[beat.portraitId].character !== charId) fail(charId + ' 的 beat 指向了别人的状态 ' + beat.portraitId);
    if (!beat.chapter || !beat.after_text) fail(charId + ' 的 beat 缺少 chapter 或 after_text');
    beats.push({
      character: charId,
      chapter: beat.chapter,
      after_text: beat.after_text,
      portraitId: beat.portraitId
    });
  });

  characters[charId] = character;
}

for (const [chapter, row] of Object.entries(chapterStates)) {
  for (const charId of Object.keys(row)) {
    if (!characters[charId]) fail(chapter + ' 指向未知角色 ' + charId);
  }
}

const digest = crypto.createHash('sha256').update(raw).digest('hex');
const data = {
  version: 1,
  source: 'docs/reviews/char-progression-spec.json',
  source_sha256: digest,
  characters,
  states,
  chapterStates,
  beats
};

const body = [
  '/* 角色形象演进运行时数据 —— 由 tools/build-portrait-states.js 生成，请勿手改。',
  ' *',
  ' * 唯一来源：docs/reviews/char-progression-spec.json',
  ' * 生成：node tools/build-portrait-states.js',
  ' *',
  ' * 引擎只读 chapterStates 与 beats；生成工具读 states 的 appearance_en / avoid_en / faces。',
  ' * 人物 id 与 8 种表情仍由 SPEC.md 冻结，本文件不新增人物，也不改表情枚举。',
  ' */',
  '(function () {',
  '  var G = (typeof window !== \'undefined\') ? window : globalThis;',
  '  G.ART = G.ART || {};',
  '  G.ART.portraitStates = ' + JSON.stringify(data, null, 2) + ';',
  '})();',
  ''
].join('\n');

if (CHECK) {
  if (!fs.existsSync(OUT)) fail('运行时数据尚未生成：' + OUT);
  const current = fs.readFileSync(OUT, 'utf8');
  if (current !== body) {
    fail('运行时数据落后于评审清单，请重跑 node tools/build-portrait-states.js');
  }
  console.log('形象演进运行时数据与评审清单一致：' +
    ids.length + ' 角色 / ' + Object.keys(states).length + ' 状态 / ' +
    Object.keys(chapterStates).reduce((n, ch) => n + Object.keys(chapterStates[ch]).length, 0) +
    ' 章映射 / ' + beats.length + ' 个章内变化');
  process.exit(0);
}

fs.writeFileSync(OUT, body, 'utf8');
console.log('已写入 ' + path.relative(ROOT, OUT));
console.log('角色 ' + ids.length + '，状态 ' + Object.keys(states).length +
  '，章映射 ' + Object.keys(chapterStates).reduce((n, ch) => n + Object.keys(chapterStates[ch]).length, 0) +
  '，章内变化 ' + beats.length);
console.log('来源 SHA-256 ' + digest);
