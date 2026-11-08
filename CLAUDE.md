# CLAUDE.md - Questing Heroes

## Project Overview

Questing Heroes is a browser-based, turn-based fantasy strategy game built with vanilla HTML, CSS and JavaScript. The player picks a game mode, a difficulty (starting resources and rival strength), a map (Wheel & Spoke, Twin Ridges, Underworld or Four Rivers, in three sizes), one of 8 factions and one of 32 heroes (4 per faction), explores a fog-covered map, grows a town, recruits an army and fights tactical battles on a hex grid. The goal is to recover the Seven Relics, hidden in guarded lairs and hunted by rival AI heroes, and deliver them to the town's Relic Hall (internal key `reliquary`) before the day limit (4, 5 or 6 months by map size).

This is a **private, personal project**. See `LEGAL.md` before publishing anything.

## Technology Stack

- **Frontend**: Single HTML file with inline CSS and JavaScript
- **Rendering**: HTML5 Canvas 2D API (map and battlefield), DOM for panels and dialogs
- **Art**: Sprite PNGs in `assets/` where they exist (map terrain, rivers, bridges and scenery, battle rocks, every troop (Rangers as 4×5 sheets, the rest as Pack 10 strips), 5 hero map sprites, hero portraits); everything else is still drawn in code, and the drawn version is the fallback for any missing image
- **Fonts**: Alegreya SC (display, numbers, canvas text) and Alegreya (body) from Google Fonts (SIL Open Font License): a chunky serif
- **Look**: gilded gold panels with dark ink text and royal blue for highlights, selection and primary buttons, on a deep navy page. The map, battle screen, map hover box and toasts stay dark (they reset the colour variables). Actions sit in the top bar (Town, Hero, End day, ☰ menu); the right-hand ledger must fit the window without scrolling
- **No build tools**: open `index.html` in a browser to play

## File Structure

```
questing-heroes/
├── index.html    # Complete game (HTML + CSS + JavaScript)
├── CLAUDE.md     # This file
├── ART_REQUEST_TROOPS.md # Brief for the next troop sprite pack
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
| DATA | `FAC` (8 factions), `U` (units, neutrals and generated `_u` upgrades), `SP` (spells), `SK` (skills), `HEROES` (32), `ITEMS` (31 artifacts in levels 1-5: Trinket, Treasure, Heirloom, Masterwork, Legendary), `START_KIT` (each hero's starting skill and artifact), `RELICS` (7), `MINE` (three output levels, `MINE_UP` upgrade costs, `mineOut`), `SITES` (weekly sites) |
| ART | Procedural drawing: `drawRes`, `drawStat`, `drawFig`, `drawGlyph`, `drawUnit`, `drawHeroPortrait`, `drawCrest`, `iconURL` cache |
| MAP | `MAP_SIZES`, `MAP_TYPES`, `genMap` → `genWheel`, `genRidges`, `genUnder` or `genRivers` (the last two share `fillWorld`, `carveReach`, `mkSpot`, `roadAlong`, `placeRelics`), `makeIsland`/`isleDocks` (pirate islands), `newGame`, `mkHero`, `mkRival`, terrain prerender, camera, `drawMap`, pathfinding (`astar`, `planTo`) |
| UI | `renderUI` (left-hand ledger as sketched: four stat squares beside a big portrait with mana and movement bars, the army grid with a spellbook tile, then Town / Hero / End day; the relic strip `#objective` sits in the top bar and opens the goal), `moveStack` (drag stacks to merge or swap), split in `showUnit`, `openSpellbook`, `showModal` (`top:true` puts the buttons in the header), toasts, `unitCard` (the one troop card used everywhere: big picture, overview line, attack and defense, a Details fold-out; fixed height), `askName` (rename the town or a hero) |
| Adventure actions | `walk`, `fightPreview`, `gainRelic`, `visit`, `arriveTown`, `endDay`, `addRumour`, `addXP` |
| Rival heroes | `rivalsTurn`, `rivalTarget`, `rivalInteract`, `autoResolve`, `growRival` |
| Town screen | `FAC_SPELLS`, `townBuildings`, `townAdvice` (the Suggested step), `townTabs`, `townHTML`, `drawTownView` (clickable picture of the town), `openTown`. The main Town tab is a picture of the town's buildings only (empty lots are invisible but clickable; interior art will replace it; click the hall to see everything you can build), then a strip with the visiting hero large and their army under it, beside the garrison row and the dwelling grid (click to recruit; click a stack to move it across), and the resources along the bottom. Double-click the town name to rename |
| BATTLE | `drawBattleHero` (hero beside the field; click to open the spellbook), hex grid helpers, stat functions (`sAtk`, `sDef`, `sSpd`, `sMorale`), `battleLoop`, `playerTurn`, `aiTurn`, `castSpell`, `endBattle`, `drawBattle` |
| START | `pickMap` (difficulty chips with `DIFF_ICON`, `MODE_SHORT` mode cards, size chips beside the Map heading, map cards whose description shows on hover), `pickFaction` (`FAC_BLURB`, hero faces, a Troops fold-out), `pickHero` (big stats with `STAT_TIP` tooltips, abilities as plain effects); each fits one screen |
| Save and boot | Autosave under `questing-heroes-v4` (Continue); named slots under `questing-heroes-slots` (`saveGame`, `loadGame`, from the ☰ menu; Load on the title); `title` offers Load, Continue and New campaign. The map editor opens from the ☰ menu or from "Make your own map" on Choose your game |

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

- Rosters (tiers 1-5): Rangers Thornguard, Reedbow, Antler Knight, Moth Seer, Oak Warden; Wizards Owl Familiar, Apprentice Mage, Earth Elemental, Storm Elemental, Archmage; Necromancers Skeleton, Zombie, Werewolf, Vampire, Hellkite; Beast Masters War Rabbit, Boar, Hound, Centaur, Lion; Pirates Deckhand, Powder Monkey, Duelist, Gunner, Cannon Crew (upgrade: Great Crossbow); Elves Sprite, Longbow Ranger, Grove Warden, Elven Rider, Giant Eagle; Dwarves Young Dwarf, Dwarf Crossbowman, Dwarf Paladin, Ram Rider, Gem Golem; Merfolk Spearfolk, Siren, Giant Crab, Turtle Knight, Coral Colossus.
- Saves from before this roster are migrated by tier in `migrateRoster` (`OLD_ROSTER`, `S.roster` = 2). Grave Harvest and Raise Bones make Skeletons.
- Heroes per banner (4 each): Grimes is a Dwarf, Perry an Elf (Master Archer, replacing Davis) and Sookie a Wizard (Owl Mother, no portrait yet). Heroes with `retired:true` (Davis) stay in `HBY` for old saves but are removed from `HEROES`, so pickers, the tavern and rivals never offer them.
- Panels (`.card`, `.sheet`, top bar, navy strips) use solid fills inside the pixel border until a smooth texture asset arrives.
- Player colour: the hero picker offers `PLAYER_COLS` swatches (single player); the pick is `S.col`, read through `teamCol()` (flags, tinted sprites, `--team`, portrait backgrounds). Multiplayer keeps banner colours.
- Side panel: the portrait fills the width with the name over it, and the four stats sit in a row underneath. The hero sheet (`openHeroSheet`, `.sheetgrid3`) has the hero, portrait and stats on the left, a 3-column equipment grid of tall, narrow slots in the middle, and the details and backpack on the right.
- Minimap: `drawMini` (called from `drawMap` every 200 ms) draws explored land, towns, camps, owned mines, relics, heroes, visible rivals and the view frame in `#mini`; click it to look there, ▾ hides it.
- `dropPuddles` (end of `genMap`) turns lake bodies under 9 tiles into land unless a dock, water pickup or object sits on or beside them.
- Banner cards show `FAC_SW` (two strengths, one weakness) under the name.
- `ART_REQUEST_TROOPS.md` is the art brief for the troop sprite sheets still to come.

- Each faction in `FAC` has 5 units (tiers 1 to 5), dwelling names, a colour palette, a signature mechanic and a travel mode.
- Each hero in `HEROES` has base stats `st: [atk, def, pow, lore]` (raised at load: +1 to all, +1-2 on the main stat, +1 on one stat picked by a hash of the id), starting skills `sk`, starting spells `sp` and a signature ability. The ability is data in `fx` (for example `unitAtk`, `unitSpd`, `growth`, `harvest`, `echo`), read by the battle and map code via `fx()`.
- Faction mechanics are checked by faction key in the battle stat functions and `endBattle`.

### Map rules

- Wheel & Spoke: homes sit on a ring, spoke roads lead to a walled hub (the Glass Lair) entered through one straight guarded gateway per spoke, and a ring road joins the homes. Rival homes are `camp` objects.
- Pirate homes (player or rival) become islands: a ring of water with a dock on each side. Merfolk homes become lagoons (`homeIsle`: a wider ring plus `addWaterway`, a channel to the nearest lake). Merfolk swim at 50 per tile (40 with the sea relic) and pay 1.5× on land; rival Merfolk too.
- Twin Ridges: two crag ridges cross the map. The road crosses each through one gap held by a strong `guard` neutral. `genWorld` checks that each guard really seals its ridge.
- Diagonal moves can't cut corners: both orthogonal neighbours must be passable.
- Relic lairs are `relic` objects (`r` = relic index). Relics a hero drops on defeat become a `drop` object.
- Underworld: the top half is the surface, the bottom half the underworld (`S.underY` is the first bedrock row; two rows of protected crag). Portal pairs (`portal` objects with `tx`, `ty`) are the only link. Necromancer homes and the Glass Lair are below. The underworld renders on ash ground with a purple tint.
- Four Rivers: four rivers (`S.rivers`, lake tiles drawn with the river art) meet in a water ring around the Glass Lair's island. Bridges (`S.bridges`, road tiles with `ori`) cross them; one per river and the four island bridges are guarded. Each home has its own quarter.
- Portals: `PORT` (rebuilt in `rebuildFoot`) maps a portal tile to its far end. `astar` treats that as an extra neighbour and its heuristic allows for portals; `reachFrom`, `placeSpires` and `carveReach` follow them too. Walking onto a portal as the destination steps through (`visit`); a path can also run through one.
- Spires (`spire` objects with `owned`, `garrison`): `placeSpires` puts them where blocking their 3×3 area splits the land, else spread along the roads (generators may pre-place some at bridgeheads or portals). A garrisoned spire holds the 8 tiles around it against other banners (`zocFor`); enemies must win a battle (defenders +3 defense) to take it. `manageSpire` moves stacks in and out; rivals claim and assault spires.

### Sprite art

- Tables near the top of ART: `ART_PORTRAITS` (hero ids with `portraits/heroes/<id>_64|128.png`), `ART_MAP` (heroes with an 8-direction `heroes/<id>/map/<id>_map_sheet.png`, 48×48 frames, rows S, SW, W, NW, N, NE, E, SE) and `ART_UNITS` (Rangers: game unit key → `units/<faction>/<name>/<name>_sheet.png`, faction from `unitFac`, 64×64 frames, rows idle, move, attack, hit, death) and `ART_STRIPS` (every other troop, Troops Pack 10: `units/<faction>/<name>/<name>_strip.png`, six poses idle, move A, move B, attack, hit, defeat, 64 or 96 px wide, pivot at x centre y 60, no team masks; `stripPose` maps sheet rows onto poses; `cannon_u` has its own Great Crossbow strip). Troop portraits are `portraits/units/<name>_64.png`. The map's move cursor is `ui/cursors/move_small.png` (half size).
- `tinted()` recolours team pixels from the paired `team_masks/` file to the faction colour. Pixel reads fail on `file://`, so serve the folder (`python3 -m http.server`) to see team colours; otherwise the original colours show.
- Map terrain (`assets/terrain`, see its README) is prerendered by `renderTerrainArt` at the art's native 32px per tile and scaled to `TS` when drawn. Ground is a meadow base with dual-grid corner overlays per terrain (heath = dry grass, bog = swamp, forest floor, crags = rocky, sand shores, water), cobblestone roads by neighbour connections, then props sorted by their foot: a tree per forest tile, mountains or hills on crags, flowers, reeds and boulders scattered on free tiles. Four canvases (`terrainPh`) hold the four water phases (220 ms). The old drawn terrain is used until all `TA_FILES` load. `drawFire` animates the campfire at camps and the torches at town gates.
- Towns: `assets/towns/<fac>/1..4.png` (Settlement, Town Hall, City Hall, Capital; 128×96, pivot 64,92, team masks in `team_masks/towns`). `townStage` picks by hall (`hall4` Crown Seat is the capital); `drawTown` draws it on the map, `drawTownView` uses it as the centrepiece, and camps and free towns show their banner's settlement at a smaller scale.
- Sites: `sites/stones/<fac>/{atk,def,lore}.png` (stones are faction-styled via `o.style`; each hero trains once per stone, `usedBy`), `sites/sage.png`, `sites/altar.png`. Portals: `portals/{woodland,arcane,tidal}.png` 4-frame strips (surface, underworld, by water). Gems: `gems/*.png` (`GEMS`, `gem` pickups worth gold; amber's icon). Title: `ui/banner.png`. `spriteAt` draws one sprite or strip frame with a bottom-centre pivot.
- Seas and battles: `battle/grounds/*.png` (picked by `battleGround()`: ship deck on water, cavern underground, marsh, sand by a shore, snow in northern highlands, dirt, meadow); `waterfront/` docks (drawn by water side), the team-masked coastal sloop for heroes at sea, lighthouse and shipwreck scenery; `ocean/*.png` water-only pickups (`flot` objects, `FLOT`, placed by `furnishMap`; collected by boat or swimmers; rival Pirates and Merfolk take them too).
- UI kit: `ui/panels` (parchment and navy nine-slice frames via CSS `border-image`), `ui/buttons` (normal, hover, pressed, disabled), `ui/icons` (`UI_RES`, `UI_STAT`; buttons and the spellbook), `ui/cursors` (`setMapCursor`: move, target, unavailable), `ui/textures` (panel fills, modal dimmer). The pack's hex highlights are flat-top and our battle grid is pointy-top, so they are not used yet.
- Enemies, Loot & World Pack 02: `ENEMY_ART` maps neutral keys to `enemies/<name>/sheet.png` (4×5 battle sheets, 64 px, drake 96 px; the hit row has one frame), `map/guards/<name>_32.png` (drawn by `token` on the map) and `portraits/enemies/<name>_64.png`. Mines use `map/mines/<name>.png` (2-frame, `MINE_ART` holds the flag spot) with an owner pennant from `map/flags/<colour>.png` picked by `flagFor(ownerCol)`. Piles, chests, the artifact pickup, wayshrines, moonwells, watchtowers and the Glass Lair (relic 6) use `map/pickups`, `map/chests`, `map/sites`. Battle shots use `projectiles/<kind>.png` (3 frames, `PROJ_OF` picks arrow, bolt, ember, rock, spit or spell orb).
- Neutrals: wight, wolf, imp, troll, drake plus bandit, skelguard (Barrow Guard), wildboar, spider (shoots), ogre (Stone-maul Ogre, guards the Ogre Quarry relic); `neutralAt` mixes them by distance.
- Add new art by dropping files in the same layout and adding the id to the matching table. `assets/manifest.json` is the art pack's full registry.

### Map size and variety

- `MAP_SIZES`: Small 40×32, Medium 54×42, Large 68×52, Extra large 84×64 (the classic genre uses 36/72/108/144 squares; our tiles draw larger). `towns` is the number of free towns. `astar` uses a binary heap. Big maps keep fewer water frames (`terrainPh` length 1-4).
- Each seed rolls a biome (`BIOMES`, `biomeOf`, `BIO` shifts the terrain thresholds in every generator; shown on the map card). Object counts jitter ±25% (`jit`). Wild monsters get a level 1-4 (weak, normal, strong, elite: `MON_LVL`, size ×0.6-1.9; elites drop gold and maybe an artifact). Free towns are Village, Town or City (`lvl`, `TOWN_LVL`, `campIncome`, `campTiers`). Each week rolls an event (`EVENTS`, `rollEvent`, `S.event`).

### Town growth, walls and sieges

- `FAC_BUILD[fac]`: three banner-only buildings (`fb1` horde: extra weekly growth for one troop; `fb2` visit: each hero gains +1 to a stat once, on arrival; `fb3` special, checked with `facSpecial`: `mpTown`, `manaRegen`, `harvest`, `horde2`, `goldWeek`, `amberDay`, `oreDay`). Costs in `FB_COST`.
- `WALLS`: Palisade, Stronghold (+50% growth), Bastion (+100% growth, towers). `wallLvl()`; `townDefense()` is the garrison's power times the wall bonus (plus the towers). The garrison no longer joins a hero automatically; move troops on the town screen.
- Sieges (single player): after day 7 a rival may target your town when no hero is home and it out-powers `townDefense()`. If it wins, `S.town.taken` is set: no town income or growth, the town can't be entered, and the rival (`rv.occupy`) stays at the gate. Beat it there to free the town; after 7 days held, you lose.
- Camps: rival camps and free towns (`camp` objects with `free:true`, placed by `furnishMap`, held by wild creatures) both have a `garrison`. Beat it (or walk into an empty one) to capture: +500 gold a day and the first two troops of its banner each week (`pool`, `manageHolding`, `firstPool`). A rival whose own camp you hold stops growing and tries to retake it; rivals also claim free towns and raid holdings.

### Map furniture

- `furnishMap(bases)` runs after generation: every base (your town, rival camps, other players' towns) gets a sawmill, ore pit, amber spring and gold seam within a short walk (`reachFrom`, `freeTile`). Mines start at level 1-3, and the owner can pay at the mine to raise it (the prompt shows only when the mine is your destination).
- Weekly sites (`site` objects: Wishing Well, Clover Meadow, Woodcutters' Camp, Abandoned Ore Cart, Amber Hollow) refill each week (`o.week` vs `weekNo()`).
- Map artifacts (`artifact` objects) are placed by walking distance from your town: levels 1-2 close and unguarded, 3-5 farther out with a guard beside them. Rivals pick them up too.

### Equipment

- `SLOT_LIM`/`SLOT_ORDER`: one item per slot (Head, Neck, Cloak, Main hand, Body, Off hand, Feet), two Rings, three Pack items. `giveItem(h, key)` wears an item if its slot is free, otherwise puts it in `h.pack` (the backpack does nothing). `gear()` reads worn items only. `openHeroSheet` shows the slots, the backpack (click to wear or take off, swapping as needed), the ability, skills and what each stat does.
- Two spellbook functions exist: `viewSpellbook` (map, read-only) and `openSpellbook` (battle, cast). Don't merge the names: the later declaration would win.

### Spells and spellbooks

- Map sites: `sage` (Sage's Library: each hero picks +2 Attack, Defense, Power or Lore once) and `altar` (Lesser, Greater and Star altars, tiers 1-3, teach one spell; need a spellbook and Lore ≥ tier; tiers 2-3 are guarded). `furnishMap` places them.

- Magic heroes (and anyone who starts with a spell) carry a spellbook; others buy one for 500 gold at the Lantern Library.
- `FAC_SPELLS` lists what each banner's mages teach: the Lantern Library teaches the first two, the Star Archive the rest. Wayshrines are set to spells from the same list.

### Travel

`terrainCost(x, y)` decides movement: lakes need a boat (65 per tile) or the Merfolk swim (50); Merfolk walk land at 1.5×. A horse adds 40% to `maxMP()`. Docks sell boats; Horse Fairs and the Stables building give horses.

## Map editor

`openEditor` (from the title screen) paints terrain and places objects on an `S` with `editor:true` and no heroes, reusing `drawMap` and `renderTerrain`. `ED` holds the tool, brush and pending portal end; `edApply` does one placement, `edCheck` lists what is missing (town, six relic lairs, the Glass Lair) and anything cut off. Maps save to localStorage under `questing-heroes-maps` (`loadMaps`, `storeMaps`). Saved, complete maps appear under "Your maps" in `pickMap`; `newGame` turns one into a world with `customWorld` (camps get the rival banners in order) and runs `furnishMap` unless the map turned extras off.

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
- [ ] Faction picker and hero picker work for all 8 factions; every `AB_SHORT` line fits one line on the hero cards
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
- [ ] Click your hero on the map for the quick menu (End day, town, next hero, Hero details)
- [ ] Hero details: wear and remove items, backpack overflow; Recruit all in town; per-day income in the top bar
- [ ] Portals carry heroes and rivals between surface and underworld; spires can be garrisoned and stormed
- [ ] Split a stack, drag stacks to merge or swap, open the spellbook
- [ ] Sage's Library and spell altars teach as described
- [ ] Map editor: paint, place, save, play the saved map
- [ ] Phone layout (about 400px wide)

## Code Style Conventions

- Short names are used in hot code (`S`, `U`, `bt`); keep new data tables readable.
- Constants: UPPER_SNAKE_CASE (`TCOST`, `LIMIT`, `SAVEKEY`)
- All content (names, units, art, text) must be original. See `LEGAL.md`.

## Design Docs

The design bible (factions, heroes, artifacts, sprite checklist, UX plan) lives in a Claude Docs document, not in this repo.
