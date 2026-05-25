#!/bin/sh

help() {
  /bin/cat << EOF
SYNOPSIS
  mediasnacks png <img1> [img2 ...]

DESCRIPTION
  Losslessly optimizes PNG images with oxipng at max level.

EXAMPLE
	mediasnacks png *.png
EOF
  exit "${1:-0}"
}

[ "$1" = "-h" ] && help
[ $# -eq 0 ] && help 1

oxipng --opt max "$@"
