#!/usr/bin/env python3
"""生成 Martin 版 Windows 图标。

图形是项目原有的低多边形语言：深蓝底、赭金边、红色行军带与金色五角星。
输出 desktop/assets/icon.ico，供 electron-builder 写入 EXE 与窗口。
"""

from pathlib import Path
from PIL import Image, ImageDraw


SIZE = 1024
OUT = Path(__file__).resolve().parent / "assets" / "icon.ico"


def star_points(cx, cy, outer, inner, count=5):
    points = []
    for i in range(count * 2):
        radius = outer if i % 2 == 0 else inner
        angle = -90 + i * (180 / count)
        from math import cos, radians, sin

        points.append((cx + cos(radians(angle)) * radius, cy + sin(radians(angle)) * radius))
    return points


image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

# 外轮廓用切角方形，避免 Windows 小尺寸下变成浑浊圆形。
draw.polygon(
    [(180, 70), (844, 70), (954, 180), (954, 844), (844, 954),
     (180, 954), (70, 844), (70, 180)],
    fill=(14, 23, 37, 255),
)
draw.polygon(
    [(190, 95), (834, 95), (929, 190), (929, 834), (834, 929),
     (190, 929), (95, 834), (95, 190)],
    outline=(191, 154, 56, 255),
    width=24,
)

# 远近两层山脊，保留左上受光、右下压暗。
draw.polygon([(95, 720), (270, 535), (414, 690), (560, 455), (760, 690), (929, 570), (929, 929), (95, 929)],
             fill=(36, 49, 68, 255))
draw.polygon([(95, 790), (300, 635), (470, 805), (720, 610), (929, 775), (929, 929), (95, 929)],
             fill=(24, 34, 51, 255))
draw.polygon([(95, 790), (300, 635), (470, 805), (300, 800)], fill=(55, 67, 82, 255))
draw.polygon([(720, 610), (929, 775), (774, 860)], fill=(18, 27, 42, 255))

# 折线式红色行军带，和小尺寸识别星形成强对比。
draw.polygon([(104, 600), (246, 520), (430, 620), (620, 495), (910, 635),
              (884, 703), (618, 580), (428, 706), (242, 606), (118, 674)],
             fill=(165, 31, 36, 255))
draw.polygon([(104, 600), (246, 520), (430, 620), (620, 495), (684, 523),
              (620, 554), (423, 663), (240, 565)], fill=(211, 65, 70, 255))

draw.polygon(star_points(512, 330, 196, 82), fill=(236, 198, 92, 255))
draw.polygon(star_points(512, 330, 120, 50), fill=(191, 154, 56, 255))
draw.polygon([(512, 184), (512, 476), (570, 444), (536, 350), (617, 326), (571, 267)],
             fill=(247, 222, 151, 255))

OUT.parent.mkdir(parents=True, exist_ok=True)
image.resize((256, 256), Image.Resampling.LANCZOS).save(
    OUT,
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
print("图标已生成：" + str(OUT))
