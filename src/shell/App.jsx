import { useEffect, useState } from 'react';
import { levels } from '../levels/index.js';
import { loadCompleted, saveCompleted, clearProgress } from './progress.js';
import LevelMap from './LevelMap.jsx';
import LevelPage from './LevelPage.jsx';

const levelIds = levels.map((level) => level.id);

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function navigate(path) {
  window.location.hash = path;
  window.scrollTo(0, 0);
}

export function isUnlocked(level, completed) {
  if (level.number === 1) return true;
  const previous = levels.find((l) => l.number === level.number - 1);
  return previous ? completed.has(previous.id) : false;
}

export default function App() {
  const route = useHashRoute();
  const [completed, setCompleted] = useState(() => loadCompleted(levelIds));
  const completedCount = levels.filter((level) => completed.has(level.id)).length;

  const markComplete = (id) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveCompleted(next);
      return next;
    });
  };

  const resetProgress = () => {
    if (window.confirm('Reset all progress? Every level will lock again.')) {
      clearProgress();
      setCompleted(new Set());
      navigate('/');
    }
  };

  const levelId = route.startsWith('#/level/') ? route.slice('#/level/'.length) : null;
  const activeLevel = levelId ? levels.find((l) => l.id === levelId) : null;
  const showLevel = activeLevel && isUnlocked(activeLevel, completed);

  return (
    <div className="app">
      <header className="app-header">
        <button className="wordmark" onClick={() => navigate('/')}>
          <span className="bug">🐛</span>
          <span>BUGBOUND</span>
          <span className="season">SEASON 1</span>
        </button>
        <div className="header-progress">
          <div
            className="uptime-strip"
            title={`${completedCount} of ${levels.length} incidents resolved`}
            role="progressbar"
            aria-label="Season progress"
            aria-valuemin="0"
            aria-valuemax={levels.length}
            aria-valuenow={completedCount}
          >
            {levels.map((l) => (
              <span
                key={l.id}
                className={`seg ${completed.has(l.id) ? 'done' : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="label">
            {completedCount}/{levels.length} RESOLVED
          </span>
        </div>
      </header>

      <aside className="desktop-notice" role="note">
        <span className="desktop-notice-icon" aria-hidden="true">▣</span>
        <span>
          <strong>Best experienced on a computer.</strong> Bugbound works on smaller screens, but
          the intended setup is your editor and this app side by side.
        </span>
      </aside>

      {showLevel ? (
        <LevelPage
          key={activeLevel.id}
          level={activeLevel}
          isComplete={completed.has(activeLevel.id)}
          onComplete={() => markComplete(activeLevel.id)}
        />
      ) : (
        <LevelMap completed={completed} />
      )}

      <footer className="app-footer">
        <span>BUGBOUND · SEASON 1 · REACT + VITE · LEVELS &amp; BUGS BY CLAUDE</span>
        <button className="link-button" onClick={resetProgress}>
          Reset progress
        </button>
      </footer>
    </div>
  );
}
