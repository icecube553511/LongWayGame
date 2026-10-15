# R1 工单索引（组长维护 · 唯一工单）

> 本文件是 R1「提问 → 解决 → 验收」流水线的**唯一工单**。任何人开工前先读：
> 本文件 → `docs/AGENT_WORKFLOW.md`（铁律与流程）→ 相关分区的 `docs/issues/R1-*.md`（原始证据）。
> **ID 以本表为准**；分区文档里的编号若与本表冲突，以本表为准。

## 0. 本轮基线

* `node tools/check.js` **全绿**：20 章 / 6595 步 / 61043 汉字 / 选项 60 / 史料档案 81 /
  背景 30-30 / 立绘 280-280（唯一警告：`narrator` 未出场，属既有豁免）。
* 所以本轮**不是修 bug**，而是质量提升循环：问题必须真实、可复现、可机械验收。
* 远端：`https://github.com/icecube553511/LongWayGame`，分支 `main`。

## 1. 问题总表（本轮 = 11 条）

| ID | 严重度 | 分区 | 标题 | 依据文件 |
|---|---|---|---|---|
| **R1-Q13** | **P0** | visual | 9 张背景有未绘制地形的大块空洞，腊子口中央约 9.5% 透舞台底色、碉堡悬空 | `docs/issues/R1-visual-b.md` |
| **R1-Q11** | P1 | 工具链 | `tools/validate-svg.js` 在干净仓库恒失败（34 条全是内嵌 base64 凑出的 `NaN` 假阳性），守卫作废 | `docs/issues/R1-visual.md` |
| **R1-Q14** | P1 | visual | 17 个背景 id 有两份实现，`scenes.js` 静默覆盖地区分册（约 1.9 MB 死代码，改动静默失效） | `docs/issues/R1-visual-b.md` |
| **R1-Q09** | P1 | engine | 插画画廊「湘江·白昼」永远解锁不了（UI 宣称 20 项，剧本只能产出 19 项） | `docs/issues/R1-visual.md` |
| **R1-Q05** | P1 | content | 剧本里 33 个 `{ t: 'note' }` 史料小注，27 个玩家永远看不到（非阻塞 step 写完即被下一步对白抹掉） | `docs/issues/R1-content.md` |
| **R1-Q07** | P1 | content | `ch09:428` 正文「三月里」与全章/全剧的二月时间线正面冲突（史实错误） | `docs/issues/R1-content.md` |
| **R1-Q06** | P1 | content | 人物图鉴「首次登场」有 11 处与剧本实际不符（阿月差了 14 章） | `docs/issues/R1-content.md` |
| **R1-Q12** | P2 | 契约/文档 | 11 个产物超 `docs/ART_DIRECTION.md` §4.4 的 400 KB 上限（最大 583 KB），理由与现象对不上 | `docs/issues/R1-visual.md` |
| **R1-Q15** | P2 | 文档 | `README.md` §五「没有一张位图…仓库里只有 SVG 和 JS」与事实不符（174 张 AI 立绘 PNG + 36 张 bg/cg 内嵌 base64） | `docs/issues/R1-visual.md`（原稿） |
| **R1-Q10** | P2 | 文档 | `assets/generated/ui/` 的 16 个 UI 装饰 SVG 从未被任何代码引用，是被误认成"线上资源"的死文件 | `docs/issues/R1-visual.md` |
| **R1-Q08** | P2 | content | 中文正文混用半角双引号 `"`（约 130 处）与直角引号「」，另有 1 处半角逗号 | `docs/issues/R1-content.md` |

> **组长收件复核（真的跑过，不是转述）**：
> `rg -o "t: 'note'" src/story | Measure-Object` → `33`（对上 Q05 的口径）；
> `rg -n "三月里" src/story/ch09.js` → `428: ... '三月里，红军二渡赤水之后连下桐梓、娄山关、遵义。'`（对上 Q07）；
> `rg -n "\x22" src/story/ch01.js` 有命中（半角引号确实存在，Q08 的全文计数交给验收组复核）。
> Q06 的 11 处对账、Q05 的"27 个看不到"逐条分类**未经我复核**，由第三组独立重跑。

## 2. 组长裁决（本轮生效，优先于 AGENT_BRIEF §1 的歧义）

1. **R1-Q13 / R1-Q14 的跨文件所有权冲突**：`AGENT_BRIEF.md` §1 把 `art/scenes_*.js` 划给
   `art-scenes-*` / `art-ui`，而 `AGENT_WORKFLOW.md` §4 把 `art/*.js` 整体划给 visual 分区；
   两个文件头也各说各话（`scenes.js` / `scenes_river.js` 写 root，`scenes_jiang.js` 写 art-scenes-a）。
   **裁决：本轮 `art/scenes*.js` 全部归第二组的 visual 解决人一人所有**，避免并行互相覆盖。
2. **`tools/` 共享区**：本轮只有 R1-Q11 要动 `tools/`，**独占给 `g2_eng`**，其他人本轮不得改 `tools/`。
3. **冻结文件一律不动**：`docs/SPEC.md`、`docs/STORY_BIBLE.md`、`docs/AGENT_BRIEF.md`、
   `docs/AGENT_WORKFLOW.md`、`art/geosvg.js`、`art/palette.js`、`src/data/characters.js`、
   `src/data/backgrounds.js`、`src/story/manifest.js`。
   `tools/build-art.js`、`tools/qa-shot.js` 由 root 维护，本轮**不得修改**（R1-Q14 的门禁项因此降级为可选项）。
4. **`.gitignore`** 已由提问组 agent 把 `_e2e-probe-*.html` 放宽为 `_e2e*.html`，组长**接受**该改动
   （根因是 `tools/e2e-steps.js:271` / `e2e-run.js:181` 在仓库根目录写唯一临时页且不清理）。
5. **A/B 选择的裁量权归解决人**，但必须在 `docs/fixes/R1-<ID>.md` 里写明选了哪条、为什么。
6. **content 分区落点**：`src/story/*.js`（**除 `ch03.js`**，那归 `g2_eng` 的 Q09）本轮归 `g2_content` 一人所有。
   `src/data/characters.js` 是冻结文件 → **R1-Q06 只能走降级路线**（或挂下一轮），不许开冻结文件的例外。
7. **`docs/issues/R1-content.md` 附二的 A/B/C/D 四条附带发现不占本轮名额**，解决人不得顺手改；
   由组长记入下一轮候选（见 §6）。

## 3. 第二组（解决组）分工

两组并行，**互不越界**。每条问题一个 commit，message 形如 `fix(R1-Q13): 一句话`。

### g2_art（visual）

* 拥有文件：`art/scenes.js`、`art/scenes_meeting.js`、`art/scenes_river.js`、`art/scenes_north.js`、
  `art/scenes_jiang.js`、`assets/generated/**`（烘焙产物，由 `node tools/build-art.js` 重生成，不手改）。
* 负责：**R1-Q13**、**R1-Q14**。

### g2_eng（engine / 工具链 / 文档）

* 拥有文件：`src/engine/gallery.js`、`src/story/ch03.js`（仅 Q09 所需的最小改动）、
  `tools/validate-svg.js`（本轮独占）、`README.md`、`docs/ART_DIRECTION.md`。
* 负责：**R1-Q11**、**R1-Q09**、**R1-Q15**、**R1-Q10**、**R1-Q12**。
* 顺序建议：Q11（一行正则，恢复门禁）→ Q09（玩家可见）→ Q15 / Q10 / Q12（文档口径）。

### g2_content（剧本文案）

* 拥有文件：`src/story/*.js`（除 `ch03.js`）、`docs/fixes/R1-Q05.md` / `R1-Q06.md` / `R1-Q07.md` / `R1-Q08.md`。
* 负责：**R1-Q05**、**R1-Q07**、**R1-Q08**、**R1-Q06**。
* 顺序建议：Q05（玩家可见）→ Q07（史实）→ Q08（标点普查）→ Q06（可能要降级）。
* **派单状态**：本轮并发槽只有 4 个（含组长），`g2_art` / `g2_eng` 已占满；
  组长在有空槽时立即派单，若始终无空槽，**由组长本人顶 content 分区**（沿用 R1 提问组时"visual 由组长顶"的先例），
  并在 §5 如实登记。

### 每条问题必须交 `docs/fixes/R1-<ID>.md`，含：

| 字段 | 要求 |
|---|---|
| `ID` | 对应问题号 |
| `改动` | 哪个文件、改了什么（关键 diff 片段） |
| `自检命令与输出` | 实际跑过的命令 + **真实输出原文**（不许只写"已验证"） |
| `回归检查` | 至少 `node tools/check.js`；涉及渲染的加 `node tools/e2e-run.js` |
| `未完成 / 降级` | 没做到的部分和原因，不许隐瞒 |

**共同硬约束**：禁止 `git` 命令（组长统一提交）；禁止碰别人的文件；禁止引入任何 JS 报错；
零构建零依赖零网络；全中文；临时输出放 `tmp/` 且不在仓库根目录留文件。

## 4. 第三组（验收组）分工

以第 1 节的严重度与各问题原稿的「验收标准」为准，**不信自述**：自己重跑命令、自己看图、自己读 diff。

* `g3_a`：R1-Q13、R1-Q14（美术面）
* `g3_b`：R1-Q11、R1-Q09、R1-Q15、R1-Q10、R1-Q12（工具链 / 文档 / 引擎面）
* `g3_c`：R1-Q05、R1-Q06、R1-Q07、R1-Q08（剧本文案面）

判定必须选一个：`PASS` / `FAIL` / `PARTIAL` / `REJECT`，并给出反证据。产物：`docs/reviews/R1-<ID>.md`。
必须做三件事：① 把 `docs/fixes/R1-<ID>.md` 的命令**原样重跑**并贴**自己的**输出；
② 回归检查（`node tools/check.js` + 该问题邻接面）；③ 主动找反例（边界输入、别的章节、缺图降级路径）。

## 5. 已知缺口（组长记录）

* **content 分区已交稿**：`docs/issues/R1-content.md`（Q05–Q08，4 条 + 已排除候选 + 附带发现），
  组长已抽样复核（见 §1 收件复核）。`R1-INDEX.md` 早先写"content 没交稿"是**误记** —— 该稿是提问组
  content agent 在组长登记之后才落盘的，现更正。
* **engine 分区仍未交稿**（号段 `R1-Q01`…`R1-Q04` 空）：负责该分区的 agent 未能收到任务书
  （本环境下 spawn/followup 的消息投递多次失败，agent 自述"只收到环境上下文"），
  它改为自行做了只读复核。因此本轮的提问面**偏美术、工程契约与剧本文案，代码实现/优化覆盖不足** —— 留给下一轮。
* `tools/e2e-steps.js` / `e2e-run.js` 在仓库根目录写 `_e2e_<pid>_<ts>.html` 且不清理；
  本轮用 `.gitignore` 兜住，**根因（不清理）未修**。

## 6. 下一轮候选（组长记录，本轮不做）

* `docs/issues/R1-content.md` 附二 A（ch09 档案 `a_qinggangpo` 与 ch08 的土城战役重复）、
  B（`note` step 未写进 `docs/SPEC.md` §2.1，契约与实现不一致 —— 需向 `/root` 申请动冻结文件）、
  C（`ch12.js:256` 小标题把 4 天写成"九天九夜"）、D（`ch12.js:484` 周恩来卖马细节缺史料依据）。
* `engine` 分区（号段 `R1-Q01`…`Q04`）的提问面完全空缺：下一轮第一组要补代码实现、性能、存档、音频、可维护性。
