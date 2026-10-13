import './CapturedPieces.css';

const GLYPHS: Record<'w' | 'b', Record<string, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

const VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

const ORDER = ['q', 'r', 'b', 'n', 'p'];

export function CapturedPieces({ pieces, color, materialDiff }: { pieces: string[]; color: 'w' | 'b'; materialDiff?: number }) {
  const sorted = [...pieces].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  return (
    <div className="captured-row">
      <div className="captured-glyphs">
        {sorted.map((p, i) => (
          <span key={i} aria-hidden>
            {GLYPHS[color][p]}
          </span>
        ))}
      </div>
      {materialDiff !== undefined && materialDiff > 0 && <span className="captured-diff">+{materialDiff}</span>}
    </div>
  );
}

export function materialValue(pieces: string[]): number {
  return pieces.reduce((sum, p) => sum + (VALUES[p] ?? 0), 0);
}
