# Player Animation Rulebook

This rulebook defines the standardized visual, timing, and behavioral specifications for all player action animations. The **Deflect Up** animation serves as the baseline reference pattern for any future player action (e.g., Deflect Down, Reflect, Force Power, Hit, and Death).

---

## 1. Purpose
To ensure all character action animations feel responsive, weight-balanced, and chain together seamlessly without instant pose snapping, sprite teleportation, or visual discontinuities. 

---

## 2. Deflect Up Reference Pattern
The baseline animation structure consists of **8 frames** broken down into clear stages (Startup, Active Contact, Recovery, Chain-Exit, and Return-to-Idle):

* **Frame 01**: Startup / Anticipation (near-idle start).
* **Frame 02**: Action preparation.
* **Frame 03**: Motion start (low guard / swing start).
* **Frame 04**: Motion build (rising saber arc).
* **Frame 05**: **Active Deflect / Contact Window** (saber reaches maximum guard position, blocking blaster).
* **Frame 06**: Follow-through recovery.
* **Frame 07**: **Chain-Exit Frame** (clean frame where buffered action transitions can occur).
* **Frame 08**: Final recovery (closest to idle pose before fully returning to the idle loop).

---

## 3. Frame Role Template
Every future action animation should map to this standardized stage breakdown:

| Stage | Frame Index | Key Role | Metadata Flags | Description |
|---|---|---|---|---|
| **Startup** | 01 - 02 | Anticipation / Prep | `startup` | Plays immediately on press. Character moves from idle stance into action preparation. |
| **Motion Build** | 03 - 04 | Forward Strike / Build | `motionStart` / `motionBuild` | High-speed forward motion leading up to the contact event. |
| **Active Contact** | 05 | Deflection / Strike | `activeDeflect` / `activeReflect` | Maximum extension frame. Handles collision logic and spawns visual effects. |
| **Recovery** | 06 | Follow-through / Recov | `recovery` | Immediate post-strike deceleration pose. |
| **Chain-Exit** | 07 | Chaining Boundary | `chainExit` | Decelerated pose matching the startup frames of other actions. Chained inputs start here. |
| **Return-to-Idle**| 08 | Stance Recovery | `returnToIdle` | Final recovery frame. Plays ONLY if no chained action was buffered. |

---

## 4. Timing Template
Below is the manual timing configuration for the reference `DEFLECT_UP` sequence. Notice that the active frame (05) stays on screen significantly longer (420 ms) to give visual weight to the contact block, while the swing frames play extremely fast (35 - 55 ms):

```typescript
const DEFLECT_UP_SEQUENCE = [
  { key: "player_deflect_up_01", duration: 35 },
  { key: "player_deflect_up_02", duration: 45 },
  { key: "player_deflect_up_03", duration: 50 },
  { key: "player_deflect_up_04", duration: 55 },
  { key: "player_deflect_up_05", duration: 420, activeDeflect: true }, // Holds active block pose
  { key: "player_deflect_up_06", duration: 65 },
  { key: "player_deflect_up_07", duration: 60, chainExit: true },      // Allows immediate action branching
  { key: "player_deflect_up_08", duration: 50 },
];
```

---

## 5. Active Frame / Contact Rules
* **Collision Check**: The game must calculate blaster deflection/collision queries **only on the active frame** (Frame 05 in Deflect Up).
* **Cost Consumption**: Action cost (e.g. Stamina or Force) must be deducted **exactly once** at startup. It must never drain repeatedly during long active holds.
* **Double Hit Prevention**: A single blaster bolt must never trigger multiple deflections on a single hold. Once a bolt is deflected, mark it as handled.

---

## 6. Chain Exit Rules
To prevent teleportation glitches:
* **The Transition Point**: If a player triggers a new action during an ongoing action, the current animation **must not** snap immediately.
* **Buffered Action Branching**:
  * The current animation runs through the startup, active contact, and recovery phases.
  * Upon reaching the **`chainExit: true`** frame (Frame 07), the game checks if a buffered input exists.
  * If a buffered input exists, the game **skips the final recovery frame** (Frame 08) and immediately branches to the startup of the new action.
  * If no buffered action exists, the animation continues through Frame 08 and returns to the normal slow idle breathing loop.

---

## 7. Input Buffer Rules
The project utilizes a **single-action buffer** system:
1. **Idle State**: Inputs trigger their target action animations immediately.
2. **Action Playing State**: Incoming valid inputs are stored as `bufferedAction` (newer inputs overwrite previous ones in the buffer).
3. **Trigger Rules**: Actions are triggered once per key press (avoiding key-held repeats).
4. **Buffer Consume**: The buffer is evaluated and consumed on the `chainExit` frame.

---

## 8. Smooth Transition Rules
Never design a simple "Idle → Active Pose → Idle" sequence. Always insert transitional movement frames to build muscle torque and follow-through drag:
$$\text{Idle} \longrightarrow \text{Anticipation} \longrightarrow \text{Strike} \longrightarrow \text{Active Contact} \longrightarrow \text{Recovery} \longrightarrow \text{Chain Exit} \longrightarrow \text{Idle Stance}$$

---

## 9. Visual Effect Rules
* **Action Slash Arcs**:
  * Spawns on the active frame (Frame 05) regardless of whether an enemy or blaster is present.
  * Visible duration: **100 to 140 ms**. Must be hidden before/on Frame 06.
* **Deflect Sparks**:
  * Spawns **only** upon successful blaster contact.
  * Spark cycle duration: Spark 01 (45 ms) $\to$ Spark 02 (60 ms) $\to$ Spark 03 (55 ms).
  * Layer order: Sparks must render above the slash arc and the player sprite.
  * Position stability: The spark sequence must lock to the calculated contact coordinates at Frame 05 start. The frames must not shift or wobble relative to each other.

---

## 10. Contact Point / Anchor Rules
* **No Center Guessing**: Never place deflect sparks or aim incoming blasters at the player's body center or chest height.
* **Normalized Frame Coordinates**: Calculate the contact point relative to the display bounds of the current frame canvas (1080x1080 source):
  * **`DEFLECT_UP_CONTACT_NORM_X = 870 / 1080;`** (80.56% of sprite display width)
  * **`DEFLECT_UP_CONTACT_NORM_Y = 50 / 1080;`** (4.63% of sprite display height)
* **Mathematical Mapping**:
  $$\text{BoundsLeft} = \text{Sprite.x} - (\text{Sprite.displayWidth} \times \text{Sprite.originX})$$
  $$\text{BoundsTop} = \text{Sprite.y} - (\text{Sprite.displayHeight} \times \text{Sprite.originY})$$
  $$\text{Contact.x} = \text{BoundsLeft} + (\text{Sprite.displayWidth} \times \text{NormX}) + \text{FineTuneX}$$
  $$\text{Contact.y} = \text{BoundsTop} + (\text{Sprite.displayHeight} \times \text{NormY}) + \text{FineTuneY}$$
* **Blaster Start Height**:
  * The incoming blaster must descend horizontally or diagonally:
    $$\text{BlasterStartY} = \text{Contact.y} - 8$$
* **Spark Visible-Bounds Alignment**:
  To prevent positioning jumps between spark frames, scan transparent pixels (`alpha > 10`) post-chroma filtering to find the visible center:
  $$\text{VisibleCenterX} = \frac{\text{minX} + \text{maxX}}{2}$$
  $$\text{VisibleCenterY} = \frac{\text{minY} + \text{maxY}}{2}$$
  Set the origin dynamically to:
  $$\text{originX} = \frac{\text{VisibleCenterX}}{\text{TextureWidth}}, \quad \text{originY} = \frac{\text{VisibleCenterY}}{\text{TextureHeight}}$$

---

## 11. Animation Test Scene Rules
`AnimationTestScene` is the visual testing playground. It must remain fully isolated:
* No damage, no real combat math, no enemies, no stamina/force deductions, no wave rules.
* Key mappings:
  * **W** / **2**: Plain Deflect Up (slash arc on Frame 05, no blaster, no sparks).
  * **ArrowUp**: Blaster demo (incoming blaster, slash arc, and spark sequence on contact).
  * **R**: Reset animation to idle, clearing active visual tweens and effects.
  * **ESC**: Exit to Main Menu.
* Support live tuning of offsets (e.g. `J/L/I/K` and `Shift + J/L/I/K`).

---

## 12. Future Animation Checklist
When implementing new actions, verify the following:
* [ ] Sequence array maps startup, active frame, recovery, and `chainExit` frame.
* [ ] Consumes action cost only once on startup.
* [ ] Triggers slash arc effects on active contact frame.
* [ ] Chains seamlessly on frame `chainExit` (skips recovery if buffer is loaded).
* [ ] Added plain vs. contact demo keybinds inside `AnimationTestScene`.
* [ ] All HUD text fits inside the panel without overflow.

---

## 13. Example Config Template
```typescript
const ACTION_ANIMATION_TEMPLATE = [
  { key: "action_01", duration: 40, role: "nearIdleStart" },
  { key: "action_02", duration: 50, role: "anticipation" },
  { key: "action_03", duration: 55, role: "motionStart" },
  { key: "action_04", duration: 60, role: "motionBuild" },
  { key: "action_05", duration: 120, role: "active", active: true, effectCue: true },
  { key: "action_06", duration: 65, role: "recovery" },
  { key: "action_07", duration: 60, role: "chainExit", chainExit: true },
  { key: "action_08", duration: 50, role: "returnToIdle" },
];
```
