# Analyse du rush — clip podcast « Le marketing des entreprises est éclaté »

Projet : `video-localisy` · Format livré : 9:16, 1080×1920, 30 fps · Langue : français

## 1. Rush

| Fichier | Durée | Résolution | FPS | Orientation | Audio | Loudness |
|---|---|---|---|---|---|---|
| `input/rush_01.mp4` (copie de `download_1.mp4`) | 39,85 s | 720×1280 (H.264 High, 4,0 Mb/s) | 30 | verticale 9:16 | AAC stéréo 48 kHz, 253 kb/s | −20,7 LUFS intégrée, LRA 3,3 LU, pic −8,6 dBFS |

Observations :

- **Un seul plan fixe, aucune coupe** (PySceneDetect : 0 changement de scène sur 1 195 images). Face cam de podcast : homme en chemise blanche, micro de table à droite, fond rose/magenta uni éclairé en couleur. Il regarde un interlocuteur hors champ (camera droite), pas l'objectif.
- **Visage** détecté sur 100 % des échantillons (Haar, 200 points) : centre médian à (44 %, 32 %) de l'image, largeur ≈ 40 % de l'image. Il bouge très peu : les punch-ins seront ancrés sur ce point pour que le visage reste en place.
- **Zone libre** : le quart supérieur droit (fond rose vide) accueille les titres et la liste ; les mains gesticulent dans le tiers inférieur ; les sous-titres se posent sur la chemise (sous le menton, au-dessus des mains), jamais sur le visage.
- **Audio** : voix seule, propre (micro de podcast), pas de musique sous-jacente, pas de silence de plus de 0,25 s. Bande passante coupée à 17 kHz (AAC). Aucun bruit de fond notable (plancher ≈ −45 dBFS) → nettoyage très léger seulement.
- **Colorimétrie** : dominante magenta globale (la chemise blanche lit rose : RGB ≈ 189/155/155), exposition correcte (luma médiane 159/255, noirs à 14). Le look choisi retire un peu de magenta des hautes lumières, légère désaturation (−10 %), contraste doux, vignettage léger, grain fin.
- **Limite** : la source est en 720p. Le 1080×1920 final est un upscale ×1,5 (Lanczos + léger unsharp). Les punch-ins sont plafonnés à 115 %. Si tu as un master en 1080p ou 4K, le rendu gagnera en piqué.
- **Pics de mouvement** (gestes) : 1,8 · 4,2 · 9,3 · 17,4 · 20,7 · 23,1 · 27,0 · 29,5 · 32,2 · 35,6 s — ils coïncident avec les phrases fortes ci-dessous.

## 2. Transcription (Whisper small, mot à mot) et corrections

Timestamps en secondes. Les mots en gras sont les mots à impact (accent couleur à l'écran). Les corrections manuelles de l'ASR sont indiquées entre crochets.

| Début | Fin | Texte |
|---|---|---|
| 0,00 | 1,16 | Le marketing des entreprises, |
| 1,44 | 3,18 | il est majoritairement **éclaté** |
| 3,18 | 4,68 | et ça n'a rien à voir avec le **budget**. |
| 4,92 | 5,84 | Elles font **aucune vidéo**. |
| 6,02 | 8,30 | Elles utilisent des photos et des **posts statiques**. [ASR : « postes »] |
| 8,38 | 9,22 | Comme on faisait en **2015**. [ASR : « comme on se voit en », corrigé à l'oreille des deux passes] |
| 9,64 | 13,14 | Tu as des **milliers de recherches** tous les jours, toutes les heures, sur les produits et services. [ASR : « où les jours »] |
| 13,34 | 17,60 | Et tu as des boîtes qui ne s'intéressent même pas à savoir si elles **apparaissent** quand leurs prospects font des recherches. |
| 17,66 | 20,08 | Tu as des boîtes qui ne savent pas du tout ce que leur **site internet** leur apporte. |
| 20,12 | 20,70 | Ça, c'est **90 %**. |
| 21,14 | 24,56 | Combien de **leads** ou de **ventes** vous faites réellement grâce à votre **site web** ? [ASR : « de l'id ou de vente »] |
| 24,70 | 25,24 | Réponse : |
| 25,52 | 26,18 | On n'a **aucune idée**. |
| 26,18 | 28,28 | parce que les outils sont pas bien **configurés**, [ASR : « parce qu'il n'y a pas les outils qui… » — simplifié à l'écran] |
| 28,34 | 29,14 | il n'y a pas de **monitoring**, |
| 29,36 | 30,18 | il n'y a pas d'**analyse**. |
| 30,24 | 31,28 | C'est pas une question de **budget**. |
| 31,48 | 35,40 | Tu peux avoir un **super gros budget** et avoir des **perfs** qui sont **éclatées**, [ASR : « perves… éclataxes »] |
| 35,48 | 39,54 | et tu peux avoir un marketing avec un **petit budget** où tu as vraiment un **vrai retour sur investissement**. |

Deux points à confirmer à l'oreille de ton côté (je ne peux pas écouter, seulement transcrire) : « Comme **on faisait** en 2015 » (8,4 s) et « **Réponse :** » (24,7 s, l'ASR hésite entre « Réponse est… » et « Réponse 7 »).

Mots-clés / chiffres repérés : éclaté · budget (×4, c'est le fil rouge) · aucune vidéo · 2015 · milliers de recherches · 90 % · leads / ventes · aucune idée · monitoring / analyse · retour sur investissement.

## 3. Musique

Aucun fichier dans `./input/music`. Les banques libres de droits habituelles (Pixabay, Free Music Archive, Incompetech, Freesound, Uppbeat…) sont **bloquées par le proxy réseau de cet environnement** (connexion refusée), tout comme Hugging Face. J'ai donc **composé et rendu une musique originale par code** (donc libre de droits par construction) :

- `work/audio/music_raw.wav` — 122 BPM, ré mineur, progression Dm · B♭ · F · C (2 mesures par accord), 41,2 s.
- Nappe chaude + piano électrique (FluidSynth, soundfont FluidR3 GM, licence MIT) · kalimba en arpèges à partir de la section « liste » · cordes hautes sur le payoff · kick half-time, clap, charleys, sub-basse, synthétisés en numpy.
- **Grille rythmique calée sur la voix** : offset 0,02 s, temps = 0,492 s. Les respirations de la voix tombent sur les temps 10, 17, 27, 36, 41, 43, 50, 52, 53, 64, 72, 80 (écart moyen 46 ms, max 104 ms). Les coupes (punch-ins) sont posées exactement sur ces temps.
- Deux « drops » de batterie : juste avant « 90 % » (20,4 → 21,1 s) et sur « Réponse : » (24,7 → 25,8 s), le drop musical principal arrive sur le payoff à 31,5 s (mesure 16).
- Fin : fade-out 1,4 s (39,6 → 41,0 s).

Si tu préfères un vrai morceau, dépose-le dans `./input/music/` et je recale la grille dessus (le script d'analyse BPM/downbeats est prêt).

## 4. Structure proposée (41,0 s au total, 1 230 images)

Rythme : cuts secs = changements de niveau de punch-in (100 → 115 %) sur les temps ; **2 transitions seulement** (zoom-blur à 21,1 s sur la question, flash à 31,5 s sur le payoff).

| Section | Temps | Ce qu'on voit | Son |
|---|---|---|---|
| **Hook** | 0,0 – 4,9 s | Démarrage sur la phrase choc, cadrage à 112 % qui se relâche doucement vers 106 % (mouvement dès la 1ʳᵉ image). Sous-titres dès 0,0 s ; « ÉCLATÉ » seul, en grand, à 2,5 s ; « budget » en accent. | Nappe + sub + charleys légers, pas encore de kick. |
| **Symptômes** | 4,9 – 8,4 s | Punch-out à 100 % sur le temps. « aucune vidéo », « posts statiques » en accent. | Kick half-time + clap entrent. |
| **2015** | 8,4 – 13,3 s | Punch-in 110 %. Titre géant « 2015 » (Figtree ExtraBold, −0,03 em, soulignement accent qui se trace) en haut à droite, 8,8 → 10,3 s. Puis « milliers de recherches » / « tous les jours, toutes les heures » en sous-titres rapides. | Riser 1 s + thud sur l'apparition de 2015. |
| **Les boîtes** | 13,3 – 20,1 s | Deux plans : 104 → 108 % puis 112 %. « apparaissent », « site internet » en accent. | Groove complet. |
| **90 %** | 20,1 – 21,1 s | Punch-in 115 %. Compteur animé 0 → 90 % géant en accent, « des boîtes » dessous, 20,4 → 21,1 s. | Riser 1,1 s → impact. La batterie se tait. |
| **Question** | 21,1 – 24,6 s | Transition zoom-blur. Retour à 100 %. Sous-titres en style « question » (plus grands, barre accent à gauche) : « Combien de leads ou de ventes / vous faites réellement / grâce à votre site web ? » | Flash + whoosh. Batterie plus dense. |
| **Réponse** | 24,6 – 26,1 s | 108 % puis 113 % sur « AUCUNE IDÉE » en grand. | Drop de batterie sur « Réponse : », thud sur « aucune idée ». |
| **Liste** | 26,1 – 31,5 s | 104 → 109 %. Liste qui se construit en haut à droite : ◼ Outils mal configurés · ◼ Pas de monitoring · ◼ Pas d'analyse (une ligne par mot prononcé). « question de BUDGET » clôt la section. | Tick sur chaque ligne. |
| **Payoff** | 31,5 – 39,5 s | Flash blanc sur « Tu peux avoir ». 108 → 111 %, puis 100 → 104 %, puis 110 → 113 % sur « vraiment ». « super gros budget » / « perfs éclatées » / « petit budget » / « VRAI RETOUR SUR INVESTISSEMENT » en accent. | Riser → impact sur 31,5 s, cordes + kalimba, énergie max. |
| **Fin** | 39,5 – 41,0 s | Dernière image gelée avec lent push 113 → 117 %, sous-titres sortis à 39,75 s. CTA optionnel (désactivé par défaut, voir question 3). | Fade-out musique 1,4 s. |

Habillage permanent : barre de progression fine (5 px, accent) juste sous la zone sûre haute (y = 160 px). Zones sûres respectées : rien sous y = 1 670 px, rien au-dessus de y = 150 px. Sous-titres centrés à y ≈ 1 050–1 250 px, Figtree SemiBold 66 px (ExtraBold pour les accents ; 96 px capitales pour les mots isolés), fond sombre arrondi semi-transparent (62 %) avec flou, groupes de 1 à 4 mots, mot courant à 100 % / mots à venir à 72 %, entrée scale 0,85 → 1 en 230 ms avec `cubic-bezier(0.22, 1, 0.36, 1)`, sortie 130 ms.

Look : étalonnage unique (magenta légèrement retiré des hautes lumières, saturation −10 %, courbe de contraste douce, vignettage léger), grain fin ≈ 4 %. Couleur d'accent : ambre `#FFC94D` (complémentaire du fond rose, lisible sur le fond sombre des sous-titres).

Son : voix nettoyée (passe-haut 70 Hz, réduction de bruit légère, de-esser léger) et normalisée à **−16 LUFS** (mesuré : −15,9 LUFS, pic vrai −2,3 dBTP). Musique alignée sur la voix puis **ducking −15 dB** pendant la parole, attaque 15 ms, retour 300 ms ; mesuré pendant la parole : −30,9 LUFS, soit 15 dB sous la voix. SFX synthétisés (whoosh, click, pop, tick, riser, impact, thud, flash) à −10 / −16 dB sous la voix : ils se sentent, ils ne s'entendent pas.

## 5. Questions avant le rendu final (2 options max à chaque fois)

1. **Hook** — (A, recommandé) ordre chronologique : la phrase « Le marketing des entreprises est majoritairement ÉCLATÉ » ouvre la vidéo avec le punch-in et le mot géant ; (B) cold open : commencer par la question « Combien de leads ou de ventes vous faites réellement grâce à votre site web ? » (21,1 → 24,6 s), flash, puis reprendre au début. B est plus « clickbait », A est plus fidèle au propos et évite la répétition de la question.
2. **Ambiance / look** — (A, recommandé) « moderne et net » : fond rose conservé, légère désaturation, contraste doux, accent ambre ; (B) « chaleureux » : réchauffer les hautes lumières, accent blanc cassé. Le fond magenta se prête mal à un look sombre, je ne le propose pas.
3. **CTA de fin** — (A, recommandé) pas de CTA, fin propre sur « retour sur investissement » ; (B) une ligne CTA sur l'image gelée (texte à me donner, ex. « Suivez pour la suite » ou un @handle). Le composant existe déjà (`cta.enabled` dans `remotion/src/data/edit.json`).
4. **Musique** — garder la composition originale (122 BPM) ou déposer un morceau dans `./input/music/` ?

Tant que tu n'as pas validé, je ne rends qu'en basse résolution (540×960, 15 fps) et des images clés PNG dans `./preview`.
