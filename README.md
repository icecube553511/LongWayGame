# 长征 · 万水千山

立体几何（low-poly）风格的**视觉小说**客户端游戏。二十章，从一九三四年十月于都河畔出发，
走到一九三六年十月会宁会师。

**双击 `index.html` 即可运行。** 不需要构建、不需要安装依赖、不需要联网、不需要服务器。

---

## 一、怎么玩

| 操作 | 说明 |
|---|---|
| `空格` / `回车` / 鼠标左键 | 推进对话 |
| `按住 Ctrl` | 快进 |
| `Esc` | 菜单（存/读档、设置、回到标题） |
| `H` | 隐藏 / 显示界面 |
| `A` | 自动播放 |
| `S` | 跳过已读 |
| `Tab` | 查看状态 |
| `1`–`4` | 选择选项 |

右上角三个数值（**士气 / 信任 / 信念**）会随你的选择变化。它们**不改变史实**——
会议结论、牺牲、会师都是既定历史；变的是这支队伍走到最后时是什么样子，
以及终章结局评级的文字。

---

## 二、目录结构

```
index.html                  入口（静态容器 + script 顺序）
css/style.css               全部样式（--u 为 1920×1080 等比缩放单位）

art/                        美术：绘制库 + 素材定义（构建期使用，游戏运行时不加载绘制逻辑）
  geosvg.js                 立体几何 SVG 渲染库（冻结）
  palette.js                配色（冻结）
  portraits_root.js         35 人立绘设计表
  scenes.js                 30 个背景
  scenes_*.js               背景分册（按地区）

assets/generated/           烘焙产物（游戏实际读取的图片）
  bg/     30 张背景   1920×1080
  chars/  立绘 600×900 透明
          · {id}_{face}.png  AI 生成（首选）—— 174 张，覆盖剧本实际用到的全部 164 个
                             「人物 × 表情」组合 + 若干备用
          · {id}_{face}.svg  程序化刻面立绘（兜底，PNG 缺失时自动回退）
  cg/     30 张全屏插画 1920×1080
          · cg_*.png   AI 出图后烘焙（首选）—— 24 张 P0 重要事件 + 6 张 P1 情绪补充，
                       全剧 30 处剧本引用一一对应，没有列了却点不亮的条目
          · bg_*.svg   程序化「同场景加强版」插画（兜底，PNG 缺失时逐级回退）
  ui/     16 个 UI 装饰 SVG（assets/generated/ui/）—— **构建期产物，运行时不加载**：
          界面全部由 css/style.css 用 --u 单位直接画，全仓库没有一处 url() 引用它们

src/
  data/characters.js        35 人图鉴数据（姓名/身份/简介/首次登场）
  data/backgrounds.js       背景 id 表
  story/manifest.js         二十章清单
  story/ch01.js … ch20.js   剧本（DSL 数据，见 docs/SPEC.md §2）
  engine/engine.js          剧本解释器 + 渲染 + 输入
  engine/ui.js              标题 / 章节选择 / 回想 / 存读档 / 设置 / 结算
  engine/save.js            localStorage 存档（前缀 lw_，6 槽 + 自动存档）
  engine/audio.js           WebAudio 程序化配乐与音效（无音频文件）
  engine/gallery.js         人物图鉴 / 史料档案 / 插画画廊

tools/                      开发工具（Node，仅开发期使用）
docs/                       技术契约、剧本圣经、美术总纲
```

---

## 三、开发工具

全部是 Node 脚本，零依赖。在仓库根目录执行：

| 命令 | 作用 |
|---|---|
| `node tools/build-art.js` | 把 `art/*.js` 里的绘制定义烘焙成 `assets/generated/**` 的 SVG |
| `node tools/neko-art.js --needed` | 用 **NekoGptImage（`gpt-image-2.5-sunburst`）** 生成立绘原始图 → `tmp/neko-raw/`。只生成剧本实际引用到的组合，按出场频次排序，已存在的自动跳过 |
| `python tools/neko-post.py` | 把原始图抠掉洋红底、缩放到 600×900 透明 PNG → `assets/generated/chars/` |
| `node tools/cg-art.js --list` | 列出**重要事件插画（CG）**的 id / 优先级 / 提示词是否已填（清单在 `src/data/cg.js`） |
| `node tools/cg-art.js --all-p0 --concurrency 2` | 生成全剧 P0 插画的原始图 → `tmp/cg-raw/`（自动接上烘焙）。`--ch ch15` 整章、`--only cg_luding_bridge` 单张、`--dry-run` 只看提示词、`--provider gugu` 换额度池 |
| `python tools/cg-post.py --all` | 把 `tmp/cg-raw/` 的原始图裁成 16:9、缩到 1920×1080、按立体几何调色并压上电影画框 → `assets/generated/cg/<id>.png` |
| `python tools/cg-sheet.py tmp/cg/sheet.png` | 把已生成的插画拼成对比版（看风格是否统一、哪些还没出图） |
| `node tools/neko-crowd.js` | 生成**背景用的群众素材**（8 种姿态 × 若干变体）→ `tmp/neko-crowd/` |
| `python tools/neko-crowd-post.py` | 群众素材抠底 / 缩放 / 三档明度 → 烘焙成 `art/ui_00_crowd_stamps.js` |
| `node tools/check.js` | **总验收**：20 章完整性 + 剧本 DSL 合法性 + 资源是否齐备 + 死链 |
| `node tools/check.js --chapter ch07` | 只检查一章 |
| `node tools/validate-svg.js` | 校验生成物结构（防"属性里嵌套双引号导致整张图空白"这类静默故障） |
| `node tools/lint-story.js src/story/ch07.js` | 剧本静态检查（更细的单章规则） |
| `node tools/e2e-shot.js ch16` | 真浏览器端到端冒烟：跳到第 16 章并截图，同时报告 JS 报错条数 |
| `node tools/e2e-run.js` | **全剧自动通关验证**：20 章逐章从头走到章节结算，报告每章步数 / 是否走完 / 选项数 / 实际渲染的 CG / JS 报错。`node tools/e2e-run.js 1 6 ch09,ch15` 可只跑指定章 |
| `node tools/qa-consistency.js` | **舞台一致性验证**：全剧逐句核对「说话人在不在台上」「有没有同屏重复立绘」「有没有缺图 / 姓名条错配」；`node tools/qa-consistency.js 2` 换第二条选项支路 |
| `node tools/e2e-steps.js <名字> "<脚本>"` | **能走进剧情深处**的探针：`ch07\|n200` 推进 200 步、`untilChoice` 走到选项、`autoPick:1` 自动点选项、`gallery:showChars` 开图鉴、`note:<表达式>` 读取页面内部状态；截图带状态横幅，并回读一份机器可读诊断 |
| `node tools/qa-contact.js tmp/qa/x.png 300 4 chars/mao_calm bg/bg_zunyi` | 用**烘焙后的真实 SVG**拼对比图（不走绘制库直渲，所以所见即玩家所见） |
| `node tools/shot-one.js assets/generated/bg/bg_luding.svg` | 单张素材放大截图 |
| `node tools/shot-one.js --sheet assets/generated/chars "*_calm"` | 拼版对比（检查人物辨识度 / 表情差异） |

截图依赖系统里的 Edge（无头模式）：`tools/shot2.js` / `tools/qa-shot.js` 会自动查找
`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`。

两个踩过的坑，供后来者参考：

1. **`tools/qa-shot.js` 的 `shot()` 把页面写死在 `tmp/qa.html`**，两条命令并行跑会互相覆盖、截出串台的图。新写的 `tools/shot2.js` 每次用唯一临时文件，并行安全；`qa-contact.js` 用的就是它。
2. **无头 Edge 的 `--virtual-time-budget` 不会推进 CSS transition**，靠 `opacity` 淡入的背景/立绘会永远停在 `opacity:0`，截出来全是黑屏——这是**探针伪影，不是游戏 bug**。`e2e-steps.js` / `e2e-run.js` 因此统一注入了 `transition-duration:0s`，让截图反映"动画结束后的稳定态"。
3. 探针推进时必须**尊重引擎的有时长停顿**：`VN.advance()` 会先 `unblock()`，所以无脑狂点会把 `cg` 的 4400ms 停顿取消掉，看起来"没有插画"。`e2e-run.js` 里的 `shouldAdvance()` 只在等待玩家输入（`blockKind==='text'`）时才推进。
`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`。

---

## 四、内容规格

- **二十章**，每章正文 ≥3000 汉字、≥90 个分镜步、≥2 个选择、≥3 条史料档案。
- **35 个角色**：23 位历史人物 + 8 位贯穿全剧的虚构人物（小满、李铁柱、何晓梅、
  郭大娘、石柱、阿月、吴老六、三娃）+ 4 组群众。
- **30 个背景**、**280 张立绘**（每人 8 种表情）。
- **二十章每章都至少有一处全屏插画**（`cg` 步骤，id 是 `src/data/cg.js` 里的 `cg_*`，
  见 SPEC §2.1 与 `docs/CG_DESIGN.md`）。全剧 30 处：24 处 P0（每章至少一处，
  ch03/ch15/ch17/ch20 各两处）+ 6 处 P1。插画是独立构图的 1920×1080 位图，
  出图后由 `tools/cg-post.py` 统一压上电影黑边、加强暗角、暖调与细金内框
  （与矢量插画的 `gradeCG()` 同一套参数），所以"插画"在屏幕上与普通背景一眼可分。
  「插画画廊」里列了 30 张可解锁的，与剧本里的 30 处 `cg` 步一一对应。
- **12 首程序化 BGM + 14 个音效**，全部由 WebAudio 合成，没有音频文件。
- 史料档案 4 条/章量级，内容为史实短文，可随时在「史料档案」界面回看。

贯穿全剧的意象：**号**（小满的军号）、**铜顶针**（郭大娘的）、**铜锅**（李铁柱的）、
**草鞋**、**门板**、**地图**、**火**。

---

## 五、为什么是"立体几何"风格

所有画面——背景、人物、道具——都由**平面多边形块面**拼成，用面法线做硬边光照
（统一光源在左上），不允许大面积平涂，也不允许网格线框。这套规则写在
`docs/ART_DIRECTION.md`，并由 `art/geosvg.js` 提供原语。

好处是：背景、道具、UI 全部由 `art/*.js` 里的绘制定义**程序化生成**成 SVG，
可无限放大、可精确复现（同种子 → 同字节输出），也不需要任何字体文件或外部素材。

**两处例外，都不是"程序化"来的**，别按上面那句去推断：

* `assets/generated/chars/` 里的 **174 张 600×900 立绘 PNG** 是 AI 出图后抠底烘焙的
  （SPEC §4.2，2026-10-15 起），是首选图源；同名的 `{id}_{face}.svg`（程序化刻面立绘）
  只在 PNG 缺失时兜底。所以"只有 SVG 和 JS"这句话对立绘**不成立**。
* `assets/generated/bg/` 与 `assets/generated/cg/*.svg` 各有 **18 张**内嵌了 base64 的
  **群众素材位图**（行军小人贴图，由 `art/ui_00_crowd_stamps.js` 烘焙而来）。
  这也是这 36 个文件体积偏大的原因，体积上限的口径见 `docs/ART_DIRECTION.md` §4.4。
* **重要事件插画** `assets/generated/cg/cg_*.png` 是 AI 出图后烘焙的 1920×1080 位图
  （`tools/cg-art.js` + `tools/cg-post.py`，2026-10-15 起）。它的电影黑边、暗角与细金
  内框**和矢量插画的 `gradeCG()` 是同一套参数**，两种插画在屏幕上看不出接缝；
  清单与风格红线见 `docs/CG_DESIGN.md`。

---

## 六、文档

| 文件 | 内容 |
|---|---|
| `docs/SPEC.md` | 技术契约：目录、剧本 DSL、id 表、验收规则（**唯一契约来源**） |
| `docs/STORY_BIBLE.md` | 二十章史实主线 + 人物设定表 + 文风红线 |
| `docs/ART_DIRECTION.md` | 立体几何美术总纲 + 35 人设计表 + 30 景特征表 |
| `docs/ENGINE_CONTRACT.md` | 引擎 DOM 与 API 契约 |

---

## 七、史实说明

本作依据公开史料编写。会议内容、部队番号、日期、地名、战役结果均与史实一致；
虚构人物（小满等）用于承载情感线索，其经历不改变任何历史结论。
对历史人物只写其局限，不作丑化。
