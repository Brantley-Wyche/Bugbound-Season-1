type OrderItem = {
  id: string;
  name: string;
  price: any;
};

const ITEMS: OrderItem[] = [
  { id: 'i1', name: 'Espresso Beans (1kg)', price: 14.5 },
  { id: 'i2', name: 'Pour-over Kettle', price: '39.00' },
  { id: 'i3', name: 'Filter Papers ×100', price: 6.25 },
];

const SHIPPING = 5;

export default function OrderSummary() {
  const subtotal = ITEMS.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + SHIPPING;

  return (
    <div className="lv-card">
      <h4 className="lv-heading">☕ Order Summary</h4>
      <ul className="lv-list">
        {ITEMS.map((item) => (
          <li key={item.id} className="lv-row spread">
            <span>{item.name}</span>
            <span data-testid={`price-${item.id}`}>${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="lv-row spread">
        <span className="lv-muted">Subtotal</span>
        <span data-testid="subtotal">${subtotal.toFixed(2)}</span>
      </div>
      <div className="lv-row spread">
        <span className="lv-muted">Shipping</span>
        <span>${SHIPPING.toFixed(2)}</span>
      </div>
      <div className="lv-row spread">
        <strong>Total</strong>
        <strong data-testid="total">${total.toFixed(2)}</strong>
      </div>
    </div>
  );
}
