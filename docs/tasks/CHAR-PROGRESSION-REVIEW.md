# 角色形象演进需求书（第二组先做）

> 任务：为《长征·万水千山》的全部 35 个角色梳理**随剧情连续变化**的立绘需求。
> 本文件由 `/root` 下发。第二组只写评审/需求文档，不改源码、剧本、美术资源或生成物。

## 1. 必读

按 `AGENTS.md` §1 的顺序读：

- `docs/SPEC.md`（人物 id、表情枚举、立绘规格）
- `docs/PRODUCTION_SPEC.md`（管线、评审、体积、独立性）
- `docs/AGENT_BRIEF.md`
- `docs/ART_DIRECTION.md`（35 人设计表）
- `docs/STORY_BIBLE.md`（史实和人物弧光）
- 20 章 `src/story/ch01.js` … `ch20.js` 的实际出场与对白

现有的 `tmp/batch2_specs.json` / `batch3_specs.json` / `batch4_specs.json` 是旧草稿，
存在非法表情（如 `relieved`、`determined`）、章节错位等问题，**只能当线索，不能当依据**。

## 2. 目标

先于出图组给出每个角色在剧情中的形象变化要求：

1. 服装与装备随行军、战斗、风雪、渡河而逐渐破旧、沾泥、缺损；
2. 遇到明确的补给、整编、换装、会师物资时，衣物/鞋袜/装备要有可解释的更新；
   剧情没有补给依据的地方不得凭空变新；
3. 受伤、包扎、担架、病弱等状态符合对应章节；
4. 每个状态有符合剧情的手持/背负物品；
5. 每个状态明确头部姿态（左右扭头、上下俯仰、视线方向），变化克制；
6. 表情只使用契约里的 8 种：`calm stern smile sad worry fierce weak dawn`；
7. 35 个角色都要覆盖，包括 `soldiers`、`villagers`、`yi_people`、`narrator`；
8. 同一角色跨章保持脸型、年龄、帽型、标志性道具连续，不换人。

## 3. 产物

写两个文件：

- `docs/reviews/CHAR-PROGRESSION-SPEC.md`：给人读的判定依据、章节依据、例外和风险。
- `docs/reviews/char-progression-spec.json`：给生成组直接消费的机读清单。

JSON 结构如下（字段名不得改）：

```json
{
  "version": 1,
  "characters": {
    "xiaoman": {
      "name": "小满",
      "chapterStates": {
        "ch01": "xiaoman_ch01_departure",
        "ch02": "xiaoman_ch01_departure"
      },
      "states": {
        "xiaoman_ch01_departure": {
          "label": "于都出发",
          "chapters": ["ch01", "ch02"],
          "wear": 1,
          "dirt": 1,
          "injury": "none",
          "outfit_cn": "不合身的灰蓝军装，袖口偏长，领章褪色",
          "equipment_cn": "军号斜挎，松绑腿，草鞋",
          "head": {
            "turn": "right 8deg",
            "pitch": "down 2deg",
            "gaze": "forward"
          },
          "pose_cn": "站直，肩略收，右手自然扶着号带",
          "props_cn": ["黄铜军号", "旧帆布号带"],
          "faces": ["calm", "worry", "sad"],
          "appearance_en": "English positive description only: age, face identity anchors, exact clothing wear, dirt, injury, equipment, head orientation and gaze, pose and props",
          "avoid_en": "English negative constraints specific to this state"
        }
      },
      "beats": [
        {
          "chapter": "ch03",
          "after_text": "小满在江边的一块石头上，捡到一条绑腿。",
          "portraitId": "xiaoman_ch03_binding",
          "reason": "捡到石柱的绑腿后，右臂缠布条，背包更沉"
        }
      ]
    }
  }
}
```

要求：

- `wear` / `dirt` 为 0–5 的整数；只能单调变旧，明确补给或换装处可回落。
- `chapterStates` 必须覆盖该角色**实际出场的每一章**；同一状态可对应多章。
- `faces` 必须覆盖该角色在这些章实际使用的全部表情（含 `calm`），从剧本中逐章统计。
- `beats` 只列章内确实有可见变化的节点；`after_text` 必须是剧本原文的连续片段。
- 状态 id 使用小写英文、数字和下划线，全局唯一；建议 `{charId}_chNN_{短语义}`。
- `appearance_en` 要可直接拼进出图提示词：只写画面，不写禁令；禁令放 `avoid_en`。
- 所有状态必须遵守：单人、600×900 半身、透明背景、低多边形刻面、左上硬光、
  不画文字、不新增人物 id、不改变人物表。

## 4. 第二阶段的检查职责

生成组交稿后，第二组要独立检查：

- 清单与剧本、史实是否一致；
- 同一角色是否同脸、同年龄、同标志物；
- 磨损是否连续，补给更新是否有剧情依据；
- 道具接触点、手持/背负是否自然，头部角度与视线是否克制；
- 表情是否与对白情绪相符；
- 8 种表情是否仍可区分；
- 资源是否齐、是否有 JS 报错、体积是否过档；
- 每张关键图至少看原生分辨率或局部裁剪，不以缩图判块面。

判定只能是 `PASS` / `PARTIAL` / `FAIL`，每条 `PARTIAL` / `FAIL` 写出可直接执行的修法。
报告追加到 `docs/reviews/CHAR-PROGRESSION-SPEC.md` 末尾（保留第一阶段内容）。

## 5. 禁区

- 不改 `src/story/**`、`src/engine/**`、`src/data/**`、`tools/**`、`art/**`、`assets/**`；
- 不跑 git；
- 不手工塞图；
- 不把“自评”写成独立验收。
