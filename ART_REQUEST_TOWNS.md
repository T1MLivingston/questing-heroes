# Art request: Town Buildings Pack 13 (paste into ChatGPT)

Make original pixel-art town buildings for my private fantasy strategy game, "Questing Heroes". Match my existing packs:
- the shared 64-colour palette (attach `palette/master_palette.json` from any earlier pack)
- a dark plum outline, light from the upper left, warm storybook fantasy
- transparent backgrounds and crisp integer scaling

Do not copy or imitate any existing game's towns.

## What the screen is

When you open your town, the top of the screen shows a **960×300 picture of the town**. Each building the player has built appears in it as a separate cutout. Empty lots are invisible, and you click a building to open it. So I need:

1. **One backdrop per banner** (960×300, opaque). It shows the ground, sky, paths, the town square and the faction mood, with **no buildings**. Leave clear, flat lots where the buildings will stand.
2. **Building cutouts** (transparent) that sit on those lots. Each one is drawn looking slightly down from the front, and its bottom-centre is its ground point.

**Important for my host's file limit:** deliver each banner as **one sprite sheet PNG plus a JSON file** giving each building's rectangle (`x, y, w, h`) and ground point, not dozens of separate files.

## Buildings for every banner (paint in each banner's style)

| Building | Size | Description |
|---|---|---|
| Moot Hall / Council Hall / High Seat / Crown Seat | 192×160 each | The town hall in **4 growing stages**, from a timber meeting hall to a grand capital with towers and banners. It is the centrepiece of the town. |
| Tavern | 128×112 | A cosy inn with a hanging sign, smoke from the chimney and lit windows (heroes are hired here). |
| Muster Field | 128×96 | A fenced drilling yard with weapon racks and a banner pole (it boosts troop growth). |
| Stables | 128×96 | A barn with horse stalls and hay (it gives heroes a horse). Not needed for Beast Masters. |
| Lantern Library | 112×128 | A small library or study hung with lanterns, where spellbooks are sold. |
| Star Archive | 128×160 | A tall tower library with a domed observatory roof (advanced spells). |
| Barter Yard | 128×96 | A market of stalls and crates, with scales for trading resources. |
| Relic Hall | 144×128 | A shrine-vault with seven empty pedestals behind glass or arches, where relics are delivered. Make a **lit version** too. |
| Palisade / Stronghold / Bastion | 960×80 strip each | The town's **front wall** across the bottom of the picture, in 3 upgrades: a timber stake wall, then a stone wall with a gate, then stone with towers. |

## The five dwellings per banner (one per troop tier)

| Banner | Dwellings, tier 1 to 5 |
|---|---|
| Rangers | Bramble Barracks, Reed Lodge, Antler Stables, Moth Spire, Heartwood Grove |
| Wizards | Owlery, Apprentice Hall, Earthen Circle, Storm Spire, Archmage Tower |
| Necromancers | Bone Pit, Grave Field, Moonlit Kennel, Blood Manor, Hellkite Roost |
| Beast Masters | Warren, Boar Wallow, Kennel Ring, Centaur Camp, Pride Rock |
| Pirates | Bunkhouse, Monkey Rigging, Fencing Deck, Musket Range, Gun Deck |
| Elves | Sprite Bower, Archery Glade, Warden Grove, Silver Stables, Eagle Eyrie |
| Dwarves | Youngling Halls, Crossbow Works, Paladin Chapel, Ram Pens, Golem Forge |
| Merfolk | Coral Barracks, Siren Rocks, Crab Shoals, Turtle Beach, Living Reef |

Sizes: tier 1-2 about 112×96, tier 3-4 about 128×112, tier 5 about 160×144. Each should clearly show who lives there; for example, the Hellkite Roost is a ruined tower with a giant bone nest on top.

## Three special buildings per banner

| Banner | Special buildings |
|---|---|
| Rangers | Bramble Warren, Hunter's Lodge, Waystone Circle |
| Wizards | Owl Roost, Observatory, Arcane Conduit |
| Necromancers | Ossuary, Whispering Crypt, Soul Vault |
| Beast Masters | Den of Plenty, Trial Grounds, Great Paddock |
| Pirates | Galley Hall, Gunnery Range, Smugglers' Cove |
| Elves | Seedling Grove, Moonlit Glade, Sylvan Spring |
| Dwarves | Delving Halls, Runestone, Deep Seam (plus the **Great Forge**, the dwarves' signature building) |
| Merfolk | Spawning Pools, Coral Shrine, Tide Market |

These are about 112×112 each.

## Team colour

Give every building a matching **team mask** in the same sheet layout. Paint the banners, roof trim and flags pure white, and leave everything else transparent, so the game can tint them to the player's colour.

## Deliver

- For each banner: `towns/<banner>/backdrop.png`, `towns/<banner>/buildings.png` (sheet), `towns/<banner>/buildings_mask.png` and `towns/<banner>/buildings.json`.
- Banner folder names: rangers, wizards, necro, centaurs (Beast Masters), pirates, elves, dwarves, merfolk.
- Use building ids in the JSON: `hall1`-`hall4`, `tavern`, `muster`, `stables`, `forge`, `lib1`, `lib2`, `market`, `reliquary`, `reliquary_lit`, `wall1`-`wall3`, `d1`-`d5`, `fb1`-`fb3`.
- Add a preview PNG of each town fully built.
