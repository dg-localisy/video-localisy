export type Word = {
  text: string;
  start: number; // seconds
  end: number;
  accent?: boolean; // keyword → accent colour / heavier weight
};

export type CaptionGroup = {
  start: number;
  end: number;
  words: Word[];
  style?: "normal" | "question" | "big";
};

export type Shot = {
  start: number;
  end: number;
  zoomFrom: number;
  zoomTo: number;
};

export type Transition = { at: number; type: "zoomblur" | "flash" };

export type Title =
  | { type: "year"; text: string; start: number; end: number }
  | { type: "number"; value: number; suffix: string; start: number; end: number; label?: string };

export type ListOverlay = {
  start: number;
  end: number;
  items: { text: string; at: number }[];
};

export type SfxCue = { src: string; at: number; gain: number };

export type Edit = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  accent: string;
  face: { cx: number; cy: number }; // normalised anchor for punch-ins
  safe: { top: number; bottom: number };
  footage: { src: string };
  voice: { src: string; gain: number };
  music: { src: string; gain: number };
  shots: Shot[];
  transitions: Transition[];
  captions: CaptionGroup[];
  titles: Title[];
  list: ListOverlay | null;
  progressBar: boolean;
  cta: { enabled: boolean; text: string; sub?: string; start: number };
  sfx: SfxCue[];
};
