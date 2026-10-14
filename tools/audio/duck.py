#!/usr/bin/env python3
"""Voice-driven ducking of the music bed.

The music is first normalised to the same integrated loudness as the voice
(-16 LUFS), then attenuated by DUCK_DB whenever the voice is active (attack
ATTACK s, release RELEASE s) and by REST_DB when it is not. The result is a
music track that sits 12-18 dB under the voice while someone speaks and comes
back smoothly in the gaps / the ending tail.
"""
import sys, numpy as np, soundfile as sf, subprocess, json
music_in, voice_in, out = sys.argv[1:4]
DUCK_DB, REST_DB, ATTACK, RELEASE = -15.0, -7.0, 0.015, 0.30
SR = 48000
def loudness(path):
    r = subprocess.run(["ffmpeg", "-v", "info", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    i = [l for l in r.splitlines() if l.strip().startswith("I:")][-1]
    return float(i.split()[1])
m, sr = sf.read(music_in, dtype="float32", always_2d=True); assert sr == SR
v, sr2 = sf.read(voice_in, dtype="float32", always_2d=True); assert sr2 == SR
Lm, Lv = loudness(music_in), loudness(voice_in)
m *= 10 ** ((Lv - Lm) / 20)                       # music bed at the voice loudness (pre-duck)
# voice activity envelope: RMS over 20 ms, hold, smooth attack/release
vm = v.mean(axis=1)
win = int(0.02 * SR)
rms = np.sqrt(np.convolve(vm ** 2, np.ones(win) / win, mode="same"))
active = (20 * np.log10(rms + 1e-9) > -45).astype(np.float32)   # -45 dBFS gate on the normalised voice
# hold voice activity 150 ms so short pauses between words don't pump
hold = int(0.15 * SR)
active = np.maximum(active, np.convolve(active, np.ones(hold), mode="full")[:len(active)] > 0)
target = np.where(active > 0, DUCK_DB, REST_DB).astype(np.float32)
g = np.empty_like(target); cur = REST_DB
a_coef = np.exp(-1 / (ATTACK * SR)); r_coef = np.exp(-1 / (RELEASE * SR))
for i in range(len(target)):
    c = a_coef if target[i] < cur else r_coef
    cur = c * cur + (1 - c) * target[i]; g[i] = cur
n = min(len(m), len(g)); gain = np.ones(len(m), dtype=np.float32) * 10 ** (REST_DB / 20)
gain[:n] = 10 ** (g[:n] / 20)
out_sig = m * gain[:, None]
sf.write(out, np.clip(out_sig, -1, 1), SR, subtype="PCM_16")
print(json.dumps({"music_lufs_in": Lm, "voice_lufs": Lv, "duck_db": DUCK_DB, "rest_db": REST_DB, "active_ratio": float(active.mean())}))
