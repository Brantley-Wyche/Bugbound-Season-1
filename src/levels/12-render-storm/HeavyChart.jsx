import { memo, useRef } from 'react';

const BARS = [42, 71, 55, 89, 63];

const HeavyChart = memo(function HeavyChart({ options, onSelect }) {
  const renders = useRef(0);
  renders.current += 1;

  // Simulates an expensive draw pass (layout, scales, animations…).
  let waste = 0;
  for (let i = 0; i < 250000; i++) waste += Math.sqrt(i);

  return (
    <div data-testid="chart">
      <div className="lv-row spread">
        <span className="lv-muted">palette: {options.palette}</span>
        <span className="lv-tag" data-testid="chart-renders">
          chart renders: {renders.current}
        </span>
      </div>
      <div className="lv-bars">
        {BARS.map((height, i) => (
          <button
            key={i}
            style={{ height: `${height}%` }}
            data-testid={`bar-${i}`}
            title={`Q${i + 1}`}
            onClick={() => onSelect(`Q${i + 1}`)}
          />
        ))}
      </div>
    </div>
  );
});

export default HeavyChart;
