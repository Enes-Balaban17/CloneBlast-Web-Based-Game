import Phaser from 'phaser';
import { gameConfig } from './game/config';

// Bootstrap the Phaser game engine.
// All logic is delegated to the scene graph defined in gameConfig.
new Phaser.Game(gameConfig);
