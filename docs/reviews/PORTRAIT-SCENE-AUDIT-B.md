# 立绘情景闭环 · 独立审核 B

> 性质：独立审核，非自评。
>
> 范围：立绘完整性、透明背景、家具/场景残片、裁切、道具接触点、同一状态的表情一致性。
> 审核期间另有一个先前启动的批量表情生成进程在写盘；本报告以它结束后的稳定文件为准。
>
> 结论：**FAIL**。资源链路完整，但立绘画面仍有多组玩家可见的硬伤。

## 1. 机器闸门与取证

批量生成结束后，仓库根目录实测：

```text
node tools/check.js
  背景 46 / 46
  背景位图 42 / 42
  立绘 280 / 280
  形象演进 625 / 625（170 状态，19 个章内变化）
  检查通过（仅既有 narrator 未出场警告）

python -X utf8 tools/check-portrait-key.py
  立绘洋红残留检查：909 张
  洋红残留：0 张超阈值

python -X utf8 tools/qc-portraits.py --csv tmp/qc-portraits-audit-b.csv
  表情图 455 张；硬伤 0 张；姿态/构图警告 23 张
```

独立 PNG 完整性检查：

```text
PNG 总数 909
尺寸分布 {(600, 900): 909}
不可读 0
```

证明“文件存在、尺寸正确、洋红已清”并不能证明立绘内容合格。以下问题均在这组闸门通过后仍然存在。

目视取证：

- 170 个剧情状态 calm 总览：`tmp/states-calm-1.jpg` … `tmp/states-calm-4.jpg`。
- 23 条构图层警告拼版：`tmp/qc-warning-faces-b.jpg`。
- 表格/桌面候选总览：`tmp/table-candidates-calm.jpg`。
- 原生分辨率复核：`mao_ch03_xiangjiang_calm.png`、`mao_ch06_houchang_calm.png`、
  `zhou_ch03_xiangjiang_calm.png`、`zhou_ch06_zunyi_calm.png`、
  `zhou_ch08_chishui_calm.png`、`bogu_ch04_tongdao_calm.png`、
  `lide_ch04_shaken_calm.png`、`lide_ch07_zunyi_fierce.png`、
  `liu_bocheng_ch12_jinsha_calm.png`、`zhu_ch06_zunyi_stern.png`、
  `he_xiaomei_ch03_xiangjiang_calm.png`、`he_xiaomei_ch07_supply_calm.png`、
  `he_xiaomei_ch08_chishui_calm.png`、`he_xiaomei_ch12_longmarch_calm.png`、
  `he_xiaomei_ch16_snow_calm.png`、`san_wa_ch18_new_shoes_calm.png`、
  `san_wa_ch19_north_calm.png`、`shi_zhu_ch15_luding_calm.png`。

## 2. 问题清单

### PSL-B01 · P0 · 桌面/长桌被烘进透明立绘

判定：**FAIL**

证据：原生图 `mao_ch06_houchang_calm.png` 的下半幅是一整块横向木桌，桌面还压着
地图、铅笔、搪瓷杯和书；`zhou_ch06_zunyi_calm.png` 同样有横向桌面、纸稿和杯子。
`bogu_ch04_tongdao_calm.png` 则把人物、长凳/木箱和两条腿一起收入画幅，人物在画布底边被横切。

这组至少涉及：

```text
mao_ch03_xiangjiang
mao_ch04_tongdao
mao_ch06_houchang
mao_ch14_dadu
zhou_ch03_xiangjiang
zhou_ch04_tongdao
zhou_ch06_zunyi
zhou_ch08_chishui
zhou_ch14_dadu
zhu_ch08_nocap
zhang_wentian_ch07_zunyi
bogu_ch04_tongdao
bogu_ch07_zunyi
lide_ch04_shaken
peng_ch07_zunyi
nie_ch07_zunyi
nie_ch18_lazikou
liu_bocheng_ch06_zunyi
liu_bocheng_ch12_jinsha
liu_bocheng_ch14_dadu
chen_yun_ch07_supply
chen_yun_ch09_reorg
lin_boqu_ch09_supply
xie_juezai_ch06_houchang
ye_jianying_ch11_chishui
```

问题：这不是“角色拿着地图”，而是把桌面、椅子/长凳和桌上道具整体留下了。放到游戏背景上会出现一块
不透明的横切桌面，既遮挡舞台，也把人物从腰部或腿部生硬切断。

修法：重出上述状态的整个状态组，不只修 `calm`。提示词必须把场景改成单人隔离胸像：

```text
render the exact same character as an isolated head-to-waist cut-out on a fully transparent background; no table, desk, chair, bench, bed, floor, ground slab or map table anywhere; the hands may hold a folded map, report or notebook against the body; keep both hands, shoulders and the full facial silhouette visible; end the composition with a clean deliberate bust silhouette, not a rectangular crop
```

同时从 `docs/reviews/char-progression-spec.json` 的状态描述里删除 “seated at a meeting table”、
“standing at a table”等会误导模型的场景句，并把
`no table, no desk, no chair, no bench, no floor, no ground slab` 写入该组 `avoid_en`。

预计文件：

- `docs/reviews/char-progression-spec.json`
- `src/data/portraitStates.js`（由编译器生成）
- 上述状态的 `assets/generated/chars/{portraitId}_*.png`

### PSL-B02 · P0 · 医疗场景残留桌面、药箱和另一人的肢体

判定：**FAIL**

证据：

- `he_xiaomei_ch03_xiangjiang_calm.png`：底部整块桌面、红十字药箱、玻璃瓶、纱布卷和书；
  人物双手压在桌面。该状态的 7 个表情都存在同类构图。
- `he_xiaomei_ch07_supply_calm.png`：桌面、打开的木质药箱、码放纱布和登记簿。
- `he_xiaomei_ch08_chishui_calm.png`：底部从约 `y≈650` 起是一整块不透明地面/桌面，
  并被裁成生硬矩形；箱、瓶、纱布卷和书都成了独立的场景物件。
- `he_xiaomei_ch12_longmarch_calm.png`：画面右下方混入另一人的裸腿，地上还有药箱、
  两个碗、瓶子、纱布和石块。
- `he_xiaomei_ch16_snow_calm.png`：下方的另一只脚、药箱、瓶、碗和积雪地面一并保留。

问题：立绘在舞台上变成了“角色 + 桌面 + 多人局部场景”的小截图。身体被裁切、桌面边缘横穿画面，
进入背景后会明显穿帮。

修法：把医疗道具改成角色手持或贴身携带；删除桌面、地面和另一人的肢体。
可直接使用的英文句子：

```text
the same woman alone from head to waist on a fully transparent background; show only her arms, hands and the bandage or one compact medical kit she is holding against her body; no table, no floor, no ground, no crates, no bottles, no loose rolls, no book and no other person's limbs; keep her whole hands and shoulders inside the frame
```

状态：`he_xiaomei_ch03_xiangjiang`、`he_xiaomei_ch07_supply`、
`he_xiaomei_ch08_chishui`、`he_xiaomei_ch12_longmarch`、`he_xiaomei_ch16_snow`。

### PSL-B03 · P0 · 透明通道被大面积侵蚀

判定：**FAIL**

证据：原生图 `zhu_ch06_zunyi_stern.png` 的衣袖、胸口、腹部和前景物件被不规则透明洞贯穿；
人物不再完整。alpha 覆盖率从同状态 `calm` 的 `0.6868` 掉到 `0.2782`；
`qc-portraits` 测得轮廓 IoU=`0.392`、身体差=`73.8`（全局最差）。

同一问题疑似出现在 `lide_ch07_zunyi_fierce.png`：alpha 覆盖率从 `0.6543` 掉到 `0.3911`，
且在大腿处出现横切；`qc-portraits` 测得 IoU=`0.554`、身体差=`67.1`。

问题：这是玩家会直接看到的“半张人物被抠空”，比普通的构图差异更严重。

修法：不要单独修补受损 PNG。先修复该状态的 base/calm 构图，再用同一 base 做眉眼嘴编辑；
表情编辑提示词明确锁住身体和 alpha：

```text
change only the eyebrows, eyes and mouth; preserve the exact same alpha silhouette, body, arms, hands, clothing, pose, camera and crop; no transparent holes inside the figure and no hard rectangular background
```

重出后必须复跑两张图的 alpha 覆盖率和 `qc-portraits.py`，IoU 至少回到其余同状态表情的正常区间。

### PSL-B04 · P1 · 单人物状态混入地面、炊具和围坐群像

判定：**FAIL**

证据：`li_tiezhu_ch03_xiangjiang_calm.png`、`li_tiezhu_ch06_supply_calm.png`、
`li_tiezhu_ch17_grassland_calm.png`、`san_wa_ch07_supply_calm.png`、
`san_wa_ch09_longmarch_calm.png`、`san_wa_ch16_snow_calm.png`、
`san_wa_ch18_lazikou_calm.png` 都把地面、锅灶、碗、袋子和蹲坐/围坐姿态一起烘入单人物透明图。

问题：人物允许拿自己的剧情道具，但这些状态把“场景”也带进了立绘。锅、碗、粮袋落在地面，
人物蹲在不可见地面之上，进入透明舞台后会出现悬浮或硬边框。

修法：保留人物和与其有明确接触点的道具，所有无接触的道具移出画幅；人物姿态统一为可独立站在
透明舞台上的半身姿态。

```text
single isolated head-to-waist figure on transparent background; keep only the copper pot, bowl, rope or sack that the character physically holds or wears; remove the ground, campfire, loose food, loose bowls and surrounding soldiers; no hard bottom edge
```

### PSL-B05 · P1 · 人体、腿脚或手持物在画布底边被横切

判定：**PARTIAL**

证据：

- `san_wa_ch19_north_calm.png`：画面一直画到草鞋，鞋底在 `y=900` 被平切；同状态的
  `smile`、`dawn` 又改用更近的构图，alpha 覆盖率从 `0.3335` 升到 `0.5537/0.5657`，
  表情切换时会突然拉近。
- `lide_ch07_zunyi_fierce.png`：大腿以下突然消失，底边是一条直线。
- `shi_zhu_ch15_burned_smile/fierce/weak.png`：与 `calm` 相比构图明显拉近，腿部和旗杆下缘
  被重新裁切；`qc-portraits` 三项均为警告。

问题：同一个人物换表情时像换了机位或裁切；生硬底边不符合“完整展示”。

修法：同状态所有表情共用 `calm` 的同一身体、同一边框和同一底边策略。若采用胸像，就让底边落在
腰部/衣摆的自然轮廓；不要穿过脚、腿或手持道具。

### PSL-B06 · P1 · 同状态表情的身体/机位仍不稳定

判定：**PARTIAL**

`python tools/qc-portraits.py` 的 23 条警告中，优先处理以下高偏差项：

| 状态 | 表情 | IoU | 身体差 | 复判 |
|---|---:|---:|---:|---|
| `zhu_ch06_zunyi` | stern | 0.392 | 73.8 | 透明天窗，P0 |
| `lide_ch07_zunyi` | fierce | 0.554 | 67.1 | 底边横切，P1 |
| `san_wa_ch19_north` | dawn / smile | 0.517 / 0.525 | 88.6 / 80.0 | 机位与缩放变化，P1 |
| `li_tiezhu_ch17_grassland` | smile | 0.610 | 68.1 | 构图放大，P2 |
| `shi_zhu_ch15_luding` | weak | 0.457 | 65.5 | 构图放大，P1 |
| `shi_zhu_ch15_burned` | smile / fierce / weak | 0.658 / 0.633 / 0.655 | 40.7 / 44.1 / 41.1 | 身体与旗帜裁切变化，P1 |
| `xiaoman_ch16_snow` | stern/sad/worry/fierce/weak/dawn | 0.775–0.799 | 60.2–62.8 | 需统一机位，P2 |
| `zhou_ch16_snow` | worry | 0.720 | 52.8 | 需统一机位，P2 |
| `soldiers_ch09_longmarch` | fierce / dawn | 0.719 / 0.747 | 58.4 / 57.9 | 三人站位变化，P1 |

问题：表情切换时身体轮廓变化过大，玩家会感觉镜头跳了；它们属于同一状态，应该只改眉眼嘴。

修法：从同状态 `calm` 生成，使用面部遮罩；不得重新构图、换姿势、缩放或重画衣服。
`zhu_ch06_zunyi` 和 `lide_ch07_zunyi` 必须先修 P0，再重出其它表情。

### PSL-B07 · P2 · 群众单人图与剧情道具的边界不清

判定：**PARTIAL**

证据：`he_xiaomei_ch16_snow_calm.png` 以“体温救冻脚”为核心，允许表现他人脚部，但仍带入了
药箱、瓶、碗和地面；`shi_zhu_ch14_leg_calm.png` 带入地面和旗帜下缘。
这类状态有明确剧情功能，不建议为了“干净”删掉核心动作，但应删除无接触的场景物件。

修法：只保留叙事动作必需的身体局部和手持/贴身道具；地面、散落药具、石块不进入立绘。

## 3. 总判定与复判条件

**FAIL。**

第一轮至少要修：

- P0：`PSL-B01`、`PSL-B02`、`PSL-B03`；
- P1：`PSL-B04`、`PSL-B05`、`PSL-B06`。

修正后由同一审核员按以下顺序复判：

1. 先看原生 `calm` 图，确认单人、透明、无家具/地面、无硬矩形边。
2. 再逐张看同状态所有 `faces`，确认身体和机位一致。
3. 跑机器闸门，贴出真实输出。
4. 用游戏内实拍确认桌面/地面残片不会出现在背景上。

## 4. 未覆盖与保留

- 170 张状态图均已看 calm 总览；未逐张把 625 张表情全部按原生分辨率目视，只对
  `qc-portraits` 的 23 条异常和关键场景做了原生复核。
- `wang_jiaxiang_ch04_stretcher`、`mao_ch05_stretcher` 中的担架属于剧情承载物，
  本轮未判为家具；若用户要求连担架都移除，需要另行修改人物叙事状态。
- 群众 id `soldiers` / `villagers` / `yi_people` 的三人组本身符合群像契约；
  本报告只把“单人物状态里混入其他人物肢体”的问题列为残片。
