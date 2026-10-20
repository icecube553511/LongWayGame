#!/usr/bin/env python3
"""把蒙版编辑结果的 RGB 换成基准立绘的透明 alpha。"""
from pathlib import Path
import sys

from PIL import Image

raw = Path(sys.argv[1])
alpha_src = Path(sys.argv[2])
im = Image.open(raw).convert("RGB").convert("RGBA")
alpha = Image.open(alpha_src).convert("RGBA").getchannel("A")
if alpha.size != im.size:
    alpha = alpha.resize(im.size, Image.LANCZOS)
im.putalpha(alpha)
im.save(raw, "PNG", optimize=True)
