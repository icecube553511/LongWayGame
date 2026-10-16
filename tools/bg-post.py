#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""把 AI 出的原始图烘焙成游戏用的「场景背景」位图。

    python tools/bg-post.py --id bg_luding
    python tools/bg-post.py --all
    python tools/bg-post.py --raw tmp/bg-raw/bg_luding.png --out assets/generated/bg/bg_luding.png

流程：原始图（任意尺寸）→ 居中裁成 16:9 → 缩放到 1920x1080 → 调色（降饱和 / 轻微暖调）
      → 椭圆径向暗角（背景结构第 ⑥ 层的「四角压暗」）→ 存 assets/generated/bg/<id>.png

与 tools/cg-post.py 的区别（不是漏做，是刻意不做的）：
  · **不压电影黑边、不压金色内框、不压四角框标** —— 那套画框是「插画」的标志（CG_DESIGN §3），
    背景是舞台，玩家全程看着它，加黑边会把画面切掉一条；
  · 暗角比 CG 浅、中心偏上一点：立绘（600×900）站在画面中下部，暗角压太狠会把人吃掉；
  · 体积上限按背景单列一档（BG_MAX_KB，默认 1280 KB）：背景每章都要在场、30 张一起加载，
    比插画更需要克制；超档时同样走调色板量化（只丢噪点，不糊块面）。
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, 'tmp', 'bg-raw')
OUT_DIR = os.path.join(ROOT, 'assets', 'generated', 'bg')

W, H = 1920, 1080
BG_MAX_KB = 1280
WARM = (0x2A, 0x1F, 0x14)
COOL = (0x0B, 0x10, 0x17)


# ---------------------------------------------------------------- 调色
def grade_palette(im, sat=0.80, contrast=0.97, bright=0.99, warm=0.030):
    """向立体几何美术的『低饱和 + 轻微暖调』靠拢（与 cg-post.py 同一套参数口径）。"""
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Brightness(im).enhance(bright)
    if warm > 0:
        cast = Image.new('RGB', im.size, (255, 214, 170))
        im = Image.blend(im, cast, warm)
    return im


# ---------------------------------------------------------------- 暗角
def _vignette(arr, cx=0.50, cy=0.44, r=0.86, stops=((0.0, 0.0), (0.55, 0.08), (1.0, 0.40))):
    """椭圆径向暗角。比 CG 浅（末端 0.40 对 0.74）、半径更大 —— 背景要让出中下部给立绘。

    与 art/scenes*.js 的 SVG 暗角是同一套 objectBoundingBox 语义，颜色叠加顺序也一致。
    """
    ys = (np.arange(H, dtype=np.float32)[:, None] - cy * H) / (r * H)
    xs = (np.arange(W, dtype=np.float32)[None, :] - cx * W) / (r * W)
    t = np.sqrt(xs * xs + ys * ys)
    a = np.zeros_like(t)
    for i in range(len(stops) - 1):
        t0, a0 = stops[i]
        t1, a1 = stops[i + 1]
        seg = (t >= t0) & (t < t1)
        if seg.any():
            a[seg] = a0 + (a1 - a0) * (t[seg] - t0) / (t1 - t0)
    a[t >= stops[-1][0]] = stops[-1][1]
    return arr * (1 - a[:, :, None])


def decorate(im, vignette=True):
    """盖上背景专用的薄色与暗角（无黑边、无金框）。"""
    arr = np.asarray(im.convert('RGB'), dtype=np.float32)
    w = np.array(WARM, dtype=np.float32)
    c = np.array(COOL, dtype=np.float32)
    arr = arr * (1 - 0.10) + w * 0.10       # 暖色薄层 10%
    arr = arr * (1 - 0.08) + c * 0.08       # 冷色薄层 8%
    if vignette:
        arr = _vignette(arr)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------- 主流程
def bake(raw_path, out_path, sat=0.80, contrast=0.97, bright=0.99, warm=0.030,
         zoom=1.0, bias_y=0.0, vignette=True, quiet=False, max_kb=BG_MAX_KB):
    im = Image.open(raw_path).convert('RGB')
    sw, sh = im.size
    # 1) 居中裁成 16:9（出图端给的就是 16:9，这里主要防手头有别的比例的试片）
    target_ratio = W / float(H)
    crop_h = sw / target_ratio
    if crop_h > sh:                      # 太矮：按高度裁宽度
        crop_h = float(sh)
        crop_w = crop_h * target_ratio
    else:
        crop_w = float(sw)
    crop_h = crop_h / zoom
    crop_w = crop_w / zoom
    cx, cy = sw / 2.0, sh / 2.0 + bias_y * sh
    box = (int(round(cx - crop_w / 2)), int(round(cy - crop_h / 2)),
           int(round(cx + crop_w / 2)), int(round(cy + crop_h / 2)))
    box = (max(0, box[0]), max(0, box[1]), min(sw, box[2]), min(sh, box[3]))
    im = im.crop(box).resize((W, H), Image.LANCZOS)
    # 2) 调色
    if sat != 1.0 or contrast != 1.0 or bright != 1.0 or warm > 0:
        im = grade_palette(im, sat, contrast, bright, warm)
    # 3) 暗角
    im = decorate(im, vignette=vignette)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    im.save(out_path, optimize=True)
    kb = os.path.getsize(out_path) / 1024.0
    if max_kb and kb > max_kb:
        # 与 cg-post.py 同一策略：超档就按调色板量化（只丢噪点），不模糊、不缩尺寸 ——
        # 立体几何风格的画面本来就只有几十种主色，块面的硬边必须留着。
        for colors in (256, 192, 128):
            q = im.quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
            q.save(out_path, optimize=True)
            kb2 = os.path.getsize(out_path) / 1024.0
            if not quiet:
                print('    体积 %.0f KB 超档 → 量化到 %d 色，现为 %.0f KB' % (kb, colors, kb2))
            kb = kb2
            if kb <= max_kb:
                break
    if not quiet:
        print('  %-34s %7.0f KB   <- %s' % (os.path.basename(out_path), kb, os.path.basename(raw_path)))
    return kb


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--id', action='append', default=[], help='背景 id（可重复）')
    ap.add_argument('--all', action='store_true', help='烘焙 tmp/bg-raw 下全部原始图')
    ap.add_argument('--raw', help='直接指定一张原始图')
    ap.add_argument('--out', help='配合 --raw 指定输出路径')
    ap.add_argument('--sat', type=float, default=0.80)
    ap.add_argument('--contrast', type=float, default=0.97)
    ap.add_argument('--bright', type=float, default=0.99)
    ap.add_argument('--warm', type=float, default=0.030)
    ap.add_argument('--zoom', type=float, default=1.0)
    ap.add_argument('--bias-y', type=float, default=0.0)
    ap.add_argument('--no-vignette', action='store_true')
    ap.add_argument('--max-kb', type=int, default=BG_MAX_KB,
                    help='成品体积上限（KB），超过则按调色板量化降体积；0 = 不限制')
    args = ap.parse_args()

    if args.raw:
        out = args.out or os.path.join(ROOT, 'tmp', 'bg', 'post-' + os.path.basename(args.raw))
        bake(args.raw, out, args.sat, args.contrast, args.bright, args.warm, args.zoom, args.bias_y,
             not args.no_vignette, max_kb=args.max_kb)
        return

    ids = list(args.id)
    if args.all:
        ids += [f[:-4] for f in sorted(os.listdir(RAW_DIR)) if f.endswith('.png')]
    ids = sorted(set(ids))
    if not ids:
        print('没有指定 id：用 --id / --all（或 --raw 试片）')
        sys.exit(2)

    bad = []
    for bid in ids:
        raw = os.path.join(RAW_DIR, bid + '.png')
        if not os.path.exists(raw):
            print('  × %s 没有原始图 %s' % (bid, raw))
            bad.append(bid)
            continue
        kb = bake(raw, os.path.join(OUT_DIR, bid + '.png'), args.sat, args.contrast, args.bright,
                  args.warm, args.zoom, args.bias_y, not args.no_vignette, max_kb=args.max_kb)
        if kb > BG_MAX_KB:
            print('    ! %s 体积 %.0f KB 超过 %d KB 上限，考虑降低 --zoom 或让生成端出更平的画面'
                  % (bid, kb, BG_MAX_KB))
    print('完成 %d 张，缺失 %d 张' % (len(ids) - len(bad), len(bad)))


if __name__ == '__main__':
    main()
