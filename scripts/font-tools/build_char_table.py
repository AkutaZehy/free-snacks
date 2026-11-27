#!/usr/bin/env python3
# 生成子集化字表（font_compress.sh / fonttools subset --text-file 所用格式）。
#
# 两种生成条件（对应工作坊的两条真实产线）：
#   1. --from-font <字体>
#        字体 cmap ∩ Unicode 区段白名单（KEEP_BLOCKS，逐字取自原 keep_chars.txt 产线）
#   2. --from-corpus <字表...> [--ascii] [--intersect-font <字体>]
#        合并多份语料字表（# 注释剔除、去重、保持首现顺序）
#        --ascii 追加可打印 ASCII (U+0020..U+007E)
#        --intersect-font 只保留该字体实际支持的字符
# 语料格式与 corpora/ 一致：每行一字或多字，# 开头为注释，UTF-8(-sig)。
#
# 用法:
#   python build_char_table.py --from-font 字体.ttf -o table.txt
#   python build_char_table.py --from-corpus 语料1.txt 语料2.txt --ascii -o table.txt
#
# 依赖: python -m pip install fonttools

from pathlib import Path
import argparse

from fontTools.ttLib import TTFont
from fontTools.unicodedata import block

KEEP_BLOCKS = {
    "Basic Latin",
    "Latin-1 Supplement",
    "Latin Extended-A",
    "Latin Extended-B",
    "IPA Extensions",
    "Spacing Modifier Letters",
    "Combining Diacritical Marks",
    "General Punctuation",
    "Currency Symbols",
    "Letterlike Symbols",
    "Number Forms",
    "Enclosed Alphanumerics",
    "Miscellaneous Symbols",
    "Dingbats",
    "CJK Symbols and Punctuation",
    "Halfwidth and Fullwidth Forms",
    "Enclosed CJK Letters and Months",
    "CJK Compatibility",
    "CJK Compatibility Forms",
    "CJK Compatibility Ideographs",
    "Vertical Forms",
    "CJK Unified Ideographs",
    "CJK Unified Ideographs Extension A",
    "Hiragana",
    "Katakana",
    "Katakana Phonetic Extensions",
    "Kanbun",
    "Hangul Syllables",
    "Hangul Jamo",
    "Hangul Jamo Extended-A",
    "Hangul Jamo Extended-B",
    "Hangul Compatibility Jamo",
}


def load_corpus(path: Path) -> list[str]:
    """读取一份语料字表：# 注释剔除、剔除空白、保序去重。"""
    text = path.read_text(encoding="utf-8-sig")
    chars: list[str] = []
    seen: set[str] = set()
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        for ch in line:
            if ch.isspace() or ch in seen:
                continue
            seen.add(ch)
            chars.append(ch)
    return chars


def font_cmap(path: Path) -> set[int]:
    font = TTFont(str(path), lazy=False)
    try:
        cmap = font.getBestCmap() or {}
        return {cp for cp, glyph in cmap.items() if glyph != ".notdef"}
    finally:
        font.close()


def main():
    parser = argparse.ArgumentParser(
        description="生成子集化字表（fonttools subset --text-file 格式）",
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--from-font", metavar="字体",
                      help="条件1: 字体 cmap ∩ 区段白名单")
    mode.add_argument("--from-corpus", nargs="+", metavar="字表",
                      help="条件2: 合并语料字表")
    parser.add_argument("--ascii", action="store_true",
                        help="corpus 模式: 追加可打印 ASCII (U+0020..U+007E)")
    parser.add_argument("--intersect-font", metavar="字体",
                        help="corpus 模式: 只保留该字体实际支持的字符")
    parser.add_argument("-o", "--output", default="char_table.txt",
                        help="输出文件（默认 char_table.txt）")
    args = parser.parse_args()

    if args.from_font:
        cmap = font_cmap(Path(args.from_font))
        chars = [chr(cp) for cp in cmap if block(chr(cp)) in KEEP_BLOCKS]
    else:
        chars: list[str] = []
        seen: set[str] = set()
        for name in args.from_corpus:
            path = Path(name)
            if not path.is_file():
                raise SystemExit(f"字表不存在: {path}")
            for ch in load_corpus(path):
                if ch not in seen:
                    seen.add(ch)
                    chars.append(ch)
        if args.ascii:
            for cp in range(0x20, 0x7F):
                ch = chr(cp)
                if ch not in seen:
                    seen.add(ch)
                    chars.append(ch)
        if args.intersect_font:
            cmap = font_cmap(Path(args.intersect_font))
            chars = [ch for ch in chars if ord(ch) in cmap]

    Path(args.output).write_text("".join(chars), encoding="utf-8")
    print(f"unique chars: {len(set(chars))} -> {args.output}")


if __name__ == "__main__":
    main()
