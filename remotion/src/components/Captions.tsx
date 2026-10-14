import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Edit } from "../lib/types";
import { TextStack } from "./TextStack";

/** Regular captions and typographic stacks share the same renderer and the same zone under the chin. */
export const Captions: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const caption = edit.captions.find((c) => t >= c.start - 0.05 && t < c.end);
  const stack = edit.stacks.find((s) => t >= s.start - 0.05 && t < s.end);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {caption ? (
        <TextStack
          key={`c${caption.start}`}
          edit={edit}
          caption
          end={caption.end}
          lines={[caption.words.map((w) => ({ ...w, start: caption.start, size: "s" as const }))]}
        />
      ) : null}
      {stack ? <TextStack key={`s${stack.start}`} edit={edit} end={stack.end} lines={stack.lines} /> : null}
    </AbsoluteFill>
  );
};
