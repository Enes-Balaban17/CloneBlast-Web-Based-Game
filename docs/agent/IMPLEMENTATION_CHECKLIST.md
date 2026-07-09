# CLONE BLAST Implementation Checklist

Use this checklist after every agent change.

## Before Editing

- [ ] Read `PROJECT_AGENT_RULES.md`.
- [ ] Read `PLAYER_ANIMATION_RULEBOOK.md`.
- [ ] If changing Animation Test, read `ANIMATION_TEST_SCENE.md`.
- [ ] If touching Deflect Up, read `DEFLECT_UP_REFERENCE.md`.
- [ ] If touching Deflect Down, read `DEFLECT_DOWN_REFERENCE.md`.

## Preservation Checks

- [ ] Do not change Deflect Up unless explicitly requested.
- [ ] Do not change player sprite files.
- [ ] Do not change player scale/origin/hitbox unless explicitly requested.
- [ ] Do not change Campaign or Infinite gameplay unless explicitly requested.
- [ ] Do not change high-score/name-entry logic unless explicitly requested.
- [ ] Do not break main menu background/logo.

## Asset Loading Checks

- [ ] Required player frames are loaded.
- [ ] Required slash arc texture is loaded.
- [ ] Spark textures are loaded or safely skipped.
- [ ] Green chroma key preserves blue/cyan sword and arc pixels.
- [ ] White-to-alpha idle processing still works.
- [ ] Missing assets do not crash the scene.

## Animation Rule Checks

- [ ] Action does not restart every update tick.
- [ ] Startup frames play normally.
- [ ] Frame 05 is active/contact.
- [ ] Frame 07 is chain-exit.
- [ ] Frame 08 returns to idle if no buffered action exists.
- [ ] Buffered action starts after frame 07.
- [ ] Frame 08 is skipped when a buffered action exists.
- [ ] No snap/teleport between chained actions.

## Deflect Up Checks

- [ ] W / 2 plays plain Deflect Up.
- [ ] ArrowUp plays Deflect Up demo.
- [ ] Slash Up appears on frame 05.
- [ ] Spark appears only in ArrowUp demo.
- [ ] Blaster reaches upper contact at frame 05.
- [ ] Redirected blaster moves upward-right.
- [ ] Deflect Up constants are unchanged unless requested.

## Deflect Down Checks

- [ ] S / 3 plays plain Deflect Down.
- [ ] ArrowDown plays Deflect Down demo.
- [ ] Slash Down appears on frame 05.
- [ ] Spark appears only in ArrowDown demo.
- [ ] Blaster reaches lower contact at frame 05.
- [ ] Spark and incoming blaster use the same stored contact point.
- [ ] Redirected blaster moves downward-right.
- [ ] Slash Down arc uses visible-bounds origin.
- [ ] Slash Down arc angle is applied.
- [ ] Slash Down arc renders above player/sword.
- [ ] Spark renders above slash arc.

## Cleanup Checks

- [ ] Slash arc disappears after about 120ms.
- [ ] Slash arc is hidden by frame 06.
- [ ] Old slash arcs do not linger.
- [ ] Duplicate arc sprites are prevented.
- [ ] Sparks disappear after the spark sequence.
- [ ] Incoming blaster is cleared after contact/redirect.
- [ ] Redirected blaster is cleared after its tween.
- [ ] R clears temporary effects.
- [ ] ESC clears temporary effects before leaving scene.
- [ ] Scene shutdown clears temporary effects.

## Debug UI Checks

- [ ] UI panel stays inside screen bounds.
- [ ] Debug values are compact.
- [ ] Current action is shown.
- [ ] Current frame key/index is shown.
- [ ] Buffered action is shown.
- [ ] Contact X/Y is shown.
- [ ] Arc visibility/type is shown when useful.
- [ ] Redirect direction is shown when useful.

## Manual Test Flow

1. Open Animation Test.
2. Press `1` and verify idle.
3. Press `W` and verify plain Deflect Up.
4. Press `ArrowUp` and verify Deflect Up demo.
5. Press `S` and verify plain Deflect Down.
6. Press `ArrowDown` and verify Deflect Down demo.
7. Press `W`, then quickly `S`; verify smooth chain.
8. Press `S`, then quickly `W`; verify smooth chain.
9. Press `R`; verify all temporary effects clear.
10. Press `ESC`; verify return to main menu with no lingering effects.

## Build

Run:

```bash
npm run build
```

The task is not complete until the build passes or the failure is reported clearly.

## Required Report Format

After implementation, report:

```txt
Changed files:
- ...

Constants changed:
- ...

Manual checks:
- ...

Build:
- npm run build: passed/failed
```
