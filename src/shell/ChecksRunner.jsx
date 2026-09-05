import { useEffect, useRef, useState } from 'react';
import { runIsolatedCheck } from './exercise-frame.js';
import { recordCheckRun } from './learning.js';

export default function ChecksRunner({ level, onAllPass, isComplete, continuation }) {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const activeRun = useRef(null);
  useEffect(() => () => activeRun.current?.abort(), []);
  const passedCount = results?.filter((result) => result.pass).length ?? 0;

  async function runAll() {
    if (activeRun.current) return;
    const controller = new AbortController();
    activeRun.current = controller;
    setRunning(true);
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
        recordCheckRun(level.id, finished);
        if (finished.length && finished.every((r) => r.pass)) onAllPass();
      }
    } catch (error) {
      if (!controller.signal.aborted) setResults([{ name: 'Check runner', pass: false, message: `The check run could not finish: ${error?.message || error}. Please re-run.` }]);
    } finally {
      if (activeRun.current === controller) activeRun.current = null;
      if (!controller.signal.aborted) setRunning(false);
    }
  }

  return (
    <section className="checks-entry" aria-busy={running} aria-labelledby="checks">
      <div className="section-heading"><h2 id="checks" tabIndex={-1}>Verification log</h2><span className="document-ref">{level.checks.length} checks</span></div>
      <button className="btn btn-primary" onClick={runAll} disabled={running}>
        {running ? 'Running…' : results ? 'Re-run checks' : 'Run checks'}
      </button>

      <div className="checks-list" aria-live="polite" aria-atomic="false">
          {results && !running && (
            <p className="check-summary">Last run: {passedCount} of {results.length} checks passed.</p>
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
      {results && !running && <p className="section-note last-run-note">Results describe the last run. Re-run after editing your source files.</p>}
      {continuation && !running && <div className="verification-followup">{continuation}</div>}
      {!results && (
        <p className="checks-idle">
          {isComplete
            ? 'No checks run in this visit. Run the checks to verify your current source.'
            : 'Fix the bug in your editor (the page hot-reloads), then run the checks. All green unlocks the next level.'}
        </p>
      )}
    </section>
  );
}
