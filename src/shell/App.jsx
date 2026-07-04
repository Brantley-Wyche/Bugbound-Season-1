import { useEffect, useState } from 'react';
import { levels } from '../levels/index.js';
import { loadCompleted, saveCompleted, clearProgress } from './progress.js';
import LevelMap from './LevelMap.jsx';
import LevelPage from './LevelPage.jsx';

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
  const [completed, setCompleted] = useState(loadCompleted);

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
          <span>Bugbound</span>
          <span className="season">Season 1</span>
        </button>
        <div className="header-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(completed.size / levels.length) * 100}%` }}
            />
          </div>
          <span className="label">
            {completed.size} / {levels.length} fixed
          </span>
        </div>
      </header>

      {showLevel ? (
        <LevelPage
          level={activeLevel}
          isComplete={completed.has(activeLevel.id)}
          onComplete={() => markComplete(activeLevel.id)}
        />
      ) : (
        <LevelMap completed={completed} />
      )}

      <footer className="app-footer">
        <span>Built with React + Vite · Levels &amp; bugs authored by Claude</span>
        <button className="link-button" onClick={resetProgress}>
          Reset progress
        </button>
      </footer>
    </div>
  );
}
