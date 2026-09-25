import { useRef, useState } from 'react';
import hints from '../levels/hints.json';
import { HINT_TIERS, recordHintReveal } from './learning.js';

function decode(b64) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

export default function HintBox({ levelId, openedBefore = [] }) {
  const [revealed, setRevealed] = useState([false, false, false]);
  // Only tiers opened in earlier visits are marked; this visit's reveals show themselves.
  const [openedEarlier] = useState(openedBefore);
  const [confirmingAnswer, setConfirmingAnswer] = useState(false);
  const [answerConfirmed, setAnswerConfirmed] = useState(false);
  const answerToggle = useRef(null);
  const encoded = hints[levelId] || [];
  const answerTier = encoded.length - 1;

  const setTier = (index, open) => setRevealed((prev) => prev.map((value, itemIndex) => (itemIndex === index ? open : value)));

  const reveal = (index) => {
    recordHintReveal(levelId, index + 1);
    if (index === answerTier) setAnswerConfirmed(true);
    setConfirmingAnswer(false);
    setTier(index, true);
  };

  // The last tier gives the fix away, so the first time it opens for an incident it asks,
  // whatever order the hints were read in. Once seen, it opens directly.
  const needsConfirmation = (index) => index === answerTier && index > 0 && !answerConfirmed && !openedEarlier.includes(index + 1);

  const toggleHint = (index) => {
    if (revealed[index]) setTier(index, false);
    else if (needsConfirmation(index)) setConfirmingAnswer((value) => !value);
    else reveal(index);
  };

  return (
    <section className="hint-entry" aria-labelledby="hints">
      <h2 id="hints" tabIndex={-1}>A little help, when you need it.</h2>
      <p className="hints-note">
        Start with a nudge. Each hint reveals a little more; open only as much as you need.
      </p>
      <div className="hint-list">
        {encoded.map((b64, i) => {
          const confirming = confirmingAnswer && i === answerTier && !revealed[i];
          return (
            <div className="hint-item" key={i}>
              <button
                ref={i === answerTier ? answerToggle : undefined}
                className="hint-toggle"
                onClick={() => toggleHint(i)}
                aria-expanded={revealed[i] || confirming}
                aria-controls={`${levelId}-hint-${i + 1}`}
              >
                <span>Hint {i + 1}</span>
                {openedEarlier.includes(i + 1) && <span className="hint-opened">opened before</span>}
                <span className="tier">{HINT_TIERS[i]}{revealed[i] ? ' · Hide' : ''}</span>
              </button>
              <div className="hint-body" id={`${levelId}-hint-${i + 1}`} hidden={!revealed[i] && !confirming}>
                {revealed[i] ? decode(b64) : confirming ? (
                  <div className="hint-confirm">
                    <p>This hint shows the fix. The earlier hints may be enough to find it yourself.</p>
                    <button type="button" className="quiet-button" onClick={() => { reveal(i); answerToggle.current?.focus(); }}>Show the answer</button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
