import Phaser from 'phaser';
import {
  COL_PLAYER, COL_BATTLE_DROID, COL_HEAVY_DROID,
  COL_SHIELD_DROID, COL_CYBORG_BOSS, COL_BLASTER, COL_BLASTER_REFLECT,
} from '../game/constants';

/**
 * BootScene — generates all placeholder rectangle textures,
 * then hands off to PreloadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    const make = (key: string, w: number, h: number, color: number) => {
      g.clear();
      g.fillStyle(color, 1);
      g.fillRect(0, 0, w, h);
      g.generateTexture(key, w, h);
    };

    make('player',               52,  130, COL_PLAYER);
    make('battle_droid',         40,   80, COL_BATTLE_DROID);
    make('heavy_droid',          58,   88, COL_HEAVY_DROID);
    make('shield_droid',         50,   70, COL_SHIELD_DROID);
    make('cyborg_boss',         130,  150, COL_CYBORG_BOSS);
    make('blaster_bolt',         34,   10, COL_BLASTER);
    make('blaster_bolt_reflect', 34,   10, COL_BLASTER_REFLECT);

    g.destroy();
    this.scene.start('PreloadScene');
  }
}
