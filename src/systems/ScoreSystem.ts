import {
  SCORE_NORMAL_DEFLECT,
  SCORE_PERFECT_DEFLECT,
  SCORE_FORCE_REFLECT,
  SCORE_FORCE_CHOKE,
  SCORE_STAGE_CLEAR,
} from '../game/constants';
import type { ComboSystem } from './ComboSystem';

export class ScoreSystem {
  private score = 0;

  constructor(private readonly combo: ComboSystem) {}

  getScore(): number { return this.score; }

  private add(base: number): void {
    this.score += Math.floor(base * this.combo.getMultiplier());
  }

  addNormalDeflect():  void { this.add(SCORE_NORMAL_DEFLECT); }
  addPerfectDeflect(): void { this.add(SCORE_PERFECT_DEFLECT); }
  addForceReflect():   void { this.add(SCORE_FORCE_REFLECT); }
  addForceChoke():     void { this.add(SCORE_FORCE_CHOKE); }
  addStageClear():     void { this.score += SCORE_STAGE_CLEAR; }

  reset(): void { this.score = 0; }
}
