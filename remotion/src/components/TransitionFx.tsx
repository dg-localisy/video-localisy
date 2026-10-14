import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit } from "../lib/types";

/** Warm white flash on section changes: 2 frames up, 5 frames down (~230 ms). */
export const TransitionFx: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let opacity = 0;
  for (const tr of edit.transitions) {
    if (tr.type !== "flash") continue;
    const d = t - tr.at;
    if (d >= -2 / fps && d <= 5 / fps) {
      const o = interpolate(d, [-2 / fps, 0, 5 / fps], [0, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      opacity = Math.max(opacity, o);
    }
  }
  if (opacity <= 0.001) return null;
  return <AbsoluteFill style={{ backgroundColor: "#fff6e6", opacity, pointerEvents: "none" }} />;
};
