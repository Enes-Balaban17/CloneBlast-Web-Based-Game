import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X, PLAYER_Y } from '../game/constants';
import { Player } from '../entities/Player';
import { showGameplayGifBackground, hideGameplayGifBackground } from '../ui/GameplayGifBackground';
import { hideMenuGifBackground } from '../ui/MenuGifBackground';

const FONT = '"Courier New", Courier, monospace';

export class AnimationTestScene extends Phaser.Scene {
  private player!: Player;
  private statusText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer = 0;

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
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, hideGameplayGifBackground, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, hideGameplayGifBackground, this);

    // Empty background lines for visual ground reference
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.0); // transparent container
    this.add.rectangle(GAME_WIDTH / 2, 760, GAME_WIDTH, 6, 0x1a1a3a); // ground line Y=760

    // Setup player
    this.player = new Player(this);

    // Register onChainExitCallback for buffering testing
    this.player.onChainExitCallback = (actionId: string): boolean => {
      if (actionId === 'deflect_up') {
        const success = this.player.playAction('deflect_up');
        if (success) {
          this.showMessage('Buffering: Chained Deflect Up', '#00ff88');
        }
        return success;
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

    // Handle keys and play/queue logic once per press
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
      '2 / W / ↑ : Deflect Up',
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
      this.player.playIdle();
      this.showMessage('Animation Reset', '#ffffff');
      return;
    }

    const actionPlaying = this.player.isActionPlaying();

    // 1 -> Idle (resets buffer and goes to idle)
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.player.playIdle();
      this.showMessage('Playing Idle animation', '#00ccff');
      return;
    }

    // 2 / W / Up -> Deflect Up
    if (
      Phaser.Input.Keyboard.JustDown(this.key2) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.keyUp)
    ) {
      if (actionPlaying) {
        this.player.queueAction('deflect_up');
        this.showMessage('Buffered: Deflect Up', '#e5b800');
      } else {
        const success = this.player.playAction('deflect_up');
        if (success) {
          this.showMessage('Playing Deflect Up', '#00ff88');
        } else {
          this.showMessage('Deflect Up animation not available yet', '#ff4444');
        }
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

    const textLines = [
      `Action: ${action.toUpperCase()}`,
      `Frame Key: ${frameKey}`,
      `Frame Index: ${frameIndex}`,
      `Buffered Action: ${buffered}`,
      `Active Deflect: ${activeText}`,
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
}
