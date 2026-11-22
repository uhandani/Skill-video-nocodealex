import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Character } from "../components/Character";
import { Backdrop, Desk } from "../components/Stage";
import { Booth, Confetti, Cursor, ProductCard, Sign, Terminal } from "../components/Props";
import { Block } from "../components/Block";
import { clamp, pop, ramp, useVideo } from "../components/anim";
import { SERIF_FONT, TITLE_FONT, UI_FONT, shade } from "../theme";
import type { TimedScene } from "../timeline";

export type SceneProps = { scene: TimedScene };

/** Character placed by its bottom-center point (x, bottomY). */
const Placed: React.FC<{ x: number; y: number; size: number; i: number; drop?: number; talking?: boolean }> = ({ x, y, size, i, drop = 0, talking }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { crew } = useVideo();
  const p = pop(frame, fps, drop, 10);
  return (
    <div style={{ position: "absolute", left: x - 138, top: y - 256, translate: `0 ${(1 - p) * -500}px`, opacity: frame >= drop ? 1 : 0 }}>
      <Character spec={crew[i % crew.length]} size={size} seed={i} talking={talking} />
    </div>
  );
};

/** Little sparkle/steam puffs rising (for "working hard" moments). */
const Steam: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 14) % 42) / 42;
        return (
          <div key={i} style={{ position: "absolute", left: x + i * 26 - 26, top: y - t * 160, width: 40 + t * 30, height: 40 + t * 30, borderRadius: "50%", background: "rgba(255,255,255,0.75)", opacity: 1 - t, filter: "blur(4px)" }} />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- hero
export const HeroScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const n = Math.min(5, scene.count ?? 5);
  const slots: [number, number, number][] = [
    [540, 640, 1.1],
    [220, 790, 0.9],
    [860, 790, 0.9],
    [400, 830, 0.85],
    [690, 830, 0.85],
  ];
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "curtain"} />
      {slots.slice(0, n).map(([x, y, s], i) => (
        <Placed key={i} x={x} y={y} size={s} i={i} drop={4 + i * 4} />
      ))}
      <Desk top={820}>
        <div style={{ position: "absolute", left: 290, top: 780, perspective: 1200 }}>
          <div style={{ rotate: "x 16deg", translate: `0 ${interpolate(frame, [0, 20], [80, 0], clamp)}px` }}>
            <ProductCard width={500} />
          </div>
        </div>
      </Desk>
      {scene.command ? <Terminal text={scene.command} start={12} style={{ top: 1250 }} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- lineup
export const LineupScene: React.FC<SceneProps> = ({ scene }) => {
  const { theme } = useVideo();
  const n = Math.min(6, scene.count ?? 5);
  const step = 1000 / n;
  const xs = Array.from({ length: n }, (_, i) => 40 + step * i + step / 2);
  const signs = scene.signs ?? [];
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "wall"} />
      {xs.map((x, i) => (
        <Placed key={i} x={x} y={1050} size={0.62} i={i} drop={i * 3} talking={signs.length === 0} />
      ))}
      {signs.map((t, i) => (
        <Sign key={i} text={t} color={theme.signs[i % theme.signs.length]} delay={signDelay(scene, i)} style={{ left: xs[i % n] - 85, top: 600 }} />
      ))}
      {scene.booths !== false
        ? xs.map((x, i) => (
            <div key={`b${i}`} style={{ position: "absolute", left: x - step / 2 + 6, top: 1010 }}>
              <Booth n={i + 1} width={step - 46} />
            </div>
          ))
        : null}
    </AbsoluteFill>
  );
};
export const signDelay = (scene: TimedScene, i: number) => {
  const n = scene.signs?.length ?? 1;
  return Math.round(12 + (i * (scene.frames - 40)) / Math.max(1, n));
};

// ---------------------------------------------------------------- card (document close-up)
export const highlightStarts = (scene: TimedScene) => {
  const n = scene.highlights?.length ?? 0;
  return Array.from({ length: n }, (_, i) => Math.round(25 + (i * (scene.frames - 45)) / Math.max(1, n)));
};
export const CardScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideo();
  const hl = scene.highlights ?? [];
  const starts = highlightStarts(scene);
  const p = pop(frame, fps, 0, 14);
  const renderLine = (line: string) => {
    if (hl.length === 0) return line;
    const re = new RegExp(`(${hl.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return line.split(re).map((part, k) => {
      const hi = hl.findIndex((h) => h.toLowerCase() === part.toLowerCase());
      if (hi < 0) return <React.Fragment key={k}>{part}</React.Fragment>;
      const prog = ramp(frame, starts[hi], 12);
      return (
        <span
          key={k}
          style={{
            color: prog > 0.5 ? theme.ink : undefined,
            fontWeight: prog > 0.5 ? 800 : undefined,
            backgroundImage: `linear-gradient(${theme.highlight}, ${theme.highlight})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${prog * 100}% 70%`,
            backgroundPosition: "0 70%",
            textDecoration: prog > 0.9 ? "underline" : "none",
            textDecorationThickness: 4,
          }}
        >
          {part}
        </span>
      );
    });
  };
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "dark"} />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 420,
          height: 960,
          background: "#fbf8f1",
          border: "14px solid #2a2232",
          boxShadow: "0 0 0 6px #e3774f, 0 40px 80px rgba(0,0,0,0.6)",
          padding: "40px 54px",
          translate: `0 ${(1 - p) * 300}px`,
          scale: `${interpolate(frame, [0, scene.frames], [1, 1.04])}`,
        }}
      >
        <div style={{ fontFamily: UI_FONT, fontWeight: 800, fontSize: 62, color: "#1b1720", marginBottom: 30 }}>{scene.heading ?? "About"}</div>
        {(scene.lines ?? []).map((l, i) => (
          <div key={i} style={{ fontFamily: UI_FONT, fontSize: (scene.lines ?? []).length <= 5 ? 58 : 44, lineHeight: 1.5, color: "#3b3540", opacity: ramp(frame, 6 + i * 4, 10) }}>
            {renderLine(l)}
          </div>
        ))}
      </div>
      {/* legs of the easel */}
      <div style={{ position: "absolute", left: 160, top: 1380, width: 26, height: 140, background: "#2a2232" }} />
      <div style={{ position: "absolute", right: 160, top: 1380, width: 26, height: 140, background: "#2a2232" }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- spotlight
export const SpotlightScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ scale: `${interpolate(frame, [0, scene.frames], [1.0, 1.12])}` }}>
      <Backdrop kind={scene.backdrop ?? "dark"} spot />
      <Placed x={540} y={1130} size={1.25} i={0} drop={2} talking />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- list (app panel)
export const listStarts = (scene: TimedScene) => (scene.items ?? []).map((_, i) => 12 + i * 12);
export const ListScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme, brand } = useVideo();
  const items = scene.items ?? [];
  const starts = listStarts(scene);
  const p = pop(frame, fps, 0, 14);
  const clickAt = Math.max(starts[starts.length - 1] ?? 20, scene.frames - 30);
  const rowColors = ["#e6dff7", "#dff3e5", "#f7e3df", "#dfe9f7"];
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "curtain"} />
      <Placed x={170} y={1250} size={0.8} i={1} />
      <Placed x={910} y={1250} size={0.8} i={3} />
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 430,
          height: 820,
          background: "white",
          borderRadius: 26,
          boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
          display: "flex",
          overflow: "hidden",
          translate: `0 ${(1 - p) * 400}px`,
          rotate: "-1deg",
          fontFamily: UI_FONT,
        }}
      >
        <div style={{ width: 110, background: "#f1f3f8", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30, gap: 40 }}>
          <div style={{ width: 66, height: 66, borderRadius: 12, background: theme.accent, color: "white", fontWeight: 800, fontSize: brand.cardBadge.length > 2 ? 22 : 36, display: "flex", alignItems: "center", justifyContent: "center" }}>{brand.cardBadge}</div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 40, height: 40, borderRadius: 10, background: "#d6dae4" }} />
          ))}
        </div>
        <div style={{ flex: 1, padding: "34px 30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#1b1720" }}>{scene.panelTitle ?? "Notifications"}</div>
            <div style={{ minWidth: 44, height: 44, borderRadius: 22, background: "#e2402f", color: "white", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {starts.filter((s) => frame >= s).length}
            </div>
          </div>
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}>
            {items.map((it, i) => {
              const ip = pop(frame, fps, starts[i], 12);
              const clicked = i === 0 && frame >= clickAt;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: 18, borderRadius: 18, background: "#f7f7fa", translate: `${(1 - ip) * 700}px 0`, opacity: frame >= starts[i] ? 1 : 0 }}>
                  <div style={{ width: 76, height: 76, borderRadius: 14, background: rowColors[i % rowColors.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 40, height: 30, background: theme.character }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#1b1720" }}>{it.name}</div>
                    {it.subtitle ? <div style={{ fontSize: 22, color: "#7a7484" }}>{it.subtitle}</div> : null}
                  </div>
                  <div style={{ padding: "12px 24px", borderRadius: 30, background: clicked ? "#33a852" : theme.accent, color: "white", fontSize: 24, fontWeight: 800 }}>
                    {clicked ? "✓" : (scene.buttonLabel ?? "Accept")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {items.length > 0 ? <Cursor from={[980, 1500]} to={[800, 640]} start={clickAt - 22} clickAt={clickAt} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- before-after
export const BeforeAfterScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const F = scene.frames;
  const doRewrite = scene.rewrite !== false;
  const stampAt = Math.round(F * 0.12);
  const writeStart = doRewrite ? Math.round(F * 0.42) : F + 100;
  const writeEnd = doRewrite ? Math.round(F * 0.85) : F + 200;
  const sp = pop(frame, fps, stampAt, 8);
  const rewritten = interpolate(frame, [writeStart, writeEnd], [0, 1], clamp);
  const fadeStamp = interpolate(frame, [writeStart - 6, writeStart + 6], [1, 0], clamp);
  const ap = pop(frame, fps, writeEnd, 10);
  const pencilX = 300 + Math.sin(frame / 3) * 140;
  const pencilY = 720 + rewritten * 520;
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "curtain"} />
      <Placed x={150} y={880} size={0.75} i={0} talking />
      <Placed x={930} y={880} size={0.75} i={2} talking />
      <Steam x={150} y={560} />
      <Desk top={860}>
        <div style={{ position: "absolute", left: 230, top: 560 }}>
          <ProductCard width={620} rewritten={rewritten} highlightName={frame < writeStart} burn={frame >= stampAt ? fadeStamp * Math.min(1, sp) : 0} />
        </div>
      </Desk>
      {frame >= stampAt && fadeStamp > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 820,
            padding: "10px 34px",
            border: "10px solid #d0432f",
            color: "#d0432f",
            fontFamily: TITLE_FONT,
            fontSize: 110,
            rotate: "-14deg",
            scale: `${2.2 - 1.2 * sp}`,
            opacity: fadeStamp,
            mixBlendMode: "multiply",
          }}
        >
          {scene.stamp ?? "ROASTED"}
        </div>
      ) : null}
      {frame >= writeStart && frame < writeEnd + 10 ? (
        <div style={{ position: "absolute", left: pencilX, top: pencilY, width: 34, height: 300, rotate: "28deg", transformOrigin: "bottom", translate: "0 -300px" }}>
          <div style={{ height: 40, background: "#f3a1a8" }} />
          <div style={{ height: 230, background: "linear-gradient(90deg,#f2c23a,#f6d55a,#d9a520)" }} />
          <div style={{ height: 30, background: "#f2dcb6", clipPath: "polygon(0 0,100% 0,50% 100%)" }} />
        </div>
      ) : null}
      {frame >= writeEnd ? (
        <div style={{ position: "absolute", left: 390, top: 1330, padding: "12px 44px", background: "#1d2a22", border: "6px solid #6bd389", color: "#9df0b5", fontFamily: TITLE_FONT, fontSize: 56, scale: `${ap}`, boxShadow: "0 0 40px rgba(107,211,137,0.6)" }}>
          {scene.afterLabel ?? "AFTER"}
        </div>
      ) : null}
      <Confetti start={writeEnd} originY={900} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- gift
export const GiftScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideo();
  const openAt = Math.round(scene.frames * 0.3);
  const lid = pop(frame, fps, openAt, 9);
  const shake = frame < openAt ? Math.sin(frame * 1.7) * 4 : 0;
  const n = Math.min(5, scene.count ?? 3);
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "curtain"} />
      {Array.from({ length: n }).map((_, i) => (
        <Placed key={i} x={300 + (i * 520) / Math.max(1, n - 1)} y={860} size={0.8} i={i} talking={frame > openAt} />
      ))}
      <Desk top={840}>
        <div style={{ position: "absolute", left: 520, top: 900, rotate: "6deg" }}>
          <ProductCard width={420} rewritten={1} />
        </div>
      </Desk>
      <div style={{ position: "absolute", left: 90, top: 900, rotate: `${shake - 8}deg` }}>
        <Block w={340} h={280} d={70} color={theme.gift}>
          <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 60, background: theme.ribbon }} />
        </Block>
        <div style={{ position: "absolute", left: -10, top: -40, translate: `${lid * 60}px ${-lid * 260}px`, rotate: `${lid * 35}deg` }}>
          <Block w={380} h={70} d={70} color={shade(theme.gift, 0.1)}>
            <div style={{ position: "absolute", left: 160, top: 0, bottom: 0, width: 60, background: theme.ribbon }} />
          </Block>
          <div style={{ position: "absolute", left: 140, top: -50, width: 130, height: 70, background: theme.ribbon, clipPath: "polygon(0 0,50% 60%,100% 0,100% 100%,50% 70%,0 100%)" }} />
        </div>
      </div>
      <Confetti start={openAt} originY={850} count={90} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cta
export const CtaScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideo();
  const word = scene.commentWord ?? "LINK";
  const typeStart = 14;
  const typed = Math.max(0, Math.min(word.length, Math.floor((frame - typeStart) / 5)));
  const postAt = typeStart + word.length * 5 + 10;
  const posted = frame >= postAt;
  const bp = pop(frame, fps, 0, 14);
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "curtain"} />
      <Placed x={540} y={1180} size={1.3} i={0} talking />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1220,
          height: 120,
          borderRadius: 60,
          background: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          translate: `0 ${(1 - bp) * 300}px`,
          fontFamily: UI_FONT,
        }}
      >
        <div style={{ width: 80, height: 80, borderRadius: 40, background: theme.character, border: "4px solid #f4efe6" }} />
        <div style={{ flex: 1, fontSize: 52, fontWeight: 800, color: "#1b1720" }}>
          {word.slice(0, typed)}
          {!posted && Math.floor(frame / 8) % 2 === 0 ? <span style={{ color: theme.accent }}>|</span> : null}
        </div>
        <div
          style={{
            padding: "18px 34px",
            borderRadius: 40,
            background: typed === word.length ? theme.accent : "#c9c4d1",
            color: "white",
            fontSize: 36,
            fontWeight: 800,
            scale: frame >= postAt && frame < postAt + 6 ? "0.85" : "1",
          }}
        >
          {posted ? "✓" : "Post"}
        </div>
      </div>
      {posted ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: SERIF_FONT, fontWeight: 900, fontSize: 64, color: "#ffe7a8", opacity: ramp(frame, postAt, 10), translate: `0 ${-ramp(frame, postAt, 30) * 40}px` }}>
          ♥ ♥ ♥
        </div>
      ) : null}
      <Confetti start={postAt} originY={1150} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- board (chalkboard with big glyphs)
const Stamp: React.FC<{ text: string; at: number; style?: React.CSSProperties }> = ({ text, at, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const sp = pop(frame, fps, at, 8);
  return (
    <div
      style={{
        position: "absolute",
        padding: "8px 30px",
        border: "10px solid currentColor",
        color: "#e9e9ea",
        background: "rgba(0,0,0,0.35)",
        fontFamily: TITLE_FONT,
        fontSize: Math.min(92, Math.floor(1150 / Math.max(4, text.length))),
        whiteSpace: "nowrap",
        rotate: "-12deg",
        scale: `${2.2 - 1.2 * sp}`,
        opacity: Math.min(1, sp * 2),
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export const BoardScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = scene.rows ?? [{ glyphs: ["x"] }];
  const F = scene.frames;
  const total = rows.reduce((a, r) => a + r.glyphs.length, 0);
  const revealEnd = Math.max(20, Math.round(F * 0.55));
  const step = total > 1 ? (revealEnd - 8) / (total - 1) : 0;
  const strikeAt = Math.round(F * 0.6);
  const glowAt = Math.round(F * 0.72);
  const bp = pop(frame, fps, 0, 14);
  const maxLen = Math.max(...rows.map((r) => r.glyphs.join("").length + r.glyphs.length * 0.6));
  const longest = Math.max(...rows.map((r) => r.glyphs.length));
  const size = Math.max(64, Math.min(rows.length === 1 && longest === 1 ? 380 : 190, Math.floor(1300 / Math.max(2, maxLen))));
  const rowGap = rows.length > 2 ? 10 : 30;
  let k = 0;
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "curtain"} />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 420,
          height: 780,
          overflow: "hidden",
          background: "radial-gradient(ellipse at 50% 40%, #3a3a3a, #1d1d1e 80%)",
          border: "22px solid #6c6c6e",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.7), 0 30px 60px rgba(0,0,0,0.6)",
          translate: `0 ${(1 - bp) * 260}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: rowGap,
        }}
      >
        {/* chalk dust */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(170deg, rgba(255,255,255,0.03) 0 3px, transparent 3px 11px)" }} />
        {rows.map((r, ri) => (
          <div key={ri} style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
            {r.glyphs.map((g, gi) => {
              const at = Math.round(8 + step * k++);
              const p = pop(frame, fps, at, 10);
              const struck = r.struck?.includes(gi) && frame >= strikeAt;
              const sp = ramp(frame, strikeAt, 8);
              const hl = r.highlight?.includes(gi) && frame >= glowAt;
              const hp = pop(frame, fps, glowAt, 9);
              return (
                <React.Fragment key={gi}>
                  {r.arrows && gi > 0 ? (
                    <div style={{ fontFamily: UI_FONT, fontSize: size * 0.4, color: "#a6a7a9", opacity: frame >= at ? 1 : 0 }}>→</div>
                  ) : null}
                  <div
                    style={{
                      position: "relative",
                      fontFamily: SERIF_FONT,
                      fontStyle: "italic",
                      fontWeight: 600,
                      fontSize: size,
                      lineHeight: 1.05,
                      color: struck ? "#7a7a7c" : "#f0f0f0",
                      textShadow: hl ? `0 0 ${30 * hp}px rgba(255,255,255,0.9)` : "0 0 6px rgba(255,255,255,0.25)",
                      scale: `${p * (hl ? 1 + 0.25 * hp : 1)}`,
                      opacity: frame >= at ? 1 : 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g}
                    {r.struck?.includes(gi) && frame >= strikeAt ? (
                      <div style={{ position: "absolute", left: "-8%", top: "52%", height: Math.max(6, size * 0.06), width: `${116 * sp}%`, background: "#f0f0f0", rotate: "-14deg", borderRadius: 4 }} />
                    ) : null}
                  </div>
                </React.Fragment>
              );
            })}
            {r.label ? (
              <div style={{ fontFamily: UI_FONT, fontWeight: 600, fontSize: Math.max(30, size * 0.26), color: "#bdbec0", marginLeft: 6, opacity: ramp(frame, Math.round(8 + step * (k - 1)) + 6, 10) }}>{r.label}</div>
            ) : null}
          </div>
        ))}
        {scene.stamp ? <Stamp text={scene.stamp} at={Math.round(F * 0.62)} style={{ bottom: 60, left: "50%", translate: "-50% 0" }} /> : null}
      </div>
      {/* easel legs */}
      <div style={{ position: "absolute", left: 200, top: 1200, width: 28, height: 240, background: "#5a5b5d", rotate: "8deg" }} />
      <div style={{ position: "absolute", right: 200, top: 1200, width: 28, height: 240, background: "#5a5b5d", rotate: "-8deg" }} />
      {/* presenters stand in front of the easel, in the corners */}
      <Placed x={130} y={1440} size={0.62} i={1} talking />
      <Placed x={950} y={1440} size={0.62} i={3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- timeline
export const timelineStarts = (scene: TimedScene) => {
  const n = scene.entries?.length ?? 0;
  const from = scene.revealFrom ?? 0;
  const k = Math.max(1, n - from);
  return Array.from({ length: n }, (_, i) => (i < from ? -100 : Math.round(10 + ((i - from) * (scene.frames - 30)) / k)));
};
export const TimelineScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideo();
  const entries = scene.entries ?? [];
  const starts = timelineStarts(scene);
  const p = pop(frame, fps, 0, 14);
  return (
    <AbsoluteFill>
      <Backdrop kind={scene.backdrop ?? "wall"} />
      <Placed x={930} y={1400} size={0.7} i={2} talking />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 200,
          top: 430,
          height: 980,
          background: "#f0f0f0",
          boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          rotate: "-1.5deg",
          padding: "50px 46px 40px 110px",
          translate: `0 ${(1 - p) * 300}px`,
          fontFamily: UI_FONT,
        }}
      >
        <div style={{ position: "absolute", left: 62, top: 60, bottom: 60, width: 8, background: theme.ink, transformOrigin: "top", scale: `1 ${ramp(frame, 0, 30)}` }} />
        {entries.map((e, i) => {
          const s = starts[i];
          const ep = s < 0 ? 1 : pop(frame, fps, s, 12);
          if (s >= 0 && frame < s) return null;
          return (
            <div key={i} style={{ position: "relative", marginBottom: 46, translate: `${(1 - ep) * 80}px 0`, opacity: Math.min(1, ep * 1.5) }}>
              <div style={{ position: "absolute", left: -66, top: 22, width: 36, height: 36, borderRadius: 18, background: theme.ink, border: "6px solid #f0f0f0", boxShadow: `0 0 0 4px ${theme.ink}` }} />
              <div style={{ fontFamily: TITLE_FONT, fontSize: 84, color: theme.ink, lineHeight: 1 }}>{e.year}</div>
              <div style={{ fontWeight: 800, fontSize: 50, color: "#231f20", marginTop: 8 }}>{e.title}</div>
              {e.note ? (
                <div style={{ display: "inline-block", marginTop: 12, padding: "10px 18px", background: "#e3e4e6", borderLeft: `8px solid ${theme.ink}`, fontSize: 38, color: "#333335", lineHeight: 1.3 }}>{e.note}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
