#!/usr/bin/env bash
# Regenerates every intermediate media file from input/rush_01.mp4:
#   work/proxies/footage_graded_1080.mp4   graded 1080x1920 upscale (look + grain + vignette)
#   remotion/public/footage.mp4            same + 1.2 s freeze of the last frame
#   work/audio/voice_norm.wav              cleaned voice at -16 LUFS
#   work/audio/music_raw.wav               composed music bed (needs fluidsynth + FluidR3_GM.sf2)
#   remotion/public/audio/*.wav            voice + ducked music used by Remotion
#   remotion/public/sfx/*.wav              sound design kit
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PY="${PY:-$ROOT/.venv/bin/python}"
mkdir -p work/proxies work/audio remotion/public/audio remotion/public/sfx

GRADE="scale=1080:1920:flags=lanczos,unsharp=5:5:0.45:5:5:0.0,colorbalance=rm=-0.02:gm=0.03:bm=-0.01:rh=-0.03:gh=0.02:bh=0.02,eq=saturation=0.90:contrast=1.06:brightness=-0.015,curves=master='0/0 0.25/0.23 0.5/0.5 0.78/0.80 1/1',vignette=angle=PI/7:mode=forward,noise=alls=7:allf=t+u,format=yuv420p"

echo "== 1/6 image : étalonnage + upscale 1080x1920"
ffmpeg -v error -y -i input/rush_01.mp4 -an -vf "$GRADE" -r 30 -c:v libx264 -preset slow -crf 14 -profile:v high -g 15 -pix_fmt yuv420p -movflags +faststart work/proxies/footage_graded_1080.mp4
echo "== 2/6 image : gel de la dernière image (1,2 s) pour la fin"
ffmpeg -v error -y -i work/proxies/footage_graded_1080.mp4 -vf "tpad=stop_mode=clone:stop_duration=1.2" -r 30 -c:v libx264 -preset medium -crf 16 -profile:v high -g 15 -pix_fmt yuv420p -movflags +faststart remotion/public/footage.mp4

echo "== 3/6 voix : extraction, nettoyage, normalisation -16 LUFS (2 passes)"
ffmpeg -v error -y -i input/rush_01.mp4 -vn -ac 2 -ar 48000 -c:a pcm_s16le work/audio_48k.wav
ffmpeg -v error -y -i work/audio_48k.wav -af "highpass=f=70,afftdn=nr=7:nf=-45:tn=1,deesser=i=0.25:m=0.5:f=0.5:s=o" work/audio/voice_clean.wav
ffmpeg -v info -nostats -i work/audio/voice_clean.wav -af "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p' > work/audio/loudnorm_pass1.json
M=$(python3 -c "import json;d=json.load(open('work/audio/loudnorm_pass1.json'));print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -v error -y -i work/audio/voice_clean.wav -af "loudnorm=I=-16:TP=-1.5:LRA=9:$M:linear=true" -ar 48000 work/audio/voice_norm.wav
ffmpeg -v error -y -i work/audio/voice_norm.wav -c:a pcm_s16le -ac 2 remotion/public/audio/voice_norm.wav

echo "== 4/6 musique : composition + rendu"
"$PY" tools/audio/make_music.py "$ROOT/work/audio"

echo "== 5/6 musique : ducking sous la voix"
MUSIC="${MUSIC:-$ROOT/work/audio/music_raw.wav}"   # MUSIC=input/music/xxx.wav pour un morceau externe
"$PY" tools/audio/duck.py "$MUSIC" work/audio/voice_norm.wav remotion/public/audio/music_ducked.wav

echo "== 6/6 bruitages"
"$PY" tools/audio/make_sfx.py "$ROOT/remotion/public/sfx"
echo "OK — médias prêts. Rendu : cd remotion && npm run preview / npm run render"
