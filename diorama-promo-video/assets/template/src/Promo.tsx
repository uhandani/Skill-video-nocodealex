import React, { useMemo } from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoCtx, clamp, pop } from "./components/anim";
import { Counter, PaperCaptions, TapeBanner } from "./components/Overlay";
import { FilmFinish } from "./components/Stage";
import {
  BeforeAfterScene,
  CardScene,
  CtaScene,
  GiftScene,
  HeroScene,
  LineupScene,
  ListScene,
  SpotlightScene,
  highlightStarts,
  listStarts,
  signDelay,
} from "./scenes/Scenes";
import { DEFAULT_CREW, PALETTES } from "./theme";
import { buildTimeline, type TimedScene } from "./timeline";
import type { SceneType, VideoSpec } from "./types";

const SCENES: Record<SceneType, React.FC<{ scene: TimedScene }>> = {
  hero: HeroScene,
  lineup: LineupScene,
  card: CardScene,
  spotlight: SpotlightScene,
  list: ListScene,
  "before-after": BeforeAfterScene,
  gift: GiftScene,
  cta: CtaScene,
};

/** For counter.value === "auto": count what the scene has revealed so far. */
const autoCounter = (scene: TimedScene, frame: number): { value: string; bumpAt?: number } => {
  let starts: number[] = [];
  if (scene.type === "lineup") starts = (scene.signs ?? []).map((_, i) => signDelay(scene, i));
  else if (scene.type === "card") starts = highlightStarts(scene);
  else if (scene.type === "list") starts = listStarts(scene);
  const shown = starts.filter((s) => frame >= s);
  return { value: String(shown.length), bumpAt: shown[shown.length - 1] };
};

const SceneShell: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Comp = SCENES[scene.type] ?? HeroScene;
  // camera: punch-in on the cut, then a slow push
  const punch = pop(frame, fps, 0, 16);
  const scale = (1.08 - 0.08 * punch) * interpolate(frame, [0, scene.frames], [1, 1.04], clamp);
  const shake = frame < 5 ? Math.sin(frame * 3) * 6 : 0;
  const counter = scene.counter
    ? scene.counter.value === "auto"
      ? { label: scene.counter.label, ...autoCounter(scene, frame) }
      : { label: scene.counter.label, value: scene.counter.value, bumpAt: 6 }
    : null;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: `${scale}`, translate: `${shake}px 0` }}>
        <Comp scene={scene} />
      </AbsoluteFill>
      <TapeBanner text={scene.title} />
      {counter ? <Counter label={counter.label} value={counter.value} bumpAt={counter.bumpAt} /> : null}
      <PaperCaptions words={scene.words} />
      {/* 2-frame flash on the cut */}
      <AbsoluteFill style={{ background: "white", opacity: interpolate(frame, [0, 3], [0.35, 0], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const Promo: React.FC<VideoSpec> = (spec) => {
  const { scenes } = useMemo(() => buildTimeline(spec), [spec]);
  const ctx = useMemo(
    () => ({
      theme: { ...PALETTES[spec.palette ?? "mono"], ...(spec.theme ?? {}) },
      brand: spec.brand,
      crew: spec.characters && spec.characters.length ? spec.characters : DEFAULT_CREW,
    }),
    [spec],
  );
  return (
    <VideoCtx.Provider value={ctx}>
      {/* mono: a grayscale filter over everything guarantees no stray hue (hats, stamps, lights) */}
      <AbsoluteFill style={{ background: "#0b0b0c", filter: (spec.palette ?? "mono") === "mono" ? "grayscale(1)" : undefined }}>
        {scenes.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.frames} name={`${i + 1}. ${s.type} — ${s.title}`}>
            <SceneShell scene={s} />
          </Sequence>
        ))}
        <FilmFinish />
        {spec.voiceover ? <Html5Audio src={staticFile(spec.voiceover)} /> : null}
        {spec.music ? <Html5Audio src={staticFile(spec.music)} volume={spec.musicVolume ?? 0.12} loop /> : null}
      </AbsoluteFill>
    </VideoCtx.Provider>
  );
};
