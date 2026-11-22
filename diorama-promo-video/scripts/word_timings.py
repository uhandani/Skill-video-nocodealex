#!/usr/bin/env python3
"""Transcribe a voiceover into word timings and write them into video.json as "captions".

Usage:
    python3 word_timings.py <project-dir> <audio-file-in-public/> [--model base] [--lang id]

Tries faster-whisper first, then openai-whisper. With timings in place the video
syncs each scene to the moment its first word is spoken, and captions pop exactly
on the spoken word.

The words must line up with the scene texts: after transcribing, every scene's
"text" is replaced by what was actually said (in order), so keep one sentence per
scene in the recording, matching the script you wrote.
"""
import argparse
import json
import sys
from pathlib import Path


def transcribe(path: str, model: str, lang: str | None):
    try:
        from faster_whisper import WhisperModel  # type: ignore

        m = WhisperModel(model, compute_type="int8")
        segs, _ = m.transcribe(path, word_timestamps=True, language=lang)
        return [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            for s in segs
            for w in (s.words or [])
            if w.word.strip()
        ]
    except ImportError:
        pass
    try:
        import whisper  # type: ignore

        m = whisper.load_model(model)
        r = m.transcribe(path, word_timestamps=True, language=lang)
        return [
            {"word": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)}
            for s in r["segments"]
            for w in s.get("words", [])
            if w["word"].strip()
        ]
    except ImportError:
        sys.exit("No whisper installed. Run: pip install faster-whisper  (or openai-whisper)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("audio", help="file name inside <project>/public, e.g. voiceover.mp3")
    ap.add_argument("--model", default="base")
    ap.add_argument("--lang", default=None, help="e.g. en, id (auto-detect if omitted)")
    a = ap.parse_args()

    proj = Path(a.project)
    spec_path = proj / "src" / "video.json"
    spec = json.loads(spec_path.read_text())
    words = transcribe(str(proj / "public" / a.audio), a.model, a.lang)
    if not words:
        sys.exit("No words found in the audio.")

    # Re-flow transcript words onto scenes by the scene script's word counts, so that
    # small transcription differences don't shift every later scene.
    counts = [len(s["text"].split()) for s in spec["scenes"]]
    total_script = sum(counts)
    if abs(total_script - len(words)) > 0:
        print(f"note: script has {total_script} words, transcript has {len(words)}; "
              "scaling scene boundaries proportionally.")
    i = 0
    acc = 0
    for s, n in zip(spec["scenes"], counts):
        acc += n
        j = round(acc * len(words) / total_script)
        chunk = words[i:j] or words[i:i + 1]
        s["text"] = " ".join(w["word"] for w in chunk)
        i = j
    spec["captions"] = words
    spec["voiceover"] = a.audio
    spec_path.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {len(words)} word timings to {spec_path}")


if __name__ == "__main__":
    main()
