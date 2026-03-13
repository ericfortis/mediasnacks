#!/bin/bash

set -e

docker build -t mediasnacks-test .

cat << EOF
To generate fixtures:
	node --test
	cp /tmp/avif-test*/lenna.avif tests/fixtures/
EOF

docker run --rm -it \
  -v "$(pwd)/tests/fixtures:/workspace/tests/fixtures" \
  mediasnacks-test \
  /bin/bash
