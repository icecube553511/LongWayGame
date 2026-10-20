#!/usr/bin/env python3
"""角色剧情立绘的机器质检（补充 check.js 只看文件头的盲区）。

  python tools/qc-portraits.py
  python tools/qc-portraits.py --csv tmp/qc-portraits.csv

检查对象：docs/reviews/char-progression-spec.json 里每个状态的
`{portraitId}_{face}.png`。逐张与同状态 `_calm.png` 比对：

  1. 洋红残留：alpha 内的洋红像素占比（抠底失败）；
  2. 实心占比：人物是否被抠成一小块/几乎全空（漂白、错抠）；
  3. 轮廓 IoU：表情图是否换了姿势/构图；
  4. 身体差异：腰部以下的平均色差（换衣服、重画整幅）。

阈值刻意保守：只拦“一眼坏”的图，风格差异交给人工评审。
退出码 1 表示有硬伤；警告只打印，不阻断。
"""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "docs" / "reviews" / "char-progression-spec.json"
CHARS = ROOT / "assets" / "generated" / "chars"

MAGENTA_MAX = 0.002
COVERAGE_MIN = 0.20
IOU_MIN = 0.80
BODY_DIFF_MAX = 55.0


def metrics(calm: np.ndarray, img: np.ndarray):
    calm_alpha = calm[:, :, 3] > 8
    alpha = img[:, :, 3] > 8
    if not alpha.any():
        return 1.0, 0.0, 0.0, 0.0
    rgb = img[:, :, :3]
    subject = rgb[alpha]
    magenta = (
        (subject[:, 0] > 150)
        & (subject[:, 2] > 150)
        & (subject[:, 1] + 60 < np.minimum(subject[:, 0], subject[:, 2]))
        & (subject[:, 0] + subject[:, 2] - 2 * subject[:, 1] > 140)
    ).mean()
    coverage = alpha.mean()
    inter = np.logical_and(alpha, calm_alpha).sum()
    union = np.logical_or(alpha, calm_alpha).sum()
    iou = inter / union if union else 0.0
    body = (np.arange(img.shape[0])[:, None] >= 500) & (alpha | calm_alpha)
    body_diff = np.abs(rgb - calm[:, :, :3])[body].mean() if body.sum() else 0.0
    return float(magenta), float(coverage), float(iou), float(body_diff)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="")
    args = ap.parse_args()

    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    rows = []
    hard = []
    warn = []
    for cid, c in spec["characters"].items():
        for sid, st in c["states"].items():
            calm_path = CHARS / (sid + "_calm.png")
            if not calm_path.exists():
                continue
            calm = np.asarray(Image.open(calm_path).convert("RGBA"), dtype=np.int16)
            for face in st["faces"]:
                if face == "calm":
                    continue
                path = CHARS / (sid + "_" + face + ".png")
                if not path.exists():
                    continue
                img = np.asarray(Image.open(path).convert("RGBA"), dtype=np.int16)
                magenta, coverage, iou, body_diff = metrics(calm, img)
                item = {
                    "state": sid,
                    "face": face,
                    "file": str(path.relative_to(ROOT)),
                    "magenta": magenta,
                    "coverage": coverage,
                    "iou": iou,
                    "body_diff": body_diff,
                }
                rows.append(item)
                if magenta > MAGENTA_MAX or coverage < COVERAGE_MIN:
                    hard.append(item)
                elif iou < IOU_MIN or body_diff > BODY_DIFF_MAX:
                    warn.append(item)

    print("表情图 %d 张；硬伤 %d 张；姿态/构图警告 %d 张" %
          (len(rows), len(hard), len(warn)))
    for item in hard:
        print("  硬伤 %-42s %-7s 洋红=%.3f%% 实心=%.1f%%" % (
            item["state"], item["face"], item["magenta"] * 100,
            item["coverage"] * 100))
    for item in warn:
        print("  警告 %-42s %-7s 轮廓IoU=%.3f 身体差=%.1f" % (
            item["state"], item["face"], item["iou"], item["body_diff"]))

    if args.csv:
        out = ROOT / args.csv
        out.parent.mkdir(parents=True, exist_ok=True)
        with out.open("w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=[
                "state", "face", "file", "magenta", "coverage", "iou", "body_diff"])
            w.writeheader()
            for item in rows:
                w.writerow(item)
        print("明细：" + str(out))

    if hard:
        print("角色剧情立绘质检未通过：先修硬伤再交付。")
        return 1
    print("角色剧情立绘质检通过：无洋红残留、无漂白/错抠。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
