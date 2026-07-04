import { useState } from 'react';
import HeavyChart from './HeavyChart.jsx';

const METRICS = [
  { label: 'Revenue', value: '$48.2k' },
  { label: 'Signups', value: '1,204' },
  { label: 'Churn', value: '2.1%' },
  { label: 'Sessions', value: '18.9k' },
];

export default function AnalyticsBoard() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const chartOptions = { palette: 'aurora', smooth: true };
  const handleSelect = (label) => setSelected(label);

  const visibleMetrics = METRICS.filter((m) =>
    m.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="lv-card">
      <h4 className="lv-heading">📈 Analytics</h4>
      <input
        className="lv-input"
        data-testid="search-input"
        placeholder="Filter metrics…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="lv-list" data-testid="metric-list">
        {visibleMetrics.map((m) => (
          <li key={m.label}>
            {m.label}: <strong>{m.value}</strong>
          </li>
        ))}
      </ul>
      <HeavyChart options={chartOptions} onSelect={handleSelect} />
      {selected && (
        <p className="lv-muted" data-testid="selected">
          Selected: {selected}
        </p>
      )}
    </div>
  );
}
