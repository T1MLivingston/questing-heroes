# Legal notes

Questing Heroes is a free, non-commercial hobby project. Since 2026-11-12 the repository is public and the game is playable on GitHub Pages. These notes record what has been done to keep it original and what was checked before going public.

This file is a practical checklist, not legal advice. If the game will be sold or widely released, have a lawyer review it.

## Originality

- The game uses general genre mechanics: a fogged adventure map, a town that builds one structure per day, weekly recruits, armies as stacks, and turn-based hex battles. Game mechanics and rules are generally not protected by copyright, but specific expression is.
- All specific expression is original to this project: the world, faction names, unit names, hero names, abilities, spell names, map objects, story text, user interface, and all art (drawn in code).
- The project does not use any other game's names, logos, characters, creature lineups, town designs, maps, art, music, sound or text, and it must not start using them.
- The code does not name any other game. Don't add "inspired by" or comparison language to the game, store pages or marketing without checking trademark rules first.

## Third-party components

| Component | Source | License | Notes |
|-----------|--------|---------|-------|
| Alegreya SC font | Google Fonts | SIL Open Font License 1.1 | Loaded from fonts.googleapis.com at runtime |
| Alegreya font | Google Fonts | SIL Open Font License 1.1 | Loaded from fonts.googleapis.com at runtime |

No other libraries, images or audio are included. Art made later with ChatGPT or other tools should be logged below, with the tool and its terms at the time.

| Asset | Made with | Date | Terms checked |
|-------|-----------|------|---------------|
| Character Pack 01: 7 Vale Wardens units, 5 hero map sprites, 5 hero portraits, 7 recruit cards (`assets/units`, `assets/heroes`, `assets/portraits`) | Generated with ChatGPT image generation, then palette-snapped and cleaned (pack README, 2026-11-07) | 2026-11-07 | To do: confirm the image tool's terms allow use in a game |
| Faction Shields: 8 shield crests (`assets/shields`) | Generated with ChatGPT image generation, palette-snapped (pack README) | 2026-11-07 | Same as above |
| 7 hero portraits converted from Headshot Workshop 02 (Boopis, Engelman, Grimes, Parker, Rago, Rimmer, Tempest) | Same generator; resized, palette-snapped and framed by a local script | 2026-11-07 | Same as above |
| Terrain & Scenery Pack 03: 11 ground types, corner overlays, roads, water, 14 scenery props, campfire and torch (`assets/terrain`) | Generated with ChatGPT image generation, palette-snapped, transitions cut from exact grid masks (pack README) | 2026-11-08 | Same as above |

| Headshots Pack 04: 32 hero portraits, including candidate faces for the two unnamed slots (`assets/portraits/heroes`, replacing the earlier 12) | Generated with ChatGPT image generation, palette-normalized and outlined (pack README) | 2026-11-08 | Same as above |
| Scenery Expansion Pack 05: 5 trees, 4 mountain fillers, 4 rock formations with battle views (`assets/terrain/scenery`, `assets/terrain/battle`) | Generated with ChatGPT image generation, palette-snapped (pack README) | 2026-11-08 | Same as above |

| Banner, Gems & Portals Pack 06: title banner, 6 gems, 3 animated portal gates (`assets/ui`, `assets/gems`, `assets/portals`) | Generated with ChatGPT image generation, palette-normalized (pack README) | 2026-11-08 | Same as above |
| Buildings & Hero Training Pack 07: 8 factions × 4 town stages with team masks, 24 training stones, Library of Mastery, Spellbook Altar (`assets/towns`, `assets/team_masks/towns`, `assets/sites`) | Generated with ChatGPT image generation, palette-normalized (pack README) | 2026-11-08 | Same as above |

| Seas & Battlefields Pack 08: 8 battle grounds, docks, rowboat, coastal sloop (team mask), lighthouse, shipwreck, 8 ocean pickups (`assets/battle`, `assets/waterfront`, `assets/ocean`) | Generated with ChatGPT image generation, palette-normalized (pack README) | 2026-11-08 | Same as above |
| UI & Textures Pack 09: parchment and navy panels, buttons, icons, cursors, textures, modal dimmer (`assets/ui`) | Generated with ChatGPT image generation, palette-normalized (pack README) | 2026-11-08 | Same as above |
| Troops Pack 10: 36 six-pose troop strips and portraits for Wizards, Necromancers, Beast Masters, Pirates (with Great Crossbow), Elves, Dwarves and Merfolk (`assets/units/<faction>`, `assets/portraits/units`) | Generated bitmap sheets, cleaned and palette-snapped (pack README) | 2026-11-08 | Same as above |
| Enemies, Loot & World Pack 02: 10 neutral enemy sheets, map guards and portraits, 4 mines, 9 owner pennants, chests, pickups, wayshrine, moonwell, watchtower, Glass Lair, 6 projectiles (`assets/enemies`, `assets/map`, `assets/projectiles`, `assets/portraits/enemies`) | Generated starter art, processed to a pixel grid and the shared palette (pack README) | 2026-11-08 | Same as above |
| Portrait Updates Pack 11: Perry, Grimes, Sookie, Bear, Griffiths (`assets/portraits/heroes`) | Generated pixel portraits on the shared palette (pack README) | 2026-11-08 | Same as above |
| Map & Battle Expansion Pack 12: troop team masks, banner walkers, hex overlays, spell effects, rival camps, spire, relic lairs, Glass Lair, battle hero figures, 31 artifact icons, panel textures (`assets/team_masks/units`, `assets/heroes/_banners`, `assets/battle`, `assets/map/buildings`, `assets/artifacts`, `assets/ui/textures`) | Generated art processed to the shared palette (pack README) | 2026-11-08 | Same as above |
| Binx portrait without collar (`assets/portraits/heroes/binx_*.png`) | Supplied by the author (generated pixel portrait); 64 px made by halving locally | 2026-11-08 | Same as above |
| Shadow portrait (hooded) | Supplied by the author; 128 px upscaled from the 64 px original | 2026-11-08 | Same as above |
| High Detail Troops A-D: 128 px battle strips with team masks and 128 px recruit cards for 38 troops (`assets/units`, `assets/portraits/units/*_128.png`) | Re-exported from the original generated art on the shared palette (pack READMEs) | 2026-11-08 | Same as above |
| Groves, Well, Clover & Rocks: 6 tree groves, wishing well, four-leaf clover, 6 rock groups (`assets/terrain/scenery`, `assets/map/sites`) | Generated scenery on the shared palette (pack README) | 2026-11-08 | Same as above |
| Rangers Layered Town: 640×360 town screen background, 11 buildings and 4 hall stages, packed into one atlas (`assets/towns/rangers/screen.png`) | Supplied by the author (generated pixel art, ChatGPT), packed locally | 2026-11-08 | Original town layout and buildings; no other game's town art copied. Review for resemblance before publishing |
| Pirates, Necromancers and Merfolk Layered Towns: 640×360 town screens with hall stages and every building, each packed into one atlas (`assets/towns/<fac>/screen.png`) | Supplied by the author (generated pixel art, ChatGPT), packed locally | 2026-11-08 | Original layouts; review for resemblance before publishing |
| Dwarves, Elves and Wizards Layered Towns: 640×360 town screens with hall stages and every building, packed into atlases (`assets/towns/<fac>/screen.png`) | Supplied by the author (generated pixel art, ChatGPT), packed locally | 2026-11-08 | Original layouts; review for resemblance before publishing |
| Beast Masters Layered Town (`assets/towns/centaurs/screen.png`) | Supplied by the author (generated pixel art, ChatGPT), packed locally | 2026-11-08 | Original layout; review for resemblance before publishing |
| Art packs 01, 03, 04, 05, 06 (v29): Heartwood Grove, gem/moonwater mines, icons and pickups, six map sites, HD Antler Knight, Moth Seer and Oak Warden, pointy hex highlights, 14 personal map walkers; packed into atlases where needed | Supplied by the author (generated pixel art, ChatGPT), packed locally | 2026-11-08 | Original designs; review for resemblance before publishing |
| Setup Icons & Name Outlines pack (70 icons packed into `assets/ui/setup_icons.png`, 128 px faction shields) and redrawn portraits of Dorothy, Sookie, O'Malley, Vargas, Griffiths | Supplied by the author (generated pixel art) | 2026-11-09 | Original; review for resemblance before publishing |
| Missing Buildings A and B: Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, growth and special buildings for all eight banners (`assets/towns/extra_buildings.png`) | Supplied by the author (generated pixel art, ChatGPT), packed locally into one atlas | 2026-11-08 | Original designs; review for resemblance before publishing |
| Selected portraits: Perry (female Ranger), Eden (red-haired Elf), updated Love (`assets/portraits/heroes`) | Supplied by the author (generated pixel portraits) | 2026-11-08 | Same as other portraits |
| Half-size move cursor (`assets/ui/cursors/move_small.png`) | Downscaled locally from Pack 09's move cursor | 2026-11-08 | Same as above |

The generated source images (high-res magenta PNGs) are kept outside this repo.

Troop roster (v17): all troop names are generic fantasy words or our own coinages (Owl Familiar, Hellkite, War Rabbit, Gem Golem, Coral Colossus and so on). Creature types such as skeleton, vampire, werewolf, centaur are common folklore; none of the lineups copies a specific game's town roster or art. Sprite sheets for the new troops are still to be generated (brief in `ART_REQUEST_TROOPS.md`); log them in the table above when they arrive.

Town names and terms (v25): the free town names (Brackenford, Millbrook, Stonereach, Harrowgate, Elmstead, Copperhollow, Wrenmoor, Ashby Cross, Fairwater, Highmere, Oakvale, Saltmarsh, Kettleby, Dunmore, Larkspur, Greywick) are generic English-style place names made up for this game. Moonwater, Gem Grotto, Alchemist's Still, Heroes' Lodge and recruiting post are plain descriptive terms. The new resource icons (gems, moonwater) and the new mine pictures reuse existing pack art (ruby gem, ore pit, moonwell) or are drawn in code.

## Real names

The heroes are named after people (and possibly pets) from the author's life: Bear, Dorothy, Oliver, Battaglia, Engelman, Tempest, Grimes, Rimmer, Parker, Shadow, Rago, Binx, Boopis, Monkey, Schmickle, O'Malley, Vargas, Sheila, Lawrence, Davis, Love, Michael, Livingston, Ivan, Dupengeiser, Slack, Perry, Rocky, Elvis, Letchworth, William IV and Griffiths. The last two names, William IV (Necromancer) and Griffiths (Merfolk), complete the roster. Sookie (Wizards) was added in v18; Eden and the rogues Boone, Holmes and Tinker (placeholder) in v24; in v26 the Ranger is shown as Perry and the Elf as Eden. Davis is retired (kept in the code only so old saves load).

- Fine for a private game. Before any public release, get each person's OK to use their name, or switch to invented names.
- Some names match well-known people or fictional characters. A name alone is fine. Don't add likenesses, catchphrases, songs, costumes or other traits that point to a famous person or character.
- Battaglia is described as a classic square-jawed champion. Keep his look original: no emblem, costume, colour scheme or pose borrowed from any comic-book hero.
- Watch Binx in particular: a black cat named Binx is a well-known film character. The current panther-like design with a team collar is its own, but keep it away from that film's look and story before any release, or rename the hero.

## Going public (2026-11-12): what was checked

- [x] Title: a web search found no game called "Questing Heroes" (closest: the board games "Questing" and "Quest: A Time of Heroes", and the "HeroQuest" brand). Fine for a free hobby game. Search the USPTO and app stores again before selling it or releasing it on a store.
- [x] Real names: the author confirmed that everyone whose name is used has agreed. If anyone later asks to be removed, rename that hero (change `name` in `HEROES`; the id can stay).
- [x] Famous likeness: the merman Elvis (black pompadour) was renamed **Eelvis** so the hero doesn't point to a real celebrity (`migrateTowns` renames him in old saves). Binx stays an original panther-like design.
- [x] AI art: generated with ChatGPT image generation. OpenAI's terms assign output rights to the user; logged per pack above. Purely AI-made images may have thin copyright protection, which is acceptable for a hobby game.
- [x] License: All Rights Reserved kept on purpose (LICENSE): play freely, no copying or redistribution.
- [x] Privacy: no accounts, tracking or server; saves stay in the browser. The README and the in-game About page say so, and mention that Google Fonts sees visitors' IP addresses.
- [x] Commit history: every commit is authored by `Claude <noreply@anthropic.com>`; no personal email, keys or passwords are in the repository.
- [x] Notices: README.md and the title screen's **About & credits** carry the no-affiliation notice, credits, privacy note, license summary and a contact route (GitHub issues).

Still worth doing if the game ever grows: self-host the two fonts (OFL allows it) so no visitor data goes to Google, and get a lawyer's review before any sale.
