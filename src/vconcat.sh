#!/bin/zsh

if (( $# < 2 )); then
  cat << EOF
Usage:
    $(basename $0) vid1.mov vid2.mov [...]
    $(basename $0) *.mp4
EOF
  exit 1
fi

list_file=$(mktemp -p .)
for file in "$@"; do
  echo "file '$file'" >> "$list_file"
done

first_video="$1"
outfile="${first_video:r}.concat.${first_video:e}"

ffmpeg -v error -f concat -safe 0 -i "$list_file" -c copy "$outfile"

rm "$list_file"
