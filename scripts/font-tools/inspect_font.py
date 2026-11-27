#!/usr/bin/env python3
# 字体字符普查：扫描目录（或单个文件）内的字体，输出每个字体的
# 完整字符清单（<名字>.txt）与 Unicode 区段统计（<名字>.csv），并打印摘要。
# 用法: python inspect_font.py <字体目录|字体文件> [-o 输出目录]（默认 font_reports/）
# 依赖: python -m pip install fonttools

from fontTools.ttLib import TTFont
from fontTools import unicodedata
from collections import Counter
from pathlib import Path
import argparse
import csv

# ---- CLI ----
parser = argparse.ArgumentParser(
    description="字体字符普查：字符清单 + Unicode 区段/文字统计",
)
parser.add_argument("font_path", help="字体目录或单个字体文件")
parser.add_argument("-o", "--output", default="font_reports",
                    help="报告输出目录（默认 font_reports/）")
args = parser.parse_args()

font_path = Path(args.font_path)
if not font_path.exists():
    raise SystemExit(f"路径不存在：{font_path}")

OUTPUT_DIR = Path(args.output)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

extensions = {".ttf", ".otf", ".woff", ".woff2"}

if font_path.is_file():
    font_paths = [font_path]
else:
    font_paths = sorted(
        p for p in font_path.iterdir()
        if p.suffix.lower() in extensions
    )

if not font_paths:
    raise SystemExit(f"目录下没有字体文件：{font_path}")

for path in font_paths:
    try:
        font = TTFont(path)
        cmap = font.getBestCmap()

        if not cmap:
            print(f"跳过：{path.name}")
            continue

        chars = sorted(cmap)
        blocks = Counter()
        scripts = Counter()

        for cp in chars:
            char = chr(cp)
            blocks[unicodedata.block(char)] += 1
            scripts[unicodedata.script(char)] += 1

        size = path.stat().st_size / 1024 / 1024

        print(f"\n{'=' * 60}")
        print(f"字体：{path.name}")
        print(f"大小：{size:.2f} MB")
        print(f"Unicode 映射：{len(cmap)}")
        print(f"Glyph：{len(font.getGlyphOrder())}")

        print("\nUnicode Block：")
        for name, count in blocks.most_common():
            print(f"{name:<45} {count:>6}")

        print("\nUnicode Script：")
        for name, count in scripts.most_common():
            print(f"{name:<20} {count:>6}")

        # 导出字符列表
        prefix = path.stem

        with open(
            OUTPUT_DIR / f"{prefix}.txt",
            "w",
            encoding="utf-8"
        ) as f:
            f.write("".join(chr(cp) for cp in chars))

        # 导出区段统计
        with open(
            OUTPUT_DIR / f"{prefix}.csv",
            "w",
            newline="",
            encoding="utf-8-sig"
        ) as f:
            writer = csv.writer(f)
            writer.writerow(["Block", "Count"])

            for name, count in blocks.most_common():
                writer.writerow([name, count])

    except Exception as e:
        print(f"处理失败：{path.name}: {e}")
