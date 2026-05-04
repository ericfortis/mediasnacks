#!/bin/sh

# Plays a video with a filter for diffing adjacent frames.
# I use this for finding repeated frames. For example, you’ll see 
# a black frame if two consecutive frames are almost similar.

ffplay -v error "$1" -vf "
    tblend=all_mode=difference,
    format=gray
"
