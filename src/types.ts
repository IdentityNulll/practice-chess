export type AppMode = 'home' | 'bots' | 'free' | 'coaches';

export type PieceColor = 'w' | 'b';

export interface MoveQualityInfo {
  classification: MoveQuality;
  evalBeforeCp: number | null;
  evalAfterCp: number | null;
  evalDeltaCp: number | null;
  mateBefore: number | null;
  mateAfter: number | null;
  hangingPieceSquare: string | null;
  missedCaptureSquare: string | null;
  missedMateIn: number | null;
  forkSquare: string | null;
  bestMoveSan: string | null;
}

export type MoveQuality =
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'missedMate'
  | 'checkmate'
  | 'book';

export interface EngineEvalInfo {
  depth: number;
  cp: number | null;
  mate: number | null;
  bestMoveUci: string | null;
  pvUci: string[];
  multipv: Array<{ moveUci: string; cp: number | null; mate: number | null; rank: number }>;
}
