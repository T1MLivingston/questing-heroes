# What would make the game better (art and sound inventory, v65, 2026-11-21)

Match the existing packs: warm storybook pixel art, dark plum outline (#2b1a33), light from the upper left, crisp pixel grid, no anti-aliasing, transparent PNGs, original designs, no text in the images. Hero art follows the Movement Sprites pack format (see `CLAUDE.md`, v63).

Already complete (nothing needed): every troop (40 + upgrades, HD strips), every wild monster, every artifact icon, all eight towns (scenes, buildings, extra buildings, map stages), map terrain and sites, setup icons, skill icons (except one), a portrait for every one of the 167 heroes, and the main theme music.

## 1. Hero battle figures
Done in v67: every hero has one.

## 2. Hero map walkers (the biggest visual gap)
65 of 167 heroes walk the map as themselves; the other 102 use their banner's generic walker. Same format as before: one 192×384 sheet per hero (48×48 frames, 4 walk phases × 8 directions s, sw, w, nw, n, ne, e, se, pivot 24,44), ids as in `js/01-data.js`.

- **Rangers (13)**: Wick, Gus & Glen, Midge, Azure Hype (student), Ericsonion (student), Deep Wave (student), Pottery (student), Cornelius II (student), Ward (student), Anastasia May Dvestia (student), Tida (student), Drew (student), J@ke (student)
- **Wizards (18)**: Gale, Ada, Mags & Mae, Bloop, BobbytheBob (student), Luckenzo (student), Larishna (student), Katherine (student), Rose Flower (student), Banana Boy (student), Spirit of the Forest (student), Celestine Circe (student), Sir Quackars (student), Buffalo (student), Gerry (student), Vash (student), Liya (student), Boston (student)
- **Necromancers (13)**: Hush, Mara, Odo & Otto, Bort (student), Nyx (student), Kushalito (student), Kaf (student), Sus (student), Samba (student), Emirk (student), Friendo (student), Dee (student), Trey (student)
- **Beastmasters (13)**: Rusty, Wren, Rumble, Bess & Bea, Gilt, Fut (student), Zenvy (student), King Pharoph the 3rd (student), Nohahahahah (student), Boja (student), Paitence & Jay (student), Python Mage (student), Percifire (student)
- **Pirates (11)**: Cato, Sid & Tess, Rafe & Reed, Bo, Ardcat (student), Toad (student), Capybara (student), Lishi (student), Liam (student), Alora (student), Vinay (student)
- **Elves (11)**: Love, Fern, Hart, Aster & Briar, Rousie (student), Estella (student), Lily (student), Poison (student), Ella (student), Ezlen (student), Anna (student)
- **Dwarves (10)**: Penny, Orla, Ned & Nat, Spike, Bristle (student), Posy (student), Sir Giggachins (student), Babka (student), Teo (student), Astronaut Steve (student)
- **Merfolk (13)**: Boone, Spindle, Rusk Hookhorn, Axel, Noël Dragonfire (student), Nala (student), Nanya (student), Posy Spinner (student), Yatt (student), Stargirl (student), Mangrove (student), Teeka (student), H4L1S3 (student)

## 3. Portraits
Dusty, King Pharoph the 3rd, Kiln, Shadow and Coral were redrawn in v67. Toad, Kaf/Teo and Gerry/Trey stay as the students designed them.

## 4. Spells and icons
Done in v67: all 14 spell icons, effects for Geyser, Weaken, Frost Lance, Rally and Meteor, the Sorcery icon, nine button icons and the lit lighthouse.

## 6. Sound
- **Music**: only `map.mp3` is still wanted (theme, acoustic, town, battle, victory and defeat are in).
- **Sound effects, about 20** (none yet): click, footstep, coins, pickup, build, recruit, day end, new week, sword, bow, cannon, hit, unit defeated, spell, heal, morale, claim mine, portal, boat, level up, relic, bell, error bonk. A sound player and volume control would be added when they arrive.

## 7. From the classroom
Play-test notes from students: what is confusing, which heroes feel too weak or strong, and the hero files they make with Create a hero.
