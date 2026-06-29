import { MAX_STAMINA, STAMINA_REGEN_RATE } from '../game/constants';
import type { Player } from '../entities/Player';

export class StaminaSystem {
  /** Call every frame with the delta (ms). Passively restores stamina. */
  update(player: Player, deltaMs: number): void {
    if (player.stamina >= MAX_STAMINA) return;
    player.stamina = Math.min(
      player.stamina + (STAMINA_REGEN_RATE * deltaMs) / 1000,
      MAX_STAMINA,
    );
  }
}
