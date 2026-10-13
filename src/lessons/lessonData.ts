export type LessonCategory = 'basics' | 'tactics' | 'checkmate' | 'opening' | 'endgame';

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  description: string;
  startFen: string;
  orientation: 'white' | 'black';
  instruction: string;
  /** Acceptable moves in chess.js "lan" form (e.g. "e2e4", "e7e8q") — from+to+promotion, no SAN ambiguity. */
  expectedMoves: string[];
  hint: string;
  successText: string;
  wrongMoveText: string;
}

export const LESSONS: Lesson[] = [
  {
    id: 'pawn-moves',
    title: 'Pawns: Forward and Captures',
    category: 'basics',
    description: 'Pawns move straight ahead, but capture diagonally.',
    startFen: '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1',
    orientation: 'white',
    instruction:
      'Pawns are the only piece that moves one way and captures another. They push straight ahead, but they capture diagonally. See the black pawn ahead of you, one diagonal step away? Capture it.',
    expectedMoves: ['e4d5'],
    hint: 'Your pawn is on e4. It captures diagonally onto d5.',
    successText: 'Exactly — exd5! Straight ahead to move, diagonal to capture. That’s the whole rule.',
    wrongMoveText: 'Not quite. Remember: this pawn captures diagonally, not straight ahead. Try the diagonal capture onto d5.',
  },
  {
    id: 'rook-power',
    title: "The Rook's Power",
    category: 'basics',
    description: 'Rooks slide freely along open ranks and files.',
    startFen: 'r3k3/8/8/8/8/8/8/R3K3 w - - 0 1',
    orientation: 'white',
    instruction:
      'A rook moves in straight lines — any distance, along a rank or a file, as long as nothing blocks its path. Your rook shares an open file with the black rook. Capture it.',
    expectedMoves: ['a1a8'],
    hint: 'The a-file is completely open between your rook and the black rook on a8.',
    successText: 'Rxa8 — well done! Rooks dominate open files and ranks like that.',
    wrongMoveText: 'Look along the file your rook sits on. It’s wide open all the way to the black rook.',
  },
  {
    id: 'bishop-diagonals',
    title: 'Bishops Love Diagonals',
    category: 'basics',
    description: 'Bishops slide along diagonals only.',
    startFen: '4k3/8/8/4p3/8/8/8/B3K3 w - - 0 1',
    orientation: 'white',
    instruction:
      'A bishop only ever moves along diagonals, but it can travel far on them. Your bishop on a1 shares a long diagonal with that black pawn. Capture it.',
    expectedMoves: ['a1e5'],
    hint: 'Follow the a1-h8 diagonal — the black pawn sits right on it.',
    successText: 'Bxe5! You’ve got the idea — bishops own their diagonal, however long it is.',
    wrongMoveText: 'This bishop can only slide diagonally. Trace the diagonal from a1 — it runs straight to the black pawn.',
  },
  {
    id: 'knight-leap',
    title: "The Knight's Leap",
    category: 'basics',
    description: 'Knights jump in an L-shape and ignore pieces in between.',
    startFen: '4k3/8/8/8/3p4/5N2/8/4K3 w - - 0 1',
    orientation: 'white',
    instruction:
      'Knights move in an L-shape — two squares one way, one square the other — and they hop clean over anything in their path. Find the L-shaped jump that captures the black pawn.',
    expectedMoves: ['f3d4'],
    hint: 'From f3, count two squares toward the center file, then one more rank.',
    successText: 'Nxd4 — that’s the leap! Knights are the only piece that can jump over others.',
    wrongMoveText: 'Think in an L-shape: two squares in one direction, then one square sideways. One of those lands right on the pawn.',
  },
  {
    id: 'back-rank-mate',
    title: 'The Back-Rank Mate',
    category: 'checkmate',
    description: 'A king trapped on the back rank by its own pawns is an easy target.',
    startFen: '6k1/5ppp/8/8/8/8/8/3RK3 w - - 0 1',
    orientation: 'white',
    instruction:
      'The black king is boxed in by its own pawns — it can’t step up to the seventh rank at all. If your rook reaches the back rank with a clear path, there’s no escape. Find the checkmate.',
    expectedMoves: ['d1d8'],
    hint: 'Slide your rook all the way down the d-file to the back rank.',
    successText: 'Rd8#! That’s the back-rank mate — the king’s own pawns sealed its fate.',
    wrongMoveText: 'The king has nowhere to run on the back rank. Bring your rook all the way to the eighth rank.',
  },
  {
    id: 'queen-king-mate',
    title: 'Queen and King Team Up',
    category: 'checkmate',
    description: 'A queen delivers mate when your king guards the square she lands on.',
    startFen: 'k7/8/1QK5/8/8/8/8/8 w - - 0 1',
    orientation: 'white',
    instruction:
      'Your king is right next to b7, ready to protect your queen the moment she lands there. Move your queen to b7 — the black king in the corner will have nowhere to go, and it can’t capture a queen your king is defending.',
    expectedMoves: ['b6b7'],
    hint: 'Your queen is on b6. Move her one square up to b7 — your king on c6 guards that square.',
    successText: 'Qb7#! Checkmate — the corner, your king’s support, and your queen all worked together.',
    wrongMoveText: 'Look at b7: your king already defends it. Put your queen there and the black king is trapped.',
  },
  {
    id: 'knight-fork',
    title: 'Spot the Knight Fork',
    category: 'tactics',
    description: 'One knight move, two pieces attacked at once.',
    startFen: '4k3/8/r1r5/8/8/3N4/8/4K3 w - - 0 1',
    orientation: 'white',
    instruction:
      'Both black rooks are sitting on squares a knight could attack from the very same spot. Find the one square your knight can jump to that attacks them both at once — that’s a fork.',
    expectedMoves: ['d3b4'],
    hint: 'From d3, look for an L-shaped jump that lands within striking distance of both rooks.',
    successText: 'Nb4 — a perfect fork! Both rooks are attacked, and only one can escape.',
    wrongMoveText: 'There’s a single square where your knight would threaten both black rooks simultaneously. Look for the L-shape that hits both.',
  },
  {
    id: 'pin',
    title: 'Pinning Down the Action',
    category: 'tactics',
    description: 'A pin stops a piece from moving by threatening something behind it.',
    startFen: '4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1',
    orientation: 'white',
    instruction:
      'The black knight and the black king share a diagonal. If your bishop steps onto that same diagonal, the knight won’t dare move — it would expose its own king. Pin it.',
    expectedMoves: ['f1b5'],
    hint: 'Your bishop is on f1. The diagonal running through c6 and e8 is the one you want.',
    successText: 'Bb5 — that’s a pin! The knight on c6 is now frozen in place, defending its king by default.',
    wrongMoveText: 'Find the diagonal that passes through both the black knight and the black king, and put your bishop on it.',
  },
  {
    id: 'center-control',
    title: 'Control the Center',
    category: 'opening',
    description: 'Strong openings fight for the center from move one.',
    startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    orientation: 'white',
    instruction:
      'Here’s the very first move of the game. The single most important opening principle is to fight for the center early. Play one of the classic center pawn pushes.',
    expectedMoves: ['e2e4', 'd2d4'],
    hint: 'Push the e-pawn or the d-pawn two squares — both stake a claim on the center.',
    successText: 'A great first move — claiming the center gives your pieces more room to develop and more influence over the whole board.',
    wrongMoveText: 'That move doesn’t fight for the center. Try pushing the e-pawn or the d-pawn two squares forward.',
  },
  {
    id: 'king-pawn-promote',
    title: 'King and Pawn vs King',
    category: 'endgame',
    description: 'When the enemy king is too far away, a pawn just walks home.',
    startFen: 'k7/4P3/8/8/8/8/8/K7 w - - 0 1',
    orientation: 'white',
    instruction:
      'The black king is stuck in the far corner — much too far to stop your pawn. One more step and it becomes a brand new queen. Push it home.',
    expectedMoves: ['e7e8q', 'e7e8r', 'e7e8b', 'e7e8n'],
    hint: 'Move the pawn from e7 to e8 and choose a piece to promote to.',
    successText: 'Promoted! A lone pawn, given a clear road, is worth a whole new piece. That’s the whole idea of a passed pawn.',
    wrongMoveText: 'Nothing can stop this pawn. Push it from e7 to e8 and promote it.',
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
