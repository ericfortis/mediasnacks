#!/bin/sh


if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
/bin/cat << EOF
SYNOPSIS
  mediasnacks framediff <video>

DESCRIPTION
  Runs FFplay with a video filter for diffing adjacent frames. Useful for
  finding duplicate frames, which will show up a a black frame.

TIPS
  Hit [s] to step frame-by-frame.

SEE ALSO
  mediasnacks detectdups, ffplay(1)
EOF
  exit 0
fi

ffplay -v error "$1" -vf "
    tblend=all_mode=difference,
    format=gray
"
