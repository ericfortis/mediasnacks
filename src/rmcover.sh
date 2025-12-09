#!/bin/sh

file="$1"

tmp="_no_cover_$file"
ffmpeg -v error -i "$file" -vn -c:a copy "$tmp"
mv "$file" "$file.bak"
mv "$tmp" "$file"
