import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X, PLAYER_Y } from '../game/constants';
import { Player } from '../entities/Player';
import { showGameplayGifBackground, hideGameplayGifBackground } from '../ui/GameplayGifBackground';
import { hideMenuGifBackground } from '../ui/MenuGifBackground';

const FONT = '"Courier New", Courier, monospace';

// ─── Deflect Up Alignment Constants ──────────────────────────────────────────
const DEFLECT_UP_CONTACT_NORM_X = 870 / 1080;
const DEFLECT_UP_CONTACT_NORM_Y = 50 / 1080;

let DEFLECT_UP_CONTACT_FINE_TUNE_X = 0;
let DEFLECT_UP_CONTACT_FINE_TUNE_Y = 0;

let slashArcOffsetX = 20;
let slashArcOffsetY = -52;
let slashArcScaleMultiplier = 1.0;

const SPARK_CONTACT_OFFSET_X = 4;
const SPARK_CONTACT_OFFSET_Y = -22;
let sparkScaleMultiplier = 1.0;

// ─── Deflect Down Alignment Constants ────────────────────────────────────────
const DEFLECT_DOWN_CONTACT_NORM_X = 0.74;
const DEFLECT_DOWN_CONTACT_NORM_Y = 0.56;

let DEFLECT_DOWN_CONTACT_FINE_TUNE_X = 45; // shifted more RIGHT
let DEFLECT_DOWN_CONTACT_FINE_TUNE_Y = 32; // shifted more DOWN

let DEFLECT_DOWN_ARC_OFFSET_X = 55; // moved more RIGHT
let DEFLECT_DOWN_ARC_OFFSET_Y = 0;
let DEFLECT_DOWN_ARC_SCALE = 1.0;

let DEFLECT_DOWN_SPARK_OFFSET_X = 0;
let DEFLECT_DOWN_SPARK_OFFSET_Y = 0;

// Toggles for deflect contact point crosshair debug markers
const SHOW_DEFLECT_UP_CONTACT_DEBUG = false;
const SHOW_DEFLECT_DOWN_CONTACT_DEBUG = false;

export class AnimationTestScene extends Phaser.Scene {
  private player!: Player;
  private statusText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer = 0;

  // Stored contact point coordinates for spark frames sequence sync
  private currentSparkContactPoint: { x: number; y: number } | null = null;

  // Active testing deflection mode: 'UP' or 'DOWN'
  private deflectMode: 'UP' | 'DOWN' = 'UP';

  // Demo / Animation state flags
  private demoActive = false;
  private contactReached = false;
  private blasterState = 'NONE';
  private sparkFrameName = 'NONE';

  // Graphic / Sprite handles
  private testBlaster: Phaser.GameObjects.Graphics | null = null;
  private redirectedBlaster: Phaser.GameObjects.Graphics | null = null;
  private slashArcSprite: Phaser.GameObjects.Image | null = null;
  private sparkSprite: Phaser.GameObjects.Image | null = null;
  private debugMarker: Phaser.GameObjects.Graphics | null = null;

  // Key mappings
  private key1!: Phaser.Input.Keyboard.Key;
  private key2!: Phaser.Input.Keyboard.Key;
  private key3!: Phaser.Input.Keyboard.Key;
  private key4!: Phaser.Input.Keyboard.Key;
  private key5!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyUp!: Phaser.Input.Keyboard.Key;
  private keyDown!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyR!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  // Live Tuning Keys
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyNum4!: Phaser.Input.Keyboard.Key;
  private keyNum6!: Phaser.Input.Keyboard.Key;
  private keyNum8!: Phaser.Input.Keyboard.Key;
  private keyNum2!: Phaser.Input.Keyboard.Key;
  private keyI!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyL!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('AnimationTestScene');
  }

  create(): void {
    hideMenuGifBackground();
    showGameplayGifBackground();

    // Lifecycle cleanups
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupDemo, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupDemo, this);

    // Empty background lines for visual ground reference
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.0); // transparent container
    this.add.rectangle(GAME_WIDTH / 2, 760, GAME_WIDTH, 6, 0x1a1a3a); // ground line Y=760

    // Setup player
    this.player = new Player(this);

    // Draw debug marker if enabled
    this.drawDebugMarker();

    // Register onChainExitCallback for buffering testing
    this.player.onChainExitCallback = (actionId: string): boolean => {
      this.cleanupDemoOnly();

      if (actionId === 'deflect_up') {
        this.playPlainDeflectUp();
        return true;
      }
      if (actionId === 'deflect_down') {
        this.playPlainDeflectDown();
        return true;
      }
      
      this.showMessage(`${this.formatActionLabel(actionId)} animation not available yet`, '#ff4444');
      return false;
    };

    // Setup UI elements
    this.buildUI();

    // Bind Keyboard keys
    this.bindKeyboard();

    this.showMessage('Animation Test Room Ready', '#00ff88');
  }

  update(time: number, delta: number): void {
    // Tick the player visual/animation timers
    this.player.update(time, delta);

    // Handle keys and play/queue/demo logic once per press
    this.handleKeyboardInputs();

    // Update message timer
    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) {
        this.messageText.setAlpha(0);
      }
    }

    // Refresh UI text indicators
    this.refreshUI();
  }

  /** Calculate screen-space sword tip contact point for upper deflect. */
  private getDeflectUpSwordTipContactPoint(): { x: number; y: number } {
    const playerSprite = this.player.sprite;
    const boundsLeft = playerSprite.x - playerSprite.displayWidth * playerSprite.originX;
    const boundsTop = playerSprite.y - playerSprite.displayHeight * playerSprite.originY;

    return {
      x: boundsLeft + playerSprite.displayWidth * DEFLECT_UP_CONTACT_NORM_X + DEFLECT_UP_CONTACT_FINE_TUNE_X,
      y: boundsTop + playerSprite.displayHeight * DEFLECT_UP_CONTACT_NORM_Y + DEFLECT_UP_CONTACT_FINE_TUNE_Y,
    };
  }

  /** Calculate screen-space sword contact point for lower deflect. */
  private getDeflectDownSwordContactPoint(): { x: number; y: number } {
    const playerSprite = this.player.sprite;
    const boundsLeft = playerSprite.x - playerSprite.displayWidth * playerSprite.originX;
    const boundsTop = playerSprite.y - playerSprite.displayHeight * playerSprite.originY;

    return {
      x: boundsLeft + playerSprite.displayWidth * DEFLECT_DOWN_CONTACT_NORM_X + DEFLECT_DOWN_CONTACT_FINE_TUNE_X,
      y: boundsTop + playerSprite.displayHeight * DEFLECT_DOWN_CONTACT_NORM_Y + DEFLECT_DOWN_CONTACT_FINE_TUNE_Y,
    };
  }

  /** Render debug crosshair marker at the active contact point. */
  private drawDebugMarker(): void {
    if (this.debugMarker) {
      this.debugMarker.destroy();
      this.debugMarker = null;
    }

    let showDebug = false;
    let targetX = 0;
    let targetY = 0;

    if (this.deflectMode === 'UP') {
      showDebug = SHOW_DEFLECT_UP_CONTACT_DEBUG;
      const contact = this.getDeflectUpSwordTipContactPoint();
      targetX = contact.x + SPARK_CONTACT_OFFSET_X;
      targetY = contact.y + SPARK_CONTACT_OFFSET_Y;
    } else {
      showDebug = SHOW_DEFLECT_DOWN_CONTACT_DEBUG;
      const contact = this.getDeflectDownSwordContactPoint();
      targetX = contact.x + DEFLECT_DOWN_SPARK_OFFSET_X;
      targetY = contact.y + DEFLECT_DOWN_SPARK_OFFSET_Y;
    }

    if (!showDebug) return;

    this.debugMarker = this.add.graphics();
    this.debugMarker.lineStyle(2, 0x00ff00, 1.0);
    this.debugMarker.strokeCircle(targetX, targetY, 8);
    this.debugMarker.lineBetween(targetX - 12, targetY, targetX + 12, targetY);
    this.debugMarker.lineBetween(targetX, targetY - 12, targetX, targetY + 12);
    this.debugMarker.setDepth(100);
  }

  /** Plays the plain Deflect Up animation. */
  private playPlainDeflectUp(): void {
    this.deflectMode = 'UP';
    this.demoActive = false;
    this.contactReached = false;
    this.blasterState = 'NONE';
    this.sparkFrameName = 'NONE';
    this.currentSparkContactPoint = null;
    this.drawDebugMarker();

    this.player.playAction(
      'deflect_up',
      // onActiveDeflect
      () => {
        this.spawnSlashArc();
      },
      // onComplete
      () => {
        this.showMessage('Deflect Up Complete', '#ffffff');
      }
    );
  }

  /** Plays the full visual deflect up demo. */
  private playDeflectUpDemo(): void {
    this.deflectMode = 'UP';
    this.demoActive = true;
    this.contactReached = false;
    this.blasterState = 'INCOMING';
    this.drawDebugMarker();

    // 1. Play player deflect up animation
    this.player.playAction(
      'deflect_up',
      // onActiveDeflect (frame 05 reached - ~185ms from start)
      () => {
        this.contactReached = true;
        this.blasterState = 'CONTACT';

        // Calculate and store the target contact coordinates exactly once at the beginning of frame 05
        const contact = this.getDeflectUpSwordTipContactPoint();
        const targetX = contact.x + SPARK_CONTACT_OFFSET_X;
        const targetY = contact.y + SPARK_CONTACT_OFFSET_Y;
        this.currentSparkContactPoint = { x: targetX, y: targetY };

        // Destroy incoming blaster
        if (this.testBlaster) {
          this.testBlaster.destroy();
          this.testBlaster = null;
        }

        // Spawn visual Slash Arc
        this.spawnSlashArc();

        // Spawn visual Sparks animation centered on currentSparkContactPoint
        this.spawnSparkSequence(this.currentSparkContactPoint);

        // Spawn visual redirected blaster bolt moving upward-right
        this.blasterState = 'REDIRECTED';
        this.redirectedBlaster = this.add.graphics();
        this.redirectedBlaster.fillStyle(0xff3300, 1);
        this.redirectedBlaster.fillRect(-22, -4, 44, 8);
        this.redirectedBlaster.fillStyle(0xffcc00, 1);
        this.redirectedBlaster.fillRect(-12, -2, 24, 4);
        this.redirectedBlaster.setPosition(targetX, targetY);
        this.redirectedBlaster.setAngle(-45);

        this.tweens.add({
          targets: this.redirectedBlaster,
          x: targetX + 160,
          y: targetY - 160,
          duration: 160,
          onComplete: () => {
            if (this.redirectedBlaster) {
              this.redirectedBlaster.destroy();
              this.redirectedBlaster = null;
              this.blasterState = 'NONE';
            }
          }
        });
      },
      // onComplete
      () => {
        this.demoActive = false;
        this.contactReached = false;
        this.showMessage('Demo Complete', '#00ff88');
      }
    );

    // Get contact coordinates to compute incoming path Y
    const contact = this.getDeflectUpSwordTipContactPoint();
    const targetX = contact.x + SPARK_CONTACT_OFFSET_X;
    const targetY = contact.y + SPARK_CONTACT_OFFSET_Y;

    // 2. Spawn incoming red blaster bolt (starts higher and descends to target contact point)
    this.testBlaster = this.add.graphics();
    this.testBlaster.fillStyle(0xff2200, 1);
    this.testBlaster.fillRect(-30, -4, 60, 8);
    this.testBlaster.fillStyle(0xffaa00, 1);
    this.testBlaster.fillRect(-15, -2, 30, 4);

    const startY = targetY - 6;
    this.testBlaster.setPosition(GAME_WIDTH + 80, startY);

    // Rotate bolt down towards the contact point
    const dx = targetX - (GAME_WIDTH + 80);
    const dy = targetY - startY;
    const angleRad = Math.atan2(dy, dx);
    this.testBlaster.setRotation(angleRad);

    this.tweens.add({
      targets: this.testBlaster,
      x: targetX,
      y: targetY,
      duration: 185, // matches frame 05 startup for deflect up
    });
  }

  /** Plays the plain Deflect Down animation. */
  private playPlainDeflectDown(): void {
    if (!this.player.hasDeflectDownFrames(this)) {
      this.showMessage('Deflect Down animation not available yet', '#ff4444');
      return;
    }

    this.deflectMode = 'DOWN';
    this.demoActive = false;
    this.contactReached = false;
    this.blasterState = 'NONE';
    this.sparkFrameName = 'NONE';
    this.currentSparkContactPoint = null;
    this.drawDebugMarker();

    this.player.playAction(
      'deflect_down',
      // onActiveDeflect
      () => {
        this.spawnSlashArc();
      },
      // onComplete
      () => {
        this.showMessage('Deflect Down Complete', '#ffffff');
      }
    );
  }

  /** Plays the full visual deflect down demo. */
  private playDeflectDownDemo(): void {
    if (!this.player.hasDeflectDownFrames(this)) {
      this.showMessage('Deflect Down animation not available yet', '#ff4444');
      return;
    }

    this.deflectMode = 'DOWN';
    this.demoActive = true;
    this.contactReached = false;
    this.blasterState = 'INCOMING';
    this.drawDebugMarker();

    // 1. Play player deflect down animation
    this.player.playAction(
      'deflect_down',
      // onActiveDeflect (frame 05 reached - ~150ms from start)
      () => {
        this.contactReached = true;
        this.blasterState = 'CONTACT';

        // Calculate and store the target contact coordinates exactly once at the beginning of frame 05
        const contact = this.getDeflectDownSwordContactPoint();
        const targetX = contact.x; // aims at contact point directly
        const targetY = contact.y; 
        
        // Stored spark coordinate applies DEFLECT_DOWN_SPARK_OFFSET
        const sparkX = targetX + DEFLECT_DOWN_SPARK_OFFSET_X;
        const sparkY = targetY + DEFLECT_DOWN_SPARK_OFFSET_Y;
        this.currentSparkContactPoint = { x: sparkX, y: sparkY };

        // Destroy incoming blaster
        if (this.testBlaster) {
          this.testBlaster.destroy();
          this.testBlaster = null;
        }

        // Spawn visual Slash Arc
        this.spawnSlashArc();

        // Spawn visual Sparks animation centered on currentSparkContactPoint
        this.spawnSparkSequence(this.currentSparkContactPoint);

        // Spawn visual redirected blaster bolt moving upward-right from the contact point
        this.blasterState = 'REDIRECTED';
        this.redirectedBlaster = this.add.graphics();
        this.redirectedBlaster.fillStyle(0xff3300, 1);
        this.redirectedBlaster.fillRect(-22, -4, 44, 8);
        this.redirectedBlaster.fillStyle(0xffcc00, 1);
        this.redirectedBlaster.fillRect(-12, -2, 24, 4);
        this.redirectedBlaster.setPosition(targetX, targetY);
        this.redirectedBlaster.setAngle(-25); // flatter deflection bounce

        this.tweens.add({
          targets: this.redirectedBlaster,
          x: targetX + 160,
          y: targetY - 160,
          duration: 160,
          onComplete: () => {
            if (this.redirectedBlaster) {
              this.redirectedBlaster.destroy();
              this.redirectedBlaster = null;
              this.blasterState = 'NONE';
            }
          }
        });
      },
      // onComplete
      () => {
        this.demoActive = false;
        this.contactReached = false;
        this.showMessage('Demo Complete', '#00ff88');
      }
    );

    // Get contact coordinates to compute path Y
    const contact = this.getDeflectDownSwordContactPoint();
    const targetX = contact.x;
    const targetY = contact.y;

    // 2. Spawn incoming red blaster bolt (starts higher at lower deflection contact Y)
    this.testBlaster = this.add.graphics();
    this.testBlaster.fillStyle(0xff2200, 1);
    this.testBlaster.fillRect(-30, -4, 60, 8);
    this.testBlaster.fillStyle(0xffaa00, 1);
    this.testBlaster.fillRect(-15, -2, 30, 4);

    const startY = targetY; // comes horizontally at sword-tip height
    this.testBlaster.setPosition(GAME_WIDTH + 80, startY);

    // Rotate bolt down towards the contact point
    const dx = targetX - (GAME_WIDTH + 80);
    const dy = targetY - startY;
    const angleRad = Math.atan2(dy, dx);
    this.testBlaster.setRotation(angleRad);

    this.tweens.add({
      targets: this.testBlaster,
      x: targetX,
      y: targetY,
      duration: 150, // matches FAST frame 05 startup for deflect down (30 + 35 + 40 + 45 = 150 ms)
    });
  }

  /** Spawn active slash arc. Handles both deflect up and deflect down. */
  private spawnSlashArc(): void {
    const key = this.deflectMode === 'UP' ? 'effect_slash_arc_up' : 'effect_slash_arc_down';
    
    if (!this.textures.exists(key)) {
      console.warn(`[AnimationTestScene] Slash arc texture missing: ${key}`);
      return;
    }

    const scaleXVal = this.player.sprite.scaleX || 1.0;
    const scaleYVal = this.player.sprite.scaleY || 1.0;

    let posX = 0;
    let posY = 0;
    let originX = 0.5;
    let originY = 1.0;
    let mult = 1.0;

    if (this.deflectMode === 'UP') {
      posX = PLAYER_X + slashArcOffsetX;
      posY = 860 + slashArcOffsetY;
      mult = slashArcScaleMultiplier;
    } else {
      mult = DEFLECT_DOWN_ARC_SCALE;
      const contact = this.getDeflectDownSwordContactPoint();
      posX = contact.x + DEFLECT_DOWN_ARC_OFFSET_X;
      posY = contact.y + DEFLECT_DOWN_ARC_OFFSET_Y;

      // Set visible-bounds origin for standalone arc down if scanned
      const anchor = this.registry.get('slash_arc_down_anchor');
      if (anchor) {
        originX = anchor.x;
        originY = anchor.y;
      } else {
        originY = 0.5;
      }
    }

    this.slashArcSprite = this.add.image(posX, posY, key)
      .setOrigin(originX, originY)
      .setScale(scaleXVal * mult, scaleYVal * mult)
      .setDepth(11);

    // Hide/destroy slash arc after 120 ms
    this.time.delayedCall(120, () => {
      if (this.slashArcSprite) {
        this.slashArcSprite.destroy();
        this.slashArcSprite = null;
      }
    });
  }

  /** Spawn visual spark sequence centered on deflect contactPoint with visible-bounds anchors. */
  private spawnSparkSequence(contactPoint: { x: number; y: number }): void {
    const hasSparks = this.textures.exists('effect_deflect_spark_01');
    if (!hasSparks) {
      console.warn('[AnimationTestScene] Spark textures missing');
      return;
    }

    const playerSprite = this.player.sprite;
    const scaleXVal = (playerSprite.scaleX || 1.0) * sparkScaleMultiplier;
    const scaleYVal = (playerSprite.scaleY || 1.0) * sparkScaleMultiplier;

    // Use calculated visible-bounds anchor for Spark 01
    const anchor01 = this.registry.get('spark_anchor_01') || { x: 0.5, y: 0.5 };

    this.sparkSprite = this.add.image(contactPoint.x, contactPoint.y, 'effect_deflect_spark_01')
      .setOrigin(anchor01.x, anchor01.y)
      .setScale(scaleXVal, scaleYVal)
      .setDepth(12);

    this.sparkFrameName = 'spark_01';

    // Spark 01: 45 ms -> Spark 02
    this.time.delayedCall(45, () => {
      if (this.sparkSprite) {
        this.sparkSprite.setTexture('effect_deflect_spark_02');
        const anchor02 = this.registry.get('spark_anchor_02') || { x: 0.5, y: 0.5 };
        this.sparkSprite.setOrigin(anchor02.x, anchor02.y);
        this.sparkFrameName = 'spark_02';
      }
    });

    // Spark 02: 45 + 60 = 105 ms -> Spark 03
    this.time.delayedCall(105, () => {
      if (this.sparkSprite) {
        this.sparkSprite.setTexture('effect_deflect_spark_03');
        const anchor03 = this.registry.get('spark_anchor_03') || { x: 0.5, y: 0.5 };
        this.sparkSprite.setOrigin(anchor03.x, anchor03.y);
        this.sparkFrameName = 'spark_03';
      }
    });

    // Spark 03: 105 + 55 = 160 ms -> Destroy
    this.time.delayedCall(160, () => {
      if (this.sparkSprite) {
        this.sparkSprite.destroy();
        this.sparkSprite = null;
        this.sparkFrameName = 'NONE';
      }
    });
  }

  private buildUI(): void {
    // Title Panel background card (h=410, w=380 - tighter and smaller to prevent overflow)
    const cardX = 30;
    const cardY = 30;
    const cardW = 380;
    const cardH = 410;
    
    const gfx = this.add.graphics();
    gfx.fillStyle(0x050912, 0.85);
    gfx.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    gfx.lineStyle(1.5, 0x00ccff, 0.3);
    gfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    // Title label (Font size: 24px)
    this.add.text(cardX + 20, cardY + 15, '🤖 ANIMATION TEST', {
      fontSize: '24px', fontFamily: FONT, color: '#ffb833', fontStyle: 'bold'
    });

    // Instructions/Guides (Font size: 14px, Line spacing: 23px)
    const guides = [
      '1         : Idle stance',
      '2 / W     : Deflect Up   | ↑ : Up Demo',
      '3 / S     : Deflect Down | ↓ : Down Demo',
      '4 / D     : Force Reflect',
      '5 / Space : Force Power',
      'R : Reset | ESC : Back to Menu'
    ];

    guides.forEach((text, i) => {
      this.add.text(cardX + 20, cardY + 55 + i * 23, text, {
        fontSize: '14px', fontFamily: FONT, color: '#8899aa'
      });
    });

    // Divider line at Y = 220
    gfx.lineStyle(1, 0x334466, 0.5);
    gfx.lineBetween(cardX + 20, cardY + 220, cardX + cardW - 20, cardY + 220);

    // Live state status text (Font size: 14px, Line spacing: 17px, compact dual column layout)
    this.statusText = this.add.text(cardX + 20, cardY + 233, '', {
      fontSize: '14px', fontFamily: FONT, color: '#ffffff', lineSpacing: 4
    });

    // Alert feedback message text (middle bottom)
    this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, '', {
      fontSize: '32px', fontFamily: FONT, color: '#ffffff',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    // Scene Label top center
    this.add.text(GAME_WIDTH / 2, 20, 'ANIMATION PREVIEW SCENE', {
      fontSize: '20px', fontFamily: FONT, color: '#556688'
    }).setOrigin(0.5, 0);
  }

  private bindKeyboard(): void {
    if (!this.input.keyboard) return;

    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.key5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);

    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Live Tuning Keys
    this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyNum4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR);
    this.keyNum6 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX);
    this.keyNum8 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT);
    this.keyNum2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
  }

  private handleKeyboardInputs(): void {
    // ESC -> Return to MainMenuScene
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.scene.start('MainMenuScene');
      return;
    }

    // R -> Reset to Idle
    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      this.cleanupDemoOnly();
      this.player.playIdle();
      this.showMessage('Animation Reset', '#ffffff');
      return;
    }

    const actionPlaying = this.player.isActionPlaying();

    // 1 -> Idle
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.cleanupDemoOnly();
      this.player.playIdle();
      this.showMessage('Playing Idle animation', '#00ccff');
      return;
    }

    // 2 / W -> plain Deflect Up (no blaster)
    if (Phaser.Input.Keyboard.JustDown(this.key2) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
      if (actionPlaying) {
        this.player.queueAction('deflect_up');
        this.showMessage('Buffered: Deflect Up', '#e5b800');
      } else {
        this.showMessage('Playing Deflect Up', '#00ff88');
        this.playPlainDeflectUp();
      }
      return;
    }

    // ArrowUp -> Deflect Up Demo (with blaster and sparks)
    if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
      if (actionPlaying) {
        this.player.queueAction('deflect_up');
        this.showMessage('Buffered: Deflect Up Demo', '#e5b800');
      } else {
        this.showMessage('Deflect Up Demo Started', '#00ff88');
        this.playDeflectUpDemo();
      }
      return;
    }

    // 3 / S -> plain Deflect Down (no blaster)
    if (Phaser.Input.Keyboard.JustDown(this.key3) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
      if (actionPlaying) {
        this.player.queueAction('deflect_down');
        this.showMessage('Buffered: Deflect Down', '#e5b800');
      } else {
        this.showMessage('Playing Deflect Down', '#00ff88');
        this.playPlainDeflectDown();
      }
      return;
    }

    // ArrowDown -> Deflect Down Demo (with lower blaster and sparks)
    if (Phaser.Input.Keyboard.JustDown(this.keyDown)) {
      if (actionPlaying) {
        this.player.queueAction('deflect_down');
        this.showMessage('Buffered: Deflect Down Demo', '#e5b800');
      } else {
        this.showMessage('Deflect Down Demo Started', '#00ff88');
        this.playDeflectDownDemo();
      }
      return;
    }

    // 4 / D -> Force Reflect
    if (Phaser.Input.Keyboard.JustDown(this.key4) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
      if (actionPlaying) {
        this.player.queueAction('reflect');
        this.showMessage('Buffered: Force Reflect', '#e5b800');
      } else {
        this.showMessage('Force Reflect animation not available yet', '#ff4444');
      }
      return;
    }

    // 5 / Space -> Force Power
    if (Phaser.Input.Keyboard.JustDown(this.key5) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      if (actionPlaying) {
        this.player.queueAction('force');
        this.showMessage('Buffered: Force Power', '#e5b800');
      } else {
        this.showMessage('Force Power animation not available yet', '#ff4444');
      }
      return;
    }

    // ── Live Offset Tuning logic ─────────────────────────────────────────────
    const isShift = this.keyShift.isDown;
    
    if (!isShift) {
      // Tune Slash Arc offsets (J/L/I/K or Num4/6/8/2)
      if (Phaser.Input.Keyboard.JustDown(this.keyNum4) || Phaser.Input.Keyboard.JustDown(this.keyJ)) {
        if (this.deflectMode === 'UP') {
          slashArcOffsetX -= 1;
          this.showMessage(`Slash Arc Up X Offset: ${slashArcOffsetX}`, '#ffff00');
        } else {
          DEFLECT_DOWN_ARC_OFFSET_X -= 1;
          this.showMessage(`Slash Arc Down X Offset: ${DEFLECT_DOWN_ARC_OFFSET_X}`, '#ffff00');
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum6) || Phaser.Input.Keyboard.JustDown(this.keyL)) {
        if (this.deflectMode === 'UP') {
          slashArcOffsetX += 1;
          this.showMessage(`Slash Arc Up X Offset: ${slashArcOffsetX}`, '#ffff00');
        } else {
          DEFLECT_DOWN_ARC_OFFSET_X += 1;
          this.showMessage(`Slash Arc Down X Offset: ${DEFLECT_DOWN_ARC_OFFSET_X}`, '#ffff00');
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum8) || Phaser.Input.Keyboard.JustDown(this.keyI)) {
        if (this.deflectMode === 'UP') {
          slashArcOffsetY -= 1;
          this.showMessage(`Slash Arc Up Y Offset: ${slashArcOffsetY}`, '#ffff00');
        } else {
          DEFLECT_DOWN_ARC_OFFSET_Y -= 1;
          this.showMessage(`Slash Arc Down Y Offset: ${DEFLECT_DOWN_ARC_OFFSET_Y}`, '#ffff00');
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum2) || Phaser.Input.Keyboard.JustDown(this.keyK)) {
        if (this.deflectMode === 'UP') {
          slashArcOffsetY += 1;
          this.showMessage(`Slash Arc Up Y Offset: ${slashArcOffsetY}`, '#ffff00');
        } else {
          DEFLECT_DOWN_ARC_OFFSET_Y += 1;
          this.showMessage(`Slash Arc Down Y Offset: ${DEFLECT_DOWN_ARC_OFFSET_Y}`, '#ffff00');
        }
      }
    } else {
      // Tune Contact point fine tuning (J/L/I/K or Num4/6/8/2 with Shift held)
      if (Phaser.Input.Keyboard.JustDown(this.keyNum4) || Phaser.Input.Keyboard.JustDown(this.keyJ)) {
        if (this.deflectMode === 'UP') {
          DEFLECT_UP_CONTACT_FINE_TUNE_X -= 1;
          this.showMessage(`Up Contact Fine Tune X: ${DEFLECT_UP_CONTACT_FINE_TUNE_X}`, '#00ff88');
        } else {
          DEFLECT_DOWN_CONTACT_FINE_TUNE_X -= 1;
          this.showMessage(`Down Contact Fine Tune X: ${DEFLECT_DOWN_CONTACT_FINE_TUNE_X}`, '#00ff88');
        }
        this.drawDebugMarker();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum6) || Phaser.Input.Keyboard.JustDown(this.keyL)) {
        if (this.deflectMode === 'UP') {
          DEFLECT_UP_CONTACT_FINE_TUNE_X += 1;
          this.showMessage(`Up Contact Fine Tune X: ${DEFLECT_UP_CONTACT_FINE_TUNE_X}`, '#00ff88');
        } else {
          DEFLECT_DOWN_CONTACT_FINE_TUNE_X += 1;
          this.showMessage(`Down Contact Fine Tune X: ${DEFLECT_DOWN_CONTACT_FINE_TUNE_X}`, '#00ff88');
        }
        this.drawDebugMarker();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum8) || Phaser.Input.Keyboard.JustDown(this.keyI)) {
        if (this.deflectMode === 'UP') {
          DEFLECT_UP_CONTACT_FINE_TUNE_Y -= 1;
          this.showMessage(`Up Contact Fine Tune Y: ${DEFLECT_UP_CONTACT_FINE_TUNE_Y}`, '#00ff88');
        } else {
          DEFLECT_DOWN_CONTACT_FINE_TUNE_Y -= 1;
          this.showMessage(`Down Contact Fine Tune Y: ${DEFLECT_DOWN_CONTACT_FINE_TUNE_Y}`, '#00ff88');
        }
        this.drawDebugMarker();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum2) || Phaser.Input.Keyboard.JustDown(this.keyK)) {
        if (this.deflectMode === 'UP') {
          DEFLECT_UP_CONTACT_FINE_TUNE_Y += 1;
          this.showMessage(`Up Contact Fine Tune Y: ${DEFLECT_UP_CONTACT_FINE_TUNE_Y}`, '#00ff88');
        } else {
          DEFLECT_DOWN_CONTACT_FINE_TUNE_Y += 1;
          this.showMessage(`Down Contact Fine Tune Y: ${DEFLECT_DOWN_CONTACT_FINE_TUNE_Y}`, '#00ff88');
        }
        this.drawDebugMarker();
      }
    }
  }

  private refreshUI(): void {
    const action = this.player.getCurrentAction();
    const frameKey = this.player.getCurrentFrameKey();
    const frameIndex = this.player.getCurrentFrameIndex();
    const buffered = this.player.bufferedAction ? this.player.bufferedAction.toUpperCase() : 'NONE';
    
    // Status flag conditions
    const isActiveDeflect = this.player.isCurrentFrameActiveDeflect();
    const isChainExit = this.player.isCurrentFrameChainExit();
    
    const activeText = isActiveDeflect ? 'yes' : 'no';
    const exitText = isChainExit ? 'yes' : 'no';
    const contactText = this.contactReached ? 'yes' : 'no';
    
    const slashArcText = this.slashArcSprite ? 'ON' : 'OFF';

    const hasEffects =
      (this.deflectMode === 'UP' ? this.textures.exists('effect_slash_arc_up') : this.textures.exists('effect_slash_arc_down')) &&
      this.textures.exists('effect_deflect_spark_01') &&
      this.textures.exists('effect_deflect_spark_02') &&
      this.textures.exists('effect_deflect_spark_03');
    
    const texturesStatus = hasEffects ? 'OK' : 'MISSING';

    let contact = { x: 0, y: 0 };
    let slashOffset = '';
    let startYVal = 0;
    let sparkXVal = 0;
    let sparkYVal = 0;

    if (this.deflectMode === 'UP') {
      contact = this.getDeflectUpSwordTipContactPoint();
      const targetX = contact.x + SPARK_CONTACT_OFFSET_X;
      const targetY = contact.y + SPARK_CONTACT_OFFSET_Y;
      slashOffset = `(${slashArcOffsetX},${slashArcOffsetY})`;
      startYVal = targetY - 6;
      sparkXVal = targetX;
      sparkYVal = targetY;
    } else {
      contact = this.getDeflectDownSwordContactPoint();
      const targetX = contact.x + DEFLECT_DOWN_SPARK_OFFSET_X;
      const targetY = contact.y + DEFLECT_DOWN_SPARK_OFFSET_Y;
      slashOffset = `(${DEFLECT_DOWN_ARC_OFFSET_X},${DEFLECT_DOWN_ARC_OFFSET_Y})`;
      startYVal = targetY; // incoming is horizontal start Y = target Y
      sparkXVal = targetX;
      sparkYVal = targetY;
    }

    // Spark Mode detection
    let sparkMode = 'SMALL';
    let currentSparkOffset = `(${SPARK_CONTACT_OFFSET_X},${SPARK_CONTACT_OFFSET_Y})`;
    if (this.deflectMode === 'DOWN') {
      currentSparkOffset = `(${DEFLECT_DOWN_SPARK_OFFSET_X},${DEFLECT_DOWN_SPARK_OFFSET_Y})`;
    }
    
    if (this.textures.exists('effect_deflect_spark_01')) {
      const texture = this.textures.get('effect_deflect_spark_01');
      const img = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      if (img && img.width >= 900 && img.height >= 900) {
        sparkMode = 'FULL_CANVAS';
      }
    }

    const timingStr = this.deflectMode === 'UP' ? 'STANDARD' : 'FAST';

    // Format shorter side-by-side variables to prevent overflow inside smaller card
    const textLines = [
      `Action: ${action.toUpperCase()}`,
      `Frame : ${frameKey}`,
      `Index : ${frameIndex}       | Buffer : ${buffered}`,
      `Demo  : ${this.demoActive ? 'ACTIVE' : 'IDLE'}     | Blaster: ${this.blasterState}`,
      `Spark : ${this.sparkFrameName} | Active : ${activeText}`,
      `Contact: ${contactText}      | Chain  : ${exitText}`,
      `Slash Arc: ${slashArcText}   | Textures: ${texturesStatus}`,
      `Mode  : DOWN (FAST)      | Timing : ${timingStr}`, // Show Mode details
      `Contact: (${Math.floor(contact.x)},${Math.floor(contact.y)})`,
      `Arc    : Pos=(${Math.floor(this.slashArcSprite ? this.slashArcSprite.x : 0)},${Math.floor(this.slashArcSprite ? this.slashArcSprite.y : 0)}) Offset=${slashOffset}`,
      `Spark  : Pos=(${Math.floor(sparkXVal)},${Math.floor(sparkYVal)}) Offset=${currentSparkOffset}`,
      `Blaster Target: (${Math.floor(this.deflectMode === 'UP' ? contact.x + SPARK_CONTACT_OFFSET_X : contact.x)},${Math.floor(this.deflectMode === 'UP' ? contact.y + SPARK_CONTACT_OFFSET_Y : contact.y)})`
    ];

    this.statusText.setText(textLines.join('\n'));

    // Highlight card outline glow or color based on state
    if (isActiveDeflect) {
      this.statusText.setColor('#00ff88');
    } else if (isChainExit) {
      this.statusText.setColor('#ffff00');
    } else {
      this.statusText.setColor('#ffffff');
    }
  }

  private formatActionLabel(actionId: string): string {
    if (actionId === 'deflect_up') return 'Deflect Up';
    if (actionId === 'deflect_down') return 'Deflect Down';
    if (actionId === 'reflect') return 'Force Reflect';
    if (actionId === 'force') return 'Force Power';
    return actionId;
  }

  private showMessage(text: string, color: string): void {
    this.messageText.setText(text).setColor(color).setAlpha(1);
    this.messageTimer = 1800; // visible for 1.8s
  }

  private cleanupDemoOnly(): void {
    // Stop all tweens
    this.tweens.killAll();

    // Destroy graphics and images
    if (this.testBlaster) {
      this.testBlaster.destroy();
      this.testBlaster = null;
    }
    if (this.redirectedBlaster) {
      this.redirectedBlaster.destroy();
      this.redirectedBlaster = null;
    }
    if (this.slashArcSprite) {
      this.slashArcSprite.destroy();
      this.slashArcSprite = null;
    }
    if (this.sparkSprite) {
      this.sparkSprite.destroy();
      this.sparkSprite = null;
    }
    if (this.debugMarker) {
      this.debugMarker.destroy();
      this.debugMarker = null;
    }

    this.demoActive = false;
    this.contactReached = false;
    this.blasterState = 'NONE';
    this.sparkFrameName = 'NONE';
    this.currentSparkContactPoint = null;
  }

  private cleanupDemo(): void {
    this.cleanupDemoOnly();
    hideGameplayGifBackground();
  }
}
