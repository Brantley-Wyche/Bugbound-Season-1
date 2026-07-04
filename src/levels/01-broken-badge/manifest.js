import Component from './ProfileBadge.jsx';

export default {
  id: '01-broken-badge',
  number: 1,
  title: 'The Broken Badge',
  concept: 'Rendering & JSX',
  severity: 'Low',
  Component,
  files: ['src/levels/01-broken-badge/ProfileBadge.jsx'],
  symptom:
    'The profile badge doesn’t render at all — the live preview shows a crash. And QA swears that before the crash appeared, the badge greeted people with the literal text "user.name" instead of an actual name.',
  lesson: [
    'JSX looks like HTML, but it’s JavaScript in a costume. Anything between tags is plain text — until you wrap it in curly braces `{ }`, which switch you back into JavaScript. `{user.name}` renders the value; `user.name` without braces renders those nine characters, verbatim.',
    'Attributes follow the same rule, with a twist: they’re props, not HTML attributes. That’s why it’s `className` instead of `class`, and why `style` takes a JavaScript object with camelCased keys — `style={{ maxWidth: 320 }}` — never a CSS string.',
    'When JSX is malformed, React fails loudly and precisely. Reading the error message in the preview (or the browser console) is not cheating — it’s the first skill of the job.',
  ],
  checks: [
    {
      name: 'The badge renders without crashing',
      run: async (h) => {
        h.ensureNoCrash();
        h.get('[data-testid="badge"]');
      },
    },
    {
      name: 'The badge shows the user’s actual name',
      run: async (h) => {
        const name = h.text('[data-testid="badge-name"]');
        h.ok(
          name === 'Ada Lovelace',
          `Expected the name to read "Ada Lovelace" but it reads "${name}".`,
        );
      },
    },
    {
      name: 'Role and team still display correctly',
      run: async (h) => {
        const role = h.text('[data-testid="badge-role"]');
        h.ok(
          role.includes('Staff Engineer') && role.includes('Platform'),
          `Expected role line to mention "Staff Engineer" and "Platform" but it reads "${role}".`,
        );
      },
    },
  ],
};
