import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import type { Edit } from "./lib/types";
import { Footage } from "./components/Footage";
import { Broll } from "./components/Broll";
import { Captions } from "./components/Captions";
import { ProgressBar } from "./components/ProgressBar";
import { TransitionFx } from "./components/TransitionFx";
import { EndCard } from "./components/EndCard";
import { FONT } from "./lib/font";

export const Clip: React.FC<{ edit: Edit }> = ({ edit }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0a0e", fontFamily: FONT }}>
      <Footage edit={edit} />
      <Broll edit={edit} />
      <TransitionFx edit={edit} />
      <Captions edit={edit} />
      {edit.progressBar ? <ProgressBar edit={edit} /> : null}
      {edit.cta.enabled ? <EndCard edit={edit} /> : null}

      {/* ---- audio: voice, ducked music, sound design */}
      <Audio src={staticFile(edit.voice.src)} volume={edit.voice.gain} />
      <Audio src={staticFile(edit.music.src)} volume={edit.music.gain} />
      {edit.sfx.map((cue, i) => (
        <Sequence key={i} from={Math.round(cue.at * fps)} layout="none">
          <Audio src={staticFile(cue.src)} volume={cue.gain} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
