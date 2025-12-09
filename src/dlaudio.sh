#!/bin/sh

yt-dlp -o '%(title)s.%(ext)s' \
  -f 'bestaudio[ext=m4a]/bestaudio' "$1"
