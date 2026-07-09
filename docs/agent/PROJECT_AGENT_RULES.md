# CLONE BLAST Project Agent Rules

Use these rules before editing the CLONE BLAST codebase.

## Project

CLONE BLAST is a browser-based 2D pixel-art action game built with Phaser, TypeScript, and Vite.

Target presentation:

- 1920x1080
- 16:9
- pixel-art player action animation
- keyboard-based blaster deflection gameplay

## Game Modes

### Campaign Mode

- 7 stages total
- stage 7 is the boss stage
- stage clear heals the player by +2 HP

### Infinite Mode

- endless wave/high-score mode
- localStorage high-score MVP
- top 3 visible on main menu
- optional name entry

### Animation Test Mode

Animation Test is the safe visual lab for player actions.

It should contain:

- gameplay background
- player sprite
- small test UI
- optional demo blaster/effects

It should not contain:

- real enemies
- real waves
- campaign progression
- infinite scoring
- HP/stamina/force gameplay calculations
- name entry
- high-score save

## Player Controls

Main gameplay controls:

```txt
W / ArrowUp     = upper deflect
S / ArrowDown   = lower deflect
D               = Force Reflect
Space held      = Force Power / Choke when Force is ready
```

Animation Test controls:

```txt
1           = Idle
2 / W       = Deflect Up plain animation
ArrowUp     = Deflect Up demo with blaster
3 / S       = Deflect Down plain animation
ArrowDown   = Deflect Down demo with lower blaster
4 / D       = Force Reflect
5 / Space   = Force Power
R           = Reset Idle and clear temporary effects
ESC         = Back to main menu
```

## Combat Stats

```txt
HP max: 10
Stamina max: 100
Force max: 100
Force Reflect cost: 25 Force
```

Gameplay behavior:

- correct lane deflect increases Force
- wrong deflect breaks combo
- empty deflect breaks combo
- stamina cost is paid once when an action starts
- long active frames must not repeatedly consume stamina
- already-handled blasters must not be deflected multiple times by the same long active frame

## High Score Rules

- localStorage MVP is acceptable
- main menu shows top 3
- name entry is optional
- ESC / X / Skip means do not save the score
- name must be 3-5 ASCII consonants only

Required UI strings:

```txt
Enter 3-5 letters
You can use only consonant letters.
Use 3-5 consonant letters.
```

## Main Menu Rules

Preserve:

- animated GIF/video background integration
- `clone_blast_logo.png`
- tagline: `Bring Balance to the Force`
- Campaign / Infinite buttons
- high-score table
- disclaimer

Do not break the HTML/CSS background layer used for animated GIF backgrounds.

## Asset Processing Rules

### White-to-alpha idle assets

Idle assets may use white background.

Suggested runtime removal:

```ts
r >= 245 && g >= 245 && b >= 245 -> alpha = 0
```

### Green chroma player/effect assets

Deflect action assets may use pure green background.

Suggested runtime removal:

```ts
g >= 240 && r <= 30 && b <= 30 -> alpha = 0
```

Do not remove:

- blue energy sword pixels
- blue/cyan slash arc pixels
- character pixels
- red/orange spark pixels

Preserve existing alpha if a PNG already has transparency.

## Do Not Change Unless Explicitly Asked

- Deflect Up behavior and alignment
- campaign/infinite gameplay
- main menu logo and background system
- high-score/name-entry logic
- player scale/origin/hitbox
- asset filenames
- pixel-art sprite contents

## Reporting Rule

After each agent implementation, report:

- changed files
- constants changed
- asset paths loaded
- what was tested
- whether `npm run build` passed
