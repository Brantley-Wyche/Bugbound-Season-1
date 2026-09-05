import { useState } from 'react';
import hints from '../levels/hints.json';
import { recordHintReveal } from './learning.js';

const TIER_LABELS = ['Gentle nudge', 'Closer look', 'Basically the answer'];

function decode(b64) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

export default function HintBox({ levelId }) {
  const [revealed, setRevealed] = useState([false, false, false]);
  const encoded = hints[levelId] || [];

  const toggleHint = (index) => {
    if (!revealed[index]) recordHintReveal(levelId, index + 1);
    setRevealed((prev) => prev.map((value, itemIndex) => (itemIndex === index ? !value : value)));
  };

  return (
    <section className="hint-entry" aria-labelledby="hints">
      <h2 id="hints" tabIndex={-1}>A little help, when you need it.</h2>
      <p className="hints-note">
        Start with a nudge. Each hint reveals a little more; open only as much as you need.
      </p>
      <div className="hint-list">
        {encoded.map((b64, i) => (
          <div className="hint-item" key={i}>
            <button
              className="hint-toggle"
              onClick={() => toggleHint(i)}
              aria-expanded={revealed[i]}
              aria-controls={`${levelId}-hint-${i + 1}`}
            >
              <span>Hint {i + 1}</span>
              <span className="tier">{revealed[i] ? 'hide' : TIER_LABELS[i]}</span>
            </button>
            <div className="hint-body" id={`${levelId}-hint-${i + 1}`} hidden={!revealed[i]}>
              {revealed[i] ? decode(b64) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
