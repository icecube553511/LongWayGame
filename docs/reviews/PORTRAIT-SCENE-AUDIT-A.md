# 立绘情景审核 A · 对话关系与表情

> 性质：第一组独立审核，**不是修正组自评**。
>
> 范围：`src/story/ch01.js`—`ch20.js` 的全部 `show` / `say` / `think`
> 及实际槽位变化；重点复核两人和多人的视线关系、剧情形位和表情。
>
> 审核时共享工作区仍有一个先前启动的批量表情生成进程在写
> `assets/generated/chars/`。下列截图均记录当时实际加载的文件名；修正后需要重新复拍。

## 0. 结论

- **P0：3 条**
- **P1：1 条**
- **P2：0 条**
- 已抽查的高风险对谈中，**未发现需要交换左右槽位的确定缺陷**。
  下列“已核对”场景的实际朝向都成立或共同看向同一目标；但表情问题会破坏这些场景。

## 1. P0：空袭死伤后，徐特立在仍冒烟的稻田里微笑

```text
ID：PSL-A01
判定：FAIL
严重度：P0
章节：ch02
步号：展开后 93（源文件 ch02.js:107）
原句：飞机走了。稻田里站起来一片泥人。 / 有人起不来了。 / 特立同志，你今天走了多少？ / 五十里。
人物与槽位：
  left  xu_teli / xu_teli_ch01_start / smile
  center xiaoman / xiaoman_ch02_rain / calm
  right xie_juezai / xie_juezai_ch01_start / calm
证据：
  tmp/e2e/audit-a-ch02-smile-after.png
  探针读到 frame 95/317，背景 bg_air_raid_paddy.png；
  徐特立实际加载 xu_teli_ch01_start_smile.png，嘴角明显上弯。
问题：
  同屏背景仍是低空飞机、泥水爆炸和倒下的战士，前一段刚明确“有人起不来了”。
  徐特立却在回答“五十里”时露出轻松的暖笑，直接消解死亡场景的沉重感。
修法：
  把 ch02.js:107 的 face:'smile' 改为 face:'calm'；
  若仍要表现“旧伤不响”的克制坚韧，只能用不带笑意的 stern 或克制的 dawn。
  不要把这张 smiling portrait 留给后续“伤是旧的。路是新的。”使用。
预计文件：src/story/ch02.js
```

## 2. P0：三娃误食毒草时仍在笑

```text
ID：PSL-A02
判定：FAIL
严重度：P0
章节：ch17
步号：展开后 157—164（源文件 ch17.js:183、189、194）
原句：
  我留着。我不饿。
  这种最嫩。我尝了一口，有点苦，但是能吃。
  吐出来！
人物与槽位：
  left  san_wa / san_wa_ch17_grassland / smile
  right he_xiaomei / he_xiaomei_ch17_18_coldwet / fierce
证据：
  tmp/e2e/audit-a-ch17-pair.png
  探针读到 frame 164/324；画面中何晓梅明显惊怒，三娃却保持笑脸。
  assets/generated/chars/san_wa_ch17_grassland_smile.png 原生图也是明显上弯嘴角。
问题：
  三娃处在草地断粮、嘴唇冻裂出血、误食毒草的连续危险情境中。
  “我留着。我不饿”和“这种最嫩”都用笑脸表现，像轻松发现食物；
  紧接着何晓梅喊“吐出来！”时，笑脸仍然停留在台上，和台词直接冲突。
修法：
  1. ch17.js:183 的 smile 改为 weak；保留“把皮带留到最后”的克制。
  2. ch17.js:189 的 show 把 face:'smile' 改为 worry。
  3. 让何晓梅显示“吐出来！”之前，三娃已经是 worry/weak；
     必要时在 ch17.js:192 前插入 `show` 明确切到 worry。
  4. san_wa_ch17_grassland_smile.png 若以后仍会被引用，重出提示词追加：
     `tense unsmiling face, dry cracked lips, hollow cheeks, no smile, no cheerful eyes`
预计文件：src/story/ch17.js；
  若保留该表情资源，再改 docs/reviews/char-progression-spec.json 并沿 neko 管线重出。
```

## 3. P0：石柱牺牲消息出现时，三娃仍挂着上一拍的笑脸

```text
ID：PSL-A03
判定：FAIL
严重度：P0
章节：ch18
步号：展开后 50—51（源文件 ch18.js:63—65）
原句：
  石柱教过我编鞋。他说，鞋破了就编。
  他说完这句话，第二天就上了泸定桥。
人物与槽位：
  left  xiaoman / xiaoman_ch18_lazikou / sad
  right san_wa / san_wa_ch18_lazikou / smile（当前显示），随后才切到 sad
证据：
  tmp/e2e/audit-a-ch18-death-line.png
  frame 51/330，文字为“他说完这句话，第二天就上了泸定桥。”，
  xiaoman 已加载 sad，右侧三娃仍实际加载 san_wa_ch18_lazikou_smile.png。
  tmp/e2e/audit-a-ch18-death-line3.png
  frame 53/330 才看到 san_wa_ch18_lazikou_sad.png，说明切换晚于该句。
问题：
  石柱死亡是全书关键情感节点。镜头切到 Xiaoman 说出死讯时，
  右侧三娃的笑脸仍在画面里，玩家先看到“笑”，下一页才看到悲伤。
修法：
  在 ch18.js:63（“石柱教过我编鞋……”）之前，用一个 `show`
  把三娃显式切到 sad/worry，确保下一句死亡信息出现时已经不是笑脸；
  不要再依赖后面的 `say face:'sad'` 才更新。
  同时把 ch18.js:53 “不看了。看了你又要说话。”的 smile 改为 weak，
  因为前文刚写他脚掉了一块皮。
预计文件：src/story/ch18.js
```

## 4. P1：炸碉堡后的兴奋笑，紧接同伴生死追问

```text
ID：PSL-A04
判定：PARTIAL
严重度：P1
章节：ch18
步号：展开后 215—219（源文件 ch18.js:259、263）
原句：
  我炸了一个碉堡。真的。
  我和一个苗族大个子一起。他把我举起来，我把手榴弹塞进去。
  那个大个子呢？
  ……
人物与槽位：
  right san_wa / san_wa_ch18_lazikou / smile，随后 sad
证据：
  assets/generated/chars/san_wa_ch18_lazikou_smile.png
  原生图是明显的上扬嘴角。
问题：
  这是刚结束的攻坚现场，三娃满手磨伤、部队正在清点伤亡；
  笑脸让“炸碉堡”读成兴奋战功，和紧接着“那个大个子呢？”的死亡落点相冲。
修法：
  把 ch18.js:259 的 smile 改为 calm 或 dawn，但保持目光亮、嘴角平；
  保留“孩子第一次参与爆破”的震动感，不把它演成庆祝。
预计文件：src/story/ch18.js
```

## 5. 已核对的视线与槽位

以下场景按“左槽人物应朝右/朝中心，右槽人物应朝左/朝中心”复核，
**未发现只靠交换左右槽位即可解决的确定错误**：

| 章 | 槽位 | 实拍 | 结论 |
|---|---|---|---|
| ch01 | 彭德怀 left / 谢觉哉 right | `tmp/e2e/audit-a-ch01-pair.png` | 彭右看、谢左看，成立 |
| ch04 | 小满 left / 谢觉哉 right | `tmp/e2e/audit-a-ch04-pair.png` | 小满右看、谢左看，成立 |
| ch08 | 周恩来 left / 刘伯承 right | `tmp/e2e/audit-a-ch08.png` | 两人共同俯看地图，非对视但关系成立 |
| ch12 | 刘伯承 left / 小满 right | `tmp/e2e/audit-a-ch12.png` | 刘右看、小满朝左/前，成立 |
| ch17 | 三娃 left / 何晓梅 right | `tmp/e2e/audit-a-ch17-pair.png` | 方向成立；问题只在三娃表情 |
| ch18 | 小满 left / 何晓梅 right | `tmp/e2e/audit-a-ch18-pair.png` | 两人相对，成立 |

静态扫描 `tmp/audit-stage-gaze.js` 依据 `head.gaze` 给出的
彭/谢、小满/谢、周/刘、刘/小满等候选，经实拍均被推翻为“共同看物”或
“头部姿态描述与最终渲染略有差异”，**不据此要求机械换位**。

## 6. 需第二组遵守的修正原则

1. 先改剧本表情键，能让已有 `calm/weak/worry/sad` 立绘满足剧情的，不重画。
2. 危险/死亡段落先保证“非说话角色”的脸也已经切到安全表情，再推进主句。
3. 允许克制的坚定、疲惫和悲伤；不允许把“勇敢”画成上扬嘴角。
4. 修完后由原审核员重新实拍 PSL-A01—A04 的同一拍，不能只跑静态 lint。

## 7. 复验命令

```powershell
node tools/lint-story.js src/story/ch02.js
node tools/lint-story.js src/story/ch17.js
node tools/lint-story.js src/story/ch18.js
node tools/check.js
node tools/qa-consistency.js
```

并重新生成下列截图：

```text
ch02：空袭后“五十里”这一句
ch17：何晓梅喊“吐出来！”时
ch18：“他说完这句话，第二天就上了泸定桥。”时
ch18：“那个大个子呢？”前后
```

