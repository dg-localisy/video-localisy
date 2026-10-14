import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit } from "../lib/types";

/** Thin progress line just under the top safe zone. */
export const ProgressBar: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const p = Math.min(1, frame / (durationInFrames - 1));
  const margin = 44;
  return (
    <div style={{ position: "absolute", left: margin, right: margin, top: edit.safe.top + 10, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
      <div style={{ width: (width - 2 * margin) * p, height: "100%", background: edit.accent, borderRadius: 3 }} />
    </div>
  );
};
