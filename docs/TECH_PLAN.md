# TECH PLAN — Clone Wars Deflect Game

---

## 1. Stack

| Layer          | Technology          | Version / Notes                         |
|----------------|---------------------|-----------------------------------------|
| Language       | TypeScript          | 5.x, strict mode                        |
| Game framework | Phaser              | 3.x (latest stable)                     |
| Build tool     | Vite                | 5.x                                     |
| Package manager| npm                 |                                         |
| Storage        | localStorage        | Browser native; no backend              |
| Deployment     | Static HTML/JS      | `dist/` folder; serve with any CDN/host |

---

## 2. Project Structure

```
deflect-wars/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── docs/
│   ├── GAME_SPEC.md
│   ├── TECH_PLAN.md
│   ├── TASKS.md
│   └── ASSET_GUIDE.md
├── public/
│   └── favicon.ico
└── src/
    ├── main.ts                  ← Phaser game bootstrap
    ├── config.ts                ← Global constants (resolution, lanes, tuning)
    ├── scenes/
    │   ├── BootScene.ts         ← Preload assets (placeholder textures)
    │   ├── MainMenuScene.ts     ← Title screen + high scores
    │   ├── GameScene.ts         ← Core gameplay loop
    │   ├── HUDScene.ts          ← Overlay HUD (HP, stamina, force, combo, score)
    │   ├── StageClearScene.ts   ← Between-stage screen
    │   ├── GameOverScene.ts     ← Death/score screen
    │   └── NameEntryScene.ts    ← High score name entry
    ├── entities/
    │   ├── Player.ts            ← Player class (stats, input, animations)
    │   ├── enemies/
    │   │   ├── BaseEnemy.ts     ← Abstract base
    │   │   ├── BattleDroid.ts
    │   │   ├── HeavyDroid.ts
    │   │   ├── ShieldDroid.ts
    │   │   └── CyborgBoss.ts
    │   └── Blaster.ts           ← Blaster bolt entity
    ├── systems/
    │   ├── CombatSystem.ts      ← Deflect logic, timing windows, hit detection
    │   ├── WaveSystem.ts        ← Wave/stage definitions and spawning
    │   ├── ScoreSystem.ts       ← Score, combo, multiplier calculations
    │   ├── ForceSystem.ts       ← Force Reflect and Force Choke logic
    │   └── DifficultySystem.ts  ← Infinite mode scaling
    ├── data/
    │   ├── stages.ts            ← Campaign stage/wave definitions (data-only)
    │   └── highscores.ts        ← localStorage read/write helpers
    └── ui/
        ├── HudDisplay.ts        ← HUD component rendering
        └── NameEntryUI.ts       ← Consonant-only name entry component
```

---

## 3. Phaser Configuration

```typescript
// src/main.ts (skeleton)
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    MainMenuScene,
    GameScene,
    HUDScene,       // launched in parallel with GameScene
    StageClearScene,
    GameOverScene,
    NameEntryScene,
  ],
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
};
```

---

## 4. Scene Responsibilities

### BootScene
- Generates all placeholder textures (colored rectangles via `graphics`).
- Stores textures in cache under stable keys (e.g., `'player'`, `'battle_droid'`, `'blaster_upper'`).
- No real assets loaded for MVP.

### MainMenuScene
- Displays title.
- Reads top-3 scores from localStorage via `highscores.ts`.
- Buttons: Campaign, Infinite, View Scores.

### GameScene
- Central game loop.
- Owns player entity, enemy group, blaster group.
- Delegates combat logic to `CombatSystem`.
- Delegates wave/spawn logic to `WaveSystem`.
- Delegates scoring to `ScoreSystem`.
- Launches `HUDScene` in parallel (separate Phaser scene overlay).
- Emits events (`combat:hit`, `combat:deflect`, `wave:clear`, `game:over`) via Phaser EventEmitter.

### HUDScene
- Listens to game events and redraws HUD elements.
- Separate scene keeps HUD rendering decoupled from game logic.

### StageClearScene
- Shows "+2 HP Healed" message.
- Shows current score.
- Continues to next stage or returns to menu.

### GameOverScene
- Shows final score.
- Calls `highscores.ts` to check placement.
- Transitions to `NameEntryScene` if top 3.

### NameEntryScene
- On-screen or keyboard-driven 5-letter consonant entry.
- Saves score + name to localStorage.
- Returns to `MainMenuScene`.

---

## 5. Entity Design

### Player (src/entities/Player.ts)
```
Properties: hp, stamina, force, isDeflecting, deflectLane
Methods: tryDeflect(lane), forceReflect(), startForceChoke(), releaseForceChoke()
Emits: 'deflect:success', 'deflect:fail', 'player:hit', 'player:death'
```

### BaseEnemy (src/entities/enemies/BaseEnemy.ts)
```
Properties: hp, fireRate, boltSpeed, lane (upper/lower)
Methods: fire(), takeDamage(n), die()
Abstract: getType(): EnemyType
```

### Blaster (src/entities/Blaster.ts)
```
Properties: lane (upper|lower), speed, isReflected, sourceEnemy
Methods: travel(), deflect(), onHitPlayer(), onHitEnemy()
```

---

## 6. Combat System Design

`CombatSystem` runs inside `GameScene.update()`:

1. For each active `Blaster`, compute distance to player.
2. Determine if bolt is within **normal** or **perfect** deflect window.
3. If player presses a deflect key:
   - Check if any bolt is in range in the pressed lane.
   - If yes: trigger deflect result (perfect/normal) and destroy/redirect bolt.
   - If no: trigger empty deflect (stamina loss, combo break).
4. If bolt reaches player x-position without deflect: trigger hit.

---

## 7. Wave System Design

`WaveSystem` manages enemy lifecycle:

- Campaign: reads wave definitions from `src/data/stages.ts`.
- Infinite: generates waves procedurally using `DifficultySystem`.
- A wave is complete when all enemies in it are dead.
- Triggers `wave:clear` event; GameScene decides if it was the last wave.

---

## 8. Data Structures

```typescript
// Blaster lane
type Lane = 'upper' | 'lower';

// Enemy type identifier
type EnemyType = 'battle_droid' | 'heavy_droid' | 'shield_droid' | 'cyborg_boss';

// Wave definition (campaign)
interface WaveDef {
  enemies: { type: EnemyType; count: number; delay: number }[];
}

// Stage definition
interface StageDef {
  stageNumber: number;
  waves: WaveDef[];
  boltSpeedMultiplier: number;
}

// High score entry
interface ScoreEntry {
  name: string;   // exactly 5 consonants
  score: number;
  mode: 'campaign' | 'infinite';
}
```

---

## 9. Input Handling

Input is managed inside `GameScene` using Phaser's `KeyboardPlugin`:

```typescript
this.keys = this.input.keyboard.addKeys({
  up: [Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.UP],
  down: [Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.DOWN],
  reflect: Phaser.Input.Keyboard.KeyCodes.D,
  choke: Phaser.Input.Keyboard.KeyCodes.SPACE,
});
```

- `up` / `down`: deflect triggers (on `JustDown` for discrete presses).
- `reflect`: also `JustDown`.
- `choke`: track hold duration with timestamp delta.

---

## 10. Rendering Approach (MVP)

All entities use colored rectangles generated in `BootScene`:

| Entity        | Placeholder Color | Size (approx.)    |
|---------------|-------------------|-------------------|
| Player        | `#00ccff` (cyan)  | 48 × 96 px        |
| battle_droid  | `#ff6600` (orange)| 36 × 72 px        |
| heavy_droid   | `#cc3300` (red)   | 54 × 80 px        |
| shield_droid  | `#3366ff` (blue)  | 48 × 64 px        |
| cyborg_boss   | `#990099` (purple)| 120 × 140 px      |
| Blaster bolt  | `#ff0000` (red)   | 20 × 8 px         |
| Shield        | `#0099ff` (blue)  | 48 × 80 px        |

---

## 11. LocalStorage Schema

```
Key: deflect_wars_highscores
Value: JSON array of up to 3 ScoreEntry objects, sorted by score descending.

Example:
[
  { "name": "BRKST", "score": 45200, "mode": "infinite" },
  { "name": "KRTLN", "score": 31000, "mode": "campaign" },
  { "name": "MRSVN", "score": 18500, "mode": "infinite" }
]
```

---

## 12. Build & Dev Commands

```bash
npm install
npm run dev      # Vite dev server with HMR
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## 13. Incremental Build Strategy

Each task in `TASKS.md` corresponds to a small, buildable increment.  
After each increment:
1. Run `npm run build` to verify no TypeScript errors.
2. Run `npm run dev` and manually test in browser.
3. Commit with a descriptive message.

> **Rule:** Never have a broken build between tasks.
