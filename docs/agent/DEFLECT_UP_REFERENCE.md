# Deflect Up Reference Implementation

Deflect Up is the completed reference implementation for CLONE BLAST player action animations.

Do not change Deflect Up unless the task explicitly asks for it.

## Asset Folder

```txt
public/assets/player/deflect_up/
```

Required player frames:

```txt
player_deflect_up_01.png
player_deflect_up_02.png
player_deflect_up_03.png
player_deflect_up_04.png
player_deflect_up_05.png
player_deflect_up_06.png
player_deflect_up_07.png
player_deflect_up_08.png
```

Effect assets may be in this folder or a shared effects folder:

```txt
blue_slash_arc_up.png
blue_red_deflect_spark_01.png
blue_red_deflect_spark_02.png
blue_red_deflect_spark_03.png
```

## Texture Keys

Suggested processed player keys:

```txt
player_deflect_up_01
player_deflect_up_02
player_deflect_up_03
player_deflect_up_04
player_deflect_up_05
player_deflect_up_06
player_deflect_up_07
player_deflect_up_08
```

Suggested effect keys:

```txt
effect_slash_arc_up
effect_deflect_spark_01
effect_deflect_spark_02
effect_deflect_spark_03
```

## Sequence

Use this sequence:

```ts
const DEFLECT_UP_SEQUENCE = [
  { key: "player_deflect_up_01", duration: 35 },
  { key: "player_deflect_up_02", duration: 45 },
  { key: "player_deflect_up_03", duration: 50 },
  { key: "player_deflect_up_04", duration: 55 },
  { key: "player_deflect_up_05", duration: 420, activeDeflect: true },
  { key: "player_deflect_up_06", duration: 65 },
  { key: "player_deflect_up_07", duration: 60, chainExit: true },
  { key: "player_deflect_up_08", duration: 50 },
];
```

## Frame Roles

```txt
01 = near-idle / start
02 = preparation
03 = low/waist guard or swing start
04 = rising motion
05 = active upper deflect / contact frame
06 = recovery
07 = chain-exit
08 = closest return-to-idle
```

## Active Contact

Frame 05 is the active blaster collision/deflect impact frame.

Important:

- This was intentionally moved from frame 04 to frame 05.
- Slash arc appears on frame 05.
- Spark appears only in ArrowUp demo on frame 05.
- Frame 05 has a longer hold for readability.

## Chain Exit

Frame 07 is the chain-exit frame.

If a buffered action exists:

- start it after frame 07
- skip frame 08

If no buffered action exists:

- play frame 08
- return to idle

## Contact Point

Use the working Deflect Up contact point currently in code.

Known source-frame reference:

```txt
1080 source canvas sword-tip anchor: x = 870, y = 50
normalized: x = 870 / 1080, y = 50 / 1080
```

Important:

- Do not replace the current working Deflect Up alignment constants unless explicitly asked.
- Deflect Up contact is separate from Deflect Down contact.
- Do not reuse Deflect Down constants for Deflect Up.

## Visual Effects

Slash arc:

- `blue_slash_arc_up.png`
- appears on frame 05
- used for both W/2 plain Deflect Up and ArrowUp demo
- visible about 100-140ms
- must disappear before/during frame 06

Spark:

- `blue_red_deflect_spark_01.png`
- `blue_red_deflect_spark_02.png`
- `blue_red_deflect_spark_03.png`
- appears only during ArrowUp demo
- starts on frame 05
- all spark frames use the same stored contact point
- visible-bounds anchoring is required

Blaster demo:

- ArrowUp spawns red blaster from the right
- blaster reaches upper contact at frame 05
- redirected blaster moves upward-right or disappears cleanly

Suggested redirect:

```ts
redirectStartX = contact.x;
redirectStartY = contact.y;
redirectEndX = contact.x + 160;
redirectEndY = contact.y - 160;
```

Negative Y means upward on screen.

## Plain vs Demo

Plain Deflect Up:

```txt
W / 2 -> animation + slash arc only
```

Demo Deflect Up:

```txt
ArrowUp -> animation + incoming blaster + slash arc + spark + redirect
```

Do not merge W and ArrowUp behavior inside Animation Test.

## Preservation Rule

Deflect Up is the visual and timing reference for future actions.

When implementing Deflect Down or future animations:

- follow Deflect Up's rulebook
- do not disturb Deflect Up constants
- do not change Deflect Up effect placement
- verify Deflect Up still works after every change
