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
| [build.py](build.py) | Voiceover + timing + fades → the MP4 and SRT |

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

**Upgrading the voice:** `say` is a free robotic-ish voice. For a warmer
or Taglish narration, record your own (or use a TTS service) per line
into `out/audio/sSS-lLL.aiff` and adapt `build.py` to skip `say`.
