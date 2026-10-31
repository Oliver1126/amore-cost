#!/usr/bin/env python3
"""Narrate and assemble the presentation video.

Reads scenes.json + the frames from render.cjs (out/frames/sSS-lLL.png),
speaks each line with macOS `say`, holds each frame for exactly as long as
its narration, fades between scenes, and writes out/amore-cost-presentation.mp4
(+ a matching .srt). Needs: macOS `say`, ffmpeg/ffprobe on PATH.
"""
import json
import subprocess
from pathlib import Path

DIR = Path(__file__).resolve().parent
OUT = DIR / "out"
FRAMES, AUDIO, SEGS = OUT / "frames", OUT / "audio", OUT / "segments"
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


segments, srt, clock = [], [], 0.0
for si, scene in enumerate(cfg["scenes"]):
    n = len(scene["lines"])
    for li, line in enumerate(scene["lines"]):
        tag = f"s{si:02}-l{li:02}"
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

listfile = OUT / "segments.txt"
listfile.write_text("".join(f"file '{s}'\n" for s in segments))
final = OUT / "amore-cost-presentation.mp4"
run("ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listfile), "-c", "copy", "-movflags", "+faststart", str(final))
(OUT / "amore-cost-presentation.srt").write_text(
    "\n".join(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n" for i, (a, b, text) in enumerate(srt, 1))
)
print(f"\n{final}  ({clock:.1f}s, {final.stat().st_size / 1e6:.1f} MB)")
