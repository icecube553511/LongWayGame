# R2 工单索引（组长维护 · 唯一工单）

> 本文件是 R2「提问 → 解决 → 验收」流水线的唯一工单。任何人开工前先读：
> 本文件 → `docs/AGENT_WORKFLOW.md`（铁律与流程）→ `docs/SPEC.md`（硬性契约）
> → `docs/ENGINE_CONTRACT.md` → 相关分区的 `docs/issues/R2-*.md`（原始证据）。
> **ID 以本表为准**；分区文档的编号与本表冲突时以本表为准。

## 0. 本轮基线（截至 R1 收口）

* `node tools/check.js` **通过（exit 0）**：20 章 / 6569 步 / 59476 汉字 / 选项 60 / 档案 81 /
  背景 30-30 / 立绘 280-280。
* **7 条警告，其中 6 条是本轮必须处理的欠账**：

  ```
  · [src/story/ch05.js] 正文字数 2729（要求 ≥ 3000）
  · [src/story/ch06.js] 正文字数 2818（要求 ≥ 3000）
  · [src/story/ch08.js] 正文字数 2659（要求 ≥ 3000）
  · [src/story/ch13.js] 正文字数 2798（要求 ≥ 3000）
  · [src/story/ch15.js] 正文字数 2871（要求 ≥ 3000）
  · [src/story/ch19.js] 正文字数 2783（要求 ≥ 3000）
  · [全局] 未出场的角色（1）：narrator（既有豁免）
  ```

* **口径澄清（重要）**：SPEC §2 要求「每章正文 ≥3000 汉字」，而 `tools/check.js` 的
  `hanzi()` 只累计 `t ∈ say/narr/think/note` 的 **`text`**，不累计 `note:` 字段。
  R1-Q05 把 27 个沉默的 note 步改成对白属性后，这 6 章第一次显出真实欠账 ——
  改前 61043 里有 1567 字是玩家根本看不到的沉默小注。**这 6 章是内容缺口，必须补足。**

## 1. 远端与提交协议

* 仓库 `https://github.com/icecube553511/LongWayGame`，分支 `main`，远端 `origin`。
* **只有组长跑 git**；子 agent 一律不许执行 git 命令（避免多进程抢 `index.lock`）。
* 每条问题一个 commit：`audit(R2): …` / `fix(R2-Qxx): …` / `review(R2-Qxx): …` / `chore(R2): …`。
* 每阶段收尾 `git push origin main`；失败不许吞掉，要在回报里写明原因与 `git status`。

## 2. 三组分工

### 第一组 · 提问组（finder）

* 只写 `docs/issues/R2-<area>.md`（area ∈ `engine` / `content` / `visual`）。
* 每人最多 6 条，宁缺毋滥；每条必须自己先复现一遍，把命令与真实输出原文贴进证据。
* 号段由组长统一分配，子 agent 先留 `R2-Q??`。

### 第二组 · 解决组（fixer）

* 按本文件§3 的认领表干活，**只解决清单里的问题**；顺手发现写 `docs/fixes/R2-BACKLOG.md`。
* 每条问题一份 `docs/fixes/R2-<ID>.md`（改动 / 自检命令与真实输出 / 回归检查 / 未完成降级）。
* 改完必须自己跑：`node tools/check.js`、`node --check <改过的 js>`；涉及渲染加
  `node tools/e2e-run.js`；涉及全局行为加 `node tools/qa-consistency.js`。

### 第三组 · 验收组（reviewer）

* 只写 `docs/reviews/R2-<ID>.md`，判定必须是 `PASS` / `FAIL` / `PARTIAL` / `REJECT` 之一。
* **不信自述**：把修复记录里的命令原样重跑，贴自己的输出；做回归检查；主动找反例。
* 判 FAIL 要写清"还差什么"，这条会被原样退回第二组重做。

## 3. 问题总表与认领

| ID | 严重度 | 分区 | 标题 | 状态 |
|---|---|---|---|---|
| R2-Q?? | — | engine | *待第一组 engine 分区交稿* | 提问组在办 |
| R2-C01 | P1 | content | ch05/ch06/ch08/ch13/ch15/ch19 六章正文不足 3000 汉字（R1-Q05 暴露的既有欠账） | 待派单 |
| R2-V01 | **P0** | visual | R1-Q13 转结：9 张背景有未绘制地形的大块空洞，腊子口中央约 9.5% 透舞台底色、碉堡悬空 | 待派单（原稿见 `docs/issues/R1-visual-b.md`） |
| R2-V02 | P1 | visual | R1-Q14 转结：17 个背景 id 有两份实现，`scenes.js` 静默覆盖地区分册（约 1.9 MB 死代码） | 待派单（原稿见 `docs/issues/R1-visual-b.md`） |

## 4. 并行分区（同一阶段内互不越界）

| 分区 | 拥有文件 |
|---|---|
| `engine` | `index.html` `css/style.css` `src/engine/*.js` `src/data/*.js`(只读) `tools/` |
| `content` | `src/story/*.js` `src/story/manifest.js`(只读) `docs/*.md`(非冻结) |
| `visual` | `art/*.js`（其中 `art/scenes*.js` 全部归一人所有，避免并行互相覆盖）、`assets/generated/**` |

`tools/` 一次只允许一个 agent 动，动之前先在本文件登记。

## 5. 冻结文件（不得修改，需向组长申请）

`docs/SPEC.md`、`docs/STORY_BIBLE.md`、`docs/AGENT_BRIEF.md`、`docs/AGENT_WORKFLOW.md`、
`art/geosvg.js`、`art/palette.js`、`src/data/characters.js`、`src/data/backgrounds.js`、
`src/story/manifest.js`、`tools/build-art.js`、`tools/qa-shot.js`。

## 6. 上一轮（R1）收口情况

* **已修复并推送**：Q05 / Q06 / Q07 / Q08 / Q09 / Q10 / Q11 / Q12 / Q15 共 9 条，
  提交区间 `2ecdd2d..f92ca39`，已 `git push origin main`（`90bf4d3..f92ca39`）。
* **本轮零改动、转结到 R2**：`R1-Q13`（P0，美术）、`R1-Q14`（P1，美术）→ 见§3 的 `R2-V01`/`R2-V02`。
* **未验收**：R1 的 9 条修复**从未经第三组独立验收**（`docs/reviews/` 为空）。
  本轮的验收组要**先补验这 9 条**，再验 R2 的新条目。
* **过程违规（已记账）**：g2_content 完成 Q05/Q08 的代码改动但没留修复记录，
  记录由组长按实际 diff 与实测输出补写（见对应文件末尾的「记录状态」小节）。

## 7. 下一轮候选（记录，不在本轮范围）

* `tools/e2e-steps.js` / `e2e-run.js` 在仓库根目录写 `_e2e_<pid>_<ts>.html` 且不清理
  （本轮仍靠 `.gitignore` 兜住，根因未修）。
* `src/engine/engine.js` 内置名册表的 `desc` 里仍有 ASCII 直引号（玩家看不到，
  因为图鉴取 `characters.js` 的 `bio`）。
* `docs/issues/R1-content.md` 附二 A/B/C/D 四条附带发现。
* `note` step 未写进 `docs/SPEC.md` §2.1，契约与实现不一致（需向组长申请动冻结文件）。
