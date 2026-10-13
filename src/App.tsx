import { useState } from 'react';
import type { AppMode } from './types';
import { NavBar } from './components/NavBar';
import { Home } from './modes/Home';
import { PlayVsBot } from './modes/PlayVsBot/PlayVsBot';
import { FreePlay } from './modes/FreePlay/FreePlay';
import { Coaches } from './modes/Coaches/Coaches';
import './App.css';

function App() {
  const [mode, setMode] = useState<AppMode>('home');

  return (
    <div className="app-shell">
      <NavBar mode={mode} onModeChange={setMode} />
      <main className="app-main">
        {mode === 'home' && <Home onSelect={setMode} />}
        {mode === 'bots' && <PlayVsBot />}
        {mode === 'free' && <FreePlay />}
        {mode === 'coaches' && <Coaches />}
      </main>
    </div>
  );
}

export default App;
