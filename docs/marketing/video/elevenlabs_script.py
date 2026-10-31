#!/usr/bin/env python3
"""Writes the ElevenLabs Taglish voiceover files from scenes.json (the `tl` lines):

  elevenlabs-voiceover-taglish.txt  — paste into ElevenLabs Text to Speech as-is
  elevenlabs-voiceover-taglish.md   — the same script, line by line, with file names and instructions

Rerun after editing any `tl` line in scenes.json so the two never drift apart.
"""
import json
from pathlib import Path

DIR = Path(__file__).resolve().parent
scenes = json.loads((DIR / "scenes.json").read_text())["scenes"]
BREAK = '<break time="1.5s" />'

lines = [(f"s{si:02}-l{li:02}", sc, ln["tl"]) for si, sc in enumerate(scenes) for li, ln in enumerate(sc["lines"])]

(DIR / "elevenlabs-voiceover-taglish.txt").write_text(f"\n{BREAK}\n".join(tl["say"] for _, _, tl in lines) + "\n")

md = [
    "# ElevenLabs voiceover — Taglish",
    "",
    "Script for the Amore Cost presentation video. Generated from",
    "[scenes.json](scenes.json) by `elevenlabs_script.py`; edit the `tl` lines",
    "there and rerun it, rather than editing this file.",
    "",
    f"**{len(lines)} lines · about 3–3½ minutes spoken.**",
    "",
    "## Recommended settings",
    "",
    "| Setting | Value | Why |",
    "|---|---|---|",
    "| Model | **Eleven Multilingual v2** | Handles Filipino + English in one sentence, and supports the `<break>` pauses below |",
    "| Voice | A Filipino voice from the Voice Library (search “Filipino” or “Tagalog”) — warm, friendly, “ate/kuya next door,” not a radio announcer | The audience is small food-business owners |",
    "| Stability | 45–55% | Lower = more expressive; too low wobbles |",
    "| Similarity | 75% | |",
    "| Style exaggeration | 15–25% | A little energy for a promo; higher sounds forced |",
    "| Speaker boost | On | |",
    "| Speed | 1.0 (0.95 if it feels rushed) | |",
    "",
    "**Pronunciation:** listen to how the voice says **“Amore”** in the first line. It should be",
    "*ah-MOH-reh* (Italian for love). If it says “a-more,” add a pronunciation-dictionary alias",
    "*Amore → Ah-moh-reh*, or replace “Amore” with “Ah-moh-reh” in the pasted text.",
    "Prices are deliberately written in English words (“two hundred ninety-nine pesos”), the way",
    "Taglish speakers actually say them, so the voice doesn't misread ₱ or decimals.",
    "",
    "## How to generate it — pick one",
    "",
    "**A. One file (easiest).** Paste all of",
    "[elevenlabs-voiceover-taglish.txt](elevenlabs-voiceover-taglish.txt) into Text to Speech and",
    "generate once. The `<break time=\"1.5s\" />` between lines lets the build script cut it back into",
    f"the {len(lines)} lines automatically. Download it as MP3 and save it as",
    "`out/elevenlabs/full.mp3`.",
    "",
    "**B. One file per line (most control).** Generate each line below separately so you can",
    "regenerate just the ones you don't like. Save each as `out/elevenlabs/<File>.mp3` using the",
    "**File** name in the table (for example `s04-l01.mp3`).",
    "",
    "Then build the Taglish video (from `Products/Amore Cost`):",
    "",
    "```bash",
    "CAPTIONS=tl node docs/marketing/video/render.cjs     # Taglish captions (needs the temporary playwright install)",
    "python3 docs/marketing/video/build.py --taglish      # → out/amore-cost-presentation-taglish.mp4",
    "```",
    "",
    "Or just put the audio in that folder and ask Claude to build it.",
    "",
    "## The script",
    "",
]
current = None
for tag, sc, tl in lines:
    if sc["id"] != current:
        current = sc["id"]
        md += ["", f"### {sc['kicker']}", "", "| File | Voiceover (paste this) | On-screen caption |", "|---|---|---|"]
    md.append(f"| `{tag}` | {tl['say']} | {tl['caption']} |")
md.append("")
(DIR / "elevenlabs-voiceover-taglish.md").write_text("\n".join(md))
print(f"wrote {len(lines)} lines")
