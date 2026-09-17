# IGMC: NIGHT WATCH

Paanch-mission first-person horror, IGMC Shimla ke andar. Tu Dev Pandit hai — ek chudail
(Naina Thakur) apni maut ke aakhri dus minute baar baar jee rahi hai, aur usse maarna nahi,
**sach dena** hai.

Sab kuch browser me chalta hai. Koi build step nahi, koi CDN nahi.

## Netlify par daalna

Do raste hain. Dono me **repo root ka `index.html` mat deploy karna** — wo ek alag
purana project hai (Placement Tracker), aur Netlify default me wahi serve kar deta hai.

**1. Drag and drop (sabse aasaan)**

```bash
node horror/tools/make-site.js      # horror/igmc-netlify.zip banata hai, ~8.4 MB
```

Us zip ko https://app.netlify.com/drop par kheench ke chhod do. Bas. Na git, na branch,
na build settings.

**2. Git se jodna**

Repo me `netlify.toml` pada hai jo `publish = "horror"` set karta hai, to publish
directory apne aap sahi ho jaati hai. **Branch zaroor badalna padega** — Netlify default
branch (`claude/batch-outreach-bulk-operations-81blgn`) leta hai aur usme game hai hi
nahi. Netlify me jao:

*Site configuration → Build & deploy → Branches and deploy contexts →
Production branch* → `claude/affectionate-volta-e3zcn6`

Build command khaali chhod do. `netlify.toml` GLB, JS aur MP3 ke content-types aur
caching bhi set kar deta hai.

**18 MB wali single file Netlify par mat daalo.** `andhera-standalone.html` offline
double-click ke liye hai; web par alag files bahut behtar chalti hain — browser
progressively load karta hai aur dobara aane par cache se uthata hai.

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
| `SHIFT` | daudna (kadam zor se padte hain — wo sun leti hai) |
| mouse | dekhna |
| `F` | torch on / off |
| `E` / click | darwaza, cheez uthao, kaagaz padho, interact |
| `J` | **test** — chudail bulao / wapas bhejo |
| `R` | torch ka cell badlo |
| `TAB` | objective dobara dekho |
| `H` | **hint** — chhota HINT wala button khol/band karo |
| `G` | guide arrow on / off (agar bina madad ke khelna ho) |
| `ESC` | pause (yahin se **Save** bhi) |

### Phone par

Phone ya tablet apne aap pehchaan liya jaata hai — koi setting nahi.

* **baaya angutha** — screen ke baayen aadhe hisse me jahan bhi rakho, wahin joystick
  ban jaata hai. **Aage, peeche, daayen, baayen** — chaaron taraf. Jitna door tak
  kheenchoge utni tez chal, aur kinare tak le jao to **daud**. Shuru me ek halka sa
  ring dikhta hai taaki pata chale kahan rakhna hai.
* **daayi taraf ungli ghumao** — idhar udhar dekhne ke liye. Dono angutha ek saath
  chalte hain — chalte chalte ghum sakte ho.
* **daayin taraf ke buttons** — bada green **E** (darwaza / cheez / interact), **torch**,
  **cell badlo**, aur **II** pause
* **HINT** chip upar beech me — tap karo, padho, phir se tap karo to band

Landscape me pakdo. Input asli **touch events** par chalta hai (pointer events par nahi),
kyunki phone browsers me wahi bharosemand hai.

Menu me **Mission chuno** se kisi bhi mission se shuru kar sakte ho.

## Deewarein — white, aur uske aate hi grey

Interior ab **saaf hospital white** hai. Pehle jo brown/sepia lagta tha wo do cheezon se
aa raha tha: paint texture ka green dado + peela grime, aur torch ki cream roshni. Dono
theek kiye — paint ab neutral grey grime ke saath white hai, skirting band thanda grey,
aur torch ki roshni lagbhag safed.

Par **jaise hi wo paas aati hai**, `Walls` poori building ka rang kheench leta hai:
white se **grey**. Ye flicker karta hai (har 40–160 ms halka jhatka) taaki lage rang
nichoda ja raha hai, sirf tint nahi. Saari deewarein, ceiling aur props ek-ek material
share karte hain, is liye ye poore floor par teen assignment ka kaam hai — ek bhi
draw call nahi badhta. `hauntSurge` turant push deta hai, phir `P.danger` sambhal leta hai.

## Har 15 second — `Jolt`

Chaar cheezon me se ek, har **13–18 second**, aur kabhi do baar ek jaisi nahi:

* **Wheelchair** andhere se nikal ke tumhare kandhe ke paas se guzarti hai aur **dhadam**
  se takrati hai — castors ki cheekh ke saath. Spawn corridor me bhi mil jaata hai
  (peeche/bagal me free jagah dhoondhta hai, 6/6 positions par test kiya).
* **Ud ke aata object** — extinguisher, cylinder, tray, file stack — corridor ke aage se
  seedha tumhare sar ke paas se 15 m/s par nikalta hai aur deewar se takrata hai.
* **Chhat se girta saaman** tumhare theek saamne, khanakta hua.
* **Paas ka darwaza** achanak khul/band ho jaata hai.

Sab me: slam + low thud, camera shake, torch stutter aur pulse chadhta hai. Poore game me
sirf **chaar** meshes ka pool hai jo recycle hote hain — game chalte waqt kuch allocate
nahi hota.

## Hindi signage — 30 boards

Tumhare pack ke saare 30 Hindi signboards lage hue hain: department boards (आपातकालीन
विभाग, ऑपरेशन थिएटर, आईसीयू, महिला/पुरुष वार्ड, रक्त बैंक…) har tagged room ke darwaze
ke paas, aur public notices (कृपया शांति बनाए रखें, धूम्रपान निषेध, बेटी बचाओ…) corridor
ki deewaron par. Ground floor ke gate par **आईजीएमसी में आपका स्वागत है**.

Teeso PNG ek **atlas** me pack ki hui hain (`assets/hindi_signs.jpg`, 2560×1536, 612 KB)
aur har floor ke saare board ek hi merged mesh hain — poore floor ki signage **ek draw
call**.

## Graphics

Default **ULTRA** hai — phone par bhi. Pause menu (**ESC** / **II**) me *Graphics* button
se teen level ghoomte hain aur choice yaad rakhi jaati hai:

| level | pixel ratio | shadows | anisotropy |
|---|---|---|---|
| **ULTRA** | 2.0 tak | PCF soft, 2048 map | 16x |
| **HIGH** | 1.5 tak | PCF soft, 1024 map | 8x |
| **BALANCED** | 1.0 | band | 4x |

Ultra apne aap kabhi nahi badalta. Haan, agar device 6 second tak 24 fps se neeche
rahe to ek baar bata deta hai ki HIGH kar lo — badalta khud nahi.

## Save aur maut

**Teen mauke.** Marne par tum **wahin se** wapas aate ho — wahi floor, wahi corridor,
wahi beat. Wo bhaga di jaati hai, torch ka cell bhar jaata hai aur 3 second ki
chhoot milti hai taaki respawn hote hi phir na maaro. **Chautha** marne par mission
apni shuruaat se chalta hai aur teeno mauke wapas mil jaate hain.

**Checkpoint apne aap banta hai** — har objective badalne par. Menu me **Continue**
tabhi dikhta hai jab koi save ho, aur pause menu me **Save** button hai. Save me
mission, beat, floor, position, saamaan, torch ke cells aur bacha hua time sab hota hai;
load karte waqt game pehle ke beats ko chup-chaap dobara chala deta hai (koi cutscene,
koi subtitle nahi) aur tumhe theek wahin khada kar deta hai.

Save browser ke localStorage me jaata hai, is liye tab band karke wapas aane par bhi
rehta hai.

## Awaaz

Abhi ka saara audio WebAudio se synth hota hai — koi file nahi. FAL wala recorded pack
seedha upar se chadh sakta hai: pack ke script se MP3 download karke `audio` folder
`horror/assets/` me daal do (`assets/audio/sfx/...`, `assets/audio/dialogue/naina/...`),
bas. Har cue pehle recording dhoondhta hai, na mile to synth chala leta hai — ek ek
karke, kuch todta nahi. `assets/audio/README.txt` me poori list hai.

Naina, Pandit, Police aur Doctor ki lines `say()` ke exact text se match hoti hain, is
liye dialogue bhi apne aap bajne lagega.

## Intro story

**Enter IGMC** dabate hi tumhari **asli 10 storyboard sketches** chalti hain —
title card (*NIKJYAR STUDIOS PRESENTS · SHIMLA HORROR: IGMC · EPISODE I*) pehli sketch ke
upar, phir Naina ki raat: ambulance, delivery, "bachcha nahi raha", flatline, khaali
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
* **HINT chip** — ek chhota sa button. Naya objective aate hi ye **blink** karta hai;
  tap (ya **H**) karo to chhota sa panel khulta hai, dobara tap karo to band. Apne aap
  sirf ek baar khulta hai agar 34 second tak kuch aage na badhe — uske baad sirf blink
  karta hai. Screen kabhi text se nahi bharti.

Target apne aap nikalta hai: jo item/hotspot abhi live hai usme se sabse paas wala. Jin beats
me koi pickup nahi hai (bhaago, chhupo, corridor ke sire tak jao) unpe beat ka apna
`guide()` lagaya hua hai. Torch cells tabhi target bante hain jab aur kuch bacha na ho.
Cutscene, tape, note aur choice ke waqt guide chhup jaata hai. **G** se poora band.

## Missions

1. **THE CRYING FLOOR** — Ground → Floor 2. Rone ki aawaz peecha karta hai par har baar jagah
   badal deti hai. Wheelchair khud hilti hai, lift khaali andhere me khulti hai, chaadar ke
   neeche koi hota hai — aur nahi hota. Maternity register milta hai. Floor 2 pe Naina pehli
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
| `assets/chudail.glb` | Naina — tumhara naya chudail GLB (59.7k tris), UVs ke saath |
| `assets/chudail_tex.jpg` | uski asli base-colour texture, 2048 se 1024 par re-encode ki hui |
| `assets/floor_tile.png` | hospital floor — tumhare granite tile ko pale grey-white terrazzo me convert kiya |
| `assets/igmc_sign.png` | asli IGMC signboard ki photo, deskew karke banner crop kiya |
| `assets/intro0.jpg` … `intro9.jpg` | tumhari 10 intro storyboard sketches, 1376×768, PNG se JPEG (20.8 MB → 2.9 MB) |

**Chudail:** tumhara bheja hua GLB seedha use hota hai — 59,729 tris, apni asli texture ke
saath (2048 se 1024 par re-encode, 3.3 MB se 308 KB). Model 1.80 m par scale kiya aur -Z ki
taraf ghumaya, kyunki game ki convention wahi hai.

**Brown skin aur khoon:** texture ek fragmented atlas hai jisme skin aur kapda alag nahi
kiye ja sakte, is liye body ko **object-space position se** pehchana jaata hai — chehra
(upar, beech me, aage ki taraf) aur baahein/haath (kandhe ke neeche, bagal me). Wahan
diffuse ko brown kiya jaata hai (texture ki apni shading rakhte hue), aur chehre, haath
aur seene se **khoon ke dhaare** neeche bahte hain (position-based noise). Saree ko halki
warmth aur hem par gandagi di gayi.

Sabse bada farq: self-light ab **skin par 22%** hai. Pehle poora body barabar chamakta
tha — wahi use "robotic" bana raha tha.

**Laal aankhein:** texture me pehle se laal texels the — unhe UV se dhoondh ke ek per-vertex
mask banaya (co-located vertices link karke, kyunki mesh unwelded soup hai). Shader us mask
par diffuse ko laal karta hai aur emissive add karta hai (`uGlow`), is liye **poore andhere me
sirf uski aankhein dikhti hain**. Normals byte me aur UVs short me quantize kiye — file 4.5 MB
se 3.16 MB.

**Movements:** Wo **hilti nahi**. Mesh par koi deformation nahi hai — wo bilkul model jaisi, seedhi
khadi rehti hai, aur chalti hai to bas glide karti hai. Darr uske hilne se nahi, uske
**achanak wahan hone** se aata hai:

| kya | kab |
|---|---|
| **Jumpscare — saamne aa jaana** | tum jis taraf dekh rahe ho theek wahan, 2.4–3.4 m par, 11–19 sec me ek baar — sirf tab jab wo abhi nazar me na ho. Sting + scream + camera shake + **torch bujh jaati hai** + laal flash, sab ek hi frame par. |
| **Dash** | 3.6–7.2 sec me ek baar achanak do guna tez, scream ke saath |
| **Chhupi hui glimpse** | kabhi kabhi wo saamne aati hai, maarti nahi — torch sambhalne tak gayab |

**Payal.** Uske paas aane se bahut pehle uski payal sunai deti hai. 26 m par bilkul
chhupi hui, 18 m par sirf ek halki chan, 12 m par saaf, 3 m par kaan ke bilkul paas.
Awaaz ki **raftaar bhi** badhti hai — door ho to dheere dheere, paas aaye to tez, aur
dash ke waqt dugni. Wo ruki ho to bas kabhi kabhi khanakti hai.

**Aur wo lambi hoti jaati hai.** 13 m se paas aate hi height chadhni shuru hoti hai —
point blank par **1.4 guna**, aur chaudai sirf 1.15 guna, is liye wo mota nahi balki
**galat** lagti hai. Sar chhat ke paas aa jaata hai.

## Wo dikhti kaisi hai

Pehle wo andhere me kaali dikhti thi. Ab uska shader use **apni roshni** deta hai
(`uSelf`) aur ek thandi rim (`uRim`) — dono itne halke ki texture dhulti nahi, par poore
andhere me bhi wo **model jaisi** dikhti hai, kaala dhabba nahi. Jitna paas aati hai utni
tez hoti jaati hai.

Aankhein alag se: texture ke laal texels se bana per-vertex mask diffuse ko laal karta hai
aur emissive add karta hai, tone mapping ke neeche rehte hue — is liye wo **laal** rehti
hain, safed nahi hoti.

## Aur bhi darawna — `Dread`

Ye sab sasta hai (sound, ek light, ek CSS overlay), ek bhi draw call nahi badhta, is liye
kisi bhi floor par kabhi bhi chal sakta hai:

* **Uska chehra** — poore andhere se ek frame ke liye screen bhar jaata hai, scream + shake
  + torch stutter ke saath. 85–170 sec me ek baar, aur sirf jab wo khud aas paas na ho.
* **Aage ki battiyan** — tumhare saamne wali paanch tube lights ek ek karke bujhti hain.
* **Peeche kadam** — 3 se 5 kadam tumhare peeche, phir chup.
* **Khoon** — jitna khatra badhta hai utna screen ke kinaron par laal chadhta hai
  (torch khatam ho ya bijli chali jaye to aur).
* Darwaza slam, bachche ka rona, corridor paar karti parchhaiyan, PA announcement.

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
