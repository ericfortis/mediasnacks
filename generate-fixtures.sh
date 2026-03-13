#!/bin/sh

docker run --rm \
  -v "$(pwd)/src/fixtures:/workspace/src/fixtures" \
  $(docker build -q .) \
  /bin/bash -c "
node --test 
cp /tmp/avif*/lenna.avif /workspace/src/fixtures/ 
cp /tmp/edgespic*/edgespic/*.png /workspace/src/fixtures/edgespic/
"

