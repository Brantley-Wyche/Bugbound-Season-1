import Component from './NotificationSettings.tsx';

export default {
  id: '14-hook-line-sinker',
  number: 14,
  title: 'Hook, Line & Sinker',
  concept: 'TypeScript: Typing Hooks',
  severity: 'Medium',
  Component,
  files: [
    'src/levels/14-hook-line-sinker/NotificationSettings.tsx',
    'src/levels/14-hook-line-sinker/useToggle.ts',
  ],
  symptom:
    'Email digests should default to On, but the panel shows Off. And every Toggle button is dead — clicks change nothing, no errors anywhere. The hook and the component each look fine on their own…',
  lesson: [
    'A custom hook is just a function, and its return value is an API. `useState` returns a tuple — `[value, setter]` — which is why array destructuring works on it. But nothing forces YOUR hooks to follow that convention; a hook returning an object `{ on, toggle }` destructured as an array yields only `undefined`s.',
    'This is precisely the mismatch TypeScript exists to catch — a caller disagreeing with a function about its return shape. Type the hook honestly and the wrong destructuring turns red immediately. Return `[on, toggle] as const` and annotate: `function useToggle(initial: boolean): readonly [boolean, () => void]`. The `as const` matters — without it TypeScript widens the tuple to `(boolean | (() => void))[]`, which is too sloppy to catch misuse.',
    'And notice the failure mode when types DON’T catch it: `onClick={undefined}` is a legal prop. React renders a perfectly healthy-looking button wired to nothing. Silent `undefined`s from shape mismatches are the quietest bugs in JavaScript — make your types loud so your runtime doesn’t have to be.',
  ],
  checks: [
    {
      name: 'Email digests default to On',
      run: async (h) => {
        const state = h.text('[data-testid="email-state"]');
        h.ok(state === 'On', `Email digests should start On, but the panel shows "${state}".`);
      },
    },
    {
      name: 'The email toggle flips the state',
      run: async (h) => {
        await h.click('[data-testid="email-toggle"]');
        const state = h.text('[data-testid="email-state"]');
        h.ok(state === 'Off', `Clicked the email toggle but it still shows "${state}".`);
      },
    },
    {
      name: 'Each switch is independent',
      run: async (h) => {
        await h.click('[data-testid="push-toggle"]');
        const push = h.text('[data-testid="push-state"]');
        const email = h.text('[data-testid="email-state"]');
        h.ok(push === 'On', `Push should be On after toggling, but shows "${push}".`);
        h.ok(email === 'On', `Toggling push changed email to "${email}" — the switches are entangled.`);
      },
    },
  ],
};
