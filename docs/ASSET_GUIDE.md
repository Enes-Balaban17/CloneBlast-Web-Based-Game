# ASSET GUIDE — Clone Wars Deflect Game

> This document defines every visual asset the game needs.
> **MVP uses colored rectangles** — no real art is required to build or test the game.
> This guide is for artists or for the future phase when placeholder art is replaced.

---

## 1. Art Style

- **Style:** 2D pixel art
- **Color palette:** Dark background tones with vibrant energy colors (cyan, orange, red, purple)
- **Perspective:** Side-view (2.5D feel; all characters face left or right)
- **Outline style:** 1–2 px dark outline on all characters
- **Animation:** Hand-keyed pixel animation; no skeletal rigs
- **Resolution target:** Sprites designed at 1× pixel scale, scaled up in Phaser as needed

---

## 2. File Naming Convention

```
assets/
├── sprites/
│   ├── player/
│   │   ├── player_idle.png
│   │   ├── player_deflect_upper.png
│   │   ├── player_deflect_lower.png
│   │   ├── player_force_reflect.png
│   │   ├── player_force_choke.png
│   │   └── player_hit.png
│   ├── enemies/
│   │   ├── battle_droid_idle.png
│   │   ├── battle_droid_fire.png
│   │   ├── battle_droid_death.png
│   │   ├── heavy_droid_idle.png
│   │   ├── heavy_droid_fire.png
│   │   ├── heavy_droid_death.png
│   │   ├── shield_droid_roll.png
│   │   ├── shield_droid_deploy.png
│   │   ├── shield_droid_idle.png
│   │   ├── shield_droid_shield_on.png
│   │   ├── shield_droid_shield_off.png
│   │   ├── shield_droid_stagger.png
│   │   ├── cyborg_boss_idle.png
│   │   ├── cyborg_boss_deflect.png
│   │   ├── cyborg_boss_dash.png
│   │   ├── cyborg_boss_hit.png
│   │   └── cyborg_boss_death.png
│   ├── projectiles/
│   │   ├── blaster_bolt.png          ← standard red bolt (upper/lower)
│   │   ├── blaster_bolt_heavy.png    ← larger bolt from heavy_droid
│   │   └── blaster_bolt_reflected.png ← bolt color shift when reflected
│   └── effects/
│       ├── deflect_spark.png         ← deflect impact flash
│       ├── force_choke_aura.png      ← aura around enemy during Force Choke
│       └── shield_block.png          ← shield absorb visual
├── backgrounds/
│   ├── bg_stage_1.png               ← dark industrial corridor
│   ├── bg_stage_7_boss.png          ← dramatic boss arena
│   └── bg_infinite.png              ← generic infinite mode backdrop
└── ui/
    ├── hud_hp_pip.png               ← single HP pip (filled)
    ├── hud_hp_pip_empty.png         ← single HP pip (empty)
    ├── hud_bar_bg.png               ← bar background
    ├── hud_bar_stamina.png          ← stamina fill color
    ├── hud_bar_force.png            ← force fill color (glows at 100)
    ├── font_pixel.png               ← bitmap pixel font (optional)
    └── logo_title.png               ← game title graphic
```

---

## 3. Placeholder Specifications (MVP)

All placeholders are **solid-color rectangles** generated in code (no files needed).

| Entity              | Key Name            | Color     | Width | Height |
|---------------------|---------------------|-----------|-------|--------|
| Player              | `player`            | `#00ccff` | 48    | 96     |
| Battle Droid        | `battle_droid`      | `#ff6600` | 36    | 72     |
| Heavy Droid         | `heavy_droid`       | `#cc3300` | 54    | 80     |
| Shield Droid        | `shield_droid`      | `#3366ff` | 48    | 64     |
| Shield Droid Shield | `shield_droid_shield` | `#66aaff` | 12  | 80     |
| Cyborg Boss         | `cyborg_boss`       | `#990099` | 120   | 140    |
| Blaster Bolt        | `blaster_bolt`      | `#ff0000` | 20    | 8      |
| Reflected Bolt      | `blaster_bolt_reflected` | `#00ff99` | 20 | 8    |

---

## 4. Character Sprite Sheets — Final Art Specs

### 4.1 Player

| Animation         | Frames | Frame Size | Notes                                   |
|-------------------|--------|------------|-----------------------------------------|
| Idle              | 4      | 48 × 96    | Slight breathing bob                    |
| Deflect Upper     | 3      | 48 × 96    | Saber raised, impact flash              |
| Deflect Lower     | 3      | 48 × 96    | Saber lowered, impact flash             |
| Force Reflect     | 4      | 48 × 96    | One-hand push gesture                   |
| Force Choke Charge| 6      | 48 × 96    | Both hands raise, energy crackles       |
| Force Choke Release | 3   | 48 × 96    | Hands clench/slam down                  |
| Hit               | 2      | 48 × 96    | Recoil back                             |
| Death             | 5      | 48 × 96    | Slump/fall                              |

> Player faces **right** in sprite sheet. Phaser will not flip.

---

### 4.2 Battle Droid

| Animation  | Frames | Frame Size | Notes                              |
|------------|--------|------------|------------------------------------|
| Idle       | 2      | 36 × 72    | Slight sway                        |
| Fire       | 3      | 36 × 72    | Recoil on fire frame               |
| Death      | 4      | 36 × 72    | Collapses                          |

> Faces **left** in sprite sheet (toward player).

---

### 4.3 Heavy Droid

| Animation  | Frames | Frame Size | Notes                               |
|------------|--------|------------|-------------------------------------|
| Idle       | 2      | 54 × 80    | Heavy breathing idle                |
| Fire       | 4      | 54 × 80    | Wrist blaster extends, fires twice  |
| Death      | 5      | 54 × 80    | Staggers, falls                     |

> Faces **left**. No handheld weapon — fire origin is wrist/palm.

---

### 4.4 Shield Droid

| Animation    | Frames | Frame Size | Notes                               |
|--------------|--------|------------|-------------------------------------|
| Roll         | 6      | 48 × 32    | Ball form rolling left              |
| Deploy       | 8      | 48 × 64    | Unfolds into spider stance          |
| Idle         | 2      | 48 × 64    | Standing, legs animated             |
| Shield On    | 3      | 48 × 64    | Blue shield plate rises in front    |
| Shield Off   | 2      | 48 × 64    | Shield retracts                     |
| Stagger      | 3      | 48 × 64    | Legs buckle from Force Choke        |

> Roll frame: short and wide (ball form).
> Deploy: transitions from short/wide to tall/narrow.

---

### 4.5 Cyborg Boss

| Animation   | Frames | Frame Size | Notes                                        |
|-------------|--------|------------|----------------------------------------------|
| Idle        | 4      | 120 × 140  | All 4 arms out, sabers glowing               |
| Deflect     | 3      | 120 × 140  | One arm sweeps to intercept bolt             |
| Dash Start  | 2      | 120 × 140  | Lunge pose                                   |
| Dash Run    | 4      | 120 × 140  | Sprinting toward player, sabers extended     |
| Slash       | 3      | 120 × 140  | All 4 sabers sweep at player position        |
| Dash Return | 3      | 120 × 140  | Jump/step back to start                      |
| Hit         | 2      | 120 × 140  | Staggers (Force Choke damage only)           |
| Death       | 8      | 120 × 140  | Dramatic collapse                            |

> Must show exactly **4 arms**, each visually holding a saber.
> Boss faces **left** (toward player).

---

## 5. Projectile Art

| Asset                  | Size    | Notes                                         |
|------------------------|---------|-----------------------------------------------|
| Blaster Bolt           | 20 × 8  | Red/orange plasma bolt, slight glow           |
| Heavy Blaster Bolt     | 28 × 10 | Larger, brighter, more saturated              |
| Reflected Bolt         | 20 × 8  | Green/cyan color, reversed glow               |

---

## 6. Effects Art

| Asset               | Frames | Size    | Notes                                          |
|---------------------|--------|---------|------------------------------------------------|
| Deflect Spark       | 5      | 32 × 32 | Bright spark burst at deflect point            |
| Perfect Deflect Flash | 3    | 64 × 32 | Extra large flash for perfect timing           |
| Force Choke Aura    | 6      | 64 × 64 | Purple crackling aura around each enemy        |
| Shield Block Burst  | 4      | 32 × 32 | Blue burst when bolt hits shield               |

---

## 7. Background Art

| Asset              | Size        | Notes                                           |
|--------------------|-------------|-------------------------------------------------|
| `bg_stage_1`       | 1920 × 1080 | Dark industrial interior, pipes, dim lighting   |
| `bg_stage_2`       | 1920 × 1080 | Similar but slightly more rubble/damage         |
| `bg_stage_7_boss`  | 1920 × 1080 | Dramatic arena, red/purple ambient lighting     |
| `bg_infinite`      | 1920 × 1080 | Neutral dark corridor for infinite mode         |

> Backgrounds can share assets with color tinting for MVP.
> A single `bg_default.png` with hue shifts per stage is acceptable.

---

## 8. UI Art

| Asset               | Size        | Notes                                        |
|---------------------|-------------|----------------------------------------------|
| HP Pip (filled)     | 24 × 24     | Bright cyan circle                           |
| HP Pip (empty)      | 24 × 24     | Dark grey circle                             |
| Bar Background      | Variable    | Dark translucent rectangle                   |
| Stamina Fill        | Variable    | Yellow-green gradient                        |
| Force Fill          | Variable    | Blue-purple gradient; glows white at 100     |
| Game Title Logo     | 640 × 160   | Stylized title text, pixel art               |
| Name Entry Cursor   | 12 × 20     | Blinking white vertical bar                  |

---

## 9. Font

- **In-game HUD:** Use Phaser's built-in bitmap text or a Google Font loaded via CSS (`Press Start 2P` recommended for pixel art feel).
- **Name entry:** Monospaced pixel font; each character slot 40 × 60 px.
- **Score/combo popups:** Large, bold, slightly transparent.

---

## 10. Audio Assets (Post-MVP Reference)

| Sound               | Format | Notes                              |
|---------------------|--------|------------------------------------|
| blaster_fire        | .ogg   | Short sci-fi zap                   |
| deflect_normal      | .ogg   | Short saber clang                  |
| deflect_perfect     | .ogg   | Louder, more resonant saber clang  |
| deflect_miss        | .ogg   | Dull thud / error sound            |
| force_reflect       | .ogg   | Whoosh + impact                    |
| force_choke_charge  | .ogg   | Building rumble/crackle            |
| force_choke_release | .ogg   | Explosive slam                     |
| player_hit          | .ogg   | Pain grunt                         |
| boss_dash_warning   | .ogg   | Heavy footsteps or roar            |
| stage_clear         | .ogg   | Victory fanfare (short)            |
| game_over           | .ogg   | Sad/dramatic sting                 |
| music_stage         | .ogg   | Looping ambient battle music       |
| music_boss          | .ogg   | Intense boss fight music           |

> Audio is entirely post-MVP. Silence is acceptable for initial build.

---

## 11. Asset Integration Checklist (for when real art is ready)

- [ ] Replace texture keys in `BootScene.ts` with `this.load.spritesheet(...)` calls
- [ ] Add atlas JSON files for each sprite sheet
- [ ] Define frame sequences in entity classes (e.g., `this.anims.create(...)`)
- [ ] Replace static background color with `this.add.image(0, 0, 'bg_stage_1')`
- [ ] Replace HUD rectangle bars with 9-slice or sliced images
- [ ] Replace title text with logo image
- [ ] Add `AudioManager` class to handle music/sfx playback
