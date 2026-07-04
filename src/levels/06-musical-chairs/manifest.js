import Component from './SeatingChart.jsx';

export default {
  id: '06-musical-chairs',
  number: 6,
  title: 'Musical Chairs',
  concept: 'Lists & Keys',
  severity: 'High',
  Component,
  files: ['src/levels/06-musical-chairs/SeatingChart.jsx'],
  symptom:
    'Type a seat note next to Bianca, then remove Alice — and Bianca’s note teleports to Carlos. Guests keep inheriting each other’s notes whenever someone is removed. Spooky.',
  lesson: [
    'Keys are how React tracks identity across renders: "this item in the new list is the same item as that one in the old list, so keep its DOM and state." Get identity wrong and React starts recycling the wrong DOM nodes.',
    'The classic mistake is `key={index}`. Index is a position, not an identity. Remove the first item and everyone shifts up a position — React thinks item 0 is still item 0, so it keeps position 0’s DOM (including whatever was typed into its input) and just swaps the label. The typed text stays in the chair while the guest moves.',
    'The fix is a key that belongs to the data itself — a database id, a UUID, anything stable and unique per item. Index keys are only safe when the list never reorders, never inserts, and never deletes. Which, in real apps, is almost never a promise you can keep.',
  ],
  checks: [
    {
      name: 'Removing a guest takes exactly that guest off the list',
      run: async (h) => {
        await h.click('[data-testid="remove-btn"]');
        const names = h.all('[data-testid="guest-name"]').map((el) => el.textContent.trim());
        h.ok(
          names.length === 2 && !names.includes('Alice Zhang'),
          `Expected Alice to be removed leaving 2 guests, but the list shows: [${names.join(', ')}].`,
        );
      },
    },
    {
      name: 'Seat notes stay with their guest when someone else is removed',
      run: async (h) => {
        const rows = h.all('[data-testid="guest-row"]');
        await h.type(rows[1].querySelector('[data-testid="guest-note"]'), 'Window seat');
        await h.click(rows[0].querySelector('[data-testid="remove-btn"]'));

        const biancaRow = h
          .all('[data-testid="guest-row"]')
          .find((row) => row.textContent.includes('Bianca Rossi'));
        h.ok(biancaRow, 'Bianca disappeared from the list — only Alice should have been removed.');
        const note = biancaRow.querySelector('[data-testid="guest-note"]').value;
        h.ok(
          note === 'Window seat',
          `Bianca's note should still read "Window seat", but her input contains "${note}".`,
        );
      },
    },
  ],
};
