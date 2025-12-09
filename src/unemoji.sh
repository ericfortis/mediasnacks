#!/bin/sh

# Removes emoji's from filenames

find . -depth | while IFS= read -r file; do
  dir=$(dirname "$file")
  base=$(basename "$file")

  # Remove emojis using Perl's Unicode-aware regex
  newbase=$(printf '%s' "$base" | perl -CSD -pe '
    s/[\x{1F600}-\x{1F64F}]//g;  # Emoticons
    s/[\x{1F300}-\x{1F5FF}]//g;  # Misc Symbols and Pictographs
    s/[\x{1F680}-\x{1F6FF}]//g;  # Transport and Map
    s/[\x{2600}-\x{26FF}]//g;    # Misc symbols
    s/[\x{2700}-\x{27BF}]//g;    # Dingbats
    s/[\x{1F900}-\x{1F9FF}]//g;  # Supplemental Symbols and Pictographs
    s/[\x{1FA70}-\x{1FAFF}]//g;  # Symbols and Pictographs Extended-A
    s/[\x{1F1E6}-\x{1F1FF}]//g;  # Regional Indicator Symbols
  ')

  if [ "$base" != "$newbase" ]; then
    newpath="$dir/$newbase"
    echo "Renaming: $file -> $newpath"
    mv -n "$file" "$newpath"
  fi
done
