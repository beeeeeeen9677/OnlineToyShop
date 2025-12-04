import type { CartItem } from "../../interface/cart";

const CART_KEY = "premiumbentoys:cart";

// Get cart from localStorage
export const getLocalCart = (): CartItem[] => {
  const data = localStorage.getItem(CART_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Save cart to localStorage
export const setLocalCart = (items: CartItem[]): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

// Error type for cart operations
// for local storage cart limit handling
export class CartLimitError extends Error {
  currentQuantity: number;

  constructor(currentQuantity: number) {
    super("QUANTITY_LIMIT_REACHED");
    this.name = "CartLimitError";
    this.currentQuantity = currentQuantity;
  }
}

// Add item to local cart (or update quantity if exists)
// Throws CartLimitError if item already at max quantity
export const addToLocalCart = (
  goodId: string,
  quantity: number
): CartItem[] => {
  const cart = getLocalCart();
  const existingIndex = cart.findIndex((item) => item.goodId === goodId);

  if (existingIndex > -1) {
    const currentQuantity = cart[existingIndex].quantity;

    // Check if already at max quantity
    if (currentQuantity >= 3) {
      throw new CartLimitError(currentQuantity);
    }

    // Update quantity (cap at 3)
    cart[existingIndex].quantity = Math.min(currentQuantity + quantity, 3);
  } else {
    // Add new item
    cart.push({ goodId, quantity });
  }

  setLocalCart(cart);
  return cart;
};

// Update item quantity in local cart
export const updateLocalCartItem = (
  goodId: string,
  quantity: number
): CartItem[] => {
  const cart = getLocalCart();
  const itemIndex = cart.findIndex((item) => item.goodId === goodId);

  if (itemIndex > -1) {
    cart[itemIndex].quantity = Math.min(Math.max(quantity, 1), 3); // Clamp 1-3
    setLocalCart(cart);
  }

  return cart;
};

// Remove item from local cart
export const removeFromLocalCart = (goodId: string): CartItem[] => {
  const cart = getLocalCart().filter((item) => item.goodId !== goodId);
  setLocalCart(cart);
  return cart;
};

// Clear local cart
export const clearLocalCart = (): void => {
  localStorage.removeItem(CART_KEY);
};

// Get total item count in local cart
export const getLocalCartCount = (): number => {
  return getLocalCart().reduce((sum, item) => sum + item.quantity, 0);
};
