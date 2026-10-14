import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_OUT } from "../../lib/motion";
import { Bar, ImageIcon, Stage } from "./Frame";
import type { Broll } from "../../lib/types";

/** "ce que leur site internet leur apporte" — a website mock-up whose results are question marks. */
const CHIPS = [
  { label: "Visites", at: 18.96 },
  { label: "Leads", at: 19.44 },
  { label: "Ventes", at: 19.72 },
];

export const Website: React.FC<{ b: Broll }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const W = 860;
  return (
    <Stage start={b.start}>
      <div style={{ position: "absolute", left: 540 - W / 2, top: 250, width: W, borderRadius: 28, background: "#ffffff", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ height: 64, background: "#f1f0f4", display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 18, flex: 1, height: 34, borderRadius: 17, background: "#ffffff", display: "flex", alignItems: "center", padding: "0 16px", fontSize: 20, color: "#6b6b76" }}>www.votre-entreprise.be</div>
        </div>
        <div style={{ padding: "26px 34px 34px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Bar w={120} h={18} color="#1d1b22" radius={9} />
            <div style={{ display: "flex", gap: 18 }}>{[60, 48, 72].map((w, i) => <Bar key={i} w={w} h={12} color="#c9c6d1" />)}</div>
          </div>
          <div style={{ marginTop: 34, display: "flex", gap: 26, alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <Bar w={340} h={26} color="#1d1b22" radius={10} />
              <Bar w={280} h={26} color="#1d1b22" radius={10} />
              <Bar w={300} h={12} color="#c9c6d1" style={{ marginTop: 8 }} />
              <Bar w={240} h={12} color="#c9c6d1" />
              <div style={{ marginTop: 14, width: 150, height: 44, borderRadius: 22, background: "#e39ac6" }} />
            </div>
            <div style={{ width: 290, height: 220, borderRadius: 18, background: "linear-gradient(135deg, #e3c0d6 0%, #b78fb0 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ImageIcon size={60} />
            </div>
          </div>
          <div style={{ marginTop: 34, display: "flex", gap: 20 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, borderRadius: 18, background: "#f6f5f8", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ height: 90, borderRadius: 12, background: "#e4e1ea" }} />
                <Bar w={120} h={12} color="#1d1b22" />
                <Bar w={160} h={10} color="#c9c6d1" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", gap: 22 }}>
        {CHIPS.map((c) => {
          const p = interpolate((t - c.at) * fps, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
          const pulse = 1 + 0.06 * Math.sin((t - c.at) * 9);
          if (t < c.at) return null;
          return (
            <div key={c.label} style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${(0.9 + 0.1 * p).toFixed(3)})`, background: "#ffffff", borderRadius: 24, padding: "18px 30px", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 24px 50px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 34, fontWeight: 600, color: "#3c3a44" }}>{c.label}</div>
              <div style={{ fontSize: 56, fontWeight: 800, color: "#d9478f", lineHeight: 1, transform: `scale(${pulse.toFixed(3)})` }}>?</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
