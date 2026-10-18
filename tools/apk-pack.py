#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 aapt2 的产物重新打包成可安装的 APK。

为什么要自己打包，而不是直接给 aapt2 传 -A：
  1) Windows 版 aapt2 会把 -A 目录下的资源写成反斜杠条目（assets\\www\\...），
     而 Android 只认正斜杠路径，装上去会白屏；
  2) targetSdk >= 30 时 Android 强制要求 resources.arsc 以“存储”方式存在且 4 字节对齐，
     .NET 的 ZipArchive 无法写出 method=0 的条目。

用法：
  python tools/apk-pack.py <base.apk> <www目录> <classes.dex> <输出.apk>
"""

import os
import sys
import zipfile

# 这些后缀本身已经是压缩格式，再 deflate 只会白耗时间，直接存储。
STORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".mp3", ".ogg", ".mp4", ".woff2",
}

# 固定时间戳，保证同样的输入打出同样的包。
FIXED_TIME = (1980, 1, 1, 0, 0, 0)


def make_info(name, stored):
    info = zipfile.ZipInfo(name, FIXED_TIME)
    info.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
    if not stored:
        info._compresslevel = 9
    info.external_attr = 0o644 << 16
    return info


def add_stream(zf, name, stream, stored):
    zf.writestr(make_info(name, stored), stream.read())


def add_file(zf, name, path, stored):
    with open(path, "rb") as fh:
        zf.writestr(make_info(name, stored), fh.read())


def main():
    if len(sys.argv) != 5:
        print(__doc__)
        return 2
    base_apk, www_dir, dex_path, out_apk = sys.argv[1:5]

    www_dir = os.path.abspath(www_dir)
    with zipfile.ZipFile(out_apk, "w", allowZip64=True) as zf:
        # 1) aapt2 产出的清单、资源表与 res/ 文件
        with zipfile.ZipFile(base_apk, "r") as base:
            for item in base.infolist():
                name = item.filename.replace("\\", "/")
                stored = name == "resources.arsc"
                add_stream(zf, name, base.open(item), stored)

        # 2) 代码
        add_file(zf, "classes.dex", dex_path, True)

        # 3) 游戏本体
        for root, _dirs, files in os.walk(www_dir):
            files.sort()
            for filename in files:
                full = os.path.join(root, filename)
                relative = os.path.relpath(full, www_dir).replace("\\", "/")
                extension = os.path.splitext(filename)[1].lower()
                add_file(zf, "assets/www/" + relative, full,
                         extension in STORED_EXTENSIONS)

    return 0


if __name__ == "__main__":
    sys.exit(main())
