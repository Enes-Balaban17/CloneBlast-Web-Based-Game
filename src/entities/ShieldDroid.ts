import Phaser from 'phaser';
import {
  SHIELD_DROID_HP, SHIELD_DROID_SHOOT_MS,
  SHIELD_DEPLOY_MS,
  BLASTER_SPEED, SCORE_KILL_SHIELD_DROID,
  UPPER_LANE_Y, LOWER_LANE_Y,
  COL_SHIELD_DROID,
} from '../game/constants';
import { EnemyState, ShieldDroidState } from '../game/types';
import type { Lane } from '../game/types';
import { Enemy } from './Enemy';
import { Blaster } from './Blaster';

/**
 * ShieldDroid — starts rolling, deploys after SHIELD_DEPLOY_MS, can raise shield.
 *
 * States:
 *   rolling  → sprite is narrow (rolling ball)
 *   deploying → transitioning (same width, semi-transparent)
 *   idle     → deployed (full size)
 *   shielded → shield active; reflected blasters blocked
 *
 * Force abilities ignore the shield and deal damage regardless.
 */
export class ShieldDroid extends Enemy {
  readonly killScore        = SCORE_KILL_SHIELD_DROID;
  shieldState: ShieldDroidState = ShieldDroidState.Rolling;

  // canBeHitByReflected is dynamically read by CampaignScene before applying damage.
  // We override the base field with a getter computed from shieldState.
  override get canBeHitByReflected(): boolean {
    return this.shieldState !== ShieldDroidState.Shielded;
  }

  /** Shield indicator graphic. */
  private shieldGfx: Phaser.GameObjects.Graphics;
  private shootTimer = 0;
  private readonly shootInterval: number;
  private readonly boltSpeed:     number;

  constructor(
    scene:         Phaser.Scene,
    x:             number,
    homeX:         number,
    lane:          Lane,
    boltSpeed     = BLASTER_SPEED,
    shootInterval = SHIELD_DROID_SHOOT_MS,
  ) {
    const y = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    super(scene, x, y, homeX, lane, SHIELD_DROID_HP, 24, 24, COL_SHIELD_DROID);
    this.boltSpeed     = boltSpeed;
    this.shootInterval = shootInterval;
    this.shootTimer    = Math.random() * shootInterval * 0.4;

    // Shield aura graphic (drawn over the sprite)
    this.shieldGfx = scene.add.graphics().setDepth(9);

    // Begin deploy sequence once entering finishes
    scene.time.delayedCall(SHIELD_DEPLOY_MS, () => {
      if (this.shieldState === ShieldDroidState.Rolling) {
        this.deploy();
      }
    });
  }

  private deploy(): void {
    this.shieldState = ShieldDroidState.Deploying;
    // Expand sprite to full deployed size
    this.scene.tweens.add({
      targets: this.sprite,
      displayWidth:  50,
      displayHeight: 70,
      duration: 500,
      onComplete: () => {
        this.shieldState = ShieldDroidState.Idle;
        // Raise shield 2s after deploying
        this.scene.time.delayedCall(2000, () => this.raiseShield());
      },
    });
  }

  raiseShield(): void {
    if (
      this.shieldState === ShieldDroidState.Dead ||
      this.shieldState === ShieldDroidState.Dying
    ) return;
    this.shieldState = ShieldDroidState.Shielded;
    // Auto-lower after 4 seconds
    this.scene.time.delayedCall(4000, () => this.lowerShield());
  }

  lowerShield(): void {
    if (this.shieldState === ShieldDroidState.Shielded) {
      this.shieldState = ShieldDroidState.Idle;
      // Re-raise after 3 seconds
      this.scene.time.delayedCall(3000, () => this.raiseShield());
    }
  }

  tick(deltaMs: number, addBlaster: (b: Blaster) => void): void {
    if (!this.tickEntering(deltaMs)) return;
    if (
      this.shieldState === ShieldDroidState.Dead ||
      this.shieldState === ShieldDroidState.Dying ||
      this.shieldState === ShieldDroidState.Rolling ||
      this.shieldState === ShieldDroidState.Deploying
    ) return;
    if (this.state === EnemyState.Dead || this.state === EnemyState.Dying) return;

    // Draw shield ring
    this.shieldGfx.clear();
    if (this.shieldState === ShieldDroidState.Shielded) {
      this.shieldGfx.lineStyle(4, 0x44aaff, 0.8);
      this.shieldGfx.strokeCircle(this.sprite.x, this.sprite.y, 52);
    }

    // Shoot only when idle
    if (this.shieldState === ShieldDroidState.Idle) {
      this.shootTimer += deltaMs;
      if (this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.shoot(addBlaster);
      }
    }
  }

  private shoot(addBlaster: (b: Blaster) => void): void {
    const bolt = new Blaster(
      this.scene,
      this.sprite.x - this.sprite.width / 2 - 10,
      this.sprite.y,
      this.lane,
      this.boltSpeed,
    );
    addBlaster(bolt);
  }

  /**
   * Force abilities disable the shield and deal damage.
   */
  takeForceDamage(amount: number): boolean {
    this.lowerShield();
    return this.takeDamage(amount);
  }

  protected override playDeathEffect(): void {
    this.shieldGfx.clear();
    super.playDeathEffect();
    this.scene.time.delayedCall(360, () => this.shieldGfx.destroy());
  }

  destroy(): void {
    this.shieldGfx.destroy();
    super.destroy();
  }
}
