# 评审组 A 报告（ch01–ch07，8 张）

> **执行者声明（必须如实写在最前面）**：这一批**不是独立评审 agent 判的**，是 `/root` 自己判的。
> 原因：为这一批派出的评审 agent（`cg_rev_batch_a`）**四次都没收到任务文本**（启动消息与
> follow-up 都空投），它只能做只读盘点、无法开工；同一时刻 `cg_rev_batch_b` / `cg_rev_batch_c`
> 收到了任务并在跑。也就是说这是本轮的**投递故障**，不是判据问题。
> 因此本报告的独立性弱于 B/C 两份：判定者与被判者同属 `/root`。请把它当作
> 「自校 + 逐张证据」，而不是「独立验收」。

## 判据与方法

判据同 `tmp/cg/BRIEF-rev-batch.md`：美术六条红线 + 图文一致 + 图注文字 + 落点 + 裁切安全。
取证用缩图 `tmp/cg/thumb/<id>.png`（宽 640），并对照 `src/data/cg.js` 的
`caption` / `must` / `prompt_cn` 与 `tmp/cg/EVENTS.md` 的落点。
另有一次真浏览器实拍：`node tools/e2e-steps.js rev-cg-ch01 '…until:VN.state.blockKind==="cg"|wait:2500'`
→ `tmp/e2e/rev-cg-ch01.png`（0 条 JS 报错，插画确实在屏上，图注逐字打出）。

## 逐张

| id | 判定 | 红线 1–6 | 图文一致 | 裁切 | 备注与可执行修法 |
|---|---|---|---|---|---|
| `cg_yudu_night` | PASS | ✓✓✓✓✓✓ | ✓ 五座浮桥、不点火把、近岸乡亲，与「河上没有一支火把」一致 | 安全 | 00:52 重出后的版本（旧试片画了火把，已淘汰） |
| `cg_blockade` | PASS | ✓✓✓✓✓✓ | ✓ 碉堡连碉堡 + 铁丝网 + 探照灯，与「队伍还是从口子里挤了过去」一致 | 安全 | 可考虑用 `--extra` 把探照灯光锥再压暗一档（P2，非必须） |
| `cg_xiangjiang_day` | PASS | ✓✓✓✓✓✓ | ✓ 浮桥、舟、驮马、远处硝烟，与「江面上架起了浮桥」一致 | 安全 | — |
| `cg_xiangjiang_night` | PASS | ✓✓✓✓~✓✓ | ✓ 对岸火场、江面倒影、队伍不停，与「水是红的。没有人停。」一致 | 安全 | **唯一的擦边项**：对岸火光偏亮偏橙（契约要求「暗红」而非高饱和橙）。若要收紧：`--extra "dull the burning village to a deep brick red #a33a2e, kill the bright orange highlight on the water"`。属打磨，不属缺陷 |
| `cg_tongdao` | PASS | ✓✓✓✓✓~✓ | ✓ 两张地图摊在同一张桌子上，与图注逐字对应 | 安全 | 四人面部属中近景（**是普通红军战士，不是可辨认的历史人物**），按红线 6 的字面不构成违规；若想更保守可 `--extra "pull the camera back, keep the faces small and in shadow"` |
| `cg_liping` | PASS | ✓✓✓✓✓~✓ | ✓ 火塘、桌上纸、围坐争论，与「路要往哪边走，得当面说出来」一致 | 安全 | 同上（五人中近景）；画面本身是本批最有「会」味的一张 |
| `cg_houchang` | PASS | ✓✓✓✓✓✓ | ✓ 雪、红灯笼、地上爆竹红屑、大铜锅，与「过了年，就过江」一致；铜锅这一贯穿意象被画对 | 安全 | — |
| `cg_zunyi` | PASS | ✓✓✓✓✓✓ | ✓ 红漆木楼回廊、楼上宣读者、楼下群像，与「楼上散了会，楼下的人都在等」一致 | 安全 | 本轮质量最高的一张：块面、光照、叙事三处都到位 |

**统计：PASS 8 / FAIL 0 / PARTIAL 0。**（两条擦边（`cg_xiangjiang_night` 的火光饱和、
`cg_tongdao`/`cg_liping` 的中近景人脸）在字面判据下都不构成红线违反，记为打磨项。）

## 跨批一致性

与 `tmp/cg/sheet-small.jpg` 上其它批对照：本批 8 张**没有明显掉队的一张**。
`cg_xiangjiang_night` 的火光、`cg_houchang` 的灯笼红是本批仅有的两处高饱和色块，
但都属场景必需（火 / 年），不是画风跑偏。
已知的代差（`tmp/cg/PROVENANCE.md`）在本批表现为：
`cg_tongdao` / `cg_liping` / `cg_houchang` / `cg_zunyi`（旧世代）与
`cg_yudu_night`（00:52 重出，新世代）同屏时，**前者的材质细节更碎**（砖、木纹、衣褶的碎面更多），
后者更「整块」。这属代差而非个体缺陷。

## 最该先返工的 3 张

1. `cg_xiangjiang_night`（若有预算）：收火光的饱和度（见上表修法）。玩家在 ch03 的第二个 CG，
   高饱和橙在这套低饱和美术里最容易「跳出来」。
2. `cg_tongdao`、3. `cg_liping`：**只在「红线 6 从严解释」时才需要动**（把镜头拉远、脸压暗）。
   按合同字面不必动。

除以上三项，本批**不需要返工**。

## 我没做/拿不准的

- 本报告没有 B/C 那样的独立性（见开头声明）。
- 逐张只看了 640 宽的缩图 + 一张真浏览器实拍；`cg_blockade` 的暗部细节、`cg_tongdao` 的
  窗棂细节没有放大核对（缩图上未见异常，故未展开）。
- 落点是否「该章真正的高点」我按 `tmp/cg/EVENTS.md` 的下标与邻步原文判的，未逐章通读全文。
