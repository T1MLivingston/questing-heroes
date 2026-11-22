# Questing Heroes · Eight New Heroes

Open Art_Review.html after unzipping to inspect the animations. Keep the assets folder beside it.

Includes 8 personal walking sheets plus the eight approved portrait masters, 128/256 px portrait exports and six-pose battle strips.

Walking format: one transparent 192×384 PNG per hero, 48×48 cells, four frames across by eight direction rows: S, SW, W, NW, N, NE, E, SE. Every frame uses bottom-center foot anchor (24,44). West-facing directions mirror their east-facing counterparts, as in the previous pack. Render with nearest-neighbor sampling. Hero IDs match the existing game; names appear in manifest.json. walker_paths.json provides the paths without the assets/ prefix for use in the existing walker lookup.

Battle format: six 96×64 frames in a 576×64 strip, ordered idle, move A, move B, attack/cast, hit, defeat. Foot anchor (48,60). Frame PNGs and animation timings are included. Battle figures face east; mirror horizontally for west.

These are asset files ready for your game importer; this pack does not alter the HTML game, hero statistics or faction assignments. Transparent alpha, native dimensions, pivots, nonempty frames and archive integrity were checked. Use the animated review page for visual review before importing. Detailed prompts and metadata accompany the art; artwork generated with built-in image generation and normalized to the native game grids.
