# video-localisy — montage du clip podcast (9:16)

Montage « code only » d'un extrait de podcast : Remotion (React + TypeScript) pour la composition, ffmpeg pour l'image et le son, Python pour l'analyse. Voir `analysis.md` (analyse + structure) et `credits.md` (sources, licences).

## Arborescence

```
input/                  rushs originaux (jamais modifiés) — rush_01.mp4
input/music/            (optionnel) dépose ici une musique à utiliser à la place de la composition
remotion/               projet Remotion complet
  src/data/edit.json    ← LA décision de montage : sous-titres, mots accentués, punch-ins, titres, liste, SFX, CTA
  src/components/       Footage (punch-ins), Captions, Titles (2015, 90 %), ListOverlay, ProgressBar, TransitionFx, EndCard
  public/footage.mp4    plan étalonné 1080×1920 (généré, non versionné)
  public/audio/         voix normalisée −16 LUFS + musique duckée (générés)
  public/sfx/           bruitages synthétisés
  public/fonts/         Figtree auto-hébergée (secours si Google Fonts est injoignable)
tools/edit/build_edit.py      transcription corrigée → edit.json (groupes de mots, accents, timings)
tools/audio/make_music.py     composition + rendu de la musique (MIDI → FluidSynth + synthèse numpy)
tools/audio/make_sfx.py       bruitages
tools/audio/duck.py           ducking de la musique sous la voix
tools/asr/transcribe.mjs      transcription Whisper small (ONNX, local) avec timestamps mot à mot
work/                   analyses et intermédiaires (non versionnés sauf les JSON)
preview/                images clés PNG du contrôle qualité
analysis.md · credits.md
```

## Pré-requis

- Node 22, ffmpeg/ffprobe ≥ 6, Python ≥ 3.12 avec `uv` (ou pip).
- Pour régénérer la musique : `fluidsynth` + soundfont `FluidR3_GM.sf2` (`apt install fluidsynth fluid-soundfont-gm`).
- Navigateur : Remotion télécharge Chrome Headless Shell tout seul. Sans réseau, pointer `REMOTION_BROWSER` vers un `headless_shell` local (c'est ce que fait `remotion/remotion.config.ts` dans cet environnement).
- Police : Figtree est chargée depuis Google Fonts (`@remotion/google-fonts`). Si le navigateur de rendu n'a pas accès à `fonts.gstatic.com`, exporter `REMOTION_FONT_SOURCE=local` : la même police variable, auto-hébergée dans `remotion/public/fonts/`, est utilisée.

```bash
cd remotion && npm install
uv venv .venv && source .venv/bin/activate && uv pip install librosa "scenedetect[opencv-headless]" "opencv-python-headless<5" soundfile scipy mido
```

## Modifier un texte, un timing, un accent

Tout passe par `remotion/src/data/edit.json` (ou par `tools/edit/build_edit.py` qui le génère depuis la transcription) :

- `captions[]` : groupes de 1 à 4 mots, chaque mot avec `start`/`end` (secondes) et `accent: true` pour la couleur ambre. `style` = `normal` | `question` | `big`.
- `shots[]` : punch-ins (`zoomFrom` → `zoomTo`, 1.00 = 100 %), coupés sur la grille 122 BPM.
- `titles[]` : « 2015 » et le compteur « 90 % ». `list` : les trois lignes de la section « liste ».
- `sfx[]` : fichier, instant, gain. `cta.enabled` : ligne d'appel à l'action sur la fin gelée.
- `accent` : couleur d'accent. `face` : point d'ancrage des zooms (visage).

Puis relancer un rendu (ci-dessous). Prévisualisation interactive : `cd remotion && npm run studio`.

## Rendre

```bash
cd remotion
npm run preview        # 540×960, 15 fps → remotion/out/preview_540x960_15fps.mp4
npm run stills         # 8 images clés PNG pleine résolution → ../preview/
npm run render         # H.264 CRF 18, AAC 320 kb/s → remotion/out/clip_remotion.mp4
```

Export final conforme (profil High, faststart, nom de livraison) :

```bash
ffmpeg -i remotion/out/clip_remotion.mp4 -c:v copy -c:a copy -movflags +faststart video-localisy_final_9x16.mp4
```

(le script `tools/render_final.sh` enchaîne rendu + remux + vérification ffprobe).

## Régénérer les médias intermédiaires (si `work/` ou `remotion/public` sont absents)

```bash
bash tools/prepare_media.sh     # étalonnage 1080×1920 + gel de fin, voix nettoyée/normalisée, musique, ducking, SFX
```

Pour utiliser une autre musique : la déposer dans `input/music/`, puis `python tools/audio/duck.py input/music/mon_morceau.wav work/audio/voice_norm.wav remotion/public/audio/music_ducked.wav` (et recaler les coupes dans `build_edit.py` sur le BPM mesuré).
