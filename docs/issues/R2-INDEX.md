# R2 工单索引（组长维护 · 唯一工单）

> 本文件是 R2「提问 → 解决 → 验收」流水线的唯一工单。任何人开工前先读：
> 本文件 → `docs/AGENT_WORKFLOW.md`（铁律与流程）→ `docs/SPEC.md`（硬性契约）
> → `docs/ENGINE_CONTRACT.md` → 相关分区的 `docs/issues/R2-*.md`（原始证据）。
> **ID 以本表为准**；分区文档的编号与本表冲突时以本表为准。

## 0. 本轮基线（组长实测 · 2026-10-15）

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

* **R1 尾部已经实际动工**：R1 结案（`60318cb`）之后，`R1-Q13` / `R1-Q14` 又各自有提交
  （`2558ae1` / `1199dc9` / `e507990`），并补了独立复核（`0ebff01`）与组长自校（`51c39fd`）。
  因此 **`docs/reviews/` 现在不是空的**，§6 已改写为实际状态。本轮开工前的在途改动
  （`art/scenes_river.js` 去重收尾）由组长代为落库，不再挂在工作区。

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
| R2-E?? | — | engine | *待第一组 engine 分区交稿*（号段 `R2-E01` 起） | 提问组在办 |
| R2-C01 | P1 | content | ch05/ch06/ch08/ch13/ch15/ch19 六章正文不足 3000 汉字（R1-Q05 暴露的既有欠账） | **已改（`e0b30a9`：61177 汉字、20 章全部 ≥3000），待第三组独立验收** |
| R2-V01 | **P0** | visual | R1-Q13 转结：9 张背景有未绘制地形的大块空洞，腊子口中央约 9.5% 透舞台底色、碉堡悬空（原稿 `docs/issues/R1-visual-b.md`） | **PASS**（`docs/reviews/R2-V01.md`；残留 1 条 P2 观感打磨，见 §9.4） |
| R2-V02 | P1 | visual | R1-Q14 转结：背景 id 有两份实现，`scenes.js` 静默覆盖地区分册（约 1.9 MB 死代码）（原稿 `docs/issues/R1-visual-b.md`） | **PASS + 机制已堵**（`docs/reviews/R2-V02.md`；空壳分册已删、`build-art.js` 已加"重复注册即失败"门禁，见 §9.1/§9.2） |

### 3.2 待派单的新条目

| ID | 严重度 | 分区 | 标题 | 状态 |
|---|---|---|---|---|
| R2-V0x（待编号） | P2 | visual | `R2-V01` 残留：新补的远景底衬上沿是一条水平直线，在腊子口这种"一线天"构图里像一道挡板；左右绝壁与岩体交界留下竖直硬边 | 待解决组认领（原证据见 `docs/reviews/R2-V01.md` §6） |

### 3.1 组长已复核的 V02 现状（给解决组/验收组的起点）

组长实测（`2026-10-15`，只读脚本枚举 `art/scenes*.js` 里的 `ART.scenes['id']`）：

```text
scenes.js  (17)  bg_council_hall … bg_yanan_cave
scenes_jiang.js  (9)   bg_yudu_night … bg_stretcher
scenes_river.js  (4)   bg_loushanguan bg_jinsha bg_yihai bg_dadu
scenes_meeting.js (0)  scenes_north.js (0)
--- 重复 id 数: 0 / 总 id 数: 30
```

且 `node tools/build-art.js --scenes` 重跑后 `git status --short` **只有 `art/scenes_river.js` 一行**
（30 张背景 + 30 张 CG 逐字节不变）—— 证明删掉的那份确实是"被覆盖的真相"，玩家可见产物零变化。

**残留**：`art/scenes_meeting.js`、`art/scenes_north.js` 以及另两个分册已成空壳
（只剩悬空的分节注释、无人调用的内部函数、过期的头注张数），`tools/build-art.js:37` 按
`^scenes.*\.js$` 通配加载它们。这属于 V02 的收尾，交给解决组。

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

## 6. 上一轮（R1）收口情况（按实际 git 历史更正）

* **已修复并推送**：Q05 / Q06 / Q07 / Q08 / Q09 / Q10 / Q11 / Q12 / Q15 共 9 条，
  提交区间 `2ecdd2d..f92ca39`。
* **R1 结案后继续推进的两条**：`R1-Q13`（→`R2-V01`）由 `2558ae1` + `1199dc9` 修复；
  `R1-Q14`（→`R2-V02`）由 `e507990` 修复；`art/scenes_river.js` 的最后一处重复由组长在
  本轮开工时代为落库。
* **验收覆盖（更正）**：`0ebff01` 是第三组对 Q09 / Q10 / Q11 / Q12 / Q15 的**独立复核**
  （5 条）；`51c39fd` 是**组长自校**（Q05 / Q06 / Q07 / Q08 / Q13 / Q14，6 条），
  并在 `docs/reviews/R1-SELF-CHECK.md` 里显式声明了"这不是独立验收"的缺口。
  → **本轮验收组要先对这 6 条做一次真正的独立复核**，再验 R2 新条目。
* **过程违规（已记账）**：g2_content 完成 Q05/Q08 的代码改动但没留修复记录，
  记录由组长按实际 diff 与实测输出补写（见对应文件末尾的「记录状态」小节）。

## 8. 本轮（R2）执行计划与认领（组长维护）

三段接力，每段收尾由组长提交并推送；**只有组长跑 git**。

| 阶段 | 承担 | 产物 | 号段/边界 |
|---|---|---|---|
| 第一段 · 提问 | 3 个 finder（engine / content / visual 各一） | `docs/issues/R2-engine.md`、`R2-content.md`、`R2-visual.md` | engine 用 `R2-E01…`；content `R2-C02…`；visual `R2-V03…`（`V01`/`V02` 已被占用） |
| 第二段 · 解决 | 按分区派 3 个 fixer | 源码/美术/剧本改动 + `docs/fixes/R2-<ID>.md` | 沿用 §4 分区，`tools/` 一次一人 |
| 第三段 · 验收 | 3 个 reviewer | `docs/reviews/R2-<ID>.md` | 先独立复核 R1 的 Q05..Q08/Q13/Q14 共 6 条，再验 R2 条目 |

**本轮必须结清的既有条目**：`R2-C01`（六章补正文）、`R2-V01`（独立验收）、
`R2-V02`（清空壳 + 独立验收）。

**边界提醒**：`R2-C01` 是"补内容"而不是"改口径"—— 不许为了凑字数把 `note:` 字段也算进正文，
也不许放宽 `tools/check.js` 的判据（那是改口径，要组长授权）。

## 9. 组长裁决与账目（R2 进行中）

### 9.1 解冻 `tools/build-art.js`（已授权，`982223a`）

`R2-V02` 的验收报告指出：删掉重复实现只是治了症状，`build-art.js` 仍按"root 最后加载、
同名以 root 为准"**静默**覆盖，下次再写重名 id 依然无声失效。该文件在 §5 里属冻结，
组长批准解冻**仅此一处**：逐文件比对 `ART.scenes/cg/ui/portraits` 的**注册值快照**，
同一 key 的注册值被第二个文件换掉即计入 `report.errors`，构建 `exit 1`。

### 9.2 删除 `art/scenes_meeting.js` / `art/scenes_north.js`（`412fc3f`）

两个文件在 `e507990` 之后注册数为 0（只剩悬空分节注释、无人调用的内部函数、过期头注）。
删除后 `node tools/build-art.js --all` 重烘焙，`git status --short` 对
`assets/generated/**` **零变化** —— 证明它们确实是死代码。`tools/_registry.js` 对缺失文件
有 `existsSync` 兜底，不需要连带改动。

### 9.3 门禁的第一次实现是错的（重要，写给以后复用这段的人）

第一版判据是"**某个 key 在加载本文件之前就已经存在**"，结果一次跑出 40 条误报：
`art/portraits.js` 在循环外被 `require` 过一次（`build-art.js:35`），循环里那次命中 Node
模块缓存、什么都没新增，于是它**全部 35 个 id** 都被判成"重复注册"。教训：重复注册
**不会改变 key 集合**，只改变 key 的**值**，所以必须比较值（`before[k][id] !== after[k][id]`）。
正确性用"撞名探针"验证过：在 `art/` 下临时放一个重注册 `bg_luding` 的文件 →
`node tools/build-art.js --scenes` 输出
`- 重复注册（后加载者静默覆盖先加载者）：scenes:bg_luding 被 scenes.js 重复注册`、
`exit 1`；删掉探针后 `exit 0`。

### 9.4 派单：V01 之外的观感残留（P2）

见 §3.2。`docs/reviews/R2-V01.md` §6 记录：新补的远景底衬上沿是一条水平直线，
在腊子口这种"一线天"构图里读起来像挡板；左右绝壁与岩体的交界留下竖直硬边。
建议改成有起伏的山脊线 + 一层更弱的雾。**这是独立于 `R2-V01` 结论的打磨项。**

### 9.5 署名更正（记账）

`docs/reviews/R2-V01.md` / `R2-V02.md` 的表头把**验收人**写成 `/root`。实际执笔是本轮
流水线第三组的验收 agent（与解决人 `c1_engine_code` 不同，独立性成立，这一点报告里
写对了），只是署名沿用了 `/root`。此处记账，后续验收报告请写实际执行者。

## 7. 下一轮候选（记录，不在本轮范围）

* `tools/e2e-steps.js` / `e2e-run.js` 在仓库根目录写 `_e2e_<pid>_<ts>.html` 且不清理
  （本轮仍靠 `.gitignore` 兜住，根因未修）。
* `src/engine/engine.js` 内置名册表的 `desc` 里仍有 ASCII 直引号（玩家看不到，
  因为图鉴取 `characters.js` 的 `bio`）。
* `docs/issues/R1-content.md` 附二 A/B/C/D 四条附带发现。
* `note` step 未写进 `docs/SPEC.md` §2.1，契约与实现不一致（需向组长申请动冻结文件）。
