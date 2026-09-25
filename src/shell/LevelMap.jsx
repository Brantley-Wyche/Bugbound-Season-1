import { useSyncExternalStore } from 'react';
import { levels } from '../levels/index.js';
import { isUnlocked } from './progression.js';
import { activityFor, getLearningSnapshot, subscribeLearning } from './learning.js';
import { capitalize, formatDay, plural } from './format.js';
import Arrow from './Arrow.jsx';

function rowNote({ checkRuns, hintsRevealed, lastPracticedAt, resolvedAt }, done) {
  const work = [checkRuns && plural(checkRuns, 'run'), hintsRevealed.length && plural(hintsRevealed.length, 'hint')].filter(Boolean);
  const parts = done
    ? [resolvedAt && capitalize(formatDay(resolvedAt)), ...work]
    : work.length ? [...work, lastPracticedAt && `last worked ${formatDay(lastPracticedAt)}`] : [];
  return parts.filter(Boolean).join(' · ') || null;
}

function IncidentRow({ level, completed, activity }) {
  const unlocked = isUnlocked(level, completed, levels);
  const done = completed.has(level.id);
  const Tag = unlocked ? 'a' : 'div';
  const note = unlocked ? rowNote(activity, done) : null;

  return (
    <li>
      <Tag
        className={`incident-row ${done ? 'is-resolved' : unlocked ? 'is-open' : 'is-locked'}`}
        href={unlocked ? `#/level/${level.id}` : undefined}
      >
        <span className="incident-number">{String(level.number).padStart(2, '0')}</span>
        <span className="incident-name">{level.title}{note && <span className="row-note">{note}</span>}</span>
        <span className="incident-concept">{level.concept}</span>
        <span className={`incident-status ${done ? 'state-ok' : unlocked ? 'state-open' : ''}`}>
          {done ? 'Resolved' : unlocked ? 'Open' : 'Locked'}
          {!unlocked && <span className="sr-only"> — resolve the previous incident to unlock</span>}
        </span>
      </Tag>
    </li>
  );
}

export default function LevelMap({ completed }) {
  const telemetry = useSyncExternalStore(subscribeLearning, getLearningSnapshot).levels;
  const nextLevel = levels.find((level) => !completed.has(level.id) && isUnlocked(level, completed, levels));
  const completedCount = levels.filter((level) => completed.has(level.id)).length;
  const allDone = completedCount === levels.length;
  const nextActivity = nextLevel ? activityFor(telemetry, nextLevel.id) : null;
  const started = Boolean(nextActivity && (nextActivity.checkRuns || nextActivity.hintsRevealed.length));

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="notebook-intro" aria-labelledby="page-title">
        <div className="intro-copy">
          <h1 id="page-title" tabIndex={-1}>Learn React<br />by fixing it.</h1>
          <p>Fifteen incidents. One working notebook.<br />Read the report, find the cause, and make the fix in your editor.</p>
          <button type="button" className="text-link" onClick={() => {
            document.getElementById('incident-register')?.scrollIntoView();
            document.getElementById('incident-register')?.focus({ preventScroll: true });
          }}>Browse the incidents <Arrow direction="down" /></button>
        </div>
        <div className={`current-assignment ${allDone ? 'is-resolved' : ''}`}>
          <span className="assignment-index" aria-hidden="true">
            {allDone ? '15/15' : String(nextLevel?.number ?? 1).padStart(2, '0')}
          </span>
          <div>
            <h2>{allDone ? 'A season well resolved.' : nextLevel.title}</h2>
            <p>{allDone ? 'All fifteen incidents are resolved. Revisit any entry below to keep the concepts fresh.' : nextLevel.concept}</p>
            {!allDone && (
              <a className="btn btn-primary" href={`#/level/${nextLevel.id}`}>
                {started ? 'Continue' : 'Start'} Incident {String(nextLevel.number).padStart(2, '0')}
                <Arrow />
              </a>
            )}
            <span className="assignment-note">{allDone ? 'Season complete' : 'Learn · Reproduce · Repair · Verify'}</span>
          </div>
        </div>
      </section>

      <div id="incident-register" className="incident-register" tabIndex={-1}>
        {[
          { title: 'Core React', act: 'Act I', items: levels.filter((level) => level.number <= 12) },
          { title: 'The TypeScript arc', act: 'Act II', items: levels.filter((level) => level.number > 12) },
        ].map(({ title, act, items }) => (
          <section className="register-section" key={act} aria-label={`${act} — ${title}`}>
            <div className="register-heading"><h2>{title}</h2><span>{act} / {items.length} incidents</span></div>
            <ol className="incident-list" start={items[0].number}>
              {items.map((level) => <IncidentRow key={level.id} level={level} completed={completed} activity={activityFor(telemetry, level.id)} />)}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
