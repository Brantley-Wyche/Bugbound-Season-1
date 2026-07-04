import Component from './NotificationBell.jsx';

export default {
  id: '02-now-you-see-me',
  number: 2,
  title: 'Now You See Me',
  concept: 'Conditional Rendering',
  severity: 'Low',
  Component,
  files: ['src/levels/02-now-you-see-me/NotificationBell.jsx'],
  symptom:
    'The inbox claims "You’re all caught up ✨" while three notifications sit right below it. And after pressing "Clear all", the message disappears but a mysterious lone "0" is left behind where the list used to be.',
  lesson: [
    'React has no `if` inside JSX, so we lean on JavaScript expressions: the ternary `condition ? <A /> : <B />` and the short-circuit `condition && <A />`. Both are idiomatic — and both have teeth.',
    'The `&&` trap: when the left side is falsy, the expression evaluates to that falsy value, and React renders it. `null`, `false`, and `undefined` render as nothing — but `0` is falsy AND renderable. `items.length && <List />` prints a `0` the moment the list is empty. Prefer `items.length > 0 && …` — make the condition an actual boolean.',
    'The other classic is simply writing a condition backwards. Read every conditional out loud: "when X is truthy, show Y." If the sentence sounds wrong, the code is wrong.',
  ],
  checks: [
    {
      name: 'The caught-up message is hidden while notifications exist',
      run: async (h) => {
        h.get('[data-testid="note-list"]');
        h.ok(
          h.query('[data-testid="empty-msg"]') === null,
          'The "all caught up" message is showing even though there are notifications.',
        );
      },
    },
    {
      name: '"Clear all" empties the list and shows the caught-up message',
      run: async (h) => {
        await h.click('[data-testid="clear-btn"]');
        h.ok(
          h.query('[data-testid="note-list"]') === null,
          'The notification list is still rendered after clearing.',
        );
        h.get('[data-testid="empty-msg"]');
      },
    },
    {
      name: 'No stray characters are left behind after clearing',
      run: async (h) => {
        await h.click('[data-testid="clear-btn"]');
        const bell = h.get('[data-testid="bell"]').cloneNode(true);
        for (const sel of ['[data-testid="bell-count"]', '[data-testid="clear-btn"]', '[data-testid="empty-msg"]', '.lv-heading']) {
          bell.querySelectorAll(sel).forEach((el) => el.remove());
        }
        const leftover = bell.textContent.trim();
        h.ok(
          leftover === '',
          `Something unexpected is rendering after the list is cleared: "${leftover}".`,
        );
      },
    },
  ],
};
