#!/usr/bin/env bash
# Render the Promo composition. Uses a locally installed Chrome/Chromium when Remotion
# can't download its own headless shell (offline / locked-down networks).
# Usage: render.sh <project-dir> [output.mp4] [extra remotion flags...]
set -euo pipefail
DIR="${1:?usage: render.sh <project-dir> [out.mp4] [flags...]}"; shift
OUT="${1:-out/video.mp4}"; [ $# -gt 0 ] && shift
cd "$DIR"
FLAGS=()
if [ -z "${REMOTION_BROWSER:-}" ]; then
  for c in /opt/pw-browsers/chromium-*/chrome-linux*/chrome \
           "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux*/chrome \
           /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome \
           "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
    if [ -x "$c" ]; then REMOTION_BROWSER="$c"; break; fi
  done
fi
[ -n "${REMOTION_BROWSER:-}" ] && FLAGS+=(--browser-executable="$REMOTION_BROWSER")
npx remotion render Promo "$OUT" "${FLAGS[@]}" "$@"
echo "Rendered: $DIR/$OUT"
