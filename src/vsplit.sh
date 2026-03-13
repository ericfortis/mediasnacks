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

# Get framerate to calculate frame duration
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$VIDEO")
FRAME_DURATION=$(awk "BEGIN {print 1/($FPS)}")

N_CLIPS=$(($# + 1))

i=1
while [ $i -le $N_CLIPS ]; do
	outfile="$DIRNAME/${NAME}_${i}.$EXT"

	if [ $i -eq 1 ]; then # First clip: [start, first_split] minus one frame
		eval "split_time=\${1}"
		# Subtract one frame duration from end time
		end_time=$(awk "BEGIN {print $split_time - $FRAME_DURATION}")
		ffmpeg -v error -y -i "$VIDEO" \
			-to "$end_time" \
			-c copy "$outfile"

	elif [ $i -eq $N_CLIPS ]; then # Last clip: [last_split, end] - no frame subtraction
		eval "split_time=\${$#}"
		ffmpeg -v error -y -ss "$split_time" -i "$VIDEO" \
			-c copy "$outfile"

	else # Middle clip: [split[i-1], split[i]] minus one frame
		eval "start_time=\${$((i-1))}"
		eval "end_time=\${$i}"
		# Subtract one frame duration from end time
		adjusted_end=$(awk "BEGIN {print $end_time - $FRAME_DURATION}")
		ffmpeg -v error -y -ss "$start_time" -i "$VIDEO" \
			-to "$adjusted_end" \
			-c copy "$outfile"
	fi
	i=$((i + 1))
done
