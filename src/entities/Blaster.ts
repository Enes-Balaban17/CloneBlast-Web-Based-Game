import Phaser from 'phaser';
import type { Lane } from '../game/types';

/** A blaster bolt flying across the screen. Extends Rectangle for direct Phaser ownership. */
export class Blaster extends Phaser.GameObjects.Rectangle {
  lane:       Lane;
  speed:      number;   // px / second, always positive
  isReflected = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    lane: Lane,
    speed: number,
  ) {
    super(scene, x, y, 34, 10, 0xff2222);
    this.lane  = lane;
    this.speed = speed;
    scene.add.existing(this);
    this.setDepth(5);
  }

  /** Flip direction and change color to indicate reflected state. */
  reflect(): void {
    this.isReflected = true;
    this.setFillStyle(0x00ff99);
  }

  /**
   * Move the bolt every frame.
   * Normal bolts travel left (x−); reflected bolts travel right (x+).
   */
  tick(deltaMs: number): void {
    if (!this.active) return;
    const dir = this.isReflected ? 1 : -1;
    this.x += dir * (this.speed * deltaMs) / 1000;
  }
}
