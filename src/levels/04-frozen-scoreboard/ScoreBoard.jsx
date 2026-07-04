import { useState } from 'react';

export default function ScoreBoard() {
  let [score, setScore] = useState(0);
  const [stats, setStats] = useState({ wins: 0, streak: 0 });

  function addPoint() {
    score = score + 1;
  }

  function recordWin() {
    stats.wins += 1;
    stats.streak += 1;
    setStats(stats);
  }

  return (
    <div className="lv-card">
      <h4 className="lv-heading">🏆 Scoreboard</h4>
      <div className="lv-row spread">
        <div>
          <p className="lv-muted">Score</p>
          <span className="lv-stat" data-testid="score">{score}</span>
        </div>
        <div>
          <p className="lv-muted">Wins</p>
          <span className="lv-stat" data-testid="wins">{stats.wins}</span>
        </div>
        <div>
          <p className="lv-muted">Streak</p>
          <span className="lv-stat" data-testid="streak">{stats.streak}</span>
        </div>
      </div>
      <div className="lv-row">
        <button className="lv-btn primary" data-testid="add-point" onClick={addPoint}>
          +1 point
        </button>
        <button className="lv-btn" data-testid="record-win" onClick={recordWin}>
          Record win
        </button>
      </div>
    </div>
  );
}
