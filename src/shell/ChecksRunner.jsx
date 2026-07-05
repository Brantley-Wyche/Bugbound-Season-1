import { useState } from 'react';
import { runCheck } from './harness.jsx';

export default function ChecksRunner({ level, onAllPass }) {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  async function runAll() {
    setRunning(true);
    setResults(level.checks.map((c) => ({ name: c.name, pending: true })));

    const finished = [];
    for (const check of level.checks) {
      const result = await runCheck(level.Component, check);
      finished.push(result);
      setResults([
        ...finished,
        ...level.checks.slice(finished.length).map((c) => ({ name: c.name, pending: true })),
      ]);
    }

    setRunning(false);
    if (finished.every((r) => r.pass)) onAllPass();
  }

  return (
    <div className="panel panel-checks">
      <h3>Checks</h3>
      <button className="btn btn-primary" onClick={runAll} disabled={running}>
        {running ? 'Running…' : results ? 'Re-run checks' : 'Run checks'}
      </button>

      {results ? (
        <div className="checks-list">
          {results.map((r, i) => (
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
      ) : (
        <p className="checks-idle">
          Fix the bug in your editor (the page hot-reloads), then run the checks. All green
          unlocks the next level.
        </p>
      )}
    </div>
  );
}
