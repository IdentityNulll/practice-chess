const STORAGE_KEY = 'rookwise.lessons.completed';

export function getCompletedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markLessonComplete(id: string): void {
  const completed = getCompletedLessons();
  completed.add(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    // Storage can be unavailable (e.g. private browsing) — progress just won't persist.
  }
}
