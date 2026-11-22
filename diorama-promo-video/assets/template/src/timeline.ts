import type { CaptionWord, Scene, VideoSpec } from "./types";

export type TimedScene = Scene & {
  from: number; // frame
  frames: number;
  words: CaptionWord[]; // seconds, relative to the scene start
};

const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);
const normalize = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Turns the spec into scenes with frame ranges and per-word caption timings.
 * - With `captions` (real voiceover timings): the words are matched to scenes in order,
 *   and each scene lasts until the next scene's first word starts.
 * - Without: duration = explicit `duration` or words / wordsPerSecond + breathing room,
 *   and words are spread across the scene weighted by length.
 */
export const buildTimeline = (spec: VideoSpec): { scenes: TimedScene[]; totalFrames: number } => {
  const fps = spec.fps ?? 30;
  const wps = spec.wordsPerSecond ?? 2.7;
  const out: TimedScene[] = [];

  if (spec.captions && spec.captions.length > 0) {
    const caps = spec.captions;
    let idx = 0;
    const starts: number[] = [];
    const sceneWords: CaptionWord[][] = [];
    for (const scene of spec.scenes) {
      const n = splitWords(scene.text).length;
      const chunk = caps.slice(idx, idx + n);
      idx += n;
      sceneWords.push(chunk);
      starts.push(chunk.length ? chunk[0].start : (starts[starts.length - 1] ?? 0));
    }
    starts[0] = 0;
    const end = caps[caps.length - 1].end + 0.8;
    spec.scenes.forEach((scene, i) => {
      const s = starts[i];
      const e = i + 1 < starts.length ? starts[i + 1] : end;
      const from = Math.round(s * fps);
      const frames = Math.max(1, Math.round(e * fps) - from);
      out.push({
        ...scene,
        from,
        frames,
        words: sceneWords[i].map((w) => ({ word: w.word.trim(), start: w.start - s, end: w.end - s })),
      });
    });
    return { scenes: out, totalFrames: out.reduce((a, s) => Math.max(a, s.from + s.frames), 0) };
  }

  let from = 0;
  for (const scene of spec.scenes) {
    const words = splitWords(scene.text);
    const auto = words.length / wps + 0.6;
    const seconds = Math.max(2.2, scene.duration ?? auto);
    const frames = Math.round(seconds * fps);
    // spread words over the speaking window (leave a small tail)
    const speak = Math.min(seconds - 0.3, words.length / wps);
    const weights = words.map((w) => 1 + normalize(w).length / 6);
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    let t = 0.15;
    const timed = words.map((w, i) => {
      const d = (weights[i] / total) * speak;
      const cw = { word: w, start: t, end: t + d };
      t += d;
      return cw;
    });
    out.push({ ...scene, from, frames, words: timed });
    from += frames;
  }
  return { scenes: out, totalFrames: from };
};
