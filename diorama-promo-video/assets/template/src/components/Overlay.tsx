import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SERIF_FONT, TITLE_FONT, UI_FONT } from "../theme";
import type { CaptionWord } from "../types";
import { pop, rand, useVideo } from "./anim";

const Tape: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      width: 110,
      height: 42,
      background: "rgba(232, 220, 186, 0.85)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
      clipPath: "polygon(3% 8%, 97% 0, 100% 92%, 0 100%)",
      ...style,
    }}
  />
);

/** Taped paper banner with the scene headline. Slaps in at scene start. */
export const TapeBanner: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideo();
  const p = pop(frame, fps, 0, 13);
  const len = text.length;
  // fit ~840px of text width (Archivo Black caps ≈ 0.72em per char)
  const fontSize = Math.min(66, Math.floor(840 / (len * 0.72)));
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 70,
        right: 70,
        display: "flex",
        justifyContent: "center",
        scale: `${0.85 + 0.15 * p}`,
        opacity: Math.min(1, p * 1.5),
        rotate: "-1.2deg",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "26px 46px 22px",
          background: theme.banner,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0 2px, transparent 2px 5px)",
          boxShadow: "0 14px 24px rgba(0,0,0,0.45)",
          clipPath: "polygon(0 4%, 2% 0, 98% 2%, 100% 0, 99% 96%, 100% 100%, 1% 97%, 0 100%)",
          fontFamily: TITLE_FONT,
          fontSize,
          color: "#16131a",
          letterSpacing: -1,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      <Tape style={{ left: 30, top: -12, rotate: "-28deg" }} />
      <Tape style={{ right: 30, top: -12, rotate: "30deg" }} />
    </div>
  );
};

/** Score-board badge under the banner (e.g. "OPINIONS 5", "FEE $0"). */
export const Counter: React.FC<{ label?: string; value: string; delay?: number; bumpAt?: number }> = ({ label, value, delay = 6, bumpAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay);
  // bumpAt = frame when the value last changed -> quick punch
  const since = bumpAt === undefined ? 99 : frame - bumpAt;
  const bump = since >= 0 && since < 10 ? 1 + 0.35 * Math.sin((since / 10) * Math.PI) : 1;
  const color = /^[x×]/i.test(value) ? "#d0432f" : "#2a9a4a";
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        right: 90,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "16px 30px",
        background: "#f4efe6",
        border: "5px solid #1b1720",
        borderRadius: 16,
        boxShadow: "0 10px 0 #1b1720, 0 18px 30px rgba(0,0,0,0.4)",
        rotate: "2deg",
        scale: `${p}`,
      }}
    >
      {label ? (
        <span style={{ fontFamily: UI_FONT, fontWeight: 800, fontSize: 30, color: "#1b1720", letterSpacing: 1 }}>{label.toUpperCase()}</span>
      ) : null}
      <span style={{ fontFamily: TITLE_FONT, fontSize: 64, lineHeight: 1, color, scale: `${bump}` }}>{value}</span>
    </div>
  );
};

/** Word-by-word captions on torn paper scraps, three words per group (like the reference). */
export const PaperCaptions: React.FC<{ words: CaptionWord[]; perGroup?: number; top?: number }> = ({ words, perGroup = 3, top = 1460 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideo();
  const t = frame / fps;
  if (words.length === 0) return null;
  // current word = last started
  let cur = -1;
  for (let i = 0; i < words.length; i++) if (words[i].start <= t) cur = i;
  if (cur < 0) return null;
  const g = Math.floor(cur / perGroup);
  const group = words.slice(g * perGroup, g * perGroup + perGroup);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 14,
      }}
    >
      {group.map((w, i) => {
        const idx = g * perGroup + i;
        if (idx > cur) return null;
        const startFrame = Math.round(w.start * fps);
        const p = pop(frame, fps, startFrame, 10);
        const r = (rand(idx + 3) - 0.5) * 7;
        const active = idx === cur;
        return (
          <div
            key={idx}
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 900,
              fontSize: 76,
              lineHeight: 1,
              color: theme.paperText,
              background: theme.paper,
              backgroundImage: "repeating-linear-gradient(100deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 6px)",
              padding: "12px 20px 16px",
              clipPath: `polygon(0 ${4 + rand(idx) * 8}%, ${30 + rand(idx + 1) * 10}% 0, 100% ${rand(idx + 2) * 10}%, ${98 - rand(idx + 4) * 3}% 100%, ${40}% ${94 + rand(idx + 5) * 6}%, 1% 96%)`,
              boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
              rotate: `${r}deg`,
              scale: `${(0.6 + 0.4 * p) * (active ? 1.06 : 1)}`,
              translate: `0 ${(1 - p) * 30}px`,
              filter: active ? "brightness(1.08)" : "brightness(0.95)",
              textShadow: "0 3px 0 rgba(0,0,0,0.25)",
            }}
          >
            {w.word.replace(/[.,!?;:]+$/, "")}
          </div>
        );
      })}
    </div>
  );
};
