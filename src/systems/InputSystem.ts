import Phaser from 'phaser';
import type { Lane } from '../game/types';

export class InputSystem {
  private readonly up:      Phaser.Input.Keyboard.Key[];
  private readonly down:    Phaser.Input.Keyboard.Key[];
  private readonly reflect: Phaser.Input.Keyboard.Key;
  private readonly choke:   Phaser.Input.Keyboard.Key;
  private readonly esc:     Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    const K  = Phaser.Input.Keyboard.KeyCodes;

    this.up      = [kb.addKey(K.W),     kb.addKey(K.UP)];
    this.down    = [kb.addKey(K.S),     kb.addKey(K.DOWN)];
    this.reflect =  kb.addKey(K.D);
    this.choke   =  kb.addKey(K.SPACE);
    this.esc     =  kb.addKey(K.ESC);
  }

  private static justDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some(k => Phaser.Input.Keyboard.JustDown(k));
  }

  deflectJustDown(lane: Lane): boolean {
    return InputSystem.justDown(lane === 'upper' ? this.up : this.down);
  }

  reflectJustDown():  boolean { return Phaser.Input.Keyboard.JustDown(this.reflect); }
  chokeIsDown():      boolean { return this.choke.isDown; }
  chokeJustDown():    boolean { return Phaser.Input.Keyboard.JustDown(this.choke); }
  chokeJustUp():      boolean { return Phaser.Input.Keyboard.JustUp(this.choke); }
  escJustDown():      boolean { return Phaser.Input.Keyboard.JustDown(this.esc); }
}
