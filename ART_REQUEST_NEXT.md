# What would make the game better (art and sound inventory, v65, 2026-11-21)

Match the existing packs: warm storybook pixel art, dark plum outline (#2b1a33), light from the upper left, crisp pixel grid, no anti-aliasing, transparent PNGs, original designs, no text in the images. Hero art follows the Movement Sprites pack format (see `CLAUDE.md`, v63).

Already complete (nothing needed): every troop (40 + upgrades, HD strips), every wild monster, every artifact icon, all eight towns (scenes, buildings, extra buildings, map stages), map terrain and sites, setup icons, skill icons (except one), a portrait for every one of the 167 heroes, and the main theme music.

## 1. Hero battle figures (25 heroes still use their banner's figure)
On foot, 6 poses (idle, move A, move B, attack, hit, defeat), 64×64 (or 96×64 for big silhouettes), facing east, pivot width/2,60:
Mossback, Fern, Spindle, Coral, Penny, India, Rusk Hookhorn, Thornfrill, Mara, Sid & Tess, Wren, Mags & Mae, Odo & Otto, Aster & Briar, Ned & Nat, Spike, Rafe & Reed, Fut, Luckenzo, Larishna, Nanya, Posy Spinner, Katherine, King Pharoph the 3rd (three eyes), Zakai.

## 2. Hero map walkers (the biggest visual gap)
- **On foot**: only 18 of 167 heroes have their own walker (Bear, Perry, Dorothy, Oliver, Engelman, Tempest, Parker, Shadow, Boopis, Monkey, Binx, Vargas, Rago, Rimmer, Sookie, Schmickle, William IV, Battaglia). Everyone else walks as their banner's generic figure. One 192×384 sheet per hero (48×48 frames, 4 walk phases × 8 directions s, sw, w, nw, n, ne, e, se, pivot 24,44). Start with each banner's 8 picks (about 50), then the rest.
- **On horseback**: 23 heroes have mounted walkers; the rest ride as their on-foot figure. Lower priority.

## 3. Portraits that look off
- **Dusty**: a wrapped mummy face, almost the same idea as the student hero Sus. Needs its own look (Dusty is a Necromancer Might hero).
- **King Pharoph the 3rd**: add the third eye in the forehead.
- **Kiln**: a dark rock blob; the face is hard to read at small sizes. Lighter stone, clear eyes.
- **Shadow**: very dark skull in a hood; hard to read on dark backgrounds. More rim light or colour.
- **Coral**: a coral plant with no face; reads as an object, not a hero. Give it a face or a coral-armoured merfolk.
- To check with Tim: **Toad** is drawn as a bald man (the name suggests a toad); **Kaf** and **Teo** are both pharaohs; **Gerry** and **Trey** are both red-hooded reapers with scythes. Fine if intended, but they look alike in the Hero Book.

## 4. Spells
- **Spell icons, 14** (64×64, one atlas 7 a row): Ember Dart, Chain Spark, Squall, Entangle, Raise Bones, Geyser, Mend, Swift Wind, Bark Skin, Starfall, Weaken, Frost Lance, Rally, Meteor. Shown in the spellbook, Library, tavern and level-up (today they show text only).
- **Battle effect strips** (4-6 frames, about 96×96): Geyser and Weaken have none; Frost Lance borrows Squall, Rally borrows Mend, Meteor borrows Starfall.

## 5. Small icons and sites
- **Sorcery** skill icon (it borrows the spellbook icon).
- **UI icons** (64×64) to replace emoji on buttons: Market (scales), Mines (pickaxe), Retreat, Ring the bell, Tavern, Hero Book, Create a hero, Kick out hero, Save/Load hero file.
- **Lit lighthouse** map site (2 frames: dark, lit) so a lighthouse shows once it has revealed the coast.

## 6. Sound
- **Music**: only `map.mp3` is still wanted (theme, acoustic, town, battle, victory and defeat are in).
- **Sound effects, about 20** (none yet): click, footstep, coins, pickup, build, recruit, day end, new week, sword, bow, cannon, hit, unit defeated, spell, heal, morale, claim mine, portal, boat, level up, relic, bell, error bonk. A sound player and volume control would be added when they arrive.

## 7. From the classroom
Play-test notes from students: what is confusing, which heroes feel too weak or strong, and the hero files they make with Create a hero.
