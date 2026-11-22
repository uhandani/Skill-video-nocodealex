#!/usr/bin/env node
// Render one still per scene (at 70% through the scene) and tile them into a contact sheet,
// so you can eyeball every scene in one image before spending minutes on a full render.
// Usage: node preview_sheet.mjs <project-dir> [out.jpg]
// Needs ffmpeg for tiling. Mirrors the timing logic of src/timeline.ts.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] ?? ".");
const outFile = path.resolve(process.argv[3] ?? path.join(dir, "out", "sheet.jpg"));
const spec = JSON.parse(fs.readFileSync(path.join(dir, "src", "video.json"), "utf8"));
const fps = spec.fps ?? 30;
const wps = spec.wordsPerSecond ?? 2.7;
const words = (t) => t.split(/\s+/).filter(Boolean).length;

const ranges = [];
if (spec.captions?.length) {
  let idx = 0;
  const starts = spec.scenes.map((s) => {
    const st = spec.captions[idx]?.start ?? 0;
    idx += words(s.text);
    return st;
  });
  starts[0] = 0;
  const end = spec.captions.at(-1).end + 0.8;
  starts.forEach((s, i) => ranges.push([Math.round(s * fps), Math.round((starts[i + 1] ?? end) * fps)]));
} else {
  let from = 0;
  for (const s of spec.scenes) {
    const f = Math.round(Math.max(2.2, s.duration ?? words(s.text) / wps + 0.6) * fps);
    ranges.push([from, from + f]);
    from += f;
  }
}

const browserCandidates = [
  process.env.REMOTION_BROWSER,
  ...(() => {
    try {
      return fs.readdirSync("/opt/pw-browsers").filter((d) => /^chromium-\d+/.test(d)).map((d) => `/opt/pw-browsers/${d}/chrome-linux64/chrome`);
    } catch {
      return [];
    }
  })(),
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter((p) => p && fs.existsSync(p));
const browserFlag = browserCandidates.length ? [`--browser-executable=${browserCandidates[0]}`] : [];

const tmp = path.join(dir, "out", "sheet-frames");
fs.mkdirSync(tmp, { recursive: true });
const bundle = path.join(dir, "out", "bundle");
execFileSync("npx", ["remotion", "bundle", `--out-dir=${bundle}`], { cwd: dir, stdio: "ignore" });
const files = [];
ranges.forEach(([a, b], i) => {
  const frame = Math.min(b - 1, a + Math.round((b - a) * 0.7));
  const f = path.join(tmp, `s${String(i).padStart(2, "0")}.png`);
  execFileSync("npx", ["remotion", "still", bundle, "Promo", f, `--frame=${frame}`, "--scale=0.35", ...browserFlag], { cwd: dir, stdio: "ignore" });
  files.push(f);
  console.log(`scene ${i + 1}: frame ${frame}`);
});
const cols = Math.min(6, files.length);
const rows = Math.ceil(files.length / cols);
execFileSync("ffmpeg", ["-v", "error", "-y", "-pattern_type", "glob", "-i", path.join(tmp, "s*.png"), "-vf", `tile=${cols}x${rows}:padding=6:color=black`, "-frames:v", "1", outFile]);
console.log(`contact sheet: ${outFile}`);
