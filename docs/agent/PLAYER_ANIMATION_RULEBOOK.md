# Player Animation Rulebook

This file defines the animation rules for CLONE BLAST player action animations.

## Main Principle

Action animations must never snap, teleport, or restart every update tick.

Every player action should follow this structure:

```txt
startup -> active/contact -> recovery -> chain-exit -> return-to-idle
```

## Standard 8-Frame Action Pattern

Use this structure for Deflect Up, Deflect Down, Force Reflect, and future action animations when possible.

```txt
Frame 01: near-idle / start
Frame 02: preparation
Frame 03: transition
Frame 04: approach
Frame 05: active/contact frame
Frame 06: recovery
Frame 07: chain-exit frame
Frame 08: closest return-to-idle frame
```

## Active Frame

Frame 05 is the active/contact frame.

This is where:

- slash arc appears
- blaster contact is resolved in demo mode
- spark sequence begins in demo mode
- gameplay deflect window should be active

A long active frame must not cause repeated costs or repeated blaster handling.

## Chain-Exit Frame

Frame 07 is the chain-exit frame.

If another action is buffered:

- consume the buffered action at frame 07
- start the next action smoothly
- skip frame 08

If no action is buffered:

- play frame 08
- return to idle

## Input Buffer Rules

When an action is already playing:

- do not interrupt instantly
- store the latest valid requested action as `bufferedAction`
- newest valid action may replace the previous buffered action
- consume the buffer at the current action's chain-exit frame

Example:

```txt
Deflect Up playing + S pressed
-> continue Deflect Up until frame 07
-> start Deflect Down
```

```txt
Deflect Down playing + W pressed
-> continue Deflect Down until frame 07
-> start Deflect Up
```

## Idle Rules

Idle should use manual frame switching, not normal framerate animation.

Idle order:

```txt
1 -> 2 -> 3 -> 4 -> 3 -> 2 -> 1
```

Idle timing:

```ts
const IDLE_SEQUENCE = [
  { key: "player_idle_01", duration: 3000 },
  { key: "player_idle_02", duration: 3000 },
  { key: "player_idle_03", duration: 2000 },
  { key: "player_idle_04", duration: 3000 },
  { key: "player_idle_03", duration: 2000 },
  { key: "player_idle_02", duration: 3000 },
  { key: "player_idle_01", duration: 3000 },
];
```

Idle must not restart every frame.

Only play idle while the player is actually idle.

## Effect Timing Rules

Slash arc:

- appears on frame 05
- visible for about 100-140ms
- suggested constant: `SLASH_ARC_VISIBLE_MS = 120`
- must hide before or during frame 06
- must clear on reset, ESC, scene shutdown, and new demo start

Spark:

- appears only in blaster demo modes
- starts at frame 05
- plays spark 01 -> 02 -> 03
- all spark frames must use the same stored contact point
- use visible-bounds anchoring

Blaster:

- demo-only visual in Animation Test
- reaches contact point at frame 05
- redirected blaster starts from the exact spark/contact point

## Effect Cleanup Rules

Temporary effects must never stay on screen after the action.

`clearTemporaryEffects()` should hide or destroy:

- slash arc sprite
- slash arc timer
- spark sprite
- spark timer
- incoming blaster
- redirected blaster
- debug markers

Call cleanup on:

- R reset
- ESC back
- scene shutdown
- action restart
- new demo start

## Layer Order

Use this render order:

```txt
1. gameplay background
2. player
3. slash arc up/down
4. incoming / redirected blaster
5. spark effects
6. UI
```

Important:

- slash arcs render above the player
- sparks render above slash arcs
- UI renders above everything

## Contact Point Rules

Each action should have its own contact point helper.

Do not reuse Deflect Up contact point for Deflect Down.

Use the displayed player sprite bounds:

```ts
const boundsLeft = playerSprite.x - playerSprite.displayWidth * playerSprite.originX;
const boundsTop = playerSprite.y - playerSprite.displayHeight * playerSprite.originY;

return {
  x: boundsLeft + playerSprite.displayWidth * NORM_X + FINE_TUNE_X,
  y: boundsTop + playerSprite.displayHeight * NORM_Y + FINE_TUNE_Y,
};
```

## Visible-Bounds Anchoring

For standalone effects such as spark frames and slash arcs:

1. Remove chroma/alpha.
2. Scan visible pixels.
3. Find visible bounds.
4. Set sprite origin to visible center.
5. Position by the stored contact point plus offsets.

This avoids canvas-center alignment errors.

## Animation Test Rule

Animation Test should preview animations only.

It must not change real gameplay balance unless explicitly requested.
