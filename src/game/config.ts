import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { BootScene }      from '../scenes/BootScene';
import { PreloadScene }   from '../scenes/PreloadScene';
import { MainMenuScene }  from '../scenes/MainMenuScene';
import { CampaignScene }  from '../scenes/CampaignScene';
import { InfiniteScene }  from '../scenes/InfiniteScene';
import { GameOverScene }  from '../scenes/GameOverScene';
import { NameEntryScene } from '../scenes/NameEntryScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0d0d1a',
  parent: 'game-container',
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    CampaignScene,
    InfiniteScene,
    GameOverScene,
    NameEntryScene,
  ],
};
