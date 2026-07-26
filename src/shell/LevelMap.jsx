import { levels } from '../levels/index.js';
import { navigate, isUnlocked } from './App.jsx';

function LevelCard({ level, completed }) {
  const unlocked = isUnlocked(level, completed);
  const done = completed.has(level.id);

  return (
    <button
      className={`level-card sev-${level.severity} ${done ? 'complete' : ''} ${unlocked ? '' : 'locked'}`}
      onClick={() => unlocked && navigate(`/level/${level.id}`)}
      disabled={!unlocked}
      title={unlocked ? level.title : 'Fix the previous level to unlock'}
    >
      <div className="top-row">
        <span className="level-num">BUG-{String(level.number).padStart(3, '0')}</span>
        <span className={`level-status ${done ? 'done' : unlocked ? 'open' : 'lock'}`}>
          {done ? '✓ RESOLVED' : unlocked ? 'OPEN' : 'LOCKED'}
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
  const completedCount = levels.filter((level) => completed.has(level.id)).length;
  const allDone = completedCount === levels.length;

  const openCount = levels.length - completedCount;
  const statusTone = allDone ? 'ok' : completedCount === 0 ? 'err' : 'warn';
  const statusClass = allDone ? 'state-ok' : completedCount === 0 ? 'state-critical' : 'state-degraded';
  const statusText = allDone
    ? 'ALL SYSTEMS OPERATIONAL'
    : `${completedCount === 0 ? 'CRITICAL' : 'DEGRADED'} — ${openCount} OPEN INCIDENT${openCount === 1 ? '' : 'S'}`;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Season 1 · Core React · On-Call Rotation</p>
        <h1>Learn React by fixing it.</h1>
        <p className="tagline">
          Every level teaches one React concept — and ships with a real bug. Read the ticket,
          open the file in your editor, fix the code, and run the checks to move on. You're on
          call.
        </p>
        <p className="system-status">
          <span className={`status-dot ${statusTone} ${allDone ? '' : 'live'}`} />
          <span className={statusClass}>SYSTEM STATUS: {statusText}</span>
        </p>
        {allDone ? (
          <span className="chip severity-Low">Season complete — all {levels.length} incidents resolved</span>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => nextLevel && navigate(`/level/${nextLevel.id}`)}
          >
            {completedCount === 0 ? 'Start Level 01' : `Continue → Level ${String(nextLevel.number).padStart(2, '0')}`}
          </button>
        )}

        <div className="workflow-overview" aria-label="The Bugbound debugging loop">
          {[
            ['01', 'Learn', 'Read the concept'],
            ['02', 'Reproduce', 'Trigger the symptom'],
            ['03', 'Repair', 'Work in your editor'],
            ['04', 'Verify', 'Run the checks'],
          ].map(([number, title, detail]) => (
            <div className="workflow-step" key={number}>
              <span className="workflow-number">{number}</span>
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
            </div>
          ))}
        </div>
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
