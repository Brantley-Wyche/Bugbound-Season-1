import { HINT_TIERS } from './learning.js';
import { capitalize, formatMoment } from './format.js';

function runsNote({ checkRuns, passedRuns, resolvedRun }, resolved) {
  if (!checkRuns) return 'None yet';
  if (resolved && resolvedRun) return `${checkRuns} · resolved on run ${resolvedRun}`;
  return passedRuns ? `${checkRuns} · ${passedRuns} fully passing` : `${checkRuns} · none fully passing yet`;
}

/** The learner's own record of this incident, from local telemetry. */
export default function FieldNotes({ activity, isComplete }) {
  const { checkRuns, hintsRevealed, lastPracticedAt, resolvedAt } = activity;
  const resolved = isComplete && Boolean(resolvedAt);

  return (
    <section className="field-notes" aria-labelledby="field-notes-title">
      <h2 id="field-notes-title">Your field notes</h2>
      {!checkRuns && !hintsRevealed.length ? (
        <p className="section-note">Nothing noted yet. Your check runs and hints are recorded here, in this browser only.</p>
      ) : (<>
        <dl className="notes-list">
          <div><dt>Check runs</dt><dd>{runsNote(activity, resolved)}</dd></div>
          <div>
            <dt>Hints opened</dt>
            <dd>{hintsRevealed.length ? `${hintsRevealed.length} of 3 · ${hintsRevealed.map((tier) => HINT_TIERS[tier - 1]).join(', ')}` : 'None'}</dd>
          </div>
          {lastPracticedAt && <div><dt>Last worked</dt><dd>{capitalize(formatMoment(lastPracticedAt))}</dd></div>}
        </dl>
        <p className="section-note field-notes-note">Kept only in this browser, alongside your progress.</p>
      </>)}
    </section>
  );
}
