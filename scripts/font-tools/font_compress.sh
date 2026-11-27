#!/bin/bash

# MIT License
# Copyright (c) 2022-present MoyuScript
# See: https://mit-license.org/
#
# 本地来源: https://gist.github.com/rain2307/78028834596df9823486413b98bbf12a （「字体压缩」Gist, 2023-09-02）
# 注: 版权归属仅见于脚本内这一行声明，原作者仓库未能查证（MoyuScript 名下公开仓库无字体相关项目）。
# 本地修改: ① subset 模式下字表缺失或第 3 参指向不存在的文件时明确报错退出（原版会静默换用错误字表继续跑）；
#           ② fonttools 改为 `python -m` 调用，Windows 上无需把 pip Scripts 目录加进 PATH；
#           ③ subset 失败立即退出，不再继续跑 compress 产生误导性二次报错。

echo "Input path: $1"
echo "With subset: $2"
echo "Custom text file: $3"

# Get current file directory
current_dir=$(dirname "$0")

text_file="$current_dir/font-compress-subset-text.txt"

if [ -f "$3" ]; then
    text_file="$3"
fi

# Subset 模式需要字表：显式传入但文件不存在 -> 报错；默认字表缺失 -> 报错并提示自带字表
if [ "$2" = "true" ]; then
    if [ -n "$3" ] && [ ! -f "$3" ]; then
        echo "ERROR: 第 3 参指向的字表不存在: $3" >&2
        exit 1
    fi
    if [ ! -f "$text_file" ]; then
        echo "ERROR: subset 模式需要字表，但找不到默认字表: $text_file" >&2
        echo "  仓库自带字表 font-compress-subset-text.txt 应与本脚本同目录；单独拷贝本脚本时请一并带上，" >&2
        echo "  或传入自定义字表: bash font_compress.sh <路径> true 你的字表.txt" >&2
        exit 1
    fi
fi

# Compress font
compress() {
    # Get file basename
    file_basename=$(basename "$1")
    # Get file extension
    file_extension="${file_basename##*.}"
    # Get file name without extension
    file_name="${file_basename%.*}"

    if [ "$2" = "true" ]; then
        echo "Make subset for $1 with $text_file"
        python -m fontTools.subset "$1" --text-file="$text_file" --output-file="$file_name.subset.$file_extension" || exit 1
        echo "Compressing $1.subset"
        python -m fontTools.ttLib.woff2 compress "$file_name.subset.$file_extension" -o "$file_name.subset.woff2"
    else
        echo "Compressing $1"
        python -m fontTools.ttLib.woff2 compress "$1" -o "$file_name.woff2"
    fi
}

# Is directory?
if [ -d "$1" ]; then
    echo "Directory"
    for file in "$1"/*.{ttf,otf}; do
        compress "$file" "$2"
    done
else
    echo "File"
    compress "$1" "$2"
fi
