# ElevenLabs voiceover — Taglish

Script for the Amore Cost presentation video. Generated from
[scenes.json](scenes.json) by `elevenlabs_script.py`; edit the `tl` lines
there and rerun it, rather than editing this file.

**29 lines · about 3–3½ minutes spoken.**

## Recommended settings

| Setting | Value | Why |
|---|---|---|
| Model | **Eleven Multilingual v2** | Handles Filipino + English in one sentence, and supports the `<break>` pauses below |
| Voice | A Filipino voice from the Voice Library (search “Filipino” or “Tagalog”) — warm, friendly, “ate/kuya next door,” not a radio announcer | The audience is small food-business owners |
| Stability | 45–55% | Lower = more expressive; too low wobbles |
| Similarity | 75% | |
| Style exaggeration | 15–25% | A little energy for a promo; higher sounds forced |
| Speaker boost | On | |
| Speed | 1.0 (0.95 if it feels rushed) | |

**Pronunciation:** listen to how the voice says **“Amore”** in the first line. It should be
*ah-MOH-reh* (Italian for love). If it says “a-more,” add a pronunciation-dictionary alias
*Amore → Ah-moh-reh*, or replace “Amore” with “Ah-moh-reh” in the pasted text.
Prices are deliberately written in English words (“two hundred ninety-nine pesos”), the way
Taglish speakers actually say them, so the voice doesn't misread ₱ or decimals.

## How to generate it — pick one

**A. One file (easiest).** Paste all of
[elevenlabs-voiceover-taglish.txt](elevenlabs-voiceover-taglish.txt) into Text to Speech and
generate once. The `<break time="1.5s" />` between lines lets the build script cut it back into
the 29 lines automatically. Download it as MP3 and save it as
`out/elevenlabs/full.mp3`.

**B. One file per line (most control).** Generate each line below separately so you can
regenerate just the ones you don't like. Save each as `out/elevenlabs/<File>.mp3` using the
**File** name in the table (for example `s04-l01.mp3`).

Then build the Taglish video (from `Products/Amore Cost`):

```bash
CAPTIONS=tl node docs/marketing/video/render.cjs     # Taglish captions (needs the temporary playwright install)
python3 docs/marketing/video/build.py --taglish      # → out/amore-cost-presentation-taglish.mp4
```

Or just put the audio in that folder and ask Claude to build it.

## The script


### For Filipino food businesses

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s00-l00` | Kilalanin ang Amore Cost. Ang pricing tool na ginawa talaga para sa Filipino food business. | Kilalanin ang Amore Cost — ang pricing tool na ginawa para sa Filipino food business. |
| `s00-l01` | Alamin kung may kwenta ang presyo mo. | Alamin kung may kwenta ang presyo mo. |

### The problem

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s01-l00` | Karamihan sa maliliit na food business, hula lang ang presyo... o kinokopya lang sa katabing stall. | Karamihan sa maliliit na food business, hula lang ang presyo — o kinokopya sa katabing stall. |
| `s01-l01` | Tumataas ang presyo ng ingredients, pero ang presyo sa menu... ganun pa rin. | Tumataas ang presyo ng ingredients, pero ang presyo sa menu, ganun pa rin. |
| `s01-l02` | Yung waste, gaya ng buto ng manok, hindi nabibilang. | Yung waste — gaya ng buto ng manok — hindi nabibilang. |
| `s01-l03` | Tapos ang upa, ang bills, at ang Senior at PWD discount... tahimik na kumakain ng kita mo. | Tapos ang upa, bills, at Senior/PWD discount — tahimik na kumakain ng kita mo. |

### Who it's for

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s02-l00` | Ang Amore Cost ay para sa mga home baker, carinderia, food cart, at online food seller sa buong Pilipinas. | Ang Amore Cost ay para sa home bakers, carinderia, food carts, at online food sellers. |
| `s02-l01` | Libre ito, walang sign-up, at may English at Tagalog. Sa phone man o sa laptop. | Libre ito, walang sign-up, at may English at Tagalog — sa phone man o laptop. |

### Start in one tap

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s03-l00` | Isang tap lang para magsimula. Pindutin ang Try with sample recipes, at may totoong carinderia menu ka na agad: Adobo, Tapsilog, at Halo-Halo. | Isang tap lang para magsimula: “Try with sample recipes” — may totoong carinderia menu agad: Adobo, Tapsilog, at Halo-Halo. |
| `s03-l01` | Sa Dashboard, kita mo agad ang recipes mo, ang monthly bills, at ang average food cost mo... kumpara sa healthy target na twenty-eight to thirty-two percent. | Sa Dashboard, kita mo agad ang recipes mo, monthly bills, at average food cost — kumpara sa healthy target na 28–32%. |

### Step 1 · Know your true cost

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s04-l00` | Sa bawat recipe, ilalagay mo kung gaano karami ang gamit sa isang serving. Pwede sa grams, kahit per kilo ka bumibili. Automatic ang convert. | Sa bawat recipe, ilagay kung gaano karami ang gamit sa isang serving. Pwede sa grams kahit per kilo ka bumibili — automatic ang convert. |
| `s04-l01` | Binibilang din ng yield ang natatapon. Ang manok na may buto, sa seventy percent yield... sixty-two pesos and eighty-six centavos pala talaga per plate. Hindi forty-four. | Binibilang din ng yield ang natatapon: ang manok na may buto, sa 70% yield, ₱62.86 pala per plate — hindi ₱44. |
| `s04-l02` | Kaya ang isang plato ng adobo, eighty pesos and eight centavos ang totoong gastos. | Kaya ang isang plato ng adobo, ₱80.08 ang totoong gastos. |

### Step 2 · Set the right price

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s05-l00` | Mula diyan, magsa-suggest ang Amore Cost ng tamang presyo, base sa margin na gusto mo. Kasama na ang VAT. | Mula diyan, magsa-suggest ang Amore Cost ng tamang presyo base sa margin na gusto mo — kasama na ang VAT. |
| `s05-l01` | I-round mo sa two hundred ninety-nine pesos, para maganda tingnan sa menu. Laging pataas ang round, kaya hindi nababawasan ang margin mo. | I-round sa ₱299 para maganda sa menu. Laging pataas ang round, kaya hindi nababawasan ang margin mo. |
| `s05-l02` | Pati ang tamang Senior at PWD price, nandiyan na. Two hundred thirteen pesos and fifty-seven centavos. | Pati ang tamang Senior/PWD price, nandiyan na: ₱213.57. |

### Prices change? No problem

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s06-l00` | Lahat ng ingredients mo, nasa iisang Ingredient Library. | Lahat ng ingredients mo, nasa isang Ingredient Library. |
| `s06-l01` | Pag tumaas ang manok sa palengke, from two hundred twenty to three hundred pesos per kilo... isang beses mo lang palitan, update na lahat ng recipe. | Pag tumaas ang manok sa palengke, from ₱220 to ₱300 per kilo — isang beses mo lang palitan, update na lahat ng recipe. |

### Step 3 · Cover your bills

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s07-l00` | Next, ilagay ang monthly bills mo. Upa, kuryente, L-P-G, sahod, at ads. | Next, ilagay ang monthly bills mo: upa, kuryente, LPG, sahod, at ads. |
| `s07-l01` | Fifty-two thousand seven hundred pesos kada buwan, hatiin sa fifteen hundred dishes... ibig sabihin, bawat plato kailangang kumita ng thirty-five pesos and thirteen centavos para sa bills. | ₱52,700 kada buwan, hatiin sa 1,500 dishes — bawat plato, kailangang kumita ng ₱35.13 para sa bills. |

### Receipt Simulator

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s08-l00` | Sa Receipt Simulator, kita mo eksakto kung magkano ang babayaran ng customer. | Sa Receipt Simulator, kita mo eksakto kung magkano ang babayaran ng customer. |
| `s08-l01` | Dalawang adobo at isang halo-halo: seven hundred eighty-eight pesos. Pag senior citizen, unang tinatanggal ang VAT, saka ang twenty percent. Kaya five hundred sixty-two pesos and eighty-six centavos ang tamang total. | Dalawang adobo at isang halo-halo: ₱788. Pag senior citizen, unang tinatanggal ang VAT, saka ang 20% — kaya ₱562.86 ang tamang total. |
| `s08-l02` | At kita mo rin kung magkano talaga ang naiuuwi mo sa bawat order. | At kita mo rin kung magkano talaga ang naiuuwi mo sa bawat order. |

### Margin & POS Simulator

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s09-l00` | Panghuli, sinasagot ng Margin and POS Simulator ang malaking tanong. Kaya ba ng presyong ito ang bills mo? | Panghuli, sinasagot ng Margin & POS Simulator ang malaking tanong: kaya ba ng presyong ito ang bills mo? |
| `s09-l01` | Kahit adobo lang ang magbayad ng lahat ng bills, break-even ka na sa two hundred eighty-two plato kada buwan. Mga sampu lang kada araw! | Kahit adobo lang ang magbayad ng lahat ng bills, break-even ka na sa 282 plato kada buwan — mga 10 lang kada araw. |

### How it helps

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s10-l00` | Sa Amore Cost, sigurado ka sa presyo mo, at protektado ang margin mo kahit tumaas ang gastos. | Sa Amore Cost, sigurado ka sa presyo mo, at protektado ang margin mo kahit tumaas ang gastos… |
| `s10-l01` | Tama ang VAT at ang Senior discount, at alam mo na ang break-even mo, bago ka pa magbukas. | …tama ang VAT at Senior/PWD discount, at alam mo ang break-even mo bago ka pa magbukas. |

### Works with the POS you already use

| File | Voiceover (paste this) | On-screen caption |
|---|---|---|
| `s11-l00` | May POS ka na? Ituloy mo lang. I-presyo mo sa Amore Cost, saka ibenta sa POS mo. | May POS ka na? Ituloy mo lang. I-presyo sa Amore Cost, saka ibenta sa POS mo. |
| `s11-l01` | Subukan nang libre sa amore cost dot vercel dot app. Amore Cost... alamin kung may kwenta ang presyo mo. | Subukan nang libre sa amore-cost.vercel.app — alamin kung may kwenta ang presyo mo. |
