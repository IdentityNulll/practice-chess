import { useEffect, useState } from 'react';
import type { Arrow } from 'react-chessboard';
import { useChessGame } from '../../hooks/useChessGame';
import { useStockfishEngine } from '../../hooks/useStockfishEngine';
import { pickBotMove } from '../../bots/moveSelection';
import { moveTimeForElo } from '../../bots/botLevels';
import { uciToMove } from '../../engine/uci';
import { Board } from '../../components/Board';
import { MoveList } from '../../components/MoveList';
import { CapturedPieces, materialValue } from '../../components/CapturedPieces';
import { LevelPicker, type BotGameConfig } from './LevelPicker';
import './PlayVsBot.css';

const HINT_COLOR = '#7c9eff';

export function PlayVsBot() {
  const [config, setConfig] = useState<BotGameConfig | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [hintArrow, setHintArrow] = useState<Arrow[] | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [resigned, setResigned] = useState(false);

  const { engineRef, isReady } = useStockfishEngine();
  const {
    game,
    fen,
    status,
    sanHistory,
    verboseHistory,
    capturedPieces,
    canUndo,
    makeMove,
    undo,
    reset,
  } = useChessGame();

  const gameOver = status.isGameOver || resigned;
  const playerTurn = Boolean(config) && game.turn() === config!.color && !gameOver;
  // Only enable takeback once the player has actually made a move — otherwise there's
  // nothing of theirs to take back, and undoing would just re-roll the bot's opening move.
  const canTakeback = canUndo && playerTurn && verboseHistory.some((m) => m.color === config?.color);

  // Configure engine strength whenever a new game starts.
  useEffect(() => {
    if (!config || !isReady || !engineRef.current) return;
    engineRef.current.newGame();
    engineRef.current.setOption('UCI_LimitStrength', true);
    engineRef.current.setOption('UCI_Elo', config.elo);
  }, [config, isReady, engineRef]);

  // Trigger a bot move whenever it becomes the bot's turn.
  useEffect(() => {
    if (!config || !isReady || resigned || status.isGameOver) return;
    if (game.turn() === config.color) return;
    const engine = engineRef.current;
    if (!engine) return;

    let cancelled = false;
    setIsBotThinking(true);
    engine.setPositionFen(fen);
    engine
      .go({ movetimeMs: moveTimeForElo(config.elo), multipv: 3 })
      .then((result) => {
        if (cancelled) return;
        const moveUci = pickBotMove(result, config.elo) ?? result.bestMoveUci;
        if (moveUci) makeMove(uciToMove(moveUci));
      })
      .finally(() => {
        if (!cancelled) setIsBotThinking(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, config, isReady, resigned, status.isGameOver]);

  // A hint (or a new move) invalidates any previously shown arrow.
  useEffect(() => {
    setHintArrow(null);
  }, [fen]);

  function handleStart(newConfig: BotGameConfig) {
    setConfig(newConfig);
    setOrientation(newConfig.color === 'w' ? 'white' : 'black');
    setResigned(false);
    reset();
  }

  function handleNewGame() {
    setConfig(null);
    setResigned(false);
    setHintArrow(null);
    reset();
  }

  function handleTakeback() {
    if (!canTakeback || isBotThinking) return;
    undo();
    undo();
  }

  async function handleHint() {
    if (!engineRef.current || !playerTurn || hintLoading) return;
    setHintLoading(true);
    engineRef.current.setPositionFen(fen);
    try {
      const result = await engineRef.current.go({ movetimeMs: 500, multipv: 1 });
      if (result.bestMoveUci) {
        const mv = uciToMove(result.bestMoveUci);
        setHintArrow([{ startSquare: mv.from, endSquare: mv.to, color: HINT_COLOR }]);
      }
    } finally {
      setHintLoading(false);
    }
  }

  if (!config) {
    return <LevelPicker onStart={handleStart} />;
  }

  const capturedByWhite = capturedPieces.b;
  const capturedByBlack = capturedPieces.w;
  const whiteAdvantage = materialValue(capturedByWhite) - materialValue(capturedByBlack);

  let statusText: string;
  if (resigned) {
    statusText = `You resigned — ${config.color === 'w' ? 'Black' : 'White'} wins`;
  } else if (status.resultText) {
    statusText = status.resultText;
  } else if (isBotThinking) {
    statusText = 'Bot is thinking…';
  } else if (playerTurn) {
    statusText = status.isCheck ? 'Your move — you are in check!' : 'Your move';
  } else {
    statusText = "Waiting for the bot…";
  }

  return (
    <div className="play-vs-bot">
      <div className="pvb-board-col">
        <Board
          game={game}
          orientation={orientation}
          interactive={playerTurn}
          onMove={(m) => Boolean(makeMove(m))}
          arrows={hintArrow ?? undefined}
        />
        <div className="pvb-status-bar">
          <span className={`pill ${status.isCheckmate || resigned ? 'pill-bad' : ''}`}>{statusText}</span>
          <span className="pill">vs Elo {config.elo}</span>
        </div>
      </div>

      <div className="pvb-side-col">
        <div className="card pvb-controls">
          <div className="pvb-captured">
            <CapturedPieces pieces={capturedByWhite} color="b" materialDiff={whiteAdvantage > 0 ? whiteAdvantage : undefined} />
            <CapturedPieces pieces={capturedByBlack} color="w" materialDiff={whiteAdvantage < 0 ? -whiteAdvantage : undefined} />
          </div>
          <div className="pvb-buttons">
            <button className="btn btn-sm" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
              Flip board
            </button>
            <button className="btn btn-sm" onClick={handleTakeback} disabled={!canTakeback || isBotThinking}>
              Takeback
            </button>
            <button className="btn btn-sm" onClick={handleHint} disabled={!playerTurn || hintLoading}>
              {hintLoading ? 'Thinking…' : 'Hint'}
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setResigned(true)} disabled={gameOver}>
              Resign
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleNewGame}>
            New game
          </button>
        </div>

        <div className="card">
          <h3>Moves</h3>
          <MoveList sanHistory={sanHistory} />
        </div>
      </div>
    </div>
  );
}
