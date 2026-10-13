# Rookwise

A free, private chess trainer that runs entirely in your browser — no backend, no accounts, no API keys. Play Stockfish at any strength from 600 to 2400 Elo, use a full analysis board, or get live spoken coaching and guided lessons from one of three original coach characters.

Everything — the chess engine, the voices, the lessons — runs client-side. `npm run build` produces a static site you can host anywhere (Netlify instructions below).

## Features

### Play vs Bots
- Easy / Medium / Hard presets plus a fine-grained 600–2400 Elo slider, implemented with Stockfish's `UCI_LimitStrength` / `UCI_Elo` options.
- Weak levels are humanized: on top of the engine's own strength limiting, the bot sometimes plays the engine's 2nd or 3rd-best move (via `MultiPV`) instead of its absolute best — see [Decisions](#decisions-made) below.
- Choose your color, takeback, resign, flip the board, hint button, move list, captured pieces, and full checkmate/stalemate/draw detection.

### Free Play (analysis board)
- Move both colors yourself. Undo/redo, flip, reset.
- Load a position from FEN or PGN; copy the current FEN or PGN to your clipboard.
- Optional live Stockfish evaluation bar and best-move arrow.

### Coaches
- Three original coach characters, each with a distinct personality and voice (pitch/rate):
  - **Pip Pawnworth** 🐥 — gentle beginner coach, warm and encouraging.
  - **Vex Knightly** 🦊 — sharp-eyed tactics coach, energetic and a little mischievous.
  - **Magister Thorne** 🦉 — strict master coach, formal and exacting.
- **Coached games**: play a bot game while your chosen coach evaluates every move you make (via a full-strength Stockfish search, independent of the bot's own weakened engine) and speaks a short, template-based reaction — covering good moves, inaccuracies, blunders, hanging pieces, missed captures, missed forced mates, and forks. No LLM is involved: it's entirely engine data plugged into per-coach phrase templates.
- **Lessons**: 10 guided lessons covering piece movement, checkmate patterns, forks, pins, opening principles, and a basic endgame. Each lesson sets up a position, the coach explains it by voice, waits for the correct move, gives spoken feedback on wrong tries, and tracks completion in `localStorage`.

### Voice
- Uses the browser's built-in Web Speech API (`speechSynthesis`) — nothing is sent over the network.
- Mute toggle, voice picker, and a speed slider, shared across the Coaches mode.
- Falls back to text-only automatically if `speechSynthesis` isn't available.

## Project structure

```
src/
  engine/      Stockfish Web Worker client + UCI parsing (framework-agnostic)
  bots/        Elo presets and "humanized" move selection
  coaching/    Coach personalities, move-quality classification, commentary templates
  speech/      speechSynthesis wrapper
  lessons/     Lesson content + localStorage progress tracking
  components/  Shared UI (board, move list, captured pieces, eval bar, voice controls)
  hooks/       useChessGame (chess.js wrapper), useStockfishEngine, useSpeech
  modes/       The three top-level modes (PlayVsBot, FreePlay, Coaches)
```

## Setup

```bash
npm install
npm run dev
```

Then open the printed local URL. Production build:

```bash
npm run build   # tsc -b && vite build, outputs to dist/
npm run preview # serve the production build locally
```

## Deploying to Netlify

This is a static site — no server-side code or environment variables required.

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Either connect the repo in the Netlify UI with those two settings, or run `netlify deploy --build` from the project root with the Netlify CLI.

## Stockfish license note

This project bundles the `stockfish-19-lite-single` WebAssembly build from the [stockfish npm package](https://www.npmjs.com/package/stockfish) (`public/stockfish/`). Stockfish is licensed under the **GNU GPLv3** — see `public/stockfish/LICENSE.txt`. The engine is loaded as a static asset and run in a Web Worker; this project's own code is separate from, and does not modify, the Stockfish engine itself.

## Decisions made

A few points were ambiguous in the original brief; here's what was chosen and why.

- **Dark theme only.** The brief asked for "dark mode," which this interprets as a single, carefully designed dark UI rather than a light/dark toggle — scoped down to keep the design coherent.
- **Stockfish build: `lite-single` instead of the full engine.** The npm `stockfish` package ships five builds. The full single-threaded WASM is ~99 MB; the lite single-threaded build is ~1.8 MB, loads in a couple of seconds even on slow connections, needs no special cross-origin-isolation headers (so it works on any static host, including Netlify's default config), and is still vastly stronger than any human. This felt like the right trade-off for a free, zero-config, static deployment.
- **Elo slider at the low end.** Stockfish's own `UCI_Elo` floor may sit well above 600 depending on the build. Below that floor, the "humanized" move-selection (occasionally playing the engine's 2nd/3rd-best move instead of its top choice, scaled by the slider position) is what actually produces the extra weakness — the slider always has a visible effect across its full range even if the engine's internal limiter saturates.
- **Coach analysis uses its own full-strength engine.** During a coached game, the bot's reply and the coach's verdict on *your* move both need Stockfish — but the bot intentionally plays at reduced strength, while the coach's commentary needs to be accurate regardless of the bot's level. So coached games run two independent engine instances: one Elo-limited (for the bot's move), one always at full strength (for commentary).
- **Lessons are single-move drills.** Each lesson is one position with one (or a small accepted set of) correct move, matching the brief's "sets up a position... waits for me to play the correct move" literally, rather than building multi-step scripted sequences.
- **App and coach names.** "Rookwise" and the three coach names/personalities (Pip Pawnworth, Vex Knightly, Magister Thorne) are original to this project.

## Testing performed

Every mode was exercised in a real browser during development: bot games at Easy/Medium/Hard and custom Elo as both colors (moves, takeback, resign, flip, hint, checkmate/draw detection), Free Play (undo/redo, FEN and PGN load/copy, live eval bar + best-move arrow), a coached game (including a verified full-strength blunder detection fix), and all 10 lessons (including the promotion dialog and wrong-move feedback). A production `npm run build` was also verified to succeed and to include the Stockfish assets.
