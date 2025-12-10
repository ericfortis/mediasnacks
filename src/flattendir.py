#!/usr/bin/env python3

import shutil
from pathlib import Path


def flatten_dir(folder=Path().cwd()):
  """Moves all files to top dir and deletes dirs"""

  for path in folder.rglob('*'):
    if path.is_file():
      dest = folder / path.name
      if dest.exists():
        dest = folder / f'{path.stem}__{path.stat().st_mtime_ns}{path.suffix}'
      shutil.move(str(path), str(dest))

  for sub in sorted(folder.rglob('*'), reverse=True):
    if sub.is_dir() and not any(sub.iterdir()):
      sub.rmdir()


if __name__ == '__main__':
  flatten_dir()
