#!/usr/bin/env bash
# Scaffold a new diorama promo video project from the bundled template.
# Usage: new_video.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: new_video.sh <target-dir>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="$HERE/../assets/template"
if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "error: $TARGET exists and is not empty" >&2; exit 1
fi
mkdir -p "$TARGET"
cp -R "$TEMPLATE/." "$TARGET/"
mv "$TARGET/gitignore" "$TARGET/.gitignore"
mkdir -p "$TARGET/public" "$TARGET/out"
cd "$TARGET"
npm install --no-fund --no-audit --loglevel=error
echo
echo "Project ready in $TARGET"
echo "  edit:    src/video.json   (scenes, text, brand, colors)"
echo "  preview: npx remotion studio"
echo "  render:  $HERE/render.sh $TARGET"
