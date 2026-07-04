import Component from './ThemedDashboard.jsx';

export default {
  id: '11-out-of-the-loop',
  number: 11,
  title: 'Out of the Loop',
  concept: 'Context',
  severity: 'Medium',
  Component,
  vague: true,
  files: ['src/levels/11-out-of-the-loop/'],
  symptom:
    'The theme toggle does nothing. Click it all you want — the status panel stays light. No errors, no warnings, just a button that has apparently retired.',
  lesson: [
    'Context lets a value skip the prop-drilling elevator: a `Provider` up the tree publishes it, and any descendant can read it with `useContext`. The key word is DESCENDANT — a consumer reads the nearest Provider **above** it in the tree, and only above.',
    'What if there’s no Provider above? No crash. `useContext` quietly returns the default value passed to `createContext(…)`. Defaults are often placeholder no-ops — a `toggleTheme: () => {}` that swallows clicks without a trace. This makes "component not inside its Provider" one of the most silent bugs in React.',
    'When context misbehaves, don’t stare at the consumer — walk up the tree. Is there a Provider between this component and the root? React DevTools shows the tree structure directly; the answer is usually one glance away.',
  ],
  checks: [
    {
      name: 'The dashboard starts in light mode',
      run: async (h) => {
        const theme = h.attr('[data-testid="status-panel"]', 'data-theme');
        h.ok(theme === 'light', `Expected the panel to start light, but it's "${theme}".`);
      },
    },
    {
      name: 'The toggle switches the panel to dark',
      run: async (h) => {
        await h.click('[data-testid="theme-toggle"]');
        const theme = h.attr('[data-testid="status-panel"]', 'data-theme');
        h.ok(theme === 'dark', `Clicked the toggle but the panel is still "${theme}".`);
      },
    },
    {
      name: 'Toggling twice returns to light',
      run: async (h) => {
        await h.click('[data-testid="theme-toggle"]');
        await h.click('[data-testid="theme-toggle"]');
        const theme = h.attr('[data-testid="status-panel"]', 'data-theme');
        h.ok(theme === 'light', `Expected light after two toggles, but the panel is "${theme}".`);
      },
    },
  ],
};
