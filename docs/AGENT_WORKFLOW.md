# 三组 Agent 流水线作业书（Round 1）

> 由 `/root` 维护，任何 agent **不得修改本文件**。
> 开工前必读：**`docs/issues/R1-INDEX.md`（本轮唯一工单，ID 与分工以它为准）** → 本文件
> → `docs/SPEC.md`（硬性契约）→ `docs/ENGINE_CONTRACT.md`（引擎实际现状）
> → `docs/AGENT_BRIEF.md`（目录所有权与 GEO 速查）。
> 有疑问 → 发消息给 `/root`，不要自行改契约。

> **本轮（R1）实况**：提问组实际只交出 visual 分区（两份稿，合并为 7 条，见 `R1-INDEX.md` §1）；
> engine / content 分区因环境的消息投递故障未能交稿。第二组与第三组**按 `R1-INDEX.md` §3 / §4 的分工执行**，
> 不要等派单，也不要改工单里的 ID。

## 0. 这一轮要干什么

这个仓库是**已完成且自检全绿**的成品（`node tools/check.js` 通过、20 章 61043 汉字）。
所以本轮不是"修 bug"，而是**质量提升循环**：

```
第一组 提问组  ──►  第二组 解决组  ──►  第三组 验收组
（找真问题）        （改代码/美术）        （拿证据判定）
       ▲                                      │
       └──────────── 判定 FAIL 的退回重做 ──────┘
```

三组在**同一份 git 仓库**里接力，每一步都必须留下 commit 并推送到 `origin/main`。

## 1. 铁律（违反即整组作废）

1. **零构建、零依赖、零网络。** 双击 `index.html` 必须能跑。
   禁止 ES Module（`type="module"`）、禁止 `fetch()`、禁止 CDN / 外部字体 / 外部图片、禁止新增第三方库。
2. **不许引入任何 JS 报错。** 改完必须自己跑验证，不许把兜底丢给别人。
3. **全中文**：游戏文本、注释、文档、commit message 用简体中文（代码标识符用英文）。
4. **冻结文件不得改动**：`docs/SPEC.md`、`docs/STORY_BIBLE.md`、`docs/AGENT_BRIEF.md`、
   `docs/AGENT_WORKFLOW.md`、`art/geosvg.js`、`art/palette.js`、
   `src/data/characters.js`、`src/data/backgrounds.js`、`src/story/manifest.js`。
   确实需要改动 → 发消息给 `/root` 申请，附理由与影响面。
5. **id 表冻结**：人物 id / 表情 / 背景 id / 立绘路径规则一律不得增删改名。
6. **每个改动都要能被一条命令验证。** 说不清怎么验证的改动，不要提交。
7. **不许为了"看起来在干活"而改文件。** 没有可信证据的问题不进清单；
   没有实际改善（或改善无法观测）的修改不要提交。宁可少而实。

## 2. 三组的分工与产物

### 第一组：提问组（finder）

**任务**：在这个仓库里找出**真实存在、值得修、可验证**的问题。覆盖面包括但不限于
代码实现、性能与优化、美术与可读性、内容与文案、工程与工具链。

**只写**：`docs/issues/R1-<area>.md`（area ∈ `engine` / `content` / `visual`）。
不要动源码、不要动美术资源、不要动 `docs/issues/R1-INDEX.md`（那是组长的活）。

**每个问题的必填字段**（表格或小节都可以，缺字段的问题会被验收组直接判 `REJECT`）：

| 字段 | 要求 |
|---|---|
| `ID` | `R1-Q<两位序号>`，由组长统一分配，子 agent 先留空或按组长给定的号段填 |
| `标题` | 一句话说清现象 |
| `严重度` | `P0`（玩家可见的坏体验 / 数据损坏）/ `P1`（明显缺陷）/ `P2`（打磨） |
| `证据` | **文件:行号** + 复现方式（命令 / 截图路径 / 代码引文）。禁止"我觉得" |
| `为什么是问题` | 对玩家或对维护者的具体损害，不许空话 |
| `验收标准` | 改完之后**用哪条命令 / 看哪张图 / 读哪段代码**判定通过。必须可机械复核 |
| `影响文件` | 预计要改哪些文件（给解决组划边界） |
| `不可行就说明` | 如果这个问题的修法有取舍，写清楚取舍 |

**要求**：
- 每人最多提 **4** 条，全组最多 **12** 条。**宁缺毋滥**，按严重度排序。
- 提问题**必须自己先验证一遍**（跑命令、看渲染、读代码），把验证输出贴进证据。
  探针骗过你的坑（无头 Edge 的 transition、`--virtual-time-budget`）见 `README.md` 末尾。
- 判定"是不是真问题"的最低门槛：**能构造出可复现的现象，或能引用出明确的契约/一致性冲突。**
- 如果某条是"设计取舍"而不是"缺陷"，明确标注 `性质: 取舍`，让第二组决定。
- 如果是**史实错误**，必须给出史料依据（`docs/STORY_BIBLE.md` 或公开史实），
  并注意 §1.4 的铁律：本作中会议结论、牺牲、会师都是既定历史，不得为"戏剧性"改动。

### 第二组：解决组（fixer）

**任务**：按 `docs/issues/R1-INDEX.md` 逐条解决。**只解决清单里的问题**，
顺手发现的其它问题记进 `docs/fixes/R1-BACKLOG.md`（写给下一轮），不要顺手改。

**只写**：源码 / 美术定义 / 样式（按第 4 节分区），以及 `docs/fixes/R1-<ID>.md`。

**每条问题的修复记录必填**：

| 字段 | 要求 |
|---|---|
| `ID` | 对应的问题号 |
| `改动` | 哪个文件、改了什么（关键 diff 片段） |
| `自检命令与输出` | 实际跑过的命令 + 真实输出摘要（**粘贴原文**，不许写"已验证"） |
| `回归检查` | 证明没有把别的东西弄坏（至少：`node tools/check.js`） |
| `未完成 / 降级` | 没做到的部分和原因，不许隐瞒 |

**要求**：
- 先用最直接的改法解决，别过度设计；能改数据的就别改代码，能改代码的就别改架构。
- **改完必须自己跑验证**，至少包含：`node tools/check.js`、以及 `node --check <改动过的 js>`。
  涉及渲染的改动，还要跑一次探针截图：`node tools/e2e-shot.js <chapter>`。
- 涉及全局行为的改动（引擎 / 存档 / CSS 变量），追加 `node tools/e2e-run.js`、`node tools/qa-consistency.js`。
- 一条问题一个 commit，message 形如 `fix(R1-Q03): 修正 xxx`。
- 无法修复的问题：写 `docs/fixes/R1-<ID>.md`，结论写 `拒绝/降级` 并给出理由与证据，交还验收组。

### 第三组：验收组（reviewer）

**任务**：**以第一组的验收标准为准**，独立判定第二组的成果。
不信任第二组的自述，**自己把命令重跑一遍、自己看图、自己读 diff**。

**只写**：`docs/reviews/R1-<ID>.md`。

**判定档位**（必须选一个，并给出反证据）：

| 判定 | 含义 |
|---|---|
| `PASS` | 验收标准达成，且回归检查通过 |
| `FAIL` | 验收标准未达成，或引入了回归 —— **要写出反例/复现命令** |
| `PARTIAL` | 部分达成，写清缺哪一半 |
| `REJECT` | 问题本身不成立（第一组误报）；或修法违反铁律 —— 要说清依据 |

**必须做的三件事**：
1. **重跑验证**：把 `docs/fixes/R1-<ID>.md` 里的命令原样跑一遍，把**你的**输出贴进报告。
2. **回归检查**：`node tools/check.js` + 该问题涉及的邻接面（别的章节、别的界面、别的素材）。
3. **反证据搜索**：主动找反例（边界输入、极端数据、别的章节、缺图降级路径）。
   找不到反例才写 PASS，并说明你试过哪些反例。

**判定为 FAIL 的问题，写清"还差什么"** —— 这一条会被原样退给第二组重做。

## 3. git 协议（所有过程必须留痕并上传远端）

- 仓库：`https://github.com/icecube553511/LongWayGame`，分支 `main`，远端名 `origin`。
- **只有组长跑 git 命令**，子 agent 一律不许执行 `git`（避免多进程抢 `index.lock`）。
  子 agent 写完文件向组长报告文件清单。
- 组长**按问题逐条提交**，禁止把整组成果压成一个巨型 commit。
  commit message 规范：

  ```
  audit(R1): <area> 提出 R1-Q03..R1-Q05        # 提问组
  fix(R1-Q03): <一句话说清改了什么>             # 解决组
  review(R1-Q03): PASS <一句话结论>             # 验收组
  chore(R1): <杂项，如登记清单、退单>
  ```

  正文里写清：证据来源、跑了什么命令、结果如何。
- **推送**：每个阶段收尾时 `git push origin main`。推送失败不允许吞掉，
  要在给 `/root` 的 FINAL_ANSWER 里写明失败原因与当时的 `git status`。
- 提交前 `git status --short` 自检：**不要提交 `tmp/` 下的任何东西**（已在 `.gitignore`），
  不要提交无关键（例如你自己的一次性调试脚本 —— 要留就放进 `tools/` 并写清用途）。

## 4. 并行分区（同一阶段内互不越界）

同一阶段有 3 个 agent 在跑，按下面的分区干活，谁也别碰别人的文件：

| 分区 | 拥有文件 | 说明 |
|---|---|---|
| `engine` | `index.html` `css/style.css` `src/engine/*.js` `src/data/*.js`(只读) | 引擎、界面、存档、音频、性能 |
| `content` | `src/story/*.js` `src/story/manifest.js`(只读) `docs/*.md`(非冻结) | 剧本、文案、排版、文档 |
| `visual` | `art/*.js` `tools/build-art.js`(只读) `assets/generated/**` | 美术定义、烘焙产物、对比图 |

`tools/*.js` 是**共享**的：谁要改工具，先在 `docs/issues/R1-<area>.md` 里登记，
由组长协调，一次只允许一个 agent 动 `tools/`。

## 5. 通用自检命令

在仓库根目录（`C:\Users\12254\Desktop\projects\LongWayGame`）执行：

```powershell
node tools/check.js                    # 全量校验（20 章 + 资源 + 死链）—— 最低门槛
node tools/check.js --chapter ch07     # 单章
node tools/lint-story.js src/story/ch07.js
node tools/e2e-run.js                  # 全剧自动通关，报告每章步数与 JS 报错
node tools/e2e-run.js 1 6 ch09,ch15    # 只跑指定章
node tools/qa-consistency.js           # 舞台一致性（说话人在不在台上 / 重复立绘 / 缺图）
node tools/e2e-shot.js ch16            # 真浏览器截图冒烟
node tools/shot-one.js assets/generated/bg/bg_luding.svg      # 单张素材放大截图
node tools/shot-one.js --sheet assets/generated/chars "*_calm" # 拼版对比
```

截图依赖系统 Edge：`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`。

## 6. 汇报格式

组长向 `/root` 发 `FINAL_ANSWER`，包含：

1. 本组产物文件清单（含 `docs/` 下新增的清单/报告）。
2. `git log --oneline -n 20` 的本组提交片段。
3. 关键命令与**真实输出摘要**。
4. 推送结果（成功 / 失败原因）。
5. 已知缺口、未做的事、需要 `/root` 决策的事。
