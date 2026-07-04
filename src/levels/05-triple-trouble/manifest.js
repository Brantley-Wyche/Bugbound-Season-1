import Component from './ClickTrainer.jsx';

export default {
  id: '05-triple-trouble',
  number: 5,
  title: 'Triple Trouble',
  concept: 'State Updates',
  severity: 'Medium',
  Component,
  files: ['src/levels/05-triple-trouble/ClickTrainer.jsx'],
  symptom:
    'The "+3" button only ever adds 1. And the delayed "+1" button loses clicks: press it twice quickly and the counter goes up by just 1.',
  lesson: [
    'Inside a single render, `count` is a snapshot — a constant. Calling `setCount(count + 1)` three times in one handler queues "set it to snapshot+1" three times. Same snapshot, same result: one increment, not three.',
    'The fix is the updater form: `setCount(c => c + 1)`. Instead of a value computed from a stale snapshot, you hand React a function that receives the latest pending state. Three queued updaters compose: 0→1→2→3.',
    'The same snapshot problem hides in anything asynchronous. A `setTimeout` callback closes over the `count` from the render in which the click happened. Two quick clicks capture the same value, and the second overwrites the first. Whenever the next state depends on the previous state, reach for the updater form by default.',
  ],
  checks: [
    {
      name: 'The "+1" button adds one',
      run: async (h) => {
        await h.click('[data-testid="add-one"]');
        const count = h.text('[data-testid="count"]');
        h.ok(count === '1', `Expected 1, but the counter shows ${count}.`);
      },
    },
    {
      name: 'The "+3" button adds exactly three',
      run: async (h) => {
        await h.click('[data-testid="add-three"]');
        const count = h.text('[data-testid="count"]');
        h.ok(count === '3', `Expected 3 after one press of "+3", but the counter shows ${count}.`);
      },
    },
    {
      name: 'Two quick presses of the delayed button add two',
      run: async (h) => {
        await h.click('[data-testid="add-delayed"]');
        await h.click('[data-testid="add-delayed"]');
        await h.pause(450);
        const count = h.text('[data-testid="count"]');
        h.ok(count === '2', `Expected 2 after two delayed clicks, but the counter shows ${count}.`);
      },
    },
  ],
};
