import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X, PLAYER_Y } from '../game/constants';
import { Player } from '../entities/Player';
import { showGameplayGifBackground, hideGameplayGifBackground } from '../ui/GameplayGifBackground';
import { hideMenuGifBackground } from '../ui/MenuGifBackground';

const FONT = '"Courier New", Courier, monospace';

// Configurable offsets for visual effects alignment (if not full-canvas aligned)
const slashArcOffsetX = 0;
const slashArcOffsetY = 0;
const sparkOffsetX = 0;
const sparkOffsetY = 0;

// Coordinates for test blaster path
const BLASTER_START_X = 1600;
const BLASTER_START_Y = 650;
const BLASTER_CONTACT_X = 430;
const BLASTER_CONTACT_Y = 650;

export class AnimationTestScene extends Phaser.Scene {
  private player!: Player;
  private statusText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer = 0;

  // Demo visual states
  private demoActive = false;
  private contactReached = false;
  private blasterState = 'NONE';
  private sparkFrameName = 'NONE';

  // Demo sprites/graphics
  private testBlaster: Phaser.GameObjects.Graphics | null = null;
  private redirectedBlaster: Phaser.GameObjects.Graphics | null = null;
  private slashArcSprite: Phaser.GameObjects.Image | null = null;
  private sparkSprite: Phaser.GameObjects.Image | null = null;

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

  constructor() {
    super('AnimationTestScene');
  }

  create(): void {
    hideMenuGifBackground();
    showGameplayGifBackground();

    // Lifecyle cleanup
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupDemo, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanupDemo, this);

    // Empty background lines for visual ground reference
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.0); // transparent container
    this.add.rectangle(GAME_WIDTH / 2, 760, GAME_WIDTH, 6, 0x1a1a3a); // ground line Y=760

    // Setup player
    this.player = new Player(this);

    // Register onChainExitCallback for buffering testing
    this.player.onChainExitCallback = (actionId: string): boolean => {
      if (actionId === 'deflect_up') {
        // Trigger a new demo cycle instantly
        this.cleanupDemoOnly();
        this.playDeflectUpDemo();
        return true;
      }
      
      // If action is not available (deflect_down, reflect, force)
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
        console.log('[AnimationTestScene] Deflect up active frame reached: player_deflect_up_05');

        // Destroy incoming blaster
        if (this.testBlaster) {
          this.testBlaster.destroy();
          this.testBlaster = null;
        }

        // Spawn visual Slash Arc
        const hasSlash = this.textures.exists('effect_slash_arc_up');
        if (hasSlash) {
          this.slashArcSprite = this.add.image(PLAYER_X + slashArcOffsetX, 860 + slashArcOffsetY, 'effect_slash_arc_up')
            .setOrigin(0.5, 1)
            .setScale(this.player.sprite.scale)
            .setDepth(11);

          // Hide/destroy slash arc after 120 ms
          this.time.delayedCall(120, () => {
            if (this.slashArcSprite) {
              this.slashArcSprite.destroy();
              this.slashArcSprite = null;
            }
          });
        } else {
          console.warn('[AnimationTestScene] Using fallback because effect_slash_arc_up texture is missing');
        }

        // Spawn visual Sparks animation
        const hasSparks = this.textures.exists('effect_deflect_spark_01');
        if (hasSparks) {
          this.sparkSprite = this.add.image(PLAYER_X + sparkOffsetX, 860 + sparkOffsetY, 'effect_deflect_spark_01')
            .setOrigin(0.5, 1)
            .setScale(this.player.sprite.scale)
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
        } else {
          console.warn('[AnimationTestScene] Using fallback because spark textures are missing');
        }

        // Spawn visual redirected blaster bolt moving upward-right
        this.blasterState = 'REDIRECTED';
        this.redirectedBlaster = this.add.graphics();
        this.redirectedBlaster.fillStyle(0xff3300, 1);
        this.redirectedBlaster.fillRect(-22, -4, 44, 8);
        this.redirectedBlaster.fillStyle(0xffcc00, 1);
        this.redirectedBlaster.fillRect(-12, -2, 24, 4);
        this.redirectedBlaster.setPosition(BLASTER_CONTACT_X, BLASTER_CONTACT_Y);
        this.redirectedBlaster.setAngle(-35); // fly upwards-right

        this.tweens.add({
          targets: this.redirectedBlaster,
          x: BLASTER_CONTACT_X + 280,
          y: BLASTER_CONTACT_Y - 200,
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

    // 2. Spawn incoming red blaster bolt
    this.testBlaster = this.add.graphics();
    this.testBlaster.fillStyle(0xff2200, 1);
    this.testBlaster.fillRect(-30, -4, 60, 8);
    this.testBlaster.fillStyle(0xffaa00, 1);
    this.testBlaster.fillRect(-15, -2, 30, 4);
    this.testBlaster.setPosition(BLASTER_START_X, BLASTER_START_Y);

    // Tween the incoming blaster to arrive at BLASTER_CONTACT_X in exactly 185 ms
    this.tweens.add({
      targets: this.testBlaster,
      x: BLASTER_CONTACT_X,
      y: BLASTER_CONTACT_Y,
      duration: 185,
    });
  }

  private buildUI(): void {
    // Title Panel background card
    const cardX = 30;
    const cardY = 30;
    const cardW = 460;
    const cardH = 460;
    
    const gfx = this.add.graphics();
    gfx.fillStyle(0x050912, 0.85);
    gfx.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    gfx.lineStyle(1.5, 0x00ccff, 0.3);
    gfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    // Title label
    this.add.text(cardX + 20, cardY + 20, '🤖 ANIMATION TEST', {
      fontSize: '28px', fontFamily: FONT, color: '#ffb833', fontStyle: 'bold'
    });

    // Instructions/Guides
    const guides = [
      '1         : Play Idle',
      '2 / W / ↑ : Deflect Up Demo',
      '3 / S / ↓ : Deflect Down',
      '4 / D     : Force Reflect',
      '5 / Space : Force Power',
      'R         : Reset Idle',
      'ESC       : Back to Main Menu'
    ];

    guides.forEach((text, i) => {
      this.add.text(cardX + 20, cardY + 70 + i * 28, text, {
        fontSize: '18px', fontFamily: FONT, color: '#8899aa'
      });
    });

    // Divider line
    gfx.lineStyle(1, 0x334466, 0.5);
    gfx.lineBetween(cardX + 20, cardY + 280, cardX + cardW - 20, cardY + 280);

    // Live state status text
    this.statusText = this.add.text(cardX + 20, cardY + 295, '', {
      fontSize: '18px', fontFamily: FONT, color: '#ffffff', lineSpacing: 6
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

    // 1 -> Idle (resets buffer and goes to idle)
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.cleanupDemoOnly();
      this.player.playIdle();
      this.showMessage('Playing Idle animation', '#00ccff');
      return;
    }

    // 2 / W / Up -> Deflect Up Demo
    if (
      Phaser.Input.Keyboard.JustDown(this.key2) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.keyUp)
    ) {
      if (actionPlaying) {
        this.player.queueAction('deflect_up');
        this.showMessage('Buffered: Deflect Up', '#e5b800');
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
  }

  private refreshUI(): void {
    const action = this.player.getCurrentAction();
    const frameKey = this.player.getCurrentFrameKey();
    const frameIndex = this.player.getCurrentFrameIndex();
    const buffered = this.player.bufferedAction ? this.player.bufferedAction.toUpperCase() : 'NONE';
    
    // Status flag conditions
    const isActiveDeflect = this.player.isCurrentFrameActiveDeflect();
    const isChainExit = this.player.isCurrentFrameChainExit();
    
    const activeText = isActiveDeflect ? '⚡ ACTIVE DEFLECT FRAME ⚡' : 'no';
    const exitText = isChainExit ? '🚪 CHAIN EXIT FRAME' : 'no';
    
    const contactText = this.contactReached ? '💥 BLASTER CONTACT 💥' : 'no';

    const textLines = [
      `Action: ${action.toUpperCase()}`,
      `Frame Key: ${frameKey}`,
      `Frame Index: ${frameIndex}`,
      `Buffered Action: ${buffered}`,
      `Demo State: ${this.demoActive ? 'ACTIVE' : 'IDLE'}`,
      `Blaster State: ${this.blasterState}`,
      `Spark Frame: ${this.sparkFrameName}`,
      `Active Deflect: ${activeText}`,
      `Blaster Contact: ${contactText}`,
      `Chain Exit: ${exitText}`
    ];

    this.statusText.setText(textLines.join('\n'));

    // Visual feedback color changes
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
