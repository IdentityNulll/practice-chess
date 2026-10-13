import type { Coach } from './coaches';
import type { MoveQualityInfo } from '../types';

export interface CommentaryLine {
  text: string;
  highlightSquare: string | null;
}

export function pick(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)] ?? '';
}

function fill(template: string, square: string | null): string {
  return square ? template.replace('{square}', square) : template;
}

/**
 * Picks one spoken/shown line for a move, in priority order: a decisive event
 * (checkmate, missed mate) beats a tactical note (hanging piece, missed
 * capture, fork), which beats a plain quality verdict. Only one line is
 * returned, matching "coach speaks and shows a short line" per move.
 */
export function pickCommentary(coach: Coach, info: MoveQualityInfo): CommentaryLine {
  const t = coach.templates;

  if (info.classification === 'checkmate') {
    return { text: pick(t.checkmate), highlightSquare: null };
  }
  if (info.classification === 'missedMate') {
    return { text: pick(t.missedMate), highlightSquare: null };
  }
  if (info.hangingPieceSquare && (info.classification === 'mistake' || info.classification === 'blunder')) {
    return { text: fill(pick(t.hangingPiece), info.hangingPieceSquare), highlightSquare: info.hangingPieceSquare };
  }
  if (info.missedCaptureSquare && info.classification !== 'best' && info.classification !== 'good') {
    return { text: fill(pick(t.missedCapture), info.missedCaptureSquare), highlightSquare: info.missedCaptureSquare };
  }
  if (info.forkSquare && (info.classification === 'best' || info.classification === 'good')) {
    return { text: fill(pick(t.fork), info.forkSquare), highlightSquare: info.forkSquare };
  }

  const byTier: Record<'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder', string[]> = {
    best: t.best,
    good: t.good,
    inaccuracy: t.inaccuracy,
    mistake: t.mistake,
    blunder: t.blunder,
  };
  const tier = info.classification in byTier ? (info.classification as keyof typeof byTier) : 'good';
  return { text: pick(byTier[tier]), highlightSquare: null };
}
