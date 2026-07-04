import { useEffect, useState } from 'react';

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    if (running) {
      setInterval(() => setTicks((t) => t + 1), 100);
    }
  }, [running]);

  return (
    <div className="lv-card">
      <h4 className="lv-heading">⏱️ Stopwatch</h4>
      <span className="lv-stat" data-testid="elapsed" data-ticks={ticks}>
        {(ticks / 10).toFixed(1)}s
      </span>
      <div className="lv-row">
        <button
          className="lv-btn primary"
          data-testid="toggle-btn"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? 'Stop' : 'Start'}
        </button>
        <button className="lv-btn" data-testid="reset-btn" onClick={() => setTicks(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}
