# GAME SPEC — Clone Wars Deflect Game

> **Internal codename:** `deflect-wars`
> No copyrighted names appear in code. All entity names use generic internal identifiers.

---

## 1. Overview

A side-view, 2D pixel-art action/fighting game played in the browser.

- **Perspective:** Side-scrolling (fixed camera, static backgrounds)
- **Resolution:** 1920 × 1080, 16:9 fixed
- **Platform:** Browser (desktop only for MVP)
- **Genre:** Rhythm-action / deflect combat

The player controls a saber-wielding character standing on the left side of the screen. Enemy units stand on the right and fire blaster bolts in two lanes. The player must deflect each bolt at the correct moment using the correct input.

---

## 2. Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  [HP] [Stamina] [Force] [Combo x?] [Score]       [Stage]  │  ← HUD (top strip)
├────────────────────────────────────────────────────────────┤
│                                                            │
│   PLAYER                          ENEMIES                  │
│   (left side)   ←── upper lane ──────────────             │
│                 ←── lower lane ──────────────             │
│                                                            │
│════════════════════════════════════════════════════════════│  ← ground line
└────────────────────────────────────────────────────────────┘
```

- Player occupies approximately x = 180–220 px (left anchor).
- Enemy group occupies approximately x = 1400–1750 px (right side).
- Upper lane: y ≈ 400 px (relative to top).
- Lower lane: y ≈ 620 px.
- Ground line: y ≈ 720 px.

---

## 3. Player

### 3.1 Stats

| Stat     | Max | Notes                                                    |
|----------|-----|----------------------------------------------------------|
| HP       | 10  | Shown as pips or a bar. Healed +2 on stage clear.       |
| Stamina  | 100 | Depleted by deflect attempts. Regenerates over time.    |
| Force    | 100 | Gained from successful deflects. Used for Force skills. |

### 3.2 Stamina Details

- Each deflect attempt (success or failure) costs **stamina**.
- Stamina regenerates passively at a constant rate when no input is given.
- If stamina reaches 0, the player cannot deflect until it partially recovers.
- Empty deflect (deflect with no incoming blaster) costs stamina + breaks combo.

### 3.3 Controls

| Input             | Action                                                              |
|-------------------|---------------------------------------------------------------------|
| `W` / `ArrowUp`   | Upper deflect — deflects bolt in the **upper** lane                 |
| `S` / `ArrowDown` | Lower deflect — deflects bolt in the **lower** lane                 |
| `D`               | **Force Reflect** — costs 25 Force; reflects one bolt at enemies    |
| `Space` (hold)    | **Force Choke** — requires 100 Force; hold 2–3 s to charge/release |

### 3.4 Force Reflect (`D`)

- Costs **25 Force**.
- Reflects the **nearest incoming blaster** back toward the enemy group.
- Hits the first enemy it reaches.
- Does not work against `cyborg_boss` (boss deflects it back).

### 3.5 Force Choke (`Space` hold)

- Requires Force meter = **100** to initiate.
- Player must hold Space for **2–3 seconds** (exact window TBD during tuning).
- On successful release: all standard enemies on screen are lifted, shaken, and slammed.
  - Kills `battle_droid` and `heavy_droid` instantly.
  - Staggers `shield_droid` (removes shield temporarily).
  - Deals **1 damage** to `cyborg_boss`.
- Force meter resets to 0 after use.
- If released before charge completes: no effect, Force is **not** consumed.

---

## 4. Enemies

### 4.1 `battle_droid`

- Standard grunt enemy.
- Stands upright, holds a blaster rifle.
- Fires standard bolts in upper or lower lane.
- Low HP (dies in 1 reflected bolt or 1 Force Choke).
- Spawn rate: common.

### 4.2 `heavy_droid`

- Larger, bulkier enemy.
- No handheld weapon — fires from wrist/palm-mounted blasters.
- Fires faster or larger bolts.
- Higher HP than `battle_droid`.
- Can fire two quick bolts in succession (burst fire).
- Spawn rate: uncommon.

### 4.3 `shield_droid`

- **Entry behavior:** rolls from right edge of screen to its position.
- **Deployed behavior:** unfolds into spider-like walking stance.
- Can raise a **blue energy shield** in front of itself.
- Shield blocks reflected blasters (bolt is absorbed, not redirected).
- Shield is **not** permanent — activates/deactivates periodically.
- Force Choke staggers it and disables shield for a short time.
- Spawn rate: rare.

### 4.4 `cyborg_boss` (Stage 7 only)

- Large boss character.
- Exactly **4 arms**, each holding a **saber**.
- **Deflects all blaster bolts** (cannot be hurt by blasters or Force Reflect).
- Only damaged by **Force Choke** (1 damage per successful choke).
- Total boss HP: TBD (suggested: 5–7 Force Chokes).
- **Dash/Charge Attack:**
  - Boss runs/dashes straight toward the player.
  - Slashes with sabers on contact.
  - Then jumps or steps back to original position.
  - **No blasters are fired during charge attack.**
  - Player cannot deflect a saber slash — must wait it out (takes HP damage if hit).
- Spawn: Stage 7 only, appears mid-stage as a single wave.

---

## 5. Combat Rules

### 5.1 Lanes

| Lane   | Input Required       |
|--------|----------------------|
| Upper  | `W` or `ArrowUp`     |
| Lower  | `S` or `ArrowDown`   |

### 5.2 Deflect Outcomes

| Situation                                  | Result                                              |
|--------------------------------------------|-----------------------------------------------------|
| Correct lane input, correct timing         | **Perfect deflect** — bolt destroyed, force gained, score++ |
| Correct lane input, slightly off timing    | **Normal deflect** — bolt destroyed, reduced force gain    |
| Wrong lane input                           | **Miss** — stamina loss, combo break, bolt still travels   |
| Input with no bolt in range                | **Empty deflect** — stamina loss, combo break              |
| Bolt reaches player without deflect        | **Hit** — player loses 1 HP, combo breaks                  |

### 5.3 Timing Window

- Each bolt has an **active deflect window** defined by its x-position relative to the player.
- Exact window size (pixels or milliseconds) is a tuning parameter.
- Suggested: perfect window ≈ 50ms before impact; normal window ≈ 150ms before impact.

---

## 6. Score & Combo System

### 6.1 Scoring

| Event                  | Points (base) |
|------------------------|---------------|
| Normal deflect         | 100           |
| Perfect deflect        | 250           |
| Force Reflect kill     | 500           |
| Force Choke kill       | 750           |
| Stage clear bonus      | 1000          |

### 6.2 Combo Multiplier

| Combo count | Multiplier |
|-------------|------------|
| 1–4         | × 1        |
| 5–9         | × 1.5      |
| 10–19       | × 2        |
| 20–29       | × 3        |
| 30+         | × 5        |

### 6.3 Combo Breaks

Combo resets to 0 on:
- Any HP hit.
- Wrong lane deflect.
- Empty deflect.
- Missed blaster reaching player.

---

## 7. Game Modes

### 7.1 Campaign Mode

- **7 stages** total.
- Each stage consists of one or more **waves** of enemies.
- Waves are predefined per stage (enemy type, count, fire pattern).
- Stage 7 = Boss Stage (`cyborg_boss` fight).
- On stage clear: player heals **+2 HP** (capped at max 10).
- Failing a stage (HP reaches 0): game over → score screen.

#### Stage Progression (draft)

| Stage | Enemy Types                        | Waves | Notes                        |
|-------|------------------------------------|-------|------------------------------|
| 1     | `battle_droid` only               | 2     | Tutorial difficulty          |
| 2     | `battle_droid`                    | 3     | Slightly faster bolts        |
| 3     | `battle_droid`, `heavy_droid`     | 3     | First heavy intro            |
| 4     | `battle_droid`, `heavy_droid`     | 4     | Burst fire introduced        |
| 5     | All three standard types          | 4     | `shield_droid` introduced    |
| 6     | All three standard types          | 5     | Mixed high-difficulty        |
| 7     | `cyborg_boss` + minimal grunts    | 1     | Boss fight; no healing until clear |

### 7.2 Infinite Mode

- Endless waves; no stage limit.
- Difficulty scales with time/score:
  - Fire rate increases.
  - More enemies per wave.
  - Heavier enemy types appear sooner.
- High score focused — score tracked in real time.
- On death: go to score screen / name entry if top 3.

---

## 8. High Score System

- Top **3** scores stored in **localStorage** (key: `deflect_wars_highscores`).
- Each score entry: `{ name: string, score: number, mode: string }`.
- At game over, check if score beats any of the top 3.
- If yes → **Name Entry Screen**.

### 8.1 Name Entry Rules

- Name must be exactly **5 characters**.
- Only **ASCII consonants** allowed: `B C D F G H J K L M N P R S T V Y Z`
- Valid example: `BRKST`, `KRTLN`, `MRSVN`
- Invalid: contains A, E, I, O, U, numbers, symbols, or spaces.
- Entry uses an on-screen keyboard or direct keyboard input with live validation.

---

## 9. UI / Screens

### 9.1 Screen Flow

```
Main Menu
  ├── Campaign Mode  → Stage Select (or auto-start Stage 1) → Game Scene
  ├── Infinite Mode  → Game Scene (infinite)
  └── High Scores    → View top 3 (all modes)

Game Scene
  └── [death] → Score Screen
        └── [top 3?] → Name Entry → High Score Updated → Main Menu

Game Scene
  └── [stage clear] → Stage Clear Screen (+2 HP) → Next Stage or Main Menu
```

### 9.2 HUD Elements

- HP bar or pip row (max 10)
- Stamina bar (0–100)
- Force meter (0–100) with glow effect at 100
- Combo counter (hidden when combo = 0)
- Live score counter
- Stage / wave indicator

### 9.3 Main Menu

- Game title
- Top 3 high scores displayed
- Campaign / Infinite / High Scores buttons

---

## 10. Audio (Post-MVP)

- Blaster fire sound
- Deflect success sound (perfect vs normal)
- Deflect fail sound
- Force Choke activation sound
- Boss dash warning sound
- Background music per stage

> Audio is **out of scope for MVP**. Placeholder silence is acceptable.

---

## 11. Out of Scope for MVP

- Multiplayer
- Mobile / touch controls
- Real sprite assets (use colored rectangles)
- Backend / server-side scores
- Sound effects
- Cutscenes or story dialogue
- Unlockables or progression saves beyond high score
