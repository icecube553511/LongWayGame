#!/usr/bin/env python3
"""生成固定立绘画幅的表情蒙版：只开放脸部椭圆，身体和帽发保持原图。"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tmp" / "mask-expression-face.png"
OUT.parent.mkdir(parents=True, exist_ok=True)
im = Image.new("RGBA", (600, 900), (0, 0, 0, 255))
ImageDraw.Draw(im).ellipse((195, 145, 405, 345), fill=(0, 0, 0, 0))
im.save(OUT)
print(OUT)
