import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  UPPER_LANE_Y, LOWER_LANE_Y, GROUND_Y,
  PLAYER_X, ENEMY_AREA_X,
  MAX_HP, MAX_STAMINA, MAX_FORCE,
  DEFLECT_WINDOW_NORMAL, DEFLECT_WINDOW_PERFECT,
  BLASTER_SPEED, BLASTER_SPAWN_INTERVAL,
  FORCE_PER_NORMAL_DEFLECT, FORCE_PER_PERFECT_DEFLECT,
  COL_BG, COL_GROUND, COL_ZONE_NORMAL, COL_ZONE_PERFECT,
  COL_BATTLE_DROID,
} from '../game/constants';
import { DeflectResult, PlayerState } from '../game/types';
import type { Lane, GameSceneData } from '../game/types';
import { Player }        from '../entities/Player';
import { Blaster }       from '../entities/Blaster';
import { InputSystem }   from '../systems/InputSystem';
import { StaminaSystem } from '../systems/StaminaSystem';
import { ForceSystem }   from '../systems/ForceSystem';
import { DeflectSystem } from '../systems/DeflectSystem';
import { ScoreSystem }   from '../systems/ScoreSystem';
import { ComboSystem }   from '../systems/ComboSystem';

// ── HUD geometry ─────────────────────────────────────────────────────────────
const BAR_X   = 20;
const BAR_Y0  = 24;   // HP row
const BAR_Y1  = 60;   // Stamina row
const BAR_Y2  = 96;   // Force row
const BAR_W   = 280;
const BAR_H   = 20;
const PIP_W   = 22;
const PIP_GAP = 4;

export class CampaignScene extends Phaser.Scene {
  // ── Entities ────────────────────────────────────────────────────────────────
  protected player!:   Player;
  protected blasters:  Blaster[] = [];

  // ── Systems ─────────────────────────────────────────────────────────────────
  protected keys!:    InputSystem;
  protected stamina!: StaminaSystem;
  protected force!:   ForceSystem;
  protected deflect!: DeflectSystem;
  protected combo!:   ComboSystem;
  protected score!:   ScoreSystem;

  // ── HUD objects ──────────────────────────────────────────────────────────────
  private hudGfx!:      Phaser.GameObjects.Graphics;
  private scoreText!:   Phaser.GameObjects.Text;
  private comboText!:   Phaser.GameObjects.Text;
  private chargeText!:  Phaser.GameObjects.Text;
  private feedbackText!:Phaser.GameObjects.Text;
  private debugText!:   Phaser.GameObjects.Text;

  // ── State ───────────────────────────────────────────────────────────────────
  protected mode: 'campaign' | 'infinite' = 'campaign';
  private spawnTimer       = 0;
  protected spawnInterval  = BLASTER_SPAWN_INTERVAL;
  private feedbackMs       = 0;
  private gameActive       = false;

  constructor(sceneKey = 'CampaignScene') { super(sceneKey); }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASER LIFECYCLE
  // ════════════════════════════════════════════════════════════════════════════

  create(data: GameSceneData): void {
    this.mode = data?.mode ?? 'campaign';

    // Fresh state
    this.blasters     = [];
    this.spawnTimer   = 0;
    this.spawnInterval = BLASTER_SPAWN_INTERVAL;
    this.feedbackMs   = 0;
    this.gameActive   = true;

    // Systems
    this.combo   = new ComboSystem();
    this.score   = new ScoreSystem(this.combo);
    this.keys    = new InputSystem(this);
    this.stamina = new StaminaSystem();
    this.force   = new ForceSystem();
    this.deflect = new DeflectSystem();

    this.buildBackground();
    this.player = new Player(this);
    this.buildHUD();
  }

  update(time: number, delta: number): void {
    if (!this.gameActive) return;

    // ── Regen ──────────────────────────────────────────────────────────────────
    this.stamina.update(this.player, delta);

    // ── ESC → Main Menu ────────────────────────────────────────────────────────
    if (this.keys.escJustDown()) {
      this.scene.start('MainMenuScene');
      return;
    }

    // ── Blaster spawning ───────────────────────────────────────────────────────
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnBlaster();
    }

    // ── Clean up destroyed blasters ────────────────────────────────────────────
    this.blasters = this.blasters.filter(b => b.active);

    // ── Move blasters & hit detection ─────────────────────────────────────────
    for (const b of [...this.blasters]) {
      if (!b.active) continue;
      b.tick(delta);

      // Reflected bolt leaves screen on the right
      if (b.isReflected && b.x > GAME_WIDTH + 80) {
        b.destroy();
        continue;
      }

      // Normal bolt hits player
      if (!b.isReflected && b.x <= PLAYER_X) {
        b.destroy();
        this.onBlasterHitPlayer();
        continue;
      }
    }

    // ── Player is dead — no input processing ──────────────────────────────────
    if (this.player.state === PlayerState.Dead) {
      this.redrawHUD();
      return;
    }

    // ── Force Choke: SPACE down ────────────────────────────────────────────────
    if (this.keys.chokeJustDown()) {
      if (this.force.canStartChoke(this.player)) {
        this.force.startChoke(this.player, time);
      } else if (this.player.force < MAX_FORCE) {
        this.showFeedback('FORCE NOT FULL!', '#ff4444');
      }
    }

    // ── Force Choke: SPACE up ─────────────────────────────────────────────────
    if (this.keys.chokeJustUp()) {
      const fired = this.force.releaseChoke(this.player, time, this.blasters);
      if (fired) {
        this.blasters = this.blasters.filter(b => b.active);
        this.score.addForceChoke();
        this.showFeedback('FORCE CHOKE!', '#cc44ff');
        this.cameras.main.shake(300, 0.008);
        this.time.delayedCall(600, () => {
          if (this.player.state === PlayerState.ForceChokeRelease) {
            this.player.state = PlayerState.Idle;
          }
        });
      }
    }

    // ── Force Reflect: D key ───────────────────────────────────────────────────
    if (this.keys.reflectJustDown()) {
      if (this.force.canReflect(this.player)) {
        const reflected = this.force.doReflect(this.player, this.blasters);
        if (reflected) {
          this.player.state = PlayerState.ForceReflect;
          this.score.addForceReflect();
          this.showFeedback('FORCE REFLECT!', '#00ff99');
          this.time.delayedCall(300, () => {
            if (this.player.state === PlayerState.ForceReflect) {
              this.player.state = PlayerState.Idle;
            }
          });
        } else {
          this.showFeedback('NO TARGET!', '#ff8800');
        }
      } else {
        this.showFeedback(`NEED 25 FORCE  (${Math.floor(this.player.force)})`, '#ff4444');
      }
    }

    // ── Deflect inputs ────────────────────────────────────────────────────────
    if (this.keys.deflectJustDown('upper')) this.handleDeflect('upper');
    if (this.keys.deflectJustDown('lower')) this.handleDeflect('lower');

    // ── HUD refresh ───────────────────────────────────────────────────────────
    this.redrawHUD();
    this.updateTextElements(time);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMBAT
  // ════════════════════════════════════════════════════════════════════════════

  private handleDeflect(lane: Lane): void {
    if (!this.player.canDeflect()) {
      this.showFeedback('NO STAMINA!', '#ff4444');
      return;
    }

    const result = this.deflect.check(lane, this.blasters);

    switch (result.result) {
      case DeflectResult.Perfect: {
        this.player.consumeDeflectStamina();
        this.player.state = lane === 'upper' ? PlayerState.DeflectUpper : PlayerState.DeflectLower;
        this.combo.increment();
        this.score.addPerfectDeflect();
        this.force.addForce(this.player, FORCE_PER_PERFECT_DEFLECT);
        result.blaster!.destroy();
        this.showFeedback('PERFECT!', '#00ff88');
        this.flashLane(lane);
        this.time.delayedCall(200, () => this.clearDeflectState());
        break;
      }
      case DeflectResult.Normal: {
        this.player.consumeDeflectStamina();
        this.player.state = lane === 'upper' ? PlayerState.DeflectUpper : PlayerState.DeflectLower;
        this.combo.increment();
        this.score.addNormalDeflect();
        this.force.addForce(this.player, FORCE_PER_NORMAL_DEFLECT);
        result.blaster!.destroy();
        this.showFeedback('DEFLECT', '#00ccff');
        this.flashLane(lane);
        this.time.delayedCall(200, () => this.clearDeflectState());
        break;
      }
      case DeflectResult.WrongLane: {
        this.player.penalizeWrongLane();
        this.combo.reset();
        this.showFeedback('WRONG LANE!', '#ff8800');
        break;
      }
      case DeflectResult.Empty: {
        this.player.penalizeEmpty();
        this.combo.reset();
        this.showFeedback('MISS!', '#ff4444');
        break;
      }
    }
  }

  private clearDeflectState(): void {
    if (
      this.player.state === PlayerState.DeflectUpper ||
      this.player.state === PlayerState.DeflectLower
    ) {
      this.player.state = PlayerState.Idle;
    }
  }

  private onBlasterHitPlayer(): void {
    this.combo.reset();
    const died = this.player.takeDamage(1);
    this.cameras.main.shake(220, 0.012);
    this.showFeedback('HIT!', '#ff2222');

    if (died) {
      this.gameActive = false;
      this.time.delayedCall(700, () => {
        this.scene.start('GameOverScene', {
          score: this.score.getScore(),
          mode:  this.mode,
        });
      });
    } else {
      this.time.delayedCall(280, () => {
        if (this.player.state === PlayerState.Hit) {
          this.player.state = PlayerState.Idle;
        }
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SPAWNING
  // ════════════════════════════════════════════════════════════════════════════

  protected spawnBlaster(): void {
    const lane: Lane = Math.random() < 0.5 ? 'upper' : 'lower';
    const y          = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    const b          = new Blaster(this, GAME_WIDTH - 40, y, lane, BLASTER_SPEED);
    this.blasters.push(b);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VISUALS — background
  // ════════════════════════════════════════════════════════════════════════════

  private buildBackground(): void {
    // Sky
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COL_BG);

    // Lane guides (subtle)
    this.add.rectangle(GAME_WIDTH / 2, UPPER_LANE_Y, GAME_WIDTH, 2, 0x1a2255, 0.8);
    this.add.rectangle(GAME_WIDTH / 2, LOWER_LANE_Y, GAME_WIDTH, 2, 0x1a2255, 0.8);

    // Ground
    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y, GAME_WIDTH, 6, COL_GROUND);

    // Enemy placeholder area
    this.add.rectangle(ENEMY_AREA_X, (UPPER_LANE_Y + LOWER_LANE_Y) / 2,
      8, LOWER_LANE_Y - UPPER_LANE_Y, COL_BATTLE_DROID, 0.15);
    this.add.text(ENEMY_AREA_X, UPPER_LANE_Y - 36, 'ENEMY ZONE', {
      fontSize: '22px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ff660033',
    }).setOrigin(0.5, 1);

    // ── Deflect zone visualisation (debug) ────────────────────────────────────
    [UPPER_LANE_Y, LOWER_LANE_Y].forEach(ly => {
      // Normal window — yellow ghost
      this.add.rectangle(
        PLAYER_X + DEFLECT_WINDOW_NORMAL / 2,
        ly,
        DEFLECT_WINDOW_NORMAL,
        18,
        COL_ZONE_NORMAL,
        0.12,
      );
      // Perfect window — green ghost
      this.add.rectangle(
        PLAYER_X + DEFLECT_WINDOW_PERFECT / 2,
        ly,
        DEFLECT_WINDOW_PERFECT,
        18,
        COL_ZONE_PERFECT,
        0.25,
      );
    });

    // Mode tag
    this.add.text(GAME_WIDTH / 2, 16, this.mode.toUpperCase() + ' MODE  ·  [ESC] Menu', {
      fontSize: '24px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#334455',
    }).setOrigin(0.5, 0);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VISUALS — HUD
  // ════════════════════════════════════════════════════════════════════════════

  private buildHUD(): void {
    this.hudGfx = this.add.graphics().setDepth(20);

    const LBL: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px',
      fontFamily: '"Courier New", Courier, monospace',
    };

    this.add.text(BAR_X, BAR_Y0 - 2, 'HP',     { ...LBL, color: '#00ff88' }).setDepth(21);
    this.add.text(BAR_X, BAR_Y1 - 2, 'STAMINA', { ...LBL, color: '#ffcc00' }).setDepth(21);
    this.add.text(BAR_X, BAR_Y2 - 2, 'FORCE',   { ...LBL, color: '#8866ff' }).setDepth(21);

    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'SCORE: 0', {
      fontSize: '38px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffffff',
    }).setOrigin(1, 0).setDepth(21);

    this.comboText = this.add.text(GAME_WIDTH / 2, 70, '', {
      fontSize: '52px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffaa00',
      stroke: '#332200',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setAlpha(0).setDepth(21);

    this.chargeText = this.add.text(GAME_WIDTH / 2, 140, '', {
      fontSize: '46px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#cc44ff',
      stroke: '#220033',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setAlpha(0).setDepth(21);

    this.feedbackText = this.add.text(GAME_WIDTH / 2, UPPER_LANE_Y - 80, '', {
      fontSize: '62px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0).setDepth(22);

    this.debugText = this.add.text(20, GAME_HEIGHT - 20, '', {
      fontSize: '20px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#445566',
      backgroundColor: '#00000077',
      padding: { x: 6, y: 3 },
    }).setOrigin(0, 1).setDepth(21);
  }

  private redrawHUD(): void {
    const g = this.hudGfx;
    g.clear();

    const lx = BAR_X + 76; // bar left edge (after label)

    // HP pips
    for (let i = 0; i < MAX_HP; i++) {
      g.fillStyle(i < this.player.hp ? 0x00ff88 : 0x1a3322, 1);
      g.fillRect(lx + i * (PIP_W + PIP_GAP), BAR_Y0, PIP_W, BAR_H);
    }

    // Stamina bar
    const stW = Math.round((this.player.stamina / MAX_STAMINA) * BAR_W);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(lx, BAR_Y1, BAR_W, BAR_H);
    g.fillStyle(0xffcc00, 1);
    g.fillRect(lx, BAR_Y1, stW, BAR_H);

    // Force bar
    const frW   = Math.round((this.player.force / MAX_FORCE) * BAR_W);
    const frCol = this.player.force >= MAX_FORCE ? 0xffffff : 0x8866ff;
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(lx, BAR_Y2, BAR_W, BAR_H);
    g.fillStyle(frCol, 1);
    g.fillRect(lx, BAR_Y2, frW, BAR_H);

    // Force-full glow outline
    if (this.player.force >= MAX_FORCE) {
      g.lineStyle(2, 0xffffff, 0.6);
      g.strokeRect(lx, BAR_Y2, BAR_W, BAR_H);
    }
  }

  private updateTextElements(time: number): void {
    // Score
    this.scoreText.setText(`SCORE: ${this.score.getScore().toLocaleString()}`);

    // Combo
    const c = this.combo.getCombo();
    if (c >= 2) {
      this.comboText
        .setText(`COMBO ×${c}   [ ×${this.combo.getMultiplier()} ]`)
        .setAlpha(1);
    } else {
      this.comboText.setAlpha(0);
    }

    // Force choke charge
    if (this.force.isCharging()) {
      const pct = Math.floor(this.force.getChargeProgress(time) * 100);
      this.chargeText.setText(`⚡ CHARGING ${pct}% ⚡`).setAlpha(1);
      if (pct >= 100) this.chargeText.setColor('#ffdd00');
      else            this.chargeText.setColor('#cc44ff');
    } else {
      this.chargeText.setAlpha(0);
    }

    // Feedback fade
    if (this.feedbackMs > 0) {
      this.feedbackMs -= this.game.loop.delta;
      const alpha = Math.min(this.feedbackMs / 300, 1);
      this.feedbackText.setAlpha(alpha);
    }

    // Debug
    this.debugText.setText(
      `HP:${this.player.hp}/${MAX_HP}  ST:${Math.floor(this.player.stamina)}  FO:${Math.floor(this.player.force)}` +
      `  Bolts:${this.blasters.filter(b => b.active).length}  State:${this.player.state}`,
    );
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  protected showFeedback(text: string, color: string): void {
    this.feedbackText.setText(text).setColor(color).setAlpha(1);
    this.feedbackMs = 900;
  }

  private flashLane(lane: Lane): void {
    const y = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    const flash = this.add.rectangle(PLAYER_X + 40, y, 120, 20, 0xffffff, 0.8).setDepth(15);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 3,
      duration: 180,
      onComplete: () => flash.destroy(),
    });
  }
}
