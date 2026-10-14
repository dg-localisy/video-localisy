import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_OUT } from "../../lib/motion";
import { FONT } from "../../lib/font";

/** Shared stage for the generated inserts: dark plum background with the set's pink glow, soft entrance. */
export const Stage: React.FC<{ start: number; children: React.ReactNode }> = ({ start, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame - Math.round(start * fps), [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: "#17121c", background: "radial-gradient(ellipse at 50% 30%, #3b2036 0%, #1c1322 48%, #0f0b13 100%)" }}>
      <div style={{ position: "absolute", left: 540, top: 420, width: 1200, height: 900, marginLeft: -600, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(236,120,190,0.28) 0%, rgba(236,120,190,0) 65%)" }} />
      <AbsoluteFill style={{ opacity: p, transform: `scale(${(1.05 - 0.05 * p).toFixed(4)})`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Bar: React.FC<{ w: number; h?: number; color?: string; radius?: number; style?: React.CSSProperties }> = ({ w, h = 14, color = "#e6e1ea", radius = 7, style }) => (
  <div style={{ width: w, height: h, background: color, borderRadius: radius, ...style }} />
);

export const ImageIcon: React.FC<{ size?: number; color?: string }> = ({ size = 64, color = "rgba(255,255,255,0.55)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-8 9" />
  </svg>
);

export const sec = (s: number, fps: number) => Math.round(s * fps);
