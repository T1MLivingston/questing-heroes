# CLAUDE.md - Questing Heroes

## Project Overview

Questing Heroes is a browser-based, turn-based fantasy strategy game built with vanilla HTML, CSS and JavaScript. The player picks a game mode, a difficulty (starting resources and rival strength), a map (Wheel & Spoke, Twin Ridges, Underworld or Four Rivers, in three sizes), one of 8 factions and one of 32 heroes (4 per faction), explores a fog-covered map, grows a town, recruits an army and fights tactical battles on a hex grid. The goal is to recover the Seven Relics, hidden in guarded lairs and hunted by rival AI heroes, and deliver them to the town's Relic Hall (internal key `reliquary`) before the day limit (4, 5 or 6 months by map size).

This is a free, non-commercial hobby project. Since 2026-11-12 the repo is public and the game is served by GitHub Pages at https://t1mlivingston.github.io/questing-heroes/ (`.nojekyll` keeps `_banners` folders). The title screen's **About & credits** (`ABOUT_HTML` in `13-boot.js`), `README.md` and `LEGAL.md` hold the notices; keep them accurate when adding art or names.

## Technology Stack

- **Frontend**: `index.html` (markup) + `css/game.css` + plain scripts in `js/` loaded in order (v30 split; no modules, no build: they share one global scope, so later files can use anything declared earlier)
- **Rendering**: HTML5 Canvas 2D API (map and battlefield), DOM for panels and dialogs
- **Art**: Sprite PNGs in `assets/` where they exist (map terrain, rivers, bridges and scenery, battle rocks, every troop (Rangers as 4×5 sheets, the rest as Pack 10 strips), 5 hero map sprites, hero portraits); everything else is still drawn in code, and the drawn version is the fallback for any missing image
- **Fonts**: Alegreya SC (display, numbers, canvas text) and Alegreya (body), SIL Open Font License: self-hosted since v38 in `assets/fonts` (latin woff2 from Fontsource, `OFL.txt`; `@font-face` at the top of `game.css`), so the game makes no requests to other sites. The claude.ai copy embeds them as data URIs in its CSS
- **Look**: gilded gold panels with dark ink text and royal blue for highlights, selection and primary buttons, on a deep navy page. The map, battle screen, map hover box and toasts stay dark (they reset the colour variables). Actions sit in the top bar (Town, Hero, End day, ☰ menu); the right-hand ledger must fit the window without scrolling
- **No build tools**: open `index.html` in a browser to play

## File Structure

```
questing-heroes/
├── index.html    # Page markup; loads css/game.css and js/*.js in order
├── css/game.css  # All styles (asset URLs are ../assets/...)
├── js/           # 00-core helpers, 01-data, 02-art, 03-map (generators, camera, drawing, pathfinding),
│                 # 04-ui, 05-adventure, 06-rivals, 07-town, 08-battle, 09-start (pickers),
│                 # 10-save (end states, saves, Hall of Fame), 11-input, 12-editor, 13-boot, 14-tutorial, 15-creator
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

The script in `js/*.js` (one file per section below; the old single-file markers are kept at the top of each file) is split into sections marked with `/* ===== ... ===== */` or `/* -------- ... -------- */` comments:

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

- Rosters (tiers 1-5): Rangers Thornguard, Reedbow, Antler Knight, Moth Seer, Oak Warden; Wizards Owl Familiar, Apprentice Mage, Earth Elemental, Storm Elemental, Archmage; Necromancers Skeleton, Zombie, Werewolf, Vampire, Hellkite; Beastmasters War Rabbit, Boar, Hound, Centaur, Lion; Pirates Deckhand, Powder Monkey, Duelist, Gunner, Cannon Crew (upgrade: Great Crossbow); Elves Sprite, Longbow Ranger, Grove Warden, Elven Rider, Giant Eagle; Dwarves Young Dwarf, Dwarf Crossbowman, Dwarf Paladin, Ram Rider, Gem Golem; Merfolk Spearfolk, Siren, Giant Crab, Turtle Knight, Coral Colossus. The merman hero with id `elvis` is shown as **Eelvis**.
- Saves from before this roster are migrated by tier in `migrateRoster` (`OLD_ROSTER`, `S.roster` = 2). Grave Harvest and Raise Bones make Skeletons.
- Heroes per banner (4 each): Rangers Perry (id `perry` since v27: female Ranger portrait, Rootkeeper, banner walker), Dorothy, Oliver, Battaglia; Beastmasters Bear (a bear, Lions +2/+2), Monkey, Binx, Boopis; Necromancers Parker, Shadow (hooded), Rago, William IV; Dwarves include Grimes; Elves include Eden (id `eden` since v27: red-haired female Elf; `migrateTowns` swaps the old ids once, `S.ids27`); Wizards include Sookie (a lion). Heroes with `retired:true` (Davis) stay in `HBY` for old saves but are removed from `HEROES`.
- Rogues (`rogue:true`, v39): Boone (Quickdraw), Holmes (Sharp Eyes), Tinker (+15% movement, `fx.mpPct`; placeholder name), Alderhide, Briar, Mossback and Virel. Schmickle (+250 gold a day) is now the Beastmasters' tavern hero (`tav:true`). They never appear in pickers or as rivals: only in the tavern (`hireable`: two of your banner, then rogues) and in `prison` objects (`furnishMap` places one per ~34 tiles of width, each holding one rogue in `o.rogue`, listed in `S.jailed`, with a monster beside it). Visiting a prison frees the rogue into your party if you have room under `heroCap()`.
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
- Town screens (layered): `TOWN_SCREEN[fac]` holds an atlas `towns/<fac>/screen.png` (640×360 background at 0,0 plus each building piece as `[atlas x, y, w, h, scene x, y]`) and `sites` mapping each art site to game buildings. `drawArtTown` draws it in the middle of the 960×360 town canvas (the sides mirror the scene's edges); unbuilt sites are invisible clickable lots, clicks test the piece's alpha (`artTownAlpha`), and built buildings with no picture get small signs down the left margin. Rangers (v26): hall stages; the banner Details page shows the fully built town (`paintTownPrev`); Bramble Barracks = thornguard_barracks, Reed Lodge = reedbow_range, Antler Stables or horse Stables = stables, Moth Spire = hedge_witch_cottage, Lantern Library = spell_lodge, Barter Yard = trader_lodge, Muster Field = training_yard, Tavern, Hunter's Lodge = watchtower, any troop upgrade = smithy, walls = palisade_gate. v27 added Pirates (harbor_hall_*, the siege yard switches to the Great Crossbow piece once `u5` is built: a site's optional 4th/5th entries are the alternate piece and the building that shows it), Necromancers (ossuary_hall_*) and Merfolk (tide_hall_*), each with all five dwellings; their lookout tower is the `fb2` building and the Pirates' shipyard is `fb3`. v28 added Dwarves (mountain_hall_*; the smithy stands for the Great Forge and troop upgrades), Elves (silverbough_hall_*) and Wizards (council_hall_*; the Starwatch Observatory is the Observatory, `fb2`). Beastmasters (pack_hall_*; the Trail Corral is the Great Paddock, `fb3`, so the shared extra picture is skipped for it) completed all eight banners. The banner Details page shows the fully built town below the heroes and troops. Missing Buildings packs A and B: the Relic Hall, Heroes' Lodge, Star Archive, Alchemist's Still, growth (`fb1`) and special (`fb3`) building for all eight banners, packed into `towns/extra_buildings.png` (128×128 cells, row per banner `XB_ROW`, column per building `XB_COL`, foot at 64,120). They show on the Build tab (`bldThumb`, also for Beastmasters) and stand in the town picture's side margins (`XB_SPOT`, three a side; unbuilt ones are clickable lots). Buildings still without a picture get small signs at the top-left inside the scene. Heroes stand below the wall piece (`gate` defaults to it). The Build tab shows each building's own picture cropped from the atlas into a square (`bldThumb`, upgrades show their dwelling); banners without town art keep emoji. Other banners still use the drawn town.
- Town Wings pack (v35): `towns/wings.png` holds a real 960×360 scene per banner (8 rows of 360, `XB_ROW` order; centre pixel-identical to each `screen.png` background), drawn by `drawArtTown` instead of mirrored edges. `XB_LOTS[fac]` gives each extra building's foot point and draw order in the wings (`xbSpots`); `XB_SPOT` is the fallback. The Heartwood Grove cell now uses the common (64,120) anchor. `ART_REQUEST_ICONS.md` is the brief for skill, spell, ability, trait and status icons.
- Resources & Map Sites pack (v29): one atlas `map/world_extras.png` (`WX` table, drawn by `wxAt`, bottom-centre): Gem Grotto and Moonwater Spring mines (2 frames), moonwater and gem piles, prison, horse fair, Woodcutters' Camp, Abandoned Ore Cart, Amber Hollow and the outpost/recruiting post sprite. Gem and moonwater icons are `ui/icons/gem.png` and `moonwater.png`. Heartwood Grove (Rangers tier 5) is column 6 of `towns/extra_buildings.png` (`XB_ONLY`), standing in the Rangers town's right margin (`XB_SPOT_FAC`).
- Setup Icons pack (v31): 70 icons of 64×64 in one atlas `ui/setup_icons.png` (10 a row, names in `SICONS`), placed with `ico(name, px)` (a background-sprite span): difficulty, game modes, rivals 1-6 and great towns 0-6 (numbered banners and castles), outposts, map sizes, New layout, Make your own map, Back/Next, the title buttons, the legend and the Start-with-an-artifact toggle. The faction shields `shields/<fac>_96.png` now hold the pack's 128 px crests. Hero names wear a thick black outline in the player's colour (`.qh-name`: side panel and hero picker).
- Portraits redrawn in v31 (Dorothy, Sookie, O'Malley, Vargas, Griffiths `mer2`) are 256 px files kept under the `_128.png` name; portrait URLs carry `?v=30`.
- Art storage: every PNG under `assets/` is committed to the private GitHub repo (v30; `*.png` is no longer gitignored), so the repo is the full backup and the game runs locally with no file limit. The published artifact is separate: it allows 511 files and holds about 499, so art for it still goes into atlases. It cannot load images from the private repo. The artifact copy loads one bundled `js/game.js` (the `js/*.js` files concatenated in order) plus `css/game.css`, to stay under the file limit.
- Opening `index.html` straight from disk (`file://`) works: browsers refuse to export canvases holding our art there, so `bldThumb` falls back to a CSS crop of the atlas (`thumbOut` returns `{css}`), and pixel reads (`tinted`, `artTownAlpha`) are wrapped in try/catch (team colours show as drawn).
- Add new art by dropping files in the same layout and adding the id to the matching table. `assets/manifest.json` is the art pack's full registry.

### Map size and variety

- `MAP_SIZES` (v26): Small 60×46, Medium 74×57, Large 92×70, Extra large 110×84 (v34, about 10% bigger) (the classic genre uses 36/72/108/144 squares; our tiles draw larger). `majors` and `outposts` are the default counts of great towns and outposts. `astar` uses a binary heap. Big maps keep fewer water frames (`terrainPh` length 1-4).
- Each seed rolls a biome (`BIOMES`, `biomeOf`, `BIO` shifts the terrain thresholds in every generator; shown on the map card). Object counts jitter ±25% (`jit`). Wild monsters get a level 1-4 (weak, normal, strong, elite: `MON_LVL`, size ×0.6-1.9; elites drop gold and maybe an artifact). Free towns are Village, Town or City (`lvl`, `TOWN_LVL`, `campIncome`, `campTiers`). Each week rolls an event (`EVENTS`, `rollEvent`, `S.event`).

### Town growth, walls and sieges

- `FAC_BUILD[fac]`: three banner-only buildings (`fb1` horde: extra weekly growth for one troop; `fb2` visit: each hero gains +1 to a stat once, on arrival; `fb3` special, checked with `facSpecial`: `mpTown`, `manaRegen`, `harvest`, `horde2`, `goldWeek`, `amberDay`, `oreDay`). Costs in `FB_COST`.
- `WALLS`: Palisade, Stronghold (+50% growth), Bastion (+100% growth, towers). `wallLvl()`; `townDefense()` is the garrison's power times the wall bonus (plus the towers). The garrison no longer joins a hero automatically; move troops on the town screen.
- Sieges (single player): after day 7 a rival may target your town when no hero is home and it out-powers `townDefense()`. If it wins, `S.town.taken` is set: no town income or growth, the town can't be entered, and the rival (`rv.occupy`) stays at the gate. Beat it there to free the town; after 7 days held, you lose.
- Towns (v25): `S.town` is the home town. Major towns are `camp` objects with `isMajor(o)` (free great towns with `major:true`, and every rival's home camp). Once captured, `makeTown` gives them `built`, `pool`, `garrison`, `name`, `builtToday`, so the camp object *is* the town. `allTowns()` = home plus `myMajors()`. The town screen works on the viewed town: `VT` (null = home), `TW()` and `TF()` (its banner); `openTown(o)`/`arriveTown(o)` set it, `withTown(t,f)` evaluates for another town (quick-icon dots). Income (`hallGold`), weekly growth, specials (`specialIn`, `facSpecial` over all towns) and `builtToday` run per town in `dayUpkeep`. The Relic Hall exists only at home.
- Rival home towns: `newGame` gives each rival camp `built`, and `growRival` adds one building a week from `RIVAL_PLAN` (two some weeks on Hard); its garrison grows from its best dwelling and walls. The map draws major towns with their stage sprite and name. Twin Ridges now places rival home camps too.
- Outposts (minor `camp`s): +gold and a few recruit tiers (`campTiers`, `campIncome`). Some are held by a rogue (`o.keeper`, listed in `S.jailed`): the rogue leads the garrison in battle (`keeperHero`) and offers to join when beaten (`keeperJoins`). Recruiting posts (`o.station`): one per banner near each home, its own troops (tiers 1-3, +250 gold). `manageHolding` shows the town's garrison strip (`.tstrip.hstrip`: visiting hero and army, garrison row, recruit tiles; click a tile to hire as many as you can afford, click a stack to move it). Troops go into a hero's army only when the hero stands there; from afar recruits wait in the outpost garrison. Town sprites on the map stand flush, with no drop shadow.
- Defaults (v27): 3 rivals, 4 great towns, Large map; every choice on Choose your game is a blue button, the selected one outlined in yellow; the legend is centred. Game menu (`#bMenu`): ✕ in the header returns to the map, a short help line, and six equal buttons in a 3×2 grid (`.gmenu`, `.gmgrid`). Banner cards put Details at the bottom. The hero picker starts each banner on its own swatch (`BANNER_SW`: Rangers teal, Wizards sky blue, Necromancers crimson, Beastmasters leaf green, Pirates gold, Elves forest green, Dwarves dark red, Merfolk deep blue; 12 `PLAYER_COLS`) and shows a flag preview (`.flagprev`); hero pictures fill their square on the chosen colour (`.hcard .hport`, the img ignores max-width). Start with an artifact is a toggle in the hero picker (`pickedArt` → `mo.artifact`), not on Choose your game. Hero portrait URLs carry `?v=27` to skip stale browser caches.
- Setup (`pickMap`): sections Game mode, Rivals and towns, Map (dark blue `.gsec` bars). Rivals 1-6 (Four Rivers 4; picks the recommended size, `REC_SIZE`, marked ★), Great towns 0-6, Outposts Few/Some/Many, Start with an artifact (`mo.artifact`: a random level 1-3 item per starting hero); multiplayer allows 2-5 players. Make your own map sits in the Map row. Stored as `mo.rivals` and `S.setup` (`majors`, `outposts`), read by `furnishMap`.
- Influence: `joinOffer(o)` lets weaker wild stacks (not key guards or elites) join when your army is 3×+ stronger (free at 6×, else gold), or flee if you have no slot (`fightPreview` adds the buttons; `walk` handles `join`/`flee`).
- Difficulty (`DIFF`): Easy, Normal, Hard, Expert. `rv` scales rivals (`rvMul`), `mon` scales wild stacks, guards and lairs at start and the key-guard growth target (`monMul`).
- Ships: boarding or landing a boat ends the hero's movement for the day (`shipSwap`, in `walk` and the path preview); Merfolk swimming is not affected.
- Routes: `setPath(p, meetId)` stores the destination on the hero (`h.route`); `restoreRoute` redraws it after the day ends, on hero select, load and handoff, and the selected hero stays selected through the rivals' turn. The flag shows Today, Tomorrow or N days. Clicking another of your heroes charts a meeting route (⇄); click again to march, and `openTrade` opens on arrival (`meetPath`).
- Weekly report (`weeklyReport`, start of each week and from the ☰ menu): your towns, outposts, heroes, gold a day, land explored, best army and mines; mine pictures with counts (`mineRow`, first frame of the mine sprite); for each rival a vague read, their mines the same way and a picture of their best troop: ground covered (`rv.cov`, 6×6 chunks marked by `markCov`), how rich they look, their best troop and strength against your best army.
- Town advisor (`buildAdvisor`, before `endDay`): each town that built nothing today offers its next building (troops first, `autoPick`, built by `doBuild`); Save my gold ends the day; Stop asking sets `S.noAdvisor` (toggle in the ☰ menu).
- Rival tracking: visible rivals walk step by step during `rivalsTurn` with the camera following; `rv.seen` keeps where you last saw each one, drawn as a faded ghost ("seen day N") on the map and minimap for a week.
- Resources: gems (Gem Grotto mines, gem pickups, pearls) and moonwater (Moonwater Spring mines, flask piles, sea crystals). One of each rare mine per base, farther out and guarded. Upper buildings, upgrades and mine level 3 cost them. The Alchemist's Still (`still`, any town) unlocks `ALCHEMY` in the Market (3 ore + 250 gold → 1 gem; 2 amber + 250 gold → 1 moonwater); prices in `PRICE`.

### v30 balance and depth

- Rival economy (`06-rivals.js`): `S.rivEco[fac]` = gold and a recruit pool. `rivalEconomy(weekly)` runs each day before `rivalsTurn`: income from the rival's home hall, captured towns and mines (`rivalIncome`); each week its dwellings muster, it buys the best troops (upgraded once `u1`-`u5` are built), hires mercenaries at +30% with spare gold, builds up to two (Expert three) `RIVAL_PLAN` buildings (`RIVAL_COST`), retrains troops, and from week 3 (week 2 on Hard/Expert) hires a second hero (third on Expert). Recruits join a hero near home or wait in the home garrison; rivals come home to collect them (`tg.pickup`). `growRival` now only adds a stat. `DIFF.agg` (`aggMul`) scales how readily rivals attack your heroes, camps and town.
- Battle AI (`08-battle.js`): the enemy hero (rival or outpost keeper) casts one spell a round from its banner's `FAC_SPELLS` (`enemyCast`, mana = Lore × 10); Warding cuts the damage. Pinned shooters step back to shoot; melee stacks hold the line behind their own archers or walls. Attacking a walled town (`o.built` with a wall level) is a siege: a wall line with one gate (`bt.wall`, drawn in `drawBattle`), defenders +wall level defense, and two towers on Bastion that fire each round (`towersFire`).
- Economy: weekly army upkeep, 3% of every fielded or garrisoned troop's price (`upkeepNow`, shown in the top bar); unpaid upkeep gives −2 morale for the week (`S.unpaid`), and negative morale can make stacks falter. Captured towns send 60% of their hall's gold (`COLONY`). Market prices rise 12% per unit bought and fall 8% per unit sold within a week (`mkt`, `buyPrice`, `sellPrice`); each alchemy batch costs 100 more gold that week (`alchCost`). Gem and moonwater mines and pickups yield less.
- Skills: three levels, Basic, Advanced and Expert (`h.skLv`, `skLevel`, `skL`, `SK_TXT`); every skill scales with level. New skills Estates (+250 gold a day per level), Learning (+10% XP) and Sorcery (+15% spell Power). Each level-up offers a stat, then a skill pick: a new skill (up to six, `SK_MAX`) or an upgrade.
- Spells: Weaken, Frost Lance, Rally and Meteor joined the lists (`SP`, `FAC_SPELLS`, altars).
- Stats and fame (`10-save.js`): `S.stats` counts battles won and lost, foes slain, towns taken and rival heroes beaten; the victory and defeat screens show them with a score (`scoreOf`, scaled by difficulty) and the rank in the Hall of Fame (`questing-heroes-fame` in localStorage, top 20; open it from the title).
- New games show a loading bar while the map is generated and painted (`loading`).
- Hero panel: the portrait grows with the window up to a square (`.hportrait` height clamp), the mana and movement bars carry their labels, and army tiles shrink on short screens.

### v33 town and bar tidy-up

- Build tab cards share one layout: picture, name, a one-line `short` (set at the end of `townBuildings`: gold, growth, upgrade or effect), a Details fold-out with the full `desc`, then cost and the Build button pinned to the bottom (`.bshort`, `.bdet`, `.bfoot`).
- The town screen offers **Next town: <name>** beside Leave town when you hold more than one town (`nextTowns(tw)`: the towns after this one, skipping any held by a rival).
- The top bar shows only the banner (no faction title like "Saltwind Corsairs"); below 1560 px the brand text hides and the relic strip shrinks so the ☰ menu and End day never leave the window. Command bar buttons are 48 px tall.

### v34 Choose your game

- Buttons on Choose your game are light parchment plaques (selected: gold glow), not blue squares. Difficulty, rivals, players, great towns and outposts are bare icons (`.dchip.bare`): flag or numbered banner plus name.
- Game modes: Relic Hunt ("Find the 7 relics"), Conquest ("Be the last hero standing"), Multiplayer; a big centred icon over the name and one line (`.modes3`). Grail Quest is hidden from the picker (`MODES.grail` and its code stay for old saves).
- Great towns and outposts default to Random (🎲), rolled from the map seed by `seedPick`: `TOWN_W` makes 2-4 towns common and 0 or 6 very rare (about 2% each); `OUT_W` makes Some about 55%. New layout re-rolls them.
- Banner Details: the ability is one line under the name (`.fd-ab`); the Travel and Home town boxes are gone.

### v35 bug fixes

- `ensureAccess(bases)` runs after `furnishMap` on generated maps (not custom ones): it floods from every home (through towns, camps, portals, spires, monsters and water) and, for any object that can't be reached, carves a dirt path through forest or crags to the nearest reached tile (Dijkstra, 4-way, never through the underworld bedrock rows). `S.accessFixed` counts the fixes; 32 test maps needed 58 and none were left unreachable.
- Battle frames are drawn from per-frame canvases (`stripFrame`, `FRAME_CACHE` in `08-battle.js`), so shrinking with smoothing no longer bleeds the neighbouring pose into the defeat animation.
- `drawBattleHero` stands each hero at the top of its side column with the whole figure in view; the spellbook orb sits under the name and mana. The troop info card (`.bt-card`) moved to the bottom centre.

### v36 skill icons and level-up

- Skill Icons pack: 17 icons of 64×64 in `ui/skill_icons.png` (6 a row, `SKI_ORDER`); `SK_ICON` maps game skill keys to them (Stewardship = Estates, Quick Study = Learning; Field Surgery and Silver Tongue wait for those skills). `skIco(k, px)` returns a sprite span (Sorcery borrows the spellbook icon until it has art). Icons show on the hero sheet, tavern, hero picker and level-up.
- Level-up: the stat choice and the skill choice are rows of centred cards (`.skgrid`, `.skcard`: big icon, name, level step tag, effect). The skill choice offers up to four: two new skills and two upgrades when available.

### v37 Tavern Recruits

- 19 more heroes (`recruit:true` in `HEROES`): three each for Beastmasters (Alderhide, Briar, Mossback), Elves (Ilyra, Tavian, Yselle), Necromancers (Veyra, Graven, Ossin), Merfolk (Spindle, Skimmer, Atoll), Dwarves (Brynja, Tansy, Kiln) and Wizards (Purl, Quillby, Folio), plus the rogue Cresset. Recruits never appear in the banner and hero pickers or as a rival's first hero; the tavern offers them with their banner, and rivals may hire them as extra heroes. They use the banner walkers.
- Portraits: single files `portraits/heroes/<id>_128.png` (repo) and one atlas `portraits/heroes/recruits.png` (10 a row; the published copy only ships the atlas). `iconURL('hero')` calls `recruitPortrait`, which crops the atlas to a data URL, or falls back to the single file before it loads or on file://.
- Tavern cards (`.tavcard`): a big portrait on the hero's banner colour, name and crest, banner and type, the ability, stats, skill and artifact icons (hover for the effect, `itemTxt`), cost and Hire.

### v38 more recruits

- Six more tavern recruits: Pirates Inkwake (Deckhands +2/+2), Saltjaw (Duelists +2 attack, +1 speed), Pip Quickline (+2 vision, Powder Monkeys +3 growth); Beastmasters Zahara (Centaurs +1 attack, +2 speed), Tembor (army +1 morale, Boars +2 defense), Virel (army +1 luck and +1 morale; `fx.luck` now counts in `sLuck`). They join `RECRUIT_PORT` and the `recruits.png` atlas (25 portraits, 10 a row). Every banner except Rangers now has three recruits.

### v39 six heroes per banner

- Each banner shows the same six heroes everywhere (banner cards 3×2, Details page, hero picker, rivals' first heroes); a seventh per banner has `tav:true` and is only met in the tavern, which always offers it first among your banner's two slots: Rangers Cresset, Wizards Sera Venn (Folio retired in v40), Necromancers Graven, Beastmasters Schmickle, Pirates Pip Quickline, Elves Tavian, Dwarves Tansy, Merfolk Spindle. Rangers reached six in v40.
- Beastmasters' six: Bear, Boopis, Monkey, Binx, Zahara, Tembor. Alderhide, Briar, Mossback and Virel became rogues (no banner) with Boone, Holmes and Tinker. The `recruit` flag is gone.
- `ART_REQUEST_NEXT.md` lists the art still needed (two Rangers heroes, the skill icon PNG, 43 map walkers, the icon batches).

### v40 sixteen more heroes

- Rangers Nessa Holt (Trail Surveyor) and Reedcall (Reedbows +2 shots, +1 damage) complete the Rangers' six. Fourteen more are extra tavern heroes (`tav:true, extra:true`): Wizards Gliss; Necromancers Murmur, Rattleclaw; Beastmasters Silka, Flintback; Pirates Bess Bell, Rusk Hookhorn; Elves Aster, Thornfrill; Dwarves Harlan Chalk, Morel; Merfolk Iona Shoal, Nerka. Sera Venn is the Wizards' main tavern hero; Folio is retired (kept for old saves).
- The tavern (`hireable`) always offers four: the banner's main tavern hero, one of its extras (rotates weekly), one of its regular six, and a free rogue (or a wanderer from another banner), padded with more of the banner's own heroes when short.
- `RECRUIT_PORT` and `recruits.png` now hold 41 portraits (10 a row).

### v41 balance pass and city scenes

- City Scenes pack: `towns/wings.png` now holds redrawn 960×360 scenes for all eight banners (same lot coordinates and centre offset; the centre no longer matches `screen.png`'s background, which is only the fallback before the atlas loads). `paintTownPrev` (banner Details) uses the scene's centre too.
- Every hero starts with an artifact: `START_ITEM` fills in the newer heroes that had none.
- New ability hooks (player side only): `forgePlus` (extra Great Forge attack), `armyDef` (whole army defense), `rangedPct` (shooter damage), `halfCost` (one spell at half mana), `manaCut` (all spells cheaper), `squallPct`, `weakenPct`.
- Raised: Ivan (Forge half ore, +1 more attack), Oliver (30% cheaper rough ground, +5% movement), Shadow (harvest 20%), Sheila (Squall +30%), Grimes and Griffiths (+1 speed to their troop). Made distinct: Veyra, Gliss, Silka, Murmur, Boone, Mossback, Aster, Nessa Holt. Trimmed: Schmickle and Quillby to +200 gold a day. Battaglia is a Might hero.

### v43 final roster, hero creator

- Eight heroes per banner in every picker and two tavern wanderers (`tav:true`; the `extra` flag is gone). Banner cards show the eight 4×2 with Details beside the name; Necromancers, Wizards and Rangers tiles use a lighter backing (`[data-fac]` rules at the end of `game.css`). The Details page and hero picker use four columns.
- Retired (kept in `HBY` for saves): Love, Ilyra, Tavian, Aster, Brynja, Purl, Quillby, Nessa Holt, Saltjaw. Renamed (old saves fixed by `OLD_NAMES` in `migrateTowns`): Reedcall → Crestwind, Veyra → Vesra, Ossin → Osrin, Graven → Lore, Zahara → Zarra, Tembor → India, Cresset → Wick (now the Rangers' wanderer), Yselle → Fern, Atoll → Coral. Boopis and Thornfrill moved to the Rangers; Schmickle and Briar are rogues; Mossback and Alderhide are the Beastmasters' wanderers.
- New heroes: Peyto (Pirates), Nissa (Rangers), a second Livingston (`livingston_cyborg`, Elves; `fx.partner`/`partnerMorale`: +1 army morale in `sMorale` while his partner is in your party, and the other way round), Enzo (Dwarves), and wanderers Axel (Merfolk), Dot (Rangers), Gale (Wizards). `RECRUIT_PORT`/`recruits.png` hold 48 portraits.
- Tavern (`hireable`): the banner's two wanderers, one of its eight, and a rogue (or a hero of another banner).
- Tutorial: step 1 offers **No thanks, I'll play on my own**; every later step has **✕ Leave tutorial**.
- Hero creator (`js/15-creator.js`, title button **Create your hero**): a student worksheet (name, what they are, banner, Might or Magic, look, three traits, home, want, fear, 6 stat points with at most 4 in one, an ability (boost a troop, a map perk or written), a spell (banner list or invented)). It writes a story paragraph and an art prompt live, with Copy, Print (opens a printable sheet with a drawing box) and Start over. The draft is saved only in this browser (`questing-heroes-creator`); nothing is sent anywhere.

### v42 tutorial

- `js/14-tutorial.js`: a guide panel (`#coach`, bottom right, ▾ shrinks it) walks the first week in 15 steps (`TUT_STEPS`): welcome, treasury, open town, build (Council Hall), recruit all, claim a mine, use every step and end day, build a Tavern, hire a second hero, Gather, claim three mines, win a fight, build daily until day 8, recruit the new week, wrap-up. Each step has `done(st)` (checked every 400 ms by `tutTick`), an optional `start(st)` baseline, a `glow` selector (`.tut-glow`) or a `map` target (pulsing ring drawn by `tutDraw` from `drawMap`). State is `S.tut` (`i`, `st`), so it saves; Skip ends it.
- Choose your game has a **📘 Tutorial** toggle (`data-tut`): on by default until a tutorial has been started on this browser (`questing-heroes-tutorial-seen`); turning it on picks Extra large. Single player only (`mo.tutorial`); `startNew` calls `tutStart()`.

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
