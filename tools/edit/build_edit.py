#!/usr/bin/env python3
"""Build remotion/src/data/edit.json from the word-level transcript.

Text system (modelled on the reference clip input/reference/reference_download_2.mp4):
- "captions": regular groups of 1-4 words, white, no background, blur-in, held until the next cue;
- "stacks": typographic compositions for the key phrases (mixed sizes / weights, words revealed
  one by one on their timestamps, the stack re-centres itself as words appear);
- every text sits under the chin (y ~ 1100-1300 px on 1080x1920), never over the face.
Edit this file (or the JSON it produces) to change any text, size or timing.
"""
import json, sys
TOK = "/home/user/video-localisy/work/tokens_merged.json"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/home/user/video-localisy/remotion/src/data/edit.json"
toks = json.load(open(TOK))

FPS = 30
BPM, OFFSET = 122.0, 0.02
BEAT = 60 / BPM
def beat(k): return round(OFFSET + k * BEAT, 3)

# ---- 1. corrections of the ASR output (token index -> text, None = drop)
fix = {
    27: "posts", 31: "faisait", 32: None, 34: "2015", 41: "tous", 95: "leads", 98: "ventes",
    106: "web ?", 108: ":", 114: "que", 115: None, 116: None, 117: None, 120: None,
    125: None, 126: None, 127: None, 131: None, 132: None, 133: None,
    152: "perfs", 155: "éclatées,", 92: "90", 16: "budget.", 112: "idée.",
}
W = {}
for i, t in enumerate(toks):
    txt = fix[i] if i in fix else t["text"]
    if txt is None: continue
    W[i] = {"i": i, "text": txt, "start": float(t["start"]), "end": float(t["end"] if t["end"] is not None else t["start"] + 0.2)}
W[31]["end"] = 8.70

# ---- 2. cues, in order. ("cap", [tokens]) or ("stack", [[(tok, size, bold), ...], ...])
# sizes: xs 44 px · s 56 · m 74 · l 104 · xl 132 (at 1080 wide). Regular captions use "s".
S, M, L, XL = "s", "m", "l", "xl"
CUES = [
    ("cap", [0, 1, 2, 3]),                                                     # Le marketing des entreprises,
    ("stack", [[(4, S, 0), (5, S, 0), (6, S, 0)], [(7, XL, 1)]]),               # il est majoritairement / éclaté
    ("cap", [8, 9, 10, 11]),                                                   # et ça n'a rien
    ("cap", [12, 13, 14]),                                                     # à voir avec
    ("cap", [15, 16]),                                                         # le budget.
    ("stack", [[(17, S, 0), (18, S, 0)], [(19, L, 1), (20, L, 1)]]),            # Elles font / aucune vidéo.
    ("cap", [21, 22, 23, 24]),                                                 # Elles utilisent des photos
    ("cap", [25, 26, 27, 28]),                                                 # et des posts statiques.
    ("stack", [[(29, S, 0), (30, S, 0), (31, S, 0), (33, S, 0)], [(34, XL, 1)]]),  # Comme on faisait en / 2015
    ("stack", [[(35, S, 0), (36, S, 0), (37, S, 0), (38, L, 1)], [(39, M, 0), (40, M, 0)]]),  # tu as des milliers / de recherches
    ("cap", [41, 42, 43]),                                                     # tous les jours,
    ("cap", [44, 45, 46]),                                                     # toutes les heures
    ("cap", [47, 48, 49]),                                                     # sur les produits
    ("cap", [50, 51]),                                                         # et services.
    ("cap", [52, 53, 54, 55]),                                                 # Et tu as des
    ("cap", [56, 57, 58]),                                                     # boîtes qui ne
    ("cap", [59, 60, 61]),                                                     # s'intéressent même pas
    ("cap", [62, 63, 64, 65]),                                                 # à savoir si elles
    ("cap", [66]),                                                             # apparaissent
    ("cap", [67, 68, 69]),                                                     # quand leurs prospects
    ("cap", [70, 71, 72]),                                                     # font des recherches.
    ("cap", [73, 74, 75, 76]),                                                 # Tu as des boîtes
    ("cap", [77, 78, 79, 80]),                                                 # qui ne savent pas
    ("cap", [81, 82, 83, 84]),                                                 # du tout ce que
    ("cap", [85, 86, 87]),                                                     # leur site internet
    ("cap", [88, 89]),                                                         # leur apporte.
    ("stack", [[(90, S, 0), (91, S, 0)], [(92, XL, 1)]]),                        # Ça c'est / 90 %  (count-up)
    ("stack", [[(93, S, 0), (94, S, 0), (95, L, 1)], [(96, S, 0), (97, S, 0), (98, L, 1)], [(99, M, 0), (100, M, 0), (101, M, 0)]]),  # Combien de leads / ou de ventes / vous faites réellement
    ("cap", [102, 103, 104]),                                                  # grâce à votre
    ("cap", [105, 106]),                                                       # site web ?
    ("cap", [107, 108]),                                                       # Réponse :
    ("stack", [[(109, S, 0), (110, S, 0)], [(111, XL, 1), (112, XL, 1)]]),      # On n'a / aucune idée.
    ("cap", [113, 114]),                                                       # parce que
    ("stack", [[(118, S, 0), (119, M, 0)], [(121, S, 0), (122, S, 0), (123, S, 0), (124, L, 1)], [(128, S, 0), (129, S, 0), (130, L, 1)], [(134, S, 0), (135, L, 1)]]),  # les outils / sont pas bien configurés, / pas de monitoring, / pas d'analyse,
    ("stack", [[(136, S, 0), (137, S, 0), (138, S, 0), (139, S, 0), (140, S, 0)], [(141, XL, 1)]]),  # c'est pas une question de / budget.
    ("stack", [[(142, S, 0), (143, S, 0), (144, S, 0), (145, S, 0)], [(146, L, 1), (147, L, 1), (148, L, 1)]]),  # Tu peux avoir un / super gros budget
    ("cap", [149, 150, 151]),                                                  # et avoir des
    ("cap", [152, 153, 154, 155]),                                             # perfs qui sont éclatées,
    ("cap", [156, 157, 158, 159]),                                             # et tu peux avoir
    ("cap", [160, 161]),                                                       # un marketing
    ("stack", [[(162, S, 0), (163, S, 0)], [(164, L, 1), (165, L, 1)]]),        # avec un / petit budget
    ("cap", [166, 167, 168, 169]),                                             # où tu as vraiment
    ("stack", [[(170, S, 0), (171, M, 0)], [(172, L, 1), (173, S, 0)], [(174, XL, 1)]]),  # un vrai / retour sur / investissement.
]
SPECIAL = {92: {"countUp": 90, "suffix": " %"}}   # animated number

captions, stacks = [], []
starts = []
for kind, body in CUES:
    if kind == "cap":
        ws = [W[i] for i in body]
        captions.append({"start": ws[0]["start"], "words": [{"text": w["text"], "start": w["start"], "end": w["end"]} for w in ws]})
        starts.append(ws[0]["start"])
    else:
        lines = []
        for line in body:
            lines.append([dict({"text": W[i]["text"], "start": W[i]["start"], "end": W[i]["end"], "size": sz, "bold": bool(b)}, **SPECIAL.get(i, {})) for i, sz, b in line])
        stacks.append({"start": lines[0][0]["start"], "lines": lines})
        starts.append(lines[0][0]["start"])
# every cue holds until the next cue starts (last one until the voice ends)
ends = starts[1:] + [39.75]
k = 0
for kind, _ in CUES:
    (captions if kind == "cap" else stacks)[[c for c in (captions if kind == "cap" else stacks)].index(next(c for c in (captions if kind == "cap" else stacks) if c["start"] == starts[k]))]["end"] = ends[k]
    k += 1
used = {i for kind, body in CUES for i in (body if kind == "cap" else [t[0] for line in body for t in line])}
missing = [i for i in W if i not in used]
assert not missing, f"uncaptioned words: {missing}"

# ---- 3. shots: punch-ins cut on beats (zoom 1.00 – 1.15, anchored on the face)
shot_beats = [
    (0, 1.12, 1.06), (10, 1.00, 1.03), (17, 1.10, 1.12), (27, 1.04, 1.08), (36, 1.12, 1.13),
    (41, 1.15, 1.15), (43, 1.00, 1.04), (50, 1.08, 1.08), (52, 1.13, 1.14), (53, 1.04, 1.09),
    (64, 1.08, 1.11), (72, 1.00, 1.04), (76, 1.10, 1.13), (80, 1.13, 1.17),
]
shots = []
for (b, z0, z1), nxt in zip(shot_beats, shot_beats[1:] + [(None, 0, 0)]):
    shots.append({"start": 0.0 if b == 0 else beat(b), "end": 41.0 if nxt[0] is None else beat(nxt[0]), "zoomFrom": z0, "zoomTo": z1})
transitions = [{"at": beat(43), "type": "lightleak"}, {"at": beat(64), "type": "lightleak"}]

# ---- 3b. b-roll inserts: generated motion graphics, literal to the words (set "src" to use a real clip instead)
broll = [
    {"id": "feed", "start": W[21]["start"], "end": W[29]["start"], "src": None},        # Elles utilisent des photos et des posts statiques.
    {"id": "search", "start": W[35]["start"], "end": W[52]["start"], "src": None},      # des milliers de recherches tous les jours, toutes les heures
    {"id": "website", "start": W[73]["start"], "end": W[90]["start"], "src": None},     # ce que leur site internet leur apporte
    {"id": "dashboard", "start": W[128]["start"], "end": W[136]["start"], "src": None}, # pas de monitoring, pas d'analyse
]

# ---- 4. sound design cues
sfx = []
for st in stacks:
    sfx.append({"src": "sfx/whoosh.wav", "at": round(st["start"] - 0.06, 3), "gain": 0.22})
    for line in st["lines"]:
        for w in line:
            if w["size"] in ("l", "xl") and w["start"] > st["start"] + 0.05:
                sfx.append({"src": "sfx/pop.wav", "at": round(w["start"] - 0.02, 3), "gain": 0.2})
sfx += [
    {"src": "sfx/thud.wav", "at": 8.80, "gain": 0.4},                                          # 2015
    {"src": "sfx/riser.wav", "at": 19.35, "gain": 0.45}, {"src": "sfx/impact.wav", "at": 20.38, "gain": 0.5},   # 90 %
    {"src": "sfx/flash.wav", "at": beat(43) - 0.1, "gain": 0.35},                               # light leak → question
    {"src": "sfx/thud.wav", "at": 25.68, "gain": 0.35},                                         # aucune idée
    {"src": "sfx/tick.wav", "at": 27.56, "gain": 0.3}, {"src": "sfx/tick.wav", "at": 28.66, "gain": 0.3}, {"src": "sfx/tick.wav", "at": 29.58, "gain": 0.3},  # list
    {"src": "sfx/thud.wav", "at": 31.02, "gain": 0.3},                                          # budget.
    {"src": "sfx/riser.wav", "at": beat(64) - 1.0, "gain": 0.45}, {"src": "sfx/impact.wav", "at": beat(64), "gain": 0.5}, {"src": "sfx/flash.wav", "at": beat(64) - 0.05, "gain": 0.3},  # payoff
    {"src": "sfx/thud.wav", "at": 39.08, "gain": 0.35},                                         # investissement.
]
for b in broll:                                                                                   # cut to each insert
    sfx.append({"src": "sfx/whoosh.wav", "at": round(b["start"] - 0.08, 3), "gain": 0.3})
    sfx.append({"src": "sfx/whoosh.wav", "at": round(b["end"] - 0.1, 3), "gain": 0.22})
sfx += [{"src": "sfx/click.wav", "at": round(W[35]["start"] + 0.1 + k * 0.7, 3), "gain": 0.12} for k in range(5)]   # queries typing
sfx += [{"src": "sfx/pop.wav", "at": t, "gain": 0.16} for t in (18.96, 19.44, 19.72)]                                # ?, ?, ?
edit = {
    "fps": FPS, "width": 1080, "height": 1920, "durationInFrames": int(round(41.0 * FPS)),
    "accent": "#FFFFFF",
    "face": {"cx": 0.44, "cy": 0.317},
    "safe": {"top": 150, "bottom": 250},
    "text": {"centerY": 1190, "captionSize": 58, "sizes": {"xs": 44, "s": 56, "m": 74, "l": 104, "xl": 132}},
    "footage": {"src": "footage.mp4"},
    "voice": {"src": "audio/voice_norm.wav", "gain": 1.0},
    "music": {"src": "audio/music_ducked.wav", "gain": 1.0},
    "shots": shots, "transitions": transitions, "captions": captions, "stacks": stacks, "broll": broll,
    "progressBar": False,
    "cta": {"enabled": False, "text": "Suivez pour la suite", "sub": "", "start": 39.7},
    "sfx": sorted(sfx, key=lambda s: s["at"]),
}
json.dump(edit, open(OUT, "w"), ensure_ascii=False, indent=1)
print("captions:", len(captions), "stacks:", len(stacks), "sfx:", len(sfx), "->", OUT)
for kind, body in CUES:
    if kind == "cap":
        c = next(c for c in captions if c["start"] == W[body[0]]["start"]); print(f'{c["start"]:6.2f}-{c["end"]:6.2f} cap   ' + " ".join(w["text"] for w in c["words"]))
    else:
        s = next(s for s in stacks if s["start"] == W[body[0][0][0]]["start"]); print(f'{s["start"]:6.2f}-{s["end"]:6.2f} STACK ' + " / ".join(" ".join(f'{w["text"]}[{w["size"]}{"*" if w["bold"] else ""}]' for w in line) for line in s["lines"]))
