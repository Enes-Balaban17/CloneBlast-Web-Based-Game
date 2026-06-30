// ─── Lanes ────────────────────────────────────────────────────────────────────
export type Lane = 'upper' | 'lower';

// ─── Enemy Types ─────────────────────────────────────────────────────────────
export enum EnemyType {
  BattleDroid = 'battle_droid',
  HeavyDroid  = 'heavy_droid',
  ShieldDroid = 'shield_droid',
  CyborgBoss  = 'cyborg_boss',
}

// ─── Player States ────────────────────────────────────────────────────────────
export enum PlayerState {
  Idle              = 'idle',
  DeflectUpper      = 'deflect_upper',
  DeflectLower      = 'deflect_lower',
  ForceReflect      = 'force_reflect',
  ForceChokeCharge  = 'force_choke_charge',
  ForceChokeRelease = 'force_choke_release',
  Hit               = 'hit',
  Dead              = 'dead',
}

// ─── Enemy States (shared base) ───────────────────────────────────────────────
export enum EnemyState {
  Entering   = 'entering',   // sliding in from right edge
  Idle       = 'idle',
  Shooting   = 'shooting',
  Hit        = 'hit',
  Dying      = 'dying',
  Dead       = 'dead',
}

// ─── Shield Droid States ──────────────────────────────────────────────────────
export enum ShieldDroidState {
  Rolling   = 'rolling',    // rolling into position
  Deploying = 'deploying',  // standing up
  Idle      = 'idle',       // deployed, no shield
  Shielded  = 'shielded',   // shield active
  Hit       = 'hit',
  Dying     = 'dying',
  Dead      = 'dead',
}

// ─── Boss States ──────────────────────────────────────────────────────────────
export enum BossState {
  Idle           = 'idle',
  Deflect        = 'deflect',
  ChargePrepare  = 'charge_prepare',
  ChargeDash     = 'charge_dash',
  SaberSlash     = 'saber_slash',
  BackJumpReturn = 'back_jump_return',
  ForceHit       = 'force_hit',
  Stagger        = 'stagger',
  Defeated       = 'defeated',
}

// ─── Deflect Results ──────────────────────────────────────────────────────────
export enum DeflectResult {
  Perfect   = 'perfect',
  Normal    = 'normal',
  Empty     = 'empty',       // pressed with no blaster in range
  WrongLane = 'wrong_lane',  // pressed but blaster is in the other lane
}

// ─── High Score ───────────────────────────────────────────────────────────────
export interface ScoreEntry {
  name:  string;   // exactly 5 consonants, uppercase
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
  enemies:         WaveEnemyDef[];
  /** If true, all enemies in this wave must be defeated before next wave starts. */
  waitForClear:    boolean;
}

export interface StageDef {
  stageNumber:         number;
  isBossStage:         boolean;
  waves:               WaveDef[];
  boltSpeedMultiplier: number;   // multiplies BLASTER_SPEED
  spawnIntervalMs:     number;   // base ms between blaster spawns
}

// ─── Combo ────────────────────────────────────────────────────────────────────
export interface ComboTier {
  readonly minCombo:   number;
  readonly multiplier: number;
}

// ─── Game Mode ────────────────────────────────────────────────────────────────
export type GameMode = 'campaign' | 'infinite';

// ─── Scene transition data payloads ──────────────────────────────────────────
export interface GameSceneData {
  mode:         GameMode;
  stage?:       number;
  /** Carry-over score and force between stages (campaign only). */
  carryScore?:  number;
  carryForce?:  number;
}

export interface GameOverData {
  score:       number;
  mode:        GameMode;
  /** If true the player beat all 7 stages. */
  victory?:    boolean;
}

export interface NameEntryData {
  score: number;
  mode:  GameMode;
}

/** Emitted when an enemy is killed — consumed by CampaignScene to award score. */
export interface EnemyKillData {
  score: number;
}
