FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y zsh ffmpeg 

WORKDIR /workspace

COPY src/ src/
COPY tests/ tests/

CMD ["node", "--test"]
