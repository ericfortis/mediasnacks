#!/bin/sh

help() {
  /bin/cat << EOF
SYNOPSIS
  mediasnacks flattendir [folder]

DESCRIPTION
  Moves unique files from subdirectories into the top-level folder, then
  deletes empty directories. Defaults to the current working directory.
EOF
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  help
  exit 0
fi

if [ $# -gt 0 ] && [ ! -d "$1" ]; then
  help
  exit 1
fi

DIR="${1:-$(pwd)}"

find "$DIR" -mindepth 2 -type f | while IFS= read -r file; do
  dest="$DIR/$(basename "$file")"
  if [ ! -e "$dest" ]; then
    mv "$file" "$dest"
  fi
done

find "$DIR" -type f -name '.DS_Store' -delete
find "$DIR" -depth -type d -empty ! -path "$DIR" -delete
