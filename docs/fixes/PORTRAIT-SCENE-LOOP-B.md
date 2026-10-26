# 立绘情景闭环 · 画面修正 B

> 修正范围：`PSL-B01`—`PSL-B06` 中除毛泽东、周恩来之外的状态。
>
> 本轮按要求只重做其余人物；毛泽东、周恩来的立绘字节保持原样。

## 1. 根因与管线修正

原先“不画地面”只写在背景段，状态清单仍频繁出现“坐在桌边”“站在桌前”
“跪在灶边/雪地”，模型于是把人物、家具和小场景一起烘进透明画布。

本轮新增三层约束：

1. `ISOLATED_BUST_LOCK`：只保留透明头腰胸像；桌子、椅子、长凳、床、木箱、
   灶台、地面、房间和他人肢体都不得进入画面；剧情道具只能由人物手持或贴身佩戴；
   胸像底边必须自然收束，不能以水平直线硬裁。
2. `DANGER_TONE_LOCK`：战斗、伤亡、濒死、刚发生死亡等情境不得微笑、庆祝或轻快。
3. `composite-expression.py`：上游忽略表情蒙版时，成品只在眉眼和鼻口两块区域
   使用新表情，身体、衣装和 alpha 一律取同状态 `calm`；同时剔除上游误涂成黑色的
   透明底，避免黑边和重影。

对应代码：

- `tools/neko-art.js`
- `tools/neko-states.js`
- `tools/composite-expression.py`

## 2. 重做的状态

### P0 · 家具、桌面和医疗场景残片

```text
zhu_ch06_zunyi
zhu_ch08_nocap
zhang_wentian_ch07_zunyi
bogu_ch04_tongdao
bogu_ch07_zunyi
lide_ch04_shaken
lide_ch07_zunyi
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
he_xiaomei_ch03_xiangjiang
he_xiaomei_ch07_supply
he_xiaomei_ch08_chishui
he_xiaomei_ch12_longmarch
he_xiaomei_ch16_snow
```

这些状态的状态描述已删去桌面、椅子、木箱、灶台、地面、散落药具和他人肢体；
手持地图、账本、药箱、铜锅或纱布改为贴胸、贴腹或斜挎。

### P0/P1 · 透明洞、硬切与机位跳变

```text
zhu_ch06_zunyi
lide_ch07_zunyi
xiaoman_ch16_snow
shi_zhu_ch15_luding
shi_zhu_ch15_burned
soldiers_ch09_longmarch
```

表情改为同状态 `calm` 的确定性脸部合成；轮廓和透明洞不再由每次重新生成决定。

### P1 · 单人物混入地面、炊具和围坐群像

```text
li_tiezhu_ch03_xiangjiang
li_tiezhu_ch06_supply
li_tiezhu_ch17_grassland
san_wa_ch07_supply
san_wa_ch09_longmarch
san_wa_ch16_snow
san_wa_ch18_lazikou
san_wa_ch19_north
```

锅、碗、皮带、草鞋等只保留在人物手中或身上；火堆、地面和围坐人群全部移出胸像。

### 同状态机位复核

```text
xiaoman_ch03_binding
xiaoman_ch17_pot
a_yue_ch19_farewell
san_wa_ch13_longmarch
```

以上状态只补仍有轮廓偏差的表情，并统一使用同状态基准 alpha 与确定性脸部合成。

## 3. 危险情境的表情接线

`PSL-A01`—`PSL-A04` 的剧本表情修正保留在：

- `src/story/ch02.js`：空袭死伤后，徐特立改为 `calm`；五老段落移除残留的小满。
- `src/story/ch17.js`：三娃断粮与误食毒草段落改为 `weak/worry`。
- `src/story/ch18.js`：石柱死讯出现前三娃先切 `sad`；“炸碉堡”改为 `calm`；
  脚伤段落不再使用笑脸。

对应修正明细见 `docs/fixes/PORTRAIT-SCENE-LOOP-A.md`。

## 4. 验证输出

### 立绘完整性

```text
python -X utf8 tools/qc-portraits.py --csv tmp/qc-portraits-after-restore.csv
  表情图 455 张；硬伤 0 张；姿态/构图警告 1 张
  警告 zhou_ch16_snow worry（周恩来，本轮明确排除）
  质检通过

python -X utf8 tools/check-portrait-key.py
  立绘洋红残留检查：909 张
  洋红残留：0 张超阈值
```

非毛泽东、周恩来的本轮状态已无姿态/构图警告；黑底误入 alpha 的专项扫描
只剩群众 `soldiers_ch09_longmarch` 对手持物的正常明暗变化，没有透明底黑块。

### 仓库闸门

```text
node tools/build-portrait-states.js --check
  35 角色 / 170 状态 / 282 章映射 / 19 个章内变化

node tools/check.js
  20 章 / 6656 步
  立绘 280 / 280；形象演进 625 / 625
  检查通过（仅既有 narrator 未出场警告）

node tools/check-assets.js
  规范检查通过

node tools/validate-svg.js
  检查 390 个文件，合计 23.1 MB；全部通过

node tools/lint-story.js
  20 章 / 6656 步 / 60 个选项 / 81 条档案 / 0 错误

node tools/qa-consistency.js
  20 章 / 共 4465 句台词 / 违规 0 条

node tools/e2e-run.js
  20 章 / 24094 步 / 33 张次 CG / 全部走完 / JS 报错 0
```

体积自检：

```text
超过本档上限的文件数 = 0
```

## 5. 未完成与保留

- 周恩来 `zhou_ch16_snow/worry` 仍有一条旧的轮廓 IoU 警告；按本轮用户要求未改周恩来。
- 毛泽东、周恩来本轮没有重绘，相关文件只恢复到任务开始前的版本。
- 本轮只做程序管线、状态清单、剧本表情接线和既有角色重出；不新增人物 id、
  不新增表情枚举、不修改背景与插画。
