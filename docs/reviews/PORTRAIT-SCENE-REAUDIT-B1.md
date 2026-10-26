# 立绘复判 B1 · 桌面与医疗残片

> 性质：独立复判，不是修正记录。
>
> 范围：`PSL-B01`、`PSL-B02`，并补查何晓梅全部章状态是否仍把桌子、
> 地面、散落药具或他人肢体烘入透明立绘。

## 0. 结论

- `PSL-B01`：**PASS**。原 25 个桌面/长桌状态已全部移除桌板、椅子、地面和硬矩形底。
- `PSL-B02`：指定 5 个医疗状态 **PASS**。
- 另发现 1 个未在原清单内、但同类且玩家可见的问题：
  **`he_xiaomei_ch19_north` FAIL（P1）**，仍带横向桌板、药箱、玻璃瓶、
  登记本和散落纱布。

因此本复判总判定为 **PARTIAL**：原 P0 已关闭，但用户“立绘里不能出现桌子等
场景物件”的总规则还未完全满足。

## 1. 机器检查

```text
node tools/build-portrait-states.js --check
  形象演进运行时数据与评审清单一致：
  35 角色 / 170 状态 / 282 章映射 / 19 个章内变化

node tools/check.js
  背景 46 / 46；背景位图 42 / 42；立绘 280 / 280；
  形象演进 625 / 625；检查通过（仅既有 narrator 未出场警告）

python -X utf8 tools/check-portrait-key.py
  立绘洋红残留检查：909 张
  洋红残留：0 张超阈值
```

## 2. PSL-B01 · PASS

原生分辨率复核了 10 个原先有风险的毛泽东/周恩来状态：

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

证据：`tmp/reaudit-b1-tables.jpg`。同时逐张原生查看了上述 10 个 `calm.png`。
结果是地图、报告、铅笔、茶杯等均已改为双手贴胸持有；不再出现木桌、
桌面边缘、椅子上半截、地面色块或横向不透明矩形。

其余 16 个原问题状态也通过同一张 5×5 总览核对：

```text
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

其中 16 项在总览中出现是因为原清单与补充抽查并集；没有桌板或地面残留。
`bogu_ch04_tongdao_calm.png`、`zhu_ch06_zunyi_calm.png`、
`lide_ch07_zunyi_calm.png` 另按原生分辨率复核，人物头、肩、手与手持物完整。

## 3. PSL-B02 · 指定项 PASS

原生复核了：

- `he_xiaomei_ch03_xiangjiang_calm.png`：桌、药箱、瓶、纱布卷、书均消失；
  人物手持血染布，药箱贴身斜挎。
- `he_xiaomei_ch07_supply_calm.png`：打开的医疗箱被双手托住，没有桌面；
- `he_xiaomei_ch08_chishui_calm.png`：无地面或另人肢体，手持布与药箱贴身；
- `he_xiaomei_ch12_longmarch_calm.png`：碗与药箱均在手中/贴身，他人裸腿消失；
- `he_xiaomei_ch16_snow_calm.png`：他人脚部、瓶、碗和雪地消失，仅保留人物与手持布。

证据：`tmp/reaudit-b1-medical.jpg`，并逐张查看了上述 5 个原生 `calm.png`。
同状态表情组由同一 `calm` alpha 锁身体，未见重新构图的残片。

## 4. 新发现 · he_xiaomei_ch19_north · FAIL（P1）

证据：

```text
assets/generated/chars/he_xiaomei_ch19_north_calm.png
tmp/reaudit-b1-medical.jpg（第二排左起第四张）
```

画面底部仍有：

- 一整块横向木桌面；
- 左下方红十字药箱；
- 桌面上立着的玻璃瓶；
- 登记本与两卷纱布。

问题：它与 `PSL-B02` 的原缺陷同型，放到游戏背景上会出现横切桌面和散落器具，
不符合用户“立绘可以拿东西，但不能有桌子等家居物品”的要求。

修法：

```text
regenerate the same woman from head to waist on a fully transparent background;
let her hold one rolled bandage and one folded register against her apron;
keep the compact medical kit hanging at her waist;
remove the tabletop, bottle, loose bandages, notebook lying on a surface,
floor and all scenery; no hard horizontal bottom edge
```

建议只改 `he_xiaomei_ch19_north` 状态描述与该状态组，不重画其它已通过状态。

## 5. 剩余风险

- 本轮对 25 个原问题状态逐一看了 `calm` 总览，并对 10 个 Mao/Zhou 关键状态
  与 5 个指定医疗状态做了原生复核；未逐张原始分辨率查看 25 × 全表情。
  表情一致性由 `qc-portraits.py` 与 alpha 锁另行覆盖。
- 担架、红旗、步枪、铜锅、药箱和伤脚属于剧情承载物，本轮仍允许；
  复判只要求它们与人体有明确接触，不把人物所在房间搬进立绘。
- 只要 `he_xiaomei_ch19_north` 修完并做同拍原生复验，`PSL-B01/B02` 可收口为 PASS。
