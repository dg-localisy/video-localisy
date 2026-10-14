import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_OUT } from "../../lib/motion";
import { Bar, Stage } from "./Frame";
import type { Broll } from "../../lib/types";

/** "pas de monitoring, pas d'analyse" — an analytics dashboard with nothing in it. */
export const Dashboard: React.FC<{ b: Broll }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - Math.round(b.start * fps);
  const t = frame / fps;
  const line = interpolate(f, [4, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const W = 880;
  const cards = [
    { label: "Monitoring", value: "inactif", at: 28.68 },
    { label: "Analyse", value: "aucune", at: 29.72 },
  ];
  return (
    <Stage start={b.start}>
      <div style={{ position: "absolute", left: 540 - W / 2, top: 250, width: W, borderRadius: 30, background: "#1b1724", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", padding: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#ffffff" }}>Analytics</div>
          <div style={{ display: "flex", gap: 14 }}>{[70, 70, 70].map((w, i) => <Bar key={i} w={w} h={30} color="rgba(255,255,255,0.08)" radius={15} />)}</div>
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 18 }}>
          {["Visites", "Leads", "Ventes"].map((k) => (
            <div key={k} style={{ flex: 1, borderRadius: 18, background: "rgba(255,255,255,0.05)", padding: "18px 22px" }}>
              <div style={{ fontSize: 24, color: "rgba(255,255,255,0.55)" }}>{k}</div>
              <div style={{ fontSize: 44, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>—</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22, height: 300, borderRadius: 18, background: "rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>
          {[0.25, 0.5, 0.75].map((y) => <div key={y} style={{ position: "absolute", left: 0, right: 0, top: `${y * 100}%`, height: 1, background: "rgba(255,255,255,0.07)" }} />)}
          <svg width={W - 72} height={300} style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={30} y1={230} x2={30 + (W - 132) * line} y2={230} stroke="rgba(255,255,255,0.5)" strokeWidth={4} strokeDasharray="14 12" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 112, textAlign: "center", fontSize: 36, fontWeight: 600, color: "rgba(255,255,255,0.6)", opacity: line }}>Aucune donnée</div>
        </div>
        <div style={{ marginTop: 22, display: "flex", gap: 18 }}>
          {cards.map((c) => {
            const p = interpolate((t - c.at) * fps, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
            return (
              <div key={c.label} style={{ flex: 1, borderRadius: 18, background: "rgba(255,255,255,0.05)", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: "#d9478f", boxShadow: "0 0 18px rgba(217,71,143,0.8)" }} />
                  <div style={{ fontSize: 30, fontWeight: 600, color: "#ffffff" }}>{c.label}</div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>{c.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};
