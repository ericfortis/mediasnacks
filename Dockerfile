FROM mwader/static-ffmpeg:8.0.1 AS ffmpeg
FROM node:24-bookworm-slim

COPY --from=ffmpeg /ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /ffprobe /usr/local/bin/ffprobe

ENV FORCE_COLOR=1
WORKDIR /workspace

COPY src/ src/
COPY tests/ tests/
COPY package.json .

CMD ["node", "--test"]
