import type { Good } from "./good";

// Cart item stored in localStorage (guest) or sent to API
interface LocalCartItem {
  goodId: string;
  quantity: number;
}

// Cart item with populated good data (from API response)
interface CartItemWithGood {
  goodId: Good;
  quantity: number;
}

// API response structure
interface CartResponse {
  items: CartItemWithGood[];
}

export type { LocalCartItem, CartItemWithGood, CartResponse };
