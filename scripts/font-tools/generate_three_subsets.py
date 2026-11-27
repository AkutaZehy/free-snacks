#!/usr/bin/env python3
# Generate three independent WOFF2 subsets:
#   zh-CN core, zh-TW/Hant core, ja-JP core
#
# Usage:
#   python generate_three_subsets.py <font-file> [--corpus-dir <dir>] [--out-dir <dir>]
#     <font-file>    TTF/OTF to subset
#     --corpus-dir   corpus directory (default: corpora/ next to this script)
#     --out-dir      output directory (default: three_subsets/)
#
# Requires:
#   python -m pip install fonttools brotli
#
# Corpora source: zispace/hanzi-chars (see README 附注).
# Adapted from a local workshop script (originally hardcoded fonts/ + FONT_FILES).

from pathlib import Path
import argparse
import csv
import subprocess
import sys
import unicodedata

# Language-specific core sets, following the previous experiment.
LANGUAGE_CORPORA = {
    "zh-CN-core": [
        "chinese/simplified/common_2022.txt",
        "chinese/simplified/level1_2013.txt",
        "chinese/simplified/level2_2013.txt",
    ],
    "zh-Hant-core": [
        "chinese/traditional/big5_common.txt",
        "chinese/traditional/taiwan_common.txt",
        "chinese/traditional/hongkong_common.txt",
        "chinese/traditional/gb12345.txt",
    ],
    "ja-JP-core": [
        "japanese/jis0208.txt",
    ],
}

# Shared Latin coverage. Avoid adding entire punctuation blocks as text:
# many code points in those blocks are unassigned, unsupported, or irrelevant.
LATIN_RANGES = [
    (0x0020, 0x007E),  # Basic Latin, printable ASCII
    (0x00A0, 0x00FF),  # Latin-1 Supplement
    (0x0100, 0x017F),  # Latin Extended-A
    (0x0300, 0x036F),  # Combining Diacritical Marks
]

# Candidate punctuation/symbols are selected by Unicode category, then
# intersected with the actual font cmap. This avoids the old 171 missing
# characters caused by blindly requesting every code point in large blocks.
PUNCTUATION_BLOCKS = [
    (0x2000, 0x206F),  # General Punctuation
    (0x3000, 0x303F),  # CJK Symbols and Punctuation
    (0xFF00, 0xFFEF),  # Halfwidth and Fullwidth Forms
]


def load_corpus(path: Path) -> set[int]:
    if not path.exists():
        raise FileNotFoundError(f"Corpus file not found: {path}")
    chars: set[int] = set()
    text = path.read_text(encoding="utf-8-sig")
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        for ch in line:
            if not ch.isspace():
                chars.add(ord(ch))
    return chars


def load_font_cmap(font_path: Path) -> set[int]:
    # Use FontTools' Python API to read cmap; subset itself is invoked via
    # `python -m fontTools.subset`, so no fonttools executable on PATH needed.
    try:
        from fontTools.ttLib import TTFont
    except ImportError as exc:
        raise RuntimeError(
            "FontTools is not installed. Run: python -m pip install fonttools brotli"
        ) from exc

    font = TTFont(str(font_path), lazy=False)
    try:
        cmap = font.getBestCmap() or {}
        return {cp for cp, glyph_name in cmap.items() if glyph_name != ".notdef"}
    finally:
        font.close()


def shared_chars(font_cmap: set[int]) -> set[int]:
    chars: set[int] = set()
    for start, end in LATIN_RANGES:
        chars.update(range(start, end + 1))

    punctuation_candidates = set()
    for start, end in PUNCTUATION_BLOCKS:
        punctuation_candidates.update(range(start, end + 1))

    # Keep punctuation, separators and symbols only when the font supports them.
    # Unsupported code points are not silently counted as language coverage.
    for cp in punctuation_candidates & font_cmap:
        category = unicodedata.category(chr(cp))
        if category.startswith(("P", "Z", "S")):
            chars.add(cp)

    # Include ordinary whitespace explicitly.
    chars.update({0x0020, 0x00A0, 0x3000})
    return chars


def subset_one(font_path: Path, font_cmap: set[int], label: str,
               corpus_paths: list[str]) -> dict:
    language_chars: set[int] = set()
    for relative_path in corpus_paths:
        language_chars.update(load_corpus(CORPUS_DIR / relative_path))

    shared = shared_chars(font_cmap)
    requested = shared | language_chars
    supported = requested & font_cmap
    missing = requested - font_cmap

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    font_out_dir = OUT_DIR / font_path.stem
    font_out_dir.mkdir(parents=True, exist_ok=True)

    output_path = font_out_dir / f"{font_path.stem}.{label}.woff2"
    text_path = font_out_dir / f"{label}.txt"
    missing_path = font_out_dir / f"{label}.missing.txt"

    # Write exactly the requested code points to the subset input.
    text_path.write_text(
        "".join(chr(cp) for cp in sorted(requested)),
        encoding="utf-8",
    )
    missing_path.write_text(
        "".join(chr(cp) for cp in sorted(missing)),
        encoding="utf-8",
    )

    cmd = [
        sys.executable, "-m", "fontTools.subset",
        str(font_path),
        f"--text-file={text_path}",
        "--flavor=woff2",
        "--layout-features=*",
        "--name-IDs=*",
        "--name-languages=*",
        f"--output-file={output_path}",
    ]
    subprocess.run(cmd, check=True)

    size_bytes = output_path.stat().st_size
    language_supported = language_chars & font_cmap
    language_missing = language_chars - font_cmap

    return {
        "font": font_path.name,
        "subset": label,
        "language_requested": len(language_chars),
        "language_supported": len(language_supported),
        "language_missing": len(language_missing),
        "language_coverage": (
            len(language_supported) / len(language_chars)
            if language_chars else 1.0
        ),
        "shared_requested": len(shared),
        "shared_missing": len(shared - font_cmap),
        "size_bytes": size_bytes,
        "size_MiB": size_bytes / (1024 * 1024),
        "output": str(output_path),
        "status": "OK",
    }


def main():
    global CORPUS_DIR, OUT_DIR

    parser = argparse.ArgumentParser(
        description="Subset a font into zh-CN / zh-Hant / ja-JP WOFF2 cores by corpus."
    )
    parser.add_argument("font", help="font file to subset (TTF/OTF)")
    parser.add_argument(
        "--corpus-dir",
        default=str(Path(__file__).resolve().parent / "corpora"),
        help="corpus directory (default: corpora/ next to this script)",
    )
    parser.add_argument(
        "--out-dir", default="three_subsets",
        help="output directory (default: three_subsets/)",
    )
    args = parser.parse_args()

    font_path = Path(args.font)
    if not font_path.is_file():
        raise SystemExit(f"Font not found: {font_path}")

    CORPUS_DIR = Path(args.corpus_dir)
    OUT_DIR = Path(args.out_dir)

    rows = []
    print(f"\nFONT: {font_path.name}")
    cmap = load_font_cmap(font_path)
    print(f"Unicode mappings: {len(cmap)}")

    for label, corpus_paths in LANGUAGE_CORPORA.items():
        row = subset_one(font_path, cmap, label, corpus_paths)
        rows.append(row)
        print(
            f"{label:14s} "
            f"coverage={row['language_coverage']:.2%} "
            f"({row['language_supported']}/{row['language_requested']}) "
            f"missing={row['language_missing']} "
            f"size={row['size_MiB']:.3f} MiB "
            f"-> {row['output']}"
        )

    if rows:
        csv_path = OUT_DIR / "summary.csv"
        with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        print(f"\nSummary: {csv_path}")
    else:
        print("\nNo subset was generated.")


if __name__ == "__main__":
    main()
