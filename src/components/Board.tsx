import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Chessboard, type Arrow, type PieceDropHandlerArgs, type SquareHandlerArgs } from 'react-chessboard';
import type { Chess } from 'chess.js';
import type { MoveInput } from '../hooks/useChessGame';
import './Board.css';

const PROMOTION_PIECES: Array<{ type: 'q' | 'r' | 'b' | 'n'; label: string; symbol: string }> = [
  { type: 'q', label: 'Queen', symbol: '♛' },
  { type: 'r', label: 'Rook', symbol: '♜' },
  { type: 'b', label: 'Bishop', symbol: '♝' },
  { type: 'n', label: 'Knight', symbol: '♞' },
];

export interface BoardProps {
  game: Chess;
  orientation?: 'white' | 'black';
  interactive?: boolean;
  lastMove?: { from: string; to: string } | null;
  arrows?: Arrow[];
  extraSquareStyles?: Record<string, CSSProperties>;
  onMove: (move: MoveInput) => boolean;
  boardId?: string;
}

export function Board({
  game,
  orientation = 'white',
  interactive = true,
  lastMove,
  arrows,
  extraSquareStyles,
  onMove,
  boardId = 'main-board',
}: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const legalTargets = useMemo<string[]>(() => {
    if (!selectedSquare) return [];
    try {
      return game.moves({ square: selectedSquare as never, verbose: true }).map((m) => m.to as string);
    } catch {
      return [];
    }
  }, [game, selectedSquare]);

  function isPawnPromotion(from: string, to: string): boolean {
    const piece = game.get(from as never);
    if (!piece || piece.type !== 'p') return false;
    const targetRank = to[1];
    return (piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1');
  }

  function attemptMove(from: string, to: string): boolean {
    if (isPawnPromotion(from, to)) {
      setPendingPromotion({ from, to });
      setSelectedSquare(null);
      return false;
    }
    const accepted = onMove({ from, to });
    setSelectedSquare(null);
    return accepted;
  }

  function handlePieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!interactive || !targetSquare || pendingPromotion) return false;
    return attemptMove(sourceSquare, targetSquare);
  }

  function handleSquareClick({ square }: SquareHandlerArgs) {
    if (!interactive || pendingPromotion) return;
    if (selectedSquare && legalTargets.includes(square)) {
      attemptMove(selectedSquare, square);
      return;
    }
    const piece = game.get(square as never);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }

  function finishPromotion(promotion: 'q' | 'r' | 'b' | 'n') {
    if (!pendingPromotion) return;
    onMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion });
    setPendingPromotion(null);
  }

  const squareStyles = useMemo<Record<string, CSSProperties>>(() => {
    const styles: Record<string, CSSProperties> = { ...extraSquareStyles };

    if (lastMove) {
      styles[lastMove.from] = { ...styles[lastMove.from], background: 'var(--board-last-move)' };
      styles[lastMove.to] = { ...styles[lastMove.to], background: 'var(--board-last-move)' };
    }

    if (selectedSquare) {
      styles[selectedSquare] = { ...styles[selectedSquare], background: 'var(--board-select)' };
      for (const target of legalTargets) {
        const occupied = Boolean(game.get(target as never));
        styles[target] = {
          ...styles[target],
          backgroundImage: occupied
            ? 'radial-gradient(circle at center, transparent 55%, var(--board-legal-dot) 58%)'
            : 'radial-gradient(circle, var(--board-legal-dot) 18%, transparent 20%)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      }
    }

    if (game.isCheck()) {
      const kingSquare = findKingSquare(game, game.turn());
      if (kingSquare) {
        styles[kingSquare] = { ...styles[kingSquare], background: 'var(--board-check)' };
      }
    }

    return styles;
  }, [extraSquareStyles, lastMove, selectedSquare, legalTargets, game]);

  return (
    <div className="board-shell">
      <Chessboard
        options={{
          id: boardId,
          position: game.fen(),
          boardOrientation: orientation,
          onPieceDrop: handlePieceDrop,
          onSquareClick: handleSquareClick,
          allowDragging: interactive,
          squareStyles,
          arrows,
          darkSquareStyle: { backgroundColor: 'var(--board-dark)' },
          lightSquareStyle: { backgroundColor: 'var(--board-light)' },
          animationDurationInMs: 180,
        }}
      />
      {pendingPromotion && (
        <div className="promotion-overlay" role="dialog" aria-label="Choose promotion piece">
          <div className="promotion-dialog card">
            <p>Promote to</p>
            <div className="promotion-options">
              {PROMOTION_PIECES.map((p) => (
                <button key={p.type} className="btn promotion-btn" onClick={() => finishPromotion(p.type)}>
                  <span aria-hidden>{p.symbol}</span>
                  <span className="visually-hidden">{p.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-sm" onClick={() => setPendingPromotion(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function findKingSquare(game: Chess, color: 'w' | 'b'): string | null {
  const board = game.board();
  for (const row of board) {
    for (const cell of row) {
      if (cell && cell.type === 'k' && cell.color === color) return cell.square;
    }
  }
  return null;
}
