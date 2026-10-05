import { useState, useSyncExternalStore } from 'react';
import { levels } from '../levels/index.js';
import { activityFor, getLearningSnapshot, subscribeLearning } from './learning.js';
import { formatDay } from './format.js';
import Prose from './Prose.jsx';
import ExercisePreview from './ExercisePreview.jsx';
import { useCheckRuns, Workbench, VerificationLog } from './ChecksRunner.jsx';
import FieldNotes from './FieldNotes.jsx';
import FileReference from './FileReference.jsx';
import Arrow from './Arrow.jsx';
import HintBox from './HintBox.jsx';

const restartClock = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });

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
  const [restartedAt, setRestartedAt] = useState(null);
  const next = levels.find((item) => item.number === level.number + 1);
  const telemetry = useSyncExternalStore(subscribeLearning, getLearningSnapshot).levels;
  const activity = activityFor(telemetry, level.id);
  const checks = useCheckRuns(level, { isComplete, onAllPass: onComplete });
  // Nothing recorded anywhere yet: orient a brand-new learner. Fixed for the visit so the
  // page never shifts under the learner's first action.
  const [firstVisit] = useState(() => Object.keys(getLearningSnapshot().levels).length === 0 && !isComplete);
  // "Start here" points at the concept only until the learner has opened it.
  const [conceptOpened, setConceptOpened] = useState(false);
  const suggestConcept = firstVisit && !conceptOpened;
  // Each surface has one job: the preview note covers the preview, the log covers verifying.
  const previewNote = isComplete
    ? 'This preview shows the source as it is now. It hot-reloads as you edit.'
    : 'Reproduce the report here. It hot-reloads as you edit the source.';
  const folio = String(level.number).padStart(2, '0');

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="level-header">
        <a className="back-link" href="#/"><Arrow direction="left" />Incident register</a>
        <div className="level-heading">
          <span className="folio-number"><span className="sr-only">Incident </span>{folio}</span>
          <div>
            <h1 id="page-title" tabIndex={-1}>{level.title}</h1>
            <p className="level-metadata"><span>{level.concept}</span><span>Severity: {level.severity}</span><span className={isComplete ? 'state-ok' : 'state-open'}>{isComplete ? (isSaved ? `Resolved${activity.resolvedAt ? ` ${formatDay(activity.resolvedAt)}` : ''}` : 'Resolved · not saved yet') : 'Open'}</span></p>
            {firstVisit && <p className="first-visit"><strong>New here?</strong> Each incident is one broken component. Read the concept, reproduce the report in the preview, repair the file in your editor, then verify with the checks.</p>}
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
            <span className="document-ref">BUG-{String(level.number).padStart(3, '0')}</span>
          </div>
          <p className="symptom">{level.symptom}</p>
          <div className="file-list">
            <span className="hint-label">{level.vague ? 'Investigate this folder' : 'Where to look'}</span>
            {level.files.map((file) => <FileReference key={file} path={file} />)}
          </div>
        </section>

        <section className="concept-section" aria-labelledby="concept-heading">
          <h2 id="concept-heading" className="sr-only">Concept</h2>
          <details className={`concept-entry${suggestConcept ? ' is-suggested' : ''}`} id="concept" onToggle={(event) => { if (event.currentTarget.open) setConceptOpened(true); }}>
            <summary><span>{suggestConcept ? 'Start here: read the concept' : 'Read the concept'}</span><span className="concept-topic">{level.concept}</span></summary>
            <div className="concept-content"><Prose paragraphs={level.lesson} /></div>
          </details>
        </section>

        <div className="working-area">
          <Workbench level={level} checks={checks} isComplete={isComplete} next={next} />
          <section className="preview-entry" aria-labelledby="live-preview">
            <div className="section-heading">
              <h2 id="live-preview" className="jump-target" tabIndex={-1}>Live preview</h2>
              <span className="preview-restart">
                {/* Always mounted so the first restart is announced; seconds tell repeat restarts apart. */}
                <span className="restart-status" role="status">{restartedAt ? `Restarted ${restartClock.format(restartedAt)}` : ''}</span>
                <button className="quiet-button" aria-describedby="preview-restart-note" onClick={() => { setDemoKey((key) => key + 1); setRestartedAt(Date.now()); }}>Restart preview</button>
              </span>
            </div>
            <p className="section-note">{previewNote}</p>
            <div className="demo-stage"><ExercisePreview key={demoKey} level={level} /></div>
            <p className="section-note restart-note" id="preview-restart-note">Restarting reloads the preview, clearing its component state and timers. Your source files and progress stay intact.</p>
          </section>
          <VerificationLog level={level} checks={checks} isComplete={isComplete} isSaved={isSaved} activity={activity} />
        </div>

        <FieldNotes activity={activity} isComplete={isComplete} />
        <HintBox levelId={level.id} openedBefore={activity.hintsRevealed} />
      </div>
    </main>
  );
}
