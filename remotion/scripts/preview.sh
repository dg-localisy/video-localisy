#!/usr/bin/env bash
# Low-resolution preview: rendered at the native 30 fps (never with --every-nth-frame, which
# breaks the audio timing), then down-converted to 540x960 / 15 fps with ffmpeg, audio untouched.
set -euo pipefail
cd "$(dirname "$0")/.."
./node_modules/.bin/remotion render src/index.ts Clip9x16 out/preview_540x960_30fps.mp4 --scale=0.5 --crf=22 --log=error
ffmpeg -v error -y -i out/preview_540x960_30fps.mp4 -r 15 -c:v libx264 -crf 23 -preset fast -pix_fmt yuv420p -c:a copy -movflags +faststart out/preview_540x960_15fps.mp4
mkdir -p ../preview && cp out/preview_540x960_15fps.mp4 ../preview/preview_540x960_15fps.mp4
echo "preview: ../preview/preview_540x960_15fps.mp4"
