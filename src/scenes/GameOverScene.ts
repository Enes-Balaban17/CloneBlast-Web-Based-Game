import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import type { GameOverData } from '../game/types';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create(data: GameOverData): void {
    const score = data?.score ?? 0;
    const mode  = data?.mode  ?? 'campaign';

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x08000f);
    this.add.rectangle(GAME_WIDTH / 2, 4, GAME_WIDTH, 8, 0xff2222, 0.7);

    // Title
    this.add.text(GAME_WIDTH / 2, 220, 'GAME OVER', {
      fontSize: '112px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ff2222',
      stroke: '#330000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Score
    this.add.text(GAME_WIDTH / 2, 380, `SCORE:  ${score.toLocaleString()}`, {
      fontSize: '58px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 460, `MODE: ${mode.toUpperCase()}`, {
      fontSize: '32px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#556688',
    }).setOrigin(0.5);

    if (HighScoreSystem.isTopThree(score)) {
      // Flash "NEW HIGH SCORE" then auto-proceed to name entry
      const flash = this.add.text(GAME_WIDTH / 2, 570, '✦  NEW HIGH SCORE  ✦', {
        fontSize: '52px',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#ffdd00',
        stroke: '#553300',
        strokeThickness: 4,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: flash,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });

      this.add.text(GAME_WIDTH / 2, 660, 'Entering name in 2 seconds…', {
        fontSize: '28px',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#445566',
      }).setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        this.scene.start('NameEntryScene', { score, mode });
      });
    } else {
      this.makeBtn(GAME_WIDTH / 2 - 260, 600, '▶  PLAY AGAIN', '#00ccff', () => {
        this.scene.start(mode === 'infinite' ? 'InfiniteScene' : 'CampaignScene', { mode, stage: 1 });
      });

      this.makeBtn(GAME_WIDTH / 2 + 260, 600, '⌂  MAIN MENU', '#ff9900', () => {
        this.scene.start('MainMenuScene');
      });
    }
  }

  private makeBtn(x: number, y: number, label: string, accent: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '40px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffffff',
      backgroundColor: '#1a1a3a',
      padding: { x: 28, y: 14 },
      stroke: accent,
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setColor(accent).setScale(1.05));
    btn.on('pointerout',   () => btn.setColor('#ffffff').setScale(1));
    btn.on('pointerdown',  cb);
  }
}
