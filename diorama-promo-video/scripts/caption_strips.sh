#!/usr/bin/env bash
# For restyling an existing video that has burned-in captions but no transcript:
# crops the caption band every 0.5 s into tiled contact sheets with timestamps, so you can
# READ the script (and which word is highlighted = being spoken) straight off the images.
# Also extracts the audio track to reuse as voiceover.
#
# Usage: caption_strips.sh <video> <out-dir> [band_top_px] [band_height_px] [fps]
#   band defaults suit 1080x1920 reels with captions in the lower third (y 1500..1720).
#   Find the right band first: ffmpeg -ss 5 -i video.mp4 -frames:v 1 probe.jpg  and look.
set -euo pipefail
VIDEO="${1:?video}"; OUT="${2:?out-dir}"; TOP="${3:-1500}"; H="${4:-220}"; FPS="${5:-2}"
mkdir -p "$OUT"
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$VIDEO")
ffmpeg -v error -y -i "$VIDEO" -vf "fps=$FPS,crop=$W:$H:0:$TOP,scale=480:-2,drawtext=text='%{pts\:hms}':x=2:y=2:fontsize=15:fontcolor=white:box=1:boxcolor=black,tile=4x23" -start_number 1 "$OUT/strip%02d.jpg"
ffmpeg -v error -y -i "$VIDEO" -vf "fps=1/2,scale=240:-1,tile=8x6" -frames:v 1 "$OUT/overview.jpg"
ffmpeg -v error -y -i "$VIDEO" -vn -c:a aac -b:a 160k "$OUT/voiceover.m4a"
ls "$OUT"
