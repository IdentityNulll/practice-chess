import { useState } from 'react';
import { BOT_PRESETS, ELO_MAX, ELO_MIN } from '../../bots/botLevels';
import './LevelPicker.css';

export interface BotGameConfig {
  elo: number;
  color: 'w' | 'b';
}

export function LevelPicker({ onStart }: { onStart: (config: BotGameConfig) => void }) {
  const [elo, setElo] = useState(1400);
  const [color, setColor] = useState<'w' | 'b' | 'random'>('w');

  return (
    <div className="level-picker card">
      <h2>Play vs Bots</h2>

      <div className="level-presets">
        {BOT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`btn level-preset-btn ${elo === preset.elo ? 'btn-primary' : ''}`}
            onClick={() => setElo(preset.elo)}
          >
            <strong>{preset.label}</strong>
            <span>{preset.elo} Elo</span>
          </button>
        ))}
      </div>
      <p className="level-preset-description">
        {BOT_PRESETS.find((p) => p.elo === elo)?.description ?? 'Custom strength — dial it in with the slider below.'}
      </p>

      <label className="level-slider-label" htmlFor="elo-slider">
        Fine-tune: {elo} Elo
      </label>
      <input
        id="elo-slider"
        type="range"
        min={ELO_MIN}
        max={ELO_MAX}
        step={25}
        value={elo}
        onChange={(e) => setElo(Number(e.target.value))}
      />

      <div className="level-color-row">
        <span>Play as:</span>
        <div className="level-color-buttons">
          <button className={`btn btn-sm ${color === 'w' ? 'btn-primary' : ''}`} onClick={() => setColor('w')}>
            White
          </button>
          <button className={`btn btn-sm ${color === 'b' ? 'btn-primary' : ''}`} onClick={() => setColor('b')}>
            Black
          </button>
          <button className={`btn btn-sm ${color === 'random' ? 'btn-primary' : ''}`} onClick={() => setColor('random')}>
            Random
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary level-start-btn"
        onClick={() => onStart({ elo, color: color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color })}
      >
        Start game
      </button>
    </div>
  );
}
