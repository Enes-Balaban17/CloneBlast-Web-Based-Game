import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  VALID_CONSONANTS, NAME_LENGTH, NAME_MIN_LENGTH,
} from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import type { NameEntryData } from '../game/types';

// ── Layout ────────────────────────────────────────────────────────────────────
const CX = GAME_WIDTH  / 2;  // horizontal centre
const CY = GAME_HEIGHT / 2;  // vertical centre

// Panel card dimensions
const PANEL_W = 860;
const PANEL_H = 620;
const PANEL_X = CX;
const PANEL_Y = CY + 20;

const FONT = '"Courier New", Courier, monospace';

export class NameEntryScene extends Phaser.Scene {
  private chars:        string[] = [];
  private displayText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private saveBtn!:     Phaser.GameObjects.Text;
  private score  = 0;
  private mode: 'campaign' | 'infinite' = 'campaign';

  private boundKeyHandler!: (e: KeyboardEvent) => void;

  constructor() { super('NameEntryScene'); }

  // ════════════════════════════════════════════════════════════════════════════
  // CREATE
  // ════════════════════════════════════════════════════════════════════════════

  create(data: NameEntryData): void {
    this.score = data?.score ?? 0;
    this.mode  = data?.mode  ?? 'campaign';
    this.chars = [];

    this.buildBackground();
    this.buildPanel();

    // Keyboard listener
    this.boundKeyHandler = this.handleKey.bind(this);
    this.input.keyboard!.on('keydown', this.boundKeyHandler);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BACKGROUND
  // ════════════════════════════════════════════════════════════════════════════

  private buildBackground(): void {
    // Full-screen dark overlay
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, 0x06000e, 0.92);
    // Gold accent bar at top
    this.add.rectangle(CX, 4, GAME_WIDTH, 8, 0xffdd00, 0.7);

    // Score badge above panel
    this.add.text(CX, 130, '✦  NEW HIGH SCORE  ✦', {
      fontSize: '68px',
      fontFamily: FONT,
      color: '#ffdd00',
    }).setOrigin(0.5).setDepth(10);

    this.add.text(CX, 218, `Score: ${this.score.toLocaleString()}`, {
      fontSize: '42px',
      fontFamily: FONT,
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(10);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PANEL
  // ════════════════════════════════════════════════════════════════════════════

  private buildPanel(): void {
    // Card background
    const panel = this.add.rectangle(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 0x0e0a20, 1)
      .setStrokeStyle(3, 0x334466)
      .setDepth(10);

    const top  = PANEL_Y - PANEL_H / 2;   // top edge of card
    const left = PANEL_X - PANEL_W / 2;

    // ── X close button (top-right of panel) ─────────────────────────────────
    const closeBtn = this.add.text(left + PANEL_W - 24, top + 24, '✕', {
      fontSize: '40px',
      fontFamily: FONT,
      color: '#556677',
      backgroundColor: '#00000000',
      padding: { x: 10, y: 4 },
    })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(15);

    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4444').setScale(1.1));
    closeBtn.on('pointerout',  () => closeBtn.setColor('#556677').setScale(1.0));
    closeBtn.on('pointerdown', () => this.dismiss());

    // ── Instructions ─────────────────────────────────────────────────────────
    this.add.text(PANEL_X, top + 70, 'ENTER YOUR NAME', {
      fontSize: '38px',
      fontFamily: FONT,
      color: '#aaaacc',
    }).setOrigin(0.5, 0).setDepth(11);

    this.add.text(PANEL_X, top + 130, 'Enter 3–5 letters', {
      fontSize: '26px',
      fontFamily: FONT,
      color: '#8899aa',
    }).setOrigin(0.5, 0).setDepth(11);

    this.add.text(PANEL_X, top + 168, 'You can use only consonant letters.', {
      fontSize: '22px',
      fontFamily: FONT,
      color: '#445566',
    }).setOrigin(0.5, 0).setDepth(11);

    // ── Name display ─────────────────────────────────────────────────────────
    this.displayText = this.add.text(PANEL_X, PANEL_Y - 20, this.buildSlots(), {
      fontSize: '88px',
      fontFamily: FONT,
      color: '#00ccff',
      stroke: '#003355',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12);

    // ── Validation feedback ───────────────────────────────────────────────────
    this.feedbackText = this.add.text(PANEL_X, PANEL_Y + 115, '', {
      fontSize: '28px',
      fontFamily: FONT,
      color: '#ff5555',
    }).setOrigin(0.5).setDepth(12);

    // ── Action buttons ────────────────────────────────────────────────────────
    const btnY = top + PANEL_H - 70;

    // SAVE button
    this.saveBtn = this.makeBtn(PANEL_X - 160, btnY, '✔  SAVE', '#00ff88', () => this.confirm());

    // SKIP button
    this.makeBtn(PANEL_X + 160, btnY, '→  SKIP', '#ff9900', () => this.dismiss());

    // ── Keyboard hint ─────────────────────────────────────────────────────────
    this.add.text(PANEL_X, top + PANEL_H - 24, '[BACKSPACE] delete  ·  [ENTER] save  ·  [ESC] skip', {
      fontSize: '20px',
      fontFamily: FONT,
      color: '#2a3040',
    }).setOrigin(0.5, 1).setDepth(11);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // KEYBOARD
  // ════════════════════════════════════════════════════════════════════════════

  private handleKey(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.dismiss();
        return;

      case 'Enter':
        this.confirm();
        return;

      case 'Backspace':
        this.chars.pop();
        this.clearFeedback();
        this.refresh();
        return;
    }

    // Reject if already at max
    if (this.chars.length >= NAME_LENGTH) return;

    // Only consider single printable characters
    if (event.key.length !== 1) return;

    const upper = event.key.toUpperCase();

    if (VALID_CONSONANTS.has(upper)) {
      this.chars.push(upper);
      this.clearFeedback();
      this.refresh();
    } else {
      // Explain rejection briefly
      this.feedbackText.setText('Use 3–5 consonant letters.').setColor('#ff5555');
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  /** Save only if name is valid (3–5 consonants). */
  private confirm(): void {
    const len = this.chars.length;
    if (len < NAME_MIN_LENGTH) {
      this.feedbackText
        .setText(`Use 3–5 consonant letters.`)
        .setColor('#ff5555');
      return;
    }
    HighScoreSystem.save({
      name:  this.chars.join(''),
      score: this.score,
      mode:  this.mode,
    });
    this.exit();
  }

  /** Close without saving — ESC, X button, or Skip button. */
  private dismiss(): void {
    this.exit();
  }

  private exit(): void {
    this.scene.start('MainMenuScene');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════════════════════

  /** Refresh the name display slots (max 5, rest shown as _). */
  private refresh(): void {
    this.displayText.setText(this.buildSlots());
    // Dim Save button when name is too short
    const valid = this.chars.length >= NAME_MIN_LENGTH;
    this.saveBtn.setColor(valid ? '#00ff88' : '#2a4a3a');
  }

  private buildSlots(): string {
    return Array.from({ length: NAME_LENGTH }, (_, i) => this.chars[i] ?? '_').join(' ');
  }

  private clearFeedback(): void {
    this.feedbackText.setText('');
  }

  private makeBtn(
    x: number, y: number,
    label: string, accent: string,
    cb: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      fontSize: '38px',
      fontFamily: FONT,
      color: '#ffffff',
      backgroundColor: '#111122',
      padding: { x: 28, y: 12 },
      stroke: accent,
      strokeThickness: 2,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(13);

    btn.on('pointerover', () => btn.setColor(accent).setScale(1.06));
    btn.on('pointerout',  () => btn.setColor('#ffffff').setScale(1.0));
    btn.on('pointerdown', cb);
    return btn;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════════════════════

  shutdown(): void {
    this.input.keyboard?.off('keydown', this.boundKeyHandler);
  }
}
