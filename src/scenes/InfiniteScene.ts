import { BLASTER_SPEED, BLASTER_SPAWN_INTERVAL, GAME_WIDTH, UPPER_LANE_Y, LOWER_LANE_Y } from '../game/constants';
import type { Lane } from '../game/types';
import { CampaignScene } from './CampaignScene';
import { Blaster } from '../entities/Blaster';

/**
 * InfiniteScene — Infinite mode.
 * Inherits all gameplay from CampaignScene.
 * No stages or enemies — raw blaster streams with escalating speed.
 * Every 30 seconds: bolts get faster and spawn interval tightens.
 */
export class InfiniteScene extends CampaignScene {
  private diffTimer    = 0;
  private diffLevel    = 0;
  private currentSpeed = BLASTER_SPEED;

  constructor() { super('InfiniteScene'); }

  create(data: { mode?: 'campaign' | 'infinite' }): void {
    super.create({ mode: 'infinite', ...(data ?? {}) });
    this.diffTimer    = 0;
    this.diffLevel    = 0;
    this.currentSpeed = BLASTER_SPEED;
    this.spawnInterval = BLASTER_SPAWN_INTERVAL;
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    if (this.gameActive) this.scaleDifficulty(delta);
  }

  private scaleDifficulty(delta: number): void {
    this.diffTimer += delta;
    if (this.diffTimer >= 30_000) {
      this.diffTimer  = 0;
      this.diffLevel += 1;
      this.spawnInterval  = Math.max(BLASTER_SPAWN_INTERVAL - this.diffLevel * 180, 700);
      this.currentSpeed   = Math.min(BLASTER_SPEED + this.diffLevel * 60, 900);
      this.showFeedback(`LEVEL ${this.diffLevel + 1}!`, '#ffaa00');
    }
  }

  protected override spawnBlaster(): void {
    const lane: Lane = Math.random() < 0.5 ? 'upper' : 'lower';
    const y = lane === 'upper' ? UPPER_LANE_Y : LOWER_LANE_Y;
    const b = new Blaster(this, GAME_WIDTH - 40, y, lane, this.currentSpeed);
    this.blasters.push(b);
  }
}
