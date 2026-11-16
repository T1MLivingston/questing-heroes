# What would make the game better (v50)

Match the existing packs: warm storybook pixel art, dark plum outline (#2b1a33), light from the upper left, crisp pixel grid, no anti-aliasing, transparent PNGs, original designs, no text in the images.

## 1. Sound and music (the game is silent today)
- **Music, 4 loops** (1-2 min, seamless, gentle orchestral/folk fantasy): title screen, adventure map, battle, town.
- **Sound effects, about 20 short clips** (under 1 s, OGG or MP3): button click, footstep, pick up gold/resource, claim mine, build, recruit, day end (hourglass), sword hit, arrow, spell cast, heal, unit defeated, victory fanfare, defeat sting, level up, open town gate, boat board/splash, lighthouse chime, haggle coin.
- Must be free to use (made by you, CC0, or AI-generated with commercial-free rights). I'll add a mute button and volume.

## 2. Spell icons (14) and missing spell effects (5)
- **Icons, 64×64 each, one atlas 7 a row:** Ember Dart, Chain Spark, Squall, Entangle, Raise Bones, Geyser, Mend, Swift Wind, Bark Skin, Starfall, Weaken, Frost Lance, Rally, Meteor. Shown in the spellbook, Library and level-up.
- **Battle effect strips (4-6 frames, about 96×96):** Geyser, Weaken, Frost Lance, Rally, Meteor. Today Frost Lance borrows Squall, Meteor borrows Starfall, Rally borrows Mend, and Geyser and Weaken have none.

## 3. Hero map walkers (biggest visual gap)
About 140 heroes walk the map as their banner's generic figure. One 192×384 sheet per hero (4 frames × 8 directions, 48×48 frames, foot at 24,44), packed 7 sheets a row with a JSON of hero id → cell. Start with each banner's first 8 heroes (about 46 still missing), then the rest of the 16.

## 0. Current list (v63, 2026-11-15)

**Portraits still in the old style**: Dusty, plus King Pharoph the 3rd with three eyes. (Upscaled Redraws in v64 replaced Sookie, Bear, Monkey, William IV, Eden, Michael, Hush, Dupengeiser, Grimes, Ivan, Slack, Kiln, Schmickle, Boone, Rocky, Letchworth, Eelvis, Skimmer and Inkwake.) Already updated in v63 from Headshot Workshop 02: Boopis, Engelman, Rimmer, Tempest, Rago, Binx.

**Battle figures still missing** (Movement Sprites format: on foot, 6 poses, 64x64 or 96x64): Mossback, Fern, Spindle, Coral, Penny, India, Rusk Hookhorn, Thornfrill, Mara, Sid & Tess, Wren, Mags & Mae, Odo & Otto, Aster & Briar, Ned & Nat, Spike, Rafe & Reed, Fut, Luckenzo, Larishna, Nanya, Posy Spinner, Katherine, King Pharoph the 3rd.

**Map walkers on foot**: 148 of 166 heroes still walk the map as their banner's walker. A personal on-foot walker (48x48, 4 phases x 8 directions, like the mounted ones) would be the next biggest visual step. Mounted map walkers exist for 23 heroes; the rest ride as their on-foot walker.

## 4. Portrait redraws to match the newer style
These older portraits look flatter and darker than the rest: Bear, Monkey, Binx, Boopis, Schmickle, Engelman, Rimmer, Tempest, Rago, William IV, Grimes, Ivan, Dupengeiser, Slack, Kiln, Rocky, Eelvis, Skimmer, Inkwake (blue ink squid). Same 128×128 format, transparent background, chest-up bust facing slightly right; keep each character recognisable.

## 5. Battle hero figures
Today each banner has one figure beside the battlefield. Ideal: one per hero; a good middle step is two per banner (a Might figure and a Magic figure), 16 in all, same size and flag-mask layout as `battle/heroes/<fac>.png`.

## 6. UI icons (64×64)
Market (scales), Mines (pickaxe), Retreat (running boot/white flag), Haggle (handshake), Tavern round (mug), Dismiss hero, Hero file save/load. They replace emoji on buttons.

## 7. Small fixes
- **Sorcery** skill icon (borrows the spellbook icon).
- **Inkwake** redraw as a blue ink squid captain.
- **Sookie** and **Tempest**: upgraded portraits (Tim has these to upload).
- **King Pharoph the 3rd**: redraw with three eyes (a third eye in the forehead, as "the 3rd").
- **Lighthouse** as a lit map site (2 frames: dark, lit) so it shows when it has revealed the coast.

## 8. From the classroom
Play-test notes from students: what is confusing, which heroes feel too weak or strong, and the hero files they make with Create a hero.
