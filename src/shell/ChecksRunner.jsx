import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { runIsolatedCheck } from './exercise-frame.js';
import { recordCheckRun } from './learning.js';
import { markRepeatedFailures } from './check-results.js';
import { formatDay, formatMoment, formatTime, plural } from './format.js';
import Arrow from './Arrow.jsx';

const onMac = /Mac|iPhone|iPad/.test(globalThis.navigator?.userAgentData?.platform ?? globalThis.navigator?.platform ?? '');
const RUN_SHORTCUT = onMac ? '⌘ Enter' : 'Ctrl+Enter';

// Form fields keep their own Enter handling, and Ctrl+Enter on a link opens it in a new tab.
const keepsOwnShortcut = (element) => element instanceof HTMLElement
  && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) || Boolean(element.closest('a[href]')));

/** One incident visit's verification loop, shared by the workbench and the log. */
export function useCheckRuns(level, { isComplete, onAllPass }) {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState([]);
  const [current, setCurrent] = useState(null);
  const [notice, setNotice] = useState('');
  const activeRun = useRef(null);
  useEffect(() => () => activeRun.current?.abort(), []);

  async function runAll() {
    if (activeRun.current) {
      setNotice('The checks are already running.');
      return;
    }
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
      if (!controller.signal.aborted) {
        setRunning(false);
        setNotice('');
      }
    }
  }

  // Ctrl+Enter (⌘ Enter on a Mac) runs the checks from anywhere in the shell.
  const onShortcut = useEffectEvent((event) => {
    if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
    if (keepsOwnShortcut(event.target)) return;
    event.preventDefault();
    runAll();
  });
  useEffect(() => {
    const listener = (event) => onShortcut(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  return { results, running, runs, current, notice, runAll };
}

function benchStatus({ results, running, current }, { isComplete, total }) {
  if (running) return { label: 'Verification', value: 'Running the checks…' };
  if (current) {
    const allPassed = current.passed === current.total;
    const value = current.resolved ? `Run ${current.number} · resolved` : `Run ${current.number} · ${current.passed} of ${current.total} passed`;
    return { label: 'Last run', value, tone: allPassed ? 'state-ok' : 'state-fail', jump: true };
  }
  if (results) return { label: 'Last run', value: 'Could not finish', tone: 'state-fail', jump: true };
  return { label: 'Verification', value: isComplete ? 'Not run this visit' : `${plural(total, 'check')} to pass` };
}

function showLog() {
  const target = document.getElementById('run-summary') ?? document.getElementById('checks');
  target?.scrollIntoView({ block: 'start' });
  target?.focus({ preventScroll: true });
}

/** The loop's controls and latest result, kept in reach while the learner reads. */
export function Workbench({ level, checks, isComplete, next }) {
  const status = benchStatus(checks, { isComplete, total: level.checks.length });
  const label = checks.running ? 'Running…' : isComplete ? 'Run checks again' : checks.results ? 'Re-run checks' : 'Run checks';

  return (
    <div className="workbench">
      <p className="workbench-status">
        <span className="workbench-label">{status.label}</span>
        {status.jump ? (
          <button type="button" className={`workbench-value workbench-jump ${status.tone}`} onClick={showLog}>
            {status.value}<span className="sr-only"> — show the log</span>
          </button>
        ) : (
          <span className={`workbench-value ${status.tone ?? ''}`}>{status.value}</span>
        )}
      </p>
      <div className="workbench-actions">
        {/* One button in every state keeps keyboard focus through a run; runAll ignores repeat presses. */}
        <button id="run-checks" className={`btn${isComplete ? '' : ' btn-primary'}`} onClick={checks.runAll} aria-disabled={checks.running} aria-keyshortcuts="Control+Enter Meta+Enter">
          {label}
        </button>
        {isComplete && (
          <a className="btn btn-primary" href={next ? `#/level/${next.id}` : '#/'}>
            {next ? `Next: ${next.title}` : 'Return to the register'} <Arrow />
          </a>
        )}
      </div>
      <span className="sr-only" role="status">{checks.notice}</span>
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
          <p className="check-summary" id="run-summary" tabIndex={-1}>Run {current.number} · {formatTime(current.at)} — {current.passed} of {current.total} checks passed.</p>
        )}
        {results && markRepeatedFailures(results).map((r, i) => (
          <div
            key={i}
            className={`check-row ${r.pending ? 'pending' : r.pass ? 'pass' : 'fail'}`}
          >
            <span className="check-chip">{r.pending ? 'PEND' : r.pass ? 'PASS' : 'FAIL'}</span>
            <div className="check-body">
              <div className="check-name">{r.name}</div>
              {!r.pending && !r.pass && (r.repeatsFailure ? (
                <details className="check-repeat">
                  <summary>Same cause as the failure above</summary>
                  <div className="check-error">{r.message}</div>
                </details>
              ) : <div className="check-error">{r.message}</div>)}
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
            : <>Fix the bug in your editor (the page hot-reloads), then run the checks<span className="shortcut-hint"> with the button or <kbd>{RUN_SHORTCUT}</kbd></span>. All green unlocks the next incident.</>}
        </p>
      )}
      {!running && standing && <p className="log-standing">{standing}</p>}
      {!running && current && !current.resolved && !standing && (
        <p className="section-note last-run-note">Results describe run {current.number}. Re-run after editing your source files<span className="shortcut-hint"> (<kbd>{RUN_SHORTCUT}</kbd>)</span>.</p>
      )}

      {isComplete && !running && (
        <div className="log-reflection">
          <h3>Make the fix stick.</h3>
          <p>Before moving on, explain what React was doing, why your change corrected it, and which signal helped you find it. Use each check as a prompt:</p>
          <ul>{level.checks.map((check) => <li key={check.name}>{check.name}</li>)}</ul>
        </div>
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
