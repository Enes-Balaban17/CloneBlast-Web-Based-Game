import Phaser from 'phaser';
import {
  PLAYER_X, PLAYER_Y,
  MAX_HP, MAX_STAMINA,
  DEFLECT_STAMINA_COST,
  EMPTY_DEFLECT_PENALTY,
  WRONG_LANE_PENALTY,
} from '../game/constants';
import { PlayerState } from '../game/types';

export class Player {
  // ── Stats ──────────────────────────────────────────────────────────────────
  hp:      number = MAX_HP;
  stamina: number = MAX_STAMINA;
  force:   number = 0;
  state:   PlayerState = PlayerState.Idle;

  // ── Visual ─────────────────────────────────────────────────────────────────
  readonly sprite: any;

  constructor(scene: Phaser.Scene) {
    const hasPlayerSprite = scene.textures.exists('player_idle') &&
      scene.textures.get('player_idle').get(0).realWidth > 2;

    if (hasPlayerSprite) {
      // Create sprite at target position (PLAYER_X, 860)
      const spriteObj = scene.add.sprite(PLAYER_X, 860, 'player_idle')
        .setOrigin(0.5, 1)
        .setDepth(10);

      // Scale player sprite to height of ~400px (preserve aspect ratio)
      const targetHeight = 400;
      const scale = targetHeight / spriteObj.height;
      spriteObj.setScale(scale);
      
      // Face right
      spriteObj.setFlipX(false);

      this.sprite = spriteObj;
    } else {
      // Fallback placeholder rectangle
      this.sprite = scene.add
        .rectangle(PLAYER_X, PLAYER_Y, 52, 130, 0x00ccff)
        .setDepth(10);
    }
  }

  // ── Stamina helpers ────────────────────────────────────────────────────────

  canDeflect(): boolean {
    return this.stamina >= DEFLECT_STAMINA_COST && this.state !== PlayerState.Dead;
  }

  consumeDeflectStamina(): void {
    this.stamina = Math.max(this.stamina - DEFLECT_STAMINA_COST, 0);
  }

  penalizeEmpty(): void {
    this.stamina = Math.max(this.stamina - EMPTY_DEFLECT_PENALTY, 0);
  }

  penalizeWrongLane(): void {
    this.stamina = Math.max(this.stamina - WRONG_LANE_PENALTY, 0);
  }

  // ── Damage ─────────────────────────────────────────────────────────────────

  /**
   * Apply `amount` HP damage.
   * Returns true if the player died from this hit.
   */
  takeDamage(amount = 1): boolean {
    if (this.state === PlayerState.Dead) return false;
    this.hp = Math.max(this.hp - amount, 0);
    if (this.hp <= 0) {
      this.state = PlayerState.Dead;
      if (typeof this.sprite.setFillStyle === 'function') {
        this.sprite.setFillStyle(0x336666); // dim rectangle on death
      } else if (typeof this.sprite.setTint === 'function') {
        this.sprite.setTint(0x555555); // dim sprite on death
      }
      return true;
    }
    this.state = PlayerState.Hit;
    return false;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.hp + amount, MAX_HP);
  }

  isAlive(): boolean { return this.state !== PlayerState.Dead; }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  destroy(): void {
    this.sprite.destroy();
  }
}
