import Phaser from 'phaser';
import {
  BATTLE_DROID_HP, BATTLE_DROID_SHOOT_MS,
  BLASTER_SPEED, SCORE_KILL_BATTLE_DROID,
  UPPER_LANE_Y, LOWER_LANE_Y,
  COL_BATTLE_DROID,
} from '../game/constants';
import { EnemyState } from '../game/types';
import type { Lane } from '../game/types';
import { Enemy } from './Enemy';
import { Blaster } from './Blaster';

export class BattleDroid extends Enemy {
  readonly killScore = SCORE_KILL_BATTLE_DROID;

  private shootTimer = 0;
  private readonly shootInterval: number;
  private readonly boltSpeed: number;

  constructor(
    scene:          Phaser.Scene,
    x:              number,
    homeX:          number,
    lane:           Lane,
    boltSpeed      = BLASTER_SPEED,
    shootInterval  = BATTLE_DROID_SHOOT_MS,
  ) {
    const y = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    super(scene, x, y, homeX, lane, BATTLE_DROID_HP, 40, 80, COL_BATTLE_DROID);
    this.boltSpeed     = boltSpeed;
    this.shootInterval = shootInterval;
    // Stagger first shot so multiple droids don't fire at once
    this.shootTimer = Math.random() * shootInterval * 0.6;
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
    this.scene.time.delayedCall(280, () => {
      if (this.state === EnemyState.Shooting) this.state = EnemyState.Idle;
    });
  }
}
