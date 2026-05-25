#!/bin/sh

help() {
  /bin/cat << EOF
SYNOPSIS
  mediasnacks png <img1> [img2 ...]

DESCRIPTION
  Optimizes PNG images with oxipng at max compression.
EOF
}

if [ "$1" = "-h" ]; then
  help
  exit 0
fi

[ $# -eq 0 ] && help && exit 1

oxipng --opt max "$@"
