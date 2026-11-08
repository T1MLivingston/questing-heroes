# Art request: Troops Pack 10 (paste into ChatGPT)

Make a pixel-art sprite pack of original fantasy troops for my private game "Questing Heroes". Match the existing Rangers troop sheets: chunky pixel art at 32 px base scale shown at 64 px. Use a clean dark outline, a limited palette and soft top-left light. The look is warm storybook fantasy. Every creature and design must be original. Do not copy or imitate any existing game's units, art, logos or names.

## Format (the same for every troop)

- One PNG sprite sheet per troop with a transparent background.
- Frames are 64×64. Each sheet has 4 columns and 5 rows, so the sheet is 256×320.
- Rows top to bottom: idle, move, attack, hit, death. Each row is a 4-frame loop.
- Every troop faces right, its feet sit on the same baseline, and it is centred in the frame.
- For each sheet, also make a matching team mask PNG of the same size. Paint the pixels that carry the team colour (cloth, banners, trim) pure white, and leave everything else transparent.
- Paths:
  - `units/<faction>/<name>/<name>_sheet.png`
  - `team_masks/units/<faction>/<name>/<name>_sheet.png`
- Size by tier: tier 1 fills about half the frame and tier 5 fills nearly all of it.
- Put all of it in a zip with a README listing every file.

## Troops (faction folder / file name: description)

**Wizards (`wizards`)**, blue and white robes with gold trim
1. `owl_familiar`: a wise brown owl with glowing eyes; flies
2. `apprentice_mage`: a young mage in a blue pointed hat with a staff; shoots sparks
3. `earth_elemental`: a hulking creature of boulders and soil with glowing runes
4. `storm_elemental`: a swirling thundercloud body with lightning crackling through it; flies
5. `archmage`: an old master mage in tall robes who hurls lightning from his staff

**Necromancers (`necro`)**, purple, bone and sickly green
1. `skeleton`: a rusty-sword skeleton warrior
2. `zombie`: a shambling green-skinned corpse in rags
3. `werewolf`: a hulking grey-brown wolf-man, snarling
4. `vampire`: a pale noble in a high-collared black and red cape; flies
5. `hellkite`: the supreme boss, a huge undead dragon of black bone and torn wings, wreathed in green fire; flies

**Beast Masters (`centaurs`)**, orange, tan and leather
1. `war_rabbit`: a big, fierce rabbit with a leather harness
2. `boar`: a bristly charging boar with big tusks
3. `hound`: a lean tracking hound with a studded collar
4. `centaur`: a centaur archer, half warrior and half horse
5. `lion`: a great maned lion, the king of the herd

**Pirates (`pirates`)**, red coats, navy and brass
1. `deckhand`: a tough sailor with a belaying pin (keep the current design idea)
2. `powder_monkey`: an actual monkey in a bandana, lobbing lit powder bombs
3. `duelist`: a flashy swashbuckler with a rapier, a tricorn and a feathered hat, mid-lunge
4. `gunner`: a pirate with a long musket
5. `cannon_crew`: a deck cannon on a wheeled carriage with a gunner. Also make an upgraded version, `great_crossbow`: a giant wheeled crossbow (ballista) firing harpoon-sized bolts.

**Elves (`elves`)**, green, silver and moonlight blue
1. `sprite`: a tiny winged forest sprite; flies
2. `longbow_ranger`: an elf archer with a tall longbow
3. `grove_warden`: a bark-armoured guardian with leaves in their hair and a staff
4. `elven_rider`: an elf with a lance riding a white horse
5. `giant_eagle`: a huge white-headed eagle with golden wings; flies

**Dwarves (`dwarves`)**, orange-red, steel and gold
1. `young_dwarf`: a stubby young dwarf with a short beard and a hammer
2. `dwarf_crossbowman`: a dwarf with a heavy crossbow
3. `dwarf_paladin`: a dwarf in gold-trimmed plate armour with a holy hammer and a shield
4. `ram_rider`: a dwarf riding a curly-horned mountain ram
5. `gem_golem`: a giant stone golem held together by a glowing green heart-gem in its chest

**Merfolk (`merfolk`)**: teal, coral and sand. These troops fight on land, so give them legs, shells or mounts.
1. `spearfolk`: a fin-eared reef guard with a coral spear
2. `siren`: a singer whose voice shows as visible sound rings
3. `giant_crab`: a huge red crab with big claws
4. `turtle_knight`: an armoured knight with a spear riding a great sea turtle
5. `coral_colossus`: a walking giant made of living coral and barnacles

## Also nice to have

- A 64×64 portrait icon per troop, `units/<faction>/<name>/<name>_icon.png`, showing the head and shoulders.

## Hero portraits (same style as the existing 64 and 128 px headshots)

Save to `portraits/heroes/<id>_64.png` and `portraits/heroes/<id>_128.png`: a bust facing slightly left, on a transparent background.

- `sookie`: a new female Wizard with a blue and white robe, a small owl on her shoulder and a warm, clever smile
- `grimes`: now a Dwarf. An older, bespectacled dwarf scholar-mage with a braided grey beard and runed stone jewellery
- `perry`: now an Elf archer. A female elf with braided red hair, brass goggles pushed up, a green and silver ranger cloak and a longbow over her shoulder

## Panel textures

- `ui/textures/parchment_smooth.png` and `ui/textures/navy_smooth.png`: 256×256 seamless fills that are soft and low-contrast, with no visible pixel grain, to sit inside the existing pixel borders
