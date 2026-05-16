#!/bin/sh
set -eu

# Exit on systems without ZSH
zsh=$(command -v zsh) || exit 0

src="$(cd "$(dirname "$0")" && pwd)/.zsh/completions/_mediasnacks"
[ -f "$src" ] || exit 0

exec "$zsh" -s "$src" << 'ZSH_EOF'
src="$1"
for dir in "${fpath[@]}"; do
  if [ -w "$dir" ]; then
    dst="$dir/_mediasnacks"
    ln -sf "$src" "$dst"
    echo "linked zsh completions: $dst -> $src"
    exit 0
  fi
done
echo "zsh completions: no writable fpath directory found, skipping." >&2
exit 0
ZSH_EOF

