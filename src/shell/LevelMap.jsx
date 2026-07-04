import { levels } from '../levels/index.js';
import { navigate, isUnlocked } from './App.jsx';

function LevelCard({ level, completed }) {
  const unlocked = isUnlocked(level, completed);
  const done = completed.has(level.id);

  return (
    <button
      className={`level-card ${done ? 'complete' : ''} ${unlocked ? '' : 'locked'}`}
      onClick={() => unlocked && navigate(`/level/${level.id}`)}
      disabled={!unlocked}
      title={unlocked ? level.title : 'Fix the previous level to unlock'}
    >
      <div className="top-row">
        <span className="level-num">LVL {String(level.number).padStart(2, '0')}</span>
        <span className={`level-status ${done ? 'done' : unlocked ? '' : 'lock'}`}>
          {done ? '✓ fixed' : unlocked ? '' : '🔒'}
        </span>
      </div>
      <span className="name">{level.title}</span>
      <span className="chip">{level.concept}</span>
    </button>
  );
}

export default function LevelMap({ completed }) {
  const coreLevels = levels.filter((l) => l.number <= 12);
  const tsLevels = levels.filter((l) => l.number > 12);
  const nextLevel = levels.find((l) => !completed.has(l.id) && isUnlocked(l, completed));
  const allDone = completed.size === levels.length;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Season 1 · Core React</p>
        <h1>Learn React by fixing it.</h1>
        <p className="tagline">
          Every level teaches one React concept — and ships with a real bug. Read the ticket,
          open the file in your editor, fix the code, and run the checks to move on. You're on
          call.
        </p>
        {allDone ? (
          <span className="chip severity-Low">🏆 Season complete — all {levels.length} bugs fixed</span>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => nextLevel && navigate(`/level/${nextLevel.id}`)}
          >
            {completed.size === 0 ? 'Start Level 01' : `Continue → Level ${String(nextLevel.number).padStart(2, '0')}`}
          </button>
        )}
      </section>

      <section className="map-section">
        <h2>Act I — Core React</h2>
        <div className="level-grid">
          {coreLevels.map((level) => (
            <LevelCard key={level.id} level={level} completed={completed} />
          ))}
        </div>
      </section>

      <section className="map-section">
        <h2>Act II — The TypeScript Arc</h2>
        <div className="level-grid">
          {tsLevels.map((level) => (
            <LevelCard key={level.id} level={level} completed={completed} />
          ))}
        </div>
      </section>
    </main>
  );
}
