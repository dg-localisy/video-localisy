import { Easing, interpolate } from "remotion";

// House easing: cubic-bezier(0.22, 1, 0.36, 1) — fast start, soft landing.
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN = Easing.bezier(0.64, 0, 0.78, 0);

/** 0 → 1 progress between two frames, clamped, with the house easing. */
export const easeIn = (frame: number, start: number, durationFrames: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** 1 → 0 progress for exits (faster, ease-in). */
export const easeOut = (frame: number, end: number, durationFrames: number, easing = EASE_IN) =>
  interpolate(frame, [end - durationFrames, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const sec = (s: number, fps: number) => Math.round(s * fps);
