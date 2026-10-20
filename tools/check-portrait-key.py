#!/usr/bin/env python3
"""检查立绘成品的洋红键色残留。

  python tools/check-portrait-key.py

为什么需要单独一支：`node tools/check.js` 只能读 PNG 头与文件大小，
一张已经抠底失败的图仍然可能是“合法 PNG + 尺寸正确 + 体积过档”。
本脚本直接读像素，统计仍接近 #FF00FF 的不透明/半透明像素。
判定：单张洋红残留 > 0.20% 为失败；0.02%–0.20% 为警告。
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
CHARS = ROOT / "assets" / "generated" / "chars"
BAD = 0.0020
WARN = 0.0002


def magenta_ratio(path: Path) -> tuple[float, int]:
    im = Image.open(path).convert("RGBA")
    r, g, b, a = im.split()
    # 全部在 Pillow 的 C 实现里做位图与，避免 86 万像素的 Python 循环。
    # 暗紫边缘也要抓：R、B 同时高于 G 即属于洋红色相污染。
    mr = ImageChops.subtract(r, g).point(lambda v: 255 if v >= 18 else 0)
    mb = ImageChops.subtract(b, g).point(lambda v: 255 if v >= 18 else 0)
    ma = a.point(lambda v: 255 if v > 8 else 0)
    mask = ImageChops.multiply(ImageChops.multiply(mr, mb), ma)
    hit = mask.histogram()[255]
    op = sum(a.histogram()[9:])
    return (hit / float(op or 1), op)


def main() -> int:
    if not CHARS.exists():
        print("立绘目录不存在：" + str(CHARS), file=sys.stderr)
        return 1
    files = sorted(CHARS.glob("*.png"))
    bad, warn = [], []
    for p in files:
        ratio, _ = magenta_ratio(p)
        if ratio > BAD:
            bad.append((p.name, ratio))
        elif ratio > WARN:
            warn.append((p.name, ratio))
    print(f"立绘洋红残留检查：{len(files)} 张")
    for name, ratio in bad:
        print(f"  × {name:42s} 洋红={ratio:6.2%}")
    for name, ratio in warn:
        print(f"  · {name:42s} 洋红={ratio:6.2%}")
    if bad:
        print(f"失败：{len(bad)} 张残留超过 {BAD:.2%}；用 python tools/neko-post.py --raw tmp/neko-states-raw 重烘焙")
        return 1
    print("洋红残留：0 张超阈值" + (f"（{len(warn)} 张为边缘级警告）" if warn else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
