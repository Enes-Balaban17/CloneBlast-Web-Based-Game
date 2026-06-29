// ─── Lanes ────────────────────────────────────────────────────────────────────
export type Lane = 'upper' | 'lower';

// ─── Enemy Types ─────────────────────────────────────────────────────────────
export enum EnemyType {
  BattleDroid  = 'battle_droid',
  HeavyDroid   = 'heavy_droid',
  ShieldDroid  = 'shield_droid',
  CyborgBoss   = 'cyborg_boss',
}

// ─── Player States ────────────────────────────────────────────────────────────
export enum PlayerState {
  Idle               = 'idle',
  DeflectUpper       = 'deflect_upper',
  DeflectLower       = 'deflect_lower',
  ForceReflect       = 'force_reflect',
  ForceChokeCharge   = 'force_choke_charge',
  ForceChokeRelease  = 'force_choke_release',
  Hit                = 'hit',
  Dead               = 'dead',
}

// ─── Deflect Results ──────────────────────────────────────────────────────────
export enum DeflectResult {
  Perfect   = 'perfect',
  Normal    = 'normal',
  Empty     = 'empty',      // pressed with no blaster in range
  WrongLane = 'wrong_lane', // pressed but blaster is in the other lane
}

// ─── High Score ───────────────────────────────────────────────────────────────
export interface ScoreEntry {
  name:  string;                     // exactly 5 consonants, uppercase
  score: number;
  mode:  'campaign' | 'infinite';
}

// ─── Wave & Stage Definitions ─────────────────────────────────────────────────
export interface WaveEnemyDef {
  type:    EnemyType;
  count:   number;
  delayMs: number;  // ms between individual enemy spawns in this group
}

export interface WaveDef {
  enemies: WaveEnemyDef[];
}

export interface StageDef {
  stageNumber:          number;
  waves:                WaveDef[];
  boltSpeedMultiplier:  number;   // multiplies BLASTER_SPEED
  spawnIntervalMs:      number;   // base ms between blaster spawns
}

// ─── Combo ────────────────────────────────────────────────────────────────────
export interface ComboTier {
  readonly minCombo:    number;
  readonly multiplier:  number;
}

// ─── Game Mode ────────────────────────────────────────────────────────────────
export type GameMode = 'campaign' | 'infinite';

// ─── Scene transition data payloads ──────────────────────────────────────────
export interface GameSceneData {
  mode:   GameMode;
  stage?: number;
}

export interface GameOverData {
  score: number;
  mode:  GameMode;
}

export interface NameEntryData {
  score: number;
  mode:  GameMode;
}
