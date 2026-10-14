#!/usr/bin/env python3
"""Build remotion/src/data/edit.json from the word-level transcript.

- applies the manual corrections to the ASR output (see analysis.md),
- groups words into 2-4 word caption groups with keyword accents,
- defines the punch-in shots (cuts on the 122 BPM beat grid), transitions,
  titles, list overlay and SFX cues.
Edit this file (or the JSON it produces) to change any text or timing.
"""
import json, sys
TOK = "/home/user/video-localisy/work/tokens_merged.json"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/home/user/video-localisy/remotion/src/data/edit.json"
toks = json.load(open(TOK))

FPS = 30
BPM, OFFSET = 122.0, 0.02
BEAT = 60 / BPM
def beat(k): return round(OFFSET + k * BEAT, 3)

# ---- 1. corrections (token index -> replacement text). None = drop the token.
fix = {
    27: "posts", 31: "faisait", 32: None, 34: "2015.", 41: "tous", 95: "leads", 98: "ventes",
    106: "web ?", 108: ":", 114: "que", 115: None, 116: None, 117: None, 120: None,
    125: None, 126: None, 127: None, 131: None, 132: None, 133: None,
    152: "perfs", 155: "éclatées,", 92: "90 %.", 16: "budget.", 112: "idée.",
}
words = []
for i, t in enumerate(toks):
    txt = fix.get(i, t["text"]) if i in fix else t["text"]
    if txt is None: continue
    words.append({"i": i, "text": txt, "start": float(t["start"]), "end": float(t["end"] if t["end"] is not None else t["start"] + 0.2)})
# "faisait" takes over the span of the dropped "voit"
for w in words:
    if w["i"] == 31: w["end"] = 8.70

# ---- 2. caption groups: list of (token indices, accent indices, style)
G = [
    ([0, 1, 2, 3], [], None),                 # Le marketing des entreprises,
    ([4, 5, 6], [], None),                    # il est majoritairement
    ([7], [7], "big"),                        # ÉCLATÉ
    ([8, 9, 10, 11], [], None),               # et ça n'a rien
    ([12, 13, 14], [], None),                 # à voir avec
    ([15, 16], [16], None),                   # le budget.
    ([17, 18], [], None),                     # Elles font
    ([19, 20], [19, 20], None),               # aucune vidéo.
    ([21, 22, 23, 24], [24], None),           # Elles utilisent des photos
    ([25, 26, 27, 28], [27, 28], None),       # et des posts statiques.
    ([29, 30, 31, 33], [], None),             # Comme on faisait en   (the giant "2015" title carries the year)
    ([35, 36, 37, 38], [38], None),           # tu as des milliers
    ([39, 40], [40], None),                   # de recherches
    ([41, 42, 43], [], None),                 # tous les jours,
    ([44, 45, 46], [], None),                 # toutes les heures
    ([47, 48, 49], [49], None),               # sur les produits
    ([50, 51], [51], None),                   # et services.
    ([52, 53, 54, 55], [], None),             # Et tu as des
    ([56, 57, 58], [56], None),               # boîtes qui ne
    ([59, 60, 61], [59], None),               # s'intéressent même pas
    ([62, 63, 64, 65], [], None),             # à savoir si elles
    ([66], [66], None),                       # apparaissent
    ([67, 68, 69], [69], None),               # quand leurs prospects
    ([70, 71, 72], [72], None),               # font des recherches.
    ([73, 74, 75, 76], [76], None),           # Tu as des boîtes
    ([77, 78, 79, 80], [], None),             # qui ne savent pas
    ([81, 82, 83, 84], [], None),             # du tout ce que
    ([85, 86, 87], [86, 87], None),           # leur site internet
    ([88, 89], [89], None),                   # leur apporte.
    ([90, 91], [], None),                     # Ça c'est              (the animated "90 %" counter carries the number)
    ([93, 94, 95], [95], "question"),         # Combien de leads
    ([96, 97, 98], [98], "question"),         # ou de ventes
    ([99, 100, 101], [101], "question"),      # vous faites réellement
    ([102, 103, 104], [], "question"),        # grâce à votre
    ([105, 106], [105, 106], "question"),     # site web ?
    ([107, 108], [], None),                   # Réponse :
    ([109, 110], [], None),                   # On n'a
    ([111, 112], [111, 112], "big"),          # aucune idée.
    ([113, 114, 118, 119], [119], None),      # parce que les outils
    ([121, 122, 123, 124], [124], None),      # sont pas bien configurés,
    ([128, 129, 130], [130], None),           # pas de monitoring,
    ([134, 135], [135], None),                # pas d'analyse,
    ([136, 137, 138], [], None),              # c'est pas une
    ([139, 140, 141], [141], None),           # question de budget.
    ([142, 143, 144, 145], [], None),         # Tu peux avoir un
    ([146, 147, 148], [146, 147, 148], None), # super gros budget
    ([149, 150, 151], [], None),              # et avoir des
    ([152, 153, 154, 155], [152, 155], None), # perfs qui sont éclatées,
    ([156, 157, 158, 159], [], None),         # et tu peux avoir
    ([160, 161], [161], None),                # un marketing
    ([162, 163, 164, 165], [164, 165], None), # avec un petit budget
    ([166, 167, 168, 169], [169], None),      # où tu as vraiment
    ([170, 171], [171], None),                # un vrai
    ([172, 173, 174], [172, 173, 174], "big"),# retour sur investissement.
]
by_i = {w["i"]: w for w in words}
captions = []
for idx, acc, style in G:
    ws = [by_i[i] for i in idx]
    captions.append({
        "start": ws[0]["start"], "end": ws[-1]["end"],
        "words": [{"text": w["text"], "start": w["start"], "end": w["end"], "accent": (w["i"] in acc)} for w in ws],
        "style": style or "normal",
    })
# captions must not overlap; a group holds until the next one starts (max hold 1.1 s)
for a, b in zip(captions, captions[1:]):
    a["end"] = min(b["start"], max(a["end"], a["start"] + 0.35) + 0.0)
    a["end"] = max(a["end"], min(b["start"], a["words"][-1]["end"]))
captions[-1]["end"] = 39.75
# bridge small gaps (< 0.45 s) so the caption doesn't flicker off between groups
for a, b in zip(captions, captions[1:]):
    if b["start"] - a["end"] < 0.45: a["end"] = b["start"]
SILENT = {34, 92}   # words carried by a title instead of a caption
used = {i for idx, _, _ in G for i in idx} | SILENT
missing = [w["i"] for w in words if w["i"] not in used]
assert not missing, f"uncaptioned words: {missing}"

# ---- 3. shots: punch-ins, cut on beats (beat index -> zoom). Zoom range 1.00 – 1.15.
shot_beats = [
    (0, 1.12, 1.06), (10, 1.00, 1.03), (17, 1.10, 1.12), (27, 1.04, 1.08), (36, 1.12, 1.13),
    (41, 1.15, 1.15), (43, 1.00, 1.04), (50, 1.08, 1.08), (52, 1.13, 1.14), (53, 1.04, 1.09),
    (64, 1.08, 1.11), (72, 1.00, 1.04), (76, 1.10, 1.13), (80, 1.13, 1.17),
]
shots = []
for (b, z0, z1), nxt in zip(shot_beats, shot_beats[1:] + [(None, 0, 0)]):
    start = 0.0 if b == 0 else beat(b)
    end = 41.0 if nxt[0] is None else beat(nxt[0])
    shots.append({"start": start, "end": end, "zoomFrom": z0, "zoomTo": z1})

transitions = [{"at": beat(43), "type": "zoomblur"}, {"at": beat(64), "type": "flash"}]
titles = [
    {"type": "year", "text": "2015", "start": 8.80, "end": 10.30},
    {"type": "number", "value": 90, "suffix": " %", "start": 20.38, "end": 21.12, "label": "des boîtes"},
]
list_overlay = {"start": 27.1, "end": 30.2, "items": [
    {"text": "Outils mal configurés", "at": 27.45}, {"text": "Pas de monitoring", "at": 28.66}, {"text": "Pas d'analyse", "at": 29.62},
]}
sfx = []
for c in captions:                      # discreet click on every caption group
    sfx.append({"src": "sfx/click.wav", "at": round(c["start"] - 0.02, 3), "gain": 0.16})
for c in captions:                      # soft pop on "big" groups
    if c["style"] == "big": sfx.append({"src": "sfx/pop.wav", "at": round(c["start"], 3), "gain": 0.32})
sfx += [
    {"src": "sfx/riser.wav", "at": 7.85, "gain": 0.35}, {"src": "sfx/thud.wav", "at": 8.80, "gain": 0.45}, {"src": "sfx/whoosh.wav", "at": 8.78, "gain": 0.3},
    {"src": "sfx/riser.wav", "at": 19.35, "gain": 0.5}, {"src": "sfx/impact.wav", "at": 20.38, "gain": 0.6},
    {"src": "sfx/flash.wav", "at": beat(43) - 0.1, "gain": 0.4}, {"src": "sfx/whoosh.wav", "at": beat(43) - 0.12, "gain": 0.35},
    {"src": "sfx/thud.wav", "at": 25.52, "gain": 0.4},
    {"src": "sfx/tick.wav", "at": 27.45, "gain": 0.3}, {"src": "sfx/tick.wav", "at": 28.66, "gain": 0.3}, {"src": "sfx/tick.wav", "at": 29.62, "gain": 0.3},
    {"src": "sfx/riser.wav", "at": beat(64) - 1.0, "gain": 0.5}, {"src": "sfx/impact.wav", "at": beat(64), "gain": 0.55}, {"src": "sfx/flash.wav", "at": beat(64) - 0.05, "gain": 0.35},
    {"src": "sfx/thud.wav", "at": 38.32, "gain": 0.35},
]
edit = {
    "fps": FPS, "width": 1080, "height": 1920, "durationInFrames": int(round(41.0 * FPS)),
    "accent": "#FFC94D",
    "face": {"cx": 0.44, "cy": 0.317},
    "safe": {"top": 150, "bottom": 250},
    "footage": {"src": "footage.mp4"},
    "voice": {"src": "audio/voice_norm.wav", "gain": 1.0},
    "music": {"src": "audio/music_ducked.wav", "gain": 1.0},
    "shots": shots, "transitions": transitions, "captions": captions, "titles": titles,
    "list": list_overlay, "progressBar": True,
    "cta": {"enabled": False, "text": "Suivez pour la suite", "sub": "", "start": 39.7},
    "sfx": sorted(sfx, key=lambda s: s["at"]),
}
json.dump(edit, open(OUT, "w"), ensure_ascii=False, indent=1)
print("captions:", len(captions), "shots:", len(shots), "sfx:", len(sfx), "->", OUT)
for c in captions: print(f'{c["start"]:6.2f}-{c["end"]:6.2f} [{c["style"][:1]}] ' + " ".join(("*" + w["text"] + "*") if w["accent"] else w["text"] for w in c["words"]))
