# Match GitHub Actions CI environment exactly
FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y \
    zsh \
    ffmpeg \
    curl \
    && echo "=== FFmpeg version installed ===" \
    && ffmpeg -version | head -5 \
    && echo "=== FFmpeg package version ===" \
    && dpkg -l | grep ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY . .

RUN chmod +x src/*.sh

CMD ["npm", "run", "test"]
