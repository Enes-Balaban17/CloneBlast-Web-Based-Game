import { EnemyType } from '../game/types';

/** Static metadata per enemy type (visual size, base score). */
export const ENEMY_META: Record<EnemyType, { w: number; h: number; label: string }> = {
  [EnemyType.BattleDroid]: { w: 40,  h: 80,  label: 'Battle Droid' },
  [EnemyType.HeavyDroid]:  { w: 58,  h: 88,  label: 'Heavy Droid'  },
  [EnemyType.ShieldDroid]: { w: 50,  h: 70,  label: 'Shield Droid' },
  [EnemyType.CyborgBoss]:  { w: 130, h: 150, label: 'Cyborg Boss'  },
};
