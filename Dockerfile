FROM mwader/static-ffmpeg:8.1.1 AS ffmpeg
FROM ghcr.io/shssoichiro/oxipng:latest AS oxipng
FROM node:24-bookworm-slim


COPY --from=ffmpeg /ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /ffprobe /usr/local/bin/ffprobe
COPY --from=oxipng /usr/local/bin/oxipng /usr/local/bin/oxipng

ENV FORCE_COLOR=1
WORKDIR /workspace

COPY src/ src/
COPY package.json .

CMD ["node", "--test"]
