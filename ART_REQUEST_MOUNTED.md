# Art brief: horseback heroes (done in v73)

All 175 heroes now have horseback art: Mounted Packs 1-4 delivered the last 101 (2026-11-23). Nothing more is needed. The original brief is kept below for reference.

---

# Art brief: horseback heroes (v71, 2026-11-22)

Every hero now has a portrait, an on-foot battle figure and an on-foot map walker. Only 20 heroes also have **horseback** art. A hero picks up a horse at a Horse Fair or the town's Stables. When that happens, the 20 switch to their mounted figure and walker; everyone else keeps walking and fighting on foot. This brief asks for horseback art for the other **155 heroes**. **Progress (v71): 74 heroes now ride; 101 to go.** The Mounted Banner Picks pack covered all 48 remaining banner picks, and Mounted Extras 01 added Azure Hype, Wick, Deep Wave, Ericsonion, Gus & Glen and Midge.

Already done, nothing needed: Anastasia May Dvestia, Battaglia, Boone, Dorothy, Eden, Liam, Livingston, Michael, O'Malley, Oliver, Perry, Sera Venn, Sheila, Sir Giggachins, Tida, Vargas, Vera, Vinay, Zarra, Zenvy.

## Style

Match the Movement Sprites and Remaining Walkers packs:
- warm storybook pixel art
- dark plum outline (#2b1a33)
- light from the upper left
- flat three-tone shading, about 24 colours per hero
- crisp pixels: no anti-aliasing, no gradients, no glow
- binary transparent alpha
- no text, shadows, frames or backgrounds

The rider must match the hero's **approved portrait and on-foot sprites**: same face, hair, costume colours and signature item.

## The mount

- **Default: a horse.** Tint its tack and saddle cloth to the hero's banner colours:
  - Rangers: teal
  - Wizards: sky blue
  - Necromancers: crimson
  - Beastmasters: leaf green
  - Pirates: gold
  - Elves: forest green
  - Dwarves: dark red
  - Merfolk: deep blue
- **Animal or unusual heroes** (a bear, a mouse queen, a parrot, a robot, twins and so on) may ride a fitting steed instead, as long as it is the same size and shape as a horse and reads clearly as "riding". Some ideas:
  - a big friendly ram for a dwarf
  - a stag for an elf
  - a sea-horse-like strider for a merfolk hero
  - a giant hare for a small animal hero
- **Twins and pairs** (Gus & Glen, Mags & Mae and so on) ride one steed together.
- Keep it kid-friendly: no armour spikes, skulls on the horse, blood or anything scary. Necromancer steeds can be pale grey or a gentle ghostly blue, not skeletal.

## Files per hero (same format as the 20 already in the game)

### 1. Mounted battle strip

- Path: `assets/battle/heroes/<id>/mounted/strip.png`
- Size: **768×64**, eight frames of **96×64**.
- Frame order: idle, move A, move B, move C, move D (a four-step gallop loop), attack or cast, hit recoil, defeated.
- The defeated pose is non-graphic: the rider slumps or sits on the ground beside a calm steed.
- Faces **right/east**. Foot pivot (48,60), the steed's hooves on that line.
- Each frame holds one whole rider and steed, centred, with padding, never touching the frame edges.

### 2. Mounted map walker

- Path: `assets/map/walkers/heroes/<id>/mounted/sheet.png`
- Size: **192×384**, 48×48 cells.
- Layout: four gallop frames across, eight direction rows down: S, SW, W, NW, N, NE, E, SE.
- Foot pivot (24,44).
- The west-facing rows may mirror the east-facing rows.

### 3. manifest.json

List each hero's id, name and both paths, as in earlier packs.

The **ids must be exactly as written below** (they come from `js/01-data.js`).

## Suggested batches

Three zips of about 34 heroes each:
1. Rangers, Wizards and Necromancers (39)
2. Beastmasters, Pirates and Elves (38)
3. Dwarves and Merfolk (24)

## Heroes still needing horseback art (101)

Group: **banner pick** = one of the eight shown first on the banner card; **tavern** = met in the tavern; **student** = designed by a student (use the hero name only). Every hero below needs both the battle strip and the map walker.

### Rangers (6)

| id | Name | Group | Needs |
|---|---|---|---|
| `pottery` | Pottery | student | both |
| `cornelius_ii` | Cornelius II | student | both |
| `ward` | Ward | student | both |
| `drew` | Drew | student | both |
| `jake` | J@ke | student | both |
| `juniper` | Juniper | student | both |

### Wizards (19)

| id | Name | Group | Needs |
|---|---|---|---|
| `gale` | Gale | tavern | both |
| `ada` | Ada | tavern | both |
| `mags_and_mae` | Mags & Mae | tavern | both |
| `bloop` | Bloop | tavern | both |
| `bobbythebob` | BobbytheBob | student | both |
| `luckenzo` | Luckenzo | student | both |
| `lord_krishna` | Larishna | student | both |
| `catherine` | Katherine | student | both |
| `rose_flower` | Rose Flower | student | both |
| `bannana_boy` | Banana Boy | student | both |
| `spirit_of_the_forest` | Spirit of the Forest | student | both |
| `celestine_circe` | Celestine Circe | student | both |
| `sir_quackars` | Sir Quackars | student | both |
| `buffalo` | Buffalo | student | both |
| `gerry` | Gerry | student | both |
| `vash` | Vash | student | both |
| `liya` | Liya | student | both |
| `boston` | Boston | student | both |
| `jun` | Jun | student | both |

### Necromancers (14)

| id | Name | Group | Needs |
|---|---|---|---|
| `murmur` | Hush | tavern | both |
| `mara` | Mara | tavern | both |
| `odo_and_otto` | Odo & Otto | tavern | both |
| `bort_simesin` | Bort | student | both |
| `nix` | Nyx | student | both |
| `kushalito_banana` | Kushalito | student | both |
| `kaf_underworld_pharaoh` | Kaf | student | both |
| `sus` | Sus | student | both |
| `samba` | Samba | student | both |
| `emirk` | Emirk | student | both |
| `friendo` | Friendo | student | both |
| `dee` | Dee | student | both |
| `trey` | Trey | student | both |
| `x` | X | student | both |

### Beastmasters (13)

| id | Name | Group | Needs |
|---|---|---|---|
| `briar` | Rusty | tavern | both |
| `wren` | Wren | tavern | both |
| `rumble` | Rumble | tavern | both |
| `bess_and_bea` | Bess & Bea | tavern | both |
| `gilt` | Gilt | tavern | both |
| `fut_esports` | Fut | student | both |
| `king_pharoph_the_3rd` | King Pharoph the 3rd | student | both |
| `nohahahahah` | Nohahahahah | student | both |
| `boja` | Boja | student | both |
| `paitence_and_jay` | Paitence & Jay | student | both |
| `python_mage` | Python Mage | student | both |
| `percifire` | Percifire | student | both |
| `petunia` | Petunia | student | both |

### Pirates (11)

| id | Name | Group | Needs |
|---|---|---|---|
| `cato` | Cato | tavern | both |
| `sid_and_tess` | Sid & Tess | tavern | both |
| `rafe_and_reed` | Rafe & Reed | tavern | both |
| `bo` | Bo | tavern | both |
| `gunt_gunt` | Gunt Gunt | student | both |
| `ardcat` | Ardcat | student | both |
| `space_toad` | Toad | student | both |
| `capydara` | Capybara | student | both |
| `lishy` | Lishi | student | both |
| `alora` | Alora | student | both |
| `pihu` | Pihu | student | both |

### Elves (14)

| id | Name | Group | Needs |
|---|---|---|---|
| `love` | Love | tavern | both |
| `yselle` | Fern | tavern | both |
| `hart` | Hart | tavern | both |
| `aster_and_briar` | Aster & Briar | tavern | both |
| `mr_pinecone` | Mr. Pinecone | student | both |
| `ava_young` | Ava | student | both |
| `rosie` | Rousie | student | both |
| `estella` | Estella | student | both |
| `lily` | Lily | student | both |
| `poison` | Poison | student | both |
| `ella` | Ella | student | both |
| `ezlen` | Ezlen | student | both |
| `anna` | Anna | student | both |
| `macie` | Macie | student | both |

### Dwarves (11)

| id | Name | Group | Needs |
|---|---|---|---|
| `schmickle` | Schmickle | tavern | both |
| `tansy` | Penny | tavern | both |
| `orla` | Orla | tavern | both |
| `ned_and_nat` | Ned & Nat | tavern | both |
| `spike` | Spike | tavern | both |
| `bristle` | Bristle | student | both |
| `posy` | Posy | student | both |
| `babka` | Babka | student | both |
| `teo` | Teo | student | both |
| `astronaut_steve` | Astronaut Steve | student | both |
| `aarna` | Aarna | student | both |

### Merfolk (13)

| id | Name | Group | Needs |
|---|---|---|---|
| `spindle` | Spindle | tavern | both |
| `rusk_hookhorn` | Rusk Hookhorn | tavern | both |
| `axel` | Axel | tavern | both |
| `noel_dragonfire` | Noël Dragonfire | student | both |
| `nala` | Nala | student | both |
| `nanya` | Nanya | student | both |
| `posy_spinner` | Posy Spinner | student | both |
| `yatt` | Yatt | student | both |
| `stargirl` | Stargirl | student | both |
| `mangrove` | Mangrove | student | both |
| `teeka` | Teeka | student | both |
| `h4l1s3` | H4L1S3 | student | both |
| `saki` | Saki | student | both |
