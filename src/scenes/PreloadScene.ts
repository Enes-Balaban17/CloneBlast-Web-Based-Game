import Phaser from 'phaser';

/**
 * PreloadScene — placeholder for future real asset loading.
 * For MVP: immediately transitions to MainMenuScene.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload(): void {
    // No real assets yet — all textures are generated in BootScene.
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}
