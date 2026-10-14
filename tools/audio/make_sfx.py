#!/usr/bin/env python3
"""Synthesise the small sound-design kit used by the Remotion composition.
All sounds are generated from noise/oscillators (no samples), hence royalty-free."""
import os, sys, numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SR = 48000; rng = np.random.default_rng(11)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, min(hi, SR/2-1)], btype="band", fs=SR, output="sos"), x)
def lp(x, fc, o=2): return sosfilt(butter(o, fc, btype="low", fs=SR, output="sos"), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, btype="high", fs=SR, output="sos"), x)
def save(name, x, peak=0.5):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    sf.write(os.path.join(OUT, name), x.astype(np.float32), SR, subtype="PCM_16")
    print(name, f"{len(x)/SR:.2f}s")
def tt(d): return np.arange(int(d * SR)) / SR

# whoosh: band-passed noise sweeping up then down, 380 ms, soft
t = tt(0.38); n = rng.standard_normal(len(t)); out = np.zeros_like(t); step = int(0.01 * SR)
for i in range(0, len(t), step):
    fr = i / len(t); c = 400 + 3200 * np.sin(np.pi * fr) ** 1.2
    out[i:i+step] = bp(n[i:i+step], c * 0.6, c * 1.6)[:len(out[i:i+step])]
env = np.sin(np.pi * (t / 0.38)) ** 1.5
save("whoosh.wav", out * env, 0.4)

# pop: short sine blip with pitch drop + tiny click, 70 ms
t = tt(0.07); f = 1200 * np.exp(-t / 0.012) + 420
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.018)
pop += hp(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.002) * 0.3
save("pop.wav", pop, 0.45)

# click: 25 ms filtered noise tick
t = tt(0.03); c = bp(rng.standard_normal(len(t)), 2500, 7000) * np.exp(-t / 0.004)
save("click.wav", c, 0.35)

# tick (list items): wood-like resonant tap, 90 ms
t = tt(0.09); f0 = 1900
tick = (np.sin(2*np.pi*f0*t) + 0.4*np.sin(2*np.pi*f0*2.3*t)) * np.exp(-t / 0.014) + bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t/0.003) * 0.5
save("tick.wav", tick, 0.4)

# riser: 1.0 s noise sweep + rising tone
d = 1.0; t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(t); step = int(0.02 * SR)
for i in range(0, len(t), step):
    fr = t[i] / d; lo = 250 + 3000 * fr ** 1.6
    out[i:i+step] = bp(n[i:i+step], lo, lo * 2.4)[:len(out[i:i+step])]
tone = np.sin(2*np.pi*np.cumsum(180 * 2 ** (2.3 * t / d)) / SR) * 0.3
save("riser.wav", (out * 0.8 + tone) * (t / d) ** 2, 0.5)

# impact: sub thump + noise burst + lowpassed tail, 0.8 s
t = tt(0.8); f = 36 + 100 * np.exp(-t / 0.06)
body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t / 0.3)
burst = lp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.05)
tail = lp(rng.standard_normal(len(t)), 700) * np.exp(-t / 0.28) * 0.35
save("impact.wav", body * 0.9 + burst * 0.5 + tail, 0.6)

# soft impact for text reveals (less sub), 0.45 s
t = tt(0.45); f = 70 + 160 * np.exp(-t / 0.03)
body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t / 0.12)
burst = bp(rng.standard_normal(len(t)), 300, 4000) * np.exp(-t / 0.03)
save("thud.wav", body * 0.8 + burst * 0.5, 0.5)

# flash/zoom-blur transition sound: short bright whoosh + click, 0.3 s
t = tt(0.3); n = rng.standard_normal(len(t)); out = np.zeros_like(t); step = int(0.01*SR)
for i in range(0, len(t), step):
    fr = i / len(t); c = 5000 - 4000 * fr
    out[i:i+step] = bp(n[i:i+step], c*0.7, c*1.5)[:len(out[i:i+step])]
save("flash.wav", out * np.exp(-t / 0.09) + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t/0.003) * 0.6, 0.45)
