import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import { showMenuGifBackground, hideMenuGifBackground } from '../ui/MenuGifBackground';

// ════════════════════════════════════════════════════════════════════════════
// LAYOUT CONSTANTS  (all Y values are for a 1920×1080 canvas)
// ════════════════════════════════════════════════════════════════════════════

const CX   = GAME_WIDTH / 2;   // 960 – horizontal centre
const FONT = '"Courier New", Courier, monospace';

// ── Vertical rhythm ────────────────────────────────────────────────────────
const TITLE_Y            = 148;   // centre of main logo
const TAGLINE_Y          = 284;   // centre of tagline text
const BUTTON_START_Y     = 410;   // centre of first (campaign) button
const BUTTON_GAP         = 120;   // centre-to-centre distance between buttons

// ── High score panel ───────────────────────────────────────────────────────
// Fixed geometry — never resizes based on number of entries.
const HS_PANEL_W          = 680;   // panel width
const HS_PANEL_H          = 226;   // fixed height: header(68) + 3×row(48) + footer(14) + 8 rounding
const HS_PANEL_CENTER_Y   = 660;   // panel vertical centre
const HS_HEADER_H         = 68;    // height reserved for title row
const HS_ROW_H            = 48;    // height per score row (3 rows × 48 = 144)
const HS_MAX_ROWS         = 3;     // always render exactly 3 row slots

// Derived: panel top / bottom edges (for safety assertions / future use)
// Top  = HS_PANEL_CENTER_Y - HS_PANEL_H/2  →  660 - 113 = 547
// Bottom = HS_PANEL_CENTER_Y + HS_PANEL_H/2 →  660 + 113 = 773  (<< 890 safe-bottom)
const SAFE_BOTTOM_Y       = 890;   // panel must never extend below this

// ── Disclaimer ─────────────────────────────────────────────────────────────
// Anchored to the very bottom of the canvas, completely independent of panel.
const DISCLAIMER_Y        = 1022;  // top of disclaimer text block
const DISCLAIMER_WRAP_W   = 1040;  // word-wrap width in pixels

// ── Button dimensions ──────────────────────────────────────────────────────
const BTN_W = 560;
const BTN_H = 90;

// ════════════════════════════════════════════════════════════════════════════
export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    showMenuGifBackground();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, hideMenuGifBackground, this);

    this.buildTitle();
    this.buildButtons();
    this.buildHighScores();
    this.buildDisclaimer();   // always drawn last, always at DISCLAIMER_Y
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TITLE + TAGLINE
  // ════════════════════════════════════════════════════════════════════════════

  private buildTitle(): void {
    // Outer glow halo
    this.add.text(CX, TITLE_Y, 'CLONE BLAST', {
      fontSize: '110px', fontFamily: FONT, fontStyle: 'bold',
      color: '#7a5c00', stroke: '#b88800', strokeThickness: 36,
    } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5).setAlpha(0.30);

    // Mid-glow layer
    this.add.text(CX, TITLE_Y, 'CLONE BLAST', {
      fontSize: '110px', fontFamily: FONT, fontStyle: 'bold',
      color: '#3a2800', stroke: '#e8a800', strokeThickness: 22,
    } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5).setAlpha(0.55);

    // Main title — near-black fill, crisp gold outline
    this.add.text(CX, TITLE_Y, 'CLONE BLAST', {
      fontSize: '110px', fontFamily: FONT, fontStyle: 'bold',
      color: '#060400', stroke: '#ffd84a', strokeThickness: 14,
    } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5);

    // Tagline — old-style muted steel-blue
    this.add.text(CX, TAGLINE_Y, 'Bring Balance to the Force', {
      fontSize: '30px', fontFamily: FONT, color: '#556688',
    }).setOrigin(0.5);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BUTTONS
  // ════════════════════════════════════════════════════════════════════════════

  private buildButtons(): void {
    this.makeMenuButton(
      CX, BUTTON_START_Y,
      '▶  CAMPAIGN MODE', 0x0099cc, '#00ccff',
      () => { hideMenuGifBackground(); this.scene.start('CampaignScene', { mode: 'campaign', stage: 1 }); },
    );
    this.makeMenuButton(
      CX, BUTTON_START_Y + BUTTON_GAP,
      '∞  INFINITE MODE',  0xcc7700, '#ff9900',
      () => { hideMenuGifBackground(); this.scene.start('InfiniteScene', { mode: 'infinite' }); },
    );
  }

  private makeMenuButton(
    cx: number, cy: number,
    label: string,
    borderHex: number, accentCss: string,
    cb: () => void,
  ): void {
    const bx = cx - BTN_W / 2;
    const by = cy - BTN_H / 2;
    const gfx = this.add.graphics();

    const drawNormal = () => {
      gfx.clear();
      gfx.fillStyle(0x0a0f1e, 0.80); gfx.fillRoundedRect(bx, by, BTN_W, BTN_H, 8);
      gfx.lineStyle(2, borderHex, 0.65); gfx.strokeRoundedRect(bx, by, BTN_W, BTN_H, 8);
    };
    const drawHover = () => {
      gfx.clear();
      gfx.fillStyle(0x101830, 0.92); gfx.fillRoundedRect(bx, by, BTN_W, BTN_H, 8);
      gfx.lineStyle(2.5, borderHex, 1.0); gfx.strokeRoundedRect(bx, by, BTN_W, BTN_H, 8);
    };
    drawNormal();

    const txt = this.add.text(cx, cy, label, {
      fontSize: '48px', fontFamily: FONT,
      color: '#ffffff', stroke: accentCss, strokeThickness: 3,
    }).setOrigin(0.5);

    const zone = this.add.zone(cx, cy, BTN_W, BTN_H).setInteractive({ useHandCursor: true });
    zone.on('pointerover',  () => { drawHover();  txt.setColor(accentCss); });
    zone.on('pointerout',   () => { drawNormal(); txt.setColor('#ffffff'); });
    zone.on('pointerdown',  cb);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HIGH SCORE PANEL  —  Fixed size, always room for exactly 3 rows
  // ════════════════════════════════════════════════════════════════════════════

  private buildHighScores(): void {
    const scores  = HighScoreSystem.getScores();
    const panelX  = CX - HS_PANEL_W / 2;
    const panelTop= HS_PANEL_CENTER_Y - HS_PANEL_H / 2;

    // Safety assertion (development-time only)
    const panelBottom = panelTop + HS_PANEL_H;
    if (panelBottom > SAFE_BOTTOM_Y) {
      console.warn(`[MainMenu] HS panel bottom ${panelBottom} exceeds SAFE_BOTTOM_Y ${SAFE_BOTTOM_Y}`);
    }

    // ── Card background ────────────────────────────────────────────────────
    const gfx = this.add.graphics();
    gfx.fillStyle(0x050912, 0.72);
    gfx.fillRoundedRect(panelX, panelTop, HS_PANEL_W, HS_PANEL_H, 10);
    gfx.lineStyle(1.5, 0x00ccff, 0.28);
    gfx.strokeRoundedRect(panelX, panelTop, HS_PANEL_W, HS_PANEL_H, 10);

    // ── Header ─────────────────────────────────────────────────────────────
    this.add.text(CX, panelTop + HS_HEADER_H / 2, '— HIGH SCORES —', {
      fontSize: '24px', fontFamily: FONT, color: '#ffb833',
    }).setOrigin(0.5, 0.5);

    // Separator under header
    gfx.lineStyle(1, 0x334466, 0.55);
    gfx.lineBetween(panelX + 18, panelTop + HS_HEADER_H, panelX + HS_PANEL_W - 18, panelTop + HS_HEADER_H);

    // ── Score rows (always exactly HS_MAX_ROWS slots rendered) ─────────────
    const rowCols = ['#ffdd44', '#cccccc', '#cc9944'];
    const firstRowCY = panelTop + HS_HEADER_H + HS_ROW_H / 2;

    for (let i = 0; i < HS_MAX_ROWS; i++) {
      const y      = firstRowCY + i * HS_ROW_H;
      const entry  = scores[i];                       // undefined when no entry
      const col    = rowCols[i] ?? '#aaaaaa';
      const dimCol = '#2a3a4a';

      if (entry) {
        // Rank
        this.add.text(panelX + 28, y, `${i + 1}.`, {
          fontSize: '22px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);

        // Name
        this.add.text(panelX + 80, y, entry.name, {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);

        // Score  (right-aligned to the midpoint of the panel)
        this.add.text(panelX + HS_PANEL_W * 0.62, y, entry.score.toLocaleString(), {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(1, 0.5);

        // Mode tag
        this.add.text(panelX + HS_PANEL_W - 22, y, `[${entry.mode}]`, {
          fontSize: '18px', fontFamily: FONT, color: '#445566',
        }).setOrigin(1, 0.5);

      } else {
        // Empty slot placeholder — subtle, keeps row height consistent
        this.add.text(panelX + 28, y, `${i + 1}.`, {
          fontSize: '22px', fontFamily: FONT, color: dimCol,
        }).setOrigin(0, 0.5);

        this.add.text(panelX + 80, y, '—', {
          fontSize: '22px', fontFamily: FONT, color: dimCol,
        }).setOrigin(0, 0.5);
      }
    }

    // "No scores yet" overlay when table is completely empty
    if (scores.length === 0) {
      this.add.text(CX, firstRowCY + HS_ROW_H, 'No scores yet', {
        fontSize: '22px', fontFamily: FONT, color: '#2a3a4a',
      }).setOrigin(0.5, 0.5);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DISCLAIMER  —  FIXED at bottom of canvas, independent of all other layout
  // ════════════════════════════════════════════════════════════════════════════

  private buildDisclaimer(): void {
    const text =
      'This is an open-source, fan-made game and is not affiliated with Lucasfilm Ltd., ' +
      'The Walt Disney Company, Disney, or the official Star Wars brand. Original source code is released ' +
      'under the MIT License. Star Wars and related elements are trademarks and copyrights of Lucasfilm Ltd. ' +
      'For DMCA, copyright, trademark, licensing, or other IP concerns: balabanenes111@icloud.com';

    this.add.text(CX, DISCLAIMER_Y, text, {
      fontSize: '14px',
      fontFamily: FONT,
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: DISCLAIMER_WRAP_W, useAdvancedWrap: false },
    }).setOrigin(0.5, 0).setAlpha(0.88);
  }
}
