export type Word = { text: string; start: number; end: number };

export type Size = "xs" | "s" | "m" | "l" | "xl";

export type StackWord = Word & {
  size: Size;
  bold?: boolean;
  countUp?: number; // animated number (the text is the final value)
  suffix?: string;
};

/** Regular caption: 1-4 words shown together, white, no background. */
export type CaptionGroup = { start: number; end: number; words: Word[] };

/** Typographic composition: lines of words with mixed sizes, revealed word by word. */
export type Stack = { start: number; end: number; lines: StackWord[][] };

export type Shot = { start: number; end: number; zoomFrom: number; zoomTo: number };

export type Transition = { at: number; type: "lightleak" | "zoomblur" | "flash" };

export type SfxCue = { src: string; at: number; gain: number };

export type Edit = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  accent: string;
  face: { cx: number; cy: number };
  safe: { top: number; bottom: number };
  text: { centerY: number; captionSize: number; sizes: Record<Size, number> };
  footage: { src: string };
  voice: { src: string; gain: number };
  music: { src: string; gain: number };
  shots: Shot[];
  transitions: Transition[];
  captions: CaptionGroup[];
  stacks: Stack[];
  progressBar: boolean;
  cta: { enabled: boolean; text: string; sub?: string; start: number };
  sfx: SfxCue[];
};
