#!/bin/sh

if [ "$#" -lt 2 ]; then
  cat << EOF
Usage:
    $(basename "$0") vid1.mov vid2.mov [...]
    $(basename "$0") *.mp4
EOF
  exit 1
fi

list_file=$(mktemp -p .)
for file in "$@"; do
  fname=$(printf '%s' "$file" | sed "s/'/'\\\\''/g") # Escape single quotes
  printf "file '%s'\n" "$fname" >> "$list_file"
done

first_video="$1"
name="${first_video%.*}"
ext="${first_video##*.}"
outfile="${name}.concat.${ext}"

ffmpeg -v error -f concat -safe 0 -i "$list_file" -c copy "$outfile"
rm "$list_file"
