import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X, PLAYER_Y } from '../game/constants';
import { Player } from '../entities/Player';
import { showGameplayGifBackground, hideGameplayGifBackground } from '../ui/GameplayGifBackground';
import { hideMenuGifBackground } from '../ui/MenuGifBackground';

const FONT = '"Courier New", Courier, monospace';

// Deflect Up normalized contact coordinates based on 1080x1080 frame size
const DEFLECT_UP_CONTACT_NORM_X = 870 / 1080;
const DEFLECT_UP_CONTACT_NORM_Y = 50 / 1080;

// Fine-tuning offsets for the contact point
let DEFLECT_UP_CONTACT_FINE_TUNE_X = 0;
let DEFLECT_UP_CONTACT_FINE_TUNE_Y = 0;

// Slash arc visual offsets (slash arc PNG does not fill full canvas)
let slashArcOffsetX = 20;
let slashArcOffsetY = -65;
let slashArcScaleMultiplier = 1.0;

// Spark visual offsets for both asset layouts
let SPARK_FULL_CANVAS_OFFSET_X = 0;
let SPARK_FULL_CANVAS_OFFSET_Y = 0;
let SPARK_SMALL_OFFSET_X = 0;
let SPARK_SMALL_OFFSET_Y = 0;
let sparkScaleMultiplier = 1.0;

// Toggle for deflect contact point crosshair debug marker
const SHOW_DEFLECT_UP_CONTACT_DEBUG = false;

export class AnimationTestScene extends Phaser.Scene {
  private player!: Player;
  private statusText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer = 0;

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

  /** Calculate screen-space sword tip contact point based on dynamic sprite frame bounds. */
  private getDeflectUpSwordTipContactPoint(): { x: number; y: number } {
    const playerSprite = this.player.sprite;
    const boundsLeft = playerSprite.x - playerSprite.displayWidth * playerSprite.originX;
    const boundsTop = playerSprite.y - playerSprite.displayHeight * playerSprite.originY;

    return {
      x: boundsLeft + playerSprite.displayWidth * DEFLECT_UP_CONTACT_NORM_X + DEFLECT_UP_CONTACT_FINE_TUNE_X,
      y: boundsTop + playerSprite.displayHeight * DEFLECT_UP_CONTACT_NORM_Y + DEFLECT_UP_CONTACT_FINE_TUNE_Y,
    };
  }

  /** Render debug crosshair marker at the contact point. */
  private drawDebugMarker(): void {
    if (this.debugMarker) {
      this.debugMarker.destroy();
      this.debugMarker = null;
    }

    if (!SHOW_DEFLECT_UP_CONTACT_DEBUG) return;

    const contact = this.getDeflectUpSwordTipContactPoint();
    this.debugMarker = this.add.graphics();
    this.debugMarker.lineStyle(2, 0x00ff00, 1.0);
    this.debugMarker.strokeCircle(contact.x, contact.y, 8);
    this.debugMarker.lineBetween(contact.x - 12, contact.y, contact.x + 12, contact.y);
    this.debugMarker.lineBetween(contact.x, contact.y - 12, contact.x, contact.y + 12);
    this.debugMarker.setDepth(100);
  }

  /** Plays the plain Deflect Up animation, spawning the slash arc on frame 05 but no blaster/sparks. */
  private playPlainDeflectUp(): void {
    this.demoActive = false;
    this.contactReached = false;
    this.blasterState = 'NONE';
    this.sparkFrameName = 'NONE';

    this.player.playAction(
      'deflect_up',
      // onActiveDeflect (frame 05 reached)
      () => {
        this.spawnSlashArc();
      },
      // onComplete
      () => {
        this.showMessage('Deflect Up Complete', '#ffffff');
      }
    );
  }

  /** Plays the full visual deflect up demo including incoming blaster and spark effects on contact. */
  private playDeflectUpDemo(): void {
    this.demoActive = true;
    this.contactReached = false;
    this.blasterState = 'INCOMING';

    // 1. Play player deflect up animation
    this.player.playAction(
      'deflect_up',
      // onActiveDeflect (frame 05 reached - ~185ms from start)
      () => {
        this.contactReached = true;
        this.blasterState = 'CONTACT';

        const contactPoint = this.getDeflectUpSwordTipContactPoint();

        // Destroy incoming blaster
        if (this.testBlaster) {
          this.testBlaster.destroy();
          this.testBlaster = null;
        }

        // Spawn visual Slash Arc
        this.spawnSlashArc();

        // Spawn visual Sparks animation centered on contact point + sparks offset
        this.spawnSparkSequence(contactPoint);

        // Spawn visual redirected blaster bolt moving upward-right from contactPoint
        this.blasterState = 'REDIRECTED';
        this.redirectedBlaster = this.add.graphics();
        this.redirectedBlaster.fillStyle(0xff3300, 1);
        this.redirectedBlaster.fillRect(-22, -4, 44, 8);
        this.redirectedBlaster.fillStyle(0xffcc00, 1);
        this.redirectedBlaster.fillRect(-12, -2, 24, 4);
        this.redirectedBlaster.setPosition(contactPoint.x, contactPoint.y);
        this.redirectedBlaster.setAngle(-45); // fly upwards-right

        this.tweens.add({
          targets: this.redirectedBlaster,
          x: contactPoint.x + 160,
          y: contactPoint.y - 160,
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
      // onComplete (animation cycle finished - frames 08 ends)
      () => {
        this.demoActive = false;
        this.contactReached = false;
        this.showMessage('Demo Complete', '#00ff88');
      }
    );

    // Get contact point coordinates BEFORE incoming tween to compute target path
    const contactPoint = this.getDeflectUpSwordTipContactPoint();

    // 2. Spawn incoming red blaster bolt (starts higher and descends to target contact point)
    this.testBlaster = this.add.graphics();
    this.testBlaster.fillStyle(0xff2200, 1);
    this.testBlaster.fillRect(-30, -4, 60, 8);
    this.testBlaster.fillStyle(0xffaa00, 1);
    this.testBlaster.fillRect(-15, -2, 30, 4);

    const startY = contactPoint.y - 8;
    this.testBlaster.setPosition(GAME_WIDTH + 80, startY);

    // Rotate bolt slightly down towards the contact point
    const dx = contactPoint.x - (GAME_WIDTH + 80);
    const dy = contactPoint.y - startY;
    const angleRad = Math.atan2(dy, dx);
    this.testBlaster.setRotation(angleRad);

    // Tween the incoming blaster to arrive at target contactPoint in exactly 185 ms
    this.tweens.add({
      targets: this.testBlaster,
      x: contactPoint.x,
      y: contactPoint.y,
      duration: 185,
    });
  }

  /** Spawn blue slash arc on frame 05 (shifted up/right by offsets). */
  private spawnSlashArc(): void {
    const hasSlash = this.textures.exists('effect_slash_arc_up');
    if (hasSlash) {
      const scaleXVal = (this.player.sprite.scaleX || 1.0) * slashArcScaleMultiplier;
      const scaleYVal = (this.player.sprite.scaleY || 1.0) * slashArcScaleMultiplier;
      
      const posX = PLAYER_X + slashArcOffsetX;
      const posY = 860 + slashArcOffsetY;

      this.slashArcSprite = this.add.image(posX, posY, 'effect_slash_arc_up')
        .setOrigin(0.5, 1)
        .setScale(scaleXVal, scaleYVal)
        .setDepth(11);

      // Hide/destroy slash arc after 120 ms
      this.time.delayedCall(120, () => {
        if (this.slashArcSprite) {
          this.slashArcSprite.destroy();
          this.slashArcSprite = null;
        }
      });
    } else {
      console.warn('[AnimationTestScene] Slash arc texture missing');
    }
  }

  /** Spawn visual spark sequence depending on canvas layout of the asset. */
  private spawnSparkSequence(contactPoint: { x: number; y: number }): void {
    const hasSparks = this.textures.exists('effect_deflect_spark_01');
    if (!hasSparks) {
      console.warn('[AnimationTestScene] Spark textures missing');
      return;
    }

    const playerSprite = this.player.sprite;
    const scaleXVal = (playerSprite.scaleX || 1.0) * sparkScaleMultiplier;
    const scaleYVal = (playerSprite.scaleY || 1.0) * sparkScaleMultiplier;

    // Detect spark image layout dimensions
    const texture = this.textures.get('effect_deflect_spark_01');
    const sourceImage = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const isFullCanvas = sourceImage && sourceImage.width >= 900 && sourceImage.height >= 900;

    let posX = 0;
    let posY = 0;
    let originX = 0.5;
    let originY = 0.5;

    if (isFullCanvas) {
      posX = playerSprite.x + SPARK_FULL_CANVAS_OFFSET_X;
      posY = playerSprite.y + SPARK_FULL_CANVAS_OFFSET_Y;
      originX = playerSprite.originX;
      originY = playerSprite.originY;
    } else {
      posX = contactPoint.x + SPARK_SMALL_OFFSET_X;
      posY = contactPoint.y + SPARK_SMALL_OFFSET_Y;
    }

    this.sparkSprite = this.add.image(posX, posY, 'effect_deflect_spark_01')
      .setOrigin(originX, originY)
      .setScale(scaleXVal, scaleYVal)
      .setDepth(12);

    this.sparkFrameName = 'spark_01';

    // Spark 01: 45 ms
    this.time.delayedCall(45, () => {
      if (this.sparkSprite) {
        this.sparkSprite.setTexture('effect_deflect_spark_02');
        this.sparkFrameName = 'spark_02';
      }
    });

    // Spark 02: 45 + 60 = 105 ms
    this.time.delayedCall(105, () => {
      if (this.sparkSprite) {
        this.sparkSprite.setTexture('effect_deflect_spark_03');
        this.sparkFrameName = 'spark_03';
      }
    });

    // Spark 03: 105 + 55 = 160 ms
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

    // Instructions/Guides (Font size: 15px, Line spacing: 23px)
    const guides = [
      '1         : Idle',
      '2 / W     : Deflect Up',
      '↑         : Deflect Up Demo',
      '3 / S / ↓ : Deflect Down',
      '4 / D     : Force Reflect',
      '5 / Space : Force Power',
      'R : Reset | ESC : Back'
    ];

    guides.forEach((text, i) => {
      this.add.text(cardX + 20, cardY + 55 + i * 23, text, {
        fontSize: '15px', fontFamily: FONT, color: '#8899aa'
      });
    });

    // Divider line at Y = 225
    gfx.lineStyle(1, 0x334466, 0.5);
    gfx.lineBetween(cardX + 20, cardY + 225, cardX + cardW - 20, cardY + 225);

    // Live state status text (Font size: 14px, Line spacing: 18px, compact dual column layout)
    this.statusText = this.add.text(cardX + 20, cardY + 238, '', {
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

    // 3 / S / Down -> Deflect Down
    if (
      Phaser.Input.Keyboard.JustDown(this.key3) ||
      Phaser.Input.Keyboard.JustDown(this.keyS) ||
      Phaser.Input.Keyboard.JustDown(this.keyDown)
    ) {
      if (actionPlaying) {
        this.player.queueAction('deflect_down');
        this.showMessage('Buffered: Deflect Down', '#e5b800');
      } else {
        this.showMessage('Deflect Down animation not available yet', '#ff4444');
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
        slashArcOffsetX -= 1;
        this.showMessage(`Slash Arc X Offset: ${slashArcOffsetX}`, '#ffff00');
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum6) || Phaser.Input.Keyboard.JustDown(this.keyL)) {
        slashArcOffsetX += 1;
        this.showMessage(`Slash Arc X Offset: ${slashArcOffsetX}`, '#ffff00');
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum8) || Phaser.Input.Keyboard.JustDown(this.keyI)) {
        slashArcOffsetY -= 1;
        this.showMessage(`Slash Arc Y Offset: ${slashArcOffsetY}`, '#ffff00');
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum2) || Phaser.Input.Keyboard.JustDown(this.keyK)) {
        slashArcOffsetY += 1;
        this.showMessage(`Slash Arc Y Offset: ${slashArcOffsetY}`, '#ffff00');
      }
    } else {
      // Tune Contact point fine tuning (J/L/I/K or Num4/6/8/2 with Shift held)
      if (Phaser.Input.Keyboard.JustDown(this.keyNum4) || Phaser.Input.Keyboard.JustDown(this.keyJ)) {
        DEFLECT_UP_CONTACT_FINE_TUNE_X -= 1;
        this.showMessage(`Contact Fine Tune X: ${DEFLECT_UP_CONTACT_FINE_TUNE_X}`, '#00ff88');
        this.drawDebugMarker();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum6) || Phaser.Input.Keyboard.JustDown(this.keyL)) {
        DEFLECT_UP_CONTACT_FINE_TUNE_X += 1;
        this.showMessage(`Contact Fine Tune X: ${DEFLECT_UP_CONTACT_FINE_TUNE_X}`, '#00ff88');
        this.drawDebugMarker();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum8) || Phaser.Input.Keyboard.JustDown(this.keyI)) {
        DEFLECT_UP_CONTACT_FINE_TUNE_Y -= 1;
        this.showMessage(`Contact Fine Tune Y: ${DEFLECT_UP_CONTACT_FINE_TUNE_Y}`, '#00ff88');
        this.drawDebugMarker();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyNum2) || Phaser.Input.Keyboard.JustDown(this.keyK)) {
        DEFLECT_UP_CONTACT_FINE_TUNE_Y += 1;
        this.showMessage(`Contact Fine Tune Y: ${DEFLECT_UP_CONTACT_FINE_TUNE_Y}`, '#00ff88');
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
      this.textures.exists('effect_slash_arc_up') &&
      this.textures.exists('effect_deflect_spark_01') &&
      this.textures.exists('effect_deflect_spark_02') &&
      this.textures.exists('effect_deflect_spark_03');
    
    const texturesStatus = hasEffects ? 'OK' : 'MISSING';

    const contact = this.getDeflectUpSwordTipContactPoint();
    const slashOffset = `(${slashArcOffsetX},${slashArcOffsetY})`;
    const startYVal = contact.y - 8;

    // Spark Mode detection
    let sparkMode = 'SMALL';
    let currentSparkOffset = `(${SPARK_SMALL_OFFSET_X},${SPARK_SMALL_OFFSET_Y})`;
    if (this.textures.exists('effect_deflect_spark_01')) {
      const texture = this.textures.get('effect_deflect_spark_01');
      const img = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      if (img && img.width >= 900 && img.height >= 900) {
        sparkMode = 'FULL_CANVAS';
        currentSparkOffset = `(${SPARK_FULL_CANVAS_OFFSET_X},${SPARK_FULL_CANVAS_OFFSET_Y})`;
      }
    }

    // Format shorter side-by-side variables to prevent overflow inside smaller card
    const textLines = [
      `Action: ${action.toUpperCase()}`,
      `Frame : ${frameKey}`,
      `Index : ${frameIndex}       | Buffer : ${buffered}`,
      `Demo  : ${this.demoActive ? 'ACTIVE' : 'IDLE'}     | Blaster: ${this.blasterState}`,
      `Spark : ${this.sparkFrameName} | Active : ${activeText}`,
      `Contact: ${contactText}      | Chain  : ${exitText}`,
      `Slash Arc: ${slashArcText}   | Textures: ${texturesStatus}`,
      `Contact Point: X=${Math.floor(contact.x)} Y=${Math.floor(contact.y)}`,
      `Blaster: StartY=${Math.floor(startYVal)} TargetY=${Math.floor(contact.y)}`,
      `Spark: ${sparkMode} | Offset: ${currentSparkOffset}`,
      `Offsets: Arc=${slashOffset} Tune=(${DEFLECT_UP_CONTACT_FINE_TUNE_X},${DEFLECT_UP_CONTACT_FINE_TUNE_Y})`
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
  }

  private cleanupDemo(): void {
    this.cleanupDemoOnly();
    hideGameplayGifBackground();
  }
}
