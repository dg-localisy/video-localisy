#!/usr/bin/env bash
# Final delivery render: Remotion (H.264 CRF 18, AAC 320 kb/s) → remux with faststart → ffprobe check.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${1:-video-localisy}"
cd "$ROOT/remotion"
./node_modules/.bin/remotion render src/index.ts Clip9x16 out/clip_remotion.mp4 --codec=h264 --crf=18 --audio-bitrate=320k --x264-preset=slow --pixel-format=yuv420p
cd "$ROOT"
ffmpeg -v error -y -i remotion/out/clip_remotion.mp4 -c:v copy -c:a copy -movflags +faststart "${NAME}_final_9x16.mp4"
echo "== vérification"
ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,bit_rate,sample_rate -show_entries format=duration,size -of default=noprint_wrappers=1 "${NAME}_final_9x16.mp4"
ffmpeg -v info -nostats -i "${NAME}_final_9x16.mp4" -af "ebur128=peak=true" -f null - 2>&1 | grep -A9 Summary | grep -E "I:|LRA:|Peak:"
