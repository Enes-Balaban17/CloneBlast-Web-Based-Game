import { HS_STORAGE_KEY, MAX_HIGH_SCORES } from '../game/constants';
import type { ScoreEntry } from '../game/types';

export class HighScoreSystem {
  /** Returns scores sorted best → worst (up to MAX_HIGH_SCORES). */
  static getScores(): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(HS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ScoreEntry[];
    } catch {
      return [];
    }
  }

  /** True if this score would enter the top-3. */
  static isTopThree(score: number): boolean {
    const scores = this.getScores();
    if (scores.length < MAX_HIGH_SCORES) return true;
    return score > scores[scores.length - 1].score;
  }

  /** Insert entry, keep top-3, persist to localStorage. */
  static save(entry: ScoreEntry): void {
    const scores = this.getScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(HS_STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_HIGH_SCORES)));
  }

  static clear(): void {
    localStorage.removeItem(HS_STORAGE_KEY);
  }
}
