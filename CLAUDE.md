# CLAUDE.md - Pixel Crush

## Project Overview

Pixel Crush (Pixel PFP Slingshot) is a browser-based slingshot physics game built with vanilla HTML, CSS, and JavaScript. Players launch bombs at pixel art profile pictures (PFPs) to destroy them, earning or losing pixels based on what they hit.

## Technology Stack

- **Frontend**: Single HTML file with inline CSS and JavaScript
- **Rendering**: HTML5 Canvas 2D API
- **No external dependencies** - Pure vanilla implementation
- **No build tools** - Open `index.html` directly in a browser to play

## File Structure

```
pixel-crush/
├── index.html    # Complete game (HTML + CSS + JavaScript)
├── CLAUDE.md     # This file
└── .git/         # Git repository
```

## Architecture

### Single-File Design
The entire game is contained in `index.html` with three main sections:
- **CSS Styles**: Inline styles for HUD, shop, instructions panel, and overlays
- **HTML Body**: HUD stats, canvas, instructions, pill shop grid, menu overlay
- **JavaScript**: Game logic, physics, rendering, input handling

### Core Game Systems

#### Canvas & Rendering
- Main canvas element with 16:9 aspect ratio
- Responsive sizing based on viewport (max 960px width)
- Pink grid overlay on blue gradient background
- Launcher zone on right side with visual track
- Drawing functions: `drawBackground()`, `drawLava()`, `drawBlocks()`, `drawTarget()`, `drawPullback()`, etc.

#### Physics Engine
- Gravity constants defined at top of script for easy tweaking
- Collision detection: `circleRectCollision()` function
- Gravity system for falling pixels when support is removed
- Dynamic blocks can fall into lava

#### Gravity System
Pixels and blocks fall when unsupported:
```javascript
const GRAVITY_PROJECTILE = 0.45;   // Gravity for flying projectiles
const GRAVITY_BLOCK = 0.35;        // Gravity for falling blocks/pixels
const GRAVITY_FALL_DELAY = 3;      // Frames before gravity kicks in
```

The `applyGravityToTargets()` function checks each pixel for support below. When a pixel is destroyed, pixels above it become dynamic and fall. Falling pixels that land on lava count as destroyed (+1 pixel).

#### Game State
Key state variables:
- `credits` - Player's pixel currency (starts at 100)
- `score` - Cumulative score
- `inventory` - Owned bombs by type
- `chamberQueue` - Queue of purchased bombs ready to fire
- `projectiles[]` - Active projectiles (can be multiple for spread shots)
- `targetBlocks[]` - PFP pixels that can be destroyed
- `blocks[]` - Environmental blocks (floor, pedestals, obstacles)
- `isPullingBack` - Whether player is pulling back to fire
- `pullStartPos` / `pullCurrentPos` - Pull-back positions for slingshot

#### Pill/Bomb System
8 pill types defined in `bombDefsArray` with pixel count progression:

| ID | Name | Cost | Pixels | Spread | Unlock |
|----|------|------|--------|--------|--------|
| b1 | Basic | 1px | 1 | No | Level 1 |
| b2 | Scatter | 5px | 10 | Yes | Level 1 |
| b3 | Burst | 10px | 20 | Yes | Level 1 |
| b4 | Cluster | 18px | 40 | Yes | Level 2 |
| b5 | Heavy | 30px | 80 | Yes | Level 3 |
| b6 | Shock | 50px | 160 | Yes | Level 4 |
| b7 | Nova | 80px | 320 | Yes | Level 5 |
| b8 | Omega | 120px | 640 | Yes | Level 6 |

**Pill Properties:**
- `pixelCount` - Number of projectiles fired (1, 10, 20, 40, 80, 160, 320, 640)
- `isSpread` - Whether projectiles fan out in a spread pattern
- `isClickableActivation` - Reserved for future tap-to-activate mechanics

#### Default Shot
When the chamber is empty, players can still fire using the **DEFAULT_SHOT**:
```javascript
const DEFAULT_SHOT = {
  id: "default",
  name: "Default",
  cost: 0,           // Free!
  radiusCells: 1.2,
  pixelCount: 1,
  isSpread: false,
  isClickableActivation: false,
  palette: [[200, 200, 200], [150, 150, 150], [100, 100, 100]]
};
```

#### Chamber Queue System
- Purchased pills are added to `chamberQueue`
- First pill in queue is the next shot (shown with orange highlight)
- Click any chamber slot to swap it with the first position
- Visual display shows pill colors sized by pixel count
- Empty chamber shows hint: "Pull back to fire default shot"

#### Pull-Back Firing System
The game uses a slingshot-style pull-back mechanic:

1. **Touch/click** near the launcher zone to start pulling
2. **Drag away** from launcher to set power and direction
3. **Release** to fire - power based on pull distance, direction opposite of pull

Key variables:
```javascript
let isPullingBack = false;
let pullStartPos = { x: 0, y: 0 };
let pullCurrentPos = { x: 0, y: 0 };
const maxPullDistance = 150;  // Max pull distance in pixels
const maxPower = 26;          // Max projectile velocity
```

Visual feedback during pull-back:
- Orange elastic band from launcher to finger
- Power indicator circle (grows with power)
- Green dashed arrow showing fire direction
- Power percentage text

#### Spread Shots
When a pill has `isSpread: true` and `pixelCount > 1`, projectiles fire in a fan pattern:
```javascript
const spreadAngle = Math.PI / 6;  // 30 degrees total spread
```
Each projectile has slight random variations in speed and position for natural spread effect.

#### Level System
- 12 PFP images loaded from CDN (`PFP_LIST[]`)
- Each PFP is converted to a 32x32 pixel grid (`PFP_GRID`)
- Level advances automatically when all target pixels are destroyed

## Key Functions Reference

| Function | Purpose |
|----------|---------|
| `loadCurrentPfp()` | Loads PFP image for current level |
| `buildPixelTarget()` | Converts PFP to destructible pixel grid |
| `resetLevel()` | Initializes level layout and obstacles |
| `applyExplosion()` | Handles bomb detonation and scoring |
| `applyGravityToTargets()` | Marks unsupported pixels as dynamic (falling) |
| `getNextBombFromQueue()` | Returns next pill or DEFAULT_SHOT if empty |
| `fireProjectiles()` | Fires single or spread projectiles |
| `pointerDown/Move/Up()` | Unified mouse+touch input handlers |
| `manualDetonate()` | Explodes active projectiles on tap |
| `update()` | Main game loop - physics and state |
| `render()` | Main render loop - draws all elements |
| `drawPullback()` | Renders slingshot pull-back visuals |

## Scoring System

- **Destroying PFP pixels**: +1 pixel per block (positive, yellow +N)
- **Destroying red obstacles**: -1 pixel per block (penalty, red -N)
- **PFP pixels falling into lava**: +1 pixel (counts as destroyed)
- **Red obstacles falling into lava**: -1 pixel (penalty)

## Input Handling

### Pull-Back Firing (Primary)
- **Touch/click near launcher**: Start pulling back
- **Drag**: Adjust power (distance) and angle (direction)
- **Release**: Fire! Direction is opposite of pull (slingshot style)
- **Minimum pull**: ~20 pixels required to fire

### Canvas Controls
- **Tap while projectiles flying**: Manual early detonation (all active projectiles)

### Mobile-Friendly Design
- Unified pointer handlers work with both mouse and touch
- Large touch targets in shop (min 60px height)
- Shop grid switches to 2 columns on mobile (<600px)
- `touch-action: none` on canvas prevents scroll interference

## Development Workflow

### Running the Game
```bash
# Simply open in browser - no build step needed
open index.html

# Or use a local server for cross-origin image loading:
python3 -m http.server 8000
```

### Making Changes
1. Edit `index.html` directly
2. Refresh browser to see changes
3. Use browser DevTools for debugging (canvas inspection, console logs)

### Tweaking Physics
Key constants at top of script:
```javascript
const GRAVITY_PROJECTILE = 0.45;   // Increase for faster falling shots
const GRAVITY_BLOCK = 0.35;        // Increase for faster falling pixels
const GRAVITY_FALL_DELAY = 3;      // Frames before pixels start falling
const maxPullDistance = 150;       // Max pull distance for power
const maxPower = 26;               // Max projectile velocity
```

### Testing Checklist
- [ ] Verify game loads without console errors
- [ ] Test pill purchasing (adds to chamber)
- [ ] Test chamber queue reordering (click to swap)
- [ ] Test pull-back firing on desktop (mouse)
- [ ] Test pull-back firing on mobile (touch)
- [ ] Verify spread shots fire multiple projectiles
- [ ] Test default shot when chamber is empty
- [ ] Verify gravity: pixels fall when support removed
- [ ] Test tap-to-detonate while projectiles flying
- [ ] Test level progression after destroying all PFP pixels
- [ ] Check responsive canvas sizing
- [ ] Verify shop highlight when out of ammo

## Code Style Conventions

- **Variables**: camelCase (`projectile`, `targetBlocks`, `chamberQueue`)
- **Constants**: UPPER_SNAKE_CASE (`PFP_GRID`, `STARTING_BANK`, `GRAVITY_BLOCK`)
- **Functions**: camelCase, descriptive names (`circleRectCollision`, `applyGravityToTargets`)
- **Comments**: Section headers use `// =====...=====` pattern
- **DOM IDs**: camelCase (`chamberSlots`, `bombShop`, `shopWrapper`)

## Important Constants

```javascript
const PFP_GRID = 32;               // PFP resolution (32x32 pixels)
const STARTING_BANK = 100;         // Initial pixel currency
const maxPower = 26;               // Max projectile velocity
const maxPullDistance = 150;       // Max pull distance for power calc
const GRAVITY_PROJECTILE = 0.45;   // Projectile gravity
const GRAVITY_BLOCK = 0.35;        // Falling block gravity
const GRAVITY_FALL_DELAY = 3;      // Delay before falling starts
```

## Known Considerations

1. **Cross-Origin Images**: PFP images are loaded from an external CDN with `crossOrigin = "anonymous"`. If running locally without a server, some browsers may block this.

2. **Canvas Size**: The canvas maintains a 16:9 aspect ratio and scales responsively. Game logic uses `tileSize` for consistent spacing across resolutions.

3. **Performance**: All rendering uses direct canvas API calls. The game loop runs at 60fps via `requestAnimationFrame`. Spread shots with high pixel counts (160-640) may impact performance on low-end devices.

4. **State Persistence**: No save/load functionality. Game state resets on page refresh.

5. **Indestructible Elements**: Floor and pedestal base blocks have `indestructible: true` and cannot be destroyed by explosions.

6. **Gravity Cascades**: When pixels fall into lava, `applyGravityToTargets()` is called again to check for more unsupported pixels, creating cascade effects.

## UI Components

### HUD Stats Row
Displays: Player name, Level, Target name, Bank, Score, Destroyed %, Shots, Chamber slots

### Instructions Panel
Shows pull-back instructions and default shot hint.

### Pill Shop
- Grid layout with 8 pill buttons (4 columns, 2 on mobile)
- Each shows: name, level requirement, cost, owned count
- Spread pills show "Spread x[count]" tag
- Locked pills have dashed borders
- Selected pill highlighted with orange border
- Shop wrapper pulses orange when out of ammo

### Menu Overlay
- How to play instructions
- Pill type descriptions
- Touch-friendly close button

## Future Enhancement Ideas

- Add local storage for high scores and progress
- Sound effects and background music
- More pill types with special effects (e.g., homing, splitting)
- Implement `isClickableActivation` for tap-to-activate pills
- Multiplayer/leaderboard features
- Custom PFP upload support
- Trajectory preview while pulling back
- Undo/retry last shot feature
