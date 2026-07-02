import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import { showMenuGifBackground, hideMenuGifBackground } from '../ui/MenuGifBackground';
import { hideGameplayGifBackground } from '../ui/GameplayGifBackground';

const CX   = GAME_WIDTH / 2;
const FONT = '"Courier New", Courier, monospace';

const LOGO_TRIMMED_KEY    = 'logo_trimmed';
const LOGO_FALLBACK_KEY   = 'logo_main';
const LOGO_CENTER_Y       = 118;            // moved down to 118 to increase spacing from top edge while keeping 25px gap to tagline
const LOGO_TARGET_WIDTH   = 640;
const LOGO_MAX_HEIGHT     = 230;

const TAGLINE_Y = 258;

const BUTTON_START_Y = 370;
const BUTTON_GAP     = 110;
const BTN_W = 560;
const BTN_H = 90;

const BUTTON_ICON_GAP     = 24;   // space between icon and text label
const CAMPAIGN_ICON_SCALE = 0.70; // visually scale play triangle down (was too large)
const INFINITE_ICON_SCALE = 1.35; // visually scale infinity loop up (was too tiny)

const HS_PANEL_W        = 660;
const HS_PANEL_H        = 226;
const HS_PANEL_CENTER_Y = 695;
const HS_HEADER_H       = 68;
const HS_ROW_H          = 48;
const HS_MAX_ROWS       = 3;
const SAFE_BOTTOM_Y     = 890;

const DISCLAIMER_Y      = 1030;
const DISCLAIMER_WRAP_W = 1100;

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    hideGameplayGifBackground(); // ensure gameplay background is hidden on menu
    showMenuGifBackground();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, hideMenuGifBackground, this);
    this.buildLogo();
    this.buildButtons();
    this.buildHighScores();
    this.buildDisclaimer();
  }

  private buildLogo(): void {
    const key = this.logoTextureValid(LOGO_TRIMMED_KEY)
      ? LOGO_TRIMMED_KEY
      : this.logoTextureValid(LOGO_FALLBACK_KEY)
        ? LOGO_FALLBACK_KEY
        : null;

    if (key !== null) {
      const img  = this.add.image(CX, LOGO_CENTER_Y, key).setOrigin(0.5);
      const srcW = img.width;
      const srcH = img.height;
      const scaleByW = LOGO_TARGET_WIDTH / srcW;
      const scaleByH = LOGO_MAX_HEIGHT   / srcH;
      const scale    = Math.min(scaleByW, scaleByH);
      img.setScale(scale);
      const dW = Math.round(srcW * scale);
      const dH = Math.round(srcH * scale);
      console.info('[MainMenu] Logo key=' + key + ' src=' + srcW + 'x' + srcH + ' display=' + dW + 'x' + dH + ' scale=' + scale.toFixed(3));
    } else {
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

    this.add.text(CX, TAGLINE_Y, 'Bring Balance to the Force', {
      fontSize: '30px', fontFamily: FONT, color: '#556688',
    }).setOrigin(0.5);
  }

  private logoTextureValid(key: string): boolean {
    if (!this.textures.exists(key)) return false;
    const frame = this.textures.get(key).get(0);
    return frame.realWidth > 2 && frame.realHeight > 2;
  }

  private buildButtons(): void {
    this.makeMenuButton(
      CX, BUTTON_START_Y,
      '▶', 'CAMPAIGN MODE',
      0x0099cc, '#00ccff',
      CAMPAIGN_ICON_SCALE,
      () => { hideMenuGifBackground(); this.scene.start('CampaignScene', { mode: 'campaign', stage: 1 }); }
    );

    this.makeMenuButton(
      CX, BUTTON_START_Y + BUTTON_GAP,
      '∞', 'INFINITE MODE',
      0xcc7700, '#ff9900',
      INFINITE_ICON_SCALE,
      () => { hideMenuGifBackground(); this.scene.start('InfiniteScene', { mode: 'infinite' }); }
    );
  }

  private makeMenuButton(
    cx: number,
    cy: number,
    iconChar: string,
    labelText: string,
    borderHex: number,
    accentCss: string,
    iconScale: number,
    cb: () => void
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

    // 1. Create text label and icon separately
    const txt = this.add.text(0, 0, labelText, {
      fontSize: '48px', fontFamily: FONT, color: '#ffffff', stroke: accentCss, strokeThickness: 3,
    }).setOrigin(0.5, 0.5);

    const icon = this.add.text(0, 0, iconChar, {
      fontSize: '48px', fontFamily: FONT, color: '#ffffff', stroke: accentCss, strokeThickness: 3,
    }).setOrigin(0.5, 0.5);

    // Apply the scaling to the icon
    icon.setScale(iconScale);

    // 2. Measure widths to align and center perfectly
    const iconScaledW   = icon.width * iconScale;
    const totalContentW = iconScaledW + BUTTON_ICON_GAP + txt.width;
    const startX        = cx - totalContentW / 2;

    // 3. Position the objects inside the button
    icon.x = startX + iconScaledW / 2;
    icon.y = cy;

    txt.x  = startX + iconScaledW + BUTTON_ICON_GAP + txt.width / 2;
    txt.y  = cy;

    // 4. Interaction zone and hover triggers
    const zone = this.add.zone(cx, cy, BTN_W, BTN_H).setInteractive({ useHandCursor: true });
    zone.on('pointerover',  () => {
      drawHover();
      txt.setColor(accentCss);
      icon.setColor(accentCss);
    });
    zone.on('pointerout',   () => {
      drawNormal();
      txt.setColor('#ffffff');
      icon.setColor('#ffffff');
    });
    zone.on('pointerdown',  cb);
  }

  private buildHighScores(): void {
    const scores   = HighScoreSystem.getScores();
    const panelX   = CX - HS_PANEL_W / 2;
    const panelTop = HS_PANEL_CENTER_Y - HS_PANEL_H / 2;
    const panelBot = panelTop + HS_PANEL_H;
    if (panelBot > SAFE_BOTTOM_Y) {
      console.warn('[MainMenu] HS panel bottom ' + panelBot + ' > SAFE_BOTTOM_Y ' + SAFE_BOTTOM_Y);
    }
    const gfx = this.add.graphics();
    gfx.fillStyle(0x050912, 0.72);
    gfx.fillRoundedRect(panelX, panelTop, HS_PANEL_W, HS_PANEL_H, 10);
    gfx.lineStyle(1.5, 0x00ccff, 0.28);
    gfx.strokeRoundedRect(panelX, panelTop, HS_PANEL_W, HS_PANEL_H, 10);
    this.add.text(CX, panelTop + HS_HEADER_H / 2, '- HIGH SCORES -', {
      fontSize: '24px', fontFamily: FONT, color: '#ffb833',
    }).setOrigin(0.5, 0.5);
    gfx.lineStyle(1, 0x334466, 0.55);
    gfx.lineBetween(panelX + 18, panelTop + HS_HEADER_H, panelX + HS_PANEL_W - 18, panelTop + HS_HEADER_H);
    const rowCols    = ['#ffdd44', '#cccccc', '#cc9944'];
    const firstRowCY = panelTop + HS_HEADER_H + HS_ROW_H / 2;
    const dimCol     = '#2a3a4a';
    for (let i = 0; i < HS_MAX_ROWS; i++) {
      const y     = firstRowCY + i * HS_ROW_H;
      const entry = scores[i];
      const col   = rowCols[i] ?? '#aaaaaa';
      this.add.text(panelX + 26, y, (i + 1) + '.', {
        fontSize: '22px', fontFamily: FONT, color: entry ? col : dimCol,
      }).setOrigin(0, 0.5);
      if (entry) {
        this.add.text(panelX + 76, y, entry.name, {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(0, 0.5);
        this.add.text(panelX + HS_PANEL_W * 0.62, y, entry.score.toLocaleString(), {
          fontSize: '24px', fontFamily: FONT, color: col,
        }).setOrigin(1, 0.5);
        this.add.text(panelX + HS_PANEL_W - 18, y, '[' + entry.mode + ']', {
          fontSize: '18px', fontFamily: FONT, color: '#445566',
        }).setOrigin(1, 0.5);
      } else {
        this.add.text(panelX + 76, y, '-', {
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

  private buildDisclaimer(): void {
    const text = 'This is an open-source, fan-made game and is not affiliated with Lucasfilm Ltd., ' +
      'The Walt Disney Company, Disney, or the official Star Wars brand. Original source code is released ' +
      'under the MIT License. Star Wars and related elements are trademarks and copyrights of Lucasfilm Ltd. ' +
      'For DMCA, copyright, trademark, licensing, or other IP concerns: balabanenes111@icloud.com';
    this.add.text(CX, DISCLAIMER_Y, text, {
      fontSize: '14px', fontFamily: FONT, color: '#ffffff', align: 'center',
      wordWrap: { width: DISCLAIMER_WRAP_W, useAdvancedWrap: false },
    }).setOrigin(0.5, 0).setAlpha(0.88);
  }
}