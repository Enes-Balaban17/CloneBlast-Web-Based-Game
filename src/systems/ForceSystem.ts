import {
  FORCE_REFLECT_COST,
  FORCE_CHOKE_COST,
  FORCE_CHOKE_CHARGE_MS,
  MAX_FORCE,
} from '../game/constants';
import { PlayerState } from '../game/types';
import type { Player } from '../entities/Player';
import type { Blaster } from '../entities/Blaster';

export class ForceSystem {
  private charging      = false;
  private chargeStart   = 0;

  // ── Force economy ──────────────────────────────────────────────────────────

  addForce(player: Player, amount: number): void {
    player.force = Math.min(player.force + amount, MAX_FORCE);
  }

  // ── Force Reflect (D key) ─────────────────────────────────────────────────

  canReflect(player: Player): boolean {
    return player.force >= FORCE_REFLECT_COST && player.state !== PlayerState.Dead;
  }

  /**
   * Costs 25 Force, reflects the nearest incoming (non-reflected) blaster.
   * Returns the blaster that was reflected, or null if none available.
   */
  doReflect(player: Player, blasters: Blaster[]): Blaster | null {
    if (!this.canReflect(player)) return null;

    const candidates = blasters.filter(b => b.active && !b.isReflected);
    if (candidates.length === 0) return null;

    // Nearest = lowest x (closest to player from the right)
    candidates.sort((a, b) => a.x - b.x);
    const target = candidates[0];

    player.force -= FORCE_REFLECT_COST;
    target.reflect();
    return target;
  }

  // ── Force Choke (SPACE hold) ───────────────────────────────────────────────

  canStartChoke(player: Player): boolean {
    return (
      player.force >= FORCE_CHOKE_COST &&
      !this.charging &&
      player.state !== PlayerState.Dead
    );
  }

  startChoke(player: Player, timeMs: number): void {
    this.charging    = true;
    this.chargeStart = timeMs;
    player.state     = PlayerState.ForceChokeCharge;
  }

  /**
   * Called when SPACE is released.
   * Returns true if the choke fired (charge was long enough), false if released early.
   * On success: drains force to 0, destroys all non-reflected blasters.
   */
  releaseChoke(player: Player, timeMs: number, blasters: Blaster[]): boolean {
    if (!this.charging) return false;
    this.charging = false;

    const elapsed = timeMs - this.chargeStart;
    if (elapsed >= FORCE_CHOKE_CHARGE_MS) {
      player.force = 0;
      player.state = PlayerState.ForceChokeRelease;
      blasters.forEach(b => { if (b.active && !b.isReflected) b.destroy(); });
      return true;
    }

    player.state = PlayerState.Idle;
    return false;
  }

  cancelCharge(player: Player): void {
    if (this.charging) {
      this.charging = false;
      player.state  = PlayerState.Idle;
    }
  }

  isCharging(): boolean { return this.charging; }

  /** 0 → 1 charge fraction. */
  getChargeProgress(timeMs: number): number {
    if (!this.charging) return 0;
    return Math.min((timeMs - this.chargeStart) / FORCE_CHOKE_CHARGE_MS, 1);
  }
}
