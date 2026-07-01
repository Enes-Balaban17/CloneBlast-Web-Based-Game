import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import { showMenuGifBackground, hideMenuGifBackground } from '../ui/MenuGifBackground';

// ════════════════════════════════════════════════════════════════════════════
// LAYOUT CONSTANTS  (1920 × 1080 canvas)
// ════════════════════════════════════════════════════════════════════════════

const CX   = GAME_WIDTH / 2;   // 960 – horizontal centre
const FONT = '"Courier New", Courier, monospace';

// ── Logo ──────────────────────────────────────────────────────────────────
const LOGO_KEY        = 'logo_main';   // texture key loaded in PreloadScene
const LOGO_CENTER_Y   = 120;           // vertical centre of the logo image
const LOGO_MAX_WIDTH  = 720;           // max display width  (px) — scales down if needed
const LOGO_MAX_HEIGHT = 180;           // max display height (px) — preserves aspect ratio

// ── Tagline ───────────────────────────────────────────────────────────────
const TAGLINE_Y       = 258;           // centred under the logo

// ── Buttons ───────────────────────────────────────────────────────────────
const BUTTON_START_Y  = 370;           // Campaign button centre
const BUTTON_GAP      = 110;           // centre-to-centre → Infinite at 480
const BTN_W           = 560;
const BTN_H           = 90;

// ── High score panel ──────────────────────────────────────────────────────
// Infinite button bottom = 480 + 45 = 525
// Panel top = 660 − 113 = 547  →  gap = 547 − 525 = 22 px (plus row spacing)
// Adjusted: panel centre at 695 → top = 582, gap = 57 px  ✓
const HS_PANEL_W        = 660;
const HS_PANEL_H        = 226;   // fixed — header(68) + 3×row(48) + footer(14) + rounding(8)
const HS_PANEL_CENTER_Y = 695;   // panel centre; bottom = 695+113 = 808 (well under SAFE_BOTTOM_Y)
const HS_HEADER_H       = 68;
const HS_ROW_H          = 48;
const HS_MAX_ROWS       = 3;
const SAFE_BOTTOM_Y     = 890;   // panel must never exceed this

// ── Disclaimer ────────────────────────────────────────────────────────────
// Hard-anchored to screen bottom — NEVER shifts with panel.
// Disclaimer top = 1030; panel bottom = 808  →  gap = 222 px  ✓
const DISCLAIMER_Y      = 1030;
const DISCLAIMER_WRAP_W = 1100;

// ════════════════════════════════════════════════════════════════════════════
export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    showMenuGifBackground();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, hideMenuGifBackground, this);

    this.buildLogo();
    this.buildButtons();
    this.buildHighScores();
    this.buildDisclaimer();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LOGO  —  PNG with aspect-ratio-preserving scale; text fallback if missing
  // ════════════════════════════════════════════════════════════════════════════

  private buildLogo(): void {
    const logoLoaded = this.logoTextureValid();

    if (logoLoaded) {
      // ── PNG logo ──────────────────────────────────────────────────────────
      const img = this.add.image(CX, LOGO_CENTER_Y, LOGO_KEY).setOrigin(0.5);

      // Scale proportionally to fit within LOGO_MAX_WIDTH × LOGO_MAX_HEIGHT
      const srcW  = img.width;
      const srcH  = img.height;
      const scaleW = LOGO_MAX_WIDTH  / srcW;
      const scaleH = LOGO_MAX_HEIGHT / srcH;
      const scale  = Math.min(scaleW, scaleH, 1); // never upscale beyond natural size
      img.setScale(scale);

    } else {
      // ── Text fallback (file missing) ──────────────────────────────────────
      this.add.text(CX, LOGO_CENTER_Y, 'CLONE BLAST', {
        fontSize: '110px', fontFamily: FONT, fontStyle: 'bold',
        color: '#7a5c00', stroke: '#b88800', strokeThickness: 36,
      } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5).setAlpha(0.30);

      this.add.text(CX, LOGO_CENTER_Y, 'CLONE BLAST', {
        fontSize: '110px', fontFamily: FONT, fontStyle: 'bold',
        color: '#3a2800', stroke: '#e8a800', strokeThickness: 22,
      } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5).setAlpha(0.55);

      this.add.text(CX, LOGO_CENTER_Y, 'CLONE BLAST', {
        fontSize: '110px', fontFamily: FONT, fontStyle: 'bold',
        color: '#060400', stroke: '#ffd84a', strokeThickness: 14,
      } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5);
    }

    // Tagline — always rendered, same style regardless of logo source
    this.add.text(CX, TAGLINE_Y, 'Bring Balance to the Force', {
      fontSize: '30px', fontFamily: FONT, color: '#556688',
    }).setOrigin(0.5);
  }

  /**
   * Returns true only when 'logo_main' exists and has real pixel content
   * (not Phaser's 2×2 error/placeholder texture).
   */
  private logoTextureValid(): boolean {
    if (!this.textures.exists(LOGO_KEY)) return false;
    const frame = this.textures.get(LOGO_KEY).get(0);
    return frame.realWidth > 2 && frame.realHeight > 2;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BUTTONS  —  identical frame, old font/icon/color/glow style
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
  // HIGH SCORE PANEL  —  fixed size, 3-row slots, never resizes
  // ════════════════════════════════════════════════════════════════════════════

  private buildHighScores(): void {
    const scores   = HighScoreSystem.getScores();
    const panelX   = CX - HS_PANEL_W / 2;
    const panelTop = HS_PANEL_CENTER_Y - HS_PANEL_H / 2;
    const panelBot = panelTop + HS_PANEL_H;

    // Dev-time guard
    if (panelBot > SAFE_BOTTOM_Y) {
      console.warn(`[MainMenu] HS panel bottom ${panelBot} > SAFE_BOTTOM_Y ${SAFE_BOTTOM_Y}`);
    }

    // ── Card ──────────────────────────────────────────────────────────────
    const gfx = this.add.graphics();
    gfx.fillStyle(0x050912, 0.72);
    gfx.fillRoundedRect(panelX, panelTop, HS_PANEL_W, HS_PANEL_H, 10);
    gfx.lineStyle(1.5, 0x00ccff, 0.28);
    gfx.strokeRoundedRect(panelX, panelTop, HS_PANEL_W, HS_PANEL_H, 10);

    // ── Header ────────────────────────────────────────────────────────────
    this.add.text(CX, panelTop + HS_HEADER_H / 2, '— HIGH SCORES —', {
      fontSize: '24px', fontFamily: FONT, color: '#ffb833',
    }).setOrigin(0.5, 0.5);

    gfx.lineStyle(1, 0x334466, 0.55);
    gfx.lineBetween(
      panelX + 18, panelTop + HS_HEADER_H,
      panelX + HS_PANEL_W - 18, panelTop + HS_HEADER_H,
    );

    // ── Rows (always exactly HS_MAX_ROWS slots) ───────────────────────────
    const rowCols    = ['#ffdd44', '#cccccc', '#cc9944'];
    const firstRowCY = panelTop + HS_HEADER_H + HS_ROW_H / 2;
    const dimCol     = '#2a3a4a';

    for (let i = 0; i < HS_MAX_ROWS; i++) {
      const y     = firstRowCY + i * HS_ROW_H;
      const entry = scores[i];
      const col   = rowCols[i] ?? '#aaaaaa';

      // Rank (always shown)
      this.add.text(panelX + 26, y, `${i + 1}.`, {
        fontSize: '22px', fontFamily: FONT, color: entry ? col : dimCol,
      }).setOrigin(0, 0.5);

      if (entry) {
        // Name
        this.add.text(panelX + 76, y, entry.name, {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);

        // Score (right-aligned to ~62% across the panel)
        this.add.text(panelX + HS_PANEL_W * 0.62, y, entry.score.toLocaleString(), {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(1, 0.5);

        // Mode tag
        this.add.text(panelX + HS_PANEL_W - 18, y, `[${entry.mode}]`, {
          fontSize: '18px', fontFamily: FONT, color: '#445566',
        }).setOrigin(1, 0.5);

      } else {
        // Empty slot placeholder
        this.add.text(panelX + 76, y, '—', {
          fontSize: '22px', fontFamily: FONT, color: dimCol,
        }).setOrigin(0, 0.5);
      }
    }

    if (scores.length === 0) {
      this.add.text(CX, firstRowCY + HS_ROW_H, 'No scores yet', {
        fontSize: '22px', fontFamily: FONT, color: '#2a3a4a',
      }).setOrigin(0.5, 0.5);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DISCLAIMER  —  fixed bottom anchor, independent of all other elements
  // Panel bottom ≈ 808   Disclaimer top ≈ 1030   Gap ≈ 222 px  ✓
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
