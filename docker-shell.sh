#!/bin/bash
# Opens a shell in the Docker test environment with fixtures mounted

set -e

echo "Building Docker test image..."
docker build -t mediasnacks-test .

echo ""
echo "Opening shell in Docker container..."
echo "Fixtures directory is mounted at /workspace/tests/fixtures"
echo ""
echo "To generate fixtures:"
echo "  cd /tmp"
echo "  cp /workspace/tests/fixtures/lenna.png ."
echo "  /workspace/src/cli.js avif lenna.png"
echo "  sha1sum lenna.avif"
echo "  cp lenna.avif /workspace/tests/fixtures/"
echo ""

docker run --rm -it \
  -v "$(pwd)/tests/fixtures:/workspace/tests/fixtures" \
  mediasnacks-test \
  /bin/bash
