import { Config } from "@remotion/cli/config";

// Rendering settings shared by preview and final renders.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
// The container has no network access to download Chrome Headless Shell,
// so we point Remotion at the Chromium that ships with Playwright.
import { existsSync } from "node:fs";
const localHeadlessShell = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browser = process.env.REMOTION_BROWSER ?? (existsSync(localHeadlessShell) ? localHeadlessShell : null);
if (browser) {
  Config.setBrowserExecutable(browser);
}
Config.setChromiumOpenGlRenderer("swangle");
Config.setConcurrency(3);
