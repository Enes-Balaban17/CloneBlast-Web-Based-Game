import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_X, PLAYER_Y } from '../game/constants';
import { Player } from '../entities/Player';
import { showGameplayGifBackground, hideGameplayGifBackground } from '../ui/GameplayGifBackground';
import { hideMenuGifBackground } from '../ui/MenuGifBackground';

const FONT = '"Courier New", Courier, monospace';

const PLAYER_ANIMATION_TESTS = [
  { id: 'idle',         label: 'Idle',         key: 'idle',         available: true,  loop: true },
  { id: 'deflect_up',   label: 'Deflect Up',   key: 'deflect_up',   available: true,  loop: false },
  { id: 'deflect_down', label: 'Deflect Down', key: 'deflect_down', available: false, loop: false },
  { id: 'reflect',      label: 'Force Reflect',key: 'reflect',      available: false, loop: false },
  { id: 'force',        label: 'Force Power',  key: 'force',        available: false, loop: false },
];

export class AnimationTestScene extends Phaser.Scene {
  private player!: Player;
  private statusText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer = 0;
  private activeDeflectDetected = false;
  private activeDeflectTimer = 0;

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

    // Setup UI elements
    this.buildUI();

    // Bind Keyboard keys
    this.bindKeyboard();

    this.showMessage('Animation Test Room Ready', '#00ff88');
  }

  update(time: number, delta: number): void {
    // Tick the player visual/animation timers
    this.player.update(time, delta);

    // Handle keys and play logic once per press
    this.handleKeyboardInputs();

    // Check if player reaches active frame of deflect up (player_deflect_up_05)
    const currentFrame = this.player.getCurrentFrameKey();
    if (currentFrame === 'player_deflect_up_05') {
      this.activeDeflectDetected = true;
      this.activeDeflectTimer = 80; // keep feedback visible for the frame's duration
    }

    if (this.activeDeflectTimer > 0) {
      this.activeDeflectTimer -= delta;
      if (this.activeDeflectTimer <= 0) {
        this.activeDeflectDetected = false;
      }
    }

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

    // 1 -> Idle
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
      if (this.player.isActionPlaying()) return; // ignore repeated triggers
      
      const success = this.player.playAction('deflect_up');
      if (success) {
        this.showMessage('Playing Deflect Up', '#00ff88');
      } else {
        this.showMessage('Deflect Up animation not available yet', '#ff4444');
      }
      return;
    }

    // 3 / S / Down -> Deflect Down (Unavailable)
    if (
      Phaser.Input.Keyboard.JustDown(this.key3) ||
      Phaser.Input.Keyboard.JustDown(this.keyS) ||
      Phaser.Input.Keyboard.JustDown(this.keyDown)
    ) {
      this.showMessage('Deflect Down animation not available yet', '#ff4444');
      return;
    }

    // 4 / D -> Force Reflect (Unavailable)
    if (Phaser.Input.Keyboard.JustDown(this.key4) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.showMessage('Force Reflect animation not available yet', '#ff4444');
      return;
    }

    // 5 / Space -> Force Power (Unavailable)
    if (Phaser.Input.Keyboard.JustDown(this.key5) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.showMessage('Force Power animation not available yet', '#ff4444');
      return;
    }
  }

  private refreshUI(): void {
    const animName = this.player.getCurrentAnimationName();
    const frameKey = this.player.getCurrentFrameKey();
    const activeText = this.activeDeflectDetected ? '⚡ ACTIVE DEFLECT FRAME ⚡' : 'no';

    const textLines = [
      `Anim: ${animName.toUpperCase()}`,
      `Frame: ${frameKey}`,
      `Active Deflect: ${activeText}`,
      `Position: X=${this.player.sprite.x} Y=${this.player.sprite.y}`
    ];

    this.statusText.setText(textLines.join('\n'));
    
    if (this.activeDeflectDetected) {
      this.statusText.setColor('#00ff88');
    } else {
      this.statusText.setColor('#ffffff');
    }
  }

  private showMessage(text: string, color: string): void {
    this.messageText.setText(text).setColor(color).setAlpha(1);
    this.messageTimer = 1800; // visible for 1.8s
  }
}
