# 场景背景位图工程说明

> 由 `/root` 维护，**冻结**。任何 agent 不得修改本文件；要改契约 → 找 `/root`。
> 开工前必读：本文件 → `docs/ART_DIRECTION.md` §0/§2.3.1/§3/§3.2 → `docs/SPEC.md` §4 →
> `tools/bg-art.js` 与 `tools/bg-post.py` 的注释。
> 通用规矩（管线、提示词纪律、体积档、抠底、评审方法、git 纪律）见 **`docs/PRODUCTION_SPEC.md`**；
> 本文件只写"场景背景位图"这一族特有的东西。

## 1. 这一轮在做什么

原先把 30 个场景背景画成程序化 SVG（`art/scenes_*.js` + `tools/build-art.js`）。
几何干净，但只有骨架：块面数量少、没有可辨认的人群、同屏十几张背景彼此区分度靠「特征物」硬撑。
本轮把**场景背景整体换成 AI 出的整屏位图**，要求三条：

1. **全屏插画级质量** —— 与 `assets/generated/cg/cg_*.png`（重要事件插画）同一水准的完成度；
2. **群像里的个人各不相同** —— 体态、年龄、脸型、神态、军装的磨损程度都要分开，不许复制粘贴；
3. **风格与画面内容都不许走样** —— 风格守 `docs/ART_DIRECTION.md` §0 的五条，
   内容守每一条背景在剧本里的实际场景（提示词按章逐条写，不是「一张通用风景 + 换颜色」）。

```
src/data/bgart.js（提示词，唯一的清单）
   └─ node tools/bg-art.js      调 NekoGptImage 出图 → tmp/bg-raw/<id>.png
        └─ python tools/bg-post.py   裁 16:9 → 1920×1080 → 调色 → 暗角 → assets/generated/bg/<id>.png
             └─ src/engine/engine.js  bgCandidates(): 位图优先，矢量兜底
                  └─ node tools/check.js  30/30 必须都有位图（闸门）
                       └─ python tools/bg-judge.py  Gugu-gpt-QQ 的视觉模型逐张核对（人复核用的初判）
```

## 2. 三层实现（谁拥有什么）

| 层 | 文件 | 所有权 | 说明 |
|---|---|---|---|
| 清单 | `src/data/bgart.js` | root | 30 条场景 + 4 条叙事画面的 id / 中英文描述 / `must` / `crowd` / `avoid`。**提示词的唯一来源** |
| 生成 | `tools/bg-art.js` | root | 拼提示词（风格头 / 构图 / 群像硬要求 / 光照纪律 / AVOID）→ 调 cc-switch 的 NekoGptImage → 落原始图 → 自动接烘焙 |
| 烘焙 | `tools/bg-post.py` | root | 裁 16:9 → 1920×1080 → 低饱和暖调 → 椭圆暗角 → 体积超档则量化 |
| 呈现 | `src/engine/engine.js`、`src/engine/gallery.js` | root | `bgCandidates(id)`：`bg/{id}.png` → `bg/{id}.svg` 逐级回退；画廊同样按候选列表回退 |
| 验收 | `tools/check.js` | root | 背景位图自检：id 归属、`must` 非空、30 张位图必须存在且是完整 PNG、`svgOnly` 与 `noBitmap` 必须一致 |
| 看图复核 | `tools/bg-judge.py` | root | 用 Gugu-gpt-QQ 分组的视觉模型（gpt-6.1-sol / gpt-6-astra）逐张核对必现元素与人群差异，落 `tmp/bg/review/*.md` |
| 兜底 | `art/scenes_*.js`、`assets/generated/bg/*.svg` | root | **保留不动**：位图缺失时引擎回退到矢量背景，任何时候都不会黑屏 |

### 2.1 两个分组各干什么（2026-10-16 实测）

| 分组 | `/v1/models` | 在本工程里的角色 |
|---|---|---|
| `NekoGptImage` | `gpt-image-2` / `gpt-image-2.5` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` | **出图**（`tools/bg-art.js`，默认 `gpt-image-2.5-sunburst`） |
| `Gugu-gpt-QQ` | `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-6-astra` / `gpt-6-sol` / `gpt-6.1-sol` | **看图验收**（`tools/bg-judge.py`）。这一组是文本+视觉模型：对 `/v1/images/generations` 一律返回 `404 model_not_found ... not available for this group`，**它不出图** |

## 3. 规格（硬性）

| 项 | 值 |
|---|---|
| 成品尺寸 | `1920 × 1080` PNG，`assets/generated/bg/<id>.png` |
| 出图尺寸 | 请求 `1920x1080`；该端点实际返回 **1672×941（真 16:9）**，烘焙时等比放大到 1920×1080，不需要裁切 |
| 单文件体积 | ≤ **1280 KB**（`tools/bg-post.py` 每次烘焙打印实际体积；超档按调色板量化，不模糊、不缩尺寸） |
| 画框 | **不压**电影黑边、**不压**金色内框、**不压**四角框标 —— 那套画框是插画（CG）的标志（`docs/CG_DESIGN.md` §3）；背景是舞台，玩家全程看着它 |
| 暗角 | 中心 (50%, 44%)、半径 0.86、末端 0.40（比 CG 的 0.74 浅）：中下部要留给立绘与对话框 |
| 提示词字段 | `prompt_en`（≥120 字符）/ `prompt_cn` / `must`（4–6 条）/ `crowd`（有人群才写）/ `avoid` |
| 不出位图的四张 | `bg_bullets_3` / `bg_bullets_2` / `bg_bullets_1` / `bg_black`：`backgrounds.js` 标 `noBitmap:true`、`bgart.js` 标 `svgOnly:true`，两处必须同改（`tools/check.js` 会核对） |

## 4. 风格与构图约束（复核的判定依据）

一份背景位图只有同时满足下面 7 条才算「对齐现有美术」：

1. **块面成立**：画面由可见多边形块面构成，面与面之间有明度差；没有大面积平涂，也没有摄影式连续渐变。
2. **硬边光照**：统一光源在左上；顶部/左侧面最亮，底部/右侧面最暗。
3. **禁线框感 / 禁写实**：没有均匀网格线、照片质感、景深虚化、镜头光斑、发光溢光。
4. **色彩低饱和**：主色落在 `#6d7a55`／`#a8906a`／`#a33a2e`／`#3f5a55`／`#243447`／`#e8eef2` 这一族里。
5. **史实识别点**：八角帽 + 红星、灰绿军装、绑腿、草鞋、步枪；场景里的地理特征与 `docs/ART_DIRECTION.md` §3 的「必须出现的特征物」一致。
6. **舞台约束**（背景独有，插画没有）：立绘（600×900）与对话框压在中下部，所以画面**正中不放大特写**、**不出现朝向观众的正脸**、人群走中景与远景；靠边的人由画框裁掉，而不是站在画面中央摆姿势。
7. **群像每人不同**（`docs/ART_DIRECTION.md` §2.3.1 的背景印章规矩，提到整图上）：
   体态（高瘦/矮壮/驼背）、年龄（少年/新兵/中年老兵/花白老人/老妇人）、脸型、发型与头饰、
   随身物件、姿态，以及**军装的磨损程度**（补丁、破口、褪色、泥污、缺扣、缠在前臂的布条、绳腰带）
   都要分开；不许一排同样的剪影，也不许把一个人按不同比例复制成整片人群。

## 5. 命令速查

```powershell
node tools/bg-art.js --list                       # 看清单与提示词是否就绪
node tools/bg-art.js --json  > tmp/bg/prompts.json   # 给 bg-judge.py 用的同一份清单
node tools/bg-art.js --only bg_luding             # 单张（自动接烘焙）
node tools/bg-art.js --ch ch15 --concurrency 2    # 一章
node tools/bg-art.js --all --concurrency 4        # 全部 30 张（自动跳过 4 张 svgOnly）
node tools/bg-art.js --only bg_wuqi --force       # 重出（旧的原始图自动存 tmp/bg-raw/prev/）
node tools/bg-art.js --only bg_dadu --dry-run     # 只看最终提示词
python tools/bg-post.py --all                     # 只重烘焙（改了调色/暗角参数时）
python tools/bg-judge.py --all                    # 视觉模型逐张核对（--model / --concurrency / --force）
node tools/check.js                               # 总闸门（含背景位图 30/30）
python tmp/devkit/bg-sheet.py tmp/bg/sheet.png 15 5   # 拼对比版，供肉眼验收
```

密钥一律从 `C:/Users/12254/.cc-switch/cc-switch.db` 读取，不落盘、不打印。

## 6. 本轮实测记录（2026-10-16）

| 项 | 读数 |
|---|---|
| 出图 | 30/30 张（`NekoGptImage` / `gpt-image-2.5-sunburst`，串并发 4，单张 25–170s） |
| 烘焙 | 30/30 张落在 1280 KB 档内（实测 750–1181 KB，最大 `bg_yanan_cave` 1181 KB） |
| 返工 | `bg_wuqi` 第一版把墙上的白灰标语画成了**像字的东西**，违反「不画任何文字」；已按 `ART_DIRECTION` §3.1 的口径改提示词（墙面只留抽象痕迹）+ 把「像字/字形的痕迹」加进 `bg-art.js` 的公共 AVOID，重出后合格 |
| 看图复核 | `tools/bg-judge.py` 按 30 张提交，但 **Gugu-gpt-QQ 分组当天上游返回 502 `模型服务暂时不可用`**（连纯文本请求也 502，同一分组在 12:5x 还能正常回 PONG），30 张全数拿不到判定。处理：本轮的逐张验收以 **root 的肉眼复核**（2 张拼版 + 关键张原图）为准，`bg-judge.py` 保留在仓库里，等上游恢复后重跑一次即可补齐第二意见 |
| 引擎 | `bgCandidates()` 位图→矢量回退；`node tools/e2e-run.js` / `node tools/e2e-steps.js` 复验（见提交说明） |

> 记一笔方法上的教训：出图端只会「画得像」，不会交代「画里有没有那十三根铁索、有没有出现文字」。
> 所以 `must` 这种可核对的清单必须写进数据（`bgart.js`），并且要有一个**独立的看图方**去核对它；
> 同一个 provider 自评等于没有第二意见。
