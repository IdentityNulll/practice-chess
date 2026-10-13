import { useEffect, useState } from 'react';
import type { Arrow } from 'react-chessboard';
import { useChessGame, DEFAULT_FEN } from '../../hooks/useChessGame';
import { useStockfishEngine } from '../../hooks/useStockfishEngine';
import { uciToMove } from '../../engine/uci';
import type { EngineEvalInfo } from '../../types';
import { Board } from '../../components/Board';
import { MoveList } from '../../components/MoveList';
import { EvalBar } from '../../components/EvalBar';
import './FreePlay.css';

const BEST_MOVE_COLOR = '#4ade80';

export function FreePlay() {
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [analysisOn, setAnalysisOn] = useState(false);
  const [evalInfo, setEvalInfo] = useState<EngineEvalInfo | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const { engineRef, isReady } = useStockfishEngine(analysisOn);
  const { game, fen, pgn, status, sanHistory, canUndo, canRedo, makeMove, undo, redo, reset, loadFen, loadPgn } =
    useChessGame();

  useEffect(() => {
    if (!analysisOn || !isReady || !engineRef.current) {
      setEvalInfo(null);
      return;
    }
    const engine = engineRef.current;
    let cancelled = false;
    setEvalLoading(true);
    engine.setPositionFen(fen);
    engine
      .go({ movetimeMs: 700, multipv: 1 })
      .then((result) => {
        if (!cancelled) setEvalInfo(result);
      })
      .finally(() => {
        if (!cancelled) setEvalLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [analysisOn, isReady, fen, engineRef]);

  function flashMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage((current) => (current === text ? null : current)), 2500);
  }

  function handleLoadFen() {
    if (!fenInput.trim()) return;
    if (loadFen(fenInput.trim())) {
      flashMessage('Position loaded.');
    } else {
      flashMessage('That FEN is not valid.');
    }
  }

  function handleLoadPgn() {
    if (!pgnInput.trim()) return;
    if (loadPgn(pgnInput.trim())) {
      flashMessage('Game loaded.');
    } else {
      flashMessage('That PGN could not be parsed.');
    }
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      flashMessage(`${label} copied to clipboard.`);
    } catch {
      flashMessage(`Could not access the clipboard. ${label}: ${text}`);
    }
  }

  function handleReset() {
    reset(DEFAULT_FEN);
    setFenInput('');
    setPgnInput('');
  }

  const bestMoveArrow: Arrow[] | undefined =
    analysisOn && evalInfo?.bestMoveUci
      ? [{ ...uciArrow(evalInfo.bestMoveUci), color: BEST_MOVE_COLOR }]
      : undefined;

  const whiteCp = evalInfo?.cp !== null && evalInfo?.cp !== undefined ? relativeToWhite(evalInfo.cp, game.turn()) : null;
  const whiteMate =
    evalInfo?.mate !== null && evalInfo?.mate !== undefined ? relativeToWhite(evalInfo.mate, game.turn()) : null;

  return (
    <div className="free-play">
      <div className="fp-board-col">
        <div className="fp-board-row">
          {analysisOn && <EvalBar cpWhite={whiteCp} mateWhite={whiteMate} loading={evalLoading} />}
          <Board game={game} orientation={orientation} onMove={(m) => Boolean(makeMove(m))} arrows={bestMoveArrow} />
        </div>
        <div className="fp-status-bar">
          <span className="pill">{status.resultText ?? (status.isCheck ? `${turnLabel(game.turn())} to move — check!` : `${turnLabel(game.turn())} to move`)}</span>
          {message && <span className="pill fp-message">{message}</span>}
        </div>
        <div className="fp-buttons">
          <button className="btn btn-sm" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
            Flip board
          </button>
          <button className="btn btn-sm" onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          <button className="btn btn-sm" onClick={redo} disabled={!canRedo}>
            Redo
          </button>
          <button className="btn btn-sm" onClick={handleReset}>
            Reset
          </button>
          <label className="fp-analysis-toggle">
            <input type="checkbox" checked={analysisOn} onChange={(e) => setAnalysisOn(e.target.checked)} />
            Live eval &amp; best move
          </label>
        </div>
      </div>

      <div className="fp-side-col">
        <div className="card">
          <h3>Moves</h3>
          <MoveList sanHistory={sanHistory} />
        </div>

        <div className="card fp-io">
          <h3>FEN</h3>
          <input className="fp-fen-input fp-fen-current" value={fen} readOnly onFocus={(e) => e.target.select()} />
          <button className="btn btn-sm" onClick={() => copyToClipboard(fen, 'FEN')}>
            Copy current FEN
          </button>
          <input
            className="fp-fen-input"
            value={fenInput}
            onChange={(e) => setFenInput(e.target.value)}
            placeholder="Paste a FEN here to load it…"
          />
          <button className="btn btn-sm" onClick={handleLoadFen}>
            Load FEN
          </button>
        </div>

        <div className="card fp-io">
          <h3>PGN</h3>
          <textarea
            className="fp-pgn-input scrollbar-thin"
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
            placeholder="Paste a PGN to load, or use Copy current PGN below."
          />
          <div className="fp-io-buttons">
            <button className="btn btn-sm" onClick={handleLoadPgn}>
              Load PGN
            </button>
            <button className="btn btn-sm" onClick={() => copyToClipboard(pgn, 'PGN')}>
              Copy current PGN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function uciArrow(uci: string): { startSquare: string; endSquare: string } {
  const mv = uciToMove(uci);
  return { startSquare: mv.from, endSquare: mv.to };
}

function relativeToWhite(value: number, turn: 'w' | 'b'): number {
  return turn === 'w' ? value : -value;
}

function turnLabel(turn: 'w' | 'b'): string {
  return turn === 'w' ? 'White' : 'Black';
}
