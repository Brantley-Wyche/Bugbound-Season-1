import Component from './AnalyticsBoard.jsx';

export default {
  id: '12-render-storm',
  number: 12,
  title: 'The Render Storm',
  concept: 'Memoization & Renders',
  severity: 'High',
  Component,
  vague: true,
  files: ['src/levels/12-render-storm/'],
  symptom:
    'Typing in the metric filter makes the dashboard stutter. Watch the "chart renders" counter: the expensive chart redraws on every single keystroke, even though nothing about the chart changed. It’s wrapped in React.memo — so why isn’t memo working?',
  lesson: [
    '`React.memo` skips re-rendering a component when its props are unchanged — where "unchanged" means shallowly equal, compared with `Object.is`, prop by prop. For numbers and strings that’s value equality. For objects and functions, it’s reference equality.',
    'Here’s the catch: everything you create inside a component body is created AGAIN on every render. An object literal like `{ palette: \'aurora\' }` or an arrow function defined inline is a brand-new reference each time — never equal to last render’s version. Pass those as props and `memo` compares new-ref vs old-ref, shrugs, and re-renders every time. The memo is real; the props defeat it.',
    'The fixes: `useMemo` to keep the same object reference between renders (`useMemo(() => ({…}), [])`), and `useCallback` to keep the same function reference. (Or hoist truly constant values out of the component entirely.) Memoization is a chain — one unstable prop reference breaks the whole thing.',
  ],
  checks: [
    {
      name: 'The chart is interactive (clicking a bar selects it)',
      run: async (h) => {
        await h.click('[data-testid="bar-1"]');
        const selected = h.text('[data-testid="selected"]');
        h.ok(selected === 'Selected: Q2', `Expected "Selected: Q2", got "${selected}".`);
      },
    },
    {
      name: 'Typing in the filter does not re-render the chart',
      run: async (h) => {
        const before = Number(h.text('[data-testid="chart-renders"]').replace(/\D+/g, ''));
        await h.type('[data-testid="search-input"]', 'rev');
        const after = Number(h.text('[data-testid="chart-renders"]').replace(/\D+/g, ''));
        h.ok(
          after === before,
          `The chart re-rendered ${after - before} time(s) while typing 3 characters. React.memo is being defeated by unstable prop references.`,
        );
      },
    },
    {
      name: 'The filter itself still works',
      run: async (h) => {
        await h.type('[data-testid="search-input"]', 'sign');
        const items = h.all('[data-testid="metric-list"] li');
        h.ok(
          items.length === 1 && items[0].textContent.includes('Signups'),
          `Expected the list to narrow to "Signups", but it shows ${items.length} item(s).`,
        );
      },
    },
  ],
};
