export interface orderItem {
  goodId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  _id: string; // MongoDB document ID
  userId: string; // ID of the user who placed the order
  items: orderItem[]; // Array of items in the order
  totalAmount: number; // Total price of the order
  shippingFee: number; // $40
  orderTotal: number; // totalAmount + shippingFee
  status: "pending" | "paid" | "expired" | "cancelled"; // Order status
  createdAt: string; // ISO timestamp
  paidAt: string;
  expiresAt: string;
}
