import { useState } from 'react';

export default function RsvpForm() {
  const [name, setName] = useState('');
  const [diet, setDiet] = useState('none');

  return (
    <div className="lv-card">
      <h4 className="lv-heading">💌 RSVP</h4>

      <label className="lv-field">
        Full name
        <input
          className="lv-input"
          data-testid="name-input"
          placeholder="Your name"
          value={name}
        />
      </label>

      <label className="lv-field">
        Dietary preference
        <select
          className="lv-select"
          data-testid="diet-select"
          value={diet}
          onChange={(e) => setName(e.target.value)}
        >
          <option value="none">No preference</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
        </select>
      </label>

      <p className="lv-muted">
        Attending: <strong data-testid="summary-name">{name || '—'}</strong> · Diet:{' '}
        <strong data-testid="summary-diet">{diet}</strong>
      </p>
    </div>
  );
}
