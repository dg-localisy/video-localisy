// Renders the key frames used for visual QC into ../preview (full-resolution PNG).
// Bundles the project once, then renders every frame listed below.
// Usage: node scripts/stills.mjs [outDir]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] ?? path.resolve("..", "preview"));
mkdirSync(out, { recursive: true });
const fps = 30;
const frames = [
  ["01_hook_0.6s", 0.6],
  ["02_eclate_2.9s", 2.9],
  ["03_2015_9.3s", 9.3],
  ["04_90pct_20.9s", 20.9],
  ["05_question_22.6s", 22.6],
  ["06_aucune_idee_26.0s", 26.0],
  ["07_liste_29.9s", 29.9],
  ["08_payoff_39.2s", 39.2],
];
const localShell = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = process.env.REMOTION_BROWSER ?? (existsSync(localShell) ? localShell : null);
// REMOTION_* variables must be forwarded explicitly when rendering through the API.
const envVariables = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("REMOTION_")));

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: "Clip9x16", browserExecutable, chromiumOptions: { gl: "swangle" }, envVariables });
for (const [name, t] of frames) {
  const frame = Math.round(t * fps);
  const output = path.join(out, `${name}.png`);
  await renderStill({ composition, serveUrl, output, frame, imageFormat: "png", browserExecutable, chromiumOptions: { gl: "swangle" }, envVariables });
  console.log(`✓ ${name} (frame ${frame})`);
}
