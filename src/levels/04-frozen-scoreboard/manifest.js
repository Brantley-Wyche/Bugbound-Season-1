import Component from './ScoreBoard.jsx';

export default {
  id: '04-frozen-scoreboard',
  number: 4,
  title: 'The Frozen Scoreboard',
  concept: 'State & Immutability',
  severity: 'Medium',
  Component,
  files: ['src/levels/04-frozen-scoreboard/ScoreBoard.jsx'],
  symptom:
    'The scoreboard is completely frozen. Clicking "+1 point" does nothing. Clicking "Record win" does nothing. Every number stays at 0 forever, no matter how hard you click.',
  lesson: [
    'State variables look like ordinary variables, but assigning to one is shouting into the void. `score = score + 1` changes a local variable that’s thrown away when the function ends — React only re-renders when you call the setter: `setScore(score + 1)`.',
    'Objects have a subtler failure mode. React decides "did state change?" by comparing references with `Object.is`. If you mutate an object (`stats.wins += 1`) and then set the SAME object back, the reference is identical — React concludes nothing changed and bails out of rendering.',
    'The rule that prevents both bugs: treat state as read-only. To update an object, build a new one: `setStats(s => ({ ...s, wins: s.wins + 1 }))`. New value, new reference, guaranteed re-render.',
  ],
  checks: [
    {
      name: '"+1 point" increments the score on screen',
      run: async (h) => {
        await h.click('[data-testid="add-point"]');
        const score = h.text('[data-testid="score"]');
        h.ok(score === '1', `Expected the score to show 1 after one click, but it shows ${score}.`);
      },
    },
    {
      name: '"Record win" updates the wins counter',
      run: async (h) => {
        await h.click('[data-testid="record-win"]');
        const wins = h.text('[data-testid="wins"]');
        h.ok(wins === '1', `Expected wins to show 1, but it shows ${wins}.`);
      },
    },
    {
      name: 'Two wins in a row build a streak of 2',
      run: async (h) => {
        await h.click('[data-testid="record-win"]');
        await h.click('[data-testid="record-win"]');
        const streak = h.text('[data-testid="streak"]');
        h.ok(streak === '2', `Expected a streak of 2 after two wins, but it shows ${streak}.`);
      },
    },
  ],
};
