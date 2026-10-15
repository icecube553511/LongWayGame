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
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--only', default='')
    ap.add_argument('--cols', type=int, default=3)
    args = ap.parse_args()

    ids = load_ids(args.only)
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
    sheet.save(args.out)
    print('%s  %d 格（%d 张缺图%s）' % (args.out, len(ids), len(missing),
                                        '：' + ', '.join(missing) if missing else ''))


if __name__ == '__main__':
    main()
