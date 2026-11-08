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
| Pixelify Sans font | Google Fonts | SIL Open Font License 1.1 | Loaded from fonts.googleapis.com at runtime |
| VT323 font | Google Fonts | SIL Open Font License 1.1 | Loaded from fonts.googleapis.com at runtime |

No other libraries, images or audio are included. Art made later with ChatGPT or other tools should be logged below, with the tool and its terms at the time.

| Asset | Made with | Date | Terms checked |
|-------|-----------|------|---------------|
| Character Pack 01: 7 Vale Wardens units, 5 hero map sprites, 5 hero portraits, 7 recruit cards (`assets/units`, `assets/heroes`, `assets/portraits`) | Generated with ChatGPT image generation, then palette-snapped and cleaned (pack README, 2026-11-07) | 2026-11-07 | To do: confirm the image tool's terms allow use in a game |
| Faction Shields: 8 shield crests (`assets/shields`) | Generated with ChatGPT image generation, palette-snapped (pack README) | 2026-11-07 | Same as above |
| 7 hero portraits converted from Headshot Workshop 02 (Boopis, Engelman, Grimes, Parker, Rago, Rimmer, Tempest) | Same generator; resized, palette-snapped and framed by a local script | 2026-11-07 | Same as above |
| Terrain & Scenery Pack 03: 11 ground types, corner overlays, roads, water, 14 scenery props, campfire and torch (`assets/terrain`) | Generated with ChatGPT image generation, palette-snapped, transitions cut from exact grid masks (pack README) | 2026-11-08 | Same as above |

The generated source images (high-res magenta PNGs) are kept outside this repo.

## Real names

The heroes are named after people (and possibly pets) from the author's life: Bear, Dorothy, Oliver, Battaglia, Engelman, Tempest, Grimes, Rimmer, Parker, Shadow, Rago, Binx, Boopis, Monkey, Schmickle, O'Malley, Vargas, Sheila, Lawrence, Davis, Love, Michael, Livingston, Ivan, Dupengeiser, Slack, Perry, Rocky, Elvis and Letchworth. Two slots (one Necromancer, one Merfolk) are still placeholders.

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
