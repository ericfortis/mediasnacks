# Running Tests in Docker

Run tests in a Docker container that exactly matches the CI environment (ubuntu-latest with Node 24, zsh, and ffmpeg).

## Quick Start

```bash
# Build the image
docker build -t mediasnacks-test .

# Run tests
docker run --rm mediasnacks-test
```

## Generate Fixtures

Since the tests generate files in `/tmp`, you need to run the commands manually inside the container to capture the outputs:

```bash
# Run interactive container
docker run --rm -it \
  -v "$(pwd)/tests/fixtures:/workspace/tests/fixtures" \
  mediasnacks-test /bin/bash

# Inside container:

# Generate vsplit fixtures
cd /tmp
cp /workspace/tests/fixtures/60fps.mp4 .
/workspace/src/cli.js vsplit 5 10 15 20 25 60fps.mp4
ls -lh 60fps_*.mp4
sha1sum 60fps_*.mp4

# Copy to fixtures
cp 60fps_*.mp4 /workspace/tests/fixtures/

# Generate AVIF fixture
cp /workspace/tests/fixtures/lenna.png .
/workspace/src/cli.js avif lenna.png
sha1sum lenna.avif

# Copy to fixtures
cp lenna.avif /workspace/tests/fixtures/

# Exit
exit
```

## Verify

After generating fixtures in Docker, verify the tests pass:

```bash
docker run --rm mediasnacks-test npm run test
```

Then commit the fixtures - they should now match what CI produces.

## Why This Works

- **Same OS**: ubuntu-latest (Ubuntu 24.04)
- **Same Node**: v24
- **Same FFmpeg**: From Ubuntu repos
- **Same zsh**: For shell scripts

The Docker container produces identical output to GitHub Actions CI.
