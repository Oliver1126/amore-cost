#!/usr/bin/env python3
"""Narrate and assemble the presentation video.

Reads scenes.json + the frames from render.cjs (out/frames/sSS-lLL.png),
speaks each line with macOS `say`, holds each frame for exactly as long as
its narration, fades between scenes, and writes out/amore-cost-presentation.mp4
(+ a matching .srt). Needs: macOS `say`, ffmpeg/ffprobe on PATH.

--taglish uses the ElevenLabs Taglish voiceover instead of `say`:
out/elevenlabs/sSS-lLL.mp3 per line, or one out/elevenlabs/full.mp3 that is
cut into lines at its 1.5 s breaks. Captions come from the `tl` lines and
frames from out/frames-tl/ (render with CAPTIONS=tl). Writes
out/amore-cost-presentation-taglish.mp4. See elevenlabs-voiceover-taglish.md.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

DIR = Path(__file__).resolve().parent
OUT = DIR / "out"
TAGLISH = "--taglish" in sys.argv
SUFFIX = "-taglish" if TAGLISH else ""
FRAMES = OUT / ("frames-tl" if TAGLISH else "frames")
AUDIO, SEGS = OUT / f"audio{SUFFIX}", OUT / f"segments{SUFFIX}"
ELEVEN = OUT / "elevenlabs"
for d in (AUDIO, SEGS):
    d.mkdir(parents=True, exist_ok=True)

cfg = json.loads((DIR / "scenes.json").read_text())
VOICE, RATE = cfg["voice"], str(cfg["rate"])
LEAD_SCENE, LEAD, TAIL, TAIL_SCENE, FADE = 0.6, 0.15, 0.35, 0.6, 0.35
BG = "0xf2f3f0"


def run(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    return float(out.strip())


def srt_time(t):
    ms = round(t * 1000)
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def split_full_track(full, tags):
    """Cut one ElevenLabs file into len(tags) clips at its longest pauses (the 1.5 s breaks)."""
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(full), "-af", "silencedetect=noise=-40dB:d=0.6", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    total = duration(full)
    gaps = [(e - s, s, e) for s, e in zip(starts, ends) if s > 0.05 and e < total - 0.05]
    need = len(tags) - 1
    if len(gaps) < need:
        sys.exit(f"{full.name}: found {len(gaps)} pauses but need {need}. Keep the <break> tags, or export one file per line.")
    cuts = sorted(sorted(gaps, reverse=True)[:need], key=lambda g: g[1])
    bounds = [0.0] + [x for _, s, e in cuts for x in (s, e)] + [total]
    clips = {}
    for i, tag in enumerate(tags):
        a, b = bounds[2 * i], bounds[2 * i + 1]
        clip = AUDIO / f"{tag}.wav"
        run("ffmpeg", "-y", "-i", str(full), "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
            "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
            str(clip))
        clips[tag] = clip
    return clips


def taglish_audio(tags):
    per_line = {t: next((ELEVEN / f"{t}.{ext}" for ext in ("mp3", "wav", "m4a") if (ELEVEN / f"{t}.{ext}").exists()), None) for t in tags}
    if all(per_line.values()):
        return per_line
    full = next((ELEVEN / f"full.{ext}" for ext in ("mp3", "wav", "m4a") if (ELEVEN / f"full.{ext}").exists()), None)
    if full:
        return split_full_track(full, tags)
    missing = [t for t, p in per_line.items() if not p]
    sys.exit(f"No ElevenLabs audio in {ELEVEN}: add full.mp3, or per-line files (missing: {', '.join(missing[:5])}…)")


all_tags = [f"s{si:02}-l{li:02}" for si, sc in enumerate(cfg["scenes"]) for li in range(len(sc["lines"]))]
eleven = taglish_audio(all_tags) if TAGLISH else {}

segments, srt, clock = [], [], 0.0
for si, scene in enumerate(cfg["scenes"]):
    n = len(scene["lines"])
    for li, line in enumerate(scene["lines"]):
        tag = f"s{si:02}-l{li:02}"
        if TAGLISH:
            aiff = eleven[tag]
            line = {**line, "caption": line["tl"]["caption"]}
        else:
            aiff = AUDIO / f"{tag}.aiff"
            run("say", "-v", VOICE, "-r", RATE, "-o", str(aiff), line["say"])
        speech = duration(aiff)
        first, last = li == 0, li == n - 1
        lead = LEAD_SCENE if first else LEAD
        tail = TAIL_SCENE if last else TAIL
        total = lead + speech + tail

        vf = ["scale=1920:1080", "format=yuv420p"]
        if first:
            vf.append(f"fade=t=in:st=0:d={FADE}:c={BG}")
        if last:
            vf.append(f"fade=t=out:st={total - FADE:.3f}:d={FADE}:c={BG}")
        delay = int(lead * 1000)
        seg = SEGS / f"{tag}.mp4"
        run(
            "ffmpeg", "-y", "-loop", "1", "-framerate", "30", "-i", str(FRAMES / f"{tag}.png"), "-i", str(aiff),
            "-filter_complex",
            f"[0:v]{','.join(vf)}[v];[1:a]aresample=48000,adelay={delay}|{delay},apad[a]",
            "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}", "-r", "30",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-tune", "stillimage",
            "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", str(seg),
        )
        segments.append(seg)
        srt.append((clock + lead, clock + lead + speech, line["caption"]))
        clock += total
        print(f"{tag}  {total:5.2f}s  {line['caption'][:70]}")

listfile = OUT / f"segments{SUFFIX}.txt"
listfile.write_text("".join(f"file '{s}'\n" for s in segments))
final = OUT / f"amore-cost-presentation{SUFFIX}.mp4"
run("ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listfile), "-c", "copy", "-movflags", "+faststart", str(final))
(OUT / f"amore-cost-presentation{SUFFIX}.srt").write_text(
    "\n".join(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n" for i, (a, b, text) in enumerate(srt, 1))
)
print(f"\n{final}  ({clock:.1f}s, {final.stat().st_size / 1e6:.1f} MB)")
