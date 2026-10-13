import { useCallback, useMemo, useState } from 'react';
import { Chess, type Move } from 'chess.js';

export const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface GameStatus {
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isInsufficientMaterial: boolean;
  isThreefoldRepetition: boolean;
  turn: 'w' | 'b';
  resultText: string | null;
}

function computeStatus(game: Chess): GameStatus {
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  const isInsufficientMaterial = game.isInsufficientMaterial();
  const isThreefoldRepetition = game.isThreefoldRepetition();
  const turn = game.turn();

  let resultText: string | null = null;
  if (isCheckmate) {
    const winner = turn === 'w' ? 'Black' : 'White';
    resultText = `Checkmate — ${winner} wins`;
  } else if (isStalemate) {
    resultText = 'Draw by stalemate';
  } else if (isThreefoldRepetition) {
    resultText = 'Draw by threefold repetition';
  } else if (isInsufficientMaterial) {
    resultText = 'Draw by insufficient material';
  } else if (game.isDrawByFiftyMoves()) {
    resultText = 'Draw by fifty-move rule';
  } else if (isDraw) {
    resultText = 'Draw';
  }

  return {
    isGameOver: game.isGameOver(),
    isCheck: game.isCheck(),
    isCheckmate,
    isStalemate,
    isDraw,
    isInsufficientMaterial,
    isThreefoldRepetition,
    turn,
    resultText,
  };
}

export interface MoveInput {
  from: string;
  to: string;
  promotion?: string;
}

/**
 * Wraps a chess.js game as an undo/redo-able ply timeline, rebuilding the
 * board from startingFen + plies[0..currentPly) on every change. Game trees
 * stay tiny (well under a thousand plies) so a full replay per update is
 * simpler and safer than hand-rolling incremental mutation/rollback.
 */
export function useChessGame(initialFen: string = DEFAULT_FEN) {
  const [startingFen, setStartingFen] = useState(initialFen);
  const [plies, setPlies] = useState<Move[]>([]);
  const [currentPly, setCurrentPly] = useState(0);

  const game = useMemo(() => {
    const g = new Chess(startingFen);
    for (let i = 0; i < currentPly; i++) {
      const p = plies[i];
      g.move({ from: p.from, to: p.to, promotion: p.promotion });
    }
    return g;
  }, [startingFen, plies, currentPly]);

  const makeMove = useCallback(
    (move: MoveInput): Move | null => {
      let result: Move | null = null;
      try {
        result = game.move(move);
      } catch {
        return null;
      }
      if (!result) return null;
      setPlies((prev) => [...prev.slice(0, currentPly), result as Move]);
      setCurrentPly((prev) => prev + 1);
      return result;
    },
    [game, currentPly],
  );

  const canUndo = currentPly > 0;
  const canRedo = currentPly < plies.length;

  const undo = useCallback(() => {
    setCurrentPly((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentPly((prev) => Math.min(plies.length, prev + 1));
  }, [plies.length]);

  const reset = useCallback((fen: string = DEFAULT_FEN) => {
    setStartingFen(fen);
    setPlies([]);
    setCurrentPly(0);
  }, []);

  const loadFen = useCallback((fen: string): boolean => {
    try {
      new Chess(fen);
    } catch {
      return false;
    }
    setStartingFen(fen);
    setPlies([]);
    setCurrentPly(0);
    return true;
  }, []);

  const loadPgn = useCallback((pgn: string): boolean => {
    const temp = new Chess();
    try {
      temp.loadPgn(pgn);
    } catch {
      return false;
    }
    const headers = temp.getHeaders();
    const fen = headers.FEN ?? DEFAULT_FEN;
    const moves = temp.history({ verbose: true });
    setStartingFen(fen);
    setPlies(moves);
    setCurrentPly(moves.length);
    return true;
  }, []);

  const status = useMemo(() => computeStatus(game), [game]);
  const sanHistory = useMemo(() => plies.slice(0, currentPly).map((p) => p.san), [plies, currentPly]);
  const capturedPieces = useMemo(() => {
    const captured: { w: string[]; b: string[] } = { w: [], b: [] };
    for (let i = 0; i < currentPly; i++) {
      const p = plies[i];
      if (p.captured) {
        captured[p.color === 'w' ? 'b' : 'w'].push(p.captured);
      }
    }
    return captured;
  }, [plies, currentPly]);

  return {
    game,
    fen: game.fen(),
    pgn: game.pgn(),
    status,
    sanHistory,
    verboseHistory: plies.slice(0, currentPly),
    capturedPieces,
    canUndo,
    canRedo,
    makeMove,
    undo,
    redo,
    reset,
    loadFen,
    loadPgn,
  };
}

export type UseChessGame = ReturnType<typeof useChessGame>;
