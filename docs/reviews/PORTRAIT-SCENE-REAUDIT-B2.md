# 立绘复判 B2 · 透明洞、裁切与机位

> 性质：独立复判，不是修正记录。
>
> 范围：`PSL-B03`—`PSL-B07`。以当前 `600×900` 成品为准，不沿用修正组截图结论。

## 0. 结论

- `PSL-B03` 透明洞：**PASS**
- `PSL-B04` 单人物场景残片：**PASS**
- `PSL-B05` 底边裁切：**PARTIAL**（`shi_zhu_ch15_luding`、
  `shi_zhu_ch15_burned` 仍存在横切腿部的硬底边）
- `PSL-B06` 同状态机位：**PASS**，仅保留 `zhou_ch16_snow/worry` 的 P2 风险
- `PSL-B07` 剧情必需人体局部：**PASS**（去除地面与散落物；不删除伤腿叙事）

总判定：**PARTIAL**。P0 透明洞和场景残留已关闭；仍有一条 P1 底边裁切未闭环。

## 1. 机器检查

```text
node tools/build-portrait-states.js --check
  形象演进运行时数据与评审清单一致：
  35 角色 / 170 状态 / 282 章映射 / 19 个章内变化

node tools/check.js
  背景 46 / 46；背景位图 42 / 42；立绘 280 / 280；
  形象演进 625 / 625；检查通过（仅既有 narrator 未出场警告）

python -X utf8 tools/check-portrait-key.py
  立绘洋红残留检查：909 张
  洋红残留：0 张超阈值

python -X utf8 tools/qc-portraits.py --csv tmp/qc-portraits-reaudit-b.csv
  表情图 455 张；硬伤 0 张；姿态/构图警告 1 张
  zhou_ch16_snow/worry：IoU=0.720、身体差=52.8
```

## 2. PSL-B03 · PASS

原生图与 alpha 覆盖率复核：

```text
zhu_ch06_zunyi    calm=0.6165  stern=0.6164  Δ=-0.0001
lide_ch07_zunyi   calm=0.6338  stern=0.6338  sad=0.6338  fierce=0.6338  Δ=0.0000
```

证据：`tmp/reaudit-b2-zhu-lide.jpg`，并原生查看
`zhu_ch06_zunyi_stern.png`、`lide_ch07_zunyi_fierce.png`。
两人衣襟、手臂、胸口和腹部均完整；没有贯穿人体的透明洞，
也没有大腿以下突然截断的早期坏图。

## 3. PSL-B04 · PASS

复核 `li_tiezhu_ch03_xiangjiang`、`li_tiezhu_ch06_supply`、
`li_tiezhu_ch17_grassland`、`san_wa_ch07_supply`、`san_wa_ch09_longmarch`、
`san_wa_ch16_snow`、`san_wa_ch18_lazikou`、`san_wa_ch19_north`。

证据：`tmp/states-calm-verify-3.jpg`、`tmp/states-calm-verify-4.jpg`，
并原生查看 `li_tiezhu_ch03_xiangjiang_calm.png`。
锅、碗、带子、草鞋与背包只由人物手持、抱着或背在身上；
不再出现火堆、地面、围坐群像和无接触散落物。

## 4. PSL-B05 · PARTIAL

### PASS 项

- `san_wa_ch19_north`：三种表情同机位，人物裁在腰腹，不再把脚底平切；
- `shi_zhu_ch15_luding` 的五个表情身体、旗帜、步枪和铁索位置已锁定为同一构图；
- `soldiers_ch09_longmarch` 三人站位与手部关系保持一致；表情改变不重排人物。

### 未闭环项

`shi_zhu_ch15_burned` 的五个表情现在确实完全共用同一 alpha，但
`calm/smile/fierce/weak/dawn` 都在人物大腿处形成一条贯穿左右腿的平直底边。

证据：

```text
assets/generated/chars/shi_zhu_ch15_burned_calm.png
tmp/reaudit-b2-sanwa-shi.jpg（第二排）
alpha bbox=(57,49,542,757)
最后一行不透明像素 485 px，横向 span=485 px
五个表情的 bbox 与底边完全相同
```

`shi_zhu_ch15_luding` 的 bbox 也结束于 `y=842`，最后一行有 311 px 不透明像素，
人物在髋/腿处被同一水平底边截断；但因为构图一致，已不再出现换表情跳机位。

问题：这已从“每张表情随机裁切”降为“整组稳定但仍是硬切”。
用户明确要求不能有生硬边缘，因此不能仅因五张一致就判 PASS。

修法：

```text
regenerate the shi_zhu_ch15 burned and luding states as isolated portraits that
end at a natural waist or garment silhouette; never end with one horizontal
alpha line across both legs. Keep the flag, rifle, chain and burns, but frame
the lower body so the cut is not a straight rectangular edge.
```

修完仍应以同一 `calm` alpha 生成全部 faces。

## 5. PSL-B06 · PASS（余一项 P2）

除 `zhou_ch16_snow/worry` 外，`qc-portraits.py` 已从 23 条警告降到 0 条其他警告。

- `san_wa_ch19_north`：`calm=0.5351`、`smile=0.5350`、`dawn=0.5350`；
- `shi_zhu_ch15_luding`：五个表情均 `0.4459`；
- `shi_zhu_ch15_burned`：五个表情均 `0.4282`；
- `soldiers_ch09_longmarch`：视觉上三人站位、蹲姿、武器和鞋的位置一致；
  alpha 覆盖率 `calm=0.4511 / fierce=0.4781 / dawn=0.4781`，
  但 alpha IoU 为 `0.9177 / 0.9178`，没有 `qc` 警告，判为 PASS。

保留风险：

```text
zhou_ch16_snow/worry
  calm=0.7135  weak=0.7086  worry=0.5208
  IoU=0.720，身体差=52.8
```

原生图 `tmp/reaudit-b2-soldiers-zhou.jpg` 中，worry 明显比 calm 更近，
但它不是 P0/P1，本轮记为 **P2**。若要彻底统一，应从 calm 的同一身体合成 worry。

## 6. PSL-B07 · PASS（保留 P2 说明）

`he_xiaomei_ch16_snow_calm.png` 不再带药箱、瓶、碗、雪地或他人散落肢体。
`shi_zhu_ch14_leg_calm.png` 保留伤腿用于剧情识别，地面已被移除；
腿脚在画布底边仍有画幅裁切，但这是该状态展示伤口所必需的构图取舍，
不作为本轮 B07 的 P0/P1。

## 7. 复判结果

只要把 `shi_zhu_ch15_burned` 与 `shi_zhu_ch15_luding` 的硬水平底边改为自然
腰部/衣摆收口，并沿用现有 alpha 锁重做 faces，即可把 `PSL-B05` 改为 PASS。

`zhou_ch16_snow/worry` 建议顺手用同状态 calm 补一次，以把 P2 清零。
