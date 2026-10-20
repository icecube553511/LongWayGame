# 角色形象演进 · 第二轮返修与主验收

> 性质：**主 agent 验收记录，不是独立评审**。第一轮独立评审见
> `docs/reviews/CHAR-PROGRESSION-SPEC.md` §8；本文件记录按那份意见返修后的结果。
>
> 当前交付：35 个角色 / **169 个剧情状态** / **623 个状态表情图** / 19 个章内 beat。

## 1. 第一轮独立评审的主要问题

第一轮为 `PARTIAL`：角色级 PASS 17 / PARTIAL 18 / FAIL 0；文件级 FAIL 5 项。
主要硬伤是：

1. `zhou_ch08_chishui` 的 stern/sad/worry 与 calm 不同机位；
2. `he_xiaomei_ch03_xiangjiang_sad` 混入伤员和桌面，不是单人胸像；
3. 雪山造型里出现厚围巾、毛边或干净围裙，违背“单衣”；
4. 草地与腊子口复用了 ch16 积雪造型；
5. 部分洋红边在普通尺寸/体积闸门下不可见。

## 2. 本轮实际返修

| 面 | 处理 |
|---|---|
| 洋红残边 | `neko-post.py` 改为从四角选最像洋红的一角，并在 alpha 模式、缩放后分别清除洋红色相边缘；全量重烘焙 |
| 表情同机位 | `zhou_ch08_chishui` 的 stern/sad/worry、`he_xiaomei_ch03_xiangjiang` 的全部表情重新从 calm 派生 |
| 雪山服装 | 重出 `mao_ch16_snow`、`xie_juezai_ch16_snow`、`he_xiaomei_ch16_snow`、`li_tiezhu_ch16_snow`，去掉厚棉衣/毛领，保留霜与单衣 |
| 草地/腊子口 | 新增 9 个冷湿状态，覆盖 ch17/ch18；不再让草地和腊子口直接使用 ch16 积雪图 |
| 小满弧光 | ch17 改为饥饿凹颊、无铜锅；ch17 pot beat 才背锅；ch20 改为 17 岁、军装合身 |
| 角色辨识 | 重出毛泽东 41 岁病容、小满偏大军装、朱德圆脸宽颌、聂荣臻去圆眼镜、林彪窄脸薄眉、徐向前四方面军标识 |
| 引擎 | 修复“先 show 再 hide / 同槽多人并发加载”把已退场角色复活、或说话人没上屏的竞态；直接使用槽位 `<img>` 加载 |
| 合约 | 明确允许带 tRNS 的调色板 PNG；增加 `check-portrait-key.py` 像素闸门 |
| 无用图 | `xiaoman_ch16_snow_smile`、`xiaoman_ch01_departure_weak` 等未登记状态图移出成品目录 |

## 3. 机器验证（最终）

```text
node tools/build-portrait-states.js --check
  35 角色 / 169 状态 / 282 章映射 / 19 个章内变化

node tools/check.js
  立绘 280/280；形象演进 623/623；检查通过

node tools/check-assets.js
  规范检查通过

python -X utf8 tools/check-portrait-key.py
  立绘洋红残留检查：801 张；洋红残留 0 张超阈值

python -X utf8 tools/qc-portraits.py --csv tmp/qc-portraits-round2.csv
  表情图 454 张；硬伤 0 张；姿态/构图警告 15 张

node tools/e2e-run.js
  20/20 章走完；24062 步；0 条 JS 报错

node tools/qa-consistency.js
  20 章 / 4449 句台词 / 违规 0 条
```

beat 实拍：

```text
ch03 捡到绑腿 → xiaoman_ch03_binding
ch13 戴银饰 → liu_bocheng_ch13_necklace / xiao_yedan_ch13_oath
ch17 背铜锅 → xiaoman_ch17_pot
```

## 4. 主验收结论

**PASS（满足本轮用户目标）**

- 35 个角色全部有剧情造型；
- 169 个状态与章节/章内节点对应；
- 衣服/装备随行军累积磨损，在明确补给处更新；
- 表情、动作、手持/背负物、头部方向与视线均有状态字段和成品；
- 所有状态图存在，0 洋红残留，0 JS 报错，全剧舞台一致性 0 违规；
- 雪山、草地、腊子口不再共用同一张积雪造型。

**保留的审美细节（不阻塞本轮收口）**

- `shi_zhu_ch15_burned` 的烧伤因上游内容策略未再重出，当前用焦黑衣衫、烟灰和绷带克制表现；
- 五位老人的长衫/军装领口仍有轻微风格差异；
- 帽星与褪色领章在不同状态间还没有做到完全统一；后续可按 `docs/reviews/CHAR-PROGRESSION-SPEC.md` §8.4 的系统性修法再做一轮美术统一。
