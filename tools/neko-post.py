#!/usr/bin/env python3
"""把 NekoGptImage 生成的立绘原始图处理成游戏用的 600×900 透明 PNG。

  python tools/neko-post.py                 # 处理 tmp/neko-raw 下的全部原始图
  python tools/neko-post.py mao_calm        # 只处理指定文件（不含扩展名）

处理步骤：
  1. 以四角取样确定洋红底色，按色差生成 alpha（带软边，避免锯齿）
  2. 去掉残留的底色边缘（收缩 1px + 轻微羽化）
  3. 裁到人物包围盒，再**按「头部高度 + 头顶位置」归一化**取景 —— 模型每次
     生成的身体长度差异很大（有的到腰、有的到胸），按全身高度对齐会让头忽大
     忽小，同框时像两个人种；而按「底边贴底」对齐则会把身体长的人头顶切掉。
     改为先检测头肩轮廓找出脖子位置，把「头顶→脖子」统一缩放到画布高的
     HEAD_H_RATIO，并让头顶落在画布 HEAD_TOP_RATIO 处：
       · 头永远完整（不会再被上边缘切掉）
       · 所有人的头顶在同一高度，切换立绘不会上下跳
       · 身体多出来的部分自然被画布下缘裁掉（那里本来就被对话框盖住）
  4. 量化到 160 色（低多边形本来就少纯色块）压体积。
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "tmp" / "neko-raw"
OUT = ROOT / "assets" / "generated" / "chars"
TARGET = (600, 900)
HEAD_H_RATIO = 0.30         # 头部高度占画布高度
HEAD_TOP_RATIO = 0.055      # 头顶距画布上边缘


def head_bottom(alpha: Image.Image) -> tuple[int, int]:
    """返回 (头顶行, 脖子行)。用每行不透明像素数找头肩轮廓：
    头顶 = 第一行有内容；肩膀 = 上方 60% 里最宽的一行；
    脖子 = 头顶与肩膀之间最窄的一行。"""
    w, h = alpha.size
    px = alpha.load()
    widths = []
    for y in range(h):
        c = 0
        for x in range(0, w, 2):
            if px[x, y] > 32:
                c += 2
        widths.append(c)

    top = next((y for y in range(h) if widths[y] > 3), 0)
    search_end = min(h - 1, top + int((h - top) * 0.75))
    shoulders = max(range(top, search_end + 1), key=lambda y: widths[y])
    if shoulders - top < 20:                      # 兜底：没能分出肩
        return top, min(h, top + int(h * HEAD_H_RATIO))
    lo = top + int((shoulders - top) * 0.18)
    neck = min(range(lo, shoulders), key=lambda y: widths[y])
    if neck - top < (shoulders - top) * 0.25:     # 脖子检测不可信
        neck = top + int((shoulders - top) * 0.55)
    return top, neck

# 与底色相差多少以内算「背景」
NEAR = 60.0      # 完全透明
FAR = 130.0      # 完全不透明（之间线性过渡，得到软边）


def key_color(img: Image.Image) -> tuple[int, int, int]:
    w, h = img.size
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]
    px = img.load()
    rs = [px[x, y][0] for x, y in pts]
    gs = [px[x, y][1] for x, y in pts]
    bs = [px[x, y][2] for x, y in pts]
    return (sorted(rs)[1], sorted(gs)[1], sorted(bs)[1])


def process(src: Path, dst: Path) -> str:
    img = Image.open(src).convert("RGB")
    kr, kg, kb = key_color(img)

    # 只对「洋红味」的像素做透明处理：R 高、G 低、B 高，避免误伤人物
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
            # 额外的洋红抑制：绿色明显低于红蓝时也算背景
            elif g + 40 < r and g + 40 < b and d < 260:
                ap[x, y] = 0

    # 收缩一圈去掉残留底色，再轻微羽化
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))

    out = img.convert("RGBA")
    out.putalpha(alpha)

    # ---- 按人物包围盒归一化取景 ----
    box = alpha.getbbox()
    if box:
        out = out.crop(box)
        alpha = alpha.crop(box)
    cw, ch = TARGET
    top_row, neck_row = head_bottom(alpha)
    head_h = max(8, neck_row - top_row)
    scale = (ch * HEAD_H_RATIO) / head_h
    if out.width * scale > cw:      # 太宽（带了长道具）就按宽度贴边
        scale = cw / out.width
    w = max(1, int(round(out.width * scale)))
    h = max(1, int(round(out.height * scale)))
    out = out.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", TARGET, (0, 0, 0, 0))
    canvas.paste(out, ((cw - w) // 2, int(ch * HEAD_TOP_RATIO) - int(top_row * scale)), out)
    out = canvas

    # 低多边形画风本来就是少量纯色块，量化到 160 色几乎无损，体积却小很多
    alpha_small = out.getchannel("A")
    out = out.convert("RGB").quantize(colors=160, method=Image.MEDIANCUT).convert("RGB").convert("RGBA")
    out.putalpha(alpha_small)

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, "PNG", optimize=True)
    cov = sum(1 for a in out.getchannel("A").getdata() if a > 8) / (TARGET[0] * TARGET[1])
    return f"{dst.name:28s} key=#{kr:02X}{kg:02X}{kb:02X}  实心占比={cov:5.1%}  {dst.stat().st_size // 1024}KB"


def main() -> int:
    if not RAW.exists():
        print("没有原始图目录：" + str(RAW), file=sys.stderr)
        return 1
    filt = sys.argv[1:] if len(sys.argv) > 1 else None
    files = sorted(RAW.glob("*.png"))
    if filt:
        files = [f for f in files if f.stem in filt]
    if not files:
        print("没有匹配的原始图", file=sys.stderr)
        return 1
    for f in files:
        try:
            print(process(f, OUT / (f.stem + ".png")))
        except Exception as e:  # noqa: BLE001
            print(f"{f.name} 处理失败：{e}", file=sys.stderr)
    print(f"\n共处理 {len(files)} 张 → {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
