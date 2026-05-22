#!/bin/sh


help() {
  cat << EOF
SYNOPSIS
  mediasnacks vconcat <video1> <video2> …

DESCRIPTION
  Concatenates video files using FFmpeg's without re-encoding.
  All videos must have compatible codecs and resolutions.

EXAMPLES
  mediasnacks vconcat vid1.mov vid2.mov
  mediasnacks vconcat *.mp4
EOF
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  help
  exit 0
fi

if [ "$#" -lt 2 ]; then
  help
  exit 1
fi

for arg in "$@"; do
  if [ ! -f "$arg" ]; then
    help
    exit 1
  fi
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
