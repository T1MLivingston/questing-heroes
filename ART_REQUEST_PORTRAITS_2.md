# ChatGPT prompts: remaining portraits, walkers and town wings

Paste one section at a time. For portraits, **attach the current portrait of each hero** (from `assets/portraits/heroes/<id>_128.png`) so the redraw keeps the same character.

---

## Prompt 1: Hero portraits (send in batches of 4-6)

> Redraw these hero portraits for my private fantasy strategy game "Questing Heroes" at much higher detail. I've attached each hero's current low-resolution portrait. Keep the same character, face, colours, clothing and personality, but redraw with finer pixel detail.
>
> **Style:** warm storybook fantasy pixel art, clean dark plum outline, soft light from the upper left, limited palette. Match the attached reference style exactly: O'Malley, Vargas, Dorothy, Sookie and Griffiths.
>
> **Format for each hero:**
> - Square PNG, 1024×1024 or larger, transparent background (no white, no frame, no text).
> - Head-and-shoulders bust, facing slightly to the viewer's right, eyes toward the viewer.
> - The shoulders run off the bottom edge, and the head fills the upper two thirds with a small gap above.
> - Crisp pixel grid with no blur, gradients or anti-aliased edges.
> - Original character only; do not imitate any existing game or film character.
>
> **Batch (hero, banner, look):**
> [paste 4-6 lines from the list below]

**Rows to paste** (worst first):

- **Parker**, Necromancers: hooded skeleton lord in a deep purple cowl, glowing eyes
- **Shadow**, Necromancers: a figure in a dark hood, face mostly hidden in shadow, faint glowing eyes
- **Rago**, Necromancers: a hex mistress in a tall purple witch hat, dark hair, sly smile
- **William IV**, Necromancers: pale vampire noble with slicked black hair and a high red-lined collar
- **Tempest**, Wizards: a storm wizard whose hair and beard are swirling grey-blue clouds, navy robe with a lightning clasp
- **Binx**, Beast Masters: sleek black panther, golden eyes, muscular shoulders, no collar
- **Boopis**, Beast Masters: fluffy orange tabby cat with a blue collar and gold tag, smug smile
- **Oliver**, Rangers: young ranger in a green hood with a bow and quiver
- **Monkey**, Beast Masters: silver-grey gorilla with a leather harness and paw-print buckle
- **Rimmer**, Wizards: bald wizard with a thick dark beard and a navy robe with a high gold-trimmed collar
- **Bear**, Beast Masters: big brown bear, calm and noble
- **Engelman**, Wizards: old wizard with a tall dark star-banded hat, white swept beard, teal-striped cloak
- **Schmickle**, rogue: keep the current design exactly
- **Battaglia**, Rangers: woman with dark curly hair, green ranger cloak, warrior's confidence
- **Elvis**, Merfolk: blue-skinned merman with a black pompadour and fin ears, charming grin
- **Boone**, rogue Elf archer: a NEW face (his current picture is a duplicate of another hero); lean male elf scout with a short bow, leather hood pushed back, keen eyes
- **Holmes**, rogue: sharp-eyed investigator in a dark coat, keen stare (keep current colours)
- **Tinker**, rogue Dwarf: keep the current design
- **Ivan**, Dwarves: smith with a big red beard, bandana and leather apron
- **Letchworth**, Merfolk: green-haired siren keeper with fin ears and pale blue-green skin
- **Livingston**, Elves: blonde elf woman in a green cloak with a small black cat on her shoulder
- **Slack**, Dwarves: dark-bearded dwarf warrior with heavy brows and a studded shoulder guard
- **Love**, Elves: male elf with tied-back white hair, close-cut beard, green robes and eyes, holding a small lute
- **Michael**, Elves: elf with long dark violet hair and silver leaf armour
- **Sheila**, Pirates: woman with long dark curly hair, gold hoop earrings, ornate navy coat
- **Lawrence**, Pirates: scholarly navigator with brass round glasses, wavy hair, chart book (no feather)
- **Grimes**, Dwarves: older dwarf scholar-mage, braided grey beard, spectacles, runed stone jewellery
- **Rocky**, Merfolk: grizzled merfolk elder with a coral crown and barnacled grey-blue skin
- **Dupengeiser**, Dwarves: white-bearded dwarf with brass steam goggles and a copper pipe
- **Perry**, Rangers: woman with braided brown hair, blue eyes, green ranger hood and a quiver
- **Eden**, Elves: red-haired woman with long braids, pointed ears, green and ivory elven clothes

---

## Prompt 2: Map walkers (remaining 18 heroes)

> Make 8-direction map walker sprite sheets for these heroes of my private game "Questing Heroes", matching my existing walkers exactly. Use the same style as the attached sheet for Perry or Vargas.
>
> **Format:**
> - One PNG per hero, 192×384, transparent background.
> - Four 48×48 frames across, eight directions down, in the order S, SW, W, NW, N, NE, E, SE.
> - The 4-frame walk loops; frame 0 is idle.
> - The foot pivot sits at (24,44).
> - Heroes ride a horse, except animal heroes, who walk as themselves.
> - No team flags, rings or guide dots.
> - Nearest-neighbour only.
> - Deliver all sheets packed into **one** atlas PNG, 7 sheets per row, plus a JSON listing hero id → cell.
>
> **Heroes:** Grimes, Ivan, Dupengeiser, Slack, Tinker (Dwarves); Love, Michael, Livingston, Eden, Boone (Elves); Rocky, Elvis, Griffiths, Letchworth (Merfolk); Lawrence, O'Malley, Sheila (Pirates); Holmes (rogue). Match each hero's portrait (attached).

---

## Prompt 3: Town wings (wider town backgrounds)

Use `ART_REQUEST_TOWN_WINGS.md` in the repo as the prompt, with each banner's current `background.png` and its six extra-building pictures attached.

---

**Send-back tip:** to stay under the published game's file limit, zip each batch. Several images per batch is fine; I pack them into atlases on import.
