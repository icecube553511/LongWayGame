# 立绘情景闭环 · 修正 B

> 对应独立审核：`docs/reviews/PORTRAIT-SCENE-AUDIT-B.md`
>
> 性质：第二组修正记录，不是最终验收。

## 0. 结论

已修复审核 B 的 `PSL-B01`—`PSL-B06`，并处理审核中顺带发现、同样违反
“透明立绘不混入家具/场景”的 5 个状态：

- `he_xiaomei_ch06_supply`
- `he_xiaomei_ch20_huining`
- `li_tiezhu_ch17_death`
- `san_wa_ch18_new_shoes`
- `he_xiaomei_ch17_18_coldwet`

本轮只修订已有状态，没有新增人物 id、表情枚举或状态 id。

## 1. 改动

### 1.1 统一透明隔离半身锁

`tools/neko-art.js`

- 新增 `ISOLATED_BUST_LOCK`：
  - 只允许人物和与身体有明确接触的随身/手持道具；
  - 禁止桌面、椅子、长凳、床、箱笼、灶台、地面、墙景、他人肢体；
  - 坐、跪、倚靠动作只通过躯干与手臂关系表现；
  - 底边落在衣摆/腰部自然轮廓，不允许横切人体。

`tools/neko-states.js`

- 基础图、状态改造、身份锁脸、表情重绘四条提示链全部注入
  `ISOLATED_BUST_LOCK`。
- 新增 `--lock-alpha`：表情重绘后从同状态 `calm` 直接继承透明蒙版，
  修复模型把衣袖、胸口、腹部挖空的问题。
- 修复表达式生成作用域中遗漏的 `crowd`，保证单人/三人组分支都能执行。

### 1.2 状态清单与运行时表

`docs/reviews/char-progression-spec.json`

- 删除或改写会诱导模型画出桌子的 `pose_cn` / `appearance_en`；
- 把地图、报告、账本、茶杯、药箱、绷带等改为胸前持有、腰侧携带或与身体有明确接触；
- 对相关状态补充 `no table / no desk / no chair / no floor / no ground`
  等 `avoid_en`；
- 保留原有磨损、伤情、补给、道具与头部方向。

`src/data/portraitStates.js`

- 由 `node tools/build-portrait-states.js` 重新生成。

### 1.3 重出范围

共重出 **50 个状态组、201 张表情图**。

主要覆盖：

- `PSL-B01` 的 25 个桌面/长桌状态；
- `PSL-B02` 的 5 个何晓梅医疗状态；
- `PSL-B03` 的 `zhu_ch06_zunyi`、`lide_ch07_zunyi`；
- `PSL-B04`—`B06` 涉及的锅灶、地面、腿脚裁切和机位漂移状态；
- 毛泽东思想、周恩来的 10 个地图/会议状态；
- 额外发现的 5 个场景残片状态。

全部成品仍位于 `assets/generated/chars/`，由现有 `neko-post.py` 烘焙，
未手工修改 PNG 字节。

## 2. 关键修复

| 问题 | 处理 |
|---|---|
| 桌面/长桌被烘进立绘 | 25 个状态全部改为透明隔离半身；地图/报告改为手持贴胸 |
| 医疗状态混入桌面、药具和他人肢体 | 何晓梅 7 个相关状态改为单人、药箱贴身、绷带手持 |
| `zhu_ch06_zunyi_stern` 透明洞 | 从本状态 calm 锁 alpha 重出，覆盖率差由 `0.4086` 降到 `0.0002` |
| `lide_ch07_zunyi_fierce` 透明洞/横切 | 从 calm 锁 alpha 重出，覆盖率差为 `0.0001` |
| 单人物带入地面、锅灶、碗袋 | 李铁柱、三娃相关状态只保留手持/背负物 |
| `san_wa_ch19_north` 与 `shi_zhu_ch15_*` 机位跳变 | 全部表情共用 calm 的透明蒙版，alpha 覆盖率差 ≤`0.0001` |
| `he_xiaomei_ch20_huining` 额外桌面问题 | 改为站立持绷带与登记本，药箱挂在腰侧 |

关键 alpha 覆盖率复测：

```text
zhu_ch06_zunyi/stern: calm=0.6165 face=0.6164 delta=-0.0002
lide_ch07_zunyi/fierce: calm=0.6338 face=0.6338 delta=-0.0001
san_wa_ch19_north/smile: calm=0.5351 face=0.5350 delta=-0.0001
san_wa_ch19_north/dawn: calm=0.5351 face=0.5350 delta=-0.0001
shi_zhu_ch15_luding/weak: calm=0.4459 face=0.4459 delta=+0.0000
shi_zhu_ch15_burned/smile: calm=0.4282 face=0.4282 delta=-0.0000
shi_zhu_ch15_burned/fierce: calm=0.4282 face=0.4282 delta=-0.0000
shi_zhu_ch15_burned/weak: calm=0.4282 face=0.4282 delta=-0.0000
```

## 3. 目视证据

- 全部 170 个状态 calm 总览：
  - `tmp/states-calm-after-all-1.jpg`
  - `tmp/states-calm-after-all-2.jpg`
  - `tmp/states-calm-after-all-3.jpg`
  - `tmp/states-calm-after-all-4.jpg`
- 首批重出状态总览：`tmp/batch1-fixed-calm.jpg`
- 毛泽东/周恩来重出总览：`tmp/batch2-fixed-calm.jpg`
- 额外清理状态总览：`tmp/extra-clean-fixed.jpg`
- 问题表情复核拼版：`tmp/fixed-faces-check.jpg`
- 关键原生图：
  - `assets/generated/chars/he_xiaomei_ch03_xiangjiang_calm.png`
  - `assets/generated/chars/he_xiaomei_ch12_longmarch_calm.png`
  - `assets/generated/chars/zhu_ch06_zunyi_stern.png`
  - `assets/generated/chars/lide_ch07_zunyi_fierce.png`
  - `assets/generated/chars/mao_ch06_houchang_calm.png`
  - `assets/generated/chars/he_xiaomei_ch20_huining_calm.png`

以上关键图已按原生分辨率复核：无桌面、无地面矩形、无他人肢体；
人物手部、肩部和头部完整，接触的道具均在手中或贴身携带。

## 4. 机器验证

```text
node tools/build-portrait-states.js --check
  形象演进运行时数据与评审清单一致：35 角色 / 170 状态 / 282 章映射 / 19 个章内变化

node tools/check.js
  立绘 280 / 280；形象演进 625 / 625；检查通过
  唯一警告：narrator 未出场（既有）

node tools/check-assets.js
  规范检查通过

python -X utf8 tools/check-portrait-key.py
  立绘洋红残留检查：909 张
  洋红残留：0 张超阈值

python -X utf8 tools/qc-portraits.py --csv tmp/qc-portraits-portrait-loop-final2.csv
  表情图 455 张；硬伤 0 张；姿态/构图警告 1 张
  剩余：zhou_ch16_snow / worry，轮廓 IoU=0.720、身体差=52.8

node tools/e2e-run.js
  20/20 章走完；24094 步；实际渲染 CG 33 张次；0 条 JS 报错

node tools/qa-consistency.js
  20 章 / 4465 句台词 / 违规 0

体积极限自检
  超过本档上限的文件数 = 0

PNG 完整性
  909 张；尺寸全部 600×900；不可读 0
```

## 5. 未完成 / 降级

- `zhou_ch16_snow_worry` 仍是同类表情中唯一的构图警告：
  表情已经锁住透明轮廓，但头身比与 calm 仍有可见差异。它是 `P2`，
  不影响回合 B 的 P0/P1 收口，应在最终独立复判时决定是否再抽一张。
- 担架、红旗、步枪、铜锅、药箱和他人伤脚属于明确剧情承载物。
  本轮只移除了无接触的桌、椅、地面、散落器具和无关肢体，
  没有删除这些叙事必需道具。
- 审核 B 未逐张原生复核 625 张表情，只复核全部 calm 总览与 23 条异常；
  本组同理，未声称对 625 张逐张做了块面级验收。

## 6. 交给复判

请原审核 B 重点复核：

1. `PSL-B01` 的 25 个状态是否已无任何桌板；
2. 何晓梅 7 个医疗状态是否只保留贴身药箱与手持绷带；
3. `zhu_ch06_zunyi_stern`、`lide_ch07_zunyi_fierce` 的透明洞是否消失；
4. `san_wa_ch19_north`、`shi_zhu_ch15_*` 的表情是否不再跳机位；
5. `he_xiaomei_ch20_huining` 是否仍有桌面/他人腿。

## 7. 主 agent 最终补修

第二轮独立复判确认毛泽东、周恩来 10 个状态此前仍读取了旧运行时表。
补修先重新生成 `src/data/portraitStates.js`，再用更强的透明胸像约束重出：

```text
mao_ch03_xiangjiang
mao_ch04_tongdao
mao_ch06_houchang
mao_ch14_dadu
zhou_ch03_xiangjiang
zhou_ch04_tongdao
zhou_ch06_zunyi
zhou_ch08_chishui
zhou_ch12_jinsha
zhou_ch14_dadu
```

共重出 10 张 `calm` 与 32 张状态表情，全部改为手持贴胸道具、自然腰部透明收束，
无桌板、地面或硬矩形边。

复判又发现 3 个尾项，已继续定向处理：

- `he_xiaomei_ch19_north`：去除桌面、瓶、散落纱布；改为抱绷带和登记本，药箱贴身；
- `shi_zhu_ch15_luding`：胸像在腰部衣摆自然收束，不再平切腿部；
- `shi_zhu_ch15_burned`：胸像在破损衣摆自然收束，不再平切腿部；
- `zhou_ch16_snow / worry`：从同状态 calm 重新合成表情，清除最后的构图警告。

终检见 `docs/reviews/PORTRAIT-SCENE-REAUDIT-FINAL.md`。
