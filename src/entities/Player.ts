import Phaser from 'phaser';
import {
  PLAYER_X, PLAYER_Y,
  MAX_HP, MAX_STAMINA,
  DEFLECT_STAMINA_COST,
  EMPTY_DEFLECT_PENALTY,
  WRONG_LANE_PENALTY,
} from '../game/constants';
import { PlayerState } from '../game/types';

// Constants for custom slow idle timing (Option B manual controller with custom durations)
interface IdleFrameConfig {
  key: string;
  duration: number;
}

const IDLE_SEQUENCE: IdleFrameConfig[] = [
  { key: 'player_idle_01', duration: 3000 },
  { key: 'player_idle_02', duration: 3000 },
  { key: 'player_idle_03', duration: 2000 },
  { key: 'player_idle_04', duration: 3000 },
  { key: 'player_idle_03', duration: 2000 },
  { key: 'player_idle_02', duration: 3000 },
  { key: 'player_idle_01', duration: 3000 },
];

// Constants for custom deflect up animation timing (Option B manual controller)
// Reference Pattern: See docs/PLAYER_ANIMATION_RULEBOOK.md for full specs
interface DeflectUpFrameConfig {
  key: string;
  duration: number;
  activeDeflect?: boolean;
  chainExit?: boolean;
}

const DEFLECT_UP_SEQUENCE: DeflectUpFrameConfig[] = [
  { key: 'player_deflect_up_01', duration: 35 },
  { key: 'player_deflect_up_02', duration: 45 },
  { key: 'player_deflect_up_03', duration: 50 },
  { key: 'player_deflect_up_04', duration: 55 },
  { key: 'player_deflect_up_05', duration: 420, activeDeflect: true },
  { key: 'player_deflect_up_06', duration: 65 },
  { key: 'player_deflect_up_07', duration: 60, chainExit: true },
  { key: 'player_deflect_up_08', duration: 50 },
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

  // ── Manual Deflect Up Frame Controller variables ───────────────────────────
  private activeAnimationSequence: DeflectUpFrameConfig[] | null = null;
  private currentAnimFrameIndex = 0;
  private animTimer = 0;
  private onActiveDeflectTriggerCallback: (() => void) | null = null;
  private onDeflectCompleteCallback: (() => void) | null = null;

  // ── Input Buffering System variables ───────────────────────────────────────
  public bufferedAction: string | null = null;
  public onChainExitCallback: ((actionId: string) => boolean) | null = null;

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
      console.log('[Player] Created sprite using processed frames (manual slow control with custom sequence).');
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

  // ── Deflect Up Helpers ─────────────────────────────────────────────────────

  /** Check if all 8 processed transparent deflect up textures are successfully loaded. */
  hasDeflectUpFrames(scene: Phaser.Scene): boolean {
    return (
      scene.textures.exists('player_deflect_up_01') &&
      scene.textures.exists('player_deflect_up_02') &&
      scene.textures.exists('player_deflect_up_03') &&
      scene.textures.exists('player_deflect_up_04') &&
      scene.textures.exists('player_deflect_up_05') &&
      scene.textures.exists('player_deflect_up_06') &&
      scene.textures.exists('player_deflect_up_07') &&
      scene.textures.exists('player_deflect_up_08')
    );
  }

  /** Trigger upward deflect animation, pausing idle sequence and executing callbacks on sync moments. */
  playDeflectUp(onActiveDeflect: () => void, onComplete: () => void): void {
    const scene = this.sprite.scene;
    if (!this.hasDeflectUpFrames(scene)) {
      console.warn('[Player] Using fallback because deflect up textures are missing');
      onActiveDeflect();
      onComplete();
      return;
    }

    this.state = PlayerState.DeflectUpper;
    this.activeAnimationSequence = DEFLECT_UP_SEQUENCE;
    this.currentAnimFrameIndex = 0;
    this.animTimer = 0;
    this.onActiveDeflectTriggerCallback = onActiveDeflect;
    this.onDeflectCompleteCallback = onComplete;

    // Instantly set texture to frame 01
    const frameConfig = this.activeAnimationSequence[0];
    this.sprite.setTexture(frameConfig.key);
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
      this.activeAnimationSequence = null; // cancel active animation
      this.clearBufferedAction();
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
    this.activeAnimationSequence = null; // hit overrides animation
    this.clearBufferedAction();
    return false;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.hp + amount, MAX_HP);
  }

  isAlive(): boolean { return this.state !== PlayerState.Dead; }

  // ── Lifecycle & Update ─────────────────────────────────────────────────────

  /**
   * Called every frame from the active game scene update loop.
   * Handles custom slow ping-pong frame switching while the player is in PlayerState.Idle,
   * or ticks the active upward deflect animation if one is playing.
   */
  update(time: number, deltaMs: number): void {
    if (this.state === PlayerState.Dead) {
      return;
    }

    const scene = this.sprite.scene;

    // ── 1. Deflect Animation Active (Option B manual timer tick) ─────────────
    if (this.activeAnimationSequence) {
      this.animTimer += deltaMs;
      const currentFrameConfig = this.activeAnimationSequence[this.currentAnimFrameIndex];

      if (this.animTimer >= currentFrameConfig.duration) {
        this.animTimer = 0;

        // ── 1.1 Action Buffering chain exit check ────────────────────────────
        if (currentFrameConfig.chainExit && this.bufferedAction) {
          const nextAction = this.bufferedAction;
          console.log(`[Player] Chain exit frame reached. Attempting to chain into: ${nextAction}`);
          
          if (this.onChainExitCallback) {
            this.bufferedAction = null;
            const chainSuccess = this.onChainExitCallback(nextAction);
            if (chainSuccess) {
              // The scene callback successfully initiated a new animation sequence (like deflect_up).
              // We return instantly since the activeAnimationSequence was reset for the new action.
              return;
            }
          }
        }

        // ── 1.2 Proceed to next animation frame ──────────────────────────────
        this.currentAnimFrameIndex++;

        if (this.currentAnimFrameIndex >= this.activeAnimationSequence.length) {
          // Animation cycle complete
          this.activeAnimationSequence = null;
          const completeCb = this.onDeflectCompleteCallback;
          this.onActiveDeflectTriggerCallback = null;
          this.onDeflectCompleteCallback = null;

          // Return to Idle state and base frame
          this.state = PlayerState.Idle;
          this.idleFrameTimer = 0;
          this.currentIdleFrameIndex = 0;
          
          if (this.hasIdleFramesLoaded(scene)) {
            this.sprite.setTexture('player_idle_01');
          }

          if (completeCb) completeCb();
        } else {
          // Switch to next animation frame texture
          const nextFrameConfig = this.activeAnimationSequence[this.currentAnimFrameIndex];
          this.sprite.setTexture(nextFrameConfig.key);

          // Log active collision frame and execute deflect checks
          if (nextFrameConfig.activeDeflect) {
            console.log(`[Player] Deflect up active frame reached: ${nextFrameConfig.key}`);
            if (this.onActiveDeflectTriggerCallback) {
              this.onActiveDeflectTriggerCallback();
              // Prevent double trigger checks
              this.onActiveDeflectTriggerCallback = null;
            }
          }
        }
      }
      return; // Do not switch idle frames while deflect animation is active
    }

    // ── 2. Idle Animation Active (Slow custom breathing loop) ───────────────
    const hasIdleFrames = this.hasIdleFramesLoaded(scene);
    if (!hasIdleFrames || typeof this.sprite.setTexture !== 'function') {
      return;
    }

    if (this.state === PlayerState.Idle) {
      this.idleFrameTimer += deltaMs;
      
      const currentFrameConfig = IDLE_SEQUENCE[this.currentIdleFrameIndex];
      
      if (this.idleFrameTimer >= currentFrameConfig.duration) {
        this.idleFrameTimer = 0;
        this.currentIdleFrameIndex = (this.currentIdleFrameIndex + 1) % IDLE_SEQUENCE.length;
        
        const nextFrameConfig = IDLE_SEQUENCE[this.currentIdleFrameIndex];
        this.sprite.setTexture(nextFrameConfig.key);
      }
    } else {
      // Non-idle, non-animating state (like hit or block other lane): lock to frame 1
      if (this.currentIdleFrameIndex !== 0) {
        this.currentIdleFrameIndex = 0;
        this.sprite.setTexture('player_idle_01');
      }
      this.idleFrameTimer = 0;
    }
  }

  private hasIdleFramesLoaded(scene: Phaser.Scene): boolean {
    return (
      scene.textures.exists('player_idle_01') &&
      scene.textures.exists('player_idle_02') &&
      scene.textures.exists('player_idle_03') &&
      scene.textures.exists('player_idle_04')
    );
  }

  // ── PlayerAnimationController Interface Methods ────────────────────────────

  /** Force transition back to the slow idle loop, canceling any active actions. */
  playIdle(): void {
    if (this.state === PlayerState.Dead) return;
    this.state = PlayerState.Idle;
    this.activeAnimationSequence = null;
    this.onActiveDeflectTriggerCallback = null;
    this.onDeflectCompleteCallback = null;
    this.clearBufferedAction();
    this.idleFrameTimer = 0;
    this.currentIdleFrameIndex = 0;
    
    const scene = this.sprite.scene;
    if (this.hasIdleFramesLoaded(scene)) {
      this.sprite.setTexture('player_idle_01');
    }
  }

  /**
   * Play an action animation by its string ID.
   * Returns true if the action is available and successfully started.
   */
  playAction(animationId: string, onActiveFrame?: () => void, onComplete?: () => void): boolean {
    if (this.state === PlayerState.Dead) return false;

    if (animationId === 'deflect_up') {
      this.playDeflectUp(onActiveFrame || (() => {}), onComplete || (() => {}));
      return true;
    }
    
    // Future action animations (deflect_down, reflect, force, etc.) can be hooked here.
    return false;
  }

  /** Set bufferedAction to queue the next player input. */
  queueAction(actionId: string): void {
    if (['deflect_up', 'deflect_down', 'reflect', 'force'].includes(actionId)) {
      this.bufferedAction = actionId;
      console.log(`[Player] Action buffered: ${actionId}`);
    }
  }

  /** Returns and clears the bufferedAction queue. */
  consumeBufferedAction(): string | null {
    const act = this.bufferedAction;
    this.bufferedAction = null;
    return act;
  }

  /** Resets the buffered action. */
  clearBufferedAction(): void {
    this.bufferedAction = null;
  }

  /** Returns true if an action animation sequence is currently ticking. */
  isActionPlaying(): boolean {
    return this.activeAnimationSequence !== null;
  }

  /** Returns the ID of the active action animation ('idle', 'deflect_up', etc.) */
  getCurrentAction(): string {
    if (this.state === PlayerState.Dead) return 'dead';
    if (this.activeAnimationSequence === DEFLECT_UP_SEQUENCE) return 'deflect_up';
    return 'idle';
  }

  /** Returns the texture key of the currently visible frame. */
  getCurrentFrameKey(): string {
    if (this.activeAnimationSequence) {
      return this.activeAnimationSequence[this.currentAnimFrameIndex].key;
    }
    const scene = this.sprite.scene;
    if (this.hasIdleFramesLoaded(scene)) {
      return IDLE_SEQUENCE[this.currentIdleFrameIndex].key;
    }
    return 'player_idle';
  }

  /** Returns the current active frame index. */
  getCurrentFrameIndex(): number {
    if (this.activeAnimationSequence) {
      return this.currentAnimFrameIndex;
    }
    return this.currentIdleFrameIndex;
  }

  /** Returns true if the active animation is currently in its activeDeflect window (frame 05). */
  isCurrentFrameActiveDeflect(): boolean {
    if (this.activeAnimationSequence) {
      return !!this.activeAnimationSequence[this.currentAnimFrameIndex].activeDeflect;
    }
    return false;
  }

  /** Returns true if the active animation is currently on its chain exit frame (frame 07). */
  isCurrentFrameChainExit(): boolean {
    if (this.activeAnimationSequence) {
      return !!this.activeAnimationSequence[this.currentAnimFrameIndex].chainExit;
    }
    return false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
