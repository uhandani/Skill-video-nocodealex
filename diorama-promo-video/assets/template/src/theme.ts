import { loadFont as loadTitle } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadSerif } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadUi } from "@remotion/google-fonts/Inter";
import type { CharacterSpec, Theme } from "./types";

export const TITLE_FONT = loadTitle("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const SERIF_FONT = loadSerif("normal", { weights: ["900"], subsets: ["latin"] }).fontFamily;
export const UI_FONT = loadUi("normal", { weights: ["400", "600", "800"], subsets: ["latin"] }).fontFamily;

export const DEFAULT_THEME: Theme = {
  character: "#de7350",
  paper: "#c9694c",
  paperText: "#fbefe2",
  banner: "#efe4cf",
  accent: "#2f6fe0",
  wood: "#6b3b22",
  wall: "#1f2a63",
  curtain: "#5b1820",
};

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
