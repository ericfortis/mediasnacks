#!/bin/zsh

if [ "$#" -lt 2 ]; then
    cat << EOF
Usage:
    $(basename $0) <split-time-1> [split-time-2 ...] <video-file>

Examples:
    $(basename $0) 123.45 input.mp4
    $(basename $0) 60 120 180 video.mov
    $(basename $0) 00:01:00 00:02:00 00:03:00 input.mkv
EOF
    exit 1
fi

VIDEO="${@[-1]}"
SPLITS=("${@[1,-2]}")

if [ ! -f "$VIDEO" ]; then
    echo "Error: file not found: $VIDEO"
    exit 1
fi

BASENAME=$(basename "$VIDEO")
DIRNAME=$(dirname "$VIDEO")
EXT="${BASENAME##*.}"
NAME="${BASENAME%.*}"

SEGMENT_COUNT=$((${#SPLITS[@]} + 1))

for (( i=1; i<=$SEGMENT_COUNT; i++ )); do
    OUTFILE="$DIRNAME/${NAME}_${i}.$EXT"

    if [ $i -eq 1 ]; then
        # First segment: from start to first split
        ffmpeg -v error -y -i "$VIDEO" -t "${SPLITS[1]}" -c copy "$OUTFILE"
    elif [ $i -eq $SEGMENT_COUNT ]; then
        # Last segment: from last split to end
        ffmpeg -v error -y -ss "${SPLITS[-1]}" -i "$VIDEO" -c copy "$OUTFILE"
    else
        # Middle segments: from split[i-1] to split[i]
        PREV_SPLIT="${SPLITS[$((i-1))]}"
        CURR_SPLIT="${SPLITS[$i]}"
        ffmpeg -v error -y -ss "$PREV_SPLIT" -to "$CURR_SPLIT" -i "$VIDEO" -c copy "$OUTFILE"
    fi
done
