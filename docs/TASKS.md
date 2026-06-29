# TASKS — Clone Wars Deflect Game

> Tasks are ordered and incremental. Complete each task fully before starting the next.
> After each task: build the project, test manually, then move on.

---

## Phase 0 — Planning (complete before coding)

- [x] **T-00** Create `docs/GAME_SPEC.md`
- [x] **T-01** Create `docs/TECH_PLAN.md`
- [x] **T-02** Create `docs/TASKS.md`
- [x] **T-03** Create `docs/ASSET_GUIDE.md`

---

## Phase 1 — Project Scaffold

- [ ] **T-10** Initialize Vite + TypeScript + Phaser project
  - Run `npm create vite@latest . -- --template vanilla-ts`
  - Install Phaser: `npm install phaser`
  - Set up `vite.config.ts` with `@` alias
  - Set up `tsconfig.json` with `strict: true`
  - Verify: `npm run dev` opens a blank browser tab without errors

- [ ] **T-11** Create `src/config.ts` with global constants
  - Game width/height (1920 × 1080)
  - Lane Y positions (upper, lower)
  - Player anchor X
  - Enemy start X
  - Timing window values (perfect, normal)
  - Stamina/Force costs
  - Verify: file compiles cleanly

- [ ] **T-12** Create minimal `src/main.ts` Phaser game bootstrap
  - Use `Phaser.Scale.FIT` with `CENTER_BOTH`
  - Register only `BootScene` for now
  - Verify: black canvas renders at correct aspect ratio in browser

---

## Phase 2 — Boot & Placeholder Textures

- [ ] **T-20** Create `src/scenes/BootScene.ts`
  - Generate colored rectangle textures for all entities (see TECH_PLAN §10)
  - Store in Phaser texture cache under stable string keys
  - After creation, transition to `MainMenuScene`
  - Verify: no errors in console; textures accessible by key

---

## Phase 3 — Main Menu

- [ ] **T-30** Create `src/data/highscores.ts`
  - `getHighScores(): ScoreEntry[]`
  - `saveHighScore(entry: ScoreEntry): void`
  - `isTopThree(score: number): boolean`
  - Uses localStorage key `deflect_wars_highscores`
  - Verify: unit-test in browser console: save a score, read it back

- [ ] **T-31** Create `src/scenes/MainMenuScene.ts`
  - Display game title text
  - Display top-3 high scores (placeholder names/scores)
  - Buttons: Campaign, Infinite Mode (non-functional for now)
  - Verify: main menu renders; scores show "---" when empty

---

## Phase 4 — Game Scene Shell

- [ ] **T-40** Create `src/scenes/GameScene.ts` (empty shell)
  - Create scene, add placeholder background color
  - Draw ground line
  - Launch `HUDScene` in parallel
  - Verify: game scene renders; HUD scene launches without crash

- [ ] **T-41** Create `src/scenes/HUDScene.ts` (static layout)
  - Draw static HUD bars for HP, Stamina, Force (filled rectangles)
  - Display placeholder score and combo text
  - Verify: HUD overlays game scene correctly

- [ ] **T-42** Create `src/entities/Player.ts`
  - Renders player placeholder sprite (cyan rectangle)
  - Holds stats: hp, stamina, force (use values from config.ts)
  - No input handling yet
  - Verify: player rectangle appears on left side of game scene

---

## Phase 5 — Input & Deflect Stubs

- [ ] **T-50** Add keyboard input to `GameScene.ts`
  - Bind W/ArrowUp, S/ArrowDown, D, Space
  - Log key presses to console
  - Verify: correct key names appear in console on press

- [ ] **T-51** Add deflect logic stub to `Player.ts`
  - `tryDeflect(lane: Lane): 'success' | 'empty' | 'fail'`
  - Stub always returns 'empty' for now
  - Update stamina on call
  - Verify: stamina bar decreases on W/S press

- [ ] **T-52** Wire HUD to Player stats
  - HUD bars update live from Player's stats each frame
  - Verify: pressing W/S visually shrinks stamina bar

---

## Phase 6 — Blaster System

- [ ] **T-60** Create `src/entities/Blaster.ts`
  - Properties: lane, speed, x, y, isReflected
  - Moves left each frame at constant speed
  - Uses placeholder red rectangle texture
  - Verify: manually spawned blaster travels left across screen

- [ ] **T-61** Create `src/systems/CombatSystem.ts` (hit detection only)
  - Check each blaster's X position against player anchor X
  - If bolt reaches player: emit `combat:hit` event, destroy bolt
  - Verify: blaster hits player, event fires, HP decreases

- [ ] **T-62** Implement deflect window in `CombatSystem.ts`
  - Define perfect and normal timing windows (X distance thresholds)
  - On deflect input: check if any bolt is in range in correct lane
  - Return: `'perfect'`, `'normal'`, `'empty'`
  - Verify: deflecting at the right moment logs correct result

- [ ] **T-63** Wire deflect results to player stats and HUD
  - Success: increase Force, give score, advance combo
  - Fail: decrease stamina, break combo
  - Verify: all stats update correctly on deflect

---

## Phase 7 — Score & Combo System

- [ ] **T-70** Create `src/systems/ScoreSystem.ts`
  - Track: score, combo, multiplier
  - Methods: `addDeflectScore(type: 'perfect'|'normal')`, `breakCombo()`, `addBonus(n)`
  - Compute multiplier from combo count (see GAME_SPEC §6.2)
  - Verify: score increments correctly; combo multiplier applies

- [ ] **T-71** Update HUD to show live score and combo
  - Combo counter hidden when combo = 0
  - Show combo number and current multiplier
  - Verify: combo counter appears and grows on successive deflects; resets on miss

---

## Phase 8 — Enemy Spawning

- [ ] **T-80** Create `src/entities/enemies/BaseEnemy.ts`
  - Abstract class with hp, fireRate, boltSpeed, lane selection logic
  - `fire()` method spawns a Blaster in the game scene
  - `takeDamage(n)` and `die()` methods

- [ ] **T-81** Create `src/entities/enemies/BattleDroid.ts`
  - Extends BaseEnemy
  - 1 HP, standard fire rate, standard bolt speed
  - Orange placeholder rectangle
  - Verify: battle_droid spawns, fires bolts at regular intervals

- [ ] **T-82** Create `src/systems/WaveSystem.ts`
  - Reads wave definitions from `src/data/stages.ts`
  - Spawns enemies per definition with delay
  - Emits `wave:clear` when all enemies are dead
  - Verify: Stage 1 Wave 1 spawns correct number of battle_droids

- [ ] **T-83** Create `src/data/stages.ts` with Stage 1 data
  - Define 2 waves for Stage 1 with battle_droids only
  - Verify: WaveSystem reads and spawns Stage 1 correctly

---

## Phase 9 — Force Abilities

- [ ] **T-90** Create `src/systems/ForceSystem.ts`
  - `forceReflect(blasters, player)`: costs 25 Force, reflects nearest bolt
  - `startForceChoke(player)`: checks Force = 100, begins charge timer
  - `releaseForceChoke(chargeTime, enemies, player)`: checks hold duration, triggers effect
  - Verify: D key reflects a bolt; reflected bolt travels right and destroys an enemy

- [ ] **T-91** Add Force Choke enemy kill behavior
  - `battle_droid` and `heavy_droid`: die instantly
  - `shield_droid`: shield drops for 3 seconds
  - Verify: holding Space with full Force then releasing kills enemies

---

## Phase 10 — More Enemy Types

- [ ] **T-100** Create `src/entities/enemies/HeavyDroid.ts`
  - Extends BaseEnemy
  - 2 HP, faster bolts, burst-fire (2 bolts in quick succession)
  - Larger red placeholder rectangle
  - Verify: heavy_droid fires burst; takes 2 reflected bolts to die

- [ ] **T-101** Create `src/entities/enemies/ShieldDroid.ts`
  - Entry: spawn off-screen right, move to position (rolling animation placeholder)
  - Deploy: stop and "unfold" (swap to deployed placeholder)
  - Shield: activates periodically; blocks reflected bolts
  - Force Choke: drops shield temporarily
  - Verify: shield_droid enters, deploys, raises shield, shield blocks reflected bolt

- [ ] **T-102** Add stages 2–6 data to `src/data/stages.ts`
  - Introduce heavy_droid in Stage 3, shield_droid in Stage 5
  - Verify: each stage definition loads correctly in WaveSystem

---

## Phase 11 — Boss Fight

- [ ] **T-110** Create `src/entities/enemies/CyborgBoss.ts`
  - Extends BaseEnemy, hp = 6
  - Deflects all incoming reflected bolts (bolts bounce back at player)
  - Only takes damage from Force Choke
  - Placeholder: large purple rectangle
  - Verify: reflected bolt hits boss and bounces back; boss HP unchanged

- [ ] **T-111** Implement Boss Dash Attack in `CyborgBoss.ts`
  - Tween: boss slides to player X, pause, slide back
  - Player takes 1 HP on contact if in range
  - No bolts fire during dash
  - Verify: boss dashes, damages player, returns to start position

- [ ] **T-112** Add Stage 7 data to `src/data/stages.ts`
  - Single wave containing cyborg_boss
  - Verify: Stage 7 spawns boss correctly; boss fight plays through

---

## Phase 12 — Game Flow & Scene Transitions

- [ ] **T-120** Create `src/scenes/StageClearScene.ts`
  - Show "Stage Clear!" and "+2 HP" message
  - Apply +2 HP to player (capped at 10)
  - Continue button to next stage
  - Verify: stage clear triggers after wave:clear, HP heals correctly

- [ ] **T-121** Create `src/scenes/GameOverScene.ts`
  - Show "GAME OVER" and final score
  - If top-3 score: transition to NameEntryScene
  - Else: show Play Again / Main Menu buttons
  - Verify: game over triggers on HP = 0; score displays correctly

- [ ] **T-122** Create `src/scenes/NameEntryScene.ts`
  - 5-letter consonant-only input (keyboard or on-screen)
  - Live validation: reject vowels, numbers, symbols
  - On confirm: save score to localStorage, return to MainMenuScene
  - Verify: valid name saves correctly; invalid input rejected

- [ ] **T-123** Wire Campaign Mode button in MainMenuScene
  - Starts from Stage 1 with fresh player stats
  - Verify: Campaign button starts game from Stage 1

- [ ] **T-124** Wire Infinite Mode button in MainMenuScene
  - Starts infinite mode with fresh stats
  - Verify: Infinite mode starts; difficulty increases over time

---

## Phase 13 — Infinite Mode Difficulty Scaling

- [ ] **T-130** Create `src/systems/DifficultySystem.ts`
  - Tracks elapsed time and wave count
  - Returns a `DifficultyParams` object (boltSpeed, fireRate, enemyTypes, enemyCount)
  - Scales linearly then logarithmically
  - Verify: bolt speed increases noticeably after 60 seconds

---

## Phase 14 — Polish & QA

- [ ] **T-140** Add HUD polish
  - Force bar glows / pulses at 100
  - Combo text flashes on break
  - HP pips visually drain rather than disappear instantly
  - Verify: visual feedback feels responsive

- [ ] **T-141** Add visual feedback for deflect timing
  - "PERFECT!" popup text on perfect deflect
  - "DEFLECT" popup on normal deflect
  - "MISS!" popup on empty/wrong deflect
  - Verify: popup appears at correct screen position, fades out

- [ ] **T-142** Add screenshake on player hit
  - Phaser camera shake effect
  - Verify: camera shakes briefly on HP loss

- [ ] **T-143** End-to-end play test, Campaign Mode
  - Complete all 7 stages without coding changes
  - Log any bugs as follow-up tasks

- [ ] **T-144** End-to-end play test, Infinite Mode
  - Play for 3+ minutes; verify difficulty ramp
  - Check high score save/load cycle (name entry → main menu → leaderboard)

---

## Phase 15 — Build & Deploy

- [ ] **T-150** Production build verification
  - Run `npm run build`; zero TypeScript errors, zero Vite errors
  - Test `dist/` folder in browser with `npm run preview`
  - Verify game runs correctly in production bundle

- [ ] **T-151** (Optional) Deploy to static host (GitHub Pages, Netlify, etc.)

---

## Backlog (Post-MVP)

- Audio: sound effects and background music
- Real pixel-art sprites replacing placeholder rectangles
- Animated sprite sheets for all entities
- Mobile / touch input support
- Stage select screen with locks
- Additional game modes (time attack, survival)
- Accessibility options (colorblind mode, key remapping)
