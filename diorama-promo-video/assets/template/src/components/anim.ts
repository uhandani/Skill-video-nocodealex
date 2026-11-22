import { createContext, useContext } from "react";
import { Easing, interpolate, spring } from "remotion";
import { DEFAULT_CREW, DEFAULT_THEME } from "../theme";
import type { Brand, CharacterSpec, Theme } from "../types";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 ease-out between two frames. */
export const ramp = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });

/** Bouncy 0→1 (overshoots) starting at `delay` frames. */
export const pop = (frame: number, fps: number, delay = 0, damping = 11) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 170, mass: 0.7 } });

export type Ctx = { theme: Theme; brand: Brand; crew: CharacterSpec[] };
export const VideoCtx = createContext<Ctx>({
  theme: DEFAULT_THEME,
  brand: { cardTitle: "YOUR PROFILE", cardBadge: "in", cardName: "Your Name" },
  crew: DEFAULT_CREW,
});
export const useVideo = () => useContext(VideoCtx);

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
