import { loadFont as loadTitle } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadSerif } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadUi } from "@remotion/google-fonts/Inter";
import type { CharacterSpec, PaletteName, Theme } from "./types";

export const TITLE_FONT = loadTitle("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const SERIF_FONT = loadSerif("normal", { weights: ["900"], subsets: ["latin"] }).fontFamily;
export const UI_FONT = loadUi("normal", { weights: ["400", "600", "800"], subsets: ["latin"] }).fontFamily;

/** Grayscale ramp (light -> black) the mono palette is built from. */
export const GRAYS = [
  "#f0f0f0", "#e3e4e6", "#cfd0d2", "#bdbec0", "#a6a7a9", "#929396", "#88898b",
  "#7a7a7c", "#6c6c6e", "#5a5b5d", "#48494b", "#3a3a3a", "#333335", "#231f20", "#000000",
];

export const MONO_THEME: Theme = {
  character: "#bdbec0",
  paper: "#e3e4e6",
  paperText: "#000000",
  banner: "#f0f0f0",
  accent: "#333335",
  wood: "#5a5b5d",
  wall: "#48494b",
  curtain: "#3a3a3a",
  floor: ["#333335", "#0b0b0c"],
  ink: "#000000",
  highlight: "#bdbec0",
  positive: "#000000",
  negative: "#000000",
  signs: ["#000000", "#48494b", "#231f20", "#6c6c6e", "#333335", "#5a5b5d"],
  gift: "#6c6c6e",
  ribbon: "#f0f0f0",
  confetti: ["#f0f0f0", "#cfd0d2", "#a6a7a9", "#7a7a7c", "#48494b", "#000000"],
};

export const WARM_THEME: Theme = {
  character: "#de7350",
  paper: "#c9694c",
  paperText: "#fbefe2",
  banner: "#efe4cf",
  accent: "#2f6fe0",
  wood: "#6b3b22",
  wall: "#1f2a63",
  curtain: "#5b1820",
  floor: ["#2a2140", "#15101f"],
  ink: "#1b1720",
  highlight: "#ffe45c",
  positive: "#2a9a4a",
  negative: "#d0432f",
  signs: ["#d8342b", "#e8662c", "#c3262f", "#8a3fd6", "#2f6fe0", "#2a9a4a"],
  gift: "#2f6fe0",
  ribbon: "#f2c23a",
  confetti: ["#f4efe6", "#e8413c", "#f2b630", "#3d8bf2", "#57c46a", "#de7350"],
};

export const PALETTES: Record<PaletteName, Theme> = { mono: MONO_THEME, warm: WARM_THEME };
export const DEFAULT_THEME = MONO_THEME;

export const DEFAULT_CREW: CharacterSpec[] = [
  { hat: "frosting", accessory: "glasses" },
  { hat: "cap", accessory: "tie" },
  { hat: "headset", accessory: "none" },
  { hat: "frosting", accessory: "bowtie" },
  { hat: "beanie", accessory: "mustache" },
];

/** Darken/lighten a hex color by amount (-1..1). */
export const shade = (hex: string, amt: number): string => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const f = (c: number) => {
    const v = amt < 0 ? c * (1 + amt) : c + (255 - c) * amt;
    return Math.max(0, Math.min(255, Math.round(v)));
  };
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};
