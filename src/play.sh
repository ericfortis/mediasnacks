#!/bin/sh

# mpv with a filtered playlist with recursive search
# usage: cd Music && play artistA artistB

regex=$(IFS='|'; echo "$*")
/usr/bin/find -E . -type f -iregex ".*(${regex}).*" \
	-not -path "*.fcpbundle/*" \
	-not -name ".DS_Store" \
	-print | mpv --playlist=-
