# 立绘情景闭环收口

> 日期：2026-10-27
>
> 性质：主 agent 收口记录。独立审核与复判分别见
> `PORTRAIT-SCENE-AUDIT-A/B.md`、`PORTRAIT-SCENE-REAUDIT-A.md`、
> `PORTRAIT-SCENE-REAUDIT-B1/B2.md`、`PORTRAIT-SCENE-REAUDIT-FINAL.md`。

## 结论

**PASS。**

- 对话关系与视线：高风险双人场景经实拍复核，现有站位均能形成合理视线关系，
  没有需要机械交换左右槽位的误判。
- 表情与情节：空袭死伤、误食毒草、石柱牺牲、炸碉堡后的 4 个危险拍点已改为
  `calm` / `weak` / `worry` / `sad`，独立复判全部 PASS。
- 立绘完整性：25 个桌面状态、何晓梅医疗状态、透明洞、底边硬切和主要机位差
  均已修正；最终两轮独立复判 PASS。
- 无新增人物 id 或表情枚举；所有新图都由既有 Neko 管线生成和烘焙。

## 验证

```text
node tools/build-portrait-states.js --check
  35 角色 / 170 状态 / 282 章映射 / 19 个章内变化

node tools/check.js
  立绘 280 / 280；形象演进 625 / 625；检查通过

node tools/check-assets.js
  规范检查通过

python -X utf8 tools/check-portrait-key.py
  909 张；洋红残留 0 张超阈值

python -X utf8 tools/qc-portraits.py
  455 张；硬伤 0；构图警告 0

node tools/lint-story.js
  20 章 / 6656 步 / 0 错误

node tools/e2e-run.js
  20 / 20 章；24094 步；JS 报错 0

node tools/qa-consistency.js
  4465 句台词；违规 0

node tools/validate-svg.js
  390 个文件；全部通过

体积自检
  超过本档上限的文件数 = 0
```

## 维护规则

后续新增或重出立绘时，继续遵守
`docs/tasks/PORTRAIT-SCENE-LOOP.md`：审核员只出工单，修正员只按工单落盘，
独立复判通过后才由主 agent 提交并推送。循环由 Codex 心跳自动复查；
没有新变更或没有未结 P0/P1 时保持安静。
