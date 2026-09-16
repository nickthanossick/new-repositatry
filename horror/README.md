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
| `assets/chudail.glb` | Nirmala — chudail pack ke baked OBJ geometry se |
| `assets/floor_tile.png` | brown granite tile floor texture |

**Chudail pack ke baare me:** us zip me sirf `fal.media` ke URL the (model.glb, rigged_character.glb,
walking/running animations) aur ek integrated HTML. Ye environment fal CDN tak nahi pahunch sakta,
lekin us HTML ke andar chudail ka **baked mesh** (exact source OBJ geometry + MTL colours) mila —
wahi extract karke `chudail.glb` banaya. Jo cheez nahi mili wo hai **rigged skeleton + walking/running
animations**. Agar tum `chudail_full_asset_pack_with_animations/scripts/download_assets.sh` chala ke
`rigged_character.glb` + `walking.glb` le aao, to unhe support karne ke liye skinned-mesh loader
add karna padega — abhi game static mesh ko procedurally hilata hai (bob, sway, turn).

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

## Aage kya ho sakta hai

Rigged chudail + real walk/run animations, saved progress, mobile touch controls,
aur voice-over ke liye asli audio clips (abhi sab WebAudio se synth hai).
