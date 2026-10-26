# 立绘情景闭环 · 修正后独立复判 A

> 性质：独立复判，由未参与修正的审核 A 重新取证；不是修正组自评。
>
> 范围：`PSL-A01`—`PSL-A04` 的表情、切换时机和同拍展示。
> 只读源码与现有立绘，不修改仓库，不执行 git。

## 0. 结论

**PASS。**

- `PSL-A01`：PASS
- `PSL-A02`：PASS
- `PSL-A03`：PASS
- `PSL-A04`：PASS

四个拍点均使用已有立绘；危险、伤亡和牺牲语境中不再出现可读成喜悦的上扬嘴角。

## 1. 逐条复判

### PSL-A01 · PASS · ch02 空袭后徐特立

证据：

- 源码：`src/story/ch02.js` 中“五十里。”已使用 `face:'calm'`；
  三娃退场后新增 `hide: xiaoman`。
- 独立实拍：`tmp/e2e/reaudit-a-ch02.png`。
- 截图横幅：`错误 0 条`，背景为 `bg_rain_march.png`，徐特立实际加载
  `xu_teli_ch01_start_calm.png`。
- 画面：仍能看到空袭后烟柱、泥水和倒伏战士，但徐特立嘴角平直，未读成欣慰或轻松；
  小满不在可见舞台上。

判定：**PASS。**

### PSL-A02 · PASS · ch17 三娃误食毒草

证据：

- 源码：“我留着。我不饿。”使用 `weak`；重新出场时使用 `worry`。
- 独立实拍：`tmp/e2e/reaudit-a-ch17b.png`。
- 截图横幅：`错误 0 条`，实际可见立绘为
  `san_wa_ch17_grassland_worry.png` 与
  `he_xiaomei_ch17_18_coldwet_fierce.png`。
- 画面：何晓梅喊“吐出来！”时，左侧三娃眉眼收紧、嘴角平直；右侧何晓梅为惊怒表情。
  两处都不再是笑脸。

判定：**PASS。**

### PSL-A03 · PASS · ch18 石柱牺牲消息

证据：

- 源码：在“石柱教过我编鞋……”之前新增
  `show san_wa face:'sad' slot:'right'`。
- 独立实拍：`tmp/e2e/reaudit-a-ch18-death.png`。
- 截图横幅：`错误 0 条`；可见立绘为
  `xiaoman_ch18_lazikou_sad.png` 与
  `san_wa_ch18_lazikou_sad.png`。
- 画面：小满说出“他说完这句话，第二天就上了泸定桥”时，两人均已呈悲伤表情。
  右侧三娃不再保留上一拍的笑脸。

判定：**PASS。**

### PSL-A04 · PASS · ch18 炸碉堡陈述

证据：

- 源码：“我炸了一个碉堡。真的。”已使用 `face:'calm'`。
- 独立实拍：`tmp/e2e/reaudit-a-ch18-bunkerb.png`。
- 截图横幅：`错误 0 条`；三娃实际加载
  `san_wa_ch18_new_shoes_calm.png`，下一句仍保持同一平静表情。
- 画面：三娃仍有战后黑灰和疲惫感，但没有兴奋上扬的嘴角或庆祝姿态；
  紧接“那个大个子呢？”时不会形成错误的胜利情绪。

判定：**PASS。**

## 2. 机器验证

```text
node tools/lint-story.js src/story/ch02.js
  1 章 / 344 步 / 3256 汉字 / 3 个选项 / 4 条档案 / 0 错误

node tools/lint-story.js src/story/ch17.js
  1 章 / 329 步 / 3307 汉字 / 3 个选项 / 5 条档案 / 0 错误

node tools/lint-story.js src/story/ch18.js
  1 章 / 347 步 / 3233 汉字 / 3 个选项 / 4 条档案 / 0 错误

node tools/check.js
  20 章 / 6656 步 / 61278 汉字
  立绘 280 / 280；形象演进 625 / 625
  检查通过（仅既有 narrator 未出场警告）

node tools/qa-consistency.js
  20 章 / 共 4465 句台词 / 违规 0 条
```

## 3. 取证限制

`tools/e2e-steps.js` 在部分并行运行中出现 DOM 回读失败，但成功截图自带的状态横幅均为
`错误 0 条`，且可见立绘文件名与画面表情一致；同时完整 `check.js` 和
`qa-consistency.js` 已独立通过。该探针限制不影响本轮四条表情复判。

## 4. 复判结论

`PSL-A01`—`PSL-A04` 全部满足原审核验收标准，可由主 agent 收口。
