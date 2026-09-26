import { useSyncExternalStore } from 'react';
import { levels } from '../levels/index.js';
import { isUnlocked } from './progression.js';
import { activityFor, getLearningSnapshot, subscribeLearning } from './learning.js';
import { capitalize, formatDay, plural } from './format.js';
import Arrow from './Arrow.jsx';

const folio = (number) => String(number).padStart(2, '0');
const bugId = (number) => `BUG-${String(number).padStart(3, '0')}`;

const workNote = ({ checkRuns, hintsRevealed }) =>
  [checkRuns && plural(checkRuns, 'run'), hintsRevealed.length && plural(hintsRevealed.length, 'hint')].filter(Boolean);

function Check() {
  return (
    <svg className="closed-mark" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5L10 3.5" />
    </svg>
  );
}

function IncidentRow({ level, completed, activity }) {
  const unlocked = isUnlocked(level, completed, levels);
  const done = completed.has(level.id);
  const Tag = unlocked ? 'a' : 'div';
  const work = unlocked ? workNote(activity) : [];
  const note = [bugId(level.number), ...work, !done && work.length && activity.lastPracticedAt && `last worked ${formatDay(activity.lastPracticedAt)}`]
    .filter(Boolean).join(' · ');

  return (
    <li>
      <Tag
        className={`incident-row ${done ? 'is-resolved' : unlocked ? 'is-open' : 'is-locked'}`}
        href={unlocked ? `#/level/${level.id}` : undefined}
      >
        <span className="incident-number">{folio(level.number)}</span>
        <span className="incident-name">{level.title}<span className="row-note">{note}</span></span>
        <span className="incident-concept">{level.concept}</span>
        <span className={`incident-status ${done ? 'state-ok' : unlocked ? 'state-open' : ''}`}>
          {done ? (
            <>
              <span className="closed"><Check />Resolved</span>
              {activity.resolvedAt && <>{' '}<span className="closed-date">{capitalize(formatDay(activity.resolvedAt))}</span></>}
            </>
          ) : unlocked ? 'Open' : <><span>Opens after</span>{' '}<span>{folio(level.number - 1)}</span></>}
        </span>
      </Tag>
    </li>
  );
}

/** First visit: what Bugbound is, and where to begin. */
function Pitch({ nextLevel }) {
  return (
    <section className="notebook-intro" aria-labelledby="page-title">
      <div className="intro-copy">
        <h1 id="page-title" tabIndex={-1}>Learn React<br />by fixing it.</h1>
        <p>Fifteen incidents. One working notebook.<br />Learn the concept, reproduce the report, repair the file in your editor, and verify with the checks.</p>
        <button type="button" className="text-link" onClick={() => {
          document.getElementById('incident-register')?.scrollIntoView();
          document.getElementById('incident-register')?.focus({ preventScroll: true });
        }}>Browse the incidents <Arrow direction="down" /></button>
      </div>
      <div className="current-assignment">
        <span className="assignment-index" aria-hidden="true">{folio(nextLevel.number)}</span>
        <div>
          <h2>{nextLevel.title}</h2>
          <p>{nextLevel.concept}</p>
          <a className="btn btn-primary" href={`#/level/${nextLevel.id}`}>
            Start Incident {folio(nextLevel.number)}
            <Arrow />
          </a>
          <span className="assignment-note">Learn · Reproduce · Repair · Verify</span>
        </div>
      </div>
    </section>
  );
}

/** Once there is progress: the current incident leads, with the learner's own record. */
function Resume({ nextLevel, telemetry, completed, completedCount }) {
  const activity = activityFor(telemetry, nextLevel.id);
  const work = workNote(activity);
  const previous = levels.find((level) => level.number === nextLevel.number - 1);
  const previousResolvedAt = previous ? activityFor(telemetry, previous.id).resolvedAt : null;
  const record = work.length
    ? [...work, activity.lastPracticedAt && `last worked ${formatDay(activity.lastPracticedAt)}`].filter(Boolean).join(' · ')
    : previous
      ? `Opened by resolving ${folio(previous.number)}${previousResolvedAt ? ` ${formatDay(previousResolvedAt)}` : ''}`
      : 'Not started yet';
  // Field notes outlive a progress reset, so only incidents resolved now count.
  const lastResolved = levels
    .filter((level) => completed.has(level.id))
    .map((level) => ({ level, at: activityFor(telemetry, level.id).resolvedAt }))
    .filter(({ at }) => at)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];

  return (
    <section className="resume" aria-labelledby="page-title">
      <p className="resume-eyebrow" aria-hidden="true">Current incident · Act {nextLevel.number <= 12 ? 'I' : 'II'}</p>
      <div className="resume-main">
        <span className="assignment-index" aria-hidden="true">{folio(nextLevel.number)}</span>
        <div>
          <h1 id="page-title" tabIndex={-1}><span className="sr-only">Current incident: </span>{nextLevel.title}</h1>
          <p className="resume-meta"><span>{nextLevel.concept}</span><span>{bugId(nextLevel.number)}</span></p>
          <p className="row-note">{record}</p>
        </div>
        <a className="btn btn-primary" href={`#/level/${nextLevel.id}`}>
          {work.length ? 'Continue' : 'Start'} Incident {folio(nextLevel.number)}
          <Arrow />
        </a>
      </div>
      <p className="season-line">
        {completedCount} of {levels.length} resolved
        {lastResolved && <> · last resolved: {folio(lastResolved.level.number)} {lastResolved.level.title}, {formatDay(lastResolved.at)}</>}
      </p>
    </section>
  );
}

/** Every incident resolved: the season's record. */
function SeasonRecord({ telemetry }) {
  const records = levels.map((level) => activityFor(telemetry, level.id));
  const runs = records.reduce((sum, activity) => sum + activity.checkRuns, 0);
  const hints = records.reduce((sum, activity) => sum + activity.hintsRevealed.length, 0);
  const dates = records.map((activity) => activity.resolvedAt).filter(Boolean).sort((a, b) => Date.parse(a) - Date.parse(b));
  const first = dates.length ? formatDay(dates[0]) : null;
  const last = dates.length ? formatDay(dates.at(-1)) : null;
  const span = first && (first === last ? capitalize(first) : `${capitalize(first)} to ${last}`);

  return (
    <section className="resume is-resolved" aria-labelledby="page-title">
      <p className="resume-eyebrow">Season 01 · complete</p>
      <div className="resume-main">
        <span className="assignment-index" aria-hidden="true">15/15</span>
        <div>
          <h1 id="page-title" tabIndex={-1}>A season well resolved.</h1>
          <p className="resume-meta">
            {span && <span>{span}</span>}
            {runs > 0 && <span>{plural(runs, 'check run')}</span>}
            <span>{plural(hints, 'hint')}</span>
          </p>
        </div>
      </div>
      <p className="season-line">Revisit any entry below to keep the concepts fresh. A new run checks the source as it is now; your records stay.</p>
    </section>
  );
}

export default function LevelMap({ completed }) {
  const telemetry = useSyncExternalStore(subscribeLearning, getLearningSnapshot).levels;
  const nextLevel = levels.find((level) => !completed.has(level.id) && isUnlocked(level, completed, levels));
  const completedCount = levels.filter((level) => completed.has(level.id)).length;
  const hasProgress = completedCount > 0 || levels.some((level) => {
    const activity = activityFor(telemetry, level.id);
    return activity.checkRuns > 0 || activity.hintsRevealed.length > 0;
  });

  return (
    <main id="main-content" tabIndex={-1}>
      {!nextLevel
        ? <SeasonRecord telemetry={telemetry} />
        : hasProgress
          ? <Resume nextLevel={nextLevel} telemetry={telemetry} completed={completed} completedCount={completedCount} />
          : <Pitch nextLevel={nextLevel} />}

      <div id="incident-register" className="incident-register" tabIndex={-1}>
        {[
          { title: 'Core React', act: 'Act I', items: levels.filter((level) => level.number <= 12) },
          { title: 'The TypeScript arc', act: 'Act II', items: levels.filter((level) => level.number > 12) },
        ].map(({ title, act, items }) => (
          <section className="register-section" key={act} aria-label={`${act}: ${title}`}>
            <div className="register-heading">
              <h2>{title}</h2>
              <span>{act} · {items.filter((level) => completed.has(level.id)).length} of {items.length} resolved</span>
            </div>
            <div className="register-columns" aria-hidden="true"><span>No.</span><span>Incident</span><span>Concept</span><span>Status</span></div>
            <ol className="incident-list" start={items[0].number}>
              {items.map((level) => <IncidentRow key={level.id} level={level} completed={completed} activity={activityFor(telemetry, level.id)} />)}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
