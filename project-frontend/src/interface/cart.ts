// Cart item (used for both localStorage and API)
interface CartItem {
  goodId: string;
  quantity: number;
}

// API response structure
interface CartResponse {
  items: CartItem[];
}

export type { CartItem, CartResponse };
