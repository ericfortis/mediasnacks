FROM mwader/static-ffmpeg:8.0.1 as ffmpeg
FROM node:24-bookworm-slim

ENV FORCE_COLOR=1
WORKDIR /workspace

COPY --from=ffmpeg /ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /ffprobe /usr/local/bin/ffprobe

COPY src/ src/
COPY tests/ tests/
COPY package.json .

CMD ["node", "--test"]
