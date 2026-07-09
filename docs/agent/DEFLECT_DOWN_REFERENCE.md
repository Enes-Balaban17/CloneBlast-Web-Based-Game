# Deflect Down Reference Implementation

Deflect Down must follow the same animation rulebook as Deflect Up.

Latest tested intent:

- 8-frame action animation
- frame 05 = active lower deflect/contact
- frame 07 = chain-exit
- frame 08 = return-to-idle
- S/3 = plain animation + slash arc only
- ArrowDown = lower blaster demo + slash arc + spark + downward-right redirect

## Asset Folder

```txt
public/assets/player/deflect_down/
```

Required files:

```txt
blue_slash_arc_down.png
player_deflect_down_01.png
player_deflect_down_02.png
player_deflect_down_03.png
player_deflect_down_04.png
player_deflect_down_05.png
player_deflect_down_06.png
player_deflect_down_07.png
player_deflect_down_08.png
```

Spark textures are reused from Deflect Up:

```txt
blue_red_deflect_spark_01.png
blue_red_deflect_spark_02.png
blue_red_deflect_spark_03.png
```

## Texture Keys

Suggested processed player keys:

```txt
player_deflect_down_01
player_deflect_down_02
player_deflect_down_03
player_deflect_down_04
player_deflect_down_05
player_deflect_down_06
player_deflect_down_07
player_deflect_down_08
```

Suggested effect key:

```txt
effect_slash_arc_down
```

## Sequence

Use this faster sequence. It was chosen because the original Deflect Down felt too slow and heavy.

```ts
const DEFLECT_DOWN_SEQUENCE = [
  { key: "player_deflect_down_01", duration: 30 },
  { key: "player_deflect_down_02", duration: 35 },
  { key: "player_deflect_down_03", duration: 40 },
  { key: "player_deflect_down_04", duration: 45 },
  { key: "player_deflect_down_05", duration: 300, activeDeflect: true },
  { key: "player_deflect_down_06", duration: 45 },
  { key: "player_deflect_down_07", duration: 40, chainExit: true },
  { key: "player_deflect_down_08", duration: 35 },
];
```

## Frame Roles

```txt
01 = near-idle start
02 = preparation
03 = waist-level transition
04 = lower approach
05 = active lower deflect / contact frame
06 = recovery
07 = chain-exit
08 = closest return-to-idle frame
```

## Deflect Down Contact Point

Deflect Down uses a separate contact point. Do not reuse Deflect Up contact constants.

Latest requested contact values:

```ts
const DEFLECT_DOWN_CONTACT_NORM_X = 0.74;
const DEFLECT_DOWN_CONTACT_NORM_Y = 0.56;

const DEFLECT_DOWN_CONTACT_FINE_TUNE_X = 72;
const DEFLECT_DOWN_CONTACT_FINE_TUNE_Y = 69;
```

Helper:

```ts
function getDeflectDownSwordContactPoint() {
  const boundsLeft = playerSprite.x - playerSprite.displayWidth * playerSprite.originX;
  const boundsTop = playerSprite.y - playerSprite.displayHeight * playerSprite.originY;

  return {
    x: boundsLeft + playerSprite.displayWidth * DEFLECT_DOWN_CONTACT_NORM_X + DEFLECT_DOWN_CONTACT_FINE_TUNE_X,
    y: boundsTop + playerSprite.displayHeight * DEFLECT_DOWN_CONTACT_NORM_Y + DEFLECT_DOWN_CONTACT_FINE_TUNE_Y,
  };
}
```

Use this adjusted contact point for:

- incoming lower blaster target
- spark center
- redirected lower blaster start
- optional debug marker

## Spark Placement

Keep spark offsets neutral:

```ts
const DEFLECT_DOWN_SPARK_OFFSET_X = 0;
const DEFLECT_DOWN_SPARK_OFFSET_Y = 0;
```

Rules:

- Spark 01, 02, and 03 must use the same stored Deflect Down contact point.
- Do not position spark frames independently.
- Do not use Deflect Up spark offsets.
- Do not use player body center.
- Use visible-bounds anchoring.

## Incoming Blaster Path

The lower blaster should target the Deflect Down contact point.

```ts
const contact = getDeflectDownSwordContactPoint();

blasterStartX = gameWidth + 80;
blasterStartY = contact.y;

blasterTargetX = contact.x;
blasterTargetY = contact.y;
```

Frame 05 starts after:

```txt
30 + 35 + 40 + 45 = 150ms
```

So the lower blaster travel duration should be about:

```txt
150ms
```

## Redirected Blaster

Deflect Down must redirect the blaster downward-right.

```ts
redirectStartX = contact.x;
redirectStartY = contact.y;

redirectEndX = contact.x + 160;
redirectEndY = contact.y + 160;
```

Important:

- positive Y means downward on screen
- upward-right redirect belongs to Deflect Up only
- Deflect Down redirect must start from the same point as the spark

## Slash Down Arc

`blue_slash_arc_down.png` should look as clean and natural as Slash Up Arc.

Latest requested constants:

```ts
const DEFLECT_DOWN_ARC_OFFSET_X = -35;
const DEFLECT_DOWN_ARC_OFFSET_Y = -125;
const DEFLECT_DOWN_ARC_SCALE = 1.0;
const DEFLECT_DOWN_ARC_ANGLE_DEG = -28;
```

Placement:

```ts
const contact = getDeflectDownSwordContactPoint();

arc.setPosition(
  contact.x + DEFLECT_DOWN_ARC_OFFSET_X,
  contact.y + DEFLECT_DOWN_ARC_OFFSET_Y
);

arc.setScale(DEFLECT_DOWN_ARC_SCALE);
arc.setAngle(DEFLECT_DOWN_ARC_ANGLE_DEG);
```

Rules:

- treat down arc as a standalone effect asset
- use visible-bounds origin
- render above player/sword
- spark renders above the arc
- arc appears only on frame 05
- arc disappears after about 120ms
- arc is forcibly hidden by frame 06
- arc clears on reset, ESC, scene shutdown, and new demo start

## Optional Arc Fallback

If `blue_slash_arc_down.png` is visually unusable even after angle/origin correction, add this disabled fallback:

```ts
const USE_UP_ARC_AS_DOWN_ARC_FALLBACK = false;
```

When true for testing only:

```ts
arc.setTexture("effect_slash_arc_up");
arc.setFlipY(true);
arc.setAngle(-35);
```

Do not enable this by default unless explicitly requested.

## Plain vs Demo

Plain Deflect Down:

```txt
S / 3 -> animation + slash arc down only
```

Demo Deflect Down:

```txt
ArrowDown -> animation + incoming lower blaster + slash arc down + spark sequence + downward-right redirect
```

Do not merge S and ArrowDown behavior inside Animation Test.

## Preservation Rule

When fixing Deflect Down:

- do not change Deflect Up
- do not change player sprites
- do not reset tested constants unless the task asks for alignment changes
- run `npm run build`
