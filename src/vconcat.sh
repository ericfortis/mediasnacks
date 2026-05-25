#!/bin/sh


help() {
  cat << EOF
SYNOPSIS
  mediasnacks vconcat <video1> <video2> …

DESCRIPTION
  Concatenates video files using FFmpeg without re-encoding.
  All videos must have compatible codecs and resolutions.

EXAMPLES
  mediasnacks vconcat vid1.mov vid2.mov
  mediasnacks vconcat *.mp4
EOF
  exit "${1:-0}"
}

[ "$1" = "-h" ] && help
[ "$#" -lt 2 ] && help 1

for arg in "$@"; do
  [ ! -f "$arg" ] && help 1
done

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
