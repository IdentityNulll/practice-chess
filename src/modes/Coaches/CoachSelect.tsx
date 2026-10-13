import { COACHES, type Coach } from '../../coaching/coaches';
import './CoachSelect.css';

export function CoachSelect({ onSelect }: { onSelect: (coach: Coach) => void }) {
  return (
    <div className="coach-select">
      <h2>Choose your coach</h2>
      <div className="coach-grid">
        {COACHES.map((coach) => (
          <button key={coach.id} className="coach-card card" onClick={() => onSelect(coach)}>
            <span className="coach-avatar" aria-hidden>
              {coach.avatar}
            </span>
            <h3>{coach.name}</h3>
            <p className="coach-tagline">{coach.tagline}</p>
            <p className="coach-personality">{coach.personality}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
