import { useState } from 'react';
import { levels } from '../levels/index.js';
import Prose from './Prose.jsx';
import ExercisePreview from './ExercisePreview.jsx';
import ChecksRunner from './ChecksRunner.jsx';
import HintBox from './HintBox.jsx';

function jumpToSection(id) {
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) target.open = true;
  target?.scrollIntoView({ behavior: 'auto', block: 'start' });
  target?.focus({ preventScroll: true });
}

export default function LevelPage({ level, isComplete, isSaved = isComplete, onComplete }) {
  const [demoKey, setDemoKey] = useState(0);
  const next = levels.find((item) => item.number === level.number + 1);

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="level-header">
        <a className="back-link" href="#/">← Incident register</a>
        <div className="level-heading">
          <span className="folio-number" aria-label={`Level ${level.number}`}>{String(level.number).padStart(2, '0')}</span>
          <div>
            <h1 id="page-title" tabIndex={-1}>{level.title}</h1>
            <p className="level-metadata"><span>{level.concept}</span><span>Severity: {level.severity}</span><span className={isComplete ? 'state-ok' : 'state-open'}>{isComplete ? (isSaved ? 'Completion saved' : 'Completed this visit') : 'Open'}</span></p>
          </div>
        </div>
        <nav className="section-nav" aria-label="In this incident">
          <button type="button" onClick={() => jumpToSection('concept')}>Read the concept</button>
          <button type="button" onClick={() => jumpToSection('live-preview')}>Try the preview</button>
          <button type="button" onClick={() => jumpToSection('checks')}>Run the checks</button>
          <button type="button" onClick={() => jumpToSection('hints')}>Get a hint</button>
        </nav>
      </header>

      <div aria-live="polite" aria-atomic="true">
        {isComplete && (
          <section className="resolution" aria-labelledby="resolution-title">
            <div>
              <h2 id="resolution-title">Resolution recorded.</h2>
              <p>{isSaved ? 'Your earned progress is saved.' : 'Your fix passed in this visit, but progress has not been saved.'} Run the checks to verify your current source.</p>
            </div>
            <a className="btn btn-primary" href={next ? `#/level/${next.id}` : '#/'}>{next ? `Next: ${next.title}` : 'Return to the register'} <span aria-hidden="true">↗</span></a>
          </section>
        )}
      </div>

      <div className="notebook-layout">
        <section className="incident-brief" aria-labelledby="report-title">
          <div className="section-heading"><h2 id="report-title">Bug report</h2><span className="document-ref">BUG-{String(level.number).padStart(3, '0')}</span></div>
          <p className="symptom">{level.symptom}</p>
          <div className="file-list">
            <span className="hint-label">{level.vague ? 'Investigate this folder' : 'Where to look'}</span>
            {level.files.map((file) => <code key={file}>{file}</code>)}
          </div>
        </section>

        <details className="concept-entry" id="concept" tabIndex={-1}>
          <summary><span>Read the concept</span><span className="concept-topic">{level.concept}</span></summary>
          <div className="concept-content"><Prose paragraphs={level.lesson} /></div>
        </details>

        <div className="working-area">
          <section className="preview-entry" aria-labelledby="live-preview">
            <div className="section-heading">
              <h2 id="live-preview" tabIndex={-1}>Live preview</h2>
              <button className="quiet-button" aria-describedby="preview-restart-note" onClick={() => setDemoKey((key) => key + 1)}>Restart preview</button>
            </div>
            <p className="section-note">Reproduce the report here. Edit the source in your editor; changes hot-reload.</p>
            <div className="demo-stage"><ExercisePreview key={demoKey} level={level} /></div>
            <p className="section-note restart-note" id="preview-restart-note">Restarting reloads the exercise, clearing its component state and timers. Your source files and progress stay intact.</p>
          </section>
          <ChecksRunner level={level} onAllPass={onComplete} isComplete={isComplete} continuation={isComplete && (
            <a className="text-link" href={next ? `#/level/${next.id}` : '#/'}>{next ? `Next incident: ${next.title}` : 'Return to the register'} <span aria-hidden="true">↗</span></a>
          )} />
        </div>

        <HintBox levelId={level.id} />
      </div>

      {isComplete && (
        <section className="resolution-review" aria-labelledby="review-title">
          <h2 id="review-title">Make the fix stick.</h2>
          <p>Before moving on, explain what React was doing, why your change corrected it, and which signal helped you find it.</p>
          <ul>{level.checks.map((check) => <li key={check.name}>{check.name}</li>)}</ul>
        </section>
      )}
    </main>
  );
}
