import Component from './ProductShelf.jsx';

export default {
  id: '03-lost-in-transit',
  number: 3,
  title: 'Lost in Transit',
  concept: 'Props',
  severity: 'Medium',
  Component,
  files: [
    'src/levels/03-lost-in-transit/ProductShelf.jsx',
    'src/levels/03-lost-in-transit/ProductCard.jsx',
  ],
  symptom:
    'Product names have vanished from the shelf — each row shows only a price. Worse, the "Add to cart" buttons do absolutely nothing.',
  lesson: [
    'Props are how data flows down the tree: the parent writes `<Card title="…" />` and the child receives `{ title }`. It’s a contract — and like any contract, both parties have to agree on the names. React won’t warn you when they don’t; the child just receives `undefined`, silently.',
    'Functions are props too. Passing `onAddToCart={handleAdd}` hands the child a callback to fire later. If the child looks for a prop the parent never sent, `onClick={undefined}` renders a perfectly clickable button wired to nothing.',
    'When a child misbehaves, the fastest diagnostic is to look at what actually arrived: `console.log(props)` at the top of the child, or the Components tab of React DevTools. Debug what IS, not what you assume.',
  ],
  checks: [
    {
      name: 'Product names are visible on the shelf',
      run: async (h) => {
        const names = h.all('[data-testid="product-name"]').map((el) => el.textContent.trim());
        h.ok(
          names[0] === 'Mechanical Keyboard' && names[1] === 'Trackball Mouse',
          `Expected product names to render, but got: [${names.map((n) => `"${n}"`).join(', ')}].`,
        );
      },
    },
    {
      name: 'Adding a product updates the cart count',
      run: async (h) => {
        await h.click('[data-testid="add-btn"]');
        const count = h.text('[data-testid="cart-count"]');
        h.ok(count === 'Cart: 1', `Expected "Cart: 1" after one click, but the badge reads "${count}".`);
      },
    },
    {
      name: 'Every product’s button works',
      run: async (h) => {
        const buttons = h.all('[data-testid="add-btn"]');
        for (const b of buttons) await h.click(b);
        const count = h.text('[data-testid="cart-count"]');
        h.ok(count === 'Cart: 2', `Expected "Cart: 2" after adding both products, but the badge reads "${count}".`);
      },
    },
  ],
};
