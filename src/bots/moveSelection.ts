import type { EngineEvalInfo } from '../types';
import { ELO_MAX, ELO_MIN } from './botLevels';

/**
 * Picks a move from the engine's MultiPV candidates. At low Elo this sometimes
 * takes the 2nd or 3rd-best line instead of the top one, so weak play reads as
 * "a human who missed the best idea" rather than a random blunder — the best
 * few candidates are still engine-sound moves, just not THE best.
 */
export function pickBotMove(evalInfo: EngineEvalInfo, elo: number): string | null {
  const candidates = [...evalInfo.multipv]
    .filter((c): c is { moveUci: string; cp: number | null; mate: number | null; rank: number } => Boolean(c.moveUci))
    .sort((a, b) => a.rank - b.rank);

  if (candidates.length === 0) return evalInfo.bestMoveUci;
  if (candidates.length === 1) return candidates[0].moveUci;

  const t = clamp((elo - ELO_MIN) / (ELO_MAX - ELO_MIN), 0, 1);
  const pBest = 0.55 + 0.45 * t; // 55% at 600 Elo -> 100% at 2400 Elo
  const pRemaining = 1 - pBest;
  const hasThird = candidates.length > 2;
  const pSecond = hasThird ? pRemaining * 0.65 : pRemaining;
  const pThird = hasThird ? pRemaining * 0.35 : 0;

  const roll = Math.random();
  if (roll < pBest) return candidates[0].moveUci;
  if (roll < pBest + pSecond) return candidates[1].moveUci;
  if (hasThird && roll < pBest + pSecond + pThird) return candidates[2].moveUci;
  return candidates[0].moveUci;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
