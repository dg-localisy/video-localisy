import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit } from "../lib/types";
import { EASE_OUT } from "../lib/motion";

/** Optional call-to-action line fading in over the frozen last frame. */
export const EndCard: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.round(edit.cta.start * fps);
  if (frame < s) return null;
  const enter = interpolate(frame, [s, s + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "flex-end", alignItems: "center" }}>
      <div style={{ marginBottom: edit.safe.bottom + 60, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)`, textAlign: "center" }}>
        <div style={{ fontSize: 60, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", textShadow: "0 6px 24px rgba(0,0,0,0.4)" }}>{edit.cta.text}</div>
        {edit.cta.sub ? <div style={{ fontSize: 40, fontWeight: 500, color: edit.accent, marginTop: 8 }}>{edit.cta.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
