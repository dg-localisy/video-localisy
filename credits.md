# Crédits et sources

## Image
- Rush : `input/rush_01.mp4`, fourni par le client (copie intacte de `download_1.mp4`, 720×1280, 39,85 s). Les versions étalonnées sont des copies (`work/proxies/`, `remotion/public/footage.mp4`).

## Référence de style
- `input/reference/reference_download_2.mp4`, fournie par le client : modèle pour le style des textes (blanc sans fond, apparition en flou, compositions à tailles mixtes). Non utilisée dans le montage.

## Plans de coupe
- Les 4 inserts (feed, recherche, site web, dashboard) sont des animations générées par le projet Remotion (`remotion/src/components/broll/`) : aucune image ni vidéo tierce. Les banques de stock, Canva et le téléchargement Drive ne sont pas accessibles depuis l'environnement de montage.

## Typographie
- **Figtree** (Erik Kennedy), Google Fonts, licence SIL Open Font License 1.1. Chargée via `@remotion/google-fonts/Figtree` (graisses 400 → 900, latin + latin-ext). Aucune autre police.

## Musique
- **Composition originale générée par code** (`tools/audio/make_music.py`) : 122 BPM, ré mineur, 41,2 s. Partie MIDI écrite en Python (mido) et rendue avec **FluidSynth 2.3** et la soundfont **FluidR3 GM** (Frank Wen, licence MIT). Batterie, sub-basse et transitions synthétisées en numpy/scipy. Aucun sample tiers : utilisation libre, y compris commerciale.
- Raison : les banques libres de droits (Pixabay, Free Music Archive, Incompetech, Uppbeat, Freesound…) ne sont pas joignables depuis cet environnement (proxy réseau). Déposer un morceau dans `input/music/` pour le remplacer.

## Effets sonores
- Tous synthétisés par `tools/audio/make_sfx.py` (bruit filtré + oscillateurs) : `whoosh`, `pop`, `click`, `tick`, `riser`, `impact`, `thud`, `flash` dans `remotion/public/sfx/`. Aucune source externe.

## Logiciels
- Remotion 4.0.535 (React 18, TypeScript 5), ffmpeg/ffprobe 6.1.1, Python 3.13 : librosa 1.0, PySceneDetect 0.7.2, OpenCV 4.14 (suivi de visage Haar), mido, soundfile, scipy.
- Transcription : Whisper small (OpenAI, licence MIT) au format ONNX via `@huggingface/transformers` 3.8 (paquet npm `sts-whisper-small`, Apache-2.0), exécuté localement (faster-whisper n'a pas pu télécharger ses poids : Hugging Face bloqué par le proxy).
