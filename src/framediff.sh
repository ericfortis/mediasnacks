#!/bin/sh


help() {
  /bin/cat << EOF
SYNOPSIS
  mediasnacks framediff <video>

DESCRIPTION
  Runs FFplay with a video filter for diffing adjacent frames. Useful for
  finding duplicate frames, which will show up as a black frame.

TIPS
  Hit [s] to step frame-by-frame.

SEE ALSO
  mediasnacks detectdups, ffplay(1)
EOF
}

if [ "$1" = "-h" ]; then
  help
  exit 0
fi

if [ ! -f "$1" ]; then
  help
  exit 1
fi

ffplay -v error "$1" -vf "
    tblend=all_mode=difference,
    format=gray
"

# Not rendering the frame number:
#	  'drawtext=text=%{n}:x=20:y=20:fontcolor=white:fontsize=48'
#	…because in homebrew ffmpeg 8 is not compiled with the req libs:
#	https://ayosec.github.io/ffmpeg-filters-docs/8.0/Filters/Video/drawtext.html
