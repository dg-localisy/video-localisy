import React from "react";
import { Composition } from "remotion";
import { Clip } from "./Clip";
import edit from "./data/edit.json";
import type { Edit } from "./lib/types";

const data = edit as unknown as Edit;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Clip9x16"
        component={Clip}
        durationInFrames={data.durationInFrames}
        fps={data.fps}
        width={data.width}
        height={data.height}
        defaultProps={{ edit: data }}
      />
    </>
  );
};
