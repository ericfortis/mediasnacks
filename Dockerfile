FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

ENV FORCE_COLOR=1

WORKDIR /workspace

COPY src/ src/
COPY tests/ tests/
COPY package.json .

CMD ["node", "--test"]
