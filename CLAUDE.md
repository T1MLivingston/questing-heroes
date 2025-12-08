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
- **CSS Styles**: Inline styles for HUD, shop, fire panel, and overlays
- **HTML Body**: HUD stats, canvas, bomb shop grid, fire control panel, menu overlay
- **JavaScript**: Game logic, physics, rendering, input handling

### Core Game Systems

#### Canvas & Rendering
- Main canvas element with 16:9 aspect ratio
- Responsive sizing based on viewport (max 960px width)
- Pink grid overlay on blue gradient background
- Drawing functions: `drawBackground()`, `drawGroundAndLava()`, `drawBlocks()`, `drawTarget()`, `drawTrajectoryPreview()`, etc.

#### Physics Engine
- Gravity constants: `0.45` (projectiles), `0.25` (falling blocks)
- Collision detection: `circleRectCollision()` function
- Trajectory preview shows predicted path before firing
- Dynamic blocks can fall into lava

#### Game State
Key state variables:
- `credits` - Player's pixel currency (starts at 100)
- `score` - Cumulative score
- `inventory` - Owned bombs by type
- `chamberQueue` - Queue of purchased bombs ready to fire
- `projectile` - Active projectile state
- `targetBlocks[]` - PFP pixels that can be destroyed
- `blocks[]` - Environmental blocks (floor, pedestals, obstacles)
- `powerValueNorm` - Current power level (0-1)
- `powerOscillating` - Whether power bar is auto-oscillating

#### Bomb System
8 bomb types defined in `bombDefsArray`:
| ID | Name | Cost | Radius | Unlock |
|----|------|------|--------|--------|
| b1 | Mini | 1px | 1.8 cells | Level 1 |
| b2 | Wide | 2px | 2.4 cells | Level 1 |
| b3 | Burst | 3px | 3.0 cells | Level 1 |
| b4 | Cluster | 4px | 3.5 cells | Level 2 |
| b5 | Heavy | 5px | 4.0 cells | Level 3 |
| b6 | Shock | 6px | 4.6 cells | Level 4 |
| b7 | Nova | 7px | 5.2 cells | Level 5 |
| b8 | Omega | 8px | 5.8 cells | Level 6 |

#### Chamber Queue System
- Purchased bombs are added to `chamberQueue`
- First bomb in queue is the next shot (shown with orange highlight)
- Click any chamber slot to swap it with the first position
- Visual display shows bomb colors sized by radius

#### Fire Control Panel
- **Power slider**: Click/hold to oscillate power, or use -/+ buttons
- **Fire button**: Shoots the first bomb in chamber queue
- **Double-click power handle**: Also fires immediately
- Power oscillates between 0-100% when held

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
| `getNextBombFromQueue()` | Pops first bomb from chamber for firing |
| `fireUsingCurrentPower()` | Fires bomb with current angle/power |
| `computeAngleFromLauncher()` | Calculates angle based on launcher Y position |
| `update()` | Main game loop - physics and state |
| `render()` | Main render loop - draws all elements |
| `loop()` | requestAnimationFrame game loop |

## Scoring System

- **Destroying PFP pixels**: +1 pixel per block (positive, yellow +N)
- **Destroying red obstacles**: -1 pixel per block (penalty, red -N)
- **PFP pixels falling into lava**: +1 pixel (counts as destroyed)
- **Red obstacles falling into lava**: -1 pixel (penalty)

## Input Handling

### Canvas Controls
- **Drag on vertical track**: Move launcher up/down to adjust angle (15°-75°)
- **Tap arrows**: Fine-tune launcher position
- **Tap while bomb flying**: Manual early detonation

### Fire Panel Controls
- **Click/hold power handle**: Power oscillates 0-100%
- **Release**: Stops oscillation at current power
- **Double-click handle**: Fire immediately
- **-/+ buttons**: Nudge power by 5%
- **Fire button**: Fire with current power

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

### Testing Checklist
- [ ] Verify game loads without console errors
- [ ] Test bomb purchasing (adds to chamber)
- [ ] Test chamber queue reordering (click to swap)
- [ ] Test power oscillation and firing
- [ ] Verify trajectory preview updates with power/angle
- [ ] Test level progression after destroying all PFP pixels
- [ ] Check touch controls on mobile
- [ ] Verify responsive canvas sizing
- [ ] Test "Out of Ammo" overlay and shop highlight

## Code Style Conventions

- **Variables**: camelCase (`projectile`, `targetBlocks`, `chamberQueue`)
- **Constants**: UPPER_SNAKE_CASE (`PFP_GRID`, `STARTING_BANK`)
- **Functions**: camelCase, descriptive names (`circleRectCollision`, `spawnFloatingText`)
- **Comments**: Section headers use `// ---------- Section ----------` pattern
- **DOM IDs**: camelCase (`fireButton`, `chamberSlots`, `firePercent`)

## Important Constants

```javascript
const PFP_GRID = 32;           // PFP resolution (32x32 pixels)
const STARTING_BANK = 100;     // Initial pixel currency
const maxPower = 24;           // Max projectile velocity
const gravity = 0.45;          // Projectile gravity
const blockGravity = 0.25;     // Falling block gravity
```

## Known Considerations

1. **Cross-Origin Images**: PFP images are loaded from an external CDN with `crossOrigin = "anonymous"`. If running locally without a server, some browsers may block this.

2. **Canvas Size**: The canvas maintains a 16:9 aspect ratio and scales responsively. Game logic uses `tileSize` for consistent spacing across resolutions.

3. **Performance**: All rendering uses direct canvas API calls. The game loop runs at 60fps via `requestAnimationFrame`.

4. **State Persistence**: No save/load functionality. Game state resets on page refresh.

5. **Indestructible Elements**: Floor and pedestal base blocks have `indestructible: true` and cannot be destroyed by explosions.

## UI Components

### HUD Stats Row
Displays: Player name, Level, Target name, Bank, Score, Destroyed %, Last gain, Angle, Power, Shots, Cleared, Chamber slots

### Bomb Shop
- Grid layout with 8 bomb buttons
- Each shows: name, level requirement, cost, owned count
- Locked bombs have dashed borders
- Selected bomb highlighted with orange border
- Shop wrapper pulses orange when out of ammo

### Fire Panel
- Power slider with oscillating fill
- Colored handle matches next bomb's color
- Percentage display
- Large "FIRE" button

## Future Enhancement Ideas

- Add local storage for high scores and progress
- Sound effects and background music
- More bomb types with special effects (e.g., homing, splitting)
- Multiplayer/leaderboard features
- Custom PFP upload support
- Undo/retry last shot feature
