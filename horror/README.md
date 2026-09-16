# ANDHERA — IGMC Shimla

First-person horror game. Tu building ke bahar torch leke khada hai; andar dus manzilein hain.
Chhat tak pahunchna hai.

Sab kuch browser me chalta hai — koi build step nahi, koi CDN nahi.

## Khelna kaise hai

Ye `file://` se nahi chalega (assets fetch block ho jaate hain). Ek chhota server chahiye:

```bash
cd horror
python3 -m http.server 8000
# phir kholo: http://localhost:8000/
```

GitHub Pages pe repo publish ho to seedha `<pages-url>/horror/` khul jaayega.

## Controls

| key | kaam |
|---|---|
| `W A S D` | chalna |
| `SHIFT` | daudna (awaaz hoti hai) |
| mouse | dekhna |
| `F` | torch on / off |
| `E` / click | darwaza kholo, cheez uthao, note padho |
| `R` | torch ka cell badlo |
| `ESC` | pause |

## Kya bana hua hai

**Bahar** — asli IGMC Shimla ka 3D scan (`assets/igmc.glb`). Model me koi texture nahi
thi, is liye uske colours bake kiye gaye hain: cream/beige plaster, dark glass windows,
grey concrete roof, hillside ka green, plus voxel ambient-occlusion. Seedhiyan, porch ka
darwaza, signboard, lamp posts aur barish mere add kiye hue hain.

**Andar** — poora procedural. Har floor ek hospital block hai: perimeter wards ka band,
uske andar corridor ring, beech me core (stairwell, lift lobby, wards) aur ek cross
corridor. 31 kamre, beds/gurneys/cabinets, flickering tube lights, EXIT signs.

**Progression** — 10 floors. Floor 3, 6 aur 8 pe stairwell locked hai; us floor pe hi
chaabi (K3 / K6 / K8) padi hai. Notes lore dete hain, spare cells torch chalaate hain.
Floor 10 ke stairwell me chhat ka darwaza = ending.

**Jo peecha karta hai** — floor 4 se aata hai. 1 m grid pe BFS flow-field se raasta
dhoondhta hai, is liye deewaron pe nahi atakta. Torch uske upar maaro to ruk jaata hai,
par battery teen guna tezi se khatam hoti hai.

**Awaaz** — saari WebAudio se synth ki hui hai (koi audio file nahi): drone, hawa,
kadmon ki awaaz, dhadkan, darwaze ki chuun, whispers, bijli ki kadak, jumpscare sting.

## Files

```
horror/
  index.html              poora game (three.js module)
  lib/three.module.min.js three.js r180, npm se vendor kiya (MIT)
  lib/three.core.min.js
  assets/igmc.glb         272k tris, vertex colours — scan se banaya
  assets/terrain.png      512² map: R+G = ground height, B = collision
```

## Debugging

Console me `window.ANDHERA` available hai — `tp(x,z,yaw)`, `setFloor(n)`,
`enterBuilding()`, `Torch.power`, `It`, `Int.floors` waghera.

## Aage kya

Roof ka actual level, lift shaft, saved progress, mobile touch controls,
aur ending cinematic.
