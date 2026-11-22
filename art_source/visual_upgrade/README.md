# Questing Heroes · Visual upgrade

Download **QuestingHeroes_full.html** separately to play. It is self-contained, with the original game, music and all art embedded. The HTML is supplied separately to keep this art ZIP below 30 MB. Place it beside Art_Review.html if you want the review page's game link to open it.

Open **Art_Review.html** after unzipping to inspect the new art. Search by hero, choose a direction or battle pose, pause animations, and switch the background. Keep its assets folder beside it.

Included in this pass:
- All 25 listed missing battle heroes: six-pose personal battle strips.
- 47 new on-foot walker sheets: eight directions, four frames each. Personal on-foot coverage rises from 18 to **65 of 167**, covering the first eight recruits in every banner. 102 heroes still use a generic on-foot figure; their exact status is in Hero_Art_Coverage.csv.
- Five portrait fixes at 128 px and a nearest-neighbor 256 px export: Dusty, King Pharoph the 3rd, Kiln, Shadow and Coral.
- Icons for all 14 spells, shown in the spellbooks, library and Hero Book details.
- Dedicated Geyser, Weaken, Frost Lance, Rally and Meteor effects.
- Sorcery and all eight requested button icons.
- Activated lighthouse art, shown from the saved coast-reveal state.

Existing horseback art, hero statistics, spell balance, student names and save format are preserved. Toad remains the student's human design; Kaf/Teo and Gerry/Trey keep their separate student designs. Dusty is an exposed-face desert mage; Sus remains wrapped. Coral now has a readable humanoid coral face. King Pharoph has three eyes.

Save compatibility: existing exported saves use the same format and IDs. If a browser stores file-based local saves separately for different filenames, use the game's Load option with your exported save.

Validation passed: whole-game JavaScript syntax, all new battle/walker routes, preserved mounted route, unchanged outcomes for all 14 spells, distinct effect routes, lit/unlit lighthouse rendering, binary transparency, and 1,684 nonempty animation frames. Browser playtesting could not run here because Chromium's required socket was blocked by the execution environment. Validation.json records the checks.

Native assets use nearest-neighbor rendering. Battle cells are 96×64; map cells are 48×48 in S, SW, W, NW, N, NE, E, SE order; spell-effect cells are 64×64; spell/UI icons are 32×32. Hero pairs remain together in their frames. West-facing walker rows mirror the corresponding east-facing rows.

The assets were generated with built-in image generation and packed to native game dimensions. Prompts, paths, pivots and animation metadata are in manifest.json. PNG files are under assets/. The contact sheets provide a quick visual overview. No external image service or internet connection is needed to run the game.
