import { useEffect, useState } from 'react';
import { levels } from '../levels/index.js';
import { loadProgress, saveCompleted, clearProgress, isProgressStorageKey } from './progress.js';
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
  const [progress, setProgress] = useState(() => loadProgress(levelIds));
  const { completed } = progress;
  const completedCount = levels.filter((level) => completed.has(level.id)).length;

  useEffect(() => {
    const syncProgress = event => {
      if (!isProgressStorageKey(event.key)) return;
      const next = loadProgress(levelIds);
      setProgress(previous => {
        if (next.error) return { ...previous, error: next.error, errorAction: 'save' };
        if (next.generation !== previous.generation) return next;
        const combined = new Set([...previous.completed, ...next.completed]);
        const keepError = previous.errorAction === 'reset' || combined.size > next.savedCompleted.size;
        return { ...next, completed: combined, error: keepError ? previous.error : null, errorAction: keepError ? previous.errorAction : undefined };
      });
    };
    window.addEventListener('storage', syncProgress);
    return () => window.removeEventListener('storage', syncProgress);
  }, []);

  const persist = (earned, generation) => {
    const result = saveCompleted(earned, { generation, validIds: levelIds });
    setProgress(previous => {
      if (previous.generation !== generation) return previous;
      if (result.status === 'error') return { ...previous, completed: new Set([...previous.completed, ...earned]), error: result.error, errorAction: 'save' };
      if (result.status === 'stale') return { ...result.progress, error: 'Progress changed in another tab. Run the checks again to record a new completion.' };
      return result.progress;
    });
  };

  const markComplete = id => persist(new Set([...completed, id]), progress.generation);

  const resetProgress = (askConfirmation = true) => {
    if (!askConfirmation || window.confirm('Clear saved completion? Later levels will lock again; Level 1 stays available.')) {
      const result = clearProgress();
      if (result.status === 'error') {
        setProgress(previous => ({ ...previous, error: result.error, errorAction: 'reset' }));
        return;
      }
      setProgress(result.progress);
      navigate('/');
    }
  };

  const levelId = route.startsWith('#/level/') ? route.slice('#/level/'.length) : null;
  const activeLevel = levelId ? levels.find((l) => l.id === levelId) : null;
  const showLevel = activeLevel && isUnlocked(activeLevel, completed);

  useEffect(() => {
    document.title = showLevel
      ? `${activeLevel.title} · Bugbound`
      : 'Bugbound · Learn React by fixing it';
    document.getElementById('page-title')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [route, showLevel, activeLevel]);

  return (
    <div className="app">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>Skip to content</a>
      <header className="app-header">
        <a className="wordmark" href="#/" aria-label="Bugbound — incident register">
          <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M6 4h16a4 4 0 0 1 4 4v20H10a4 4 0 0 1-4-4V4Z" stroke="currentColor" strokeWidth="2" />
            <path d="M11 4v24M16 11h5M16 16h5" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>Bugbound</span>
        </a>
        <span className="season-label">Season 01 <span>/ React field notes</span></span>
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
            {completedCount} / {levels.length} resolved
          </span>
        </div>
      </header>

      <aside className="desktop-notice" aria-labelledby="desktop-notice-title">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M16 22v6M10 28h12" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div>
          <h2 id="desktop-notice-title">Use a desktop to work on the exercises.</h2>
          <p>Bugbound is a desktop-first project. To fix bugs, edit the actual source files in a local code editor, let Vite recompile the app, then run the checks in a desktop browser.</p>
          <p className="desktop-notice-browse">You can still browse the lessons here.</p>
        </div>
      </aside>

      {progress.error && (
        <aside className="storage-notice" role="status">
          <p>{progress.error}</p>
          <button className="btn" onClick={() => progress.errorAction === 'reset' ? resetProgress(false) : persist(completed, progress.generation)}>
            {progress.errorAction === 'reset' ? 'Retry reset' : 'Retry saving progress'}
          </button>
        </aside>
      )}

      {showLevel ? (
        <LevelPage
          key={`${activeLevel.id}:${progress.generation}`}
          level={activeLevel}
          isComplete={completed.has(activeLevel.id)}
          isSaved={progress.savedCompleted.has(activeLevel.id)}
          onComplete={() => markComplete(activeLevel.id)}
        />
      ) : (
        <LevelMap completed={completed} />
      )}

      <footer className="app-footer">
        <span>Bugbound / Season 01<br /><span className="footer-credit">React + Vite · Levels &amp; bugs by Claude</span></span>
        <button className="link-button" onClick={() => resetProgress()}>
          Reset progress
        </button>
      </footer>
    </div>
  );
}
