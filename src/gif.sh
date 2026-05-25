#!/bin/sh

FPS=10
WIDTH=600

help() {
  /bin/cat << EOF
SYNOPSIS
  mediasnacks gif [--fps <number>] [-w | --width <pixels>] <file>

DESCRIPTION
  Converts video to GIF

OPTIONS
  --fps       Default: $FPS
  -w,--width  Default: $WIDTH
EOF
  exit "${1:-0}"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --fps)
      FPS="$2";
      shift 2 ;;

    --width|-w)
      WIDTH="$2"
      shift 2 ;;

    --help|-h)
      help ;;

    *)
      file="$1"
      shift ;;
  esac
done

[ -z "$file" ] && help 1

ffmpeg -v error -i "$file" \
  -vf "fps=${FPS},scale=${WIDTH}:-1" \
  "${file%.*}.gif"
