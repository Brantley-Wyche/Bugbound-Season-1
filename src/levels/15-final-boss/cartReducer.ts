export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'remove'; id: string }
  | { type: 'setQty'; id: string; qty: number };

export function cartReducer(state: CartState, action: any): CartState {
  switch (action.type) {
    case 'add': {
      state.items.push(action.item);
      return state;
    }
    case 'remove': {
      return { items: state.items.filter((item) => item.id === action.id) };
    }
    case 'setQty': {
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, qty: Math.max(1, action.qty) } : item,
        ),
      };
    }
    default:
      return state;
  }
}
