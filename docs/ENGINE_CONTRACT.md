# 引擎契约（已实现版；与 docs/DOM_CONTRACT.md 冲突时以本文件为准）

> 状态：**已实现并跑通**。`index.html`、`css/style.css`、`src/engine/*.js` 是一次写成的自洽实现，
> DOM id 与 CSS 选择器互相咬合。若按 `docs/DOM_CONTRACT.md`（10:43 的计划稿）另写一套 DOM，
> 两套会互相砸。**请以本文件为准。**
>
> 作者自检记录（2026-10-15）：`node --check` 全部通过；无头 Edge 打开 `index.html` 渲染出标题画面；
> 用 `tmp/engine/game-test.html` 直接开 ch16，验证「读剧本 → 打字机 → 选项 UI → 天气粒子 → 自动解锁」
> 全链路，`window.onerror` 计数为 0。

## 1. 文件归属（实际现状）

| 路径 | 归属 | 说明 |
|---|---|---|
| `index.html` | engine | 已写完。静态容器 + script 顺序；20 章剧本由引擎在 boot 时按 `manifest.js` **动态注入**，缺章不报错 |
| `css/style.css` | engine | 已写完。`--u` 全屏等比缩放单位（1920×1080 基准） |
| `src/engine/save.js` | engine | 已写完。`localStorage` 前缀 `lw_`，6 槽 + 自动存档；不可用时降级内存 |
| `src/engine/engine.js` | engine | 已写完。剧本解释器 + 渲染 + 输入（见 §2/§3） |
| `src/engine/ui.js` | engine | 已写完。标题/章节选择/回想/存读档/设置/系统菜单/章末过场/结局评级 |
| `src/engine/gallery.js` | extras | 已写完。人物图鉴 / 史料档案 / 插画画廊 |
| `src/engine/audio.js` | audio | 已写完。12 首程序化 BGM + 14 个音效，纯 WebAudio |
| `src/data/characters.js` `src/data/backgrounds.js` | root | root 冻结；引擎读取 `window.ART.charactersById` 合并进 `VN.CHARACTERS`（数据表优先，内置表兜底） |
| `docs/reviews/char-progression-spec.json` → `src/data/portraitStates.js` | root | 角色剧情造型清单与运行时表；`node tools/build-portrait-states.js --check` 校验两者一致 |
| `src/story/chNN.js` | story-* | 各自 1 章；验收闸门 `node tools/lint-story.js src/story/chNN.js` |

## 2. DOM 契约（引擎实际使用，不得改动）

```
#stage                  .ui-hidden（H 键）/ .overlay-open（覆盖层打开时）/ .shake
  #bg-layer  #bg-a #bg-b   双缓冲 <img class="bg-img">，交叉淡入；缺失时静默保留上一张
  #char-layer .slot[data-slot=left|center|right] > img     立绘槽；data-empty=1 表示空
  #fx-canvas                天气粒子（rain/snow/ash/star），requestAnimationFrame 循环
  #fx-flash  #fx-fade       flash / blood（红闪）与 fadeout / fadein 覆盖
  #vignette
  #hud  #chapter-tag #chapter-tag-text
        .meter[data-k=morale|trust|hope] > .meter-label / .meter-track > i / .meter-val
  #titlecard > .tc-rule .tc-text .tc-sub .tc-rule
  #note-layer > .note-mark #note-text        史料小注（step.note）
  #dialogue（+ .narr / .think / .typing / .hidden）
     #name-plate > #name-text   #text-body > #text-main #text-caret   #next-arrow
  #choice-layer > #choice-prompt #choice-list > .choice-btn > .choice-key/.choice-text/.choice-tag
  #quickbar > .qbtn[data-act=auto|skip|history|save|settings|hide]
  #toast-layer  #cg-caption  #loading
#overlay                 由 ui.js 注入 .ov > .ov-head/.ov-body；#modal-wrap 为人物/插画弹窗
```

## 3. 引擎 API

```js
VN.start(chapterId, { fresh })    // 开局；fresh=true 重置跨章数值
VN.jump(chapterId)                // 跳章（保留跨章数值）
VN.continueGame()                 // 自动存档 → 最近槽位
VN.state                          // { chapter, frames, morale, trust, hope, flags, records, history, weather, ... }
VN.G                              // { settings, run, progress, unlocked:{chars,archives,cgs,bgs} }
VN.save.{readSlot,writeSlot,listSlots,readAuto,writeAuto,wipe}
VN.CHARACTERS[id]                 // { name, role, desc, chapter }（35 个 id，已与 src/data/characters.js 合并）
window.ART.portraitStates         // { states, chapterStates, beats }（角色剧情造型；不改人物 id）
VN.audio.{init,bgm,stopBgm,sfx,setVolume,duck}
VN.ui.{showTitle,showChapterSelect,showHistory,showSlots,showSettings,showSystem,showResult,error}
VN.gallery.{showChars,showArchives,showArt}
```

步骤语义补充（超出 `docs/SPEC.md` 的部分）：

- `fx` 里 `rain/snow/ash/star` 是**持续性天气**，跨 `bg` 保留，直到再次出现天气类 `fx` 或进入新章节；`flash/shake/fadeout/fadein/blood` 为一次性。
- `title`（2400ms）与 `cg`（3200ms）是阻塞步，计时结束或点击即继续。
- `say` 且带 `face` 时连带 `show` 该人物（自动分配未被占用的立绘槽）。
- **立绘不变式（由 root 补，2026-10-15）**：① 同一个角色最多只占一个槽位——显式写了
  `slot` 而该角色已站在别的槽上时，引擎把他"挪"过去，不会复制成两张一样的脸；
  ② 有名字的说话人必须在台上——`say`/`think` 省略 `face`（SPEC §3.2 允许"与上次相同可省略"）
  而该角色这一幕又没被 `show` 过时，引擎用他本章最近一次的表情兜底补上场，否则姓名条会配一张空舞台。
  群众 id（`soldiers`/`villagers`/`yi_people`/`narrator`）不受 ② 约束：它们是"声音"，允许离场。
  回归测试：`node tools/qa-consistency.js`（全剧逐句核对说话人是否在台上）。
- `note` 显示为对话框上方的"史料"小注条。
- 人物首次 `say`/`show` 自动解锁图鉴；背景与 CG 首次出现自动解锁画廊；`unlock` 步可显式解锁档案。
- 立绘造型解析顺序：剧本显式 `portraitId` → 本章已触发的 beat 状态 →
  当前槽位已有造型 → `chapterStates[章][人物]` → 人物基础 id。
  状态图片缺失时按“状态 PNG → 状态 SVG → 基础 PNG → 基础 SVG”逐级回退。
- `beats` 以剧本原文连续片段触发；当前句念完、玩家翻页后才应用，
  跨 `hide/clear` 保留到本章结束，并写入存档快照。
- 缺失资源一律静默降级：背景保留上一张，立绘不显示，**不产生任何 JS 报错**。

## 4. 自检与冒烟测试

```powershell
node tools/lint-story.js                     # 剧本静态检查（全 20 章）
node tools/lint-story.js src/story/ch16.js   # 单章
node tools/build-portrait-states.js --check  # 造型清单与运行时表一致
node tools/neko-states.js --dry-run          # 打印全部造型生成计划与提示词
```

`tmp/engine/game-test.html` 是在真实浏览器里直接开某一章的调试页（把 ch16 换成任意章节即可），
用无头浏览器截图即可确认"零报错 + 对白/选项渲染正常"。
