import { PLAYER_X, DEFLECT_WINDOW_NORMAL, DEFLECT_WINDOW_PERFECT } from '../game/constants';
import { DeflectResult } from '../game/types';
import type { Lane } from '../game/types';
import type { Blaster } from '../entities/Blaster';

export interface DeflectCheckResult {
  result:  DeflectResult;
  blaster: Blaster | null;
}

export class DeflectSystem {
  /**
   * Given the lane the player pressed, find the best blaster to deflect.
   *
   * Window:  blaster.x ∈ (PLAYER_X, PLAYER_X + DEFLECT_WINDOW_NORMAL]
   * Perfect: blaster.x ∈ (PLAYER_X, PLAYER_X + DEFLECT_WINDOW_PERFECT]
   */
  check(lane: Lane, blasters: Blaster[]): DeflectCheckResult {
    const inWindow = (b: Blaster) =>
      b.active &&
      !b.isReflected &&
      b.x > PLAYER_X &&
      b.x <= PLAYER_X + DEFLECT_WINDOW_NORMAL;

    const sameLane  = blasters.filter(b => inWindow(b) && b.lane === lane);
    const otherLane = blasters.filter(b => inWindow(b) && b.lane !== lane);

    if (sameLane.length === 0) {
      // No blaster in range for this lane
      if (otherLane.length > 0) {
        // A blaster is in range but in the other lane
        otherLane.sort((a, b) => a.x - b.x);
        return { result: DeflectResult.WrongLane, blaster: otherLane[0] };
      }
      return { result: DeflectResult.Empty, blaster: null };
    }

    // Closest blaster in the correct lane
    sameLane.sort((a, b) => a.x - b.x);
    const closest = sameLane[0];

    if (closest.x <= PLAYER_X + DEFLECT_WINDOW_PERFECT) {
      return { result: DeflectResult.Perfect, blaster: closest };
    }
    return { result: DeflectResult.Normal, blaster: closest };
  }
}
