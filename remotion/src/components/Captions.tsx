import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionGroup, Edit } from "../lib/types";
import { EASE_IN, EASE_OUT } from "../lib/motion";

const ENTER_FRAMES = 7; // ~230 ms scale 0.85 → 1
const EXIT_FRAMES = 4;

const Group: React.FC<{ g: CaptionGroup; edit: Edit; t: number; frame: number }> = ({ g, edit, t, frame }) => {
  const { fps } = useVideoConfig();
  const startF = Math.round(g.start * fps);
  const endF = Math.round(g.end * fps);
  const enter = interpolate(frame, [startF, startF + ENTER_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const exit = interpolate(frame, [endF - EXIT_FRAMES, endF], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN });
  const scale = 0.85 + 0.15 * enter;
  const opacity = Math.min(enter, exit);

  const big = g.style === "big";
  const question = g.style === "question";
  const fontSize = big ? 96 : question ? 74 : 66;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        top: big ? 1040 : 1050,
        opacity,
        transform: `scale(${scale.toFixed(3)})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          maxWidth: 940,
          padding: big ? "22px 44px" : "20px 36px",
          borderRadius: 30,
          background: "rgba(10, 8, 14, 0.62)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: big ? 22 : 18,
          rowGap: 4,
          textAlign: "center",
          lineHeight: 1.18,
          letterSpacing: big ? "-0.02em" : "-0.01em",
          borderLeft: question ? `8px solid ${edit.accent}` : undefined,
        }}
      >
        {g.words.map((w, i) => {
          const spoken = t >= w.start - 0.04;
          const current = spoken && t < w.end + 0.06;
          const punch = current ? interpolate(t, [w.start - 0.04, w.start + 0.12], [1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }) : 1;
          const color = w.accent ? edit.accent : "#ffffff";
          const upper = big ? w.text.toUpperCase() : w.text;
          return (
            <span
              key={i}
              style={{
                fontSize,
                fontWeight: w.accent || big ? 800 : 600,
                color,
                opacity: spoken ? 1 : 0.72,
                display: "inline-block",
                transform: `scale(${punch.toFixed(3)})`,
                textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              {upper}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Captions: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const visible = edit.captions.filter((g) => frame >= Math.round(g.start * fps) - 1 && frame < Math.round(g.end * fps) + 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {visible.map((g) => (
        <Group key={g.start} g={g} edit={edit} t={t} frame={frame} />
      ))}
    </AbsoluteFill>
  );
};
