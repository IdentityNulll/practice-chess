import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useChessGame } from '../../hooks/useChessGame';
import { useStockfishEngine } from '../../hooks/useStockfishEngine';
import { pickBotMove } from '../../bots/moveSelection';
import { moveTimeForElo } from '../../bots/botLevels';
import { uciToMove } from '../../engine/uci';
import { classifyMove } from '../../coaching/analysis';
import { pickCommentary } from '../../coaching/commentary';
import type { Coach } from '../../coaching/coaches';
import type { UseSpeech } from '../../hooks/useSpeech';
import type { EngineEvalInfo } from '../../types';
import { Board } from '../../components/Board';
import { MoveList } from '../../components/MoveList';
import { CapturedPieces, materialValue } from '../../components/CapturedPieces';
import { LevelPicker, type BotGameConfig } from '../PlayVsBot/LevelPicker';
import './CoachedGame.css';

interface BeforeMoveSnapshot {
  fen: string;
  info: EngineEvalInfo;
}

export function CoachedGame({ coach, speech, onExit }: { coach: Coach; speech: UseSpeech; onExit: () => void }) {
  const [config, setConfig] = useState<BotGameConfig | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [resigned, setResigned] = useState(false);
  const [commentary, setCommentary] = useState<{ text: string; highlightSquare: string | null } | null>(null);

  const beforeSnapshotRef = useRef<BeforeMoveSnapshot | null>(null);

  // Two independent engines: `botEngine` is Elo-limited and picks the bot's moves;
  // `analysisEngine` always runs at full strength so the coach's verdicts on the
  // player's moves stay accurate regardless of how weak the opponent is.
  const { engineRef: botEngineRef, isReady: botReady } = useStockfishEngine();
  const { engineRef: analysisEngineRef, isReady: analysisReady } = useStockfishEngine();
  const { game, fen, status, sanHistory, capturedPieces, canUndo, makeMove, undo, reset } = useChessGame();

  const gameOver = status.isGameOver || resigned;
  const playerTurn = Boolean(config) && game.turn() === config!.color && !gameOver;

  useEffect(() => {
    if (!config || !botReady || !botEngineRef.current) return;
    botEngineRef.current.newGame();
    botEngineRef.current.setOption('UCI_LimitStrength', true);
    botEngineRef.current.setOption('UCI_Elo', config.elo);
  }, [config, botReady, botEngineRef]);

  useEffect(() => {
    if (!config || !analysisReady || !analysisEngineRef.current) return;
    analysisEngineRef.current.newGame();
  }, [config, analysisReady, analysisEngineRef]);

  // Silent look-ahead: as soon as it's the player's turn, start evaluating so the
  // result is ready the moment they move (their think time dwarfs the search time).
  useEffect(() => {
    if (!config || !analysisReady || resigned || status.isGameOver) return;
    if (game.turn() !== config.color) return;
    const engine = analysisEngineRef.current;
    if (!engine) return;

    let cancelled = false;
    engine.setPositionFen(fen);
    engine.go({ movetimeMs: 700, multipv: 3 }).then((result) => {
      if (!cancelled) beforeSnapshotRef.current = { fen, info: result };
    });
    return () => {
      cancelled = true;
    };
  }, [fen, config, analysisReady, resigned, status.isGameOver, analysisEngineRef, game]);

  // The bot's turn: analyze the player's move that just happened (full-strength
  // engine), speak a line, then let the Elo-limited engine pick the bot's reply.
  useEffect(() => {
    if (!config || !botReady || resigned || status.isGameOver) return;
    if (game.turn() === config.color) return;
    const botEngine = botEngineRef.current;
    if (!botEngine) return;

    const lastMove = game.history({ verbose: true }).at(-1);
    const shouldAnalyze = lastMove?.color === config.color;
    const snapshot = beforeSnapshotRef.current;
    const analysisEngine = analysisEngineRef.current;

    let cancelled = false;
    setIsBotThinking(true);

    const analysisPromise =
      shouldAnalyze && snapshot && analysisEngine
        ? (() => {
            analysisEngine.setPositionFen(fen);
            return analysisEngine.go({ movetimeMs: 700, multipv: 1 });
          })()
        : Promise.resolve(null);

    botEngine.setPositionFen(fen);
    const botPromise = botEngine.go({ movetimeMs: moveTimeForElo(config.elo), multipv: 3 });

    Promise.all([analysisPromise, botPromise])
      .then(([evalAfter, botResult]) => {
        if (cancelled) return;

        if (evalAfter && snapshot) {
          const info = classifyMove({
            beforeFen: snapshot.fen,
            afterFen: fen,
            moverColor: config.color,
            evalBefore: snapshot.info,
            evalAfter,
          });
          const line = pickCommentary(coach, info);
          setCommentary(line);
          speech.sayAs(coach.voice, line.text);
        }

        const moveUci = pickBotMove(botResult, config.elo) ?? botResult.bestMoveUci;
        if (moveUci) makeMove(uciToMove(moveUci));
      })
      .finally(() => {
        if (!cancelled) setIsBotThinking(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, config, botReady, resigned, status.isGameOver]);

  function handleStart(newConfig: BotGameConfig) {
    beforeSnapshotRef.current = null;
    setConfig(newConfig);
    setOrientation(newConfig.color === 'w' ? 'white' : 'black');
    setResigned(false);
    setCommentary(null);
    reset();
  }

  function handleTakeback() {
    if (!canUndo || isBotThinking) return;
    setCommentary(null);
    undo();
    undo();
  }

  if (!config) {
    return (
      <div className="coached-game-setup">
        <LevelPicker onStart={handleStart} />
        <button className="btn btn-sm" onClick={onExit}>
          Back
        </button>
      </div>
    );
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
    statusText = `${coach.name} is thinking…`;
  } else if (playerTurn) {
    statusText = status.isCheck ? 'Your move — you are in check!' : 'Your move';
  } else {
    statusText = 'Waiting for the bot…';
  }

  const extraSquareStyles: Record<string, CSSProperties> | undefined = commentary?.highlightSquare
    ? { [commentary.highlightSquare]: { boxShadow: 'inset 0 0 0 4px var(--warn)' } }
    : undefined;

  return (
    <div className="coached-game">
      <div className="cg-board-col">
        <Board
          game={game}
          orientation={orientation}
          interactive={playerTurn}
          onMove={(m) => Boolean(makeMove(m))}
          extraSquareStyles={extraSquareStyles}
        />
        <div className="cg-status-bar">
          <span className={`pill ${status.isCheckmate || resigned ? 'pill-bad' : ''}`}>{statusText}</span>
          <span className="pill">vs Elo {config.elo}</span>
        </div>
        <div className="cg-buttons">
          <button className="btn btn-sm" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
            Flip board
          </button>
          <button className="btn btn-sm" onClick={handleTakeback} disabled={!canUndo || isBotThinking}>
            Takeback
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setResigned(true)} disabled={gameOver}>
            Resign
          </button>
          <button className="btn btn-sm" onClick={onExit}>
            Back
          </button>
        </div>
      </div>

      <div className="cg-side-col">
        <div className="card cg-commentary">
          <span className="coach-avatar-sm" aria-hidden>
            {coach.avatar}
          </span>
          <p>{commentary?.text ?? `${coach.name} is watching this game and will comment after your moves.`}</p>
        </div>

        <div className="card">
          <div className="cg-captured">
            <CapturedPieces pieces={capturedByWhite} color="b" materialDiff={whiteAdvantage > 0 ? whiteAdvantage : undefined} />
            <CapturedPieces pieces={capturedByBlack} color="w" materialDiff={whiteAdvantage < 0 ? -whiteAdvantage : undefined} />
          </div>
        </div>

        <div className="card">
          <h3>Moves</h3>
          <MoveList sanHistory={sanHistory} />
        </div>
      </div>
    </div>
  );
}
