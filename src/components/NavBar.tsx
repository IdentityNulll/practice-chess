import type { AppMode } from '../types';
import './NavBar.css';

const TABS: Array<{ id: AppMode; label: string; emoji: string }> = [
  { id: 'bots', label: 'Play vs Bots', emoji: '♟️' },
  { id: 'free', label: 'Free Play', emoji: '🧩' },
  { id: 'coaches', label: 'Coaches', emoji: '🎓' },
];

export function NavBar({ mode, onModeChange }: { mode: AppMode; onModeChange: (m: AppMode) => void }) {
  return (
    <header className="nav-bar">
      <button className="nav-brand" onClick={() => onModeChange('home')} aria-label="Go to home">
        <span className="nav-brand-mark" aria-hidden>
          ♞
        </span>
        <span>Rookwise</span>
      </button>
      <nav className="nav-tabs" aria-label="App modes">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${mode === tab.id ? 'nav-tab-active' : ''}`}
            onClick={() => onModeChange(tab.id)}
          >
            <span aria-hidden>{tab.emoji}</span>
            <span className="nav-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
