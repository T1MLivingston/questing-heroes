# Legal notes

Questing Heroes is a private, personal project. It is not for sale and is not published. These notes record what has been done to keep it original, and what to check before it is ever shared publicly.

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

The generated source images (high-res magenta PNGs) are kept outside this repo.

Troop roster (v17): all troop names are generic fantasy words or our own coinages (Owl Familiar, Hellkite, War Rabbit, Gem Golem, Coral Colossus and so on). Creature types such as skeleton, vampire, werewolf, centaur are common folklore; none of the lineups copies a specific game's town roster or art. Sprite sheets for the new troops are still to be generated (brief in `ART_REQUEST_TROOPS.md`); log them in the table above when they arrive.

## Real names

The heroes are named after people (and possibly pets) from the author's life: Bear, Dorothy, Oliver, Battaglia, Engelman, Tempest, Grimes, Rimmer, Parker, Shadow, Rago, Binx, Boopis, Monkey, Schmickle, O'Malley, Vargas, Sheila, Lawrence, Davis, Love, Michael, Livingston, Ivan, Dupengeiser, Slack, Perry, Rocky, Elvis, Letchworth, William IV and Griffiths. The last two names, William IV (Necromancer) and Griffiths (Merfolk), complete the roster. Sookie (Wizards) was added in v18. Davis is retired (kept in the code only so old saves load).

- Fine for a private game. Before any public release, get each person's OK to use their name, or switch to invented names.
- Some names match well-known people or fictional characters. A name alone is fine. Don't add likenesses, catchphrases, songs, costumes or other traits that point to a famous person or character.
- Battaglia is described as a classic square-jawed champion. Keep his look original: no emblem, costume, colour scheme or pose borrowed from any comic-book hero.
- Watch Binx in particular: a black cat named Binx is a well-known film character. The current panther-like design with a team collar is its own, but keep it away from that film's look and story before any release, or rename the hero.

## Before going public: checklist

- [ ] Search trademarks for "Questing Heroes" (USPTO and app stores) and pick a different title if it's taken in games.
- [ ] Get consent from everyone whose name is used, or rename those heroes.
- [ ] Review every sprite made with AI tools for resemblance to existing characters or art, and log it above.
- [ ] Decide on a license (keep All Rights Reserved, or pick an open-source license on purpose).
- [ ] If the game collects any data (saves stay in the browser today), add a privacy note.
- [ ] Make the GitHub repository private, or keep it local until this list is done.
