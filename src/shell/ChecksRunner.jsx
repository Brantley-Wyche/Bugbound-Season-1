import { useEffect, useRef, useState } from 'react';
import { runIsolatedCheck } from './exercise-frame.js';
import { recordCheckRun } from './learning.js';
import { formatDay, formatMoment, formatTime, plural } from './format.js';
import Arrow from './Arrow.jsx';

/** One incident visit's verification loop, shared by the workbench and the log. */
export function useCheckRuns(level, { isComplete, onAllPass }) {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState([]);
  const [current, setCurrent] = useState(null);
  const activeRun = useRef(null);
  useEffect(() => () => activeRun.current?.abort(), []);

  async function runAll() {
    if (activeRun.current) return;
    const controller = new AbortController();
    activeRun.current = controller;
    const resolves = !isComplete;
    setRunning(true);
    setCurrent(null);
    setResults(level.checks.map((c) => ({ name: c.name, pending: true })));

    try {
      const finished = [];
      for (let index = 0; index < level.checks.length; index++) {
        const result = await runIsolatedCheck(level, index, { signal: controller.signal });
        if (controller.signal.aborted) return;
        finished.push(result);
        setResults([
          ...finished,
          ...level.checks.slice(finished.length).map((c) => ({ name: c.name, pending: true })),
        ]);
      }
      if (!controller.signal.aborted) {
        const allPassed = finished.length > 0 && finished.every((r) => r.pass);
        const activity = recordCheckRun(level.id, finished, { resolves });
        const run = {
          number: activity?.checkRuns ?? runs.length + 1,
          at: new Date(),
          passed: finished.filter((r) => r.pass).length,
          total: finished.length,
          resolved: allPassed && resolves,
        };
        setCurrent(run);
        setRuns((previous) => [run, ...previous]);
        if (allPassed) onAllPass();
      }
    } catch (error) {
      if (!controller.signal.aborted) setResults([{ name: 'Check runner', pass: false, message: `The check run could not finish: ${error?.message || error}. Please re-run.` }]);
    } finally {
      if (activeRun.current === controller) activeRun.current = null;
      if (!controller.signal.aborted) setRunning(false);
    }
  }

  return { results, running, runs, current, runAll };
}

function benchStatus({ results, running, current }, { isComplete, activity, total }) {
  if (running) return { label: 'Verification', value: 'Running the checks…' };
  if (current?.resolved) return { label: 'Status', value: `Resolved on run ${current.number}`, tone: 'state-ok' };
  if (current) {
    const allPassed = current.passed === current.total;
    return { label: 'Last run', value: `Run ${current.number} · ${current.passed} of ${current.total} passed`, tone: allPassed ? 'state-ok' : 'state-fail' };
  }
  if (results) return { label: 'Last run', value: 'Could not finish', tone: 'state-fail' };
  if (isComplete) return { label: 'Not run this visit', value: activity.resolvedAt ? `Resolved ${formatDay(activity.resolvedAt)}` : 'Resolved', tone: 'state-ok' };
  return { label: 'Not run this visit', value: `${plural(total, 'check')} to pass` };
}

/** The loop's controls and latest result, kept in reach while the learner reads. */
export function Workbench({ level, checks, isComplete, activity, next }) {
  const status = benchStatus(checks, { isComplete, activity, total: level.checks.length });
  const label = checks.running ? 'Running…' : isComplete ? 'Run checks again' : checks.results ? 'Re-run checks' : 'Run checks';

  return (
    <div className="workbench">
      <p className="workbench-status">
        <span className="workbench-label">{status.label}</span>
        <span className={`workbench-value ${status.tone ?? ''}`}>{status.value}</span>
      </p>
      <div className="workbench-actions">
        {/* One button in every state keeps keyboard focus through a run; runAll ignores repeat presses. */}
        <button id="run-checks" className={`btn${isComplete ? '' : ' btn-primary'}`} onClick={checks.runAll} aria-disabled={checks.running}>
          {label}
        </button>
        {isComplete && (
          <a className="btn btn-primary" href={next ? `#/level/${next.id}` : '#/'}>
            {next ? `Next: ${next.title}` : 'Return to the register'} <Arrow />
          </a>
        )}
      </div>
    </div>
  );
}

function standingNote({ current, results }, { isComplete, activity }) {
  if (!isComplete || current?.resolved) return null;
  const resolvedOn = activity.resolvedAt ? formatDay(activity.resolvedAt) : null;
  if (current && current.passed < current.total) {
    return <><strong>Your resolution{resolvedOn ? ` from ${resolvedOn}` : ''} still stands.</strong> The source as it is now fails {plural(current.total - current.passed, 'check')}; re-run after editing.</>;
  }
  if (!results) {
    return resolvedOn && activity.resolvedRun
      ? <><strong>Resolved {resolvedOn}</strong> after {plural(activity.resolvedRun, 'run')}. That record stays; a new run checks the source as it is now.</>
      : <><strong>Resolved in an earlier visit.</strong> That record stays; a new run checks the source as it is now.</>;
  }
  return null;
}

/** Each run's results, this visit's earlier runs, and the resolution record. */
export function VerificationLog({ level, checks, isComplete, isSaved, activity }) {
  const { results, running, runs, current } = checks;
  const earlier = runs.slice(current ? 1 : 0);
  const standing = standingNote(checks, { isComplete, activity });
  const hints = activity.hintsRevealed.length;

  return (
    <section className="checks-entry" aria-busy={running} aria-labelledby="checks">
      <div className="section-heading"><h2 id="checks" tabIndex={-1}>Verification log</h2><span className="document-ref">{plural(level.checks.length, 'check')}</span></div>

      <div className="checks-list" aria-live="polite" aria-atomic="false">
        {current && !running && (
          <p className="check-summary">Run {current.number} · {formatTime(current.at)} — {current.passed} of {current.total} checks passed.</p>
        )}
        {results?.map((r, i) => (
          <div
            key={i}
            className={`check-row ${r.pending ? 'pending' : r.pass ? 'pass' : 'fail'}`}
          >
            <span className="check-chip">{r.pending ? 'PEND' : r.pass ? 'PASS' : 'FAIL'}</span>
            <div className="check-body">
              <div className="check-name">{r.name}</div>
              {!r.pending && !r.pass && <div className="check-error">{r.message}</div>}
            </div>
          </div>
        ))}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {current?.resolved && !running && (
          <div className="log-resolution">
            <h3>Resolved.</h3>
            <p>
              Recorded {formatMoment(current.at)} after {plural(current.number, 'run')}{hints ? ` and ${plural(hints, 'hint')}` : ''}.
              {isSaved ? ' Saved in this browser.' : ' Your fix passed, but progress has not been saved yet.'}
            </p>
          </div>
        )}
      </div>

      {!running && !results && (
        <p className="checks-idle">
          {isComplete
            ? 'No checks run in this visit. Run the checks to verify your current source.'
            : 'Fix the bug in your editor (the page hot-reloads), then run the checks. All green unlocks the next incident.'}
        </p>
      )}
      {!running && standing && <p className="log-standing">{standing}</p>}
      {!running && current && !current.resolved && !standing && (
        <p className="section-note last-run-note">Results describe run {current.number}. Re-run after editing your source files.</p>
      )}

      {earlier.length > 0 && (
        <div className="run-history">
          <h3>Earlier runs this visit</h3>
          <ol>
            {earlier.map((run) => (
              <li key={run.at.getTime()}><span>Run {run.number}</span><span>{formatTime(run.at)}</span><span>{run.passed} of {run.total} passed</span></li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
