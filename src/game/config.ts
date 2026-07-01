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

  // transparent: true removes the Phaser canvas background so the HTML
  // GIF layer behind it is visible on MainMenuScene.
  // Each gameplay scene draws its own opaque rectangle as the first object
  // in its create() call, so transparency never leaks into combat scenes.
  transparent: true,

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
