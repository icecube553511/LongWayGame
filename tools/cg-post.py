#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""把 AI 出的原始图烘焙成游戏用的 CG 位图。

    python tools/cg-post.py --id cg_luding_bridge
    python tools/cg-post.py --all
    python tools/cg-post.py --raw tmp/devkit/smoke/smoke_yudu_1024.png --out tmp/cg/smoke.png

流程：原始图（任意尺寸）→ 居中裁成 16:9 → 缩放到 1920x1080 → 调色（降饱和 / 暖调 /
轻微压缩对比）→ 盖上与 art/*.svg 的 gradeCG() **完全同一套**画框元素（电影黑边、暖冷双层
薄色、径向暗角、细金线、四角框标、左侧微光），最后存成 `assets/generated/cg/<id>.png`。

为什么画框要在位图上烤一遍：SVG 的插画（build-art.js 的 gradeCG）已经把这套画框画进
矢量里了，位图 CG 必须在像素上复刻同一套，屏幕上两种插画才看不出接缝。
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, 'tmp', 'cg-raw')
OUT_DIR = os.path.join(ROOT, 'assets', 'generated', 'cg')

W, H = 1920, 1080
BAR = 84                 # 上下黑边高度（与 build-art.js gradeCG 一致）
INSET = 34               # 内框距画布边缘
MARK = 78                # 四角框标臂长
GOLD = (0xD7, 0xB1, 0x48)
WARM = (0x2A, 0x1F, 0x14)
COOL = (0x0B, 0x10, 0x17)
BAR_COLOR = (0x05, 0x07, 0x0A)


# ---------------------------------------------------------------- 调色
def grade_palette(im, sat=0.80, contrast=0.97, bright=0.98, warm=0.035):
    """向立体几何美术的『低饱和 + 轻微暖调』靠拢。"""
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Brightness(im).enhance(bright)
    if warm > 0:
        cast = Image.new('RGB', im.size, (255, 214, 170))
        im = Image.blend(im, cast, warm)
    return im


# ---------------------------------------------------------------- 画框
def _alpha_poly(arr, draw_pts, color, alpha):
    """把多边形按给定不透明度叠到 (H,W,3) float 数组上。"""
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(draw_pts, fill=int(round(alpha * 255)))
    m = (np.asarray(mask, dtype=np.float32) / 255.0)[:, :, None]
    c = np.array(color, dtype=np.float32)
    return arr * (1 - m) + c * m


def _alpha_rect(arr, box, color, alpha):
    x0, y0, x1, y1 = box
    return _alpha_poly(arr, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], color, alpha)


def _vignette(arr, cx=0.50, cy=0.46, r=0.78, stops=((0.0, 0.0), (0.5, 0.14), (1.0, 0.74))):
    """与 SVG 里 objectBoundingBox 语义一致的椭圆径向暗角。"""
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


def decorate(im, bars=True, frame=True, vignette=True, streak=False):
    """盖上与 build-art.js gradeCG() 同一套画框（顺序也一致）。"""
    arr = np.asarray(im.convert('RGB'), dtype=np.float32)
    if bars:
        arr = _alpha_rect(arr, (0, 0, W, BAR), BAR_COLOR, 1.0)
        arr = _alpha_rect(arr, (0, H - BAR, W, H), BAR_COLOR, 1.0)
    arr = _alpha_rect(arr, (0, 0, W, H), WARM, 0.12)
    arr = _alpha_rect(arr, (0, 0, W, H), COOL, 0.10)
    if vignette:
        arr = _vignette(arr)
    if frame:
        # 黑边内侧细金线
        arr = _alpha_rect(arr, (0, BAR, W, BAR + 2.4), GOLD, 0.42)
        arr = _alpha_rect(arr, (0, H - BAR - 2.4, W, H - BAR), GOLD, 0.42)
        # 内嵌画框
        arr = _alpha_rect(arr, (INSET, BAR + 26, W - INSET, BAR + 28), GOLD, 0.22)
        arr = _alpha_rect(arr, (INSET, H - BAR - 28, W - INSET, H - BAR - 26), GOLD, 0.22)
        arr = _alpha_rect(arr, (INSET, BAR + 26, INSET + 2, H - BAR - 26), GOLD, 0.22)
        arr = _alpha_rect(arr, (W - INSET - 2, BAR + 26, W - INSET, H - BAR - 26), GOLD, 0.22)
        # 四角框标
        def corner(x, y, sx, sy):
            pts = [(x, y), (x + sx * MARK, y), (x + sx * MARK, y + sy * 3), (x + sx * 3, y + sy * 3),
                   (x + sx * 3, y + sy * MARK), (x, y + sy * MARK)]
            return pts
        nonlocal_arr = arr
        for c in (corner(INSET + 16, BAR + 44, 1, 1), corner(W - INSET - 16, BAR + 44, -1, 1),
                  corner(INSET + 16, H - BAR - 44, 1, -1), corner(W - INSET - 16, H - BAR - 44, -1, -1)):
            nonlocal_arr = _alpha_poly(nonlocal_arr, c, GOLD, 0.34)
        arr = nonlocal_arr
    # 左侧微光：只在平涂的矢量画上成立；叠在细节丰富的位图上会显出一条硬边楔形，
    # 所以位图 CG 默认关闭（--streak 可开，用于对比）。—— 由 root 判定
    if streak:
        arr = _alpha_poly(arr, [(0, H * 0.5 - 210), (W * 0.34, H * 0.5 - 260),
                                (W * 0.30, H * 0.5 - 150), (0, H * 0.5 - 110)], (0xF0, 0xE0, 0xBC), 0.07)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------- 主流程
def bake(raw_path, out_path, sat=0.80, contrast=0.97, bright=0.98, warm=0.035,
         zoom=1.0, bias_y=0.0, bars=True, frame=True, vignette=True, streak=False, quiet=False,
         max_kb=1536):
    im = Image.open(raw_path).convert('RGB')
    sw, sh = im.size
    # 1) 居中裁成 16:9（zoom > 1 时向内多裁一点，等于放大）
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
    # 3) 画框
    im = decorate(im, bars=bars, frame=frame, vignette=vignette, streak=streak)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    im.save(out_path, optimize=True)
    kb = os.path.getsize(out_path) / 1024.0
    if max_kb and kb > max_kb:
        # AI 出图的细碎噪点（织物、草地、水面）是体积的大头，而立体几何风格的画面
        # 本来就只有几十种主色。所以超档时按调色板量化，而不是模糊或缩尺寸——
        # 前者只丢噪点，后者会把块面的硬边和细节一起丢掉。
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
    ap.add_argument('--id', action='append', default=[], help='CG id（可重复）')
    ap.add_argument('--all', action='store_true', help='烘焙 tmp/cg-raw 下全部原始图')
    ap.add_argument('--raw', help='直接指定一张原始图')
    ap.add_argument('--out', help='配合 --raw 指定输出路径')
    ap.add_argument('--sat', type=float, default=0.80)
    ap.add_argument('--contrast', type=float, default=0.95)
    ap.add_argument('--bright', type=float, default=1.04)
    ap.add_argument('--warm', type=float, default=0.03)
    ap.add_argument('--zoom', type=float, default=1.0)
    ap.add_argument('--bias-y', type=float, default=0.0)
    ap.add_argument('--no-bars', action='store_true')
    ap.add_argument('--no-frame', action='store_true')
    ap.add_argument('--no-vignette', action='store_true')
    ap.add_argument('--streak', action='store_true', help='打开左侧微光楔形（位图 CG 默认关闭）')
    ap.add_argument('--max-kb', type=int, default=1536,
                    help='成品体积上限（KB），超过则按调色板量化降体积；0 = 不限制')
    args = ap.parse_args()

    if args.raw:
        out = args.out or os.path.join(ROOT, 'tmp', 'cg', 'post-' + os.path.basename(args.raw))
        bake(args.raw, out, args.sat, args.contrast, args.bright, args.warm, args.zoom, args.bias_y,
             not args.no_bars, not args.no_frame, not args.no_vignette, args.streak, max_kb=args.max_kb)
        return

    ids = list(args.id)
    if args.all:
        ids += [f[:-4] for f in sorted(os.listdir(RAW_DIR)) if f.endswith('.png')]
    ids = sorted(set(ids))
    if not ids:
        print('没有指定 id：用 --id / --all（或 --raw 试片）')
        sys.exit(2)

    bad = []
    for cid in ids:
        raw = os.path.join(RAW_DIR, cid + '.png')
        if not os.path.exists(raw):
            print('  × %s 没有原始图 %s' % (cid, raw))
            bad.append(cid)
            continue
        kb = bake(raw, os.path.join(OUT_DIR, cid + '.png'), args.sat, args.contrast, args.bright,
                  args.warm, args.zoom, args.bias_y, not args.no_bars, not args.no_frame,
                  not args.no_vignette, args.streak, max_kb=args.max_kb)
        if kb > 1536:
            print('    ! %s 体积 %.0f KB 超过 1.5 MB 上限，考虑降低 --zoom 或让生成端出更平的画面' % (cid, kb))
    print('完成 %d 张，缺失 %d 张' % (len(ids) - len(bad), len(bad)))


if __name__ == '__main__':
    main()
