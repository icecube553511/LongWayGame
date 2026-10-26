# 立绘情景闭环 · 剧本修正 A

> 修正范围：`PSL-A01`—`PSL-A04`。
>
> 只改 `src/story/ch02.js`、`src/story/ch17.js`、`src/story/ch18.js`，
> 未改立绘、形象演进清单、工具或其它章节，未执行 git。

## 1. 逐条处理

### PSL-A01 · ch02 空袭后微笑

- `ch02.js`：徐特立回答“五十里”的 `face:'smile'` 改为 `face:'calm'`。
- 同一段复现时发现上一拍的小满仍占着中槽，和“五老走在队伍中间”的画面不符；
  在三娃退场后补 `{ t: 'hide', who: 'xiaoman' }`，让五老这一段只保留实际出场的两人。
- 复拍：`tmp/e2e/fix-a-ch02.png`。背景仍是空袭后的冒烟稻田，徐特立加载
  `xu_teli_ch01_start_calm.png`，小满已退场，页面错误 0。

### PSL-A02 · ch17 三娃误食毒草时微笑

- `ch17.js`：“我留着。我不饿。”由 `smile` 改为 `weak`。
- 第五天发现野菜的出场由 `smile` 改为 `worry`。
- 复拍：`tmp/e2e/fix-a-ch17.png`。三娃实际加载
  `san_wa_ch17_grassland_worry.png`，何晓梅切换到
  `he_xiaomei_ch17_18_coldwet_fierce.png`；危险段不再使用笑脸，页面错误 0。

### PSL-A03 · ch18 石柱牺牲信息出现时仍微笑

- `ch18.js`：“不看了。看了你又要说话。”由 `smile` 改为 `weak`。
- 在“石柱教过我编鞋……”前显式 `show` 三娃为 `sad`，不再等下一句才切表情。
- 复拍：`tmp/e2e/fix-a-ch18-death.png`。石柱牺牲信息切到小满时，右侧三娃已加载
  `san_wa_ch18_lazikou_sad.png`，页面错误 0。

### PSL-A04 · ch18 炸碉堡后兴奋笑

- “我炸了一个碉堡。真的。”由 `smile` 改为 `calm`。
- 复拍：`tmp/e2e/fix-a-ch18-bunker.png`。三娃在“我炸了碉堡”到“他说我轻”的连续段
  保持平直嘴角，不再读成庆祝；页面错误 0。

## 2. 自检命令与真实输出

```text
node tools/lint-story.js src/story/ch02.js
  2 章 / 344 步 / 正文 3256 汉字 / 3 个选项 / 4 条档案
  ✓ 无错误。

node tools/lint-story.js src/story/ch17.js
  17 章 / 329 步 / 正文 3307 汉字 / 3 个选项 / 5 条档案
  ✓ 无错误。

node tools/lint-story.js src/story/ch18.js
  18 章 / 347 步 / 正文 3233 汉字 / 3 个选项 / 4 条档案
  ✓ 无错误。

node tools/check.js
  20 章 / 6656 步 / 61278 汉字
  立绘 280 / 280；形象演进 625 / 625
  检查通过（仅既有 narrator 未出场警告）。

node tools/qa-consistency.js
  20 章 / 共 4465 句台词 / 违规 0 条

node tools/e2e-run.js 1 8 2000000 ch02,ch17,ch18
  ch02 1334 步 ✔；ch17 1503 步 ✔；ch18 1468 步 ✔
  3 章全部走完，JS 报错 0。
```

定点截图：

```text
tmp/e2e/fix-a-ch02.png
tmp/e2e/fix-a-ch17.png
tmp/e2e/fix-a-ch18-death.png
tmp/e2e/fix-a-ch18-bunker.png
```

`e2e-steps.js` 在部分运行中未取到 DOM 回读文本，但截图横幅仍显示
`错误: 0 条`；上述章节的完整 `e2e-run.js` 也独立确认 0 条 JS 报错。

## 3. 未完成 / 交付给复判

- 以上修正全部使用已有表情，没有新生成立绘。
- 需要第一组审核 A 按同一拍重新看图，确认 A01—A04 的判定。
- `ch18` 的探针会保留已退场槽位的旧 `src`，但截图只显示带 `on` 的槽位；
  首轮审核提到的“右侧三娃仍笑”已按实际可见图修正。
