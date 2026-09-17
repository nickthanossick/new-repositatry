# IGMC: NIGHT WATCH

Paanch-mission first-person horror, IGMC Shimla ke andar. Tu Dev Pandit hai — ek chudail
(Nirmala Thakur) apni maut ke aakhri dus minute baar baar jee rahi hai, aur usse maarna nahi,
**sach dena** hai.

Sab kuch browser me chalta hai. Koi build step nahi, koi CDN nahi.

## Khelna kaise hai

```bash
cd horror
python3 -m http.server 8000
# kholo: http://localhost:8000/
```

Ya `andhera-standalone.html` download karke seedha double-click karo — sab kuch us ek file ke
andar hai (server ki zarurat nahi).

## Controls

| key | kaam |
|---|---|
| `W A S D` | chalna |
| `SHIFT` | daudna (awaaz hoti hai — wo sun leti hai) |
| mouse | dekhna |
| `F` | torch on / off |
| `E` / click | darwaza, cheez uthao, kaagaz padho, interact |
| `J` | **test** — chudail bulao / wapas bhejo |
| `R` | torch ka cell badlo |
| `TAB` | objective dobara dekho |
| `ESC` | pause |

Menu me **Mission chuno** se kisi bhi mission se shuru kar sakte ho.

## Missions

1. **THE CRYING FLOOR** — Ground → Floor 2. Rone ki aawaz peecha karta hai par har baar jagah
   badal deti hai. Wheelchair khud hilti hai, lift khaali andhere me khulti hai, chaadar ke
   neeche koi hota hai — aur nahi hota. Maternity register milta hai. Floor 2 pe Nirmala pehli
   baar dikhti hai, batti jaati hai, pehla chase. Ward me chaandi ki paayal.
2. **THE HOSPITAL REMEMBERS** — Floors 3–5. Teen yaadein: nurse ka ID (F3, silhouettes),
   khoon lagi surgical cloth (F4, ab wo patrol karti hai), aur death certificate (F5 — do fuse
   dhoondh ke bijli wapas lao, battiyan ek ek karke jalti hain, aakhri ke neeche wo khadi hai).
3. **DON'T TAKE THE ELEVATOR** — Floor 5 → Basement → Floor 7. Basement me diesel, starter fuse
   aur generator key. Yahan wo **sirf tab chalti hai jab torch bujhi ho**. Generator chalu karne
   ke baad lift chalti hai — par lift 5, 6, 10, B, 2 dikhata hua delivery room pe rukti hai.
4. **THE TENTH MINUTE** — Floors 7–10. Radio pe police, phir teen clue (photograph, medical
   report, complaint letter), Floor 9 pe doctor ka cassette confession, aur Floor 10 — laal
   batti, khaali cradle, poora chase. Prayer room me bachche ka ID band.
5. **MOTHER** — Floor 10 se Floor 2 tak paidal. Har floor pe kuch alag hota hai. Maternity ward
   me cradle ke chaaro taraf paanchon cheezein rakho, phir teen stage ka ritual: diye jalao,
   gayab cheezein wapas laao, teen nishaan pe ghanti bajao. Uske baad jawab dena padta hai.

Phir **false ending** — bahar nikalna, officer, aur jo cheez tumhare paas nahi honi chahiye thi.
Uske baad post-credits stinger.

## Assets

| cheez | kahan se |
|---|---|
| `assets/igmc.glb` | IGMC Shimla ka 3D scan — 272k tris, vertex colours bake kiye hue |
| `assets/terrain.png` | 512² map: R+G = ground height, B = collision |
| `assets/props.glb` | tumhare 35 OBJ props (bed, wheelchair, cradle, diya, ghanti, generator…) |
| `assets/chudail.glb` | Nirmala — tumhara chudail OBJ, colours bake kiye hue |
| `assets/floor_tile.png` | hospital floor — tumhare granite tile ko pale grey-white terrazzo me convert kiya |
| `assets/igmc_sign.png` | asli IGMC signboard ki photo, deskew karke banner crop kiya |

**Chudail:** `assets/chudail.glb` tumhare bheje hue OBJ se bana hai (49,300 tris, 1.80 m tall).
Us OBJ ke saath texture PNG file nahi aayi thi, is liye colours geometry se bake kiye gaye hain:
kaale baal (sar + peeth pe lambi lat + kandhon pe strands), safed/cream saree, pale skin
(haath, pair, chehra), aur **laal aankhein** — do patli slits, gehre socket ke andar. Saath me
per-vertex ambient occlusion aur saree ke neeche mail. Aankhein shader me emissive hain, is liye
poore andhere me bhi chamakti hain (`uGlow` uniform, `MAT.ghost.onBeforeCompile`).

Agar tum `texture_20250901.png` file ke roop me bhej do, to model ke UVs already hain — texture
map seedha laga dunga aur bake ki zarurat nahi rahegi.

Purane chudail pack (jo zip me tha) me sirf `fal.media` ke URL the aur ye environment us CDN tak
nahi pahunch sakta. Rigged skeleton + walking/running animations abhi bhi nahi hain — game static
mesh ko procedurally hilata hai (bob, sway, turn).

Himachali pack (Pandit hands, doctor, nurse, guard) bhi sirf fal URLs the — isliye nurse/doctor
silhouettes chudail mesh ko flat black material me render karke banaye gaye hain.

## Files

```
horror/
  index.html               poora game (~2900 lines, three.js module)
  andhera-standalone.html  single-file build — sab inline, offline chalta hai
  lib/                     three.js r180, npm se vendor kiya (MIT)
  assets/                  glb + png
  tools/build-single.js    standalone file dobara banane ke liye
```

## Debugging

Console me `window.IGMC`: `tp(x,z,yaw)`, `setFloor(n)`, `startRun(m)`, `skip()` (agla beat),
`give(id)`, `Ghost`, `Story.beats`, `Int.floors[f].special`.

## Interior aur roshni

Interior ab **hospital jaisa white** hai: pale terrazzo farsh, safed deewarein jinke neeche
halka hara dado band, safed ceiling panels, aur white laminate darwaze. Torch pehle se
kaafi tez hai (wider cone, thoda neeche jhuka hua, ek near-fill light) — aur ek chhoti
lamp sirf haath par padti hai taaki view model kabhi kaala na dikhe.

**Jab wo aati hai** (`hauntSurge`): torch stutter karti hai (`Torch.storm`), us floor ki
saari tube lights strobe karti hain, aur camera hilta hai. Uske baad jab tak wo paas hai,
`P.danger` ke hisaab se lights randomly bujhti-jalti rehti hain aur camera me halka rumble
rehta hai. Test ke liye **J** dabao.

Signboard building ke saamne, entrance porch ke upar laga hai — 26 m chauda, paanch lamps
se lit.

## Pandit ke haath

Torch aur pandit-hands packs me sirf `fal.media` ke URL the (wo CDN yahan block hai), is liye
first-person haath + torch procedurally banaye hain: kalai, kurta ka cuff, kalava dhaaga,
mutthi jo torch pakadti hai, aur steel torch. Chalne pe sway karta hai aur chudail paas ho to
kaanpta hai. Agar tum in packs ke asli OBJ/GLB bhej do to unhe swap karna aasan hai.

## Aage kya ho sakta hai

Rigged chudail + real walk/run animations, saved progress, mobile touch controls,
aur voice-over ke liye asli audio clips (abhi sab WebAudio se synth hai).
