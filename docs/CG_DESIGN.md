# 重要事件 CG 工程说明

> 由 `/root` 维护，**冻结**。任何 agent 不得修改本文件；要改契约 → 找 `/root`。
> 本轮参与者开工前必读：本文件 → `docs/SPEC.md` §2.1/§4.3 → `docs/ART_DIRECTION.md` §0
> → `docs/STORY_BIBLE.md` → `tools/cg-art.js` 与 `tools/cg-post.py` 的注释。

## 1. 这一轮在做什么

原本二十章各有 1–2 处 `{t:'cg'}`，但那张「插画」只是**同场景背景的加强版**
（`tools/build-art.js` 的 `gradeCG()` 给背景加黑边、暗角、金线），构图与背景完全一样，
玩家其实看不出「这里进了一张插画」。

本轮把它换掉：**重要事件处进一张专门的 CG**——独立构图、独立画面、带运镜与图注，
风格与现有的立体几何美术对齐。

```
玩家推进到重要事件
   └─ 画面切到全屏插画（1920×1080 位图）
        ├─ 运镜：慢速推近 / 横移（全程 2.6s–6s，随停留时长而定）
        ├─ 图注：逐字打出的一句史实/情绪落点
        ├─ 画框：电影黑边 + 深暗角 + 暖调 + 细金内框 + 四角框标（烘焙在图里）
        └─ 停留 4.4s（或剧本指定的 ms）后自动继续；插画留在舞台上，
           直到下一个 `bg` 步骤——所以紧随其后的 `narr` / `say` 仍在插画上读
```

## 2. 三层实现（谁拥有什么）

| 层 | 文件 | 所有权 | 说明 |
|---|---|---|---|
| 清单 | `src/data/cg.js` | root 冻结 schema / 审查组填内容 | id、章节、标题、图注、英文场景描述、必现元素、运镜、优先级 |
| 生成 | `tools/cg-art.js` | root | 拼提示词 → 调 NekoGptImage / Gugu-gpt-QQ → 原始图落 `tmp/cg-raw/` |
| 烘焙 | `tools/cg-post.py` | root | 裁 16:9 → 1920×1080 → 调色 → 压画框 → `assets/generated/cg/<id>.png` |
| 呈现 | `src/engine/engine.js` `css/style.css` | root | `#cg-layer` + 运镜 + 逐字图注 + 三级路径回退 |
| 画廊 | `src/engine/gallery.js` | root | 「插画画廊 · 全屏插画（重要事件）」按 `ART.cgList` 列出 |
| 剧本 | `src/story/chNN.js` | 生成组按章分区 | 把 `{t:'cg', id:'bg_xxx'}` 换成 `{t:'cg', id:'cg_xxx'}` 并落到事件位置 |
| 验收 | `tools/check.js` | root | P0 条目必须字段齐全、位图已生成、且被剧本引用 |
| 审查 | `tmp/cg/review/*.md` | 审查组 | 报告与判定 |

## 3. 规格（硬性）

| 项 | 值 |
|---|---|
| 成品尺寸 | `1920 × 1080` PNG，`assets/generated/cg/<cgId>.png` |
| 出图尺寸 | `1536 × 1024`（3:2，API 支持的最大横版），居中裁成 16:9 再缩放 |
| 单文件体积 | ≤ **1.5 MB**（`python tools/cg-post.py` 会打印，超标要报） |
| 画框 | 与 `gradeCG()` 同参数：黑边 84px、暗角中心 (50%, 46%) 半径 78% 最后 0.74 不透明、金线 `#d7b148`、内框 inset 34、四角框标臂长 78 |
| 图注 | ≤ 36 汉字，冷峻白描，无引号、无感叹号（SPEC §8） |
| 停留时长 | 默认 4400ms，剧本 `ms` 优先；**不允许需要点击才继续的 CG**（全剧自动通关验证依赖自动推进） |
| 运镜 | `zoom-in`（默认）/ `pan-left` / `pan-right` / `still` |
| 路径回退 | `cg/{id}.png` → `cg/{id}.svg` → `cg/{anchor}.svg`（老剧本 `{t:'cg', id:'bg_xxx'}` 仍按老规则） |

## 4. 风格约束（评审的判定依据）

一份 CG 只有同时满足下面 6 条才算「对齐现有美术」：

1. **块面成立**：画面由可见多边形块面构成，面与面之间有明度差；没有大面积平涂，
   也没有摄影式的连续渐变。
2. **硬边光照**：统一光源在左上；顶部/左侧面最亮，底部/右侧面最暗。
3. **禁线框感 / 禁写实**：没有均匀网格线，没有照片质感、没有镜头光斑、没有景深虚化。
4. **色彩低饱和**：主色落在 `#6d7a55`／`#a8906a`／`#a33a2e`／`#3f5a55`／`#243447`／`#e8eef2`
   这一族里；没有荧光色、没有高饱和橙红。
5. **史实识别点**：八角帽 + 红星、灰绿军装、绑腿、草鞋、步枪；场景里的地理特征与
   `docs/ART_DIRECTION.md` §3 的「必须出现的特征物」一致。
6. **人物策略**：优先远景/群像剪影/背影/道具特写。若画面里出现具体历史人物的脸，
   必须是「侧脸、暗部、很小的远景」——**不允许大特写正脸**，那会和 AI 半身立绘打架。

## 5. 命令速查

### 顺带修掉的历史遗留（`docs/ROUNDS.md` §遗留 2）

老实现里 `cg` 是「把插画塞进背景层」（`setBg(id,'fade',{full:true})`），于是
`ch05.js` / `ch06.js` / `ch08.js` / `ch15.js` 那几处「`bg` 步紧跟同 id 的 `cg` 步」
存在**同帧两次 `setBg`、插画可能被前一张背景换回去**的竞态（R1 记为「存疑未结」）。

现在 `cg` 有自己的图层（`#cg-layer`），**完全不碰背景双缓冲**；背景层的两次交换
只剩「CG 之前那次」与「CG 之后那次」，中间隔着 4400ms 的阻塞步，竞态从结构上消失。
`tools/e2e-steps.js` 在这 5 处各截一帧即可复核。

```powershell
node tools/cg-art.js --list                       # id / 优先级 / 提示词是否已填
node tools/cg-art.js --only cg_luding_bridge --dry-run     # 只看最终提示词
node tools/cg-art.js --only cg_luding_bridge      # 出图 + 自动烘焙
node tools/cg-art.js --ch ch15 --concurrency 2    # 整章
node tools/cg-art.js --all-p0 --concurrency 2     # 全剧 P0
node tools/cg-art.js --only cg_dadu --provider gugu        # 换 provider（额度池不同）
python tools/cg-post.py --id cg_dadu              # 只重烘焙（换调色参数时用）
python tools/cg-post.py --raw <原始图> --out <试片> # 拿旧图试调色
node tools/cg-sheet.py tmp/cg/sheet.png           # 全插画拼版（评审用）
node tools/check.js                               # 验收：字段 + 位图 + 剧本引用
```

原始图留在 `tmp/cg-raw/`（不进 git）。重出会把上一版备份到 `tmp/cg-raw/prev/`，
所以「改坏了想退回」永远有回头路。

## 6. 分工（本轮）

| 组 | agent | 范围 |
|---|---|---|
| 第 1 组 · 剧情审查 | `cg_story_audit` | 读 20 章剧本，定「哪些是重要事件」，填 `src/data/cg.js`，写 `tmp/cg/EVENTS.md`（含落点下标） |
| 第 2 组 · 生成 | `cg_gen_a` / `cg_gen_b` / `cg_gen_c` | 按章分区（ch01–07 / ch08–14 / ch15–20）：改本章剧本 cg 步骤、出图、自检、按评审意见返工 |
| 第 3 组 · 评审 | `cg_rev_style` / `cg_rev_story` / `cg_rev_tech` | 三个独立判据（美术风格 / 剧情贴合与文字 / 工程集成与观感），出报告给生成组返工，最后复验 |

**文件分区（同一阶段内不得越界）**

| 分区 | 拥有文件 |
|---|---|
| `cg_story_audit` | `src/data/cg.js`、`tmp/cg/EVENTS.md` |
| `cg_gen_a` | `src/story/ch01.js` … `ch07.js`、`tmp/cg/gen-a.md` |
| `cg_gen_b` | `src/story/ch08.js` … `ch14.js`、`tmp/cg/gen-b.md` |
| `cg_gen_c` | `src/story/ch15.js` … `ch20.js`、`tmp/cg/gen-c.md` |
| 评审三组 | `tmp/cg/review/style.md`、`tmp/cg/review/story.md`、`tmp/cg/review/tech.md` |

`tools/`、`src/engine/`、`css/`、`index.html`、`docs/` 只有 `/root` 能动。
需要改 → 发消息给 `/root`，不要自己动手。
