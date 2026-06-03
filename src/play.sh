#!/bin/sh

# mpv with a filtered playlist with recursive search
# usage: cd Music && play artistA artistB

regex=$(printf '%s|' "$@")
regex=${regex%|}
/usr/bin/find -E . -type f -iregex ".*(${regex}).*" \
	-not -path "*.fcpbundle/*" \
	-not -path "*.DS_Store*" \
	-print | mpv --playlist=-
