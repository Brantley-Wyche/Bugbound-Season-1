import { useState } from 'react';
import { levels } from '../levels/index.js';
import { navigate } from './App.jsx';
import Prose from './Prose.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import ChecksRunner from './ChecksRunner.jsx';
import HintBox from './HintBox.jsx';

export default function LevelPage({ level, isComplete, onComplete }) {
  const [demoKey, setDemoKey] = useState(0);
  const next = levels.find((l) => l.number === level.number + 1);
  const Demo = level.Component;

  return (
    <main>
      <div className="level-header">
        <button className="back-link" onClick={() => navigate('/')}>
          ← Back to the map
        </button>
        <div className="level-title-row">
          <span className="level-num">LVL {String(level.number).padStart(2, '0')}</span>
          <h1>{level.title}</h1>
          <span className="chip">{level.concept}</span>
          <span className={`chip severity-${level.severity}`}>Severity: {level.severity}</span>
        </div>
      </div>

      {isComplete && (
        <div className="success-banner" style={{ marginBottom: 20 }}>
          <div className="msg">
            <strong>✓ Incident resolved</strong>
            <span>
              {next
                ? 'The blocker is cleared — the next level is unlocked.'
                : 'That was the last one. Season 1 complete!'}
            </span>
          </div>
          {next ? (
            <button className="btn btn-primary" onClick={() => navigate(`/level/${next.id}`)}>
              Next: {next.title} →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Back to the map 🏆
            </button>
          )}
        </div>
      )}

      <div className="level-layout">
        <div className="column">
          <div className="panel panel-concept">
            <h3>Concept</h3>
            <Prose paragraphs={level.lesson} />
          </div>

          <div className="panel bug-report">
            <h3>Bug report</h3>
            <div className="ticket-meta">
              <span className="ticket-id">BUG-{String(level.number).padStart(3, '0')}</span>
              <span>·</span>
              <span>SEV: {level.severity.toUpperCase()}</span>
              <span>·</span>
              <span className={isComplete ? 'ticket-resolved' : 'ticket-open'}>
                <span className={`status-dot ${isComplete ? 'ok' : 'err live'}`} />{' '}
                {isComplete ? 'RESOLVED' : 'OPEN'}
              </span>
            </div>
            <p className="symptom">{level.symptom}</p>
            <div className="file-list">
              <span className="hint-label">
                {level.vague ? 'The bug is somewhere in here:' : 'Where to look:'}
              </span>
              {level.files.map((f) => (
                <code key={f}>{f}</code>
              ))}
            </div>
          </div>

          <HintBox levelId={level.id} />
        </div>

        <div className="column">
          <div className="panel panel-demo demo-panel">
            <h3>Live preview</h3>
            <p className="demo-note">
              This is the real buggy component — interact with it and reproduce the report.
              Your edits hot-reload here.
            </p>
            <div className="demo-stage">
              <ErrorBoundary key={demoKey}>
                <Demo />
              </ErrorBoundary>
            </div>
            <div className="demo-toolbar">
              <button className="btn" onClick={() => setDemoKey((k) => k + 1)}>
                ↻ Remount
              </button>
            </div>
          </div>

          <ChecksRunner level={level} onAllPass={onComplete} />
        </div>
      </div>
    </main>
  );
}
