# CG 插画评审报告（`/root` 自评 · **不是独立评审**）

> 作者：`/root`。判据：`docs/CG_DESIGN.md` §3/§4（规格 + 六条红线）、`docs/SPEC.md` §2.1/§8、
> `docs/ART_DIRECTION.md` §3、`src/data/cg.js`、`docs/STORY_BIBLE.md`、`tmp/cg/EVENTS.md`。
> 覆盖：**全部 30 张**（24 P0 + 6 P1），逐张给了判定。

## 0. 为什么这份报告是 `/root` 自己写的（如实记账）

本轮原定由三个评审 agent 分批判（A=ch01–07 / B=ch08–14 / C=ch15–20，任务书
`tmp/cg/BRIEF-rev-batch.md`）。**任务书三次都没送到**：

| 时刻 | 动作 | 结果 |
|---|---|---|
| 01:0x | `followup_task` → `cg_rev_batch_a/_b/_c`（两两并发的第一次还发生了目标串号，报 `not found`） | 三个 agent 各自的终答都是「没有收到任务」 |
| 01:1x | `interrupt_agent` + 重发（a 被成功唤醒：completed → running → completed） | 唤醒成功了，**但 payload 仍没进它的上下文**（它回的仍是「no task has been sent yet」） |
| 01:2x | 一条**两行**的短消息投给 `cg_rev_batch_b` | 毫无反应，b / c 从未执行过 turn |

结论：**本会话里子 agent 的 payload 投递是坏的**（能触发 turn，但消息体到不了）。
这与 `docs/ROUNDS.md` 里 `cg_rev_story`「两次没收到任务文本」是同一个故障。
为了不把这一轮卡死，`/root` 自己把 30 张判完了 —— 但**自评不等于独立验收**
（`docs/reviews/R1-SELF-CHECK.md` 立的规矩）。**本报告应当被当成「返工单草稿」+「独立评审的对照物」**，
不是本轮的验收结论；投递恢复后仍需独立评审复判（至少要复判 §4 的三张）。

## 0.1 一条方法论教训（必须先说，它改变了我第一遍的结论）

**缩图不能用来判「块面」这条红线。** 我第一遍用 640 宽的 `tmp/cg/thumb/*.png` 扫全套，把
`cg_yudu_night`、`cg_xiangjiang_day`、`cg_chishui_first`、`cg_yudu_return`、`cg_jinsha`
都判成「写实 / 连续渐变」。逐张按**原生分辨率裁剪**复核后**全部推翻** ——
水面、火焰、崖壁都是可见的多边形面，是缩图把面边界抹平了。

「别把 1.4 MB 原图塞进对话」（怕 413）与「缩图判不了风格」这对矛盾，可执行的解法是**裁剪**：

```powershell
python -c "from PIL import Image; Image.open('assets/generated/cg/cg_yudu_night.png').convert('RGB').crop((600,380,1500,780)).save('tmp/cg/probe/x.png')"
```

一次 600–900 px 见方的局部，既保真（面与面之间的明度差看得清）又不撑上下文。
**建议把这条写进 `BRIEF-rev-batch.md` §3。** 本报告里标了 native 的结论做了这个复核，
没标的只在「构图层」成立。

## 1. 一句话总论

**这 30 张是能给玩家看的，整体立得住** —— 块面、配色、史实装具、景深层次都对得上已经验收的
174 张立绘与 30 张程序化背景，没有出现「一眼 AI 味」的构图灾难；**但 2 张必须返工**
（`cg_xiaoman_horn` 破红线 6 且与人物成长线矛盾、`cg_luding_race` 铁索数对不上图注与史实），
另有 7 张属于「可用但明显可改」。**不建议按世代整批重出**（见 §3）。

## 2. 逐张判定

判定：`PASS` / `FAIL`（破红线或图文、史实矛盾）/ `PARTIAL`（可用但有明确可改点）。
「红线」列按 `docs/CG_DESIGN.md` §4 的 1–6 顺序，只标**不通过**的那几条；`—` 表示六条全过。

### 批次 A · ch01–ch07（11 张）

| id | 判定 | 红线 | 图文一致 | 图注 | 落点 | 修法（可直接执行） |
|---|---|---|---|---|---|---|
| `cg_yudu_night` | PASS | — | ✓ 五座门板浮桥、成列过河、近岸乡亲、无火把 | ✓ 与正文/史实一致 | ✓ ch01 steps[198] | 不动 |
| `cg_blockade` | PASS | — | ✓ 碉堡链 + 铁丝网缺口 + 探照灯锥 | ✓ | ✓ | 不动（本批块面最好的一张） |
| `cg_xiangjiang_day` | PASS | — | ✓ 长浮桥 + 骡马担架辎重 + 低云 | ✓ 十一月二十七日 ✓ | ✓ | 不动（native：水面是分面） |
| `cg_xiangjiang_night` | PASS | — | ✓ 对岸在烧、水面克制暗红、队伍未停 | ✓ | ✓ | 火色略艳（红线 4 边缘），要压一档：`--extra "desaturate the fire, keep the water red restrained and flat-faceted"` |
| `cg_tongdao` | PASS | — | ✓ 两张叠放地图 + 火塘 + 窗外冬雨 + 院中锅 | ✓ | ✓ | 四张近景脸偏大、与立绘语言重复（软，见 §6） |
| `cg_liping` | PASS | — | ✓ 火塘 + 隔桌对坐 + 门外吊脚楼冷雨 | ✓ | ✓ | 不动（native：火焰是三角形分面，草鞋/绑腿可见） |
| `cg_houchang` | PASS | — | ✓ 雪院 + 爆竹红屑 + 红联 + 灯笼 + 大锅 + 排队 | ✓ 一九三五年一月一日 ✓ | ✓ | 不动 |
| `cg_zunyi` | PASS | — | ✓ 红漆回廊 + 廊上念决议 + 天井仰头人群 + 炭盆 | ✓ | ✓ | 不动 |
| `cg_guo_daniang_door` | PARTIAL | — | ⚠ 门板、乡亲、香樟、在建浮桥都在，但**图注「架起五座浮桥」画面只见一座在建** | ⚠ 建议改「各家各户拆下门板，往河边去。」 | ✓（插在「她抱着一块门板…」之后，顺） | 改图注；另见 §6（贴左边框） |
| `cg_xiaoman_horn` | **FAIL** | **6**（大特写正脸；native：`tmp/cg/probe/cg_xiaoman_horn-face.png`） | ✗ **画面在「吹响」，而图注写「举起来」、紧接着正文写他挂上肩、贴嘴，并立誓「下一次一定要吹响」** | ✗ 与 `STORY_BIBLE` 人物表矛盾：「于都出发时连号都吹不响；娄山关上第一次吹响冲锋号」 | ⚠ 落在「队伍往西走。走到中午，太阳出来了。」之后，而背景仍是夜渡的五座浮桥 | **重出**（见 §4.1） |
| `cg_stretcher` | PASS | — | ✓ 两副担架相隔几步 + 王稼祥腹部缠布 + 后一副毯子露一只手 + 竹林 + 湿径 | ✓ | ✓（正文是明确闪回，顺） | 不动；体积 1534 KB 贴顶，见 §7 |

### 批次 B · ch08–ch14（8 张）

| id | 判定 | 红线 | 图文一致 | 图注 | 落点 | 修法 |
|---|---|---|---|---|---|---|
| `cg_tucheng` | PASS | — | ✓ 土墙弹痕 + 硝烟 + 乡亲抬门板 + 伤员 + 贴墙战士 | ✓ | ✓（在 P0 的 `cg_chishui_first` 之前，时序对） | 不动（伤员胸前白包扎 + 一点血迹是克制的，未越 `AVOID_BASE` 的 gore） |
| `cg_chishui_first` | PASS | — | ✓ 雨中门板浮桥 + 红褐急流 + 拆桥 + 无火把 | ✓ | ✓ | 不动（native：河水是分面，非写实） |
| `cg_zhaxi` | PASS | — | ✓ 反向过河 + 近景背铜号的小兵 + 石头上的空箱 + 崖顶阳光 | ✓ 一月西 / 二月东 ✓ | ✓ | 光源在右上，与「统一左上」不符（软）；块面本身好 |
| `cg_loushanguan` | PASS | — | ✓ 石峰云海 + 隘口破阶 + 岩上红旗 + 松 + 夕阳只照峰顶 | ✓ | ✓ | 夕色偏暖艳（红线 4 边缘）；天空已是分面条带（native） |
| `cg_chishui_fourth` | PASS | — | ✓ 河道折回 + 两座浮桥 + 小兵在铜号上刻痕 | ✓ | ✓ | 不动 |
| `cg_jinsha` | PARTIAL | — | ⚠ **图注「七条木船」画面只数得出 4 条清楚的**，右缘另有 1–2 条被裁（`tmp/cg/probe/cg_jinsha-boats.png`） | ✓ 与史实一致（七条船 / 三十六名船工 / 9 天 9 夜） | ✓ | `--extra "seven small wooden boats clearly visible mid-river, none clipped by the frame edges"` |
| `cg_yihai` | PARTIAL | — | ✓ 静湖 + 两人共一碗酒 + 深蓝毡 cloak / 黑包头 + 火把倒影 + 远处围观 | ✓ | ✓ | 两个主体人在近景对坐，脸偏大且占画面中心 → `--extra "push the two kneeling figures further back, faces small and shadowed"` |
| `cg_dadu` | PASS | — | ✓ 白浪 + 满载十七人的小船 + 三脚机枪 + 远岸碉堡 | ✓ 一条船 / 十七人（与正文一致） | ✓ | 迫击炮被下边框切到（软，见 §6） |

### 批次 C · ch15–ch20（11 张）

| id | 判定 | 红线 | 图文一致 | 图注 | 落点 | 修法 |
|---|---|---|---|---|---|---|
| `cg_luding_race` | **FAIL** | — | ✗ **图注「十三根铁索」，画面可数到约 9 根**（三处独立裁剪分别数到 9、9–11、5+若干；`tmp/cg/probe/cg_luding_race-mid.png`） | ✓ 十三根（与 `STORY_BIBLE` 第 118 行一致）→ 是**画面**错了 | ✓ ch15 steps[132] | **重出**（见 §4.2） |
| `cg_luding_bridge` | PASS | — | ✓ 燃烧桥楼 + 索上匍匐 + 落进峡谷的燃板 + 谷底白浪 | ✓ | ✓ | 火色偏艳（红线 4 边缘） |
| `cg_snow_mountain` | PASS | — | ✓ 雪脊一线单行 + 云吞队首 + 尾部暗松 + 玛尼堆与枯草 + 近单色 | ✓ 四千余米 ✓ | ✓ | 不动（本批最稳的一张） |
| `cg_maogong` | PARTIAL | — | ✓ 两列同式灰单衣相遇 + 倒盐进掌心 + 铁索装具 | ✓ | ✓ | 两个近景人物脸偏大、身体被左右边框裁掉；**草鞋在底边被画框压住**（native：草鞋确实画了，但贴着金线）→ `--extra "pull the two foreground figures fully inside the frame, keep their straw sandals clear of the bottom edge; faces smaller and shadowed"` |
| `cg_grassland` | PARTIAL | — | ✓ 无树沼泽 + 一线单行 + 陷膝者 + 递布条 | ✓ | ✓ | 远景与天空偏柔、块面弱于同批：`--extra "carry the faceted treatment into the far marsh and the low sky, remove the smooth gradient"` |
| `cg_lazikou` | PASS | — | ✓ 一线天 + 白色溪流 + 木桥 + 挡谷碉堡 + 崖上攀爬 | ✓ | ✓ | 不动 |
| `cg_wuqi` | PARTIAL | **5 / 3**（墙上标语**字形可辨是汉字**，与本条 `avoid: readable characters on the wall` 及 `AVOID_BASE` 的 text / chinese characters 冲突；native：`tmp/cg/probe/cg_wuqi-wall.png`） | ⚠ 图注本身要「墙上写着红军的字」，但契约禁可识字 → 图与 avoid 直接打架 | ✓ | ✓ | `--extra "reduce the wall slogan to faint illegible weathered stains, no readable characters"` |
| `cg_huining` | PASS | — | ✓ 城门楼 + 多面红旗 + 人海 + 后到队伍的锅 / 门板 / 绳索 | ✓ | ✓ | 不动 |
| `cg_yudu_return` | PASS | — | ✓ 五座门板浮桥 + 号手举号 + 身后长列 + 水上一点微光 | ✓ 一九三四年十月 ✓ | ✓ | 不动（native：月光水路是分面拼的） |
| `cg_camp_fire` | PASS | — | ✓ 背靠背坐圈 + 衣架下小火 + 锅 + 无树水草夜 + 单一暗橙光池 | ✓ | ✓ | 火上方那缕烟是一条硬边白带、略生硬（软） |
| `cg_hadapu_paper` | PARTIAL | — | ✓ 报纸摊满方桌 + 众人俯读 + 举报就窗光 + 木柜台 | ✗ **`src/data/cg.js` 的 `caption`（「一张旧报纸，折得很小，塞进口袋。」）与画面及剧本实际用的 `text` 不是一回事** —— 现在显示的是剧本的 text，玩家看不到这个矛盾，但兜底图注一旦命中就是图文不符 | ✓ | 报报纸面是高细节写实质感、块面弱于人物 → `--extra "flatten the newsprint into broad faint grey faceted blocks, remove the fine print texture"`；另把 `cg.js` 的 caption 改成剧本用的那句 |

### 汇总

| 判定 | 张数 | id |
|---|---|---|
| `PASS` | 21 | yudu_night, blockade, xiangjiang_day, xiangjiang_night, tongdao, liping, houchang, zunyi, stretcher, tucheng, chishui_first, zhaxi, loushanguan, chishui_fourth, dadu, luding_bridge, snow_mountain, lazikou, huining, yudu_return, camp_fire |
| `PARTIAL` | 7 | guo_daniang_door, jinsha, yihai, maogong, grassland, wuqi, hadapu_paper |
| `FAIL` | 2 | **xiaoman_horn**, **luding_race** |

## 3. 跨批一致性：「代差」不成立，「个体问题」成立

`tmp/cg/PROVENANCE.md` 把 30 张分成三代（旧风格头 / 新风格头 + 旧模型 / 新风格头 + 新模型），
并记了一条自述：**新风格头让画面「明显更块面化」**。我按 mtime 分组逐张比对后**不支持这条自述**：

| 世代 | 张数 | 我实测的块面表现 |
|---|---|---|
| 旧风格头（≤23:16） | 6 | `cg_huining`(718 KB)、`cg_maogong`(1528 KB) 块面**很强**；`cg_grassland`(1461 KB) **偏柔**；`cg_yudu_return`、`cg_luding_race`、`cg_luding_bridge` 中上 |
| 新风格头 + 旧模型（23:18–23:20） | 3 | `cg_lazikou`、`cg_snow_mountain` 很强；`cg_wuqi` 很强但踩了文字红线 |
| 新风格头 + 新模型（≥23:25） | 21 | `cg_dadu`、`cg_chishui_first`、`cg_hadapu_paper`（人物）很强；`cg_camp_fire`、`cg_grassland` 同类偏柔；`cg_hadapu_paper` 的报纸面偏写实 |

**结论：块面强弱与世代没有单调关系。** 所以：

* **不要按世代整批重出** —— 那会花掉 20 张以上的额度，而证据不支持「新世代整体更好」。
* 真正要动作的是**个体**（§4）与两类**共性残留**：天空 / 远景的柔化
  （`cg_grassland`、`cg_loushanguan` 的天色）与高细节写实面（`cg_hadapu_paper` 的报纸）。
  这两类正是旧记账里写过的已知残留（`docs/ROUNDS.md`：「水面 / 天空仍容易退化成连续渐变」），
  出现率不高，单张用 `--extra` 收拾即可。
* 三个批次之间的**调性一致**（低饱和、左上或内部光源、人物一律远景或小侧脸、装具识别点齐全），
  没有出现「这一批整体像另一个游戏」的情况。

## 4. 最该先返工的 3 张（按对玩家的影响排序）

### 4.1 `cg_xiaoman_horn`（ch01，P1）—— 两个硬伤叠在一张上

1. **破红线 6**：这是 30 张里唯一的大特写正脸（男孩的脸约占画面高度的 1/4，
   native 复核 `tmp/cg/probe/cg_xiaoman_horn-face.png`），旁边老兵的脸也一样大。
   契约写明这会与 AI 半身立绘打架 —— 而 `assets/generated/chars/xiaoman_calm.png`
   就是一张胸像，玩家在同一章里会连着看到两张「同一个孩子的脸」，第二张更大。
2. **与人物成长线矛盾**：画面里他**正在吹**号，而
   （a）本句图注是「他把号举起来，手是抖的。」；
   （b）紧接着的正文是「小满把号挂在肩上，把号嘴贴着自己的嘴。」→「（下一次一定要吹响。）」；
   （c）`docs/STORY_BIBLE.md` 人物表：「于都出发时连号都吹不响；娄山关上第一次吹响冲锋号」。
   也就是说，这一张把全书最关键的人物伏笔**在第一章就提前兑现了**。

```powershell
node tools/cg-art.js --only cg_xiaoman_horn --force --extra "medium-long shot, not a portrait: the boy seen from behind and from the side, face small and in shadow, holding the bugle up away from his lips, mouth not on the mouthpiece, the instrument silent; keep the column and the pontoon bridges in the middle distance"
python tools/cg-post.py --id cg_xiaoman_horn
```

若图片不改，退路是把这一步挪到 ch20 的 `cg_yudu_return` 旁边（同一拍），
但那张已经有「举起了他的号」，会变成同章两张同拍 —— 所以更推荐重出。

### 4.2 `cg_luding_race`（ch15，P0）

图注是「**十三根铁索**，横在一条发怒的河上。」，`STORY_BIBLE` 第 118 行也是十三根；
这是全剧最著名的记忆点之一，玩家会数。画面可数到的铁索**约 9 根**。除此之外这张的块面、
缺板、桥楼、白浪、伏低看索的战士都对得上。

```powershell
node tools/cg-art.js --only cg_luding_race --force --extra "exactly thirteen separate iron chains spanning the gorge, evenly spaced, all thirteen clearly countable from the middle of the span"
python tools/cg-post.py --id cg_luding_race
```

### 4.3 `cg_wuqi`（ch19，P0）

墙上的红军标语**字形可辨**（native：`tmp/cg/probe/cg_wuqi-wall.png`，白灰墙上一排大号红字），
而这条的 `avoid` 明写 `readable characters on the wall`，`AVOID_BASE` 也含
text / chinese characters。AI 写汉字是这条管线最容易露馅的地方，这张又把字放在画面右侧的
视觉焦点上。图注（「窑洞的墙上写着红军的字」）要的是**「写着」这件事**，不必真的写出来。

```powershell
node tools/cg-art.js --only cg_wuqi --force --extra "reduce the wall slogan to faint, weathered, illegible red stains; no legible or recognisable characters"
python tools/cg-post.py --id cg_wuqi
```

**第 4 名**（不进前三但同批顺手）：`cg_jinsha` —— 图注「七条木船」画面只数得出 4 条。

## 5. 我实际跑过的命令与真实输出摘要

```
node tools/check.js
  → 20 章 / 6623 步 / 61086 汉字 / 60 选项 / 81 档案；背景 30-30；立绘 280-280
    插画 P0 24 / 24 已生成；P1 6 / 6 已被剧本引用
    警告 1 条（既有豁免：未出场角色 narrator）
    检查通过。                                      ← 绿

node tools/lint-story.js src/story/ch01.js
  → 1 章 / 319 步 / 正文 3567 汉字 / 3 个选项 / 4 条档案；✓ 无错误。

每章 cg 步计数（扫 src/story/ch*.js）
  → ch01 3 / ch17 3 / ch03 ch05 ch08 ch15 ch19 ch20 各 2 / 其余各 1；合计 30
    ⇒ 「每章 ≤3 条」未破。

30 张成品的体积与 PNG 签名（python/PIL）
  → 30/30 过闸门（≥50 KB、PNG 签名、≤1536 KB）
    贴顶三张：cg_stretcher 1534 KB、cg_loushanguan 1532 KB、cg_maogong 1528 KB

node tools/e2e-steps.js rev-root-ch01p1 "ch01|autoPick:1|until:VN.state.blockKind==='cg'|..." 90000
  → 截图 tmp/e2e/rev-root-ch01p1.png；#cg-img 的 src 依次命中
    assets/generated/cg/cg_guo_daniang_door.png → cg_yudu_night.png（位图真的上屏）
    屏幕堆叠里 #cg-img[o=1] 在 #bg-layer 之上；图注逐字打出
    banner 的「错误 1 条」是**我自己那条 note 表达式写坏了**（脚本 DSL 里不能有 |），不是游戏报错

缩图与成品的逐张比对（python/PIL，缩到同宽后做差）
  → 30 张缩图与当前成品全部一致（maxdiff ≤ 40/255），无一张是旧图。
```

取证裁剪都在 `tmp/cg/probe/`：`cg_xiaoman_horn-face`、`cg_luding_race-{chain,mid,left,right}`、
`cg_wuqi-wall`、`cg_maogong-{feet,feet2,feet3,bottom}`、`cg_tucheng-{wound,wound2}`、
`cg_jinsha-{boats,water}`、`cg_xiangjiang_day-water`、`cg_grassland-ground`、
`cg_yudu_return-water`、`cg_liping-fire`、`cg_loushanguan-sky`、`cg_xiangjiang_night-fire`、
`cg_chishui_first-river`。

## 6. 我拿不准的

| 事项 | 为什么拿不准 |
|---|---|
| `cg_luding_race` 到底几根索 | 我能确信不是 13，但「9 还是 11」在分面风格里数不准（索在中段有交叠）。返工按「13 根、中段可数」要求即可，别以我的数字为准 |
| `cg_jinsha` 的船数 | 右缘有 1–2 条船被裁，我数到 4 条清楚的；也可能画了更多但没进画框 |
| `cg_wuqi` 的字算不算「可读」 | 我判「字形可辨」（一排大号红字，单字认得出形状，整句读不通）。按 `avoid` 字面算踩线，按「能读出内容」算没踩线 —— 我按前者报 |
| `cg_guo_daniang_door` 的左边框 | 大娘与门板贴左边框、门板上沿疑似贴边（640 缩图上不确定），需要开一次原图左上角确认 |
| `cg_dadu` 的下边框 | 迫击炮被下边框切到一半，是否算「主体被裁」取决于它算不算主体 |
| 近景人物脸偏大（`cg_tongdao` / `cg_liping` / `cg_maogong` / `cg_hadapu_paper`） | 红线 6 的字面只管「具体历史人物的脸」，这些是通用战士；但 4–6 张中景大小的脸是否已构成「与立绘语言重复」，属设计取舍。我判「可接受、偏保守」，请设计侧裁决 |
| 覆盖度的自限 | 全程只读了 640 缩图 + 30 张里 15 张的局部原图（刻意如此，怕 413）。没做 native 复核的，风格结论只在构图层成立 |

## 7. 工程 / 集成面（附带给生成组的交底）

* **闸门**：`node tools/check.js` 绿；六张 P1 也已全部接进剧本（ch01 两条，ch05 / ch08 / ch17 / ch19 各一条），
  「每章 ≤3 条」未破（ch01 与 ch17 各 3 条，顶格）。
* **呈现**：实拍确认位图 CG 真的上屏（§5 的探针），图注逐字打出，路径回退链未被触发。
* **体积**：`cg_stretcher` 1534 KB / `cg_loushanguan` 1532 KB / `cg_maogong` 1528 KB
  离 1536 KB 上限只剩 2–8 KB —— 这三张**只要重出原始图就可能越线**，`check.js` 会报警告。
  返工时顺手让 `tools/cg-post.py` 的量化兜底生效，别等闸门红。
* **落点重复**：ch01 现在有 3 条 CG，全部关于「于都河那一夜」（拆门板 / 夜渡 / 举号）。
  规则上合规（≤3），但同一章连着三张同一夜的画，玩家会觉得停太多次；加上 §4.1 那个矛盾，
  `cg_xiaoman_horn` 的去留值得单独裁决一次。
* **兜底图注**：`src/data/cg.js` 里 `cg_hadapu_paper` 的 `caption` 与剧本实际用的 `text`
  不是同一件事（§2 批次 C 表）。现在不影响玩家，但兜底路径一旦命中就是图文不符，建议一并改掉。

## 8. 交付说明

* 本文件是本次评审的**唯一**产物：`tmp/cg/review/root-pass.md`（覆盖 A/B/C 三个批次）。
  `tmp/cg/review/` 下没有 `batch-a/b/c.md` —— 因为三个评审 agent 没收到任务（§0）。
* 投递恢复后若要独立评审接手，`BRIEF-rev-batch.md` 需补两条：
  ①「判块面必须用原生分辨率裁剪，缩图会抹掉面边界」（§0.1）；
  ② 现在共 **30** 张（6 张 P1 已全部出图并接进剧本），不再是任务书里写的 26 张。
