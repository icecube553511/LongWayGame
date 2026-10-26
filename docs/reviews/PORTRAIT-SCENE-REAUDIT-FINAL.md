# 立绘情景闭环 · 尾项独立终检

> 性质：独立复判，不是修正组自评。
>
> 范围：仅复核上一轮仍为 `PARTIAL` 的 4 张尾项，不替代
> `PORTRAIT-SCENE-REAUDIT-B1.md` 与 `PORTRAIT-SCENE-REAUDIT-B2.md` 已覆盖的全面检查。

## 结论

**PASS。**

上一轮剩余的 2 条 P1 和 1 条 P2 均已关闭：

- `he_xiaomei_ch19_north`：桌面、瓶、散落纱布与登记本残片消失；
- `shi_zhu_ch15_luding`：底边不再横切腿部；
- `shi_zhu_ch15_burned`：底边不再横切腿部；
- `zhou_ch16_snow/worry`：机位与 calm 已统一，`qc-portraits.py` 从头像轮廓层面无警告。

## 取证

原生图逐张查看：

```text
assets/generated/chars/he_xiaomei_ch19_north_calm.png
assets/generated/chars/shi_zhu_ch15_luding_calm.png
assets/generated/chars/shi_zhu_ch15_burned_calm.png
assets/generated/chars/zhou_ch16_snow_worry.png
```

### he_xiaomei_ch19_north · PASS

人物从帽顶到自然腰部/围裙轮廓完整；双手抱一卷绷带和登记本，
药箱贴身挂在左腰侧。画面没有桌面、玻璃瓶、桌面登记本、散落纱布、地面或他人物件。

### shi_zhu_ch15_luding · PASS

人物与红旗、步枪、铁索保持可信接触；下沿在衣摆/腰部自然收束。
alpha 外接框止于 `y=838`，最后一行只有 2 个不透明像素，没有横切双腿的水平底边。

### shi_zhu_ch15_burned · PASS

焦黑军装、胸臂烧伤、绷带、红旗与步枪仍可读；下沿是破损衣摆轮廓。
alpha 外接框虽到画布底边，但最后一行只有 57 个零散不透明像素，
不是原先 485px 的横向硬切直线。

### zhou_ch16_snow/worry · PASS

原生图与同状态 calm 的头身比、毯子、手部、构图和裁切一致。
独立 alpha 计算：

```text
zhou_ch16_snow/worry alpha IoU = 0.9998
```

## 机器检查

```text
python -X utf8 tools/qc-portraits.py --csv tmp/qc-portraits-reaudit-final.csv
  表情图 455 张；硬伤 0 张；姿态/构图警告 0 张
  角色剧情立绘质检通过：无洋红残留、无漂白/错抠。
```

## 判定

4 张尾项全部 **PASS**，上轮 P1/P2 均可关闭。本轮未修改源码、素材或工具，未执行 git。
