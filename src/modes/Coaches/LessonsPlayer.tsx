import { useEffect, useState } from 'react';
import { LESSONS, type Lesson } from '../../lessons/lessonData';
import { getCompletedLessons, markLessonComplete } from '../../lessons/progress';
import { useChessGame } from '../../hooks/useChessGame';
import { Board } from '../../components/Board';
import type { Coach } from '../../coaching/coaches';
import type { UseSpeech } from '../../hooks/useSpeech';
import './LessonsPlayer.css';

const CATEGORY_LABELS: Record<Lesson['category'], string> = {
  basics: 'Piece basics',
  tactics: 'Tactics',
  checkmate: 'Checkmate patterns',
  opening: 'Opening principles',
  endgame: 'Endgames',
};

export function LessonsPlayer({ coach, speech, onExit }: { coach: Coach; speech: UseSpeech; onExit: () => void }) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => getCompletedLessons());

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) ?? null;

  function handleComplete(id: string) {
    markLessonComplete(id);
    setCompleted(getCompletedLessons());
  }

  if (activeLesson) {
    return (
      <LessonRunner
        key={activeLesson.id}
        lesson={activeLesson}
        coach={coach}
        speech={speech}
        onComplete={() => handleComplete(activeLesson.id)}
        onExit={() => setActiveLessonId(null)}
      />
    );
  }

  return (
    <div className="lessons-list">
      <div className="lessons-list-header">
        <h2>Lessons with {coach.name}</h2>
        <button className="btn btn-sm" onClick={onExit}>
          Back
        </button>
      </div>
      <p className="lessons-progress-note">
        {completed.size} of {LESSONS.length} lessons completed
      </p>
      <div className="lessons-grid">
        {LESSONS.map((lesson) => (
          <button key={lesson.id} className="lesson-card card" onClick={() => setActiveLessonId(lesson.id)}>
            <span className="lesson-category pill">{CATEGORY_LABELS[lesson.category]}</span>
            {completed.has(lesson.id) && <span className="lesson-done" aria-label="Completed">✓</span>}
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonRunner({
  lesson,
  coach,
  speech,
  onComplete,
  onExit,
}: {
  lesson: Lesson;
  coach: Coach;
  speech: UseSpeech;
  onComplete: () => void;
  onExit: () => void;
}) {
  const { game, makeMove, undo } = useChessGame(lesson.startFen);
  const [feedback, setFeedback] = useState<{ text: string; kind: 'info' | 'success' | 'error' } | null>(null);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setFeedback({ text: lesson.instruction, kind: 'info' });
    setSolved(false);
    setShowHint(false);
    speech.sayAs(coach.voice, lesson.instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  function handleMove(move: { from: string; to: string; promotion?: string }): boolean {
    if (solved) return false;
    const result = makeMove(move);
    if (!result) return false;

    if (lesson.expectedMoves.includes(result.lan)) {
      setSolved(true);
      setFeedback({ text: lesson.successText, kind: 'success' });
      speech.sayAs(coach.voice, lesson.successText);
      onComplete();
    } else {
      setFeedback({ text: lesson.wrongMoveText, kind: 'error' });
      speech.sayAs(coach.voice, lesson.wrongMoveText);
      setTimeout(() => undo(), 700);
    }
    return true;
  }

  function handleHint() {
    setShowHint(true);
    speech.sayAs(coach.voice, lesson.hint);
  }

  return (
    <div className="lesson-runner">
      <div className="lr-board-col">
        <Board game={game} orientation={lesson.orientation} interactive={!solved} onMove={handleMove} />
        <div className="lr-buttons">
          <button className="btn btn-sm" onClick={handleHint} disabled={showHint || solved}>
            Hint
          </button>
          <button className="btn btn-sm" onClick={onExit}>
            Back to lessons
          </button>
        </div>
      </div>
      <div className="lr-side-col">
        <div className="card lr-coach-panel">
          <span className="coach-avatar-sm" aria-hidden>
            {coach.avatar}
          </span>
          <div className="lr-feedback-stack">
            <p className={`lr-feedback lr-feedback-${feedback?.kind ?? 'info'}`}>{feedback?.text}</p>
            {showHint && <p className="lr-hint">💡 {lesson.hint}</p>}
          </div>
        </div>
        {solved && (
          <button className="btn btn-primary" onClick={onExit}>
            Choose another lesson
          </button>
        )}
      </div>
    </div>
  );
}
