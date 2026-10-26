# 立绘与对话情景一致性闭环

> 任务来源：用户 2026-10-27 要求。
>
> 目标：让玩家实际看到的立绘朝向、站位、表情、姿态与当前对白和情景一致；
> 立绘本身完整、干净、无家具或场景残片，必要时才新生成剧情造型。

## 1. 闭环

```text
第一组：独立审核
  ├─ A：对话关系、视线朝向、舞台站位、表情与情节
  └─ B：构图完整性、家具/场景残片、裁切、道具接触点、人物连续性
          ↓ 可执行工单
第二组：修正
          ↓ 改动清单与自检输出
第一组：原审核员逐条复判
          ↓ 仍有 FAIL / PARTIAL
第二组：继续修
          ↓ 0 条 P0 / P1，P2 有明确结论
主 agent：全量回归、提交、推送、收口
```

自评不算验收。审核员不改源码、素材或工具，不跑 git；修正员不改审核报告。

## 2. 用户给出的三条判据

1. **朝向关系**：多人对谈时，画面站位与人物面向必须服务于彼此的视线关系。
   如果左边人物面向左、右边人物面向右，二人实际看向画面外，应优先通过交换槽位、
   调整站位或选用同角色相反朝向造型来修正。
   三人或更多人的会话按同样的关系判断，不要求所有人看向同一处。
2. **表情与情节**：刚经历轰炸、死亡、重伤、饥寒、失败等负面事件时，
   不得出现微笑、欣慰、轻松、庆祝等不合时宜的表情；可以有克制的坚定与希望，
   但眉眼和嘴角不能读成喜悦。
3. **立绘完整性**：允许人物拿剧情道具，但不允许桌面、椅子、床、门框、帐篷杆等
   家具或场景残片混入透明立绘；人体与随身道具不得被生硬切断。
   以当前“半身特写”契约为准，不因“完整”而擅自改成全身。

## 3. 范围与取证

- 覆盖 `src/story/ch01.js` 至 `ch20.js` 的全部实际可见会话，包括分支。
- 必须用展开后的章内步号定位；报告同时附原句/连续片段，便于复现。
- 先做机器筛选，再做原生分辨率目视复核。不能用缩小拼版判断块面或裁切。
- 对特殊状态，读取 `docs/reviews/char-progression-spec.json` 的 `head.turn`、
  `head.pitch`、`head.gaze`、`pose_cn`、`props_cn` 和 `avoid_en`。
- 实拍优先使用现有 `tools/e2e-steps.js` 或 `tmp/engine/game-test.html`；
  截图放入 `tmp/`，不要提交。
- 重点章节至少抽样原生图：`ch03` 湘江、`ch05` 黎平、`ch07` 遵义、
  `ch08` 土城、`ch15` 泸定、`ch16` 雪山、`ch17` 草地、`ch18` 腊子口、
  `ch19` 吴起、`ch20` 会宁。

## 4. 审核报告格式

报告路径：

- `docs/reviews/PORTRAIT-SCENE-AUDIT-A.md`
- `docs/reviews/PORTRAIT-SCENE-AUDIT-B.md`

每条问题必须包含：

```text
ID：PSL-A01（或 PSL-B01）
判定：FAIL / PARTIAL
严重度：P0 / P1 / P2
章节：chNN
步号：展开后步号
原句：用于复现的连续原文片段
人物与槽位：who / slot / portraitId（如果可知）
证据：截图路径、命令输出或画面具体位置
问题：一句话说清玩家看到什么错
修法：可执行动作；画面问题给可直接使用的英文提示词修正句
预计文件：story / char-progression spec / generated portrait / engine / other
```

优先级：

- `P0`：直接破坏叙事或画面，例如轰炸后微笑、人物被家具截断、关键人物全被裁掉。
- `P1`：明显穿帮，例如多人朝画面外说话、同段表情跳机位、道具悬空。
- `P2`：不影响理解的打磨，例如轻微转头不自然、边缘略硬。

## 5. 修正边界

- 优先采用已有立绘与现有剧情造型。
- 能通过剧本 `slot`、`show` 顺序、`portraitId`、镜头切换修正的，不重画。
- 确有缺失时才新增状态；状态必须写入
  `docs/reviews/char-progression-spec.json`，再由既有管线生成。
- 不许手工塞图，不许直接编辑 `assets/generated/**`。
- 不改人物 id、表情枚举、资源路径规则。
- 冻结文件如确需修改，先由 `/root` 决定并同步契约。

## 6. 修正记录

修正员写 `docs/fixes/PORTRAIT-SCENE-LOOP.md`，逐条记录：

```text
ID
改动文件
关键改动
为什么使用已有图 / 为什么新增造型
自检命令与真实输出
未完成项
```

新增或重出立绘时，记录：

- 状态 id；
- 英文提示词或 `--extra` 修正句；
- 使用的参考图；
- 生成/烘焙命令；
- 原生分辨率截图路径；
- 体积与透明边检查结果。

## 7. 复判与收口

原审核员必须逐条给出最终 `PASS` / `FAIL` / `PARTIAL`，并附自己的复验证据。
主 agent 最终至少运行：

```powershell
node tools/build-portrait-states.js --check
node tools/check.js
node tools/check-assets.js
python -X utf8 tools/check-portrait-key.py
python -X utf8 tools/qc-portraits.py
node tools/lint-story.js
node tools/e2e-run.js
node tools/qa-consistency.js
```

动过烘焙参数或新增位图时，再跑体积自检、SVG 校验和定点实拍。
只有 0 条 P0 / P1、全量闸门通过、截图证据齐全，才可收口。
