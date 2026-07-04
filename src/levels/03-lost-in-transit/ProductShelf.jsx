import { useState } from 'react';
import ProductCard from './ProductCard.jsx';

const PRODUCTS = [
  { id: 'p1', name: 'Mechanical Keyboard', price: 89 },
  { id: 'p2', name: 'Trackball Mouse', price: 54 },
];

export default function ProductShelf() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="lv-card">
      <div className="lv-row spread">
        <h4 className="lv-heading">🛍️ Shop</h4>
        <span className="lv-tag" data-testid="cart-count">Cart: {cartCount}</span>
      </div>
      {PRODUCTS.map((product) => (
        <ProductCard
          key={product.id}
          title={product.name}
          price={product.price}
          onAddToCart={() => setCartCount((c) => c + 1)}
        />
      ))}
    </div>
  );
}
