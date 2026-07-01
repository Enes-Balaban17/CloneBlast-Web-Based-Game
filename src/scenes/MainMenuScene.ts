import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import { showMenuGifBackground, hideMenuGifBackground } from '../ui/MenuGifBackground';

// ── Layout ────────────────────────────────────────────────────────────────────
const CX   = GAME_WIDTH / 2;   // 960
const FONT = '"Courier New", Courier, monospace';

// Vertical rhythm
const TITLE_Y    = 148;
const TAGLINE_Y  = 284;
const BTN1_Y     = 410;
const BTN2_Y     = 530;
const HS_PANEL_W = 720;
const HS_PANEL_Y = 726;

// Button frame — both identical
const BTN_W = 560;
const BTN_H = 90;

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    showMenuGifBackground();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, hideMenuGifBackground, this);

    this.buildTitle();
    this.buildButtons();
    this.buildHighScores();
    this.buildDisclaimer();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TITLE  —  Black fill · Thick gold stroke (Star Wars-inspired heavy logo)
  // ════════════════════════════════════════════════════════════════════════════

  private buildTitle(): void {
    // Outer glow halo — wide, muted gold, low alpha
    this.add.text(CX, TITLE_Y, 'CLONE BLAST', {
      fontSize: '110px',
      fontFamily: FONT,
      fontStyle: 'bold',
      color: '#7a5c00',
      stroke: '#b88800',
      strokeThickness: 36,
    } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5)
      .setAlpha(0.30);

    // Mid-glow layer — brighter gold, slightly smaller spread
    this.add.text(CX, TITLE_Y, 'CLONE BLAST', {
      fontSize: '110px',
      fontFamily: FONT,
      fontStyle: 'bold',
      color: '#3a2800',
      stroke: '#e8a800',
      strokeThickness: 22,
    } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5)
      .setAlpha(0.55);

    // Main title — near-black fill, crisp gold outline
    this.add.text(CX, TITLE_Y, 'CLONE BLAST', {
      fontSize: '110px',
      fontFamily: FONT,
      fontStyle: 'bold',
      color: '#060400',
      stroke: '#ffd84a',
      strokeThickness: 14,
    } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5);

    // Tagline — old style: muted steel-blue, 30px, same Courier New
    this.add.text(CX, TAGLINE_Y, 'Bring Balance to the Force', {
      fontSize: '30px',
      fontFamily: FONT,
      color: '#556688',
    }).setOrigin(0.5);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BUTTONS  —  Current frame kept · Old font / icon / color / glow restored
  // ════════════════════════════════════════════════════════════════════════════

  private buildButtons(): void {
    this.makeMenuButton(
      CX, BTN1_Y,
      '▶  CAMPAIGN MODE',
      0x0099cc,       // border hex
      '#00ccff',      // accent CSS (cyan)
      () => {
        hideMenuGifBackground();
        this.scene.start('CampaignScene', { mode: 'campaign', stage: 1 });
      },
    );

    this.makeMenuButton(
      CX, BTN2_Y,
      '∞  INFINITE MODE',
      0xcc7700,       // border hex
      '#ff9900',      // accent CSS (gold)
      () => {
        hideMenuGifBackground();
        this.scene.start('InfiniteScene', { mode: 'infinite' });
      },
    );
  }

  private makeMenuButton(
    cx: number,
    cy: number,
    label: string,
    borderColorHex: number,
    accentCss: string,
    cb: () => void,
  ): void {
    const bx = cx - BTN_W / 2;
    const by = cy - BTN_H / 2;

    // ── Panel graphics (frame) — same as current build ────────────────────
    const gfx = this.add.graphics();

    const drawNormal = () => {
      gfx.clear();
      gfx.fillStyle(0x0a0f1e, 0.80);
      gfx.fillRoundedRect(bx, by, BTN_W, BTN_H, 8);
      gfx.lineStyle(2, borderColorHex, 0.65);
      gfx.strokeRoundedRect(bx, by, BTN_W, BTN_H, 8);
    };

    const drawHover = () => {
      gfx.clear();
      gfx.fillStyle(0x101830, 0.92);
      gfx.fillRoundedRect(bx, by, BTN_W, BTN_H, 8);
      gfx.lineStyle(2.5, borderColorHex, 1.0);
      gfx.strokeRoundedRect(bx, by, BTN_W, BTN_H, 8);
    };

    drawNormal();

    // ── Label text — old style: 52px, white with colored stroke glow ──────
    const txt = this.add.text(cx, cy, label, {
      fontSize: '48px',
      fontFamily: FONT,
      color: '#ffffff',
      stroke: accentCss,
      strokeThickness: 3,
      padding: { x: 0, y: 0 },
    }).setOrigin(0.5);

    // ── Invisible interactive zone exactly matching the frame ─────────────
    const zone = this.add
      .zone(cx, cy, BTN_W, BTN_H)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      drawHover();
      txt.setColor(accentCss);
    });

    zone.on('pointerout', () => {
      drawNormal();
      txt.setColor('#ffffff');
    });

    zone.on('pointerdown', cb);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HIGH SCORES
  // ════════════════════════════════════════════════════════════════════════════

  private buildHighScores(): void {
    const scores   = HighScoreSystem.getScores();
    const rowCount = Math.max(scores.length, 1);
    const rowH     = 56;
    const headerH  = 80;
    const footerH  = 20;
    const panelH   = headerH + rowCount * rowH + footerH;
    const panelTop = HS_PANEL_Y - panelH / 2;
    const panelX   = CX - HS_PANEL_W / 2;

    const gfx = this.add.graphics();

    gfx.fillStyle(0x050912, 0.72);
    gfx.fillRoundedRect(panelX, panelTop, HS_PANEL_W, panelH, 10);
    gfx.lineStyle(1.5, 0x00ccff, 0.30);
    gfx.strokeRoundedRect(panelX, panelTop, HS_PANEL_W, panelH, 10);

    this.add.text(CX, panelTop + 28, '— HIGH SCORES —', {
      fontSize: '26px',
      fontFamily: FONT,
      color: '#ffb833',
    }).setOrigin(0.5, 0.5);

    gfx.lineStyle(1, 0x334466, 0.55);
    gfx.lineBetween(
      panelX + 20, panelTop + headerH - 6,
      panelX + HS_PANEL_W - 20, panelTop + headerH - 6,
    );

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

        this.add.text(panelX + 32, y, `${i + 1}.`, {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);

        this.add.text(panelX + 88, y, entry.name, {
          fontSize: '26px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);

        this.add.text(panelX + HS_PANEL_W / 2 + 40, y, entry.score.toLocaleString(), {
          fontSize: '26px', fontFamily: FONT, color: col,
        }).setOrigin(1, 0.5);

        this.add.text(panelX + HS_PANEL_W - 32, y, `[${entry.mode}]`, {
          fontSize: '20px', fontFamily: FONT, color: '#445566',
        }).setOrigin(1, 0.5);
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DISCLAIMER  —  White, readable, small, below high score table
  // ════════════════════════════════════════════════════════════════════════════

  private buildDisclaimer(): void {
    // Dynamic disclaimer Y: just below the high score panel
    const scores   = HighScoreSystem.getScores();
    const rowCount = Math.max(scores.length, 1);
    const panelH   = 80 + rowCount * 56 + 20;
    const panelBot = (HS_PANEL_Y - panelH / 2) + panelH;
    const startY   = panelBot + 22;

    const lines = [
      'This is an open-source, fan-made game and is not affiliated with Lucasfilm Ltd.,',
      'The Walt Disney Company, Disney, or the official Star Wars brand. Original source',
      'code is released under the MIT License. Star Wars and related elements are trademarks',
      'and copyrights of Lucasfilm Ltd. DMCA / IP: balabanenes111@icloud.com',
    ];

    lines.forEach((line, i) => {
      this.add.text(CX, startY + i * 22, line, {
        fontSize: '17px',
        fontFamily: FONT,
        color: '#ffffff',
      }).setOrigin(0.5, 0).setAlpha(0.88);
    });
  }
}
