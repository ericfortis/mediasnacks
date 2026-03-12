#!/bin/bash
set -e

echo "========================================="
echo "Generating Linux-based video fixtures"
echo "========================================="
echo ""

# Build Docker image
echo "1. Building Docker image..."
docker build -f Dockerfile.fixtures -t mediasnacks-fixtures .
echo ""

# Create temp directory for output
TEMP_DIR=$(mktemp -d)
echo "2. Using temp directory: $TEMP_DIR"
echo ""

# Copy source video to temp dir
cp tests/fixtures/60fps.mp4 "$TEMP_DIR/"

# Run fixture generation in Docker
echo "3. Generating fixtures in Docker container..."
docker run --rm \
  -v "$TEMP_DIR:/output" \
  mediasnacks-fixtures \
  /bin/zsh -c "
    cd /output

    echo 'Generating vsplit fixtures...'
    /workspace/src/cli.js vsplit 5 10 15 20 25 60fps.mp4

    echo ''
    echo 'Generated files:'
    ls -lh 60fps_*.mp4

    echo ''
    echo 'SHA1 hashes (Linux):'
    sha1sum 60fps_*.mp4
  "

echo ""
echo "4. Copying fixtures to tests/fixtures/..."
cp "$TEMP_DIR"/60fps_*.mp4 tests/fixtures/

echo ""
echo "5. Cleanup temp directory..."
rm -rf "$TEMP_DIR"

echo ""
echo "========================================="
echo "✓ Fixtures generated successfully!"
echo "========================================="
echo ""
echo "New fixture hashes (Linux):"
sha1sum tests/fixtures/60fps_*.mp4

echo ""
echo "Next steps:"
echo "  1. Update your test files to use these new SHA1 hashes"
echo "  2. Commit the updated fixtures"
echo "  3. Push to GitHub - CI should pass now"
