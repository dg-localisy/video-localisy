import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit } from "../lib/types";

/** Warm light leak on section changes (2 frames in, 6 frames out). */
export const TransitionFx: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let opacity = 0;
  let drift = 0;
  for (const tr of edit.transitions) {
    if (tr.type !== "lightleak" && tr.type !== "flash") continue;
    const d = t - tr.at;
    if (d >= -2 / fps && d <= 6 / fps) {
      const o = interpolate(d, [-2 / fps, 0, 6 / fps], [0, 0.92, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (o > opacity) {
        opacity = o;
        drift = interpolate(d, [-2 / fps, 6 / fps], [-12, 10]);
      }
    }
  }
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "screen" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${35 + drift}% 42%, rgba(255,252,246,1) 0%, rgba(255,222,180,0.85) 28%, rgba(255,170,130,0.45) 52%, rgba(255,140,110,0) 78%)`,
        }}
      />
    </AbsoluteFill>
  );
};
