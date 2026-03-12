# Use official Node.js 24 image (Debian Bookworm)
FROM node:24-bookworm-slim

# Install zsh and ffmpeg
RUN apt-get update && \
    apt-get install -y \
    zsh \
    ffmpeg \
    && echo "=== FFmpeg version installed ===" \
    && ffmpeg -version | head -5 \
    && echo "=== Node version ===" \
    && node --version \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY . .

CMD ["node", "--test"]
