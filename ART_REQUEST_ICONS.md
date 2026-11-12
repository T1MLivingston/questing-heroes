# ChatGPT prompts: ability, spell and status icons

Paste the **style block** first, then one batch at a time. Attach two or three existing icons from `assets/ui/icons/` (for example attack.png, spellbook.png, mana.png) so the new ones match.

---

## Style block (paste with every batch)

> Make a set of square icons for my original fantasy strategy game "Questing Heroes". Match the attached icons exactly: warm storybook pixel art, dark plum outline, light from the upper left, limited palette, readable at small size.
>
> **Format**
> - Each icon is 64×64 on a transparent background, with the symbol filling about 80% of the square and a 2 px clear margin.
> - No text, numbers or letters inside the icons, and no frames or borders (the game draws the frame).
> - Use nearest-neighbour pixels only: no blur, gradients or soft glow halos.
> - Each icon must read as its idea from across a room: one bold symbol, at most two colours of accent.
> - Use original symbols only, not taken from any existing game.
>
> **Deliver** all icons of the batch packed into **one** PNG atlas, 8 icons per row, in the order listed, plus a JSON file listing `name → [column, row]`. Zip the PNG and JSON together.

---

## Batch 1: Hero skills (32)

The skills heroes learn on level-up. One icon per skill; the game adds Basic, Advanced or Expert pips around it.

| # | name | Idea for the symbol |
|---|---|---|
| 1 | skill_bladework | crossed swords with a bright edge glint |
| 2 | skill_shieldcraft | round kite shield with a rivet ring |
| 3 | skill_steadyaim | drawn bow with an arrow on a target ring |
| 4 | skill_forcedmarch | winged boot on a road |
| 5 | skill_arcane | open book with a floating star |
| 6 | skill_deepres | tall mana flask, deep blue, overflowing |
| 7 | skill_battleplan | map with arrows and two pawn tokens |
| 8 | skill_farsight | spyglass with a shining lens |
| 9 | skill_seamanship | ship's wheel |
| 10 | skill_warding | blue rune circle deflecting a spark |
| 11 | skill_meditation | crescent moon over a calm candle flame |
| 12 | skill_command | raised banner with a crown finial |
| 13 | skill_fortune | four-leaf clover with a gold coin |
| 14 | skill_estates | stack of gold coins beside a little manor |
| 15 | skill_learning | quill over an open scroll |
| 16 | skill_sorcery | hand with a purple spark swirl |
| 17 | skill_fieldsurgery | bandage roll and herb sprig |
| 18 | skill_silvertongue | speech scroll tied with a silver ribbon |
| 19 | skill_pathfinding | compass rose over a forest trail |
| 20 | skill_scouting | feather and footprint |
| 21 | skill_logistics | supply wagon wheel and sack |
| 22 | skill_tactics | chess-like knight piece on a hex |
| 23 | skill_archery | quiver full of arrows |
| 24 | skill_offense | flaming spear tip |
| 25 | skill_armorer | plate breastplate |
| 26 | skill_necromancy | skull with green wisps |
| 27 | skill_mysticism | glowing crystal on a pedestal |
| 28 | skill_resistance | cracked spell bolt hitting a stone wall |
| 29 | skill_mentor | wise owl perched on a book (nearby heroes learn faster) |
| 30 | skill_ambush | eyes in a dark bush |
| 31 | skill_firstaid | small red heart with a cross stitch |
| 32 | skill_trade | balance scales with a coin and a gem |

---

## Batch 2: Spells (40)

Existing spells first, then new ones planned for the game.

| # | name | Idea for the symbol |
|---|---|---|
| 1 | spell_ember | small fire dart |
| 2 | spell_chain | forked lightning linking three dots |
| 3 | spell_squall | swirling wind gust with rain |
| 4 | spell_entangle | grasping green vines |
| 5 | spell_raise | skeletal hand rising from soil |
| 6 | spell_geyser | scalding water jet from cracked ground |
| 7 | spell_mend | glowing green leaf with a sparkle |
| 8 | spell_swift | wind-swept feather |
| 9 | spell_bark | bark-textured shield |
| 10 | spell_starfall | three falling stars |
| 11 | spell_weaken | cracked sword |
| 12 | spell_frost | icicle lance |
| 13 | spell_rally | war horn with sound rings |
| 14 | spell_meteor | flaming rock with a tail |
| 15 | spell_teleport | swirling portal ring with a footprint |
| 16 | spell_clearpath | pickaxe breaking a boulder |
| 17 | spell_hypnosong | lute with spiralling music notes |
| 18 | spell_summonpanther | big black panther head with golden eyes |
| 19 | spell_roar | bear jaws with sound waves |
| 20 | spell_purr | cat face with a pink heart |
| 21 | spell_collarbell | small gold bell on a blue collar, healing sparkles |
| 22 | spell_decoys | three shadowy soldier silhouettes |
| 23 | spell_healingtide | curling wave with a green cross of light |
| 24 | spell_shadowvolley | dark arrows trailing smoke |
| 25 | spell_stun | star burst over a dazed head |
| 26 | spell_haste | hourglass with motion lines |
| 27 | spell_slow | snail shell on an hourglass |
| 28 | spell_bless | sun disc over a sword |
| 29 | spell_curse | purple eye with a dark drip |
| 30 | spell_stoneskin | rock-plated fist |
| 31 | spell_fireball | big orange fire sphere |
| 32 | spell_quake | cracked earth splitting |
| 33 | spell_poisoncloud | green skull cloud |
| 34 | spell_lightshield | golden dome bubble |
| 35 | spell_resurrect | phoenix feather glowing |
| 36 | spell_dispel | broken rune circle |
| 37 | spell_mirror | hand mirror reflecting a bolt |
| 38 | spell_berserk | red eyes with an axe |
| 39 | spell_tidalwave | tall crashing wave |
| 40 | spell_townportal | small castle inside a portal ring |

---

## Batch 3: Hero signature abilities (40)

One per hero (plus rogues and spares). The hero's portrait sits beside the icon, so the icon shows **the effect**, not the hero.

| # | name | Hero · ability | Idea for the symbol |
|---|---|---|---|
| 1 | ab_greatbear | Bear · Great Bear | lion head with a bear-claw mark |
| 2 | ab_rootkeeper | Perry · Rootkeeper | oak sapling with deep roots |
| 3 | ab_greenmender | Dorothy · Green Mender | heart-shaped leaf |
| 4 | ab_trailblazer | Oliver · Trailblazer | boot crossing a bog |
| 5 | ab_arcanist | Engelman · Arcanist | two overlapping spell stars |
| 6 | ab_stormborn | Tempest · Stormborn | storm cloud with forked lightning |
| 7 | ab_restlessdead | Parker · Restless Dead | running zombie hand |
| 8 | ab_gravecaller | Shadow · Gravecaller | lantern over a grave |
| 9 | ab_stonewarden | Grimes · Stone Warden | gem golem fist |
| 10 | ab_pounce | Boopis · Pounce | leaping rabbit |
| 11 | ab_waverider | Rocky · Wave Rider | turtle shell on a wave |
| 12 | ab_troublemaker | Monkey · Troublemaker | banana peel with a spark |
| 13 | ab_nightprowler | Binx · Night Prowler | glowing cat eyes in darkness |
| 14 | ab_powdermaster | Vargas · Powder Master | powder keg with a fuse |
| 15 | ab_weatherwise | Sheila · Weatherwise | weathervane in wind |
| 16 | ab_heartbloom | Love · Heartbloom | flower with a heart centre |
| 17 | ab_mastersmith | Ivan · Master Smith | hammer on an anvil |
| 18 | ab_hexmistress | Rago · Hex Mistress | witch hat with a purple hex sign |
| 19 | ab_steamcaller | Dupengeiser · Steamcaller | brass valve venting steam |
| 20 | ab_stormkeeper | Rimmer · Storm Keeper | lightning held in a jar |
| 21 | ab_owlmother | Sookie · Owl Mother | owl wings around an egg |
| 22 | ab_sirenvoice | Eelvis · Siren Voice | seashell with music notes |
| 23 | ab_bonecollector | William IV · Bone Collector | stack of bones in a sack |
| 24 | ab_crabwarden | Griffiths · Crab Warden | crab claw shield |
| 25 | ab_champion | Battaglia · Champion of the Vale | antlered helm |
| 26 | ab_gladeguard | Michael · Glade Guard | crossed leaf blades |
| 27 | ab_rootweaver | Livingston · Rootweaver | woven vine knot |
| 28 | ab_hammerhex | Slack · Hammer and Hex | hammer with a glowing rune |
| 29 | ab_masterarcher | Eden · Master Archer | three arrows in flight |
| 30 | ab_sirenkeeper | Letchworth · Siren Keeper | trident with a shell |
| 31 | ab_goldday | Schmickle (rogue) · daily gold | coin purse overflowing |
| 32 | ab_quickdraw | Boone (rogue) · Quickdraw | arrow leaving a bow, speed lines |
| 33 | ab_sharpeyes | Holmes (rogue) · Sharp Eyes | magnifying glass |
| 34 | ab_tinkerer | Tinker (rogue) · faster travel | cog with wings |
| 35 | ab_darkmagic | Enzo (rogue) · raises skeletons | cracked elven circlet with green fire |
| 36 | ab_mentor | Grimes (planned) · Mentor | owl on a lectern |
| 37 | ab_decoy | Ivan (planned) · Decoys | puppet on strings |
| 38 | ab_reunion | Livingston and Binx (planned) · Reunion | two paw prints and a heart |
| 39 | ab_spare1 | spare | wanderer's walking staff |
| 40 | ab_spare2 | spare | hooded traveller's cloak |

---

## Batch 4: Banner abilities and troop traits (24)

| # | name | Idea for the symbol |
|---|---|---|
| 1 | banner_rootbound | rooted foot with a shield |
| 2 | banner_spellecho | spell star with an echo ring |
| 3 | banner_graveharvest | scythe over a skull |
| 4 | banner_packbond | two paw prints side by side |
| 5 | banner_plunder | open chest spilling coins |
| 6 | banner_doublevolley | two crossed arrows |
| 7 | banner_forging | glowing ingot on an anvil |
| 8 | banner_hightide | rising wave with an up arrow |
| 9 | trait_flies | small wing |
| 10 | trait_shoots | arrow |
| 11 | trait_charge | lance tip with speed lines |
| 12 | trait_double | two short slash marks |
| 13 | trait_noretal | shield with a crossed-out sword |
| 14 | trait_retal2 | two curved return arrows |
| 15 | trait_regen | leaf in a circular arrow |
| 16 | trait_drain | red drop with a fang |
| 17 | trait_charm | pink spiral |
| 18 | trait_undead | small skull |
| 19 | trait_big | large hoof print |
| 20 | trait_siege | catapult stone |
| 21 | trait_swim | wave |
| 22 | trait_magicres | blue shield with a star |
| 23 | trait_fearless | lion head |
| 24 | trait_ranged_pen | arrow piercing a shield |

---

## Batch 5: Battle status effects (24)

Small badges shown over troops in battle.

| # | name | Idea for the symbol |
|---|---|---|
| 1 | st_stunned | spinning stars |
| 2 | st_hypnotized | spiral eyes |
| 3 | st_entangled | vine loop |
| 4 | st_frozen | ice crystal |
| 5 | st_slowed | snail |
| 6 | st_hasted | lightning boots |
| 7 | st_weakened | broken sword |
| 8 | st_blessed | golden halo |
| 9 | st_cursed | purple skull |
| 10 | st_shielded | bubble shield |
| 11 | st_stoneskin | rock texture square |
| 12 | st_poisoned | green drop |
| 13 | st_burning | small flame |
| 14 | st_morale_up | green up arrow with a star |
| 15 | st_morale_down | red down arrow with a cloud |
| 16 | st_luck | clover |
| 17 | st_bad_luck | black cat silhouette |
| 18 | st_defending | raised shield |
| 19 | st_waiting | hourglass |
| 20 | st_rooted | roots under feet |
| 21 | st_charmed | heart |
| 22 | st_frightened | sweat drop with wide eyes |
| 23 | st_inspired | trumpet |
| 24 | st_empowered | glowing fist |

---

## Optional: skill level frames (3)

> Three 72×72 transparent frames that fit around the 64×64 skill icons, with an empty centre: **Basic** (worn bronze, one gem), **Advanced** (silver, two gems), **Expert** (gold, three gems). Same pixel style; no text.

---

**Send-back tip:** one zip per batch (one atlas PNG + one JSON) keeps the published game under its file limit.
