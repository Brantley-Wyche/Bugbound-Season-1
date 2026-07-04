import Component from './CartCapstone.tsx';

export default {
  id: '15-final-boss',
  number: 15,
  title: 'The Final Boss',
  concept: 'Capstone: Reducers + TS',
  severity: 'Critical',
  Component,
  vague: true,
  files: ['src/levels/15-final-boss/'],
  symptom:
    'The cart is a disaster. Adding a product greys out its button but the cart stays empty — until some other interaction makes items pop in late. Removing an item deletes everything EXCEPT that item. QA gave up counting the bugs. (Intel says: more than one, fewer than four.)',
  lesson: [
    '`useReducer` centralizes state transitions: the component dispatches actions (plain objects describing what happened) and a reducer — a pure function `(state, action) => newState` — computes the next state. All your state logic in one testable place.',
    'The purity is load-bearing. A reducer must return a NEW state object, never mutate the existing one: React compares the returned reference against the old state to decide whether anything changed. Mutate-and-return-the-same-object means "nothing changed" — your update happened in memory but the UI never hears about it, until an unrelated render accidentally reveals it.',
    'And the dispatching side is a contract too. A union type like `CartAction` is called a discriminated union: the `type` field discriminates which variant you have, and TypeScript narrows accordingly in each `switch` case. But that protection only exists if the reducer’s action parameter is actually typed `CartAction` — leave it `any` and a dispatched typo sails through the switch into `default`, doing nothing, silently. In a well-typed reducer, invalid actions are unrepresentable: they fail in the editor, not in production.',
  ],
  checks: [
    {
      name: 'Adding a product puts it in the cart immediately',
      run: async (h) => {
        await h.click('[data-testid="add-kb"]');
        const items = h.all('[data-testid="cart-item"]');
        h.ok(
          items.length === 1 && items[0].textContent.includes('Mechanical Keyboard'),
          `Expected the keyboard to appear in the cart, but the cart shows ${items.length} item(s).`,
        );
      },
    },
    {
      name: 'The total reflects everything in the cart',
      run: async (h) => {
        await h.click('[data-testid="add-kb"]');
        await h.click('[data-testid="add-ms"]');
        const total = h.text('[data-testid="cart-total"]');
        h.ok(total === '$143', `Expected a total of $143 for keyboard + mouse, got "${total}".`);
      },
    },
    {
      name: 'Quantity controls update the line and the total',
      run: async (h) => {
        await h.click('[data-testid="add-kb"]');
        await h.click('[data-testid="qty-plus-kb"]');
        const qty = h.text('[data-testid="qty-kb"]');
        const total = h.text('[data-testid="cart-total"]');
        h.ok(qty === '2', `Expected quantity 2, got "${qty}".`);
        h.ok(total === '$178', `Expected total $178 at quantity 2, got "${total}".`);
      },
    },
    {
      name: 'Removing an item removes only that item',
      run: async (h) => {
        await h.click('[data-testid="add-kb"]');
        await h.click('[data-testid="add-ms"]');
        await h.click('[data-testid="remove-kb"]');
        const items = h.all('[data-testid="cart-item"]');
        h.ok(
          items.length === 1 && items[0].textContent.includes('Trackball Mouse'),
          `Expected only the mouse to remain, but the cart shows ${items.length} item(s): ${items.map((i) => i.textContent.trim()).join(' | ')}.`,
        );
      },
    },
  ],
};
