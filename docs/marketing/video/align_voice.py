#!/usr/bin/env python3
"""Cut one full voiceover recording into the per-line clips build.py needs,
by lining the recording up against the script — no pauses required.

Use this when the recording has no clear 1.5 s gaps between lines (e.g.
ElevenLabs ignored the <break> tags, or the voice was recorded by hand).

  python3 align_voice.py [path/to/voice.mp3]     # default: out/elevenlabs/full.mp3

How: whisper.cpp transcribes the recording with word timestamps; the
transcript is matched character-by-character to the `tl` script lines in
scenes.json; each line boundary is snapped to the nearest real gap between
words (sentence ends preferred). Prints every cut with the words on both
sides so a human can sanity-check it, then writes out/elevenlabs/sSS-lLL.wav.

Needs: whisper-cli (brew install whisper-cpp) and a multilingual model at
~/.cache/whisper-cpp/ggml-base.bin (from huggingface.co/ggerganov/whisper.cpp).
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

DIR = Path(__file__).resolve().parent
ELEVEN = DIR / "out" / "elevenlabs"
MODEL = Path.home() / ".cache" / "whisper-cpp" / "ggml-base.bin"
src = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else ELEVEN / "full.mp3"

scenes = json.loads((DIR / "scenes.json").read_text())["scenes"]
tags = [f"s{si:02}-l{li:02}" for si, sc in enumerate(scenes) for li in range(len(sc["lines"]))]
lines = [ln["tl"]["say"] for sc in scenes for ln in sc["lines"]]

wav16 = ELEVEN / "_16k.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-ar", "16000", "-ac", "1", str(wav16)], check=True)
subprocess.run(
    ["whisper-cli", "-m", str(MODEL), "-f", str(wav16), "-l", "tl", "-ml", "1", "-sow", "-oj", "-of", str(ELEVEN / "_words"), "-np"],
    check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
words = json.loads((ELEVEN / "_words.json").read_text())["transcription"]
ts = lambda w: w["offsets"]["from"] / 1000
te = lambda w: w["offsets"]["to"] / 1000
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())

# Transcript as one string, remembering which word each character came from.
T, tidx = "", []
for i, w in enumerate(words):
    n = norm(w["text"])
    T += n
    tidx += [i] * len(n)
S, line_end = "", []
for ln in lines:
    S += norm(ln)
    line_end.append(len(S))

sm = difflib.SequenceMatcher(None, S, T, autojunk=False)
blocks = sm.get_matching_blocks()


def to_transcript(pos):
    """Script character → transcript character, interpolating across unmatched stretches."""
    prev = (0, 0)
    for a, b, n in blocks:
        if a <= pos < a + n:
            return b + (pos - a)
        if a > pos:
            pa, pb = prev
            return int(pb + (pos - pa) * (b - pb) / max(1, a - pa))
        prev = (a + n, b + n)
    return len(T) - 1


def gap_score(j):
    gap = ts(words[j + 1]) - te(words[j])
    return gap + (0.5 if words[j]["text"].strip()[-1:] in ".?!" else 0)


cut_words = []
for k in range(len(lines) - 1):
    wi = tidx[min(len(T) - 1, max(0, to_transcript(line_end[k] - 1)))]
    cands = [j for j in range(wi - 3, wi + 4) if 0 <= j < len(words) - 1 and (not cut_words or j > cut_words[-1])]
    cut_words.append(max(cands, key=lambda j: gap_score(j) - 0.05 * abs(j - wi)))

total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
                             check=True, capture_output=True, text=True).stdout)
bounds = [0.0] + [(te(words[j]) + ts(words[j + 1])) / 2 for j in cut_words] + [total]

print(f"script↔transcript match: {sm.ratio():.0%}\n")
for k, j in enumerate(cut_words):
    before = " ".join(w["text"].strip() for w in words[max(0, j - 3): j + 1])
    after = " ".join(w["text"].strip() for w in words[j + 1: j + 4])
    print(f"{tags[k]} | {tags[k + 1]}  @{bounds[k + 1]:7.2f}s  …{before[-36:]:>36} | {after[:32]}…")

for k, tag in enumerate(tags):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-ss", f"{bounds[k]:.3f}", "-to", f"{bounds[k + 1]:.3f}",
         "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
         str(ELEVEN / f"{tag}.wav")],
        check=True,
    )
print(f"\n{len(tags)} clips → {ELEVEN}")
