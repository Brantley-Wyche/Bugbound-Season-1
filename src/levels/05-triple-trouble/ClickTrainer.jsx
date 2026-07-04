import { useState } from 'react';

export default function ClickTrainer() {
  const [count, setCount] = useState(0);

  function addOne() {
    setCount(count + 1);
  }

  function addThree() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  function addOneDelayed() {
    setTimeout(() => {
      setCount(count + 1);
    }, 300);
  }

  return (
    <div className="lv-card">
      <h4 className="lv-heading">🎯 Click Trainer</h4>
      <span className="lv-stat" data-testid="count">{count}</span>
      <div className="lv-row">
        <button className="lv-btn" data-testid="add-one" onClick={addOne}>
          +1
        </button>
        <button className="lv-btn primary" data-testid="add-three" onClick={addThree}>
          +3
        </button>
        <button className="lv-btn" data-testid="add-delayed" onClick={addOneDelayed}>
          +1 (after 300ms)
        </button>
      </div>
      <p className="lv-muted">Pro tip: try mashing the delayed button twice, fast.</p>
    </div>
  );
}
