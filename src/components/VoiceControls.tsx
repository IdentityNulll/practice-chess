import type { UseSpeech } from '../hooks/useSpeech';
import './VoiceControls.css';

export function VoiceControls({ speech }: { speech: UseSpeech }) {
  if (!speech.supported) {
    return (
      <div className="voice-controls card">
        <p className="voice-unsupported">
          Your browser doesn&rsquo;t support speech synthesis, so coaches will show text instead of speaking.
        </p>
      </div>
    );
  }

  return (
    <div className="voice-controls card">
      <div className="voice-row">
        <label className="voice-mute">
          <input type="checkbox" checked={speech.muted} onChange={(e) => speech.setMuted(e.target.checked)} />
          Mute voice
        </label>
      </div>
      <div className="voice-row">
        <label htmlFor="voice-picker">Voice</label>
        <select
          id="voice-picker"
          value={speech.voiceURI ?? ''}
          onChange={(e) => speech.setVoiceURI(e.target.value || undefined)}
        >
          <option value="">Browser default</option>
          {speech.voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>
      <div className="voice-row">
        <label htmlFor="voice-speed">Speed: {speech.rate.toFixed(1)}x</label>
        <input
          id="voice-speed"
          type="range"
          min={0.6}
          max={1.6}
          step={0.1}
          value={speech.rate}
          onChange={(e) => speech.setRate(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
