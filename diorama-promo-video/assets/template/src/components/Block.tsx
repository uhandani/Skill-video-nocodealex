import React from "react";
import { shade } from "../theme";

/**
 * Pseudo-3D box: front face + top face + right side face, drawn with clip-paths.
 * The container is (w + d) x (h + d); the front face sits at the bottom-left.
 */
export const Block: React.FC<{
  w: number;
  h: number;
  d?: number;
  color: string;
  style?: React.CSSProperties;
  children?: React.ReactNode; // rendered on the front face
  texture?: boolean;
}> = ({ w, h, d = Math.round(w * 0.22), color, style, children, texture = true }) => {
  const W = w + d;
  const H = h + d;
  const grain = texture
    ? "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 3px, rgba(0,0,0,0.04) 3px 7px)"
    : undefined;
  return (
    <div style={{ position: "relative", width: W, height: H, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: shade(color, 0.22),
          backgroundImage: grain,
          clipPath: `polygon(0px ${d}px, ${d}px 0px, ${W}px 0px, ${w}px ${d}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: shade(color, -0.32),
          clipPath: `polygon(${w}px ${d}px, ${W}px 0px, ${W}px ${h}px, ${w}px ${H}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: d,
          width: w,
          height: h,
          background: `linear-gradient(180deg, ${shade(color, 0.06)}, ${shade(color, -0.1)})`,
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.15)",
          overflow: "visible",
        }}
      >
        {grain ? <div style={{ position: "absolute", inset: 0, backgroundImage: grain }} /> : null}
        {children}
      </div>
    </div>
  );
};
