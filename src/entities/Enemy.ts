import Phaser from 'phaser';
import { PLAYER_X, ENEMY_ENTER_SPEED } from '../game/constants';
import { EnemyState } from '../game/types';
import type { Lane } from '../game/types';
import type { Blaster } from './Blaster';

/**
 * Abstract base class for all enemies.
 *
 * Responsibilities:
 *  - Hold HP, state, and the placeholder rectangle sprite.
 *  - Slide in from the right edge on spawn.
 *  - Expose takeDamage() and abstract update().
 *  - Subclasses handle shooting, special states, etc.
 */
export abstract class Enemy {
  hp:    number;
  state: EnemyState = EnemyState.Entering;

  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly scene:  Phaser.Scene;

  /** Target x position the enemy enters toward. */
  protected homeX: number;
  /** Lane this enemy occupies for shooting. */
  protected lane: Lane;

  /** Kill score awarded when this enemy is defeated. */
  abstract readonly killScore: number;

  /** Whether reflected blasters can damage this enemy. Subclasses may override. */
  protected _canBeHitByReflected = true;
  get canBeHitByReflected(): boolean { return this._canBeHitByReflected; }

  constructor(
    scene:   Phaser.Scene,
    x:       number,
    y:       number,
    homeX:   number,
    lane:    Lane,
    hp:      number,
    width:   number,
    height:  number,
    color:   number,
  ) {
    this.scene  = scene;
    this.homeX  = homeX;
    this.lane   = lane;
    this.hp     = hp;

    this.sprite = scene.add
      .rectangle(x, y, width, height, color)
      .setDepth(8);
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
  get active(): boolean { return this.sprite.active; }

  /** Called every frame. Override in subclasses for shooting / special logic. */
  abstract tick(deltaMs: number, addBlaster: (b: Blaster) => void): void;

  /**
   * Base update: handle slide-in animation first.
   * Returns true once the enemy has reached homeX.
   */
  protected tickEntering(deltaMs: number): boolean {
    if (this.state !== EnemyState.Entering) return true;
    const dx = (ENEMY_ENTER_SPEED * deltaMs) / 1000;
    if (this.sprite.x - dx <= this.homeX) {
      this.sprite.x = this.homeX;
      this.state    = EnemyState.Idle;
      return true;
    }
    this.sprite.x -= dx;
    return false;
  }

  /**
   * Apply HP damage.
   * Returns true if the enemy died.
   */
  takeDamage(amount: number): boolean {
    if (this.state === EnemyState.Dead || this.state === EnemyState.Dying) return false;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp    = 0;
      this.state = EnemyState.Dying;
      this.playDeathEffect();
      return true;
    }
    this.state = EnemyState.Hit;
    this.scene.time.delayedCall(180, () => {
      if (this.state === EnemyState.Hit) this.state = EnemyState.Idle;
    });
    return false;
  }

  /** Override for custom death VFX. */
  protected playDeathEffect(): void {
    this.sprite.setAlpha(0.4);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 2,
      scaleY: 0.1,
      duration: 350,
      onComplete: () => {
        this.state = EnemyState.Dead;
        this.sprite.destroy();
      },
    });
  }

  /** Whether a reflected blaster's x has reached this enemy. */
  overlapsBlaster(b: Blaster): boolean {
    if (!b.isReflected || !b.active) return false;
    const ex = this.sprite.x;
    const ew = this.sprite.width / 2;
    return b.x >= ex - ew && b.x <= ex + ew + 60;
  }

  destroy(): void {
    if (this.sprite.active) this.sprite.destroy();
  }
}
