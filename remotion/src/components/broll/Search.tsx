import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_OUT } from "../../lib/motion";
import { Stage } from "./Frame";
import type { Broll } from "../../lib/types";

/** "des milliers de recherches tous les jours, toutes les heures" — queries typing themselves, a counter climbing. */
const QUERIES = [
  ["agence marketing namur", ["avis", "prix", "près de moi", "vidéo"]],
  ["garage voiture occasion liège", ["pas cher", "avis", "ouvert dimanche", "financement"]],
  ["plombier urgence bruxelles", ["24h", "prix", "avis", "devis"]],
  ["restaurant terrasse mons", ["réservation", "menu", "avis", "ouvert"]],
  ["coiffeur charleroi", ["sans rendez-vous", "prix", "avis", "horaires"]],
] as const;

export const Search: React.FC<{ b: Broll }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - Math.round(b.start * fps);
  const dur = Math.round((b.end - b.start) * fps);
  const per = dur / QUERIES.length; // frames per query
  const qi = Math.min(QUERIES.length - 1, Math.floor(Math.max(0, f - 4) / per));
  const local = Math.max(0, f - 4) - qi * per;
  const [query, suggestions] = QUERIES[qi];
  const typed = Math.min(query.length, Math.floor(interpolate(local, [0, per * 0.55], [0, query.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const text = query.slice(0, typed);
  const caret = Math.floor(f / 8) % 2 === 0;
  const drop = interpolate(local, [per * 0.3, per * 0.3 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const count = Math.round(interpolate(f, [0, dur], [840, 24712], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");
  return (
    <Stage start={b.start}>
      <div style={{ position: "absolute", left: 90, top: 470, width: 900 }}>
        <div style={{ height: 124, borderRadius: 62, background: "#ffffff", boxShadow: "0 30px 70px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", padding: "0 38px", gap: 22 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <div style={{ fontSize: 44, fontWeight: 500, color: "#1f1f1f", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
            {text}
            <span style={{ display: "inline-block", width: 3, height: 46, background: "#1f1f1f", marginLeft: 3, verticalAlign: "-8px", opacity: caret ? 1 : 0 }} />
          </div>
        </div>
        <div style={{ marginTop: 14, borderRadius: 30, background: "#ffffff", boxShadow: "0 30px 70px rgba(0,0,0,0.35)", padding: "14px 0", opacity: drop, transform: `translateY(${(1 - drop) * -14}px)` }}>
          {suggestions.map((sug, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 40px", fontSize: 36, color: "#3c4043" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <span><span style={{ fontWeight: 600, color: "#1f1f1f" }}>{query}</span> {sug}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ fontSize: 112, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>{fmt(count)}</div>
        <div style={{ fontSize: 36, fontWeight: 500, color: "rgba(255,255,255,0.72)", marginTop: 10 }}>recherches cette heure</div>
      </div>
    </Stage>
  );
};
