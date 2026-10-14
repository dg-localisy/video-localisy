import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit } from "../lib/types";
import { EASE_IN, EASE_OUT } from "../lib/motion";

/** Stacked list that builds up item by item (upper-right, away from the face). */
export const ListOverlay: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const list = edit.list!;
  const s = Math.round(list.start * fps);
  const e = Math.round(list.end * fps);
  if (frame < s || frame > e) return null;
  const exit = interpolate(frame, [e - 5, e], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", right: 70, top: 250, display: "flex", flexDirection: "column", gap: 22, opacity: exit, alignItems: "flex-end" }}>
        {list.items.map((it, i) => {
          const f0 = Math.round(it.at * fps);
          const enter = interpolate(frame, [f0, f0 + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
          if (frame < f0) return null;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: enter,
                transform: `translateX(${(1 - enter) * 60}px)`,
                background: "rgba(10, 8, 14, 0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "16px 28px 16px 22px",
                borderRadius: 22,
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: 4, background: edit.accent, transform: `scale(${0.6 + 0.4 * enter})` }} />
              <div style={{ fontSize: 50, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
