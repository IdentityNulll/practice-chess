export interface CoachTemplates {
  greeting: string[];
  checkmate: string[];
  missedMate: string[];
  hangingPiece: string[];
  missedCapture: string[];
  fork: string[];
  best: string[];
  good: string[];
  inaccuracy: string[];
  mistake: string[];
  blunder: string[];
}

export interface Coach {
  id: 'pip' | 'vex' | 'thorne';
  name: string;
  avatar: string;
  tagline: string;
  personality: string;
  voice: { pitch: number; rate: number };
  templates: CoachTemplates;
}

export const COACHES: Coach[] = [
  {
    id: 'pip',
    name: 'Pip Pawnworth',
    avatar: '🐥',
    tagline: 'The gentle beginner coach',
    personality: 'Warm, patient, and endlessly encouraging. Pip celebrates small wins and treats mistakes as part of learning.',
    voice: { pitch: 1.25, rate: 1.0 },
    templates: {
      greeting: [
        "Hi, I'm Pip! I'll be right here cheering you on — don't worry about mistakes, that's how we learn.",
        "Hello there! I'm Pip. We'll take this one move at a time, no pressure at all.",
      ],
      checkmate: ["Checkmate! You did it — that was wonderful!", "That's checkmate! I'm so proud of you!"],
      missedMate: [
        'Oh, so close! There was actually a checkmate on the board there — don’t worry, we’ll spot it next time.',
        'You had a forced checkmate available! It’s tricky to see those, keep practicing and you’ll spot them.',
      ],
      hangingPiece: [
        'Careful — your piece on {square} is undefended right now. Take a peek before your next move!',
        'Just a heads up, the piece on {square} could be captured for free. Happens to everyone!',
      ],
      missedCapture: [
        'There was a nice capture waiting on {square} — easy to miss, no worries.',
        'You could have grabbed the piece on {square} there. Keep an eye out for those next time!',
      ],
      fork: [
        'Ooh, nice! Your piece is attacking two things at once from {square} — that’s called a fork!',
        'Lovely move! That piece on {square} is forking two targets at the same time.',
      ],
      best: ["That's the best move on the board — great job!", 'Wonderful, that’s exactly the top choice!'],
      good: ["Good move! That keeps things solid.", 'Nice, that’s a perfectly reasonable move.'],
      inaccuracy: ["That's okay, just a small slip — there was a slightly better move.", 'A tiny inaccuracy, nothing to worry about.'],
      mistake: ['That one gave away a bit of your advantage — let’s be more careful next time.', 'Hmm, that wasn’t quite ideal, but we’ll bounce back.'],
      blunder: [
        'Oops, that move loses some material — it happens to everyone, let’s learn from it.',
        'That was a tough one to spot, but it cost you there. Shall we keep going?',
      ],
    },
  },
  {
    id: 'vex',
    name: 'Vex Knightly',
    avatar: '🦊',
    tagline: 'The sharp-eyed tactics coach',
    personality: 'Energetic and a little mischievous. Vex lives for tactics — forks, pins, and combinations get her genuinely excited.',
    voice: { pitch: 1.05, rate: 1.15 },
    templates: {
      greeting: [
        "I'm Vex! I'm here to help you spot every fork, pin, and skewer on this board. Let's find some fireworks!",
        'Vex here. Tactics are my favorite thing in the world — let’s go hunting for them together.',
      ],
      checkmate: ['Checkmate! Boom, that’s how it’s done!', 'Game over — checkmate! That was sharp.'],
      missedMate: [
        'Whoa, hold on — there was a forced mate sitting right there! So close.',
        'You walked right past a checkmate! Keep scanning for forcing moves.',
      ],
      hangingPiece: [
        'Watch out, your piece on {square} is just hanging there for the taking.',
        'That piece on {square} has zero defenders. Someone’s going to grab it.',
      ],
      missedCapture: [
        'You left a free piece on {square}! That capture was sitting right there.',
        'Big one: the piece on {square} was yours for the taking.',
      ],
      fork: [
        "That's a fork! Your piece on {square} is hitting two targets at once — chef's kiss.",
        'Yes! Double attack from {square} — that’s a textbook fork.',
      ],
      best: ['Engine-approved! That’s the sharpest move here.', 'That’s the top move — clean and precise.'],
      good: ['Solid choice, keeps the pressure on.', 'Good, that keeps your position active.'],
      inaccuracy: ['Small slip — there was a punchier move available.', 'Not bad, but there was something sharper on the board.'],
      mistake: ['That let some of your advantage slip away. Stay sharp!', 'Hmm, that gave your opponent some breathing room.'],
      blunder: ['Ouch — that one hands over real material. Let’s regroup.', 'That’s a costly slip. Happens to the best of us, shake it off.'],
    },
  },
  {
    id: 'thorne',
    name: 'Magister Thorne',
    avatar: '🦉',
    tagline: 'The strict master coach',
    personality: 'Formal, exacting, and deeply principled. Thorne expects rigor and precision, but respects genuine improvement.',
    voice: { pitch: 0.82, rate: 0.95 },
    templates: {
      greeting: [
        'I am Magister Thorne. We will proceed with discipline. Every move has a reason — find yours.',
        'Thorne, at your service. I expect sound principles, not guesswork. Let us begin.',
      ],
      checkmate: ['Checkmate. A clean, decisive conclusion. Well executed.', 'Checkmate delivered. That is how a game is finished.'],
      missedMate: [
        'A forced mate was available and you did not find it. Study the position again after this game.',
        'You permitted the win to slip past you — a forced checkmate stood on this board.',
      ],
      hangingPiece: [
        'Your piece on {square} stands undefended. This is a basic error to avoid.',
        'Note well: the piece on {square} has no protection whatsoever.',
      ],
      missedCapture: [
        'A free capture on {square} was available and you declined it. Examine every capture before you move.',
        'You overlooked material on {square}. This discipline must improve.',
      ],
      fork: [
        'Correct — a fork from {square}, attacking two pieces simultaneously. Precisely the kind of calculation I expect.',
        'A fork, well seen. The piece on {square} now threatens two targets at once.',
      ],
      best: ['Correct. The strongest move on the board.', 'Precisely the engine’s top choice. Well calculated.'],
      good: ['Acceptable. A sound, principled move.', 'Reasonable. Nothing squandered here.'],
      inaccuracy: ['A minor inaccuracy. A stronger continuation existed.', 'Not the sharpest choice, but not yet a true error.'],
      mistake: ['That is a mistake. Your advantage has diminished.', 'An error of judgement. Reassess before your next move.'],
      blunder: ['That is a blunder. Material has been surrendered needlessly.', 'Unacceptable — you have handed over significant material.'],
    },
  },
];

export function getCoach(id: string): Coach {
  return COACHES.find((c) => c.id === id) ?? COACHES[0];
}
