#!/bin/sh

if [ "$#" -ne 3 ]; then
	cat << EOF
Usage:
    $(basename $0) <start-time> <end-time> <video-file>

Examples:
    $(basename $0) 10 30 input.mp4
    $(basename $0) 00:00:10 00:00:30 input.mkv
    $(basename $0) 1:23.5 2:45.0 video.mov
EOF
	exit 1
fi

START="$1"
END="$2"
VIDEO="$3"

if [ ! -f "$VIDEO" ]; then
	echo "Error: file not found: $VIDEO"
	exit 1
fi

BASENAME=$(basename "$VIDEO")
DIRNAME=$(dirname "$VIDEO")
EXT="${BASENAME##*.}"
NAME="${BASENAME%.*}"

outfile="$DIRNAME/${NAME}.trim.$EXT"

duration=$(awk "BEGIN {print $END - $START}")

ffmpeg -v error -y -ss "$START" -i "$VIDEO" \
	-t "$duration" \
	-c copy "$outfile"
