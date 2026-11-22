import React from "react";
import { useCurrentFrame } from "remotion";
import { shade } from "../theme";
import type { CharacterSpec } from "../types";
import { Block } from "./Block";
import { useVideo } from "./anim";

const W = 220;
const H = 170;
const D = 56;

/**
 * Chunky clay block mascot. Rendered at base size 276x290 and scaled with `size`.
 * `seed` de-syncs bobbing/blinking between characters; `talking` adds a mouth flap.
 */
export const Character: React.FC<{
  spec?: CharacterSpec;
  size?: number;
  seed?: number;
  talking?: boolean;
  style?: React.CSSProperties;
}> = ({ spec = {}, size = 1, seed = 0, talking = false, style }) => {
  const frame = useCurrentFrame();
  const { theme } = useVideo();
  const color = spec.color ?? theme.character;
  const bob = Math.sin((frame + seed * 13) / 7) * 6;
  const squash = 1 + Math.sin((frame + seed * 13) / 7) * 0.015;
  const blinkPhase = (frame + seed * 37) % 96;
  const eyeScale = blinkPhase < 4 ? 0.12 : 1;
  const lookX = Math.sin((frame + seed * 50) / 40) * 6;
  const mouth = talking ? Math.abs(Math.sin(frame / 2.3)) : 0;

  return (
    <div
      style={{
        position: "relative",
        width: W + D,
        height: H + D + 30,
        scale: `${size}`,
        transformOrigin: "bottom center",
        ...style,
      }}
    >
      {/* soft contact shadow */}
      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: -6,
          width: W + D - 10,
          height: 34,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.45)",
          filter: "blur(10px)",
        }}
      />
      {/* feet */}
      {[40, W - 80].map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            bottom: 4,
            width: 44,
            height: 34,
            background: shade(color, -0.25),
            borderRadius: 4,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 0, bottom: 26, translate: `0 ${bob}px`, scale: `1 ${squash}`, transformOrigin: "bottom" }}>
        {/* arms */}
        <div style={{ position: "absolute", left: -22, top: D + 70, width: 30, height: 56, background: shade(color, -0.15), borderRadius: 6, rotate: `${10 + Math.sin(frame / 6 + seed) * 8}deg` }} />
        <div style={{ position: "absolute", left: W + 8, top: D + 66, width: 30, height: 56, background: shade(color, -0.35), borderRadius: 6, rotate: `${-10 - Math.sin(frame / 6 + seed) * 8}deg` }} />
        <Block w={W} h={H} d={D} color={color}>
          {/* eyes */}
          {[64, 136].map((x, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x + lookX,
                top: 44,
                width: 22,
                height: 46,
                background: "#141018",
                borderRadius: 3,
                scale: `1 ${eyeScale}`,
              }}
            />
          ))}
          {spec.accessory === "glasses" ? (
            <div style={{ position: "absolute", left: 44 + lookX, top: 38, width: 136, height: 60, display: "flex", gap: 16 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ flex: 1, border: "6px solid #f3c84b", borderRadius: 14 }} />
              ))}
            </div>
          ) : null}
          {spec.accessory === "mustache" ? (
            <div style={{ position: "absolute", left: 66, top: 104, width: 92, height: 22, background: "#2b1b14", borderRadius: "40px 40px 10px 10px" }} />
          ) : null}
          {talking ? (
            <div style={{ position: "absolute", left: 92, top: 112, width: 40, height: 6 + mouth * 22, background: "#2a0f12", borderRadius: 8 }} />
          ) : null}
          {spec.accessory === "tie" ? (
            <div style={{ position: "absolute", left: 96, top: H - 40, width: 30, height: 46, background: "#2b56c9", clipPath: "polygon(20% 0,80% 0,100% 70%,50% 100%,0 70%)" }} />
          ) : null}
          {spec.accessory === "bowtie" ? (
            <div style={{ position: "absolute", left: 80, top: H - 34, width: 64, height: 28, background: "#c42b3a", clipPath: "polygon(0 0,50% 40%,100% 0,100% 100%,50% 60%,0 100%)" }} />
          ) : null}
        </Block>
        <Hat kind={spec.hat ?? "none"} frame={frame} seed={seed} />
      </div>
    </div>
  );
};

const Hat: React.FC<{ kind: CharacterSpec["hat"]; frame: number; seed: number }> = ({ kind, frame, seed }) => {
  if (kind === "frosting") {
    // white puffy "icing" top like a frosted cake, with sprinkles
    return (
      <div style={{ position: "absolute", left: 4, top: -24, width: W + D - 8, height: D + 26 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (i % 5) * 54 + (i > 4 ? 26 : 0),
              top: i > 4 ? 26 : 4,
              width: 66,
              height: 54,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #ffffff, #e9e2da 70%)",
            }}
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`s${i}`}
            style={{
              position: "absolute",
              left: 20 + ((i * 53) % 230),
              top: 12 + ((i * 29) % 40),
              width: 12,
              height: 5,
              borderRadius: 3,
              rotate: `${i * 47}deg`,
              background: ["#e8413c", "#f2b630", "#3d8bf2", "#57c46a"][i % 4],
            }}
          />
        ))}
      </div>
    );
  }
  if (kind === "cap") {
    return (
      <div style={{ position: "absolute", left: 30, top: -30, width: 200, height: 70 }}>
        <div style={{ position: "absolute", inset: 0, background: "#26305e", borderRadius: "100px 100px 8px 8px" }} />
        <div style={{ position: "absolute", left: -30, bottom: -6, width: 120, height: 18, background: "#1b2348", borderRadius: 6 }} />
      </div>
    );
  }
  if (kind === "crown") {
    return (
      <div
        style={{
          position: "absolute",
          left: 60,
          top: -46,
          width: 150,
          height: 70,
          background: "linear-gradient(#ffd75a,#e0a21d)",
          clipPath: "polygon(0 100%,0 20%,25% 60%,50% 0,75% 60%,100% 20%,100% 100%)",
        }}
      />
    );
  }
  if (kind === "beanie") {
    return (
      <div style={{ position: "absolute", left: 24, top: -34, width: 230, height: 80 }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg,#3a8a5a 0 14px,#2f7449 14px 28px)", borderRadius: "120px 120px 10px 10px" }} />
        <div style={{ position: "absolute", left: 95, top: -26, width: 40, height: 40, borderRadius: "50%", background: "#f3efe6" }} />
      </div>
    );
  }
  if (kind === "headset") {
    const tilt = Math.sin((frame + seed * 9) / 30) * 2;
    return (
      <div style={{ position: "absolute", left: 6, top: -50, width: W + 10, height: 200, rotate: `${tilt}deg` }}>
        <div style={{ position: "absolute", left: 10, top: 0, width: W - 10, height: 180, border: "12px solid #1d1d22", borderBottomColor: "transparent", borderLeftColor: "#1d1d22", borderRadius: "50% 50% 0 0" }} />
        <div style={{ position: "absolute", left: -6, top: 104, width: 36, height: 60, background: "#2a2a30", borderRadius: 10 }} />
        <div style={{ position: "absolute", left: 10, top: 150, width: 70, height: 8, background: "#2a2a30", rotate: "18deg", transformOrigin: "left" }} />
      </div>
    );
  }
  return null;
};
