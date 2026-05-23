#!/bin/sh

help() {
  /bin/cat << EOF
SYNOPSIS
  mediasnacks flattendir

DESCRIPTION
	On the current working directory, it moves unique files from subdirectories
	into the top-level folder, then deletes empty directories.
EOF
}

if [ "$1" = "-h" ]; then
	help
	exit 0
fi

find . -mindepth 2 -type f | while IFS= read -r file; do
  dest="./$(basename "$file")"
  if [ ! -e "$dest" ]; then
    mv "$file" "$dest"
  fi
done

find . -type f -name '.DS_Store' -delete
find . -depth -type d -empty ! -path . -delete
