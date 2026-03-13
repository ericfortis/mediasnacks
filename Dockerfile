FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y \
    zsh ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY src/ src/
COPY tests/ tests/
COPY package.json .

CMD ["node", "--test"]
