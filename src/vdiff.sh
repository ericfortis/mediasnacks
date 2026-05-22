#!/bin/sh


help() {
  /bin/cat << EOF
SYNOPSIS
  mediasnacks vdiff <video1> <video2>

DESCRIPTION
  Diffs two video files using FFplay with a blend filter. Videos must have
  the same resolution and ideally the same framerate.
EOF
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  help
  exit 0
fi

if [ $# -lt 2 ] || [ ! -f "$1" ] || [ ! -f "$2" ]; then
  help
  exit 1
fi

video1="$1"
video2="$2"
ffprobe -v error "$video1" || exit 1
ffprobe -v error "$video2" || exit 1

ffplay -hide_banner \
	-f lavfi "movie=$video1 [a]; movie=$video2 [b]; [a][b] blend=all_mode=difference128"

#all_mode=difference: absolute diff (ideal for detecting visual changes)
#all_mode=subtract: raw subtraction (can go <0, may appear darker)
#all_mode=difference128: shows neutral gray if identical, differences as dark/light shifts
