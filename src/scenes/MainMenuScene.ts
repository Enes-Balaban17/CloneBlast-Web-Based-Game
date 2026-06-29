import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COL_BG } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';

const BTN_STYLE = (accent: string): Phaser.Types.GameObjects.Text.TextStyle => ({
  fontSize: '52px',
  fontFamily: '"Courier New", Courier, monospace',
  color: '#ffffff',
  backgroundColor: '#1a1a3a',
  padding: { x: 32, y: 16 },
  stroke: accent,
  strokeThickness: 2,
});

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create(): void {
    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COL_BG);

    // Decorative top line
    this.add.rectangle(GAME_WIDTH / 2, 4, GAME_WIDTH, 8, 0x00ccff, 0.6);

    // Title
    this.add.text(GAME_WIDTH / 2, 160, 'CLONE BLAST', {
      fontSize: '108px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#00ccff',
      stroke: '#003355',
      strokeThickness: 10,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 290, 'DEFLECT  ·  REFLECT  ·  SURVIVE', {
      fontSize: '30px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#556688',
    }).setOrigin(0.5);

    // ── Buttons ──────────────────────────────────────────────────────────────
    this.makeButton(GAME_WIDTH / 2, 450, '▶  CAMPAIGN MODE', '#00ccff', () => {
      this.scene.start('CampaignScene', { mode: 'campaign', stage: 1 });
    });

    this.makeButton(GAME_WIDTH / 2, 570, '∞  INFINITE MODE', '#ff9900', () => {
      this.scene.start('InfiniteScene', { mode: 'infinite' });
    });

    // ── High Scores ───────────────────────────────────────────────────────────
    this.add.rectangle(GAME_WIDTH / 2, 720, 900, 2, 0x334466).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 750, '— HIGH SCORES —', {
      fontSize: '32px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffaa00',
    }).setOrigin(0.5);

    const scores  = HighScoreSystem.getScores();
    const medals  = ['#', '#', '#'];
    const rowCols = ['#ffdd00', '#cccccc', '#cc9955'];

    if (scores.length === 0) {
      this.add.text(GAME_WIDTH / 2, 820, 'No scores yet — be the first!', {
        fontSize: '28px',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#445566',
      }).setOrigin(0.5);
    } else {
      scores.forEach((entry, i) => {
        const tag   = `${i + 1}.`;
        const label = `${tag.padEnd(4)} ${entry.name}   ${entry.score.toLocaleString().padStart(9)}   [${entry.mode}]`;
        this.add.text(GAME_WIDTH / 2, 820 + i * 62, label, {
          fontSize: '34px',
          fontFamily: '"Courier New", Courier, monospace',
          color: rowCols[i] ?? '#aaaaaa',
        }).setOrigin(0.5);
        medals;
      });
    }

    // Controls hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '[W/↑] Upper  [S/↓] Lower  [D] Force Reflect  [SPACE] Force Choke', {
      fontSize: '22px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#334455',
    }).setOrigin(0.5, 1);
  }

  private makeButton(x: number, y: number, label: string, accent: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, BTN_STYLE(accent))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setColor(accent).setScale(1.04));
    btn.on('pointerout',   () => btn.setColor('#ffffff').setScale(1));
    btn.on('pointerdown',  cb);
  }
}
