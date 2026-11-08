# Art request: Town Wings (paste into ChatGPT)

Extend each of my eight existing "Questing Heroes" layered town scenes so every building has a real, purpose-made spot. Match the existing packs exactly: same 64-colour palette, dark outlines, light from the upper left, warm storybook fantasy pixel art, transparent PNGs, nearest-neighbour only.

## What I have now

Each banner has a 640×360 town scene (background plus separate building layers). The game shows the town in a **960×360** frame, so today the extra 160 px on each side is a mirrored copy of the scene's edges. Six extra buildings (and one Rangers dwelling) stand in that mirrored strip. I want real ground there instead.

## What to make, per banner

**A new 960×360 background** for each banner, with no buildings on it:

- **The centre 640×360 (x = 160 to 799) must stay pixel-for-pixel identical to the current `background.png`**, so every existing building layer still lines up when shifted right by 160 px.
- The new left wing (x 0-159) and right wing (x 800-959) continue the same ground, paths, trees, sky and mood naturally. Do not mirror anything.
- In the wings, leave **flat, empty lots** where these buildings will stand. Paths should lead to them from the existing town.

**Lots needed** (the building art already exists as 128×128 sprites, foot at bottom-centre (64,120); about 112 px wide and up to 110 px tall):

| Banner | Lots needed in the wings |
|---|---|
| Rangers | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Bramble Warren, Waystone Circle, **Heartwood Grove** (7) |
| Wizards | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Owl Roost, Arcane Conduit (6) |
| Necromancers | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Ossuary, Soul Vault (6) |
| Beast Masters | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Den of Plenty (5; Great Paddock is already the Trail Corral) |
| Pirates | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Grog Hall (5; Smugglers' Cove is already the Shipyard) |
| Elves | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Seedling Grove, Sylvan Spring (6) |
| Dwarves | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Delving Halls, Deep Seam (6) |
| Merfolk | Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, Spawning Pools, Tide Market (6) |

Three or four lots fit in each 160 px wing if they are staggered in depth (back row higher on screen, front row lower). Lots may also sit in genuinely empty ground inside the centre scene if you find room, but the centre pixels must not change.

## Deliver

- `towns/<banner>/background_960.png` (960×360, opaque), banner folders: rangers, wizards, necro, centaurs (Beast Masters), pirates, elves, dwarves, merfolk.
- `towns/<banner>/lots.json`: for each lot, the building id and the **foot point** `[x, y]` in 960×360 coordinates where the sprite's bottom-centre (64,120) lands, plus a draw order (back to front). Building ids: `reliquary`, `lodge`, `lib2`, `still`, `fb1`, `fb3`, and `d5` for the Rangers Heartwood Grove.
- A preview PNG of each town with every building placed, so I can check the fit.
- Optional, if any sprite looks wrong in its lot: a re-drawn 128×128 version of that building in the same format.

Please send each banner (or all eight) as **one ZIP with one background and one JSON per banner**. No separate per-frame files.
