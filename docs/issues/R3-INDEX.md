# R3 工单索引（组长维护 · 唯一工单）

> 本文件是 R3「提问 → 解决 → 验收」流水线的唯一工单。任何人开工前先读：
> 本文件 → `docs/AGENT_WORKFLOW.md`（铁律与流程）→ `docs/SPEC.md`（硬性契约）
> → `docs/ENGINE_CONTRACT.md` → `docs/AGENT_BRIEF.md` → 本分区已提过的问题稿。
> **ID 以本表为准**；分区文档的编号与本表冲突时以本表为准。
> 本文件由组长维护，子 agent 不得修改。

## 0. 本轮基线（组长实测 · 2026-10-15 19:50，commit `074faa3`）

* `node tools/check.js` **通过（exit 0）**：20 章 / 6642 步 / **61177 汉字** / 选项 60 / 档案 81 /
  背景 30-30 / 立绘 280-280。
* 唯一警告：`[全局] 未出场的角色（1）：narrator`（既有豁免）。
* R2-C01 补足六章正文的成果已落库（本章节汉字数全部 ≥3000），
  即 **R2 阶段留下的"内容缺口"已填平**，本轮不是在补欠账，而是继续做质量提升。

## 1. 并发事实（重要，第二轮开工前必须重读）

本仓库**此刻还有另一条在途流水线**（R2 段，正在处理 `R2-E03…R2-E06`），
其最近一次落库为 `074faa3`（19:43:41），直接改动的热文件是：

```
src/engine/engine.js      （R2-E01/E02 已修；E03 Tab 键 / E04 存档 API 可能继续动这文件）
tools/e2e-run.js          （R2-E05 参数校验）
tools/e2e-steps.js        （R2-E06 临时文件残留）
```

**因此本轮 R3 的硬边界：**

1. **提问阶段（第一组）是纯只读**，不写任何源码，风险为零 —— 正常开工。
2. **`tools/` 本轮整体避让**：R3 三组**不得修改 `tools/` 下任何文件**。
   确有必须改工具的发现，写进问题清单并在「不可行就说明」里写明"需组长与在途流水线协调"，
   由组长裁决，不许自行落盘。
3. **解决阶段（第二组）开工前**，组长会重新实测在途状态（`git log` / 文件 mtime）再划定
   `src/engine/engine.js` 的可动范围。第二组写文件前**必须先重读该文件当前内容**，
   禁止凭记忆套用 patch。
4. 全程**只有组长跑 git**；子 agent 一律不许执行 git 命令（避免多进程抢 `index.lock`，
   也避免与在途流水线的推送互相非快进）。

## 2. 远端与提交协议

* 仓库 `https://github.com/icecube553511/LongWayGame`，分支 `main`，远端 `origin`。
* 只有组长跑 git；子 agent 写完文件向组长报告文件清单。
* 逐条提交，禁止把整组成果压成一个巨型 commit：

  ```
  audit(R3): <area> 提出 R3-<区>-01..R3-<区>-NN   # 第一组
  fix(R3-<ID>): <一句话说清改了什么>                # 第二组
  review(R3-<ID>): PASS <一句话结论>                # 第三组
  chore(R3): <登记清单、退单、裁决>
  ```

* 每阶段收尾 `git push origin main`。**本机推送必须带代理**（实测直连被重置）：

  ```powershell
  git -c http.proxy=http://127.0.0.1:7897 push origin main
  ```

  推送失败不许吞掉，要在回报里写明原因与当时的 `git status`。
* 提交前 `git status --short` 自检：不提交 `tmp/`（已在 `.gitignore`），不提交无关文件。

## 3. 三组分工与产物

### 第一组 · 提问组（finder）

* 只写 `docs/issues/R3-<area>.md`（area ∈ `engine` / `content` / `visual`）。
* 每人最多 6 条，**宁缺毋滥**，按严重度排序；每条必须自己先复现一遍，
  把**原样命令 + 真实输出原文**贴进证据。
* 必填字段：`ID` / `标题` / `严重度(P0/P1/P2)` / `证据(文件:行号 + 复现命令与输出)` /
  `为什么是问题` / `验收标准(可机械复核)` / `影响文件` / `不可行就说明`。
* 覆盖范围**不限于**代码实现、性能与优化、美术与可读性、内容与文案、工程与可维护性。

### 第二组 · 解决组（fixer）

* 按本文件 §5 的认领表干活，**只解决清单里的问题**；顺手发现写 `docs/fixes/R3-BACKLOG.md`。
* 每条问题一份 `docs/fixes/R3-<ID>.md`（改动 / 自检命令与**真实输出原文** / 回归检查 / 未完成降级）。
* 改完必须自己跑：`node tools/check.js`、`node --check <改过的 js>`；
  涉及渲染加 `node tools/e2e-shot.js <chapter>`；涉及全局行为加
  `node tools/e2e-run.js`、`node tools/qa-consistency.js`。

### 第三组 · 验收组（reviewer）

* 只写 `docs/reviews/R3-<ID>.md`，判定必须是 `PASS` / `FAIL` / `PARTIAL` / `REJECT` 之一。
* **以第一组写的验收标准为准**，不信第二组自述：把修复记录里的命令原样重跑并贴**自己的**输出；
  做回归检查；主动构造反例（边界输入、极端数据、别的章节、缺图降级路径）。
* 判 `FAIL` 要写清"还差什么"，这条会被原样退回第二组重做。

## 4. 号段与分区

| 分区 | 号段 | 拥有文件（可写） |
|---|---|---|
| `engine` | `R3-E01` 起 | `index.html`、`css/style.css`、`src/engine/*.js`；`src/data/*.js` 只读 |
| `content` | `R3-C01` 起 | `src/story/*.js`；`src/story/manifest.js` 只读 |
| `visual` | `R3-V01` 起 | `art/*.js`（`art/scenes*.js` 全部归同一人）、`assets/generated/**` |

`tools/` 本轮**冻结**（见 §1.2）。

## 5. 问题总表与认领

| ID | 严重度 | 分区 | 标题 | 状态 |
|---|---|---|---|---|
| R3-E?? | — | engine | *待第一组 engine 分区交稿* | 提问组在办 |
| R3-C?? | — | content | *待第一组 content 分区交稿* | 提问组在办 |
| R3-V?? | — | visual | *待第一组 visual 分区交稿* | 提问组在办 |

## 6. 冻结文件（不得修改，需向组长申请）

`docs/SPEC.md`、`docs/STORY_BIBLE.md`、`docs/AGENT_BRIEF.md`、`docs/AGENT_WORKFLOW.md`、
`art/geosvg.js`、`art/palette.js`、`src/data/characters.js`、`src/data/backgrounds.js`、
`src/story/manifest.js`、`tools/build-art.js`、`tools/qa-shot.js`。
id 表（人物 id / 表情 / 背景 id / 立绘路径规则）一律不得增删改名。

## 7. 不许重复报的既有条目

* R1：`R1-Q05`–`R1-Q15`（见 `docs/issues/R1-INDEX.md`、`R1-content.md`、`R1-visual.md`、`R1-visual-b.md`）。
* R2：`R2-E01`–`R2-E06`（`docs/issues/R2-engine.md`）、`R2-C01`、`R2-V01`、`R2-V02`。
* `docs/issues/R2-INDEX.md` §7「下一轮候选」四条（e2e 临时文件残留、engine 名册表 ASCII 直引号、
  `R1-content.md` 附二四条、`note` step 未写进 SPEC）。
  —— 其中三条已在 R2-E05/E06 号段内，本轮如无新增证据不再收；`note` 契约不一致需组长授权动冻结文件。
* 已在办：`docs/reviews/R2-V01.md` §6 的 P2 观感残留（远景底衬上沿水平直线）。

**要报已知条目，必须带来新证据（新复现命令 / 新受影响章节 / 新的量级测量），否则判为重复。**
