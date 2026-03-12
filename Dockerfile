FROM node:24-bookworm-slim

# Install zsh and ffmpeg
RUN apt-get update && \
    apt-get install -y \
    zsh \
    ffmpeg \
    && ffmpeg -version | head -5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY . .
