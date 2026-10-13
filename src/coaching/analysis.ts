import { Chess } from 'chess.js';
import type { EngineEvalInfo, MoveQuality, MoveQualityInfo, PieceColor } from '../types';
import { uciToMove } from '../engine/uci';

export interface ClassifyMoveInput {
  beforeFen: string;
  afterFen: string;
  moverColor: PieceColor;
  /** Engine eval of beforeFen, searched while it was still the mover's turn (mover-relative). */
  evalBefore: EngineEvalInfo;
  /** Engine eval of afterFen, searched once it became the opponent's turn (opponent-relative). */
  evalAfter: EngineEvalInfo;
}

/** Maps a (cp | mate) pair, already given from the mover's perspective, onto one comparable scale. */
function toScore(cp: number | null, mate: number | null): number {
  if (mate !== null && mate !== 0) {
    return mate > 0 ? 100000 - mate * 10 : -100000 - mate * 10;
  }
  return cp ?? 0;
}

export function classifyMove(input: ClassifyMoveInput): MoveQualityInfo {
  const { beforeFen, afterFen, moverColor, evalBefore, evalAfter } = input;

  const moverCpAfter = evalAfter.cp !== null ? -evalAfter.cp : null;
  const moverMateAfter = evalAfter.mate !== null ? -evalAfter.mate : null;

  const scoreBefore = toScore(evalBefore.cp, evalBefore.mate);
  const scoreAfter = toScore(moverCpAfter, moverMateAfter);
  const delta = scoreBefore - scoreAfter;

  const afterGame = new Chess(afterFen);
  const deliveredCheckmate = afterGame.isCheckmate();

  let classification: MoveQuality;
  if (deliveredCheckmate) {
    classification = 'checkmate';
  } else if (evalBefore.mate !== null && evalBefore.mate > 0 && delta > 500) {
    classification = 'missedMate';
  } else if (delta <= 15) {
    classification = 'best';
  } else if (delta <= 50) {
    classification = 'good';
  } else if (delta <= 100) {
    classification = 'inaccuracy';
  } else if (delta <= 250) {
    classification = 'mistake';
  } else {
    classification = 'blunder';
  }

  const hangingPieceSquare = classification === 'mistake' || classification === 'blunder' ? findHangingPiece(afterFen, evalAfter, moverColor) : null;

  const missedCaptureSquare =
    classification !== 'best' && classification !== 'checkmate' ? findMissedCapture(beforeFen, evalBefore) : null;

  const forkSquare = findFork(afterFen, moverColor);

  return {
    classification,
    evalBeforeCp: evalBefore.cp,
    evalAfterCp: moverCpAfter,
    evalDeltaCp: evalBefore.mate === null && moverMateAfter === null ? delta : null,
    mateBefore: evalBefore.mate,
    mateAfter: moverMateAfter,
    hangingPieceSquare,
    missedCaptureSquare,
    missedMateIn: classification === 'missedMate' ? evalBefore.mate : null,
    forkSquare,
    bestMoveSan: sanForUci(beforeFen, evalBefore.bestMoveUci),
  };
}

function sanForUci(fen: string, uci: string | null): string | null {
  if (!uci) return null;
  try {
    const g = new Chess(fen);
    const mv = g.move(uciToMove(uci));
    return mv?.san ?? null;
  } catch {
    return null;
  }
}

/** A piece the mover just left on a square with no defenders, which the opponent's top reply captures. */
function findHangingPiece(afterFen: string, evalAfter: EngineEvalInfo, moverColor: PieceColor): string | null {
  if (!evalAfter.bestMoveUci) return null;
  const g = new Chess(afterFen);
  const { from, to } = uciToMove(evalAfter.bestMoveUci);
  const captured = g.get(to as never);
  if (!captured || captured.color !== moverColor) return null;
  const mover = g.get(from as never);
  if (!mover) return null;
  const defenders = g.attackers(to as never, moverColor as never);
  return defenders.length === 0 ? to : null;
}

/** A capture the mover's actual best move (per pre-move search) would have made, but the move played did not. */
function findMissedCapture(beforeFen: string, evalBefore: EngineEvalInfo): string | null {
  if (!evalBefore.bestMoveUci) return null;
  const g = new Chess(beforeFen);
  const { to } = uciToMove(evalBefore.bestMoveUci);
  const target = g.get(to as never);
  return target ? to : null;
}

/** Does the piece that just moved attack 2+ valuable enemy targets (fork) from its new square? */
function findFork(afterFen: string, moverColor: PieceColor): string | null {
  const g = new Chess(afterFen);
  const board = g.board();
  let movedPieceSquare: string | null = null;
  // The mover's piece sits on whatever square the last move landed on; chess.js exposes this via history.
  const lastMove = g.history({ verbose: true }).at(-1);
  movedPieceSquare = lastMove?.to ?? null;
  if (!movedPieceSquare) return null;

  const opponentColor: PieceColor = moverColor === 'w' ? 'b' : 'w';
  let valuableTargets = 0;

  for (const row of board) {
    for (const cell of row) {
      if (!cell || cell.color !== opponentColor) continue;
      const isValuable = cell.type === 'k' || cell.type !== 'p';
      if (!isValuable) continue;
      const attackers = g.attackers(cell.square as never, moverColor as never);
      if (attackers.includes(movedPieceSquare as never)) {
        valuableTargets += 1;
      }
    }
  }

  return valuableTargets >= 2 ? movedPieceSquare : null;
}
