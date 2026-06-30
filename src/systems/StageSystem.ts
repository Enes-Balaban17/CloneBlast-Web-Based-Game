import Phaser from 'phaser';
import { STAGES } from '../data/stages';
import { BLASTER_SPEED, SCORE_STAGE_CLEAR, MAX_HP } from '../game/constants';
import type { StageDef } from '../game/types';

/**
 * StageSystem — tracks which stage the player is on and handles transitions.
 *
 * Usage:
 *   const ss = new StageSystem(scene, onStageClear, onAllStagesCleared);
 *   ss.startStage(stageNumber);
 *   // Every frame: ss.update(deltaMs, enemies);
 */
export class StageSystem {
  currentStageIndex = 0;
  private scene: Phaser.Scene;
  private onClear: (stageDef: StageDef) => void;
  private onComplete: () => void;

  constructor(
    scene:      Phaser.Scene,
    onClear:    (stageDef: StageDef) => void,
    onComplete: () => void,
  ) {
    this.scene      = scene;
    this.onClear    = onClear;
    this.onComplete = onComplete;
  }

  get currentStage(): StageDef {
    return STAGES[this.currentStageIndex];
  }

  get stageNumber(): number {
    return this.currentStage.stageNumber;
  }

  /** Bolt speed for the current stage in px/s. */
  get boltSpeed(): number {
    return BLASTER_SPEED * this.currentStage.boltSpeedMultiplier;
  }

  /** Blaster spawn interval (ms) for the current stage. */
  get spawnInterval(): number {
    return this.currentStage.spawnIntervalMs;
  }

  get isBossStage(): boolean {
    return this.currentStage.isBossStage;
  }

  get isLastStage(): boolean {
    return this.currentStageIndex >= STAGES.length - 1;
  }

  /**
   * Called by CampaignScene when all enemies in the current stage are dead.
   * Awards stage clear bonus and triggers the next stage or victory.
   */
  stageClear(playerHeal: (amount: number, max: number) => void): void {
    playerHeal(2, MAX_HP);
    this.onClear(this.currentStage);

    if (this.isLastStage) {
      this.scene.time.delayedCall(1800, () => this.onComplete());
    } else {
      this.scene.time.delayedCall(2200, () => {
        this.currentStageIndex++;
      });
    }
  }

  getStageClearScore(): number {
    return SCORE_STAGE_CLEAR;
  }
}
