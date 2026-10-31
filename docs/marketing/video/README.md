# Presentation video

A ~3-minute narrated explainer: what Amore Cost is, how it works (sample
recipes → true cost with yield → suggested & rounded price → Ingredient
Library → OPEX per dish → Receipt Simulator → Margin & POS Simulator),
and how it helps Filipino food businesses. 1920×1080, English voiceover
(macOS "Samantha"), captions burned in for muted autoplay (Facebook,
Reels), plus a separate `.srt`.

**Output (not committed — regenerate):** `out/amore-cost-presentation.mp4`
and `out/amore-cost-presentation.srt`.

## Files

| File | Job |
|---|---|
| [scenes.json](scenes.json) | The storyboard: 12 scenes, each line with an on-screen `caption` and a phonetic `say` for the voice. Edit here to change wording. |
| [capture.cjs](capture.cjs) | Screenshots of the real app with the sample recipes loaded → `shots/` |
| [slide.html](slide.html) | The slide template (app font, colors, logo) |
| [render.cjs](render.cjs) | One 1920×1080 frame per narration line → `out/frames/` |
| [build.py](build.py) | Voiceover + timing + fades → the MP4 and SRT (`--taglish` = ElevenLabs audio + Taglish captions) |
| [elevenlabs-voiceover-taglish.md](elevenlabs-voiceover-taglish.md) / [.txt](elevenlabs-voiceover-taglish.txt) | The Taglish voiceover script for ElevenLabs — settings, line-by-line table, and a paste-ready file. Generated from `scenes.json` by [elevenlabs_script.py](elevenlabs_script.py) |

## Rebuild

```bash
# from Products/Amore Cost
npm run build && npx next start -p 3013 &      # the app, for screenshots
npm install --no-save playwright@1.62.1
node docs/marketing/video/capture.cjs          # skip if the UI didn't change
node docs/marketing/video/render.cjs
python3 docs/marketing/video/build.py          # needs ffmpeg + macOS `say`
npm uninstall playwright
```

## Keep it honest

Every peso figure is from the built-in sample recipes (`src/lib/demo.ts`)
run through the app's own math — the same numbers as
[../../onboarding/user-manual.md](../../onboarding/user-manual.md). If the
sample data or pricing math changes, recapture and recompute; don't
hand-edit numbers in `scenes.json`.

**Before sharing publicly:** the video's call to action points to
https://amore-cost.vercel.app, which only shows these features after a
`vercel --prod` deploy.

**Taglish ElevenLabs version (recommended):** generate the voiceover from
[elevenlabs-voiceover-taglish.md](elevenlabs-voiceover-taglish.md), save it
as `out/elevenlabs/full.mp3` (or one `sSS-lLL.mp3` per line), then
`CAPTIONS=tl node docs/marketing/video/render.cjs` and
`python3 docs/marketing/video/build.py --taglish` →
`out/amore-cost-presentation-taglish.mp4`. The full-file split was tested
end to end (29 of 29 lines cut correctly at the 1.5 s breaks).
