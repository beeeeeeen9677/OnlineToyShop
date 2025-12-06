interface OrderItem {
  goodId: string;
  name: string;
  price: number;
  quantity: number;
  shippingDate: string;
  imageUrl: string;
}

interface Order {
  _id: string; // MongoDB document ID
  userId: string; // ID of the user who placed the order
  items: OrderItem[]; // Array of items in the order
  totalAmount: number; // Total price of the order
  shippingFee: number; // $40
  orderTotal: number; // totalAmount + shippingFee
  status: "pending" | "paid" | "expired" | "cancelled"; // Order status
  createdAt: string; // ISO timestamp
  paidAt: string;
  expiresAt: string;
}

export type { OrderItem, Order };
