import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Figtree";

/**
 * Figtree is the only typeface of the project.
 * - Default: Google Fonts through @remotion/google-fonts (weights 400 → 900).
 * - REMOTION_FONT_SOURCE=local: the same variable font self-hosted in public/fonts
 *   (SIL OFL 1.1), for renderers without access to fonts.gstatic.com.
 */
export const FONT = "Figtree";

const LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT = "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

const loadLocal = async () => {
  const faces = [
    new FontFace(FONT, `url(${staticFile("fonts/Figtree-Variable-latin.woff2")}) format("woff2")`, { weight: "300 900", style: "normal", unicodeRange: LATIN }),
    new FontFace(FONT, `url(${staticFile("fonts/Figtree-Variable-latin-ext.woff2")}) format("woff2")`, { weight: "300 900", style: "normal", unicodeRange: LATIN_EXT }),
    new FontFace(FONT, `url(${staticFile("fonts/Figtree-Italic-latin.woff2")}) format("woff2")`, { weight: "300 900", style: "italic", unicodeRange: LATIN }),
    new FontFace(FONT, `url(${staticFile("fonts/Figtree-Italic-latin-ext.woff2")}) format("woff2")`, { weight: "300 900", style: "italic", unicodeRange: LATIN_EXT }),
  ];
  const fontSet = document.fonts as unknown as { add: (face: FontFace) => void };
  await Promise.all(
    faces.map(async (f) => {
      await f.load();
      fontSet.add(f);
    }),
  );
};

let started = false;
export const ensureFigtree = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  if (process.env.REMOTION_FONT_SOURCE === "local") {
    const handle = delayRender("Loading Figtree (local)");
    loadLocal()
      .catch((e) => console.warn("Figtree local load failed", e))
      .finally(() => continueRender(handle));
    return;
  }
  loadFont("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
};

ensureFigtree();
