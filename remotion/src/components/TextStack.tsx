import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { FONT } from "../lib/font";
import { EASE_OUT } from "../lib/motion";
import type { Edit, StackWord } from "../lib/types";

/**
 * Typographic stack (modelled on the reference clip): white words with mixed
 * sizes, no background, each word blurring in on its timestamp while the whole
 * block re-centres itself. Also used for regular captions (one line, one size).
 */
const LEAD = 0.04; // s: a word shows slightly before it is heard
const ENTER = 5; // frames of blur-in
const SHIFT = 5; // frames to re-centre when a word is added
const GAP = 0.27; // gap between words, fraction of the larger font size
const LINE_GAP = 8; // px between lines
const SHADOW = "0 3px 8px rgba(0,0,0,0.55), 0 0 26px rgba(0,0,0,0.28)";

type Sized = StackWord & { id: string; px: number; weight: number; tracking: string; width: number; finalText: string };

const widthCache = new Map<string, number>();
const widthOf = (text: string, px: number, weight: number, tracking: string) => {
  const key = `${text}|${px}|${weight}|${tracking}`;
  const cached = widthCache.get(key);
  if (cached !== undefined) return cached;
  const w = measureText({ text, fontFamily: FONT, fontSize: px, fontWeight: weight, letterSpacing: tracking }).width;
  const loaded = typeof document !== "undefined" && document.fonts && document.fonts.check(`${weight} ${px}px ${FONT}`);
  if (loaded) widthCache.set(key, w);
  return w;
};

const layout = (lines: Sized[][], revealed: Set<string>) => {
  const blocks = lines.map((line) => line.filter((w) => revealed.has(w.id)));
  const heights = blocks.map((b) => (b.length ? Math.max(...b.map((w) => w.px)) * 1.02 : 0));
  const total = heights.reduce((a, h, i) => a + h + (h && i ? LINE_GAP : 0), 0);
  const pos: Record<string, { x: number; y: number }> = {};
  let top = -total / 2;
  blocks.forEach((b, li) => {
    if (!b.length) return;
    const maxPx = Math.max(...b.map((w) => w.px));
    const width = b.reduce((acc, w, k) => acc + w.width + (k ? GAP * Math.max(w.px, b[k - 1].px) : 0), 0);
    let x = -width / 2;
    b.forEach((w, k) => {
      if (k) x += GAP * Math.max(w.px, b[k - 1].px);
      pos[w.id] = { x, y: top + (maxPx - w.px) * 0.9 };
      x += w.width;
    });
    top += heights[li] + LINE_GAP;
  });
  return { pos, total };
};

export const TextStack: React.FC<{ edit: Edit; lines: StackWord[][]; end: number; caption?: boolean }> = ({ edit, lines, end, caption }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  if (t >= end) return null;

  const sized: Sized[][] = lines.map((line, li) =>
    line.map((w, wi) => {
      const px = caption ? edit.text.captionSize : edit.text.sizes[w.size];
      const weight = caption ? 500 : w.bold ? (w.size === "xl" ? 800 : 700) : 500;
      const tracking = w.size === "l" || w.size === "xl" ? "-0.02em" : "0em";
      const finalText = w.countUp !== undefined ? `${w.countUp}${w.suffix ?? ""}` : w.text;
      return { ...w, id: `${li}-${wi}`, px, weight, tracking, finalText, width: widthOf(finalText, px, weight, tracking) };
    }),
  );
  const all = sized.flat();
  const events = Array.from(new Set(all.map((w) => w.start - LEAD))).sort((a, b) => a - b);
  const past = events.filter((e) => e <= t);
  if (!past.length) return null;
  const last = past[past.length - 1];
  const cur = new Set(all.filter((w) => w.start - LEAD <= last).map((w) => w.id));
  const prev = new Set(all.filter((w) => w.start - LEAD < last).map((w) => w.id));
  const shift = interpolate((t - last) * fps, [0, SHIFT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const L1 = layout(sized, cur);
  const L0 = layout(sized, prev);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height: "100%", pointerEvents: "none" }}>
      {all
        .filter((w) => cur.has(w.id))
        .map((w) => {
          const target = L1.pos[w.id];
          let from = L0.pos[w.id];
          if (!from) {
            // New word: it slides with its line (and with the block vertically) instead of
            // popping at its final position while the older words are still moving.
            const li = Number(w.id.split("-")[0]);
            const lineMate = sized[li].find((o) => prev.has(o.id));
            const anyOld = all.find((o) => prev.has(o.id));
            const dx = lineMate ? L0.pos[lineMate.id].x - L1.pos[lineMate.id].x : 0;
            const dy = anyOld ? L0.pos[anyOld.id].y - L1.pos[anyOld.id].y : 0;
            from = { x: target.x + dx, y: target.y + dy };
          }
          const x = from.x + (target.x - from.x) * shift;
          const y = from.y + (target.y - from.y) * shift;
          const enter = interpolate((t - (w.start - LEAD)) * fps, [0, ENTER], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
          const blur = (1 - enter) * 12;
          const scale = 1 + (1 - enter) * 0.08;
          let text = w.text;
          if (w.countUp !== undefined) {
            const c = interpolate((t - (w.start - LEAD)) * fps, [0, 8], [0, w.countUp], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            text = `${Math.round(c)}${w.suffix ?? ""}`;
          }
          return (
            <div
              key={w.id}
              style={{
                position: "absolute",
                left: width / 2 + x,
                top: edit.text.centerY + y,
                width: w.width,
                fontFamily: FONT,
                fontSize: w.px,
                fontWeight: w.weight,
                letterSpacing: w.tracking,
                lineHeight: 1,
                color: "#ffffff",
                whiteSpace: "nowrap",
                textAlign: w.countUp !== undefined ? "right" : "left",
                fontVariantNumeric: "tabular-nums",
                textShadow: SHADOW,
                opacity: enter,
                filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
                transform: `scale(${scale.toFixed(3)})`,
                transformOrigin: "50% 60%",
              }}
            >
              {text}
            </div>
          );
        })}
    </div>
  );
};
