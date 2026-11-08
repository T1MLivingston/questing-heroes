# Terrain & Scenery (Pack 03)

Runtime subset of "Questing Heroes - Terrain & Scenery Pack 03" (ChatGPT image generation, palette-snapped; see LEGAL.md). Native 32 x 32 grid, drawn by `renderTerrainArt` in index.html.

- `ground_atlas.png`: 4 variants (columns) x 11 rows: meadow, forest_floor, dry_grass, dirt, sand, rocky, snow, swamp, ash, cobblestone, water
- `water_anim.png`: row = phase (220 ms each), column = variant
- `edges/<terrain>.png`: corner overlays, 4 x 4 atlas, cell = code (NW 1, NE 2, SE 4, SW 8), drawn on a grid offset half a tile; `water_0..3` are the four water phases
- `roads/<material>.png`: route connections, 4 x 4 atlas, cell = code (N 1, E 2, S 4, W 8)
- `scenery/*.png`: pivot bottom centre, (width/2, height-4)
- `fire/*.png`: 4 frames of 32 x 32, 140/110/130/150 ms
