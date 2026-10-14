import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit, Title } from "../lib/types";
import { EASE_IN, EASE_OUT } from "../lib/motion";

/** Large typographic moments placed in the empty upper-right area (never over the face). */
const Year: React.FC<{ t: Extract<Title, { type: "year" }>; edit: Edit }> = ({ t, edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.round(t.start * fps);
  const e = Math.round(t.end * fps);
  const enter = interpolate(frame, [s, s + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const exit = interpolate(frame, [e - 5, e], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN });
  const line = interpolate(frame, [s + 4, s + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <div style={{ position: "absolute", right: 70, top: 250, opacity: Math.min(enter, exit), transform: `translateY(${(1 - enter) * 40}px) scale(${0.9 + 0.1 * enter})`, transformOrigin: "100% 50%", textAlign: "right" }}>
      <div style={{ fontSize: 230, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "#ffffff", textShadow: "0 10px 40px rgba(0,0,0,0.35)" }}>{t.text}</div>
      <div style={{ height: 8, width: 300 * line, background: edit.accent, marginLeft: "auto", marginTop: 14, borderRadius: 4 }} />
    </div>
  );
};

const Number: React.FC<{ t: Extract<Title, { type: "number" }>; edit: Edit }> = ({ t, edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.round(t.start * fps);
  const e = Math.round(t.end * fps);
  const enter = interpolate(frame, [s, s + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const exit = interpolate(frame, [e - 5, e], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN });
  // linear count-up over 8 frames so the final value lands fast and holds (no lingering "89")
  const count = frame >= s + 8 ? t.value : Math.round(interpolate(frame, [s, s + 8], [0, t.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const scale = 1.18 - 0.18 * enter;
  return (
    <div style={{ position: "absolute", right: 70, top: 215, opacity: Math.min(enter, exit), transform: `scale(${scale.toFixed(3)})`, transformOrigin: "100% 30%", textAlign: "right" }}>
      <div style={{ fontSize: 300, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: edit.accent, textShadow: "0 12px 50px rgba(0,0,0,0.4)", fontVariantNumeric: "tabular-nums" }}>
        {count}
        <span style={{ fontSize: 150, fontWeight: 800, marginLeft: 8 }}>{t.suffix}</span>
      </div>
      {t.label ? <div style={{ fontSize: 54, fontWeight: 600, color: "#ffffff", marginTop: 6, letterSpacing: "-0.01em", textShadow: "0 4px 18px rgba(0,0,0,0.4)" }}>{t.label}</div> : null}
    </div>
  );
};

export const Titles: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {edit.titles
        .filter((t) => frame >= Math.round(t.start * fps) && frame <= Math.round(t.end * fps))
        .map((t, i) => (t.type === "year" ? <Year key={i} t={t} edit={edit} /> : <Number key={i} t={t} edit={edit} />))}
    </AbsoluteFill>
  );
};
