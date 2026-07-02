import Phaser from 'phaser';
import {
  PLAYER_X, PLAYER_Y,
  MAX_HP, MAX_STAMINA,
  DEFLECT_STAMINA_COST,
  EMPTY_DEFLECT_PENALTY,
  WRONG_LANE_PENALTY,
} from '../game/constants';
import { PlayerState } from '../game/types';

// Constants for custom slow idle timing (Option B manual controller)
const IDLE_FRAME_DURATION_MS = 3500; // 3.5 seconds per frame
const IDLE_FRAME_KEYS = [
  'player_idle_01',
  'player_idle_02',
  'player_idle_03',
  'player_idle_04'
];

export class Player {
  // ── Stats ──────────────────────────────────────────────────────────────────
  hp:      number = MAX_HP;
  stamina: number = MAX_STAMINA;
  force:   number = 0;
  state:   PlayerState = PlayerState.Idle;

  // ── Visual ─────────────────────────────────────────────────────────────────
  readonly sprite: any;

  // ── Manual Idle Frame Controller variables ─────────────────────────────────
  private idleFrameTimer = 0;
  private currentIdleFrameIndex = 0;

  constructor(scene: Phaser.Scene) {
    const hasIdleFrames = 
      scene.textures.exists('player_idle_01') &&
      scene.textures.exists('player_idle_02') &&
      scene.textures.exists('player_idle_03') &&
      scene.textures.exists('player_idle_04');

    const hasStaticSprite = scene.textures.exists('player_idle') &&
      scene.textures.get('player_idle').get(0).realWidth > 2;

    if (hasIdleFrames) {
      // 1. Processed frames exist — use the first frame by default, manual frame control
      const spriteObj = scene.add.sprite(PLAYER_X, 860, 'player_idle_01')
        .setOrigin(0.5, 1)
        .setDepth(10);

      // Scale player sprite to height of ~360px (preserve aspect ratio)
      const targetHeight = 360;
      const scale = targetHeight / spriteObj.height;
      spriteObj.setScale(scale);
      spriteObj.setFlipX(false);

      this.sprite = spriteObj;
      console.log('[Player] Created sprite using processed frames (manual slow control).');
    } else if (hasStaticSprite) {
      // 2. Fallback to static player_idle image
      const spriteObj = scene.add.sprite(PLAYER_X, 860, 'player_idle')
        .setOrigin(0.5, 1)
        .setDepth(10);

      const targetHeight = 360;
      const scale = targetHeight / spriteObj.height;
      spriteObj.setScale(scale);
      spriteObj.setFlipX(false);

      this.sprite = spriteObj;
      console.log('[Player] Created static player sprite.');
    } else {
      // 3. Fallback to rectangle placeholder
      this.sprite = scene.add
        .rectangle(PLAYER_X, PLAYER_Y, 52, 130, 0x00ccff)
        .setDepth(10);
      console.log('[Player] Created rectangle placeholder.');
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
        if (typeof this.sprite.stop === 'function') {
          this.sprite.stop(); // stop animations/tweens on death
        }
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

  // ── Lifecycle & Update ─────────────────────────────────────────────────────

  /**
   * Called every frame from the active game scene update loop.
   * Handles custom slow frame switching (3500ms duration per frame)
   * while the player is in PlayerState.Idle.
   */
  update(time: number, deltaMs: number): void {
    if (this.state === PlayerState.Dead) {
      return;
    }

    const scene = this.sprite.scene;
    const hasIdleFrames = 
      scene.textures.exists('player_idle_01') &&
      scene.textures.exists('player_idle_02') &&
      scene.textures.exists('player_idle_03') &&
      scene.textures.exists('player_idle_04');

    // Return early if processed frames are not loaded or if using rectangle fallback
    if (!hasIdleFrames || typeof this.sprite.setTexture !== 'function') {
      return;
    }

    if (this.state === PlayerState.Idle) {
      this.idleFrameTimer += deltaMs;
      if (this.idleFrameTimer >= IDLE_FRAME_DURATION_MS) {
        this.idleFrameTimer = 0;
        this.currentIdleFrameIndex = (this.currentIdleFrameIndex + 1) % IDLE_FRAME_KEYS.length;
        
        const nextFrame = IDLE_FRAME_KEYS[this.currentIdleFrameIndex];
        this.sprite.setTexture(nextFrame);
      }
    } else {
      // Action state active: reset timer and stay on frame 1 (default standing pose)
      // This ensures action states are not overwritten by background idle switching.
      if (this.currentIdleFrameIndex !== 0) {
        this.currentIdleFrameIndex = 0;
        this.sprite.setTexture('player_idle_01');
      }
      this.idleFrameTimer = 0;
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
