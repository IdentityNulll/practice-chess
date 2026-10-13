import './EvalBar.css';

export interface EvalBarProps {
  /** Centipawns from White's perspective (positive = White is better). Ignored when mateWhite is set. */
  cpWhite: number | null;
  /** Moves to mate from White's perspective (positive = White mates, negative = White gets mated). */
  mateWhite: number | null;
  loading?: boolean;
}

function cpToWhitePercent(cp: number): number {
  const percent = 100 / (1 + Math.pow(10, -cp / 400));
  return Math.min(99, Math.max(1, percent));
}

export function EvalBar({ cpWhite, mateWhite, loading }: EvalBarProps) {
  let whitePercent = 50;
  let label = '0.0';

  if (mateWhite !== null && mateWhite !== 0) {
    whitePercent = mateWhite > 0 ? 100 : 0;
    label = `M${Math.abs(mateWhite)}`;
  } else if (cpWhite !== null) {
    whitePercent = cpToWhitePercent(cpWhite);
    const pawns = cpWhite / 100;
    label = `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
  }

  return (
    <div className="eval-bar" aria-label="Evaluation bar">
      <div className="eval-bar-track">
        <div className="eval-bar-white" style={{ height: `${whitePercent}%` }} />
      </div>
      <span className="eval-bar-label">{loading ? '…' : label}</span>
    </div>
  );
}
