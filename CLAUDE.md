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
├── ART_REQUEST_TROOPS.md # Brief for the troop sprite pack (delivered as Pack 10)
├── ART_REQUEST_TOWNS.md  # Brief for the town buildings pack (Pack 13)
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
- `S.heroes[]` and `S.cur`: the player's heroes (up to 4, or 5 once any town has the Heroes' Lodge: `heroCap()`) and the selected one; read it with `HERO()`. Each has id, name, stats (`atk`, `def`, `pow`, `lore`), `mana`, `mp`, `skills`, `spells`, `mount` (`foot`, `horse` or `hooves`), `boat`, `book` (has a spellbook), `items` (artifact keys), `relics` (carried relic indices), `army` (up to 7 stacks of `{k, n}`)
- Use `hst(h, 'atk')` for a stat including relic and artifact bonuses; `gear(h, k)` sums artifact effects
- `S.rivals[]`: AI heroes with `fac`, position, stats, `army`, `relics`
- `S.rumours[]`, `S.delivered[]`: rumour circles and relics already in the Reliquary
- `S.town`: `built` buildings, `pool` of recruits, `garrison`, `builtToday`
- `S.tiles`, `S.explored`, `S.objs`: the map
- `S.res`: gold, timber, ore, amber, gems, moonwater (`RES`; `migrateTowns` fills missing keys in old saves)
- `S.day`: day counter; 28 days to a month, and the game ends after day 112 (`LIMIT`)

### Faction and hero data

- Rosters (tiers 1-5): Rangers Thornguard, Reedbow, Antler Knight, Moth Seer, Oak Warden; Wizards Owl Familiar, Apprentice Mage, Earth Elemental, Storm Elemental, Archmage; Necromancers Skeleton, Zombie, Werewolf, Vampire, Hellkite; Beast Masters War Rabbit, Boar, Hound, Centaur, Lion; Pirates Deckhand, Powder Monkey, Duelist, Gunner, Cannon Crew (upgrade: Great Crossbow); Elves Sprite, Longbow Ranger, Grove Warden, Elven Rider, Giant Eagle; Dwarves Young Dwarf, Dwarf Crossbowman, Dwarf Paladin, Ram Rider, Gem Golem; Merfolk Spearfolk, Siren, Giant Crab, Turtle Knight, Coral Colossus.
- Saves from before this roster are migrated by tier in `migrateRoster` (`OLD_ROSTER`, `S.roster` = 2). Grave Harvest and Raise Bones make Skeletons.
- Heroes per banner (4 each): Rangers Perry (id `perry` since v27: female Ranger portrait, Rootkeeper, banner walker), Dorothy, Oliver, Battaglia; Beast Masters Bear (a bear, Lions +2/+2), Monkey, Binx, Boopis; Necromancers Parker, Shadow (hooded), Rago, William IV; Dwarves include Grimes; Elves include Eden (id `eden` since v27: red-haired female Elf; `migrateTowns` swaps the old ids once, `S.ids27`); Wizards include Sookie (a lion). Heroes with `retired:true` (Davis) stay in `HBY` for old saves but are removed from `HEROES`.
- Rogues (`rogue:true`): Schmickle (+250 gold a day, `fx.goldDay`), Boone (Quickdraw), Holmes (Sharp Eyes), Tinker (+15% movement, `fx.mpPct`; placeholder name). They never appear in pickers or as rivals: only in the tavern (`hireable`: two of your banner, then rogues) and in `prison` objects (`furnishMap` places one per ~34 tiles of width, each holding one rogue in `o.rogue`, listed in `S.jailed`, with a monster beside it). Visiting a prison frees the rogue into your party if you have room under `heroCap()`.
- Personal walkers (v29, packs 05-06): 14 heroes (Perry, Battaglia, Engelman, Rimmer, Sookie, Tempest, Bear, Boopis, Monkey, Parker, Rago, Schmickle, Shadow, William IV as `necro4`) in one atlas `heroes/walkers.png` (192×384 sheets, 7 a row, `WALKERS`, cut out by `walkerSheet`); Binx, Dorothy, Oliver and Vargas keep their own sheets (`ART_MAP`); everyone else uses the banner walker. Hero portraits always load the 128 px file.
- Panels (`.card`, `.sheet`, top bar, navy strips) use the Pack 12 smooth parchment and navy textures inside the pixel border.
- Player colour: the hero picker offers `PLAYER_COLS` swatches (single player); the pick is `S.col`, read through `teamCol()` (flags, tinted sprites, `--team`, portrait backgrounds). Multiplayer keeps banner colours.
- Command bar (`.cmdbar`, above the map only, inside `.mapcol`): Town with quick icons for your town and captured holdings, Hero with a portrait icon per hero (green dot = can still move), End day on the right. `renderQuick` fills `#qTowns` and `#qHeroes`.
- Side panel: a near-square portrait (whole hero visible) with the name over it, and the four stats in a row underneath, number above label. The hero sheet (`openHeroSheet`, `.sheetgrid3`) has the hero, portrait and stats on the left, a 3-column equipment grid of tall, narrow slots in the middle, and the details and backpack on the right.
- Minimap: `drawMini` (called from `drawMap` every 200 ms) draws explored land, towns, camps, owned mines, relics, heroes, visible rivals and the view frame in `#mini`; click it to look there, ▾ hides it.
- `dropPuddles` (end of `genMap`) keeps water only if it is part of a river, has an object on it, has a dock (and is 12+ tiles), or is a real lake (60+ tiles); everything else becomes land, and docks left without water are removed.
- Battle: big troops (96 px art, every tier 5, ogres, trolls, the drake) draw 40% larger (`BIGK` in `drawBattle`); they still use one hex. Ogres, trolls and drakes also stand larger on the map.
- Choose your banner (`pickFaction`) is a sheet (`.bannersheet`) that fits the window: each `bannerCard` has the crest, name and a Details button, then the four heroes 2×2 running to the bottom edge (click the card to choose). Details shows `bannerDetail`: the banner ability, travel and home town, the four heroes with big portraits, stats and full ability, and all five troops at battlefield scale standing on a hex (`paintTroopPics`: one zoom for every troop, big troops ×1.4 as in battle), `UNIT_TAGS` overlaid on the picture so the stat boxes line up, stats, dwelling, cost and upgrade; ‹ › flip to the neighbouring banner. Cards show no troops; strengths are kept short to fit one line.
- Pickups (piles, gems, sea pickups, chest gold, weekly sites, claimed mines, freed rogues) announce themselves with `lootPop` (big, top of the map, `#loot`); other messages still use `toast`.
- Mines: claiming one pops up big; the upgrade prompt defaults to OK. The Barter Yard tab lists every mine you hold (`mineList`) with Upgrade and Show on map.
- The Lantern Library (`lib1`) is built from the start, so the library is always in town for spellbooks.
- High-detail troops (four HD packs): every Pack 10 troop plus Thornguard and Reedbow use 128 px frames (192 px for big troops) packed with their mask in `units/<fac>/<id>/<id>_strip.png` (art row above mask row); `drawSprite` and `paintTroopPics` scale by 64/frame height (smooth only when shrinking). Troop pictures are the 128 px recruit cards `portraits/units/<id>_128.png`; Antler Knight, Moth Seer and Oak Warden joined them in v29 (`ART_UNITS` is now empty).
- Map: double-click your town (or an owned holding) to open it. Ending the day flips a big hourglass (`dayFlip`, `#dayflip`). The town quick icon gets a gold dot when something can be built or recruited, holdings when troops wait.
- Heroes: the hero menu has Gather (`gatherNext`, key G: walk to the nearest ready weekly site or moonwell, then loose pickups, then unclaimed mines) and Meet (`meetHero`: walk next to another hero). Clicking an adjacent hero of yours opens `openTrade`: click a stack to send it across, ½ to send half, arrows to send everything but one stack.
- Guards: `furnishMap` puts a guard (`key:true`) beside every gold seam and amber spring, strength by distance. Key guards (`isKeyGuard`: key mines, level 3+ artifacts, prisons, pass guards) grow each week toward 60% of your strongest army's power.
- `rockMines` puts ore pits and gold seams in a notch of rock (2+ crag tiles behind or beside): it moves them up to 6 steps or raises crags one at a time, undoing anything that shrinks the reachable land.
- Upgraded troops: battle sprites tint their team parts gold (`upgCol` in `unitSheet`); troop pictures get `img.upg` (gold filter). In town, stacks whose upgrade dwelling is built show a green + (`data-uplus`) to upgrade on the spot.

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
- UI kit: `ui/panels` (parchment and navy nine-slice frames via CSS `border-image`), `ui/buttons` (normal, hover, pressed, disabled), `ui/icons` (`UI_RES`, `UI_STAT`; buttons and the spellbook), `ui/cursors` (`setMapCursor`: move, target, unavailable), `ui/textures` (panel fills, modal dimmer). The battle hex highlights `battle/hex/*.png` are the pointy-top 64×56 set (v29), drawn by `hexImg`.
- Enemies, Loot & World Pack 02: `ENEMY_ART` maps neutral keys to `enemies/<name>/sheet.png` (4×5 battle sheets, 64 px, drake 96 px; the hit row has one frame), `map/guards/<name>_32.png` (drawn by `token` on the map) and `portraits/enemies/<name>_64.png`. Mines use `map/mines/<name>.png` (2-frame, `MINE_ART` holds the flag spot) with an owner pennant from `map/flags/<colour>.png` picked by `flagFor(ownerCol)`. Piles, chests, the artifact pickup, wayshrines, moonwells, watchtowers and the Glass Lair (relic 6) use `map/pickups`, `map/chests`, `map/sites`. Battle shots use `projectiles/<kind>.png` (3 frames, `PROJ_OF` picks arrow, bolt, ember, rock, spit or spell orb).
- Neutrals: wight, wolf, imp, troll, drake plus bandit, skelguard (Barrow Guard), wildboar, spider (shoots), ogre (Stone-maul Ogre, guards the Ogre Quarry relic); `neutralAt` mixes them by distance.
- Map & Battle Pack 12: Pack 10 troop masks packed as the second row of each `_strip.png` (`tintedPacked(path,col,"v")` keeps each pixel's own shading; battle hero figures carry their flag mask on the right half, `"h"`); banner walkers `heroes/_banners/<fac>_map_sheet.png` used by `heroSheet` for heroes without their own sheet; hex overlays `battle/hex/{move,hover,attack,shoot,selected,blocked}.png` (`hexImg` in `drawBattle`); spell strips `battle/spells/<name>.png` (`SPELL_FX`, drawn by `burst` while `curSpell` is set); battle hero figures `battle/heroes/<fac>.png` (flag mask packed beside the figure; `drawBattleHero`); map buildings `map/buildings/` (spire tower, `camp_<fac>` for rival camps, four relic lair styles, Glass Lair); artifact icons `artifacts/<name>.png` via `ITEM_ICON`/`itemIcon`; panel textures `ui/textures/{parchment,navy}_smooth.png`.
- Portrait Pack 11 replaced Perry (now Magic), Grimes (now Might), Bear, Griffiths (`mer2`) and added Sookie (a lion wizard).
- Groves, Well, Clover & Rocks pack: six whole tree groves (`GROVES`, placed by `renderTerrainArt` over blocks of forest whose two base rows are clear; single trees fill the rest), four rock groups (`ROCKS`: thin crag spots and rocks by the hills) and two low ground scatters (`GROUNDS`: dirt and heath), all in `terrain/scenery/`; the Wishing Well and Clover Meadow sites use `map/sites/wishing_well.png` and `four_leaf_clover.png`.
- Town screens (layered): `TOWN_SCREEN[fac]` holds an atlas `towns/<fac>/screen.png` (640×360 background at 0,0 plus each building piece as `[atlas x, y, w, h, scene x, y]`) and `sites` mapping each art site to game buildings. `drawArtTown` draws it in the middle of the 960×360 town canvas (the sides mirror the scene's edges); unbuilt sites are invisible clickable lots, clicks test the piece's alpha (`artTownAlpha`), and built buildings with no picture get small signs down the left margin. Rangers (v26): hall stages; the banner Details page shows the fully built town (`paintTownPrev`); Bramble Barracks = thornguard_barracks, Reed Lodge = reedbow_range, Antler Stables or horse Stables = stables, Moth Spire = hedge_witch_cottage, Lantern Library = spell_lodge, Barter Yard = trader_lodge, Muster Field = training_yard, Tavern, Hunter's Lodge = watchtower, any troop upgrade = smithy, walls = palisade_gate. v27 added Pirates (harbor_hall_*, the siege yard switches to the Great Crossbow piece once `u5` is built: a site's optional 4th/5th entries are the alternate piece and the building that shows it), Necromancers (ossuary_hall_*) and Merfolk (tide_hall_*), each with all five dwellings; their lookout tower is the `fb2` building and the Pirates' shipyard is `fb3`. v28 added Dwarves (mountain_hall_*; the smithy stands for the Great Forge and troop upgrades), Elves (silverbough_hall_*) and Wizards (council_hall_*; the Starwatch Observatory is the Observatory, `fb2`). Beast Masters (pack_hall_*; the Trail Corral is the Great Paddock, `fb3`, so the shared extra picture is skipped for it) completed all eight banners. The banner Details page shows the fully built town below the heroes and troops. Missing Buildings packs A and B: the Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, growth (`fb1`) and special (`fb3`) building for all eight banners, packed into `towns/extra_buildings.png` (128×128 cells, row per banner `XB_ROW`, column per building `XB_COL`, foot at 64,120). They show on the Build tab (`bldThumb`, also for Beast Masters) and stand in the town picture's side margins (`XB_SPOT`, three a side; unbuilt ones are clickable lots). Buildings still without a picture get small signs at the top-left inside the scene. Heroes stand below the wall piece (`gate` defaults to it). The Build tab shows each building's own picture cropped from the atlas into a square (`bldThumb`, upgrades show their dwelling); banners without town art keep emoji. Other banners still use the drawn town.
- Resources & Map Sites pack (v29): one atlas `map/world_extras.png` (`WX` table, drawn by `wxAt`, bottom-centre): Gem Grotto and Moonwater Spring mines (2 frames), moonwater and gem piles, prison, horse fair, Woodcutters' Camp, Abandoned Ore Cart, Amber Hollow and the outpost/recruiting post sprite. Gem and moonwater icons are `ui/icons/gem.png` and `moonwater.png`. Heartwood Grove (Rangers tier 5) is column 6 of `towns/extra_buildings.png` (`XB_ONLY`), standing in the Rangers town's right margin (`XB_SPOT_FAC`).
- Setup Icons pack (v31): 70 icons of 64×64 in one atlas `ui/setup_icons.png` (10 a row, names in `SICONS`), placed with `ico(name, px)` (a background-sprite span): difficulty, game modes, rivals 1-6 and great towns 0-6 (numbered banners and castles), outposts, map sizes, New layout, Make your own map, Back/Next, the title buttons, the legend and the Start-with-an-artifact toggle. The faction shields `shields/<fac>_96.png` now hold the pack's 128 px crests. Hero names wear a thick black outline in the player's colour (`.qh-name`: side panel and hero picker).
- Portraits redrawn in v31 (Dorothy, Sookie, O'Malley, Vargas, Griffiths `mer2`) are 256 px files kept under the `_128.png` name; portrait URLs carry `?v=30`.
- Art storage: every PNG under `assets/` is committed to the private GitHub repo (v30; `*.png` is no longer gitignored), so the repo is the full backup and the game runs locally with no file limit. The published artifact is separate: it allows 511 files and holds about 499, so art for it still goes into atlases. It cannot load images from the private repo.
- Add new art by dropping files in the same layout and adding the id to the matching table. `assets/manifest.json` is the art pack's full registry.

### Map size and variety

- `MAP_SIZES` (v26): Small 54×42, Medium 68×52, Large 84×64, Extra large 100×76 (the classic genre uses 36/72/108/144 squares; our tiles draw larger). `majors` and `outposts` are the default counts of great towns and outposts. `astar` uses a binary heap. Big maps keep fewer water frames (`terrainPh` length 1-4).
- Each seed rolls a biome (`BIOMES`, `biomeOf`, `BIO` shifts the terrain thresholds in every generator; shown on the map card). Object counts jitter ±25% (`jit`). Wild monsters get a level 1-4 (weak, normal, strong, elite: `MON_LVL`, size ×0.6-1.9; elites drop gold and maybe an artifact). Free towns are Village, Town or City (`lvl`, `TOWN_LVL`, `campIncome`, `campTiers`). Each week rolls an event (`EVENTS`, `rollEvent`, `S.event`).

### Town growth, walls and sieges

- `FAC_BUILD[fac]`: three banner-only buildings (`fb1` horde: extra weekly growth for one troop; `fb2` visit: each hero gains +1 to a stat once, on arrival; `fb3` special, checked with `facSpecial`: `mpTown`, `manaRegen`, `harvest`, `horde2`, `goldWeek`, `amberDay`, `oreDay`). Costs in `FB_COST`.
- `WALLS`: Palisade, Stronghold (+50% growth), Bastion (+100% growth, towers). `wallLvl()`; `townDefense()` is the garrison's power times the wall bonus (plus the towers). The garrison no longer joins a hero automatically; move troops on the town screen.
- Sieges (single player): after day 7 a rival may target your town when no hero is home and it out-powers `townDefense()`. If it wins, `S.town.taken` is set: no town income or growth, the town can't be entered, and the rival (`rv.occupy`) stays at the gate. Beat it there to free the town; after 7 days held, you lose.
- Towns (v25): `S.town` is the home town. Major towns are `camp` objects with `isMajor(o)` (free great towns with `major:true`, and every rival's home camp). Once captured, `makeTown` gives them `built`, `pool`, `garrison`, `name`, `builtToday`, so the camp object *is* the town. `allTowns()` = home plus `myMajors()`. The town screen works on the viewed town: `VT` (null = home), `TW()` and `TF()` (its banner); `openTown(o)`/`arriveTown(o)` set it, `withTown(t,f)` evaluates for another town (quick-icon dots). Income (`hallGold`), weekly growth, specials (`specialIn`, `facSpecial` over all towns) and `builtToday` run per town in `dayUpkeep`. The Relic Hall exists only at home.
- Rival home towns: `newGame` gives each rival camp `built`, and `growRival` adds one building a week from `RIVAL_PLAN` (two some weeks on Hard); its garrison grows from its best dwelling and walls. The map draws major towns with their stage sprite and name. Twin Ridges now places rival home camps too.
- Outposts (minor `camp`s): +gold and a few recruit tiers (`campTiers`, `campIncome`). Some are held by a rogue (`o.keeper`, listed in `S.jailed`): the rogue leads the garrison in battle (`keeperHero`) and offers to join when beaten (`keeperJoins`). Recruiting posts (`o.station`): one per banner near each home, its own troops (tiers 1-3, +250 gold). `manageHolding` shows the town's garrison strip (`.tstrip.hstrip`: visiting hero and army, garrison row, recruit tiles; click a tile to hire as many as you can afford, click a stack to move it). Troops go into a hero's army only when the hero stands there; from afar recruits wait in the outpost garrison. Town sprites on the map stand flush, with no drop shadow.
- Defaults (v27): 3 rivals, 4 great towns, Large map; every choice on Choose your game is a blue button, the selected one outlined in yellow; the legend is centred. Game menu (`#bMenu`): ✕ in the header returns to the map, a short help line, and six equal buttons in a 3×2 grid (`.gmenu`, `.gmgrid`). Banner cards put Details at the bottom. The hero picker starts each banner on its own swatch (`BANNER_SW`: Rangers teal, Wizards sky blue, Necromancers crimson, Beast Masters leaf green, Pirates gold, Elves forest green, Dwarves dark red, Merfolk deep blue; 12 `PLAYER_COLS`) and shows a flag preview (`.flagprev`); hero pictures fill their square on the chosen colour (`.hcard .hport`, the img ignores max-width). Start with an artifact is a toggle in the hero picker (`pickedArt` → `mo.artifact`), not on Choose your game. Hero portrait URLs carry `?v=27` to skip stale browser caches.
- Setup (`pickMap`): sections Game mode, Rivals and towns, Map (dark blue `.gsec` bars). Rivals 1-6 (Four Rivers 4; picks the recommended size, `REC_SIZE`, marked ★), Great towns 0-6, Outposts Few/Some/Many, Start with an artifact (`mo.artifact`: a random level 1-3 item per starting hero); multiplayer allows 2-5 players. Make your own map sits in the Map row. Stored as `mo.rivals` and `S.setup` (`majors`, `outposts`), read by `furnishMap`.
- Influence: `joinOffer(o)` lets weaker wild stacks (not key guards or elites) join when your army is 3×+ stronger (free at 6×, else gold), or flee if you have no slot (`fightPreview` adds the buttons; `walk` handles `join`/`flee`).
- Difficulty (`DIFF`): Easy, Normal, Hard, Expert. `rv` scales rivals (`rvMul`), `mon` scales wild stacks, guards and lairs at start and the key-guard growth target (`monMul`).
- Ships: boarding or landing a boat ends the hero's movement for the day (`shipSwap`, in `walk` and the path preview); Merfolk swimming is not affected.
- Routes: `setPath(p, meetId)` stores the destination on the hero (`h.route`); `restoreRoute` redraws it after the day ends, on hero select, load and handoff, and the selected hero stays selected through the rivals' turn. The flag shows Today, Tomorrow or N days. Clicking another of your heroes charts a meeting route (⇄); click again to march, and `openTrade` opens on arrival (`meetPath`).
- Weekly report (`weeklyReport`, start of each week and from the ☰ menu): your towns, outposts, heroes, gold a day, land explored, best army and mines; mine pictures with counts (`mineRow`, first frame of the mine sprite); for each rival a vague read, their mines the same way and a picture of their best troop: ground covered (`rv.cov`, 6×6 chunks marked by `markCov`), how rich they look, their best troop and strength against your best army.
- Town advisor (`buildAdvisor`, before `endDay`): each town that built nothing today offers its next building (troops first, `autoPick`, built by `doBuild`); Save my gold ends the day; Stop asking sets `S.noAdvisor` (toggle in the ☰ menu).
- Rival tracking: visible rivals walk step by step during `rivalsTurn` with the camera following; `rv.seen` keeps where you last saw each one, drawn as a faded ghost ("seen day N") on the map and minimap for a week.
- Resources: gems (Gem Grotto mines, gem pickups, pearls) and moonwater (Moonwater Spring mines, flask piles, sea crystals). One of each rare mine per base, farther out and guarded. Upper buildings, upgrades and mine level 3 cost them. The Alchemist's Still (`still`, any town) unlocks `ALCHEMY` in the Market (3 ore + 250 gold → 1 gem; 2 amber + 250 gold → 1 moonwater); prices in `PRICE`.

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
