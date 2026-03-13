#!/bin/sh

if [ "$#" -lt 2 ]; then
	cat << EOF
Usage:
    $(basename "$0") <split-time-1> [split-time-2 ...] <video-file>

Examples:
    $(basename "$0") 123.45 video.mp4
    $(basename "$0") 60 120 180 video.mov
    $(basename "$0") 00:01:00 00:02:00 00:03:00 video.mkv
EOF
	exit 1
fi

# Get last argument (video file)
eval "VIDEO=\${$#}"

# Store all split times
SPLITS="$*"
# Remove last argument from splits
set -- $(echo "$SPLITS" | awk '{for(i=1;i<NF;i++) print $i}')

if [ ! -f "$VIDEO" ]; then
	echo "Error: file not found: $VIDEO"
	exit 1
fi

DIRNAME=$(dirname "$VIDEO")
BASENAME=$(basename "$VIDEO")
EXT="${BASENAME##*.}"
NAME="${BASENAME%.*}"

N_CLIPS=$(($# + 1))

i=1
while [ $i -le $N_CLIPS ]; do
	outfile="$DIRNAME/${NAME}_${i}.$EXT"

	if [ $i -eq 1 ]; then # First clip: [start, first_split]
		eval "split_time=\${1}"
		ffmpeg -v error -y -i "$VIDEO" \
			-t "$split_time" \
			-c copy -avoid_negative_ts make_zero "$outfile"

	elif [ $i -eq $N_CLIPS ]; then # Last clip: [last_split, end]
		eval "split_time=\${$#}"
		ffmpeg -v error -y -i "$VIDEO" \
			-ss "$split_time" \
			-c copy -avoid_negative_ts make_zero "$outfile"

	else # Middle clip: [split[i-1], split[i]]
		eval "start_time=\${$((i-1))}"
		eval "end_time=\${$i}"
		ffmpeg -v error -y -i "$VIDEO" \
			-ss "$start_time" \
			-to "$end_time" \
			-c copy -avoid_negative_ts make_zero "$outfile"
	fi
	i=$((i + 1))
done
