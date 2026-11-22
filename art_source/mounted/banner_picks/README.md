# Questing Heroes — mounted heroes

Includes 48 heroes, each with both mounted files. Open Art_Review.html after extracting the ZIP to preview the art. Keep its assets folder beside it.

Battle: 768×64; eight96×64 cells: idle, gallopA/B/C/D, attack/cast, hit, defeated. All face east. Pivot(48,60). Gallop uses frames1–4 at120ms each.
Map: 192×384; 48×48 cells; four gallop frames in eight rows: S, SW, W, NW, N, NE, E, SE. Pivot(24,44). SW/W/NW mirror SE/E/NE. Use nearest-neighbor sampling.

Exact requested paths and IDs are in manifest.json. Binary transparency, dimensions, padding, nonempty frames and anchor bounds checked. This ZIP supplies assets; it does not change the game code. Prompts.json records the built-in image-generation prompts.

The banner-picks ZIP is an early subset of the four complete banner packs; if importing both, matching paths refer to the same artwork. The20 heroes marked already done were excluded.
