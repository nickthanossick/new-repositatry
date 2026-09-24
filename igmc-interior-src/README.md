# IGMC: Night Watch — hyper-real interior (source)

`../IGMC_Night_Watch_6_Missions_HYPER_REAL_INTERIOR.html` is the playable single-file game.
This folder holds the readable source of the interior rebuild that was spliced into it.

| file | what it does |
|---|---|
| `ri_a_core.js` | GPU texture bake (plaster, terrazzo, vitrified tile, ceiling tile, micro-detail, Shimla night panorama) and the surface shaders for walls, floors, ceilings, props and window glass |
| `ri_b_geo.js` | geometry kit: rounded boxes, swept tubes with bent corners, lathe, cloth, per-vertex PBR merging, bounding-box fitting |
| `ri_c_props.js` | the high-poly prop library (beds, wheelchairs, stretcher, drip stand, monitor, O₂ cylinder, cabinets, almirah, counter, waiting chairs, cot, morgue chamber, OT lamp, generator, DB panel, CCTV desk, curtains, clock, extinguisher, signboards, …) |
| `ri_d_arch.js` | fittings and the per-floor dresser: doors, frames, skirting, windows, troffers, switchboards, conduit, plates, stairs, lift, signage, AO atlas, instancing |
| `ri_e_fx.js` | ward curtains, fans, pipes, dust in the torch beam, lightning in the windows, GPU warm-up, per-frame update |
| `ri_f_text.js` | English text layer (every on-screen line translated on its way into the page; voice-over keys untouched), the quieter HUD, the English wall-notice atlas |
| `ri_g_haunt.js` | the haunted-hospital dressing: case files and red-cloth bundles, syringes, ampoules, gloves, masks, dropped and hanging bloody coats, lockers, filing cabinets, monobloc chairs, ward screens, body bags, handrails and gas lines, x-ray viewers, and the blood decal shader (pools, drags, spatter, handprints, drips, footprints, wall writing) |
| `ri_h_hand.js` | the first-person view model: a signed-distance hand meshed with surface nets and gripping a knurled torch with no gap, veined skin shader, forearm hair, nails, and the torch beam |
| `build.py` | applies the rebuild to the original game file |

Rebuild:

```
python3 build.py <original IGMC_Night_Watch ... .html> <output.html>
```

Guarantees kept by the build: every prop is fitted to the bounding box of the prop it replaces, collisions
use the original footprints, and replaced legacy boxes consume the same random draws — so each floor's
collision rects, doors, nav grid, lights and room assignments are identical to the original for the same
random stream. Naina, the story items, missions and audio are not touched. The new clutter uses its own random stream;
the few tall pieces (lockers, cabinets, screens, chairs) stand against walls and have their own player colliders.
Mission transitions are shorter and no longer recompile shaders (the GPU is warmed behind the menu).
