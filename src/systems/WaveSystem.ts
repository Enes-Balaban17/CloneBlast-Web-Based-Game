import Phaser from 'phaser';
import { STAGES } from '../data/stages';
import { EnemyType } from '../game/types';
import type { WaveDef, StageDef } from '../game/types';
import { ENEMY_SPAWN_XS } from '../game/constants';
import type { Enemy } from '../entities/Enemy';
import type { Blaster } from '../entities/Blaster';
import { BattleDroid } from '../entities/BattleDroid';
import { HeavyDroid }  from '../entities/HeavyDroid';
import { ShieldDroid } from '../entities/ShieldDroid';
import { CyborgBoss }  from '../entities/CyborgBoss';

/**
 * WaveSystem — spawns enemies wave-by-wave for a given stage.
 *
 * Responsibilities:
 *  - Spawn enemy groups from WaveDef configs.
 *  - Track wave completion.
 *  - Expose isStageComplete() for StageSystem to check.
 */
export class WaveSystem {
  private scene:      Phaser.Scene;
  private enemies:    Enemy[] = [];
  private waves:      WaveDef[] = [];
  private waveIndex   = 0;
  private spawning    = false;
  private stageCleared = false;
  private boltSpeed:  number;
  private shootInterval: number;
  private onAddBlaster: (b: Blaster) => void;
  private onEnemyKill:  (enemy: Enemy) => void;

  constructor(
    scene:           Phaser.Scene,
    boltSpeed:       number,
    shootInterval:   number,
    onAddBlaster:    (b: Blaster) => void,
    onEnemyKill:     (enemy: Enemy) => void,
  ) {
    this.scene         = scene;
    this.boltSpeed     = boltSpeed;
    this.shootInterval = shootInterval;
    this.onAddBlaster  = onAddBlaster;
    this.onEnemyKill   = onEnemyKill;
  }

  // ── API ────────────────────────────────────────────────────────────────────

  /** Load a stage and spawn the first wave. */
  loadStage(stageDef: StageDef): void {
    this.enemies      = [];
    this.waveIndex    = 0;
    this.stageCleared = false;
    this.waves        = stageDef.waves;
    this.boltSpeed    = stageDef.boltSpeedMultiplier * this.boltSpeed;
    this.spawnWave(0);
  }

  /** Call every frame from CampaignScene. */
  update(deltaMs: number): void {
    // Tick all living enemies
    for (const e of this.enemies) {
      if (e.active) {
        e.tick(deltaMs, this.onAddBlaster);
      }
    }

    // Check for kills (enemy state transitions to Dead after death tween)
    const alive: Enemy[] = [];
    for (const e of this.enemies) {
      if ((e.state as string) === 'dead') {
        this.onEnemyKill(e);
      } else {
        alive.push(e);
      }
    }
    this.enemies = alive;

    // Advance wave
    if (!this.spawning && !this.stageCleared) {
      const wave = this.waves[this.waveIndex];
      if (wave) {
        const shouldAdvance = !wave.waitForClear || this.enemies.length === 0;
        const hasNextWave   = this.waveIndex + 1 < this.waves.length;
        if (shouldAdvance && hasNextWave) {
          this.waveIndex++;
          this.spawnWave(this.waveIndex);
        } else if (this.enemies.length === 0 && !hasNextWave) {
          this.stageCleared = true;
        }
      }
    }
  }

  getEnemies(): Enemy[] { return this.enemies; }

  isStageComplete(): boolean { return this.stageCleared; }

  /** Force-apply damage to all living non-boss enemies. Returns list of killed. */
  applyForceDamage(amount: number): Enemy[] {
    const killed: Enemy[] = [];
    for (const e of this.enemies) {
      if (e instanceof CyborgBoss) continue; // boss handled separately
      if ((e.state as string) === 'dead' || (e.state as string) === 'dying') continue;
      const died = (e as Enemy & { takeForceDamage?: (n: number) => boolean }).takeForceDamage
        ? (e as Enemy & { takeForceDamage: (n: number) => boolean }).takeForceDamage(amount)
        : e.takeDamage(amount);
      if (died) killed.push(e);
    }
    return killed;
  }

  getBoss(): CyborgBoss | null {
    for (const e of this.enemies) {
      if (e instanceof CyborgBoss) return e;
    }
    return null;
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private spawnWave(waveIndex: number): void {
    const wave = this.waves[waveIndex];
    if (!wave) return;
    this.spawning = true;

    let cumulativeDelay = 0;
    let spawnXIndex     = 0;

    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        const delay = cumulativeDelay;
        const xi    = spawnXIndex % ENEMY_SPAWN_XS.length;
        const homeX = ENEMY_SPAWN_XS[xi];
        spawnXIndex++;
        cumulativeDelay += group.delayMs;

        this.scene.time.delayedCall(delay, () => {
          const enemy = this.createEnemy(group.type, homeX);
          if (enemy) this.enemies.push(enemy);
        });
      }
    }

    // All spawns queued — clear spawning flag after the last one
    this.scene.time.delayedCall(cumulativeDelay + 50, () => {
      this.spawning = false;
    });
  }

  private createEnemy(type: EnemyType, homeX: number): Enemy | null {
    const lane = Math.random() < 0.5 ? 'upper' as const : 'lower' as const;
    const startX = 1980; // off screen right

    switch (type) {
      case EnemyType.BattleDroid:
        return new BattleDroid(this.scene, startX, homeX, lane, this.boltSpeed, this.shootInterval);
      case EnemyType.HeavyDroid:
        return new HeavyDroid(this.scene, startX, homeX, lane, this.boltSpeed, this.shootInterval * 1.5);
      case EnemyType.ShieldDroid:
        return new ShieldDroid(this.scene, startX, homeX, lane, this.boltSpeed, this.shootInterval * 1.2);
      case EnemyType.CyborgBoss:
        return new CyborgBoss(this.scene);
      default:
        return null;
    }
  }
}
