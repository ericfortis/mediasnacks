#!/bin/zsh

# Convert to GIF

FPS=10
WIDTH=600

usage() {
  echo "Usage: mediasnacks gif [--fps <number>] [--width <pixels>] <file>"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --fps)
      FPS="$2";
      shift 2 ;;
    --width)
      WIDTH="$2"
      shift 2 ;;
    --help|-h)
      usage ;;
    *)
      file="$1"
      shift ;;
  esac
done

[[ -z "$file" ]] && usage

outfile="${file:r}.gif"

ffmpeg -v error -i "$file" \
  -vf "fps=${FPS},scale=${WIDTH}:-1" \
  "$outfile"
