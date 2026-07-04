import { useState } from 'react';

const INITIAL_GUESTS = [
  { id: 'g1', name: 'Alice Zhang' },
  { id: 'g2', name: 'Bianca Rossi' },
  { id: 'g3', name: 'Carlos Mendez' },
];

export default function SeatingChart() {
  const [guests, setGuests] = useState(INITIAL_GUESTS);

  const removeGuest = (id) => setGuests(guests.filter((g) => g.id !== id));

  return (
    <div className="lv-card">
      <h4 className="lv-heading">🪑 Seating Chart</h4>
      <p className="lv-muted">Jot a seat note for each guest, remove no-shows.</p>
      <ul className="lv-list" data-testid="guest-list">
        {guests.map((guest, i) => (
          <li key={i}>
            <div className="lv-row spread" data-testid="guest-row">
              <span data-testid="guest-name">{guest.name}</span>
              <input
                className="lv-input"
                placeholder="Seat note…"
                data-testid="guest-note"
              />
              <button
                className="lv-btn"
                data-testid="remove-btn"
                onClick={() => removeGuest(guest.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
