#!/bin/bash

set -e

docker build -t mediasnacks-test .

cat << EOF
To generate fixtures:
	node --test
	cp /tmp/avif-*/lenna.avif /workspace/src/fixtures/
	cp /tmp/edgespic-*/edgespic/*.png /workspace/src/fixtures/edgespic/
EOF

docker run --rm -it \
  -v "$(pwd)/src/fixtures:/workspace/src/fixtures" \
  mediasnacks-test \
  /bin/bash
