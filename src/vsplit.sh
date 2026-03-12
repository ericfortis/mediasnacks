#!/bin/zsh

if [ "$#" -lt 2 ]; then
	cat << EOF
Usage:
    $(basename $0) <split-time-1> [split-time-2 ...] <video-file>

Examples:
    $(basename $0) 123.45 video.mp4
    $(basename $0) 60 120 180 video.mov
    $(basename $0) 00:01:00 00:02:00 00:03:00 video.mkv
EOF
	exit 1
fi

VIDEO="${@[-1]}"
SPLITS=("${@[1,-2]}")

if [ ! -f "$VIDEO" ]; then
	echo "Error: file not found: $VIDEO"
	exit 1
fi

DIRNAME=$(dirname "$VIDEO")
BASENAME=$(basename "$VIDEO")
EXT="${BASENAME##*.}"
NAME="${BASENAME%.*}"

N_CLIPS=$((${#SPLITS[@]} + 1))

for (( i=1; i<=$N_CLIPS; i++ )); do
	outfile="$DIRNAME/${NAME}_${i}.$EXT"

	if [ $i -eq 1 ]; then # First clip: [start, first_split]
		ffmpeg -v error -y -i "$VIDEO" \
			-t "${SPLITS[1]}" \
			-c copy "$outfile"

	elif [ $i -eq $N_CLIPS ]; then # Last clip: [last_split, end]
		ffmpeg -v error -y -i "$VIDEO" \
			-ss "${SPLITS[-1]}" \
			-c copy "$outfile"

	else # Middle clip: [split[i-1], split[i]]
		ffmpeg -v error -y -i "$VIDEO" \
			-ss "${SPLITS[$((i-1))]}" \
			-to "${SPLITS[$i]}" \
			-c copy "$outfile"
	fi
done
