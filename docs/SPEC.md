# 《长征·万水千山》技术契约 (SPEC v1)

> 本文件是所有并行 agent 的唯一契约来源。任何 agent 不得修改本文件；
> 如需变更契约，向 `/root` 提出。
>
> **动手之前还要读 `docs/PRODUCTION_SPEC.md`（制作规范总纲）**：那里管"资产怎么做、怎么审、怎么收口"
> —— 出图管线、提示词纪律、体积档与自检命令、评审方法、git 纪律、事故教训清单、契约同步清单。
> 本文件管技术契约（目录 / DSL / id 表 / 验收），两者冲突时以本文件为准。

## 0. 硬性约束

1. **零构建、零依赖、零网络**。双击 `index.html` 即可运行（`file://` 协议）。
   - 禁止 ES Module（`type="module"` 在 file:// 下被 CORS 拦截）。全部使用**经典 script 标签** + 全局命名空间。
   - 禁止 `fetch()` 读取本地数据。所有数据以 `.js` 文件挂载到全局对象。
   - 禁止 CDN / 外部字体 / 外部图片。
2. **语言**：游戏内文本、注释、文档全部使用简体中文（代码标识符用英文）。
3. **图片资源**：全部为 `assets/generated/` 下的 SVG 文件，由 `tools/build-art.js` 生成。运行时不动态绘制。
4. **命名空间**：
   - `window.GEO` — 几何渲染库（`art/geosvg.js`）
   - `window.ART` — 素材定义（`art/**`）
   - `window.VN` — 引擎（`src/engine/**`）
   - `window.STORY` — 剧本（`src/story/**`）

## 1. 目录结构 / 文件所有权

```
index.html                  [engine]
README.md                   [qa]
css/style.css               [engine]
docs/SPEC.md                [root, 冻结]
docs/STORY_BIBLE.md         [root]
art/geosvg.js               [root, 冻结]
art/palette.js              [root]
art/portraits.js            [art-chars]
art/scenes.js               [art-scenes]
src/engine/engine.js        [engine]
src/engine/ui.js            [engine]
src/engine/save.js          [engine]
src/engine/gallery.js       [extras]
src/engine/audio.js         [audio]
src/story/manifest.js       [root]
src/story/ch01.js .. ch20.js [story-a / story-b / story-c]
tools/build-art.js          [root]
tools/check.js              [qa]
tools/serve.js              [audio]
assets/generated/**         [生成物, 由 build-art.js 写入]
```

**只改自己名下的文件。** 需要别人文件的改动 → 发消息给对应 agent 或 `/root`。

## 2. 剧本 DSL（`src/story/chNN.js`）

每个剧本文件是一个 IIFE，向 `window.STORY` 注册一章：

```js
(function () {
  window.STORY = window.STORY || {};
  window.STORY.ch01 = {
    id: 'ch01',
    num: 1,
    title: '于都河畔',
    date: '1934年10月',
    place: '江西·于都',
    bgm: 'departure',            // 见 5. 音频
    summary: '一句话梗概',
    // 开场标题卡
    titleCard: { text: '第一章', sub: '于都河畔', date: '1934年10月', place: '江西·于都' },
    steps: [ /* Step 数组 */ ],
    archive: [ /* 史料档案, 见 2.3 */ ]
  };
})();
```

### 2.1 Step 类型（`steps` 数组的元素）

| `t` | 字段 | 说明 |
|---|---|---|
| `bg` | `id`, `fx?`(`fade`/`cut`/`dissolve`/`black`), `ms?` | 切换背景（`id` 见 4.1） |
| `show` | `who`, `face?`, `slot?`(`left`/`center`/`right`), `fx?`(`slidein`/`fadein`/`pop`), `portraitId?`, `displayName?` | 立绘登场（`who` 见 3.1）；`portraitId` 可临时指向一个形象演进状态，`displayName` 只改姓名条 |
| `hide` | `who`, `fx?` | 立绘退场 |
| `clear` | – | 清空所有立绘 |
| `say` | `who`, `face?`, `text`, `note?`, `noPortrait?`, `portraitId?`, `displayName?` | 有说话人的对白；`note` 为史料小注（可省略）；`noPortrait:true` = 这一句不要立绘（画面里只留背景，例：`ch03` 的「三发子弹」） |
| `narr` | `text`, `note?` | 旁白（无名框、居中偏上排版） |
| `think` | `who`, `text`, `noPortrait?`, `portraitId?`, `displayName?` | 内心独白（括号括起、斜体感）；`noPortrait` 同上 |
| `title` | `text`, `sub?` | 章节内小标题卡（如「一九三五年一月·遵义」） |
| `fx` | `kind`(`flash`/`shake`/`fadeout`/`fadein`/`snow`/`rain`/`ash`/`blood`/`star`), `ms?` | 全屏特效 |
| `cg` | `id`, `text?`, `ms?`, `motion?` | 全屏插画（重要事件 CG）。`id` 取 `src/data/cg.js` 的 `cg_*`；老写法（写背景 id）仍可用。`text` 省略时用表里的 `caption`；`ms` 默认 4400；`motion` ∈ `zoom-in`/`pan-left`/`pan-right`/`still`/`impact`（`impact` = 进场挨一下的抖动，给炮击/爆炸用） |
| `choice` | `prompt?`, `options[]`, `once?` | 选项分支 |
| `set` | `var`, `op`(`=`/`+=`/`-=`/`max`/`min`), `value` | 修改状态 |
| `if` | `cond`, `then[]`, `else?[]` | 条件分支（`steps` 可嵌套） |
| `label` | `name` | 跳转锚点 |
| `goto` | `target` | 跳到本剧本内 `label` |
| `sfx` | `id` | 音效（见 5.） |
| `bgm` | `id` / `stop:true` | 音乐 |
| `wait` | `ms` | 停顿 |
| `unlock` | `kind`(`char`/`archive`/`cg`), `id` | 解锁图鉴/档案（一般自动，可显式调用） |
| `end` | `next?` | 章节结束（无 `next` = 全剧终）。引擎自动写存档 |

### 2.2 选项

```js
{ t: 'choice', prompt: '你要如何回答？', options: [
  { text: '「跟着走，走到天亮。」', tag: '坚定',
    set: [ { var: 'morale', op: '+=', value: 5 },
           { var: 'flag.brave_answer', op: '=', value: true } ],
    goto: 'after_answer',      // 可选
    record: 'answer_firm'      // 可选，记录已选项（用于后续 if 判断）
  },
  { text: '沉默着别过头去。',
    set: [ { var: 'morale', op: '-=', value: 3 } ],
    record: 'answer_silent' }
]}
```

### 2.3 条件

```js
cond: { var: 'morale', op: '>=', value: 60 }
cond: { all: [ {var:'morale',op:'>=',value:60}, {var:'flag.x',op:'=',value:true} ] }
cond: { any: [ ... ] }
cond: { not: { var:'flag.x', op:'=', value:true } }
```

`op` ∈ `=`,`!=`,`>`,`>=`,`<`,`<=`。变量支持点路径 `flag.xxx`，读取路径上的记录（选过的选项 id）。

### 2.4 内置状态变量

| 变量 | 初始 | 含义 |
|---|---|---|
| `morale` | 60 | 士气 |
| `trust` | 50 | 官兵信任 / 内部团结 |
| `hope` | 55 | 信念 |

全部 clamp 到 `0..100`。`flag.*` 为任意剧本自定义标记。

### 2.5 档案（`archive`）

```js
archive: [
  { id: 'a_yudu', title: '于都河上的浮桥', text: '1934年10月…（120-300字史实短文）', tag: '史实' }
]
```

### 2.6 角色形象演进

角色的**逻辑 id** 不变（仍只用 §3.1 的 35 个），但外观可以随章节与剧情节点变化。
唯一来源是 `docs/reviews/char-progression-spec.json`，由评审组先写清单，
再编译成运行时的 `src/data/portraitStates.js`：

```text
docs/reviews/char-progression-spec.json     需求清单（状态、章映射、章内变化、表情）
        ↓ node tools/build-portrait-states.js
src/data/portraitStates.js                  引擎与生成器共用的运行时表
        ↓ node tools/neko-states.js
assets/generated/chars/{portraitId}_{face}.png
```

- `chapterStates[章][人物]` 是该角色本章的默认造型；引擎在 `show/say/think` 时自动解析。
- 章内一次性的外观变化（例如捡到绑腿、背起铜锅、戴上银饰）写在 `beats`：
  以剧本 `text` 的**连续原文片段**触发，必须在当前句念完后才切图，
  并跨 `hide/clear` 保留到本章结束；存档快照包含这些变化。
- 剧本显式写 `portraitId` 时优先级最高，用于一次性覆盖。
- 每个状态的 `faces` 必须覆盖该状态所辖章节实际用到的全部表情，并包含 `calm`。
- 状态位图缺失时，引擎回到人物基础 `{id}_{face}.png`，再回退 `.svg`，不允许报错或留白。
- 新增/修改状态只改评审清单与重新生成的运行时表，不改人物 id、不改表情枚举。

## 3. 人物

### 3.1 人物 ID 表（**固定，不得新增/改名**）

历史人物：
`mao`(毛泽东) `zhou`(周恩来) `zhu`(朱德) `zhang_wentian`(张闻天) `wang_jiaxiang`(王稼祥)
`bogu`(博古) `lide`(李德) `peng`(彭德怀) `lin`(林彪) `nie`(聂荣臻) `liu_bocheng`(刘伯承)
`chen_yun`(陈云) `he_zizhen`(贺子珍) `deng_yingchao`(邓颖超) `xu_teli`(徐特立)
`dong_biwu`(董必武) `lin_boqu`(林伯渠) `xie_juezai`(谢觉哉) `ye_jianying`(叶剑英)
`zhang_guotao`(张国焘) `xu_xiangqian`(徐向前) `li_xiannian`(李先念) `xiao_yedan`(小叶丹)

虚构人物（贯穿全剧的情感线索）：
`xiaoman`(小满·15岁号手) `li_tiezhu`(李铁柱·炊事班长) `he_xiaomei`(何晓梅·女卫生员)
`guo_daniang`(郭大娘·于都船工) `shi_zhu`(石柱·江西籍战士) `a_yue`(阿月·苗族向导)
`wu_laoliu`(吴老六·老兵) `san_wa`(三娃·红小鬼)

群众：`soldiers`(红军战士们) `villagers`(乡亲们) `yi_people`(彝族同胞) `narrator`(旁白)

合计 35 个 id。

### 3.2 表情（`face`）枚举

`calm`(平静) `stern`(肃然) `smile`(含笑) `sad`(悲恸) `worry`(忧虑) `fierce`(激愤) `weak`(虚弱) `dawn`(释然/振奋)

默认 `calm`。剧本中 `say` 的 `face` 如果与上一次相同可省略。

### 3.3 说话人显示名

引擎通过 `window.VN.CHARACTERS[id].name` 取显示名（`src/engine/engine.js` 内定义，与 3.1 一一对应）。

## 4. 美术资源

### 4.1 背景 ID 表（**固定**）

| id | 名称 | 场景要点 |
|---|---|---|
| `bg_yudu_night` | 于都河夜渡 | 夜色河面、浮桥、火把、远山剪影 |
| `bg_yudu_village` | 于都村庄清晨 | 白墙黑瓦、樟树、晨雾 |
| `bg_mountain_pass` | 赣南山路 | 丘陵、石阶、竹林 |
| `bg_blockade` | 封锁线碉堡 | 碉堡、铁丝网、山脊 |
| `bg_xiangjiang_day` | 湘江·白昼 | 江面、浮桥、对岸 |
| `bg_xiangjiang_night` | 湘江·血战夜 | 火光、浓烟、江面倒影 |
| `bg_council_hall` | 会议厅·通用 | 木桌、马灯、长凳、挂图 |
| `bg_tongdao` | 通道·恭城书院 | 书院、窗棂、冬雨 |
| `bg_liping` | 黎平会议 | 木楼、火塘 |
| `bg_houchang` | 猴场·跨年夜 | 庭院、爆竹红屑、雪 |
| `bg_zunyi` | 遵义会议楼 | 回廊、红漆木楼、炭盆 |
| `bg_chishui` | 赤水河 | 峡谷、红褐色河水 |
| `bg_tucheng` | 土城 | 土墙、街道、硝烟 |
| `bg_loushanguan` | 娄山关 | 关隘、石峰、云海、夕阳 |
| `bg_jinsha` | 金沙江·皎平渡 | 峡谷、渡口、木船 |
| `bg_yihai` | 彝海 | 高山湖泊、松林、火把 |
| `bg_dadu` | 大渡河·安顺场 | 激流、渡船、崖壁 |
| `bg_luding` | 泸定桥 | 铁索、木板缺口、急流、对岸桥楼 |
| `bg_snow_mountain` | 夹金山 | 雪脊、冰川、垭口 |
| `bg_maogong` | 懋功会师 | 山城、会师旗队 |
| `bg_grassland` | 松潘草地 | 沼泽、水洼、枯草、阴沉天空 |
| `bg_lazikou` | 腊子口 | 一线天、绝壁、木桥 |
| `bg_hadapu` | 哈达铺 | 小镇、店铺、报纸 |
| `bg_wuqi` | 吴起镇 | 黄土塬、窑洞、红旗 |
| `bg_huining` | 会宁会师 | 城楼、三军旗、人海 |
| `bg_yanan_cave` | 延安窑洞 | 窑洞、油灯、地图 |
| `bg_rain_march` | 雨中行军 | 泥路、蓑衣、雨幕 |
| `bg_camp_fire` | 篝火夜营 | 草地、火堆、围坐 |
| `bg_map_table` | 指挥部·地图桌 | 作战地图、蜡烛、铅笔、电话机 |
| `bg_stretcher` | 担架队 | 竹林小径、担架、伤员 |
| `bg_houchang_street` | 猴场镇口 | 矮石台戏台、粗布幕、油灯、宣传队演戏、薄雪中的乡亲 |
| `bg_wujiang` | 江界河强渡乌江 | 深切峡谷、青黑急流、三只竹排、炮弹水柱、对岸碉堡 |
| `bg_zunyi_street` | 遵义街头 | 石板街、两层木铺面、药铺、布店、米行、剃头摊 |
| `bg_mianning_yamen` | 冕宁县政府·土牢 | 瓦房石院、被撞开的木门、三间土牢、铁链脚镣 |
| `bg_lazikou_cliff_night` | 夜攀腊子口绝壁 | 破碎石壁、绑腿接成的长绳、贴壁攀爬的战士 |
| `bg_gannan_loess` | 甘南黄土坡 | 赭黄黄土坡、干沟、枯草、梯田、蜿蜒行军队列 |
| `bg_hadapu_school` | 哈达铺读报会议 | 白灰土墙、长黑板、八仙桌、旧报纸、围桌干部 |
| `bg_bangluo_school` | 榜罗镇小学会议 | 白灰土墙、擦净的长黑板、长木桌与长凳 |
| `bg_huining_confucian_temple` | 会宁文庙大成殿 | 深瓦顶红木柱大殿、老柏树、石板院、木桌电报 |
| `bg_jiangtaibao` | 将台堡会师 | 赭黄夯土堡墙、矮堡门、角楼、会合战士、分发毛袜的妇女 |
| `bg_air_raid_paddy` | 敌机·开阔稻田 | 收割后的开阔稻田、积水与低泥埂、无树无沟、低空双翼机、泥水柱、趴伏战士 |
| `bg_liupan_mountain` | 六盘山 | 南侧层叠蓝灰群山、北侧空旷黄土塬、山脊枯草与窄路、南飞雁、行军小队 |
共 42 个背景，全部必须存在。

### 4.2 立绘

每个角色 id → 一组表情立绘，路径 `assets/generated/chars/{id}_{face}.svg`。
**必须生成全部 8 种表情**（共 35 × 8 = 280 个文件），群众角色同样生成 8 张。

> **2026-10-15 变更：立绘改由 AI 生成。**
> 现在立绘有两条来源，引擎按 `[.png, .svg]` 顺序尝试，前者缺失或加载失败时静默回退：
>
> | 来源 | 路径 | 尺寸 | 生成方式 |
> |---|---|---|---|
> | **首选** | `assets/generated/chars/{id}_{face}.png` | 600×900 透明（RGBA 或带 tRNS 的调色板 PNG） | `tools/neko-art.js` 调 NekoGptImage（`gpt-image-2.5-sunburst`）生成，`tools/neko-post.py` 抠底+缩放 |
> | 兜底 | `assets/generated/chars/{id}_{face}.svg` | 600×900 透明 | `art/portraits_root.js` 程序化刻面立绘 |
>
> 只需生成**剧本实际引用到的 (人物, 表情) 组合**（当前 164 组，见 `tmp/devkit/face-need.json`）；
> 未生成的组合由 SVG 兜底。每个人物的 `calm` 必须存在（图鉴使用）。
> 提示词与风格约束见 `tools/neko-art.js` 的 `promptFor()`；配色、光照方向必须与 §4.1 的背景一致。

**立绘为「半身特写」**（不是全身）：

| 项 | 值 |
|---|---|
| 画布 | `600 × 900`，透明背景，不画底色矩形 |
| 发顶/帽顶 | y ≈ 34 |
| 下巴 | y ≈ 452 |
| 肩线 | y ≈ 500（肩半宽 ≈ 200） |
| 画面下沿 | y = 900（裁在胸口/腰以上，**不画腿**） |
| 头宽 / 头高 | ≈ 300px / ≈ 420px（脸占画布高度 ≥ 45%） |

约束：
- 脖子短（下巴到肩 ≤ 60px）。
- 肩线有斜度，由「左肩斜面 / 胸正面 / 右肩斜面」三块刻面构成。
- **不允许出现悬空手臂**；半身立绘只使用自然垂手或按腰的姿态，不举手、不交叉。
- 35 个角色必须在脸部层面一眼可区分（脸型、年龄、胡须、眼镜、发型帽型、肤色、性别）。
- 8 种表情必须一眼可区分，且同时改变眉、眼、嘴三处。

**剧情造型（2026-10-20 起）**：除基础 `{id}_{face}` 外，还可以有
`assets/generated/chars/{portraitId}_{face}.png`（例如
`xiaoman_ch16_snow_calm.png`）。`portraitId` 必须来自
`docs/reviews/char-progression-spec.json`，且以对应人物 id 加下划线开头。
造型只改变年龄感、磨损、脏污、伤情、服装/装备、道具、姿态与头部角度，
**不得换脸、换帽型、改人物 id**。体积与尺寸仍按本节 600×900 / 512 KB 执行。

### 4.3 生成物路径规则（**引擎按此拼路径，不可改**）

```
assets/generated/bg/{bgId}.svg                 背景 1920×1080
assets/generated/chars/{charId}_{face}.svg     立绘 600×900
assets/generated/ui/{name}.svg                 UI 装饰
assets/generated/cg/{cgId}.png                 全屏插画 1920×1080（**重要事件 CG，首选**，AI 出图后烘焙）
assets/generated/cg/{bgId}.svg                 全屏插画 1920×1080（= 对应背景的加强版，兜底）
```

**插画的两条来源（2026-10-15 变更）**：`{t:'cg'}` 的 `id` 现在优先指向
`src/data/cg.js` 里 `cg_*` 的条目，成品是 `assets/generated/cg/{cgId}.png`
（`tools/cg-art.js` 出图 + `tools/cg-post.py` 烘焙）。引擎按
`cg/{cgId}.png` → `cg/{cgId}.svg` → `cg/{该条目 anchor}.svg` 的顺序逐级回退，
所以某张插画缺失时玩家看到的仍是「同场景加强版插画」，不会留白。
规格、风格红线、命令与分工见 `docs/CG_DESIGN.md`。

### 4.4 缺失兜底

引擎必须对任何缺失图片静默降级：背景 → 渐变占位；立绘 → 不显示。**JS 报错 = 不合格。**

### 4.5 重要事件插画（CG）表

`src/data/cg.js` 的 `window.ART.cgList` 是「哪张插画配哪一章、屏幕上演什么」的唯一来源，
字段：`id` / `ch` / `title` / `anchor` / `caption` / `prompt_en` / `prompt_cn` / `must` / `avoid` / `motion` / `priority`。
`node tools/check.js` 会校验：id 唯一且小写 `cg_` 前缀、`ch` 合法、`caption`/`prompt_en` 非空、
`motion` 合法，以及 **`priority:'P0'` 的条目位图已生成且被剧本引用**。

## 5. 音频（`src/engine/audio.js`）

全部由 WebAudio 程序化合成，无音频文件。导出 `window.VN.audio`：

```js
VN.audio.init()            // 需用户首次交互后调用
VN.audio.bgm(id, {ms})     // 切换环境音乐，id 见下
VN.audio.stopBgm({ms})
VN.audio.sfx(id)           // 播放音效
VN.audio.setVolume({master, bgm, sfx})
```

BGM id：`departure` `march` `tense` `battle` `grief` `hope` `victory` `night` `river` `snow` `grassland` `council`
SFX id：`gunfire` `distant_gun` `shell` `horse` `water` `bell` `paper` `footsteps` `wind` `thunder` `horn` `cheer` `click` `page`

## 6. 引擎

`window.VN` 公开 API（由 `src/engine/*` 实现）：

```js
VN.start(chapterId)       // 开局（无参 → 标题画面）
VN.jump(chapterId)        // 跳章
VN.state                  // { morale, trust, hope, flags, unlocked, chapter }
VN.save(slot) / VN.load(slot) / VN.slots()
VN.settings               // { textSpeed, autoSpeed, bgm, sfx, fullscreen }
```

### 6.1 必须实现的界面

1. **标题画面**：标题、副标题、`开始新征途` / `继续征途` / `章节选择` / `人物图鉴` / `史料档案` / `设置`
2. **游戏画面**：背景层、立绘层（最多 3 个槽位）、对话框（姓名条 + 正文 + 打字机）、快捷条（自动/跳过/记录/存档/设置/隐藏 UI）、右上角状态（士气/信任/信念 三个数值条）
3. **选项**：居中卡片式，键盘 1-4 可选
4. **回想（记录）**：可滚动的历史对白，含说话人
5. **人物图鉴**：35 个角色卡，未解锁为剪影；卡片显示姓名、身份、简介、首次登场章节
6. **史料档案**：按章节分组的史实短文列表
7. **章节选择**：20 章网格，未解锁上锁；显示进度
8. **设置**：文字速度、自动速度、音量、全屏、重置进度

### 6.2 键鼠

`Space`/`Enter`/`左键` 推进对话；`Ctrl` 按住快进；`Esc` 菜单；`H` 隐藏 UI；`A` 自动；`S` 跳过；`Tab` 状态。

### 6.3 存档

`localStorage` 键名前缀 `lw_`。至少 6 个存档槽 + 1 个自动存档。

## 7. 章节清单

| 文件 | num | 标题 | 时间 | 地点 |
|---|---|---|---|---|
| ch01 | 1 | 于都河畔 | 1934.10 | 江西·于都 |
| ch02 | 2 | 突破封锁线 | 1934.10-11 | 赣南·湘南 |
| ch03 | 3 | 湘江血战 | 1934.11-12 | 广西·湘江 |
| ch04 | 4 | 通道转兵 | 1934.12 | 湖南·通道 |
| ch05 | 5 | 黎平会议 | 1934.12 | 贵州·黎平 |
| ch06 | 6 | 猴场跨年 | 1934.12-1935.1 | 贵州·猴场 |
| ch07 | 7 | 遵义会议 | 1935.1 | 贵州·遵义 |
| ch08 | 8 | 一渡赤水 | 1935.1 | 贵州·土城 |
| ch09 | 9 | 扎西整编·二渡赤水 | 1935.2 | 云南·扎西 |
| ch10 | 10 | 娄山关大捷 | 1935.2 | 贵州·娄山关 |
| ch11 | 11 | 三渡·四渡赤水 | 1935.3 | 川黔边·赤水河 |
| ch12 | 12 | 巧渡金沙江 | 1935.5 | 云南·皎平渡 |
| ch13 | 13 | 彝海结盟 | 1935.5 | 四川·冕宁 |
| ch14 | 14 | 强渡大渡河 | 1935.5 | 四川·安顺场 |
| ch15 | 15 | 飞夺泸定桥 | 1935.5 | 四川·泸定 |
| ch16 | 16 | 翻越夹金山 | 1935.6 | 四川·宝兴 |
| ch17 | 17 | 懋功会师与草地 | 1935.6-8 | 川西北 |
| ch18 | 18 | 激战腊子口 | 1935.9 | 甘肃·腊子口 |
| ch19 | 19 | 吴起镇·落脚陕北 | 1935.10 | 陕西·吴起镇 |
| ch20 | 20 | 会宁大会师 | 1936.10 | 甘肃·会宁 |

**每章字数要求**：正文对白 ≥ 3000 个汉字（含旁白），`steps` 数量 ≥ 90，至少 2 个 `choice`，至少 3 条 `archive`。

## 8. 文风要求

- 冷峻克制、白描为主，不喊口号；用具体细节承载情感（一双草鞋、半袋炒面、冻硬的绑腿）。
- 史实准确：人名、番号、日期、地名务必符合史实（番号如「红一军团」「红三军团」「中央红军」「红一方面军」；1935年6月后为「红一方面军」）。
- 每个虚构人物要有完整弧光：出场 → 关系 → 牺牲/成长 → 回响。
- 禁用现代腔、网络语、感叹号滥用；对话要短、要有停顿。
- 允许诗性，但必须服从史实。

## 9. 验收

`node tools/check.js` 必须全绿：
- 20 章全部存在，字段完整，step 类型合法
- 所有 `bg`/`cg` id 在 4.1 表内
- 所有 `who` 在 3.1 表内，`face` 在 3.2 表内
- 所有引用的资源文件已生成
- `label`/`goto` 全部可解析，无死链
- 所有 `set` 的 `var` 合法
