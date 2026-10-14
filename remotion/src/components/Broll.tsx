import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Broll as BrollT, Edit } from "../lib/types";
import { Feed } from "./broll/Feed";
import { Search } from "./broll/Search";
import { Website } from "./broll/Website";
import { Dashboard } from "./broll/Dashboard";

const Generated: React.FC<{ b: BrollT }> = ({ b }) => {
  switch (b.id) {
    case "feed": return <Feed b={b} />;
    case "search": return <Search b={b} />;
    case "website": return <Website b={b} />;
    case "dashboard": return <Dashboard b={b} />;
    default: return null;
  }
};

/** Full-frame inserts over the talking head; captions stay on top of them. */
export const Broll: React.FC<{ edit: Edit }> = ({ edit }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const b = edit.broll.find((x) => t >= x.start && t < x.end);
  if (!b) return null;
  const from = Math.round(b.start * fps);
  const dur = Math.round((b.end - b.start) * fps);
  return (
    <AbsoluteFill>
      {b.src ? (
        <Sequence from={from} durationInFrames={dur} layout="none">
          <OffthreadVideo src={staticFile(b.src)} muted style={{ width, height, objectFit: "cover" }} />
        </Sequence>
      ) : (
        <Generated b={b} />
      )}
    </AbsoluteFill>
  );
};
