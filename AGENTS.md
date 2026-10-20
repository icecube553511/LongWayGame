# AGENTS.md —— 在本仓库工作的 agent 必读

《长征 · 万水千山》：二十章视觉小说。**零构建、零依赖、零网络**，双击 `index.html` 即可运行。
本文件是**入口契约**（谁进来都先看这里）；细节以 `docs/` 下的规范为准，冲突时以更专的那一份为准。

## 1. 开工前按顺序读完

| 顺序 | 文件 | 为什么 |
|---|---|---|
| 1 | `docs/SPEC.md` | **唯一契约来源**：目录、剧本 DSL、id 表、验收规则 |
| 2 | `docs/PRODUCTION_SPEC.md` | **制作规范总纲**：资产怎么造、怎么审、怎么收口（本文件 §3 的展开） |
| 3 | `docs/AGENT_BRIEF.md` | 目录所有权（谁拥有哪个文件）+ GEO 速查 |
| 4 | 按任务再读 | `docs/ART_DIRECTION.md`（美术总纲）· `docs/STORY_BIBLE.md`（史实与人物）· `docs/STORY_BRIEF.md`（写剧本的）· `docs/CG_DESIGN.md`（重要事件插画）· `docs/BG_DESIGN.md`（场景背景位图）· `docs/ENGINE_CONTRACT.md`（引擎） |

## 2. 铁律（违反即整轮作废）

1. **只写自己名下的文件。** 需要别人文件的改动 → 发消息给该 owner 或 `/root`，不要自己动。
2. **零构建、零依赖、零网络。** `file://` 双击可运行；禁止 ES Module、`fetch()`、CDN、外部字体、外部图片。
3. **全中文**：游戏文本、注释、文档、commit message 用简体中文（代码标识符用英文）。
4. **不允许任何 JS 报错。** 缺图必须静默降级（引擎对背景/立绘/插画都有候选回退链）。
5. **冻结文件不得改**：`docs/SPEC.md`、`docs/PRODUCTION_SPEC.md`、`docs/ART_DIRECTION.md`、
   `docs/STORY_BIBLE.md`、`docs/AGENT_BRIEF.md`、`art/geosvg.js`、`art/palette.js`、
   `src/data/characters.js`、`src/data/backgrounds.js`、`src/data/cg.js`、`src/data/bgart.js`、
   `src/story/manifest.js`、`tools/build-art.js`。要改 → 找 `/root`。
6. **素材必须走既定管线**（出图 → 烘焙 → 引擎候选回退），不许手工塞图、不许改 `assets/generated/**` 的字节。
7. **体积必须过档**（见 `docs/PRODUCTION_SPEC.md` §3）；超档要重新烘焙或让生成端出更平的画面，不是删画面里的东西。
8. **改完必须自己跑闸门**（§3），不许把兜底丢给别人；报「已验证」必须附真实输出。
9. **每一次改动都要提交并推送到远端**（用户 2026-07 之后立的长期规则）—— 见 `PRODUCTION_SPEC.md` §9。
10. **自评不算验收。** 判定档位与「可执行修正句」的要求见 `PRODUCTION_SPEC.md` §7。

## 3. 交付前必跑

```powershell
node tools/check.js                        # 总闸门：20 章 + id 表 + 资源齐备 + 位图完整 + 死链
node tools/check-assets.js                 # 制作规范闸门：规范文件与引用齐备、群众印章变体够、无重复登记
node tools/build-portrait-states.js --check # 角色剧情造型清单与运行时表一致
node tools/lint-story.js src/story/chNN.js # 改过剧本就跑（0 错 0 警）
node tools/validate-svg.js                 # 改了 art/ 或烘焙字跑
python tools/check-portrait-key.py         # 改了立绘/抠底/烘焙后跑（洋红残留）
python tools/qc-portraits.py               # 表情与同状态 calm 的轮廓/身体一致性质检
node tools/e2e-run.js                      # 全剧自动通关（必须 0 条 JS 报错）
node tools/qa-consistency.js               # 改了剧本/背景时跑（舞台一致性）
```

再按你动过的东西补跑一条：

| 动过什么 | 追加一条 |
|---|---|
| 出图 / 烘焙参数 | `docs/ART_DIRECTION.md` §4 的体积自检（末行必须是 `超过本档上限的文件数 = 0`） |
| 背景 / 立绘 / 插画素材 | `node tools/shot-one.js …` 或 `python tools/cg-sheet.py tmp/x.jpg` 出图肉眼核对 |
| 剧本里的一步（cg / bg / 选项） | `node tools/e2e-steps.js <名字> '<章>|autoPick:1|until:…'` 实拍那一拍 |

## 4. 拿不准的时候

契约、id 表、冻结文件、分支与推送 —— 一律发消息给 `/root`，**不要自己改契约、不要自己改别人的文件**。
历史上吃过的亏（越界改文件、按时间窗批量杀进程误伤同伴、自评当验收）在
`docs/PRODUCTION_SPEC.md` §10 逐条记着，看一眼能省一轮返工。
