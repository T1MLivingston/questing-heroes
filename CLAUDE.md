# CLAUDE.md - Questing Heroes

## Project Overview

Questing Heroes is a browser-based, turn-based fantasy strategy game built with vanilla HTML, CSS and JavaScript. The player picks a game mode, a difficulty (starting resources and rival strength), a map (Wheel & Spoke, Twin Ridges, Underworld or Four Rivers, in three sizes), one of 8 factions and one of 32 heroes (4 per faction; the 2 still-unnamed placeholders are marked `blank`), explores a fog-covered map, grows a town, recruits an army and fights tactical battles on a hex grid. The goal is to recover the Seven Relics, hidden in guarded lairs and hunted by rival AI heroes, and deliver them to the town's Relic Hall (internal key `reliquary`) before the day limit (4, 5 or 6 months by map size).

This is a **private, personal project**. See `LEGAL.md` before publishing anything.

## Technology Stack

- **Frontend**: Single HTML file with inline CSS and JavaScript
- **Rendering**: HTML5 Canvas 2D API (map and battlefield), DOM for panels and dialogs
- **Art**: Sprite PNGs in `assets/` where they exist (map terrain, rivers, bridges and scenery, battle rocks, Rangers units, 5 hero map sprites, all 32 hero portraits); everything else is still drawn in code, and the drawn version is the fallback for any missing image
- **Fonts**: Alegreya SC (display, numbers, canvas text) and Alegreya (body) from Google Fonts (SIL Open Font License): a chunky serif
- **Look**: gilded gold panels with dark ink text and royal blue for highlights, selection and primary buttons, on a deep navy page. The map, battle screen, map hover box and toasts stay dark (they reset the colour variables). Actions sit in the top bar (Town, Hero, End day, ☰ menu); the right-hand ledger must fit the window without scrolling
- **No build tools**: open `index.html` in a browser to play

## File Structure

```
questing-heroes/
├── index.html    # Complete game (HTML + CSS + JavaScript)
├── CLAUDE.md     # This file
├── LEGAL.md      # Originality notes, third-party notices, pre-publish checklist
├── LICENSE       # All rights reserved (personal project)
├── assets/       # Sprite art: terrain/ (ground, edges, roads, scenery, fire), units/, heroes/, portraits/, shields/ (faction crests), team_masks/, manifest.json, palette/
└── .gitignore
```

## Game modes

`S.mode` is one of `relic` (Relic Hunt), `conquest`, `grail` (Grail Quest) or `multi` (hot-seat). `S.goal` lists the relic indices you must deliver (empty in Conquest); `goalMet()` checks the win.

- Grail Quest swaps `RELICS` to `GRAILS` (`setMode`). Four keepers roam (`o.roam`, `roamKeepers` each day); the fifth sits in the Glass Lair. The town's Reliquary is called the Grail Altar.
- Multiplayer keeps each player's kingdom in `S.players[i]` (keys in `PKEYS`) and swaps the active one into `S` with `loadPlayer`/`stashPlayer`. Other players' heroes appear in `S.rivals` with `human:true` (the AI skips them; when attacked, they defend on auto). Towns carry an `owner`; `townData(o)` returns the right banner and buildings, `ME()` is the active owner key for mines. `handoff()` shows the pass-the-device screen.

## Architecture

The script in `index.html` is split into sections marked with `/* ===== ... ===== */` or `/* -------- ... -------- */` comments:

| Section | What it holds |
|---------|---------------|
| DATA | `FAC` (8 factions), `U` (units, neutrals and generated `_u` upgrades), `SP` (spells), `SK` (skills), `HEROES` (32, including 2 placeholders), `ITEMS` (31 artifacts in levels 1-5: Trinket, Treasure, Heirloom, Masterwork, Legendary), `START_KIT` (each hero's starting skill and artifact), `RELICS` (7), `MINE` (three output levels, `MINE_UP` upgrade costs, `mineOut`), `SITES` (weekly sites) |
| ART | Procedural drawing: `drawRes`, `drawStat`, `drawFig`, `drawGlyph`, `drawUnit`, `drawHeroPortrait`, `drawCrest`, `iconURL` cache |
| MAP | `MAP_SIZES`, `MAP_TYPES`, `genMap` → `genWheel`, `genRidges`, `genUnder` or `genRivers` (the last two share `fillWorld`, `carveReach`, `mkSpot`, `roadAlong`, `placeRelics`), `makeIsland`/`isleDocks` (pirate islands), `newGame`, `mkHero`, `mkRival`, terrain prerender, camera, `drawMap`, pathfinding (`astar`, `planTo`) |
| UI | `renderUI` (top bar, hero card, army), `showModal` (`top:true` puts the buttons in the header), toasts, `unitCard` (the one troop card used everywhere: big picture, overview line, attack and defense, a Details fold-out; fixed height), `askName` (rename the town or a hero) |
| Adventure actions | `walk`, `fightPreview`, `gainRelic`, `visit`, `arriveTown`, `endDay`, `addRumour`, `addXP` |
| Rival heroes | `rivalsTurn`, `rivalTarget`, `rivalInteract`, `autoResolve`, `growRival` |
| Town screen | `FAC_SPELLS`, `townBuildings`, `townAdvice` (the Suggested step), `townTabs`, `townHTML`, `drawTownView` (clickable picture of the town), `openTown` |
| BATTLE | `drawBattleHero` (hero beside the field; click to open the spellbook), hex grid helpers, stat functions (`sAtk`, `sDef`, `sSpd`, `sMorale`), `battleLoop`, `playerTurn`, `aiTurn`, `castSpell`, `endBattle`, `drawBattle` |
| START | `pickMap` (difficulty chips with `DIFF_ICON`, `MODE_SHORT` mode cards, size chips beside the Map heading, map cards whose description shows on hover), `pickFaction` (`FAC_BLURB`, hero faces, a Troops fold-out), `pickHero` (big stats with `STAT_TIP` tooltips, abilities as plain effects); each fits one screen |
| Save and boot | `localStorage` save under `questing-heroes-v4`, `title`, `boot` |

### Game state

Everything lives in one object, `S`, so it can be saved as JSON:

- `S.fac`: chosen faction key; `S.W`, `S.H`, `S.mapType`, `S.size`, `S.limit`: map setup (W and H are globals set from these on load)
- `S.heroes[]` and `S.cur`: the player's heroes (up to 3) and the selected one; read it with `HERO()`. Each has id, name, stats (`atk`, `def`, `pow`, `lore`), `mana`, `mp`, `skills`, `spells`, `mount` (`foot`, `horse` or `hooves`), `boat`, `book` (has a spellbook), `items` (artifact keys), `relics` (carried relic indices), `army` (up to 7 stacks of `{k, n}`)
- Use `hst(h, 'atk')` for a stat including relic and artifact bonuses; `gear(h, k)` sums artifact effects
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

- Wheel & Spoke: homes sit on a ring, spoke roads lead to a walled hub (the Glass Lair) entered through one straight guarded gateway per spoke, and a ring road joins the homes. Rival homes are `camp` objects.
- Pirate homes (player or rival) become islands: a ring of water with a dock on each side.
- Twin Ridges: two crag ridges cross the map. The road crosses each through one gap held by a strong `guard` neutral. `genWorld` checks that each guard really seals its ridge.
- Diagonal moves can't cut corners: both orthogonal neighbours must be passable.
- Relic lairs are `relic` objects (`r` = relic index). Relics a hero drops on defeat become a `drop` object.
- Underworld: the top half is the surface, the bottom half the underworld (`S.underY` is the first bedrock row; two rows of protected crag). Portal pairs (`portal` objects with `tx`, `ty`) are the only link. Necromancer homes and the Glass Lair are below. The underworld renders on ash ground with a purple tint.
- Four Rivers: four rivers (`S.rivers`, lake tiles drawn with the river art) meet in a water ring around the Glass Lair's island. Bridges (`S.bridges`, road tiles with `ori`) cross them; one per river and the four island bridges are guarded. Each home has its own quarter.
- Portals: `PORT` (rebuilt in `rebuildFoot`) maps a portal tile to its far end. `astar` treats that as an extra neighbour and its heuristic allows for portals; `reachFrom`, `placeSpires` and `carveReach` follow them too. Walking onto a portal as the destination steps through (`visit`); a path can also run through one.
- Spires (`spire` objects with `owned`, `garrison`): `placeSpires` puts them where blocking their 3×3 area splits the land, else spread along the roads (generators may pre-place some at bridgeheads or portals). A garrisoned spire holds the 8 tiles around it against other banners (`zocFor`); enemies must win a battle (defenders +3 defense) to take it. `manageSpire` moves stacks in and out; rivals claim and assault spires.

### Sprite art

- Tables near the top of ART: `ART_PORTRAITS` (hero ids with `portraits/heroes/<id>_64|128.png`), `ART_MAP` (heroes with an 8-direction `heroes/<id>/map/<id>_map_sheet.png`, 48×48 frames, rows S, SW, W, NW, N, NE, E, SE) and `ART_UNITS` (game unit key → `units/rangers/<name>/<name>_sheet.png`, 64×64 frames, rows idle, move, attack, hit, death).
- `tinted()` recolours team pixels from the paired `team_masks/` file to the faction colour. Pixel reads fail on `file://`, so serve the folder (`python3 -m http.server`) to see team colours; otherwise the original colours show.
- Map terrain (`assets/terrain`, see its README) is prerendered by `renderTerrainArt` at the art's native 32px per tile and scaled to `TS` when drawn. Ground is a meadow base with dual-grid corner overlays per terrain (heath = dry grass, bog = swamp, forest floor, crags = rocky, sand shores, water), cobblestone roads by neighbour connections, then props sorted by their foot: a tree per forest tile, mountains or hills on crags, flowers, reeds and boulders scattered on free tiles. Four canvases (`terrainPh`) hold the four water phases (220 ms). The old drawn terrain is used until all `TA_FILES` load. `drawFire` animates the campfire at camps and the torches at town gates.
- Add new art by dropping files in the same layout and adding the id to the matching table. `assets/manifest.json` is the art pack's full registry.

### Map furniture

- `furnishMap(bases)` runs after generation: every base (your town, rival camps, other players' towns) gets a sawmill, ore pit, amber spring and gold seam within a short walk (`reachFrom`, `freeTile`). Mines start at level 1-3, and the owner can pay at the mine to raise it (the prompt shows only when the mine is your destination).
- Weekly sites (`site` objects: Wishing Well, Clover Meadow, Woodcutters' Camp, Abandoned Ore Cart, Amber Hollow) refill each week (`o.week` vs `weekNo()`).
- Map artifacts (`artifact` objects) are placed by walking distance from your town: levels 1-2 close and unguarded, 3-5 farther out with a guard beside them. Rivals pick them up too.

### Spells and spellbooks

- Magic heroes (and anyone who starts with a spell) carry a spellbook; others buy one for 500 gold at the Lantern Library.
- `FAC_SPELLS` lists what each banner's mages teach: the Lantern Library teaches the first two, the Star Archive the rest. Wayshrines are set to spells from the same list.

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
- [ ] Map setup: both map types and all three sizes generate, previews draw, every relic is reachable
- [ ] Faction picker and hero picker work for all 8 factions
- [ ] Map walking, path preview (green today, amber later days), fight preview
- [ ] Dock sells a boat, lakes become passable; Horse Fair and Stables give a horse
- [ ] Town: build one building per day, recruit, garrison merges on return
- [ ] Battle: move, melee, shoot, wait, defend, spellbook, auto, retaliation
- [ ] Each faction mechanic and each hero ability triggers
- [ ] Relics: rumours appear weekly, lairs give relics, delivery to the Reliquary, win at 7
- [ ] Rivals move at end of day, claim mines and relics, and can attack your heroes
- [ ] Town screen: tabs light up when something can be done, Suggested step and Take me there work, clicking buildings in the picture opens their tab
- [ ] Tavern offers two heroes of your banner and two wanderers (+500 gold) each week; hires a second hero; dwelling upgrades and army upgrades work; Library sells a spellbook
- [ ] Guarded passes block the road until beaten
- [ ] Level-up choice, end of day income, weekly growth
- [ ] Click your hero on the map for the quick menu (End day, town, next hero)
- [ ] Portals carry heroes and rivals between surface and underworld; spires can be garrisoned and stormed
- [ ] Phone layout (about 400px wide)

## Code Style Conventions

- Short names are used in hot code (`S`, `U`, `bt`); keep new data tables readable.
- Constants: UPPER_SNAKE_CASE (`TCOST`, `LIMIT`, `SAVEKEY`)
- All content (names, units, art, text) must be original. See `LEGAL.md`.

## Design Docs

The design bible (factions, heroes, artifacts, sprite checklist, UX plan) lives in a Claude Docs document, not in this repo.
