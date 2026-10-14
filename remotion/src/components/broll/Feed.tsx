import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Easing } from "remotion";
import { Bar, ImageIcon, Stage } from "./Frame";
import type { Broll } from "../../lib/types";

/** "des photos et des posts statiques" — a phone feed of static image posts, scrolling slowly. */
const POSTS = [
  { grad: "linear-gradient(135deg, #d9a7c7 0%, #b784a7 100%)", name: 110 },
  { grad: "linear-gradient(135deg, #a3b8d8 0%, #6f86b3 100%)", name: 150 },
  { grad: "linear-gradient(135deg, #e8cfa9 0%, #c9a46f 100%)", name: 90 },
  { grad: "linear-gradient(135deg, #bfd5c9 0%, #86aa98 100%)", name: 130 },
];

export const Feed: React.FC<{ b: Broll }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - Math.round(b.start * fps);
  const dur = Math.round((b.end - b.start) * fps);
  const scroll = interpolate(f, [8, dur], [0, -520], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const W = 470;
  return (
    <Stage start={b.start}>
      <div style={{ position: "absolute", left: 540 - W / 2, top: 200, width: W, height: 880, borderRadius: 58, background: "#15121a", padding: 12, boxShadow: "0 40px 90px rgba(0,0,0,0.55)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 48, background: "#ffffff", overflow: "hidden", position: "relative" }}>
          <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #eee" }}>
            <Bar w={92} h={16} color="#1a1a1a" radius={8} />
            <div style={{ display: "flex", gap: 12 }}><Bar w={18} h={18} color="#1a1a1a" radius={9} /><Bar w={18} h={18} color="#1a1a1a" radius={9} /></div>
          </div>
          <div style={{ transform: `translateY(${scroll}px)` }}>
            {POSTS.map((p, i) => (
              <div key={i} style={{ padding: "16px 0 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 12px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 17, background: p.grad }} />
                  <Bar w={p.name} h={12} color="#2a2a2a" />
                </div>
                <div style={{ height: 330, background: p.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ImageIcon size={72} />
                </div>
                <div style={{ display: "flex", gap: 16, padding: "14px 20px 8px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" /></svg>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z" /></svg>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                </div>
                <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <Bar w={W - 80} h={11} color="#d9d9de" />
                  <Bar w={W - 160} h={11} color="#e6e6ea" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
};
