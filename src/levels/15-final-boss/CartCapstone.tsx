import { useReducer } from 'react';
import { cartReducer, type CartState } from './cartReducer';

const PRODUCTS = [
  { id: 'kb', name: 'Mechanical Keyboard', price: 89 },
  { id: 'ms', name: 'Trackball Mouse', price: 54 },
  { id: 'hp', name: 'Studio Headphones', price: 129 },
];

const INITIAL: CartState = { items: [] };

export default function CartCapstone() {
  const [state, dispatch] = useReducer(cartReducer, INITIAL);

  const total = state.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="lv-card">
      <h4 className="lv-heading">🛒 Checkout</h4>

      <div className="lv-row">
        {PRODUCTS.map((p) => {
          const inCart = state.items.some((item) => item.id === p.id);
          return (
            <button
              key={p.id}
              className="lv-btn"
              data-testid={`add-${p.id}`}
              disabled={inCart}
              onClick={() => dispatch({ type: 'add', item: { ...p, qty: 1 } })}
            >
              + {p.name}
            </button>
          );
        })}
      </div>

      {state.items.length === 0 ? (
        <p className="lv-muted" data-testid="empty-cart">Your cart is empty.</p>
      ) : (
        <ul className="lv-list">
          {state.items.map((item) => (
            <li key={item.id} className="lv-row spread" data-testid="cart-item">
              <span>{item.name}</span>
              <span className="lv-row">
                <button
                  className="lv-btn"
                  data-testid={`qty-minus-${item.id}`}
                  onClick={() => dispatch({ type: 'setQty', id: item.id, qty: item.qty - 1 })}
                >
                  −
                </button>
                <span data-testid={`qty-${item.id}`}>{item.qty}</span>
                <button
                  className="lv-btn"
                  data-testid={`qty-plus-${item.id}`}
                  onClick={() => dispatch({ type: 'setQty', id: item.id, qty: item.qty + 1 })}
                >
                  +
                </button>
              </span>
              <span className="lv-muted">${item.price * item.qty}</span>
              <button
                className="lv-btn"
                data-testid={`remove-${item.id}`}
                onClick={() => dispatch({ type: 'delete', id: item.id })}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="lv-row spread">
        <strong>Total</strong>
        <strong data-testid="cart-total">${total}</strong>
      </div>
    </div>
  );
}
