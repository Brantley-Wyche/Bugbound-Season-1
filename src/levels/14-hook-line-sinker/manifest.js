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
    'The settings panel crashes as soon as it renders, before any switches appear. The hook and the component each look reasonable on their own, but disagree when used together.',
  lesson: [
    'A custom hook is just a function, and its return value is an API. `useState` returns a tuple — `[value, setter]` — which is why array destructuring works on it. But nothing forces YOUR hooks to follow that convention. A plain object such as `{ on, toggle }` is not iterable, so trying to destructure it as an array throws before rendering can finish.',
    'This is precisely the mismatch TypeScript exists to catch — a caller disagreeing with a function about its return shape. Type the hook honestly and the wrong destructuring turns red immediately. Return `[on, toggle] as const` and annotate: `function useToggle(initial: boolean): readonly [boolean, () => void]`. The `as const` matters — without it TypeScript widens the tuple to `(boolean | (() => void))[]`, which is too sloppy to catch misuse.',
    'Other shape mismatches can fail more quietly: reading a property that was never returned gives `undefined`, and `onClick={undefined}` is a legal prop. That can leave a healthy-looking button wired to nothing. Honest return types catch both the loud and quiet versions before runtime.',
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
