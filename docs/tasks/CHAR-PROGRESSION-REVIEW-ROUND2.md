# 角色形象第二次独立复核

> 只写 `docs/reviews/CHAR-PROGRESSION-ROUND2.md`。不改源码、剧本、工具、资源；不跑 git。
> 不把大图内联进消息，逐张/逐拼版读取，避免 413。

## 当前成品

- 35 个角色，169 个状态，623 个 `(状态,表情)` 文件，19 个章内变化。
- 清单：`docs/reviews/char-progression-spec.json`
- 运行时：`src/data/portraitStates.js`
- 拼版：`tmp/state-calm-sheet-final.jpg`、`tmp/xiaoman_progress_final.jpg`
- 第一轮报告：`docs/reviews/CHAR-PROGRESSION-SPEC.md` §8

## 本轮重点复核对象

1. `zhou_ch08_chishui_stern/sad/worry`：是否与 calm 同机位、同脸。
2. `he_xiaomei_ch03_xiangjiang_sad`：是否单人、同机位、只改表情。
3. `mao_ch16_snow`、`xie_juezai_ch16_snow`、`he_xiaomei_ch16_snow`、`li_tiezhu_ch16_snow`：单衣/薄长衫/冻硬围裙，不得出现厚棉衣、皮帽、毛领。
4. `xiaoman_ch17_grassland`：饥饿、面颊凹陷、嘴唇裂开；还没有铜锅；`xiaoman_ch17_pot` 才是背锅 beat。
5. `xiaoman_ch20_huining`：是否看得出 17 岁、军装合身。
6. 新增冷湿状态：`mao_ch17_18_coldwet`、`zhou_ch17_coldwet`、`zhu_ch17_18_coldwet`、`xie_juezai_ch17_18_coldwet`、`he_xiaomei_ch17_18_coldwet`、`wu_laoliu_ch17_18_coldwet`、`san_wa_ch17_grassland`、`lin_boqu_ch17_grassland`、`soldiers_ch17_18_coldwet`。草地/腊子口不得出现积雪。
7. `zhu_ch02_start`、`mao_ch01_ill`、`xiaoman_ch01_departure`、`nie_ch02_start`、`lin_ch02_start`、`xu_xiangqian_ch17_maogong`、`shi_zhu_ch15_burned`、`zhu_ch20_huining`。
8. 全部 803 张立绘的洋红边、透明边、体积、尺寸。

## 判定

- 只判 `PASS` / `PARTIAL` / `FAIL`。
- 每个 PARTIAL/FAIL 给具体文件/状态 id 和可执行修法。
- 先跑：

```powershell
node tools/build-portrait-states.js --check
node tools/check.js
node tools/check-assets.js
python -X utf8 tools/check-portrait-key.py
node tools/e2e-run.js
node tools/qa-consistency.js
```

- 报告末尾给出角色级 PASS/PARTIAL/FAIL 数、仍会影响玩家推进的必改项、是否可作为本轮收口。
