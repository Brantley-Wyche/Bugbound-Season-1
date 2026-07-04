import Component from './TeamDirectory.jsx';

export default {
  id: '08-stuck-in-the-past',
  number: 8,
  title: 'Stuck in the Past',
  concept: 'Effect Dependencies',
  severity: 'High',
  Component,
  files: ['src/levels/08-stuck-in-the-past/TeamDirectory.jsx'],
  symptom:
    'The first profile loads fine. But click any other team member and… nothing. The button highlights, the selection clearly changes, yet the details panel is stuck showing the first person forever.',
  lesson: [
    'An effect synchronizes your component with something outside React — here, a server. The dependency array declares WHEN that synchronization must happen again: "re-run this effect whenever these values change."',
    'The golden rule: every reactive value the effect reads must appear in its dependency array. An empty array `[]` means "this effect depends on nothing" — run once, never again. If the effect actually reads `selectedId`, that’s a lie, and the symptom is always the same: data frozen at its first value.',
    'This is exactly what the `react-hooks/exhaustive-deps` ESLint rule catches. Treat its warnings as bugs, not noise — silencing it is how components get stuck in the past.',
  ],
  checks: [
    {
      name: 'The first profile loads on mount',
      run: async (h) => {
        await h.pause(150);
        const name = h.text('[data-testid="profile-name"]');
        h.ok(name === 'Priya Sharma', `Expected the initial profile to be Priya Sharma, got "${name}".`);
      },
    },
    {
      name: 'Selecting another member loads their profile',
      run: async (h) => {
        await h.pause(150);
        await h.click('[data-testid="member-u2"]');
        await h.pause(150);
        const name = h.text('[data-testid="profile-name"]');
        h.ok(
          name === 'Jonas Weber',
          `Clicked Jonas but the panel still shows "${name}".`,
        );
      },
    },
    {
      name: 'Selection keeps working across multiple switches',
      run: async (h) => {
        await h.pause(150);
        await h.click('[data-testid="member-u3"]');
        await h.pause(150);
        await h.click('[data-testid="member-u2"]');
        await h.pause(150);
        const name = h.text('[data-testid="profile-name"]');
        h.ok(name === 'Jonas Weber', `Expected Jonas Weber after switching twice, got "${name}".`);
      },
    },
  ],
};
