export interface ParsedInfoLine {
  depth: number;
  multipv: number;
  cp: number | null;
  mate: number | null;
  pv: string[];
}

export interface ParsedBestMove {
  bestMoveUci: string | null;
  ponderUci: string | null;
}

/** Parses a single UCI "info ..." line into its useful fields. Returns null for lines without a score (e.g. string/currmove info). */
export function parseInfoLine(line: string): ParsedInfoLine | null {
  const tokens = line.trim().split(/\s+/);
  if (tokens[0] !== 'info') return null;

  let depth = 0;
  let multipv = 1;
  let cp: number | null = null;
  let mate: number | null = null;
  let pv: string[] = [];

  for (let i = 1; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok === 'depth') {
      depth = Number(tokens[++i]);
    } else if (tok === 'multipv') {
      multipv = Number(tokens[++i]);
    } else if (tok === 'score') {
      const kind = tokens[++i];
      const value = Number(tokens[++i]);
      if (kind === 'cp') {
        cp = value;
        mate = null;
      } else if (kind === 'mate') {
        mate = value;
        cp = null;
      }
    } else if (tok === 'pv') {
      pv = tokens.slice(i + 1);
      break;
    }
  }

  if (cp === null && mate === null) return null;
  return { depth, multipv, cp, mate, pv };
}

export function parseBestMoveLine(line: string): ParsedBestMove {
  const tokens = line.trim().split(/\s+/);
  const bestIdx = tokens.indexOf('bestmove');
  const ponderIdx = tokens.indexOf('ponder');
  const bestMoveUci = bestIdx >= 0 ? tokens[bestIdx + 1] : null;
  const ponderUci = ponderIdx >= 0 ? tokens[ponderIdx + 1] : null;
  return {
    bestMoveUci: bestMoveUci === '(none)' ? null : bestMoveUci,
    ponderUci: ponderUci === '(none)' ? null : ponderUci,
  };
}

/** Converts a UCI move like "e2e4" or "e7e8q" into {from, to, promotion}. */
export function uciToMove(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  };
}
