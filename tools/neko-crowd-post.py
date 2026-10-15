#!/usr/bin/env python3
"""把 tools/neko-crowd.js 生成的群众素材做成可复用的印章，并烘焙成 JS。

  python tools/neko-crowd-post.py

流程：
  1. 抠掉洋红底 → 透明
  2. 裁到人物包围盒，等比缩放到统一高度 STAMP_H
  3. 生成三档明度变体，供不同景深使用
       n = 原色（近景）  d = 压暗到 62%（中景）  f = 压暗到 38%（远景）
  4. 全部写成 base64 data URI，烘焙进 art/ui_00_crowd_stamps.js

产物：
  tmp/crowd-stamps/{name}_{tone}.png   中间产物，可删
  art/ui_00_crowd_stamps.js            window.CROWD_STAMPS（构建期用，游戏不加载）
"""
from __future__ import annotations

import base64
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "tmp" / "neko-crowd"
MID = ROOT / "tmp" / "crowd-stamps"
OUT_JS = ROOT / "art" / "ui_00_crowd_stamps.js"

STAMP_H = 200          # 印章统一高度（背景里最大用到 ~290px）
COLORS = 64
TONES = {"n": 1.0, "d": 0.62, "f": 0.38}

NEAR, FAR = 70.0, 140.0


def key_color(img: Image.Image) -> tuple[int, int, int]:
    w, h = img.size
    px = img.load()
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]
    return (sorted(px[x, y][0] for x, y in (pts[0], pts[1], pts[2], pts[3]))[1],
            sorted(px[x, y][1] for x, y in (pts[0], pts[1], pts[2], pts[3]))[1],
            sorted(px[x, y][2] for x, y in (pts[0], pts[1], pts[2], pts[3]))[1])


def cutout(src: Path) -> Image.Image | None:
    img = Image.open(src).convert("RGB")
    kr, kg, kb = key_color(img)
    px = img.load()
    w, h = img.size
    alpha = Image.new("L", (w, h), 255)
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            d = ((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2) ** 0.5
            if d <= NEAR:
                ap[x, y] = 0
            elif d < FAR:
                ap[x, y] = int(255 * (d - NEAR) / (FAR - NEAR))
            elif g + 40 < r and g + 40 < b and d < 260:
                ap[x, y] = 0
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    out = img.convert("RGBA")
    out.putalpha(alpha)
    box = alpha.getbbox()
    if not box:
        return None
    return out.crop(box)


def scaled(fig: Image.Image) -> Image.Image:
    w = max(1, int(round(fig.width * STAMP_H / fig.height)))
    if w > STAMP_H:                      # 躺着/横构图，按宽度贴边
        w = STAMP_H
    return fig.resize((w, int(round(fig.height * (w / fig.width)))), Image.LANCZOS)


def tone(fig: Image.Image, k: float) -> Image.Image:
    alpha = fig.getchannel("A")
    rgb = fig.convert("RGB")
    if k < 1.0:
        rgb = rgb.point(lambda v: int(v * k))
    rgb = rgb.quantize(colors=COLORS, method=Image.MEDIANCUT).convert("RGB")
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def data_uri(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def main() -> int:
    if not RAW.exists():
        print("没有原始图目录：" + str(RAW), file=sys.stderr)
        return 1
    MID.mkdir(parents=True, exist_ok=True)
    table: dict[str, dict] = {}
    total = 0
    for src in sorted(RAW.glob("*.png")):
        name = src.stem
        try:
            fig = cutout(src)
            if fig is None:
                print("  跳过（没有不透明像素）：" + name, file=sys.stderr)
                continue
            fig = scaled(fig)
            entry = {"ar": round(fig.width / fig.height, 4), "w": fig.width, "h": fig.height}
            for t, k in TONES.items():
                t_img = tone(fig, k)
                t_img.save(MID / f"{name}_{t}.png", "PNG", optimize=True)
                entry[t] = data_uri(t_img)
            table[name] = entry
            total += 1
        except Exception as e:  # noqa: BLE001
            print("  失败 " + name + "：" + e, file=sys.stderr)

    js = (
        "/* 自动生成，请勿手改 —— 由 tools/neko-crowd-post.py 烘焙。\n"
        " * 背景用的群众印章：NekoGptImage 生成 → 抠底 → 缩放 → 三档明度 → base64。\n"
        " * 每种姿态只在这里存一份，背景 SVG 用 <symbol>+<use> 复用，避免重复编码。\n"
        " * 构建期加载；游戏运行时不加载本文件。\n"
        " */\n"
        "(function () {\n"
        "  'use strict';\n"
        "  var S = " + json.dumps(table, ensure_ascii=False) + ";\n"
        "  var G = (typeof window !== 'undefined') ? window : globalThis;\n"
        "  G.CROWD_STAMPS = S;\n"
        "  if (typeof module === 'object' && module.exports) module.exports = S;\n"
        "})();\n"
    )
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"烘焙 {total} 个姿态 × {len(TONES)} 档明度 → {OUT_JS}（{OUT_JS.stat().st_size // 1024}KB）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
