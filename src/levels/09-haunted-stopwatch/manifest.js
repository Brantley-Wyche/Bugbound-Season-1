import Component from './Stopwatch.jsx';

export default {
  id: '09-haunted-stopwatch',
  number: 9,
  title: 'The Haunted Stopwatch',
  concept: 'Effect Cleanup',
  severity: 'High',
  Component,
  files: ['src/levels/09-haunted-stopwatch/Stopwatch.jsx'],
  symptom:
    'Pressing Stop doesn’t stop the stopwatch — it keeps counting like nothing happened. Even spookier: every start/stop cycle makes it count FASTER, as if ghost timers are piling up. (Try it in the live preview.)',
  lesson: [
    'Effects that start something ongoing — an interval, a subscription, a WebSocket — must also stop it. That’s what the cleanup function is for: `return () => { … }` from the effect, and React calls it before the effect re-runs and again when the component unmounts.',
    'Skip the cleanup and every re-run of the effect stacks a new interval on top of the old ones. Nothing ever gets cleared; they all keep firing. One toggle cycle: two intervals. Two cycles: three. The stopwatch isn’t haunted — it’s leaking.',
    'The pattern to internalize: `const id = setInterval(…); return () => clearInterval(id);`. Setup and teardown live together in the same effect, so they can never drift apart.',
  ],
  checks: [
    {
      name: 'The stopwatch counts while running',
      run: async (h) => {
        await h.click('[data-testid="toggle-btn"]');
        await h.pause(350);
        const ticks = Number(h.attr('[data-testid="elapsed"]', 'data-ticks'));
        h.ok(ticks >= 2, `Expected the stopwatch to have counted a few ticks, but it's at ${ticks}.`);
      },
    },
    {
      name: 'Pressing Stop actually stops it',
      run: async (h) => {
        await h.click('[data-testid="toggle-btn"]');
        await h.pause(250);
        await h.click('[data-testid="toggle-btn"]');
        await h.pause(60);
        const frozen = Number(h.attr('[data-testid="elapsed"]', 'data-ticks'));
        await h.pause(300);
        const later = Number(h.attr('[data-testid="elapsed"]', 'data-ticks'));
        h.ok(
          later === frozen,
          `The stopwatch kept counting after Stop (went from ${frozen} to ${later} ticks).`,
        );
      },
    },
    {
      name: 'Start/stop cycles don’t stack extra timers',
      run: async (h) => {
        await h.click('[data-testid="toggle-btn"]');
        await h.pause(320);
        await h.click('[data-testid="toggle-btn"]');
        await h.pause(60);
        const afterFirstRun = Number(h.attr('[data-testid="elapsed"]', 'data-ticks'));

        await h.click('[data-testid="toggle-btn"]');
        await h.pause(320);
        await h.click('[data-testid="toggle-btn"]');
        await h.pause(60);
        const afterSecondRun = Number(h.attr('[data-testid="elapsed"]', 'data-ticks'));

        const delta = afterSecondRun - afterFirstRun;
        h.ok(
          delta <= 4,
          `The second 320ms run added ${delta} ticks — roughly double speed. Timers are stacking.`,
        );
      },
    },
  ],
};
