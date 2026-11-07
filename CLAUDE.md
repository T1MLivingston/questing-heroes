# CLAUDE.md - Questing Heroes

## Project Overview

Questing Heroes is a browser-based, turn-based fantasy strategy game built with vanilla HTML, CSS and JavaScript. The player picks one of 8 factions and one of 24 heroes, explores a fog-covered map, grows a town, recruits an army and fights tactical battles on a hex grid. The goal is to recover the Seven Relics, hidden in guarded lairs and hunted by rival AI heroes, and deliver them to the town's Reliquary before the end of Month 4 (day 112).

This is a **private, personal project**. See `LEGAL.md` before publishing anything.

## Technology Stack

- **Frontend**: Single HTML file with inline CSS and JavaScript
- **Rendering**: HTML5 Canvas 2D API (map and battlefield), DOM for panels and dialogs
- **Art**: Sprite PNGs in `assets/` where they exist (Rangers units, 5 hero map sprites, 12 hero portraits); everything else is still drawn in code, and the drawn version is the fallback for any missing image
- **Fonts**: IM Fell English SC and Alegreya Sans from Google Fonts (SIL Open Font License)
- **No build tools**: open `index.html` in a browser to play

## File Structure

```
questing-heroes/
├── index.html    # Complete game (HTML + CSS + JavaScript)
├── CLAUDE.md     # This file
├── LEGAL.md      # Originality notes, third-party notices, pre-publish checklist
├── LICENSE       # All rights reserved (personal project)
├── assets/       # Sprite art: units/, heroes/, portraits/, team_masks/, manifest.json, palette/
└── .gitignore
```

## Architecture

The script in `index.html` is split into sections marked with `/* ===== ... ===== */` or `/* -------- ... -------- */` comments:

| Section | What it holds |
|---------|---------------|
| DATA | `FAC` (8 factions), `U` (units, neutrals and generated `_u` upgrades), `SP` (spells), `SK` (skills), `HEROES` (24 heroes), `RELICS` (7), `MINE` |
| ART | Procedural drawing: `drawRes`, `drawStat`, `drawFig`, `drawGlyph`, `drawUnit`, `drawHeroPortrait`, `drawCrest`, `iconURL` cache |
| MAP | `genWorld` (seeded map generator with crag ridges and guarded passes), `newGame`, `mkHero`, `mkRival`, terrain prerender, camera, `drawMap`, pathfinding (`astar`, `planTo`) |
| UI | `renderUI` (top bar, hero card, army), `showModal`, toasts, unit cards |
| Adventure actions | `walk`, `fightPreview`, `gainRelic`, `visit`, `arriveTown`, `endDay`, `addRumour`, `addXP` |
| Rival heroes | `rivalsTurn`, `rivalTarget`, `rivalInteract`, `autoResolve`, `growRival` |
| Town screen | `townBuildings`, `townHTML`, `openTown` |
| BATTLE | Hex grid helpers, stat functions (`sAtk`, `sDef`, `sSpd`, `sMorale`), `battleLoop`, `playerTurn`, `aiTurn`, `castSpell`, `endBattle`, `drawBattle` |
| START | `pickFaction`, `pickHero` |
| Save and boot | `localStorage` save under `questing-heroes-v3`, `title`, `boot` |

### Game state

Everything lives in one object, `S`, so it can be saved as JSON:

- `S.fac`: chosen faction key
- `S.heroes[]` and `S.cur`: the player's heroes (up to 3) and the selected one; read it with `HERO()`. Each has id, name, stats (`atk`, `def`, `pow`, `lore`), `mana`, `mp`, `skills`, `spells`, `mount` (`foot`, `horse` or `hooves`), `boat`, `relics` (carried relic indices), `army` (up to 7 stacks of `{k, n}`)
- Use `hst(h, 'atk')` for a stat including carried-relic bonuses
- `S.rivals[]`: AI heroes with `fac`, position, stats, `army`, `relics`
- `S.rumours[]`, `S.delivered[]`: rumour circles and relics already in the Reliquary
- `S.town`: `built` buildings, `pool` of recruits, `garrison`, `builtToday`
- `S.tiles`, `S.explored`, `S.objs`: the map
- `S.res`: gold, timber, ore, amber
- `S.day`: day counter; 28 days to a month, and the game ends after day 112 (`LIMIT`)

### Faction and hero data

- Each faction in `FAC` has 5 units (tiers 1 to 5), dwelling names, a colour palette, a signature mechanic and a travel mode.
- Each hero in `HEROES` has base stats `st: [atk, def, pow, lore]`, starting skills `sk`, starting spells `sp` and a signature ability. The ability is data in `fx` (for example `unitAtk`, `unitSpd`, `growth`, `harvest`, `echo`), read by the battle and map code via `fx()`.
- Faction mechanics are checked by faction key in the battle stat functions and `endBattle`.

### Map rules

- Two crag ridges cross the map. The road crosses each through one gap held by a strong `guard` neutral. `genWorld` checks that each guard really seals its ridge.
- Diagonal moves can't cut corners: both orthogonal neighbours must be passable.
- Relic lairs are `relic` objects (`r` = relic index). Relics a hero drops on defeat become a `drop` object.

### Sprite art

- Tables near the top of ART: `ART_PORTRAITS` (hero ids with `portraits/heroes/<id>_64|128.png`), `ART_MAP` (heroes with an 8-direction `heroes/<id>/map/<id>_map_sheet.png`, 48×48 frames, rows S, SW, W, NW, N, NE, E, SE) and `ART_UNITS` (game unit key → `units/rangers/<name>/<name>_sheet.png`, 64×64 frames, rows idle, move, attack, hit, death).
- `tinted()` recolours team pixels from the paired `team_masks/` file to the faction colour. Pixel reads fail on `file://`, so serve the folder (`python3 -m http.server`) to see team colours; otherwise the original colours show.
- Add new art by dropping files in the same layout and adding the id to the matching table. `assets/manifest.json` is the art pack's full registry.

### Travel

`terrainCost(x, y)` decides movement: lakes need a boat (65 per tile) or the Merfolk swim (110). A horse adds 40% to `maxMP()`. Docks sell boats; Horse Fairs and the Stables building give horses.

## Development Workflow

```bash
# Open directly
open index.html

# Or serve locally
python3 -m http.server 8000
```

Debug handle in the browser console: `window.__qh` exposes the state and a few functions for testing.

### Testing Checklist
- [ ] Loads without console errors
- [ ] Faction picker and hero picker work for all 8 factions
- [ ] Map walking, path preview (green today, amber later days), fight preview
- [ ] Dock sells a boat, lakes become passable; Horse Fair and Stables give a horse
- [ ] Town: build one building per day, recruit, garrison merges on return
- [ ] Battle: move, melee, shoot, wait, defend, spellbook, auto, retaliation
- [ ] Each faction mechanic and each hero ability triggers
- [ ] Relics: rumours appear weekly, lairs give relics, delivery to the Reliquary, win at 7
- [ ] Rivals move at end of day, claim mines and relics, and can attack your heroes
- [ ] Tavern hires a second hero; dwelling upgrades and army upgrades work
- [ ] Guarded passes block the road until beaten
- [ ] Level-up choice, end of day income, weekly growth
- [ ] Phone layout (about 400px wide)

## Code Style Conventions

- Short names are used in hot code (`S`, `U`, `bt`); keep new data tables readable.
- Constants: UPPER_SNAKE_CASE (`TCOST`, `LIMIT`, `SAVEKEY`)
- All content (names, units, art, text) must be original. See `LEGAL.md`.

## Design Docs

The design bible (factions, heroes, artifacts, sprite checklist, UX plan) lives in a Claude Docs document, not in this repo.
