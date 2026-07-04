export default function ProductCard({ name, price, onAdd }) {
  return (
    <div className="lv-row spread" data-testid="product">
      <span data-testid="product-name">{name}</span>
      <span className="lv-muted">${price}</span>
      <button className="lv-btn" data-testid="add-btn" onClick={onAdd}>
        Add to cart
      </button>
    </div>
  );
}
