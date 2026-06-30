import { EnemyType } from '../game/types';
import type { StageDef } from '../game/types';
import { BLASTER_SPEED, BLASTER_SPAWN_INTERVAL } from '../game/constants';

/**
 * 7 campaign stages.
 * Blaster patterns are handled by WaveSystem / StageSystem.
 * boltSpeedMultiplier scales BLASTER_SPEED for this stage.
 * spawnIntervalMs sets how often enemy droids fire (independent from blaster pool).
 */
export const STAGES: StageDef[] = [
  // ── Stage 1 — Intro. Two battle droids. Slow bolts. ─────────────────────────
  {
    stageNumber:         1,
    isBossStage:         false,
    boltSpeedMultiplier: 1.0,
    spawnIntervalMs:     BLASTER_SPAWN_INTERVAL,
    waves: [
      {
        waitForClear: true,
        enemies: [
          { type: EnemyType.BattleDroid, count: 2, delayMs: 1000 },
        ],
      },
    ],
  },

  // ── Stage 2 — Three battle droids, slightly faster. ──────────────────────────
  {
    stageNumber:         2,
    isBossStage:         false,
    boltSpeedMultiplier: 1.1,
    spawnIntervalMs:     1900,
    waves: [
      {
        waitForClear: true,
        enemies: [
          { type: EnemyType.BattleDroid, count: 3, delayMs: 900 },
        ],
      },
    ],
  },

  // ── Stage 3 — Battle droids + first heavy droid. ─────────────────────────────
  {
    stageNumber:         3,
    isBossStage:         false,
    boltSpeedMultiplier: 1.2,
    spawnIntervalMs:     1800,
    waves: [
      {
        waitForClear: false,
        enemies: [
          { type: EnemyType.BattleDroid, count: 2, delayMs: 800 },
          { type: EnemyType.HeavyDroid,  count: 1, delayMs: 1200 },
        ],
      },
    ],
  },

  // ── Stage 4 — Mixed: heavy + shield droids introduced. ───────────────────────
  {
    stageNumber:         4,
    isBossStage:         false,
    boltSpeedMultiplier: 1.3,
    spawnIntervalMs:     1700,
    waves: [
      {
        waitForClear: false,
        enemies: [
          { type: EnemyType.BattleDroid, count: 2, delayMs: 800 },
          { type: EnemyType.ShieldDroid, count: 1, delayMs: 1000 },
        ],
      },
      {
        waitForClear: true,
        enemies: [
          { type: EnemyType.HeavyDroid, count: 1, delayMs: 600 },
        ],
      },
    ],
  },

  // ── Stage 5 — Two waves. Harder mix. ─────────────────────────────────────────
  {
    stageNumber:         5,
    isBossStage:         false,
    boltSpeedMultiplier: 1.45,
    spawnIntervalMs:     1500,
    waves: [
      {
        waitForClear: false,
        enemies: [
          { type: EnemyType.BattleDroid, count: 3, delayMs: 700 },
          { type: EnemyType.HeavyDroid,  count: 1, delayMs: 900 },
        ],
      },
      {
        waitForClear: true,
        enemies: [
          { type: EnemyType.ShieldDroid, count: 2, delayMs: 800 },
        ],
      },
    ],
  },

  // ── Stage 6 — Heavy assault. Three-wave gauntlet. ────────────────────────────
  {
    stageNumber:         6,
    isBossStage:         false,
    boltSpeedMultiplier: 1.6,
    spawnIntervalMs:     1300,
    waves: [
      {
        waitForClear: false,
        enemies: [
          { type: EnemyType.BattleDroid, count: 2, delayMs: 600 },
          { type: EnemyType.ShieldDroid, count: 1, delayMs: 800 },
        ],
      },
      {
        waitForClear: false,
        enemies: [
          { type: EnemyType.HeavyDroid, count: 2, delayMs: 700 },
        ],
      },
      {
        waitForClear: true,
        enemies: [
          { type: EnemyType.BattleDroid, count: 2, delayMs: 600 },
          { type: EnemyType.ShieldDroid, count: 1, delayMs: 900 },
        ],
      },
    ],
  },

  // ── Stage 7 — Boss stage. ────────────────────────────────────────────────────
  {
    stageNumber:         7,
    isBossStage:         true,
    boltSpeedMultiplier: 1.0,  // boss doesn't fire blasters; speed irrelevant
    spawnIntervalMs:     99999, // disable random blaster spawns
    waves: [
      {
        waitForClear: true,
        enemies: [
          { type: EnemyType.CyborgBoss, count: 1, delayMs: 0 },
        ],
      },
    ],
  },
];
