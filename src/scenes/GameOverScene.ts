import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/constants';
import { HighScoreSystem } from '../systems/HighScoreSystem';
import type { GameOverData } from '../game/types';
import { hideMenuGifBackground } from '../ui/MenuGifBackground';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create(data: GameOverData): void {
    hideMenuGifBackground(); // ensure menu GIF is gone in game-over screen
    const score   = data?.score   ?? 0;
    const mode    = data?.mode    ?? 'campaign';
    const victory = data?.victory ?? false;

    // Background
    const bgCol = victory ? 0x050a05 : 0x08000f;
    const lineCol = victory ? 0xffdd00 : 0xff2222;
    this.add.rectangle(GAME_WIDTH / 2, 540, GAME_WIDTH, 1080, bgCol);
    this.add.rectangle(GAME_WIDTH / 2, 4, GAME_WIDTH, 8, lineCol, 0.7);

    // Title
    const titleText = victory ? '★  VICTORY  ★' : 'GAME OVER';
    const titleCol  = victory ? '#ffdd00'       : '#ff2222';
    const strokeCol = victory ? '#443300'       : '#330000';

    this.add.text(GAME_WIDTH / 2, 200, titleText, {
      fontSize: '112px',
      fontFamily: '"Courier New", Courier, monospace',
      color: titleCol,
      stroke: strokeCol,
      strokeThickness: 8,
    }).setOrigin(0.5);

    if (victory) {
      this.add.text(GAME_WIDTH / 2, 340, 'All 7 stages cleared!', {
        fontSize: '40px',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#88ff88',
      }).setOrigin(0.5);
    }

    // Score
    this.add.text(GAME_WIDTH / 2, 420, `SCORE:  ${score.toLocaleString()}`, {
      fontSize: '58px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 500, `MODE: ${mode.toUpperCase()}`, {
      fontSize: '32px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#556688',
    }).setOrigin(0.5);

    if (HighScoreSystem.isTopThree(score)) {
      const flash = this.add.text(GAME_WIDTH / 2, 590, '✦  NEW HIGH SCORE  ✦', {
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

      this.add.text(GAME_WIDTH / 2, 680, 'Entering name in 2 seconds…', {
        fontSize: '28px',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#445566',
      }).setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        this.scene.start('NameEntryScene', { score, mode });
      });
    } else {
      this.makeBtn(GAME_WIDTH / 2 - 280, 630, '▶  PLAY AGAIN', '#00ccff', () => {
        this.scene.start(mode === 'infinite' ? 'InfiniteScene' : 'CampaignScene', { mode, stage: 1 });
      });
      this.makeBtn(GAME_WIDTH / 2 + 280, 630, '⌂  MAIN MENU', '#ff9900', () => {
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
