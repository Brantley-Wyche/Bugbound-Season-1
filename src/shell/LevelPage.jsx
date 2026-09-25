import { useState, useSyncExternalStore } from 'react';
import { levels } from '../levels/index.js';
import { activityFor, getLearningSnapshot, subscribeLearning } from './learning.js';
import { formatDay } from './format.js';
import Prose from './Prose.jsx';
import ExercisePreview from './ExercisePreview.jsx';
import { useCheckRuns, Workbench, VerificationLog } from './ChecksRunner.jsx';
import FieldNotes from './FieldNotes.jsx';
import HintBox from './HintBox.jsx';

function jumpToSection(id) {
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) target.open = true;
  target?.scrollIntoView({ behavior: 'auto', block: 'start' });
  // A disclosure takes focus on its summary so it stays in the tab order.
  const focusTarget = target instanceof HTMLDetailsElement ? target.querySelector('summary') : target;
  focusTarget?.focus({ preventScroll: true });
}

export default function LevelPage({ level, isComplete, isSaved = isComplete, onComplete }) {
  const [demoKey, setDemoKey] = useState(0);
  const next = levels.find((item) => item.number === level.number + 1);
  const activity = activityFor(useSyncExternalStore(subscribeLearning, getLearningSnapshot).levels, level.id);
  const checks = useCheckRuns(level, { isComplete, onAllPass: onComplete });
  const folio = String(level.number).padStart(2, '0');

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="level-header">
        <a className="back-link" href="#/">← Incident register</a>
        <div className="level-heading">
          <span className="folio-number"><span className="sr-only">Incident </span>{folio}</span>
          <div>
            <h1 id="page-title" tabIndex={-1}>{level.title}</h1>
            <p className="level-metadata"><span>{level.concept}</span><span>Severity: {level.severity}</span><span className={isComplete ? 'state-ok' : 'state-open'}>{isComplete ? (isSaved ? 'Completion saved' : 'Completed this visit') : 'Open'}</span></p>
          </div>
        </div>
        <nav className="section-nav" aria-label="In this incident">
          <button type="button" onClick={() => jumpToSection('concept')}>Read the concept</button>
          <button type="button" onClick={() => jumpToSection('live-preview')}>Try the preview</button>
          <button type="button" onClick={() => jumpToSection('run-checks')}>Run the checks</button>
          <button type="button" onClick={() => jumpToSection('hints')}>Get a hint</button>
        </nav>
      </header>

      <div className="notebook-layout">
        <section className="incident-brief" aria-labelledby="report-title">
          <div className="section-heading">
            <h2 id="report-title">Bug report</h2>
            <span className="document-ref">BUG-{String(level.number).padStart(3, '0')}{isComplete && <span className="state-ok"> · Closed{activity.resolvedAt ? ` ${formatDay(activity.resolvedAt)}` : ''}</span>}</span>
          </div>
          <p className="symptom">{level.symptom}</p>
          <div className="file-list">
            <span className="hint-label">{level.vague ? 'Investigate this folder' : 'Where to look'}</span>
            {level.files.map((file) => <code key={file}>{file}</code>)}
          </div>
        </section>

        <details className="concept-entry" id="concept">
          <summary><span>Read the concept</span><span className="concept-topic">{level.concept}</span></summary>
          <div className="concept-content"><Prose paragraphs={level.lesson} /></div>
        </details>

        <div className="working-area">
          <Workbench level={level} checks={checks} isComplete={isComplete} activity={activity} next={next} />
          <section className="preview-entry" aria-labelledby="live-preview">
            <div className="section-heading">
              <h2 id="live-preview" tabIndex={-1}>Live preview</h2>
              <button className="quiet-button" aria-describedby="preview-restart-note" onClick={() => setDemoKey((key) => key + 1)}>Restart preview</button>
            </div>
            <p className="section-note">Reproduce the report here. Edit the source in your editor; changes hot-reload.</p>
            <div className="demo-stage"><ExercisePreview key={demoKey} level={level} /></div>
            <p className="section-note restart-note" id="preview-restart-note">Restarting reloads the preview, clearing its component state and timers. Your source files and progress stay intact.</p>
          </section>
          <VerificationLog level={level} checks={checks} isComplete={isComplete} isSaved={isSaved} activity={activity} />
        </div>

        <FieldNotes activity={activity} isComplete={isComplete} />
        <HintBox levelId={level.id} openedBefore={activity.hintsRevealed} />
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
