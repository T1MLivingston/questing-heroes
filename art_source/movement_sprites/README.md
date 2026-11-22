# Questing Heroes hero movement

Extract the ZIP, then open **preview.html** to play the sprites at 1×, 2×, or 3×. Pick a battle action or a map heading with the playback controls.

## Import

Use `manifest.json` to match each hero ID to its animation sets. Paths are relative to the extracted pack.

| Animation | Native frame | PNG layout | Ground pivot |
| --- | ---: | --- | --- |
| Battle on foot | 64×64, or 96×64 for large silhouettes | 6 columns in the strip | width ÷ 2, 60 |
| Mounted battle | 96×64 | 8 columns in the strip | 48, 60 |
| Mounted map | 48×48 | 4 columns × 8 rows | 24, 44 |

Battle strips face east. Flip horizontally when the unit faces west. `source_rects` selects one frame at a time, and `clips` sets the frame order, timing, looping, and defeat hold. Movement uses 2 poses on foot and 4 poses on horseback. Idle, attack, hit, and defeat are separately drawn poses.

Map sheets use **s, sw, w, nw, n, ne, e, se** from top to bottom. Each row gives 4 walk phases with 120 ms per phase. The west-facing rows mirror the corresponding east-facing art. Per-direction strips use the same frames.

Use nearest-neighbor texture filtering at integer scales. The game PNGs use the shared 64-color palette and binary transparency. Use the pivot as the ground anchor. Hero art IDs and animation modes can be merged with existing assets. Import paths and clip data are supplied for the renderer.

`generation_prompts.json` records the art briefs. `checksums.json` records SHA-256 hashes for the archive contents.
