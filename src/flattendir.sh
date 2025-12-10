#!/bin/sh

# Moves unique files to the top dir and deletes empty dirs
# Usage: mediasnacks flattendir [folder]
# Default: current working directory

DIR="${1:-$(pwd)}"

find "$DIR" -mindepth 2 -type f | while IFS= read -r file; do
  dest="$DIR/$(basename "$file")"
  if [ ! -e "$dest" ]; then
    mv "$file" "$dest"
  fi
done

find "$DIR" -type f -name '.DS_Store' -delete
find "$DIR" -depth -type d -empty ! -path "$DIR" -delete
