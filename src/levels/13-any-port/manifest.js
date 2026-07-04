import Component from './OrderSummary.tsx';

export default {
  id: '13-any-port',
  number: 13,
  title: 'Any Port in a Storm',
  concept: 'TypeScript: Typing Data',
  severity: 'High',
  Component,
  files: ['src/levels/13-any-port/OrderSummary.tsx'],
  symptom:
    'Welcome to the TypeScript arc. The order summary crashes the moment it renders — something about ".toFixed is not a function". This file compiles without a single type error… which is exactly the problem.',
  lesson: [
    'TypeScript’s deal is simple: describe your data’s shape, and the compiler proves your code respects it — before it ever runs. `price: number` isn’t documentation, it’s an enforced contract: any code path that puts a string in there turns red in your editor.',
    '`any` is the escape hatch that voids the contract. A value typed `any` can be assigned anything and used as anything — TypeScript stops checking entirely. It doesn’t just allow the bug at the annotation site; it lets the bad value flow silently into everything downstream. `sum + item.price` with a string price becomes string concatenation, and `.toFixed()` on the result detonates at runtime.',
    'The debugging move for this whole arc: when runtime behavior contradicts what the types "guarantee", hunt for the `any` (or the `as` cast) that broke the chain of trust. Fix the type first — then TypeScript itself will point at every piece of data that violates it.',
  ],
  checks: [
    {
      name: 'The order summary renders without crashing',
      run: async (h) => {
        h.ensureNoCrash();
        h.get('[data-testid="subtotal"]');
      },
    },
    {
      name: 'The subtotal is computed as a number',
      run: async (h) => {
        const subtotal = h.text('[data-testid="subtotal"]');
        h.ok(subtotal === '$59.75', `Expected the subtotal to be $59.75, got "${subtotal}".`);
      },
    },
    {
      name: 'The total includes shipping',
      run: async (h) => {
        const total = h.text('[data-testid="total"]');
        h.ok(total === '$64.75', `Expected the total to be $64.75, got "${total}".`);
      },
    },
  ],
};
