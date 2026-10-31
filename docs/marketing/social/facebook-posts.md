# Facebook posts — Amore Cost page

Ready to paste, one image each (`post-1.png` … `post-4.png`, 1080×1350,
the 4:5 size that fills the most screen in the feed). Images are
rendered from [post-images.html](post-images.html) by `render-posts.cjs`. Taglish, written for small PH food-business owners
(carinderia, home baker, food cart, online seller). Every number below
comes from the app's sample recipes (`src/lib/demo.ts`), so anyone who
taps "Try with sample recipes" sees the same figures.

Before posting, make sure https://amore-cost.vercel.app is deployed
(`vercel --prod`). Otherwise people land on the old version, without the
sample recipes, yield or rounding.

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

## Posting tips

- **Order:** Post 1 first and pin it. Then one post every 3–4 days.
- **Best times** for PH small-business owners: around 8–9 PM, after closing, or 5–6 AM before market.
- **Show, don't tell:** a 15–30 s clip from `docs/marketing/video/out/amore-cost-presentation-taglish.mp4` (the receipt or yield part) usually gets more reach than a still image.
- **Reply to every comment** in the first hour. Those are your Stage 1 validation conversations (see `docs/roadmap/roadmap.md`), so note who asks what.
