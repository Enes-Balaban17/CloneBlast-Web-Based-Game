import Phaser from 'phaser';
import {
  BOSS_HP, BOSS_HOME_X, BOSS_Y,
  BOSS_CHARGE_PREPARE_MS, BOSS_CHARGE_SPEED,
  BOSS_SLASH_X, BOSS_SLASH_MS,
  BOSS_RETURN_SPEED, BOSS_STAGGER_MS,
  BOSS_IDLE_INTERVAL_MS, BOSS_FORCE_DAMAGE,
  SCORE_KILL_BOSS,
  PLAYER_X, COL_CYBORG_BOSS,
  GAME_WIDTH,
} from '../game/constants';
import { BossState, EnemyState } from '../game/types';
import type { Blaster } from './Blaster';
import { Enemy } from './Enemy';

/**
 * CyborgBoss — Stage 7 antagonist.
 *
 * Immune to blasters (normal and reflected). Only Force abilities deal damage.
 * Deflects incoming reflected blasters automatically.
 *
 * Behaviour loop:
 *   idle (BOSS_IDLE_INTERVAL_MS) → charge_prepare → charge_dash → saber_slash
 *   → back_jump_return → idle → …
 *
 * On Force hit: force_hit → stagger → resume or defeated.
 */
export class CyborgBoss extends Enemy {
  readonly killScore         = SCORE_KILL_BOSS;
  // Boss is immune to reflected blasters — only Force deals damage
  override get canBeHitByReflected(): boolean { return false; }

  bossState: BossState       = BossState.Idle;
  private bossHp             = BOSS_HP;

  private idleTimer          = 0;
  private staggerTimer       = 0;
  private slashTimer         = 0;
  slashActive                = false;  // public: CampaignScene reads this

  /** Callback invoked when the boss's saber slash hits the player. */
  onSlashHitPlayer?: () => void;

  /** HP label text */
  private hpText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    // Spawn off-screen right, slide to BOSS_HOME_X
    super(
      scene,
      GAME_WIDTH + 80, BOSS_Y,
      BOSS_HOME_X, 'upper',       // lane is conceptually 'upper' for deflect targeting
      1,                           // Enemy base hp unused for boss; we track bossHp
      130, 150,
      COL_CYBORG_BOSS,
    );
    this.hp = 9999; // prevent base takeDamage from killing boss

    // HP counter
    this.hpText = scene.add.text(BOSS_HOME_X, BOSS_Y - 100, `BOSS HP: ${this.bossHp}`, {
      fontSize: '28px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ff44ff',
    }).setOrigin(0.5).setDepth(25);
  }

  // ── Main tick ──────────────────────────────────────────────────────────────

  tick(deltaMs: number, _addBlaster: (b: Blaster) => void): void {
    if (this.bossState === BossState.Defeated) return;

    // Slide in first
    if (!this.tickEntering(deltaMs)) return;

    // Sync HP text
    this.hpText.setPosition(this.sprite.x, this.sprite.y - 100);

    switch (this.bossState) {
      case BossState.Idle:          this.tickIdle(deltaMs);    break;
      case BossState.ChargePrepare: this.tickPrepare(deltaMs); break;
      case BossState.ChargeDash:    this.tickDash(deltaMs);    break;
      case BossState.SaberSlash:    this.tickSlash(deltaMs);   break;
      case BossState.BackJumpReturn:this.tickReturn(deltaMs);  break;
      case BossState.Stagger:       this.tickStagger(deltaMs); break;
      default: break;
    }
  }

  // ── State handlers ─────────────────────────────────────────────────────────

  private tickIdle(deltaMs: number): void {
    this.idleTimer += deltaMs;
    if (this.idleTimer >= BOSS_IDLE_INTERVAL_MS) {
      this.idleTimer = 0;
      this.beginCharge();
    }
  }

  private beginCharge(): void {
    this.bossState = BossState.ChargePrepare;
    this.sprite.setFillStyle(0xff00ff, 1); // glow up
    this.scene.time.delayedCall(BOSS_CHARGE_PREPARE_MS, () => {
      if (this.bossState === BossState.ChargePrepare) {
        this.bossState = BossState.ChargeDash;
      }
    });
  }

  private tickPrepare(_deltaMs: number): void {
    // Visual throb handled via color set in beginCharge; no movement.
  }

  private tickDash(deltaMs: number): void {
    // Rush toward player
    const dx = (BOSS_CHARGE_SPEED * deltaMs) / 1000;
    this.sprite.x -= dx;

    if (this.sprite.x <= BOSS_SLASH_X) {
      this.sprite.x   = BOSS_SLASH_X;
      this.bossState  = BossState.SaberSlash;
      this.slashTimer = 0;
      this.slashActive = true;
      this.sprite.setFillStyle(0xffffff, 1); // white flash on slash
    }
  }

  private tickSlash(deltaMs: number): void {
    this.slashTimer += deltaMs;
    if (this.slashActive && this.slashTimer >= BOSS_SLASH_MS) {
      // Slash window closes — if player didn't deflect, they take a hit
      // (CampaignScene checks slashActive each frame and calls onSlashHitPlayer)
      this.slashActive = false;
    }
    if (this.slashTimer >= BOSS_SLASH_MS + 200) {
      this.beginReturn();
    }
  }

  private beginReturn(): void {
    this.bossState = BossState.BackJumpReturn;
    this.sprite.setFillStyle(COL_CYBORG_BOSS, 1);
  }

  private tickReturn(deltaMs: number): void {
    const dx = (BOSS_RETURN_SPEED * deltaMs) / 1000;
    this.sprite.x += dx;
    if (this.sprite.x >= BOSS_HOME_X) {
      this.sprite.x = BOSS_HOME_X;
      this.bossState = BossState.Idle;
      this.idleTimer = 0;
    }
  }

  private tickStagger(deltaMs: number): void {
    this.staggerTimer += deltaMs;
    if (this.staggerTimer >= BOSS_STAGGER_MS) {
      this.staggerTimer = 0;
      if (this.bossHp <= 0) {
        this.defeat();
      } else {
        this.bossState = BossState.Idle;
        this.idleTimer = 0;
        this.sprite.setFillStyle(COL_CYBORG_BOSS, 1);
      }
    }
  }

  // ── Force damage ──────────────────────────────────────────────────────────

  /**
   * Called by CampaignScene when Force Choke fires.
   * Returns true if boss is defeated.
   */
  receiveForceHit(): boolean {
    if (
      this.bossState === BossState.Defeated ||
      this.bossState === BossState.Stagger  ||
      this.bossState === BossState.ForceHit
    ) return false;

    this.bossHp    -= BOSS_FORCE_DAMAGE;
    this.bossState  = BossState.ForceHit;
    this.sprite.setFillStyle(0x0000ff, 1); // blue flash

    this.hpText.setText(`BOSS HP: ${Math.max(this.bossHp, 0)}`);

    this.scene.time.delayedCall(400, () => {
      if (this.bossState === BossState.ForceHit) {
        this.bossState  = BossState.Stagger;
        this.staggerTimer = 0;
        this.sprite.setFillStyle(0x441144, 1);
      }
    });

    return this.bossHp <= 0;
  }

  // ── Deflect incoming reflected blasters ──────────────────────────────────

  /**
   * If a reflected blaster reaches the boss, boss deflects it (destroys bolt, no damage).
   * Call once per frame from CampaignScene.
   */
  tryDeflectBlasters(blasters: Blaster[]): void {
    if (this.bossState === BossState.Defeated) return;
    for (const b of blasters) {
      if (!b.active || !b.isReflected) continue;
      if (this.overlapsBlaster(b)) {
        b.destroy();
        // Brief deflect visual
        this.bossState = BossState.Deflect;
        this.sprite.setFillStyle(0xff8800, 1);
        this.scene.time.delayedCall(250, () => {
          if (this.bossState === BossState.Deflect) {
            this.bossState = BossState.Idle;
            this.sprite.setFillStyle(COL_CYBORG_BOSS, 1);
          }
        });
      }
    }
  }

  // ── Victory ───────────────────────────────────────────────────────────────

  private defeat(): void {
    this.bossState = BossState.Defeated;
    this.state     = EnemyState.Dying;
    this.hpText.setText('DEFEATED!').setColor('#ffdd00');
    this.scene.cameras.main.shake(500, 0.015);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 3,
      scaleY: 0.05,
      duration: 600,
      onComplete: () => {
        this.state = EnemyState.Dead;
        this.sprite.destroy();
        this.scene.time.delayedCall(800, () => this.hpText.destroy());
      },
    });
  }

  destroy(): void {
    if (this.hpText.active) this.hpText.destroy();
    super.destroy();
  }
}
