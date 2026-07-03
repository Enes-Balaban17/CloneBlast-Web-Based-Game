import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  UPPER_LANE_Y, LOWER_LANE_Y, GROUND_Y,
  PLAYER_X, PLAYER_Y,
  MAX_HP, MAX_STAMINA, MAX_FORCE,
  DEFLECT_WINDOW_NORMAL, DEFLECT_WINDOW_PERFECT,
  BLASTER_SPAWN_INTERVAL,
  FORCE_PER_NORMAL_DEFLECT, FORCE_PER_PERFECT_DEFLECT,
  BOSS_FORCE_DAMAGE,
  COL_BG, COL_GROUND, COL_ZONE_NORMAL, COL_ZONE_PERFECT,
  SCORE_STAGE_CLEAR,
} from '../game/constants';
import { DeflectResult, PlayerState, BossState } from '../game/types';
import type { Lane, GameSceneData } from '../game/types';

import { Player }        from '../entities/Player';
import { Blaster }       from '../entities/Blaster';
import type { Enemy }    from '../entities/Enemy';

import { InputSystem }   from '../systems/InputSystem';
import { StaminaSystem } from '../systems/StaminaSystem';
import { ForceSystem }   from '../systems/ForceSystem';
import { DeflectSystem } from '../systems/DeflectSystem';
import { ScoreSystem }   from '../systems/ScoreSystem';
import { ComboSystem }   from '../systems/ComboSystem';
import { StageSystem }   from '../systems/StageSystem';
import { WaveSystem }    from '../systems/WaveSystem';
import { hideMenuGifBackground } from '../ui/MenuGifBackground';
import { showGameplayGifBackground, hideGameplayGifBackground } from '../ui/GameplayGifBackground';

// ── HUD constants ─────────────────────────────────────────────────────────────
const BAR_X   = 20;
const BAR_Y0  = 24;
const BAR_Y1  = 60;
const BAR_Y2  = 96;
const BAR_W   = 280;
const BAR_H   = 20;
const PIP_W   = 22;
const PIP_GAP = 4;

export class CampaignScene extends Phaser.Scene {
  // ── Entities ────────────────────────────────────────────────────────────────
  protected player!:  Player;
  protected blasters: Blaster[] = [];

  // ── Systems ─────────────────────────────────────────────────────────────────
  protected keys!:    InputSystem;
  protected stamina!: StaminaSystem;
  protected force!:   ForceSystem;
  protected deflect!: DeflectSystem;
  protected combo!:   ComboSystem;
  protected score!:   ScoreSystem;
  protected stages!:  StageSystem;
  protected waves!:   WaveSystem;

  // ── HUD ──────────────────────────────────────────────────────────────────────
  private hudGfx!:       Phaser.GameObjects.Graphics;
  private scoreText!:    Phaser.GameObjects.Text;
  private comboText!:    Phaser.GameObjects.Text;
  private chargeText!:   Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private stageText!:    Phaser.GameObjects.Text;
  private debugText!:    Phaser.GameObjects.Text;

  // ── State ───────────────────────────────────────────────────────────────────
  protected mode: 'campaign' | 'infinite' = 'campaign';
  protected spawnInterval  = BLASTER_SPAWN_INTERVAL;
  private   spawnTimer     = 0;
  private   feedbackMs     = 0;
  protected gameActive     = false;
  private   stageClearPending = false;

  constructor(sceneKey = 'CampaignScene') { super(sceneKey); }

  // ════════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════════════════════

  create(data: GameSceneData): void {
    hideMenuGifBackground(); // ensure GIF layer is hidden before gameplay
    showGameplayGifBackground(); // show gameplay background GIF

    // Listen for scene shutdown/destroy to hide the gameplay GIF
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, hideGameplayGifBackground, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, hideGameplayGifBackground, this);

    this.mode            = data?.mode ?? 'campaign';
    this.blasters        = [];
    this.spawnTimer      = 0;
    this.feedbackMs      = 0;
    this.gameActive      = true;
    this.stageClearPending = false;

    // Systems
    this.combo   = new ComboSystem();
    this.score   = new ScoreSystem(this.combo);
    this.keys    = new InputSystem(this);
    this.stamina = new StaminaSystem();
    this.force   = new ForceSystem();
    this.deflect = new DeflectSystem();

    if (this.mode === 'campaign') {
      this.stages = new StageSystem(
        this,
        (stageDef) => {
          // On stage clear: award score bonus, show message
          this.score.addStageClear();
          const msg = stageDef.isBossStage
            ? '★ CAMPAIGN COMPLETE! ★'
            : `★ STAGE ${stageDef.stageNumber} CLEAR! ★`;
          this.showFeedback(msg, '#ffdd00');
        },
        () => this.endGame(true),
      );

      this.waves = new WaveSystem(
        this,
        BLASTER_SPAWN_INTERVAL,          // base — StageSystem overrides via boltSpeed
        BLASTER_SPAWN_INTERVAL,
        (b) => this.blasters.push(b),
        (e) => this.onEnemyKilled(e),
      );
    }

    this.buildBackground();
    this.player = new Player(this);

    // Register action animation chaining handler
    this.player.onChainExitCallback = (actionId: string): boolean => {
      if (actionId === 'deflect_up') {
        this.handleDeflect('upper');
        return this.player.isActionPlaying();
      }
      if (actionId === 'deflect_down') {
        this.handleDeflect('lower');
        return this.player.isActionPlaying();
      }
      if (actionId === 'reflect') {
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
            return true;
          }
        }
        return false;
      }
      if (actionId === 'force') {
        if (this.force.canStartChoke(this.player)) {
          this.force.startChoke(this.player, this.time.now);
          return true;
        }
        this.showFeedback('FORCE NOT FULL!', '#ff4444');
        return false;
      }
      return false;
    };

    // Restore carry-over score / force (between stages)
    if (data?.carryScore) this.score['score'] = data.carryScore;
    if (data?.carryForce) this.player.force = Math.min(data.carryForce, MAX_FORCE);

    this.buildHUD();

    // Campaign: load first or resumed stage
    if (this.mode === 'campaign') {
      const stageNum = data?.stage ?? 1;
      this.stages.currentStageIndex = Math.max(0, stageNum - 1);
      this.spawnInterval = this.stages.spawnInterval;
      this.loadCurrentStage();
    }
  }

  update(time: number, delta: number): void {
    if (!this.gameActive) return;

    // Passive stamina regen
    this.stamina.update(this.player, delta);
    this.player.update(time, delta);

    // ESC → Main Menu
    if (this.keys.escJustDown()) {
      this.scene.start('MainMenuScene');
      return;
    }

    // ── Campaign: tick wave system ─────────────────────────────────────────────
    if (this.mode === 'campaign' && this.waves) {
      this.waves.update(delta);

      // Check boss slash threat each frame
      const boss = this.waves.getBoss();
      if (boss) {
        boss.tryDeflectBlasters(this.blasters);
        boss.onSlashHitPlayer = () => this.onBlasterHitPlayer();

        if (boss.slashActive && boss.bossState === BossState.SaberSlash) {
          // If player doesn't deflect (no deflect input), they take damage
          // Damage is applied once per slash cycle by the boss callback above
        }
      }

      // Stage clear check (only once)
      if (!this.stageClearPending && this.waves.isStageComplete()) {
        this.stageClearPending = true;
        this.stages.stageClear((amount, max) => this.player.heal(amount));
        // After delay, reload next stage (handled via StageSystem timer)
        this.time.delayedCall(2200, () => {
          if (this.gameActive) {
            this.stageClearPending = false;
            this.loadCurrentStage();
          }
        });
      }
    }

    // ── Blaster spawning (infinite or campaign's own timer) ──────────────────
    // In campaign, enemies spawn their own bolts; we still run a fallback timer
    // only in infinite mode or when there are no enemies.
    const enemyCount = this.mode === 'campaign' && this.waves
      ? this.waves.getEnemies().length
      : 0;

    if (this.mode === 'infinite' || (this.mode === 'campaign' && enemyCount === 0)) {
      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnBlaster();
      }
    }

    // ── Clean up & move blasters ──────────────────────────────────────────────
    this.blasters = this.blasters.filter(b => b.active);
    for (const b of [...this.blasters]) {
      if (!b.active) continue;
      b.tick(delta);

      if (b.isReflected) {
        // Check if reflected bolt hits a normal enemy
        if (this.mode === 'campaign' && this.waves) {
          for (const e of this.waves.getEnemies()) {
            if (e.canBeHitByReflected && e.overlapsBlaster(b)) {
              b.destroy();
              const died = e.takeDamage(1);
              if (died) {/* kill handled by WaveSystem */ }
              break;
            }
          }
        }
        if (b.active && b.x > GAME_WIDTH + 80) b.destroy();
      } else {
        if (b.x <= PLAYER_X && !(b as any).pendingDeflect) {
          b.destroy();
          this.onBlasterHitPlayer();
        }
      }
    }

    // ── Dead player ───────────────────────────────────────────────────────────
    if (this.player.state === PlayerState.Dead) {
      this.redrawHUD();
      return;
    }

    // ── Input Buffering Queueing when animating ──────────────────────────────
    if (this.player.isActionPlaying()) {
      if (this.keys.deflectJustDown('upper')) {
        this.player.queueAction('deflect_up');
      }
      if (this.keys.deflectJustDown('lower')) {
        this.player.queueAction('deflect_down');
      }
      if (this.keys.reflectJustDown()) {
        this.player.queueAction('reflect');
      }
      if (this.keys.chokeJustDown()) {
        this.player.queueAction('force');
      }
    } else {
      // ── Force Choke (SPACE hold/release) ────────────────────────────────────
      if (this.keys.chokeJustDown()) {
        if (this.force.canStartChoke(this.player)) {
          this.force.startChoke(this.player, time);
        } else {
          this.showFeedback('FORCE NOT FULL!', '#ff4444');
        }
      }

      if (this.keys.chokeJustUp()) {
        const fired = this.force.releaseChoke(this.player, time, this.blasters);
        if (fired) {
          this.blasters = this.blasters.filter(b => b.active);
          this.score.addForceChoke();
          this.showFeedback('FORCE CHOKE!', '#cc44ff');
          this.cameras.main.shake(300, 0.008);

          // Damage normal enemies with Force
          if (this.mode === 'campaign' && this.waves) {
            this.waves.applyForceDamage(2);
          }

          // Boss: Force Choke hits it
          const boss = this.mode === 'campaign' && this.waves ? this.waves.getBoss() : null;
          if (boss) {
            const defeated = boss.receiveForceHit();
            if (defeated) {
              this.showFeedback('BOSS DEFEATED!', '#ffdd00');
            }
          }

          this.spawnForceShockwave();
          this.time.delayedCall(600, () => {
            if (this.player.state === PlayerState.ForceChokeRelease) {
              this.player.state = PlayerState.Idle;
            }
          });
        }
      }

      // ── Force Reflect (D key) ────────────────────────────────────────────────
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
          this.showFeedback(`NEED 25 FORCE (${Math.floor(this.player.force)})`, '#ff4444');
        }
      }

      // ── Deflect inputs ──────────────────────────────────────────────────────
      if (this.keys.deflectJustDown('upper')) this.handleDeflect('upper');
      if (this.keys.deflectJustDown('lower')) this.handleDeflect('lower');
    }

    // ── HUD ───────────────────────────────────────────────────────────────────
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

    if (lane === 'upper' && this.player.hasDeflectUpFrames(this)) {
      // ── Deflect Up with 8-frame Animation ──────────────────────────────────
      this.player.consumeDeflectStamina();

      // Perform the check instantly at t=0
      const checkResult = this.deflect.check(lane, this.blasters);
      const blasterToDeflect = checkResult.blaster;

      if (blasterToDeflect) {
        // Prevent the blaster from hitting the player while animation plays
        (blasterToDeflect as any).pendingDeflect = true;
      }

      // Play deflect up animation
      this.player.playDeflectUp(
        // onActiveDeflect callback (fires at frame 05)
        () => {
          if (checkResult.result === DeflectResult.Perfect) {
            this.combo.increment();
            this.score.addPerfectDeflect();
            this.force.addForce(this.player, FORCE_PER_PERFECT_DEFLECT);
            if (blasterToDeflect) blasterToDeflect.destroy();
            this.showFeedback('PERFECT!', '#00ff88');
            this.flashLane(lane);
          } else if (checkResult.result === DeflectResult.Normal) {
            this.combo.increment();
            this.score.addNormalDeflect();
            this.force.addForce(this.player, FORCE_PER_NORMAL_DEFLECT);
            if (blasterToDeflect) blasterToDeflect.destroy();
            this.showFeedback('DEFLECT', '#00ccff');
            this.flashLane(lane);
          }
        },
        // onComplete callback (fires after frame 08)
        () => {
          this.clearDeflectState();
        }
      );

      // Apply penalties instantly if WrongLane or Empty
      if (checkResult.result === DeflectResult.WrongLane) {
        this.player.penalizeWrongLane();
        this.combo.reset();
        this.showFeedback('WRONG LANE!', '#ff8800');
      } else if (checkResult.result === DeflectResult.Empty) {
        this.player.penalizeEmpty();
        this.combo.reset();
        this.showFeedback('MISS!', '#ff4444');
      }

    } else {
      // ── Standard Fallback Deflect (instantly registers) ────────────────────
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
  }

  private clearDeflectState(): void {
    if (
      this.player.state === PlayerState.DeflectUpper ||
      this.player.state === PlayerState.DeflectLower
    ) {
      this.player.state = PlayerState.Idle;
    }
  }

  protected onBlasterHitPlayer(): void {
    if (this.player.state === PlayerState.Dead) return;
    this.combo.reset();
    const died = this.player.takeDamage(1);
    this.cameras.main.shake(220, 0.012);
    this.showFeedback('HIT!', '#ff2222');

    if (died) {
      this.endGame(false);
    } else {
      this.time.delayedCall(280, () => {
        if (this.player.state === PlayerState.Hit) this.player.state = PlayerState.Idle;
      });
    }
  }

  private onEnemyKilled(enemy: Enemy): void {
    this.score['score'] = (this.score['score'] as number) + enemy.killScore;
  }

  private endGame(victory: boolean): void {
    if (!this.gameActive) return;
    this.gameActive = false;
    const delay = victory ? 1800 : 700;
    this.time.delayedCall(delay, () => {
      this.scene.start('GameOverScene', {
        score:   this.score.getScore(),
        mode:    this.mode,
        victory,
      });
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SPAWNING
  // ════════════════════════════════════════════════════════════════════════════

  protected spawnBlaster(): void {
    const lane: Lane = Math.random() < 0.5 ? 'upper' : 'lower';
    const y = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    const speed = this.mode === 'campaign' && this.stages
      ? this.stages.boltSpeed
      : 420;
    const b = new Blaster(this, GAME_WIDTH - 40, y, lane, speed);
    this.blasters.push(b);
  }

  private loadCurrentStage(): void {
    if (!this.stages || !this.waves) return;
    const stageDef = this.stages.currentStage;
    this.spawnInterval = stageDef.spawnIntervalMs;
    this.stageText?.setText(`STAGE ${stageDef.stageNumber} / 7`);
    this.waves.loadStage(stageDef);
    this.showFeedback(`STAGE ${stageDef.stageNumber}`, '#ffffff');
  }

  // ── Force shockwave VFX ──────────────────────────────────────────────────────
  private spawnForceShockwave(): void {
    const ring = this.add.graphics().setDepth(18);
    ring.lineStyle(6, 0x4488ff, 0.9);
    ring.strokeCircle(PLAYER_X, PLAYER_Y, 20);
    this.tweens.add({
      targets: ring,
      scaleX: 18,
      scaleY: 8,
      alpha: 0,
      duration: 550,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BACKGROUND
  // ════════════════════════════════════════════════════════════════════════════

  private buildBackground(): void {
    // Set alpha to 0 so the HTML gameplay GIF background shows through
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COL_BG).setAlpha(0);
    this.add.rectangle(GAME_WIDTH / 2, UPPER_LANE_Y, GAME_WIDTH, 2, 0x1a2255, 0.8);
    this.add.rectangle(GAME_WIDTH / 2, LOWER_LANE_Y, GAME_WIDTH, 2, 0x1a2255, 0.8);
    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y, GAME_WIDTH, 6, COL_GROUND);

    // Deflect zone guides
    [UPPER_LANE_Y, LOWER_LANE_Y].forEach(ly => {
      this.add.rectangle(
        PLAYER_X + DEFLECT_WINDOW_NORMAL / 2, ly,
        DEFLECT_WINDOW_NORMAL, 18, COL_ZONE_NORMAL, 0.12,
      );
      this.add.rectangle(
        PLAYER_X + DEFLECT_WINDOW_PERFECT / 2, ly,
        DEFLECT_WINDOW_PERFECT, 18, COL_ZONE_PERFECT, 0.25,
      );
    });

    this.add.text(GAME_WIDTH / 2, 14, this.mode.toUpperCase() + ' MODE  ·  [ESC] Menu', {
      fontSize: '24px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#334455',
    }).setOrigin(0.5, 0);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HUD
  // ════════════════════════════════════════════════════════════════════════════

  private buildHUD(): void {
    this.hudGfx = this.add.graphics().setDepth(20);

    const LBL: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px',
      fontFamily: '"Courier New", Courier, monospace',
    };

    this.add.text(BAR_X, BAR_Y0 - 2, 'HP',      { ...LBL, color: '#00ff88' }).setDepth(21);
    this.add.text(BAR_X, BAR_Y1 - 2, 'STAMINA', { ...LBL, color: '#ffcc00' }).setDepth(21);
    this.add.text(BAR_X, BAR_Y2 - 2, 'FORCE',   { ...LBL, color: '#8866ff' }).setDepth(21);

    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'SCORE: 0', {
      fontSize: '38px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffffff',
    }).setOrigin(1, 0).setDepth(21);

    this.stageText = this.add.text(GAME_WIDTH / 2, 20, '', {
      fontSize: '30px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#aaaacc',
    }).setOrigin(0.5, 0).setDepth(21);

    if (this.mode === 'campaign' && this.stages) {
      this.stageText.setText(`STAGE ${this.stages.stageNumber} / 7`);
    }

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
      fontSize: '18px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#445566',
      backgroundColor: '#00000077',
      padding: { x: 4, y: 2 },
    }).setOrigin(0, 1).setDepth(21);
  }

  private redrawHUD(): void {
    const g  = this.hudGfx;
    g.clear();
    const lx = BAR_X + 76;

    // HP pips
    for (let i = 0; i < MAX_HP; i++) {
      g.fillStyle(i < this.player.hp ? 0x00ff88 : 0x1a3322, 1);
      g.fillRect(lx + i * (PIP_W + PIP_GAP), BAR_Y0, PIP_W, BAR_H);
    }

    // Stamina bar
    const stW = Math.round((this.player.stamina / MAX_STAMINA) * BAR_W);
    g.fillStyle(0x111111, 1); g.fillRect(lx, BAR_Y1, BAR_W, BAR_H);
    g.fillStyle(0xffcc00, 1); g.fillRect(lx, BAR_Y1, stW,  BAR_H);

    // Force bar
    const frW   = Math.round((this.player.force / MAX_FORCE) * BAR_W);
    const frCol = this.player.force >= MAX_FORCE ? 0xffffff : 0x8866ff;
    g.fillStyle(0x111111, 1); g.fillRect(lx, BAR_Y2, BAR_W, BAR_H);
    g.fillStyle(frCol,    1); g.fillRect(lx, BAR_Y2, frW,  BAR_H);
    if (this.player.force >= MAX_FORCE) {
      g.lineStyle(2, 0xffffff, 0.6);
      g.strokeRect(lx, BAR_Y2, BAR_W, BAR_H);
    }
  }

  private updateTextElements(time: number): void {
    this.scoreText.setText(`SCORE: ${this.score.getScore().toLocaleString()}`);

    const c = this.combo.getCombo();
    if (c >= 2) {
      this.comboText.setText(`COMBO ×${c}   [ ×${this.combo.getMultiplier()} ]`).setAlpha(1);
    } else {
      this.comboText.setAlpha(0);
    }

    if (this.force.isCharging()) {
      const pct = Math.floor(this.force.getChargeProgress(time) * 100);
      this.chargeText.setText(`⚡ CHARGING ${pct}% ⚡`).setAlpha(1);
      this.chargeText.setColor(pct >= 100 ? '#ffdd00' : '#cc44ff');
    } else {
      this.chargeText.setAlpha(0);
    }

    if (this.feedbackMs > 0) {
      this.feedbackMs -= this.game.loop.delta;
      this.feedbackText.setAlpha(Math.min(this.feedbackMs / 300, 1));
    }

    const enemyCount = this.mode === 'campaign' && this.waves
      ? this.waves.getEnemies().length
      : 0;
    this.debugText.setText(
      `HP:${this.player.hp}  ST:${Math.floor(this.player.stamina)}` +
      `  FO:${Math.floor(this.player.force)}` +
      `  Bolts:${this.blasters.filter(b => b.active).length}` +
      `  Enemies:${enemyCount}  State:${this.player.state}`,
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  protected showFeedback(text: string, color: string): void {
    this.feedbackText.setText(text).setColor(color).setAlpha(1);
    this.feedbackMs = 900;
  }

  private flashLane(lane: Lane): void {
    const y     = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    const flash = this.add.rectangle(PLAYER_X + 40, y, 120, 20, 0xffffff, 0.8).setDepth(15);
    this.tweens.add({
      targets:  flash,
      alpha:    0,
      scaleX:   3,
      duration: 180,
      onComplete: () => flash.destroy(),
    });
  }
}
