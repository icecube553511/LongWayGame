#!/usr/bin/env python3
"""把 NekoGptImage 生成的立绘原始图处理成游戏用的 600×900 透明 PNG。

  python tools/neko-post.py                 # 处理 tmp/neko-raw 下的全部原始图
  python tools/neko-post.py mao_calm        # 只处理指定文件（不含扩展名）
  python tools/neko-post.py --raw tmp/neko-states-raw --out assets/generated/chars \
      mao_ch01_start_calm                   # 处理角色演进状态

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

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "tmp" / "neko-raw"
OUT = ROOT / "assets" / "generated" / "chars"
TARGET = (600, 900)
PNG_LIMIT = 512 * 1024
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


def is_magenta(r: int, g: int, b: int) -> bool:
    """洋红键色/残留的判别式。

    上游偶尔返回「带 alpha 通道、但洋红底仍是不透明」的 RGBA；旧逻辑只看
    alpha，成品里就会留下一整片洋红。这里不再依赖四角取样是否成功，
    对任何红蓝高、绿色明显偏低的像素都强制抠掉。
    """
    return r > 150 and b > 150 and g + 60 < min(r, b) and (r + b - 2 * g) > 140


def key_color(img: Image.Image) -> tuple[int, int, int]:
    w, h = img.size
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]
    px = img.load()
    # 不能取四角中位数：角色可能把手/桌面/道具伸进下两角，中位数会偏成
    # 红褐道具色，随后整片 #FF00FF 背景都被当成人物保留。
    # 洋红键色的判别式是 R+B-2G，取四角里最“洋红”的那一角。
    def magenta_score(p: tuple[int, int]) -> int:
        r, g, b = px[p[0], p[1]][:3]
        return int(r) + int(b) - 2 * int(g)
    chosen = max(pts, key=magenta_score)
    return tuple(px[chosen[0], chosen[1]][:3])


def has_useful_alpha(img: Image.Image) -> bool:
    """上游若已经返回透明底，必须先认 alpha。
    历史事故：把 RGBA 强制转 RGB 后再按洋红键色抠图，会把透明区压成的黑色
    当成人物暗部，打出窟窿（PRODUCTION_SPEC §10.4）。"""
    if img.mode not in ("RGBA", "LA") and "transparency" not in img.info:
        return False
    alpha = img.convert("RGBA").getchannel("A")
    return alpha.getextrema()[0] < 250


def strip_magenta_fringe(rgba: Image.Image, alpha: Image.Image) -> Image.Image:
    """上游即使返回 alpha，也会在人物边缘留一圈洋红色 RGB 污染。
    在源分辨率先按洋红色阈值削掉这条边，再做裁切缩放。"""
    r, g, b = rgba.convert("RGB").split()
    # 洋红边经过缩放/调色板量化后会变暗，不能只抓“亮洋红”。
    # 用色相关系（R、B 同时明显高于 G）更可靠；红领章与肤色不同时满足 B>G。
    m_r = ImageChops.subtract(r, g).point(lambda v: 255 if v >= 18 else 0)
    m_b = ImageChops.subtract(b, g).point(lambda v: 255 if v >= 18 else 0)
    mask = ImageChops.multiply(m_r, m_b)
    return ImageChops.subtract(alpha, mask)


def process(src: Path, dst: Path) -> str:
    source = Image.open(src)
    source.load()
    mode = "alpha" if has_useful_alpha(source) else "key"

    if mode == "alpha":
        out = source.convert("RGBA")
        alpha = out.getchannel("A")
        kr, kg, kb = key_color(source.convert("RGB"))
        alpha = strip_magenta_fringe(out, alpha)
        out.putalpha(alpha)
        # 上游 alpha 不可信时，洋红底会原样留在画面里；再叠一层硬抠。
        px = out.convert("RGB").load()
        ap = alpha.load()
        w, h = out.size
        for y in range(h):
            for x in range(w):
                if is_magenta(*px[x, y]):
                    ap[x, y] = 0
    else:
        img = source.convert("RGB")
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
                elif is_magenta(r, g, b) or (g + 40 < r and g + 40 < b and d < 260):
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
    # 缩放会把源图的洋红边混回人物边缘；缩到 600×900 后再削一次。
    alpha_trimmed = strip_magenta_fringe(out, out.getchannel("A"))
    out.putalpha(alpha_trimmed)

    # 低多边形画风本来就是少量纯色块。先量化到 160 色；若仍超 512 KB，
    # 逐级降到 128/96/64 色（只丢噪点，不缩尺寸、不模糊）。
    # 半透明边缘的 8 位噪声对 PNG 体积影响很大；保留 16 级 alpha，
    # 足以保持低多边形硬边，同时让 600×900 成品稳定落在 512 KB 以内。
    alpha_small = out.getchannel("A").point(lambda a: min(255, (a // 16) * 16))
    rgba = out.convert("RGBA")
    rgba.putalpha(alpha_small)
    dst.parent.mkdir(parents=True, exist_ok=True)
    used_colors = 160
    for colors in (160, 128, 96, 64, 48, 32, 24, 16, 12):
        used_colors = colors
        # RGBA + FASTOCTREE 会生成带 transparency 的 P 模式 PNG：
        # 低多边形本来色数少，这种写法几乎无视觉损失，体积通常只有 RGBA 的 1/4。
        q = rgba.quantize(colors=colors, method=Image.FASTOCTREE)
        q.save(dst, "PNG", optimize=True)
        if dst.stat().st_size <= PNG_LIMIT:
            out = q
            break
    out = q
    cov = sum(alpha_small.histogram()[9:]) / (TARGET[0] * TARGET[1])
    key_text = "alpha" if mode == "alpha" else f"key=#{kr:02X}{kg:02X}{kb:02X}"
    return (f"{dst.name:28s} {key_text:18s} 实心占比={cov:5.1%}  "
            f"{used_colors}色  {dst.stat().st_size // 1024}KB")


def main() -> int:
    args = sys.argv[1:]
    raw = RAW
    out = OUT
    filt = []
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--raw" and i + 1 < len(args):
            raw = Path(args[i + 1]).resolve()
            i += 2
            continue
        if a == "--out" and i + 1 < len(args):
            out = Path(args[i + 1]).resolve()
            i += 2
            continue
        filt.append(a)
        i += 1
    if not raw.exists():
        print("没有原始图目录：" + str(raw), file=sys.stderr)
        return 1
    files = sorted(raw.glob("*.png"))
    if filt:
        files = [f for f in files if f.stem in filt]
    if not files:
        print("没有匹配的原始图", file=sys.stderr)
        return 1
    for f in files:
        try:
            print(process(f, out / (f.stem + ".png")))
        except Exception as e:  # noqa: BLE001
            print(f"{f.name} 处理失败：{e}", file=sys.stderr)
    print(f"\n共处理 {len(files)} 张 → {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
