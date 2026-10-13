export const ELO_MIN = 600;
export const ELO_MAX = 2400;

export interface BotPreset {
  id: 'easy' | 'medium' | 'hard';
  label: string;
  elo: number;
  description: string;
}

export const BOT_PRESETS: BotPreset[] = [
  { id: 'easy', label: 'Easy', elo: 800, description: 'Learning the rules — expect some real mistakes.' },
  { id: 'medium', label: 'Medium', elo: 1400, description: 'A steady club-level opponent.' },
  { id: 'hard', label: 'Hard', elo: 2000, description: 'Sharp and tactical — few mistakes to exploit.' },
];

/** How long the engine is allowed to think, scaled gently with strength so Hard doesn't feel instant. */
export function moveTimeForElo(elo: number): number {
  const t = (elo - ELO_MIN) / (ELO_MAX - ELO_MIN);
  return Math.round(300 + t * 700);
}
