---
name: diorama-promo-video
description: Make vertical 9:16 short-form promo videos (Instagram Reels, TikTok, YouTube Shorts) in the "miniature diorama" style — chunky clay block mascots on a tiny game-show stage, a taped paper headline banner, a scoreboard counter, word-by-word captions on torn paper scraps, film grain, and a "comment LINK" call to action — rendered with Remotion from a simple JSON script. Use this whenever the user wants a reel/short/TikTok/promo/explainer video for an AI tool, Claude skill, prompt, app, service, template or digital product, wants a video "like this one" / "seperti video ini", asks for a "comment LINK for the link" style video, or says things like "buatkan video reels", "bikin video promosi", "video konten untuk IG", even if they don't mention Remotion or the diorama style.
---

# Diorama promo video

Produces a ~30–50 s vertical video (1080×1920, 30 fps) in the style of the viral
"5 Claudes roast your LinkedIn" reel: a little stage with block characters acting out
what a product does, scene by scene, while captions pop word by word. Everything is
driven by one file, `src/video.json`, in a Remotion project built from
`assets/template/`.

Read `references/style-guide.md` for why the format works (pacing, typography,
narrative arc) and `references/scene-types.md` for every JSON field.

## Workflow

### 1. Get the brief (ask only for what's missing)
- **What is promoted** and the concrete things it does (outputs, numbers, steps).
- **CTA keyword** people comment (default `LINK`) and whether it's free.
- **Language** of voiceover/captions — match the user (Indonesian request → Indonesian
  script unless they say otherwise). Banners can stay English if the user prefers that "IG look".
- **Voiceover**: do they have a recording? If not, the video still works with captions only;
  offer to write a script they can record, then sync it later (step 5).
- The "prop" on the desk (profile, website, resume, store…) — sensible defaults exist.
- **Palette**: monochrome grayscale is the default (`"palette": "mono"`). Use `"warm"` only
  if the user asks for color; individual tokens can be overridden in `theme`.

### 2. Write the script first, as a table
Follow the arc in the style guide: hook → mechanism → pain → outputs → transformation →
payoff → proof → free → easy → CTA. 9–12 scenes, one sentence each, ~2.7 words/s so a
scene lasts 2.5–4.5 s. For each scene choose a scene type that *shows* the sentence
(a sentence about "five opinions" → `lineup` with five signs and an auto counter).
Show the table (banner | voiceover | scene type) to the user and adjust before building —
changing a table is cheap, re-rendering is not.

### 3. Build the project
```bash
bash <skill-dir>/scripts/new_video.sh <project-dir>      # copies template + npm install
```
Then write `<project-dir>/src/video.json` from the approved script. Start from the
example already in that file (it recreates the reference reel) — keep its shape.

Practical limits that keep layouts clean: banner ≤ 30 characters, signs 1–2 words,
`card` lines ≤ ~25 characters and ≤ 7 lines, `list` ≤ 4 items, ≤ 5 characters in `hero`.

### 4. Check it visually before the full render
```bash
node <skill-dir>/scripts/preview_sheet.mjs <project-dir>   # → out/sheet.jpg, one frame per scene
```
Look at the sheet (Read the image). Check: banner not clipped, captions don't cover the
key prop, counters show the right numbers, nothing overflows the card. Fix `video.json`
and re-run. This takes seconds; a full render takes minutes.

### 5. Voiceover sync (when there is audio)
Put the audio in `<project-dir>/public/` and run:
```bash
pip install faster-whisper   # once, if missing
python3 <skill-dir>/scripts/word_timings.py <project-dir> voiceover.mp3 --lang id
```
This writes word timings into `video.json` (`captions`, `voiceover`); scene cuts then land
exactly where each sentence starts. Background music: put it in `public/` and set
`"music": "file.mp3"` (volume 0.12 default). Without audio, timings are estimated from text.

### 6. Render and deliver
```bash
bash <skill-dir>/scripts/render.sh <project-dir> out/video.mp4
```
`render.sh` falls back to a local Chrome/Chromium when Remotion can't download its own
browser (common in sandboxes). A 45 s video takes a few minutes. Deliver the MP4, and
also write the post caption in the reference pattern:
`Comment "LINK" and I'll DM you the link to … Comment "LINK" for the link. #…`

For live tweaking the user can run `npx remotion studio` inside the project.

## Customizing beyond JSON
- Colors/cast: `palette`, `theme` and `characters` in `video.json`. In `mono` everything is
  forced to grayscale, so a custom `theme` color only matters for its lightness.
- New visual beat: add a scene type (steps at the end of `references/scene-types.md`).
- Animate only with `useCurrentFrame()` + `interpolate`/`spring`; CSS transitions/animations
  don't render in Remotion. Keep y 1440–1620 free for captions.

## Originality
The template's mascots, set and props are generic and original. Keep it that way: don't
copy another creator's characters, logos or footage into the video; real brand names may
appear as text (e.g. "LinkedIn") when describing what the product works with.
