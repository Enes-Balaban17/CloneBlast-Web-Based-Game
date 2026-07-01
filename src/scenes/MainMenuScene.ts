import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import { showMenuGifBackground, hideMenuGifBackground } from '../ui/MenuGifBackground';

// ── Layout constants ──────────────────────────────────────────────────────────
const CX = GAME_WIDTH  / 2;   // 960
const FONT = '"Courier New", Courier, monospace';

// Button dimensions — both buttons are identical
const BTN_W     = 560;
const BTN_H     = 90;
const BTN_PAD_X = 36;
const BTN_PAD_Y = 20;

// Vertical rhythm
const TITLE_Y      = 148;
const TAGLINE_Y    = 284;
const BTN1_Y       = 410;
const BTN2_Y       = 530;
const HS_PANEL_Y   = 720;  // centre of high-score card
const HS_PANEL_W   = 720;
const DISC_Y       = 1020;

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    showMenuGifBackground();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, hideMenuGifBackground, this);

    this.buildTitle();
    this.buildButtons();
    this.buildHighScores();
    this.buildDisclaimer();
    this.buildControlsHint();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TITLE
  // ════════════════════════════════════════════════════════════════════════════

  private buildTitle(): void {
    // Glow layer — blurred duplicate behind the real text
    this.add.text(CX, TITLE_Y + 3, 'CLONE BLAST', {
      fontSize: '104px',
      fontFamily: FONT,
      color: '#0077aa',
      stroke: '#001833',
      strokeThickness: 28,
      alpha: 0.6,
    } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5).setAlpha(0.45);

    // Main title
    this.add.text(CX, TITLE_Y, 'CLONE BLAST', {
      fontSize: '104px',
      fontFamily: FONT,
      color: '#e0f8ff',
      stroke: '#002244',
      strokeThickness: 14,
    }).setOrigin(0.5);

    // Tagline
    this.add.text(CX, TAGLINE_Y, 'Bring Balance to the Force', {
      fontSize: '30px',
      fontFamily: FONT,
      color: '#7ab8cc',
      stroke: '#001122',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0.88);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BUTTONS
  // ════════════════════════════════════════════════════════════════════════════

  private buildButtons(): void {
    this.makeMenuButton(
      CX, BTN1_Y,
      '▶   CAMPAIGN MODE',
      0x00aadd,
      '#00ccff',
      () => {
        hideMenuGifBackground();
        this.scene.start('CampaignScene', { mode: 'campaign', stage: 1 });
      },
    );

    this.makeMenuButton(
      CX, BTN2_Y,
      '∞   INFINITE MODE',
      0xdd7700,
      '#ff9900',
      () => {
        hideMenuGifBackground();
        this.scene.start('InfiniteScene', { mode: 'infinite' });
      },
    );
  }

  /**
   * Draws a fixed-size translucent button using Graphics + Text.
   * Both buttons share identical dimensions (BTN_W × BTN_H) so they
   * are perfectly symmetrical.
   */
  private makeMenuButton(
    cx: number,
    cy: number,
    label: string,
    borderColorHex: number,
    accentCss: string,
    cb: () => void,
  ): void {
    const x = cx - BTN_W / 2;
    const y = cy - BTN_H / 2;

    // Panel graphics (background + border)
    const gfx = this.add.graphics();
    // Dark translucent fill
    gfx.fillStyle(0x080d1a, 0.75);
    gfx.fillRoundedRect(x, y, BTN_W, BTN_H, 8);
    // Subtle border
    gfx.lineStyle(2, borderColorHex, 0.7);
    gfx.strokeRoundedRect(x, y, BTN_W, BTN_H, 8);

    // Label text
    const txt = this.add.text(cx, cy, label, {
      fontSize: '36px',
      fontFamily: FONT,
      color: '#d8f0ff',
      stroke: '#001122',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Invisible hit zone (same size as the visible panel)
    const zone = this.add
      .zone(cx, cy, BTN_W, BTN_H)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      gfx.clear();
      gfx.fillStyle(0x0e1e36, 0.9);
      gfx.fillRoundedRect(x, y, BTN_W, BTN_H, 8);
      gfx.lineStyle(2.5, borderColorHex, 1);
      gfx.strokeRoundedRect(x, y, BTN_W, BTN_H, 8);
      txt.setColor(accentCss);
    });

    zone.on('pointerout', () => {
      gfx.clear();
      gfx.fillStyle(0x080d1a, 0.75);
      gfx.fillRoundedRect(x, y, BTN_W, BTN_H, 8);
      gfx.lineStyle(2, borderColorHex, 0.7);
      gfx.strokeRoundedRect(x, y, BTN_W, BTN_H, 8);
      txt.setColor('#d8f0ff');
    });

    zone.on('pointerdown', cb);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HIGH SCORES
  // ════════════════════════════════════════════════════════════════════════════

  private buildHighScores(): void {
    const scores   = HighScoreSystem.getScores();
    const rowCount = Math.max(scores.length, 1); // at least 1 row for empty state
    const rowH     = 56;
    const headerH  = 80;
    const footerH  = 20;
    const panelH   = headerH + rowCount * rowH + footerH;
    const panelTop = HS_PANEL_Y - panelH / 2;
    const panelX   = CX - HS_PANEL_W / 2;

    const gfx = this.add.graphics();

    // Background card
    gfx.fillStyle(0x050912, 0.72);
    gfx.fillRoundedRect(panelX, panelTop, HS_PANEL_W, panelH, 10);

    // Top cyan separator line
    gfx.lineStyle(1.5, 0x00ccff, 0.35);
    gfx.strokeRoundedRect(panelX, panelTop, HS_PANEL_W, panelH, 10);

    // Header
    this.add.text(CX, panelTop + 28, '— HIGH SCORES —', {
      fontSize: '26px',
      fontFamily: FONT,
      color: '#ffb833',
    }).setOrigin(0.5, 0.5);

    // Separator line under header
    gfx.lineStyle(1, 0x334466, 0.6);
    gfx.lineBetween(panelX + 20, panelTop + headerH - 6, panelX + HS_PANEL_W - 20, panelTop + headerH - 6);

    // Rows
    const rowStartY = panelTop + headerH + rowH / 2;
    const rowCols   = ['#ffdd44', '#cccccc', '#cc9944'];

    if (scores.length === 0) {
      this.add.text(CX, rowStartY, 'No scores yet', {
        fontSize: '24px',
        fontFamily: FONT,
        color: '#334455',
      }).setOrigin(0.5);
    } else {
      scores.forEach((entry, i) => {
        const y   = rowStartY + i * rowH;
        const col = rowCols[i] ?? '#aaaaaa';

        // Rank
        this.add.text(panelX + 32, y, `${i + 1}.`, {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);

        // Name
        this.add.text(panelX + 88, y, entry.name, {
          fontSize: '26px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);

        // Score (right-aligned to mid-point)
        this.add.text(panelX + HS_PANEL_W / 2 + 40, y, entry.score.toLocaleString(), {
          fontSize: '26px', fontFamily: FONT, color: col,
        }).setOrigin(1, 0.5);

        // Mode tag
        this.add.text(panelX + HS_PANEL_W - 32, y, `[${entry.mode}]`, {
          fontSize: '20px', fontFamily: FONT, color: '#445566',
        }).setOrigin(1, 0.5);
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LEGAL DISCLAIMER
  // ════════════════════════════════════════════════════════════════════════════

  private buildDisclaimer(): void {
    const lines = [
      'This is an open-source, fan-made game. Not affiliated with, endorsed by, or approved by',
      'Lucasfilm Ltd., Disney, or the Star Wars brand. Code released under MIT License.',
      'Star Wars trademarks © Lucasfilm Ltd.  DMCA / IP: balabanenes111@icloud.com',
    ];

    lines.forEach((line, i) => {
      this.add.text(CX, DISC_Y + i * 22, line, {
        fontSize: '16px',
        fontFamily: FONT,
        color: '#778899',
      }).setOrigin(0.5, 0.5).setAlpha(0.38);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CONTROLS HINT
  // ════════════════════════════════════════════════════════════════════════════

  private buildControlsHint(): void {
    // Removed — the disclaimer now occupies the very bottom strip.
    // Controls are shown in-game via the debug text overlay.
  }
}
