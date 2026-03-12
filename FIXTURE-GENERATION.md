# Generating Linux-based Fixtures

## The Problem

Your tests compare SHA1 hashes of generated files, which differ between macOS and Linux:

**Video fixtures (vsplit, vtrim):**
- Even with `ffmpeg -c copy` (stream copy), macOS and Linux produce different binary output
- Reasons: FFmpeg versions, timestamp precision, container metadata, muxing variations

**AVIF fixtures:**
- Uses `ffmpeg` with `libsvtav1` encoder
- Different FFmpeg/libsvtav1 versions on each platform
- Encoder behavior varies across platforms
- Non-deterministic encoding

## The Solution

Generate fixtures in a Docker container that exactly matches your GitHub Actions CI environment:
- Ubuntu 24.04
- Node.js 24
- zsh (for shell scripts)
- ffmpeg (from Ubuntu repos)

## Quick Start

```bash
# Make script executable
chmod +x generate-fixtures.sh

# Generate all fixtures
./generate-fixtures.sh
```

This will:
1. Build a Docker image matching your CI
2. Generate video and AVIF fixtures inside the container
3. Copy them to `tests/fixtures/`
4. Show the new SHA1 hashes

## What Gets Generated

The script generates:
- **Video fixtures**: `60fps_1.mp4` through `60fps_6.mp4` (from vsplit)
- **AVIF fixture**: `lenna.avif` (PNG to AVIF conversion)

## Manual Method

If you prefer more control:

```bash
# Build the image
docker build -f Dockerfile.fixtures -t mediasnacks-fixtures .

# Run interactively with fixtures directory mounted
docker run --rm -it \
  -v "$(pwd)/tests/fixtures:/workspace/tests/fixtures" \
  mediasnacks-fixtures

# Inside container:
cd /tmp
cp /workspace/tests/fixtures/60fps.mp4 .
cp /workspace/tests/fixtures/lenna.png .

# Generate vsplit fixtures
/workspace/src/cli.js vsplit 5 10 15 20 25 60fps.mp4

# Generate AVIF fixture
/workspace/src/cli.js avif lenna.png

# Check output
ls -lh
sha1sum 60fps_*.mp4 lenna.avif

# Copy to fixtures directory
cp 60fps_*.mp4 lenna.avif /workspace/tests/fixtures/

# Exit
exit
```

## After Generating Fixtures

1. **Update test files** with the new SHA1 hashes (if needed)
2. **Commit the changes**:
   ```bash
   git add tests/fixtures/*.mp4 tests/fixtures/lenna.avif
   git commit -m "Regenerate fixtures in Linux environment for CI compatibility"
   ```
3. **Push and verify** CI passes

## Testing Locally

Note that running `npm run test` on macOS will likely still fail because your local FFmpeg will generate different hashes than the Linux fixtures. This is expected and fine - the important thing is that CI passes.

To test that fixtures are correct, you can run the tests inside the Docker container:

```bash
docker run --rm -it mediasnacks-fixtures npm run test
```

## Why AVIF is Different

The AVIF fixture uses the SVT-AV1 encoder (`libsvtav1`), which:
- Is a lossy encoder (unlike the video tests which use stream copy)
- Produces platform-specific output even with the same settings
- May have different optimizations on different CPUs/platforms
- Uses different versions of the encoder library across platforms

This makes it critical to generate the AVIF fixture in the exact same environment as CI.

## Troubleshooting

**"spawn vsplit.sh ENOENT" error:**
- The shell scripts need to be executable
- Run: `chmod +x src/*.sh`

**"ffmpeg not found" error:**
- Make sure the Docker image built correctly
- The Dockerfile installs ffmpeg from Ubuntu repos

**Different hashes between runs:**
- Make sure you're using the same Docker image
- FFmpeg with `-c copy` should be deterministic
- AVIF encoding should be consistent within the same environment

**CI still failing:**
- Verify you updated the expected hashes in test files (if they're hardcoded)
- Check that fixtures were committed and pushed
- Ensure CI is using same Ubuntu/Node versions as Dockerfile
