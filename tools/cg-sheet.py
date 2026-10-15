#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""把已生成的 CG 拼成一张对比版，用来一眼看「风格是否统一 / 有没有掉队的图」。

    python tools/cg-sheet.py tmp/cg/sheet-all.png
    python tools/cg-sheet.py tmp/cg/sheet-a.png --only cg_yudu_night,cg_blockade

每格 640×360，下面一行是 id 与体积；缺图的格子画成灰色并标注 MISSING，
所以「哪些章还没出图」也能在同一张版上读出来。
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CG_DIR = os.path.join(ROOT, 'assets', 'generated', 'cg')
CELL_W, CELL_H, PAD, LABEL_H = 640, 360, 12, 34


def load_ids(only):
    if only:
        return [x.strip() for x in only.split(',') if x.strip()]
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    # 从 src/data/cg.js 里按顺序取 id（保持剧本顺序，不要按文件名排序）
    import re
    src = open(os.path.join(ROOT, 'src', 'data', 'cg.js'), encoding='utf-8').read()
    return re.findall(r"id:\s*'(cg_[a-z0-9_]+)'", src)


def font(size):
    for p in (r'C:\Windows\Fonts\msyh.ttc', r'C:\Windows\Fonts\simhei.ttf', r'C:\Windows\Fonts\arial.ttf'):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def main():
    global CELL_W, CELL_H
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--only', default='')
    ap.add_argument('--cols', type=int, default=3)
    ap.add_argument('--thumbs', default='', metavar='DIR',
                    help='额外把每张按 --thumb-w 缩到 DIR（评审用缩图，避免把 1.4MB 的原图塞进对话）')
    ap.add_argument('--thumb-w', type=int, default=960)
    ap.add_argument('--cell-w', type=int, default=CELL_W,
                    help='拼版每格宽度（默认 640）；想一次看全 24 张又不想把大图塞进对话时用 320')
    args = ap.parse_args()

    if args.cell_w != CELL_W:
        CELL_H = int(round(args.cell_w * 9 / 16.0))
        CELL_W = args.cell_w

    ids = load_ids(args.only)

    if args.thumbs:
        os.makedirs(args.thumbs, exist_ok=True)
        for cid in ids:
            src = os.path.join(CG_DIR, cid + '.png')
            if not os.path.exists(src):
                continue
            im = Image.open(src).convert('RGB')
            w = args.thumb_w
            h = max(1, round(im.height * w / float(im.width)))
            dst = os.path.join(args.thumbs, cid + '.png')
            im.resize((w, h), Image.LANCZOS).save(dst, optimize=True)
            print('  缩图 %-28s %6d KB' % (cid + '.png', os.path.getsize(dst) / 1024))
    cols = max(1, args.cols)
    rows = (len(ids) + cols - 1) // cols
    W = cols * CELL_W + (cols + 1) * PAD
    H = rows * (CELL_H + LABEL_H) + (rows + 1) * PAD
    sheet = Image.new('RGB', (W, H), (18, 22, 30))
    d = ImageDraw.Draw(sheet)
    f = font(20)

    missing = []
    for n, cid in enumerate(ids):
        r, c = divmod(n, cols)
        x = PAD + c * (CELL_W + PAD)
        y = PAD + r * (CELL_H + LABEL_H + PAD)
        fp = os.path.join(CG_DIR, cid + '.png')
        if os.path.exists(fp):
            im = Image.open(fp).convert('RGB').resize((CELL_W, CELL_H), Image.LANCZOS)
            kb = os.path.getsize(fp) / 1024.0
            label = '%s   %.0f KB' % (cid, kb)
        else:
            im = Image.new('RGB', (CELL_W, CELL_H), (52, 44, 44))
            label = '%s   MISSING' % cid
            missing.append(cid)
        sheet.paste(im, (x, y))
        d.rectangle([x, y, x + CELL_W - 1, y + CELL_H - 1], outline=(70, 60, 45))
        d.text((x + 2, y + CELL_H + 6), label, fill=(216, 207, 187), font=f)

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    # 拼版是"给人一眼扫"的东西，不是成品资产：存 JPEG 能让同样内容的体积掉一个量级
    # （320px 格子 × 30 张：PNG 1.9MB → JPEG q88 约 300KB），评审把图塞进对话时才不会撑爆。
    if args.out.lower().endswith(('.jpg', '.jpeg')):
        sheet.save(args.out, quality=88, optimize=True)
    else:
        sheet.save(args.out)
    print('%s  %d 格（%d 张缺图%s）' % (args.out, len(ids), len(missing),
                                        '：' + ', '.join(missing) if missing else ''))


if __name__ == '__main__':
    main()
