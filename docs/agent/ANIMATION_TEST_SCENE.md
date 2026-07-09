# Animation Test Scene Agent Instructions

Animation Test is the safe lab scene for previewing player animations and visual effects.

## Purpose

Use Animation Test for:

- idle preview
- Deflect Up preview
- Deflect Up blaster demo
- Deflect Down preview
- Deflect Down blaster demo
- future Force Reflect preview
- future Force Power preview

Do not use Animation Test for:

- campaign progression
- wave logic
- real enemy spawning
- scoring
- high-score save
- name entry
- real damage/combat balancing

## Required Controls

```txt
1           = Idle
2 / W       = Deflect Up plain animation + slash arc up only
ArrowUp     = Deflect Up demo with upper blaster + arc + sparks
3 / S       = Deflect Down plain animation + slash arc down only
ArrowDown   = Deflect Down demo with lower blaster + arc + sparks
4 / D       = Force Reflect preview
5 / Space   = Force Power preview
R           = Reset Idle and clear temporary effects
ESC         = Back to main menu and clear temporary effects
```

Important:

- `W` and `ArrowUp` are not the same in Animation Test.
- `S` and `ArrowDown` are not the same in Animation Test.
- W/S are plain animation previews.
- ArrowUp/ArrowDown are demo previews with blaster and spark.

## Plain Deflect Behavior

Plain Deflect Up:

- play Deflect Up sequence
- show slash arc up on frame 05
- no blaster
- no spark
- return to idle after frame 08 if no buffer

Plain Deflect Down:

- play Deflect Down sequence
- show slash arc down on frame 05
- no blaster
- no spark
- return to idle after frame 08 if no buffer

## Demo Deflect Behavior

Deflect Up Demo:

- spawn red blaster from the right side
- blaster travels to upper sword contact point
- blaster reaches contact at frame 05
- show slash arc up on frame 05
- play spark 01 -> 02 -> 03
- redirect blaster upward-right or disappear cleanly

Deflect Down Demo:

- spawn red blaster from the right side
- blaster travels to lower sword contact point
- blaster reaches contact at frame 05
- show slash arc down on frame 05
- play spark 01 -> 02 -> 03
- redirect blaster downward-right or disappear cleanly

## Timing To Contact

The blaster should reach contact at the start of frame 05.

Deflect Up frame 05 starts after:

```txt
35 + 45 + 50 + 55 = 185ms
```

Deflect Down frame 05 starts after:

```txt
30 + 35 + 40 + 45 = 150ms
```

Therefore:

```txt
Deflect Up demo blaster travel duration: about 185ms
Deflect Down demo blaster travel duration: about 150ms
```

## Slash Arc Cleanup

Slash arcs must not remain on screen.

Required cleanup behavior:

- show on frame 05 only
- hide after about 120ms
- force hide by frame 06
- clear on R reset
- clear on ESC back
- clear on scene shutdown
- clear before starting a new demo
- prevent duplicate arc sprites

Suggested constant:

```ts
const SLASH_ARC_VISIBLE_MS = 120;
```

Suggested helpers:

```ts
showSlashArc(type: "up" | "down")
hideSlashArc()
clearTemporaryEffects()
```

## Temporary Effect Cleanup

`clearTemporaryEffects()` should remove or hide:

- active slash arc sprite
- active slash arc timer
- active spark sprite
- active spark timer
- incoming blaster
- redirected blaster
- debug marker

Register scene shutdown cleanup:

```ts
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  clearTemporaryEffects();
});
```

## UI Panel

Keep the UI panel compact and inside bounds.

Suggested text:

```txt
Animation Test
1: Idle
2 / W: Deflect Up
↑: Deflect Up Demo
3 / S: Deflect Down
↓: Deflect Down Demo
4 / D: Force Reflect
5 / Space: Force Power
R: Reset Idle
ESC: Back
```

Debug text should be compact and may include:

```txt
Action
Frame
Index
Buffered
Demo
Blaster
Spark
Active
Chain
Contact X/Y
Mode UP/DOWN
Arc Visible
Redirect
```

## Layer Order

```txt
1. gameplay background
2. player
3. slash arc up/down
4. incoming / redirected blaster
5. spark effects
6. UI
```

## Fallback Rules

If an asset is missing:

- do not crash
- log a warning
- keep player idle if required player frames are missing
- play animation without arc if arc is missing
- play demo without spark if spark textures are missing

## Build Rule

After editing Animation Test, run:

```bash
npm run build
```

Report the changed files and whether build passed.
