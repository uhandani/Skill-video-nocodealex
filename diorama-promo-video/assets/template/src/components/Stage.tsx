import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { shade } from "../theme";
import { rand, useVideo } from "./anim";

/** Back wall of the diorama. */
export const Backdrop: React.FC<{ kind?: "curtain" | "wall" | "dark"; spot?: boolean }> = ({ kind = "curtain", spot = false }) => {
  const { theme } = useVideo();
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 40) * 4;
  return (
    <AbsoluteFill style={{ background: "#120e1c" }}>
      {kind === "curtain" ? (
        <AbsoluteFill
          style={{
            height: 1150,
            translate: `${sway}px 0`,
            background: `repeating-linear-gradient(90deg, ${shade(theme.curtain, -0.45)} 0px, ${theme.curtain} 40px, ${shade(theme.curtain, 0.18)} 70px, ${theme.curtain} 100px, ${shade(theme.curtain, -0.45)} 140px)`,
          }}
        />
      ) : null}
      {kind === "wall" ? (
        <AbsoluteFill style={{ height: 1150, background: `linear-gradient(${shade(theme.wall, 0.1)}, ${shade(theme.wall, -0.35)})` }}>
          {/* grid of tiny framed posters */}
          {Array.from({ length: 40 }).map((_, i) => {
            const col = i % 8;
            const row = Math.floor(i / 8);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 40 + col * 130,
                  top: 70 + row * 150,
                  width: 74,
                  height: 92,
                  background: "#f3f1ea",
                  borderTop: `16px solid ${theme.accent}`,
                  boxShadow: "0 8px 14px rgba(0,0,0,0.45)",
                  rotate: `${(rand(i) - 0.5) * 4}deg`,
                  opacity: 0.9,
                }}
              >
                <div style={{ margin: "14px 10px", height: 6, background: "#c9c3b8" }} />
                <div style={{ margin: "0 10px", height: 6, width: 30, background: "#d8d2c8" }} />
              </div>
            );
          })}
          {/* string lights */}
          <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#ffe7a8", boxShadow: "0 0 18px 6px rgba(255,214,130,0.6)", opacity: 0.6 + 0.4 * Math.abs(Math.sin(frame / 9 + i)) }} />
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
      {kind === "dark" ? (
        <AbsoluteFill style={{ height: 1150, background: "radial-gradient(ellipse at 50% 30%, #2b2340, #0d0a14 70%)" }}>
          <div style={{ position: "absolute", top: 260, left: 0, right: 0, display: "flex", justifyContent: "space-evenly" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: "#fff7da", boxShadow: "0 0 40px 14px rgba(255,236,180,0.55)" }} />
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
      {/* stage floor */}
      <div
        style={{
          position: "absolute",
          top: 1100,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(${theme.floor[0]}, ${theme.floor[1]})`,
          boxShadow: "0 -30px 60px rgba(0,0,0,0.6)",
        }}
      />
      <div style={{ position: "absolute", top: 1096, left: 0, right: 0, height: 10, background: shade(theme.wood, 0.1) }} />
      {spot ? (
        <AbsoluteFill
          style={{
            background:
              "conic-gradient(from 180deg at 50% -10%, transparent 0deg, transparent 165deg, rgba(150,120,255,0.18) 172deg, rgba(190,160,255,0.28) 180deg, rgba(150,120,255,0.18) 188deg, transparent 195deg)",
          }}
        >
          <div style={{ position: "absolute", left: 240, top: 1020, width: 600, height: 200, borderRadius: "50%", background: "radial-gradient(rgba(160,120,255,0.55), transparent 70%)" }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Wooden table top seen in perspective. Children are placed ON the table (flat, facing camera). */
export const Desk: React.FC<{ top?: number; children?: React.ReactNode }> = ({ top = 1000, children }) => {
  const { theme } = useVideo();
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top, bottom: 0, perspective: 1400 }}>
        <div
          style={{
            position: "absolute",
            left: -200,
            right: -200,
            top: 0,
            height: 1100,
            transformOrigin: "top center",
            rotate: "x 38deg",
            background: `repeating-linear-gradient(90deg, ${shade(theme.wood, 0.08)} 0 8px, ${theme.wood} 8px 46px, ${shade(theme.wood, -0.12)} 46px 50px, ${shade(theme.wood, 0.03)} 50px 120px)`,
            borderTop: `22px solid ${shade(theme.wood, 0.25)}`,
            boxShadow: "inset 0 80px 120px rgba(0,0,0,0.35)",
          }}
        />
      </div>
      {children}
    </>
  );
};

/** Film grain + vignette + warm light leak — the "shot on a real set" finish. */
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,90,0.08), transparent 30%, transparent 70%, rgba(40,0,60,0.25))", mixBlendMode: "screen" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.16, mixBlendMode: "overlay" }}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
