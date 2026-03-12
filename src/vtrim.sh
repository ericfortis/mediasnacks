#!/bin/zsh

if [ "$#" -ne 3 ]; then
    cat << EOF
Usage:
    $(basename $0) <video-file> <start-time> <end-time>

Examples:
    $(basename $0) input.mp4 10 30
    $(basename $0) input.mkv 00:00:10 00:00:30
    $(basename $0) video.mov 1:23.5 2:45.0
EOF
    exit 1
fi

INPUT="$1"
START="$2"
END="$3"

if [ ! -f "$INPUT" ]; then
    echo "Error: file not found: $INPUT"
    exit 1
fi

BASENAME=$(basename "$INPUT")
DIRNAME=$(dirname "$INPUT")
EXT="${BASENAME##*.}"
NAME="${BASENAME%.*}"

OUTFILE="$DIRNAME/${NAME}.trim.$EXT"

ffmpeg -v error -y -ss "$START" -to "$END" -i "$INPUT" -c copy "$OUTFILE"
