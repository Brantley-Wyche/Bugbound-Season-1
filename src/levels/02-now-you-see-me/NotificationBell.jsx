import { useState } from 'react';

const INITIAL_NOTES = [
  { id: 'n1', text: 'Build #482 passed ✅' },
  { id: 'n2', text: 'Maya commented on your PR' },
  { id: 'n3', text: 'Deploy to staging finished' },
];

export default function NotificationBell() {
  const [notes, setNotes] = useState(INITIAL_NOTES);

  return (
    <div className="lv-card" data-testid="bell">
      <div className="lv-row spread">
        <h4 className="lv-heading">🔔 Inbox</h4>
        <span className="lv-tag" data-testid="bell-count">{notes.length}</span>
        <button className="lv-btn" data-testid="clear-btn" onClick={() => setNotes([])}>
          Clear all
        </button>
      </div>

      {notes.length ? (
        <p className="lv-muted" data-testid="empty-msg">You're all caught up ✨</p>
      ) : null}

      {notes.length && (
        <ul className="lv-list" data-testid="note-list">
          {notes.map((n) => (
            <li key={n.id}>{n.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
