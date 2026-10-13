import type { AppMode } from '../types';
import './Home.css';

const CARDS: Array<{ mode: AppMode; title: string; emoji: string; description: string }> = [
  {
    mode: 'bots',
    title: 'Play vs Bots',
    emoji: '♟️',
    description: 'Challenge Stockfish from a gentle 600 Elo up to a brutal 2400. Take back moves, flip the board, or ask for a hint.',
  },
  {
    mode: 'free',
    title: 'Free Play',
    emoji: '🧩',
    description: 'A no-pressure analysis board. Move both colors, load any FEN or PGN, and optionally turn on a live evaluation bar.',
  },
  {
    mode: 'coaches',
    title: 'Coaches',
    emoji: '🎓',
    description: 'Get live spoken feedback on your moves from one of three coaches, or work through guided lessons on tactics and endgames.',
  },
];

export function Home({ onSelect }: { onSelect: (mode: AppMode) => void }) {
  return (
    <div className="home">
      <div className="home-intro">
        <h1>Rookwise</h1>
        <p className="home-tagline">
          A free, private chess trainer. Everything — the engine, the voices, the lessons — runs locally in your browser. No
          accounts, no servers, no tracking.
        </p>
      </div>
      <div className="home-grid">
        {CARDS.map((card) => (
          <button key={card.mode} className="home-card card" onClick={() => onSelect(card.mode)}>
            <span className="home-card-emoji" aria-hidden>
              {card.emoji}
            </span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
