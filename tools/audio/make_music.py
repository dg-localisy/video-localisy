#!/usr/bin/env python3
"""Compose and render the royalty-free music bed for the clip.

Everything here is generated from scratch (MIDI composed in code, rendered with
FluidSynth + FluidR3_GM soundfont, drums/bass/FX synthesised with numpy), so the
result is free of any third-party rights. Tempo and section hits are aligned
to the speech structure of the rush (see analysis.md).
"""
import json, os, subprocess, sys
import numpy as np
import mido
from scipy.signal import butter, lfilter, sosfilt

OUT = sys.argv[1] if len(sys.argv) > 1 else "/home/user/video-localisy/work/audio"
FX = "--with-fx" in sys.argv   # risers/impacts are normally played as SFX by Remotion, not baked in the bed
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
SR = 48000
BPM = 122.0
OFFSET = 0.02            # music grid offset (s) so beats land on speech breaths
BEAT = 60.0 / BPM        # 0.4918 s
BAR = 4 * BEAT           # 1.967 s
TOTAL = 41.2             # seconds of music to render (video ends at 41.0)
N = int(TOTAL * SR)

def t_of(beat):          # absolute time of a beat index
    return OFFSET + beat * BEAT

# ---------------------------------------------------------------- structure
# Section anchors (seconds, from the transcript) -> nearest beat index
anchors = {
    "hook": 0.0, "symptomes": 4.92, "y2015": 8.38, "recherches": 13.34,
    "boites": 17.66, "pct90_hit": 20.40, "question": 21.14, "reponse": 24.70,
    "aucune_idee": 25.52, "liste": 26.18, "payoff": 31.48, "petit_budget": 35.48,
    "fin_voix": 39.54,
}
def nearest_beat(sec): return int(round((sec - OFFSET) / BEAT))
B = {k: nearest_beat(v) for k, v in anchors.items()}
# Chord cycle: Dm | Dm | Bb | Bb | F | F | C | C  (2 bars each, 8-bar cycle)
# MIDI notes: D3=50, Bb2=46, F3=53, C3=48
cycle = [("Dm", [50, 53, 57, 62]), ("Bb", [46, 50, 53, 58]), ("F", [53, 57, 60, 65]), ("C", [48, 52, 55, 60])]
roots_sub = {"Dm": 38, "Bb": 34, "F": 41, "C": 36}   # D2, Bb1, F2, C2 for the sub (D2=73Hz)
def chord_at_bar(bar):
    return cycle[(bar // 2) % 4]
n_bars = int(np.ceil(TOTAL / BAR)) + 1

# ---------------------------------------------------------------- MIDI part (pad, keys, kalimba motif, strings)
mid = mido.MidiFile(ticks_per_beat=480)
TPB = 480
def sec_to_tick(sec): return int(round((sec - OFFSET) / BEAT * TPB))

tracks = {}
def add_note(name, ch, prog, note, start_s, dur_s, vel):
    tr = tracks.setdefault(name, {"ch": ch, "prog": prog, "events": []})
    tr["events"].append((sec_to_tick(start_s), "on", note, vel))
    tr["events"].append((sec_to_tick(start_s + dur_s), "off", note, 0))

PAD, KEYS, KAL, STR = (0, 89, "pad"), (1, 4, "keys"), (2, 108, "kalimba"), (3, 48, "strings")
payoff_bar = int(round(anchors["payoff"] / BAR))   # 16
for bar in range(n_bars):
    name, notes = chord_at_bar(bar)
    s = OFFSET + bar * BAR
    if s > TOTAL: break
    # Warm pad: one sustained chord per 2-bar block, swelling after the payoff
    if bar % 2 == 0:
        vel = 48 if bar < payoff_bar else 62
        for n in notes[:3]:
            add_note("pad", 0, 89, n + 12, s, 2 * BAR - 0.05, vel)
    # Electric piano: soft stab on beat 1, echo on the "and" of 2 (sparser before the question)
    vel = 46 if s < anchors["question"] else 56
    add_note("keys", 1, 4, notes[0] + 12, s, 0.9 * BEAT, vel)
    add_note("keys", 1, 4, notes[1] + 12, s, 0.9 * BEAT, vel - 6)
    add_note("keys", 1, 4, notes[2] + 12, s, 0.9 * BEAT, vel - 6)
    if s >= anchors["question"]:
        add_note("keys", 1, 4, notes[2] + 24, s + 1.5 * BEAT, 0.5 * BEAT, vel - 14)
    # Kalimba motif: 8th-note arpeggio, only from the "liste" section and in the payoff
    if s >= anchors["liste"] - 0.1:
        motif = [notes[0] + 24, notes[2] + 24, notes[1] + 24, notes[3] + 24, notes[2] + 24, notes[0] + 36, notes[1] + 24, notes[2] + 24]
        for i, n in enumerate(motif):
            add_note("kalimba", 2, 108, n, s + i * BEAT / 2, BEAT / 2 * 0.9, 40 + (8 if i % 2 == 0 else 0))
    # Strings: high sustained 5th from the payoff
    if bar >= payoff_bar:
        add_note("strings", 3, 48, notes[0] + 36, s, 2 * BAR - 0.05, 40)
        add_note("strings", 3, 48, notes[2] + 36, s, 2 * BAR - 0.05, 34)

for name, tr in tracks.items():
    track = mido.MidiTrack(); mid.tracks.append(track)
    track.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM), time=0))
    track.append(mido.Message("program_change", channel=tr["ch"], program=tr["prog"], time=0))
    evs = sorted(tr["events"], key=lambda e: (e[0], 0 if e[1] == "off" else 1))
    last = 0
    for tick, kind, note, vel in evs:
        msg = mido.Message("note_on" if kind == "on" else "note_off", channel=tr["ch"], note=note, velocity=vel, time=max(0, tick - last))
        track.append(msg); last = tick
mid_path = os.path.join(OUT, "music_cue.mid"); mid.save(mid_path)

# Render each MIDI instrument separately so we can EQ them individually
def render_midi(mid_path, wav_path):
    subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.8", "-r", str(SR), "-F", wav_path, SF2, mid_path], check=True)
    y = read_wav(wav_path)
    return y
def read_wav(p):
    import soundfile as sf
    y, sr = sf.read(p, dtype="float32", always_2d=True)
    assert sr == SR
    return y
def write_wav(p, y):
    import soundfile as sf
    sf.write(p, np.clip(y, -1, 1).astype(np.float32), SR, subtype="PCM_24")

def fit(y):
    out = np.zeros((N, 2), dtype=np.float32)
    m = min(N, len(y)); out[:m] = y[:m]
    return out

# Render the whole MIDI (all instruments), then also per-instrument by soloing tracks
full_wav = os.path.join(OUT, "music_midi_full.wav")
stems = {}
for name in tracks:
    solo = mido.MidiFile(ticks_per_beat=TPB)
    for tr in mid.tracks:
        has_prog = [m for m in tr if m.type == "program_change"]
        if has_prog and has_prog[0].channel == tracks[name]["ch"]:
            solo.tracks.append(tr)
    p = os.path.join(OUT, f"stem_{name}.mid"); solo.save(p)
    w = os.path.join(OUT, f"stem_{name}.wav")
    stems[name] = fit(render_midi(p, w))

# ---------------------------------------------------------------- synthesised drums / bass / fx
t = np.arange(N) / SR
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def place(buf, start_s, sig, gain=1.0):
    i = int(start_s * SR)
    if i < 0 or i >= N: return
    m = min(len(sig), N - i)
    buf[i:i + m] += sig[:m] * gain
def bandpass(sig, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos"); return sosfilt(sos, sig)
def lowpass(sig, fc, order=2):
    sos = butter(order, fc, btype="low", fs=SR, output="sos"); return sosfilt(sos, sig)
def highpass(sig, fc, order=2):
    sos = butter(order, fc, btype="high", fs=SR, output="sos"); return sosfilt(sos, sig)
rng = np.random.default_rng(7)

def kick(vel=1.0):
    n = int(0.42 * SR); tt = np.arange(n) / SR
    f = 42 + 110 * np.exp(-tt / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt / 0.16)
    click = highpass(rng.standard_normal(n) * np.exp(-tt / 0.004), 2000)
    k = body * 0.95 + click * 0.12
    return lowpass(k, 9000) * vel
def hat(open_=False, vel=1.0):
    n = int((0.26 if open_ else 0.05) * SR); tt = np.arange(n) / SR
    h = highpass(rng.standard_normal(n), 7500, 4) * np.exp(-tt / (0.09 if open_ else 0.013))
    return h * 0.35 * vel
def clap(vel=1.0):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    c = np.zeros(n)
    for d in (0, 0.011, 0.021, 0.03):
        i = int(d * SR); c[i:] += rng.standard_normal(n - i) * np.exp(-(tt[: n - i]) / 0.016)
    c += rng.standard_normal(n) * np.exp(-tt / 0.09) * 0.6
    return bandpass(c, 900, 5000) * 0.45 * vel
def sub_note(midi, dur, pumps):
    f = 440 * 2 ** ((midi - 69) / 12)
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)
    e = np.ones(n); a = int(0.012 * SR); e[:a] = np.linspace(0, 1, a); r = int(0.05 * SR); e[-r:] *= np.linspace(1, 0, r)
    return s * e * 0.55
def riser(dur=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # band-pass sweep in chunks
    step = int(0.02 * SR)
    for i in range(0, n, step):
        fr = tt[i] / dur
        lo = 300 + 2500 * fr ** 1.5; hi = lo * 2.2
        out[i:i + step] = bandpass(noise[i:i + step], lo, min(hi, 20000))[: len(out[i:i + step])]
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * tt / dur)) / SR) * 0.25
    amp = (tt / dur) ** 2.2
    return (out * 0.8 + tone) * amp * 0.5
def impact():
    n = int(0.9 * SR); tt = np.arange(n) / SR
    f = 38 + 90 * np.exp(-tt / 0.07)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.35)
    burst = lowpass(rng.standard_normal(n), 3500) * np.exp(-tt / 0.06)
    tail = lowpass(rng.standard_normal(n), 900) * np.exp(-tt / 0.3) * 0.3
    return (body * 0.9 + burst * 0.5 + tail) * 0.7

drums = np.zeros(N); sub = np.zeros(N); fx = np.zeros(N)
end_beat = nearest_beat(anchors["fin_voix"]) + 1     # drums stop right after the voice ends
drop_zones = [(anchors["pct90_hit"] - 0.02, anchors["question"] - 0.02), (anchors["reponse"] - 0.02, anchors["aucune_idee"] + 0.3)]
def in_drop(sec): return any(a <= sec < b for a, b in drop_zones)
kick_times = []
for b in range(0, end_beat + 1):
    s = t_of(b)
    if s >= TOTAL: break
    sec_in_bar = b % 4
    energy = 0 if s < anchors["symptomes"] else (1 if s < anchors["question"] else (2 if s < anchors["payoff"] else 3))
    if in_drop(s):
        continue
    # kick: half-time (beats 1 and 3), plus a pickup 8th before beat 1 in the payoff
    if sec_in_bar in (0, 2):
        place(drums, s, kick(0.85 if energy < 2 else 1.0)); kick_times.append(s)
    if energy >= 3 and sec_in_bar == 3:
        place(drums, s + BEAT / 2, kick(0.7)); kick_times.append(s + BEAT / 2)
    # clap on beat 3 from energy 1
    if energy >= 1 and sec_in_bar == 2:
        place(drums, s, clap(0.8 if energy < 3 else 1.0))
    # hats: 8ths (energy>=1), 16ths accents (energy>=2)
    if energy >= 1:
        place(drums, s, hat(vel=0.9))
        place(drums, s + BEAT / 2, hat(vel=0.6))
        if energy >= 2:
            place(drums, s + BEAT / 4, hat(vel=0.3)); place(drums, s + 3 * BEAT / 4, hat(vel=0.35))
        if energy >= 2 and sec_in_bar == 3:
            place(drums, s + BEAT / 2, hat(open_=True, vel=0.5))
    elif energy == 0:
        place(drums, s, hat(vel=0.5))
# sub bass: one note per bar on the chord root, with a fake side-chain pump on each kick
for bar in range(n_bars):
    s = OFFSET + bar * BAR
    if s >= TOTAL or s >= t_of(end_beat): break
    name, _ = chord_at_bar(bar)
    if in_drop(s): continue
    place(sub, s, sub_note(roots_sub[name], BAR - 0.02, None))
pump = np.ones(N)
for ks in kick_times:
    i = int(ks * SR); n = int(0.22 * SR)
    pump[i:i + n] *= np.minimum(1, 0.35 + (np.arange(min(n, N - i)) / n) ** 0.8)
sub *= pump
# FX: risers before the "2015" hit, the "90 %" hit and the payoff; impacts on the hits
if FX:
    place(fx, anchors["y2015"] + 0.44 - 0.8, riser(0.8), 0.6);  place(fx, anchors["y2015"] + 0.44, impact(), 0.55)
    place(fx, anchors["pct90_hit"] - 1.1, riser(1.1), 0.9);     place(fx, anchors["pct90_hit"], impact(), 0.9)
    place(fx, anchors["aucune_idee"] + 0.38, impact(), 0.5)
    place(fx, anchors["payoff"] - 1.2, riser(1.2), 0.9);        place(fx, anchors["payoff"], impact(), 0.8)

# ---------------------------------------------------------------- mix
def stereo(x): return np.stack([x, x], axis=1)
pad = stems["pad"]; keys = stems["keys"]; kal = stems["kalimba"]; strs = stems["strings"]
pad = np.stack([lowpass(pad[:, 0], 3200), lowpass(pad[:, 1], 3200)], 1)
strs = np.stack([lowpass(strs[:, 0], 6000), lowpass(strs[:, 1], 6000)], 1)
def norm_peak(x, p): 
    m = np.max(np.abs(x)) + 1e-9; return x / m * p
mix = (norm_peak(pad, 0.5) * 0.9 + norm_peak(keys, 0.5) * 0.75 + norm_peak(kal, 0.4) * 0.55 + norm_peak(strs, 0.45) * 0.7
       + stereo(norm_peak(drums, 0.9)) * 0.85 + stereo(norm_peak(sub, 0.8)) * 0.8 + stereo(norm_peak(fx, 0.9)) * 0.8)
# master: high-pass 30 Hz, overall fade-out at the end (1.4 s), peak to -3 dB
mix = np.stack([highpass(mix[:, 0], 30), highpass(mix[:, 1], 30)], 1)
fade_start = int(39.6 * SR); fade_end = int(41.0 * SR)
ramp = np.ones(N); ramp[fade_start:fade_end] = np.linspace(1, 0, fade_end - fade_start) ** 1.5; ramp[fade_end:] = 0
mix *= ramp[:, None]
mix = norm_peak(mix, 10 ** (-3 / 20))
write_wav(os.path.join(OUT, "music_raw.wav"), mix)
json.dump({"bpm": BPM, "offset": OFFSET, "beat": BEAT, "bar": BAR, "beats": {k: v for k, v in B.items()},
           "anchors": anchors, "kick_times": [round(k, 3) for k in kick_times], "chords": [(bar, chord_at_bar(bar)[0], round(OFFSET + bar * BAR, 3)) for bar in range(n_bars)]},
          open(os.path.join(OUT, "music_meta.json"), "w"), indent=1)
print("music rendered:", os.path.join(OUT, "music_raw.wav"), "beats:", B)
