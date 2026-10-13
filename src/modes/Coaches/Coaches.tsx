import { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { VoiceControls } from '../../components/VoiceControls';
import { pick } from '../../coaching/commentary';
import type { Coach } from '../../coaching/coaches';
import { CoachSelect } from './CoachSelect';
import { CoachedGame } from './CoachedGame';
import { LessonsPlayer } from './LessonsPlayer';
import './Coaches.css';

type Activity = 'game' | 'lessons' | null;

export function Coaches() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [activity, setActivity] = useState<Activity>(null);
  const speech = useSpeech();

  function handleSelectCoach(selected: Coach) {
    setCoach(selected);
    speech.sayAs(selected.voice, pick(selected.templates.greeting));
  }

  function handleChangeCoach() {
    speech.stop();
    setCoach(null);
    setActivity(null);
  }

  if (!coach) {
    return <CoachSelect onSelect={handleSelectCoach} />;
  }

  return (
    <div className="coaches-shell">
      <div className="coaches-main">
        <div className="coach-banner card">
          <span className="coach-avatar-sm" aria-hidden>
            {coach.avatar}
          </span>
          <div>
            <h2>{coach.name}</h2>
            <p className="coach-tagline">{coach.tagline}</p>
          </div>
          <button className="btn btn-sm coach-change-btn" onClick={handleChangeCoach}>
            Change coach
          </button>
        </div>

        {activity === null && (
          <div className="activity-grid">
            <button className="btn btn-primary activity-btn" onClick={() => setActivity('game')}>
              Play a coached game
            </button>
            <button className="btn btn-primary activity-btn" onClick={() => setActivity('lessons')}>
              Guided lessons
            </button>
          </div>
        )}

        {activity === 'game' && <CoachedGame coach={coach} speech={speech} onExit={() => setActivity(null)} />}
        {activity === 'lessons' && <LessonsPlayer coach={coach} speech={speech} onExit={() => setActivity(null)} />}
      </div>

      <div className="coaches-side">
        <VoiceControls speech={speech} />
      </div>
    </div>
  );
}
