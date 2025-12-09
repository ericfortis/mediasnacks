#!/bin/sh

yt-dlp -o '%(title)s.%(ext)s' \
  -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' "$1"
