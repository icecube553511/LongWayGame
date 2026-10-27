# 立绘增量复审：石柱与吴老六脸部刻面

> 性质：独立增量复审，不是修正组自评。
>
> 审核对象：提交 `d3b366d`、`bf29495` 引入的石柱 / 吴老六脸部多边形约束
> 与重出成品。

## 结论

**PASS。**

两名角色在既有两个大状态组中的脸型、年龄、帽型、发型、标志物保持连续；
新刻面没有引入透明洞、家具、地面、他人肢体或生硬横切边。
危险场景中的笑容资源已呈紧绷、不笑的面部，不再读成庆祝。

## 取证

总览：

- `tmp/current-shi_zhu.jpg`：本次变更的 45 张石柱成品；
- `tmp/current-wu_laoliu.jpg`：本次变更的 56 张吴老六成品；
- `tmp/reaudit-1132-shi-luding.jpg`；
- `tmp/reaudit-1132-shi-burned.jpg`；
- `tmp/reaudit-1132-shi-shoulder.jpg`；
- `tmp/reaudit-1132-wu-ch03.jpg`；
- `tmp/reaudit-1132-wu-ch16.jpg`。

原生分辨率重点查看：

```text
shi_zhu_ch08_shoulder_fierce.png
shi_zhu_ch15_luding_calm.png
shi_zhu_ch15_burned_fierce.png
wu_laoliu_ch03_xiangjiang_fierce.png
wu_laoliu_ch16_snow_calm.png
```

游戏内兼容性实拍：

- `tmp/e2e/reaudit-1132-wu.png`：ch03 点名段落，吴老六在左槽，
  完整显示头、肩、手、步枪、烟袋与记录本，背景遮挡自然；
- `tmp/e2e/reaudit-1132-shi.png`：ch15 泸定桥“冲锋号”段落，石柱在舞台中心，
  红旗、步枪、铁索与身体接触可信，画面未出现第二张石柱。

两张实拍横幅均为 `错误 0 条`。

## 逐角色结果

### 石柱 `shi_zhu`

| 状态组 | 判定 | 说明 |
|---|---|---|
| 基础表情组 | PASS | 圆脸、宽颌、黑短发、八角帽、红军胸像一致 |
| `ch01_start` | PASS | 青年体态与基础脸型连续，无换人 |
| `ch08_before` | PASS | 战尘与红旗状态可读，眼神、眉眼保持同一人 |
| `ch08_shoulder` | PASS | 右肩绷带和红旗连续；各表情只改变脸，不换机位 |
| `ch09_wounded` | PASS | 继续保留左臂包扎与旗手身份 |
| `ch14_dadu` | PASS | 大渡河状态保留枪、旗、帽形与面部结构 |
| `ch14_leg` | PASS | 腿伤为剧情必需局部，地面已移除 |
| `ch15_luding` | PASS | 头腰胸像自然收束；旗、枪、铁索接触可信 |
| `ch15_burned` | PASS | 烧伤、焦黑衣装与绷带可读；表情仍保持人物身份 |

### 吴老六 `wu_laoliu`

| 状态组 | 判定 | 说明 |
|---|---|---|
| 基础表情组 | PASS | 方脸、宽颌、深眼窝、低眉、旧疤与短须连续 |
| `ch01_start` | PASS | 老兵体态与基础脸型一致 |
| `ch03_xiangjiang` | PASS | 点名段落的疲惫、旧疤和记录本成立 |
| `ch06_supply` | PASS | 休整状态只减轻旧污，不换脸 |
| `ch08_chishui` | PASS | 赤水泥污、步枪与烟袋位置稳定 |
| `ch10_rifle` | PASS | 缴获步枪状态保留同一帽型与面部轮廓 |
| `ch12_longmarch` | PASS | 连续行军疲惫与道具连续 |
| `ch16_snow` | PASS | 雪霜只增加在衣帽肩部，脸型未换人 |
| `ch17_18_coldwet` | PASS | 冷湿状态与前一状态连续 |
| `ch19_north` | PASS | 北上补给后的新旧程度变化合理 |

## 表情、透明与构图

- `calm/stern/smile/sad/worry/fierce/weak/dawn` 均在眉、眼或嘴至少一处变化；
- 石柱与吴老六的危险状态中，`smile` 已被压成紧绷不笑的脸，不构成庆祝；
- 所有被审状态都以人物或明确手持/背负物为主体，没有桌面、地面、家具、
  场景支撑物或他人肢体；
- `shi_zhu_ch15_burned` 与 `shi_zhu_ch15_luding` 的衣摆为自然破损轮廓，
  不再出现贯穿双腿的水平硬边；
- 同状态各表情保持同一边框、姿势、帽型和透明轮廓。

已复核风险项：

```text
shi_zhu_ch15_burned_smile     PASS  危险状态，明确不笑
shi_zhu_ch15_burned_fierce    PASS  眉眼压紧、张口，区别于 calm
shi_zhu_ch15_luding_weak      PASS  眼睑与嘴角下落，保持旗枪结构
wu_laoliu_ch03_xiangjiang_sad PASS  头低、眉眼沉，无笑容
wu_laoliu_ch16_snow_calm      PASS  雪霜不遮脸，旧疤仍可辨
```

## 机器验证

```text
python -X utf8 tools/check-portrait-key.py
  立绘洋红残留检查：909 张
  洋红残留：0 张超阈值

python -X utf8 tools/qc-portraits.py --csv tmp/qc-portraits-reaudit-1132.csv
  表情图 455 张；硬伤 0 张；姿态/构图警告 0 张
  角色剧情立绘质检通过：无洋红残留、无漂白/错抠。

node tools/check.js
  立绘 280 / 280；形象演进 625 / 625
  检查通过（唯一既有警告：narrator 未出场）
```

## 保留限制

- 本轮只审增量涉及的 `shi_zhu_*` 与 `wu_laoliu_*` 101 张成品；
- 没有把 455 张状态表情逐张放到实际背景中，只对两个关键剧情拍点做了游戏内实拍；
- 石柱在 `ch15_burned` 属于重伤状态，面部较暗、衣装破碎是有意剧情表现，
  不判为换脸或脏污错误。
