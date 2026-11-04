# Facebook posts — Amore Cost page

Ready to paste, one image each (`post-1.png` … `post-4.png`, 1080×1350,
the 4:5 size that fills the most screen in the feed). Images are
rendered from [post-images.html](post-images.html) by `render-posts.cjs`. Taglish, written for small PH food-business owners
(carinderia, home baker, food cart, online seller). Every number below
comes from the app's sample recipes (Post 5 is the video) (`src/lib/demo.ts`), so anyone who
taps "Try with sample recipes" sees the same figures.

https://amore-cost.vercel.app was redeployed on 2026-11-05 and has
everything these posts and the video mention (sample recipes, yield,
rounding). After any new app change, redeploy (`vercel --prod`) before
posting about it.

---

## Post 1 — Launch / introduction (pin this one)

**Image:** [post-1.png](post-1.png)

```
May kwenta ba talaga ang presyo mo? 🤔

Karamihan sa maliliit na food business, hula lang ang presyo o kinokopya sa katabing stall. Tapos tataas ang manok, ang LPG, ang upa… pero ang presyo sa menu, ganun pa rin. Ang ending: benta nang benta, pero bakit parang walang naiipon? 😩

Kaya ginawa namin ang Amore Cost 💚 isang LIBRENG pricing tool para sa Filipino food business.

✅ Alamin ang totoong gastos ng bawat plato, kasama na ang buto at natatapon
✅ Tamang presyo base sa margin na gusto mo, kasama na ang VAT
✅ Tamang Senior at PWD price, hindi na kailangang manghula
✅ Isang palit lang ng presyo ng ingredient, update na lahat ng recipe
✅ Alamin kung ilang plato ang kailangan mong mabenta para sa monthly bills mo

Halimbawa: isang plato ng adobo, ₱80.08 ang totoong gastos. Ang suggested na presyo: ₱299. Senior/PWD price: ₱213.57. Lahat 'yan, kinompute ng app para sa'yo.

📱 Libre, walang sign-up, English o Tagalog, sa phone man o laptop.
👉 Subukan na: amore-cost.vercel.app
(Pindutin ang "Try with sample recipes" para makita agad kung paano gumagana.)

Para sa carinderia, home baker, food cart, at online food seller. I-share mo sa kakilala mong may food business! 🙏

#AmoreCost #FoodBusinessPH #Carinderia #HomeBakerPH #SmallBusinessPH #NegosyoTips
```

---

## Post 2 — Price increase (post when ingredient prices are in the news)

**Image:** [post-2.png](post-2.png)

```
Tumaas na naman ang manok sa palengke? 🐔📈

From ₱220 → ₱300 per kilo. Alam mo ba kung magkano na talaga ang gastos ng adobo mo ngayon?

Sa halimbawa namin: ₱80.08 → ₱102.94 na ang totoong gastos ng isang plato. Kung ₱299 pa rin ang benta mo, ang food cost mo ay 39% na, lampas sa healthy na 28–32%. 😬

Sa Amore Cost, isang beses mo lang palitan ang presyo ng manok sa Ingredient Library. Automatic na mag-a-update ang LAHAT ng recipe na gumagamit nito, pati ang suggested na presyo. 💚

Hindi na kailangang mag-compute ulit isa-isa.

👉 Libre: amore-cost.vercel.app

#AmoreCost #FoodBusinessPH #PresyoNgBilihin
```

---

## Post 3 — Senior / PWD discount

**Image:** [post-3.png](post-3.png)

```
Senior citizen ang customer. Paano ang tamang discount? 👵👴

Maraming nagkakamali dito: binabawas agad ang 20% sa presyong may VAT. Pero ang tama, UNA munang tinatanggal ang VAT, saka binabawas ang 20%.

Halimbawa: ₱299 na adobo
❌ Mali: ₱299 − 20% = ₱239.20
✅ Tama: ₱299 ÷ 1.12 = ₱266.96, tapos −20% = ₱213.57

Sa Receipt Simulator ng Amore Cost, kita mo agad ang tamang total. Para walang lugi, at walang reklamo. 🧾

👉 Libre: amore-cost.vercel.app

#AmoreCost #SeniorDiscount #PWDDiscount #FoodBusinessPH
```

---

## Post 4 — Waste / yield (the "hidden cost" angle)

**Image:** [post-4.png](post-4.png)

```
Bakit ₱62.86 at hindi ₱44 ang manok sa adobo mo? 🍗

Kasi may buto, may balat, may natatapon. Kung 70% lang ng biniling manok ang talagang napupunta sa plato, mas mahal pala ang totoong gastos kaysa sa akala mo.

Sa Amore Cost, may "Yield %" bawat ingredient, kaya kasama na sa computation ang natatapon. Ang tamang presyo ay galing sa totoong gastos, hindi sa hula. 💚

👉 Libre: amore-cost.vercel.app

#AmoreCost #FoodCosting #CarinderiaTips #FoodBusinessPH
```

---

## Post 5 — The presentation video (Taglish)

**Video:** `docs/marketing/video/out/amore-cost-presentation-taglish.mp4`
(3:52, not committed; rebuild with `python3 docs/marketing/video/build.py --taglish`).
Upload it natively to Facebook (not as a YouTube link) so it autoplays in the feed.
Also upload `amore-cost-presentation-taglish.srt` as captions (English (US) is fine;
Facebook has no Taglish option). The captions are already burned into the video,
so this only helps search.

**Video title** (the Title field when uploading):

```
Amore Cost: Paano malalaman kung may kwenta ang presyo mo? (Libreng pricing tool)
```

**Description:**

```
Benta nang benta, pero bakit parang walang naiipon? 🤔 Baka ang presyo mo ang may problema.

Panoorin kung paano gumagana ang Amore Cost 💚 ang LIBRENG pricing tool na ginawa para sa Filipino food business: carinderia, home baker, food cart, at online food seller.

Sa video na 'to, gamit ang totoong carinderia menu (Adobo, Tapsilog, Halo-Halo):
🍗 Bakit ₱80.08 ang totoong gastos ng isang plato ng adobo, kasama na ang buto at natatapon
💰 Paano makuha ang tamang presyo (₱299) base sa margin na gusto mo, kasama na ang VAT
👵 Ang tamang Senior/PWD price: ₱213.57, hindi ₱239.20
📈 Tumaas ang manok? Isang palit lang, update na lahat ng recipe
🧾 Magkano talaga ang babayaran ng customer, at magkano ang naiuuwi mo
📊 Ilang plato ang kailangang mabenta para mabayaran ang monthly bills (spoiler: mga sampu lang kada araw!)

⏱️ Mga parte ng video:
0:00 Ano ang Amore Cost
0:12 Ang problema: presyong hula lang
0:37 Para kanino ito
0:53 Subukan sa isang tap
1:14 Step 1: Totoong gastos
1:42 Step 2: Tamang presyo
2:06 Tumaas ang presyo? Walang problema
2:20 Step 3: Bayaran ang bills
2:40 Receipt Simulator
3:05 Margin & POS Simulator
3:22 Paano ito makakatulong
3:36 May POS ka na? Ituloy mo lang

📱 Libre, walang sign-up, English o Tagalog, sa phone man o laptop.
👉 Subukan na: amore-cost.vercel.app
Pindutin lang ang "Try with sample recipes" para makita agad.

May tanong ka sa pag-presyo ng menu mo? I-comment mo lang, sasagutin namin! 👇
I-share sa kakilala mong may food business 🙏

#AmoreCost #FoodBusinessPH #Carinderia #HomeBakerPH #FoodCartBusiness #SmallBusinessPH #NegosyoTips #FoodCosting
```

**Short version** (for a Reel or a 30–60 s clip cut from the video):

```
Sigurado ka bang may kita ang adobo mo? 🍗
₱80.08 ang totoong gastos, ₱299 ang tamang presyo, ₱213.57 para sa Senior/PWD. Kinompute lahat ng Amore Cost 💚
Libre, walang sign-up 👉 amore-cost.vercel.app
#AmoreCost #FoodBusinessPH #Carinderia
```

---

## Posting tips

- **Order:** Post 1 first and pin it. Then one post every 3–4 days.
- **Best times** for PH small-business owners: around 8–9 PM, after closing, or 5–6 AM before market.
- **Show, don't tell:** a 15–30 s clip from `docs/marketing/video/out/amore-cost-presentation-taglish.mp4` (the receipt or yield part) usually gets more reach than a still image.
- **Reply to every comment** in the first hour. Those are your Stage 1 validation conversations (see `docs/roadmap/roadmap.md`), so note who asks what.
