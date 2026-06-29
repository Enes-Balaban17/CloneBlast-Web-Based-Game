import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, VALID_CONSONANTS, NAME_LENGTH } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import type { NameEntryData } from '../game/types';

export class NameEntryScene extends Phaser.Scene {
  private chars:        string[]                      = [];
  private displayText!: Phaser.GameObjects.Text;
  private feedbackText!:Phaser.GameObjects.Text;
  private score  = 0;
  private mode: 'campaign' | 'infinite' = 'campaign';

  private boundHandler!: (e: KeyboardEvent) => void;

  constructor() { super('NameEntryScene'); }

  create(data: NameEntryData): void {
    this.score = data?.score ?? 0;
    this.mode  = data?.mode  ?? 'campaign';
    this.chars = [];

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06000e);
    this.add.rectangle(GAME_WIDTH / 2, 4, GAME_WIDTH, 8, 0xffdd00, 0.7);

    // Heading
    this.add.text(GAME_WIDTH / 2, 160, '✦  NEW HIGH SCORE  ✦', {
      fontSize: '74px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffdd00',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 270, `Score: ${this.score.toLocaleString()}`, {
      fontSize: '44px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Instructions
    this.add.text(GAME_WIDTH / 2, 370, 'ENTER YOUR 5-LETTER NAME', {
      fontSize: '36px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 420, 'Consonants only:  B C D F G H J K L M N P R S T V Y Z', {
      fontSize: '24px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#445566',
    }).setOrigin(0.5);

    // Name display
    this.displayText = this.add.text(GAME_WIDTH / 2, 530, '_ _ _ _ _', {
      fontSize: '86px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#00ccff',
    }).setOrigin(0.5);

    // Feedback
    this.feedbackText = this.add.text(GAME_WIDTH / 2, 650, '', {
      fontSize: '32px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ff4444',
    }).setOrigin(0.5);

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 750, '[BACKSPACE] delete last  ·  [ENTER] confirm', {
      fontSize: '26px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#334455',
    }).setOrigin(0.5);

    // Keyboard listener
    this.boundHandler = this.handleKey.bind(this);
    this.input.keyboard!.on('keydown', this.boundHandler);
  }

  private handleKey(event: KeyboardEvent): void {
    const key = event.key.toUpperCase();

    if (event.key === 'Backspace') {
      this.chars.pop();
      this.feedbackText.setText('');
      this.refresh();
      return;
    }

    if (event.key === 'Enter') {
      this.confirm();
      return;
    }

    if (this.chars.length >= NAME_LENGTH) return;

    if (key.length === 1 && VALID_CONSONANTS.has(key)) {
      this.chars.push(key);
      this.feedbackText.setText('');
      this.refresh();
    } else if (key.length === 1 && /[A-Z]/.test(key)) {
      this.feedbackText.setText(`"${key}" is a vowel or invalid — consonants only!`);
    }
  }

  private refresh(): void {
    const slots = Array.from({ length: NAME_LENGTH }, (_, i) => this.chars[i] ?? '_');
    this.displayText.setText(slots.join(' '));
  }

  private confirm(): void {
    if (this.chars.length !== NAME_LENGTH) {
      this.feedbackText.setText(`Need exactly ${NAME_LENGTH} letters.`).setColor('#ff4444');
      return;
    }
    HighScoreSystem.save({
      name:  this.chars.join(''),
      score: this.score,
      mode:  this.mode,
    });
    this.scene.start('MainMenuScene');
  }

  shutdown(): void {
    this.input.keyboard?.off('keydown', this.boundHandler);
  }
}
