import Phaser from 'phaser';
import {
  HEAVY_DROID_HP, HEAVY_DROID_SHOOT_MS,
  BLASTER_SPEED, SCORE_KILL_HEAVY_DROID,
  UPPER_LANE_Y, LOWER_LANE_Y,
  COL_HEAVY_DROID,
} from '../game/constants';
import { EnemyState } from '../game/types';
import type { Lane } from '../game/types';
import { Enemy } from './Enemy';
import { Blaster } from './Blaster';

/**
 * HeavyDroid — larger, tougher, slower fire rate.
 * Fires standard blaster bolts.
 * Damaged by reflected blasters and Force abilities.
 */
export class HeavyDroid extends Enemy {
  readonly killScore = SCORE_KILL_HEAVY_DROID;

  private shootTimer = 0;
  private readonly shootInterval: number;
  private readonly boltSpeed: number;

  constructor(
    scene:         Phaser.Scene,
    x:             number,
    homeX:         number,
    lane:          Lane,
    boltSpeed     = BLASTER_SPEED,
    shootInterval = HEAVY_DROID_SHOOT_MS,
  ) {
    const y = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    // Larger placeholder rectangle
    super(scene, x, y, homeX, lane, HEAVY_DROID_HP, 58, 88, COL_HEAVY_DROID);
    this.boltSpeed     = boltSpeed;
    this.shootInterval = shootInterval;
    this.shootTimer    = Math.random() * shootInterval * 0.5;
  }

  tick(deltaMs: number, addBlaster: (b: Blaster) => void): void {
    if (!this.tickEntering(deltaMs)) return;
    if (this.state === EnemyState.Dead || this.state === EnemyState.Dying) return;

    this.shootTimer += deltaMs;
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.shoot(addBlaster);
    }
  }

  private shoot(addBlaster: (b: Blaster) => void): void {
    if (this.state !== EnemyState.Idle && this.state !== EnemyState.Shooting) return;
    this.state = EnemyState.Shooting;
    const bolt = new Blaster(
      this.scene,
      this.sprite.x - this.sprite.width / 2 - 10,
      this.sprite.y,
      this.lane,
      this.boltSpeed,
    );
    addBlaster(bolt);
    this.scene.time.delayedCall(350, () => {
      if (this.state === EnemyState.Shooting) this.state = EnemyState.Idle;
    });
  }
}
