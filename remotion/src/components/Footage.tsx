import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit } from "../lib/types";
import { EASE_OUT } from "../lib/motion";

/**
 * The single take, with beat-aligned punch-ins (105-115 %) anchored on the
 * face so the subject stays centred, plus the zoom-blur / flash transitions.
 */
export const Footage: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const shot = edit.shots.find((s) => t >= s.start && t < s.end) ?? edit.shots[edit.shots.length - 1];
  const p = interpolate(t, [shot.start, shot.end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let zoom = shot.zoomFrom + (shot.zoomTo - shot.zoomFrom) * p;
  // tiny settle on each cut: the punch-in lands 2 % above and eases into place over 8 frames
  const sinceCut = t - shot.start;
  const settle = interpolate(sinceCut, [0, 8 / fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  zoom *= 1 + 0.02 * settle;

  // transitions: zoom-blur (outgoing shot zooms + blurs, incoming settles from blur) / flash (handled in TransitionFx)
  let blur = 0;
  let extraScale = 1;
  for (const tr of edit.transitions) {
    if (tr.type !== "zoomblur") continue;
    const d = t - tr.at;
    if (d < 0 && d > -4 / fps) {
      const k = interpolate(d, [-4 / fps, 0], [0, 1]);
      extraScale = 1 + 0.22 * k * k;
      blur = 10 * k;
    } else if (d >= 0 && d < 5 / fps) {
      const k = interpolate(d, [0, 5 / fps], [1, 0], { easing: EASE_OUT });
      blur = 7 * k;
      extraScale = 1 + 0.04 * k;
    }
  }
  const originX = edit.face.cx * width;
  const originY = edit.face.cy * height;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${(zoom * extraScale).toFixed(4)})`,
          transformOrigin: `${originX}px ${originY}px`,
          filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        }}
      >
        <OffthreadVideo src={staticFile(edit.footage.src)} muted style={{ width, height, objectFit: "cover" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
