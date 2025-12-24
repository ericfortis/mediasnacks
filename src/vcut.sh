#!/bin/zsh

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <video-file> <split-time>"
    echo "Example:"
    echo "  $0 input.mp4 123.45"
    echo "  $0 input.mkv 00:02:03.500"
    exit 1
fi

INPUT="$1"
SPLIT="$2"

if [ ! -f "$INPUT" ]; then
    echo "Error: file not found: $INPUT"
    exit 1
fi

BASENAME=$(basename "$INPUT")
DIRNAME=$(dirname "$INPUT")
EXT="${BASENAME##*.}"
NAME="${BASENAME%.*}"

OUT1="$DIRNAME/${NAME}_a.$EXT"
OUT2="$DIRNAME/${NAME}_b.$EXT"

ffmpeg -v error -y -i "$INPUT" -t "$SPLIT" -c copy "$OUT1"
ffmpeg -v error -y -ss "$SPLIT" -i "$INPUT" -c copy "$OUT2"
