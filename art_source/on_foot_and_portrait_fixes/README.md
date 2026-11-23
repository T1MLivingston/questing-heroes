# Questing Heroes — on-foot battle and portrait fixes

11 new on-foot battle strips: Oliver, Sheila, Boone, Michael, Livingston, Zarra, Sera Venn, Vera, Zenvy, Liam and Sir Giggachins.

Four newly redrawn 256×256 portraits: Eelvis, William IV, Veyra and Zakai. These add detail while preserving their current 128px designs. Clean high-resolution portrait masters are included under masters/portraits.

Open Art_Review.html after extracting the ZIP, keeping its assets directory beside it. Preview_Battle.png and Preview_Portraits.png also provide static reviews.

## Battle format
576×64 PNG, six 96×64 cells ordered idle, move_a, move_b, attack/cast, hit, death. Death poses are non-graphic seated/slumped figures. Pivot (48,60), facing east; mirror for west. Two movement frames at 120ms each. Every pose has binary transparency and inset padding. Individual pose PNGs are also supplied.

## Import
manifest.json maps exact game IDs to paths and animation settings. Battle files use the existing visual-upgrade folder convention assets/battle/heroes/upgrade/<id>/strip.png. Portraits are assets/portraits/heroes/upgrade/<id>_256.png. Name aliases: Zarra=zahara, Eelvis=elvis, William IV=necro4. Use nearest-neighbor sampling.

This pack supplies art only. Update your game's hero battle/portrait mappings to use these paths. It does not modify game code or replace mounted art. All 15 requested assets were generated using the built-in image tool; Prompts.json contains the prompt set. Validation.json records the completed checks.
