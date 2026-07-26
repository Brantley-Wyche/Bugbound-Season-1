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
    setRevealed((prev) => {
      if (!prev[index]) recordHintReveal(levelId, index + 1);
      return prev.map((value, itemIndex) => (itemIndex === index ? !value : value));
    });
  };

  return (
    <div className="panel panel-hints">
      <h3>Hints</h3>
      <p className="hints-note">
        Hints are stored encoded so you can't spoil yourself by accident. Reveal them one at a
        time — a real debugging attempt first is worth more than all three combined.
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
            {revealed[i] && (
              <div className="hint-body" id={`${levelId}-hint-${i + 1}`}>
                {decode(b64)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
