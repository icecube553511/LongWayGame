# R2 工单索引（组长维护 · 唯一工单）

> 本文件是 R2「提问 → 解决 → 验收」流水线的唯一工单。任何人开工前先读：
> 本文件 → `docs/AGENT_WORKFLOW.md`（铁律与流程）→ `docs/SPEC.md`（硬性契约）
> → `docs/ENGINE_CONTRACT.md` → 相关分区的 `docs/issues/R2-*.md`（原始证据）。
> **ID 以本表为准**；分区文档的编号与本表冲突时以本表为准。

## 0. 本轮基线（组长实测 · 2026-10-15 19:50 复测）

* `node tools/check.js` **通过（exit 0）**：20 章 / 6642 步 / 61177 汉字 / 选项 60 / 档案 81 /
  背景 30-30 / 立绘 280-280。
* **警告只剩 1 条**（既有豁免）：

  ```
  · [全局] 未出场的角色（1）：narrator
  ```

* **开工基线（19:05 首测，已过时，留档对比）**：6569 步 / 59476 汉字，外加 6 条正文
  字数＜3000 的警告（ch05 2729 / ch06 2818 / ch08 2659 / ch13 2798 / ch15 2871 / ch19 2783）。
  这 6 条已由 `e0b30a9` 补足（`R2-C01`），复测 20 章全部 ≥3000。

* **口径澄清（重要）**：SPEC §2 要求「每章正文 ≥3000 汉字」，而 `tools/check.js` 的
  `hanzi()` 只累计 `t ∈ say/narr/think/note` 的 **`text`**，不累计 `note:` 字段。
  R1-Q05 把 27 个沉默的 note 步改成对白属性后，这 6 章第一次显出真实欠账 ——
  改前 61043 里有 1567 字是玩家根本看不到的沉默小注。**这 6 章是内容缺口，必须补足。**
  → 已于 `e0b30a9` 补足；`note:` 不计入正文这条口径**没有**被放宽（见 §8 边界提醒）。

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
| R2-E01 | P1 | engine | 读档步号不夹取：越界存档静默打断游戏（帧表清空 + 弹覆盖层 + 0 报错） | **已修（`fe75906`），待第三组独立验收** |
| R2-E02 | P1 | engine | 20 章剧本被加载并执行两遍（静态标签 20 + `boot()` 注入 20 = 40 个 script 标签） | **已修（`074faa3`），待第三组独立验收** |
| R2-E03 | P2 | engine | `Tab` 键与 SPEC §6.2 不符（文档写「状态」，实现打开「设置」） | **待解决 · 组长已裁决走「文档对齐实现」，见 §9.7** |
| R2-E04 | P2 | engine | SPEC §6 承诺的 `VN.save(slot)` / `VN.load(slot)` / `VN.slots()` 不存在 | **待解决 · 组长已裁决走「文档对齐实现」，见 §9.8** |
| R2-E05 | P2 | engine | `tools/e2e-run.js` 非法参数不校验，把章节误判成「不合格」 | **解决组在办（`g2_fixer_tools`，占用 `tools/`）** |
| R2-E06 | P2 | engine | 探针在仓库根目录写 `_e2e_*.html`，被中断时残留 | **解决组在办（同上，与 E05 同属 `tools/`）** |
| R2-C01 | P1 | content | ch05/ch06/ch08/ch13/ch15/ch19 六章正文不足 3000 汉字（R1-Q05 暴露的既有欠账） | **已改（`e0b30a9`：61177 汉字、20 章全部 ≥3000），待第三组独立验收** |
| R2-V01 | **P0** | visual | R1-Q13 转结：9 张背景有未绘制地形的大块空洞，腊子口中央约 9.5% 透舞台底色、碉堡悬空（原稿 `docs/issues/R1-visual-b.md`） | **PASS**（`docs/reviews/R2-V01.md`；残留 1 条 P2 观感打磨，见 §9.4） |
| R2-V02 | P1 | visual | R1-Q14 转结：背景 id 有两份实现，`scenes.js` 静默覆盖地区分册（约 1.9 MB 死代码）（原稿 `docs/issues/R1-visual-b.md`） | **PASS + 机制已堵**（`docs/reviews/R2-V02.md`；空壳分册已删、`build-art.js` 已加"重复注册即失败"门禁，见 §9.1/§9.2） |

### 3.2 待派单的新条目

| ID | 严重度 | 分区 | 标题 | 状态 |
|---|---|---|---|---|
| **R2-V03** | P2 | visual | `R2-V01` 残留：新补的远景底衬上沿是一条水平直线，在腊子口这种"一线天"构图里像一道挡板；左右绝壁与岩体交界留下竖直硬边 | 待解决组认领（原证据见 `docs/reviews/R2-V01.md` §6；组长已编号 `R2-V03`，见 §9.9） |

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
  → **本条欠账已结清**（第三组补做，组长据 `git log` 记账）：`a3b8e7e` 独立复核
  Q05/Q06/Q07/Q08；`0ebff01` 独立复核 Q09/Q10/Q11/Q12/Q15；Q13/Q14 的独立验收
  由 `R2-V01`（PASS）/`R2-V02`（PASS）承担。R1 的 11 条至此各有独立判定。
* **过程违规（已记账）**：g2_content 完成 Q05/Q08 的代码改动但没留修复记录，
  记录由组长按实际 diff 与实测输出补写（见对应文件末尾的「记录状态」小节）。

## 8. 本轮（R2）执行计划与认领（组长维护）

三段接力，每段收尾由组长提交并推送；**只有组长跑 git**。

| 阶段 | 承担 | 产物 | 号段/边界 |
|---|---|---|---|
| 第一段 · 提问 | 3 个 finder（engine / content / visual 各一） | `docs/issues/R2-engine.md`、`R2-content.md`、`R2-visual.md` | engine 用 `R2-E01…`；content `R2-C02…`；visual `R2-V03…`（`V01`/`V02` 已被占用） |
| 第二段 · 解决 | 按分区派 3 个 fixer | 源码/美术/剧本改动 + `docs/fixes/R2-<ID>.md` | 沿用 §4 分区，`tools/` 一次一人 |
| 第三段 · 验收 | 3 个 reviewer | `docs/reviews/R2-<ID>.md` | 先独立复核 R1 的 Q05..Q08/Q13/Q14 共 6 条，再验 R2 条目 |

**实况（2026-10-15 19:50 更新）**：

* **第一段**：engine 已交稿（`0ed1353`，`R2-E01…R2-E06`）；**content / visual 两稿尚未产出**。
* **第二段**：`R2-C01`（`e0b30a9`）、`R2-E01`（`fe75906`）、`R2-E02`（`074faa3`）已落库；
  `R2-E05`/`R2-E06` 由在途 `g2_fixer_tools` 在办；`R2-E03`/`R2-E04` 组长已裁决（§9.7/§9.8）。
* **第三段**：`R2-V01` / `R2-V02` 已 PASS；`R2-C01` 的独立验收由在途 `g3_c01_review` 在办。
* 号段：content `R2-C02…`、visual `R2-V04…`（`V03` 已拨给 V01 残留）、engine 追加 `R2-E07…`。

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

### 9.6 过程违规：在途 agent 越权改了冻结的 `docs/AGENT_WORKFLOW.md`（root 追认）

`19:05:11` 有在途 agent 直接改了 `docs/AGENT_WORKFLOW.md` 顶部那段"R1 实况"。
按 `AGENT_WORKFLOW.md` 开头的规矩，该文件**任何 agent 不得修改**、只有 `/root` 能改。
root 核对了改动内容（原句"engine / content 分区因消息投递故障未交稿"在写下时已经过时，
content 稿随后落盘；`R1-content.md` / `R1-visual.md` / `R1-visual-b.md` 共 11 条
`R1-Q05`–`R1-Q15`，engine 号段 `Q01–Q04` 确实空缺），**结论属实、予以追认**，
由 root 代为提交。但过程违规记账：**改冻结文件必须先发给 `/root`**，不允许自行落盘。

### 9.7 裁决 `R2-E03`：走「文档对齐实现」（授权改冻结的 `docs/SPEC.md` §6.2）

提问稿给了两条路（做状态面板 / 改文档）。组长选**改文档**，依据是可以机械复核的三条事实：

1. `git log -S "case 'Tab'" -- src/engine/engine.js` **只命中初始提交** `9ab139f`
   —— 实现从第一版起就是 `Tab → 设置`，历史上从来没有过状态面板，这不是回归。
2. SPEC §6.1「必须实现的界面」列了 8 条，**没有一条是状态面板**；第 2 条已经把
   「右上角状态（士气/信任/信念 三个数值条）」定义为**常驻 HUD**，即文档里「状态」的
   所指本来就一直可见。
3. `index.html:75-80` 的快捷条 6 个 `data-act` 里没有 `status`，全局没有第二处入口。

**授权边界**：只准改 §6.2 那一行的 `Tab` 项（改成「设置」并注明三项数值常驻右上角），
不许顺手动 SPEC 别处；**不新增 UI**。真要独立状态面板（含已解锁档案/插画计数）另开工单，
不占本轮额度。

### 9.8 裁决 `R2-E04`：同样走「文档对齐实现」（授权改冻结的 `docs/SPEC.md` §6）

SPEC §6 那行字面错误：`VN.save(slot)` 与 `VN.save` 作为对象**在 JS 里不可能同时成立**。
实测 `rg -n "VN\.load\b|VN\.slots" src tools` **零命中**，而 `src/engine/save.js:45`
把 `VN.save` 定义成对象。故裁决：把这行改成真实形态
（`VN.save.writeSlot(n)` / `VN.save.readSlot(n)` / `VN.save.listSlots()` 与
`VN.doSave(n)` / `VN.doLoad(obj)`）。

**不许**为了凑契约去新增 `VN.load` / `VN.slots` 包装：当前没有任何调用方，
那是无人需要的 API 表面。`docs/ENGINE_CONTRACT.md` §3 写的是真实形态，**不要动它**。

### 9.9 号段分配（组长）

* content 提问：`R2-C02` 起；visual 提问：`R2-V04` 起。
* `R2-V03` 拨给 §3.2 的 `R2-V01` 残留打磨（P2，已有原证据，不再走提问组）。
* engine 若再加一条提问线：`R2-E07` 起。

### 9.10 在途子 agent 与分区占用（组长记账，避免下一波撞车）

本文件更新时在途 4 个 agent：

| agent | 任务 | 占用 |
|---|---|---|
| `g3_c01_review` | `R2-C01` 独立验收 | `docs/reviews/R2-C01.md` |
| `g2_fixer_tools` | `R2-E05` / `R2-E06` | **`tools/` 独占**（§4 规定一次一人） |
| `g3_verifier2` | 对上述修复的独立复核 | `docs/reviews/R2-E05.md`、`R2-E06.md`（候选） |

**结论**：下一波开工时 `tools/` 视为被占；`src/engine/engine.js` 已由 `E02` 收尾、
工作树干净，可由 engine 解决组接手 `R2-E03` / `R2-E04` 的文档修订。

## 7. 下一轮候选（记录，不在本轮范围）

* `tools/e2e-steps.js` / `e2e-run.js` 在仓库根目录写 `_e2e_<pid>_<ts>.html` 且不清理
  （本轮仍靠 `.gitignore` 兜住，根因未修）。
* `src/engine/engine.js` 内置名册表的 `desc` 里仍有 ASCII 直引号（玩家看不到，
  因为图鉴取 `characters.js` 的 `bio`）。
* `docs/issues/R1-content.md` 附二 A/B/C/D 四条附带发现。
* `note` step 未写进 `docs/SPEC.md` §2.1，契约与实现不一致（需向组长申请动冻结文件）。
