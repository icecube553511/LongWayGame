# 剧本写作简报（所有剧本 agent 必读）

## 0. 你只负责一件事

把分配给你的章节写成 `src/story/chNN.js`。**除了你自己名下的文件，不要改动仓库里任何其他文件**
（不改 `docs/SPEC.md`、`docs/STORY_BIBLE.md`、`src/story/manifest.js`、不改别人的章节文件）。
需要新增背景 id、人物 id 或改契约 → 发消息给 `/root`，不要自己动手。

## 1. 必读顺序（每次接到新任务都要重新确认）

1. `docs/SPEC.md` —— **唯一技术契约**。§2 是剧本 DSL，§7 是字数/步数硬指标，§8 是文风红线。
2. `docs/STORY_BIBLE.md` —— 史实与人物设定，**以它为准**，不得改写人物设定表。
3. 你的目标章节文件（如果已存在，就在其基础上增补，不要推倒重来）。

## 2. 交付物格式

```js
/* ch07 · 遵义会议 */
(function () {
  window.STORY = window.STORY || {};
  window.STORY.ch07 = {
    id: 'ch07',
    num: 7,
    title: '遵义会议',
    date: '1935年1月',
    place: '贵州·遵义',
    bgm: 'council',
    summary: '一句话梗概（20-40 字）',
    titleCard: { text: '第七章', sub: '遵义会议', date: '1935年1月15日—17日', place: '贵州·遵义' },
    steps: [ /* … */ ],
    archive: [ /* … */ ]
  };
})();
```

`id` / `num` / `title` / `date` / `place` 必须与 `src/story/manifest.js` 完全一致。
最后一步必须是 `{ t: 'end', next: 'ch08' }`（`ch20` 写 `{ t: 'end' }`）。

## 3. 硬指标（自检必须全绿，警告也要清零）

| 指标 | 下限 |
|---|---|
| 正文汉字数（`say`/`narr`/`think`/`note`/`title`/`archive.text`/选项文本合计） | **≥ 3000**，目标 3800–5000 |
| `steps` 总数（含 `if.then`/`if.else` 内嵌） | **≥ 90**，目标 120–170 |
| `choice` | **≥ 2**（建议 3–4），每个选项都要用 `set` 改动 `morale`/`trust`/`hope` 或写 `flag.*` |
| `archive`（史料档案短文，每条 120–300 字） | **≥ 3**，建议 4–5 |
| 本章有台词的人物 | **≥ 8 个**（全剧 35 个 id 都要被用到，见 §5） |
| 用到的背景 | **≥ 4 个**，且必须来自 SPEC §4.1 的固定表 |

## 4. 自检命令（提交前必跑，必须 0 错误 0 警告）

```
node tools/lint-story.js src/story/ch07.js
```

这个检查器实现的就是 SPEC 的验收规则：step 类型、背景 id、人物 id、表情、`goto`/`label` 死链、
`set` 变量、`unlock` 档案引用、字数/步数/选项/档案数量。**它报的警告也要全部消掉。**
如果你觉得检查器的某条判断与 SPEC 冲突，**不要改检查器**，停下来发消息给 `/root`。

## 5. 全剧人物覆盖表（避免所有人都在写毛泽东）

写作时优先把下列人物"分配"给你的章节；每人至少有一句有分量的台词：

- `mao` `zhou` `zhu` `peng` `lin` `nie` `liu_bocheng` `ye_jianying`
- `zhang_wentian` `wang_jiaxiang` `bogu` `lide`
- `chen_yun` `he_zizhen` `deng_yingchao` `xu_teli` `dong_biwu` `lin_boqu` `xie_juezai`
- `zhang_guotao` `xu_xiangqian` `li_xiannian` `xiao_yedan`
- 虚构人物（情感主线，必须每 1–2 章出现）：`xiaoman` `li_tiezhu` `he_xiaomei` `guo_daniang` `shi_zhu` `a_yue` `wu_laoliu` `san_wa`
- 群众：`soldiers` `villagers` `yi_people` `narrator`

**小满（`xiaoman`）是全剧视角人物**，除会议类章节外都应出场；`narrator` 用于时代背景旁白，
姓名条通常不显示，用 `narr` 而非 `say`。

## 6. 文风（SPEC §8 的展开）

**要**
- 冷峻、克制、白描。情绪靠细节：一双磨穿的草鞋、半袋炒面、冻硬的绑腿、锅底最后一点米汤。
- 对白短。一句一行，允许"……"和停顿。会议上的一句话可以只写八个字。
- 每章至少复用 2 个贯穿意象（号、铜顶针、铜锅、草鞋、门板、地图、火）。
- 用 `narr` 提供史实锚点（日期、番号、地名、人数），用 `note` 做一句史料小注（可选）。
- 结局不同但史实不变：选项只影响 `morale`/`trust`/`hope` 与人物关系描写，**不得改变历史结论**。

**不要**
- 不喊口号、不用感叹号堆情绪、不写"我们知道此战必胜"这类后见之明。
- 不写血腥猎奇。牺牲用留白：写"他没有回来"，不写伤口细节。
- 不用现代腔、网络语、脏话、日语腔。
- 不贬损任何历史人物（含博古、李德、张国焘）：写他们的局限，不写丑化。
- 不虚构党中央的决议内容；会议结论必须与史实一致。
- 同一段连续出现 3 个以上 `say` 只换说话人不换场景 → 拆成 `narr` 与动作描写（`fx`/`bg`/`show`）。

## 7. 分镜节奏建议（每章）

章内结构大致按这个骨架写，不要平铺直叙：

1. 冷开场（`bg` + 2–4 句 `narr`，给出时间地点与时代压力）
2. 小人物困境（虚构人物 + 具体任务/伤口/饥饿/脚上的泡）
3. 事件升级（历史人物登场，`title` 卡切时间/地点）
4. **choice 1**：一线选择（跟队还是留下伤员？把炒面给谁？）
5. 冲突与代价（战斗/翻山/涉水/会议争论，`fx` 特效）
6. **choice 2**：价值选择（信任谁、说不说真话、要不要回头）
7. 史实落点（`archive` 解锁，`narr` 给出结论与数字）
8. 余韵（一个意象收束整章，配 `bg_camp_fire` / `bg_stretcher` 之类）

## 8. 提交时回报格式

```
完成：ch07（遵义会议）
文件：src/story/ch07.js
自检：node tools/lint-story.js src/story/ch07.js → 0 错误 0 警告
数据：steps=132 / 正文汉字=4210 / choice=3 / archive=4 / 说话人物=12
本章说话人物：mao, zhou, bogu, lide, zhang_wentian, wang_jiaxiang, peng, xiaoman, …
本章使用的背景：bg_zunyi, bg_council_hall, bg_rain_march, bg_camp_fire
一句话梗概：…
```
