import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TITLE_FONT, UI_FONT, shade } from "../theme";
import { Block } from "./Block";
import { pop, rand, ramp, useVideo } from "./anim";

/**
 * The "product" on the desk: a profile/page card. Generic enough for LinkedIn profiles,
 * websites, resumes, apps — text comes from brand.* in video.json.
 * `rewritten` (0..1) turns grey placeholder bars into green-checked lines.
 */
export const ProductCard: React.FC<{
  width?: number;
  rewritten?: number;
  highlightName?: boolean;
  burn?: number;
  style?: React.CSSProperties;
}> = ({ width = 620, rewritten = 0, highlightName = false, burn = 0, style }) => {
  const { theme, brand } = useVideo();
  const s = width / 620;
  const sections = brand.cardSections ?? ["About", "Experience", "Skills"];
  const [btnA, btnB] = brand.cardButtons ?? ["Connect", "Message"];
  const badgeSize = brand.cardBadge.length > 2 ? 24 : 38;
  return (
    <div
      style={{
        position: "relative",
        width: 620,
        height: 800,
        scale: `${s}`,
        transformOrigin: "top left",
        background: "#fbfaf6",
        borderRadius: 18,
        boxShadow: "0 30px 50px rgba(0,0,0,0.5)",
        overflow: "hidden",
        fontFamily: UI_FONT,
        ...style,
      }}
    >
      <div style={{ height: 150, background: `linear-gradient(135deg, ${theme.accent}, ${shade(theme.accent, -0.3)})`, padding: "26px 30px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontFamily: TITLE_FONT, color: "white", fontSize: 44, lineHeight: 0.95, whiteSpace: "pre-line" }}>{brand.cardTitle.replace(" ", "\n")}</div>
        <div style={{ width: 62, height: 62, borderRadius: 10, background: "white", color: theme.accent, fontWeight: 800, fontSize: badgeSize, display: "flex", alignItems: "center", justifyContent: "center" }}>{brand.cardBadge}</div>
      </div>
      {/* avatar: mini character head */}
      <div style={{ position: "absolute", left: 30, top: 110, width: 110, height: 110, borderRadius: "50%", background: "#3e8f5d", border: "6px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 62, height: 46, background: theme.character, position: "relative" }}>
          <div style={{ position: "absolute", left: 14, top: 10, width: 8, height: 18, background: "#141018" }} />
          <div style={{ position: "absolute", left: 40, top: 10, width: 8, height: 18, background: "#141018" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 170, top: 168, right: 26 }}>
        <div style={{ height: 14, width: 180, background: "#3b3640", borderRadius: 4, marginBottom: 12 }} />
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#2b2730",
            lineHeight: 1.25,
            outline: highlightName ? "4px solid #e2402f" : "none",
            outlineOffset: 4,
            borderRadius: 4,
          }}
        >
          {brand.cardName}
          {brand.cardSubtitle ? <div style={{ fontWeight: 400 }}>{brand.cardSubtitle}</div> : null}
        </div>
      </div>
      <div style={{ position: "absolute", left: 30, top: 290, display: "flex", gap: 12 }}>
        <div style={{ padding: "6px 22px", borderRadius: 20, background: theme.accent, color: "white", fontSize: 18, fontWeight: 700 }}>{btnA}</div>
        <div style={{ padding: "6px 22px", borderRadius: 20, border: `2px solid ${theme.accent}`, color: theme.accent, fontSize: 18, fontWeight: 700 }}>{btnB}</div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 350 }}>
        {sections.map((sec, si) => (
          <div key={sec} style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#2b2730", marginBottom: 12 }}>{sec}</div>
            {[0.9, 0.7, 0.55].map((w, li) => {
              const k = si * 3 + li;
              const on = rewritten * 9 > k;
              return (
                <div key={li} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ height: 14, width: `${w * 100}%`, borderRadius: 4, background: on ? "#3a3542" : "#e9b9a8" }} />
                  {on ? <div style={{ width: 22, height: 22, borderRadius: 11, background: "#33a852", color: "white", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {burn > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 70% 25%, rgba(40,15,5,${0.85 * burn}) ${burn * 18}%, rgba(200,90,20,${0.6 * burn}) ${burn * 26}%, transparent ${burn * 40}%)`,
          }}
        />
      ) : null}
    </div>
  );
};

/** Dark command bar that types `text` letter by letter (e.g. "/linkedin-roast"). */
export const Terminal: React.FC<{ text: string; start?: number; style?: React.CSSProperties }> = ({ text, start = 10, style }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) / 2)));
  const caret = Math.floor(frame / 8) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        padding: "22px 30px",
        background: "rgba(14,12,18,0.92)",
        border: "3px solid #4a4452",
        borderRadius: 12,
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: 40,
        color: "#f1ece4",
        boxShadow: "0 16px 30px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      <span style={{ color: "#e3774f" }}>&gt; </span>
      {text.slice(0, n)}
      <span style={{ opacity: caret ? 1 : 0, background: "#f1ece4", marginLeft: 2 }}>&nbsp;</span>
    </div>
  );
};

/** Paper confetti burst starting at `start`. */
export const Confetti: React.FC<{ start?: number; count?: number; originY?: number }> = ({ start = 0, count = 70, originY = 600 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const colors = ["#f4efe6", "#e8413c", "#f2b630", "#3d8bf2", "#57c46a", "#de7350"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = rand(i) * Math.PI * 2;
        const v = 14 + rand(i + 50) * 22;
        const x = 540 + Math.cos(a) * v * t * 0.9;
        const y = originY + Math.sin(a) * v * t * 0.6 + 0.9 * t * t * 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 16,
              height: 10,
              background: colors[i % colors.length],
              rotate: `${t * (8 + rand(i + 9) * 20)}deg`,
              opacity: Math.max(0, 1 - t / 70),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Protest-style sign on a stick, pops up at `delay`. */
export const Sign: React.FC<{ text: string; color: string; delay: number; style?: React.CSSProperties }> = ({ text, color, delay, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay, 9);
  if (frame < delay) return null;
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", translate: `0 ${(1 - p) * 120}px`, rotate: `${Math.sin(frame / 8 + delay) * 3}deg`, transformOrigin: "bottom", ...style }}>
      <div
        style={{
          width: 170,
          minHeight: 130,
          padding: 10,
          background: color,
          border: "5px solid #f4efe6",
          boxShadow: "0 10px 18px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: TITLE_FONT,
          fontSize: 30,
          lineHeight: 1.05,
          color: "white",
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
      <div style={{ width: 10, height: 110, background: "#8a5a33" }} />
    </div>
  );
};

/** Numbered booth / lectern front, like a game show. */
export const Booth: React.FC<{ n: number; width?: number }> = ({ n, width = 190 }) => {
  const { theme } = useVideo();
  return (
    <Block w={width} h={150} d={34} color={shade(theme.wood, -0.1)}>
      <div style={{ position: "absolute", left: "50%", bottom: 22, translate: "-50% 0", width: 70, height: 40, background: "#e6913a", border: "3px solid #2a1a10", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITLE_FONT, fontSize: 26, color: "#2a1a10" }}>{n}</div>
    </Block>
  );
};

/** Mouse cursor that moves to (x,y) and clicks at `clickAt`. */
export const Cursor: React.FC<{ from: [number, number]; to: [number, number]; start: number; clickAt: number }> = ({ from, to, start, clickAt }) => {
  const frame = useCurrentFrame();
  const k = ramp(frame, start, clickAt - start);
  const x = from[0] + (to[0] - from[0]) * k;
  const y = from[1] + (to[1] - from[1]) * k;
  const press = frame >= clickAt && frame < clickAt + 6 ? 0.82 : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, scale: `${press}`, filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.5))" }}>
      <svg width="54" height="64" viewBox="0 0 27 32">
        <path d="M2 2 L2 26 L8 20 L12 30 L16 28 L12 18 L20 18 Z" fill="white" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
