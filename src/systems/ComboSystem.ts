import { COMBO_TIERS } from '../game/constants';

export class ComboSystem {
  private combo = 0;

  getCombo(): number { return this.combo; }

  getMultiplier(): number {
    for (const tier of COMBO_TIERS) {
      if (this.combo >= tier.minCombo) return tier.multiplier;
    }
    return 1;
  }

  increment(): void { this.combo++; }

  reset(): void { this.combo = 0; }
}
