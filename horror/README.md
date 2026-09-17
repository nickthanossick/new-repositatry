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
| `H` | **hint** — abhi karna kya hai, poora bata dega |
| `G` | guide arrow on / off (agar bina madad ke khelna ho) |
| `ESC` | pause |

Menu me **Mission chuno** se kisi bhi mission se shuru kar sakte ho.

## Intro story

**Enter IGMC** dabate hi tumhari **asli 10 storyboard sketches** chalti hain —
title card (*NIKJYAR STUDIOS PRESENTS · SHIMLA HORROR: IGMC · EPISODE I*) pehli sketch ke
upar, phir Nirmala ki raat: ambulance, delivery, "bachcha nahi raha", flatline, khaali
corridor, aur aakhir me Pandit torch leke darwaze par. Har frame par halka Ken-Burns pan,
aakhri do par red wash + microshake, aur saath me sting/whisper/cry audio. Upar-daayein
**SKIP >>**. Menu ke **Mission chuno** se shuru karo to intro skip ho jaati hai.

Sketches **jaisi hain waisi hi** dikhti hain — koi colour grade nahi, `object-fit:contain`
se poora frame (drawn paper border ke saath) screen par aata hai. Captions HTML overlay hain
taaki spelling exact rahe. Fallback ke taur par code se draw hone wale frames ab bhi maujood
hain, wo tabhi chalte hain jab koi image load na ho.

## Hints — "samajh nahi aa raha kya karna hai" ka ilaaj

Teen cheezein saath chalti hain:

* **Teer (arrow)** — crosshair ke chaaro taraf ek ring par ghoomta hai aur hamesha agle kaam
  ki taraf point karta hai. Target doosre floor par ho to teer pehle **seedhi** dikhata hai,
  aur stairwell ke andar pahunchte hi flight ki taraf mud jaata hai.
* **Distance line** — teer ke neeche: cheez ka naam aur kitne meter door hai
  (`RONE KI AAWAZ (1/3) · 32 m`). Paas aane par `YAHI HAI`.
* **Hint box** — har naye beat par apne aap 6 second dikhta hai, **H** par kabhi bhi,
  aur agar 38 second tak beat aage na badhe to khud aa jaata hai. Har mission beat ka apna
  Hinglish hint likha hua hai.

Target apne aap nikalta hai: jo item/hotspot abhi live hai usme se sabse paas wala. Jin beats
me koi pickup nahi hai (bhaago, chhupo, corridor ke sire tak jao) unpe beat ka apna
`guide()` lagaya hua hai. Torch cells tabhi target bante hain jab aur kuch bacha na ho.
Cutscene, tape, note aur choice ke waqt guide chhup jaata hai. **G** se poora band.

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
| `assets/hospital.glb` | tumhara IGMC Hospital Exact model — 8k tris, apne signboards ke saath |
| `assets/terrain.png` | 512² map us model se bake kiya: R+G = ground height, B = collision |
| `assets/props_small.glb` | tumhare 30 small horror objects (khoon, baby cheezein, ritual saamaan) |
| `assets/music.mp3` | Corridor Of Whispers — loop me background score |
| `assets/props.glb` | tumhare 35 OBJ props (bed, wheelchair, cradle, diya, ghanti, generator…) |
| `assets/chudail.glb` | Nirmala — tumhara naya chudail GLB (59.7k tris), UVs ke saath |
| `assets/chudail_tex.jpg` | uski asli base-colour texture, 2048 se 1024 par re-encode ki hui |
| `assets/floor_tile.png` | hospital floor — tumhare granite tile ko pale grey-white terrazzo me convert kiya |
| `assets/igmc_sign.png` | asli IGMC signboard ki photo, deskew karke banner crop kiya |
| `assets/intro0.jpg` … `intro9.jpg` | tumhari 10 intro storyboard sketches, 1376×768, PNG se JPEG (20.8 MB → 2.9 MB) |

**Chudail:** tumhara bheja hua GLB seedha use hota hai — 59,729 tris, apni asli texture ke
saath (2048 se 1024 par re-encode, 3.3 MB se 308 KB). Model 1.80 m par scale kiya aur -Z ki
taraf ghumaya, kyunki game ki convention wahi hai.

**Laal aankhein:** texture me pehle se laal texels the — unhe UV se dhoondh ke ek per-vertex
mask banaya (co-located vertices link karke, kyunki mesh unwelded soup hai). Shader us mask
par diffuse ko laal karta hai aur emissive add karta hai (`uGlow`), is liye **poore andhere me
sirf uski aankhein dikhti hain**. Normals byte me aur UVs short me quantize kiye — file 4.5 MB
se 3.16 MB.

**Movements:** motions pack sirf fal.media URLs ka tha aur wo CDN yahan block hai, is liye
saare movements **vertex shader me** banaye gaye hain — CPU par cost zero, GPU par bhi
kuch nahi. Chaar motions ek saath blend hote hain:

| motion | kaisa dikhta hai | kab |
|---|---|---|
| creepy walk | dheere se roll, hem peeche ghisatta hua, sar ulti taraf luddhakta hua | patrol, ritual |
| mummy stagger | stepped, jhatke wala lurch, ek kandha gira hua, aage jhuka hua | chase, dark |
| attack lunge | poora upper body aage phenka, dono haath pakadne ke liye bahar | jab 3.4 m ke andar aaye |
| crawl | aadhi height, aage ghisatti hui | reserve |

Har mode ka target pose `Ghost.poseFor()` deta hai, `Ghost.motion()` usme lerp karke shader
uniforms (`uPh/uWalk/uStag/uAtk/uCrawl`) set karta hai, aur usi phase se body ka bob, roll
aur yaw-snap bhi aata hai — is liye kadam aur jhatka sync me rehte hain.

## Files

```
horror/
  index.html               poora game (~3800 lines, three.js module)
  andhera-standalone.html  single-file build — sab inline, offline chalta hai
  lib/                     three.js r180, npm se vendor kiya (MIT)
  assets/                  glb + png
  tools/build-single.js    standalone file dobara banane ke liye
```

## Debugging

Console me `window.IGMC`: `tp(x,z,yaw)`, `setFloor(n)`, `startRun(m)`, `skip()` (agla beat),
`give(id)`, `Ghost`, `Guide`, `Intro`, `Story.beats`, `Int.floors[f].special`.

Chudail ke pose test karne ke liye: `IGMC.MAT.ghost.userData.shader.uniforms.uAtk.value=1`.

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

## Torch

Sirf torch dikhti hai — koi haath nahi. Steel barrel, knurled grip, laal switch. Chalne pe
sway karti hai, chudail paas ho to kaanpti hai. Ek chhoti lamp sirf usi par padti hai taaki
kabhi flat black na dikhe.

## Performance

Har floor ki saari scenery (bade props + 30 chhote objects) ek hi merged mesh me jaati hai,
is liye 400+ objects hone ke bawajood draw calls ~79 rehte hain (pehle ~185 the). Naya
hospital model 8k tris ka hai (purana scan 272k tha), to exterior ab bahut halka hai.

## Aage kya ho sakta hai

Rigged chudail skeleton (abhi shader-deform hai), saved progress, mobile touch controls,
aur voice-over ke liye asli audio clips (abhi sab WebAudio se synth hai).
