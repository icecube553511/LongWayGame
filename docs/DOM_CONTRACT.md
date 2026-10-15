# DOM 契约（root 冻结）— `index.html` ↔ `src/engine/*.js`

`web-shell` 负责在 `index.html` 里**按此结构静态写出全部容器**；
`engine-core` / `engine-ui` 只通过 `getElementById` 取用，**不得动态创建这些顶层容器**。
所有 id 必须一字不差。

## 1. 全局骨架

```html
<body>
  <div id="app" class="app">
    <div id="layer-bg"    class="layer-bg"></div>      <!-- 背景层，img/div 由引擎换 -->
    <div id="layer-cg"    class="layer-cg"></div>      <!-- 全屏插画层 -->
    <div id="layer-fx"    class="layer-fx"></div>      <!-- 特效层 flash/shake/snow/... -->
    <div id="layer-char"  class="layer-char">          <!-- 立绘层，三个槽 -->
      <div class="char-slot" id="slot-left"></div>
      <div class="char-slot" id="slot-center"></div>
      <div class="char-slot" id="slot-right"></div>
    </div>
    <div id="layer-vig"   class="layer-vig"></div>
    <div id="hud"         class="hud">                 <!-- 右上角数值 -->
      <div class="stat" title="士气"><span class="stat-name">士气</span><i id="bar-morale" class="bar"><b></b></i></div>
      <div class="stat" title="信任"><span class="stat-name">信任</span><i id="bar-trust"  class="bar"><b></b></i></div>
      <div class="stat" title="信念"><span class="stat-name">信念</span><i id="bar-hope"   class="bar"><b></b></i></div>
      <div id="hud-chapter" class="hud-chapter"></div>
    </div>
    <div id="dialogue"    class="dialogue">            <!-- 对话层 -->
      <div id="dlg-name"  class="dlg-name"></div>
      <div id="dlg-text"  class="dlg-text"></div>
      <div id="dlg-next"  class="dlg-next"></div>
    </div>
    <div id="narration"   class="narration"></div>     <!-- 旁白（无名框） -->
    <div id="title-card"  class="title-card"></div>    <!-- 章节/小标题卡 -->
    <div id="choices"     class="choices"></div>       <!-- 选项容器 -->
    <div id="quickbar"    class="quickbar">            <!-- 快捷条 -->
      <button class="qb" id="qb-auto"   data-act="auto">自动</button>
      <button class="qb" id="qb-skip"   data-act="skip">跳过</button>
      <button class="qb" id="qb-log"    data-act="log">记录</button>
      <button class="qb" id="qb-save"   data-act="save">存档</button>
      <button class="qb" id="qb-config" data-act="config">设置</button>
      <button class="qb" id="qb-hide"   data-act="hide">隐藏</button>
    </div>
  </div>
  <div id="screens" class="screens"></div>             <!-- 全屏界面集合（静态子节点） -->
</body>
```

`#screens` 内**必须有**以下静态子节点（内部 DOM 自定）：

```html
<section id="scr-title"    class="screen screen-title"></section>     <!-- 标题画面 -->
<section id="scr-chapters" class="screen"></section>                 <!-- 章节选择 -->
<section id="scr-gallery"  class="screen"></section>                 <!-- 人物图鉴 -->
<section id="scr-archive"  class="screen"></section>                 <!-- 史料档案 -->
<section id="scr-log"      class="screen"></section>                 <!-- 回想 -->
<section id="scr-save"     class="screen"></section>                 <!-- 存/读档 -->
<section id="scr-config"   class="screen"></section>                 <!-- 设置 -->
<section id="scr-end"      class="screen"></section>                 <!-- 结局结算 -->
```

## 2. 约定

- `body` 上的状态类由引擎切换：`state-title` `state-game` `state-screen` `state-hideui` `state-cg`。
  某个 `<section class="screen">` 显示时同时追加 `is-open`。
- 立绘槽顺序对应 `left/center/right`；`slot-*` 内部由引擎插入 `<img class="char-img">`。
- 背景层由引擎插入 `<img class="bg-img">` 或 `<div class="bg-fallback">`。
- 特效层由引擎插入 `<div class="fx fx-flash">` 之类的元素，2 秒内自行移除。
- 对话框三种形态靠 `#dialogue` 上的类区分：默认（有姓名条）／`is-narr`（旁白，居中偏上）／`is-think`（`#dlg-text` 加括号与斜体）。
- `#dlg-text` 的完整文本必须留一份在 `data-full` 属性里（打字机效果用）。
- 资源路径由引擎拼：`assets/generated/bg/{id}.svg`、`assets/generated/chars/{who}_{face}.svg`、
  `assets/generated/cg/{id}.svg`、`assets/generated/ui/{name}.svg`。
- CSS 变量（`web-shell` 定义，引擎可用）：`--accent`（章节主题色）、`--ink`、`--paper`。

## 3. 脚本加载顺序（`index.html` 末尾，顺序不可变）

```html
<script src="art/palette.js"></script>
<script src="art/geosvg.js"></script>
<script src="src/data/characters.js"></script>
<script src="src/data/backgrounds.js"></script>
<script src="src/story/manifest.js"></script>
<script src="src/story/ch01.js"></script> <!-- … ch20.js 依次 … -->
<script src="src/engine/save.js"></script>
<script src="src/engine/audio.js"></script>
<script src="src/engine/gallery.js"></script>
<script src="src/engine/ui.js"></script>
<script src="src/engine/engine.js"></script>
<script src="src/bootstrap.js"></script>
```

`src/bootstrap.js`（engine-core 提供）在 `DOMContentLoaded` 后调用 `VN.start()`。
