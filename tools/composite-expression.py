#!/usr/bin/env python3
"""把表情编辑结果只合回基准立绘的脸部椭圆。

上游服务把“只改眉眼嘴”的蒙版请求重绘成整张 RGBA 时，模型可能把透明底
画成黑色。直接复制基准 alpha 会把黑底当成衣服，留下明显重影。
本脚本在 600×900 成品空间内只取表情图的五官区域，椭圆外完全使用 calm
基准图，并恢复基准 alpha。

  python tools/composite-expression.py <calm.png> <expression.png>
"""
from pathlib import Path
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

if len(sys.argv) != 3:
    raise SystemExit("用法：composite-expression.py <calm.png> <expression.png>")

calm_path = Path(sys.argv[1])
edit_path = Path(sys.argv[2])
calm = Image.open(calm_path).convert("RGBA")
edit = Image.open(edit_path).convert("RGBA")
if calm.size != edit.size:
    raise SystemExit("两张图尺寸不一致：%s vs %s" % (calm.size, edit.size))

# 只覆盖眉眼与嘴部两块五官区域。单个人脸大椭圆会把头发两侧和轮廓外
# 的生成背景一起带回来，也会让表情编辑有机改动下颌线；所以拆成两块，
# 并严格避开帽檐、鼻梁、脸颊轮廓、下巴、衣领与肩部。
mask = Image.new("L", calm.size, 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((235, 215, 365, 268), fill=255)
draw.ellipse((262, 286, 338, 326), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(6))

# 若上游把透明底涂成纯黑，椭圆内仍会夹带黑边。只在基准图该处本来
# 不是暗部时剔除这种黑像素；真正的眉毛和睫毛仍可正常更新。
edit_dark = edit.convert("L").point(lambda v: 255 if v < 24 else 0)
calm_lit = calm.convert("L").point(lambda v: 255 if v > 45 else 0)
mask = ImageChops.subtract(mask, ImageChops.multiply(edit_dark, calm_lit))

composed = Image.composite(edit, calm, mask)
composed.putalpha(calm.getchannel("A"))

# 保持本仓库立绘的体积档：256 色以内、alpha 16 级，再按实际体积逐级量化。
alpha = composed.getchannel("A").point(lambda a: min(255, (a // 16) * 16))
composed.putalpha(alpha)
for colors in (192, 160, 128, 96, 64, 48, 32, 24, 16, 12):
    quantized = composed.quantize(colors=colors, method=Image.FASTOCTREE)
    quantized.save(edit_path, "PNG", optimize=True)
    if edit_path.stat().st_size <= 512 * 1024:
        break

print("已合成表情：%s" % edit_path.name)
